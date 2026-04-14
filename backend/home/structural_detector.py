
import cv2
import numpy as np
import logging
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from skimage.metrics import structural_similarity as ssim
from sklearn.cluster import DBSCAN
from PIL import Image
from django.core.files.base import ContentFile
import io
import torch.nn.functional as F

logger = logging.getLogger(__name__)

class StructuralChangeDetector:
    def __init__(self, config=None): 
        self.config = config or {
            'feature_layer': 'layer3',
            'diff_threshold': 0.60,  # Increased further to reduce noise
            'min_contour_area': 800, # Increased to ignore artifacts
            'max_contour_area': 100000, 
            'morphology_kernel_size': 5,
            'cluster_eps': 50,
            'cluster_min_samples': 1,
            'risk_thresholds': {'low': 2, 'medium': 5, 'high': 10},
            # HSV ranges for vegetation masking — configurable per-season or per-fort.
            # Hue 15-95 covers dried grass (15-30) and bright green (30-95).
            # Adjust these for the local flora and season when needed.
            'grass_hsv_lower': [15, 30, 30],
            'grass_hsv_upper': [95, 255, 255],
        }
        self.k_factor = 0.0  # Adaptive threshold offset updated via update_thresholds_from_history()
        self.setup_cnn_model()
        self.setup_processing_tools()
        
    def setup_cnn_model(self):
        # Use ResNet50 for deep feature extraction
        # We want spatial features, not just a global descriptor
        full_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        # Extract up to layer2 for HIGHER RESOLUTION (1/8th scale) to catch small stones
        # layer2 output is 512 channels, 1/8th resolution
        self.feature_extractor = nn.Sequential(
            full_model.conv1,
            full_model.bn1,
            full_model.relu,
            full_model.maxpool,
            full_model.layer1,
            full_model.layer2
            # Removed layer3 and layer4 to keep high spatial resolution
        )
        self.feature_extractor.eval()
        
        # Standard ImageNet normalization
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def setup_processing_tools(self):
        # Vegetation HSV filter ranges (configurable via config dict)
        self.grass_lower = np.array(self.config['grass_hsv_lower'])
        self.grass_upper = np.array(self.config['grass_hsv_upper'])
        
        # Sky filters (Blue/White/Grey)
        self.sky_lower_blue = np.array([90, 50, 50])
        self.sky_upper_blue = np.array([130, 255, 255])
    
    def load_image_from_file(self, image_file):
        if hasattr(image_file, 'read'):
            image_data = image_file.read()
            if hasattr(image_file, 'seek'):
                image_file.seek(0)
        else:
            with open(image_file.path, 'rb') as f:
                image_data = f.read()
        nparr = np.frombuffer(image_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    def align_images(self, past_img, current_img):
        """
        Align current_img to match past_img viewpoint using AKAZE + Homography.
        Includes CLAHE for lighting invariance.
        """
        try:
            # Resize for faster feature detection if images are huge
            h, w = past_img.shape[:2]
            scale = 1.0
            if max(h, w) > 1000:
                scale = 1000.0 / max(h, w)
                past_small = cv2.resize(past_img, (0,0), fx=scale, fy=scale)
                curr_small = cv2.resize(current_img, (0,0), fx=scale, fy=scale)
            else:
                past_small = past_img
                curr_small = current_img

            # Convert to LAB for CLAHE (Contrast Limited Adaptive Histogram Equalization)
            # This helps normalize lighting before feature detection
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            
            def apply_clahe(img):
                lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                l2 = clahe.apply(l)
                lab = cv2.merge((l2, a, b))
                return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
                
            past_processed = apply_clahe(past_small)
            curr_processed = apply_clahe(curr_small)

            # AKAZE is more robust than ORB for nonlinear diffusion (lighting changes)
            detector = cv2.AKAZE_create()
            kp1, des1 = detector.detectAndCompute(past_processed, None)
            kp2, des2 = detector.detectAndCompute(curr_processed, None)
            
            if des1 is None or des2 is None:
                logger.debug("No descriptors found during image alignment.")
                return past_img, current_img
                
            bf = cv2.BFMatcher(cv2.NORM_HAMMING)
            matches = bf.knnMatch(des1, des2, k=2)
            
            # Lowe's ratio test
            good_matches = []
            for m, n in matches:
                if m.distance < 0.75 * n.distance:
                    good_matches.append(m)
            
            if len(good_matches) < 10:
                logger.debug("Not enough good matches to align images (%d found).", len(good_matches))
                return past_img, current_img
                
            src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            
            # Scale points back up
            if scale != 1.0:
                src_pts /= scale
                dst_pts /= scale
                
            M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
            
            if M is not None:
                h, w, c = current_img.shape
                aligned_past = cv2.warpPerspective(past_img, M, (w, h))
                return aligned_past, current_img
        except Exception as e:
            logger.warning("Image alignment failed: %s", e)
            pass
            
        return past_img, current_img
    
    def get_deep_feature_difference(self, img1, img2):
        """
        Compute pixel-wise difference in deep feature space.
        Detects structural changes while being robust to lighting/season.
        """
        # Prepare params
        # INCREASED RESOLUTION: 1024x1024 for fine details (stones)
        # Layer 2 (1/8 scale) -> 128x128 feature map.
        input_size = (1024, 1024) 
        
        # Preprocess
        img1_resized = cv2.resize(img1, input_size)
        img2_resized = cv2.resize(img2, input_size)
        
        img1_rgb = cv2.cvtColor(img1_resized, cv2.COLOR_BGR2RGB)
        img2_rgb = cv2.cvtColor(img2_resized, cv2.COLOR_BGR2RGB)
        
        t1 = self.transform(img1_rgb).unsqueeze(0)
        t2 = self.transform(img2_rgb).unsqueeze(0)
        
        with torch.no_grad():
            f1 = self.feature_extractor(t1) # Shape: [1, 512, 128, 128]
            f2 = self.feature_extractor(t2)
            
        # normalize features (cosine similarity equivalent when using euclidean on normalized vectors)
        f1 = F.normalize(f1, p=2, dim=1)
        f2 = F.normalize(f2, p=2, dim=1)
        
        # Compute difference (1 - Cosine Similarity) or just geometric distance
        # We use Per-element squared difference sum across channels
        diff_tensor = torch.sum((f1 - f2) ** 2, dim=1).squeeze().cpu().numpy()
        
        # Resize difference map back to original image size
        diff_map = cv2.resize(diff_tensor, (img1.shape[1], img1.shape[0]))
        
        # Normalize diff map to 0-255
        diff_map = np.maximum(diff_map, 0)
        diff_map = diff_map / (diff_map.max() + 1e-6) # 0-1
        diff_uint8 = (diff_map * 255).astype(np.uint8)
        
        return diff_uint8, np.mean(diff_map)

    def get_sky_mask(self, image):
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        # Sky (Bright/Blue)
        sky_mask1 = cv2.inRange(hsv, self.sky_lower_blue, self.sky_upper_blue)
        
        # 2. Bright white/grey sky (High value, low saturation)
        # TIGHTENED: Increased sensitivity threshold (less sensitive to grey stones)
        # Stones are usually Grey (Low S, Medium V). Sky is Bright (Low S, High V).
        # V > 200 (was 255-40=215). Let's make it strict.
        lower_white = np.array([0, 0, 220]) # Only very bright whites
        upper_white = np.array([180, 40, 255]) # Low saturation
        sky_mask2 = cv2.inRange(hsv, lower_white, upper_white)
        
        return cv2.bitwise_or(sky_mask1, sky_mask2)

    def is_vegetation_or_sky_noise(self, contour, current_img, past_img, diff_map):
        # Create a mask for the specific contour to ensure we only check the object itself
        # not the surrounding area in the bounding box.
        mask = np.zeros(current_img.shape[:2], dtype=np.uint8)
        cv2.drawContours(mask, [contour], -1, 255, -1)
        
        # Calculate mean vegetation measure inside the contour
        # Vegetation defined as Hue 15-95 (Grass/Green)
        hsv_curr = cv2.cvtColor(current_img, cv2.COLOR_BGR2HSV)
        hsv_past = cv2.cvtColor(past_img, cv2.COLOR_BGR2HSV)
        
        # Check vegetation presence strictly inside the contour
        is_grass_curr = cv2.inRange(hsv_curr, self.grass_lower, self.grass_upper)
        is_grass_past = cv2.inRange(hsv_past, self.grass_lower, self.grass_upper)
        
        # Mean value of the binary mask inside the contour (0-255) -> normalize to 0-1
        # cv2.mean returns a tuple, take [0]
        # We assume 'mask' is the domain.
        veg_ratio_curr = cv2.mean(is_grass_curr, mask=mask)[0] / 255.0
        veg_ratio_past = cv2.mean(is_grass_past, mask=mask)[0] / 255.0
        
        # BUG FIX: Previous logic used Bounding Box (w*h). Small stone in big grass box = High Veg Ratio.
        # Now we use exact contour. 
        # If a stone (Veg=0) changes to Grass (Veg=1) -> Ratio Past=0, Curr=1 -> Keep.
        # If Grass changes to Grass (Seasonal) -> Ratio Past=1, Curr=1 -> Ignore.
        # Threshold: if > 70% of the *changed pixels* are vegetation in BOTH times, it's seasonal.
        if veg_ratio_curr > 0.70 and veg_ratio_past > 0.70:
            return True 
            
        # 2. Sky Noise Check (Same logic with contour mask)
        mask_sky_curr = self.get_sky_mask(current_img)
        mask_sky_past = self.get_sky_mask(past_img)
        
        sky_ratio_curr = cv2.mean(mask_sky_curr, mask=mask)[0] / 255.0
        sky_ratio_past = cv2.mean(mask_sky_past, mask=mask)[0] / 255.0
        
        # If it's mostly sky in BOTH images, it's just background noise (clouds)
        if sky_ratio_curr > 0.70 and sky_ratio_past > 0.70:
            return True 
            
        return False

    def _convert_to_serializable(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {k: self._convert_to_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_to_serializable(i) for i in obj]
        elif isinstance(obj, tuple):
            return tuple(self._convert_to_serializable(i) for i in obj)
        return obj
        
    def update_thresholds_from_history(self, false_positive_rate):
        """
        ML Feedback Loop Adaptation: The user trains the model via UI verification.
        If a specific fort has a high rate of False Positives reported by the Admin, 
        the threshold for 'significant change' is dynamically scaled upwards. 
        This teaches the model to ignore artifact noise and 'perfect' its precision over time.
        """
        # Base k=0.0 is hyper-sensitive. A 50% FP rate translates to k=1.5
        # Require feature differences to be 1.5 standard deviations above mean to detect anything.
        self.k_factor = min(2.5, false_positive_rate * 3.0)
        logger.info(
            "ML Auto-Tuner: Adjusted k_factor to %.2f based on %.1f%% historical false positive rate.",
            self.k_factor,
            false_positive_rate * 100,
        )

    def detect_structural_changes(self, past_img, current_img, temp=None, humidity=None, wind_speed=None):
        # 1. Ensure same size (resize past to current)
        if past_img.shape != current_img.shape:
            h, w = min(past_img.shape[0], current_img.shape[0]), min(past_img.shape[1], current_img.shape[1])
            past_img = cv2.resize(past_img, (w, h))
            current_img = cv2.resize(current_img, (w, h)) 
            
        # 2. Align
        past_aligned, current_aligned = self.align_images(past_img, current_img)
        
        # 3. Deep Feature Difference
        diff_map, global_diff_score = self.get_deep_feature_difference(past_aligned, current_aligned)
        
        # 4. Adaptive Thresholding
        mean_diff = np.mean(diff_map)
        std_diff = np.std(diff_map)
        
        # Lower k to 1.0 for        # k=0 means we detect anything above the average difference.
        # This is 'Raw' sensitivity.
        k = self.k_factor
        adaptive_thresh = mean_diff + (k * std_diff)
        
        # Cap max threshold at 0.30 to force detection
        final_thresh = max(0.15, min(adaptive_thresh, 0.30))
        
        _, diff_binary = cv2.threshold(diff_map, int(final_thresh * 255), 255, cv2.THRESH_BINARY)
        
        # REMOVED Morphological cleanup (Erosion/Opening/Closing)
        # This allows "Raw" detections of even single-pixel features in the map.
        # User requested "each and every change".
        
        # 6. Contour Detection & Smart Filtering
        contours, _ = cv2.findContours(diff_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detections = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Ultra-sensitive: catch even tiny crumbs (10px)
            if area < 10: 
                continue
                
            # Smart Filter: Check if this specific blob is just vegetation or sky noise
            if self.is_vegetation_or_sky_noise(cnt, current_aligned, past_aligned, diff_map):
                continue
                
            x, y, w, h = cv2.boundingRect(cnt)
            
            # Confidence
            mask_roi = np.zeros_like(diff_map)
            cv2.drawContours(mask_roi, [cnt], -1, 1, -1)
            mean_diff_intensity = cv2.mean(diff_map, mask=mask_roi)[0] / 255.0 
            
            confidence = min(1.0, mean_diff_intensity * 1.5)
            
            # Severity Classification
            severity = "Minor"
            if area > 5000:
                severity = "Critical"
            elif area > 1000 or confidence > 0.8:
                severity = "Moderate"
                
            detections.append({
                'bbox': (int(x), int(y), int(w), int(h)),
                'area': float(area),
                'confidence': float(confidence),
                'severity': severity,
                'centroid': (int(x + w//2), int(y + h//2))
            })

        # 7. Cluster Detections
        clustered_detections = self.cluster_detections(detections)
        
        # Calculate SSIM
        gray_past = cv2.cvtColor(past_aligned, cv2.COLOR_BGR2GRAY)
        gray_current = cv2.cvtColor(current_aligned, cv2.COLOR_BGR2GRAY)
        try:
            ssim_val = ssim(gray_past, gray_current)
        except Exception:
            ssim_val = 0.5 
        
        # 8. Risk Assessment & Climate Stress Calculation
        risk_assessment = self.assess_risk(clustered_detections, global_diff_score, temp, humidity, wind_speed)

        # Overall detection confidence: average of per-detection confidences (0–100 %)
        if clustered_detections:
            overall_confidence = float(
                sum(d['confidence'] for d in clustered_detections) / len(clustered_detections)
            )
        else:
            overall_confidence = 0.0
        
        results = {
            'cnn_distance': float(global_diff_score),
            'ssim_score': float(ssim_val),
            'overall_confidence': round(overall_confidence * 100, 1),  # percentage
            'detections': clustered_detections,
            'risk_assessment': risk_assessment,
            'total_changes': len(clustered_detections),
            # Phase 3 data export
            'environmental_data': {
                'temperature': temp,
                'humidity': humidity,
                'wind_speed': wind_speed,
                'climate_stress_index': risk_assessment.get('climate_stress_index', 0.0),
                'final_heritage_risk_score': risk_assessment.get('final_heritage_score', 0.0)
            }
        }
        
        return self._convert_to_serializable(results)

    def cluster_detections(self, detections):
        if len(detections) < 2:
            return detections
        
        # Simple merging based on distance
        # DBSCAN is good, but let's be robust
        centroids = np.array([det['centroid'] for det in detections])
        try:
            clustering = DBSCAN(eps=self.config['cluster_eps'], min_samples=self.config['cluster_min_samples'])
            cluster_labels = clustering.fit_predict(centroids)
            
            merged = []
            unique_labels = set(cluster_labels)
            
            for label in unique_labels:
                if label == -1: # Noise (shouldn't happen with min_samples=1)
                    for idx in np.where(cluster_labels == -1)[0]:
                        merged.append(detections[idx])
                else:
                    indices = np.where(cluster_labels == label)[0]
                    cluster_members = [detections[i] for i in indices]
                    merged.append(self.merge_group(cluster_members))
            return merged
        except Exception:
            return detections # Fallback
            
    def merge_group(self, members):
        x1 = min(d['bbox'][0] for d in members)
        y1 = min(d['bbox'][1] for d in members)
        x2 = max(d['bbox'][0] + d['bbox'][2] for d in members)
        y2 = max(d['bbox'][1] + d['bbox'][3] for d in members)
        
        area = sum(d['area'] for d in members)
        conf = max(d['confidence'] for d in members) # Take max confidence
        
        # Merged severity logic: take the highest severity in the group
        severities = [d.get('severity', 'Minor') for d in members]
        if "Critical" in severities:
            final_severity = "Critical"
        elif "Moderate" in severities:
            final_severity = "Moderate"
        else:
            final_severity = "Minor"
            
        # Re-evaluate based on total area?
        if area > 5000: final_severity = "Critical"

        return {
            'bbox': (x1, y1, x2-x1, y2-y1),
            'area': area,
            'confidence': conf,
            'severity': final_severity,
            'centroid': ((x1+x2)//2, (y1+y2)//2)
        }

    def assess_risk(self, detections, global_diff_score, temp=None, humidity=None, wind_speed=None):
        change_count = len(detections)
        
        # Base AI Structural Risk Score
        structural_score = 0
        factors = []
        
        if change_count > 0:
            max_conf = max([d['confidence'] for d in detections])
            total_area = sum([d['area'] for d in detections])
            
            if max_conf > 0.7:
                 structural_score += 4
                 factors.append("High confidence changes detected")
            elif max_conf > 0.4:
                 structural_score += 2
                 factors.append("Visible changes detected")
                 
            if total_area > 10000: # large area
                structural_score += 3
                factors.append("Large structural area affected")
                
            if change_count > 5:
                structural_score += 2
                factors.append("Multiple change zones identified")
                
            if global_diff_score > 0.2: # High global change
                structural_score += 2
                factors.append("Significant global visual difference")
                
        # Phase 3: Climate Stress Index (CSI) Calculation
        csi = 0.0
        env_multiplier = 1.0
        
        if temp is not None and humidity is not None:
            # High temp + High humidity degrades lime mortar and causes biological growth 
            # High wind accelerates physical erosion.
            t_val = float(temp)
            h_val = float(humidity)
            w_val = float(wind_speed) if wind_speed is not None else 0.0
            
            # Simple Normalized Index formulation (0 to 10 scale approx)
            temp_stress = max(0, (t_val - 30.0) * 0.2) # Stress starts climbing after 30C
            hum_stress = max(0, (h_val - 70.0) * 0.15) # Stress climbs after 70% humidity
            wind_stress = w_val * 0.1
            
            csi = temp_stress + hum_stress + wind_stress
            
            # Bound CSI and calculate multiplier (adds up to 50% severity increase)
            csi = min(10.0, csi)
            
            if csi > 6.0:
                factors.append(f"CRITICAL Environmental Stress Phase (CSI: {csi:.1f})")
                env_multiplier = 1.6
            elif csi > 3.0:
                factors.append(f"Elevated Environmental Stress (CSI: {csi:.1f})")
                env_multiplier = 1.3
        
        # Calculate Final Heritage Risk Score
        final_score = int(structural_score * env_multiplier)
        
        # Guard clause for perfectly safe state
        if change_count == 0 and csi < 4.0:
            return {
                'level': 'SAFE', 
                'score': final_score, 
                'description': 'No significant structural changes', 
                'recommendations': [],
                'climate_stress_index': csi,
                'final_heritage_score': final_score
            }
            
        # Determine Level based on the Enhanced Final Score
        if final_score >= 8:
            level = 'CRITICAL'
            rec = ['Immediate Inspection Required', 'Check structural integrity', 'Alert conservation team']
        elif final_score >= 5:
            level = 'HIGH'
            rec = ['Schedule inspection soon', 'Monitor daily', 'Check wind/rain logs']
        elif final_score >= 3:
            level = 'MEDIUM'
            rec = ['Log change', 'Monitor weekly']
        else:
            level = 'LOW'
            rec = ['Review image', 'False positive check']
            
        return {
            'level': level,
            'score': final_score,
            'description': f"{level} risk detected combining {change_count} physical zones and severe environmental constraints.",
            'factors': factors,
            'recommendations': rec,
            'climate_stress_index': float(csi),
            'final_heritage_score': float(final_score),
            'structural_base_score': float(structural_score)
        }

    def visualize_results(self, current_img, results):
        out = current_img.copy()
        
        # Colors: Green(Safe) -> Yellow -> Orange -> Red
        colors = {
            'SAFE': (0, 255, 0),
            'LOW': (0, 255, 255), 
            'MEDIUM': (0, 165, 255),
            'HIGH': (0, 0, 255),
            'CRITICAL': (0, 0, 128)
        }
        level = results['risk_assessment']['level']
        color = colors.get(level, (0,255,0))
        
        # Draw bounding boxes
        for i, det in enumerate(results['detections']):
            x, y, w, h = det['bbox']
            # Semi-transparent overlay
            overlay = out.copy()
            cv2.rectangle(overlay, (x,y), (x+w, y+h), color, -1)
            cv2.addWeighted(overlay, 0.3, out, 0.7, 0, out)
            
            # Border
            cv2.rectangle(out, (x,y), (x+w, y+h), color, 2)
            
            # Label
            label = f"#{i+1} Conf:{det['confidence']:.2f}"
            cv2.putText(out, label, (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
        # Dashboard UI on image
        cv2.rectangle(out, (0,0), (300, 100), (0,0,0), -1)
        cv2.putText(out, f"Risk: {level}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        cv2.putText(out, f"Changes: {results['total_changes']}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 1)
        score_text = f"Global Score: {results['cnn_distance']:.2f}"
        cv2.putText(out, score_text, (10, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200,200,200), 1)
        
        return out

    def save_annotated_image(self, annotated_img):
        _, buffer = cv2.imencode('.png', annotated_img)
        return ContentFile(buffer.tobytes())

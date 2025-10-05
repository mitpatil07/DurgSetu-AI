# backend/structural_detector.py
import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from skimage.metrics import structural_similarity as ssim
from sklearn.cluster import DBSCAN
from PIL import Image
from django.core.files.base import ContentFile
import io

class StructuralChangeDetector:
    def __init__(self, config=None):
        self.config = config or {
            'cnn_threshold': 1.0,
            'ssim_threshold': 0.75,  # Lowered for better detection
            'min_contour_area': 300,  # Lowered minimum area
            'max_contour_area': 50000,
            'morphology_kernel_size': 7,
            'cluster_eps': 30,
            'cluster_min_samples': 2,
            'risk_thresholds': {'low': 2, 'medium': 5, 'high': 10},  # Adjusted thresholds
            'completely_different_threshold': 5.0  # CNN distance threshold
        }
        self.setup_cnn_model()
        self.setup_color_filters()
        
    def setup_cnn_model(self):
        self.resnet = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.resnet.fc = nn.Identity()
        self.resnet.eval()
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def setup_color_filters(self):
        # Enhanced grass detection (green areas)
        self.grass_lower = np.array([30, 30, 30])
        self.grass_upper = np.array([90, 255, 255])
        
        # Plastic/artificial surfaces (bright unnatural colors)
        self.bright_colors = [
            # Red plastic/fabric
            (np.array([0, 100, 100]), np.array([10, 255, 255])),
            (np.array([170, 100, 100]), np.array([180, 255, 255])),
            # Blue plastic/fabric
            (np.array([100, 100, 100]), np.array([130, 255, 255])),
            # Yellow/Orange plastic
            (np.array([15, 100, 100]), np.array([35, 255, 255])),
            # Purple/Pink plastic
            (np.array([140, 100, 100]), np.array([170, 255, 255]))
        ]
        
        # Low saturation areas (likely grass, leaves, natural surfaces)
        self.low_saturation_threshold = 50
    
    def load_image_from_file(self, image_file):
        if hasattr(image_file, 'read'):
            image_data = image_file.read()
            image_file.seek(0)
        else:
            with open(image_file.path, 'rb') as f:
                image_data = f.read()
        nparr = np.frombuffer(image_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    def align_images(self, past_img, current_img):
        try:
            gray1 = cv2.cvtColor(past_img, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(current_img, cv2.COLOR_BGR2GRAY)
            orb = cv2.ORB_create(nfeatures=1000)
            kp1, des1 = orb.detectAndCompute(gray1, None)
            kp2, des2 = orb.detectAndCompute(gray2, None)
            if des1 is None or des2 is None:
                return past_img, current_img
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            matches = sorted(matches, key=lambda x: x.distance)
            if len(matches) < 10:
                return past_img, current_img
            src_pts = np.float32([kp1[m.queryIdx].pt for m in matches[:50]]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches[:50]]).reshape(-1, 1, 2)
            M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
            if M is not None:
                h, w, c = current_img.shape
                return cv2.warpPerspective(past_img, M, (w, h)), current_img
        except:
            pass
        return past_img, current_img
    
    def cnn_similarity_check(self, past_img, current_img):
        past_cnn = cv2.resize(past_img, (224, 224))
        current_cnn = cv2.resize(current_img, (224, 224))
        past_rgb = cv2.cvtColor(past_cnn, cv2.COLOR_BGR2RGB)
        current_rgb = cv2.cvtColor(current_cnn, cv2.COLOR_BGR2RGB)
        past_tensor = self.transform(past_rgb).unsqueeze(0)
        current_tensor = self.transform(current_rgb).unsqueeze(0)
        with torch.no_grad():
            feat_past = self.resnet(past_tensor)
            feat_current = self.resnet(current_tensor)
        distance = nn.functional.pairwise_distance(feat_past, feat_current).item()
        
        # Check if images are completely different (different fort/location)
        is_completely_different = distance > self.config['completely_different_threshold']
        return distance, is_completely_different
    
    def filter_unwanted_areas(self, image, mask):
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Detect grass (green vegetation)
        grass_mask = cv2.inRange(hsv, self.grass_lower, self.grass_upper)
        
        # Detect low saturation areas (natural surfaces, weathered stone)
        saturation = hsv[:, :, 1]
        low_sat_mask = (saturation < self.low_saturation_threshold).astype(np.uint8) * 255
        
        # Detect bright artificial colors (plastic, fabric, tourists)
        tourist_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
        for lower, upper in self.bright_colors:
            tourist_mask = cv2.bitwise_or(tourist_mask, cv2.inRange(hsv, lower, upper))
        
        # Combine all unwanted masks
        unwanted_mask = cv2.bitwise_or(cv2.bitwise_or(grass_mask, tourist_mask), low_sat_mask)
        
        # Apply morphological operations to clean up the mask
        kernel = np.ones((5, 5), np.uint8)
        unwanted_mask = cv2.morphologyEx(unwanted_mask, cv2.MORPH_CLOSE, kernel)
        unwanted_mask = cv2.morphologyEx(unwanted_mask, cv2.MORPH_OPEN, kernel)
        
        # Filter out unwanted areas from the difference mask
        filtered = cv2.bitwise_and(mask, cv2.bitwise_not(unwanted_mask))
        
        return filtered, unwanted_mask
    
    def enhance_differences(self, diff, gray_past, gray_current):
        # SSIM-based threshold (more sensitive)
        _, ssim_thresh = cv2.threshold(diff, 150, 255, cv2.THRESH_BINARY_INV)
        
        # Absolute difference (lowered threshold for better detection)
        abs_diff = cv2.absdiff(gray_past, gray_current)
        _, abs_thresh = cv2.threshold(abs_diff, 20, 255, cv2.THRESH_BINARY)
        
        # Edge detection
        edges_past = cv2.Canny(gray_past, 30, 100)
        edges_current = cv2.Canny(gray_current, 30, 100)
        edge_diff = cv2.absdiff(edges_past, edges_current)
        _, edge_thresh = cv2.threshold(edge_diff, 30, 255, cv2.THRESH_BINARY)
        
        # Combine all methods
        combined = cv2.bitwise_or(cv2.bitwise_or(ssim_thresh, abs_thresh), edge_thresh)
        
        # Morphological operations to connect nearby changes
        kernel = np.ones((self.config['morphology_kernel_size'], self.config['morphology_kernel_size']), np.uint8)
        combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=2)
        combined = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel)
        
        return combined
    
    def find_structural_changes(self, diff_mask, current_img):
        contours, _ = cv2.findContours(diff_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        detections = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Lowered minimum area threshold for better detection
            if area < self.config['min_contour_area'] or area > self.config['max_contour_area']:
                continue
            x, y, w, h = cv2.boundingRect(cnt)
            aspect_ratio = w / h if h > 0 else 0
            extent = area / (w * h) if (w * h) > 0 else 0
            
            # More lenient shape criteria
            if aspect_ratio < 0.1 or aspect_ratio > 10.0 or extent < 0.2:
                continue
            
            # Better confidence calculation
            confidence = min(1.0, (area / 5000) * 0.8 + 0.2)
            if 0.3 < aspect_ratio < 3.0:
                confidence *= 1.3
            
            detections.append({
                'bbox': (x, y, w, h),
                'area': area,
                'confidence': min(1.0, confidence),
                'aspect_ratio': aspect_ratio,
                'extent': extent,
                'centroid': (x + w//2, y + h//2)
            })
        return contours, detections
    
    def cluster_detections(self, detections):
        if len(detections) < 2:
            return detections
        centroids = np.array([det['centroid'] for det in detections])
        clustering = DBSCAN(eps=self.config['cluster_eps'], min_samples=self.config['cluster_min_samples'])
        cluster_labels = clustering.fit_predict(centroids)
        clustered = []
        for label in set(cluster_labels):
            if label == -1:
                for idx in np.where(cluster_labels == label)[0]:
                    clustered.append(detections[idx])
            else:
                cluster_members = [detections[i] for i in range(len(detections)) if cluster_labels[i] == label]
                clustered.append(self.merge_detections(cluster_members))
        return clustered
    
    def merge_detections(self, detections):
        if len(detections) == 1:
            return detections[0]
        x_coords = [det['bbox'][0] for det in detections]
        y_coords = [det['bbox'][1] for det in detections]
        x2_coords = [det['bbox'][0] + det['bbox'][2] for det in detections]
        y2_coords = [det['bbox'][1] + det['bbox'][3] for det in detections]
        x_min, y_min = min(x_coords), min(y_coords)
        x_max, y_max = max(x2_coords), max(y2_coords)
        merged_bbox = (x_min, y_min, x_max - x_min, y_max - y_min)
        merged_area = sum(det['area'] for det in detections)
        return {
            'bbox': merged_bbox,
            'area': merged_area,
            'confidence': np.mean([det['confidence'] for det in detections]),
            'aspect_ratio': (x_max - x_min) / (y_max - y_min) if (y_max - y_min) > 0 else 0,
            'extent': merged_area / ((x_max - x_min) * (y_max - y_min)) if ((x_max - x_min) * (y_max - y_min)) > 0 else 0,
            'centroid': ((x_min + x_max) // 2, (y_min + y_max) // 2),
            'merged_count': len(detections)
        }
    
    def assess_risk(self, detections, cnn_distance, ssim_score, is_completely_different):
        if is_completely_different:
            return {
                'level': 'ERROR',
                'score': 0,
                'description': 'Images appear to be from completely different locations or forts',
                'factors': ['Extremely high CNN distance indicates different subjects'],
                'recommendations': ['Please verify you uploaded images of the same fort', 'Ensure both images show the same structure from similar angles'],
                'metrics': {'change_count': 0, 'total_area': 0, 'avg_confidence': 0, 'cnn_distance': cnn_distance, 'ssim_score': ssim_score},
                'is_error': True
            }
        
        if len(detections) == 0:
            return {
                'level': 'SAFE',
                'score': 0,
                'description': 'No structural changes detected',
                'factors': [],
                'recommendations': ['Continue normal monitoring schedule'],
                'metrics': {'change_count': 0, 'total_area': 0, 'avg_confidence': 0, 'cnn_distance': cnn_distance, 'ssim_score': ssim_score},
                'is_error': False
            }
        
        change_count = len(detections)
        total_area = sum(det['area'] for det in detections)
        avg_confidence = np.mean([det['confidence'] for det in detections])
        risk_score = 0
        risk_factors = []
        
        if change_count >= self.config['risk_thresholds']['high']:
            risk_score += 7
            risk_factors.append(f"High number of structural changes detected ({change_count})")
        elif change_count >= self.config['risk_thresholds']['medium']:
            risk_score += 4
            risk_factors.append(f"Moderate number of structural changes detected ({change_count})")
        elif change_count >= self.config['risk_thresholds']['low']:
            risk_score += 2
            risk_factors.append(f"Few structural changes detected ({change_count})")
        
        if total_area > 10000:
            risk_score += 3
            risk_factors.append("Large total area affected")
        elif total_area > 5000:
            risk_score += 2
            risk_factors.append("Moderate total area affected")
        
        if cnn_distance > 2.0:
            risk_score += 3
            risk_factors.append("Significant overall structural change detected")
        elif cnn_distance > 1.5:
            risk_score += 1
            risk_factors.append("Moderate overall structural change detected")
        
        if avg_confidence > 0.8:
            risk_score += 1
            risk_factors.append("High confidence in detected changes")
        
        if risk_score >= 8:
            risk_level = 'CRITICAL'
            description = 'Severe structural damage detected - Immediate inspection required'
            recommendations = ['Immediate professional structural assessment required', 'Restrict access to affected areas', 'Document all changes with detailed photography', 'Consider emergency stabilization measures']
        elif risk_score >= 5:
            risk_level = 'HIGH'
            description = 'Significant structural changes detected'
            recommendations = ['Schedule professional inspection within 1-2 weeks', 'Monitor affected areas closely', 'Document changes for historical records', 'Consider visitor access restrictions if necessary']
        elif risk_score >= 3:
            risk_level = 'MEDIUM'
            description = 'Moderate structural changes detected'
            recommendations = ['Schedule routine inspection within 1 month', 'Continue regular monitoring', 'Document changes for maintenance planning']
        elif risk_score >= 1:
            risk_level = 'LOW'
            description = 'Minor structural changes detected'
            recommendations = ['Include in routine maintenance checks', 'Continue regular monitoring schedule']
        else:
            risk_level = 'SAFE'
            description = 'No significant structural changes detected'
            recommendations = ['Continue normal monitoring schedule']
        
        return {
            'level': risk_level,
            'score': risk_score,
            'description': description,
            'factors': risk_factors,
            'recommendations': recommendations,
            'metrics': {'change_count': change_count, 'total_area': total_area, 'avg_confidence': avg_confidence, 'cnn_distance': cnn_distance, 'ssim_score': ssim_score},
            'is_error': False
        }
    
    def visualize_results(self, current_img, results):
        output_img = current_img.copy()
        colors = {'SAFE': (0, 255, 0), 'LOW': (0, 255, 255), 'MEDIUM': (0, 165, 255), 'HIGH': (0, 69, 255), 'CRITICAL': (0, 0, 255), 'ERROR': (128, 128, 128)}
        risk_color = colors.get(results['risk_assessment']['level'], (255, 255, 255))
        
        for i, detection in enumerate(results['detections']):
            x, y, w, h = detection['bbox']
            cv2.rectangle(output_img, (x, y), (x + w, y + h), risk_color, 2)
            cv2.putText(output_img, f"Change {i+1} ({detection['confidence']:.2f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, risk_color, 2)
            cv2.putText(output_img, f"Area: {detection['area']:.0f}px", (x, y + h + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, risk_color, 1)
        
        summary_text = [f"Risk Level: {results['risk_assessment']['level']}", f"Changes Detected: {results['total_changes']}", f"SSIM Score: {results['ssim_score']:.3f}", f"CNN Distance: {results['cnn_distance']:.3f}"]
        y_offset = 30
        for text in summary_text:
            cv2.putText(output_img, text, (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(output_img, text, (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 1)
            y_offset += 30
        return output_img
    
    def detect_structural_changes(self, past_img, current_img):
        if past_img.shape != current_img.shape:
            h, w = min(past_img.shape[0], current_img.shape[0]), min(past_img.shape[1], current_img.shape[1])
            past_img = cv2.resize(past_img, (w, h))
            current_img = cv2.resize(current_img, (w, h))
        
        past_aligned, current_aligned = self.align_images(past_img, current_img)
        cnn_distance, is_completely_different = self.cnn_similarity_check(past_aligned, current_aligned)
        
        gray_past = cv2.cvtColor(past_aligned, cv2.COLOR_BGR2GRAY)
        gray_current = cv2.cvtColor(current_aligned, cv2.COLOR_BGR2GRAY)
        score, diff = ssim(gray_past, gray_current, full=True)
        diff = (diff * 255).astype("uint8")
        
        diff_enhanced = self.enhance_differences(diff, gray_past, gray_current)
        filtered_diff, unwanted_mask = self.filter_unwanted_areas(current_aligned, diff_enhanced)
        contours, detections = self.find_structural_changes(filtered_diff, current_aligned)
        clustered_detections = self.cluster_detections(detections)
        risk_assessment = self.assess_risk(clustered_detections, cnn_distance, score, is_completely_different)
        
        return {
            'cnn_distance': cnn_distance,
            'ssim_score': score,
            'detections': clustered_detections,
            'risk_assessment': risk_assessment,
            'total_changes': len(clustered_detections),
            'unwanted_areas_filtered': int(np.sum(unwanted_mask > 0)),
            'is_completely_different': is_completely_different
        }
    
    def save_annotated_image(self, annotated_img):
        _, buffer = cv2.imencode('.png', annotated_img)
        return ContentFile(buffer.tobytes())
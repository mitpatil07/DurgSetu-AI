# backend/views.py - COMPLETE FILE
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg
from .models import Fort, FortImage, StructuralAnalysis
from .serializers import FortSerializer, FortImageSerializer, StructuralAnalysisSerializer
from .structural_detector import StructuralChangeDetector
from datetime import datetime
import logging

logger = logging.getLogger(__name__)  # FIXED: Changed from _name_ to __name__

class FortViewSet(viewsets.ModelViewSet):
    queryset = Fort.objects.all()
    serializer_class = FortSerializer
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get overall statistics for all forts"""
        forts = Fort.objects.all()
        total_forts = forts.count()
        
        # Get latest analyses for each fort
        analyses = StructuralAnalysis.objects.all()
        
        risk_counts = {
            'SAFE': 0,
            'LOW': 0,
            'MEDIUM': 0,
            'HIGH': 0,
            'CRITICAL': 0
        }
        
        for analysis in analyses:
            risk_level = analysis.risk_level
            if risk_level in risk_counts:
                risk_counts[risk_level] += 1
        
        total_analyses = StructuralAnalysis.objects.count()
        total_images = FortImage.objects.count()
        
        # Calculate average scores
        avg_metrics = StructuralAnalysis.objects.aggregate(
            avg_ssim=Avg('ssim_score'),
            avg_risk=Avg('risk_score')
        )
        
        return Response({
            'total_forts': total_forts,
            'total_analyses': total_analyses,
            'total_images': total_images,
            'risk_distribution': risk_counts,
            'average_ssim': avg_metrics.get('avg_ssim', 0) or 0,
            'average_risk_score': avg_metrics.get('avg_risk', 0) or 0,
            'forts_at_risk': risk_counts['HIGH'] + risk_counts['CRITICAL']
        })


class FortImageViewSet(viewsets.ModelViewSet):
    queryset = FortImage.objects.all()
    serializer_class = FortImageSerializer
    
    def get_queryset(self):
        queryset = FortImage.objects.all()
        fort_id = self.request.query_params.get('fort', None)
        if fort_id:
            queryset = queryset.filter(fort=fort_id)
        return queryset


class StructuralAnalysisViewSet(viewsets.ModelViewSet):
    queryset = StructuralAnalysis.objects.all()
    serializer_class = StructuralAnalysisSerializer
    
    def get_queryset(self):
        queryset = StructuralAnalysis.objects.all()
        fort_id = self.request.query_params.get('fort', None)
        if fort_id:
            queryset = queryset.filter(fort=fort_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """
        Analyze structural changes by uploading an image
        POST data: fort_id, image (file)
        """
        try:
            fort_id = request.data.get('fort_id')
            uploaded_image = request.FILES.get('image')
            
            if not fort_id or not uploaded_image:
                return Response(
                    {'error': 'fort_id and image are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get fort
            try:
                fort = Fort.objects.get(id=fort_id)
            except Fort.DoesNotExist:
                return Response(
                    {'error': 'Fort not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Save new image
            current_image = FortImage.objects.create(
                fort=fort,
                image=uploaded_image,
                description=f"Uploaded on {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            )
            
            # Get previous image (latest before current)
            previous_image = FortImage.objects.filter(
                fort=fort
            ).exclude(
                id=current_image.id
            ).order_by('-uploaded_at').first()
            
            # If no previous image, this is the first upload
            if not previous_image:
                return Response({
                    'message': 'First image uploaded successfully',
                    'is_first_upload': True,
                    'fort_id': fort.id,
                    'fort_name': fort.name,
                    'image_id': current_image.id,
                    'image_url': request.build_absolute_uri(current_image.image.url)
                }, status=status.HTTP_201_CREATED)
            
            # Perform analysis
            logger.info(f"Starting structural analysis for fort {fort.name}")
            detector = StructuralChangeDetector()
            
            # Load images
            past_img = detector.load_image_from_file(previous_image.image)
            current_img = detector.load_image_from_file(current_image.image)
            
            # Detect changes
            results = detector.detect_structural_changes(past_img, current_img)
            
            # Create annotated image
            annotated_img = detector.visualize_results(current_img, results)
            annotated_file = detector.save_annotated_image(annotated_img)
            
            # Calculate total area
            total_area = sum(d['area'] for d in results['detections']) if results['detections'] else 0
            
            # Save analysis
            analysis = StructuralAnalysis.objects.create(
                fort=fort,
                previous_image=previous_image,
                current_image=current_image,
                cnn_distance=results['cnn_distance'],
                ssim_score=results['ssim_score'],
                risk_level=results['risk_assessment']['level'],
                risk_score=results['risk_assessment']['score'],
                changes_detected=results['total_changes'],
                total_area_affected=total_area,
                analysis_results=results
            )
            
            # Save annotated image
            analysis.annotated_image.save(
                f'analysis_{fort.id}_{analysis.id}.png',
                annotated_file,
                save=True
            )
            
            logger.info(f"Analysis complete: {results['risk_assessment']['level']} risk detected")
            
            # Return full analysis
            serializer = self.get_serializer(analysis, context={'request': request})
            return Response({
                'message': 'Analysis completed successfully',
                'is_first_upload': False,
                'fort_id': fort.id,
                'fort_name': fort.name,
                'analysis': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error in structural analysis: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
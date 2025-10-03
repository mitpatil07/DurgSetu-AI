# api/serializers.py or home/serializers.py (whichever you're using)
from rest_framework import serializers
from .models import Fort, FortImage, StructuralAnalysis

class FortImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FortImage
        fields = ['id', 'fort', 'image', 'uploaded_at', 'description', 'is_reference']
        read_only_fields = ['uploaded_at']


class StructuralAnalysisSerializer(serializers.ModelSerializer):
    previous_image_url = serializers.SerializerMethodField()
    current_image_url = serializers.SerializerMethodField()
    annotated_image_url = serializers.SerializerMethodField()
    risk_assessment = serializers.SerializerMethodField()
    recommendations = serializers.SerializerMethodField()
    
    class Meta:
        model = StructuralAnalysis
        fields = [
            'id', 'fort', 'previous_image', 'current_image',
            'cnn_distance', 'ssim_score', 'risk_level', 'risk_score',
            'changes_detected', 'total_area_affected', 'annotated_image',
            'analysis_results', 'analysis_date',
            'previous_image_url', 'current_image_url', 'annotated_image_url',
            'risk_assessment', 'recommendations'
        ]
        read_only_fields = ['analysis_date']
    
    def get_previous_image_url(self, obj):
        if obj.previous_image and obj.previous_image.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.previous_image.image.url) if request else obj.previous_image.image.url
        return None
    
    def get_current_image_url(self, obj):
        if obj.current_image and obj.current_image.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.current_image.image.url) if request else obj.current_image.image.url
        return None
    
    def get_annotated_image_url(self, obj):
        if obj.annotated_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.annotated_image.url) if request else obj.annotated_image.url
        return None
    
    def get_risk_assessment(self, obj):
        # Extract risk assessment from analysis_results JSON
        if obj.analysis_results and isinstance(obj.analysis_results, dict):
            return obj.analysis_results.get('risk_assessment', {})
        return {}
    
    def get_recommendations(self, obj):
        # Extract recommendations from risk assessment
        if obj.analysis_results and isinstance(obj.analysis_results, dict):
            risk_assessment = obj.analysis_results.get('risk_assessment', {})
            return risk_assessment.get('recommendations', [])
        return []


class FortSerializer(serializers.ModelSerializer):
    latest_image = serializers.SerializerMethodField()
    analysis_count = serializers.SerializerMethodField()
    latest_analysis = serializers.SerializerMethodField()
    
    class Meta:
        model = Fort
        fields = [
            'id', 'name', 'location', 'description', 
            'latitude', 'longitude', 'created_at', 'updated_at',
            'latest_image', 'analysis_count', 'latest_analysis'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_latest_image(self, obj):
        # Get from property or query
        latest = obj.latest_image if hasattr(obj, 'latest_image') else obj.images.order_by('-uploaded_at').first()
        if latest:
            request = self.context.get('request')
            image_url = request.build_absolute_uri(latest.image.url) if request else latest.image.url
            return {
                'id': latest.id,
                'url': image_url,
                'uploaded_at': latest.uploaded_at
            }
        return None
    
    def get_analysis_count(self, obj):
        # Changed from structural_analyses to analyses
        return obj.analyses.count()
    
    def get_latest_analysis(self, obj):
        # Changed from structural_analyses to analyses
        latest = obj.analyses.order_by('-analysis_date').first()
        if latest:
            return {
                'id': latest.id,
                'risk_level': latest.risk_level,
                'risk_score': latest.risk_score,
                'changes_detected': latest.changes_detected,
                'ssim_score': latest.ssim_score,
                'cnn_distance': latest.cnn_distance,
                'analysis_date': latest.analysis_date
            }
        return None
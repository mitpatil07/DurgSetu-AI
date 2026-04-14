from rest_framework import serializers
from .models import Fort, FortImage, StructuralAnalysis, FortDamageReport, ReportImage, UserProfile, AdminUser

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'phone_number', 'address', 'created_at']
        read_only_fields = ['created_at']

class AdminUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AdminUser
        fields = ['id', 'username', 'email', 'department', 'designation', 'clearance_level', 'created_at']
        read_only_fields = ['created_at']


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
    overall_confidence = serializers.SerializerMethodField()
    
    class Meta:
        model = StructuralAnalysis
        fields = [
            'id', 'fort', 'previous_image', 'current_image',
            'cnn_distance', 'ssim_score', 'risk_level', 'risk_score',
            'changes_detected', 'total_area_affected', 'annotated_image',
            'analysis_results', 'analysis_date',
            'is_verified', 'is_false_positive', 'user_notes', 'verified_at', 'verified_by',
            'previous_image_url', 'current_image_url', 'annotated_image_url',
            'risk_assessment', 'recommendations', 'overall_confidence',
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

    def get_overall_confidence(self, obj):
        # Return the pre-computed overall confidence percentage stored in analysis_results
        if obj.analysis_results and isinstance(obj.analysis_results, dict):
            return obj.analysis_results.get('overall_confidence', None)
        return None


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

class ReportImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportImage
        fields = ['id', 'image', 'uploaded_at']

class FortDamageReportSerializer(serializers.ModelSerializer):
    images = ReportImageSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = FortDamageReport
        fields = [
            'id', 'user', 'user_email', 'user_name', 'fort_name', 'location', 
            'damage_type', 'severity', 'description', 'reporter_name', 
            'reporter_contact', 'status', 'admin_notes', 'repair_image', 
            'reviewed_at', 'reviewed_by', 'submitted_at', 'images'
        ]
        read_only_fields = ['submitted_at']

from django.db import models
from django.core.validators import FileExtensionValidator
from django.contrib.auth.models import User
import os

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_profile')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"User: {self.user.username}"

class AdminUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_user')
    department = models.CharField(max_length=100, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    clearance_level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Admin User'
        verbose_name_plural = 'Admin Users'

    def __str__(self):
        return f"Admin: {self.user.username}"

class Fort(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    description = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def latest_image(self):
        return self.images.order_by('-uploaded_at').first()
    
    @property
    def analysis_count(self):
        return self.analyses.count()


class FortImage(models.Model):
    fort = models.ForeignKey(Fort, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(
        upload_to='fort_images/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    is_reference = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.fort.name} - {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"


class StructuralAnalysis(models.Model):
    RISK_LEVELS = [
        ('SAFE', 'Safe'),
        ('LOW', 'Low Risk'),
        ('MEDIUM', 'Medium Risk'),
        ('HIGH', 'High Risk'),
        ('CRITICAL', 'Critical'),
    ]
    
    fort = models.ForeignKey(Fort, on_delete=models.CASCADE, related_name='analyses')
    previous_image = models.ForeignKey(
        FortImage, 
        on_delete=models.CASCADE, 
        related_name='analyses_as_previous'
    )
    current_image = models.ForeignKey(
        FortImage, 
        on_delete=models.CASCADE, 
        related_name='analyses_as_current'
    )
    
    # Analysis results
    cnn_distance = models.FloatField()
    ssim_score = models.FloatField()
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    risk_score = models.IntegerField()
    changes_detected = models.IntegerField()
    total_area_affected = models.FloatField()
    
    # Visualization
    annotated_image = models.ImageField(upload_to='analysis_results/', null=True, blank=True)
    
    # Full results JSON
    analysis_results = models.JSONField()
    
    analysis_date = models.DateTimeField(auto_now_add=True)

    # Phase 3: Environmental Tracking & Climate Stress Index
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    climate_stress_index = models.FloatField(default=0.0)
    final_heritage_risk_score = models.FloatField(default=0.0)

    # Phase 2: Verification Fields
    is_verified = models.BooleanField(default=False)
    is_false_positive = models.BooleanField(default=False)
    user_notes = models.TextField(blank=True, null=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        ordering = ['-analysis_date']
        verbose_name_plural = 'Structural Analyses'
    
    def __str__(self):
        return f"{self.fort.name} - {self.risk_level} - {self.analysis_date.strftime('%Y-%m-%d')}"
    
    @property
    def risk_assessment(self):
        return self.analysis_results.get('risk_assessment', {})
    
    @property
    def recommendations(self):
        return self.risk_assessment.get('recommendations', [])


# ─────────────────────────────────────────────
# User Damage Report (Public Submission)
# ─────────────────────────────────────────────

class FortDamageReport(models.Model):
    DAMAGE_TYPES = [
        ('Structural Crack', 'Structural Crack'),
        ('Wall Damage', 'Wall Damage'),
        ('Foundation Issue', 'Foundation Issue'),
        ('Water Seepage', 'Water Seepage'),
        ('Stone Erosion', 'Stone Erosion'),
        ('Vegetation Overgrowth', 'Vegetation Overgrowth'),
        ('Vandalism', 'Vandalism'),
        ('Collapse Risk', 'Collapse Risk'),
        ('Other', 'Other'),
    ]

    SEVERITY_LEVELS = [
        ('Minor', 'Minor'),
        ('Moderate', 'Moderate'),
        ('Severe', 'Severe'),
        ('Critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Reviewed', 'Reviewed'),
        ('Action Taken', 'Action Taken'),
        ('Dismissed', 'Dismissed'),
    ]

    fort_name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    damage_type = models.CharField(max_length=100, choices=DAMAGE_TYPES)
    severity = models.CharField(max_length=50, choices=SEVERITY_LEVELS)
    description = models.TextField(blank=True, null=True)

    # User who submitted the report (null if anonymous/old)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    # Reporter info (optional — public user)
    reporter_name = models.CharField(max_length=100, blank=True, null=True)
    reporter_contact = models.CharField(max_length=100, blank=True, null=True)

    # Admin review fields
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    admin_notes = models.TextField(blank=True, null=True)
    repair_image = models.ImageField(upload_to='repair_images/', null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.CharField(max_length=100, null=True, blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Fort Damage Report'
        verbose_name_plural = 'Fort Damage Reports'

    def __str__(self):
        return f"{self.fort_name} - {self.damage_type} ({self.severity}) - {self.submitted_at.strftime('%Y-%m-%d')}"

    @property
    def image_count(self):
        return self.images.count()

    @property
    def is_reviewed(self):
        return self.status != 'Pending'


class ReportImage(models.Model):
    report = models.ForeignKey(FortDamageReport, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(
        upload_to='damage_reports/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Image for {self.report.fort_name} report #{self.report.id}"
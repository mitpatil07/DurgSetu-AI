from django.db import models
from django.core.validators import FileExtensionValidator
import os

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
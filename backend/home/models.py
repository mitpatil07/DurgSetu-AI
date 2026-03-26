from django.db import models
from django.core.validators import FileExtensionValidator
import os
import uuid

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

class IssueReport(models.Model):
    fort_name = models.CharField(max_length=200)
    image = models.ImageField(upload_to='issue_reports/')
    suggestion = models.TextField()
    reported_by = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='issue_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Issue at {self.fort_name} by {self.reported_by.username}"

class DurgSevakReport(models.Model):

    SEVERITY_CHOICES = [
        ("low",      "Low"),
        ("medium",   "Medium"),
        ("high",     "High"),
        ("critical", "Critical"),
    ]
    STATUS_CHOICES = [
        ("submitted",    "Submitted"),
        ("under_review", "Under Review"),
        ("in_progress",  "In Progress"),
        ("resolved",     "Resolved"),
        ("dismissed",    "Dismissed / No Action"),
    ]

    # ── Identity ──────────────────────────────
    reference_number = models.CharField(max_length=20, unique=True, editable=False)

    # ── DurgSevak Info ────────────────────────
    sevak_name  = models.CharField(max_length=200)
    sevak_email = models.EmailField()
    sevak_phone = models.CharField(max_length=20, blank=True)

    # ── Fort & Location ───────────────────────
    fort_name    = models.CharField(max_length=200)
    fort_section = models.CharField(max_length=200)
    severity     = models.CharField(max_length=20, choices=SEVERITY_CHOICES)

    # ── Damage Report ─────────────────────────
    description  = models.TextField()
    suggestions  = models.TextField(blank=True)
    image        = models.ImageField(upload_to="reports/%Y/%m/", blank=True, null=True)

    # ── Authority Action ──────────────────────
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    admin_notes = models.TextField(
        blank=True,
        help_text="Notes sent to the DurgSevak when status changes"
    )
    actioned_by = models.CharField(max_length=200, blank=True)   # authority officer name

    # ── Timestamps ────────────────────────────
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name = "DurgSevak Report"

    def __str__(self):
        return f"{self.reference_number} — {self.fort_name} ({self.get_severity_display()})"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = "DS-" + uuid.uuid4().hex[:6].upper()
        super().save(*args, **kwargs)


class ReportStatusHistory(models.Model):
    """Tracks every status change for the timeline view."""
    report       = models.ForeignKey(DurgSevakReport, on_delete=models.CASCADE, related_name="history")
    status       = models.CharField(max_length=20, choices=DurgSevakReport.STATUS_CHOICES)
    notes        = models.TextField(blank=True)
    changed_by   = models.CharField(max_length=200, blank=True)
    changed_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at"]

    def __str__(self):
        return f"{self.report.reference_number} → {self.status} at {self.changed_at}"
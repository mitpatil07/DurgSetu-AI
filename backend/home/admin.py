# backend/admin.py
from django.contrib import admin
from .models import Fort, FortImage, StructuralAnalysis

@admin.register(Fort)
class FortAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'analysis_count', 'created_at']
    search_fields = ['name', 'location']
    list_filter = ['created_at']

@admin.register(FortImage)
class FortImageAdmin(admin.ModelAdmin):
    list_display = ['fort', 'uploaded_at', 'is_reference']
    list_filter = ['fort', 'uploaded_at', 'is_reference']
    search_fields = ['fort__name', 'description']

@admin.register(StructuralAnalysis)
class StructuralAnalysisAdmin(admin.ModelAdmin):
    list_display = ['fort', 'risk_level', 'risk_score', 'changes_detected', 'analysis_date']
    list_filter = ['risk_level', 'analysis_date', 'fort']
    search_fields = ['fort__name']
    readonly_fields = ['analysis_date']
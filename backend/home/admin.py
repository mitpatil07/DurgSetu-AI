from django.contrib import admin
from .models import Fort, FortImage, StructuralAnalysis, IssueReport, DurgSevakReport, ReportStatusHistory

admin.site.register(Fort)
admin.site.register(FortImage)
admin.site.register(StructuralAnalysis)
admin.site.register(IssueReport)

class StatusHistoryInline(admin.TabularInline):
    model       = ReportStatusHistory
    extra       = 0
    readonly_fields = ["status", "notes", "changed_by", "changed_at"]

@admin.register(DurgSevakReport)
class DurgSevakReportAdmin(admin.ModelAdmin):
    list_display    = ["reference_number", "fort_name", "fort_section", "severity", "status", "sevak_name", "submitted_at"]
    list_filter     = ["severity", "status", "fort_name"]
    search_fields   = ["reference_number", "fort_name", "sevak_name", "sevak_email"]
    readonly_fields = ["reference_number", "submitted_at", "updated_at"]
    inlines         = [StatusHistoryInline]
    ordering        = ["-submitted_at"]

    fieldsets = (
        ("Report Identity",    {"fields": ("reference_number", "submitted_at", "updated_at")}),
        ("DurgSevak",          {"fields": ("sevak_name", "sevak_email", "sevak_phone")}),
        ("Fort & Location",    {"fields": ("fort_name", "fort_section", "severity")}),
        ("Damage Details",     {"fields": ("description", "suggestions", "image")}),
        ("Authority Response", {"fields": ("status", "admin_notes", "actioned_by")}),
    )
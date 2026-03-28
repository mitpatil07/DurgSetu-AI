# backend/admin.py
from django.contrib import admin
from django.contrib.auth.models import User
from .models import Fort, FortImage, StructuralAnalysis, UserProfile, AdminUser

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['get_username', 'get_email', 'phone_number', 'address', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone_number']

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    get_username.admin_order_field = 'user__username'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['get_username', 'get_email', 'department', 'designation', 'clearance_level', 'created_at']
    search_fields = ['user__username', 'user__email', 'department', 'designation']
    list_filter = ['clearance_level']

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Admin Username'
    get_username.admin_order_field = 'user__username'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Admin Email'
    get_email.admin_order_field = 'user__email'

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
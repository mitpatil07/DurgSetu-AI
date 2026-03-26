# home/urls.py (APP URLs)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FortViewSet, FortImageViewSet, StructuralAnalysisViewSet, 
    RegisterView, LoginView, IssueReportViewSet, 
    ReportCreateView, ReportListView, ReportDetailView,
    ReportStatusUpdateView, ActionSuggestionsView, ReportStatsView
)

router = DefaultRouter()
router.register(r'forts', FortViewSet, basename='fort')
router.register(r'fort-images', FortImageViewSet, basename='fortimage')
router.register(r'structural-analyses', StructuralAnalysisViewSet, basename='structuralanalysis')
router.register(r'issue-reports', IssueReportViewSet, basename='issuereport')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    # Reports Endpoints
    path("reports/",                    ReportCreateView.as_view(),        name="report-create"),
    path("reports/list/",               ReportListView.as_view(),          name="report-list"),
    path("reports/stats/",              ReportStatsView.as_view(),         name="report-stats"),
    path("reports/<int:pk>/",           ReportDetailView.as_view(),        name="report-detail"),
    path("reports/<int:pk>/status/",    ReportStatusUpdateView.as_view(),  name="report-status"),
    path("reports/<int:pk>/suggestions/", ActionSuggestionsView.as_view(), name="report-suggestions"),

    path('', include(router.urls)),
]
# home/urls.py (APP URLs)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FortViewSet, FortImageViewSet, StructuralAnalysisViewSet, RegisterView, LoginView, UserDamageReportViewSet, AdminDamageReportViewSet

router = DefaultRouter()
router.register(r'forts', FortViewSet, basename='fort')
router.register(r'fort-images', FortImageViewSet, basename='fortimage')
router.register(r'structural-analyses', StructuralAnalysisViewSet, basename='structuralanalysis')
router.register(r'user-reports', UserDamageReportViewSet, basename='userreport')
router.register(r'admin-reports', AdminDamageReportViewSet, basename='adminreport')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]

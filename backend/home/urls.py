# home/urls.py (APP URLs)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FortViewSet, FortImageViewSet, StructuralAnalysisViewSet

router = DefaultRouter()
router.register(r'forts', FortViewSet, basename='fort')
router.register(r'fort-images', FortImageViewSet, basename='fortimage')
router.register(r'structural-analyses', StructuralAnalysisViewSet, basename='structuralanalysis')

urlpatterns = [
    path('', include(router.urls)),
]
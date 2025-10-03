# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('home.urls')),  # <--- mount your app's API routes here
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

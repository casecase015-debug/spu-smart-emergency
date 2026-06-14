from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'callsigns', views.CallsignViewSet)
router.register(r'transcripts', views.TranscriptViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'incidents', views.IncidentViewSet)
router.register(r'config', views.SystemConfigViewSet)
router.register(r'audit-logs', views.AuditLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

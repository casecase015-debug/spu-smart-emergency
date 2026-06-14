from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Callsign, Transcript, Event, Incident, SystemConfig, AuditLog
from .serializers import (
    CallsignSerializer, TranscriptSerializer, EventSerializer,
    IncidentSerializer, SystemConfigSerializer, AuditLogSerializer
)


# ============================================================
# Callsign ViewSet
# ============================================================
class CallsignViewSet(viewsets.ModelViewSet):
    queryset = Callsign.objects.all()
    serializer_class = CallsignSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'frequency']
    search_fields = ['callsign', 'operator_name', 'role']
    ordering_fields = ['callsign', 'status', 'updated_at']
    ordering = ['-updated_at']

    def get_permissions(self):
        return [AllowAny()]

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        status_filter = request.query_params.get('status')
        if status_filter:
            callsigns = Callsign.objects.filter(status=status_filter)
            serializer = self.get_serializer(callsigns, many=True)
            return Response(serializer.data)
        return Response({'error': 'status parameter required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        callsign = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Callsign.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        callsign.status = new_status
        callsign.last_active = timezone.now()
        callsign.save()
        return Response(self.get_serializer(callsign).data)


# ============================================================
# Transcript ViewSet
# ============================================================
class TranscriptViewSet(viewsets.ModelViewSet):
    queryset = Transcript.objects.all()
    serializer_class = TranscriptSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['priority', 'source', 'is_emergency', 'callsign']
    search_fields = ['callsign', 'operator_name', 'text']
    ordering_fields = ['timestamp', 'confidence', 'priority']
    ordering = ['-timestamp']

    def get_permissions(self):
        return [AllowAny()]

    @action(detail=False, methods=['get'])
    def recent(self, request):
        limit = int(request.query_params.get('limit', 10))
        transcripts = Transcript.objects.all()[:limit]
        serializer = self.get_serializer(transcripts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_priority(self, request):
        priority = request.query_params.get('priority')
        if priority:
            transcripts = Transcript.objects.filter(priority=priority)
            serializer = self.get_serializer(transcripts, many=True)
            return Response(serializer.data)
        return Response({'error': 'priority parameter required'}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# Event ViewSet
# ============================================================
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['severity', 'status', 'event_type']
    search_fields = ['event_type', 'detail', 'callsign', 'location']
    ordering_fields = ['timestamp', 'severity']
    ordering = ['-timestamp']

    def get_permissions(self):
        return [AllowAny()]

    @action(detail=False, methods=['get'])
    def by_severity(self, request):
        severity = request.query_params.get('severity')
        if severity:
            events = Event.objects.filter(severity=severity)
            serializer = self.get_serializer(events, many=True)
            return Response(serializer.data)
        return Response({'error': 'severity parameter required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def acknowledge(self, request, pk=None):
        event = self.get_object()
        event.status = 'acknowledged'
        event.save()
        return Response(self.get_serializer(event).data)

    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        event = self.get_object()
        event.status = 'resolved'
        event.save()
        return Response(self.get_serializer(event).data)


# ============================================================
# Incident ViewSet
# ============================================================
class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['building_id', 'incident_type', 'severity', 'status']
    search_fields = ['building_name', 'label', 'description']
    ordering_fields = ['created_at', 'severity']
    ordering = ['-created_at']

    def get_permissions(self):
        return [AllowAny()]

    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.status = 'resolved'
        incident.resolved_at = timezone.now()
        incident.save()
        return Response(self.get_serializer(incident).data)


# ============================================================
# SystemConfig ViewSet
# ============================================================
class SystemConfigViewSet(viewsets.ModelViewSet):
    queryset = SystemConfig.objects.all()
    serializer_class = SystemConfigSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['key', 'description']

    @action(detail=False, methods=['get'])
    def by_key(self, request):
        key = request.query_params.get('key')
        if key:
            try:
                config = SystemConfig.objects.get(key=key)
                serializer = self.get_serializer(config)
                return Response(serializer.data)
            except SystemConfig.DoesNotExist:
                return Response({'error': 'Config not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'key parameter required'}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# AuditLog ViewSet
# ============================================================
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['action', 'table_name', 'user']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def by_table(self, request):
        table_name = request.query_params.get('table_name')
        if table_name:
            logs = AuditLog.objects.filter(table_name=table_name)
            serializer = self.get_serializer(logs, many=True)
            return Response(serializer.data)
        return Response({'error': 'table_name parameter required'}, status=status.HTTP_400_BAD_REQUEST)

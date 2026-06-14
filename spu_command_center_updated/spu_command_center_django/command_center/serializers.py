from rest_framework import serializers
from .models import Callsign, Transcript, Event, Incident, SystemConfig, AuditLog


class CallsignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Callsign
        fields = [
            'id', 'callsign', 'operator_name', 'role', 'frequency',
            'status', 'last_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcript
        fields = [
            'id', 'callsign', 'operator_name', 'text', 'timestamp',
            'frequency', 'rssi', 'confidence', 'priority', 'is_emergency',
            'source', 'created_at'
        ]
        read_only_fields = ['created_at', 'timestamp']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id', 'timestamp', 'severity', 'event_type', 'detail',
            'callsign', 'location', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'timestamp']


class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = [
            'id', 'building_id', 'building_name', 'incident_type',
            'label', 'description', 'severity', 'status',
            'created_at', 'resolved_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = ['id', 'key', 'value', 'description', 'data_type', 'updated_at']
        read_only_fields = ['updated_at']


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_name', 'action', 'table_name',
            'record_id', 'old_value', 'new_value', 'ip_address',
            'user_agent', 'created_at'
        ]
        read_only_fields = ['created_at']

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# ============================================================
# Callsign Directory Model
# ============================================================
class Callsign(models.Model):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('standby', 'Standby'),
        ('busy', 'Busy'),
        ('emergency', 'Emergency'),
        ('offline', 'Offline'),
    ]

    callsign = models.CharField(max_length=50, unique=True, db_index=True)
    operator_name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    frequency = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='offline',
        db_index=True
    )
    last_active = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name_plural = 'Callsigns'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['callsign']),
            models.Index(fields=['-updated_at']),
        ]

    def __str__(self):
        return f"{self.callsign} - {self.operator_name}"


# ============================================================
# Transcript Model
# ============================================================
class Transcript(models.Model):
    PRIORITY_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('emergency', 'Emergency'),
    ]

    SOURCE_CHOICES = [
        ('live_mic', 'Live Microphone'),
        ('simulator', 'Simulator'),
        ('api', 'API'),
    ]

    callsign = models.CharField(max_length=50, db_index=True)
    operator_name = models.CharField(max_length=255)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    frequency = models.CharField(max_length=20)
    rssi = models.IntegerField(null=True, blank=True)  # Signal strength in dBm
    confidence = models.IntegerField(null=True, blank=True)  # AI confidence 0-100
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='info',
        db_index=True
    )
    is_emergency = models.BooleanField(default=False)
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default='api'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Transcripts'
        indexes = [
            models.Index(fields=['callsign']),
            models.Index(fields=['priority']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"{self.callsign} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"


# ============================================================
# Event Log Model
# ============================================================
class Event(models.Model):
    SEVERITY_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('emergency', 'Emergency'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
    ]

    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='info',
        db_index=True
    )
    event_type = models.CharField(max_length=255)
    detail = models.TextField()
    callsign = models.CharField(max_length=50, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Events'
        indexes = [
            models.Index(fields=['severity']),
            models.Index(fields=['status']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"[{self.severity.upper()}] {self.event_type} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"


# ============================================================
# Tactical Map Incident Model
# ============================================================
class Incident(models.Model):
    INCIDENT_TYPE_CHOICES = [
        ('fire', 'Fire'),
        ('alert', 'Alert'),
        ('emergency', 'Emergency'),
        ('test', 'Test'),
    ]

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
    ]

    building_id = models.CharField(max_length=50, db_index=True)
    building_name = models.CharField(max_length=255)
    incident_type = models.CharField(
        max_length=20,
        choices=INCIDENT_TYPE_CHOICES,
        default='alert'
    )
    label = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='medium'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Incidents'
        indexes = [
            models.Index(fields=['building_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.building_name} - {self.label}"


# ============================================================
# System Configuration Model
# ============================================================
class SystemConfig(models.Model):
    DATA_TYPE_CHOICES = [
        ('string', 'String'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
    ]

    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    data_type = models.CharField(
        max_length=20,
        choices=DATA_TYPE_CHOICES,
        default='string'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'System Configurations'

    def __str__(self):
        return self.key


# ============================================================
# Audit Log Model
# ============================================================
class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('VIEW', 'View'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    table_name = models.CharField(max_length=100, db_index=True)
    record_id = models.IntegerField(null=True, blank=True)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Audit Logs'
        indexes = [
            models.Index(fields=['table_name']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.action} - {self.table_name} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"

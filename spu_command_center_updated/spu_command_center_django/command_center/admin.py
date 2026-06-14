from django.contrib import admin
from django.utils.html import format_html
from .models import Callsign, Transcript, Event, Incident, SystemConfig, AuditLog

# Customize admin site branding - Remove Django references
admin.site.site_header = 'SPU Command Center'
admin.site.site_title = 'SPU Admin'
admin.site.index_title = 'ศูนย์บริหารจัดการระบบสื่อสาร'


# ============================================================
# Callsign Admin
# ============================================================
@admin.register(Callsign)
class CallsignAdmin(admin.ModelAdmin):
    list_display = ['callsign', 'operator_name', 'role', 'frequency', 'status_badge', 'last_active', 'updated_at']
    list_filter = ['status', 'frequency', 'created_at']
    search_fields = ['callsign', 'operator_name', 'role']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('ข้อมูลพื้นฐาน', {
            'fields': ('callsign', 'operator_name', 'role')
        }),
        ('ข้อมูลวิทยุ', {
            'fields': ('frequency', 'status', 'last_active')
        }),
        ('หมายเหตุ', {
            'fields': ('notes',)
        }),
        ('เวลา', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        colors = {
            'online': '#10b981',
            'standby': '#f59e0b',
            'busy': '#f97316',
            'emergency': '#ef4444',
            'offline': '#6b7280',
        }
        status_text = {
            'online': '🟢 ออนไลน์',
            'standby': '🟡 รอสั่งการ',
            'busy': '🟠 ยุ่ง',
            'emergency': '🔴 ฉุกเฉิน',
            'offline': '⚫ ออฟไลน์',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 500; display: inline-block;">{}</span>',
            colors.get(obj.status, '#6b7280'),
            status_text.get(obj.status, obj.get_status_display())
        )
    status_badge.short_description = 'สถานะ'


# ============================================================
# Transcript Admin
# ============================================================
@admin.register(Transcript)
class TranscriptAdmin(admin.ModelAdmin):
    list_display = ['callsign', 'operator_name', 'priority_badge', 'confidence', 'timestamp', 'source']
    list_filter = ['priority', 'source', 'is_emergency', 'timestamp']
    search_fields = ['callsign', 'operator_name', 'text']
    readonly_fields = ['created_at', 'timestamp']
    fieldsets = (
        ('ข้อมูลการส่งสัญญาณ', {
            'fields': ('callsign', 'operator_name', 'text')
        }),
        ('ข้อมูลสัญญาณ', {
            'fields': ('frequency', 'rssi', 'confidence')
        }),
        ('การจำแนก', {
            'fields': ('priority', 'is_emergency', 'source')
        }),
        ('เวลา', {
            'fields': ('timestamp', 'created_at'),
            'classes': ('collapse',)
        }),
    )

    def priority_badge(self, obj):
        colors = {
            'info': '#06b6d4',
            'warning': '#f59e0b',
            'emergency': '#ef4444',
        }
        priority_text = {
            'info': 'ℹ️ ข้อมูล',
            'warning': '⚠️ เตือน',
            'emergency': '🚨 ฉุกเฉิน',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 500; display: inline-block;">{}</span>',
            colors.get(obj.priority, '#06b6d4'),
            priority_text.get(obj.priority, obj.get_priority_display())
        )
    priority_badge.short_description = 'ลำดับความสำคัญ'


# ============================================================
# Event Admin
# ============================================================
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'severity_badge', 'status_badge', 'callsign', 'location', 'timestamp']
    list_filter = ['severity', 'status', 'event_type', 'timestamp']
    search_fields = ['event_type', 'detail', 'callsign', 'location']
    readonly_fields = ['created_at', 'updated_at', 'timestamp']
    fieldsets = (
        ('ข้อมูลเหตุการณ์', {
            'fields': ('event_type', 'detail')
        }),
        ('การจำแนก', {
            'fields': ('severity', 'status')
        }),
        ('ข้อมูลที่เกี่ยวข้อง', {
            'fields': ('callsign', 'location')
        }),
        ('เวลา', {
            'fields': ('timestamp', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    actions = ['mark_acknowledged', 'mark_resolved']

    def severity_badge(self, obj):
        colors = {
            'info': '#06b6d4',
            'warning': '#f59e0b',
            'emergency': '#ef4444',
            'critical': '#991b1b',
        }
        severity_text = {
            'info': 'ℹ️ ข้อมูล',
            'warning': '⚠️ เตือน',
            'emergency': '🚨 ฉุกเฉิน',
            'critical': '💥 วิกฤต',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 500; display: inline-block;">{}</span>',
            colors.get(obj.severity, '#06b6d4'),
            severity_text.get(obj.severity, obj.get_severity_display())
        )
    severity_badge.short_description = 'ความรุนแรง'

    def status_badge(self, obj):
        colors = {
            'active': '#ef4444',
            'acknowledged': '#f59e0b',
            'resolved': '#10b981',
        }
        status_text = {
            'active': '🔴 กำลังดำเนิน',
            'acknowledged': '🟡 ยอมรับแล้ว',
            'resolved': '🟢 แก้ไขแล้ว',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 500; display: inline-block;">{}</span>',
            colors.get(obj.status, '#6b7280'),
            status_text.get(obj.status, obj.get_status_display())
        )
    status_badge.short_description = 'สถานะ'

    def mark_acknowledged(self, request, queryset):
        queryset.update(status='acknowledged')
    mark_acknowledged.short_description = '✓ ทำเครื่องหมายว่ายอมรับแล้ว'

    def mark_resolved(self, request, queryset):
        queryset.update(status='resolved')
    mark_resolved.short_description = '✓ ทำเครื่องหมายว่าแก้ไขแล้ว'


# ============================================================
# Incident Admin
# ============================================================
@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ['building_name', 'label', 'incident_type', 'severity_badge', 'status_badge', 'created_at']
    list_filter = ['incident_type', 'severity', 'status', 'created_at']
    search_fields = ['building_name', 'label', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('ข้อมูลอาคาร', {
            'fields': ('building_id', 'building_name')
        }),
        ('รายละเอียดเหตุการณ์', {
            'fields': ('label', 'description', 'incident_type')
        }),
        ('สถานะ', {
            'fields': ('severity', 'status', 'resolved_at')
        }),
        ('เวลา', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def severity_badge(self, obj):
        colors = {
            'low': '#10b981',
            'medium': '#f59e0b',
            'high': '#f97316',
            'critical': '#dc2626',
        }
        severity_text = {
            'low': '🟢 ต่ำ',
            'medium': '🟡 ปานกลาง',
            'high': '🟠 สูง',
            'critical': '🔴 วิกฤต',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 500; display: inline-block;">{}</span>',
            colors.get(obj.severity, '#6b7280'),
            severity_text.get(obj.severity, obj.get_severity_display())
        )
    severity_badge.short_description = 'ความรุนแรง'

    def status_badge(self, obj):
        colors = {
            'active': '#ef4444',
            'acknowledged': '#f59e0b',
            'resolved': '#10b981',
        }
        status_text = {
            'active': '🔴 กำลังดำเนิน',
            'acknowledged': '🟡 ยอมรับแล้ว',
            'resolved': '🟢 แก้ไขแล้ว',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 500; display: inline-block;">{}</span>',
            colors.get(obj.status, '#6b7280'),
            status_text.get(obj.status, obj.get_status_display())
        )
    status_badge.short_description = 'สถานะ'


# ============================================================
# SystemConfig Admin
# ============================================================
@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    list_display = ['key', 'data_type', 'value_preview', 'updated_at']
    list_filter = ['data_type', 'updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['updated_at']
    fieldsets = (
        ('การตั้งค่า', {
            'fields': ('key', 'value', 'data_type')
        }),
        ('คำอธิบาย', {
            'fields': ('description',)
        }),
        ('เวลา', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )

    def value_preview(self, obj):
        preview = obj.value[:50] if len(obj.value) > 50 else obj.value
        return preview
    value_preview.short_description = 'ค่า'


# ============================================================
# AuditLog Admin
# ============================================================
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action_badge', 'table_name', 'user_display', 'record_id', 'created_at', 'ip_address']
    list_filter = ['action', 'table_name', 'created_at']
    search_fields = ['table_name', 'user__username', 'ip_address']
    readonly_fields = ['created_at', 'action', 'table_name', 'record_id', 'old_value', 'new_value', 'ip_address', 'user_agent']
    fieldsets = (
        ('ข้อมูล Audit', {
            'fields': ('user', 'action', 'table_name', 'record_id')
        }),
        ('การเปลี่ยนแปลง', {
            'fields': ('old_value', 'new_value')
        }),
        ('ข้อมูลคำขอ', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('เวลา', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def action_badge(self, obj):
        colors = {
            'CREATE': '#10b981',
            'UPDATE': '#06b6d4',
            'DELETE': '#ef4444',
            'VIEW': '#8b5cf6',
        }
        action_text = {
            'CREATE': '✨ สร้าง',
            'UPDATE': '✏️ อัปเดต',
            'DELETE': '🗑️ ลบ',
            'VIEW': '👁️ ดู',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 500; display: inline-block;">{}</span>',
            colors.get(obj.action, '#6b7280'),
            action_text.get(obj.action, obj.action)
        )
    action_badge.short_description = 'การกระทำ'

    def user_display(self, obj):
        return obj.user.username if obj.user else 'ระบบ'
    user_display.short_description = 'ผู้ใช้'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

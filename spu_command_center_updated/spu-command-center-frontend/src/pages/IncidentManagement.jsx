import AdminResourcePage from './AdminResourcePage';
import { incidentAPI } from '../services/api';

const initialForm = {
  building_id: '',
  building_name: '',
  incident_type: 'alert',
  label: '',
  description: '',
  severity: 'medium',
  status: 'active',
};

export default function IncidentManagement() {
  return (
    <AdminResourcePage
      title="Incident Management"
      eyebrow="Tactical Map"
      description="Create and manage incidents for buildings and tactical map overlays."
      api={incidentAPI}
      initialForm={initialForm}
      fields={[
        { name: 'building_id', label: 'Building ID', required: true, placeholder: 'BLDG-A' },
        { name: 'building_name', label: 'Building Name', required: true },
        {
          name: 'incident_type',
          label: 'Incident Type',
          type: 'select',
          options: [
            { value: 'fire', label: 'Fire' },
            { value: 'alert', label: 'Alert' },
            { value: 'emergency', label: 'Emergency' },
            { value: 'test', label: 'Test' },
          ],
        },
        { name: 'label', label: 'Label', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        {
          name: 'severity',
          label: 'Severity',
          type: 'select',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ],
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'acknowledged', label: 'Acknowledged' },
            { value: 'resolved', label: 'Resolved' },
          ],
        },
      ]}
      columns={[
        { key: 'building_id', label: 'Building', pill: true },
        { key: 'building_name', label: 'Name' },
        { key: 'incident_type', label: 'Type', pill: true },
        { key: 'severity', label: 'Severity', pill: true },
        { key: 'status', label: 'Status', pill: true },
      ]}
    />
  );
}

import AdminResourcePage from './AdminResourcePage';
import { eventAPI } from '../services/api';

const initialForm = {
  event_type: '',
  detail: '',
  severity: 'info',
  status: 'active',
  callsign: '',
  location: '',
};

export default function EventManagement() {
  return (
    <AdminResourcePage
      title="Event Management"
      eyebrow="Emergency Response"
      description="Log, monitor, acknowledge, and clean up command-center events."
      api={eventAPI}
      initialForm={initialForm}
      fields={[
        { name: 'event_type', label: 'Event Type', required: true, placeholder: 'Fire alarm' },
        { name: 'detail', label: 'Detail', type: 'textarea', required: true },
        {
          name: 'severity',
          label: 'Severity',
          type: 'select',
          options: [
            { value: 'info', label: 'Info' },
            { value: 'warning', label: 'Warning' },
            { value: 'emergency', label: 'Emergency' },
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
        { name: 'callsign', label: 'Callsign' },
        { name: 'location', label: 'Location' },
      ]}
      columns={[
        { key: 'event_type', label: 'Type' },
        { key: 'severity', label: 'Severity', pill: true },
        { key: 'status', label: 'Status', pill: true },
        { key: 'callsign', label: 'Callsign' },
        { key: 'location', label: 'Location' },
      ]}
    />
  );
}

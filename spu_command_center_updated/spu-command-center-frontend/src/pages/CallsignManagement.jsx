import AdminResourcePage from './AdminResourcePage';
import { callsignAPI } from '../services/api';

const initialForm = {
  callsign: '',
  operator_name: '',
  role: '',
  frequency: '',
  status: 'online',
  notes: '',
};

export default function CallsignManagement() {
  return (
    <AdminResourcePage
      title="Callsign Management"
      eyebrow="Radio Directory"
      description="Create and manage radio callsigns, operators, status, and frequencies."
      api={callsignAPI}
      initialForm={initialForm}
      fields={[
        { name: 'callsign', label: 'Callsign', required: true, placeholder: 'SPU-01' },
        { name: 'operator_name', label: 'Operator Name', required: true },
        { name: 'role', label: 'Role', required: true },
        { name: 'frequency', label: 'Frequency', required: true, placeholder: '145.500' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'online', label: 'Online' },
            { value: 'standby', label: 'Standby' },
            { value: 'busy', label: 'Busy' },
            { value: 'emergency', label: 'Emergency' },
            { value: 'offline', label: 'Offline' },
          ],
        },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        { key: 'callsign', label: 'Callsign', pill: true },
        { key: 'operator_name', label: 'Operator' },
        { key: 'role', label: 'Role' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'status', label: 'Status', pill: true },
      ]}
    />
  );
}

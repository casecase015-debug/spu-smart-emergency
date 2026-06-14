import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle responses - no auth required
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// Callsign API
// ============================================================
export const callsignAPI = {
  list: (params = {}) => apiClient.get('/callsigns/', { params }),
  get: (id) => apiClient.get(`/callsigns/${id}/`),
  create: (data) => apiClient.post('/callsigns/', data),
  update: (id, data) => apiClient.patch(`/callsigns/${id}/`, data),
  delete: (id) => apiClient.delete(`/callsigns/${id}/`),
  updateStatus: (id, status) => apiClient.patch(`/callsigns/${id}/update_status/`, { status }),
  byStatus: (status) => apiClient.get('/callsigns/by_status/', { params: { status } }),
  search: (query) => apiClient.get('/callsigns/', { params: { search: query } }),
};

// ============================================================
// Transcript API
// ============================================================
export const transcriptAPI = {
  list: (params = {}) => apiClient.get('/transcripts/', { params }),
  get: (id) => apiClient.get(`/transcripts/${id}/`),
  create: (data) => apiClient.post('/transcripts/', data),
  update: (id, data) => apiClient.patch(`/transcripts/${id}/`, data),
  delete: (id) => apiClient.delete(`/transcripts/${id}/`),
  recent: (limit = 10) => apiClient.get('/transcripts/recent/', { params: { limit } }),
  byPriority: (priority) => apiClient.get('/transcripts/by_priority/', { params: { priority } }),
  search: (query) => apiClient.get('/transcripts/', { params: { search: query } }),
};

// ============================================================
// Event API
// ============================================================
export const eventAPI = {
  list: (params = {}) => apiClient.get('/events/', { params }),
  get: (id) => apiClient.get(`/events/${id}/`),
  create: (data) => apiClient.post('/events/', data),
  update: (id, data) => apiClient.patch(`/events/${id}/`, data),
  delete: (id) => apiClient.delete(`/events/${id}/`),
  bySeverity: (severity) => apiClient.get('/events/by_severity/', { params: { severity } }),
  acknowledge: (id) => apiClient.patch(`/events/${id}/acknowledge/`),
  resolve: (id) => apiClient.patch(`/events/${id}/resolve/`),
  search: (query) => apiClient.get('/events/', { params: { search: query } }),
};

// ============================================================
// Incident API
// ============================================================
export const incidentAPI = {
  list: (params = {}) => apiClient.get('/incidents/', { params }),
  get: (id) => apiClient.get(`/incidents/${id}/`),
  create: (data) => apiClient.post('/incidents/', data),
  update: (id, data) => apiClient.patch(`/incidents/${id}/`, data),
  delete: (id) => apiClient.delete(`/incidents/${id}/`),
  resolve: (id) => apiClient.patch(`/incidents/${id}/resolve/`),
  search: (query) => apiClient.get('/incidents/', { params: { search: query } }),
};

// ============================================================
// System Config API
// ============================================================
export const configAPI = {
  list: (params = {}) => apiClient.get('/config/', { params }),
  get: (id) => apiClient.get(`/config/${id}/`),
  create: (data) => apiClient.post('/config/', data),
  update: (id, data) => apiClient.patch(`/config/${id}/`, data),
  delete: (id) => apiClient.delete(`/config/${id}/`),
  byKey: (key) => apiClient.get('/config/by_key/', { params: { key } }),
};

// ============================================================
// Audit Log API
// ============================================================
export const auditLogAPI = {
  list: (params = {}) => apiClient.get('/audit-logs/', { params }),
  get: (id) => apiClient.get(`/audit-logs/${id}/`),
  byTable: (tableName) => apiClient.get('/audit-logs/by_table/', { params: { table_name: tableName } }),
};

export default apiClient;
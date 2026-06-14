import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './AdminResource.css';

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

function AdminResourcePage({ title, description, eyebrow, api, fields, columns, initialForm }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadRows = async () => {
    try {
      setLoading(true);
      const response = await api.list();
      setRows(toList(response.data));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load data from the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.create(form);
      setForm(initialForm);
      setMessage('Saved successfully.');
      setError('');
      await loadRows();
    } catch (err) {
      console.error(err);
      setError('Unable to save. Please check required fields and API status.');
      setMessage('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(id);
      setRows((current) => current.filter((row) => row.id !== id));
      setMessage('Deleted successfully.');
    } catch (err) {
      console.error(err);
      setError('Unable to delete this record.');
    }
  };

  return (
    <div className="admin-resource">
      <section className="resource-header">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="resource-count">{loading ? 'Loading' : `${rows.length} records`}</div>
      </section>

      {message && <div className="resource-message">{message}</div>}
      {error && <div className="resource-message error">{error}</div>}

      <div className="resource-layout">
        <form className="resource-form" onSubmit={handleSubmit}>
          <h2>Create Record</h2>
          <div className="form-grid">
            {fields.map((field) => (
              <label key={field.name}>
                {field.label}
                {field.type === 'select' ? (
                  <select
                    value={form[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    required={field.required}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={form[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={form[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            ))}
            <button className="primary-action" type="submit" disabled={saving}>
              <Plus size={16} /> {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>

        <section className="resource-table-panel">
          <h2>Records</h2>
          {loading ? (
            <div className="empty-state">Loading data...</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">No records yet.</div>
          ) : (
            <div className="table-wrap">
              <table className="resource-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.pill ? (
                            <span className="pill">{row[column.key] || '-'}</span>
                          ) : (
                            row[column.key] || <span className="muted-cell">-</span>
                          )}
                        </td>
                      ))}
                      <td>
                        <button className="danger-action" type="button" onClick={() => handleDelete(row.id)}>
                          <Trash2 size={15} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminResourcePage;

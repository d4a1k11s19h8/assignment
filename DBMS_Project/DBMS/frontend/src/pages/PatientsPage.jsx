import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPatients, createPatient } from '../api/client';
import Toast from '../components/Toast';

const EMPTY = { full_name: '', date_of_birth: '', gender: 'M', phone: '', email: '', address: '' };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');

  const load = () => getPatients().then(r => setPatients(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPatient(form);
      setToast({ msg: 'Patient registered successfully!', type: 'success' });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setToast({ msg: err.response?.data?.detail || 'Registration failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header flex-between">
        <div><h1>Patients</h1><p>Manage registered patients</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Register Patient'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="card section-gap">
          <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>New Patient Registration</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="e.g. Rahul Gupta" />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" required value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="10-digit number" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="optional" />
              </div>
              <div className="form-group full">
                <label>Address</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street, City" />
              </div>
            </div>
            <div className="flex-row mt-16">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Register'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="card">
        <div className="flex-between section-gap">
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>{filtered.length} patients</span>
          <input style={{ width: 260 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search name or phone..." />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>DOB</th><th>Gender</th>
                <th>Phone</th><th>Email</th><th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No patients found</td></tr>
                : filtered.map(p => (
                  <tr key={p.patient_id}>
                    <td className="text-muted">{p.patient_id}</td>
                    <td><strong>{p.full_name}</strong></td>
                    <td>{p.date_of_birth}</td>
                    <td>{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
                    <td>{p.phone}</td>
                    <td className="text-muted">{p.email || '—'}</td>
                    <td className="text-muted">{p.registered_at}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

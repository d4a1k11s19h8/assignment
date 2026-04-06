import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAppointments, bookAppointment, getPatients, getDoctors, getAvailableSlots, updateApptStatus } from '../api/client';
import Toast from '../components/Toast';

const EMPTY = { patient_id: '', doctor_id: '', appt_date: '', time_slot: '' };
const STATUS_BADGE = { SCHEDULED: 'scheduled', COMPLETED: 'completed', CANCELLED: 'cancelled' };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients]         = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [slots, setSlots]               = useState([]);
  const [form, setForm]                 = useState(EMPTY);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [showForm, setShowForm]         = useState(false);

  const load = () => getAppointments().then(r => setAppointments(r.data)).catch(console.error);

  useEffect(() => {
    load();
    getPatients().then(r => setPatients(r.data)).catch(console.error);
    getDoctors().then(r => setDoctors(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.doctor_id && form.appt_date) {
      getAvailableSlots(form.doctor_id, form.appt_date)
        .then(r => setSlots(r.data.available_slots))
        .catch(() => setSlots([]));
    }
  }, [form.doctor_id, form.appt_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookAppointment({ ...form, patient_id: +form.patient_id, doctor_id: +form.doctor_id });
      setToast({ msg: 'Appointment booked!', type: 'success' });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setToast({ msg: err.response?.data?.detail || 'Booking failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id) => {
    try {
      await updateApptStatus(id, 'CANCELLED');
      setToast({ msg: 'Appointment cancelled.', type: 'success' });
      load();
    } catch (err) {
      setToast({ msg: 'Failed to cancel.', type: 'error' });
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header flex-between">
        <div><h1>Appointments</h1><p>Book and manage patient appointments</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="card section-gap">
          <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Book New Appointment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient *</label>
                <select required value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}>
                  <option value="">Select patient…</option>
                  {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.full_name} ({p.phone})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Doctor *</label>
                <select required value={form.doctor_id} onChange={e => setForm({...form, doctor_id: e.target.value, time_slot: ''})}>
                  <option value="">Select doctor…</option>
                  {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.full_name} — {d.dept_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" required value={form.appt_date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, appt_date: e.target.value, time_slot: ''})} />
              </div>
              <div className="form-group">
                <label>Time Slot *</label>
                <select required value={form.time_slot} onChange={e => setForm({...form, time_slot: e.target.value})}
                  disabled={!form.doctor_id || !form.appt_date}>
                  <option value="">Select slot…</option>
                  {slots.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-row mt-16">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Book Appointment'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Patient</th><th>Doctor</th><th>Dept</th>
                <th>Date</th><th>Slot</th><th>Status</th><th>Payment</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0
                ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No appointments yet</td></tr>
                : appointments.map(a => (
                  <tr key={a.appt_id}>
                    <td className="text-muted">{a.appt_id}</td>
                    <td><strong>{a.patient_name}</strong></td>
                    <td>{a.doctor_name}</td>
                    <td className="text-muted">{a.dept_name}</td>
                    <td>{a.appt_date}</td>
                    <td>{a.time_slot}</td>
                    <td><span className={`badge badge-${STATUS_BADGE[a.status] || ''}`}>{a.status}</span></td>
                    <td><span className={`badge badge-${(a.payment_status || '').toLowerCase()}`}>{a.payment_status || '—'}</span></td>
                    <td>
                      {a.status === 'SCHEDULED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(a.appt_id)}>Cancel</button>
                      )}
                    </td>
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

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAppointments, createPrescription, getPrescription } from '../api/client';
import Toast from '../components/Toast';

const EMPTY_MED = { drug_name: '', dosage: '', frequency: '', duration: '' };

export default function PrescriptionsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState('');
  const [existing, setExisting]         = useState(null);
  const [notes, setNotes]               = useState('');
  const [meds, setMeds]                 = useState([{ ...EMPTY_MED }]);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);

  useEffect(() => {
    getAppointments()
      .then(r => setAppointments(r.data.filter(a => a.status === 'SCHEDULED' || a.status === 'COMPLETED')))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setExisting(null);
    if (!selectedAppt) return;
    getPrescription(selectedAppt)
      .then(r => setExisting(r.data))
      .catch(() => setExisting(null));
  }, [selectedAppt]);

  const addMed = () => setMeds(m => [...m, { ...EMPTY_MED }]);
  const removeMed = (i) => setMeds(m => m.filter((_, idx) => idx !== i));
  const updateMed = (i, field, val) =>
    setMeds(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setLoading(true);
    try {
      await createPrescription({ appt_id: +selectedAppt, notes, medications: meds });
      setToast({ msg: 'Prescription saved!', type: 'success' });
      setNotes('');
      setMeds([{ ...EMPTY_MED }]);
      setSelectedAppt('');
    } catch (err) {
      setToast({ msg: err.response?.data?.detail || 'Failed to save prescription.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <h1>Prescriptions</h1>
        <p>Create prescriptions with medication details</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>New Prescription</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group section-gap">
              <label>Select Appointment *</label>
              <select required value={selectedAppt} onChange={e => setSelectedAppt(e.target.value)}>
                <option value="">Choose appointment…</option>
                {appointments.map(a => (
                  <option key={a.appt_id} value={a.appt_id}>
                    #{a.appt_id} — {a.patient_name} with {a.doctor_name} ({a.appt_date})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group section-gap">
              <label>Notes / Instructions</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="General prescription notes…" />
            </div>

            <div className="flex-between" style={{ marginBottom: 12 }}>
              <label>Medications</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addMed}>+ Add Medication</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {meds.map((med, i) => (
                <div key={i} className="med-row">
                  <div className="form-group">
                    <label>Drug Name</label>
                    <input required value={med.drug_name} onChange={e => updateMed(i, 'drug_name', e.target.value)} placeholder="e.g. Paracetamol" />
                  </div>
                  <div className="form-group">
                    <label>Dosage</label>
                    <input required value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="e.g. 500mg" />
                  </div>
                  <div className="form-group">
                    <label>Frequency</label>
                    <input required value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} placeholder="e.g. Twice daily" />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input required value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} placeholder="e.g. 5 days" />
                  </div>
                  {meds.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeMed(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-24">
              <button type="submit" className="btn btn-primary w-full" disabled={loading || !!existing}>
                {loading ? <span className="spinner" /> : existing ? 'Prescription already exists' : 'Save Prescription'}
              </button>
            </div>
          </form>
        </div>

        {existing && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
            <h3 style={{ marginBottom: 16, fontSize: '1rem', color: 'var(--accent)' }}>Existing Prescription</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>{existing.prescribed_at}</p>
            <p style={{ marginBottom: 20 }}>{existing.notes || <em style={{ color: 'var(--text-muted)' }}>No notes</em>}</p>
            <h4 style={{ marginBottom: 12, fontSize: '0.9rem' }}>Medications</h4>
            {existing.medications.map((m, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 8 }}>
                <strong>{m.drug_name}</strong> — {m.dosage}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {m.frequency} · {m.duration}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

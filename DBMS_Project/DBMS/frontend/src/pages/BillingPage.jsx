import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getBills, payBill } from '../api/client';
import Toast from '../components/Toast';

const PAYMENT_MODES = ['CASH', 'CARD', 'UPI', 'INSURANCE'];

export default function BillingPage() {
  const [bills, setBills]   = useState([]);
  const [toast, setToast]   = useState(null);
  const [paying, setPaying] = useState(null);   // { bill_id, mode, amount }

  const load = () => getBills().then(r => setBills(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const handlePay = async () => {
    if (!paying) return;
    try {
      await payBill(paying.bill_id, { payment_mode: paying.mode, amount: paying.amount ? Number(paying.amount) : undefined });
      setToast({ msg: 'Bill marked as PAID!', type: 'success' });
      setPaying(null);
      load();
    } catch (err) {
      setToast({ msg: err.response?.data?.detail || 'Payment failed.', type: 'error' });
    }
  };

  const stats = {
    total:     bills.reduce((s, b) => s + Number(b.amount), 0),
    paid:      bills.filter(b => b.payment_status === 'PAID').reduce((s, b) => s + Number(b.amount), 0),
    pending:   bills.filter(b => b.payment_status === 'PENDING').reduce((s, b) => s + Number(b.amount), 0),
    count:     bills.length,
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <h1>Billing</h1>
        <p>Track payments and billing records</p>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Total Billed',    value: `₹${stats.total.toLocaleString()}`,   color: '#5C6BC0' },
          { label: 'Collected',       value: `₹${stats.paid.toLocaleString()}`,    color: '#4caf50' },
          { label: 'Outstanding',     value: `₹${stats.pending.toLocaleString()}`, color: '#ff9800' },
          { label: 'Total Bills',     value: stats.count,                           color: '#00BFA5' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-color': s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pay modal */}
      {paying && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ width: 380 }}>
            <h3 style={{ marginBottom: 20 }}>Record Payment</h3>
            <div className="form-group section-gap">
              <label>Payment Mode</label>
              <select value={paying.mode} onChange={e => setPaying({...paying, mode: e.target.value})}>
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group section-gap">
              <label>Amount (₹)</label>
              <input type="number" value={paying.amount} onChange={e => setPaying({...paying, amount: e.target.value})} placeholder="Leave blank to keep existing" />
            </div>
            <div className="flex-row mt-16">
              <button className="btn btn-primary" onClick={handlePay}>Confirm Payment</button>
              <button className="btn btn-secondary" onClick={() => setPaying(null)}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bill ID</th><th>Patient</th><th>Doctor</th>
                <th>Date</th><th>Slot</th><th>Amount</th>
                <th>Mode</th><th>Status</th><th>Paid At</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0
                ? <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No bills yet</td></tr>
                : bills.map(b => (
                  <tr key={b.bill_id}>
                    <td className="text-muted">{b.bill_id}</td>
                    <td><strong>{b.patient_name}</strong></td>
                    <td>{b.doctor_name}</td>
                    <td>{b.appt_date}</td>
                    <td>{b.time_slot}</td>
                    <td>₹{Number(b.amount).toLocaleString()}</td>
                    <td className="text-muted">{b.payment_mode || '—'}</td>
                    <td><span className={`badge badge-${(b.payment_status || '').toLowerCase()}`}>{b.payment_status}</span></td>
                    <td className="text-muted">{b.paid_at || '—'}</td>
                    <td>
                      {b.payment_status === 'PENDING' && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => setPaying({ bill_id: b.bill_id, mode: 'CASH', amount: b.amount })}>
                          Pay
                        </button>
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

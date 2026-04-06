import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getBillingReport, getAppointments, getPatients, getDoctors } from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#00BFA5', '#5C6BC0', '#f44336', '#ff9800'];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Dashboard() {
  const [report, setReport] = useState(null);
  const [counts, setCounts] = useState({ patients: 0, appointments: 0, doctors: 0 });

  useEffect(() => {
    Promise.all([getBillingReport(), getPatients(), getAppointments(), getDoctors()])
      .then(([r, p, a, d]) => {
        setReport(r.data);
        setCounts({ patients: p.data.length, appointments: a.data.length, doctors: d.data.length });
      })
      .catch(console.error);
  }, []);

  const modeData = report?.by_payment_mode || [];
  const monthlyData = (report?.monthly || []).map(m => ({
    month: m.month,
    Paid: Number(m.paid),
    Pending: Number(m.pending),
  }));

  const summary = report?.summary || {};

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Clinic at a glance</p>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Total Patients',     value: counts.patients,     color: '#00BFA5', sub: 'registered' },
          { label: 'Appointments',       value: counts.appointments, color: '#5C6BC0', sub: 'total booked' },
          { label: 'Doctors',            value: counts.doctors,      color: '#ff9800', sub: 'on staff' },
          { label: 'Revenue Collected',  value: `₹${Number(summary.paid_amount || 0).toLocaleString()}`,  color: '#4caf50', sub: 'paid bills' },
          { label: 'Pending Amount',     value: `₹${Number(summary.pending_amount || 0).toLocaleString()}`, color: '#f44336', sub: 'outstanding' },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeUp} className="stat-card" style={{ '--accent-color': s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <motion.div variants={fadeUp} className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Monthly Revenue (₹)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#7a8ba3', fontSize: 12 }} />
              <YAxis tick={{ fill: '#7a8ba3', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#e8edf5' }}
              />
              <Bar dataKey="Paid"    fill="#00BFA5" radius={[4,4,0,0]} />
              <Bar dataKey="Pending" fill="#5C6BC0" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Payments by Mode</h3>
          {modeData.length === 0
            ? <p className="text-muted" style={{ textAlign: 'center', marginTop: 80 }}>No paid bills yet</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={modeData} dataKey="total" nameKey="payment_mode" cx="50%" cy="50%" outerRadius={90} label>
                    {modeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12, color: '#7a8ba3' }} />
                  <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </motion.div>
      </div>
    </motion.div>
  );
}

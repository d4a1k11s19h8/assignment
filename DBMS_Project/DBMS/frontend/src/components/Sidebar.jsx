import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',              icon: '📊', label: 'Dashboard' },
  { to: '/patients',      icon: '👤', label: 'Patients' },
  { to: '/appointments',  icon: '📅', label: 'Appointments' },
  { to: '/prescriptions', icon: '💊', label: 'Prescriptions' },
  { to: '/billing',       icon: '💳', label: 'Billing' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="#00BFA5" fillOpacity="0.15"/>
          <path d="M14 5v18M5 14h18" stroke="#00BFA5" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        ClinicOS
      </div>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1rem' }}>{l.icon}</span>
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}

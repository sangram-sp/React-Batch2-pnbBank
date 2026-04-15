import React from 'react';
import { NavLink } from 'react-router-dom';
import { Gauge, FileText, QrCode, Languages, HelpCircle } from 'lucide-react';
import './Layout.css';
import pnbLogo from '../../assets/pnb.png';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Gauge },
    { path: '/reports', label: 'Transaction Reports', icon: FileText },
    { path: '/qr', label: 'QR Details', icon: QrCode },
    { path: '/language', label: 'Language Update', icon: Languages },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo-container">
        <img src={pnbLogo} alt="PNB Logo" style={{ height: '150px', objectFit: 'contain' }} />
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Icon size={18} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

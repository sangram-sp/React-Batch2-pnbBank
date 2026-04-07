import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, QrCode, Globe, HelpCircle } from 'lucide-react';
import './Layout.css';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/reports', label: 'Transaction Reports', icon: FileText },
    { path: '/qr', label: 'QR Details', icon: QrCode },
    { path: '/language', label: 'Language Update', icon: Globe },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo-container">
        <div className="pnb-logo-mock">
          <span>pnb</span>
        </div>
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
              <Icon strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

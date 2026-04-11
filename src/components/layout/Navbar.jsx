import React, { useState } from 'react';
import { login } from '../../config/authConfig';
import pnbLogo from '../../assets/pnb.png';
import { Search, Globe, Menu, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <img src={pnbLogo} alt="PNB Logo" className="modern-nav-logo" />
        </div>
        
        <div className={`navbar-center ${isMobileMenuOpen ? 'active' : ''}`}>
          <a href="#personal" className="nav-link">Personal</a>
          <a href="#business" className="nav-link">Corporate</a>
          <a href="#nri" className="nav-link">NRI</a>
          <a href="#digital" className="nav-link">Digital</a>
        </div>

        <div className="navbar-right">
          <div className="nav-icon-group">
            <button className="icon-btn" aria-label="Search">
              <Search size={20} />
            </button>
            <button className="icon-btn" aria-label="Language">
              <Globe size={20} />
              <span className="lang-text">EN</span>
            </button>
          </div>
          
          <button onClick={login} className="modern-btn-login">
            <Shield size={16} />
            <span>Secure Login</span>
          </button>

          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
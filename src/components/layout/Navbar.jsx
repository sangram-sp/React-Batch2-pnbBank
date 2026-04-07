import React from 'react';
import { login } from '../../config/authConfig';
import pnbLogo from '../../assets/pnb.png';
import '../../App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={pnbLogo} alt="PNB Logo" className="nav-logo" />
      <div className="nav-actions">
        <button onClick={login} className="btn-login">Login</button>
      </div>
    </nav>
  );
};

export default Navbar;
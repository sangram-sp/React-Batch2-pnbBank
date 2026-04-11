import React from 'react';
import { login } from '../../config/authConfig';
import { ShieldCheck, ArrowRight, Globe } from 'lucide-react';
import './UserVisual.css';

const UserVisual = () => {
  return (
    <section className="user-wrapper">
      <div className="user-bg-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
      </div>

      <div className="user-content">
        <div className="user-badge">
          <span></span> Online Banking Built for You
        </div>
        <h1 className="user-title">
          Modern Banking <br />
          for the <span className="text-highlight">Digital Era</span>
        </h1>
        <p className="user-description">
          Your trusted partner in banking since 1894. Experience secure, reliable, and lightning-fast digital banking designed for your modern lifestyle.
        </p>

        <div className="user-cta">
          <button onClick={login} className="btn-primary">
            Open Account <ArrowRight size={18} />
          </button>
          <button onClick={login} className="btn-secondary">
            Secure Login
          </button>
        </div>

        <div className="user-stats">
          <div className="stat-item">
            <h4>130+</h4>
            <p>Years of Trust</p>
          </div>
          <div className="stat-item">
            <h4>180M+</h4>
            <p>Global Customers</p>
          </div>
          <div className="stat-item">
            <p>Secure Banking <ShieldCheck size={16} strokeWidth={3} color="#10b981" style={{ display: 'inline', verticalAlign: 'text-bottom' }} /></p>
          </div>
        </div>
      </div>

      <div className="user-visual-image-only">
        <img 
          src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Credit Card" 
          className="credit-card-only-img"
        />
      </div>
    </section>
  );
};

export default UserVisual;
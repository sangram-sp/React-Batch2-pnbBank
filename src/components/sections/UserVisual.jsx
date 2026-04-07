import React from 'react';
import { login } from '../../config/authConfig';
import '../../App.css';

const UserVisual = () => {
  return (
    <section className="hero">
      <h1>Welcome to Punjab National Bank</h1>
      <p>Your trusted partner in banking since 1894. Secure, reliable, and always at your service.</p>
      <button onClick={login} className="btn-get-started">Get Started</button>
    </section>
  );
};

export default UserVisual;
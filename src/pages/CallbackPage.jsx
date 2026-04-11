import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback } from '../config/authConfig';

const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        await handleCallback();
        console.log("Login successful!");
        navigate('/dashboard'); // Redirect to Dashboard
      } catch (err) {
        console.error("Authentication failed:", err);
        navigate('/'); // Redirect home on error
      }
    };
    processAuth();
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', textAlign: 'center' }}>
      <h2 style={{ color: '#a01b44' }}>Verifying Login...</h2>
      <p>Please wait while we secure your PNB session.</p>
    </div>
  );
};

export default CallbackPage;
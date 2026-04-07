import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CallbackPage from './pages/CallbackPage'; // Create this file if missing
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/redirected" element={<CallbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
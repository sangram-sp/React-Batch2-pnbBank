import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CallbackPage from './pages/CallbackPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LanguageUpdate from './pages/LanguageUpdate';
import QRDetails from './pages/QRDetails';
import TransactionReports from './pages/TransactionReports';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/redirected" element={<CallbackPage />} />
        
        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/language" element={<LanguageUpdate />} />
          <Route path="/qr" element={<QRDetails />} />
          <Route path="/reports" element={<TransactionReports />} />
        </Route>
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
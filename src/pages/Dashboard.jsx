import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Banknote } from 'lucide-react';
import { getUser } from '../config/authConfig';
import { encryptBody, decryptResponse } from '../utils/crypto';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [vpas, setVpas] = useState([]);
  const [showVpaModal, setShowVpaModal] = useState(false);
  const [selectedVpa, setSelectedVpa] = useState('');
  const [activeVpa, setActiveVpa] = useState('');

  useEffect(() => {
    const fetchVPAs = async () => {
      try {
        const user = getUser();
        const token = sessionStorage.getItem('access_token');

        // Extract mobile number from token user info (preferred_username or user_name)
        const mobileNumber = user?.preferred_username || user?.user_name || '7574857003';

        const payload = { mobile_number: mobileNumber };

        // Encrypt the payload using crypto.js
        const encryptedPayload = encryptBody(payload);

        const response = await fetch('https://auth-dev-stage.iserveu.online/pnb/fetch/fetchById', {
          method: 'POST',
          headers: {
            'pass_key': 'QC62FQKXT2DQTO43LMWH5A44UKVPQ7LK5Y6HVHRQ3XTIKLDTB6HA',
            'Content-Type': 'application/json', // Keeping the Content-Type from original cURL
            'Authorization': token || ''
          },
          body: JSON.stringify({ RequestData: encryptedPayload }) // Post the request in encrypted format inside an object
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const jsonResponse = await response.json();

        if (!jsonResponse || !jsonResponse.ResponseData) {
          throw new Error('Response did not contain ResponseData field');
        }

        // Decrypt exclusively the value
        const decryptedData = decryptResponse(jsonResponse.ResponseData);

        // Check for success and map 'vpa_id' from the data array
        if (decryptedData && decryptedData.status === 0 && Array.isArray(decryptedData.data)) {
          const vpaList = decryptedData.data.map(item => item.vpa_id).filter(Boolean);

          if (vpaList.length > 0) {
            setVpas(vpaList);
          } else {
            throw new Error('No VPAs found in the array');
          }
        } else {
          throw new Error('Invalid or failed decrypted response format');
        }
      } catch (error) {
        console.error('Error fetching VPA details:', error);
        setVpas([]);
      } finally {
        setShowVpaModal(true);
        setLoading(false);
      }
    };

    fetchVPAs();
  }, []);

  const handleProceed = () => {
    if (selectedVpa) {
      setActiveVpa(selectedVpa);
      setShowVpaModal(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading Dashboard Data...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      <div className="dashboard-controls">
        <div className="vpa-id-selector">
          <span className="vpa-label">VPA ID :</span>
          <select
            className="vpa-select"
            value={activeVpa}
            onChange={(e) => setActiveVpa(e.target.value)}
          >
            {vpas.map((vpa, idx) => (
              <option key={idx} value={vpa}>{vpa}</option>
            ))}
          </select>
        </div>
        <select className="filter-dropdown" defaultValue="Today">
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="ThisWeek">This Week</option>
          <option value="ThisMonth">This Month</option>
        </select>
      </div>

      <div className="cards-container">
        {/* Transactions Card */}
        <div className="metric-card">
          <div className="card-left">
            <div className="card-icon transactions">
              <ArrowRightLeft size={24} />
            </div>
            <span className="card-label">Total No Of Transaction</span>
          </div>
          <div className="card-value">20.7K</div>
        </div>

        {/* Amount Card */}
        <div className="metric-card">
          <div className="card-left">
            <div className="card-icon amount">
              <Banknote size={24} />
            </div>
            <span className="card-label">Total Amount</span>
          </div>
          <div className="card-value">76,000 cr</div>
        </div>
      </div>

      {showVpaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">Select VPA</div>
            <div className="modal-body">
              <div className="modal-subtitle">Select a VPA to Proceed</div>
              <div className="vpa-list">
                {vpas.map((vpa, index) => (
                  <label key={index} className={`vpa-option ${selectedVpa === vpa ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="vpa"
                      value={vpa}
                      onChange={() => setSelectedVpa(vpa)}
                      checked={selectedVpa === vpa}
                    />
                    <span className="vpa-option-label">{vpa}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowVpaModal(false)}>Cancel</button>
              <button className="btn-proceed" onClick={handleProceed} disabled={!selectedVpa}>Proceed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

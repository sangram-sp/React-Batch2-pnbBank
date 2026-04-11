import React, { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../../config/authConfig';
import { encryptBody, decryptResponse } from '../../utils/crypto';
import './Layout.css';

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const navigate = useNavigate();
  const profileRef = useRef(null);
  const user = getUser();
  const userName = user?.name || "User";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleViewProfile = async () => {
    setIsProfileOpen(false); // Close dropdown
    const vpaId = sessionStorage.getItem('active_vpa');

    if (!vpaId) {
      alert("Please select a VPA from the dashboard first.");
      return;
    }

    try {
      setIsLoadingProfile(true);
      setShowProfileModal(true); // Show loader immediately
      setProfileData(null); // Clear old data

      const token = sessionStorage.getItem('access_token');
      const payload = { vpa_id: vpaId };
      const encryptedPayload = encryptBody(payload);

      const response = await fetch('https://auth-dev-stage.iserveu.online/pnb/fetch/fetchById', {
        method: 'POST',
        headers: {
          'pass_key': 'QC62FQKXT2DQTO43LMWH5A44UKVPQ7LK5Y6HVHRQ3XTIKLDTB6HA',
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({ RequestData: encryptedPayload })
      });

      if (!response.ok) throw new Error('Failed to fetch profile API');

      const jsonResponse = await response.json();
      if (!jsonResponse || !jsonResponse.ResponseData) throw new Error('Invalid profile response');

      const decryptedData = decryptResponse(jsonResponse.ResponseData);
      if (decryptedData && decryptedData.status === 0 && Array.isArray(decryptedData.data) && decryptedData.data.length > 0) {
        setProfileData(decryptedData.data[0]);
      } else {
        throw new Error('No profile data found in array');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileData(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Masking util
  const maskAccount = (acc) => {
    if (!acc) return 'N/A';
    if (acc.length <= 4) return acc;
    return `XXXXXX${acc.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-left">
        <Menu className="menu-icon" size={24} />
      </div>
      <div className="header-right">
        <div className="profile-container" ref={profileRef}>
          <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="user-avatar">
              <img src={`https://i.pravatar.cc/151?c=${userName}`} alt={userName} />
            </div>
            <span>{userName}</span>
          </div>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-item" onClick={handleViewProfile}>View Profile</div>
              <div className="profile-dropdown-item logout" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>

      {showProfileModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <div className="profile-modal-header">View Profile Details</div>

            <div className="profile-modal-body">
              {isLoadingProfile ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading Profile...</div>
              ) : profileData ? (
                <>
                  <div className="profile-section">
                    <div className="profile-section-title">Basic Information</div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Name</div>
                      <div className="profile-field-value">{profileData.merchant_name || 'N/A'}</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Phone</div>
                      <div className="profile-field-value">{profileData.merchant_mobile ? `+91 ${profileData.merchant_mobile}` : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-title">Device Information</div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Device Serial Number</div>
                      <div className="profile-field-value">{profileData.serial_number || 'N/A'}</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Linked Account Number</div>
                      <div className="profile-field-value">{maskAccount(profileData.merchant_account_no)}</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">UPI ID</div>
                      <div className="profile-field-value">{profileData.vpa_id || 'N/A'}</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">IFSC Code</div>
                      <div className="profile-field-value">{profileData.ifsc || 'N/A'}</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Device Model Name</div>
                      <div className="profile-field-value">N/A</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Device Mobile Number</div>
                      <div className="profile-field-value">{profileData.merchant_mobile ? `+91 ${profileData.merchant_mobile}` : 'N/A'}</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Network Type</div>
                      <div className="profile-field-value">{profileData.network_type || 'N/A'}</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Device Status</div>
                      <div className="profile-field-value">{profileData.device_status || 'N/A'}</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Battery Percentage</div>
                      <div className="profile-field-value">N/A</div>
                    </div>
                    <div className="profile-field-row">
                      <div className="profile-field-label">Network Strength</div>
                      <div className="profile-field-value">N/A</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#e51d45' }}>Failed to load profile data</div>
              )}
            </div>

            <div className="profile-modal-footer">
              <button className="btn-profile-close" onClick={() => setShowProfileModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { encryptBody, decryptResponse } from '../utils/crypto';
import './LanguageUpdate.css';

const fetchCurrentLanguageAPI = async (serialNumber, token) => {
  try {
    const langPayload = { serial_number: serialNumber };
    const encryptedLangPayload = encryptBody(langPayload);

    const langRes = await fetch(`https://auth-dev-stage.iserveu.online/pnb/isu_soundbox/user_api/current_language/${serialNumber}`, {
      method: 'POST',
      headers: {
        'pass_key': 'QC62FQKXT2DQTO43LMWH5A44UKVPQ7LK5Y6HVHRQ3XTIKLDTB6HA',
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
      body: JSON.stringify({ RequestData: encryptedLangPayload })
    });

    let finalLangRes = langRes;
    if (langRes.status === 405 || langRes.status === 400 || langRes.status === 404) {
      finalLangRes = await fetch(`https://auth-dev-stage.iserveu.online/pnb/isu_soundbox/user_api/current_language/${serialNumber}`, {
        method: 'GET',
        headers: {
          'pass_key': 'QC62FQKXT2DQTO43LMWH5A44UKVPQ7LK5Y6HVHRQ3XTIKLDTB6HA',
          'Content-Type': 'application/json',
          'Authorization': token || ''
        }
      });
    }

    if (finalLangRes.ok) {
      const langJson = await finalLangRes.json();
      if (langJson && langJson.ResponseData) {
        const decryptedLang = decryptResponse(langJson.ResponseData);
        return decryptedLang?.data?.language || decryptedLang?.data || decryptedLang?.language || 'English';
      } else if (langJson && langJson.data) {
        return langJson.data.language || langJson.data || 'English';
      }
    }
    return 'Not Found';
  } catch (err) {
    console.error("Failed to fetch language data:", err);
    return 'Error';
  }
};

const LanguageUpdate = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    vpaId: '',
    serialNumber: '',
    currentLanguage: '',
    languageUpdate: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const vpaId = sessionStorage.getItem('active_vpa');
        const token = sessionStorage.getItem('access_token');

        if (!vpaId) {
          throw new Error('No VPA ID selected. Please select a VPA from Dashboard first.');
        }

        //Fetch Profile Data to get Serial Number
        const profilePayload = { vpa_id: vpaId };
        const encryptedProfilePayload = encryptBody(profilePayload);

        const profileRes = await fetch('https://auth-dev-stage.iserveu.online/pnb/fetch/fetchById', {
          method: 'POST',
          headers: {
            'pass_key': 'QC62FQKXT2DQTO43LMWH5A44UKVPQ7LK5Y6HVHRQ3XTIKLDTB6HA',
            'Content-Type': 'application/json',
            'Authorization': token || ''
          },
          body: JSON.stringify({ RequestData: encryptedProfilePayload })
        });

        if (!profileRes.ok) throw new Error('Failed to fetch profile details');

        const profileJson = await profileRes.json();
        if (!profileJson || !profileJson.ResponseData) throw new Error('Invalid profile response structure');

        const decryptedProfile = decryptResponse(profileJson.ResponseData);
        let serialNumber = '';
        if (decryptedProfile && decryptedProfile.status === 0 && Array.isArray(decryptedProfile.data) && decryptedProfile.data.length > 0) {
          serialNumber = decryptedProfile.data[0].serial_number;
        }

        if (!serialNumber) {
          throw new Error('Device Serial Number not found for this VPA.');
        }

        //Fetch Current Language
        const fetchedLanguage = await fetchCurrentLanguageAPI(serialNumber, token);

        setFormData({
          vpaId: vpaId,
          serialNumber: serialNumber,
          currentLanguage: fetchedLanguage,
          languageUpdate: ''
        });

      } catch (err) {
        console.error(err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      setErrorMsg('');

      const payload = {
        tid: formData.serialNumber,
        update_language: formData.languageUpdate.toUpperCase()
      };

      const response = await fetch('https://api-dev-stage.iserveu.online/pnb/bank/lang/update_language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update language');
      }

      setFormData(prev => ({ ...prev, currentLanguage: 'Updating...' }));
      const token = sessionStorage.getItem('access_token');

      await new Promise(resolve => setTimeout(resolve, 800));
      const updatedLang = await fetchCurrentLanguageAPI(formData.serialNumber, token);

      setFormData(prev => ({ ...prev, currentLanguage: updatedLang, languageUpdate: '' }));
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading Language Information...</div>;
  }

  return (
    <div className="language-update-page">
      <h1 className="page-title">Language Update</h1>

      {errorMsg ? (
        <div className="error-message">{errorMsg}</div>
      ) : (
        <div className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label>VPA ID</label>
              <input type="text" value={formData.vpaId} disabled className="readonly-input" />
            </div>

            <div className="form-group">
              <label>Device Serial Number</label>
              <input type="text" value={formData.serialNumber} disabled className="readonly-input" />
            </div>

            <div className="form-group">
              <label>Current Language</label>
              <input type="text" value={formData.currentLanguage} disabled className="readonly-input" />
            </div>

            <div className="form-group">
              <label>Language Update</label>
              <select
                value={formData.languageUpdate}
                onChange={(e) => setFormData({ ...formData, languageUpdate: e.target.value })}
                className="select-input"
              >
                <option value="">Select Language Update</option>
                <option value="Odia">Odia</option>
                <option value="Tamil">Tamil</option>
                <option value="Bengali">Bengali</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
                <option value="English">English</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Assamese">Assamese</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Kannada">Kannada</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setFormData({ ...formData, languageUpdate: '' })}>Cancel</button>
            <button className="btn-update" onClick={handleUpdate} disabled={!formData.languageUpdate || updating}>
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <div className="success-modal-title">
              Language update request<br />Initiated Successfully
            </div>
            <div className="success-icon-container">
              <div className="success-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <button className="btn-modal-close" onClick={() => setShowSuccessModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageUpdate;

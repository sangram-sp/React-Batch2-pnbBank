import React, { useState, useEffect } from 'react';
import { encryptBody, decryptResponse } from '../utils/crypto';
import './LanguageUpdate.css';

const LanguageUpdate = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    vpaId: '',
    serialNumber: '',
    currentLanguage: '',
    languageUpdate: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

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

        // 1. Fetch Profile Data to get Serial Number
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

        // 2. Fetch Current Language
        let fetchedLanguage = 'Loading...';
        try {
          // As per "encrypt this data", we supply a post payload if necessary,
          // but we'll fulfill the provided cURL structure (GET fallback to POST)
          const langPayload = { serial_number: serialNumber };
          const encryptedLangPayload = encryptBody(langPayload);

          const langRes = await fetch(`https://auth-dev-stage.iserveu.online/pnb/isu_soundbox/user_api/current_language/${serialNumber}`, {
            method: 'POST', // Falling back to POST with RequestData as typical for this API suite
            headers: {
              'pass_key': 'QC62FQKXT2DQTO43LMWH5A44UKVPQ7LK5Y6HVHRQ3XTIKLDTB6HA',
              'Content-Type': 'application/json',
              'Authorization': token || ''
            },
            body: JSON.stringify({ RequestData: encryptedLangPayload })
          });

          // If the server explicitly wanted GET as written in curl, let's gracefully attempt standard GET fallback
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
               // Identify language struct
               fetchedLanguage = decryptedLang?.data?.language || decryptedLang?.data || decryptedLang?.language || 'English';
            } else if (langJson && langJson.data) {
               // Assuming unencrypted fallback
               fetchedLanguage = langJson.data.language || langJson.data || 'English';
            }
          } else {
             fetchedLanguage = 'Not Found';
          }
        } catch (err) {
           console.error("Failed to fetch language data:", err);
           fetchedLanguage = 'Error';
        }

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

  const handleUpdate = () => {
     // Handle the payload to trigger the update here later!
     console.log("Trigger update for language: " + formData.languageUpdate);
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
                onChange={(e) => setFormData({...formData, languageUpdate: e.target.value})}
                className="select-input"
              >
                <option value="">Select Language Update</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Odia">Odia</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-cancel">Cancel</button>
            <button className="btn-update" onClick={handleUpdate} disabled={!formData.languageUpdate}>Update</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageUpdate;

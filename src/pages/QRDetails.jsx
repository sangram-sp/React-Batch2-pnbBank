import React, { useState, useEffect, useRef } from 'react';
import { encryptBody, decryptResponse } from '../utils/crypto';
import { QRCodeSVG } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';
import pnbLogo from '../assets/pnb.png';
import upiLogo from '../assets/UPI-Logo.png';
import './QRDetails.css';

const QRDetails = () => {
  const [loading, setLoading] = useState(true);
  const [qrType, setQrType] = useState('Static');
  const [details, setDetails] = useState({
    qrString: '',
    merchantName: '',
    vpaId: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [amountInput, setAmountInput] = useState('');
  const [activeDynamicAmount, setActiveDynamicAmount] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(90);

  const qrCardRef = useRef(null);

  useEffect(() => {
    const fetchQRDetails = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const vpaId = sessionStorage.getItem('active_vpa');
        const token = sessionStorage.getItem('access_token');

        if (!vpaId) {
          throw new Error('No VPA selected. Please select a VPA from Dashboard first.');
        }

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
        if (!profileJson || !profileJson.ResponseData) throw new Error('Invalid response structure');

        const decryptedProfile = decryptResponse(profileJson.ResponseData);
        let profile = null;

        if (decryptedProfile && decryptedProfile.status === 0 && Array.isArray(decryptedProfile.data) && decryptedProfile.data.length > 0) {
          profile = decryptedProfile.data[0];
        }

        if (!profile) {
          throw new Error('Profile details not found for this VPA.');
        }

        setDetails({
          qrString: profile.qr_string || `upi://pay?pa=${vpaId}&pn=${profile.merchant_name || 'Merchant'}&cu=INR`,
          merchantName: profile.merchant_name || 'MERCHANT',
          vpaId: profile.vpa_id || vpaId
        });

      } catch (err) {
        console.error(err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQRDetails();
  }, []);

  useEffect(() => {
    let interval = null;
    if (qrType === 'Dynamic' && activeDynamicAmount && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds <= 0 && activeDynamicAmount) {
      setActiveDynamicAmount(''); // Reset when timer expires
      setAmountInput('');
    }
    return () => clearInterval(interval);
  }, [qrType, activeDynamicAmount, timerSeconds]);

  const handleGenerateDynamic = () => {
    if (amountInput && !isNaN(amountInput) && Number(amountInput) > 0) {
      setActiveDynamicAmount(amountInput);
      setTimerSeconds(90);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayQrString = () => {
    if (qrType === 'Dynamic' && activeDynamicAmount) {
      if (details.qrString.includes('?')) {
        return `${details.qrString}&am=${activeDynamicAmount}`;
      } else {
        return `${details.qrString}?am=${activeDynamicAmount}`;
      }
    }
    return details.qrString;
  };

  const handleDownloadQR = async () => {
    if (!qrCardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(qrCardRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `QR_${details.vpaId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate QR screenshot:", err);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading QR Details...</div>;
  }

  return (
    <div className="qr-details-page">
      <h1 className="page-title">QR Details</h1>

      {errorMsg ? (
        <div className="error-message">{errorMsg}</div>
      ) : (
        <div className="qr-content-wrapper">
          <div className="qr-type-selector">
            <div className="selector-title">Select The type of QR</div>
            <div className="radio-group">
              <label className={`radio-option ${qrType === 'Static' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="Static"
                  checked={qrType === 'Static'}
                  onChange={() => {
                    setQrType('Static');
                    setActiveDynamicAmount('');
                    setAmountInput('');
                  }}
                />
                <span>Static</span>
              </label>
              <label className={`radio-option ${qrType === 'Dynamic' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="Dynamic"
                  checked={qrType === 'Dynamic'}
                  onChange={() => setQrType('Dynamic')}
                />
                <span>Dynamic</span>
              </label>
            </div>

            {qrType === 'Dynamic' && (
              <div className="dynamic-inputs-section">
                <div className="dynamic-info">Enter an amount to instantly generate your dynamic QR code</div>
                <div className="dynamic-input-label">Amount to be collected</div>
                <div className="amount-input-group">
                  <input
                    type="text"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="Enter Amount"
                  />
                  <button onClick={handleGenerateDynamic} disabled={!amountInput}>Generate QR</button>
                </div>
              </div>
            )}
          </div>

          {(qrType === 'Static' || (qrType === 'Dynamic' && activeDynamicAmount)) && (
            <div className="qr-display-card-container">
              <div className="qr-printable-area" ref={qrCardRef}>
                {qrType === 'Static' ? (
                  <div className="qr-header-logo">
                    <img src={pnbLogo} alt="PNB Logo" style={{ height: '64px', width: 'auto', maxWidth: '100%', objectFit: 'contain', marginBottom: '12px', display: 'block' }} />
                    <div className="qr-top-vpa">UPI ID : {details.vpaId}</div>
                  </div>
                ) : (
                  <div className="dynamic-qr-header">
                    <div className="dynamic-amt-label">Amount to be Collected</div>
                    <div className="dynamic-amt-value">₹ {activeDynamicAmount}</div>
                  </div>
                )}

                <div className="merchant-name-plate">
                  <div className="merchant-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <span>{details.merchantName.toUpperCase()}</span>
                </div>

                <div className="qr-code-wrapper" style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '220px', margin: '0 auto 16px' }}>
                  {details.qrString ? (
                    <QRCodeSVG
                      value={getDisplayQrString()}
                      size={220}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      level={"M"}
                    />
                  ) : (
                    <div className="no-qr">No QR string available</div>
                  )}
                </div>

                <div className="qr-bottom-vpa">UPI ID : {details.vpaId}</div>

                {qrType === 'Dynamic' && (
                  <div className="dynamic-timer">
                    Valid till {formatTime(timerSeconds)}
                  </div>
                )}
              </div>

              {qrType === 'Static' && (
                <div className="button-boundary">
                  <button className="btn-download-qr" onClick={handleDownloadQR}>Download QR Code</button>
                </div>
              )}

              <div className="qr-branding" style={{ marginTop: '24px', width: '100%' }}>
                <div className="powered-by">POWERED BY</div>
                <img src={upiLogo} alt="Powered by UPI" style={{ height: '40px', objectFit: 'contain', marginTop: '4px' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRDetails;

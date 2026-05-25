import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Upload, FileText, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function VerifyReceipt({ backendUrl }) {
  const [jsonInput, setJsonInput] = useState('');
  const [fields, setFields] = useState({
    bookingId: '',
    hotelName: '',
    checkIn: '',
    checkOut: '',
    totalPrice: '',
    guestEmail: '',
    signature: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleJsonChange = (val) => {
    setJsonInput(val);
    if (!val.trim()) return;
    try {
      const parsed = JSON.parse(val);
      populateFields(parsed);
      setError('');
    } catch (e) {
      // Don't throw error immediately, they might still be typing
    }
  };

  const populateFields = (data) => {
    setFields({
      bookingId: data.bookingId || '',
      hotelName: data.hotelName || '',
      checkIn: data.checkIn || '',
      checkOut: data.checkOut || '',
      totalPrice: data.totalPrice !== undefined ? data.totalPrice.toString() : '',
      guestEmail: data.guestEmail || '',
      signature: data.signature || ''
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        setJsonInput(text);
        const parsed = JSON.parse(text);
        populateFields(parsed);
        setError('');
      } catch (err) {
        setError('Failed to parse file as valid JSON receipt.');
      }
    };
    reader.readAsText(file);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setVerificationResult(null);
    setLoading(true);

    const { bookingId, hotelName, checkIn, checkOut, totalPrice, guestEmail, signature } = fields;

    if (!bookingId || !hotelName || !checkIn || !checkOut || !totalPrice || !guestEmail || !signature) {
      setError('All fields are required for verification. Upload a receipt or enter details manually.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/bookings/verify-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: bookingId.trim(),
          hotelName: hotelName.trim(),
          checkIn: checkIn.trim(),
          checkOut: checkOut.trim(),
          totalPrice: parseFloat(totalPrice),
          guestEmail: guestEmail.trim(),
          signature: signature.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setVerificationResult({
          valid: data.valid,
          message: data.message || data.error,
          details: { ...fields }
        });
        if (data.valid) {
          setSuccess('Verification Successful!');
        } else {
          setError(data.error || 'Verification Failed.');
        }
      } else {
        setVerificationResult({
          valid: false,
          message: data.error || 'Server error verifying receipt.'
        });
        setError(data.error || 'Verification failed.');
      }
    } catch (err) {
      setError('Network error. Failed to reach the validation server.');
      setVerificationResult({
        valid: false,
        message: 'Could not contact verification service.'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setJsonInput('');
    setFields({
      bookingId: '',
      hotelName: '',
      checkIn: '',
      checkOut: '',
      totalPrice: '',
      guestEmail: '',
      signature: ''
    });
    setError('');
    setSuccess('');
    setVerificationResult(null);
  };

  return (
    <div className="main-content" style={{ paddingTop: '110px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="section-title">Cryptographic Receipt Verification</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            LuxeStay receipts are cryptographically signed using RSA-2048 keys. 
            You can verify any receipt JSON file's authenticity and check for tampering.
          </p>
        </div>

        <div className="booking-grid">
          {/* Left panel: verification input options */}
          <div className="booking-form-card glass">
            <h3 className="form-section-title">1. Upload or Paste Receipt</h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="file-upload">Upload Receipt File (.json)</label>
              <div style={{
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-color 0.2s'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      setJsonInput(event.target.result);
                      populateFields(JSON.parse(event.target.result));
                      setError('');
                    } catch (err) {
                      setError('Failed to parse file as valid JSON receipt.');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  Drag & drop receipt JSON here or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports LuxeStay receipt JSON files
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="json-paste">Or Paste Receipt JSON</label>
              <textarea
                id="json-paste"
                className="input-field"
                rows="5"
                placeholder='{ "bookingId": "BK-...", "signature": "..." }'
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            <h3 className="form-section-title" style={{ marginTop: '30px' }}>2. Receipt Parameters (Editable to Test Tampering)</h3>
            <form onSubmit={handleVerify}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-bookingId">Booking ID</label>
                  <input
                    type="text"
                    id="field-bookingId"
                    name="bookingId"
                    className="input-field"
                    value={fields.bookingId}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-hotelName">Hotel Name</label>
                  <input
                    type="text"
                    id="field-hotelName"
                    name="hotelName"
                    className="input-field"
                    value={fields.hotelName}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-checkIn">Check-In Date</label>
                  <input
                    type="date"
                    id="field-checkIn"
                    name="checkIn"
                    className="input-field"
                    value={fields.checkIn}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-checkOut">Check-Out Date</label>
                  <input
                    type="date"
                    id="field-checkOut"
                    name="checkOut"
                    className="input-field"
                    value={fields.checkOut}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-totalPrice">Total Price (₹)</label>
                  <input
                    type="number"
                    id="field-totalPrice"
                    name="totalPrice"
                    className="input-field"
                    value={fields.totalPrice}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-guestEmail">Guest Email</label>
                  <input
                    type="email"
                    id="field-guestEmail"
                    name="guestEmail"
                    className="input-field"
                    value={fields.guestEmail}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="field-signature">RSA-2048 Digital Signature</label>
                <textarea
                  id="field-signature"
                  name="signature"
                  className="input-field"
                  rows="3"
                  value={fields.signature}
                  onChange={handleFieldChange}
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                <button type="submit" className="btn-submit" style={{ flex: 2 }} disabled={loading}>
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Verify Signature
                </button>
                <button type="button" onClick={clearForm} className="btn-calc" style={{ flex: 1, marginTop: 0 }}>
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Right panel: results */}
          <div className="price-summary-card glass">
            <h3 className="summary-title">Verification Results</h3>
            
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--danger)',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>Verification Error</strong>
                  {error}
                </div>
              </div>
            )}

            {!verificationResult && !error && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
                <p>No receipt uploaded yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                  Upload a <code>.json</code> receipt file or paste it to run integrity checks.
                </p>
              </div>
            )}

            {verificationResult && (
              <div className="animate-fadeIn">
                <div style={{
                  background: verificationResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${verificationResult.valid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  color: verificationResult.valid ? 'var(--success)' : 'var(--danger)',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '25px',
                  textAlign: 'center'
                }}>
                  {verificationResult.valid ? (
                    <>
                      <CheckCircle size={40} style={{ margin: '0 auto 10px', color: 'var(--success)' }} />
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '5px' }}>Receipt Genuine</h4>
                      <p style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{verificationResult.message}</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={40} style={{ margin: '0 auto 10px', color: 'var(--danger)' }} />
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '5px' }}>TAMPER DETECTED</h4>
                      <p style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{verificationResult.message}</p>
                    </>
                  )}
                </div>

                {verificationResult.valid && verificationResult.details && (
                  <div>
                    <h4 className="form-section-title" style={{ fontSize: '1rem', marginBottom: '15px' }}>Validated Receipt Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="summary-item">
                        <span>Booking ID</span>
                        <strong style={{ color: 'white' }}>{verificationResult.details.bookingId}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Hotel Name</span>
                        <strong style={{ color: 'white' }}>{verificationResult.details.hotelName}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Check-In</span>
                        <strong style={{ color: 'white' }}>{verificationResult.details.checkIn}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Check-Out</span>
                        <strong style={{ color: 'white' }}>{verificationResult.details.checkOut}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Total Price</span>
                        <strong style={{ color: 'var(--gold)' }}>₹{parseFloat(verificationResult.details.totalPrice).toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Guest Email</span>
                        <strong style={{ color: 'white' }}>{verificationResult.details.guestEmail}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

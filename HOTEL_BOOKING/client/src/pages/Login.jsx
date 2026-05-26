import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import Captcha from '../components/Captcha';

export default function Login({ onLoginSuccess, backendUrl }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  
  // MFA states
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    setCaptchaText(''); // Reset entry
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          captchaText,
          captchaToken
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (data.mfaRequired) {
        setMfaRequired(true);
        setMfaToken(data.mfaToken);
        setSuccessMsg(data.message);
      }
    } catch (err) {
      setError('Connection refused. Is backend server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mfaToken,
          otp
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'OTP verification failed');
        return;
      }

      // Success
      localStorage.setItem('luxestay_token', data.token);
      localStorage.setItem('luxestay_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('An error occurred during MFA verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass animate-scaleIn">
        
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '15px' }}>
            <Shield size={28} />
          </div>
          <h2 className="auth-title">LuxeStay Security Access</h2>
          <p className="auth-subtitle">
            {mfaRequired ? 'Multi-Factor Verification' : 'Authenticate to manage your luxury stay'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
            {successMsg}
          </div>
        )}

        {!mfaRequired ? (
          <form onSubmit={handleCredentialsSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="email@example.com" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="input-field" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Security CAPTCHA Check</label>
              <Captcha onCaptchaChange={handleCaptchaChange} backendUrl={backendUrl} />
              <input 
                type="text" 
                className="input-field" 
                style={{ marginTop: '10px' }} 
                placeholder="Enter CAPTCHA Code" 
                required 
                value={captchaText}
                onChange={e => setCaptchaText(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              Authenticate Credentials
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label className="form-label">6-Digit verification code</label>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  maxLength="6"
                  className="input-field" 
                  style={{ paddingLeft: '42px', letterSpacing: '8px', fontSize: '1.2rem', textAlign: 'center', fontWeight: 'bold' }} 
                  placeholder="000000" 
                  required 
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
                Please check your email inbox for the 6-digit verification code.
              </p>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              Confirm Verification Code
            </button>

            <button 
              type="button" 
              onClick={() => {
                setMfaRequired(false);
                setSuccessMsg('');
                setOtp('');
              }}
              className="btn-calc"
              style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
            >
              Go Back
            </button>
          </form>
        )}

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
}

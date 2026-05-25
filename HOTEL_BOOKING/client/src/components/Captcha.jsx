import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function Captcha({ onCaptchaChange, backendUrl }) {
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/captcha`);
      if (res.ok) {
        const data = await res.json();
        setCaptchaSvg(data.svg);
        onCaptchaChange(data.token);
      } else {
        console.error('Failed to load CAPTCHA');
      }
    } catch (err) {
      console.error('Error fetching CAPTCHA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <div className="captcha-container">
      {captchaSvg ? (
        <div 
          className="captcha-image" 
          dangerouslySetInnerHTML={{ __html: captchaSvg }} 
        />
      ) : (
        <div className="captcha-image" style={{ width: '150px', background: '#121824', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
          Loading...
        </div>
      )}
      
      <button 
        type="button" 
        onClick={fetchCaptcha} 
        className="btn-refresh-captcha"
        title="Refresh CAPTCHA"
        disabled={loading}
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}

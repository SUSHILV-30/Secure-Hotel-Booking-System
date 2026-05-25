import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Shield, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Register({ backendUrl }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('User');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate; // Note: We will use useNavigate hook inside the component correctly

  const routerNavigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccess(data.message);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('User');
      
      setTimeout(() => {
        routerNavigate('/login');
      }, 2000);
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass animate-scaleIn">
        
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '15px' }}>
            <UserPlus size={28} />
          </div>
          <h2 className="auth-title">Create LuxeStay Account</h2>
          <p className="auth-subtitle">Join the secure booking system</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="John Doe" 
              required 
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@example.com" 
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
                placeholder="Min 6 characters" 
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
            <label className="form-label">System Role Designation (Demo Access)</label>
            <select 
              className="input-field" 
              value={role} 
              onChange={e => setRole(e.target.value)}
              style={{ background: '#0f172a' }}
            >
              <option value="User">User (Customer Account)</option>
              <option value="Staff">Staff (Management Account)</option>
              <option value="Admin">Admin (Full Control Audit Account)</option>
            </select>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            Register Security Credentials
          </button>
        </form>

        <div className="auth-footer">
          Already have credentials? <RouterLink to="/login" className="auth-link">Login</RouterLink>
        </div>
      </div>
    </div>
  );
}

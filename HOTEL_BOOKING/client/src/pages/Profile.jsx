import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Calendar, FileText, Image, CheckCircle, Loader2, Key } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100'
];

export default function Profile({ backendUrl, user, onProfileUpdate }) {
  const navigate = useNavigate();

  // Load existing details, default to empty strings if not present
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Handle local file upload (base64 conversion)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate completion percentage
  const getCompletionStats = () => {
    const fields = [
      { name: 'Full Name', check: () => name.trim().length > 0 },
      { name: 'Email Address', check: () => email.trim().length > 0 },
      { name: 'Phone Number', check: () => phone.trim().length > 0 },
      { name: 'Address Details', check: () => address.trim().length > 0 },
      { name: 'Date of Birth', check: () => dob.trim().length > 0 },
      { name: 'Gender', check: () => gender.trim().length > 0 },
      { name: 'Bio Description', check: () => bio.trim().length > 0 },
      { name: 'Profile Avatar', check: () => avatar.trim().length > 0 }
    ];

    const completed = fields.filter(f => f.check());
    const remaining = fields.filter(f => !f.check());
    const score = Math.round((completed.length / fields.length) * 100);

    return { score, remaining };
  };

  const { score, remaining } = getCompletionStats();

  const getMeterColor = (val) => {
    if (val < 40) return 'var(--danger)';
    if (val < 75) return 'var(--gold)';
    return 'var(--success)';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('luxestay_token');
      const payload = {
        name,
        phone,
        address,
        dob,
        gender,
        bio,
        avatar
      };

      // Only send password if it was entered
      if (password.trim()) {
        payload.password = password;
      }

      const res = await fetch(`${backendUrl}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess('Profile updated successfully!');
      setPassword(''); // clear password box
      onProfileUpdate(data.user);

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      setError('Connection failed. Please verify the backend service is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '100px', maxWidth: '900px' }}>
      <h2 className="section-title">Manage Your LuxeStay Profile</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '25px', alignItems: 'start', minHeight: '600px' }}>
        
        {/* Main Edit Form */}
        <div className="glass" style={{ padding: '25px', borderRadius: '15px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)' }}>
            <User size={18} /> Personal Details
          </h3>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={email} 
                  disabled 
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
              <div className="form-group">
                <label className="form-label">Change Password (leave empty to keep current)</label>
                <div style={{ position: 'relative' }}>
                  <Key size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    className="input-field" 
                    style={{ paddingLeft: '38px' }} 
                    placeholder="New Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '38px' }} 
                    placeholder="+91 99999 99999"
                    value={phone}
                    onChange={e => setPhone(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="date" 
                    className="input-field" 
                    style={{ paddingLeft: '38px' }} 
                    value={dob}
                    onChange={e => setDob(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gender Identity</label>
                <select 
                  className="input-field" 
                  value={gender} 
                  onChange={e => setGender(e.target.value)}
                  style={{ background: '#121824' }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="form-label">Postal / Billing Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <textarea 
                  className="input-field" 
                  style={{ paddingLeft: '38px', minHeight: '80px', resize: 'vertical' }} 
                  placeholder="Street, City, State, Country, Postal Code"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="form-label">Tell us about yourself (Bio)</label>
              <div style={{ position: 'relative' }}>
                <FileText size={14} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <textarea 
                  className="input-field" 
                  style={{ paddingLeft: '38px', minHeight: '80px', resize: 'vertical' }} 
                  placeholder="Your interests, traveler profile, or notes..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-calc" style={{ width: '100%', marginTop: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Save Profile Changes
            </button>

          </form>
        </div>

        {/* Sidebar: Profile Completeness Meter & Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Avatar Panel */}
          <div className="glass" style={{ padding: '25px', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--gold)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Image size={16} /> Profile Picture
            </h3>
            
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto 20px', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#121824', boxShadow: '0 0 15px rgba(212, 168, 83, 0.2)' }}>
              {avatar ? (
                <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={45} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>

            {/* Custom Image Upload */}
            <label style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px dashed var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s', width: '100%' }} className="hero-cta-btn">
              Upload Custom Image
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>

            {/* Presets Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)', margin: '0 10px' }} />
              <span>OR SELECT PRESET</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)', margin: '0 10px' }} />
            </div>

            {/* Preset Avatars Grid */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {PRESET_AVATARS.map((url, i) => (
                <div 
                  key={i}
                  onClick={() => setAvatar(url)}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', border: avatar === url ? '2px solid var(--gold)' : '1px solid var(--border-color)', overflow: 'hidden', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img src={url} alt={`Preset ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            {avatar && (
              <button 
                type="button" 
                onClick={() => setAvatar('')}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', marginTop: '15px', textDecoration: 'underline' }}
              >
                Remove Picture
              </button>
            )}

          </div>

          {/* Completeness Meter */}
          <div className="glass" style={{ padding: '25px', borderRadius: '15px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--gold)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚡ Profile Completeness
            </h3>

            {/* Dating App Style Meter */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getMeterColor(score), textShadow: `0 0 10px ${getMeterColor(score)}40` }}>{score}%</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complete</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ width: `${score}%`, height: '100%', background: `linear-gradient(90deg, var(--primary) 0%, ${getMeterColor(score)} 100%)`, borderRadius: '4px', transition: 'width 0.4s ease-out' }} />
            </div>

            {/* List of remaining fields */}
            {remaining.length > 0 ? (
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-light)' }}>Next steps to reach 100%:</p>
                <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {remaining.slice(0, 3).map((field, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold)' }} />
                      Fill out <strong>{field.name}</strong>
                    </li>
                  ))}
                  {remaining.length > 3 && (
                    <li style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '13px' }}>
                      + {remaining.length - 3} more details
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.8rem' }}>
                <CheckCircle size={14} />
                <span>Your profile is fully complete! Excellent.</span>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

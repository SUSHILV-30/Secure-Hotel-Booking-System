import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Shield, LogOut, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'Admin') return 'role-badge admin';
    if (role === 'Staff') return 'role-badge staff';
    return 'role-badge';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Home size={18} strokeWidth={2.5} />
          </div>
          <span>LuxeStay</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/verify-receipt" className={`nav-link ${location.pathname === '/verify-receipt' ? 'active' : ''}`}>
              Verify Receipt
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                Dashboard
              </Link>
            </li>
          )}

          {user ? (
            <li className="nav-links" style={{ gap: '15px', marginLeft: '10px' }}>
              <span className={getRoleBadgeClass(user.role)}>
                {user.role}
              </span>
              <Link 
                to="/profile" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#f8fafc', textDecoration: 'none', cursor: 'pointer' }}
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold)' }} />
                ) : (
                  <User size={14} />
                )}
                {user.name}
              </Link>
              <button 
                onClick={handleLogoutClick} 
                className="btn-nav btn-nav-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'transparent' }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </li>
          ) : (
            <li className="nav-links" style={{ gap: '12px', marginLeft: '10px' }}>
              <Link to="/login" className="btn-nav btn-nav-outline">
                Login
              </Link>
              <Link to="/register" className="btn-nav btn-nav-primary">
                Register
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

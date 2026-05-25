import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import VerifyReceipt from './pages/VerifyReceipt';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  const backendUrl = 'http://localhost:3000';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('luxestay_user');
    const token = localStorage.getItem('luxestay_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('luxestay_user');
    localStorage.removeItem('luxestay_token');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-dark)' }}>
        <div style={{ color: 'var(--text-light)', fontSize: '1.2rem', fontFamily: 'var(--font-sans)' }}>Loading LuxeStay...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={<Home backendUrl={backendUrl} />} />
          
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login backendUrl={backendUrl} onLoginSuccess={handleLoginSuccess} />
            } 
          />
          
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Register backendUrl={backendUrl} />
            } 
          />
          
          <Route 
            path="/booking" 
            element={
              <PrivateRoute user={user} allowedRoles={['User']}>
                <Booking backendUrl={backendUrl} user={user} />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute user={user}>
                <Dashboard backendUrl={backendUrl} user={user} />
              </PrivateRoute>
            } 
          />
          
          <Route path="/verify-receipt" element={<VerifyReceipt backendUrl={backendUrl} />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <footer style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(4, 8, 20, 0.9)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <p>© {new Date().getFullYear()} LuxeStay Premium Booking Platform. All Rights Reserved.</p>
          <p style={{ marginTop: '5px', fontSize: '0.75rem', opacity: 0.6 }}>
            Secured using end-to-end AES-256-CBC and RSA-2048 Cryptographic Signatures.
          </p>
        </footer>
      </div>
    </Router>
  );
}

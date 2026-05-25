import React, { useState, useEffect } from 'react';
import { Shield, Eye, CheckCircle, AlertTriangle, Key, Users, BookOpen, FileText } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';

export default function Dashboard({ user, backendUrl }) {
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, users, logs
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Signature verify status
  const [verificationResults, setVerificationResults] = useState({}); // { bookingId: { loading, valid, msg } }

  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    const token = localStorage.getItem('luxestay_token');
    
    try {
      // 1. Fetch Bookings (available to all logged in roles)
      const bookRes = await fetch(`${backendUrl}/api/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookings(bookData);
      } else {
        setErrorMsg('Failed to load reservation records.');
      }

      // 2. Fetch Admin Data if Admin
      if (user.role === 'Admin') {
        const usersRes = await fetch(`${backendUrl}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }

        const logsRes = await fetch(`${backendUrl}/api/admin/logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData);
        }
      }
    } catch (err) {
      setErrorMsg('Failed to establish contact with backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, activeTab]);

  // Action: Verify Signature (Staff / Admin)
  const verifyReceiptSignature = async (booking) => {
    setVerificationResults(prev => ({
      ...prev,
      [booking.bookingId]: { loading: true }
    }));

    try {
      const res = await fetch(`${backendUrl}/api/bookings/verify-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          hotelName: booking.hotelName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          totalPrice: booking.totalPrice,
          guestEmail: booking.guestEmail,
          signature: booking.signature
        })
      });

      const data = await res.json();
      
      setVerificationResults(prev => ({
        ...prev,
        [booking.bookingId]: {
          loading: false,
          valid: data.valid,
          msg: data.valid ? data.message : (data.error || 'Signature check failed!')
        }
      }));
    } catch (err) {
      setVerificationResults(prev => ({
        ...prev,
        [booking.bookingId]: {
          loading: false,
          valid: false,
          msg: 'Verification endpoint error.'
        }
      }));
    }
  };

  // Action: Update User Role (Admin only)
  const handleRoleChange = async (email, newRole) => {
    const token = localStorage.getItem('luxestay_token');
    try {
      const res = await fetch(`${backendUrl}/api/admin/users/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role: newRole })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to update role');
      }
    } catch (err) {
      alert('Error updating role.');
    }
  };

  const handleOpenReceipt = (booking) => {
    // Reconstruct receipt structure expected by Modal
    setSelectedReceipt({
      bookingId: booking.bookingId,
      hotelName: booking.hotelName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      guestAddress: booking.guestAddress,
      signature: booking.signature,
      qrCode: booking.qrCode,
      bookingDate: booking.bookingDate
    });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
          Retrieving secure dashboard metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="main-content dashboard-page">
      <div className="container">
        
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h2 className="dashboard-title">{user.role} Dashboard</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Logged in as <strong style={{ color: 'white' }}>{user.name}</strong>
            </p>
          </div>
          <span className={`role-badge ${user.role.toLowerCase()}`}>
            {user.role} Account
          </span>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '25px' }}>
            {errorMsg}
          </div>
        )}

        {/* Admin Tabs */}
        {user.role === 'Admin' && (
          <div className="tab-container">
            <button 
              className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <BookOpen size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Bookings ({bookings.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              System Users ({users.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <FileText size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Security Audit Logs ({logs.length})
            </button>
          </div>
        )}

        {/* Tab 1: Bookings (Rendered differently for User, Staff, Admin) */}
        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 ? (
              <div className="glass" style={{ padding: '40px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No hotel bookings recorded in system database.
              </div>
            ) : (
              <div className="table-container glass">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Hotel</th>
                      <th>Stay Dates</th>
                      <th>Amount</th>
                      {user.role !== 'User' && <th>Guest Name</th>}
                      {user.role !== 'User' && <th>Guest Contact</th>}
                      <th>Integrity status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const verifyInfo = verificationResults[booking.bookingId];
                      return (
                        <tr key={booking.bookingId}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--primary)' }}>
                            {booking.bookingId}
                          </td>
                          <td>
                            <strong style={{ color: 'white' }}>{booking.hotelName}</strong>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>In: {booking.checkIn}</div>
                            <div style={{ fontSize: '0.85rem' }}>Out: {booking.checkOut}</div>
                          </td>
                          <td style={{ fontWeight: '600', color: 'var(--gold)' }}>
                            ₹{booking.totalPrice.toLocaleString('en-IN')}
                          </td>
                          
                          {user.role !== 'User' && (
                            <td>
                              <div>{booking.guestName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                {booking.guestAddress}
                              </div>
                            </td>
                          )}

                          {user.role !== 'User' && (
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>{booking.guestEmail}</div>
                              <div style={{ fontSize: '0.85rem' }}>{booking.guestPhone}</div>
                            </td>
                          )}

                          <td>
                            {user.role === 'User' ? (
                              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                <CheckCircle size={14} /> Secured (AES-256)
                              </span>
                            ) : (
                              <div>
                                {!verifyInfo ? (
                                  <button 
                                    onClick={() => verifyReceiptSignature(booking)}
                                    className="btn-action"
                                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                  >
                                    Verify Signature
                                  </button>
                                ) : verifyInfo.loading ? (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verifying...</span>
                                ) : verifyInfo.valid ? (
                                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                    <CheckCircle size={14} /> Valid Signature
                                  </span>
                                ) : (
                                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                    <AlertTriangle size={14} /> TAMPERED
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td>
                            <button 
                              onClick={() => handleOpenReceipt(booking)}
                              className="btn-action"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Eye size={12} /> Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Users (Admin only) */}
        {user.role === 'Admin' && activeTab === 'users' && (
          <div className="table-container glass animate-fadeIn">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created Date</th>
                  <th>Active Role</th>
                  <th>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.id}</td>
                    <td><strong style={{ color: 'white' }}>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`role-badge ${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="input-field"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#0f172a', width: 'auto' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.email, e.target.value)}
                        disabled={u.email.toLowerCase() === user.email.toLowerCase()}
                      >
                        <option value="User">User</option>
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Logs (Admin only) */}
        {user.role === 'Admin' && activeTab === 'logs' && (
          <div className="table-container glass animate-fadeIn">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>User Context</th>
                  <th>Detail Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: '600', 
                        fontSize: '0.8rem',
                        color: log.action.includes('FAIL') || log.action.includes('WARNING') ? '#f87171' : '#34d399',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.03)'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{log.userEmail}</td>
                    <td style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <ReceiptModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        receipt={selectedReceipt} 
      />
    </div>
  );
}

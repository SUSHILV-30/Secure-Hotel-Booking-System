import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Shield, CreditCard, ChevronLeft, Loader2 } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';

export default function Booking({ user, backendUrl }) {
  const [searchParams] = useSearchParams();
  const hotelName = searchParams.get('hotel') || 'Luxury Resort';
  const hotelPrice = parseInt(searchParams.get('price')) || 1000;
  const navigate = useNavigate();

  // Form Fields
  const [guestName, setGuestName] = useState(user ? user.name : '');
  const [guestEmail, setGuestEmail] = useState(user ? user.email : '');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestStreet, setGuestStreet] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestPostalCode, setGuestPostalCode] = useState('');
  const [guestCountry, setGuestCountry] = useState('India');
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [roomSize, setRoomSize] = useState('1');
  const [bedding, setBedding] = useState('1'); // 1 = Single Bed (0 extra), 2 = Double Bed (20 extra per night)
  const [description, setDescription] = useState('');

  // UI / Logic States
  const [fieldErrors, setFieldErrors] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [daysCount, setDaysCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modal States
  const [receipt, setReceipt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Auto calculate when dates or dropdown values change
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diffTime = outDate - inDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setDaysCount(diffDays);
        const bedCharge = parseInt(bedding) === 2 ? 20 : 0;
        const total = (hotelPrice + bedCharge) * diffDays + (100 * parseInt(adults)) + (50 * parseInt(children));
        setCalculatedPrice(total);
      } else {
        setDaysCount(0);
        setCalculatedPrice(0);
      }
    } else {
      setDaysCount(0);
      setCalculatedPrice(0);
    }
  }, [checkIn, checkOut, adults, children, bedding]);

  const validate = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!guestName.trim()) errors.guestName = 'Name is required';
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!guestEmail.trim()) {
      errors.guestEmail = 'Email is required';
    } else if (!emailPattern.test(guestEmail)) {
      errors.guestEmail = 'Provide a valid email address';
    }

    const cleanPhone = guestPhone.replace(/[\s\-\(\)]/g, '');
    if (!guestPhone.trim()) {
      errors.guestPhone = 'Phone number is required';
    } else if (cleanPhone.length < 10 || !/^\+?\d+$/.test(cleanPhone)) {
      errors.guestPhone = 'Provide a valid phone number (10+ digits)';
    }

    if (!checkIn) {
      errors.checkIn = 'Check-in date is required';
    } else {
      const inDate = new Date(checkIn);
      if (inDate <= today) {
        errors.checkIn = 'Check-in must be in the future';
      }
    }

    if (!checkOut) {
      errors.checkOut = 'Check-out date is required';
    } else if (checkIn) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      if (outDate <= inDate) {
        errors.checkOut = 'Check-out must be after check-in';
      }
    }

    if (!guestStreet.trim()) errors.guestStreet = 'Street address is required';
    if (!guestCity.trim()) errors.guestCity = 'City is required';
    if (!guestPostalCode.trim()) errors.guestPostalCode = 'Postal code is required';
    if (!guestCountry.trim()) errors.guestCountry = 'Country is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!validate()) return;
    
    setSubmitting(true);
    const token = localStorage.getItem('luxestay_token');

    try {
      const res = await fetch(`${backendUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guestName,
          guestEmail,
          guestPhone,
          guestStreet,
          guestCity,
          guestPostalCode,
          guestCountry,
          hotelName,
          checkIn,
          checkOut,
          numAdults: parseInt(adults),
          numChildren: parseInt(children),
          roomSize: parseInt(roomSize),
          bedding: parseInt(bedding),
          description,
          clientCalculatedPrice: calculatedPrice
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit booking');
        return;
      }

      setReceipt(data.receipt);
      setModalOpen(true);
    } catch (err) {
      setErrorMsg('Network error. Unable to secure your booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        
        <div style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
            <ChevronLeft size={16} /> Back to destinations
          </Link>
        </div>

        <div className="booking-grid">
          
          {/* Booking Form Card */}
          <div className="booking-form-card glass">
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '25px' }}>Hotel Reservation Form</h2>
            
            {errorMsg && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              
              {/* Guest Details */}
              <div className="form-section-title">Guest Contact Info</div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={guestName} 
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="John Doe" 
                />
                {fieldErrors.guestName && <span className="field-error">{fieldErrors.guestName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={guestEmail} 
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="john@example.com" 
                  />
                  {fieldErrors.guestEmail && <span className="field-error">{fieldErrors.guestEmail}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={guestPhone} 
                    onChange={e => setGuestPhone(e.target.value)}
                    placeholder="10-digit number" 
                  />
                  {fieldErrors.guestPhone && <span className="field-error">{fieldErrors.guestPhone}</span>}
                </div>
              </div>

              {/* Address Details */}
              <div className="form-section-title">Billing Address</div>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={guestStreet} 
                  onChange={e => setGuestStreet(e.target.value)}
                  placeholder="123 Luxury Avenue" 
                />
                {fieldErrors.guestStreet && <span className="field-error">{fieldErrors.guestStreet}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={guestCity} 
                    onChange={e => setGuestCity(e.target.value)}
                    placeholder="Shimla" 
                  />
                  {fieldErrors.guestCity && <span className="field-error">{fieldErrors.guestCity}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Postal / Zip Code</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={guestPostalCode} 
                    onChange={e => setGuestPostalCode(e.target.value)}
                    placeholder="171001" 
                  />
                  {fieldErrors.guestPostalCode && <span className="field-error">{fieldErrors.guestPostalCode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={guestCountry} 
                  onChange={e => setGuestCountry(e.target.value)}
                  placeholder="India" 
                />
                {fieldErrors.guestCountry && <span className="field-error">{fieldErrors.guestCountry}</span>}
              </div>

              {/* Booking Details */}
              <div className="form-section-title">Stay Specifications</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Check-In Date</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={checkIn} 
                    onChange={e => setCheckIn(e.target.value)}
                  />
                  {fieldErrors.checkIn && <span className="field-error">{fieldErrors.checkIn}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Check-Out Date</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={checkOut} 
                    onChange={e => setCheckOut(e.target.value)}
                  />
                  {fieldErrors.checkOut && <span className="field-error">{fieldErrors.checkOut}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Adults</label>
                  <select className="input-field" style={{ background: '#0f172a' }} value={adults} onChange={e => setAdults(e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Children</label>
                  <select className="input-field" style={{ background: '#0f172a' }} value={children} onChange={e => setChildren(e.target.value)}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rooms</label>
                  <select className="input-field" style={{ background: '#0f172a' }} value={roomSize} onChange={e => setRoomSize(e.target.value)}>
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bedding Option</label>
                  <select className="input-field" style={{ background: '#0f172a' }} value={bedding} onChange={e => setBedding(e.target.value)}>
                    <option value="1">Single Bed (Default)</option>
                    <option value="2">Double Bed (+₹20 / night)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Needs or Comments</label>
                <textarea 
                  rows="4" 
                  className="input-field" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe special arrangements, cots, extra beds, dietary requests..."
                />
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
                Secure & Book Stay
              </button>

            </form>
          </div>

          {/* Pricing Panel */}
          <div className="price-summary-card glass">
            <h3 className="summary-title">Reservation Summary</h3>
            <div className="summary-item">
              <span>Hotel</span>
              <span style={{ color: 'white', fontWeight: '500' }}>{hotelName}</span>
            </div>
            <div className="summary-item">
              <span>Rate</span>
              <span>₹{hotelPrice.toLocaleString('en-IN')} / night</span>
            </div>
            
            {parseInt(bedding) === 2 && (
              <div className="summary-item">
                <span>Bedding Surcharge</span>
                <span>₹20 / night</span>
              </div>
            )}
            
            <div className="summary-item">
              <span>Stay Duration</span>
              <span>{daysCount} {daysCount === 1 ? 'night' : 'nights'}</span>
            </div>
            
            <div className="summary-item">
              <span>Guests</span>
              <span>{adults} Adults, {children} Children</span>
            </div>

            <div className="summary-item total">
              <span>Verified Total</span>
              <span style={{ color: 'var(--gold)' }}>₹{calculatedPrice.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ marginTop: '25px', display: 'flex', gap: '8px', background: 'rgba(37,99,235,0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(37,99,235,0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Shield size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Stateless Anti-Tamper Security:</strong> Prices are verified server-side on submission to check for URL manipulations.
              </div>
            </div>
          </div>

        </div>
      </div>

      <ReceiptModal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          navigate('/dashboard');
        }} 
        receipt={receipt} 
      />
    </div>
  );
}

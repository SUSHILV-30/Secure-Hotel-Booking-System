import React from 'react';
import { X, CheckCircle, ShieldAlert, Download, QrCode } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LuxeStay-Receipt-${receipt.bookingId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass">
        <button onClick={onClose} className="modal-close" aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="receipt-header">
          <div className="receipt-badge">
            <CheckCircle size={14} />
            Booking Secured
          </div>
          <h3 className="receipt-title">LuxeStay Digital Receipt</h3>
          <div className="receipt-id">{receipt.bookingId}</div>
        </div>

        <div className="receipt-grid">
          <div className="receipt-block">
            <h4>Hotel Selection</h4>
            <p>{receipt.hotelName}</p>
          </div>
          <div className="receipt-block">
            <h4>Booking Date</h4>
            <p>{new Date(receipt.bookingDate).toLocaleDateString()}</p>
          </div>
          <div className="receipt-block">
            <h4>Check In</h4>
            <p>{receipt.checkIn}</p>
          </div>
          <div className="receipt-block">
            <h4>Check Out</h4>
            <p>{receipt.checkOut}</p>
          </div>
          <div className="receipt-block">
            <h4>Guest Name</h4>
            <p>{receipt.guestName}</p>
          </div>
          <div className="receipt-block">
            <h4>Total Paid</h4>
            <p style={{ color: '#d4a853', fontWeight: '700' }}>
              ₹{receipt.totalPrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="crypto-section">
          <div className="crypto-title" style={{ color: '#10b981' }}>
            <CheckCircle size={14} />
            Data Protection: AES-256-CBC Encrypted
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
            Guest details (Email, Phone, Address) are stored encrypted in the database.
          </p>
        </div>

        <div className="crypto-section">
          <div className="crypto-title" style={{ color: '#3b82f6' }}>
            <QrCode size={14} />
            RSA-2048 Cryptographic Signature
          </div>
          <div className="crypto-key-box">
            {receipt.signature}
          </div>
        </div>

        {receipt.qrCode && (
          <div className="qr-section">
            <img src={receipt.qrCode} alt="Verification QR Code" className="qr-image" />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Scan QR code to verify receipt validity in-person
            </span>
          </div>
        )}

        <button onClick={handleDownload} className="btn-submit" style={{ marginTop: '10px' }}>
          <Download size={16} />
          Download Receipt JSON
        </button>
      </div>
    </div>
  );
}

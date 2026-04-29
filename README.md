# LuxeStay - Hotel Booking Platform

A full-stack hotel booking web application built as a UID (User Interface Design) project. LuxeStay allows users to browse destinations across India, view hotels, and make secure bookings with end-to-end encryption.

## 🏨 Project Overview

LuxeStay is a comprehensive hotel booking platform that demonstrates modern web development practices including:
- **Static HTML/CSS** pages for destination browsing
- **React (Vite)** single-page application for dynamic user experience
- **Express.js** backend API with secure authentication
- **Multi-Factor Authentication** with email OTP
- **AES-256 encryption** for booking data security
- **RSA digital signatures** for data integrity verification

## 📁 Project Structure

```
UID_project-main/
├── HOTEL_BOOKING/
│   ├── HTML/            # Static HTML pages (home, login, booking, destinations)
│   ├── CSS/             # Stylesheets for static pages
│   ├── images/          # Hotel and destination images
│   ├── client/          # React frontend (Vite + Tailwind CSS)
│   │   ├── src/
│   │   │   ├── components/  # Navbar, Captcha, Dashboards, etc.
│   │   │   ├── pages/       # Home, Login, Register, Booking, etc.
│   │   │   └── data/        # Destinations and hotels data
│   │   └── package.json
│   ├── server/          # Express.js backend API
│   │   ├── server.js        # Main server with all API routes
│   │   ├── database.js      # JSON file-based database
│   │   ├── cryptoUtils.js   # AES encryption & RSA signing
│   │   └── package.json
│   └── Security_Report.md
└── unfinished_uid/      # Restaurant ordering module (in progress)
    ├── HTML/            # Restaurant pages
    ├── CSS/             # Restaurant stylesheets
    └── Images/          # Restaurant and food images
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Backend Setup
```bash
cd HOTEL_BOOKING/server
npm install
node server.js
```
Server runs on `http://localhost:3000`

### Frontend Setup
```bash
cd HOTEL_BOOKING/client
npm install
npm run dev
```
Client runs on `http://localhost:5173`

## 🔐 Security Features

| Feature | Description |
|---------|-------------|
| Password Hashing | bcrypt with salt rounds |
| MFA/2FA | Email-based OTP verification |
| AES-256-CBC | Symmetric encryption for booking data |
| RSA-2048 | Asymmetric key pair for digital signatures |
| JWT Tokens | Stateless authentication with expiry |
| RBAC | Role-based access (Admin, Staff, User) |
| CAPTCHA | Bot prevention on login forms |
| QR Codes | Encoded booking report links |

## 🌍 Destinations Covered
- Shimla, Himachal Pradesh
- Manali, Himachal Pradesh
- Darjeeling, West Bengal
- Goa
- Ooty, Tamil Nadu
- Alleppey, Kerala
- Araku Valley, Andhra Pradesh
- Dalhousie, Himachal Pradesh
- Dharamshala, Himachal Pradesh
- Agra, Uttar Pradesh

## 👥 Team
UID Project Team

## 📄 License
This project is for educational purposes as part of the UID course.

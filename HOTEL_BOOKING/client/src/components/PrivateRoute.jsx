import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ user, allowedRoles, children }) {
  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
}

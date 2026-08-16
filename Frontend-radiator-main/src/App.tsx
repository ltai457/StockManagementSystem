// @ts-nocheck
// -nocheck
// src/App.jsx
import React from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/auth-context';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PageLoadingState from './components/common/feedback/PageLoadingState';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoadingState />;
  }





  

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Login Route Component (redirects if already authenticated)
const LoginRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoadingState />;
  }

  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />;
};

// Root Redirect Component
const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <PageLoadingState />;
  }
  
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

// Session Warning Component
const SessionWarningNotification = () => {
  const { sessionWarning, refreshUserSession, remainingTime } = useAuth();

  if (!sessionWarning) return null;

  const handleExtendSession = async () => {
    const success = await refreshUserSession();
    if (!success) return;
  };

  return (
    <Snackbar open anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Alert
        severity="warning"
        variant="filled"
        action={
          <Button color="inherit" onClick={handleExtendSession} size="small">
            Extend Session
          </Button>
        }
      >
        Your session will expire in {remainingTime} minute{remainingTime !== 1 ? 's' : ''}.
      </Alert>
    </Snackbar>
  );
};

// App Routes component (must be inside AuthProvider)
const AppRoutes = () => {
  return (
    <Router>
      <SessionWarningNotification />
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<LoginRoute />} />
        
        {/* Protected Dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Root route - redirect based on auth status */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Catch all routes and redirect to root */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

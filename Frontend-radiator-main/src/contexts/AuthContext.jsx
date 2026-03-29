// src/contexts/AuthContext.jsx
import React, { useState, useEffect } from 'react';
import authService from '../api/authService';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Less aggressive session timeout checking (every 5 minutes instead of 1 minute)
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      // Only check if session is still valid, don't auto-logout
      if (!authService.isSessionValid()) {
        // Just show warning instead of auto-logout
        setSessionWarning(true);
        return;
      }

      const remainingTime = authService.getRemainingSessionTime();

      // Show warning when 10 minutes left (increased from 5)
      if (remainingTime <= 10 && remainingTime > 0) {
        setSessionWarning(true);
      } else {
        setSessionWarning(false);
      }
    };

    // Check session every 5 minutes instead of every minute
    const sessionInterval = setInterval(checkSession, 5 * 60 * 1000);
    
    // Check immediately
    checkSession();

    return () => clearInterval(sessionInterval);
  }, [user]);

  // Manual session expiry handler (only called when user action fails)
  const handleSessionExpired = () => {
    authService.logout();
    setUser(null);
    setSessionWarning(false);
    
    // Show notification
    if (window.confirm('Your session has expired for security reasons. Please login again.')) {
      window.location.reload();
    }
  };

  // Activity tracking to extend session (less frequent)
  useEffect(() => {
    if (!user) return;

    const activities = ['click', 'keypress']; // Reduced from many events to just essential ones
    let lastActivity = Date.now();
    
    const extendSessionOnActivity = () => {
      const now = Date.now();
      // Only extend session if more than 5 minutes since last extension
      if (now - lastActivity > 5 * 60 * 1000) {
        if (authService.isAuthenticated()) {
          authService.extendSession();
          setSessionWarning(false);
          lastActivity = now;
        }
      }
    };

    // Add event listeners
    activities.forEach(activity => {
      document.addEventListener(activity, extendSessionOnActivity, { passive: true });
    });

    return () => {
      // Clean up event listeners
      activities.forEach(activity => {
        document.removeEventListener(activity, extendSessionOnActivity);
      });
    };
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    
    try {
      const result = await authService.login(username, password);
      if (result.success) {
        setUser(result.user);
        setSessionWarning(false);
      }
      setLoading(false);
      return result;
    } catch {
      setLoading(false);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      // Attempt server-side logout if we have a refresh token
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Proceed with client-side logout even if the server request fails.
    }

    // Always clear client-side session
    authService.logout();
    setUser(null);
    setSessionWarning(false);
  };

  const isAuthenticated = () => {
    return !!(user && authService.isAuthenticated());
  };

  const refreshUserSession = async () => {
    try {
      const result = await authService.refreshToken();
      if (result.success) {
        setSessionWarning(false);
        return true;
      } else {
        // Don't automatically logout, let user try to continue
        setSessionWarning(true);
        return false;
      }
    } catch {
      setSessionWarning(true);
      return false;
    }
  };

  // Manual logout function for when API calls fail with 401
  const handleApiUnauthorized = () => {
    handleSessionExpired();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    sessionWarning,
    refreshUserSession,
    handleApiUnauthorized, // Expose this for components to call when needed
    remainingTime: user ? authService.getRemainingSessionTime() : 0,
    sessionInfo: user ? authService.getSessionInfo() : null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

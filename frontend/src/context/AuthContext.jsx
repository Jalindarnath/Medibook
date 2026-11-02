import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('medibook_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('medibook_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          setUser(res.data.user);
          localStorage.setItem('medibook_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error("Auth verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('medibook_token', receivedToken);
    localStorage.setItem('medibook_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('medibook_token', receivedToken);
    localStorage.setItem('medibook_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('medibook_token');
      localStorage.removeItem('medibook_user');
      setToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isAdmin,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wealthwise_token');
    const savedUser = localStorage.getItem('wealthwise_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token with backend
        authService.getMe()
          .then((res) => setUser(res.data.data))
          .catch(() => logout())
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userData) => {
    const { token, ...userInfo } = userData;
    localStorage.setItem('wealthwise_token', token);
    localStorage.setItem('wealthwise_user', JSON.stringify(userInfo));
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wealthwise_token');
    localStorage.removeItem('wealthwise_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    const updated = { ...user, ...userData };
    localStorage.setItem('wealthwise_user', JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

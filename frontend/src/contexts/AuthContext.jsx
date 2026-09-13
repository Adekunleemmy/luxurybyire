import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin as loginApi, getMe } from '../services/api';

const AuthContext = createContext();

const TOKEN_KEY = 'luxurybyire_admin_token';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      getMe()
        .then((res) => setAdmin(res.data.data))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginApi({ email, password });
    const { token, admin: adminData } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAdmin(adminData);
    return adminData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  const isAuthenticated = !!admin;

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

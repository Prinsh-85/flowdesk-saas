import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser } from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on page reload
  useEffect(() => {
    const storedUser = localStorage.getItem('saas_user');
    const storedToken = localStorage.getItem('saas_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginUser(email, password);
      const { token, message, ...userData } = res.data;

      if (message && !token) {
        throw new Error(message);
      }

      // Store JWT token separately
      localStorage.setItem('saas_token', token);
      localStorage.setItem('saas_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Wrong username or password.';
      throw new Error(msg);
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await signupUser(name, email, password);
      const { token, message, ...userData } = res.data;

      if (message && !token) {
        throw new Error(message);
      }

      localStorage.setItem('saas_token', token);
      localStorage.setItem('saas_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Signup failed. Please try again.';
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

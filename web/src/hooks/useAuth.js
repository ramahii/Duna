import { useState } from 'react';
import client from '../api/client';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post('/auth/token/', {
        username,
        password,
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify({ username }));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, password2) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post('/auth/register/', {
        username,
        email,
        password,
        password2,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
  };

  return {
    login,
    register,
    logout,
    isAuthenticated,
    loading,
    error,
  };
};
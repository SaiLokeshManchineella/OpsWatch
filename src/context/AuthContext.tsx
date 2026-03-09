import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string; name: string } | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: !!localStorage.getItem('access_token'),
    user: null, // We'll fetch this on mount if authenticated
    isLoading: true, // Start loading to fetch profile
    error: null,
  });

  const fetchProfile = useCallback(async () => {
    if (!localStorage.getItem('access_token')) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data } = await api.get('/users/me');
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: { username: data.username, name: data.name },
        isLoading: false
      }));
    } catch (err) {
      // 401s are handled by interceptor (logs out)
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data } = await api.post('/auth/login', { username, password });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Fetch profile to get name
      const profileRes = await api.get('/users/me');

      setState({
        isAuthenticated: true,
        user: { username: profileRes.data.username, name: profileRes.data.name },
        isLoading: false,
        error: null
      });
      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.detail || 'Invalid credentials. Please try again.'
      }));
      return false;
    }
  }, []);

  const register = useCallback(async (username: string, name: string, email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Register
      await api.post('/auth/register', { username, name, email, password });

      // 2. Automatically login after successful registration
      return await login(username, password);
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.detail || 'Registration failed. Please try again.'
      }));
      return false;
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setState({ isAuthenticated: false, user: null, isLoading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

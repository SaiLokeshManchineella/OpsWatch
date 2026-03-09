import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and show toast errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || 'An unexpected error occurred';
    
    if (status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Only redirect if not already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status !== 401) {
      // Don't toast 401s as the redirect handles it usually, but toast other errors
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

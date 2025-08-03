import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  avatar?: string;
  emailVerified: boolean;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);

    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server. Please make sure the backend is running on port 3000.');
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data;

        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await verifyToken();
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const verifyToken = async () => {
    try {
      const { data } = await api.get('/auth/verify');
      setUser(data.user);
      return data.user;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data } = await api.post('/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', data.token);
      setUser(data.user);

      toast.success(`Welcome back, ${data.user.name}!`);

    } catch (error: unknown) {
      console.error('Login error:', error);

      if (
        typeof error === 'object' &&
        error !== null &&
        ('code' in error || 'response' in error || 'message' in error)
      ) {
        const err = error as { code?: string; response?: { data?: { message?: string } }; message?: string };
        if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
          toast.error('Cannot connect to server. Please start the backend server.');
        } else {
          const message = err.response?.data?.message || err.message || 'Login failed';
          toast.error(message);
        }
      } else {
        toast.error('Login failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  // const loginWithGoogle = async () => {
  //   try {
  //     // Check if Google OAuth is configured
  //     const response = await fetch('http://localhost:3000/api/auth/google');
      
  //     if (response.status === 503) {
  //       const errorData = await response.json();
  //       toast.error('Google OAuth is not configured. Please contact the administrator.');
  //       console.error('Google OAuth setup required:', errorData);
  //       return;
  //     }
      
  //     // If configured, redirect to Google OAuth
  //     window.location.href = `http://localhost:3000/api/auth/google`;
  //   } catch (error) {
  //     console.error('Google OAuth check failed:', error);
  //     toast.error('Unable to connect to authentication service. Please try again.');
  //   }
  // };

  const register = async (email: string, password: string, name: string, role?: string) => {
    try {
      setLoading(true);

      const { data } = await api.post('/auth/register', {
        email,
        password,
        confirmPassword: password, // or from form
        name,
        role: role || 'user',
        agreeToTerms: true
      });


      localStorage.setItem('token', data.token);
      setUser(data.user);

      toast.success(`Welcome to Fruit Panda, ${data.user.name}!`);

    } catch (error: unknown) {
      console.error('Registration error:', error);

      if (
        typeof error === 'object' &&
        error !== null &&
        ('code' in error || 'response' in error || 'message' in error)
      ) {
        const err = error as { code?: string; response?: { data?: { message?: string } }; message?: string };
        if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
          toast.error('Cannot connect to server. Please start the backend server.');
        } else {
          const message = err.response?.data?.message || err.message || 'Registration failed';
          toast.error(message);
        }
      } else {
        toast.error('Registration failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Successfully logged out');
    }
  };

  const refreshToken = async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        toast.error('Authentication failed. Please try again.');
        return;
      }

      if (token) {
        localStorage.setItem('token', token);
        try {
          await verifyToken();
          toast.success('Successfully logged in with Google!');
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('OAuth verification failed:', error);
          toast.error('Authentication verification failed');
        }
      }
    };

    if (window.location.pathname === '/auth-callback') {
      handleOAuthCallback();
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    register,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the configured axios instance for use in other parts of the app
export { api };
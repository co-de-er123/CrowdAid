import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const { user, accessToken } = await authService.login(email, password);
      setUser(user);
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role: string }) => {
    try {
      const { user, accessToken } = await authService.register(userData);
      setUser(user);
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...userData } : null));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

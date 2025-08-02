import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, AuthResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await api.login({ email, password });
      setUser(response.user);
      
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng bạn trở lại, ${response.user.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Đăng nhập thất bại",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Admin login attempt:', { email });
      const response: AuthResponse = await api.adminLogin({ email, password });
      console.log('Admin login response:', response);
      console.log('User object:', response.user);
      console.log('User role:', response.user?.role);
      console.log('Token received:', response.token ? `${response.token.substring(0, 20)}...` : 'No token');
      
      if (!response.user || !response.user.role) {
        throw new Error('Invalid user data received from server');
      }
      
      setUser(response.user);
      
      // Update API client token
      api.updateToken(response.token);
      console.log('Token updated in API client');
      console.log('localStorage token:', localStorage.getItem('token'));
      
      toast({
        title: "Đăng nhập Admin thành công",
        description: `Chào mừng Admin ${response.user.name}!`,
      });
      
      // Auto-navigate to admin dashboard after successful login
      setTimeout(() => {
        window.location.href = '/admin';
      }, 500);
      
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Đăng nhập Admin thất bại",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await api.register(userData);
      setUser(response.user);
      
      toast({
        title: "Đăng ký thành công",
        description: `Chào mừng bạn đến với Koshiro Fashion, ${response.user.name}!`,
      });
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: "Đăng ký thất bại",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.getProfile();
      setUser(response.user);
    } catch (error) {
      console.error('Refresh user error:', error);
      // If token is invalid, clear it
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    adminLogin,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/interfaces/auth';


const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useSession() {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isAuthenticated };
}

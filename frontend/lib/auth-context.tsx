'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from './types';
import { loginUser, registerUser, getMeProfile } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'alphasector_auth_token';
const USER_KEY = 'alphasector_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const cachedUser = localStorage.getItem(USER_KEY);
    
    if (storedToken) {
      setToken(storedToken);
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          // ignore corrupted json
        }
      }
      
      getMeProfile(storedToken)
        .then((userData) => {
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        })
        .catch((err: any) => {
          // ONLY clear session if server explicitly returned 401 Unauthorized
          // Never log out on temporary network reload or 500 error
          const msg = err?.message || '';
          if (err?.status === 401 || msg.includes('401') || msg.includes('kedaluwarsa') || msg.includes('Unauthorized')) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res: AuthResponse = await loginUser(email, password);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    return login('demo@alphasector.id', 'alphasector123');
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const res: AuthResponse = await registerUser(email, password, fullName);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginDemo,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

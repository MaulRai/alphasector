'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from './types';
import { loginUser, registerUser, getMeProfile, fetchCustomSectorsApiKey, triggerEarlyBackendWarmup } from './api';
import { clearChatCache } from './chatCacheStore';
import { clearChatDraft } from './chatDraftStore';
import { clearScreenerCache } from '@/hooks/useScreener';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFreshLogin: boolean;
  dismissApiKeyTooltip: () => void;
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
  const [isFreshLogin, setIsFreshLogin] = useState<boolean>(false);

  const dismissApiKeyTooltip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('alphasector_api_key_tooltip_dismissed', 'true');
    }
    setIsFreshLogin(false);
  };

  useEffect(() => {
    // Proactively ping backend to spin up cold container early on any page visit
    triggerEarlyBackendWarmup();

    // Check if current browser session was started with fresh login and not dismissed
    if (typeof window !== 'undefined') {
      const isFresh = sessionStorage.getItem('alphasector_is_fresh_login') === 'true';
      const isDismissed = sessionStorage.getItem('alphasector_api_key_tooltip_dismissed') === 'true';
      setIsFreshLogin(isFresh && !isDismissed);
    }

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
            clearChatCache();
            clearChatDraft();
            clearScreenerCache();
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

      // If switching accounts or logging in freshly, wipe stale cache immediately
      const prevId = user?.id;
      if (!prevId || prevId !== res.user.id) {
        clearChatCache();
        clearChatDraft();
        clearScreenerCache();
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.clear();
          } catch {
            // ignore
          }
        }
      }

      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);

      // Flag fresh login session for informative UI guidance
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('alphasector_is_fresh_login', 'true');
        sessionStorage.removeItem('alphasector_api_key_tooltip_dismissed');
      }
      setIsFreshLogin(true);

      // Synchronize saved Sectors API key from DB into client storage
      await fetchCustomSectorsApiKey().catch(() => '');
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

      clearChatCache();
      clearChatDraft();
      clearScreenerCache();
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.clear();
        } catch {
          // ignore
        }
      }

      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);

      // Flag fresh login session for informative UI guidance
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('alphasector_is_fresh_login', 'true');
        sessionStorage.removeItem('alphasector_api_key_tooltip_dismissed');
      }
      setIsFreshLogin(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // 1. Wipe in-memory and client storage caches for chats, drafts, and screener
    clearChatCache();
    clearChatDraft();
    clearScreenerCache();

    // 2. Remove user authentication tokens and sensitive settings
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('alphasector_custom_sectors_key');
    localStorage.removeItem('alphasector_notion_token_v1');
    localStorage.removeItem('alphasector_notion_page_v1');

    // 3. Clear all temporary sessionStorage & tooltip flags
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }
    }

    setToken(null);
    setUser(null);
    setIsFreshLogin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isFreshLogin,
        dismissApiKeyTooltip,
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

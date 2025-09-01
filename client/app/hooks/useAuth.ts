'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils, type User } from '../lib/auth';
import { api } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      const storedUser = authUtils.getStoredUser();
      const token = authUtils.getStoredToken();
      
      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (user: User, token: string) => {
    authUtils.setAuthData(user, token);
    setUser(user);
    setIsAuthenticated(true);
    router.push('/chat');
  };

  const logout = () => {
    api.auth.logout();
    authUtils.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const redirectToLogin = () => {
    router.push('/login');
  };

  const redirectToChat = () => {
    router.push('/chat');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    redirectToLogin,
    redirectToChat,
  };
};
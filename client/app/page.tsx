'use client'

import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { isAuthenticated, isLoading, redirectToLogin, redirectToChat } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        redirectToChat();
      } else {
        redirectToLogin();
      }
    }
  }, [isAuthenticated, isLoading, redirectToLogin, redirectToChat]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
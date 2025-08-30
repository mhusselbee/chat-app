'use client'

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from './hooks/useSocket';
import { api } from './lib/api';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import type { Message } from '../../shared/types';

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string; username: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle client-side initialization after hydration
  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('auth_token');
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user_data');
      }
    }
    
    if (token) {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const {
    isConnected,
    joinChat,
    joinConversation,
    sendMessage,
    onMessage,
    onConversationHistory,
    onError,
  } = useSocket();

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.conversations.getAll(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        joinChat(token);
      }
    }
  }, [isAuthenticated, isConnected, joinChat]);

  useEffect(() => {
    const unsubscribeMessage = onMessage((message) => {
      if (message.conversationId === selectedConversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    const unsubscribeHistory = onConversationHistory((data) => {
      if (data.conversationId === selectedConversationId) {
        setMessages(data.messages);
      }
    });

    const unsubscribeError = onError((error) => {
      console.error('Socket error:', error.message);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeHistory();
      unsubscribeError();
    };
  }, [selectedConversationId, onMessage, onConversationHistory, onError]);

  const handleAuthSuccess = (user: { id: string; email: string; username: string }, token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
    setSelectedConversationId(null);
    setMessages([]);
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMessages([]);
    joinConversation(conversationId);
  };

  const handleSendMessage = (conversationId: string, content: string) => {
    sendMessage(conversationId, content);
  };

  // Show loading state during initial hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage 
        isConnected={isConnected}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User data not found</p>
          <button 
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatPage
      user={user}
      isConnected={isConnected}
      conversations={conversations}
      onLogout={handleLogout}
      onConversationSelect={handleConversationSelect}
      onSendMessage={handleSendMessage}
      onJoinConversation={joinConversation}
      selectedConversationId={selectedConversationId}
      messages={messages}
    />
  );
}
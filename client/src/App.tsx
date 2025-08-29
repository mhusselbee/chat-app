import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from './hooks/useSocket';
import { api } from './lib/api';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage';
import type { Message } from '../../shared/types';

function App() {
  const [user, setUser] = useState<{ id: string; email: string; username: string } | null>(() => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('auth_token');
  });
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

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

  if (!isAuthenticated) {
    return (
      <LoginPage 
        isConnected={isConnected}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (!user) {
    return null;
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

export default App;
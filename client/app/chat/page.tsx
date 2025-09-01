'use client'

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useSocketContext } from '../context/SocketContext';
import { api } from '../lib/api';
import ChatHeader from '../components/ChatHeader';
import CreateConversationModal from '../components/CreateConversationModal';
import EmptyState from '../components/EmptyState';
import MessageInput from '../components/MessageInput';
import MessagesList from '../components/MessagesList';
import Sidebar from '../components/Sidebar';
import type { Conversation, Message } from '../../../shared/types';

export default function ChatPage() {
  const { user, isAuthenticated, isLoading, logout, redirectToLogin } = useAuth();
  const {
    isConnected,
    joinConversation,
    sendMessage,
    onMessage,
    onConversationHistory,
    onError,
  } = useSocketContext();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, isLoading, redirectToLogin]);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.conversations.getAll(),
    enabled: isAuthenticated,
  });

  const createConversationMutation = useMutation({
    mutationFn: (data: { name?: string; participants: string[] }) => 
      api.conversations.create(data),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      handleConversationSelect(newConversation.id);
      joinConversation(newConversation.id);
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

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

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMessages([]);
    joinConversation(conversationId);
  };

  const handleSendMessage = (message: string) => {
    if (selectedConversationId) {
      sendMessage(selectedConversationId, message);
    }
  };

  const handleCreateConversation = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = (name: string | undefined, participants: string[]) => {
    createConversationMutation.mutate({ name, participants });
  };

  const handleValidateUsers = async (usernames: string[]) => {
    return api.users.validate(usernames);
  };

  const getConversationName = () => {
    if (!selectedConversationId) return '';
    const conversation = conversations.find(c => c.id === selectedConversationId);
    return conversation?.name || `Conversation ${selectedConversationId.slice(0, 8)}`;
  };

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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <CreateConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={createConversationMutation.isPending}
        validateUsers={handleValidateUsers}
      />
      
      <div className="h-screen bg-gray-100 flex">
        <Sidebar
          user={user}
          isConnected={isConnected}
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onLogout={logout}
          onConversationSelect={handleConversationSelect}
          onCreateConversation={handleCreateConversation}
          isCreatingConversation={createConversationMutation.isPending}
        />

        <div className="flex-1 flex flex-col h-screen mx-4">
          {selectedConversationId ? (
            <>
              <ChatHeader conversationName={getConversationName()} />
              <MessagesList messages={messages} currentUserId={user.id} />
              <MessageInput 
                onSendMessage={handleSendMessage}
                disabled={!selectedConversationId}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </>
  );
}
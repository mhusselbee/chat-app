'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { authUtils } from '../lib/auth';
import type { Message } from '../../../shared/types';

interface SocketContextType {
  isConnected: boolean;
  joinChat: (token: string) => void;
  joinConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  onMessage: (callback: (message: Message) => void) => () => void;
  onConversationHistory: (callback: (data: { conversationId: string; messages: Message[] }) => void) => () => void;
  onError: (callback: (error: { message: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const socket = useSocket();

  useEffect(() => {
    if (socket.isConnected && authUtils.isAuthenticated()) {
      const token = authUtils.getStoredToken();
      if (token) {
        socket.joinChat(token);
      }
    }
  }, [socket.isConnected, socket.joinChat]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '../../../shared/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinChat = useCallback((token: string) => {
    socket?.emit('join', { token });
  }, [socket]);

  const joinConversation = useCallback((conversationId: string) => {
    socket?.emit('join_conversation', { conversationId });
  }, [socket]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    socket?.emit('send_message', { conversationId, content });
  }, [socket]);

  const onMessage = useCallback((callback: (message: Message) => void) => {
    socket?.on('new_message', callback);
    return () => socket?.off('new_message', callback);
  }, [socket]);

  const onConversationHistory = useCallback((callback: (data: { conversationId: string; messages: Message[] }) => void) => {
    socket?.on('conversation_history', callback);
    return () => socket?.off('conversation_history', callback);
  }, [socket]);

  const onError = useCallback((callback: (error: { message: string }) => void) => {
    socket?.on('error', callback);
    return () => socket?.off('error', callback);
  }, [socket]);

  return {
    socket,
    isConnected,
    joinChat,
    joinConversation,
    sendMessage,
    onMessage,
    onConversationHistory,
    onError,
  };
};
import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  userId?: string;
  username?: string;
  email?: string;
}

export interface ConnectedUser {
  userId: string;
  username: string;
}

export interface JoinEventData {
  token: string;
}

export interface JoinConversationEventData {
  conversationId: string;
}

export interface SendMessageEventData {
  conversationId: string;
  content: string;
}

export interface MessageWithUser {
  id: string;
  content: string;
  conversationId: string;
  userId: string;
  username: string;
  createdAt: Date;
}

export interface ConversationMessage {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  username: string;
}

export interface SocketError {
  message: string;
}

export interface SocketResponse {
  success: boolean;
  message?: string;
}

export interface UserConnectionEvent {
  userId: string;
  username: string;
}

export interface ConversationHistoryEvent {
  conversationId: string;
  messages: ConversationMessage[];
}
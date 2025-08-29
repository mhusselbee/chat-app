export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  conversationId: string;
  userId: string;
  username: string;
  createdAt: Date;
}

export interface CreateConversationRequest {
  userId: string;
  name?: string;
  participants: string[]; // Array of usernames to add to the conversation
}

export interface UserSearchResult {
  username: string;
  exists: boolean;
}

export interface SignUpRequest {
  email: string;
  username: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface SocketEvents {
  // Client to Server
  join: { token: string };
  join_conversation: { conversationId: string };
  send_message: { conversationId: string; content: string };

  // Server to Client
  joined: { success: boolean };
  conversation_history: { conversationId: string; messages: Message[] };
  new_message: Message;
  user_connected: { userId: string; username: string };
  user_disconnected: { userId: string; username: string };
  error: { message: string };
}
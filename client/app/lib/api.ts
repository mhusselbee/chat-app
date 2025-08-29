import type { 
  Conversation, 
  UserSearchResult, 
  SignUpRequest, 
  SignInRequest, 
  AuthResponse 
} from '../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  auth: {
    signup: async (data: SignUpRequest): Promise<AuthResponse> => {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign up');
      }
      return response.json();
    },

    signin: async (data: SignInRequest): Promise<AuthResponse> => {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign in');
      }
      return response.json();
    },

    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    },
  },

  conversations: {
    getAll: async (): Promise<Conversation[]> => {
      const response = await fetch(`${API_URL}/conversations`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return response.json();
    },
    
    create: async (data: { name?: string; participants: string[] }): Promise<Conversation> => {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create conversation');
      }
      return response.json();
    },
  },
  
  users: {
    validate: async (usernames: string[]): Promise<UserSearchResult[]> => {
      const response = await fetch(`${API_URL}/users/validate?usernames=${usernames.join(',')}`);
      if (!response.ok) {
        throw new Error('Failed to validate users');
      }
      return response.json();
    },
  },
};
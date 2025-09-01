export interface User {
  id: string;
  email: string;
  username: string;
}

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;

export const authUtils = {
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
      return null;
    }
  },

  setAuthData(user: User, token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  clearAuthData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
  },

  isAuthenticated(): boolean {
    return !!(this.getStoredToken() && this.getStoredUser());
  },
};
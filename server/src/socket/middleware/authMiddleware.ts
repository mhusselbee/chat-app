import { verifyToken } from '../../utils/auth';
import { SocketWithUser, SocketError } from '../types/socket';

export const authenticateSocket = (socket: SocketWithUser): boolean => {
  if (!socket.userId || !socket.username) {
    socket.emit('error', { message: 'Not authenticated' } as SocketError);
    return false;
  }
  return true;
};

export const authenticateAndSetUser = async (
  socket: SocketWithUser, 
  token: string
): Promise<boolean> => {
  try {
    const payload = verifyToken(token);
    if (!payload) {
      socket.emit('error', { message: 'Invalid token' } as SocketError);
      return false;
    }

    socket.userId = payload.userId;
    socket.username = payload.username;
    socket.email = payload.email;
    
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    socket.emit('error', { message: 'Failed to authenticate' } as SocketError);
    return false;
  }
};
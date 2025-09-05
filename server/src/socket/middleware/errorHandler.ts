import { SocketWithUser, SocketError } from '../types/socket';

export const handleSocketError = (
  socket: SocketWithUser, 
  error: unknown, 
  context: string
): void => {
  console.error(`Error in ${context}:`, error);
  socket.emit('error', { 
    message: `Failed to ${context.toLowerCase()}` 
  } as SocketError);
};
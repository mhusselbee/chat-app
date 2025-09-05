import { Server } from 'socket.io';
import { authenticateAndSetUser } from '../middleware/authMiddleware';
import { handleSocketError } from '../middleware/errorHandler';
import { userService } from '../services/userService';
import { SocketWithUser, JoinEventData, SocketResponse } from '../types/socket';

export const handleJoin = (io: Server, socket: SocketWithUser) => {
  return async (data: JoinEventData) => {
    try {
      const isAuthenticated = await authenticateAndSetUser(socket, data.token);
      if (!isAuthenticated) {
        return;
      }

      userService.addUser(socket.id, socket.userId!, socket.username!);
      
      socket.emit('joined', { success: true } as SocketResponse);
      
      userService.emitUserConnected(io, socket.userId!, socket.username!);

    } catch (error) {
      handleSocketError(socket, error, 'join');
    }
  };
};
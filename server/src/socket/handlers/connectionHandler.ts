import { Server } from 'socket.io';
import { userService } from '../services/userService';
import { SocketWithUser } from '../types/socket';
import { logger } from '../../utils/logger';

export const handleConnection = (io: Server) => {
  return (socket: SocketWithUser) => {
    logger.info('Socket connected', {
      socketId: socket.id,
      ip: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent']
    });
  };
};

export const handleDisconnect = (io: Server, socket: SocketWithUser) => {
  return () => {
    const userInfo = userService.removeUser(socket.id);
    if (userInfo) {
      userService.emitUserDisconnected(io, userInfo.userId, userInfo.username);
    }
    logger.info('Socket disconnected', {
      socketId: socket.id,
      userId: userInfo?.userId,
      username: userInfo?.username
    });
  };
};
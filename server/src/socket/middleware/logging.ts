import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { SocketWithUser } from '../types/socket';

export const socketLogger = (socket: SocketWithUser, next: (err?: Error) => void) => {
  logger.info('Socket connection attempt', {
    socketId: socket.id,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent']
  });

  next();
};
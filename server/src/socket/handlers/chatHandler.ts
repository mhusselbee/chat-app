import { Server } from 'socket.io';
import { authenticateSocket } from '../middleware/authMiddleware';
import { handleSocketError } from '../middleware/errorHandler';
import { messageService } from '../services/messageService';
import { SocketWithUser, SendMessageEventData } from '../types/socket';
import { logger } from '../../utils/logger';

export const handleSendMessage = (io: Server, socket: SocketWithUser) => {
  return async (data: SendMessageEventData) => {
    try {
      if (!authenticateSocket(socket)) {
        return;
      }

      const { conversationId, content } = data;
      
      logger.info('Message sent', {
        socketId: socket.id,
        userId: socket.userId,
        username: socket.username,
        conversationId,
        contentLength: content.length
      });
      
      await messageService.sendMessage(
        io,
        conversationId,
        content,
        socket.userId!,
        socket.username!
      );

    } catch (error) {
      handleSocketError(socket, error, 'send message');
    }
  };
};
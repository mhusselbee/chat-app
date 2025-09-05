import { authenticateSocket } from '../middleware/authMiddleware';
import { handleSocketError } from '../middleware/errorHandler';
import { messageService } from '../services/messageService';
import { SocketWithUser, JoinConversationEventData } from '../types/socket';

export const handleJoinConversation = (socket: SocketWithUser) => {
  return async (data: JoinConversationEventData) => {
    try {
      if (!authenticateSocket(socket)) {
        return;
      }

      const { conversationId } = data;
      
      socket.join(conversationId);
      
      await messageService.ensureUserInConversation(conversationId, socket.userId!);

      const conversationMessages = await messageService.getConversationHistory(conversationId);

      messageService.emitConversationHistory(socket, conversationId, conversationMessages);

    } catch (error) {
      handleSocketError(socket, error, 'join conversation');
    }
  };
};
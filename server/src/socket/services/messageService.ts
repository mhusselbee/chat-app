import { Server } from 'socket.io';
import { and, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import db from '../../db';
import { conversationParticipants, conversations, messages, users } from '../../db/schema';
import { 
  MessageWithUser, 
  ConversationMessage, 
  ConversationHistoryEvent,
  SocketWithUser 
} from '../types/socket';

export class MessageService {
  async sendMessage(
    io: Server,
    conversationId: string,
    content: string,
    userId: string,
    username: string
  ): Promise<MessageWithUser> {
    const messageId = uuidv4();
    const now = new Date();

    await db.insert(messages).values({
      id: messageId,
      content,
      conversationId,
      userId,
      createdAt: now
    });

    await db
      .update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId));

    const messageWithUser: MessageWithUser = {
      id: messageId,
      content,
      conversationId,
      userId,
      username,
      createdAt: now
    };

    io.to(conversationId).emit('new_message', messageWithUser);
    return messageWithUser;
  }

  async getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
    const conversationMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        userId: messages.userId,
        username: users.username
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(50);

    return conversationMessages.reverse();
  }

  async ensureUserInConversation(conversationId: string, userId: string): Promise<void> {
    const existingParticipant = await db
      .select()
      .from(conversationParticipants)
      .where(and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      ))
      .limit(1);

    if (existingParticipant.length === 0) {
      await db.insert(conversationParticipants).values({
        conversationId,
        userId,
      });
    }
  }

  emitConversationHistory(
    socket: SocketWithUser,
    conversationId: string,
    messages: ConversationMessage[]
  ): void {
    const event: ConversationHistoryEvent = { conversationId, messages };
    socket.emit('conversation_history', event);
  }
}

export const messageService = new MessageService();
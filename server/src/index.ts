import cors from 'cors';
import dotenv from 'dotenv';
import { and, desc, eq } from 'drizzle-orm';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { router } from './api/routes/index';
import db from './db';
import { conversationParticipants, conversations, messages, users } from './db/schema';
import { verifyToken } from './utils/auth';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "*"
}));
app.use(express.json());

// API Routes
app.use('/api', router);

const connectedUsers = new Map<string, { userId: string; username: string }>();

interface SocketWithUser extends Socket {
  userId?: string;
  username?: string;
  email?: string;
}

io.on('connection', (socket: SocketWithUser) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (data: { token: string }) => {
    try {
      const payload = verifyToken(data.token);
      if (!payload) {
        socket.emit('error', { message: 'Invalid token' });
        return;
      }

      socket.userId = payload.userId;
      socket.username = payload.username;
      socket.email = payload.email;
      
      connectedUsers.set(socket.id, {
        userId: payload.userId,
        username: payload.username
      });

      socket.emit('joined', { success: true });
      
      io.emit('user_connected', {
        userId: payload.userId,
        username: payload.username
      });

    } catch (error) {
      console.error('Error joining:', error);
      socket.emit('error', { message: 'Failed to join' });
    }
  });

  socket.on('join_conversation', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      socket.join(conversationId);
      
      const existingParticipant = await db
        .select()
        .from(conversationParticipants)
        .where(and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, socket.userId)
        ))
        .limit(1);

      if (existingParticipant.length === 0) {
        await db.insert(conversationParticipants).values({
          conversationId,
          userId: socket.userId,
        });
      }

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

      socket.emit('conversation_history', {
        conversationId,
        messages: conversationMessages.reverse()
      });

    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  socket.on('send_message', async (data: {
    conversationId: string;
    content: string;
  }) => {
    try {
      const { conversationId, content } = data;
      
      if (!socket.userId || !socket.username) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const messageId = uuidv4();
      const now = new Date();

      await db.insert(messages).values({
        id: messageId,
        content,
        conversationId,
        userId: socket.userId,
        createdAt: now
      });

      await db
        .update(conversations)
        .set({ updatedAt: now })
        .where(eq(conversations.id, conversationId));

      const messageWithUser = {
        id: messageId,
        content,
        conversationId,
        userId: socket.userId,
        username: socket.username,
        createdAt: now
      };

      io.to(conversationId).emit('new_message', messageWithUser);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      connectedUsers.delete(socket.id);
      io.emit('user_disconnected', {
        userId: userInfo.userId,
        username: userInfo.username
      });
    }
    console.log('User disconnected:', socket.id);
  });
});






const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
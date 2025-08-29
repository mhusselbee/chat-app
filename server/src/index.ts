import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { users, conversations, messages, conversationParticipants } from './db/schema';
import { eq, desc, and, inArray, or } from 'drizzle-orm';
import type { CreateConversationRequest, SignUpRequest, SignInRequest, AuthResponse } from '../../shared/types';
import { hashPassword, comparePassword, generateToken, verifyToken } from './utils/auth';
import { authenticateToken, AuthenticatedRequest } from './middleware/auth';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "*"
}));
app.use(express.json());

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

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password }: SignUpRequest = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existingUser.length > 0) {
      if (existingUser[0].email === email) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      if (existingUser[0].username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    await db.insert(users).values({
      id: userId,
      email,
      username,
      passwordHash: hashedPassword,
    });

    const token = generateToken({ userId, email, username });

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: userId,
        email,
        username,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password }: SignInRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await comparePassword(password, user[0].passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user[0].id,
      email: user[0].email,
      username: user[0].username,
    });

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: user[0].id,
        email: user[0].email,
        username: user[0].username,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;

    const userConversations = await db
      .select({
        id: conversations.id,
        name: conversations.name,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt
      })
      .from(conversations)
      .innerJoin(
        conversationParticipants,
        eq(conversations.id, conversationParticipants.conversationId)
      )
      .where(eq(conversationParticipants.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    res.json(userConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/api/users/validate', async (req, res) => {
  try {
    const usernames = req.query.usernames as string;
    
    if (!usernames) {
      return res.status(400).json({ error: 'Usernames required' });
    }

    const usernameList = usernames.split(',').map(u => u.trim()).filter(Boolean);
    
    if (usernameList.length === 0) {
      return res.json([]);
    }

    const existingUsers = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, usernameList[0]));

    // For multiple usernames, we need to check each one
    const results = [];
    for (const username of usernameList) {
      const userExists = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      
      results.push({
        username,
        exists: userExists.length > 0
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Error validating users:', error);
    res.status(500).json({ error: 'Failed to validate users' });
  }
});

app.post('/api/conversations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, participants = [] } = req.body;
    const userId = req.user!.userId;
    
    console.log('Creating conversation with:', { name, participants, userId });
    console.log('Authenticated user:', req.user);

    // Validate that all specified participants exist
    if (participants.length > 0) {
      console.log('Validating participants:', participants);
      const existingUsers = await db
        .select({ username: users.username, id: users.id })
        .from(users)
        .where(inArray(users.username, participants));

      const existingUsernames = existingUsers.map(u => u.username);
      const nonExistentUsers = participants.filter((p: string) => !existingUsernames.includes(p));

      if (nonExistentUsers.length > 0) {
        return res.status(400).json({ 
          error: `Users not found: ${nonExistentUsers.join(', ')}` 
        });
      }
    }

    const conversationId = uuidv4();
    const now = new Date();

    console.log('Creating conversation in database with ID:', conversationId);

    // Create the conversation
    await db.insert(conversations).values({
      id: conversationId,
      name: name || `Conversation ${conversationId.slice(0, 8)}`,
      createdAt: now,
      updatedAt: now
    });

    console.log('Conversation created successfully, checking creator exists...');

    // Get creator's info and participant user IDs
    const creator = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    console.log('Creator lookup result:', creator);

    if (creator.length === 0) {
      console.log('ERROR: Creator user not found for userId:', userId);
      return res.status(400).json({ error: 'Creator user not found' });
    }

    // Collect all participant user IDs (including creator)
    const participantIds = [userId];
    
    if (participants.length > 0) {
      const participantUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.username, participants));
      
      participantIds.push(...participantUsers.map(u => u.id));
    }

    // Remove duplicates in case creator is also in participants list
    const uniqueParticipantIds = [...new Set(participantIds)];

    // Add all participants to the conversation
    const participantInserts = uniqueParticipantIds.map(participantId => ({
      conversationId,
      userId: participantId,
    }));

    console.log('Inserting participants:', participantInserts);

    await db.insert(conversationParticipants).values(participantInserts);

    console.log('Conversation participants added successfully');

    const newConversation = {
      id: conversationId,
      name: name || `Conversation ${conversationId.slice(0, 8)}`,
      createdAt: now,
      updatedAt: now
    };

    console.log('Returning new conversation:', newConversation);

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
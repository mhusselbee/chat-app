import { Response } from 'express';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import db from '../../db';
import { conversationParticipants, conversations, users } from '../../db/schema';
import { AuthenticatedRequest } from '../middleware';

export const getConversations = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const createConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, participants = [] } = req.body;
    const userId = req.user!.userId;
    
    console.log('Creating conversation with:', { name, participants, userId });
    console.log('Authenticated user:', req.user);

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

    await db.insert(conversations).values({
      id: conversationId,
      name: name || `Conversation ${conversationId.slice(0, 8)}`,
      createdAt: now,
      updatedAt: now
    });

    console.log('Conversation created successfully, checking creator exists...');

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

    const participantIds = [userId];
    
    if (participants.length > 0) {
      const participantUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.username, participants));
      
      participantIds.push(...participantUsers.map(u => u.id));
    }

    const uniqueParticipantIds = [...new Set(participantIds)];

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
};
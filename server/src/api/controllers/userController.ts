import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import db from '../../db';
import { users } from '../../db/schema';
import { AuthenticatedRequest } from '../../utils/auth';
import { logger } from '../../utils/logger';

export const validateUsers = async (req: Request, res: Response) => {
  try {
    const usernames = req.query.usernames as string;
    
    if (!usernames) {
      return res.status(400).json({ error: 'Usernames required' });
    }

    const usernameList = usernames.split(',').map(u => u.trim()).filter(Boolean);
    
    if (usernameList.length === 0) {
      return res.json([]);
    }

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
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(404).json({error: "User not found"});
    }

    const payload = req.body as {username?: string, email?: string, password?: string};
    
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({error: "No update data provided"});
    }

    const updatePayload: Record<string, string> = {};
    
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updatePayload[key] = value;
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({error: "No valid update data provided"});
    }
    
    const result = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, userId));
    
    res.status(200).json({message: "User updated successfully"});
    
  } catch(err) {
    logger.error('Error updating user:', err);
    res.status(500).json({error: "Failed to update user"});
  }
}
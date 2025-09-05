import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import db from '../../db';
import { users } from '../../db/schema';

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
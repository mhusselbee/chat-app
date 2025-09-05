import { Request, Response } from 'express';
import { and, eq, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { AuthResponse, SignInRequest, SignUpRequest } from '../../../../shared/types';
import db from '../../db';
import { users } from '../../db/schema';
import { comparePassword, generateToken, hashPassword } from '../../utils/auth';

export const signUp = async (req: Request, res: Response) => {
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
};

export const signIn = async (req: Request, res: Response) => {
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
};
import { Server } from 'socket.io';
import { ConnectedUser, UserConnectionEvent, SocketWithUser } from '../types/socket';

export class UserService {
  private connectedUsers = new Map<string, ConnectedUser>();

  addUser(socketId: string, userId: string, username: string): void {
    this.connectedUsers.set(socketId, { userId, username });
  }

  removeUser(socketId: string): ConnectedUser | null {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.connectedUsers.delete(socketId);
      return user;
    }
    return null;
  }

  getUser(socketId: string): ConnectedUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  getAllUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  emitUserConnected(io: Server, userId: string, username: string): void {
    const event: UserConnectionEvent = { userId, username };
    io.emit('user_connected', event);
  }

  emitUserDisconnected(io: Server, userId: string, username: string): void {
    const event: UserConnectionEvent = { userId, username };
    io.emit('user_disconnected', event);
  }
}

export const userService = new UserService();
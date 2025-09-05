import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from './handlers';
import { socketLogger } from './middleware/logging';

export class SocketManager {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.initialize();
  }

  private initialize(): void {
    this.io.use(socketLogger);
    setupSocketHandlers(this.io);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export const initializeSocket = (httpServer: HTTPServer): SocketManager => {
  return new SocketManager(httpServer);
};
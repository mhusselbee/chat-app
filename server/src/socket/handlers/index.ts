import { Server } from 'socket.io';
import { SocketWithUser } from '../types/socket';
import { handleJoin } from './authHandler';
import { handleSendMessage } from './chatHandler';
import { handleConnection, handleDisconnect } from './connectionHandler';
import { handleJoinConversation } from './roomHandler';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: SocketWithUser) => {
    handleConnection(io)(socket);

    socket.on('join', handleJoin(io, socket));
    socket.on('join_conversation', handleJoinConversation(socket));
    socket.on('send_message', handleSendMessage(io, socket));
    socket.on('disconnect', handleDisconnect(io, socket));
  });
};
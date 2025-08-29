import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import CreateConversationModal from './CreateConversationModal';
import type { Message, Conversation } from '../../../shared/types';

interface ChatPageProps {
  user: { id: string; email: string; username: string };
  isConnected: boolean;
  conversations: Conversation[];
  onLogout: () => void;
  onConversationSelect: (conversationId: string) => void;
  onSendMessage: (conversationId: string, content: string) => void;
  onJoinConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  messages: Message[];
}

function ChatPage({
  user,
  isConnected,
  conversations,
  onLogout,
  onConversationSelect,
  onSendMessage,
  onJoinConversation,
  selectedConversationId,
  messages
}: ChatPageProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: (data: { name?: string; participants: string[] }) => 
      api.conversations.create(data),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onConversationSelect(newConversation.id);
      onJoinConversation(newConversation.id);
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedConversationId) {
      onSendMessage(selectedConversationId, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleCreateConversation = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = (name: string | undefined, participants: string[]) => {
    createConversationMutation.mutate({ name, participants });
  };

  const handleValidateUsers = async (usernames: string[]) => {
    return api.users.validate(usernames);
  };

  return (
    <>
      <CreateConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={createConversationMutation.isPending}
        validateUsers={handleValidateUsers}
      />
      
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
                <p className="text-sm text-gray-600">Welcome, {user.username}!</p>
                <div className="text-xs text-gray-500 mt-1">
                  {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={handleCreateConversation}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                disabled={createConversationMutation.isPending}
              >
                {createConversationMutation.isPending ? 'Creating...' : 'New Conversation'}
              </button>

              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => onConversationSelect(conversation.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedConversationId === conversation.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="font-medium">
                      {conversation.name || `Conversation ${conversation.id.slice(0, 8)}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <h2 className="font-semibold text-gray-800">
                  {conversations.find(c => c.id === selectedConversationId)?.name || 
                   `Conversation ${selectedConversationId.slice(0, 8)}`}
                </h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.userId === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.userId === user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {message.userId !== user.id && (
                        <div className="text-xs text-gray-500 mb-1">{message.username}</div>
                      )}
                      <div>{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.userId === user.id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!messageInput.trim()}
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-medium mb-2">Welcome to Chat App!</h3>
                <p>Select a conversation from the sidebar or create a new one to start chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatPage;
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { Conversation, Message } from '../../../shared/types';
import { api } from '../lib/api';
import ChatHeader from './ChatHeader';
import CreateConversationModal from './CreateConversationModal';
import EmptyState from './EmptyState';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import Sidebar from './Sidebar';

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

  const handleSendMessage = (message: string) => {
    if (selectedConversationId) {
      onSendMessage(selectedConversationId, message);
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

  const getConversationName = () => {
    if (!selectedConversationId) return '';
    const conversation = conversations.find(c => c.id === selectedConversationId);
    return conversation?.name || `Conversation ${selectedConversationId.slice(0, 8)}`;
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
      
      <div className="h-screen bg-gray-100 flex">
        <Sidebar
          user={user}
          isConnected={isConnected}
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onLogout={onLogout}
          onConversationSelect={onConversationSelect}
          onCreateConversation={handleCreateConversation}
          isCreatingConversation={createConversationMutation.isPending}
        />

        <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 16px)', width: 'calc(100% - 32px)', marginLeft: '16px', marginRight: '16px' }}>
          {selectedConversationId ? (
            <>
              <ChatHeader conversationName={getConversationName()} />
              <MessagesList messages={messages} currentUserId={user.id} />
              <MessageInput 
                onSendMessage={handleSendMessage}
                disabled={!selectedConversationId}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </>
  );
}

export default ChatPage;
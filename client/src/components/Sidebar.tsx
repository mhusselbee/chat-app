import type { Conversation } from '../../../shared/types';

interface SidebarProps {
  user: { id: string; email: string; username: string };
  isConnected: boolean;
  conversations: Conversation[];
  selectedConversationId: string | null;
  onLogout: () => void;
  onConversationSelect: (conversationId: string) => void;
  onCreateConversation: () => void;
  isCreatingConversation: boolean;
}

function Sidebar({
  user,
  isConnected,
  conversations,
  selectedConversationId,
  onLogout,
  onConversationSelect,
  onCreateConversation,
  isCreatingConversation
}: SidebarProps) {
  return (
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
            onClick={onCreateConversation}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            disabled={isCreatingConversation}
          >
            {isCreatingConversation ? 'Creating...' : 'New Conversation'}
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
  );
}

export default Sidebar;
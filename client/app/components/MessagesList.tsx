import type { Message } from '../../../shared/types';

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
}

function MessagesList({ messages, currentUserId }: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.userId === currentUserId ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm animate-fade-in ${
              message.userId === currentUserId
                ? 'bg-blue-500 text-white shadow-chat'
                : 'bg-white text-gray-800 border border-gray-200 shadow-chat'
            }`}
          >
            {message.userId !== currentUserId && (
              <div className="text-xs text-gray-500 mb-1">{message.username}</div>
            )}
            <div>{message.content}</div>
            <div
              className={`text-xs mt-1 ${
                message.userId === currentUserId ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MessagesList;
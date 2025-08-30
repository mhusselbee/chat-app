import type { Message } from '../../../shared/types';
import { MessageItem } from './Message';

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
}

function MessagesList({ messages, currentUserId }: MessagesListProps) {

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

export default MessagesList;
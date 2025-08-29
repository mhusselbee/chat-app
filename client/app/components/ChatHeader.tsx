interface ChatHeaderProps {
  conversationName: string;
}

function ChatHeader({ conversationName }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
      <h2 className="font-semibold text-gray-800">{conversationName}</h2>
    </div>
  );
}

export default ChatHeader;
import { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [messageInput, setMessageInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && !disabled) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  return (
    <div className="p-4 m-6 bg-white">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          disabled={disabled}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          disabled={!messageInput.trim() || disabled}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
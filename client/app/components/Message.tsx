import useScrollIntoView from "@/hooks/useScrollIntoView";
import type { Message } from "../../../shared/types";

interface MessageItemProps {
  message: Message;
  currentUserId: string;
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
  const scrollRef = useScrollIntoView();
  const currentUserClassName = "bg-blue-500 text-white shadow-chat";
  const otherUserClassName =
    "bg-white text-gray-800 border border-gray-200 shadow-chat";
  const className =
    message.userId === currentUserId
      ? currentUserClassName
      : otherUserClassName;

  return (
    <div
      ref={scrollRef}
      className={`flex ${
        message.userId === currentUserId ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm animate-fade-in ${className}`}
      >
        {message.userId !== currentUserId && (
          <div className="text-xs text-gray-500 mb-1">{message.username}</div>
        )}
        <div>{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            message.userId === currentUserId ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

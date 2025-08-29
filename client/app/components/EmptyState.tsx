function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">
        <h3 className="text-lg font-medium mb-2">Welcome to Chat App!</h3>
        <p>Select a conversation from the sidebar or create a new one to start chatting.</p>
      </div>
    </div>
  );
}

export default EmptyState;
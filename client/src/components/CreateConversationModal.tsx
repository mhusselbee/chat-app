import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { UserSearchResult } from '../../../shared/types';

interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string | undefined, participants: string[]) => void;
  isLoading: boolean;
  validateUsers: (usernames: string[]) => Promise<UserSearchResult[]>;
}

export default function CreateConversationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  validateUsers,
}: CreateConversationModalProps) {
  const [name, setName] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [, setValidationResults] = useState<UserSearchResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setName('');
    setUsernameInput('');
    setParticipants([]);
    setValidationResults([]);
    setError('');
    onClose();
  };

  const handleAddParticipant = async () => {
    const trimmedUsername = usernameInput.trim();
    
    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }

    if (participants.includes(trimmedUsername)) {
      setError('User already added');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const results = await validateUsers([trimmedUsername]);
      setValidationResults(results);

      const result = results.find(r => r.username === trimmedUsername);
      if (!result?.exists) {
        setError(`User "${trimmedUsername}" does not exist`);
      } else {
        setParticipants(prev => [...prev, trimmedUsername]);
        setUsernameInput('');
        setValidationResults([]);
      }
    } catch {
      setError('Failed to validate username');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveParticipant = (username: string) => {
    setParticipants(prev => prev.filter(p => p !== username));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (participants.length === 0) {
      setError('Please add at least one participant');
      return;
    }
    console.log({name, participants})

    onSubmit(name || undefined, participants);
    handleClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto border border-gray-200 relative" style={{ zIndex: 10000 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Conversation</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="conversationName" className="block text-sm font-medium text-gray-700 mb-1">
              Conversation Name (optional)
            </label>
            <input
              type="text"
              id="conversationName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter conversation name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Participants
            </label>
            
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                disabled={isValidating || !usernameInput.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isValidating ? 'Checking...' : 'Add'}
              </button>
            </div>

            {error && (
              <div className="text-red-600 text-sm mb-3">{error}</div>
            )}

            {participants.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Participants ({participants.length})
                </h4>
                <div className="space-y-1">
                  {participants.map((participant) => (
                    <div
                      key={participant}
                      className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                    >
                      <span className="text-sm">{participant}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(participant)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || participants.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Conversation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
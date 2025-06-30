import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              disabled={disabled || isLoading}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              rows={1}
              maxLength={4000}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {message.length}/4000
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors duration-200"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </p>
          {isLoading && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              AI is thinking...
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
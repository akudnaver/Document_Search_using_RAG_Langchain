import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Message } from '../types/chat';
import { MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to AI Chat Assistant
              </h2>
              <p className="text-gray-600 mb-6">
                Start a conversation with our AI assistant. Ask questions, get help, or just chat!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 text-left">
                  <div className="font-medium text-gray-800 mb-1">💡 Get answers</div>
                  <div className="text-gray-600">Ask questions about any topic</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-left">
                  <div className="font-medium text-gray-800 mb-1">🔍 Research help</div>
                  <div className="text-gray-600">Get detailed explanations</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-left">
                  <div className="font-medium text-gray-800 mb-1">✍️ Content creation</div>
                  <div className="text-gray-600">Generate text and ideas</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-left">
                  <div className="font-medium text-gray-800 mb-1">🧠 Problem solving</div>
                  <div className="text-gray-600">Work through complex problems</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};
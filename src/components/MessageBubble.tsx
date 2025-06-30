import React, { useState } from 'react';
import { Copy, Check, User, Bot, FileText, ExternalLink } from 'lucide-react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-4 p-6 ${isUser ? 'bg-gray-50' : 'bg-white'} group`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser ? 'bg-blue-600' : 'bg-green-600'}
      `}>
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <p className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${
            message.isStreaming ? 'animate-pulse' : ''
          }`}>
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse"></span>
            )}
          </p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Sources</span>
            </div>
            <div className="space-y-2">
              {message.sources.map((source, index) => (
                <div key={index} className="text-xs text-gray-600 p-2 bg-white rounded border">
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1">{source.content}</p>
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="font-mono">{(source.score * 100).toFixed(0)}%</span>
                      <ExternalLink size={10} />
                    </div>
                  </div>
                  <p className="text-gray-500 mt-1 font-medium">{source.source}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check size={12} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
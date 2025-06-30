import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Edit2, Trash2, Upload, FileText, Settings } from 'lucide-react';
import { Conversation } from '../types/chat';
import { DocumentUpload } from './DocumentUpload';
import { apiService, DocumentInfo } from '../services/api';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'documents'>('chats');
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const response = await apiService.getDocuments();
      setDocuments(response.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab]);

  const handleUploadComplete = () => {
    loadDocuments();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-gray-900 border-r border-gray-700 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-200 mb-4"
            >
              <Plus size={20} />
              <span className="font-medium">New Chat</span>
            </button>

            {/* Tab Navigation */}
            <div className="flex rounded-lg bg-gray-800 p-1">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chats'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare size={16} />
                Chats
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'documents'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText size={16} />
                Docs
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'chats' ? (
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new chat to begin</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`
                        group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${currentConversationId === conversation.id 
                          ? 'bg-gray-700 border border-gray-600' 
                          : 'hover:bg-gray-800'
                        }
                      `}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">
                            {conversation.title}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {formatDate(conversation.updatedAt)}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {conversation.messages.length} messages
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                            className="p-1 rounded hover:bg-red-600 text-gray-400 hover:text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <DocumentUpload
                  onUploadComplete={handleUploadComplete}
                  documents={documents}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-gray-400 text-sm">
              <p className="font-medium mb-1">RAG Chat Assistant</p>
              <p>Upload documents and chat with your data</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
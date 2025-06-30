import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { useChat } from './hooks/useChat';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    conversations,
    currentConversation,
    currentConversationId,
    isLoading,
    sendMessage,
    selectConversation,
    deleteConversation,
    startNewChat,
  } = useChat();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={startNewChat}
        onSelectConversation={(id) => {
          selectConversation(id);
          closeSidebar();
        }}
        onDeleteConversation={deleteConversation}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="font-semibold text-gray-800">AI Chat Assistant</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatInterface
            messages={currentConversation?.messages || []}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
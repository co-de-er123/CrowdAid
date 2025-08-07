import React, { createContext, useContext, ReactNode, useReducer, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { Message, Conversation, ChatState } from '../types';

interface ChatContextType extends ReturnType<typeof useChat> {
  // Additional context methods can be added here
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const chat = useChat();

  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

// Helper hook for components that only need to access the chat state
export const useChatState = (): ChatState => {
  const { conversations, currentConversation, messages, unreadCount } = useChatContext();
  return { conversations, currentConversation, messages, unreadCount };
};

// Helper hook for components that need to send messages
export const useChatActions = () => {
  const { 
    sendMessage, 
    createConversation, 
    setActiveConversation, 
    markAsRead 
  } = useChatContext();

  return {
    sendMessage,
    createConversation,
    setActiveConversation,
    markAsRead,
  };
};

export default ChatContext;

import React from 'react';
import { ChatProvider as Provider } from './contexts/ChatContext';

interface ChatProviderProps {
  children: React.ReactNode;
}

/**
 * ChatProvider component that wraps the application with chat context
 * and handles WebSocket connection management.
 */
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  return (
    <Provider>
      {children}
    </Provider>
  );
};

export default ChatProvider;

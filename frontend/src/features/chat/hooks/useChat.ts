import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Message, Conversation, ChatState, SendMessagePayload } from '../types';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';

export const useChat = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      switch (data.type) {
        case 'MESSAGE':
          handleNewMessage(data.payload as Message);
          break;
        case 'CONVERSATION_UPDATE':
          handleConversationUpdate(data.payload as Conversation);
          break;
        case 'CONVERSATIONS_LIST':
          setConversations(data.payload as Conversation[]);
          break;
        case 'MESSAGES_LIST':
          setMessages(data.payload as Message[]);
          break;
        case 'ERROR':
          setError(data.message || 'An error occurred');
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
      setError('Failed to process message');
    }
  }, []);

  // Handle new incoming message
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Update conversation's last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
          : conv
      )
    );
    
    // Update unread count if not in current conversation
    if (currentConversation?.id !== message.conversationId) {
      setUnreadCount(prev => prev + 1);
    }
  }, [currentConversation]);

  // Handle conversation updates
  const handleConversationUpdate = useCallback((conversation: Conversation) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.id === conversation.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = conversation;
        return updated;
      }
      return [...prev, conversation];
    });
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(`${WS_URL}?token=${token}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimeout.current = setTimeout(connect, delay);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Trying to reconnect...');
    };

    ws.current.onmessage = handleMessage;

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [token, handleMessage]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (token) {
      connect();
    }
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [token, connect]);

  // Send a message
  const sendMessage = useCallback((content: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to chat server');
      return false;
    }

    if (!currentConversation) {
      setError('No conversation selected');
      return false;
    }

    const message: SendMessagePayload = {
      content,
      conversationId: currentConversation.id,
    };

    try {
      ws.current.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        payload: message,
      }));
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [currentConversation]);

  // Create a new conversation
  const createConversation = useCallback((participantIds: string[], initialMessage?: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to chat server');
      return null;
    }

    const payload = {
      participantIds,
      initialMessage,
    };

    try {
      ws.current.send(JSON.stringify({
        type: 'CREATE_CONVERSATION',
        payload,
      }));
      return true;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
      return false;
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback((conversationId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to chat server');
      return false;
    }

    try {
      ws.current.send(JSON.stringify({
        type: 'GET_MESSAGES',
        payload: { conversationId },
      }));
      return true;
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
      return false;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback((conversationId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      ws.current.send(JSON.stringify({
        type: 'MARK_AS_READ',
        payload: { conversationId },
      }));
      
      // Optimistically update the UI
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error marking messages as read:', err);
      return false;
    }
  }, []);

  // Set current conversation and load its messages
  const setActiveConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      loadMessages(conversationId);
      markAsRead(conversationId);
      
      // If this conversation had unread messages, update the unread count
      if (conversation.unreadCount > 0) {
        setUnreadCount(prev => Math.max(0, prev - conversation.unreadCount));
      }
      
      return true;
    }
    return false;
  }, [conversations, loadMessages, markAsRead]);

  return {
    isConnected,
    error,
    conversations,
    currentConversation,
    messages,
    unreadCount,
    sendMessage,
    createConversation,
    setActiveConversation,
    markAsRead,
  };
};

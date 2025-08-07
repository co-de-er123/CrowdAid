export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isRead: boolean;
  conversationId: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  participantNames: Record<string, string>; // Map of user IDs to names
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> Message[]
  isLoading: boolean;
  error: string | null;
}

export interface SendMessagePayload {
  content: string;
  conversationId?: string; // Optional for new conversations
  recipientId?: string; // Required for new conversations
}

export interface NewConversationPayload {
  participantIds: string[];
  initialMessage?: string;
}

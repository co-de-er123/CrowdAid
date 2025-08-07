import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  IconButton, 
  Paper, 
  Divider, 
  Avatar, 
  Badge,
  useTheme,
  useMediaQuery,
  Button,
  Drawer,
} from '@mui/material';
import { 
  Send as SendIcon, 
  Menu as MenuIcon, 
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useChatContext } from '../contexts/ChatContext';
import { Message as MessageType } from '../types';

// Message component for individual chat messages
const Message: React.FC<{ message: MessageType; isCurrentUser: boolean }> = ({ 
  message, 
  isCurrentUser 
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          p: 2,
          borderRadius: 2,
          bgcolor: isCurrentUser ? 'primary.main' : 'grey.200',
          color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
          wordBreak: 'break-word',
        }}
      >
        {!isCurrentUser && (
          <Typography variant="caption" display="block" color="text.secondary">
            {message.senderName}
          </Typography>
        )}
        <Typography>{message.content}</Typography>
        <Typography 
          variant="caption" 
          display="block" 
          textAlign="right"
          color={isCurrentUser ? 'primary.contrastText' : 'text.secondary'}
          sx={{ opacity: 0.8, mt: 0.5 }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
    </Box>
  );
};

// Conversation list item component
const ConversationItem: React.FC<{ 
  conversation: any; 
  isSelected: boolean; 
  onClick: () => void;
  currentUserId: string;
}> = ({ conversation, isSelected, onClick, currentUserId }) => {
  const otherParticipants = conversation.participants
    .filter((p: string) => p !== currentUserId)
    .map((p: string) => conversation.participantNames[p] || 'Unknown User');

  const displayName = otherParticipants.length > 0 
    ? otherParticipants.join(', ')
    : 'No participants';

  return (
    <ListItem 
      button 
      selected={isSelected}
      onClick={onClick}
      sx={{
        borderRadius: 1,
        mb: 1,
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Badge 
        badgeContent={conversation.unreadCount} 
        color="error" 
        invisible={conversation.unreadCount === 0}
        sx={{ mr: 2 }}
      >
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {otherParticipants.length > 1 ? (
            <GroupIcon />
          ) : (
            <PersonIcon />
          )}
        </Avatar>
      </Badge>
      <ListItemText 
        primary={displayName}
        secondary={
          conversation.lastMessage
            ? conversation.lastMessage.content.length > 30
              ? `${conversation.lastMessage.content.substring(0, 30)}...`
              : conversation.lastMessage.content
            : 'No messages yet'
        }
        primaryTypographyProps={{
          fontWeight: isSelected ? 'bold' : 'normal',
        }}
      />
    </ListItem>
  );
};

// Main Chat component
export const Chat: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [message, setMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    conversations, 
    currentConversation, 
    messages, 
    sendMessage, 
    setActiveConversation,
    isConnected,
    unreadCount,
  } = useChatContext();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentConversation) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Show loading state
  if (!isConnected) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        flexDirection="column"
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Connecting to chat...
        </Typography>
      </Box>
    );
  }

  // Show empty state if no conversation is selected
  if (!currentConversation && conversations.length > 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        flexDirection="column"
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Select a conversation to start chatting
        </Typography>
        {isMobile && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setDrawerOpen(true)}
            sx={{ mt: 2 }}
          >
            Browse Conversations
          </Button>
        )}
      </Box>
    );
  }

  // Show empty state if no conversations exist
  if (conversations.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        flexDirection="column"
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No conversations yet
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Start a new conversation to begin messaging
        </Typography>
      </Box>
    );
  }

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const otherParticipants = currentConversation?.participants
    .filter((p: string) => p !== currentUser.id)
    .map((p: string) => currentConversation.participantNames[p] || 'Unknown User');

  const chatHeader = (
    <Box 
      display="flex" 
      alignItems="center" 
      p={2} 
      borderBottom={1} 
      borderColor="divider"
      bgcolor="background.paper"
    >
      {isMobile && (
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>
      )}
      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
        {otherParticipants?.length > 1 ? <GroupIcon /> : <PersonIcon />}
      </Avatar>
      <Typography variant="h6">
        {otherParticipants?.join(', ') || 'Chat'}
      </Typography>
    </Box>
  );

  const conversationList = (
    <Box sx={{ width: isMobile ? 300 : '100%', height: '100%', overflow: 'auto' }}>
      <List>
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={currentConversation?.id === conversation.id}
            onClick={() => handleConversationSelect(conversation.id)}
            currentUserId={currentUser?.id || ''}
          />
        ))}
      </List>
    </Box>
  );

  const messageArea = (
    <Box 
      display="flex" 
      flexDirection="column" 
      height="100%"
      bgcolor="background.default"
    >
      {chatHeader}
      
      <Box 
        flexGrow={1} 
        p={2} 
        sx={{ overflowY: 'auto' }}
      >
        {messages.map((msg) => (
          <Message 
            key={msg.id} 
            message={msg} 
            isCurrentUser={msg.senderId === currentUser?.id} 
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box 
        component="form" 
        onSubmit={handleSendMessage}
        p={2}
        borderTop={1}
        borderColor="divider"
        bgcolor="background.paper"
      >
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            multiline
            maxRows={4}
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton 
            color="primary" 
            type="submit" 
            disabled={!message.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box display="flex" height="100vh" bgcolor="background.default">
      {/* Desktop View */}
      {!isMobile && (
        <>
          <Box width={300} borderRight={1} borderColor="divider" bgcolor="background.paper">
            {conversationList}
          </Box>
          <Box flexGrow={1}>
            {messageArea}
          </Box>
        </>
      )}

      {/* Mobile View */}
      {isMobile && (
        <>
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 300,
                boxSizing: 'border-box',
              },
            }}
          >
            {conversationList}
          </Drawer>
          
          <Box flexGrow={1}>
            {messageArea}
          </Box>
          
          {/* Floating button to open conversations */}
          {!drawerOpen && (
            <Box
              position="fixed"
              bottom={16}
              right={16}
              zIndex={1000}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                invisible={unreadCount === 0}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setDrawerOpen(true)}
                  startIcon={<MenuIcon />}
                  sx={{
                    borderRadius: '50%',
                    minWidth: '56px',
                    height: '56px',
                    padding: 0,
                  }}
                />
              </Badge>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Chat;

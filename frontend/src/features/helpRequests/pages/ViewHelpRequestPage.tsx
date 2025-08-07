import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  CircularProgress, 
  Alert, 
  Button, 
  useTheme, 
  useMediaQuery,
  IconButton,
  Paper,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { HelpRequest, User } from '../../../types';
import helpRequestService from '../../../services/helpRequestService';
import { useAuth } from '../../../contexts/AuthContext';

const ViewHelpRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState<boolean>(false);
  
  const isRequestOwner = helpRequest?.userId === user?.id;
  const isVolunteer = helpRequest?.volunteers?.some(v => v.id === user?.id) || false;
  const canVolunteer = !isRequestOwner && !isVolunteer;

  // Fetch help request data
  const fetchHelpRequest = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await helpRequestService.getHelpRequestById(parseInt(id));
      setHelpRequest(data);
      
    } catch (err) {
      console.error('Error fetching help request:', err);
      setError('Failed to load help request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !message.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, you would send the message to the server
      // For now, we'll just add it to the local state
      const newMessage = {
        id: Date.now().toString(),
        content: message,
        sender: user,
        senderId: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add the message to the help request
      setHelpRequest(prev => ({
        ...prev!,
        messages: [...(prev?.messages || []), newMessage]
      }));
      
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle volunteering for the request
  const handleVolunteer = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      if (isVolunteer) {
        await helpRequestService.cancelVolunteering(parseInt(id));
      } else {
        await helpRequestService.volunteerForRequest(parseInt(id));
      }
      
      // Refresh the request data
      await fetchHelpRequest();
      setVolunteerDialogOpen(false);
    } catch (err) {
      console.error('Error updating volunteer status:', err);
      setError('Failed to update volunteer status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusChange = async (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    if (!id) return;
    
    try {
      setLoading(true);
      const updatedRequest = await helpRequestService.updateRequestStatus(parseInt(id), status);
      setHelpRequest(updatedRequest);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await helpRequestService.deleteHelpRequest(parseInt(id));
      navigate('/help-requests');
    } catch (err) {
      console.error('Error deleting help request:', err);
      setError('Failed to delete help request. Please try again.');
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchHelpRequest();
  }, [id]);

  // Loading state
  if (loading && !helpRequest) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchHelpRequest}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/help-requests" 
          startIcon={<BackIcon />}
        >
          Back to Help Requests
        </Button>
      </Container>
    );
  }

  // Not found state
  if (!helpRequest) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Help request not found.
        </Alert>
        <Button 
          component={RouterLink} 
          to="/help-requests" 
          startIcon={<BackIcon />}
        >
          Back to Help Requests
        </Button>
      </Container>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  // Render status action buttons
  const renderStatusActions = () => {
    if (!isRequestOwner) return null;
    
    switch (helpRequest.status) {
      case 'PENDING':
        return (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleStatusChange('IN_PROGRESS')}
            disabled={loading}
            sx={{ mr: 1, mb: 1 }}
          >
            Mark as In Progress
          </Button>
        );
      case 'IN_PROGRESS':
        return (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleStatusChange('COMPLETED')}
            disabled={loading}
            sx={{ mr: 1, mb: 1 }}
          >
            Mark as Completed
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button and title */}
      <Box display="flex" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <IconButton 
          component={RouterLink} 
          to="/help-requests" 
          aria-label="go back"
          sx={{ mr: 1 }}
        >
          <BackIcon />
        </IconButton>
        
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {helpRequest.title}
        </Typography>
        
        {isRequestOwner && (
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              component={RouterLink}
              to={`/help-requests/${id}/edit`}
              variant="outlined"
              startIcon={<EditIcon />}
              disabled={loading}
              size={isMobile ? 'small' : 'medium'}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading || isDeleting}
              size={isMobile ? 'small' : 'medium'}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Status and priority chips */}
      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        <Chip 
          label={helpRequest.status.replace('_', ' ')}
          color={getStatusColor(helpRequest.status) as any}
          sx={{ textTransform: 'capitalize' }}
        />
        <Chip 
          label={`Priority: ${helpRequest.priority}`}
          color={getPriorityColor(helpRequest.priority) as any}
          variant="outlined"
        />
        {helpRequest.category && (
          <Chip 
            label={helpRequest.category}
            variant="outlined"
          />
        )}
      </Box>
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left column - Request details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>
              {helpRequest.description}
            </Typography>
            
            {/* Images */}
            {helpRequest.images && helpRequest.images.length > 0 && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Photos
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {helpRequest.images.map((image, index) => (
                    <Box 
                      key={index} 
                      component="img"
                      src={image.url}
                      alt={`Help request ${index + 1}`}
                      sx={{
                        width: 150,
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.9,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Status actions */}
            <Box mt={3}>
              {renderStatusActions()}
              
              {helpRequest.status === 'PENDING' && isRequestOwner && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleStatusChange('CANCELLED')}
                  disabled={loading}
                  sx={{ mb: 1 }}
                >
                  Cancel Request
                </Button>
              )}
              
              {canVolunteer && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setVolunteerDialogOpen(true)}
                  disabled={loading}
                  sx={{ mb: 1 }}
                >
                  Volunteer to Help
                </Button>
              )}
              
              {isVolunteer && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setVolunteerDialogOpen(true)}
                  disabled={loading}
                  sx={{ mb: 1 }}
                >
                  Cancel Volunteering
                </Button>
              )}
            </Box>
          </Paper>
          
          {/* Messages */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Messages
            </Typography>
            
            {helpRequest.messages && helpRequest.messages.length > 0 ? (
              <List sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                {helpRequest.messages.map((msg) => (
                  <ListItem 
                    key={msg.id} 
                    alignItems="flex-start"
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: msg.senderId === user?.id ? 'action.hover' : 'background.paper',
                      alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={0.5} width="100%">
                      <Avatar 
                        src={msg.sender?.avatar} 
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        {msg.sender?.name?.[0]}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {msg.senderId === user?.id ? 'You' : msg.sender?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {format(new Date(msg.createdAt), 'MMM d, yyyy h:mm a')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 4, whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <MessageIcon color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No messages yet. Be the first to send a message!
                </Typography>
              </Box>
            )}
            
            {/* Message input */}
            <Box component="form" onSubmit={handleSendMessage} display="flex" gap={1} mt={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                maxRows={4}
                size="small"
                disabled={isSubmitting || !user}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!message.trim() || isSubmitting || !user}
                sx={{ height: '40px', alignSelf: 'flex-end' }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : <SendIcon />}
              </Button>
            </Box>
            
            {!user && (
              <Typography variant="body2" color="text.secondary" mt={1} textAlign="center">
                Please <RouterLink to="/login">sign in</RouterLink> to send a message.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Right column - Details and volunteers */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Details
            </Typography>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1">
                {helpRequest.status.replace('_', ' ')}
              </Typography>
            </Box>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Priority
              </Typography>
              <Typography variant="body1">
                {helpRequest.priority}
              </Typography>
            </Box>
            
            {helpRequest.category && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {helpRequest.category}
                </Typography>
              </Box>
            )}
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon color="action" fontSize="small" />
                <Typography variant="body1">
                  {helpRequest.location?.address || 'Not specified'}
                </Typography>
              </Box>
            </Box>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <TimeIcon color="action" fontSize="small" />
                <Typography variant="body1">
                  {format(new Date(helpRequest.createdAt), 'MMM d, yyyy h:mm a')}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                ({formatDistanceToNow(new Date(helpRequest.createdAt), { addSuffix: true })})
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Created By
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Avatar 
                  src={helpRequest.user?.avatar} 
                  sx={{ width: 32, height: 32 }}
                >
                  {helpRequest.user?.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1">
                    {helpRequest.user?.name || 'Unknown User'}
                  </Typography>
                  {!isRequestOwner && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<MessageIcon />}
                      component={RouterLink}
                      to={`/messages?userId=${helpRequest.userId}`}
                      sx={{ mt: 0.5 }}
                    >
                      Message
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Volunteers */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Volunteers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {helpRequest.volunteers?.length || 0} volunteers
              </Typography>
            </Box>
            
            {helpRequest.volunteers && helpRequest.volunteers.length > 0 ? (
              <List>
                {helpRequest.volunteers.map((volunteer) => (
                  <ListItem 
                    key={volunteer.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={volunteer.avatar}>
                        {volunteer.name?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={volunteer.name} 
                      secondary={volunteer.email}
                    />
                    {!isRequestOwner && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<MessageIcon />}
                        component={RouterLink}
                        to={`/messages?userId=${volunteer.id}`}
                      >
                        Message
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={2}>
                <PersonIcon color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No volunteers yet.
                </Typography>
                {!isRequestOwner && !isVolunteer && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setVolunteerDialogOpen(true)}
                    sx={{ mt: 1 }}
                  >
                    Be the first to volunteer
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Help Request</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this help request? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Volunteer Confirmation Dialog */}
      <Dialog
        open={volunteerDialogOpen}
        onClose={() => setVolunteerDialogOpen(false)}
      >
        <DialogTitle>
          {isVolunteer ? 'Cancel Volunteering' : 'Volunteer to Help'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {isVolunteer 
              ? 'Are you sure you want to cancel your volunteering for this request?'
              : 'Are you sure you want to volunteer to help with this request?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVolunteerDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleVolunteer} 
            color={isVolunteer ? 'error' : 'primary'}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : isVolunteer ? 'Cancel Volunteering' : 'Volunteer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewHelpRequestPage;

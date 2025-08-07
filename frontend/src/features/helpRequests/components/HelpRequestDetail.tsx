import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Button, 
  Divider, 
  CircularProgress, 
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  CardMedia
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
  Help as HelpIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { HelpRequest, User } from '../../../types';
import helpRequestService from '../../../services/helpRequestService';
import { useAuth } from '../../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-request-tabpanel-${index}`}
      aria-labelledby={`help-request-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const HelpRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [isVolunteered, setIsVolunteered] = useState<boolean>(false);
  const [isRequestOwner, setIsRequestOwner] = useState<boolean>(false);

  const fetchHelpRequest = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const request = await helpRequestService.getHelpRequestById(parseInt(id));
      setHelpRequest(request);
      
      // Check if current user is the request owner
      setIsRequestOwner(user?.id === request.userId);
      
      // Check if current user is a volunteer
      const volunteerIds = request.volunteers?.map(v => v.id) || [];
      setIsVolunteered(volunteerIds.includes(user?.id || ''));
      
      // Fetch messages
      const messagesData = await helpRequestService.getMessages(parseInt(id));
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      
      // Set volunteers
      setVolunteers(request.volunteers || []);
      
    } catch (err) {
      console.error('Error fetching help request:', err);
      setError('Failed to load help request details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpRequest();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await helpRequestService.deleteHelpRequest(parseInt(id));
      navigate('/help-requests');
    } catch (err) {
      console.error('Error deleting help request:', err);
      setError('Failed to delete help request. Please try again.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleVolunteer = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      if (isVolunteered) {
        await helpRequestService.cancelVolunteering(parseInt(id));
      } else {
        await helpRequestService.volunteerForRequest(parseInt(id));
      }
      
      await fetchHelpRequest(); // Refresh the request data
      setVolunteerDialogOpen(false);
    } catch (err) {
      console.error('Error updating volunteer status:', err);
      setError('Failed to update volunteer status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !message.trim()) return;
    
    try {
      const newMessage = await helpRequestService.addMessage(parseInt(id), { content: message });
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

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

  if (loading && !helpRequest) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchHelpRequest} color="inherit" size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  if (!helpRequest) {
    return (
      <Alert severity="info">
        Help request not found.
        <Button component={RouterLink} to="/help-requests" color="inherit" size="small">
          Back to list
        </Button>
      </Alert>
    );
  }

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
            sx={{ mr: 1 }}
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
            sx={{ mr: 1 }}
          >
            Mark as Completed
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header with back button and title */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ mr: 1 }}
          aria-label="go back"
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {helpRequest.title}
        </Typography>
        
        <Box flexGrow={1} />
        
        {isRequestOwner && (
          <>
            <Button
              component={RouterLink}
              to={`/help-requests/${id}/edit`}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading}
            >
              Delete
            </Button>
          </>
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
      
      {/* Main content with tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Details" />
          <Tab label={`Messages (${messages.length})`} />
          <Tab label={`Volunteers (${volunteers.length})`} />
          {helpRequest.images?.length > 0 && (
            <Tab label={`Photos (${helpRequest.images.length})`} />
          )}
        </Tabs>
        
        <Divider />
        
        {/* Details Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography paragraph>{helpRequest.description}</Typography>
              
              {helpRequest.images && helpRequest.images.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>Photos</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {helpRequest.images.map((image, index) => (
                      <Card key={index} sx={{ maxWidth: 200 }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={image.url}
                          alt={`Help request image ${index + 1}`}
                        />
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Details</Typography>
                  
                  <Box mb={2} display="flex" alignItems="center" gap={1}>
                    <LocationIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {helpRequest.location?.address || 'Location not specified'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2} display="flex" alignItems="center" gap={1}>
                    <TimeIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Created {formatDistanceToNow(new Date(helpRequest.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                  
                  <Box mb={2} display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Created by: {helpRequest.user?.name || 'Unknown'}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {!isRequestOwner && (
                    <Button
                      fullWidth
                      variant="contained"
                      color={isVolunteered ? 'secondary' : 'primary'}
                      startIcon={isVolunteered ? <CancelIcon /> : <HelpIcon />}
                      onClick={() => setVolunteerDialogOpen(true)}
                      disabled={loading}
                    >
                      {isVolunteered ? 'Cancel Volunteering' : 'Volunteer to Help'}
                    </Button>
                  )}
                  
                  {isRequestOwner && renderStatusActions()}
                  
                  {helpRequest.status === 'PENDING' && isRequestOwner && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleStatusChange('CANCELLED')}
                      disabled={loading}
                      sx={{ mt: 1 }}
                      fullWidth
                    >
                      Cancel Request
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Messages Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box mb={3}>
            <List sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
              {messages.map((msg) => (
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
              
              {messages.length === 0 && (
                <Box textAlign="center" py={4}>
                  <MessageIcon color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No messages yet. Be the first to send a message!
                  </Typography>
                </Box>
              )}
            </List>
            
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
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!message.trim() || loading}
                sx={{ height: '40px', alignSelf: 'flex-end' }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Volunteers Tab */}
        <TabPanel value={activeTab} index={2}>
          {volunteers.length > 0 ? (
            <List>
              {volunteers.map((volunteer) => (
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
                  {isRequestOwner && (
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
            <Box textAlign="center" py={4}>
              <PersonIcon color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No volunteers yet. Be the first to help!
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* Photos Tab */}
        {helpRequest.images?.length > 0 && (
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={2}>
              {helpRequest.images.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.url}
                      alt={`Help request image ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Image {index + 1}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        )}
      </Paper>
      
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Volunteer Confirmation Dialog */}
      <Dialog
        open={volunteerDialogOpen}
        onClose={() => setVolunteerDialogOpen(false)}
      >
        <DialogTitle>
          {isVolunteered ? 'Cancel Volunteering' : 'Volunteer to Help'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {isVolunteered 
              ? 'Are you sure you want to cancel your volunteering for this request?'
              : 'Are you sure you want to volunteer to help with this request?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVolunteerDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleVolunteer} 
            color={isVolunteered ? 'error' : 'primary'}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : isVolunteered ? 'Cancel Volunteering' : 'Volunteer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HelpRequestDetail;

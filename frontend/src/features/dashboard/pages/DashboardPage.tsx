import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Button,
  Skeleton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { HelpRequest, HelpRequestStatus } from '../../../types';
import { helpRequestService } from '../../../services/helpRequestService';
import { useAuth } from '../../../contexts/AuthContext';

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'my-requests' | 'volunteering'>('all');

  // Fetch help requests based on active tab
  const {
    data: helpRequests,
    isLoading,
    error,
  } = useQuery<HelpRequest[]>({
    queryKey: ['helpRequests', activeTab],
    queryFn: async () => {
      switch (activeTab) {
        case 'my-requests':
          return await helpRequestService.getMyHelpRequests();
        case 'volunteering':
          return await helpRequestService.getVolunteeringRequests();
        default:
          return await helpRequestService.getNearbyHelpRequests();
      }
    },
  });

  const handleRequestClick = (requestId: number) => {
    navigate(`/help-requests/${requestId}`);
  };

  const handleCreateRequest = () => {
    navigate('/help-requests/new');
  };

  const getStatusColor = (status: HelpRequestStatus) => {
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

  const getStatusIcon = (status: HelpRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'IN_PROGRESS':
        return <InfoIcon color="info" fontSize="small" />;
      case 'COMPLETED':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'CANCELLED':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  // Quick actions data
  const quickActions = [
    {
      title: 'Create Request',
      description: 'Request help from volunteers',
      icon: <AddIcon color="primary" fontSize="large" />,
      action: handleCreateRequest,
      color: theme.palette.primary.light,
    },
    {
      title: 'View Map',
      description: 'See requests near you',
      icon: <LocationIcon color="secondary" fontSize="large" />,
      action: () => navigate('/map'),
      color: theme.palette.secondary.light,
    },
    {
      title: 'My Messages',
      description: 'Check your conversations',
      icon: <NotificationsIcon color="info" fontSize="large" />,
      action: () => navigate('/messages'),
      color: theme.palette.info.light,
    },
  ];

  // Recent activities data (mocked for now)
  const recentActivities = [
    {
      id: 1,
      type: 'new_request',
      message: 'New help request in your area',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'message',
      message: 'You have a new message from John',
      time: '5 hours ago',
      read: true,
    },
    {
      id: 3,
      type: 'status_update',
      message: 'Your request #1234 is in progress',
      time: '1 day ago',
      read: true,
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load dashboard data. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening in your community.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              onClick={action.action}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: `${action.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Help Requests Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" component="h2">
                {activeTab === 'all'
                  ? 'Nearby Help Requests'
                  : activeTab === 'my-requests'
                  ? 'My Requests'
                  : 'My Volunteering'}
              </Typography>
              <Box>
                <Chip
                  label="All"
                  onClick={() => setActiveTab('all')}
                  variant={activeTab === 'all' ? 'filled' : 'outlined'}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label="My Requests"
                  onClick={() => setActiveTab('my-requests')}
                  variant={activeTab === 'my-requests' ? 'filled' : 'outlined'}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label="Volunteering"
                  onClick={() => setActiveTab('volunteering')}
                  variant={activeTab === 'volunteering' ? 'filled' : 'outlined'}
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>

            {helpRequests && helpRequests.length > 0 ? (
              <Grid container spacing={2}>
                {helpRequests.slice(0, 3).map((request) => (
                  <Grid item xs={12} key={request.id}>
                    <Card
                      sx={{
                        '&:hover': {
                          boxShadow: 3,
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => handleRequestClick(request.id)}
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Box sx={{ display: 'flex', width: '100%' }}>
                          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            {getStatusIcon(request.status)}
                          </Box>
                          <Box sx={{ p: 2, flex: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                              }}
                            >
                              <Typography variant="subtitle1" component="div">
                                {request.title}
                              </Typography>
                              <Chip
                                label={request.status.replace('_', ' ')}
                                size="small"
                                color={getStatusColor(request.status) as any}
                                variant="outlined"
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mb: 1,
                              }}
                            >
                              {request.description}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: 'text.secondary',
                                }}
                              >
                                <LocationIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, fontSize: '1rem' }}
                                />
                                <Typography variant="caption">
                                  {request.location?.address || 'Nearby'}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: 'text.secondary',
                                }}
                              >
                                <TimeIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, fontSize: '1rem' }}
                                />
                                <Typography variant="caption">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                          <ArrowForwardIcon color="action" />
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
                {helpRequests.length > 3 && (
                  <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="text"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() =>
                        navigate(
                          activeTab === 'all'
                            ? '/help-requests'
                            : activeTab === 'my-requests'
                            ? '/help-requests?filter=my-requests'
                            : '/help-requests?filter=volunteering'
                        )
                      }
                    >
                      View all {helpRequests.length} requests
                    </Button>
                  </Box>
                )}
              </Grid>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 4,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {activeTab === 'all'
                    ? 'No help requests found in your area.'
                    : activeTab === 'my-requests'
                    ? "You haven't created any help requests yet."
                    : "You're not volunteering for any requests yet."}
                </Typography>
                {activeTab !== 'all' && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateRequest}
                    sx={{ mt: 2 }}
                  >
                    Create Request
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Recent Activities
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentActivities.length > 0 ? (
              <List disablePadding>
                {recentActivities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 1.5,
                        opacity: activity.read ? 0.7 : 1,
                        '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: activity.read
                              ? 'grey.300'
                              : 'primary.main',
                            color: activity.read ? 'grey.600' : 'primary.contrastText',
                          }}
                        >
                          {activity.type === 'new_request' && <LocationIcon />}
                          {activity.type === 'message' && <NotificationsIcon />}
                          {activity.type === 'status_update' && <CheckCircleIcon />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: activity.read ? 'normal' : 'medium',
                            }}
                          >
                            {activity.message}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {activity.time}
                          </Typography>
                        }
                      />
                      {!activity.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            ml: 1,
                          }}
                        />
                      )}
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No recent activities
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Quick Stats */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Quick Stats
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Active Volunteers"
                  secondary="24 near you"
                />
              </ListItem>
              <Divider component="li" />
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <CheckCircleIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Completed Requests"
                  secondary="128 this month"
                />
              </ListItem>
              <Divider component="li" />
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <WarningIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Urgent Requests"
                  secondary="5 need immediate help"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

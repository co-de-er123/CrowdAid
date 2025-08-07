import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Grid, 
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Help as HelpIcon, 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { HelpRequest } from '../../../types';
import helpRequestService from '../../../services/helpRequestService';
import { formatDistanceToNow } from 'date-fns';

interface HelpRequestListProps {
  showCreateButton?: boolean;
  showFilters?: boolean;
  statusFilter?: string;
  userId?: string;
}

const HelpRequestList: React.FC<HelpRequestListProps> = ({ 
  showCreateButton = true, 
  showFilters = true,
  statusFilter,
  userId
}) => {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status?: string;
    priority?: string;
    category?: string;
  }>({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (userId) {
        // Fetch requests for a specific user
        response = await helpRequestService.getMyHelpRequests();
        setHelpRequests(Array.isArray(response) ? response : []);
      } else if (statusFilter) {
        // Fetch requests with status filter
        response = await helpRequestService.getHelpRequests({ status: statusFilter });
        setHelpRequests(Array.isArray(response?.data) ? response.data : []);
      } else {
        // Fetch all requests with optional filters
        response = await helpRequestService.getHelpRequests(filters);
        setHelpRequests(Array.isArray(response?.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching help requests:', err);
      setError('Failed to load help requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpRequests();
  }, [filters, statusFilter, userId]);

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status
    }));
  };

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

  if (loading && helpRequests.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchHelpRequests} color="inherit" size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  if (helpRequests.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <HelpIcon color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No help requests found
        </Typography>
        {showCreateButton && (
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/help-requests/new"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Create Request
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" component="h2">
            Help Requests
          </Typography>
          <Tooltip title="Refresh">
            <IconButton 
              onClick={fetchHelpRequests}
              size="small"
              disabled={loading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          {showCreateButton && (
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/help-requests/new"
              startIcon={<AddIcon />}
              size={isMobile ? 'small' : 'medium'}
            >
              {isMobile ? 'New' : 'New Request'}
            </Button>
          )}
          
          {showFilters && (
            <Tooltip title="Filter">
              <IconButton size={isMobile ? 'small' : 'medium'}>
                <Badge 
                  color="error" 
                  variant="dot" 
                  invisible={Object.keys(filters).length === 0}
                >
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {showFilters && (
        <Box mb={3} display="flex" gap={1} flexWrap="wrap">
          <Chip
            label="All"
            onClick={() => setFilters({ ...filters, status: undefined })}
            color={!filters.status ? 'primary' : 'default'}
            variant={!filters.status ? 'filled' : 'outlined'}
            size="small"
          />
          {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
            <Chip
              key={status}
              label={status.replace('_', ' ')}
              onClick={() => handleStatusFilter(status)}
              color={filters.status === status ? 'primary' : 'default'}
              variant={filters.status === status ? 'filled' : 'outlined'}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Box>
      )}

      <Grid container spacing={2}>
        {helpRequests.map((request) => (
          <Grid item xs={12} key={request.id}>
            <Card 
              variant="outlined"
              component={RouterLink}
              to={`/help-requests/${request.id}`}
              sx={{
                display: 'block',
                textDecoration: 'none',
                '&:hover': {
                  boxShadow: 1,
                  borderColor: 'primary.main',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1}>
                  <Typography variant="h6" component="div" noWrap>
                    {request.title}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip 
                      label={request.status.replace('_', ' ')}
                      color={getStatusColor(request.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <Chip 
                      label={request.priority}
                      color={getPriorityColor(request.priority) as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }} noWrap>
                  {request.description}
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationIcon color="action" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      {request.location?.address || 'Location not specified'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TimeIcon color="action" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                  
                  {request.category && (
                    <Chip 
                      label={request.category}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    {request.volunteerCount || 0} volunteers
                  </Typography>
                </Box>
                
                <Button 
                  size="small" 
                  color="primary"
                  endIcon={<HelpIcon fontSize="small" />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Handle volunteer action
                  }}
                >
                  Help Out
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HelpRequestList;

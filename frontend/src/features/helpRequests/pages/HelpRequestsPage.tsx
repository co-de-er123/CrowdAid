import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  useTheme, 
  useMediaQuery,
  Tabs,
  Tab,
  Paper,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import HelpRequestList from '../components/HelpRequestList';
import { HelpRequest } from '../../../types';
import helpRequestService from '../../../services/helpRequestService';

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
      id={`help-requests-tabpanel-${index}`}
      aria-labelledby={`help-requests-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const HelpRequestsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([]);
  const [volunteeringRequests, setVolunteeringRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's help requests and volunteering requests
  const fetchUserRequests = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch requests created by the current user
      const myReqs = await helpRequestService.getMyHelpRequests();
      setMyRequests(Array.isArray(myReqs) ? myReqs : []);
      
      // Fetch requests where the user is a volunteer
      const volunteeringReqs = await helpRequestService.getVolunteeringRequests();
      setVolunteeringRequests(Array.isArray(volunteeringReqs) ? volunteeringReqs : []);
      
    } catch (err) {
      console.error('Error fetching user requests:', err);
      setError('Failed to load your requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle request created/updated
  const handleRequestUpdated = () => {
    fetchUserRequests();
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserRequests();
    }
  }, [isAuthenticated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/help-requests' } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          flexWrap="wrap"
          gap={2}
          mb={3}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Help Requests
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/help-requests/new"
            startIcon={<AddIcon />}
            size={isMobile ? 'medium' : 'large'}
          >
            {isMobile ? 'New' : 'New Request'}
          </Button>
        </Box>
        
        <Paper sx={{ mb: 3, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTabs-flexContainer': {
                px: 2,
              },
            }}
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>All Requests</span>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>My Requests</span>
                  {myRequests.length > 0 && (
                    <Box 
                      component="span"
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      {myRequests.length}
                    </Box>
                  )}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>Volunteering</span>
                  {volunteeringRequests.length > 0 && (
                    <Box 
                      component="span"
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      {volunteeringRequests.length}
                    </Box>
                  )}
                </Box>
              } 
            />
          </Tabs>
        </Paper>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={fetchUserRequests} color="inherit" size="small">
            Retry
          </Button>
        </Alert>
      )}
      
      <TabPanel value={activeTab} index={0}>
        <HelpRequestList 
          showCreateButton={false} 
          showFilters={true}
        />
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : myRequests.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Box 
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'action.hover',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <SearchIcon color="disabled" fontSize="large" />
            </Box>
            <Typography variant="h6" gutterBottom>
              No help requests found
            </Typography>
            <Typography color="textSecondary" paragraph>
              You haven't created any help requests yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/help-requests/new"
              startIcon={<AddIcon />}
              sx={{ mt: 1 }}
            >
              Create Your First Request
            </Button>
          </Box>
        ) : (
          <HelpRequestList 
            helpRequests={myRequests}
            showCreateButton={false}
            onRequestUpdated={handleRequestUpdated}
          />
        )}
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : volunteeringRequests.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Box 
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'action.hover',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <SearchIcon color="disabled" fontSize="large" />
            </Box>
            <Typography variant="h6" gutterBottom>
              No volunteering found
            </Typography>
            <Typography color="textSecondary" paragraph>
              You haven't volunteered for any help requests yet.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/help-requests"
              startIcon={<SearchIcon />}
              sx={{ mt: 1 }}
            >
              Browse Requests
            </Button>
          </Box>
        ) : (
          <HelpRequestList 
            helpRequests={volunteeringRequests}
            showCreateButton={false}
            onRequestUpdated={handleRequestUpdated}
          />
        )}
      </TabPanel>
    </Container>
  );
};

export default HelpRequestsPage;

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Paper, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  FormHelperText, 
  Grid, 
  CircularProgress,
  IconButton,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Switch,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  CloudUpload as UploadIcon, 
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field, FieldProps, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../contexts/AuthContext';
import helpRequestService from '../../../services/helpRequestService';
import { HelpRequest, HelpRequestPriority, HelpRequestCategory } from '../../../types';

// Form validation schema
const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  category: Yup.string()
    .required('Category is required'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['LOW', 'MEDIUM', 'HIGH']),
  location: Yup.object({
    address: Yup.string()
      .required('Address is required')
      .max(500, 'Address must be at most 500 characters'),
    latitude: Yup.number()
      .required('Location is required')
      .typeError('Please select a valid location from the suggestions'),
    longitude: Yup.number()
      .required('Location is required')
      .typeError('Please select a valid location from the suggestions'),
  }),
  images: Yup.array()
    .of(Yup.mixed())
    .max(5, 'You can upload up to 5 images')
    .nullable(),
  isAnonymous: Yup.boolean()
    .default(false),
});

// Reuse the LocationSearch and ImageUpload components from CreateHelpRequestPage
// In a real app, you would extract these into shared components
// For now, we'll just import them from the CreateHelpRequestPage
import { LocationSearch, ImageUpload } from './CreateHelpRequestPage';

// Main component
const EditHelpRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch help request data
  useEffect(() => {
    const fetchHelpRequest = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await helpRequestService.getHelpRequestById(parseInt(id));
        
        // Check if the current user is the owner of the request
        if (data.userId !== user?.id) {
          enqueueSnackbar('You are not authorized to edit this request', { variant: 'error' });
          navigate(`/help-requests/${id}`);
          return;
        }
        
        setHelpRequest(data);
      } catch (err) {
        console.error('Error fetching help request:', err);
        setError('Failed to load help request. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHelpRequest();
  }, [id, user?.id, navigate, enqueueSnackbar]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (!id || !user) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('category', values.category);
      formData.append('priority', values.priority);
      formData.append('location', JSON.stringify(values.location));
      formData.append('isAnonymous', String(values.isAnonymous));
      
      // Append new images if any
      if (values.images && values.images.length > 0) {
        values.images.forEach((file: File) => {
          if (file instanceof File) {
            formData.append(`images`, file);
          }
        });
      }
      
      // Update the help request
      const updatedRequest = await helpRequestService.updateHelpRequest(parseInt(id), formData);
      
      // Show success message
      enqueueSnackbar('Help request updated successfully!', { variant: 'success' });
      
      // Redirect to the updated help request
      navigate(`/help-requests/${updatedRequest.id}`);
      
    } catch (error) {
      console.error('Error updating help request:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update help request. Please try again.',
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await helpRequestService.deleteHelpRequest(parseInt(id));
      
      // Show success message
      enqueueSnackbar('Help request deleted successfully!', { variant: 'success' });
      
      // Redirect to the help requests list
      navigate('/help-requests');
    } catch (error) {
      console.error('Error deleting help request:', error);
      enqueueSnackbar('Failed to delete help request. Please try again.', { variant: 'error' });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error || !helpRequest) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error || 'Help request not found'}
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

  // Initial form values
  const initialValues = {
    title: helpRequest.title,
    description: helpRequest.description,
    category: helpRequest.category,
    priority: helpRequest.priority,
    location: helpRequest.location || {
      address: '',
      latitude: null as number | null,
      longitude: null as number | null,
    },
    images: [] as File[],
    existingImages: helpRequest.images || [],
    isAnonymous: helpRequest.isAnonymous || false,
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button
          component={RouterLink}
          to={`/help-requests/${id}`}
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Request
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Edit Help Request
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update the details of your help request below.
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isSubmitting || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Request'}
          </Button>
        </Box>
      </Box>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting: isFormSubmitting }) => (
          <Form>
            <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Request Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field name="title">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Title"
                        placeholder="Briefly describe what help you need"
                        variant="outlined"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={isFormSubmitting}
                        required
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12}>
                  <Field name="description">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description"
                        placeholder="Provide detailed information about the help you need"
                        multiline
                        rows={6}
                        variant="outlined"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={
                          meta.touched && meta.error 
                            ? meta.error 
                            : 'Be specific about what kind of help you need and any requirements'
                        }
                        disabled={isFormSubmitting}
                        required
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="category">
                    {({ field, meta }: FieldProps) => (
                      <FormControl 
                        fullWidth 
                        error={meta.touched && Boolean(meta.error)}
                        disabled={isFormSubmitting}
                        required
                      >
                        <InputLabel>Category</InputLabel>
                        <Select
                          {...field}
                          label="Category"
                        >
                          <MenuItem value="FOOD">Food & Groceries</MenuItem>
                          <MenuItem value="MEDICAL">Medical Assistance</MenuItem>
                          <MenuItem value="SHELTER">Shelter & Housing</MenuItem>
                          <MenuItem value="TRANSPORT">Transportation</MenuItem>
                          <MenuItem value="EDUCATION">Education</MenuItem>
                          <MenuItem value="COMMUNITY">Community Support</MenuItem>
                          <MenuItem value="OTHER">Other</MenuItem>
                        </Select>
                        <FormHelperText>
                          {meta.touched && meta.error 
                            ? meta.error 
                            : 'Select the most relevant category for your request'}
                        </FormHelperText>
                      </FormControl>
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="priority">
                    {({ field, meta }: FieldProps) => (
                      <FormControl 
                        fullWidth 
                        error={meta.touched && Boolean(meta.error)}
                        disabled={isFormSubmitting}
                        required
                      >
                        <InputLabel>Priority</InputLabel>
                        <Select
                          {...field}
                          label="Priority"
                        >
                          <MenuItem value="LOW">Low - Not urgent</MenuItem>
                          <MenuItem value="MEDIUM">Medium - Important but not critical</MenuItem>
                          <MenuItem value="HIGH">High - Urgent help needed</MenuItem>
                        </Select>
                        <FormHelperText>
                          {meta.touched && meta.error 
                            ? meta.error 
                            : 'How urgent is your request?'}
                        </FormHelperText>
                      </FormControl>
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                  <LocationSearch />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Images (Optional)
                  </Typography>
                  
                  {/* Show existing images */}
                  {values.existingImages && values.existingImages.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Current images (click to remove):
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={2}>
                        {values.existingImages.map((image, index) => (
                          <Box key={index} position="relative">
                            <Box
                              component="img"
                              src={image.url}
                              alt={`Image ${index + 1}`}
                              sx={{
                                width: 100,
                                height: 100,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                opacity: values.existingImages[index]?.markedForDeletion ? 0.5 : 1,
                              }}
                              onClick={() => {
                                // Toggle marked for deletion
                                const updated = [...values.existingImages];
                                updated[index] = {
                                  ...updated[index],
                                  markedForDeletion: !updated[index]?.markedForDeletion
                                };
                                setFieldValue('existingImages', updated);
                              }}
                            />
                            {values.existingImages[index]?.markedForDeletion && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  backgroundColor: 'rgba(244, 67, 54, 0.8)',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: 24,
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                      <FormHelperText>
                        Click on an image to mark it for deletion. Changes will be saved when you submit the form.
                      </FormHelperText>
                    </Box>
                  )}
                  
                  {/* Upload new images */}
                  <ImageUpload />
                </Grid>
                
                <Grid item xs={12}>
                  <Field name="isAnonymous">
                    {({ field }: FieldProps) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => setFieldValue('isAnonymous', e.target.checked)}
                            disabled={isFormSubmitting}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              Post anonymously
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Your name and profile picture will be hidden from other users
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: 'flex-start', m: 0 }}
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
            </Paper>
            
            <Box 
              display="flex" 
              justifyContent="space-between"
              gap={2}
              flexWrap="wrap"
              sx={{ '& > *': { flex: isMobile ? '1 1 100%' : '0 0 auto' } }}
            >
              <Button
                component={RouterLink}
                to={`/help-requests/${id}`}
                variant="outlined"
                disabled={isFormSubmitting}
                fullWidth={isMobile}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isFormSubmitting}
                startIcon={isFormSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                fullWidth={isMobile}
              >
                {isFormSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Help Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this help request? This action cannot be undone.
            All associated data, including messages and volunteer information, will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditHelpRequestPage;

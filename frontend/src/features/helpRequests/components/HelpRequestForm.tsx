import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Save as SaveIcon, 
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { HelpRequest, CreateHelpRequestDto, UpdateHelpRequestDto } from '../../../types';
import helpRequestService from '../../../services/helpRequestService';
import { useAuth } from '../../../contexts/AuthContext';
import { useGeolocation } from '../../../hooks/useGeolocation';

// Define validation schema using Yup
const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  category: Yup.string()
    .required('Category is required'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['LOW', 'MEDIUM', 'HIGH'], 'Invalid priority'),
  location: Yup.object({
    address: Yup.string().required('Location is required'),
    coordinates: Yup.object({
      lat: Yup.number().required(),
      lng: Yup.number().required()
    })
  })
});

// Define categories for help requests
const categories = [
  'Medical',
  'Food & Water',
  'Shelter',
  'Clothing',
  'Transportation',
  'Search & Rescue',
  'Other'
];

interface HelpRequestFormProps {
  initialData?: HelpRequest;
  isEdit?: boolean;
}

const HelpRequestForm: React.FC<HelpRequestFormProps> = ({ 
  initialData, 
  isEdit = false 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Use geolocation hook to get current location
  const { 
    location: currentLocation, 
    loading: locationLoading, 
    error: locationErrorMsg 
  } = useGeolocation();

  // Initialize form with formik
  const formik = useFormik({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      priority: initialData?.priority || 'MEDIUM',
      location: initialData?.location || {
        address: '',
        coordinates: {
          lat: 0,
          lng: 0
        }
      }
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        // Prepare form data for submission
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('category', values.category);
        formData.append('priority', values.priority);
        formData.append('location', JSON.stringify(values.location));
        
        // Append images if any
        images.forEach((image) => {
          formData.append('images', image);
        });
        
        let response;
        
        if (isEdit && id) {
          // Update existing help request
          response = await helpRequestService.updateHelpRequest(parseInt(id), formData as any);
          setSuccess('Help request updated successfully!');
        } else {
          // Create new help request
          response = await helpRequestService.createHelpRequest(formData as any);
          setSuccess('Help request created successfully!');
          
          // Reset form after successful submission
          if (!isEdit) {
            formik.resetForm();
            setImages([]);
            setImagePreviews([]);
          }
        }
        
        // Redirect to the detail page after a short delay
        setTimeout(() => {
          if (response?.id) {
            navigate(`/help-requests/${response.id}`);
          } else if (isEdit && id) {
            navigate(`/help-requests/${id}`);
          } else {
            navigate('/help-requests');
          }
        }, 1500);
        
      } catch (err) {
        console.error('Error saving help request:', err);
        setError(err.response?.data?.message || 'Failed to save help request. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file types and size
      const validFiles = files.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
        
        if (!isValidType) {
          setError('Only JPG, PNG, and GIF images are allowed.');
          return false;
        }
        
        if (!isValidSize) {
          setError('Image size must be less than 5MB.');
          return false;
        }
        
        return true;
      });
      
      // Create preview URLs for the selected images
      const newImagePreviews = validFiles.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...newImagePreviews]);
    }
  };

  // Remove an image from the selection
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Use current location for the form
  const useCurrentLocation = () => {
    if (!currentLocation) {
      setLocationError('Unable to get your current location. Please enter it manually.');
      return;
    }
    
    // Use a geocoding service to get the address from coordinates
    // This is a simplified example - in a real app, you would use a geocoding API
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&zoom=18&addressdetails=1`;
    
    setLocationError(null);
    formik.setFieldValue('location.coordinates.lat', currentLocation.latitude);
    formik.setFieldValue('location.coordinates.lng', currentLocation.longitude);
    
    // Fetch address from coordinates
    fetch(geocodeUrl)
      .then(response => response.json())
      .then(data => {
        const address = data.display_name || 'Current Location';
        formik.setFieldValue('location.address', address);
      })
      .catch(err => {
        console.error('Error getting address:', err);
        formik.setFieldValue('location.address', 'Current Location');
      });
  };

  // Load initial data when in edit mode
  useEffect(() => {
    if (isEdit && id && !initialData) {
      const fetchHelpRequest = async () => {
        try {
          setLoading(true);
          const data = await helpRequestService.getHelpRequestById(parseInt(id));
          
          // Set form values
          formik.setValues({
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            location: data.location || {
              address: '',
              coordinates: { lat: 0, lng: 0 }
            }
          });
          
          // Set image previews if any
          if (data.images && data.images.length > 0) {
            setImagePreviews(data.images.map((img: any) => img.url));
          }
          
        } catch (err) {
          console.error('Error fetching help request:', err);
          setError('Failed to load help request data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchHelpRequest();
    }
  }, [id, isEdit, initialData]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  if (loading && isEdit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton 
          component={RouterLink} 
          to={isEdit && id ? `/help-requests/${id}` : '/help-requests'}
          sx={{ mr: 1 }}
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {isEdit ? 'Edit Help Request' : 'Create New Help Request'}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Title */}
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                margin="normal"
                disabled={loading}
              />
              
              {/* Description */}
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={6}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={
                  formik.touched.description && formik.errors.description
                    ? formik.errors.description
                    : 'Provide detailed information about the help needed'
                }
                margin="normal"
                disabled={loading}
              />
              
              {/* Image Upload */}
              <Box mt={3} mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Add Photos (Optional)
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Upload up to 5 photos to help others understand your request better.
                </Typography>
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  disabled={loading || imagePreviews.length >= 5}
                />
                
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    color="primary"
                    component="span"
                    startIcon={<AddPhotoIcon />}
                    disabled={loading || imagePreviews.length >= 5}
                  >
                    {imagePreviews.length >= 5 ? 'Maximum 5 images' : 'Add Images'}
                  </Button>
                </label>
                
                {/* Image Previews */}
                <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                  {imagePreviews.map((preview, index) => (
                    <Box key={index} position="relative">
                      <Box 
                        component="img"
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #ddd'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: 'error.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'error.dark',
                          },
                          width: 24,
                          height: 24,
                        }}
                        disabled={loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Request Details
                  </Typography>
                  
                  {/* Category */}
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    error={formik.touched.category && Boolean(formik.errors.category)}
                  >
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      name="category"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Category"
                      disabled={loading}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <FormHelperText>{formik.errors.category}</FormHelperText>
                    )}
                  </FormControl>
                  
                  {/* Priority */}
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    error={formik.touched.priority && Boolean(formik.errors.priority)}
                  >
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      labelId="priority-label"
                      id="priority"
                      name="priority"
                      value={formik.values.priority}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Priority"
                      disabled={loading}
                    >
                      <MenuItem value="LOW">Low</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="HIGH">High</MenuItem>
                    </Select>
                    {formik.touched.priority && formik.errors.priority && (
                      <FormHelperText>{formik.errors.priority}</FormHelperText>
                    )}
                  </FormControl>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Location */}
                  <Typography variant="subtitle2" gutterBottom>
                    <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Location
                  </Typography>
                  
                  <Box display="flex" gap={1} mb={1}>
                    <TextField
                      fullWidth
                      id="location.address"
                      name="location.address"
                      placeholder="Enter location or address"
                      value={formik.values.location?.address || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.location?.address && Boolean(formik.errors.location?.address)}
                      helperText={
                        formik.touched.location?.address && formik.errors.location?.address
                          ? formik.errors.location.address
                          : 'Where is help needed?'
                      }
                      margin="none"
                      size="small"
                      disabled={loading}
                    />
                    
                    <Button
                      variant="outlined"
                      onClick={useCurrentLocation}
                      disabled={locationLoading || loading}
                      startIcon={<MyLocationIcon />}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {locationLoading ? 'Locating...' : 'Use My Location'}
                    </Button>
                  </Box>
                  
                  {locationError && (
                    <Typography variant="caption" color="error">
                      {locationError}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" display="block" color="textSecondary">
                    Your exact location will be shared only with volunteers who accept your request.
                  </Typography>
                  
                  {/* Hidden fields for coordinates */}
                  <input 
                    type="hidden" 
                    name="location.coordinates.lat" 
                    value={formik.values.location?.coordinates?.lat || ''} 
                  />
                  <input 
                    type="hidden" 
                    name="location.coordinates.lng" 
                    value={formik.values.location?.coordinates?.lng || ''} 
                  />
                </CardContent>
              </Card>
              
              {/* Submit Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading || formik.isSubmitting}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                {loading || formik.isSubmitting ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEdit ? (
                  'Update Request'
                ) : (
                  'Create Request'
                )}
              </Button>
              
              {!isEdit && (
                <Typography variant="body2" color="textSecondary" align="center" mt={2}>
                  By creating this request, you agree to our Terms of Service and Privacy Policy.
                </Typography>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default HelpRequestForm;

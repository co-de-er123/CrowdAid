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
  FormGroup
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  CloudUpload as UploadIcon, 
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field, FieldProps, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../contexts/AuthContext';
import helpRequestService from '../../../services/helpRequestService';
import { HelpRequestPriority, HelpRequestCategory } from '../../../types';

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
    .of(Yup.string())
    .max(5, 'You can upload up to 5 images')
    .nullable(),
  isAnonymous: Yup.boolean()
    .default(false),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

// Location search component
const LocationSearch: React.FC = () => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{
    place_name: string;
    center: [number, number];
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Handle location search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsSearching(true);
      
      // In a real app, you would call your backend API to search for locations
      // For now, we'll simulate a response
      // Replace this with actual API call to your backend or Mapbox/Google Maps API
      const mockLocations = [
        {
          place_name: '123 Main St, Anytown, USA',
          center: [40.7128, -74.0060] as [number, number]
        },
        {
          place_name: '456 Oak Ave, Somewhere, USA',
          center: [34.0522, -118.2437] as [number, number]
        },
        {
          place_name: '789 Pine St, Nowhere, USA',
          center: [41.8781, -87.6298] as [number, number]
        }
      ];
      
      // Filter mock locations based on query
      const filtered = mockLocations.filter(loc => 
        loc.place_name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(filtered);
    } catch (error) {
      console.error('Error searching locations:', error);
      enqueueSnackbar('Failed to search locations. Please try again.', { variant: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection
  const handleSelectLocation = (suggestion: any) => {
    setFieldValue('location', {
      address: suggestion.place_name,
      latitude: suggestion.center[1],
      longitude: suggestion.center[0]
    });
    setLocationQuery(suggestion.place_name);
    setSuggestions([]);
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      enqueueSnackbar('Geolocation is not supported by your browser', { variant: 'error' });
      return;
    }

    setIsGeolocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // In a real app, you would call your backend API to reverse geocode the coordinates
          // For now, we'll use a mock address
          const mockAddress = `Near ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setFieldValue('location', {
            address: mockAddress,
            latitude,
            longitude
          });
          setLocationQuery(mockAddress);
          setUseCurrentLocation(true);
        } catch (error) {
          console.error('Error getting location:', error);
          enqueueSnackbar('Failed to get your location. Please try again or enter it manually.', { 
            variant: 'error' 
          });
        } finally {
          setIsGeolocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        enqueueSnackbar(
          error.message.includes('denied') 
            ? 'Location access was denied. Please enable it in your browser settings or enter the address manually.' 
            : 'Unable to retrieve your location. Please enter the address manually.',
          { variant: 'error' }
        );
        setIsGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <Box>
      <Box position="relative" mb={1}>
        <TextField
          fullWidth
          label="Location"
          value={locationQuery || values.location?.address || ''}
          onChange={(e) => {
            const value = e.target.value;
            setLocationQuery(value);
            if (!value) {
              setFieldValue('location', {
                address: '',
                latitude: null,
                longitude: null
              });
            }
            handleSearch(value);
          }}
          onFocus={() => locationQuery && handleSearch(locationQuery)}
          onBlur={() => setTimeout(() => setSuggestions([]), 200)}
          error={touched.location?.address && Boolean(errors.location?.address)}
          helperText={touched.location?.address && errors.location?.address}
          InputProps={{
            startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
            endAdornment: (
              <IconButton 
                onClick={handleGetCurrentLocation}
                disabled={isGeolocating}
                edge="end"
                size="large"
              >
                <MyLocationIcon 
                  color={useCurrentLocation ? 'primary' : 'action'} 
                  fontSize={isGeolocating ? 'default' : 'medium'}
                />
                {isGeolocating && (
                  <CircularProgress 
                    size={24} 
                    color="primary" 
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </IconButton>
            ),
          }}
        />
        
        {suggestions.length > 0 && (
          <Paper 
            elevation={3} 
            sx={{
              position: 'absolute',
              width: '100%',
              zIndex: 10,
              mt: 0.5,
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            {suggestions.map((suggestion, index) => (
              <Box
                key={index}
                onClick={() => handleSelectLocation(suggestion)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Typography variant="body2">
                  {suggestion.place_name}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>
      
      {values.location?.latitude && values.location?.longitude && (
        <Box mt={1}>
          <Chip 
            icon={<LocationIcon fontSize="small" />}
            label={`Lat: ${values.location.latitude.toFixed(6)}, Lng: ${values.location.longitude.toFixed(6)}`}
            size="small"
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
          />
        </Box>
      )}
    </Box>
  );
};

// Image upload component
const ImageUpload: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const maxImages = 5;

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the maximum
    const currentCount = values.images ? values.images.length : 0;
    if (currentCount + files.length > maxImages) {
      enqueueSnackbar(`You can upload a maximum of ${maxImages} images`, { variant: 'warning' });
      return;
    }
    
    const newFiles: File[] = [];
    const newPreviewUrls: string[] = [];
    
    // Process each file
    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        enqueueSnackbar(`File ${file.name} is not an image`, { variant: 'error' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar(`File ${file.name} is too large (max 5MB)`, { variant: 'error' });
        return;
      }
      
      newFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    });
    
    if (newFiles.length > 0) {
      setFieldValue('images', [...(values.images || []), ...newFiles]);
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const newImages = [...(values.images || [])];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setFieldValue('images', newImages);
    setPreviewUrls(newPreviewUrls);
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="help-request-images"
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={isUploading || (values.images?.length || 0) >= maxImages}
      />
      
      <label htmlFor="help-request-images">
        <Button
          component="span"
          variant="outlined"
          color="primary"
          startIcon={<UploadIcon />}
          disabled={isUploading || (values.images?.length || 0) >= maxImages}
          sx={{ mb: 2 }}
        >
          {isUploading ? 'Uploading...' : 'Upload Images'}
          {(values.images?.length || 0) > 0 && ` (${values.images?.length}/${maxImages})`}
        </Button>
      </label>
      
      {previewUrls.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
          {previewUrls.map((url, index) => (
            <Box key={index} position="relative">
              <Box
                component="img"
                src={url}
                alt={`Preview ${index + 1}`}
                sx={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      
      <FormHelperText sx={{ mt: 1, mb: 2 }}>
        Upload up to {maxImages} images (JPEG, PNG, max 5MB each)
      </FormHelperText>
    </Box>
  );
};

// Main component
const CreateHelpRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial form values
  const initialValues = {
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM' as HelpRequestPriority,
    location: {
      address: '',
      latitude: null as number | null,
      longitude: null as number | null,
    },
    images: [] as File[],
    isAnonymous: false,
    termsAccepted: false,
  };

  // Handle form submission
  const handleSubmit = async (values: typeof initialValues) => {
    if (!user) {
      enqueueSnackbar('You must be logged in to create a help request', { variant: 'error' });
      return;
    }

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
      
      // Append images if any
      if (values.images && values.images.length > 0) {
        values.images.forEach((file, index) => {
          formData.append(`images`, file);
        });
      }
      
      // Create the help request
      const response = await helpRequestService.createHelpRequest(formData);
      
      // Show success message
      enqueueSnackbar('Help request created successfully!', { variant: 'success' });
      
      // Redirect to the new help request
      navigate(`/help-requests/${response.id}`);
      
    } catch (error) {
      console.error('Error creating help request:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to create help request. Please try again.',
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button
          component={RouterLink}
          to="/help-requests"
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Help Requests
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Create a New Help Request
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Fill out the form below to request assistance from volunteers in your area.
        </Typography>
      </Box>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                
                <Grid item xs={12}>
                  <Field name="termsAccepted">
                    {({ field, meta }: FieldProps) => (
                      <FormControl 
                        error={meta.touched && Boolean(meta.error)}
                        component="fieldset"
                        variant="standard"
                        fullWidth
                        required
                      >
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => setFieldValue('termsAccepted', e.target.checked)}
                                disabled={isSubmitting}
                                style={{
                                  width: 20,
                                  height: 20,
                                  marginRight: 8,
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                I confirm that the information provided is accurate and I agree to the 
                                <Button 
                                  component="a" 
                                  href="/terms" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  size="small"
                                  sx={{ verticalAlign: 'baseline', p: 0, minWidth: 'auto' }}
                                >
                                  Terms of Service
                                </Button> 
                                and 
                                <Button 
                                  component="a" 
                                  href="/privacy" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  size="small"
                                  sx={{ verticalAlign: 'baseline', p: 0, minWidth: 'auto' }}
                                >
                                  Privacy Policy
                                </Button>
                              </Typography>
                            }
                          />
                        </FormGroup>
                        {meta.touched && meta.error && (
                          <FormHelperText error>{meta.error}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  </Field>
                </Grid>
              </Grid>
            </Paper>
            
            <Box 
              display="flex" 
              justifyContent="flex-end"
              gap={2}
              flexWrap="wrap"
              sx={{ '& > *': { flex: isMobile ? '1 1 100%' : '0 0 auto' } }}
            >
              <Button
                component={RouterLink}
                to="/help-requests"
                variant="outlined"
                disabled={isSubmitting}
                fullWidth={isMobile}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || !values.termsAccepted}
                fullWidth={isMobile}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default CreateHelpRequestPage;

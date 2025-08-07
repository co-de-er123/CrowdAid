import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'USER' | 'VOLUNTEER';
  phoneNumber?: string;
  acceptTerms: boolean;
}

const schema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .oneOf(['USER', 'VOLUNTEER'], 'Invalid role')
    .required('Please select a role'),
  phoneNumber: yup
    .string()
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      'Please enter a valid phone number'
    ),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'USER',
      acceptTerms: false,
    },
  });

  const role = watch('role');

  const onSubmit: SubmitHandler<RegisterFormData> = async (formData) => {
    try {
      setError('');
      setIsLoading(true);
      
      // Prepare user data for registration
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber || undefined, // Make sure to send undefined instead of empty string
      };

      // Use the auth context's register function
      await registerUser(userData);
      
      // Redirect to dashboard - the auth context should handle the login after registration
      navigate('/dashboard', { replace: true });
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err instanceof Error) {
        // Handle specific error cases
        if (err.message.includes('Network Error')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (err.message.includes('email already exists')) {
          errorMessage = 'An account with this email already exists. Please use a different email or log in.';
        } else if (err.message.includes('validation failed')) {
          errorMessage = 'Please check your input and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setValue('role', event.target.value as 'USER' | 'VOLUNTEER');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Create your account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ width: '100%' }}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Full Name"
          autoComplete="name"
          autoFocus
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name')}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
          disabled={isLoading}
        />

        <FormControl fullWidth margin="normal" error={!!errors.role}>
          <InputLabel id="role-label">I want to</InputLabel>
          <Select
            labelId="role-label"
            id="role"
            value={role}
            label="I want to"
            onChange={handleRoleChange}
            disabled={isLoading}
          >
            <MenuItem value="USER">Get help in emergencies</MenuItem>
            <MenuItem value="VOLUNTEER">Volunteer to help others</MenuItem>
          </Select>
          {errors.role && (
            <FormHelperText>{errors.role.message}</FormHelperText>
          )}
        </FormControl>

        <TextField
          margin="normal"
          fullWidth
          id="phoneNumber"
          label="Phone Number (Optional)"
          autoComplete="tel"
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber?.message || 'For important notifications'}
          {...register('phoneNumber')}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="new-password"
          error={!!errors.password}
          helperText={
            errors.password?.message ||
            'Minimum 8 characters, with uppercase, lowercase, number, and special character'
          }
          {...register('password')}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register('confirmPassword')}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleConfirmPasswordVisibility}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              value="acceptTerms"
              color="primary"
              {...register('acceptTerms')}
              disabled={isLoading}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href="#" variant="body2" sx={{ textDecoration: 'none' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" variant="body2" sx={{ textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </Typography>
          }
          sx={{ mt: 2, alignItems: 'flex-start' }}
        />
        {errors.acceptTerms && (
          <FormHelperText error sx={{ mt: 0, mb: 2 }}>
            {errors.acceptTerms.message}
          </FormHelperText>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Account'
          )}
        </Button>
      </Box>

      <Divider sx={{ width: '100%', my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            sx={{ textDecoration: 'none', fontWeight: 'medium' }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setIsLoading(true);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to log in. Please check your credentials and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        Sign in to your account
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
          id="email"
          label="Email Address"
          autoComplete="email"
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
          disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            sx={{ textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </Box>

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
            'Sign In'
          )}
        </Button>
      </Box>

      <Divider sx={{ width: '100%', my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            variant="body2"
            sx={{ textDecoration: 'none', fontWeight: 'medium' }}
          >
            Sign up
          </Link>
        </Typography>

        <Typography variant="caption" color="text.secondary">
          By continuing, you agree to our{' '}
          <Link href="#" variant="caption" sx={{ textDecoration: 'none' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" variant="caption" sx={{ textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          .
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;

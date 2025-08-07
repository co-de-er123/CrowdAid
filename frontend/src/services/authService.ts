import axios, { AxiosError, AxiosResponse } from 'axios';
import { User, UserLocation } from '../types';
import { RegisterDto, UpdateProfileDto } from '../types/dtos';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Type for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  timestamp?: string;
  path?: string;
}

// Type for authentication response
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<{ message: string }>>) => {
    const originalRequest = error.config as any;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already trying to refresh the token, don't retry
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Mark this request as retried
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const { accessToken, refreshToken } = await refreshToken();
        
        if (accessToken) {
          // Save the new tokens
          localStorage.setItem('token', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          // Retry the original request with the new token
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, clear storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      const errorMessage = data?.message || 'An error occurred';
      
      // Handle specific status codes
      switch (status) {
        case 400:
          console.error('Bad Request:', errorMessage);
          break;
        case 403:
          console.error('Forbidden:', errorMessage);
          // Redirect to login if token is invalid or expired
          if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
          break;
        case 404:
          console.error('Not Found:', errorMessage);
          break;
        case 500:
          console.error('Server Error:', errorMessage);
          break;
        default:
          console.error(`Error ${status}:`, errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication API methods

/**
 * Log in a user with email and password
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/signin', {
      email,
      password,
    });
    
    const { accessToken, refreshToken, user, expiresIn } = response.data.data;
    
    // Store tokens in localStorage
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    return { user, accessToken, refreshToken, expiresIn };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterDto): Promise<AuthResponse> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/signup',
      userData
    );
    
    const { accessToken, refreshToken, user, expiresIn } = response.data.data;
    
    // Store tokens in localStorage
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    return { user, accessToken, refreshToken, expiresIn };
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Log out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/signout');
  } catch (error) {
    console.error('Logout failed:', error);
    // Even if the API call fails, we still want to clear the local storage
  } finally {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

/**
 * Refresh the access token using the refresh token
 */
/**
 * Refresh the access token using the refresh token
 */
export const refreshToken = async (): Promise<{ accessToken: string; refreshToken?: string }> => {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (!storedRefreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await api.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>(
      '/auth/refresh-token',
      { refreshToken: storedRefreshToken }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Clear tokens on refresh failure
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

/**
 * Get the current authenticated user's profile
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
};

/**
 * Update the current user's profile
 */
export const updateProfile = async (userData: UpdateProfileDto): Promise<User> => {
  try {
    const formData = new FormData();
    
    // Append all fields to form data
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'avatar' && value instanceof File) {
          formData.append('avatar', value);
        } else if (key === 'location' && typeof value === 'object') {
          formData.append('location', JSON.stringify(value));
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });
    
    const response = await api.put<ApiResponse<User>>(
      '/users/me',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

/**
 * Update the current user's password
 */
export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  try {
    await api.patch('/users/me/password', data);
  } catch (error) {
    console.error('Failed to update password:', error);
    throw error;
  }
};

/**
 * Request a password reset email
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/forgot-password', { email });
  } catch (error) {
    console.error('Failed to request password reset:', error);
    throw error;
  }
};

/**
 * Reset password with a reset token
 */
export const resetPassword = async (data: {
  token: string;
  password: string;
}): Promise<void> => {
  try {
    await api.post('/auth/reset-password', data);
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw error;
  }
};

/**
 * Update user's location
 */
export const updateLocation = async (location: UserLocation): Promise<void> => {
  try {
    await api.patch('/users/me/location', location);
  } catch (error) {
    console.error('Failed to update location:', error);
    throw error;
  }
};

/**
 * Verify user's email with a verification token
 */
export const verifyEmail = async (token: string): Promise<void> => {
  try {
    await api.post(`/auth/verify-email?token=${token}`);
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
};

/**
 * Resend email verification
 */
export const resendVerificationEmail = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/resend-verification', { email });
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    throw error;
  }
};

// Export the configured axios instance
export default api;

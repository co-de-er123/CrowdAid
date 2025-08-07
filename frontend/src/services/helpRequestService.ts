import axios, { AxiosError, AxiosResponse } from 'axios';
import { 
  HelpRequest, 
  Message, 
  User, 
  HelpRequestFilterParams, 
  PaginatedResponse, 
  UserLocation,
  ApiResponse 
} from '../types';
import { 
  CreateHelpRequestDto, 
  UpdateHelpRequestDto, 
  HelpRequestResponse,
  HelpRequestStatisticsDto,
  MessageDto,
  CreateMessageDto,
  FileUploadResponse
} from '../types/dtos';
import { getAuthToken } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      // Handle specific status codes
      const { status, data } = error.response;
      const errorMessage = (data as any)?.message || 'An error occurred';
      
      switch (status) {
        case 401:
          console.error('Unauthorized - Please log in again');
          // Redirect to login or handle token refresh
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden - Insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error - Please try again later');
          break;
        default:
          console.error(`Error ${status}:`, errorMessage);
      }
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Help Request Service
 * Provides methods for interacting with the help request API
 */
const helpRequestService = {
  /**
   * Create a new help request
   */
  createHelpRequest: async (data: CreateHelpRequestDto): Promise<HelpRequest> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      formData.append('location', JSON.stringify(data.location));
      
      // Append images if any
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      const response = await api.post<ApiResponse<HelpRequest>>('/help-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating help request:', error);
      throw error;
    }
  },
  
  /**
   * Get a single help request by ID
   */
  getHelpRequest: async (id: number): Promise<HelpRequestResponse> => {
    try {
      const response = await api.get<ApiResponse<HelpRequestResponse>>(`/help-requests/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching help request ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Update a help request
   */
  updateHelpRequest: async (id: number, data: UpdateHelpRequestDto): Promise<HelpRequest> => {
    try {
      const response = await api.put<ApiResponse<HelpRequest>>(`/help-requests/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating help request ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a help request
   */
  deleteHelpRequest: async (id: number): Promise<void> => {
    try {
      await api.delete(`/help-requests/${id}`);
    } catch (error) {
      console.error(`Error deleting help request ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all help requests with optional filtering and pagination
   */
  getHelpRequests: async (params?: HelpRequestFilterParams): Promise<PaginatedResponse<HelpRequest>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<HelpRequest>>>('/help-requests', {
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching help requests:', error);
      throw error;
    }
  },
  
  /**
   * Get help requests for the current user
   */
  getMyHelpRequests: async (): Promise<HelpRequest[]> => {
    try {
      const response = await api.get<ApiResponse<HelpRequest[]>>('/help-requests/me');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my help requests:', error);
      throw error;
    }
  },
  
  /**
   * Get help requests assigned to the current user (for volunteers)
   */
  getAssignedHelpRequests: async (): Promise<HelpRequest[]> => {
    try {
      const response = await api.get<ApiResponse<HelpRequest[]>>('/help-requests/assigned');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assigned help requests:', error);
      throw error;
    }
  },
  
  /**
   * Volunteer to help with a request
   */
  volunteerForRequest: async (requestId: number): Promise<HelpRequest> => {
    try {
      const response = await api.post<ApiResponse<HelpRequest>>(
        `/help-requests/${requestId}/volunteer`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error volunteering for request ${requestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update the status of a help request
   */
  updateRequestStatus: async (
    requestId: number, 
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ): Promise<HelpRequest> => {
    try {
      const response = await api.patch<ApiResponse<HelpRequest>>(
        `/help-requests/${requestId}/status`,
        { status }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating status for request ${requestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get messages for a help request
   */
  getMessages: async (requestId: number): Promise<MessageDto[]> => {
    try {
      const response = await api.get<ApiResponse<MessageDto[]>>(
        `/help-requests/${requestId}/messages`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching messages for request ${requestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Send a message for a help request
   */
  sendMessage: async (requestId: number, content: string): Promise<MessageDto> => {
    try {
      const response = await api.post<ApiResponse<MessageDto>>(
        `/help-requests/${requestId}/messages`,
        { content } as CreateMessageDto
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error sending message for request ${requestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Mark messages as read
   */
  markMessagesAsRead: async (messageIds: number[]): Promise<void> => {
    try {
      await api.patch('/messages/read', { messageIds });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },
  
  /**
   * Get help request statistics
   */
  getStatistics: async (): Promise<HelpRequestStatisticsDto> => {
    try {
      const response = await api.get<ApiResponse<HelpRequestStatisticsDto>>('/help-requests/statistics');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },
  
  /**
   * Upload a file for a help request
   */
  uploadFile: async (requestId: number, file: File): Promise<FileUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<ApiResponse<FileUploadResponse>>(
        `/help-requests/${requestId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  /**
   * Get nearby help requests based on user location
   */
  getNearbyRequests: async (location: UserLocation, radiusKm: number = 10): Promise<HelpRequest[]> => {
    try {
      const response = await api.get<ApiResponse<HelpRequest[]>>('/help-requests/nearby', {
        params: {
          lat: location.latitude,
          lng: location.longitude,
          radius: radiusKm,
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching nearby help requests:', error);
      throw error;
    }
  },
};

export default helpRequestService;

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        console.error('Unauthorized access - please log in');
      } else if (error.response.status === 403) {
        console.error('Forbidden - you do not have permission');
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server');
      return Promise.reject({ message: 'No response from server. Please check your connection.' });
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

const helpRequestService = {
  /**
   * Get all help requests (filtered by query parameters)
   * @param params Query parameters (status, location, distance, etc.)
   */
  getHelpRequests: async (params?: {
    status?: string;
    lat?: number;
    lng?: number;
    distance?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ data: HelpRequest[]; total: number }> => {
    const response = await api.get('/help-requests', { params });
    return {
      data: response.data.content,
      total: response.data.totalElements,
    };
  },

  /**
   * Get nearby help requests based on user's location
   * @param lat Latitude
   * @param lng Longitude
   * @param distance Distance in kilometers (default: 10)
   */
  getNearbyHelpRequests: async (
    lat: number,
    lng: number,
    distance = 10
  ): Promise<HelpRequest[]> => {
    const response = await api.get('/help-requests/nearby', {
      params: { lat, lng, distance },
    });
    return response.data;
  },

  /**
   * Get help requests created by the current user
   */
  getMyHelpRequests: async (): Promise<HelpRequest[]> => {
    const response = await api.get('/help-requests/me');
    return response.data;
  },

  /**
   * Get help requests where the current user is a volunteer
   */
  getVolunteeringRequests: async (): Promise<HelpRequest[]> => {
    const response = await api.get('/help-requests/volunteering');
    return response.data;
  },

  /**
   * Get a single help request by ID
   * @param id Help request ID
   */
  getHelpRequestById: async (id: number): Promise<HelpRequest> => {
    const response = await api.get(`/help-requests/${id}`);
    return response.data;
  },

  /**
   * Create a new help request
   * @param data Help request data
   */
  createHelpRequest: async (data: CreateHelpRequestDto): Promise<HelpRequest> => {
    const response = await api.post('/help-requests', data);
    return response.data;
  },

  /**
   * Update a help request
   * @param id Help request ID
   * @param data Updated help request data
   */
  updateHelpRequest: async (
    id: number,
    data: UpdateHelpRequestDto
  ): Promise<HelpRequest> => {
    const response = await api.put(`/help-requests/${id}`, data);
    return response.data;
  },

  /**
   * Delete a help request
   * @param id Help request ID
   */
  deleteHelpRequest: async (id: number): Promise<void> => {
    await api.delete(`/help-requests/${id}`);
  },

  /**
   * Volunteer to help with a request
   * @param id Help request ID
   */
  volunteerForRequest: async (id: number): Promise<HelpRequest> => {
    const response = await api.post(`/help-requests/${id}/volunteer`);
    return response.data;
  },

  /**
   * Cancel volunteering for a request
   * @param id Help request ID
   */
  cancelVolunteering: async (id: number): Promise<HelpRequest> => {
    const response = await api.delete(`/help-requests/${id}/volunteer`);
    return response.data;
  },

  /**
   * Update the status of a help request
   * @param id Help request ID
   * @param status New status
   */
  updateRequestStatus: async (
    id: number,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ): Promise<HelpRequest> => {
    const response = await api.patch(`/help-requests/${id}/status`, { status });
    return response.data;
  },

  /**
   * Add a message to a help request
   * @param id Help request ID
   * @param message Message content
   */
  addMessage: async (
    id: number,
    message: { content: string }
  ): Promise<HelpRequest> => {
    const response = await api.post(`/help-requests/${id}/messages`, message);
    return response.data;
  },

  /**
   * Get messages for a help request
   * @param id Help request ID
   */
  getMessages: async (id: number): Promise<any[]> => {
    const response = await api.get(`/help-requests/${id}/messages`);
    return response.data;
  },

  /**
   * Upload images for a help request
   * @param id Help request ID
   * @param files Array of image files
   */
  uploadImages: async (id: number, files: File[]): Promise<HelpRequest> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post(`/help-requests/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get help request statistics
   */
  getStatistics: async (): Promise<{
    totalRequests: number;
    completedRequests: number;
    inProgressRequests: number;
    pendingRequests: number;
    averageResponseTime: number; // in minutes
  }> => {
    const response = await api.get('/help-requests/statistics');
    return response.data;
  },
};

export default helpRequestService;

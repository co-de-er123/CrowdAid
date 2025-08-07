import { HelpRequest, User } from '.';

// DTOs for Authentication
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'VOLUNTEER';
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// DTOs for Help Requests
export interface CreateHelpRequestDto {
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  images?: File[];
}

export interface UpdateHelpRequestDto extends Partial<CreateHelpRequestDto> {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  volunteerId?: number | null;
}

export interface HelpRequestResponse extends HelpRequest {
  messages?: MessageDto[];
  images?: string[];
}

// DTOs for Messages
export interface CreateMessageDto {
  content: string;
  helpRequestId: number;
}

export interface MessageDto {
  id: number;
  content: string;
  senderId: number;
  helpRequestId: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

// DTOs for User
export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  skills?: string[];
  location?: {
    type: string;
    coordinates: [number, number];
    address?: string;
  };
  avatar?: File;
}

// DTOs for Search and Filter
export interface HelpRequestFilterDto {
  status?: ('PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')[];
  priority?: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  category?: string[];
  distance?: number; // in kilometers
  location?: {
    latitude: number;
    longitude: number;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// DTOs for API Responses
export interface PaginatedResponseDto<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// DTOs for Statistics
export interface HelpRequestStatisticsDto {
  totalRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  pendingRequests: number;
  averageResponseTime: number; // in minutes
  requestsByCategory: Array<{
    category: string;
    count: number;
  }>;
  requestsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

// DTOs for WebSocket
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface HelpRequestUpdateMessage {
  requestId: number;
  status: string;
  updatedAt: string;
  volunteer?: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

export interface NewMessageNotification {
  message: MessageDto;
  helpRequest: Pick<HelpRequest, 'id' | 'title'>;
  recipientIds: number[];
}

// DTOs for File Uploads
export interface FileUploadResponse {
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
}

// DTOs for Location
export interface LocationDto {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

// DTOs for Notifications
export interface NotificationDto {
  id: number;
  type: 'NEW_REQUEST' | 'REQUEST_ACCEPTED' | 'MESSAGE_RECEIVED' | 'STATUS_UPDATED';
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  relatedEntityId?: number;
  relatedEntityType?: 'HELP_REQUEST' | 'MESSAGE' | 'USER';
}

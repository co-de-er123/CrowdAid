export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'USER' | 'VOLUNTEER' | 'ADMIN';
  avatarUrl?: string;
  bio?: string;
  location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  isAvailable?: boolean;
  skills?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HelpRequest {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  requesterId: number;
  volunteerId?: number;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  images?: string[];
  createdAt: string;
  updatedAt: string;
  requester?: Pick<User, 'id' | 'name' | 'email' | 'phoneNumber' | 'avatarUrl'>;
  volunteer?: Pick<User, 'id' | 'name' | 'email' | 'phoneNumber' | 'avatarUrl'>;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  helpRequestId: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type HelpRequestFilterParams = PaginationParams & {
  status?: string[];
  priority?: string[];
  category?: string[];
  distance?: number; // in kilometers
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
};

export type Notification = {
  id: number;
  type: 'NEW_REQUEST' | 'REQUEST_ACCEPTED' | 'MESSAGE_RECEIVED' | 'STATUS_UPDATED';
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
};

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'USER' | 'VOLUNTEER';
  phoneNumber?: string;
}

export interface HelpRequestFormData {
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images?: File[];
}

export interface UpdateProfileFormData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  skills?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  avatar?: File;
}

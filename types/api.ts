export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export interface Friend {
  id: string;
  username: string;
  profileImage: string;
  status?: 'online' | 'offline';
  mutualFriends?: number;
}

export interface FriendSuggestion {
  id: string;
  username: string;
  profileImage: string;
  mutualFriends: number;
}

export interface PendingRequest {
  id: string;
  username: string;
  profileImage: string;
  mutualFriends?: number;
  type: 'incoming' | 'outgoing';
  sentAt: string;
  relativeTimestamp?: string;
}

export interface Comment {
  id: string;
  username: string;
  profileImage: string;
  text: string;
  timestamp: string;
  relativeTimestamp?: string;
  likes?: number;
  likedByCurrentUser?: boolean;
}

export interface Post {
  id: string;
  username: string;
  profileImage: string;
  timestamp: string;
  relativeTimestamp?: string;
  text: string;
  likes?: number;
  likedByCurrentUser?: boolean;
  comments?: Comment[];
}



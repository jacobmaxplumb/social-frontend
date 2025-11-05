// Mock friends data for the Friends tab

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
  sentAt?: string;
}

export const mockCurrentFriends: Friend[] = [
  {
    id: '1',
    username: 'alex_johnson',
    profileImage: '👨',
    status: 'online',
    mutualFriends: 5,
  },
  {
    id: '2',
    username: 'sarah_chen',
    profileImage: '👩',
    status: 'online',
    mutualFriends: 8,
  },
  {
    id: '3',
    username: 'mike_williams',
    profileImage: '👨',
    status: 'offline',
    mutualFriends: 3,
  },
  {
    id: '4',
    username: 'emma_davis',
    profileImage: '👩',
    status: 'online',
    mutualFriends: 12,
  },
  {
    id: '5',
    username: 'david_brown',
    profileImage: '👨',
    status: 'offline',
    mutualFriends: 7,
  },
];

export const mockFriendSuggestions: FriendSuggestion[] = [
  {
    id: '6',
    username: 'lisa_anderson',
    profileImage: '👩',
    mutualFriends: 4,
  },
  {
    id: '7',
    username: 'james_wilson',
    profileImage: '👨',
    mutualFriends: 6,
  },
  {
    id: '8',
    username: 'olivia_martinez',
    profileImage: '👩',
    mutualFriends: 2,
  },
  {
    id: '9',
    username: 'ryan_taylor',
    profileImage: '👨',
    mutualFriends: 9,
  },
  {
    id: '10',
    username: 'sophia_lee',
    profileImage: '👩',
    mutualFriends: 5,
  },
];

export const mockPendingRequests: PendingRequest[] = [
  {
    id: '11',
    username: 'chris_miller',
    profileImage: '👨',
    type: 'incoming',
    mutualFriends: 3,
    sentAt: '2h ago',
  },
  {
    id: '12',
    username: 'amanda_white',
    profileImage: '👩',
    type: 'incoming',
    mutualFriends: 7,
    sentAt: '5h ago',
  },
  {
    id: '13',
    username: 'benjamin_clark',
    profileImage: '👨',
    type: 'outgoing',
    mutualFriends: 4,
    sentAt: '1d ago',
  },
  {
    id: '14',
    username: 'natalie_kim',
    profileImage: '👩',
    type: 'incoming',
    mutualFriends: 2,
    sentAt: '3d ago',
  },
  {
    id: '15',
    username: 'thomas_moore',
    profileImage: '👨',
    type: 'outgoing',
    mutualFriends: 6,
    sentAt: '2d ago',
  },
];


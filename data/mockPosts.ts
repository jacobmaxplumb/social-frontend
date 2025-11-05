// Mock posts data for the Feed tab

export interface Comment {
  id: string;
  username: string;
  profileImage: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  username: string;
  profileImage: string;
  timestamp: string;
  text: string;
  comments?: Comment[];
  likes?: number;
}

export const mockPosts: Post[] = [
  {
    id: '1',
    username: 'alex_johnson',
    profileImage: '👤',
    timestamp: '2h ago',
    text: 'Just finished an amazing hike! The view was absolutely breathtaking. Nature never fails to amaze me. 🏔️✨',
    likes: 24,
    comments: [
      {
        id: 'c1',
        username: 'sarah_chen',
        profileImage: '👤',
        text: 'Looks amazing! Where was this?',
        timestamp: '1h ago',
      },
      {
        id: 'c2',
        username: 'mike_williams',
        profileImage: '👤',
        text: 'Beautiful view! 🏔️',
        timestamp: '30m ago',
      },
    ],
  },
  {
    id: '2',
    username: 'sarah_chen',
    profileImage: '👤',
    timestamp: '4h ago',
    text: 'Coffee shop vibes ☕ Working on some exciting new projects. Who else loves coding with a good latte?',
    likes: 18,
    comments: [
      {
        id: 'c3',
        username: 'emma_davis',
        profileImage: '👤',
        text: 'Same here! Coffee + code = perfect combo ☕💻',
        timestamp: '3h ago',
      },
    ],
  },
  {
    id: '3',
    username: 'mike_williams',
    profileImage: '👤',
    timestamp: '6h ago',
    text: 'Weekend vibes! Just launched a new feature and feeling great about it. Hard work pays off! 🚀',
    likes: 32,
    comments: [],
  },
  {
    id: '4',
    username: 'emma_davis',
    profileImage: '👤',
    timestamp: '8h ago',
    text: 'Beautiful sunset tonight 🌅 Perfect way to end the day. Sometimes you just need to pause and appreciate the little moments.',
    likes: 45,
    comments: [
      {
        id: 'c4',
        username: 'david_brown',
        profileImage: '👤',
        text: 'Stunning! 🌅',
        timestamp: '7h ago',
      },
      {
        id: 'c5',
        username: 'lisa_anderson',
        profileImage: '👤',
        text: 'So peaceful!',
        timestamp: '6h ago',
      },
    ],
  },
  {
    id: '5',
    username: 'david_brown',
    profileImage: '👤',
    timestamp: '12h ago',
    text: 'New album just dropped! Been listening on repeat all day. Music is everything 🎵',
    likes: 15,
    comments: [],
  },
  {
    id: '6',
    username: 'lisa_anderson',
    profileImage: '👤',
    timestamp: '1d ago',
    text: 'Started learning React Native today! The community is so supportive. Excited to build something amazing! 💻',
    likes: 28,
    comments: [
      {
        id: 'c6',
        username: 'sarah_chen',
        profileImage: '👤',
        text: 'Welcome to the React Native community! 🎉',
        timestamp: '23h ago',
      },
      {
        id: 'c7',
        username: 'mike_williams',
        profileImage: '👤',
        text: 'You\'re going to love it!',
        timestamp: '22h ago',
      },
    ],
  },
];


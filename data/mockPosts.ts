// Mock posts data for the Feed tab

export interface Post {
  id: string;
  username: string;
  profileImage: string;
  timestamp: string;
  text: string;
}

export const mockPosts: Post[] = [
  {
    id: '1',
    username: 'alex_johnson',
    profileImage: '👤',
    timestamp: '2h ago',
    text: 'Just finished an amazing hike! The view was absolutely breathtaking. Nature never fails to amaze me. 🏔️✨',
  },
  {
    id: '2',
    username: 'sarah_chen',
    profileImage: '👤',
    timestamp: '4h ago',
    text: 'Coffee shop vibes ☕ Working on some exciting new projects. Who else loves coding with a good latte?',
  },
  {
    id: '3',
    username: 'mike_williams',
    profileImage: '👤',
    timestamp: '6h ago',
    text: 'Weekend vibes! Just launched a new feature and feeling great about it. Hard work pays off! 🚀',
  },
  {
    id: '4',
    username: 'emma_davis',
    profileImage: '👤',
    timestamp: '8h ago',
    text: 'Beautiful sunset tonight 🌅 Perfect way to end the day. Sometimes you just need to pause and appreciate the little moments.',
  },
  {
    id: '5',
    username: 'david_brown',
    profileImage: '👤',
    timestamp: '12h ago',
    text: 'New album just dropped! Been listening on repeat all day. Music is everything 🎵',
  },
  {
    id: '6',
    username: 'lisa_anderson',
    profileImage: '👤',
    timestamp: '1d ago',
    text: 'Started learning React Native today! The community is so supportive. Excited to build something amazing! 💻',
  },
];


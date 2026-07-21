export interface Author {
  id: string;
  name: string;
  avatar: string;
  role: 'user' | 'owner';
}

export interface TicketData {
  venueName: string;
  price: string;
  originalPrice?: string;
  timeSlot: string;
  date: string;
  courtType?: string;
  discount?: string;
}

export interface MatchmakingData {
  sport: string;
  time: string;
  location: string;
  level: string;
  joinedCount: number;
  maxCount: number;
  status: 'active' | 'full';
}

export interface Post {
  id: string;
  type: 'general' | 'matchmaking' | 'ticket';
  author: Author;
  content: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  userReaction?: 'like' | 'love' | 'fire' | 'muscle' | 'trophy' | null;
  createdAt: string;
  ticketData?: TicketData;
  matchmakingData?: MatchmakingData;
}

export interface Comment {
  id: string;
  postId: string;
  author: Author;
  content: string;
  createdAt: string;
}

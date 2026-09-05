export type PostType = 'COMMUNITY' | 'MATCH_FINDING' | 'VENUE_PROMO' | 'STANDARD' | 'POST' | 'SOCIAL';

export type PostAudience = 'PUBLIC' | 'CLUB_MEMBERS' | 'CLUB';

export interface AuthorUser {
  id: string;
  name: string;
  avatar: string;
  handle: string;
  role?: string;
}

// Alias for backwards compatibility
export type User = AuthorUser;

/**
 * Match Finding Attachment Data
 */
export interface MatchAttachmentData {
  matchId?: string;
  sportName: string; // e.g. "Pickleball", "Bóng đá"
  timeSlot: string; // e.g. "19:30 - 21:00 • Tối nay"
  level: string; // e.g. "DUPR 3.0 - 3.5" or "Trình Khá"
  pricePerSlot: string; // e.g. "50.000đ / người"
  slotsLeft: number; // e.g. 2
  venueName?: string; // e.g. "Sân Pickleball Cầu Giấy"
}

/**
 * Venue Promotion Attachment Data
 */
export interface VenuePromoAttachmentData {
  venueId?: string;
  venueName: string; // e.g. "Cụm Sân Pickleball Thăng Long"
  address: string; // e.g. "Phường Dịch Vọng, Cầu Giấy"
  discountCode?: string; // e.g. "SPORTA20"
  discountPercent?: string; // e.g. "Giảm 20%"
  bookingUrl?: string;
}

/**
 * Club Info attached to a post (Facebook Group style)
 */
export interface ClubInfoData {
  id: string;
  name: string; // e.g. "Pickleball Cầu Giấy Official"
  avatarUrl: string;
}

export interface Comment {
  id: string;
  postId?: string;
  author: AuthorUser;
  content: string;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
}

export type PostComment = Comment;

export interface Post {
  id: string;
  author: AuthorUser;
  content: string;
  mediaUrls?: string[];
  backgroundGradient?: string[];
  backgroundId?: string;
  createdAt: string;
  type: PostType;
  audience?: PostAudience;
  clubInfo?: ClubInfoData; // Double Avatar if present
  matchAttachment?: MatchAttachmentData;
  venuePromoAttachment?: VenuePromoAttachmentData;
  voucher?: any;
  isPinned?: boolean;

  // Structured Match Finding fields
  matchRoomId?: string;
  sportName?: string;
  venueId?: string;
  venueName?: string;
  venue?: any;
  timeSlot?: string;
  playDate?: string;
  startTime?: string;
  endTime?: string;
  targetLevel?: string;
  slotsNeeded?: number;
  currentSlots?: number;
  matchStatus?: string;
  isJoined?: boolean;
  memberFee?: string;
  memberFeeAmount?: number;
  totalPrice?: number;
  note?: string;
  currency?: string;

  // Structured Venue Promo fields
  promoTitle?: string;
  promoCode?: string;
  discountText?: string;
  validUntil?: string;
  rankingScore?: number;

  // Reaction fields compatibility
  isLiked?: boolean;
  likeCount?: number;
  likesCount?: number;

  // Realtime Uploading & Progress
  isUploading?: boolean;
  uploadProgress?: number;

  // Reactions & Counters
  reactionsCount: {
    like?: number;
    love?: number;
    fire?: number;
    clap?: number;
    muscle?: number;
    trophy?: number;
  };
  userReaction?: 'like' | 'love' | 'fire' | 'clap' | 'trophy' | 'muscle' | null;
  commentsCount: number;
  commentsCountOld?: number;
  sharesCount: number;
  comments?: PostComment[];
}

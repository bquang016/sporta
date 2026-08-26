// ─── Venue Rating Types ──────────────────────────────────────────────────────

export interface VenueReviewItem {
  id: string;
  reviewerUserId: number | null;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  comment: string | null;
  ownerReply: string | null;
  ownerRepliedAt: string | null;
  createdAt: string;
  // Tiêu chí phụ (tính tự động từ BE, không lưu DB)
  surfaceScore: number | null;
  lightingScore: number | null;
  serviceScore: number | null;
}

export interface VenueReviewPageResponse {
  reviews: VenueReviewItem[];
  totalReviews: number;
  averageRating: number;
  page: number;
  size: number;
  hasMore: boolean;
  avgSurfaceScore: number;
  avgLightingScore: number;
  avgServiceScore: number;
  canReview: boolean | null;
  hasReviewed: boolean | null;
  myReview?: VenueReviewItem | null;
}

export interface CreateReviewPayload {
  venueId: string;
  rating: number;
  comment?: string;
}

export interface OwnerReplyPayload {
  reply: string;
}

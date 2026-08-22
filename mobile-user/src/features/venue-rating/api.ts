import { requestApi } from '../../shared/api/apiClient';
import type {
  VenueReviewPageResponse,
  VenueReviewItem,
  CreateReviewPayload,
  OwnerReplyPayload,
} from './types';

/** Lấy danh sách reviews của venue (public — không cần auth) */
export const fetchVenueReviews = async (
  venueId: string,
  page = 0,
  size = 10
): Promise<VenueReviewPageResponse> => {
  return requestApi(`/public/venues/${venueId}/reviews?page=${page}&size=${size}`, {
    method: 'GET',
  });
};

/** Tạo review mới (cần auth) */
export const createVenueReview = async (
  payload: CreateReviewPayload
): Promise<VenueReviewItem> => {
  return requestApi('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/** Kiểm tra có thể review không (cần auth) */
export const checkCanReview = async (
  venueId: string
): Promise<{ canReview: boolean }> => {
  return requestApi(`/venues/${venueId}/reviews/can-review`, {
    method: 'GET',
  });
};

/** Owner reply review (cần auth owner) */
export const replyToReview = async (
  reviewId: string,
  payload: OwnerReplyPayload
): Promise<VenueReviewItem> => {
  return requestApi(`/owner/reviews/${reviewId}/reply`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

import { useState, useEffect, useCallback } from 'react';
import { fetchVenueReviews, createVenueReview, checkCanReview } from './api';
import type { VenueReviewPageResponse, VenueReviewItem, CreateReviewPayload } from './types';

// ─── useVenueReviews ─────────────────────────────────────────────────────────

interface UseVenueReviewsResult {
  data: VenueReviewPageResponse | null;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  refetch: () => void;
}

export const useVenueReviews = (venueId: string | null): UseVenueReviewsResult => {
  const [data, setData] = useState<VenueReviewPageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const load = useCallback(
    async (pageNum: number, append = false) => {
      if (!venueId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchVenueReviews(venueId, pageNum, 10);
        if (append && data) {
          setData({
            ...result,
            reviews: [...data.reviews, ...result.reviews],
          });
        } else {
          setData(result);
        }
      } catch (e: any) {
        setError(e?.message || 'Không thể tải đánh giá');
      } finally {
        setLoading(false);
      }
    },
    [venueId]
  );

  useEffect(() => {
    if (venueId) {
      setPage(0);
      setData(null);
      load(0, false);
    }
  }, [venueId]);

  const loadMore = useCallback(() => {
    if (!data?.hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    load(nextPage, true);
  }, [data, loading, page, load]);

  const refetch = useCallback(() => {
    setPage(0);
    setData(null);
    load(0, false);
  }, [load]);

  return { data, loading, error, loadMore, refetch };
};

// ─── useSubmitReview ─────────────────────────────────────────────────────────

interface UseSubmitReviewResult {
  submit: (payload: CreateReviewPayload) => Promise<VenueReviewItem | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export const useSubmitReview = (): UseSubmitReviewResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (payload: CreateReviewPayload): Promise<VenueReviewItem | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await createVenueReview(payload);
      setSuccess(true);
      return result;
    } catch (e: any) {
      const msg = e?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { submit, loading, error, success, reset };
};

// ─── useCanReview ─────────────────────────────────────────────────────────────

interface UseCanReviewResult {
  canReview: boolean;
  loading: boolean;
}

export const useCanReview = (venueId: string | null): UseCanReviewResult => {
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!venueId) return;
    let mounted = true;
    setLoading(true);
    checkCanReview(venueId)
      .then((res) => {
        if (mounted) setCanReview(res?.canReview ?? false);
      })
      .catch(() => {
        if (mounted) setCanReview(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [venueId]);

  return { canReview, loading };
};

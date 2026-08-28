import { useState, useEffect, useCallback } from 'react';
import { fetchVenueDetail, fetchVenueSchedule } from '../api/facilityApi';
import { VenueDetail, SlotInfo } from './facility.types';

interface UseVenueDetailResult {
  venue: VenueDetail | null;
  slots: SlotInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Chuyển Date thành chuỗi "YYYY-MM-DD" để gọi API */
const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Hook kết hợp venue detail (courts + priceRules) và slot schedule cho 1 ngày.
 * Gọi lại khi `venueId` hoặc `date` thay đổi.
 */
export const useVenueDetail = (
  venueId: string | null,
  date: Date,
): UseVenueDetailResult => {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger(t => t + 1), []);

  useEffect(() => {
    if (!venueId) return;

    let isMounted = true;
    const dateStr = toDateString(date);

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Chạy song song 2 request
        const [venueData, scheduleData] = await Promise.all([
          fetchVenueDetail(venueId),
          fetchVenueSchedule(venueId, dateStr),
        ]);

        if (isMounted) {
          setVenue(venueData);
          setSlots(scheduleData);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Không thể tải dữ liệu sân');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [venueId, toDateString(date), trigger]);

  return { venue, slots, loading, error, refetch };
};

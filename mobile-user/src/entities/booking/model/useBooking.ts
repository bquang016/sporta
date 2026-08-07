import { useState, useCallback } from 'react';
import { createBooking } from '../api/bookingApi';
import { payBookingWithWallet } from '../../../features/wallet/api/walletApi';
import { CreateBookingRequest, BookingResponse } from './booking.types';

interface UseCreateBookingResult {
  mutate: (data: CreateBookingRequest) => Promise<BookingResponse>;
  loading: boolean;
  error: string | null;
  data: BookingResponse | null;
}

/**
 * Hook để tạo đặt sân.
 * Sử dụng trong PaymentScreen khi user bấm "Thanh toán & Xác nhận".
 */
export const useCreateBooking = (): UseCreateBookingResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BookingResponse | null>(null);

  const mutate = useCallback(async (request: CreateBookingRequest): Promise<BookingResponse> => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (request.paymentMethod === 'wallet') {
        result = await payBookingWithWallet(request);
      } else {
        result = await createBooking(request);
      }
      setData(result);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Đặt sân thất bại. Vui lòng thử lại.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error, data };
};

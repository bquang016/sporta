import { useState, useEffect, useCallback } from 'react';
import { UserTicket } from './ticket.types';
import { fetchMyTickets, purchaseTicket as purchaseTicketApi } from '../api/ticketApi';

export function useUserTickets() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyTickets();
      setTickets(data || []);
    } catch (err: any) {
      console.error('Failed to load my tickets:', err);
      setError(err.message || 'Không thể tải danh sách vé của bạn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return {
    tickets,
    loading,
    error,
    refetch: loadTickets,
  };
}

export function usePurchaseTicket() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executePurchase = async (sessionId: string, quantity: number = 1): Promise<UserTicket> => {
    try {
      setLoading(true);
      setError(null);
      const ticket = await purchaseTicketApi(sessionId, quantity);
      return ticket;
    } catch (err: any) {
      setError(err.message || 'Đặt mua vé không thành công');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseTicket: executePurchase,
    loading,
    error,
  };
}

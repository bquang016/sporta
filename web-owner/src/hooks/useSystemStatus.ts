import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/apiConfig';

export const useSystemStatus = (intervalMs = 10000) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [latency, setLatency] = useState<number | null>(null);

  const checkStatus = async () => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${API_BASE_URL}/auth/ping`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setIsOnline(true);
        setLatency(Date.now() - startTime);
      } else {
        setIsOnline(false);
        setLatency(null);
      }
    } catch (error) {
      setIsOnline(false);
      setLatency(null);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { isOnline, latency };
};

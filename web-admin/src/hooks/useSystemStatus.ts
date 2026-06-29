import { useState, useEffect } from 'react';

export const useSystemStatus = (intervalMs = 10000) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [latency, setLatency] = useState<number | null>(null);

  const checkStatus = async () => {
    // Mocked for UI development
    setIsOnline(true);
    setLatency(Math.floor(Math.random() * 20) + 10); // Mock 10-30ms latency
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { isOnline, latency };
};

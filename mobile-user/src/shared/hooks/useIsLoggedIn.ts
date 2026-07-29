import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface UseIsLoggedInResult {
  isLoggedIn: boolean;
  isLoading: boolean;
  /** Gọi lại để re-check token (ví dụ sau khi đăng nhập / đăng xuất) */
  recheck: () => void;
}

/**
 * Hook kiểm tra trạng thái đăng nhập của user.
 * - Mobile: đọc 'accessToken' từ expo-secure-store
 * - Web:    đọc 'accessToken' từ localStorage
 */
export function useIsLoggedIn(): UseIsLoggedInResult {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recheckTrigger, setRecheckTrigger] = useState(0);

  const recheck = useCallback(() => {
    setRecheckTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkToken = async () => {
      try {
        setIsLoading(true);
        let token: string | null = null;

        if (Platform.OS === 'web') {
          token = localStorage.getItem('accessToken');
        } else {
          token = await SecureStore.getItemAsync('accessToken');
        }

        if (!cancelled) {
          setIsLoggedIn(!!token && token.trim().length > 0);
        }
      } catch {
        if (!cancelled) setIsLoggedIn(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkToken();

    return () => {
      cancelled = true;
    };
  }, [recheckTrigger]);

  return { isLoggedIn, isLoading, recheck };
}

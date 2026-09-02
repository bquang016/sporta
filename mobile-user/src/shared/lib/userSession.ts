import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface UserSessionData {
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  userAvatar: string | null;
}

// In-memory cache for ultra-fast zero-flicker access across the entire app
let memorySession: UserSessionData = {
  isAuthenticated: false,
  accessToken: null,
  userEmail: null,
  userName: null,
  userAvatar: null,
};

// Initialize synchronous web storage immediately on module load
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      memorySession = {
        isAuthenticated: true,
        accessToken: token,
        userEmail: localStorage.getItem('userEmail'),
        userName: localStorage.getItem('userName'),
        userAvatar: localStorage.getItem('userAvatar'),
      };
    }
  } catch (e) {
    // Ignore storage errors
  }
}

export const getCachedUserSession = (): UserSessionData => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const token = localStorage.getItem('accessToken');
      return {
        isAuthenticated: !!token,
        accessToken: token || null,
        userEmail: localStorage.getItem('userEmail') || null,
        userName: localStorage.getItem('userName') || null,
        userAvatar: localStorage.getItem('userAvatar') || null,
      };
    } catch {
      return memorySession;
    }
  }
  return memorySession;
};

export const loadNativeUserSessionAsync = async (): Promise<UserSessionData> => {
  if (Platform.OS === 'web') {
    return getCachedUserSession();
  }

  try {
    const token = await SecureStore.getItemAsync('accessToken');
    const email = await SecureStore.getItemAsync('userEmail');
    const name = await SecureStore.getItemAsync('userName');
    const avatar = await SecureStore.getItemAsync('userAvatar');

    memorySession = {
      isAuthenticated: !!token,
      accessToken: token || null,
      userEmail: email || null,
      userName: name || null,
      userAvatar: avatar || null,
    };
    return memorySession;
  } catch {
    return memorySession;
  }
};

export const saveUserSession = async (data: {
  accessToken?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userAvatar?: string | null;
}): Promise<void> => {
  const current = getCachedUserSession();

  const updated: UserSessionData = {
    isAuthenticated: data.accessToken !== undefined ? !!data.accessToken : current.isAuthenticated,
    accessToken: data.accessToken !== undefined ? data.accessToken : current.accessToken,
    userEmail: data.userEmail !== undefined ? data.userEmail : current.userEmail,
    userName: data.userName !== undefined ? data.userName : current.userName,
    userAvatar: data.userAvatar !== undefined ? data.userAvatar : current.userAvatar,
  };

  memorySession = updated;

  if (Platform.OS === 'web') {
    try {
      if (updated.accessToken) localStorage.setItem('accessToken', updated.accessToken);
      else localStorage.removeItem('accessToken');

      if (updated.userEmail) localStorage.setItem('userEmail', updated.userEmail);
      else localStorage.removeItem('userEmail');

      if (updated.userName) localStorage.setItem('userName', updated.userName);
      else localStorage.removeItem('userName');

      if (updated.userAvatar) localStorage.setItem('userAvatar', updated.userAvatar);
      else localStorage.removeItem('userAvatar');
    } catch (e) {
      console.log('localStorage sync error:', e);
    }
  } else {
    try {
      if (updated.accessToken) await SecureStore.setItemAsync('accessToken', updated.accessToken);
      else await SecureStore.deleteItemAsync('accessToken');

      if (updated.userEmail) await SecureStore.setItemAsync('userEmail', updated.userEmail);
      else await SecureStore.deleteItemAsync('userEmail');

      if (updated.userName) await SecureStore.setItemAsync('userName', updated.userName);
      else await SecureStore.deleteItemAsync('userName');

      if (updated.userAvatar) await SecureStore.setItemAsync('userAvatar', updated.userAvatar);
      else await SecureStore.deleteItemAsync('userAvatar');
    } catch (e) {
      console.log('SecureStore sync error:', e);
    }
  }
};

export const clearUserSession = async (): Promise<void> => {
  memorySession = {
    isAuthenticated: false,
    accessToken: null,
    userEmail: null,
    userName: null,
    userAvatar: null,
  };

  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userAvatar');
    } catch (e) {}
  } else {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userEmail');
      await SecureStore.deleteItemAsync('userName');
      await SecureStore.deleteItemAsync('userAvatar');
    } catch (e) {}
  }
};

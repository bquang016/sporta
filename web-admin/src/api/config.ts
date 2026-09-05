export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('sportaa.tech')) {
      return 'https://api.sportaa.tech/api/v1';
    }
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8387/api/v1`;
    }
  }
  return 'http://localhost:8387/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

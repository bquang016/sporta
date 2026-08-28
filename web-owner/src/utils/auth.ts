// Utility functions for client-side authentication and JWT parsing

export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const getLoggedInUser = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;

  // Check token expiration
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('accessToken');
    return null;
  }

  return {
    email: payload.sub || payload.email,
    userId: payload.userId,
    role: payload.role
  };
};

export interface TokenPayload {
  userId: number;
  role: string;
  sub: string; // email
  exp: number;
}

export const getLoggedInAdmin = (): TokenPayload | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

export interface LoginResponse {
  accessToken: string;
}

export interface UserPayload {
  email: string;
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

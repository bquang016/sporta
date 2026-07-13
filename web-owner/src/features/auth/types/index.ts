export interface LoginResponse {
  accessToken: string;
  mustChangePassword?: boolean;
}

export interface UserPayload {
  email: string;
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

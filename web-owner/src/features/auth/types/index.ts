export interface LoginResponse {
  accessToken: string;
  mustChangePassword?: boolean;
  passwordSnoozeUntil?: string; // ISO-8601 datetime string, null if no snooze
}

export interface UserPayload {
  email: string;
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

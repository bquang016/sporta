import type { LoginResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch('http://localhost:8387/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }

    return data;
  }
};

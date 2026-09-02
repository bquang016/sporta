import type { LoginResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const response = await fetch(`http://${host}:8387/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }

    return data;
  },

  async snoozeChangePassword(snoozeDays: number): Promise<{ message: string }> {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://${host}:8387/api/v1/auth/snooze-change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ snoozeDays }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể tạm hoãn nhắc nhở.');
    }

    return data;
  },
};

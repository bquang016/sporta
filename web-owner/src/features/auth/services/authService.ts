import type { LoginResponse } from '../types';
import { API_BASE_URL } from '../../../services/apiConfig';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/auth/snooze-change-password`, {
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

  async sendForgotPasswordOtp(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Gửi mã OTP thất bại.');
    }
    return data;
  },

  async verifyForgotPasswordOtp(email: string, otp: string): Promise<{ resetToken: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Mã OTP không hợp lệ.');
    }
    return data;
  },

  async resetPassword(resetToken: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Đặt lại mật khẩu thất bại.');
    }
    return data;
  },
};


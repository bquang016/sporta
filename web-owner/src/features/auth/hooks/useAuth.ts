import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import type { UserPayload } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (location.state && (location.state as any).error) {
      setErrorMsg((location.state as any).error);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.login(email, password);

      const base64Url = data.accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload: UserPayload = JSON.parse(window.atob(base64));

      if (payload.role !== 'OWNER') {
        throw new Error('Tài khoản không có quyền truy cập trang quản lý chủ sân.');
      }

      localStorage.setItem('accessToken', data.accessToken);
      if (data.mustChangePassword) {
        localStorage.setItem('mustChangePassword', 'true');
      } else {
        localStorage.removeItem('mustChangePassword');
      }
      if (data.passwordSnoozeUntil) {
        localStorage.setItem('passwordSnoozeUntil', data.passwordSnoozeUntil);
      } else {
        localStorage.removeItem('passwordSnoozeUntil');
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    errorMsg,
    setErrorMsg,
    handleSubmit
  };
};

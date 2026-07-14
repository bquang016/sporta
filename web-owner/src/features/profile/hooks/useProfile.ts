import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getLoggedInUser } from '../../../utils/auth';

export const useProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'info';
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const loggedInUser = getLoggedInUser();
  const userEmail = loggedInUser?.email || 'owner@sporta.vn';
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  const [profileData, setProfileData] = useState({
    name: 'Nguyễn Quang Huy',
    email: userEmail,
    phone: '0987 654 321',
    role: 'Chủ sân',
    facilityName: 'Sporta Arena Quận 7',
    address: '152 Nguyễn Văn Linh, Phường Tân Thuận Tây, Quận 7, TP. HCM',
    openHours: '05:00 - 23:00',
    description: 'Hệ thống cụm 4 sân bóng cỏ nhân tạo chất lượng cao, trang bị đèn LED chuẩn thi đấu và dịch vụ nước uống, phòng tắm miễn phí.'
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân và cơ sở thành công!' });
    }, 800);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ tất cả các trường mật khẩu!' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 8 ký tự!' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp!' });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8387/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.oldPassword.trim(),
          newPassword: passwordData.newPassword.trim(),
          confirmPassword: passwordData.confirmPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại.');
      }

      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Đổi mật khẩu tài khoản thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  const executeLogout = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      if (token) {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        await fetch(`http://${host}:8387/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return {
    activeTab,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    userEmail,
    userInitials,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    message,
    setMessage,
    isSaving,
    handleProfileSave,
    handlePasswordSave,
    handleTabChange,
    executeLogout
  };
};

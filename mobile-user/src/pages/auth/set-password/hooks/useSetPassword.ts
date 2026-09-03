import { useState } from 'react';
import { useRouter } from 'expo-router';
import { changePasswordApi } from '../../../../shared/api/auth';
import { useAlert } from '../../../../shared/contexts/AlertContext';

export function useSetPassword() {
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      showAlert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      // Vì user đang có mustChangePassword = true, backend sẽ tự động bypass kiểm tra currentPassword.
      // Do đó ta có thể truyền chuỗi bất kỳ cho currentPassword, API vẫn sẽ được xử lý.
      await changePasswordApi('BYPASS_CURRENT', password, confirmPassword);
      showAlert('Thành công', 'Đã thiết lập mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng Email và Mật khẩu này.', () => {
        router.replace('/(tabs)');
      });
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Thiết lập mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Nếu thiết kế cho phép bỏ qua (có thể backend không bắt buộc, hoặc chỉ nhắc nhở sau)
    // Hiện tại chuyển thẳng vào app nếu user ấn Bỏ qua
    router.replace('/(tabs)');
  };

  return {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    isFocusedPassword, setIsFocusedPassword,
    isFocusedConfirm, setIsFocusedConfirm,
    loading,
    handleSubmit,
    handleSkip,
  };
}

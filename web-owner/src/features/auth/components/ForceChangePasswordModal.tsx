import React, { useState } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const ForceChangePasswordModal = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8387/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại.');
      }

      setSuccessMsg('Đổi mật khẩu thành công!');
      
      setTimeout(() => {
        localStorage.removeItem('mustChangePassword');
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) =>
    show ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh', 'Rất mạnh'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-600'];
  const strength = getPasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200">
        {/* Gradient accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-brand-emerald via-brand-emerald to-brand-yellow" />
        
        <div className="p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Đổi mật khẩu bắt buộc</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Bạn cần đổi mật khẩu tạm thời để tiếp tục sử dụng hệ thống.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu từ email"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20 focus:bg-white transition-all"
                  required
                  disabled={isLoading || !!successMsg}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-emerald transition-colors"
                >
                  <EyeIcon show={showCurrent} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20 focus:bg-white transition-all"
                  required
                  disabled={isLoading || !!successMsg}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-emerald transition-colors"
                >
                  <EyeIcon show={showNew} />
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="flex items-center gap-2 px-1 pt-1">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strength >= level ? strengthColors[strength] : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${
                    strength <= 1 ? 'text-red-500' :
                    strength <= 2 ? 'text-orange-500' :
                    strength <= 3 ? 'text-yellow-600' : 'text-emerald-600'
                  }`}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 font-bold text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword.length > 0 && confirmPassword !== newPassword
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : confirmPassword.length > 0 && confirmPassword === newPassword
                      ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                      : 'border-slate-200 focus:border-brand-emerald focus:ring-brand-emerald/20'
                  } focus:bg-white`}
                  required
                  disabled={isLoading || !!successMsg}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-emerald transition-colors"
                >
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!successMsg}
              className="w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-sm py-3 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="primary" />
                  <span>Đang xử lý...</span>
                </>
              ) : successMsg ? (
                <span>Thành công!</span>
              ) : (
                <span>Xác nhận đổi mật khẩu</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForceChangePasswordModal;

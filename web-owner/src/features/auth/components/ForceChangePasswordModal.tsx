import React, { useState } from 'react';
import { Modal } from '../../../common/ui/overlay/Modal';
import { Button } from '../../../common/ui/buttons/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../../../services/apiConfig';

type ViewMode = 'reminder' | 'changeForm';

export const ForceChangePasswordModal = () => {
  // ── View state ──
  const [view, setView] = useState<ViewMode>('reminder');
  const [isSnoozing, setIsSnoozing] = useState(false);

  // ── Change password form state ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* ================================================================
   *  SNOOZE HANDLER
   * ================================================================ */
  const handleSnooze = async (days: number) => {
    setIsSnoozing(true);
    setErrorMsg('');
    try {
      await authService.snoozeChangePassword(days);
      // Save snooze to localStorage
      const snoozeUntil = new Date();
      snoozeUntil.setDate(snoozeUntil.getDate() + days);
      localStorage.setItem('passwordSnoozeUntil', snoozeUntil.toISOString());
      // Force re-render of ProtectedRoute
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạm hoãn nhắc nhở.');
      setIsSnoozing(false);
    }
  };

  /* ================================================================
   *  CHANGE PASSWORD HANDLER
   * ================================================================ */
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
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
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
        localStorage.removeItem('passwordSnoozeUntil');
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================================================
   *  EYE ICON
   * ================================================================ */
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

  /* ================================================================
   *  PASSWORD STRENGTH INDICATOR
   * ================================================================ */
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

  /* ================================================================
   *  VIEW: REMINDER (default)
   * ================================================================ */
  const renderReminder = () => {
    const reminderFooter = (
      <div className="flex flex-col w-full gap-2">
        <Button
          variant="primary"
          fullWidth
          size="md"
          className="font-black text-xs uppercase tracking-wider"
          onClick={() => setView('changeForm')}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Đổi mật khẩu ngay
          </span>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            fullWidth
            size="sm"
            className="font-bold text-[11px]"
            onClick={() => handleSnooze(1)}
            disabled={isSnoozing}
          >
            {isSnoozing ? (
              <LoadingSpinner size="sm" color="primary" />
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Nhắc lại sau 1 ngày
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            fullWidth
            size="sm"
            className="font-bold text-[11px]"
            onClick={() => handleSnooze(3)}
            disabled={isSnoozing}
          >
            {isSnoozing ? (
              <LoadingSpinner size="sm" color="primary" />
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Nhắc lại sau 3 ngày
              </span>
            )}
          </Button>
        </div>
      </div>
    );

    return (
      <Modal
        isOpen={true}
        onClose={() => {}} // Modal cannot be closed by clicking backdrop
        title="Nhắc nhở bảo mật"
        maxWidth="sm"
        footer={reminderFooter}
      >
        <div className="flex flex-col items-center text-center py-2 space-y-4 select-none">
          {/* Warning icon */}
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-black text-slate-700">
              Bạn đang sử dụng mật khẩu tạm thời
            </p>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
              Mật khẩu này được admin cấp qua email. Vui lòng đổi sang mật khẩu cá nhân để bảo mật tài khoản của bạn.
            </p>
          </div>

          {/* Error message from snooze */}
          {errorMsg && (
            <div className="w-full p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  /* ================================================================
   *  VIEW: CHANGE PASSWORD FORM (inline in modal)
   * ================================================================ */
  const renderChangeForm = () => {
    const formFooter = (
      <div className="flex gap-2 w-full">
        <Button
          variant="ghost"
          onClick={() => {
            setView('reminder');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className="font-bold text-xs"
          disabled={isLoading || !!successMsg}
        >
          ← Quay lại
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit as any}
          disabled={isLoading || !!successMsg}
          loading={isLoading}
          className="font-black text-xs"
        >
          {successMsg ? '✓ Thành công!' : 'Xác nhận đổi mật khẩu'}
        </Button>
      </div>
    );

    return (
      <Modal
        isOpen={true}
        onClose={() => {}} // Cannot close
        title="Đổi mật khẩu"
        maxWidth="sm"
        footer={formFooter}
      >
        <div className="space-y-4">
          {/* Error banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2 animate-fadeIn">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success banner */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-700 flex items-center gap-2 animate-fadeIn">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Current Password */}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-emerald transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  <EyeIcon show={showCurrent} />
                </button>
              </div>
            </div>

            {/* New Password */}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-emerald transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  <EyeIcon show={showNew} />
                </button>
              </div>
              {/* Password strength indicator */}
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

            {/* Confirm Password */}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-emerald transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p className={`text-[9px] font-black pl-1 ${
                  confirmPassword === newPassword ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {confirmPassword === newPassword ? '✓ Mật khẩu khớp' : '✕ Mật khẩu chưa khớp'}
                </p>
              )}
            </div>
          </form>
        </div>
      </Modal>
    );
  };

  /* ================================================================
   *  RENDER
   * ================================================================ */
  return view === 'reminder' ? renderReminder() : renderChangeForm();
};

export default ForceChangePasswordModal;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getLoggedInUser } from '../utils/auth';
import { API_BASE_URL } from '../services/apiConfig';
import logoHorizontal from '../assets/logo/light/logo-horizontal_1600x400px.svg';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validation
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

      setSuccessMsg('Đổi mật khẩu thành công! Đang chuyển hướng...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================================================
   *  EYE ICON COMPONENT
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
   *  RENDER
   * ================================================================ */
  return (
    <div className="min-h-[100dvh] font-sans flex items-center justify-center bg-surface-container-low relative select-none overflow-hidden">

      {/* ── Decorative glow blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -right-[15%] w-[55%] h-[55%] bg-brand-emerald/[0.03] rounded-full blur-[80px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[45%] h-[45%] bg-brand-yellow/[0.03] rounded-full blur-[80px]" />
      </div>

      {/* ── Form container ── */}
      <div className="w-full max-w-[440px] px-5 relative z-10">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <img src={logoHorizontal} alt="Sporta Logo" className="h-10 lg:h-12 w-auto object-contain" />
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">

          {/* Gradient accent bar */}
          <div className="h-[1.5px] lg:h-[2px] bg-gradient-to-r from-brand-emerald via-brand-emerald to-brand-yellow" />

          <div className="p-5 lg:p-7">

            {/* ── Header ── */}
            <div className="text-center mb-5 lg:mb-6">
              <div className="w-11 h-11 lg:w-13 lg:h-13 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-2.5 lg:mb-3">
                <svg className="w-5.5 h-5.5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-base lg:text-lg font-black text-slate-800 tracking-tight">Đổi mật khẩu</h3>
              <p className="text-[10px] lg:text-[11px] text-slate-400 font-semibold mt-0.5">
                Vui lòng đổi mật khẩu để bảo mật tài khoản của bạn
              </p>
            </div>

            {/* ── Info banner ── */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] font-bold text-blue-700 flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Đây là lần đăng nhập đầu tiên. Bạn cần đổi mật khẩu tạm thời sang mật khẩu cá nhân để tiếp tục sử dụng hệ thống.</span>
            </div>

            {/* ── Error banner ── */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2 animate-fadeIn">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ── Success banner ── */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-700 flex items-center gap-2 animate-fadeIn">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-3.5 lg:space-y-4">

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">Mật khẩu hiện tại</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu từ email"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 lg:py-3 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                               focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
                    required
                    disabled={isLoading || !!successMsg}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-brand-emerald transition-colors focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    <EyeIcon show={showCurrent} />
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 lg:py-3 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                               focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
                    required
                    disabled={isLoading || !!successMsg}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-brand-emerald transition-colors focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    <EyeIcon show={showNew} />
                  </button>
                </div>
                {/* Password strength indicator */}
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-2 px-0.5 pt-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
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
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-11 py-2.5 lg:py-3 rounded-xl border bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                               focus:outline-none focus:ring-2 transition-all ${
                                 confirmPassword.length > 0 && confirmPassword !== newPassword
                                   ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                   : confirmPassword.length > 0 && confirmPassword === newPassword
                                   ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                                   : 'border-slate-200 focus:border-brand-emerald focus:ring-brand-emerald/10'
                               } focus:bg-white`}
                    required
                    disabled={isLoading || !!successMsg}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-brand-emerald transition-colors focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <p className={`text-[9px] font-black pl-0.5 ${
                    confirmPassword === newPassword ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {confirmPassword === newPassword ? '✓ Mật khẩu khớp' : '✕ Mật khẩu chưa khớp'}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                id="change-password-submit"
                type="submit"
                disabled={isLoading || !!successMsg}
                className="w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs py-3 lg:py-3.5 rounded-xl shadow-md
                           transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
                           disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mt-5!"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="primary" />
                    <span>Đang xử lý...</span>
                  </>
                ) : successMsg ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Thành công!</span>
                  </>
                ) : (
                  <span>Xác nhận đổi mật khẩu</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Security note ── */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-slate-200/60 rounded-full">
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[9px] font-bold text-slate-500">Kết nối được bảo mật bởi SSL/TLS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

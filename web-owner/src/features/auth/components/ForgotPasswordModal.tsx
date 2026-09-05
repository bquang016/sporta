import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { authService } from '../services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

type Step = 'REQUEST_OTP' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'SUCCESS';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const [step, setStep] = useState<Step>('REQUEST_OTP');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('REQUEST_OTP');
      setEmail(initialEmail);
      setOtp(['', '', '', '', '', '']);
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'VERIFY_OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await authService.sendForgotPasswordOtp(email);
      setStep('VERIFY_OTP');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setErrorMsg('');
    setIsLoading(true);
    try {
      await authService.sendForgotPasswordOtp(email);
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg('Đã gửi lại mã OTP mới qua email.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((c, i) => {
        if (i < 6) newOtp[i] = c;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(chars.length, 5);
      otpRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[idx] = cleaned;
    setOtp(newOtp);

    if (cleaned && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrorMsg('Vui lòng nhập đầy đủ mã OTP 6 số.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await authService.verifyForgotPasswordOtp(email, otpCode);
      setResetToken(res.resetToken);
      setStep('RESET_PASSWORD');
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword, confirmPassword);
      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMsg(err.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Header Bar Accent */}
        <div className="h-1.5 bg-gradient-to-r from-brand-emerald via-emerald-600 to-brand-yellow" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 lg:p-8">
          {/* STEP 1: REQUEST OTP */}
          {step === 'REQUEST_OTP' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-slate-800">Quên mật khẩu?</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Nhập địa chỉ email đăng ký tài khoản Chủ sân của bạn để nhận mã xác thực OTP.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email tài khoản</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="owner@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-emerald hover:bg-emerald-900 text-white font-black text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner size="sm" color="white" /> : <span>Gửi mã OTP xác thực</span>}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 'VERIFY_OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-slate-800">Nhập mã OTP</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Mã OTP 6 chữ số đã được gửi tới email <strong className="text-slate-700">{email}</strong>
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 6 Digit Input Grid */}
              <div className="flex justify-between gap-2 py-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-11 h-13 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-black text-slate-800 focus:outline-none focus:border-brand-emerald focus:bg-white focus:ring-2 focus:ring-brand-emerald/10"
                  />
                ))}
              </div>

              {/* Resend OTP Timer */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs font-bold text-brand-emerald hover:underline cursor-pointer"
                  >
                    Gửi lại mã OTP
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">
                    Gửi lại mã sau <strong className="text-slate-600">{countdown}s</strong>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST_OTP')}
                  className="w-1/3 border border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-brand-emerald hover:bg-emerald-900 text-white font-black text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <LoadingSpinner size="sm" color="white" /> : <span>Xác nhận OTP</span>}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 'RESET_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-slate-800">Đặt lại mật khẩu</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Nhập mật khẩu mới bảo mật cho tài khoản của bạn.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-yellow hover:bg-yellow-400 text-slate-900 font-black text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner size="sm" color="primary" /> : <span>Lưu mật khẩu mới</span>}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-brand-emerald flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-800">Đặt lại mật khẩu thành công!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Mật khẩu của bạn đã được cập nhật thành công. Vui lòng sử dụng mật khẩu mới để đăng nhập.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-brand-emerald hover:bg-emerald-900 text-white font-black text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

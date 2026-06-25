// ─────────────────────────────────────────────────────────────────────────────
// Registration — Step 1a: Email Input
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface EmailStepProps {
  email: string;
  onEmailChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  errorMsg: string;
}

export const EmailStep = ({
  email,
  onEmailChange,
  onSubmit,
  isLoading,
  errorMsg,
}: EmailStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-4 lg:mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mx-auto mb-2 lg:mb-3">
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base lg:text-lg font-black text-slate-800 tracking-tight">
          Tiếp tục đăng ký
        </h3>
        <p className="text-[10px] lg:text-[11px] text-slate-400 font-semibold mt-0.5">
          Nhập email để nhận mã xác thực OTP
        </p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2 animate-fadeIn">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
            Địa chỉ Email
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="register-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                         focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>

        <button
          id="register-send-otp"
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs py-3 lg:py-3.5 rounded-xl shadow-md
                     transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
                     disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="primary" />
              <span>Đang gửi mã OTP...</span>
            </>
          ) : (
            <span>Tiếp tục đăng ký</span>
          )}
        </button>
      </form>

      {/* Login link */}
      <div className="mt-4 text-center text-[10px] text-slate-400 font-semibold">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-brand-emerald font-black hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};

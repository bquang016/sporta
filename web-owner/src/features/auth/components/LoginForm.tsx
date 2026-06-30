import React from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Checkbox } from '../../../components/ui/Checkbox';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 lg:space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">Địa chỉ Email</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            id="login-email"
            type="email"
            placeholder="name@sporta.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                       focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-0.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mật khẩu</label>
          <a href="#forgot" className="text-[9px] font-black text-brand-emerald hover:underline uppercase tracking-wider">Quên mật khẩu?</a>
        </div>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-11 py-2.5 lg:py-3 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                       focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-brand-emerald transition-colors focus:outline-none cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember */}
      <Checkbox
        id="remember"
        label="Ghi nhớ đăng nhập"
        labelClassName="text-[10px] font-bold text-slate-500 select-none cursor-pointer"
      />

      {/* Submit button */}
      <button
        id="login-submit"
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs py-3 lg:py-3.5 rounded-xl shadow-md
                   transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
                   disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" color="primary" />
            <span>Đang xác thực...</span>
          </>
        ) : (
          <span>Đăng nhập hệ thống</span>
        )}
      </button>
    </form>
  );
};

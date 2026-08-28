import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoHorizontal from '@/assets/logo/light/logo-horizontal_1600x400px.svg';

export const LoginPage = () => {
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
      const response = await fetch('http://localhost:8387/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      const base64Url = data.accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
        throw new Error('Tài khoản không có quyền truy cập trang quản trị viên.');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('permissions', JSON.stringify(data.permissions || []));
      localStorage.setItem('role', payload.role);

      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================================================
   *  RENDER
   * ================================================================ */
  return (
    <div className="h-[100dvh] font-sans flex flex-col lg:flex-row select-none overflow-hidden">

      {/* ═══════════════════════════════════════════════════════════
       *  CỘT TRÁI — BRANDING PANEL
       * ═══════════════════════════════════════════════════════════ */}
      <div
        className="shrink-0 lg:w-[45%]
                    bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900
                    text-white relative overflow-hidden
                    flex flex-col justify-between
                    px-5 py-4
                    lg:px-14 lg:py-12"
      >
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <img src={logoHorizontal} alt="Sporta Logo" className="h-10 lg:h-12 w-auto object-contain" />
          <span className="text-[8px] lg:text-[9px] text-white/40 font-bold uppercase tracking-widest block self-end pb-1">Admin Portal</span>
        </div>

        <div className="relative z-10 mt-3 lg:mt-0">
          <h2 className="text-base lg:text-4xl font-black tracking-tight text-white leading-snug lg:leading-tight">
            Quản trị hệ thống,<br className="hidden lg:block" />{' '}
            <span className="text-brand-yellow">bảo mật</span> & mạnh mẽ
          </h2>
          <p className="hidden lg:block text-sm text-white/50 max-w-md font-medium leading-relaxed mt-3">
            Hệ thống giám sát vận hành, kiểm duyệt sân bãi và quản lý phân quyền chuyên biệt dành cho Ban quản trị Sporta.
          </p>
        </div>

        <div className="relative z-10 hidden lg:grid grid-cols-3 gap-3 mt-0">
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ),
              title: 'Kiểm duyệt',
              sub: 'Tự động & thủ công',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              ),
              title: 'Tài khoản',
              sub: 'Quản lý tập trung',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              ),
              title: 'Thống kê',
              sub: 'Báo cáo chi tiết',
            },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-brand-yellow/15 text-brand-yellow flex items-center justify-center mx-auto mb-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
              </div>
              <p className="text-[9px] font-black text-white/70 uppercase tracking-wider">{f.title}</p>
              <p className="text-[8px] text-white/40 font-medium mt-0.5">{f.sub}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-white/25 text-[9px] font-bold uppercase tracking-widest hidden lg:block">
          Sporta Admin Portal © 2026
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
       *  CỘT PHẢI — LOGIN FORM PANEL
       * ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center bg-surface-container-low relative px-5 py-4 lg:px-16 lg:py-12 min-h-0">
        <div className="w-full max-w-[400px] relative z-10">
          <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
            <div className="h-[1.5px] lg:h-[2px] bg-gradient-to-r from-brand-emerald via-brand-emerald to-brand-yellow" />

            <div className="p-5 lg:p-7">
              <div className="text-center mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mx-auto mb-2 lg:mb-3">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base lg:text-lg font-black text-slate-800 tracking-tight">Cổng Quản Trị Hệ Thống</h3>
                <p className="text-[10px] lg:text-[11px] text-slate-400 font-semibold mt-0.5">Nhập thông tin xác thực để tiếp tục</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2 animate-fadeIn">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 lg:space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">Tài khoản quản trị</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="admin@sporta.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                                 focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-0.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mật khẩu</label>
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

                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs py-3 lg:py-3.5 rounded-xl shadow-md
                             transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
                             disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mt-4"
                >
                  {isLoading ? (
                    <span>Đang xác thực...</span>
                  ) : (
                    <span>Đăng nhập hệ thống</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

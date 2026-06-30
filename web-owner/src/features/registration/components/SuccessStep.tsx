// ─────────────────────────────────────────────────────────────────────────────
// Registration — Step 3: Success / Submission Complete
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';

export const SuccessStep = () => {
  return (
    <div className="animate-fadeIn text-center py-2 lg:py-4">
      {/* Animated checkmark */}
      <div className="relative w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-5">
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-brand-emerald/10 animate-ping opacity-50" />
        {/* Solid circle */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-brand-emerald to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-emerald/25">
          <svg
            className="w-8 h-8 lg:w-10 lg:h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base lg:text-lg font-black text-slate-800 tracking-tight mb-1.5">
        Hồ sơ đã được gửi thành công!
      </h3>

      {/* Description */}
      <p className="text-[11px] lg:text-xs text-slate-500 font-semibold leading-relaxed max-w-[280px] mx-auto mb-5 lg:mb-6">
        Ban quản trị sẽ rà soát và phản hồi kết quả qua Email trong vòng{' '}
        <span className="text-brand-emerald font-black">24 – 48 giờ</span>.
      </p>

      {/* Info card */}
      <div className="bg-brand-emerald/5 border border-brand-emerald/15 rounded-xl p-3.5 mb-5 lg:mb-6 text-left">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-emerald/10 text-brand-emerald flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
              Bước tiếp theo
            </p>
            <ul className="space-y-1">
              <li className="text-[10px] text-slate-500 font-semibold flex items-start gap-1.5">
                <span className="text-brand-emerald mt-[1px]">•</span>
                Kiểm tra email để nhận thông báo từ ban quản trị
              </li>
              <li className="text-[10px] text-slate-500 font-semibold flex items-start gap-1.5">
                <span className="text-brand-emerald mt-[1px]">•</span>
                Sau khi được duyệt, đăng nhập bằng Email và mật khẩu tạm thời
              </li>
              <li className="text-[10px] text-slate-500 font-semibold flex items-start gap-1.5">
                <span className="text-brand-emerald mt-[1px]">•</span>
                Đổi mật khẩu ở lần đăng nhập đầu tiên để kích hoạt tài khoản
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/login"
        id="register-go-login"
        className="inline-flex items-center justify-center gap-2 w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs py-3 lg:py-3.5 rounded-xl shadow-md
                   transition-all active:scale-[0.98] cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span>Về trang đăng nhập</span>
      </Link>
    </div>
  );
};

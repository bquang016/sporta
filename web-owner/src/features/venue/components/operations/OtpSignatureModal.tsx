import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';

interface OtpSignatureModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (signatureData: { timestamp: string; ip: string }) => void;
}

export const OtpSignatureModal = ({
  isOpen,
  email,
  onClose,
  onSuccess,
}: OtpSignatureModalProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Timer state
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize and send OTP when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setAttempts(0);
      setIsLocked(false);
      setErrorMsg('');
      setTimeLeft(120);

      // Auto trigger send OTP on mount
      handleResendOtp(false);
    }
  }, [isOpen]);

  // Timer logic
  useEffect(() => {
    if (!isOpen || isLocked || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLocked(true);
          setErrorMsg('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isLocked, timeLeft]);

  const handleResendOtp = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMsg('');
    setOtp(['', '', '', '', '', '']);

    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://${host}:8387/api/v1/auth/send-otp-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Lỗi gửi mã OTP.');
      }
      
      setAttempts(0);
      setIsLocked(false);
      setTimeLeft(120);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi gửi mã OTP.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (isLocked) return;

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://${host}:8387/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ email, otp: code })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Mã OTP không hợp lệ.');
      }

      // Success
      const timestamp = new Date().toISOString();
      onSuccess({ timestamp, ip: '192.168.1.1' }); // Mock IP
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLocked(true);
        setErrorMsg('Bạn đã nhập sai quá 3 lần. Vui lòng gửi lại mã OTP mới.');
      } else {
        setErrorMsg(`Mã OTP không hợp lệ. Bạn còn ${3 - newAttempts} lần thử.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto verify when 6 digits are entered
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !isLocked && !isLoading) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />
      <div className="relative bg-white rounded-3xl p-6 lg:p-8 w-full max-w-sm shadow-2xl animate-[stampIn_0.3s_ease-out]">

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-emerald/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-800">Xác thực Ký kết</h3>
          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
            Mã xác thực gồm 6 số đã được gửi tới email<br />
            <strong className="text-slate-700">{email}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold text-center border border-red-100">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={isLocked || isLoading}
              className="w-11 h-12 text-center text-xl font-black rounded-xl border border-slate-300 focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/20 transition-all bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
            />
          ))}
        </div>

        <div className="text-center mb-6">
          {isLocked ? (
            <button
              onClick={() => handleResendOtp(true)}
              disabled={isLoading}
              className="text-xs font-bold text-brand-emerald hover:text-emerald-700 hover:underline cursor-pointer"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi lại mã OTP mới'}
            </button>
          ) : (
            <div className="text-xs font-bold text-slate-400">
              Mã hết hạn sau <span className="text-brand-yellow drop-shadow-sm px-1 text-sm">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          {isLoading && (
            <button
              disabled
              className="flex-1 py-3 text-xs font-bold text-white bg-brand-emerald rounded-xl flex justify-center items-center gap-2 shadow-md"
            >
              <LoadingSpinner size="sm" color="white" />
              Đang xử lý
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — Custom Hook (Email + OTP only)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RegistrationStep } from '../types';
import * as registrationService from '../services/registrationService';

const OTP_COUNTDOWN_SECONDS = 60;

export function useRegistration() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Step navigation ──
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(() => {
    // Check if we're returning from setup with success
    if (location.state && (location.state as any).success) {
      return 'success';
    }
    return 'email';
  });

  // ── Email & OTP state ──
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));

  // ── Countdown timer ──
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Loading & error ──
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Clear success state from URL ──
  useEffect(() => {
    if (location.state && (location.state as any).success) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ── Cleanup countdown on unmount ──
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── Start countdown timer ──
  const startCountdown = useCallback(() => {
    setCountdown(OTP_COUNTDOWN_SECONDS);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Step 1a: Send OTP ──
  const handleSendOtp = useCallback(async () => {
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Địa chỉ email không hợp lệ.');
      return;
    }

    setIsLoading(true);
    try {
      await registrationService.sendOtp(email);
      setCurrentStep('otp');
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi mã OTP.');
    } finally {
      setIsLoading(false);
    }
  }, [email, startCountdown]);

  // ── Step 1a: Resend OTP ──
  const handleResendOtp = useCallback(async () => {
    setErrorMsg('');
    setOtp(Array(6).fill(''));
    setIsLoading(true);
    try {
      await registrationService.sendOtp(email);
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  }, [email, startCountdown]);

  // ── Step 1b: Verify OTP → Redirect to Setup page ──
  const handleVerifyOtp = useCallback(async () => {
    setErrorMsg('');
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registrationService.verifyOtp(email, otpCode);
      // Redirect to the full-width setup page with the registration token
      navigate('/register/setup', {
        state: {
          registrationToken: res.registrationToken,
          email: email,
        },
        replace: true,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã OTP không chính xác.');
    } finally {
      setIsLoading(false);
    }
  }, [email, otp, navigate]);

  // ── Go back to previous step ──
  const goBack = useCallback(() => {
    setErrorMsg('');
    if (currentStep === 'otp') {
      setCurrentStep('email');
      setOtp(Array(6).fill(''));
    }
  }, [currentStep]);

  return {
    // State
    currentStep,
    email,
    otp,
    countdown,
    isLoading,
    errorMsg,

    // Setters
    setEmail,
    setOtp,
    setErrorMsg,

    // Actions
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    goBack,
  };
}

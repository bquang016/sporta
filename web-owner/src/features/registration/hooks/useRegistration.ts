// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — Custom Hook
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react';
import type { RegistrationStep, PersonalInfo, VenueInfo } from '../types';
import * as registrationService from '../services/registrationService';

const OTP_COUNTDOWN_SECONDS = 60;

export function useRegistration() {
  // ── Step navigation ──
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('email');

  // ── Email & OTP state ──
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [registrationToken, setRegistrationToken] = useState('');

  // ── Countdown timer ──
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Loading & error ──
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Form data ──
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    idNumber: '',
  });

  const [venueInfo, setVenueInfo] = useState<VenueInfo>({
    venueName: '',
    province: '',
    district: '',
    ward: '',
    sportTypes: [],
    subCourtCount: 1,
    images: [],
  });

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

  // ── Step 1b: Verify OTP ──
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
      setRegistrationToken(res.registrationToken);
      setCurrentStep('info');
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã OTP không chính xác.');
    } finally {
      setIsLoading(false);
    }
  }, [email, otp]);

  // ── Step 2: Submit registration ──
  const handleSubmitRegistration = useCallback(async () => {
    setErrorMsg('');

    // Validate personal info
    if (!personalInfo.fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên.');
      return;
    }
    if (!personalInfo.idNumber.trim()) {
      setErrorMsg('Vui lòng nhập số CCCD/CMND.');
      return;
    }

    // Validate venue info
    if (!venueInfo.venueName.trim()) {
      setErrorMsg('Vui lòng nhập tên cụm sân.');
      return;
    }
    if (!venueInfo.province.trim()) {
      setErrorMsg('Vui lòng nhập Tỉnh/Thành phố.');
      return;
    }
    if (!venueInfo.district.trim()) {
      setErrorMsg('Vui lòng nhập Quận/Huyện.');
      return;
    }
    if (!venueInfo.ward.trim()) {
      setErrorMsg('Vui lòng nhập Phường/Xã.');
      return;
    }
    if (venueInfo.sportTypes.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một loại sân.');
      return;
    }

    setIsLoading(true);
    try {
      await registrationService.registerOwner(
        registrationToken,
        personalInfo,
        venueInfo
      );
      setCurrentStep('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi hồ sơ đăng ký.');
    } finally {
      setIsLoading(false);
    }
  }, [registrationToken, personalInfo, venueInfo]);

  // ── Go back to previous step ──
  const goBack = useCallback(() => {
    setErrorMsg('');
    if (currentStep === 'otp') {
      setCurrentStep('email');
      setOtp(Array(6).fill(''));
    } else if (currentStep === 'info') {
      // Don't allow going back from info to OTP (token already issued)
      // Could go back to email if needed
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
    personalInfo,
    venueInfo,

    // Setters
    setEmail,
    setOtp,
    setErrorMsg,
    setPersonalInfo,
    setVenueInfo,

    // Actions
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleSubmitRegistration,
    goBack,
  };
}

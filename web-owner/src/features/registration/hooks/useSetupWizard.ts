// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — Setup Wizard Hook (5-step form)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { SetupStep, PersonalInfo, VenueInfo, SubCourt } from '../types';
import { DEFAULT_PRICING_SLOTS, SETUP_STEPS } from '../types';
import * as registrationService from '../services/registrationService';

export function useSetupWizard() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Registration token from OTP verification ──
  const state = location.state as { registrationToken?: string; email?: string } | null;
  const registrationToken = state?.registrationToken || '';
  const email = state?.email || '';

  // Redirect to register page if no token
  useEffect(() => {
    if (!registrationToken) {
      navigate('/register', { replace: true });
    }
  }, [registrationToken, navigate]);

  // ── Step navigation ──
  const [currentStep, setCurrentStep] = useState<SetupStep>('personal');

  // ── Loading & error ──
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Form data ──
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    idNumber: '',
    idFrontImage: null,
    idBackImage: null,
  });

  const [venueInfo, setVenueInfo] = useState<VenueInfo>({
    name: '',
    location: '',
    latitude: 21.028511,
    longitude: 105.804817,
    description: '',
    province: '',
    district: '',
    ward: '',
    addressDetail: '',
    openingTime: '06:00',
    closingTime: '22:00',
    shiftDurationMinutes: 60,
    sportId: '',
    coverImage: null,
    detailImages: [],
    hasSurcharge: false,
    surchargeDescription: '',
  });


  const [courts, setCourts] = useState<SubCourt[]>([]);

  // ── Step index helpers ──
  const stepIndex = SETUP_STEPS.findIndex((s) => s.key === currentStep);

  // ── Validation per step ──
  const validateStep = useCallback(
    (step: SetupStep): string | null => {
      switch (step) {
        case 'personal':
          if (!personalInfo.fullName.trim()) return 'Vui lòng nhập họ và tên.';
          if (!personalInfo.idNumber.trim()) return 'Vui lòng nhập số CCCD/CMND.';
          return null;

        case 'venue-basic':
          if (!venueInfo.name.trim()) return 'Vui lòng nhập tên cụm sân.';
          if (!venueInfo.location.trim()) return 'Vui lòng chọn vị trí trên bản đồ.';
          return null;

        case 'venue-courts':
          if (!venueInfo.sportId) return 'Vui lòng chọn môn thể thao chính.';
          if (courts.length === 0) return 'Vui lòng khai báo ít nhất một sân lẻ.';
          for (const court of courts) {
            if (!court.name.trim()) return 'Vui lòng nhập tên cho tất cả sân con.';
            if (!court.price || court.price <= 0) return `Vui lòng nhập giá thuê hợp lệ cho "${court.name}".`;
          }
          return null;

        case 'venue-images':
          if (!venueInfo.coverImage) return 'Vui lòng tải lên ảnh bìa (cover).';
          if (venueInfo.detailImages.length === 0) return 'Vui lòng tải lên ít nhất một ảnh chi tiết.';
          return null;

        case 'venue-operating':
          if (!venueInfo.openingTime || !venueInfo.closingTime) return 'Vui lòng chọn thời gian hoạt động.';
          if (!venueInfo.shiftDurationMinutes) return 'Vui lòng chọn thời lượng ca.';
          if (venueInfo.hasSurcharge && (!venueInfo.surchargeAmount || !venueInfo.surchargeDescription.trim())) return 'Vui lòng nhập đầy đủ thông tin phụ thu.';
          return null;

        case 'review':
          return null;

        default:
          return null;
      }
    },
    [personalInfo, venueInfo, courts]
  );

  // ── Navigate to next step ──
  const nextStep = useCallback(() => {
    setErrorMsg('');
    const error = validateStep(currentStep);
    if (error) {
      setErrorMsg(error);
      return;
    }

    const idx = SETUP_STEPS.findIndex((s) => s.key === currentStep);
    if (idx < SETUP_STEPS.length - 1) {
      setCurrentStep(SETUP_STEPS[idx + 1].key);
    }
  }, [currentStep, validateStep]);

  // ── Navigate to previous step ──
  const prevStep = useCallback(() => {
    setErrorMsg('');
    const idx = SETUP_STEPS.findIndex((s) => s.key === currentStep);
    if (idx > 0) {
      setCurrentStep(SETUP_STEPS[idx - 1].key);
    }
  }, [currentStep]);

  // ── Jump to a specific step ──
  const goToStep = useCallback((step: SetupStep) => {
    setErrorMsg('');
    setCurrentStep(step);
  }, []);

  // ── Submit registration ──
  const handleSubmit = useCallback(async () => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      await registrationService.registerOwner(
        registrationToken,
        personalInfo,
        venueInfo,
        courts
      );

      // Navigate back to register page with success state
      navigate('/register', {
        state: { success: true },
        replace: true,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi hồ sơ đăng ký.');
    } finally {
      setIsLoading(false);
    }
  }, [registrationToken, personalInfo, venueInfo, courts, navigate]);

  return {
    // State
    currentStep,
    stepIndex,
    email,
    isLoading,
    errorMsg,
    personalInfo,
    venueInfo,
    courts,

    // Setters
    setPersonalInfo,
    setVenueInfo,
    setCourts,
    setErrorMsg,

    // Actions
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
  };
}

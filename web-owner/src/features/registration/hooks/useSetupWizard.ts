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
    venueName: '',
    province: '',
    district: '',
    ward: '',
    description: '',
    sportTypes: [],
    subCourtCount: 1,
    images: [],
  });

  const [amenities, setAmenities] = useState<string[]>([]);

  const [courts, setCourts] = useState<SubCourt[]>([
    {
      name: 'Sân 1',
      sportType: '',
      pricingSlots: DEFAULT_PRICING_SLOTS.map((s) => ({ ...s })),
    },
  ]);

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

        case 'venue':
          if (!venueInfo.venueName.trim()) return 'Vui lòng nhập tên cụm sân.';
          if (!venueInfo.province.trim()) return 'Vui lòng nhập Tỉnh/Thành phố.';
          if (!venueInfo.district.trim()) return 'Vui lòng nhập Quận/Huyện.';
          if (!venueInfo.ward.trim()) return 'Vui lòng nhập Phường/Xã.';
          if (venueInfo.sportTypes.length === 0) return 'Vui lòng chọn ít nhất một loại sân.';
          return null;

        case 'amenities':
          return null; // Amenities are optional

        case 'courts':
          if (courts.length === 0) return 'Vui lòng thêm ít nhất một sân con.';
          for (const court of courts) {
            if (!court.name.trim()) return 'Vui lòng nhập tên cho tất cả sân con.';
            if (!court.sportType) return `Vui lòng chọn loại thể thao cho "${court.name}".`;
          }
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
        amenities,
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
  }, [registrationToken, personalInfo, venueInfo, amenities, courts, navigate]);

  return {
    // State
    currentStep,
    stepIndex,
    email,
    isLoading,
    errorMsg,
    personalInfo,
    venueInfo,
    amenities,
    courts,

    // Setters
    setPersonalInfo,
    setVenueInfo,
    setAmenities,
    setCourts,
    setErrorMsg,

    // Actions
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
  };
}

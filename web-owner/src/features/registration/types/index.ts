// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — Types
// ─────────────────────────────────────────────────────────────────────────────

export type RegistrationStep = 'email' | 'otp' | 'success';

export type SetupStep = 'personal' | 'venue-basic' | 'venue-courts' | 'venue-images' | 'venue-operating' | 'review';

export interface PersonalInfo {
  fullName: string;
  idNumber: string; // CCCD/CMND
  idFrontImage: File | null;
  idBackImage: File | null;
}

export interface VenueInfo {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  openingTime: string;
  closingTime: string;
  shiftDurationMinutes: number;
  sportId: string;
  coverImage: File | null;
  detailImages: File[];
  hasSurcharge: boolean;
  surchargeAmount?: number;
  surchargeDescription: string;
}

export interface CourtPriceRuleRequest {
  ruleType: 'SHIFT' | 'DAY_OF_WEEK';
  startTime?: string;
  endTime?: string;
  customPrice?: number;
  dayOfWeek?: number;
  percentageModifier?: number;
  fixedModifier?: number;
}

export interface SubCourt {
  name: string;
  price: number;
  status: string;
  priceRules: CourtPriceRuleRequest[];
}

export interface RegistrationFormData {
  email: string;
  registrationToken: string;
  personalInfo: PersonalInfo;
  venueInfo: VenueInfo;
  courts: SubCourt[];
}

// API response types
export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  isNewUser: boolean;
  registrationToken: string;
  accessToken?: string;
  message: string;
}

export interface RegisterOwnerResponse {
  message: string;
}

// Sport type options
export const SPORT_TYPE_OPTIONS = [
  { value: 'football', label: 'Bóng đá' },
  { value: 'basketball', label: 'Bóng rổ' },
  { value: 'pickleball', label: 'Pickleball' },
  { value: 'badminton', label: 'Cầu lông' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'volleyball', label: 'Bóng chuyền' },
] as const;

// Default pricing slots
export const DEFAULT_PRICING_SLOTS: PricingSlot[] = [
  { label: 'Sáng', startTime: '05:00', endTime: '11:00', price: 0 },
  { label: 'Trưa', startTime: '11:00', endTime: '14:00', price: 0 },
  { label: 'Chiều', startTime: '14:00', endTime: '17:00', price: 0 },
  { label: 'Tối', startTime: '17:00', endTime: '22:00', price: 0 },
];

export const SETUP_STEPS: { key: SetupStep; label: string }[] = [
  { key: 'personal', label: 'Cá nhân' },
  { key: 'venue-basic', label: 'Cơ bản' },
  { key: 'venue-courts', label: 'Sân bãi' },
  { key: 'venue-images', label: 'Tải ảnh' },
  { key: 'venue-operating', label: 'Vận hành' },
  { key: 'review', label: 'Xác nhận' },
];

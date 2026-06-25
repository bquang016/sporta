// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — Types
// ─────────────────────────────────────────────────────────────────────────────

export type RegistrationStep = 'email' | 'otp' | 'info' | 'success';

export interface PersonalInfo {
  fullName: string;
  idNumber: string; // CCCD/CMND
}

export interface VenueInfo {
  venueName: string;
  province: string;
  district: string;
  ward: string;
  sportTypes: string[];
  subCourtCount: number;
  images: File[];
}

export interface RegistrationFormData {
  email: string;
  registrationToken: string;
  personalInfo: PersonalInfo;
  venueInfo: VenueInfo;
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

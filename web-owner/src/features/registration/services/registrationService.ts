// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — API Services
// ─────────────────────────────────────────────────────────────────────────────

import type {
  SendOtpResponse,
  VerifyOtpResponse,
  RegisterOwnerResponse,
  PersonalInfo,
  VenueInfo,
  SubCourt,
} from '../types';

const API_BASE = 'http://localhost:8387/api/v1/auth';

/**
 * Send OTP code to the given email address.
 * POST /api/v1/auth/send-otp
 */
export async function sendOtp(email: string): Promise<SendOtpResponse> {
  const res = await fetch(`${API_BASE}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
  }

  return data;
}

/**
 * Verify OTP code for a given email.
 * POST /api/v1/auth/verify-otp
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<VerifyOtpResponse> {
  const res = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Mã OTP không hợp lệ. Vui lòng kiểm tra lại.');
  }

  return data;
}

/**
 * Submit owner registration data.
 * POST /api/v1/auth/register-owner
 *
 * Sends multipart/form-data with all registration info including
 * CCCD images, venue images, and court pricing.
 */
export async function registerOwner(
  registrationToken: string,
  personalInfo: PersonalInfo,
  venueInfo: VenueInfo,
  courts: SubCourt[]
): Promise<RegisterOwnerResponse> {
  const formData = new FormData();

  // Registration token from OTP verification
  formData.append('registrationToken', registrationToken);

  // Personal info
  formData.append('fullName', personalInfo.fullName);
  formData.append('idNumber', personalInfo.idNumber);

  // CCCD images
  if (personalInfo.idFrontImage) {
    formData.append('idFrontImage', personalInfo.idFrontImage);
  }
  if (personalInfo.idBackImage) {
    formData.append('idBackImage', personalInfo.idBackImage);
  }

  // Venue info
  formData.append('venueName', venueInfo.venueName);
  formData.append('province', venueInfo.province);
  formData.append('district', venueInfo.district);
  formData.append('ward', venueInfo.ward);
  formData.append('description', venueInfo.description);
  formData.append('sportTypes', JSON.stringify(venueInfo.sportTypes));
  formData.append('subCourtCount', String(venueInfo.subCourtCount));

  // Courts with pricing
  formData.append('courts', JSON.stringify(courts));

  // Attach venue image files
  venueInfo.images.forEach((file) => {
    formData.append('images', file);
  });

  const res = await fetch(`${API_BASE}/register-owner`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || 'Không thể gửi hồ sơ đăng ký. Vui lòng thử lại.'
    );
  }

  return data;
}

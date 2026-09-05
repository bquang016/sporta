import { ClubFilterState, SegmentOption } from './types';

export const DEFAULT_FILTERS: ClubFilterState = {
  sport: 'all',
  memberCount: 'all',
  eloRange: 'all',
  province: 'all',
  provinceCode: null,
  ward: 'all',
  privacy: 'all',
};

export const SPORT_OPTIONS: SegmentOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'football', label: 'Bóng đá', icon: 'sports-soccer' },
  { id: 'badminton', label: 'Cầu lông', icon: 'sports-tennis' },
  { id: 'pickleball', label: 'Pickleball', icon: 'sports-tennis' },
  { id: 'basketball', label: 'Bóng rổ', icon: 'sports-basketball' },
];

export const MEMBER_OPTIONS: SegmentOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'under10', label: '< 10' },
  { id: '10to25', label: '10 - 25' },
  { id: 'above25', label: '> 25' },
  { id: 'hasSlots', label: 'Còn chỗ' },
];

export const ELO_OPTIONS: SegmentOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'weak', label: 'Yếu (< 900)' },
  { id: 'weak_avg', label: 'TB - Yếu (900-1199)' },
  { id: 'average', label: 'Trung bình (1200-1499)' },
  { id: 'avg_good', label: 'TB - Khá (1500-1799)' },
  { id: 'semi_pro', label: 'Bán chuyên (1800-2099)' },
  { id: 'pro', label: 'Chuyên nghiệp (≥ 2100)' },
];

export const PRIVACY_OPTIONS: SegmentOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'public', label: 'Công khai' },
  { id: 'private', label: 'Riêng tư' },
];

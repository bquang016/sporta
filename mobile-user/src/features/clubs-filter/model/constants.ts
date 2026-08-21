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
  { id: 'beginner', label: 'Cơ bản' },
  { id: 'intermediate', label: 'Phong trào' },
  { id: 'advanced', label: 'Bán chuyên' },
];

export const PRIVACY_OPTIONS: SegmentOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'public', label: 'Công khai' },
  { id: 'private', label: 'Riêng tư' },
];

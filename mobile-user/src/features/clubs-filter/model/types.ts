export interface ClubFilterState {
  sport: string; // 'all' | 'football' | 'badminton' | 'pickleball' | 'basketball'
  memberCount: string; // 'all' | 'under10' | '10to25' | 'above25' | 'hasSlots'
  eloRange: string; // 'all' | 'beginner' | 'intermediate' | 'advanced'
  province: string; // 'all' | 'Hà Nội' | 'Thành phố Hồ Chí Minh' | ...
  provinceCode: number | null;
  ward: string; // 'all' | 'Quận Cầu Giấy' | 'Quận Hà Đông' | ...
  privacy: string; // 'all' | 'public' | 'private'
}

export interface SegmentOption {
  id: string;
  label: string;
  icon?: string;
}

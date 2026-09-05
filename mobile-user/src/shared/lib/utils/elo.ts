/**
 * Sporta Authoritative ELO & Sport Level Standard Utility
 * 
 * Standard ELO Scale:
 * - 0 - 899 (< 900): Yếu
 * - 900 - 1199: Trung bình - Yếu
 * - 1200 - 1499: Trung bình
 * - 1500 - 1799: Trung bình - Khá
 * - 1800 - 2099: Bán chuyên
 * - 2100+ (>= 2100): Chuyên nghiệp
 */

export type SportLevelKey = 'WEAK' | 'WEAK_AVERAGE' | 'AVERAGE' | 'AVERAGE_GOOD' | 'GOOD' | 'PRO' | 'ALL';

export interface EloTierInfo {
  key: string;
  label: string;
  minElo: number;
  maxElo: number;
  seedElo: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  desc: string;
}

export const ELO_TIERS: EloTierInfo[] = [
  {
    key: 'WEAK',
    label: 'Yếu',
    minElo: 0,
    maxElo: 899,
    seedElo: 800,
    color: '#10B981',
    badgeBg: '#ECFDF5',
    badgeBorder: '#A7F3D0',
    desc: 'Mới tập chơi, làm quen cảm giác bóng, nắm luật cơ bản (< 900 Elo)',
  },
  {
    key: 'WEAK_AVERAGE',
    label: 'Trung bình - Yếu',
    minElo: 900,
    maxElo: 1199,
    seedElo: 1050,
    color: '#3B82F6',
    badgeBg: '#EFF6FF',
    badgeBorder: '#BFDBFE',
    desc: 'Giao lưu phong trào cơ bản, đang rèn luyện kỹ thuật (900 - 1199 Elo)',
  },
  {
    key: 'AVERAGE',
    label: 'Trung bình',
    minElo: 1200,
    maxElo: 1499,
    seedElo: 1350,
    color: '#F59E0B',
    badgeBg: '#FFFBEB',
    badgeBorder: '#FDE68A',
    desc: 'Kiểm soát bóng tốt, hiểu chiến thuật, phong độ ổn định (1200 - 1499 Elo)',
  },
  {
    key: 'AVERAGE_GOOD',
    label: 'Trung bình - Khá',
    minElo: 1500,
    maxElo: 1799,
    seedElo: 1650,
    color: '#8B5CF6',
    badgeBg: '#F5F3FF',
    badgeBorder: '#DDD6FE',
    desc: 'Kỹ năng vững vàng, xử lý bóng nhanh, thể lực tốt (1500 - 1799 Elo)',
  },
  {
    key: 'GOOD',
    label: 'Bán chuyên',
    minElo: 1800,
    maxElo: 2099,
    seedElo: 1950,
    color: '#EC4899',
    badgeBg: '#FDF2F8',
    badgeBorder: '#FBCFE8',
    desc: 'Từng tập luyện bài bản, thi đấu giải phong trào, kỹ thuật cao (1800 - 2099 Elo)',
  },
  {
    key: 'PRO',
    label: 'Chuyên nghiệp',
    minElo: 2100,
    maxElo: 9999,
    seedElo: 2200,
    color: '#EF4444',
    badgeBg: '#FEF2F2',
    badgeBorder: '#FECACA',
    desc: 'Vận động viên thi đấu chuyên nghiệp, đẳng cấp đỉnh cao (≥ 2100 Elo)',
  },
];

/**
 * Maps a continuous Elo rating number to the authoritative Vietnamese level label
 */
export function getEloLevelLabel(elo?: number | null): string {
  if (elo == null || isNaN(elo)) return 'Trung bình';
  if (elo < 900) return 'Yếu';
  if (elo < 1200) return 'Trung bình - Yếu';
  if (elo < 1500) return 'Trung bình';
  if (elo < 1800) return 'Trung bình - Khá';
  if (elo < 2100) return 'Bán chuyên';
  return 'Chuyên nghiệp';
}

/**
 * Maps a SportLevel enum key to its Vietnamese display label
 */
export function getSportLevelLabel(level?: string | null): string {
  if (!level) return 'Mọi trình độ';
  switch (level.toUpperCase()) {
    case 'WEAK':
      return 'Yếu';
    case 'WEAK_AVERAGE':
      return 'Trung bình - Yếu';
    case 'AVERAGE':
      return 'Trung bình';
    case 'AVERAGE_GOOD':
      return 'Trung bình - Khá';
    case 'GOOD':
    case 'SEMI_PRO':
      return 'Bán chuyên';
    case 'PRO':
    case 'PROFESSIONAL':
      return 'Chuyên nghiệp';
    case 'ALL':
      return 'Mọi trình độ';
    default:
      return level;
  }
}

/**
 * Gets the initial seed Elo point for self-rating
 */
export function getSportLevelSeedElo(level?: string | null): number {
  if (!level) return 1350;
  switch (level.toUpperCase()) {
    case 'WEAK':
      return 800;
    case 'WEAK_AVERAGE':
      return 1050;
    case 'AVERAGE':
      return 1350;
    case 'AVERAGE_GOOD':
      return 1650;
    case 'GOOD':
    case 'SEMI_PRO':
      return 1950;
    case 'PRO':
    case 'PROFESSIONAL':
      return 2200;
    default:
      return 1350;
  }
}

/**
 * Gets metadata (label, desc, color) for a SportLevel
 */
export function getSportLevelMeta(level?: string | null) {
  if (!level || level === 'ALL') {
    return {
      label: 'Tất cả trình độ',
      desc: 'Giao lưu mọi cấp độ',
      color: '#004D40',
      badgeBg: '#E6F4EA',
      badgeBorder: '#A7F3D0',
    };
  }
  const found = ELO_TIERS.find((t) => t.key === level.toUpperCase());
  if (found) {
    return {
      label: found.label,
      desc: found.desc,
      color: found.color,
      badgeBg: found.badgeBg,
      badgeBorder: found.badgeBorder,
    };
  }
  return {
    label: getSportLevelLabel(level),
    desc: 'Trình độ thể thao',
    color: '#004D40',
    badgeBg: '#E6F4EA',
    badgeBorder: '#A7F3D0',
  };
}

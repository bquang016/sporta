export interface PostBackground {
  id: string;
  name: string;
  colors: readonly [string, string, ...string[]];
  textColor: string;
}

export const POST_BACKGROUNDS: PostBackground[] = [
  {
    id: 'emerald',
    name: 'Emerald Sporta',
    colors: ['#064E3B', '#047857', '#10B981'] as const,
    textColor: '#FFFFFF',
  },
  {
    id: 'fiery',
    name: 'Ngọn lửa',
    colors: ['#B91C1C', '#EA580C', '#F59E0B'] as const,
    textColor: '#FFFFFF',
  },
  {
    id: 'navy',
    name: 'Electric Blue',
    colors: ['#0F172A', '#1E3A8A', '#3B82F6'] as const,
    textColor: '#FFFFFF',
  },
  {
    id: 'sunset',
    name: 'Hoàng hôn',
    colors: ['#831843', '#BE185D', '#FB7185'] as const,
    textColor: '#FFFFFF',
  },
  {
    id: 'lime',
    name: 'Sân cỏ tươi',
    colors: ['#14532D', '#15803D', '#22C55E'] as const,
    textColor: '#FFFFFF',
  },
  {
    id: 'violet',
    name: 'Cyber Violet',
    colors: ['#312E81', '#4F46E5', '#818CF8'] as const,
    textColor: '#FFFFFF',
  },
  {
    id: 'gold',
    name: 'Cúp vàng',
    colors: ['#78350F', '#B45309', '#FBBF24'] as const,
    textColor: '#FFFFFF',
  },
  {
    id: 'stealth',
    name: 'Carbon Stealth',
    colors: ['#18181B', '#27272A', '#3F3F46'] as const,
    textColor: '#FFFFFF',
  },
  {
    id: 'crimson',
    name: 'Nhiệt huyết',
    colors: ['#881337', '#E11D48', '#FDA4AF'] as const,
    textColor: '#FFFFFF',
  },
];

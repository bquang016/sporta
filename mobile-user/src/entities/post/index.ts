export * from './model/post.types';
export * from './ui/PostCard';
export * from './ui/CommentItem';
export * from './ui/PostSkeleton';
export * from './ui/MatchCardAttachment';
export * from './ui/VenuePromoAttachment';
export * from './ui/PostOptionsMenuModal';
export * from './ui/ReportPostModal';
export * from './ui/ClubInfoModal';
export * from './ui/SharePostModal';
export * from './ui/PostImageViewerModal';

import { COLORS } from '../../shared/config/theme';

export const REACTION_MAP: Record<string, { label: string; iconName: any; color: string }> = {
  like: { label: 'Thích', iconName: 'thumbs-up', color: COLORS.primary },
  love: { label: 'Yêu thích', iconName: 'heart', color: '#EF4444' },
  fire: { label: 'Bùng cháy', iconName: 'flame', color: '#F59E0B' },
  clap: { label: 'Vỗ tay', iconName: 'hand-left', color: '#10B981' },
  trophy: { label: 'Đẳng cấp', iconName: 'trophy', color: '#8B5CF6' },
  muscle: { label: 'Sung sức', iconName: 'barbell', color: '#EC4899' },
};

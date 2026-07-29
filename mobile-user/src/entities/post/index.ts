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

export const REACTION_MAP: Record<string, { label: string; iconName: any; color: string }> = {
  like: { label: 'Thích', iconName: 'thumbs-up', color: '#2563EB' },
  love: { label: 'Yêu thích', iconName: 'heart', color: '#EF4444' },
  fire: { label: 'Bùng cháy', iconName: 'flame', color: '#F59E0B' },
  clap: { label: 'Vỗ tay', iconName: 'sparkles', color: '#10B981' },
  trophy: { label: 'Đỉnh', iconName: 'trophy', color: '#8B5CF6' },
  muscle: { label: 'Mạnh mẽ', iconName: 'fitness', color: '#EC4899' },
};

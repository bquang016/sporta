export const REACTION_MAP: Record<string, { label: string; iconName: any; iconLib?: 'ionicons' | 'materialCommunity'; color: string }> = {
  like: { label: 'Thích', iconName: 'thumb-up', iconLib: 'materialCommunity', color: '#1877F2' },
  love: { label: 'Yêu thích', iconName: 'heart', iconLib: 'ionicons', color: '#FF4D6D' },
  fire: { label: 'Bùng nổ', iconName: 'flame', iconLib: 'ionicons', color: '#FF9E00' },
  muscle: { label: 'Thể lực', iconName: 'barbell', iconLib: 'ionicons', color: '#8B5CF6' },
  trophy: { label: 'Vô địch', iconName: 'trophy', iconLib: 'ionicons', color: '#FBBF24' },
  clap: { label: 'Vỗ tay', iconName: 'hand-clap', iconLib: 'materialCommunity', color: '#10B981' },
};

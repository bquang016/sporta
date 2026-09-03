import { Platform } from 'react-native';

export const DEFAULT_CLUB_AVATAR = require('../../../../assets/logo/club/699x699__1_-removebg-preview.png');
export const DEFAULT_USER_AVATAR = require('../../../../assets/player/player_699x699.png');

export const DEFAULT_SPORT_COVERS: Record<string, string> = {
  'Bóng đá': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
  'Cầu lông': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
  'Pickleball': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
  'Bóng rổ': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
  'Tennis': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
};

export const isSafeImageUri = (uri?: string | null): boolean => {
  if (!uri || typeof uri !== 'string' || !uri.trim()) return false;
  if (uri.startsWith('blob:') && Platform.OS !== 'web') return false;
  return true;
};

export const getDefaultCover = (sport?: string, currentCover?: string | null): string => {
  if (isSafeImageUri(currentCover)) {
    return currentCover as string;
  }
  return DEFAULT_SPORT_COVERS[sport || 'Bóng đá'] || DEFAULT_SPORT_COVERS['Bóng đá'];
};

export const getDefaultAvatar = (sport?: string, currentAvatar?: string | null): any => {
  if (isSafeImageUri(currentAvatar)) {
    return currentAvatar;
  }
  return DEFAULT_CLUB_AVATAR;
};

export const getSafeCoverSource = (sport?: string, currentCover?: string | null): any => {
  const url = getDefaultCover(sport, currentCover);
  return { uri: url };
};

export const getSafeAvatarSource = (sport?: string, currentAvatar?: string | null): any => {
  const avatar = getDefaultAvatar(sport, currentAvatar);
  if (typeof avatar === 'string') {
    return { uri: avatar };
  }
  return avatar;
};

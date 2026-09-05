import { Platform } from 'react-native';

export const DEFAULT_CLUB_AVATAR = require('../../../../assets/logo/club/699x699__1_-removebg-preview.png');
export const DEFAULT_USER_AVATAR = require('../../../../assets/player/player_699x699.png');

export const DEFAULT_SPORT_COVERS: Record<string, string> = {
  'Bóng đá': '',
  'Cầu lông': '',
  'Pickleball': '',
  'Bóng rổ': '',
  'Tennis': '',
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

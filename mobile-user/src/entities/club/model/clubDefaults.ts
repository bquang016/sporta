import { Platform } from 'react-native';

export const DEFAULT_CLUB_AVATAR = require('../../../../assets/logo/club/699x699__1_-removebg-preview.png');
export const DEFAULT_USER_AVATAR = require('../../../../assets/player/player_699x699.png');

export const DEFAULT_SPORT_COVERS: Record<string, any> = {
  'Bóng đá': require('../../../../assets/auth/football_stadium_hero.jpg'),
  'Cầu lông': require('../../../../assets/auth/badminton_court_hero.jpg'),
  'Pickleball': require('../../../../assets/auth/pickleball_court_hero.jpg'),
  'Bóng rổ': require('../../../../assets/auth/sport_auth_hero.jpg'),
  'Tennis': require('../../../../assets/auth/tennis_court_cart.jpg'),
};

export const isSafeImageUri = (uri?: string | null): boolean => {
  if (!uri || typeof uri !== 'string' || !uri.trim()) return false;
  if (uri.startsWith('blob:') && Platform.OS !== 'web') return false;
  return true;
};

export const getDefaultCover = (sport?: string, currentCover?: string | null): any => {
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
  const cover = getDefaultCover(sport, currentCover);
  if (typeof cover === 'string') {
    return { uri: cover };
  }
  return cover;
};

export const getSafeAvatarSource = (sport?: string, currentAvatar?: string | null): any => {
  const avatar = getDefaultAvatar(sport, currentAvatar);
  if (typeof avatar === 'string') {
    return { uri: avatar };
  }
  return avatar;
};


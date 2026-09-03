export const DEFAULT_CLUB_AVATAR = require('../../../../assets/logo/club/699x699__1_-removebg-preview.png');
export const DEFAULT_USER_AVATAR = require('../../../../assets/player/player_699x699.png');

export const DEFAULT_SPORT_COVERS: Record<string, string> = {
  'Bóng đá': '',
  'Cầu lông': '',
  'Pickleball': '',
  'Bóng rổ': '',
  'Tennis': '',
};

export const getDefaultCover = (sport?: string, currentCover?: string | null): string => {
  if (currentCover && typeof currentCover === 'string' && currentCover.trim() && !currentCover.startsWith('blob:')) {
    return currentCover;
  }
  return DEFAULT_SPORT_COVERS[sport || 'Bóng đá'] || DEFAULT_SPORT_COVERS['Bóng đá'];
};

export const getDefaultAvatar = (sport?: string, currentAvatar?: string | null): any => {
  if (currentAvatar && typeof currentAvatar === 'string' && currentAvatar.trim() && !currentAvatar.startsWith('blob:')) {
    return currentAvatar;
  }
  return DEFAULT_CLUB_AVATAR;
};

import { useState, useMemo } from 'react';
import { getPublicUserProfileById, PublicUserProfile, SportProfileItem } from '../../../entities/user';

export function useUserProfile(userId: string) {
  const initialProfile = useMemo(() => getPublicUserProfileById(userId), [userId]);

  const [profile, setProfile] = useState<PublicUserProfile>(initialProfile);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friend'>(
    initialProfile.friendStatus
  );

  // Modals state
  const [unfriendModalVisible, setUnfriendModalVisible] = useState(false);
  const [inviteOptionsModalVisible, setInviteOptionsModalVisible] = useState(false);
  const [inviteClubModalVisible, setInviteClubModalVisible] = useState(false);
  const [inviteMatchModalVisible, setInviteMatchModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedSportDetail, setSelectedSportDetail] = useState<SportProfileItem | null>(null);
  const [pendingMatchInvite, setPendingMatchInvite] = useState<{ sportName: string; timeSlot: string } | null>(null);

  // Handle Friend Button Press
  const handleToggleFriend = () => {
    if (friendStatus === 'none') {
      setFriendStatus('pending');
    } else if (friendStatus === 'pending') {
      setFriendStatus('none');
    } else if (friendStatus === 'friend') {
      setUnfriendModalVisible(true);
    }
  };

  const confirmUnfriend = () => {
    setFriendStatus('none');
    setUnfriendModalVisible(false);
  };

  const sendMatchInviteToChat = (sportName: string, timeSlot: string) => {
    setPendingMatchInvite({ sportName, timeSlot });
    setChatModalVisible(true);
  };

  const getGenderAgeLabel = () => {
    const genderSymbol = profile.gender === 'MALE' ? '♂ Nam' : profile.gender === 'FEMALE' ? '♀ Nữ' : 'Khác';
    
    let ageGroup = 'Người lớn';
    if (profile.dateOfBirth) {
      const birthYear = new Date(profile.dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age < 18) ageGroup = `${age} tuổi (Trẻ)`;
      else ageGroup = 'Người lớn';
    }

    return `${genderSymbol} • ${ageGroup}`;
  };

  return {
    profile,
    friendStatus,
    unfriendModalVisible,
    inviteOptionsModalVisible,
    inviteClubModalVisible,
    inviteMatchModalVisible,
    chatModalVisible,
    selectedSportDetail,
    pendingMatchInvite,
    genderAgeLabel: getGenderAgeLabel(),
    handleToggleFriend,
    confirmUnfriend,
    cancelUnfriend: () => setUnfriendModalVisible(false),
    openInviteOptions: () => setInviteOptionsModalVisible(true),
    closeInviteOptions: () => setInviteOptionsModalVisible(false),
    openInviteClub: () => setInviteClubModalVisible(true),
    closeInviteClub: () => setInviteClubModalVisible(false),
    openInviteMatch: () => setInviteMatchModalVisible(true),
    closeInviteMatch: () => setInviteMatchModalVisible(false),
    openSportDetail: (sport: SportProfileItem) => setSelectedSportDetail(sport),
    closeSportDetail: () => setSelectedSportDetail(null),
    sendMatchInviteToChat,
    openChat: () => setChatModalVisible(true),
    closeChat: () => setChatModalVisible(false),
  };
}

import { useState, useEffect, useCallback } from 'react';
import { usersApi, PublicUserProfileResponse } from '../../../shared/api/users';
import { getPublicUserProfileById } from '../../../entities/user';

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<PublicUserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allClubsModalVisible, setAllClubsModalVisible] = useState<boolean>(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      // If numeric ID, fetch from backend API
      const numId = Number(userId);
      if (!isNaN(numId) && numId > 0) {
        const data = await usersApi.getPublicProfile(numId);
        if (data && data.id) {
          setProfile(data);
          setIsLoading(false);
          return;
        }
      }
      
      // Fallback for mock IDs
      const fallback = getPublicUserProfileById(userId);
      setProfile({
        id: typeof fallback.id === 'number' ? fallback.id : 1,
        fullName: fallback.fullName || 'Người dùng Sporta',
        avatarUrl: fallback.avatarUrl,
        gender: fallback.gender || 'MALE',
        height: fallback.height,
        weight: fallback.weight,
        joinedYear: 2025,
        role: 'PLAYER',
        totalBookings: 12,
        reputationScore: 100,
        sports: (fallback.sportsProfiles || []).map((sp, idx) => ({
          sportId: idx + 1,
          sportName: sp.sportName,
          sportIcon: sp.icon,
          bookingCount: sp.matchesCount || 8,
          percentage: Math.round(100 / Math.max(1, (fallback.sportsProfiles || []).length)),
        })),
        joinedClubs: (fallback.joinedClubs || []).map((c, idx) => ({
          clubId: Number(c.id) || (idx + 1),
          clubName: c.name,
          avatarImage: c.logoUrl,
          sportName: c.sportName,
          role: c.roleInClub || 'Thành viên',
          membersCount: c.memberCount || 50,
          elo: 1200,
        })),
      });
    } catch (err) {
      console.warn('Error fetching public user profile:', err);
      const fallback = getPublicUserProfileById(userId);
      setProfile({
        id: typeof fallback.id === 'number' ? fallback.id : 1,
        fullName: fallback.fullName || 'Người dùng Sporta',
        avatarUrl: fallback.avatarUrl,
        gender: fallback.gender,
        height: fallback.height,
        weight: fallback.weight,
        joinedYear: 2025,
        role: 'PLAYER',
        totalBookings: 0,
        reputationScore: 100,
        sports: [],
        joinedClubs: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getGenderLabel = () => {
    if (!profile?.gender) return 'Chưa cập nhật';
    const g = profile.gender.toUpperCase();
    if (g === 'MALE' || g === 'NAM') return '♂ Nam';
    if (g === 'FEMALE' || g === 'NU' || g === 'NỮ') return '♀ Nữ';
    return 'Khác';
  };

  const getJoinedYearLabel = () => {
    return `Năm ${profile?.joinedYear || 2025}`;
  };

  return {
    profile,
    isLoading,
    genderLabel: getGenderLabel(),
    joinedYearLabel: getJoinedYearLabel(),
    allClubsModalVisible,
    openAllClubs: () => setAllClubsModalVisible(true),
    closeAllClubs: () => setAllClubsModalVisible(false),
    refetch: fetchProfile,
  };
}

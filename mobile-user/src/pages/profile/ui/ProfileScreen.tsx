import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Avatar } from '../../../shared/ui/Avatar/Avatar';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { useProfile } from '../hooks/useProfile';

const HEADER_HEIGHT = 56;

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSportIndex, setSelectedSportIndex] = useState(0);

  const {
    isAuthenticated,
    profileData,
    userName,
    userEmail,
    userAvatar,
    isLogoutModalVisible,
    refreshProfile,
    handleLoginPress,
    requestLogout,
    cancelLogout,
    confirmLogout,
  } = useProfile();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  const handleEditProfile = useCallback(() => {
    router.push('/profile/edit' as any);
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/account-settings' as any);
  }, [router]);

  // User sports list sorted by priority: VERIFIED > Total Matches > Elo Rating > Total Wins
  const userSports = React.useMemo(() => {
    if (!profileData?.sports || profileData.sports.length === 0) {
      return [
        { id: 1, sportId: 1, sportName: 'Bóng đá', level: 'AVERAGE', eloRating: 1500, eloStatus: 'UNVERIFIED', levelLabel: 'Trung bình', placementMatchesPlayed: 0, totalRankedMatches: 0, totalWins: 0, winRate: 0 },
      ];
    }

    return [...profileData.sports].sort((a, b) => {
      // 1. Priority: VERIFIED (3) > CALIBRATING (2) > UNVERIFIED (1)
      const statusWeight = (s?: string) => (s === 'VERIFIED' ? 3 : s === 'CALIBRATING' ? 2 : 1);
      const diffStatus = statusWeight(b.eloStatus) - statusWeight(a.eloStatus);
      if (diffStatus !== 0) return diffStatus;

      // 2. Total ranked matches played (most active)
      const matchesA = a.totalRankedMatches ?? 0;
      const matchesB = b.totalRankedMatches ?? 0;
      if (matchesB !== matchesA) return matchesB - matchesA;

      // 3. Higher Elo rating
      const eloA = a.eloRating ?? 0;
      const eloB = b.eloRating ?? 0;
      if (eloB !== eloA) return eloB - eloA;

      // 4. Total wins
      const winsA = a.totalWins ?? 0;
      const winsB = b.totalWins ?? 0;
      return winsB - winsA;
    });
  }, [profileData?.sports]);

  const currentSport = userSports[Math.min(selectedSportIndex, userSports.length - 1)] || userSports[0];
  const currentElo = currentSport?.eloRating ?? 1500;
  const currentEloStatus = currentSport?.eloStatus ?? 'UNVERIFIED';
  const currentLevelLabel = currentSport?.levelLabel || (currentSport?.level === 'GOOD' ? 'Khá' : currentSport?.level === 'WEAK' ? 'Yếu' : 'Trung bình');
  const totalMatches = currentSport?.totalRankedMatches ?? 0;
  const totalWins = currentSport?.totalWins ?? 0;
  const winRate = currentSport?.winRate ?? (totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0);
  const placementPlayed = currentSport?.placementMatchesPlayed ?? 0;

  const getBadgeConfig = (status: string, played: number) => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'ĐÃ XÁC THỰC',
          iconLibrary: 'Ionicons',
          iconName: 'shield-checkmark',
          bgColor: '#ECFDF5',
          textColor: '#059669',
          borderColor: '#A7F3D0',
        };
      case 'CALIBRATING':
        return {
          label: `PHÂN HẠNG ${played}/5`,
          iconLibrary: 'MaterialCommunityIcons',
          iconName: 'timer-sand',
          bgColor: '#FEF3C7',
          textColor: '#D97706',
          borderColor: '#FDE68A',
        };
      case 'UNVERIFIED':
      default:
        return {
          label: 'TỰ KHAI',
          iconLibrary: 'MaterialCommunityIcons',
          iconName: 'shield-account-outline',
          bgColor: '#F1F5F9',
          textColor: '#64748B',
          borderColor: '#CBD5E1',
        };
    }
  };

  const badgeConfig = getBadgeConfig(currentEloStatus, placementPlayed);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <View style={[styles.statusBarBackground, { height: insets.top }]} />
        
        {/* Synchronized Header */}
        <View style={[styles.headerBar, { marginTop: insets.top }]}>
          <Image
            source={require('../../../../assets/logo/logo-horizontal_1600x400.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.unauthContainer}>
          <View style={styles.unauthIconCircle}>
            <MaterialCommunityIcons name="account-circle-outline" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.unauthTitle}>Hồ sơ cá nhân</Text>
          <Text style={styles.unauthText}>
            Đăng nhập để theo dõi lịch sử thi đấu, quản lý đặt sân, kết nối câu lạc bộ và tham gia các hoạt động thể thao cùng cộng đồng.
          </Text>
          <TouchableOpacity
            style={styles.unauthLoginBtn}
            onPress={handleLoginPress}
            activeOpacity={0.88}
          >
            <Text style={styles.unauthLoginBtnText}>Đăng nhập ngay</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Top Status Bar Background */}
      <View style={[styles.statusBarBackground, { height: insets.top }]} />

      {/* ========================================================
          SYNCHRONIZED APP HEADER (Matching Home / Social / Tabs)
         ======================================================== */}
      <View style={[styles.headerBar, { marginTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../../../assets/logo/logo-horizontal_1600x400.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Hồ sơ</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.headerIconBtn}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="pencil-outline" size={19} color={COLORS.onSurface} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSettings}
            style={styles.headerIconBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="settings-outline" size={19} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================
          SMOOTH 60 FPS SCROLL CONTAINER
         ======================================================== */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#064E3B']}
            tintColor="#064E3B"
          />
        }
      >
        {/* ========================================================
            HERO PROFILE CARD WITH DYNAMIC SPORTS CHIPS
           ======================================================== */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#FFFFFF', '#F0FDF4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarBorderRing}>
                  <Avatar
                    source={userAvatar}
                    size="xl"
                  />
                </View>
                <TouchableOpacity
                  style={styles.avatarCameraBadge}
                  onPress={handleEditProfile}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="photo-camera" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.heroInfoColumn}>
                <View style={styles.heroNameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userName || 'Người dùng Sporta'}
                  </Text>
                </View>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {userEmail || 'member@sporta.vn'}
                </Text>
                {profileData?.phoneNumber && (
                  <View style={styles.phoneRow}>
                    <MaterialIcons name="phone-iphone" size={13} color="#64748B" />
                    <Text style={styles.phoneText}>{profileData.phoneNumber}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Sports Section Header & Quick Hint */}
            <View style={styles.sportsSectionHeader}>
              <View style={styles.sportsHeaderLeft}>
                <Ionicons name="fitness-outline" size={13} color="#064E3B" />
                <Text style={styles.sportsSectionTitle}>MÔN THI ĐẤU</Text>
              </View>
              <View style={styles.sportsHintBadge}>
                <Ionicons name="sparkles" size={10} color="#059669" />
                <Text style={styles.sportsHintText}>Chạm để xem chỉ số</Text>
              </View>
            </View>

            {/* Interactive Priority-Sorted Sports Selector Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sportsChipsRow}
            >
              {userSports.map((s, idx) => {
                const isSelected = idx === selectedSportIndex;
                const isVerified = s.eloStatus === 'VERIFIED';
                return (
                  <TouchableOpacity
                    key={s.sportId || idx}
                    onPress={() => setSelectedSportIndex(idx)}
                    activeOpacity={0.7}
                    style={[
                      styles.sportChip,
                      isSelected && styles.sportChipActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        s.sportName.toLowerCase().includes('tennis')
                          ? 'tennis'
                          : s.sportName.toLowerCase().includes('cầu lông') || s.sportName.toLowerCase().includes('badminton')
                          ? 'badminton'
                          : s.sportName.toLowerCase().includes('bóng rổ') || s.sportName.toLowerCase().includes('basketball')
                          ? 'basketball'
                          : 'soccer'
                      }
                      size={14}
                      color={isSelected ? '#FFFFFF' : '#064E3B'}
                    />
                    <Text style={[styles.sportChipText, isSelected && styles.sportChipTextActive]}>
                      {s.sportName}
                    </Text>
                    {isVerified && (
                      <Ionicons
                        name="shield-checkmark"
                        size={11}
                        color={isSelected ? '#A7F3D0' : '#059669'}
                      />
                    )}
                    {s.eloRating && (
                      <Text style={[styles.sportChipElo, isSelected && styles.sportChipEloActive]}>
                        {s.eloRating}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </LinearGradient>
        </View>

        {/* ========================================================
            ATHLETIC PERFORMANCE & ELO STATS DASHBOARD (INTERACTIVE)
           ======================================================== */}
        <View style={styles.statsCard}>
          {/* Elo Column -> Tap to open Sports Elo Screen */}
          <TouchableOpacity
            style={styles.statCol}
            onPress={() => router.push('/profile/sports-elo' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="fire" size={18} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{currentElo.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Elo {currentSport?.sportName}</Text>
            <View style={styles.statActionHint}>
              <Text style={styles.statSub}>{currentLevelLabel}</Text>
              <Ionicons name="chevron-forward" size={11} color="#059669" />
            </View>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          {/* Matches Column -> Tap to open Ranked Match History */}
          <TouchableOpacity
            style={styles.statCol}
            onPress={() => router.push('/profile/ranked-matches' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconBadge, { backgroundColor: '#E7F3EF' }]}>
              <MaterialCommunityIcons name="trophy" size={18} color="#064E3B" />
            </View>
            <Text style={styles.statValue}>{totalMatches}</Text>
            <Text style={styles.statLabel}>Trận Xếp Hạng</Text>
            <View style={styles.statActionHint}>
              <Text style={styles.statSub}>{totalWins} Thắng</Text>
              <Ionicons name="chevron-forward" size={11} color="#064E3B" />
            </View>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          {/* Verification Badge Column -> Tap to open dedicated Elo Guide Screen */}
          <TouchableOpacity
            style={styles.statCol}
            onPress={() => router.push('/profile/elo-guide' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconBadge, { backgroundColor: badgeConfig.bgColor }]}>
              {badgeConfig.iconLibrary === 'MaterialCommunityIcons' ? (
                <MaterialCommunityIcons name={badgeConfig.iconName as any} size={18} color={badgeConfig.textColor} />
              ) : (
                <Ionicons name={badgeConfig.iconName as any} size={18} color={badgeConfig.textColor} />
              )}
            </View>
            <View style={[styles.statusBadgeSmall, { backgroundColor: badgeConfig.bgColor, borderColor: badgeConfig.borderColor }]}>
              <Text style={[styles.statusBadgeSmallText, { color: badgeConfig.textColor }]}>
                {badgeConfig.label}
              </Text>
            </View>
            <Text style={styles.statLabel}>Xác thực Elo</Text>
            <View style={styles.statActionHint}>
              <Text style={[styles.statSub, { color: '#2563EB' }]}>Thắng {winRate}%</Text>
              <Ionicons name="information-circle" size={11} color="#2563EB" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ========================================================
            QUICK ACTIONS WALLET & VOUCHER PREVIEW
           ======================================================== */}
        <View style={styles.quickBannerRow}>
          <TouchableOpacity
            style={styles.quickBannerCard}
            onPress={() => router.push('/wallet')}
            activeOpacity={0.75}
          >
            <View style={[styles.quickBannerIconBg, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#059669" />
            </View>
            <View style={styles.quickBannerTextContainer}>
              <Text style={styles.quickBannerTitle}>Ví Sporta</Text>
              <Text style={styles.quickBannerSubtitle}>Quản lý số dư & nạp tiền</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBannerCard}
            onPress={() => router.push('/vouchers')}
            activeOpacity={0.75}
          >
            <View style={[styles.quickBannerIconBg, { backgroundColor: '#FFFBEB' }]}>
              <MaterialIcons name="card-giftcard" size={20} color="#D97706" />
            </View>
            <View style={styles.quickBannerTextContainer}>
              <Text style={styles.quickBannerTitle}>Kho Voucher</Text>
              <Text style={styles.quickBannerSubtitle}>Mã giảm giá đặt sân</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* ========================================================
            MENU SECTION 1: HOẠT ĐỘNG & THI ĐẤU
           ======================================================== */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeaderTitle}>Hoạt Động & Thi Đấu</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="history"
              iconBg="#EFF6FF"
              iconColor="#2563EB"
              title="Lịch sử đặt sân"
              subtitle="Danh sách các sân đã đặt"
              onPress={() => router.push('/profile/booking-history' as any)}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="confirmation-number"
              iconBg="#ECFDF5"
              iconColor="#059669"
              title="Vé của tôi"
              subtitle="Các ca xé vé đang tham gia"
              onPress={() => router.push('/my-tickets' as any)}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="groups"
              iconBg="#FFFBEB"
              iconColor="#D97706"
              title="Câu lạc bộ của tôi"
              subtitle="Quản lý & kết nối thành viên"
              onPress={() => router.push('/my-clubs' as any)}
            />
          </View>
        </View>

        {/* ========================================================
            MENU SECTION 2: TÀI KHOẢN & BẢO MẬT
           ======================================================== */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeaderTitle}>Tài Khoản & Cài Đặt</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="person-outline"
              iconBg="#F1F5F9"
              iconColor="#475569"
              title="Chỉnh sửa hồ sơ"
              subtitle="Họ tên, ảnh đại diện, số điện thoại"
              onPress={handleEditProfile}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="settings"
              iconBg="#F1F5F9"
              iconColor="#475569"
              title="Cài đặt tài khoản"
              subtitle="Thông báo, mật khẩu, sinh trắc học"
              onPress={handleSettings}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="help-outline"
              iconBg="#F1F5F9"
              iconColor="#475569"
              title="Trợ giúp & Hỗ trợ"
              subtitle="Câu hỏi thường gặp, liên hệ CSKH"
              onPress={() => router.push('/profile/help' as any)}
            />
          </View>
        </View>

        {/* ========================================================
            LOGOUT BUTTON
           ======================================================== */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={requestLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={18} color="#E11D48" />
            <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={isLogoutModalVisible}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
        confirmText="Đăng xuất"
        confirmVariant="primary"
        icon="logout"
        iconColor={COLORS.error}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </View>
  );
}

// Sub-component for Smooth Menu Row
function MenuRow({
  icon,
  iconBg = '#F0F3FF',
  iconColor = COLORS.primary,
  title,
  subtitle,
  badge,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.menuRowLeft}>
        <View style={[styles.menuIconBg, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuRowTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.menuRowSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.menuRowRight}>
        {badge && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    zIndex: 10,
  },
  headerBar: {
    height: HEADER_HEIGHT,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 9,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 96,
    height: 24,
  },
  headerBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#064E3B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 16,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroGradient: {
    padding: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBorderRing: {
    padding: 2.5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#064E3B',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#064E3B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroInfoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sportsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sportsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sportsSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: 0.5,
  },
  sportsHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  sportsHintText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#059669',
  },
  sportsChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  sportChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sportChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  sportChipTextActive: {
    color: '#FFFFFF',
  },
  sportChipElo: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  sportChipEloActive: {
    color: '#064E3B',
    backgroundColor: '#A7F3D0',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    marginBottom: 2,
  },
  statusBadgeSmallText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  statSub: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  statActionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  modalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  modalProgressCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
    marginBottom: 14,
  },
  modalProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalProgressPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  modalProgressTrack: {
    height: 7,
    backgroundColor: '#FDE68A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 4,
  },
  modalProgressHint: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
    fontWeight: '500',
  },
  explainSection: {
    marginBottom: 16,
    gap: 8,
  },
  explainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explainSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  explainCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  explainParagraph: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  badgeLevelsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeLevelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  badgeLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  badgeLevelName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeLevelDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 1,
  },
  bonusListCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  bonusListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bonusIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  bonusListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
  },
  bonusListDesc: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
    marginTop: 1,
  },
  modalActionsContainer: {
    gap: 8,
    paddingTop: 6,
    paddingBottom: 16,
  },
  modalActionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064E3B',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  modalActionPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalActionSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064E3B',
  },
  quickBannerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  quickBannerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickBannerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickBannerTextContainer: {
    flex: 1,
  },
  quickBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickBannerSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  menuSection: {
    marginBottom: 18,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  menuRowSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuBadge: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  menuBadgeText: {
    fontSize: 11,
    color: '#854D0E',
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  logoutContainer: {
    marginTop: 4,
    marginBottom: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E11D48',
  },
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unauthIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E7F3EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  unauthTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  unauthText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  unauthLoginBtn: {
    width: '100%',
    maxWidth: 280,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  unauthLoginBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});



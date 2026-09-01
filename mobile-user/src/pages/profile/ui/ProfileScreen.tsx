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

  // User sports list with fallback
  const userSports = profileData?.sports && profileData.sports.length > 0
    ? profileData.sports
    : [
        { id: 1, sportName: 'Tennis', level: 'Bán chuyên' },
        { id: 2, sportName: 'Cầu lông', level: 'Nâng cao' },
        { id: 3, sportName: 'Pickleball', level: 'Cơ bản' },
      ];

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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="normal"
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ========================================================
            PREMIUM PROFILE HERO CARD
           ======================================================== */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#ECFDF5', '#F8FAFC', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              {/* Avatar with Glow Ring */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarBorderRing}>
                  <Avatar size={76} source={userAvatar} fallbackType="user" />
                </View>
                <TouchableOpacity
                  onPress={handleEditProfile}
                  style={styles.avatarCameraBadge}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="camera" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* User Info Details */}
              <View style={styles.heroInfoColumn}>
                <View style={styles.heroNameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userName || 'Vận động viên Sporta'}
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

            {/* Dynamic Sports Chips */}
            <View style={styles.sportsChipsRow}>
              {userSports.map((s, idx) => (
                <View key={idx} style={styles.sportChip}>
                  <MaterialCommunityIcons
                    name={
                      s.sportName.toLowerCase().includes('tennis')
                        ? 'tennis'
                        : s.sportName.toLowerCase().includes('cầu lông') || s.sportName.toLowerCase().includes('badminton')
                        ? 'badminton'
                        : 'trophy-outline'
                    }
                    size={14}
                    color="#064E3B"
                  />
                  <Text style={styles.sportChipText}>{s.sportName}</Text>
                  {s.level && <Text style={styles.sportChipLevel}>• {s.level}</Text>}
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ========================================================
            ATHLETIC PERFORMANCE & ELO STATS DASHBOARD
           ======================================================== */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="fire" size={18} color="#D97706" />
            </View>
            <Text style={styles.statValue}>1,450</Text>
            <Text style={styles.statLabel}>Elo Thể Thao</Text>
            <Text style={styles.statSub}>Bán Chuyên</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <View style={[styles.statIconBadge, { backgroundColor: '#E7F3EF' }]}>
              <MaterialCommunityIcons name="calendar-check" size={18} color="#064E3B" />
            </View>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Trận Đã Đấu</Text>
            <Text style={styles.statSub}>Hoàn thành</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <View style={[styles.statIconBadge, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="trophy-award" size={18} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>68%</Text>
            <Text style={styles.statLabel}>Tỉ Lệ Thắng</Text>
            <Text style={styles.statSub}>Phong độ cao</Text>
          </View>
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
              iconBg="#E7F3EF"
              iconColor="#064E3B"
              title="Lịch sử đặt sân"
              subtitle="Chi tiết các phiên đặt sân và biên nhận"
              onPress={() => router.push('/profile/booking-history' as any)}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="local-activity"
              iconBg="#FEF3C7"
              iconColor="#B45309"
              title="Xé vé & Ghép trận"
              subtitle="Quản lý vé trận đấu và người cùng chơi"
              onPress={() => router.push('/my-tickets' as any)}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="groups"
              iconBg="#E0E7FF"
              iconColor="#4338CA"
              title="Câu lạc bộ của tôi"
              subtitle="Danh sách CLB bạn đang sinh hoạt"
              onPress={() => router.push('/my-clubs' as any)}
            />
          </View>
        </View>

        {/* ========================================================
            MENU SECTION 2: CÀI ĐẶT & HỖ TRỢ
           ======================================================== */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeaderTitle}>Hệ Thống & Trợ Giúp</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="settings"
              iconBg="#F1F5F9"
              iconColor="#334155"
              title="Cài đặt tài khoản"
              subtitle="Bảo mật, thông báo và tài khoản liên kết"
              onPress={handleSettings}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              icon="help-outline"
              iconBg="#EFF6FF"
              iconColor="#1D4ED8"
              title="Trung tâm trợ giúp"
              subtitle="Câu hỏi thường gặp và liên hệ CSKH"
              onPress={() => router.push('/profile/help' as any)}
            />
          </View>
        </View>

        {/* ========================================================
            LOGOUT CTA BUTTON
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
  sportsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  sportChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
  },
  sportChipLevel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
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
    marginBottom: 6,
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



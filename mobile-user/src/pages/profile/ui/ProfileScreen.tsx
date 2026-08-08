import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Avatar } from '../../../shared/ui/Avatar/Avatar';
import { Button } from '../../../shared/ui/Button/Button';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { useProfile } from '../hooks/useProfile';

export function ProfileScreen() {
  const {
    isAuthenticated,
    userName,
    userEmail,
    userAvatar,
    isLogoutModalVisible,
    handleLoginPress,
    requestLogout,
    cancelLogout,
    confirmLogout,
  } = useProfile();

  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.unauthContainer}>
            <MaterialCommunityIcons name="account-circle-outline" size={80} color="#064E3B" />
            <Text style={styles.unauthTitle}>Chưa đăng nhập</Text>
            <Text style={styles.unauthText}>Vui lòng đăng nhập để xem thông tin hồ sơ và quản lý hoạt động cá nhân của bạn.</Text>
            <Button title="Đăng nhập ngay" onPress={handleLoginPress} size="lg" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.greenHeaderArea}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Hồ Sơ Của Tôi</Text>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerSpacer} />
        
        <View style={styles.mainContent}>
          {/* Header - Personal Info */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <Avatar size={100} source={userAvatar} />
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userName}</Text>
              <TouchableOpacity onPress={() => router.push('/profile/edit')} style={styles.nameEditBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color="#064E3B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userEmail}>{userEmail}</Text>
            
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <MaterialCommunityIcons name="crown" size={16} color="#6f5900" />
                <Text style={styles.badgeText}>Thành viên Vàng</Text>
              </View>
            </View>
          </View>

          {/* Stats / Elo */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Elo Cá Nhân</Text>
              <Text style={styles.statValue}>1,450</Text>
              <Text style={styles.statSub}>Bán chuyên</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Đã tham gia</Text>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statSub}>Trận đấu</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tỉ lệ thắng</Text>
              <Text style={styles.statValue}>68%</Text>
              <Text style={styles.statSub}>Tốt</Text>
            </View>
          </View>

          {/* Menu Actions */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Hoạt Động</Text>
            <View style={styles.menuCard}>
              <MenuRow 
                icon="history" 
                title="Lịch sử đặt sân" 
                onPress={() => router.push('/profile/booking-history' as any)} 
              />
              <View style={styles.divider} />
              <MenuRow 
                icon="local-activity" 
                title="Xé vé & Ghép trận" 
                onPress={() => router.push('/my-tickets' as any)} 
              />
              <View style={styles.divider} />
              <MenuRow 
                icon="groups" 
                title="Câu lạc bộ của tôi" 
                onPress={() => router.push('/my-clubs' as any)} 
              />
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Tài Khoản & Ưu Đãi</Text>
            <View style={styles.menuCard}>
              <MenuRow icon="card-giftcard" title="Ưu đãi & Voucher" badge="3" />
              <View style={styles.divider} />
              <MenuRow icon="account-balance-wallet" title="Ví & Thanh toán" />
              <View style={styles.divider} />
              <MenuRow 
                icon="settings" 
                title="Cài đặt tài khoản" 
                onPress={() => router.push('/profile/settings' as any)} 
              />
              <View style={styles.divider} />
              <MenuRow 
                icon="help-outline" 
                title="Trung tâm trợ giúp" 
                onPress={() => router.push('/profile/help' as any)} 
              />
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
             <TouchableOpacity style={styles.logoutBtn} onPress={requestLogout}>
                <MaterialIcons name="logout" size={20} color="#ba1a1a" />
                <Text style={styles.logoutBtnText}>Đăng xuất</Text>
             </TouchableOpacity>
          </View>

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

// Sub-component for Menu Rows
function MenuRow({ icon, title, badge, onPress }: { icon: keyof typeof MaterialIcons.glyphMap, title: string, badge?: string, onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.menuRowLeft}>
        <View style={styles.menuIconBg}>
          <MaterialIcons name={icon} size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.menuRowTitle} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.menuRowRight}>
        {badge && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003527', // Deep Emerald Green base
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  greenHeaderArea: {
    backgroundColor: '#003527',
  },
  headerTopRow: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#003527',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSpacer: {
    height: 60, // Increased to prevent avatar cutoff
    backgroundColor: '#003527',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f9f9ff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 120, // Tab bar clearance
    zIndex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: -50, // Pulls the avatar up to overlap the green header
    zIndex: 2,
  },
  avatarWrapper: {
    padding: 4,
    backgroundColor: '#f9f9ff',
    borderRadius: 999,
    elevation: 4,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  userName: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: '#151c27',
  },
  nameEditBtn: {
    padding: 4,
    backgroundColor: '#E7EEFE',
    borderRadius: 16,
  },
  userEmail: {
    ...TYPOGRAPHY.bodyMd,
    color: '#707974',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fed01b', // Athletic Yellow
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    ...TYPOGRAPHY.labelMd,
    color: '#6f5900',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f0f3ff',
    elevation: 2,
    shadowColor: '#151c27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f8',
    marginVertical: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.labelMd,
    color: '#707974',
    marginBottom: 4,
  },
  statValue: {
    ...TYPOGRAPHY.headlineMd,
    color: '#064E3B',
  },
  statSub: {
    ...TYPOGRAPHY.labelMd,
    color: '#404944',
    marginTop: 4,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    color: '#151c27',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f3ff',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0f3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuRowTitle: {
    ...TYPOGRAPHY.bodyLg,
    color: '#151c27',
    fontWeight: '500',
    flex: 1,
    flexShrink: 1,
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    backgroundColor: '#fed01b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  menuBadgeText: {
    ...TYPOGRAPHY.labelMd,
    color: '#6f5900',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f3ff',
    marginLeft: 72,
  },
  logoutContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#ffdad6',
    borderWidth: 1,
    borderColor: '#ffb4a9',
    gap: 8,
  },
  logoutBtnText: {
    ...TYPOGRAPHY.titleMd,
    color: '#ba1a1a',
  },
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9f9ff',
  },
  unauthTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: '#151c27',
    marginTop: 24,
    marginBottom: 8,
  },
  unauthText: {
    ...TYPOGRAPHY.bodyLg,
    color: '#404944',
    textAlign: 'center',
    marginBottom: 32,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Avatar, Button, ConfirmModal } from '../../../shared/ui';
import { useProfile } from '../hooks/useProfile';

export function ProfileScreen() {
  const {
    isAuthenticated,
    userName,
    userEmail,
    isLogoutModalVisible,
    handleLoginPress,
    requestLogout,
    cancelLogout,
    confirmLogout,
  } = useProfile();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.unauthContainer}>
          <MaterialCommunityIcons name="account-circle-outline" size={80} color={COLORS.outlineVariant} />
          <Text style={styles.unauthTitle}>Chưa đăng nhập</Text>
          <Text style={styles.unauthText}>Vui lòng đăng nhập để xem thông tin hồ sơ và quản lý hoạt động cá nhân của bạn.</Text>
          <Button title="Đăng nhập ngay" onPress={handleLoginPress} size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header - Personal Info */}
        <View style={styles.headerCard}>
          <Avatar 
            size="lg" 
            source="https://lh3.googleusercontent.com/aida-public/AB6AXuDvAvS8IsEXOMdaPlOpYNiMS9-VKdo8uVg8qolFkyXxdSo-1iLSkwHiiY07MDIyX_bAMvj_gF8fOPA65sQrhzzwfhvvmg5Muh39lsugfq0gfD8bLRE1vCwVnTbBPT3tN-4SzQ73_eTSx_VkGEFhtSoIrO3IYAhKZPrFkTtSyWT-9HBioDHXL5XxtBbz2Tml2ookUYWG1P6ITH3NN4mB0iS24157jehzP-UqpWIxX2JbwVFSxIvmxMyrEEEGu7EjOtb1hgbZJuQNKkM" 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: COLORS.secondaryContainer }]}>
                <MaterialCommunityIcons name="crown" size={14} color={COLORS.onSecondaryContainer} />
                <Text style={[styles.badgeText, { color: COLORS.onSecondaryContainer }]}>Thành viên Vàng</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats / Elo */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Elo Cá Nhân</Text>
            <Text style={styles.statValue}>1,450</Text>
            <Text style={styles.statSub}>Bán chuyên</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Đã tham gia</Text>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statSub}>Trận đấu</Text>
          </View>
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
            <MenuRow icon="history" title="Lịch sử đặt sân" />
            <View style={styles.divider} />
            <MenuRow icon="local-activity" title="Xé vé & Ghép trận" />
            <View style={styles.divider} />
            <MenuRow icon="groups" title="Câu lạc bộ của tôi" />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Tài Khoản & Ưu Đãi</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="card-giftcard" title="Ưu đãi & Voucher" badge="3" />
            <View style={styles.divider} />
            <MenuRow icon="account-balance-wallet" title="Ví & Thanh toán" />
            <View style={styles.divider} />
            <MenuRow icon="settings" title="Cài đặt tài khoản" />
            <View style={styles.divider} />
            <MenuRow icon="help-outline" title="Trung tâm trợ giúp" />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button 
            title="Đăng xuất" 
            variant="outline" 
            icon="logout"
            onPress={requestLogout} 
          />
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
    </SafeAreaView>
  );
}

// Sub-component for Menu Rows
function MenuRow({ icon, title, badge }: { icon: keyof typeof MaterialIcons.glyphMap, title: string, badge?: string }) {
  return (
    <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
      <View style={styles.menuRowLeft}>
        <View style={styles.menuIconBg}>
          <MaterialIcons name={icon} size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.menuRowTitle}>{title}</Text>
      </View>
      <View style={styles.menuRowRight}>
        {badge && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <MaterialIcons name="chevron-right" size={24} color={COLORS.outlineVariant} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  unauthTitle: {
    ...TYPOGRAPHY.titleLg,
    color: COLORS.onSurface,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  unauthText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: 120, // Enough space for tab bar
    gap: SPACING.lg,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    // Add subtle shadow per minimalist tech
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  userEmail: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.outline,
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
  },
  editButton: {
    padding: SPACING.xs,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    marginBottom: SPACING.xs,
  },
  statValue: {
    ...TYPOGRAPHY.titleLg,
    color: COLORS.primary,
  },
  statSub: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  menuSection: {},
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuRowTitle: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  menuBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  menuBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onError,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceVariant,
    marginLeft: 68, // Aligns with the text, bypassing the icon
  },
  logoutContainer: {
    marginTop: SPACING.md,
  },
});

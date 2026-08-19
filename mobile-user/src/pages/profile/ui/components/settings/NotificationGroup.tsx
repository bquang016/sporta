import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';

interface NotificationGroupProps {
  notifBooking: boolean;
  notifPromo: boolean;
  notifMatchmake: boolean;
  onToggleBooking: (val: boolean) => void;
  onTogglePromo: (val: boolean) => void;
  onToggleMatchmake: (val: boolean) => void;
}

export function NotificationGroup({
  notifBooking,
  notifPromo,
  notifMatchmake,
  onToggleBooking,
  onTogglePromo,
  onToggleMatchmake,
}: NotificationGroupProps) {
  return (
    <>
      <Text style={styles.sectionGroupTitle}>2. Cài Đặt Thông Báo</Text>

      <View style={styles.settingCard}>
        {/* Thông báo lịch đặt sân */}
        <View style={styles.settingRow}>
          <View style={styles.iconBg}>
            <MaterialIcons name="event-available" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Thông báo lịch đặt sân</Text>
            <Text style={styles.settingSubtext} numberOfLines={2}>Nhắc lịch sắp đá, cập nhật trạng thái đơn (Hủy, Đổi giờ...)</Text>
          </View>
          <Switch
            value={notifBooking}
            onValueChange={onToggleBooking}
            trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
            thumbColor={notifBooking ? COLORS.primary : COLORS.outline}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* Thông báo khuyến mãi */}
        <View style={styles.settingRow}>
          <View style={styles.iconBg}>
            <MaterialIcons name="card-giftcard" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Thông báo khuyến mãi</Text>
            <Text style={styles.settingSubtext} numberOfLines={2}>Nhận voucher mới và chương trình ưu đãi từ các chủ sân</Text>
          </View>
          <Switch
            value={notifPromo}
            onValueChange={onTogglePromo}
            trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
            thumbColor={notifPromo ? COLORS.primary : COLORS.outline}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* Thông báo ghép trận / CLB */}
        <View style={styles.settingRow}>
          <View style={styles.iconBg}>
            <MaterialIcons name="groups" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Thông báo ghép trận & CLB</Text>
            <Text style={styles.settingSubtext} numberOfLines={2}>Nhận thông báo khi có kèo giao hữu mới hoặc tin nhắn nhóm</Text>
          </View>
          <Switch
            value={notifMatchmake}
            onValueChange={onToggleMatchmake}
            trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
            thumbColor={notifMatchmake ? COLORS.primary : COLORS.outline}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionGroupTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
  settingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    gap: SPACING.md,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryOpacity12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingRowTextCol: {
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  settingSubtext: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs,
  },
});

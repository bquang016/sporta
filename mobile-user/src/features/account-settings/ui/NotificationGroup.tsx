import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

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
      <Text style={styles.sectionGroupTitle}>QUẢN LÝ THÔNG BÁO</Text>

      <View style={styles.settingCard}>
        {/* Thông báo lịch đặt sân */}
        <View style={styles.settingRow}>
          <View style={[styles.iconBg, { backgroundColor: '#E7F3EF' }]}>
            <MaterialIcons name="event-available" size={20} color="#064E3B" />
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
          <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
            <MaterialIcons name="card-giftcard" size={20} color="#B45309" />
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
          <View style={[styles.iconBg, { backgroundColor: '#E0E7FF' }]}>
            <MaterialIcons name="groups" size={20} color="#4338CA" />
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
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: SPACING.xs,
    marginLeft: 4,
    marginBottom: 8,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingRowTextCol: {
    flex: 1,
    marginRight: 12,
    overflow: 'hidden',
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
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
});

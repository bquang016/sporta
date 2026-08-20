import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';

export function ContactChannelsSection() {
  const handleCallHotline = () => {
    Linking.openURL('tel:19006868');
  };

  const handleOpenEmail = () => {
    Linking.openURL('mailto:support@sporta.vn');
  };

  const handleOpenZalo = () => {
    Linking.openURL('https://zalo.me');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Các Kênh Hỗ Trợ Trực Tiếp</Text>

      <View style={styles.card}>
        {/* Hotline */}
        <TouchableOpacity style={styles.channelRow} activeOpacity={0.8} onPress={handleCallHotline}>
          <View style={[styles.iconBg, { backgroundColor: '#DEF7EC' }]}>
            <MaterialIcons name="phone-in-talk" size={22} color="#03543F" />
          </View>
          <View style={styles.channelTextCol}>
            <Text style={styles.channelTitle}>Tổng đài Hotline 24/7</Text>
            <Text style={styles.channelValue}>1900 6868 (1.000 đ/phút)</Text>
            <Text style={styles.channelSub}>Giải quyết khiếu nại khẩn cấp & hỗ trợ trả sân</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Zalo OA */}
        <TouchableOpacity style={styles.channelRow} activeOpacity={0.8} onPress={handleOpenZalo}>
          <View style={[styles.iconBg, { backgroundColor: '#E1EFFE' }]}>
            <MaterialCommunityIcons name="message-processing" size={22} color="#1E429F" />
          </View>
          <View style={styles.channelTextCol}>
            <Text style={styles.channelTitle}>Chat Zalo Official Account</Text>
            <Text style={styles.channelValue}>Sporta Vietnam CSKH</Text>
            <Text style={styles.channelSub}>Hỗ trợ trực tuyến 8h00 - 22h00 hàng ngày</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Email */}
        <TouchableOpacity style={styles.channelRow} activeOpacity={0.8} onPress={handleOpenEmail}>
          <View style={[styles.iconBg, { backgroundColor: '#FCE8E6' }]}>
            <MaterialIcons name="mail-outline" size={22} color="#C81E1E" />
          </View>
          <View style={styles.channelTextCol}>
            <Text style={styles.channelTitle}>Gửi Email Hỗ Trợ</Text>
            <Text style={styles.channelValue}>support@sporta.vn</Text>
            <Text style={styles.channelSub}>Phản hồi trong vòng 24h làm việc</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 4,
    marginBottom: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    gap: SPACING.md,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelTextCol: {
    flex: 1,
  },
  channelTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  channelValue: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  channelSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs,
  },
});

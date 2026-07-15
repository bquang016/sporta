import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface ActionGridProps {
  isAuthenticated: boolean;
}

export function ActionGrid({ isAuthenticated }: ActionGridProps) {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bắt đầu ngay</Text>
      
      <View style={styles.grid}>
        {/* Nút 1: Đặt sân ngay (Màu Emerald tối giản) */}
        <TouchableOpacity
          onPress={() => router.push('/search')}
          style={styles.mainCtaContainer}
          activeOpacity={0.85}
        >
          <View style={[styles.mainCtaCard, { backgroundColor: COLORS.primary }]}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="event-seat" size={32} color={COLORS.white} />
            </View>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.mainCtaTitle}>Đặt sân ngay</Text>
              <Text style={styles.mainCtaSub}>Đặt chỗ nhanh trong 30 giây</Text>
            </View>
            <View style={styles.arrowIcon}>
              <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Cột bên phải chứa 2 nút nhỏ hơn */}
        <View style={styles.subGridColumn}>
          {/* Nút 2: Ghép kèo nhanh (Màu Nền tối giản nhẹ nhàng) */}
          <TouchableOpacity
            onPress={() => console.log('Match matching')}
            style={styles.subCtaContainer}
            activeOpacity={0.8}
          >
            <View style={[styles.subCtaCard, { backgroundColor: COLORS.surfaceContainerLow }]}>
              <View style={styles.subCardHeader}>
                <MaterialIcons name="groups" size={24} color={COLORS.primary} />
                <Text style={[styles.subCtaTitle, { color: COLORS.onSurface }]}>Ghép kèo nhanh</Text>
              </View>
              <Text style={[styles.subCtaSub, { color: COLORS.onSurfaceVariant }]} numberOfLines={1}>
                Tìm đối thủ phù hợp chỉ trong 30 giây
              </Text>
            </View>
          </TouchableOpacity>

          {/* Nút 3: Sân chơi xé vé (Màu Nền tối giản nhẹ nhàng) */}
          <TouchableOpacity
            style={styles.subCtaContainer}
            onPress={() => console.log('Ticket matching')}
            activeOpacity={0.8}
          >
            <View style={[styles.subCtaCard, { backgroundColor: COLORS.surfaceContainerLow }]}>
              <View style={styles.subCardHeader}>
                <MaterialIcons name="confirmation-number" size={24} color={COLORS.primary} />
                <Text style={[styles.subCtaTitle, { color: COLORS.onSurface }]}>Tìm sân xé vé</Text>
              </View>
              <Text style={[styles.subCtaSub, { color: COLORS.onSurfaceVariant }]} numberOfLines={1}>
                Tham gia kèo lẻ có sẵn
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.base,
    marginVertical: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    height: 160,
  },
  mainCtaContainer: {
    flex: 1.2,
    height: '100%',
  },
  mainCtaCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'space-between',
    position: 'relative',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextContainer: {
    gap: 2,
  },
  mainCtaTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 18,
  },
  mainCtaSub: {
    ...TYPOGRAPHY.bodyMd,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
  },
  arrowIcon: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subGridColumn: {
    flex: 1,
    gap: SPACING.sm,
  },
  subCtaContainer: {
    flex: 1,
  },
  subCtaCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    justifyContent: 'center',
    gap: 4,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  subCtaTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    fontSize: 14,
  },
  subCtaSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 10,
  },
});

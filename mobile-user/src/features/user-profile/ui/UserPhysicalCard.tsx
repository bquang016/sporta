import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UserPhysicalCardProps {
  height?: number;
  weight?: number;
}

export const UserPhysicalCard = React.memo(({ height, weight }: UserPhysicalCardProps) => {
  const heightDisplay = height && height > 0 ? `${height} cm` : 'Chưa cập nhật';
  const weightDisplay = weight && weight > 0 ? `${weight} kg` : 'Chưa cập nhật';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="barbell-outline" size={17} color={COLORS.primary} />
        <Text style={styles.title}>Chỉ số thể hình & Thông tin</Text>
      </View>

      <View style={styles.grid}>
        {/* Height */}
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="resize-outline" size={16} color="#2563EB" />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Chiều cao</Text>
            <Text
              style={[
                styles.statValue,
                heightDisplay === 'Chưa cập nhật' && styles.statValuePlaceholder,
              ]}
              numberOfLines={1}
            >
              {heightDisplay}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.colDivider} />

        {/* Weight */}
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#FDF4FF' }]}>
            <Ionicons name="fitness-outline" size={16} color="#9333EA" />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Cân nặng</Text>
            <Text
              style={[
                styles.statValue,
                weightDisplay === 'Chưa cập nhật' && styles.statValuePlaceholder,
              ]}
              numberOfLines={1}
            >
              {weightDisplay}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statValue: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statValuePlaceholder: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  colDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
});

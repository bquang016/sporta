import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SubScoreRow {
  label: string;
  score: number;
}

interface ReviewSummaryBannerProps {
  averageRating: number;
  totalReviews: number;
  avgSurfaceScore: number;
  avgLightingScore: number;
  avgServiceScore: number;
}

/**
 * Banner tổng quan điểm đánh giá của venue.
 * Hiển thị điểm trung bình lớn + các tiêu chí phụ dạng progress bar.
 */
export function ReviewSummaryBanner({
  averageRating,
  totalReviews,
  avgSurfaceScore,
  avgLightingScore,
  avgServiceScore,
}: ReviewSummaryBannerProps) {
  const subScores: SubScoreRow[] = [
    { label: 'Mặt sân', score: avgSurfaceScore },
    { label: 'Ánh sáng', score: avgLightingScore },
    { label: 'Dịch vụ', score: avgServiceScore },
  ];

  const displayRating = averageRating > 0
    ? averageRating.toFixed(1)
    : '--';

  return (
    <View style={styles.container}>
      {/* Big score card */}
      <LinearGradient
        colors={[COLORS.primary, '#033326']}
        style={styles.bigScoreCard}
      >
        <Text style={styles.bigScoreNumber}>{displayRating}</Text>
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }, (_, i) => (
            <MaterialIcons
              key={i}
              name="star"
              size={14}
              color={i < Math.round(averageRating) ? COLORS.secondary : COLORS.whiteOpacity30}
            />
          ))}
        </View>
        <Text style={styles.totalText}>{totalReviews} đánh giá</Text>
      </LinearGradient>

      {/* Sub-score progress bars */}
      <View style={styles.progressCol}>
        {subScores.map((item) => (
          <View key={item.label} style={styles.progressRow}>
            <Text style={styles.progressLabel}>{item.label}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, (item.score / 5) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressScore}>
              {item.score > 0 ? item.score.toFixed(1) : '--'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
  },
  bigScoreCard: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  bigScoreNumber: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.onPrimary,
    lineHeight: 36,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  totalText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.whiteOpacity70,
    marginTop: 4,
    textAlign: 'center',
  },
  progressCol: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  progressLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurfaceVariant,
    width: 60,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressScore: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurface,
    width: 28,
    textAlign: 'right',
    fontWeight: '600',
  },
});

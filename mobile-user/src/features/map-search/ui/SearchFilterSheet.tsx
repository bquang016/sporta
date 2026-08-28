import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

// ---------------------------------------------------------------------------
// Sport icon helper (same mapping as FacilityMarker)
// ---------------------------------------------------------------------------
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];
type CommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const SPORT_ICON_MAP: Record<
  string,
  { type: 'material' | 'community'; name: string }
> = {
  'bóng đá': { type: 'material', name: 'sports-soccer' },
  football: { type: 'material', name: 'sports-soccer' },
  soccer: { type: 'material', name: 'sports-soccer' },
  'cầu lông': { type: 'community', name: 'badminton' },
  badminton: { type: 'community', name: 'badminton' },
  tennis: { type: 'material', name: 'sports-tennis' },
  'bóng rổ': { type: 'material', name: 'sports-basketball' },
  basketball: { type: 'material', name: 'sports-basketball' },
  pickleball: { type: 'material', name: 'sports-tennis' },
  'bóng chuyền': { type: 'material', name: 'sports-volleyball' },
  volleyball: { type: 'material', name: 'sports-volleyball' },
};

const getSportIcon = (sport: string) => {
  return SPORT_ICON_MAP[sport.toLowerCase()] ?? { type: 'material', name: 'sports' };
};

// ---------------------------------------------------------------------------
// SportChip
// ---------------------------------------------------------------------------
interface SportChipProps {
  sport: string | null; // null = "Tất cả"
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const SportChip = memo(({ sport, label, isActive, onPress }: SportChipProps) => {
  const icon = sport ? getSportIcon(sport) : null;

  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {icon ? (
        icon.type === 'material' ? (
          <MaterialIcons
            name={icon.name as MaterialIconName}
            size={14}
            color={isActive ? COLORS.onPrimary : COLORS.onSurfaceVariant}
          />
        ) : (
          <MaterialCommunityIcons
            name={icon.name as CommunityIconName}
            size={14}
            color={isActive ? COLORS.onPrimary : COLORS.onSurfaceVariant}
          />
        )
      ) : (
        <MaterialIcons
          name="map"
          size={14}
          color={isActive ? COLORS.onPrimary : COLORS.onSurfaceVariant}
        />
      )}
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

SportChip.displayName = 'SportChip';

// ---------------------------------------------------------------------------
// FloatingSportFilter
// ---------------------------------------------------------------------------
interface FloatingSportFilterProps {
  availableSports: string[];
  selectedSport: string | null;
  onSelectSport: (sport: string | null) => void;
  venueCount: number;
}

export const FloatingSportFilter = memo(
  ({
    availableSports,
    selectedSport,
    onSelectSport,
    venueCount,
  }: FloatingSportFilterProps) => {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* "Tất cả" chip */}
          <SportChip
            sport={null}
            label="Tất cả"
            isActive={selectedSport === null}
            onPress={() => onSelectSport(null)}
          />

          {/* Dynamic sport chips từ data thực */}
          {availableSports.map((sport) => (
            <SportChip
              key={sport}
              sport={sport}
              label={sport}
              isActive={selectedSport === sport}
              onPress={() => onSelectSport(sport)}
            />
          ))}
        </ScrollView>

        {/* Counter badge */}
        <View style={styles.counterBadge}>
          <MaterialIcons name="place" size={12} color={COLORS.primary} />
          <Text style={styles.counterText}>{venueCount} sân</Text>
        </View>
      </View>
    );
  }
);

FloatingSportFilter.displayName = 'FloatingSportFilter';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SPACING.sm,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.base,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base - 1,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  chipText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  chipTextActive: {
    color: COLORS.onPrimary,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-end',
    marginRight: SPACING.marginMobile,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: 3,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  counterText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    color: COLORS.primary,
  },
});

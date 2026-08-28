import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/config/theme';

export interface LocationFilterCardProps {
  province: string;
  ward: string;
  onOpenProvincePicker: () => void;
  onOpenWardPicker: () => void;
  onClearProvince: () => void;
  onClearWard: () => void;
}

export function LocationFilterCard({
  province,
  ward,
  onOpenProvincePicker,
  onOpenWardPicker,
  onClearProvince,
  onClearWard,
}: LocationFilterCardProps) {
  const isProvinceSelected = province !== 'all' && Boolean(province);
  const isWardSelected = ward !== 'all' && Boolean(ward);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerIconBox}>
          <MaterialIcons name="place" size={15} color={COLORS.primary} />
        </View>
        <Text style={styles.cardTitle}>Khu vực hoạt động</Text>
      </View>

      <View style={styles.locationStack}>
        {/* Row 1: Tỉnh / Thành phố */}
        <TouchableOpacity
          style={[
            styles.pickerRow,
            isProvinceSelected && styles.pickerRowSelected,
          ]}
          activeOpacity={0.8}
          onPress={onOpenProvincePicker}
        >
          <View
            style={[
              styles.iconCircle,
              isProvinceSelected && styles.iconCircleSelected,
            ]}
          >
            <MaterialIcons
              name="location-city"
              size={18}
              color={isProvinceSelected ? COLORS.primary : '#64748B'}
            />
          </View>

          <View style={styles.pickerTextCol}>
            <Text style={styles.pickerHint}>Tỉnh / Thành phố</Text>
            <Text
              style={[
                styles.pickerValue,
                isProvinceSelected && styles.pickerValueSelected,
              ]}
              numberOfLines={1}
            >
              {isProvinceSelected ? province : 'Tất cả tỉnh thành'}
            </Text>
          </View>

          {isProvinceSelected ? (
            <View style={styles.actionRightRow}>
              <View style={styles.selectedBadge}>
                <MaterialIcons name="check" size={12} color={COLORS.primary} />
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onClearProvince();
                }}
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="cancel" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ) : (
            <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
          )}
        </TouchableOpacity>

        {/* Row 2: Quận / Huyện (Active only after a province is chosen) */}
        <TouchableOpacity
          style={[
            styles.pickerRow,
            !isProvinceSelected && styles.pickerRowDisabled,
            isWardSelected && styles.pickerRowSelected,
          ]}
          activeOpacity={0.8}
          onPress={() => isProvinceSelected && onOpenWardPicker()}
          disabled={!isProvinceSelected}
        >
          <View
            style={[
              styles.iconCircle,
              isWardSelected && styles.iconCircleSelected,
              !isProvinceSelected && styles.iconCircleDisabled,
            ]}
          >
            <MaterialIcons
              name={isProvinceSelected ? 'explore' : 'lock-outline'}
              size={18}
              color={
                isWardSelected
                  ? COLORS.primary
                  : isProvinceSelected
                  ? '#64748B'
                  : '#CBD5E1'
              }
            />
          </View>

          <View style={styles.pickerTextCol}>
            <Text style={styles.pickerHint}>Quận / Huyện</Text>
            <Text
              style={[
                styles.pickerValue,
                !isProvinceSelected && styles.pickerValueDisabled,
                isWardSelected && styles.pickerValueSelected,
              ]}
              numberOfLines={1}
            >
              {!isProvinceSelected
                ? 'Vui lòng chọn Tỉnh/TP trước'
                : !isWardSelected
                ? `Tất cả quận/huyện ở ${province}`
                : ward}
            </Text>
          </View>

          {isWardSelected ? (
            <View style={styles.actionRightRow}>
              <View style={styles.selectedBadge}>
                <MaterialIcons name="check" size={12} color={COLORS.primary} />
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onClearWard();
                }}
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="cancel" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ) : (
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={isProvinceSelected ? '#94A3B8' : '#CBD5E1'}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  locationStack: {
    gap: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  pickerRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  pickerRowDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleSelected: {
    backgroundColor: COLORS.primaryOpacity15,
  },
  iconCircleDisabled: {
    backgroundColor: '#E2E8F0',
  },
  pickerTextCol: {
    flex: 1,
    gap: 2,
  },
  pickerHint: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pickerValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  pickerValueSelected: {
    color: '#0F172A',
    fontWeight: '800',
  },
  pickerValueDisabled: {
    color: '#94A3B8',
    fontWeight: '500',
    fontSize: 12.5,
  },
  actionRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primaryOpacity15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    padding: 2,
  },
});

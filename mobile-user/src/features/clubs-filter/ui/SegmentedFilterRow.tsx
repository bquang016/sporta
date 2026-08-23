import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/config/theme';
import { SegmentOption } from '../model/types';

export interface SegmentedFilterRowProps {
  title: string;
  headerIcon?: string;
  options: SegmentOption[];
  selectedValue: string;
  onSelect: (id: string) => void;
  layoutMode?: 'row' | 'wrap';
}

export function SegmentedFilterRow({
  title,
  headerIcon,
  options,
  selectedValue,
  onSelect,
  layoutMode = 'row',
}: SegmentedFilterRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {headerIcon && (
          <View style={styles.headerIconBox}>
            <MaterialIcons name={headerIcon as any} size={15} color={COLORS.primary} />
          </View>
        )}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>

      <View
        style={[
          styles.optionsContainer,
          layoutMode === 'wrap' ? styles.wrapContainer : styles.rowContainer,
        ]}
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                layoutMode === 'wrap' && styles.optionItemWrap,
                isSelected && styles.optionItemActive,
              ]}
              activeOpacity={0.82}
              onPress={() => onSelect(option.id)}
            >
              {option.icon && (
                <MaterialIcons
                  name={option.icon as any}
                  size={14}
                  color={isSelected ? COLORS.white : COLORS.primary}
                  style={styles.optionIcon}
                />
              )}
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextActive,
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  optionsContainer: {
    gap: 6,
  },
  rowContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 9,
    gap: 4,
  },
  optionItemWrap: {
    flex: 0,
    minWidth: '31%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 3,
  },
  optionIcon: {
    marginRight: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

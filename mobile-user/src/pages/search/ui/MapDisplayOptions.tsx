import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';

export type MapDisplayMode = 'price' | 'distance' | 'sport' | 'rating';

interface MapDisplayOptionsProps {
  mode: MapDisplayMode;
  onChange: (mode: MapDisplayMode) => void;
}

export function MapDisplayOptions({ mode, onChange }: MapDisplayOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsRendered(false));
    } else {
      setIsOpen(true);
      setIsRendered(true);
      Animated.spring(animation, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSelect = (value: MapDisplayMode) => {
    onChange(value);
    setIsOpen(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsRendered(false));
  };

  const options: { value: MapDisplayMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { value: 'price', label: 'Giá tiền', icon: 'attach-money' },
    { value: 'distance', label: 'Khoảng cách', icon: 'directions-walk' },
    { value: 'sport', label: 'Môn thể thao', icon: 'sports-soccer' },
    { value: 'rating', label: 'Đánh giá', icon: 'star' },
  ];

  const currentOption = options.find(o => o.value === mode) || options[2];

  return (
    <View style={styles.container}>
      {showTooltip && !isOpen && (
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipText}>Chạm để đổi chế độ hiển thị</Text>
          <View style={styles.tooltipArrow} />
        </View>
      )}

      {isRendered && (
        <Animated.View style={[
          styles.menuContainer,
          {
            opacity: animation,
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [15, 0],
                }),
              },
            ],
          }
        ]}>
          {options.map((option) => {
            const isActive = mode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleSelect(option.value)}
              >
                <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                  {option.label}
                </Text>
                <MaterialIcons 
                  name={option.icon} 
                  size={20} 
                  color={isActive ? COLORS.primary : COLORS.onSurfaceVariant} 
                />
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}
      
      <TouchableOpacity 
        style={styles.mainButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View style={{
          transform: [
            {
              rotate: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '90deg'],
              }),
            }
          ]
        }}>
          <MaterialIcons 
            name={isOpen ? "close" : currentOption.icon} 
            size={24} 
            color={COLORS.primary} 
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: SPACING.marginMobile,
    bottom: 92,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  menuItemActive: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  menuItemText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
  },
  menuItemTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceDim,
  },
  tooltipContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 8,
    marginRight: 4,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    right: 18,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.primary,
  }
});

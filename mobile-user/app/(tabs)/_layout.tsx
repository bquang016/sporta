import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/shared/config/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// ── Tab configuration (icon-only, no labels) ──
const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  map: { active: 'map', inactive: 'map-outline' },
  social: { active: 'people', inactive: 'people-outline' },
  clubs: { active: 'shield', inactive: 'shield-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

// ── Hidden routes (not shown in the bar) ──
const HIDDEN_ROUTES = ['bookings', 'wallet'];

// ── Custom Instagram-style Tab Bar ──
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const scaleAnims = useRef(
    state.routes
      .filter((r) => !HIDDEN_ROUTES.includes(r.name))
      .map(() => new Animated.Value(0))
  ).current;

  // Animate active indicator
  useEffect(() => {
    const visibleIndex = getVisibleIndex(state);
    scaleAnims.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === visibleIndex ? 1 : 0,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    });
  }, [state.index]);

  const getVisibleIndex = (s: typeof state) => {
    const visibleRoutes = s.routes.filter((r) => !HIDDEN_ROUTES.includes(r.name));
    const activeRoute = s.routes[s.index];
    return visibleRoutes.findIndex((r) => r.key === activeRoute.key);
  };

  const visibleRoutes = state.routes.filter(
    (r) => !HIDDEN_ROUTES.includes(r.name)
  );

  return (
    <View
      style={[
        styles.barOuter,
        {
          paddingBottom: Math.max(insets.bottom - 8, 8),
        },
      ]}
    >
      <View style={styles.barContainer}>
        {visibleRoutes.map((route, index) => {
          const isFocused = getVisibleIndex(state) === index;
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;

          const iconName = isFocused ? icons.active : icons.inactive;
          const iconColor = isFocused ? COLORS.primary : COLORS.outline;

          // Scale for the active background pill
          const bgScale = scaleAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          });
          const bgOpacity = scaleAnims[index];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              {/* iOS 26 style: rounded rectangle background behind active icon */}
              <Animated.View
                style={[
                  styles.activeIndicator,
                  {
                    opacity: bgOpacity,
                    transform: [{ scale: bgScale }],
                  },
                ]}
              />
              <Ionicons name={iconName} size={24} color={iconColor} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Tabs Layout ──
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="social" />
      <Tabs.Screen name="clubs" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="wallet" options={{ href: null }} />
    </Tabs>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  barOuter: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    // Glassmorphism shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
    // Subtle border for glass edge highlight
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    width: 48,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryOpacity12,
  },
});

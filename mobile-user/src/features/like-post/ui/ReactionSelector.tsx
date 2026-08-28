import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { REACTION_MAP } from '../../../entities/post';

/* ── Sport-themed Reaction Badges ── */
const REACTION_KEYS = ['like', 'love', 'fire', 'muscle', 'trophy'] as const;
const REACTION_CONFIG = REACTION_KEYS.map((key) => ({
  key,
  icon: REACTION_MAP[key].iconName,
  label: REACTION_MAP[key].label,
  bg: REACTION_MAP[key].color,
}));

const BAR_WIDTH = 280;
const BAR_HEIGHT = 56;
const CIRCLE_SIZE = 38;

/* ── Imperative Handle ── */
export interface ReactionSelectorRef {
  setHoveredIndex: (index: number | null) => void;
  getHoveredIndex: () => number | null;
}

export const ReactionSelector = forwardRef<ReactionSelectorRef, {}>(
  (_props, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const hoveredIndexRef = useRef<number | null>(null);

    /* ── Container Animated Values ── */
    const barOpacity = useRef(new Animated.Value(0)).current;
    const barScale = useRef(new Animated.Value(0.92)).current;
    const barTranslateY = useRef(new Animated.Value(8)).current;

    /* ── Per-item Animated Values ── */
    const sc0 = useRef(new Animated.Value(0.6)).current;
    const sc1 = useRef(new Animated.Value(0.6)).current;
    const sc2 = useRef(new Animated.Value(0.6)).current;
    const sc3 = useRef(new Animated.Value(0.6)).current;
    const sc4 = useRef(new Animated.Value(0.6)).current;
    const itemScales = [sc0, sc1, sc2, sc3, sc4];

    // TranslateY (hover lift)
    const ty0 = useRef(new Animated.Value(0)).current;
    const ty1 = useRef(new Animated.Value(0)).current;
    const ty2 = useRef(new Animated.Value(0)).current;
    const ty3 = useRef(new Animated.Value(0)).current;
    const ty4 = useRef(new Animated.Value(0)).current;
    const itemYs = [ty0, ty1, ty2, ty3, ty4];

    /* ── Imperative Handle ── */
    useImperativeHandle(ref, () => ({
      setHoveredIndex: (i: number | null) => {
        hoveredIndexRef.current = i;
        setHoveredIndex(i);
      },
      getHoveredIndex: () => hoveredIndexRef.current,
    }));

    useEffect(() => {
      Animated.parallel([
        Animated.timing(barOpacity, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(barScale, {
          toValue: 1,
          damping: 16,
          stiffness: 300,
          mass: 0.5,
          useNativeDriver: true,
        }),
        Animated.spring(barTranslateY, {
          toValue: 0,
          damping: 16,
          stiffness: 300,
          mass: 0.5,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.stagger(
        35,
        itemScales.map((s) =>
          Animated.spring(s, {
            toValue: 1,
            damping: 14,
            stiffness: 340,
            mass: 0.4,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }, []);

    useEffect(() => {
      itemScales.forEach((scale, i) => {
        let toScale = 1.0;
        let toY = 0;

        if (hoveredIndex !== null) {
          const dist = Math.abs(i - hoveredIndex);
          if (dist === 0) {
            toScale = 1.65;
            toY = -24;
          } else if (dist === 1) {
            toScale = 1.12;
            toY = -5;
          } else {
            toScale = 0.9;
          }
        }

        Animated.spring(scale, {
          toValue: toScale,
          damping: 14,
          stiffness: 280,
          mass: 0.35,
          useNativeDriver: true,
        }).start();

        Animated.spring(itemYs[i], {
          toValue: toY,
          damping: 14,
          stiffness: 240,
          mass: 0.35,
          useNativeDriver: true,
        }).start();
      });
    }, [hoveredIndex]);

    return (
      <View style={styles.container}>
        {/* White pill background container */}
        <Animated.View
          style={[
            styles.barBg,
            {
              opacity: barOpacity,
              transform: [{ scale: barScale }, { translateY: barTranslateY }],
            },
          ]}
        />

        {/* Reaction badges */}
        <Animated.View
          style={[
            styles.badgesRow,
            {
              opacity: barOpacity,
              transform: [{ translateY: barTranslateY }],
            },
          ]}
        >
          {REACTION_CONFIG.map((item, index) => {
            const isActive = index === hoveredIndex;

            return (
              <Animated.View
                key={item.key}
                style={[
                  styles.badgeSlot,
                  {
                    transform: [
                      { scale: itemScales[index] },
                      { translateY: itemYs[index] },
                    ],
                    zIndex: isActive ? 50 : 1,
                    ...(Platform.OS === 'android' && {
                      elevation: isActive ? 8 : 0,
                    }),
                  },
                ]}
              >
                {/* Compact Floating Tooltip Pill */}
                {isActive && (
                  <View style={styles.tooltipPill}>
                    <Text style={styles.tooltipText} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </View>
                )}

                {/* Colored circle badge */}
                <View
                  style={[styles.iconCircle, { backgroundColor: item.bg }]}
                >
                  <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    overflow: 'visible' as any,
  },
  barBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    borderRadius: BAR_HEIGHT / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  badgesRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    overflow: 'visible' as any,
    paddingHorizontal: 8,
  },
  badgeSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible' as any,
    position: 'relative',
  },
  iconCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  tooltipPill: {
    position: 'absolute',
    top: -22,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    alignSelf: 'center',
  },
  tooltipText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 6.5,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0,
  },
});

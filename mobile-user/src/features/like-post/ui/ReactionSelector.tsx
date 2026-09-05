import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/* ── Sport-themed Reaction Badges (Facebook-grade 3D Styling) ── */
interface ReactionConfigItem {
  key: 'like' | 'love' | 'fire' | 'muscle' | 'trophy';
  icon: any;
  iconLib: 'ionicons' | 'materialCommunity';
  label: string;
  gradient: [string, string];
  shadowColor: string;
}

const REACTION_CONFIG: ReactionConfigItem[] = [
  {
    key: 'like',
    icon: 'thumb-up',
    iconLib: 'materialCommunity',
    label: 'Thích',
    gradient: ['#1877F2', '#0A56C2'],
    shadowColor: '#1877F2',
  },
  {
    key: 'love',
    icon: 'heart',
    iconLib: 'ionicons',
    label: 'Yêu thích',
    gradient: ['#FF4D6D', '#D90429'],
    shadowColor: '#FF4D6D',
  },
  {
    key: 'fire',
    icon: 'flame',
    iconLib: 'ionicons',
    label: 'Bùng nổ',
    gradient: ['#FF9E00', '#E85D04'],
    shadowColor: '#FF9E00',
  },
  {
    key: 'muscle',
    icon: 'barbell',
    iconLib: 'ionicons',
    label: 'Thể lực',
    gradient: ['#8B5CF6', '#6D28D9'],
    shadowColor: '#8B5CF6',
  },
  {
    key: 'trophy',
    icon: 'trophy',
    iconLib: 'ionicons',
    label: 'Vô địch',
    gradient: ['#FBBF24', '#D97706'],
    shadowColor: '#FBBF24',
  },
];

const BAR_WIDTH = 300;
const BAR_HEIGHT = 58;
const CIRCLE_SIZE = 42;

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
    const barScale = useRef(new Animated.Value(0.85)).current;
    const barTranslateY = useRef(new Animated.Value(12)).current;

    /* ── Per-item Animated Values ── */
    const sc0 = useRef(new Animated.Value(0.4)).current;
    const sc1 = useRef(new Animated.Value(0.4)).current;
    const sc2 = useRef(new Animated.Value(0.4)).current;
    const sc3 = useRef(new Animated.Value(0.4)).current;
    const sc4 = useRef(new Animated.Value(0.4)).current;
    const itemScales = [sc0, sc1, sc2, sc3, sc4];

    // TranslateY (hover lift)
    const ty0 = useRef(new Animated.Value(10)).current;
    const ty1 = useRef(new Animated.Value(10)).current;
    const ty2 = useRef(new Animated.Value(10)).current;
    const ty3 = useRef(new Animated.Value(10)).current;
    const ty4 = useRef(new Animated.Value(10)).current;
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
      // 1. Animate Bar Pill In
      Animated.parallel([
        Animated.timing(barOpacity, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(barScale, {
          toValue: 1,
          damping: 15,
          stiffness: 320,
          mass: 0.5,
          useNativeDriver: true,
        }),
        Animated.spring(barTranslateY, {
          toValue: 0,
          damping: 15,
          stiffness: 320,
          mass: 0.5,
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Staggered Pop-In for Reaction Badges
      Animated.stagger(
        30,
        itemScales.map((s, idx) =>
          Animated.parallel([
            Animated.spring(s, {
              toValue: 1,
              damping: 12,
              stiffness: 360,
              mass: 0.4,
              useNativeDriver: true,
            }),
            Animated.spring(itemYs[idx], {
              toValue: 0,
              damping: 12,
              stiffness: 360,
              mass: 0.4,
              useNativeDriver: true,
            }),
          ])
        ),
      ).start();
    }, []);

    // Hover Animation Response
    useEffect(() => {
      itemScales.forEach((scale, i) => {
        let toScale = 1.0;
        let toY = 0;

        if (hoveredIndex !== null) {
          const dist = Math.abs(i - hoveredIndex);
          if (dist === 0) {
            toScale = 1.68;
            toY = -26;
          } else if (dist === 1) {
            toScale = 1.15;
            toY = -6;
          } else {
            toScale = 0.88;
          }
        }

        Animated.spring(scale, {
          toValue: toScale,
          damping: 13,
          stiffness: 300,
          mass: 0.35,
          useNativeDriver: true,
        }).start();

        Animated.spring(itemYs[i], {
          toValue: toY,
          damping: 13,
          stiffness: 260,
          mass: 0.35,
          useNativeDriver: true,
        }).start();
      });
    }, [hoveredIndex]);

    return (
      <View style={styles.container}>
        {/* Floating white pill bar container */}
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
                    zIndex: isActive ? 100 : 1,
                    ...(Platform.OS === 'android' && {
                      elevation: isActive ? 12 : 0,
                    }),
                  },
                ]}
              >
                {/* Floating Tooltip Pill on Hover */}
                {isActive && (
                  <View style={styles.tooltipPill}>
                    <Text style={styles.tooltipText} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <View style={styles.tooltipArrow} />
                  </View>
                )}

                {/* 3D Glossy Reaction Circle Badge */}
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.iconCircle,
                    {
                      shadowColor: item.shadowColor,
                    },
                  ]}
                >
                  {item.iconLib === 'materialCommunity' ? (
                    <MaterialCommunityIcons name={item.icon} size={22} color="#FFFFFF" />
                  ) : (
                    <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                  )}
                  {/* Subtle Top Highlight Glare */}
                  <View style={styles.circleHighlight} />
                </LinearGradient>
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
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    borderRadius: BAR_HEIGHT / 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  badgesRow: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    overflow: 'visible' as any,
    paddingHorizontal: 6,
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
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },
  circleHighlight: {
    position: 'absolute',
    top: 1,
    left: '20%',
    width: '60%',
    height: '35%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderTopLeftRadius: CIRCLE_SIZE / 2,
    borderTopRightRadius: CIRCLE_SIZE / 2,
  },
  tooltipPill: {
    position: 'absolute',
    top: -28,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 120,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
  },
});

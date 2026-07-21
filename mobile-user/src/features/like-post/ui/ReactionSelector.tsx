import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { REACTION_MAP } from '../../../entities/post/ui/PostCard';

const REACTIONS: ('like' | 'love' | 'fire' | 'muscle' | 'trophy')[] = [
  'like',
  'love',
  'fire',
  'muscle',
  'trophy',
];

/* ── Imperative handle for parent to drive hover state ── */
export interface ReactionSelectorRef {
  setHoveredIndex: (index: number | null) => void;
  getHoveredIndex: () => number | null;
}

export const ReactionSelector = forwardRef<ReactionSelectorRef, {}>(
  (_props, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const hoveredIndexRef = useRef<number | null>(null);

    /* ── Animated values ── */
    const containerScale = useRef(new Animated.Value(0.55)).current;
    const containerOpacity = useRef(new Animated.Value(0)).current;

    // 5 item scales (entry + hover zoom)
    const s1 = useRef(new Animated.Value(0)).current;
    const s2 = useRef(new Animated.Value(0)).current;
    const s3 = useRef(new Animated.Value(0)).current;
    const s4 = useRef(new Animated.Value(0)).current;
    const s5 = useRef(new Animated.Value(0)).current;
    const itemScales = [s1, s2, s3, s4, s5];

    // 5 item translateY (hover lift-up)
    const ty1 = useRef(new Animated.Value(0)).current;
    const ty2 = useRef(new Animated.Value(0)).current;
    const ty3 = useRef(new Animated.Value(0)).current;
    const ty4 = useRef(new Animated.Value(0)).current;
    const ty5 = useRef(new Animated.Value(0)).current;
    const itemTranslateYs = [ty1, ty2, ty3, ty4, ty5];

    /* ── Imperative handle ── */
    useImperativeHandle(ref, () => ({
      setHoveredIndex: (i: number | null) => {
        hoveredIndexRef.current = i;
        setHoveredIndex(i);
      },
      getHoveredIndex: () => hoveredIndexRef.current,
    }));

    /* ── Entry animation on mount ── */
    useEffect(() => {
      Animated.parallel([
        Animated.spring(containerScale, {
          toValue: 1,
          damping: 13,
          stiffness: 160,
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();

      const staggerAnims = itemScales.map((scale) =>
        Animated.spring(scale, {
          toValue: 1,
          friction: 4.5,
          tension: 50,
          useNativeDriver: true,
        }),
      );
      Animated.stagger(30, staggerAnims).start();
    }, []);

    /* ── Hover zoom + lift animation ── */
    useEffect(() => {
      itemScales.forEach((scale, index) => {
        const isActive = index === hoveredIndex;
        Animated.spring(scale, {
          toValue: isActive ? 1.45 : 1.0,
          friction: 4,
          tension: isActive ? 140 : 80,
          useNativeDriver: true,
        }).start();
      });

      itemTranslateYs.forEach((ty, index) => {
        Animated.spring(ty, {
          toValue: index === hoveredIndex ? -14 : 0,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }).start();
      });
    }, [hoveredIndex]);

    return (
      <Animated.View
        style={[
          styles.bar,
          {
            opacity: containerOpacity,
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        {REACTIONS.map((key, index) => {
          const item = REACTION_MAP[key];
          const scale = itemScales[index];
          const translateY = itemTranslateYs[index];

          return (
            <Animated.View
              key={key}
              style={{ transform: [{ scale }, { translateY }] }}
            >
              <View style={styles.reactionItem}>
                <Ionicons name={item.iconName} size={24} color={item.color} />
                <Text style={[styles.label, { color: item.color }]}>
                  {item.label}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>
    );
  },
);

/* ── Styles ── */
const styles = StyleSheet.create({
  bar: {
    width: 340,
    height: 68,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    // Premium glassmorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.06)',
  },
  reactionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 54,
    gap: 3,
  },
  label: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 9,
    textAlign: 'center',
  },
});

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  PanResponder, 
  Dimensions, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FAB_SIZE = 56;
const DOCKED_WIDTH = 26; // Ultra-slim 26px width
const DOCKED_HEIGHT = 44;
const DEFAULT_MARGIN = 16;

// Absolute Screen Coordinates (X)
const FULL_RIGHT_X = SCREEN_WIDTH - FAB_SIZE - DEFAULT_MARGIN;
const FULL_LEFT_X = DEFAULT_MARGIN;
const DOCKED_RIGHT_X = SCREEN_WIDTH - DOCKED_WIDTH;
const DOCKED_LEFT_X = 0;

// Vertical boundaries
const MIN_Y = Platform.OS === 'ios' ? 90 : 70;
const MAX_Y = SCREEN_HEIGHT - 170;
const DEFAULT_Y = SCREEN_HEIGHT - 200;

interface ChatbotFABProps {
  onPress: () => void;
}

export const ChatbotFAB: React.FC<ChatbotFABProps> = ({ onPress }) => {
  const pathname = usePathname();

  // 1. Determine if FAB is allowed on current route
  const isAllowed = useMemo(() => {
    if (!pathname) return true;
    const hiddenKeywords = [
      '/payment',
      '/ticket-payment',
      '/booking/success',
      '/create',
      '/score',
      '/result',
      '/messages',
      '/auth',
      '/login',
      '/register',
      '/otp',
      '/sport-level',
    ];
    return !hiddenKeywords.some((keyword) => pathname.includes(keyword));
  }, [pathname]);

  // 2. Animated values
  const routeAnim = useRef(new Animated.Value(isAllowed ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;
  const dockAnim = useRef(new Animated.Value(0)).current; // 0 = Full FAB, 1 = Docked Tab
  
  // Absolute Drag Position (pan.x and pan.y)
  const pan = useRef(new Animated.ValueXY({ x: FULL_RIGHT_X, y: DEFAULT_Y })).current;
  const currentPos = useRef({ x: FULL_RIGHT_X, y: DEFAULT_Y });

  const [showTooltip, setShowTooltip] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [dockSide, setDockSide] = useState<'right' | 'left'>('right');

  // Track position changes
  useEffect(() => {
    const listenerId = pan.addListener((value) => {
      currentPos.current = value;
    });
    return () => pan.removeListener(listenerId);
  }, [pan]);

  // Animate route in/out smoothly
  useEffect(() => {
    if (isAllowed) {
      Animated.spring(routeAnim, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(routeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }
  }, [isAllowed, routeAnim]);

  // Subtle pulse animation for full FAB
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1300,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const hideTooltip = useCallback(() => {
    Animated.timing(tooltipAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setShowTooltip(false);
    });
  }, [tooltipAnim]);

  // Tooltip auto-appear after 2.4 seconds if on allowed screen and not docked
  useEffect(() => {
    if (!isAllowed || isDocked) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
      Animated.spring(tooltipAnim, {
        toValue: 1,
        tension: 85,
        friction: 8,
        useNativeDriver: false,
      }).start();

      const autoDismissTimer = setTimeout(() => {
        hideTooltip();
      }, 6500);

      return () => clearTimeout(autoDismissTimer);
    }, 2400);

    return () => clearTimeout(timer);
  }, [isAllowed, isDocked, tooltipAnim, hideTooltip]);

  // Docking Action to either Left or Right edge
  const dockToEdge = useCallback((side: 'right' | 'left' = 'right') => {
    hideTooltip();
    setIsDocked(true);
    setDockSide(side);

    const targetX = side === 'right' ? DOCKED_RIGHT_X : DOCKED_LEFT_X;
    const clampedY = Math.min(Math.max(currentPos.current.y, MIN_Y), MAX_Y);

    Animated.parallel([
      Animated.spring(dockAnim, {
        toValue: 1,
        tension: 80,
        friction: 9,
        useNativeDriver: false,
      }),
      Animated.spring(pan, {
        toValue: { x: targetX, y: clampedY },
        tension: 80,
        friction: 9,
        useNativeDriver: false,
      }),
    ]).start();
  }, [hideTooltip, dockAnim, pan]);

  // Restore from Edge to Full FAB
  const undockFromEdge = useCallback((side?: 'right' | 'left') => {
    const targetSide = side || dockSide;
    setIsDocked(false);
    const targetX = targetSide === 'right' ? FULL_RIGHT_X : FULL_LEFT_X;
    const clampedY = Math.min(Math.max(currentPos.current.y, MIN_Y), MAX_Y);

    Animated.parallel([
      Animated.spring(dockAnim, {
        toValue: 0,
        tension: 75,
        friction: 9,
        useNativeDriver: false,
      }),
      Animated.spring(pan, {
        toValue: { x: targetX, y: clampedY },
        tension: 75,
        friction: 9,
        useNativeDriver: false,
      }),
    ]).start();
  }, [dockAnim, dockSide, pan]);

  const handlePressFull = useCallback(() => {
    hideTooltip();
    onPress();
  }, [hideTooltip, onPress]);

  const handlePressDocked = useCallback(() => {
    undockFromEdge();
    onPress();
  }, [undockFromEdge, onPress]);

  // Free Dragging Pan Responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.hypot(gestureState.dx, gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        hideTooltip();
        pan.setOffset({
          x: currentPos.current.x,
          y: currentPos.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        const totalDistance = Math.hypot(gestureState.dx, gestureState.dy);

        // 1. Clean Tap (< 6px movement)
        if (totalDistance < 6) {
          if (isDocked) {
            handlePressDocked();
          } else {
            handlePressFull();
          }
          return;
        }

        // 2. Clamp Y position within screen bounds
        let targetY = currentPos.current.y;
        if (targetY < MIN_Y) targetY = MIN_Y;
        if (targetY > MAX_Y) targetY = MAX_Y;

        // 3. If in Docked State:
        if (isDocked) {
          // If pulled inward towards center of screen -> Undock
          if (dockSide === 'right' && gestureState.dx < -25) {
            undockFromEdge('right');
            return;
          }
          if (dockSide === 'left' && gestureState.dx > 25) {
            undockFromEdge('left');
            return;
          }

          // If dragged across to opposite screen edge
          const newSide = currentPos.current.x < SCREEN_WIDTH / 2 ? 'left' : 'right';
          setDockSide(newSide);
          const targetX = newSide === 'right' ? DOCKED_RIGHT_X : DOCKED_LEFT_X;

          // Stay docked at new Y position
          Animated.spring(pan, {
            toValue: { x: targetX, y: targetY },
            tension: 70,
            friction: 9,
            useNativeDriver: false,
          }).start();
          return;
        }

        // 4. If in Full FAB State:
        // Swiped/Flicked fast to Right -> Dock to Right Edge
        if (gestureState.dx > 30 && gestureState.vx > 0.25) {
          dockToEdge('right');
          return;
        }

        // Swiped/Flicked fast to Left -> Dock to Left Edge
        if (gestureState.dx < -30 && gestureState.vx < -0.25) {
          dockToEdge('left');
          return;
        }

        // Released near far right edge (> SCREEN_WIDTH - 70) -> Dock to Right Edge
        if (currentPos.current.x > SCREEN_WIDTH - 75) {
          dockToEdge('right');
          return;
        }

        // Released near far left edge (< 75) -> Dock to Left Edge
        if (currentPos.current.x < 75) {
          dockToEdge('left');
          return;
        }

        // Otherwise: Snap to nearest side as Full Circular FAB
        const targetSide = currentPos.current.x < SCREEN_WIDTH / 2 ? 'left' : 'right';
        const targetX = targetSide === 'right' ? FULL_RIGHT_X : FULL_LEFT_X;

        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          tension: 65,
          friction: 9,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const tooltipTranslateX = tooltipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [currentPos.current.x < SCREEN_WIDTH / 2 ? -12 : 12, 0],
  });

  const tooltipScale = tooltipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const fullFabOpacity = dockAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0.1, 0],
  });

  const dockedTabOpacity = dockAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.6, 1],
  });

  const isLeft = currentPos.current.x < SCREEN_WIDTH / 2;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.movableContainer,
          {
            opacity: routeAnim,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
          },
        ]}
        pointerEvents={isAllowed ? 'box-none' : 'none'}
      >
        {/* ── 1. Auto Tooltip Speech Bubble (Full FAB mode) ── */}
        {showTooltip && !isDocked && (
          <Animated.View
            style={[
              isLeft ? styles.tooltipContainerLeft : styles.tooltipContainerRight,
              {
                opacity: tooltipAnim,
                transform: [{ translateX: tooltipTranslateX }, { scale: tooltipScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.tooltipBubble}
              onPress={handlePressFull}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Hỏi Sporta AI"
            >
              <View style={styles.tooltipIconBadge}>
                <Ionicons name="sparkles" size={13} color={COLORS.secondary} />
              </View>
              <View style={styles.tooltipTextGroup}>
                <View style={styles.tooltipHeaderRow}>
                  <Text style={styles.tooltipTitle} numberOfLines={1}>Sporta AI</Text>
                  <View style={styles.newPill}>
                    <Text style={styles.newPillText}>HOT</Text>
                  </View>
                </View>
                <Text style={styles.tooltipSubtitle} numberOfLines={1}>Vuốt sang 2 mép để thu gọn ✨</Text>
              </View>

              {/* Quick Dock / Minimize Button */}
              <TouchableOpacity
                style={styles.tooltipMinimizeBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  dockToEdge(isLeft ? 'left' : 'right');
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Thu gọn vào mép"
              >
                <Ionicons name="remove-outline" size={16} color={COLORS.outline} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tooltipCloseBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  hideTooltip();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={14} color={COLORS.outline} />
              </TouchableOpacity>
            </TouchableOpacity>
            <View style={isLeft ? styles.tooltipArrowLeft : styles.tooltipArrowRight} />
          </Animated.View>
        )}

        {/* ── 2. Full Floating Action Button ── */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.fabWrapper,
            {
              opacity: fullFabOpacity,
              transform: [{ scale: isDocked ? 0.6 : pulseAnim }],
            },
          ]}
          pointerEvents={isDocked ? 'none' : 'auto'}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={handlePressFull}
            onLongPress={() => dockToEdge(isLeft ? 'left' : 'right')}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Mở trợ lý Sporta AI (kéo thả tự do)"
          >
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={18} color={COLORS.secondary} style={styles.sparkleIcon} />
              <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.onPrimary} />
            </View>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── 3. Ultra-Slim Minimized Edge Docking Tab (Left & Right support) ── */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.dockedTabWrapper,
            {
              opacity: dockedTabOpacity,
            },
          ]}
          pointerEvents={isDocked ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={[
              styles.dockedTab,
              dockSide === 'right' ? styles.dockedTabRight : styles.dockedTabLeft,
            ]}
            onPress={handlePressDocked}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Mở lại Sporta AI (kéo lên xuống để di chuyển)"
          >
            <Ionicons name="sparkles" size={13} color={COLORS.secondary} style={{ marginBottom: 1 }} />
            <Text style={styles.dockedTabText}>AI</Text>
            <View style={styles.dockedGlowDot} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  movableContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  tooltipContainerRight: {
    position: 'absolute',
    right: FAB_SIZE + 10,
    top: 4,
    width: 226,
  },
  tooltipContainerLeft: {
    position: 'absolute',
    left: FAB_SIZE + 10,
    top: 4,
    width: 226,
  },
  tooltipBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.2,
    borderColor: 'rgba(6, 78, 59, 0.14)',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
    width: '100%',
  },
  tooltipIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  tooltipTextGroup: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 4,
  },
  tooltipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tooltipTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  newPill: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
  },
  newPillText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.onSecondary,
    lineHeight: 9,
  },
  tooltipSubtitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  tooltipMinimizeBtn: {
    padding: 3,
    marginRight: 2,
  },
  tooltipCloseBtn: {
    padding: 3,
  },
  tooltipArrowRight: {
    position: 'absolute',
    right: -4,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1.2,
    borderTopWidth: 1.2,
    borderColor: 'rgba(6, 78, 59, 0.14)',
    transform: [{ rotate: '45deg' }],
  },
  tooltipArrowLeft: {
    position: 'absolute',
    left: -4,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 1.2,
    borderBottomWidth: 1.2,
    borderColor: 'rgba(6, 78, 59, 0.14)',
    transform: [{ rotate: '45deg' }],
  },

  /* Full Circular FAB */
  fabWrapper: {
    width: FAB_SIZE,
    height: FAB_SIZE,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary, // Deep Emerald Green
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(254, 208, 27, 0.4)', // Subtle Sporta Gold outline
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.26,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -9,
    right: -9,
  },
  aiBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: COLORS.secondary, // Athletic Yellow / Gold
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: COLORS.surface,
  },
  aiBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.onSecondary,
    lineHeight: 11,
  },

  /* Ultra-Slim Minimized Edge Docking Tab */
  dockedTabWrapper: {
    position: 'absolute',
    top: (FAB_SIZE - DOCKED_HEIGHT) / 2, // Centered vertically relative to drag anchor
    left: 0,
  },
  dockedTab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 77, 64, 0.94)', // Deep Emerald Glassmorphism
    width: DOCKED_WIDTH, // Slim 26px
    height: DOCKED_HEIGHT, // 44px
    borderWidth: 1.2,
    borderColor: 'rgba(254, 208, 27, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 6,
  },
  dockedTabRight: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderRightWidth: 0,
  },
  dockedTabLeft: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderLeftWidth: 0,
  },
  dockedTabText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 0.3,
  },
  dockedGlowDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
    marginTop: 2,
  },
});

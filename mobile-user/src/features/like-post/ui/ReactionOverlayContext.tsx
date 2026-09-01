import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ReactionSelector, ReactionSelectorRef } from './ReactionSelector';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ── Layout Constants ── */
const BAR_WIDTH = 300;
const BAR_HEIGHT = 58;
const ITEM_WIDTH = BAR_WIDTH / 5;
const REACTIONS = ['like', 'love', 'fire', 'muscle', 'trophy'] as const;
type ReactionType = (typeof REACTIONS)[number];

/**
 * SELECTOR_OFFSET controls how far above the touch point the bar appears.
 * 75px places the bar right above the user's thumb for natural sliding.
 */
const SELECTOR_OFFSET = 75;

/* ── Context API ── */
interface OverlayAPI {
  show: (anchorY: number, onSelect: (reaction: ReactionType) => void) => void;
  hide: () => void;
  updateHover: (pageX: number, pageY: number) => void;
  commitSelection: () => void;
  visible: boolean;
}

const noop = () => {};
const OverlayContext = createContext<OverlayAPI>({
  show: noop,
  hide: noop,
  updateHover: noop,
  commitSelection: noop,
  visible: false,
});

export const useReactionOverlay = () => useContext(OverlayContext);

/* ── Provider ── */
export function ReactionOverlayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState({ visible: false, anchorY: 0 });

  const selectorRef = useRef<ReactionSelectorRef>(null);
  const onSelectRef = useRef<((r: ReactionType) => void) | null>(null);
  const anchorYRef = useRef(0);

  const show = useCallback(
    (anchorY: number, onSelect: (r: ReactionType) => void) => {
      anchorYRef.current = anchorY;
      onSelectRef.current = onSelect;
      setState({ visible: true, anchorY });
    },
    [],
  );

  const hide = useCallback(() => {
    onSelectRef.current = null;
    setState({ visible: false, anchorY: 0 });
  }, []);

  /**
   * updateHover — maps absolute screen coordinates to hovered reaction index.
   *
   * Hit area:
   *  • Vertical: barTop − 35  to  barTop + BAR_HEIGHT + 35
   *  • Horizontal: barLeft − 15  to  barLeft + BAR_WIDTH + 15
   *
   * The generous bottom extension (+35px below the bar) means the user
   * only needs to drag ~65px up from the touch point to reach the bar —
   * comfortable for a thumb.
   */
  const updateHover = useCallback((pageX: number, pageY: number) => {
    const barLeft = (SCREEN_WIDTH - BAR_WIDTH) / 2;
    const barTop = Math.max(anchorYRef.current - SELECTOR_OFFSET, 30);

    const inY = pageY >= barTop - 35 && pageY <= barTop + BAR_HEIGHT + 35;
    const inX = pageX >= barLeft - 15 && pageX <= barLeft + BAR_WIDTH + 15;

    let idx: number | null = null;
    if (inY && inX) {
      const relX = Math.max(0, pageX - barLeft);
      idx = Math.min(Math.max(Math.floor(relX / ITEM_WIDTH), 0), 4);
    }

    selectorRef.current?.setHoveredIndex(idx);
  }, []);

  const commitSelection = useCallback(() => {
    const idx = selectorRef.current?.getHoveredIndex();
    if (idx !== null && idx !== undefined && onSelectRef.current) {
      onSelectRef.current(REACTIONS[idx]);
    }
    onSelectRef.current = null;
    setState({ visible: false, anchorY: 0 });
  }, []);

  const api = React.useMemo(
    () => ({ show, hide, updateHover, commitSelection, visible: state.visible }),
    [show, hide, updateHover, commitSelection, state.visible],
  );

  const barTop = Math.max(state.anchorY - SELECTOR_OFFSET, 30);

  return (
    <OverlayContext.Provider value={api}>
      <View style={styles.root}>
        {children}

        {state.visible && (
          <>
            {/* Dim backdrop */}
            <View style={styles.backdrop} pointerEvents="none" />

            {/* Reaction selector */}
            <View
              style={[styles.selectorWrapper, { top: barTop }]}
              pointerEvents="none"
            >
              <ReactionSelector ref={selectorRef} />
            </View>
          </>
        )}
      </View>
    </OverlayContext.Provider>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 9998,
  },
  tooltip: {
    position: 'absolute',
    left: (SCREEN_WIDTH - 210) / 2,
    width: 210,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    zIndex: 10001,
  },
  tooltipText: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 10.5,
    color: '#fff',
    letterSpacing: 0.3,
  },
  selectorWrapper: {
    position: 'absolute',
    left: (SCREEN_WIDTH - BAR_WIDTH) / 2,
    width: BAR_WIDTH,
    zIndex: 10000,
    elevation: 10000,
    overflow: 'visible' as any,
  },
});

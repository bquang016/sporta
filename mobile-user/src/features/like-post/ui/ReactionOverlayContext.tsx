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

/* ── Constants ── */
const BAR_WIDTH = 340;
const BAR_HEIGHT = 68;
const ITEM_WIDTH = BAR_WIDTH / 5; // 68px per reaction
const REACTIONS = ['like', 'love', 'fire', 'muscle', 'trophy'] as const;
type ReactionType = (typeof REACTIONS)[number];

/* ── Context Types ── */
interface OverlayAPI {
  show: (anchorY: number, onSelect: (reaction: ReactionType) => void) => void;
  hide: () => void;
  updateHover: (pageX: number, pageY: number) => void;
  commitSelection: () => void;
}

const noop = () => {};
const OverlayContext = createContext<OverlayAPI>({
  show: noop,
  hide: noop,
  updateHover: noop,
  commitSelection: noop,
});

export const useReactionOverlay = () => useContext(OverlayContext);

/* ── Provider ── */
interface ProviderState {
  visible: boolean;
  anchorY: number;
}

export function ReactionOverlayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ProviderState>({
    visible: false,
    anchorY: 0,
  });

  const selectorRef = useRef<ReactionSelectorRef>(null);
  const onSelectRef = useRef<((reaction: ReactionType) => void) | null>(null);
  const anchorYRef = useRef(0);

  /* show: present the overlay, store callback */
  const show = useCallback(
    (anchorY: number, onSelect: (reaction: ReactionType) => void) => {
      anchorYRef.current = anchorY;
      onSelectRef.current = onSelect;
      setState({ visible: true, anchorY });
    },
    [],
  );

  /* hide: dismiss overlay without selecting */
  const hide = useCallback(() => {
    onSelectRef.current = null;
    setState({ visible: false, anchorY: 0 });
  }, []);

  /* updateHover: called on PanResponder move — calculates which icon is hovered */
  const updateHover = useCallback((pageX: number, pageY: number) => {
    const barLeft = (SCREEN_WIDTH - BAR_WIDTH) / 2;
    const barTop = Math.max(anchorYRef.current - 80, 50);

    // Generous hit area (±40px vertically, ±15px horizontally)
    const inY = pageY >= barTop - 40 && pageY <= barTop + BAR_HEIGHT + 40;
    const inX = pageX >= barLeft - 15 && pageX <= barLeft + BAR_WIDTH + 15;

    let idx: number | null = null;
    if (inY && inX) {
      const relX = Math.max(0, pageX - barLeft);
      idx = Math.min(Math.max(Math.floor(relX / ITEM_WIDTH), 0), 4);
    }

    selectorRef.current?.setHoveredIndex(idx);
  }, []);

  /* commitSelection: select the currently hovered reaction, then hide */
  const commitSelection = useCallback(() => {
    const idx = selectorRef.current?.getHoveredIndex();
    if (idx !== null && idx !== undefined && onSelectRef.current) {
      onSelectRef.current(REACTIONS[idx]);
    }
    onSelectRef.current = null;
    setState({ visible: false, anchorY: 0 });
  }, []);

  // Stable API object (never mutates, uses refs internally)
  const api = useRef<OverlayAPI>({
    show,
    hide,
    updateHover,
    commitSelection,
  }).current;

  return (
    <OverlayContext.Provider value={api}>
      <View style={styles.root}>
        {children}

        {state.visible && (
          <>
            {/* 1. Dim backdrop — pointerEvents="none" so PanResponder keeps receiving */}
            <View style={styles.backdrop} pointerEvents="none" />

            {/* 2. Floating tooltip instruction */}
            <View
              style={[
                styles.tooltip,
                { top: Math.max(state.anchorY - 125, 16) },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.tooltipText}>
                Vuốt để chọn • Buông ra để huỷ
              </Text>
            </View>

            {/* 3. Reaction bar */}
            <View
              style={[
                styles.selectorWrapper,
                { top: Math.max(state.anchorY - 80, 50) },
              ]}
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
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    zIndex: 9998,
  },
  tooltip: {
    position: 'absolute',
    left: (SCREEN_WIDTH - 230) / 2,
    width: 230,
    alignItems: 'center',
    backgroundColor: 'rgba(21, 28, 39, 0.88)',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 14,
    zIndex: 10001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 12,
  },
  tooltipText: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 11,
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  selectorWrapper: {
    position: 'absolute',
    left: (SCREEN_WIDTH - BAR_WIDTH) / 2,
    width: BAR_WIDTH,
    zIndex: 10000,
    elevation: 10000,
  },
});

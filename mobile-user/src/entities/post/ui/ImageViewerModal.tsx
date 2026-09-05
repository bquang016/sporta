import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  SafeAreaView,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerModalProps {
  visible: boolean;
  imageUrls: string[];
  initialIndex: number;
  author?: {
    name: string;
    avatar: string;
    role?: string;
  };
  createdAt?: string;
  content?: string;
  onClose: () => void;
}

export function ImageViewerModal({
  visible,
  imageUrls,
  initialIndex,
  author,
  createdAt,
  content,
  onClose,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Animated values for multi-directional drag (Dismiss image in any direction)
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const backdropOpacity = useRef(new Animated.Value(1)).current;

  // Zoom animation for current image
  const zoomAnim = useRef(new Animated.Value(1)).current;

  const lastTapRef = useRef<number>(0);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  const resetAnimations = () => {
    translateX.setValue(0);
    translateY.setValue(0);
    imageScale.setValue(1);
    backdropOpacity.setValue(1);
    zoomAnim.setValue(1);
  };

  const handleClose = () => {
    resetAnimations();
    setIsCaptionExpanded(false);
    setIsZoomed(false);
    onClose();
  };

  useEffect(() => {
    if (visible) {
      const validIndex = Math.max(0, Math.min(initialIndex || 0, (imageUrls?.length || 1) - 1));
      setCurrentIndex(validIndex);
      resetAnimations();
      setIsCaptionExpanded(false);
      setIsZoomed(false);
    }
  }, [visible, initialIndex, imageUrls]);

  // PanResponder for Multi-Directional Swipe to Dismiss (Image only, Overlay stays put and fades)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isZoomed) return false;
        const distance = Math.hypot(gestureState.dx, gestureState.dy);
        return distance > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);

        const distance = Math.hypot(gestureState.dx, gestureState.dy);
        const scale = Math.max(0.7, 1 - distance / 600);
        // Fade backdrop & bottom overlay rapidly as user pulls image
        const opacity = Math.max(0, 1 - distance / 220);

        imageScale.setValue(scale);
        backdropOpacity.setValue(opacity);
      },
      onPanResponderRelease: (_, gestureState) => {
        const distance = Math.hypot(gestureState.dx, gestureState.dy);
        const velocity = Math.hypot(gestureState.vx, gestureState.vy);

        if (distance > 60 || velocity > 0.4) {
          const targetX = gestureState.dx * 2.2;
          const targetY = gestureState.dy * 2.2;

          Animated.parallel([
            Animated.timing(translateX, {
              toValue: targetX,
              duration: 160,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: targetY,
              duration: 160,
              useNativeDriver: true,
            }),
            Animated.timing(imageScale, {
              toValue: 0.5,
              duration: 160,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 160,
              useNativeDriver: true,
            }),
          ]).start(() => {
            handleClose();
          });
        } else {
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              tension: 100,
              friction: 10,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              tension: 100,
              friction: 10,
              useNativeDriver: true,
            }),
            Animated.spring(imageScale, {
              toValue: 1,
              tension: 100,
              friction: 10,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 120,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        resetAnimations();
      },
    })
  ).current;

  // Single & Double Tap Handler (Cross-platform double tap zoom)
  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (isZoomed) {
        Animated.spring(zoomAnim, {
          toValue: 1,
          tension: 120,
          friction: 9,
          useNativeDriver: true,
        }).start(() => setIsZoomed(false));
      } else {
        setIsZoomed(true);
        Animated.spring(zoomAnim, {
          toValue: 2.2,
          tension: 120,
          friction: 9,
          useNativeDriver: true,
        }).start();
      }
    } else {
      lastTapRef.current = now;
    }
  };

  if (!visible || !imageUrls || imageUrls.length === 0) return null;

  const validInitialIndex = Math.max(0, Math.min(initialIndex || 0, imageUrls.length - 1));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" animated />

      {/* Dark Animated Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Draggable Image Layer ONLY */}
      <Animated.View
        style={[
          styles.imageContainerLayer,
          {
            transform: [
              { translateX },
              { translateY },
              { scale: imageScale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <FlatList
          ref={flatListRef}
          data={imageUrls}
          horizontal
          pagingEnabled
          scrollEnabled={!isZoomed}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={imageUrls.length}
          keyExtractor={(item, index) => `img-viewer-${index}-${item.slice(-15)}`}
          onLayout={() => {
            if (validInitialIndex > 0 && flatListRef.current) {
              flatListRef.current.scrollToOffset({
                offset: validInitialIndex * SCREEN_WIDTH,
                animated: false,
              });
            }
          }}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            if (newIndex >= 0 && newIndex < imageUrls.length) {
              setCurrentIndex(newIndex);
              setIsZoomed(false);
              zoomAnim.setValue(1);
            }
          }}
          renderItem={({ item, index }) => (
            <TouchableWithoutFeedback onPress={handleTap}>
              <View style={styles.slide}>
                <ScrollView
                  maximumZoomScale={3.5}
                  minimumZoomScale={1}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  centerContent
                  pinchGestureEnabled
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                >
                  <Animated.Image
                    source={{ uri: item }}
                    style={[
                      styles.image,
                      index === currentIndex && {
                        transform: [{ scale: zoomAnim }],
                      },
                    ]}
                    resizeMode="contain"
                  />
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          )}
        />
      </Animated.View>

      {/* Fixed Bottom Overlay Layer (Fades out when pulling image, does NOT drag with image) */}
      {(author || content) && (
        <Animated.View
          style={[
            styles.bottomOverlayWrapper,
            {
              opacity: backdropOpacity,
            },
          ]}
          pointerEvents="box-none"
        >
          <SafeAreaView pointerEvents="box-none">
            <View style={styles.bottomOverlayCard}>
              {author && (
                <View style={styles.authorRow}>
                  <Image source={{ uri: author.avatar }} style={styles.authorAvatar} />
                  <View style={styles.authorTextCol}>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.authorName}>{author.name}</Text>
                      {author.role === 'owner' && (
                        <View style={styles.ownerBadge}>
                          <Text style={styles.ownerBadgeText}>Chủ Sân</Text>
                        </View>
                      )}
                    </View>
                    {createdAt && (
                      <Text style={styles.timeText}>{formatTime(createdAt)}</Text>
                    )}
                  </View>
                </View>
              )}

              {content ? (
                <View style={styles.captionContainer}>
                  <Text
                    style={styles.captionText}
                    numberOfLines={isCaptionExpanded ? undefined : 2}
                  >
                    {content}
                  </Text>
                  {content.length > 80 && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsCaptionExpanded(!isCaptionExpanded)}
                      style={styles.expandBtn}
                    >
                      <Text style={styles.expandBtnText}>
                        {isCaptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
          </SafeAreaView>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  imageContainerLayer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  scrollContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.82,
  },

  // Bottom Overlay Card Styles (Positioned at root level so it fades out without moving)
  bottomOverlayWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  bottomOverlayCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#333333',
  },
  authorTextCol: {
    justifyContent: 'center',
    gap: 2,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ownerBadge: {
    backgroundColor: '#064E3B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  ownerBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  timeText: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  captionContainer: {
    gap: 4,
  },
  captionText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 13.5,
    color: '#F3F4F6',
    lineHeight: 19,
  },
  expandBtn: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 2,
  },
  expandBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: '#34D399',
    fontWeight: '700',
  },
});

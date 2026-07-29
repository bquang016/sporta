import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ClubInfoData } from '../model/post.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ClubInfoModalProps {
  visible: boolean;
  clubInfo: ClubInfoData | null;
  onClose: () => void;
  onJoinClub?: (clubId: string) => void;
  onViewClubPage?: (clubId: string) => void;
}

export function ClubInfoModal({
  visible,
  clubInfo,
  onClose,
  onJoinClub,
  onViewClubPage,
}: ClubInfoModalProps) {
  if (!visible || !clubInfo) return null;

  return (
    <ClubInfoModalContent
      visible={visible}
      clubInfo={clubInfo}
      onClose={onClose}
      onJoinClub={onJoinClub}
      onViewClubPage={onViewClubPage}
    />
  );
}

function ClubInfoModalContent({
  visible,
  clubInfo,
  onClose,
  onJoinClub,
  onViewClubPage,
}: {
  visible: boolean;
  clubInfo: ClubInfoData;
  onClose: () => void;
  onJoinClub?: (clubId: string) => void;
  onViewClubPage?: (clubId: string) => void;
}) {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const isAtTopRef = useRef(true);

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      backdropAnim.setValue(0);
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, backdropAnim]);

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const resetPosition = () => {
    Animated.spring(translateY, {
      toValue: 0,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            isAtTopRef.current &&
            gestureState.dy > 6 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
          );
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return (
            isAtTopRef.current &&
            gestureState.dy > 6 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
          );
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120 || gestureState.vy > 0.6) {
            animateClose();
          } else {
            resetPosition();
          }
        },
      }),
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose}>
      <View style={styles.modalRoot}>
        {/* Animated Fade Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        {/* Animated Sheet */}
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle Indicator */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              isAtTopRef.current = e.nativeEvent.contentOffset.y <= 2;
            }}
            scrollEventThrottle={16}
          >
            {/* Banner Cover */}
            <View style={styles.bannerContainer}>
              <Image
                source={{
                  uri:
                    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
                }}
                style={styles.bannerImage}
              />
              <View style={styles.clubAvatarWrapper}>
                <Image source={{ uri: clubInfo.avatarUrl }} style={styles.clubAvatar} />
              </View>
            </View>

            {/* Main Club Info */}
            <View style={styles.contentContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.clubName}>{clubInfo.name}</Text>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              </View>

              <Text style={styles.clubHandle}>@club_{clubInfo.id}</Text>

              <Text style={styles.description}>
                Cộng đồng thể thao giao lưu, kết nối các tay vợt đam mê rèn luyện sức khỏe, thi đấu giải trí hàng tuần tại Hà Nội.
              </Text>

              {/* Stats Bar */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>248</Text>
                  <Text style={styles.statLabel}>Thành viên</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>15+</Text>
                  <Text style={styles.statLabel}>Trận / Tuần</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>4.9 ★</Text>
                  <Text style={styles.statLabel}>Đánh giá</Text>
                </View>
              </View>

              {/* Meta Tags */}
              <View style={styles.tagsRow}>
                <View style={styles.tagChip}>
                  <Ionicons name="location-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.tagChipText}>Cầu Giấy, Hà Nội</Text>
                </View>
                <View style={styles.tagChip}>
                  <MaterialCommunityIcons name="trophy-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.tagChipText}>CLB Chính Thức</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (onJoinClub) onJoinClub(clubInfo.id);
                    animateClose();
                  }}
                >
                  <Ionicons name="person-add" size={16} color="#FFFFFF" />
                  <Text style={styles.btnPrimaryText}>Tham gia CLB</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (onViewClubPage) onViewClubPage(clubInfo.id);
                    animateClose();
                  }}
                >
                  <Text style={styles.btnSecondaryText}>Xem trang CLB</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.78,
    paddingBottom: SPACING.lg,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: COLORS.onSurfaceVariant,
    opacity: 0.3,
  },
  bannerContainer: {
    height: 120,
    position: 'relative',
    backgroundColor: COLORS.surfaceDim,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clubAvatarWrapper: {
    position: 'absolute',
    bottom: -24,
    left: SPACING.marginMobile,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surface,
  },
  clubAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  contentContainer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 32,
    paddingBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubName: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  clubHandle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 2,
  },
  description: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.onSurfaceVariant,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 16,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  tagChipText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.lg,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  btnSecondaryText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
});

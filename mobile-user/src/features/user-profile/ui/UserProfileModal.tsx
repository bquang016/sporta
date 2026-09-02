import React, { useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserProfileHeader } from './UserProfileHeader';
import { UserSportsCard } from './UserSportsCard';
import { UserPhysicalCard } from './UserPhysicalCard';
import { UserClubsCard } from './UserClubsCard';
import { COLORS } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UserProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
}

export const UserProfileModal = React.memo(({
  visible,
  userId,
  onClose,
}: UserProfileModalProps) => {
  if (!visible || !userId) return null;

  return <UserProfileModalContent userId={userId} onClose={onClose} visible={visible} />;
});

function UserProfileModalContent({
  userId,
  onClose,
  visible,
}: {
  userId: string;
  onClose: () => void;
  visible: boolean;
}) {
  const router = useRouter();
  const {
    profile,
    isLoading,
    genderLabel,
    joinedYearLabel,
  } = useUserProfile(userId);

  const translateY = useRef(new Animated.Value(0)).current;
  const isAtTopRef = useRef(true);
  const startYRef = useRef(0);
  const isDraggingModalRef = useRef(false);

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      isAtTopRef.current = true;
    }
  }, [visible, translateY]);

  const animateClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
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

  const handlePanResponder = useMemo(
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
          if (gestureState.dy > 70 || gestureState.vy > 0.35) {
            animateClose();
          } else {
            resetPosition();
          }
        },
        onPanResponderTerminate: () => {
          resetPosition();
        },
      }),
    [translateY]
  );

  const handleTouchStart = (e: any) => {
    const pageY = e.nativeEvent?.pageY || 0;
    startYRef.current = pageY;
    isDraggingModalRef.current = false;
  };

  const handleTouchMove = (e: any) => {
    const currentY = e.nativeEvent?.pageY || 0;
    const diffY = currentY - startYRef.current;

    if (isAtTopRef.current && diffY > 6) {
      isDraggingModalRef.current = true;
      translateY.setValue(diffY);
    }
  };

  const handleTouchEnd = (e: any) => {
    if (isDraggingModalRef.current) {
      const currentY = e.nativeEvent?.pageY || 0;
      const diffY = currentY - startYRef.current;

      if (diffY > 70) {
        animateClose();
      } else {
        resetPosition();
      }
      isDraggingModalRef.current = false;
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    isAtTopRef.current = y <= 2;
  };

  const handleClubPress = (club: any) => {
    onClose();
    if (club.clubId) {
      router.push(`/club-detail-explore/${club.clubId}` as any);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={animateClose}
    >
      <View style={styles.overlay}>
        {/* Top Backdrop overlay - tap to dismiss */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={animateClose} />

        {/* Animated Floating Bottom Sheet Container */}
        <Animated.View
          {...handlePanResponder.panHandlers}
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Minimalist Top Handle Bar */}
            <View
              style={styles.topDragArea}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <View style={styles.dragHandle} />
            </View>

            {isLoading || !profile ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải hồ sơ người chơi...</Text>
              </View>
            ) : (
              /* Scrollable Profile Content with Universal Touch Handlers */
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {/* 1. Profile Header (Real name, avatar, gender, joined year, stats) */}
                <UserProfileHeader
                  profile={profile}
                  genderLabel={genderLabel}
                  joinedYearLabel={joinedYearLabel}
                />

                {profile.privateMode ? (
                  <View style={styles.privateModeContainer}>
                    <Ionicons name="lock-closed" size={48} color="#94A3B8" />
                    <Text style={styles.privateModeTitle}>Tài khoản ẩn</Text>
                    <Text style={styles.privateModeDesc}>
                      Các thông tin chi tiết đã được bảo mật bởi người dùng.
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* 2. Sports Summary Cards (Based on real booking count) */}
                    <UserSportsCard sports={profile.sports} />

                    {/* 3. Physical Stats Card (Height, Weight with 'Chưa cập nhật' fallback) */}
                    <UserPhysicalCard
                      height={profile.height}
                      weight={profile.weight}
                    />

                    {/* 4. Joined Clubs Card (2 outside, expand all, navigation on click) */}
                    <UserClubsCard
                      clubs={profile.joinedClubs}
                      onClubPress={handleClubPress}
                    />
                  </>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    height: '10%',
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topDragArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  privateModeContainer: {
    margin: 16,
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 40,
    gap: 8,
  },
  privateModeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  privateModeDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

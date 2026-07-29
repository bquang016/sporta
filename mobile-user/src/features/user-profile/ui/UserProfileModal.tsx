import React, { useRef, useMemo, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserProfileHeader } from './UserProfileHeader';
import { UserSportsCard } from './UserSportsCard';
import { SportDetailModal } from './SportDetailModal';
import { UserPhysicalCard } from './UserPhysicalCard';
import { UserClubsCard } from './UserClubsCard';
import { UnfriendConfirmModal } from './UnfriendConfirmModal';
import { InviteOptionsModal } from './InviteOptionsModal';
import { InviteClubModal } from './InviteClubModal';
import { InviteMatchModal } from './InviteMatchModal';
import { MockChatModal } from './MockChatModal';
import { CustomConfirmModal } from '../../../shared/ui/CustomConfirmModal';
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
  const {
    profile,
    friendStatus,
    unfriendModalVisible,
    inviteOptionsModalVisible,
    inviteClubModalVisible,
    inviteMatchModalVisible,
    chatModalVisible,
    selectedSportDetail,
    pendingMatchInvite,
    genderAgeLabel,
    handleToggleFriend,
    confirmUnfriend,
    cancelUnfriend,
    openInviteOptions,
    closeInviteOptions,
    openInviteClub,
    closeInviteClub,
    openInviteMatch,
    closeInviteMatch,
    openSportDetail,
    closeSportDetail,
    sendMatchInviteToChat,
    openChat,
    closeChat,
  } = useUserProfile(userId);

  // Custom Confirm Modal state (Replaces OS Alert.alert)
  const [confirmModalData, setConfirmModalData] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

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
    setConfirmModalData({
      visible: true,
      title: club.name,
      message: `Chức vụ: ${club.roleInClub}\nSố thành viên: ${club.memberCount} người\nMôn: ${club.sportName}`,
    });
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

            {/* Scrollable Profile Content with Universal Touch Handlers */}
            <ScrollView
              style={styles.scrollContainer}
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
              {/* 1. Integrated Profile Header */}
              <UserProfileHeader
                profile={profile}
                genderAgeLabel={genderAgeLabel}
                friendStatus={friendStatus}
                onToggleFriend={handleToggleFriend}
                onOpenInviteOptions={openInviteOptions}
                onOpenChat={openChat}
              />

              {/* 2. Sports Summary Cards (Bấm mở SportDetailModal) */}
              <UserSportsCard
                sportsProfiles={profile.sportsProfiles}
                onSelectSport={openSportDetail}
              />

              {/* 3. Physical Stats Card */}
              <UserPhysicalCard profile={profile} />

              {/* 4. Joined Clubs Card */}
              <UserClubsCard
                clubs={profile.joinedClubs}
                onClubPress={handleClubPress}
              />

              {/* Bottom Spacing */}
              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>

        {/* ── Sub Modals ── */}
        <SportDetailModal
          visible={!!selectedSportDetail}
          sport={selectedSportDetail}
          onClose={closeSportDetail}
        />

        <UnfriendConfirmModal
          visible={unfriendModalVisible}
          userName={profile.fullName}
          onConfirm={confirmUnfriend}
          onCancel={cancelUnfriend}
        />

        <InviteOptionsModal
          visible={inviteOptionsModalVisible}
          userName={profile.fullName}
          onSelectInviteClub={openInviteClub}
          onSelectInviteMatch={openInviteMatch}
          onClose={closeInviteOptions}
        />

        <InviteClubModal
          visible={inviteClubModalVisible}
          profile={profile}
          onClose={closeInviteClub}
        />

        <InviteMatchModal
          visible={inviteMatchModalVisible}
          profile={profile}
          onClose={closeInviteMatch}
          onSendInviteToChat={sendMatchInviteToChat}
        />

        <MockChatModal
          visible={chatModalVisible}
          profile={profile}
          initialMatchInvite={pendingMatchInvite}
          onClose={closeChat}
        />

        <CustomConfirmModal
          visible={confirmModalData.visible}
          title={confirmModalData.title}
          message={confirmModalData.message}
          type="info"
          confirmText="Đã hiểu"
          onConfirm={() => setConfirmModalData((prev) => ({ ...prev, visible: false }))}
        />
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
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.surface,
  },
  topDragArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: COLORS.surface,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

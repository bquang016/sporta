import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PublicUserProfile } from '../../../entities/user';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface InviteClubModalProps {
  visible: boolean;
  profile: PublicUserProfile;
  onClose: () => void;
}

export const InviteClubModal = React.memo(({
  visible,
  profile,
  onClose,
}: InviteClubModalProps) => {
  const MY_CLUBS = [
    {
      id: 'c-1',
      name: 'Pickleball Cầu Giấy Official',
      sport: 'Pickleball',
      logo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=80',
      members: 142,
    },
    {
      id: 'c-2',
      name: 'CLB Bóng Đá Phủi Hà Nội',
      sport: 'Bóng đá',
      logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
      members: 86,
    },
    {
      id: 'c-3',
      name: 'Sporta Badminton Club',
      sport: 'Cầu lông',
      logo: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=150&auto=format&fit=crop&q=80',
      members: 64,
    },
  ];

  const [selectedClubId, setSelectedClubId] = useState(MY_CLUBS[0].id);

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      backdropAnim.setValue(0);
      sheetAnim.setValue(400);

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropAnim, sheetAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetAnim, {
        toValue: 400,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleSendInvite = () => {
    const club = MY_CLUBS.find((c) => c.id === selectedClubId);
    handleClose();
    setTimeout(() => {
      Alert.alert(
        'Gửi lời mời thành công! 📣',
        `Đã gửi lời mời tham gia câu lạc bộ "${club?.name}" tới ${profile.fullName}.`
      );
    }, 200);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Animated Fade-In Dark Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        {/* Animated Slide-Up Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY: sheetAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Mời vào câu lạc bộ</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Ionicons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <Text style={styles.subTitle}>
                Chọn một trong các câu lạc bộ của bạn để gửi lời mời cho{' '}
                <Text style={{ fontWeight: '700' }}>{profile.fullName}</Text>:
              </Text>

              <View style={styles.clubsList}>
                {MY_CLUBS.map((club) => {
                  const isSelected = selectedClubId === club.id;
                  return (
                    <TouchableOpacity
                      key={club.id}
                      style={[styles.clubCard, isSelected && styles.clubCardSelected]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedClubId(club.id)}
                    >
                      <Image source={{ uri: club.logo }} style={styles.clubLogo} />
                      <View style={styles.clubTextGroup}>
                        <Text style={styles.clubName}>{club.name}</Text>
                        <Text style={styles.clubMeta}>
                          {club.sport} • {club.members} thành viên
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={isSelected ? COLORS.primary : COLORS.outline}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.85}
                onPress={handleSendInvite}
              >
                <Text style={styles.submitBtnText}>Gửi lời mời gia nhập</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '75%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
  },
  safeArea: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: SPACING.md,
  },
  subTitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md,
  },
  clubsList: {
    gap: SPACING.sm,
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainerHigh,
    gap: SPACING.sm,
  },
  clubCardSelected: {
    backgroundColor: COLORS.primaryOpacity08,
    borderColor: COLORS.primary,
  },
  clubLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceDim,
  },
  clubTextGroup: {
    flex: 1,
    gap: 2,
  },
  clubName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  clubMeta: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PublicUserProfile } from '../../../entities/user';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface InviteMatchModalProps {
  visible: boolean;
  profile: PublicUserProfile;
  onClose: () => void;
  onSendInviteToChat: (sportName: string, timeSlot: string) => void;
}

export const InviteMatchModal = React.memo(({
  visible,
  profile,
  onClose,
  onSendInviteToChat,
}: InviteMatchModalProps) => {
  const [selectedSport, setSelectedSport] = useState('Pickleball');
  const [selectedSlot, setSelectedSlot] = useState('19:00 - 20:30 • Tối nay');

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      backdropAnim.setValue(0);
      sheetAnim.setValue(500);

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
        toValue: 500,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const SPORTS = [
    { name: 'Pickleball', icon: 'tennisball-outline' },
    { name: 'Bóng đá', icon: 'football-outline' },
    { name: 'Cầu lông', icon: 'fitness-outline' },
    { name: 'Bóng rổ', icon: 'basketball-outline' },
  ];

  const TIME_SLOTS = [
    '17:30 - 19:00 • Chiều nay',
    '19:00 - 20:30 • Tối nay',
    '20:30 - 22:00 • Tối nay',
    '08:00 - 09:30 • Sáng mai',
    '17:30 - 19:00 • Chiều mai',
  ];

  const handleSendInvite = () => {
    handleClose();
    setTimeout(() => {
      onSendInviteToChat(selectedSport, selectedSlot);
    }, 200);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent={true} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Animated Fade-In Dark Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        {/* Animated Slide-Up Bottom Sheet */}
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: sheetAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Mời {profile.fullName} tham gia trận</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Ionicons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* 1. Select Sport */}
              <Text style={styles.sectionLabel}>BỘ MÔN THỂ THAO</Text>
              <View style={styles.sportGrid}>
                {SPORTS.map((sport) => {
                  const active = selectedSport === sport.name;
                  return (
                    <TouchableOpacity
                      key={sport.name}
                      style={[styles.sportCard, active && styles.sportCardActive]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedSport(sport.name)}
                    >
                      <Ionicons
                        name={sport.icon as any}
                        size={24}
                        color={active ? COLORS.primary : COLORS.grayText}
                      />
                      <Text style={[styles.sportCardText, active && styles.sportCardTextActive]}>
                        {sport.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 2. Select Custom Time Slot */}
              <Text style={styles.sectionLabel}>KHUNG GIỜ THI ĐẤU (TỰ CHỌN)</Text>
              <View style={styles.listSection}>
                {TIME_SLOTS.map((slot) => {
                  const active = selectedSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.listItem, active && styles.listItemActive]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={active ? COLORS.primary : COLORS.grayText}
                      />
                      <Text style={[styles.listItemText, active && styles.listItemTextActive]}>
                        {slot}
                      </Text>
                      {active && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Footer Submit Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.85}
                onPress={handleSendInvite}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Gửi lời mời vào khung Chat</Text>
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
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
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
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerTitle: {
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
  sectionLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
    letterSpacing: 0.5,
    fontWeight: '700',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sportCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 10,
  },
  sportCardActive: {
    backgroundColor: COLORS.primaryOpacity08,
    borderColor: COLORS.primary,
  },
  sportCardText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  sportCardTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  listSection: {
    gap: 8,
    marginBottom: SPACING.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: 10,
  },
  listItemActive: {
    backgroundColor: COLORS.primaryOpacity08,
    borderColor: COLORS.primary,
  },
  listItemText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
    flex: 1,
  },
  listItemTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: COLORS.onSecondary,
    fontWeight: '800',
  },
});

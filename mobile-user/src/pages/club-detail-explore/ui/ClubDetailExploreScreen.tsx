import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Platform,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Badge, Avatar } from '../../../shared/ui';
import { useClubs, getDefaultCover, getDefaultAvatar } from '../../../entities/club';

const getSportIcon = (sportName?: string) => {
  switch (sportName?.toLowerCase()) {
    case 'bóng đá':
      return 'sports-soccer';
    case 'cầu lông':
      return 'sports-tennis';
    case 'pickleball':
      return 'sports-tennis';
    case 'bóng rổ':
      return 'sports-basketball';
    case 'tennis':
      return 'sports-baseball';
    default:
      return 'sports';
  }
};

export function ClubDetailExploreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clubs, joinedClubs, joinClub } = useClubs();

  // Custom Modal Alert State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalIcon, setModalIcon] = useState<'check-circle' | 'mail-outline'>('check-circle');

  // Require Auth Modal State
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [joining, setJoining] = useState(false);

  const club =
    clubs.find((c) => String(c.id) === String(id)) ||
    joinedClubs.find((c) => String(c.id) === String(id));

  if (!club) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết câu lạc bộ</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Không tìm thấy câu lạc bộ này</Text>
          <Button title="Quay lại" onPress={() => router.back()} style={styles.errorBtn} />
        </View>
      </SafeAreaView>
    );
  }

  const coverUrl = getDefaultCover(club.sport, club.coverImage);
  const avatarUrl = getDefaultAvatar(club.sport, club.avatarImage);
  const memberRatio = Math.min(1, (club.members || 1) / (club.maxMembers || 30));

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Khám phá câu lạc bộ thể thao "${club.name}" trên Sporta!`,
        url: `https://sporta.vn/clubs/${club.id}`,
      });
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  const handleJoinPress = async () => {
    let token = '';
    if (Platform.OS === 'web') {
      token = localStorage.getItem('accessToken') || '';
    } else {
      token = (await SecureStore.getItemAsync('accessToken')) || '';
    }

    if (!token) {
      setIsAuthModalVisible(true);
      return;
    }

    setJoining(true);
    try {
      await joinClub(club.id);
      if (club.isPrivate) {
        setModalTitle('Đã gửi yêu cầu');
        setModalMessage(`Đã gửi yêu cầu tham gia câu lạc bộ "${club.name}" tới Trưởng CLB.`);
        setModalIcon('mail-outline');
      } else {
        setModalTitle('Tham gia thành công');
        setModalMessage(`Bạn đã chính thức gia nhập câu lạc bộ "${club.name}"!`);
        setModalIcon('check-circle');
      }
      setIsModalVisible(true);
    } catch (error: any) {
      setModalTitle('Không thể tham gia');
      setModalMessage(error.message || 'Đã xảy ra lỗi khi tham gia câu lạc bộ.');
      setModalIcon('mail-outline');
      setIsModalVisible(true);
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Main Scrollable Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. Immersive Hero Cover Banner */}
        <View style={styles.heroCoverBox}>
          <Image source={{ uri: coverUrl }} style={styles.heroCoverImg} />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.85)']}
            style={styles.heroCoverGradient}
          />

          {/* Floating Top Nav Actions */}
          <SafeAreaView style={styles.heroNavRow} edges={['top', 'left', 'right']}>
            <TouchableOpacity
              style={styles.navRoundBtn}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRoundBtn}
              activeOpacity={0.8}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Sport & Privacy Badges inside Banner */}
          <View style={styles.heroBadgesRow}>
            <View style={styles.sportBadgePill}>
              <MaterialIcons
                name={getSportIcon(club.sport) as any}
                size={13}
                color={COLORS.white}
              />
              <Text style={styles.sportBadgePillText}>{club.sport}</Text>
            </View>

            <View style={styles.privacyBadgePill}>
              <MaterialIcons
                name={club.isPrivate ? 'lock' : 'public'}
                size={13}
                color={COLORS.white}
              />
              <Text style={styles.privacyBadgePillText}>
                {club.isPrivate ? 'Riêng tư' : 'Công khai'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Overlapping Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              <Avatar
                size={84}
                source={avatarUrl}
                fallbackType="club"
                style={styles.avatar}
              />
            </View>

            <View style={styles.quickActivityBadge}>
              <MaterialIcons name="bolt" size={15} color="#D97706" />
              <Text style={styles.quickActivityText}>
                {club.activityLevel || 'Hoạt động sôi nổi'}
              </Text>
            </View>
          </View>

          {/* Club Name & Location */}
          <View style={styles.titleCol}>
            <Text style={styles.clubName}>{club.name}</Text>
            <View style={styles.areaRow}>
              <MaterialIcons name="location-on" size={15} color={COLORS.primary} />
              <Text style={styles.areaText}>{club.area || 'Toàn quốc'}</Text>
            </View>
          </View>

          {/* 3-Column Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <MaterialIcons name="groups" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>
                {club.members}/{club.maxMembers}
              </Text>
              <Text style={styles.statLabel}>Thành viên</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <MaterialIcons name="military-tech" size={20} color="#D97706" />
              <Text style={styles.statValue}>{club.averageElo || 1200}</Text>
              <Text style={styles.statLabel}>Elo trung bình</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <MaterialIcons name="verified" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>Đang mở</Text>
              <Text style={styles.statLabel}>Tuyển hội viên</Text>
            </View>
          </View>

          {/* Member Fill Progress Bar */}
          <View style={styles.memberProgressBarCard}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressLabel}>Độ lấp đầy thành viên</Text>
              <Text style={styles.progressValue}>
                {Math.round(memberRatio * 100)}% ({club.members}/{club.maxMembers})
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(memberRatio * 100)}%` },
                ]}
              />
            </View>
          </View>

          {/* 3. Description / Giới thiệu */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeaderRow}>
              <MaterialIcons name="article" size={18} color={COLORS.primary} />
              <Text style={styles.cardSectionTitle}>Giới thiệu câu lạc bộ</Text>
            </View>
            <Text style={styles.descriptionText}>
              {club.description ||
                'Câu lạc bộ thể thao năng động, thường xuyên tổ chức ghép kèo, giao lưu cọ xát và rèn luyện thể lực cuối tuần.'}
            </Text>
          </View>

          {/* 4. Leadership / Ban Quản Trị */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeaderRow}>
              <MaterialIcons name="admin-panel-settings" size={18} color={COLORS.primary} />
              <Text style={styles.cardSectionTitle}>Ban điều hành</Text>
            </View>
            <View style={styles.leaderRow}>
              <View style={styles.leaderAvatarCircle}>
                <MaterialIcons name="person" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.leaderInfoCol}>
                <Text style={styles.leaderName}>{club.creatorName || 'Chủ nhiệm CLB'}</Text>
                <View style={styles.leaderBadgePill}>
                  <MaterialIcons name="stars" size={12} color="#B45309" />
                  <Text style={styles.leaderBadgeText}>Trưởng câu lạc bộ</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          title={
            joining
              ? 'Đang xử lý...'
              : club.isPrivate
              ? 'Gửi yêu cầu tham gia'
              : 'Tham gia câu lạc bộ'
          }
          icon={club.isPrivate ? 'mail-outline' : 'person-add'}
          style={styles.actionBtn}
          onPress={handleJoinPress}
          disabled={joining}
          loading={joining}
        />
      </View>

      {/* Custom Alert Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsModalVisible(false);
          router.back();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalContent}>
            <MaterialIcons
              name={modalIcon}
              size={48}
              color={modalIcon === 'check-circle' ? COLORS.primary : COLORS.secondary}
              style={styles.modalAlertIcon}
            />
            <Text style={styles.alertModalTitle}>{modalTitle}</Text>
            <Text style={styles.alertModalMessage}>{modalMessage}</Text>
            <Button
              variant="primary"
              title="Đóng"
              style={styles.alertModalBtn}
              onPress={() => {
                setIsModalVisible(false);
                router.back();
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Require Auth Modal */}
      <Modal
        visible={isAuthModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAuthModalVisible(false)}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalContent}>
            <View style={styles.alertModalIconCircle}>
              <MaterialIcons name="lock-outline" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.alertModalTitle}>Yêu cầu đăng nhập</Text>
            <Text style={styles.alertModalMessage}>
              Bạn cần đăng nhập tài khoản để tham gia câu lạc bộ này.
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Hủy"
                variant="outline"
                style={styles.modalCancelBtn}
                onPress={() => setIsAuthModalVisible(false)}
              />
              <Button
                title="Đăng nhập ngay"
                variant="primary"
                style={styles.modalConfirmBtn}
                onPress={() => {
                  setIsAuthModalVisible(false);
                  router.push('/(auth)/login');
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  heroCoverBox: {
    height: 220,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  heroCoverImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroCoverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroNavRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.xs,
    zIndex: 20,
  },
  navRoundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroBadgesRow: {
    position: 'absolute',
    bottom: 48,
    right: SPACING.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sportBadgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  privacyBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  privacyBadgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileSection: {
    paddingHorizontal: SPACING.marginMobile,
    marginTop: -42,
    zIndex: 10,
    gap: SPACING.md,
    paddingBottom: 110,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  avatarWrapper: {
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  avatar: {
    borderWidth: 3.5,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceContainer,
  },
  quickActivityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 4,
  },
  quickActivityText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
  titleCol: {
    gap: 3,
  },
  clubName: {
    ...TYPOGRAPHY.headlineLgMobile,
    fontSize: 22,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: '#0F172A',
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  areaText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  memberProgressBarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  leaderAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  leaderInfoCol: {
    gap: 2,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  leaderBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  leaderBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.base,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  errorBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  alertModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  alertModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  alertModalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  modalAlertIcon: {
    marginBottom: SPACING.md,
  },
  alertModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertModalMessage: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13.5,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  alertModalBtn: {
    width: '100%',
    height: 44,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
  },
  modalConfirmBtn: {
    flex: 1.2,
  },
});

export default ClubDetailExploreScreen;

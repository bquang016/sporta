import React, { useEffect, useRef, useMemo, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ClubInfoData } from '../model/post.types';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { getClubByIdApi, getClubMembersApi, joinClubApi } from '../../../shared/api/clubs';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.84);

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
  const router = useRouter();
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const [clubDetail, setClubDetail] = useState<any>(null);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const rawId = String(clubInfo.id).replace(/\D/g, '');
    const numericId = parseInt(rawId, 10);

    if (!isNaN(numericId) && numericId > 0) {
      setLoading(true);
      Promise.all([
        getClubByIdApi(numericId).catch(() => null),
        getClubMembersApi(numericId).catch(() => []),
      ]).then(([detail, members]) => {
        if (isMounted) {
          if (detail) {
            setClubDetail(detail);
            if (
              detail.userStatus === 'MEMBER' ||
              detail.userStatus === 'ADMIN' ||
              detail.userStatus === 'SUB_LEADER'
            ) {
              setIsJoined(true);
            }
          }
          if (Array.isArray(members)) {
            setMembersList(members);
          }
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [clubInfo.id]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_HEIGHT);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
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

  // PanResponder on Top Anchor Area for 100% smooth downward swipe to dismiss
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 2 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return gestureState.dy > 2 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 60 || gestureState.vy > 0.3) {
            animateClose();
          } else {
            resetPosition();
          }
        },
        onPanResponderTerminate: () => {
          resetPosition();
        },
      }),
    [],
  );

  const displayAvatar =
    clubDetail?.avatarImage ||
    clubDetail?.avatarUrl ||
    clubInfo.avatarUrl ||
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300';

  const displayCover =
    clubDetail?.coverImage ||
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80';

  const displayName = clubDetail?.name || clubInfo.name;
  const displayDescription =
    clubDetail?.description ||
    'Cộng đồng thể thao giao lưu, kết nối các thành viên đam mê rèn luyện sức khỏe, thi đấu giải trí hàng tuần.';
  const displayArea = clubDetail?.area || 'Cầu Giấy, Hà Nội';
  const displaySport = clubDetail?.sport || clubDetail?.sportName || 'Bóng đá';
  const displayActivity = clubDetail?.activityLevel || 'Sôi nổi hàng tuần';
  const isPrivate = clubDetail?.isPrivate === true;
  const maxMembers = clubDetail?.maxMembers || 50;
  const currentMembers = membersList.length || clubDetail?.members || 1;
  const elo = clubDetail?.elo || 1000;
  const crp = clubDetail?.crp != null ? clubDetail.crp : 100;
  const rankedWins = clubDetail?.rankedWins || 0;
  const creatorName = clubDetail?.creatorName || 'Bùi Đăng Quang';
  const userStatus = clubDetail?.userStatus || (isJoined ? 'MEMBER' : 'NOT_MEMBER');

  // Leadership preview
  const leaders = useMemo(() => {
    const admins = membersList.filter((m) => m.role === 'Trưởng nhóm' || m.role === 'ADMIN');
    const subAdmins = membersList.filter((m) => m.role === 'Phó nhóm' || m.role === 'SUB_LEADER');
    return [...admins, ...subAdmins];
  }, [membersList]);

  const regularMembers = useMemo(() => {
    return membersList.filter(
      (m) =>
        m.role !== 'Trưởng nhóm' &&
        m.role !== 'ADMIN' &&
        m.role !== 'Phó nhóm' &&
        m.role !== 'SUB_LEADER',
    );
  }, [membersList]);

  const handleJoin = async () => {
    const rawId = String(clubInfo.id).replace(/\D/g, '');
    const numericId = parseInt(rawId, 10);
    if (!isNaN(numericId) && numericId > 0) {
      setIsJoining(true);
      try {
        await joinClubApi(numericId);
        setIsJoined(true);
        if (onJoinClub) onJoinClub(clubInfo.id);
      } catch (err) {
        if (onJoinClub) onJoinClub(clubInfo.id);
      } finally {
        setIsJoining(false);
      }
    } else {
      if (onJoinClub) onJoinClub(clubInfo.id);
    }
  };

  const handleViewPage = () => {
    animateClose();
    if (onViewClubPage) {
      onViewClubPage(clubInfo.id);
    } else {
      router.push('/(tabs)/clubs' as any);
    }
  };

  const memberCapacityRatio = Math.min(currentMembers / Math.max(maxMembers, 1), 1);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose}>
      <View style={styles.modalRoot}>
        {/* Animated Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        {/* Animated Bottom Sheet Container */}
        <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
          {/* Top Anchor Bar with PanResponder for Swipe-Down to Dismiss */}
          <View style={styles.topAnchorHeader} {...panResponder.panHandlers}>
            {/* Floating Translucent Drag Handle */}
            <View style={styles.floatingDragHandleContainer}>
              <View style={styles.floatingDragHandle} />
            </View>

            {/* Status Badge on Cover */}
            <View style={styles.coverBadge}>
              <Ionicons
                name={isPrivate ? 'lock-closed' : 'shield-checkmark'}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.coverBadgeText}>
                {isPrivate ? 'CLB Riêng tư' : 'CLB Chính thức'}
              </Text>
            </View>

            {/* Floating Close Button */}
            <TouchableOpacity
              style={styles.floatingCloseBtn}
              activeOpacity={0.8}
              onPress={animateClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* ── Scrollable Body Content ── */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* ── 1. Top Cover (Bleeds to top edge) ── */}
            <View style={styles.heroCoverWrapper}>
              <Image source={{ uri: displayCover }} style={styles.heroCoverImage} />

              <LinearGradient
                colors={['rgba(15,23,42,0.4)', 'transparent', 'rgba(15,23,42,0.85)']}
                style={StyleSheet.absoluteFill}
              />
            </View>

            {/* ── 2. Identity Header ── */}
            <View style={styles.headerInfoBlock}>
              {/* Prominent Club Avatar Overlapping Up into Cover */}
              <View style={styles.avatarOverlapContainer}>
                <View style={styles.avatarGlowRing}>
                  <Image source={{ uri: displayAvatar }} style={styles.mainAvatarImage} />
                </View>
                <View style={styles.sportBadgeOnAvatar}>
                  <Text style={styles.sportEmojiText}>
                    {displaySport.includes('Bóng đá')
                      ? '⚽'
                      : displaySport.includes('Cầu lông')
                      ? '🏸'
                      : displaySport.includes('Bóng rổ')
                      ? '🏀'
                      : '🏓'}
                  </Text>
                </View>
              </View>

              <View style={styles.titleRow}>
                <Text style={styles.clubTitleText} numberOfLines={2}>
                  {displayName}
                </Text>
                <Ionicons name="checkmark-circle" size={22} color="#10B981" style={styles.verifiedIcon} />
              </View>

              {/* Handle & Creator info */}
              <View style={styles.metaRow}>
                <Text style={styles.clubHandleText}>@club_{clubInfo.id}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <View style={styles.creatorPill}>
                  <Ionicons name="person-circle" size={14} color="#059669" />
                  <Text style={styles.creatorPillText}>Chủ CLB: {creatorName}</Text>
                </View>
              </View>

              {/* Quick Tags Strip */}
              <View style={styles.quickTagsStrip}>
                <View style={styles.quickTagPill}>
                  <Ionicons name="location-sharp" size={12} color={COLORS.primary} />
                  <Text style={styles.quickTagText} numberOfLines={1}>
                    {displayArea}
                  </Text>
                </View>

                <View style={styles.quickTagPill}>
                  <Ionicons name="trophy-outline" size={12} color="#D97706" />
                  <Text style={styles.quickTagText}>{displaySport}</Text>
                </View>

                <View style={styles.quickTagPill}>
                  <Ionicons name="flash-outline" size={12} color="#0284C7" />
                  <Text style={styles.quickTagText}>{displayActivity}</Text>
                </View>
              </View>
            </View>

            {/* Key Metrics 4-Grid Cards */}
            <View style={styles.metricsGridContainer}>
              {/* Metric 1: Thành viên */}
              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <Ionicons name="people" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.metricCardValue}>
                  {currentMembers}/{maxMembers}
                </Text>
                <Text style={styles.metricCardLabel}>Thành viên</Text>
                <View style={styles.capacityProgressBarBg}>
                  <View
                    style={[
                      styles.capacityProgressBarFill,
                      { width: `${memberCapacityRatio * 100}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Metric 2: Điểm ELO */}
              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="flash" size={16} color="#D97706" />
                </View>
                <Text style={[styles.metricCardValue, { color: '#D97706' }]}>{elo}</Text>
                <Text style={styles.metricCardLabel}>Điểm ELO</Text>
                <Text style={styles.metricSubLabel}>Xếp hạng CLB</Text>
              </View>

              {/* Metric 3: Điểm CRP */}
              <View style={[styles.metricCard, { backgroundColor: '#F0F9FF' }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="shield-checkmark" size={16} color="#0284C7" />
                </View>
                <Text style={[styles.metricCardValue, { color: '#0284C7' }]}>{crp}</Text>
                <Text style={styles.metricCardLabel}>Điểm Uy Tín</Text>
                <Text style={styles.metricSubLabel}>CRP Điểm</Text>
              </View>

              {/* Metric 4: Trận thắng */}
              <View style={[styles.metricCard, { backgroundColor: '#F0FDF4' }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="flame" size={16} color="#16A34A" />
                </View>
                <Text style={[styles.metricCardValue, { color: '#16A34A' }]}>{rankedWins}</Text>
                <Text style={styles.metricCardLabel}>Thắng Trận</Text>
                <Text style={styles.metricSubLabel}>Thành tích</Text>
              </View>
            </View>

            {/* Club Bio Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionHeaderTitle}>Giới thiệu câu lạc bộ</Text>
              </View>
              <Text style={styles.bioText}>{displayDescription}</Text>
            </View>

            {/* Thông Tin Sinh Hoạt (Clean 2-Column Grid & Leader Card) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionHeaderTitle}>Thông tin sinh hoạt</Text>
              </View>

              {/* Featured Owner Card */}
              <View style={styles.featuredOwnerCard}>
                <View style={styles.ownerIconWrap}>
                  <Ionicons name="shield-checkmark" size={18} color="#059669" />
                </View>
                <View style={styles.ownerTextCol}>
                  <Text style={styles.ownerLabelText}>Chủ câu lạc bộ</Text>
                  <Text style={styles.ownerNameText}>{creatorName}</Text>
                </View>
                <View style={styles.ownerAdminBadge}>
                  <Text style={styles.ownerAdminBadgeText}>Quản trị viên</Text>
                </View>
              </View>

              {/* 2x2 Specs Grid */}
              <View style={styles.specGrid}>
                <View style={styles.specItem}>
                  <View style={styles.specHeaderRow}>
                    <Ionicons name="football-outline" size={14} color="#059669" />
                    <Text style={styles.specLabel}>Môn thể thao</Text>
                  </View>
                  <Text style={styles.specValue} numberOfLines={1}>
                    {displaySport}
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <View style={styles.specHeaderRow}>
                    <Ionicons name="lock-open-outline" size={14} color="#2563EB" />
                    <Text style={styles.specLabel}>Hình thức</Text>
                  </View>
                  <Text style={styles.specValue} numberOfLines={1}>
                    {isPrivate ? 'Xét duyệt' : 'Công khai'}
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <View style={styles.specHeaderRow}>
                    <Ionicons name="location-outline" size={14} color="#D97706" />
                    <Text style={styles.specLabel}>Khu vực</Text>
                  </View>
                  <Text style={styles.specValue} numberOfLines={1}>
                    {displayArea}
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <View style={styles.specHeaderRow}>
                    <Ionicons name="time-outline" size={14} color="#7C3AED" />
                    <Text style={styles.specLabel}>Lịch sinh hoạt</Text>
                  </View>
                  <Text style={styles.specValue} numberOfLines={1}>
                    {displayActivity}
                  </Text>
                </View>
              </View>
            </View>

            {/* Ban Quản Trị & Thành Viên */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="shield-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionHeaderTitle}>Ban cán sự & Thành viên</Text>
                <Text style={styles.sectionCountText}>({currentMembers})</Text>
              </View>

              {/* Leadership List */}
              {leaders.length > 0 ? (
                <View style={styles.leadersList}>
                  {leaders.map((leader, idx) => (
                    <View key={`leader-${leader.userId || idx}`} style={styles.leaderRow}>
                      <Image
                        source={{
                          uri:
                            leader.avatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                        }}
                        style={styles.leaderAvatar}
                      />
                      <View style={styles.leaderInfoCol}>
                        <Text style={styles.leaderName} numberOfLines={1}>
                          {leader.name || 'Ban Quản Trị'}
                        </Text>
                        <View style={styles.leaderRolePill}>
                          <Ionicons
                            name={
                              leader.role === 'Trưởng nhóm' || leader.role === 'ADMIN'
                                ? 'ribbon'
                                : 'star'
                            }
                            size={11}
                            color="#D97706"
                          />
                          <Text style={styles.leaderRoleText}>
                            {leader.role === 'ADMIN'
                              ? 'Trưởng nhóm'
                              : leader.role === 'SUB_LEADER'
                              ? 'Phó nhóm'
                              : leader.role}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.leaderEloBadge}>
                        <Text style={styles.leaderEloText}>{leader.elo || elo} ELO</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Other Members Stack */}
              <View style={styles.membersStackRow}>
                <View style={styles.memberAvatarStack}>
                  {regularMembers.slice(0, 5).map((member, idx) => (
                    <Image
                      key={`reg-member-${member.userId || idx}`}
                      source={{
                        uri:
                          member.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                      }}
                      style={[styles.stackedAvatar, { marginLeft: idx === 0 ? 0 : -10 }]}
                    />
                  ))}
                </View>
                <Text style={styles.membersRemainingText}>
                  {currentMembers > 5
                    ? `và +${currentMembers - 5} thành viên khác đang sinh hoạt`
                    : 'Các thành viên nhiệt huyết đang giao lưu thường xuyên'}
                </Text>
              </View>
            </View>

            {/* Spacing for floating bottom bar */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* ── 3. Floating Bottom Action Bar (Rock solid visibility) ── */}
          <View style={styles.floatingBottomBarWrapper}>
            <View style={styles.floatingBottomBarContent}>
              {!isJoined && userStatus === 'NOT_MEMBER' ? (
                <View style={styles.actionBtnGroup}>
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnPrimary, isJoining && { opacity: 0.8 }]}
                    activeOpacity={0.85}
                    disabled={isJoining}
                    onPress={handleJoin}
                  >
                    {isJoining ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="person-add" size={16} color="#FFFFFF" />
                        <Text style={styles.btnPrimaryText}>Tham gia câu lạc bộ</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnSecondary]}
                    activeOpacity={0.85}
                    onPress={handleViewPage}
                  >
                    <Ionicons name="open-outline" size={16} color="#1E293B" />
                    <Text style={styles.btnSecondaryText}>Xem trang câu lạc bộ</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.btnAction, styles.btnPrimary, styles.btnFullWidth]}
                  activeOpacity={0.85}
                  onPress={handleViewPage}
                >
                  <Ionicons name="arrow-forward-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.btnPrimaryText}>Xem trang câu lạc bộ</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SHEET_HEIGHT,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 24,
    display: 'flex',
    flexDirection: 'column',
  },

  // Top Anchor Header for Gesture Drag
  topAnchorHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 55,
    zIndex: 40,
    justifyContent: 'center',
  },
  floatingDragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  floatingDragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  floatingCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 45,
  },
  coverBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 4.5,
    zIndex: 45,
  },
  coverBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // 1. Hero Cover
  heroCoverWrapper: {
    height: 155,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Avatar Overlapping
  avatarOverlapContainer: {
    marginTop: -42,
    marginBottom: 8,
    width: 78,
    height: 78,
    position: 'relative',
    zIndex: 20,
    elevation: 20,
  },
  avatarGlowRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  mainAvatarImage: {
    width: '100%',
    height: '100%',
  },
  sportBadgeOnAvatar: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F8FAFC',
    elevation: 12,
  },
  sportEmojiText: {
    fontSize: 13,
  },

  // Scroll Body
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // 2. Identity Header Block
  headerInfoBlock: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubTitleText: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    lineHeight: 26,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  clubHandleText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  dotSeparator: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  creatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
  },
  creatorPillText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  quickTagsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },
  quickTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  quickTagText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
  },

  // 3. Key Metrics 4-Grid
  metricsGridContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  metricIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  metricCardValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricCardLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  metricSubLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  capacityProgressBarBg: {
    width: '100%',
    height: 3.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  capacityProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // 4. Section Card Standard
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  sectionCountText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  bioText: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },

  // 5. Featured Owner & 2x2 Specs Grid
  featuredOwnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    gap: 10,
  },
  ownerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerTextCol: {
    flex: 1,
  },
  ownerLabelText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
  ownerNameText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '800',
    marginTop: 1,
  },
  ownerAdminBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  ownerAdminBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    color: '#15803D',
    fontWeight: '700',
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  specItem: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  specHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  specLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  specValue: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },

  // 6. Leaders & Members
  leadersList: {
    gap: 8,
    marginBottom: 12,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  leaderInfoCol: {
    flex: 1,
  },
  leaderName: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  leaderRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  leaderRoleText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    color: '#B45309',
    fontWeight: '700',
  },
  leaderEloBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  leaderEloText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: '#B45309',
    fontWeight: '800',
  },
  membersStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  memberAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#CBD5E1',
  },
  membersRemainingText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11.5,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },

  // 7. Floating Bottom Action Bar (Rock solid visibility)
  floatingBottomBarWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    zIndex: 50,
    elevation: 20,
  },
  floatingBottomBarContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAction: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnFullWidth: {
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnSecondaryText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
});


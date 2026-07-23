import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { matchmakingApi, MatchRoom, MatchApplication, MatchPoll } from '../../../shared/api/matchmaking';
import { getSuggestedVenuesApi, VenueSuggestion } from '../../../shared/api/bookings';
import { Button } from '../../../shared/ui';

export function MatchRoomDetailScreen({ route, navigation }: any) {
  const roomId = route?.params?.roomId || 1;
  const [room, setRoom] = useState<MatchRoom | null>(null);
  const [applications, setApplications] = useState<MatchApplication[]>([]);
  const [poll, setPoll] = useState<MatchPoll | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Venue Suggestion Modal States
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [suggestedVenues, setSuggestedVenues] = useState<VenueSuggestion[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueSuggestion | null>(null);
  const [loadingVenues, setLoadingVenues] = useState(false);

  const [isManagerB] = useState(false);
  const [myUserId] = useState(1);
  const [myClubId] = useState(1);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await matchmakingApi.getMatchRoomById(roomId);
      setRoom(data);
      const apps = await matchmakingApi.getApplicationsForRoom(roomId);
      setApplications(apps);
    } catch (err) {
      console.log('Error loading room detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [roomId]);

  const handleOpenVenueSuggestions = async () => {
    try {
      setLoadingVenues(true);
      setShowVenueModal(true);
      const venues = await getSuggestedVenuesApi(room?.sportId, room?.latitude, room?.longitude);
      if (venues && venues.length > 0) {
        setSuggestedVenues(venues);
      } else {
        setSuggestedVenues([
          { id: 'v1', name: 'Sân Bóng Chùa Hà - Sân 7A', address: 'Quận Cầu Giấy, Hà Nội', latitude: 21.0368, longitude: 105.7905, hourlyPrice: 500000, rating: 4.9 },
          { id: 'v2', name: 'Sân Bóng Đại Học Quốc Gia', address: '144 Xuân Thủy, Cầu Giấy, Hà Nội', latitude: 21.0375, longitude: 105.7830, hourlyPrice: 400000, rating: 4.7 },
          { id: 'v3', name: 'Trung Tâm Thể Thao Tuổi Trẻ', address: 'Hoàng Quốc Việt, Cầu Giấy', latitude: 21.0450, longitude: 105.7950, hourlyPrice: 450000, rating: 4.8 },
        ]);
      }
    } catch (err) {
      console.log('Error fetching venue suggestions:', err);
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleConfirmVenueSelection = (venue: VenueSuggestion) => {
    setSelectedVenue(venue);
    setShowVenueModal(false);
    Alert.alert('Đã chọn sân 🎉', `Đã chọn ${venue.name}. Giá tiền cưa đôi tự động cập nhật: ${(venue.hourlyPrice / 2).toLocaleString()} đ/đội!`);
  };

  const handleApplyDirect = async () => {
    try {
      await matchmakingApi.applyToMatchRoom(roomId, myClubId, myUserId);
      Alert.alert('Thành công 🎉', 'Đã gửi yêu cầu ghép trận đến Chủ phòng Đội A!');
      loadDetail();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err.message || 'Không thể gửi đơn xin');
    }
  };

  const handleVotePoll = async (isAttending: boolean) => {
    try {
      const res = await matchmakingApi.voteInternalPoll(roomId, myClubId, myUserId, isAttending);
      setPoll(res);
      Alert.alert('Ghi nhận', isAttending ? 'Bạn đã vote CÓ THỂ ĐÁ!' : 'Bạn đã vote KHÔNG THỂ ĐÁ.');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err.message);
    }
  };

  const handleAcceptApp = async (appId: number) => {
    try {
      await matchmakingApi.acceptApplication(roomId, appId, myUserId);
      Alert.alert('Đã chốt kèo 🤝', '2 bên đã chấp thuận ghép trận! Vui lòng chọn Sân từ gợi ý hệ thống.');
      loadDetail();
      handleOpenVenueSuggestions();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err.message);
    }
  };

  if (loading || !room) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isCreatorA = room.creatorUserId === myUserId;
  const currentVenuePrice = selectedVenue ? selectedVenue.hourlyPrice : (room.priceSharePerTeam ? room.priceSharePerTeam * 2 : undefined);
  const priceShare = currentVenuePrice ? currentVenuePrice / 2.0 : undefined;
  const depositAmount = room.depositAmount ?? 50000;
  const remainingTeamA = (priceShare && room.flowType === 'DEPOSIT_HOLD') ? priceShare - depositAmount : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Phòng Ghép Trận</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Room Card */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.clubHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{room.creatorClubName?.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clubTitle} numberOfLines={1}>{room.creatorClubName}</Text>
                  <View style={styles.crpRow}>
                    <MaterialIcons name="emoji-events" size={14} color={COLORS.secondary} />
                    <Text style={styles.crpBadge}>{room.creatorClubCrp ?? 100} CRP</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusBadge, room.flowType === 'PAID_100' ? styles.paidBadge : styles.holdBadge]}>
                <Text style={[styles.badgeText, room.flowType === 'PAID_100' ? styles.paidText : styles.holdText]}>
                  {room.flowType === 'PAID_100' ? 'Đã Chốt Sân (100%)' : 'Cọc Hold Giữ Chỗ'}
                </Text>
              </View>
            </View>

            {room.flowType === 'DEPOSIT_HOLD' && room.ttlExpiresAt && (
              <View style={styles.ttlAlert}>
                <MaterialIcons name="timer" size={18} color={COLORS.amber} />
                <Text style={styles.ttlText}>
                  Hạn giữ chỗ Dynamic TTL còn lại: {new Date(room.ttlExpiresAt).toLocaleTimeString('vi-VN')}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.infoBox}>
              <View style={styles.infoLine}>
                <MaterialIcons name="sports" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>Môn: <Text style={styles.boldText}>{room.sportName}</Text> ({room.format})</Text>
              </View>
              <View style={styles.infoLine}>
                <MaterialIcons name="event" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>Giờ đá: {new Date(room.expectedStartTime).toLocaleString('vi-VN')}</Text>
              </View>
              <View style={styles.infoLine}>
                <MaterialIcons name="place" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  Sân chính thức: <Text style={[styles.boldText, { color: COLORS.primary }]}>
                    {selectedVenue ? selectedVenue.name : (room.venueName ? `${room.venueName} (${room.courtName})` : 'Chưa chọn sân (Gợi ý sau khi ghép trận)')}
                  </Text>
                </Text>
              </View>
              <View style={styles.infoLine}>
                <MaterialIcons name="map" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>Khu vực: {room.area}</Text>
              </View>
            </View>

            {/* Split Price Box */}
            {priceShare ? (
              <View style={styles.splitBox}>
                <View style={styles.splitHeader}>
                  <MaterialIcons name="payments" size={18} color={COLORS.primary} />
                  <Text style={styles.splitTitle}>CHI TIẾT TIỀN SÂN CƯA ĐÔI 5/5</Text>
                </View>

                <View style={styles.splitRow}>
                  <Text style={styles.splitLabel}>Tổng tiền sân thực tế:</Text>
                  <Text style={styles.splitVal}>{currentVenuePrice?.toLocaleString()} đ</Text>
                </View>

                <View style={styles.splitRow}>
                  <Text style={styles.splitLabel}>Đội B thanh toán (50%):</Text>
                  <Text style={[styles.splitVal, { color: COLORS.primary }]}>{priceShare.toLocaleString()} đ</Text>
                </View>

                {room.flowType === 'DEPOSIT_HOLD' ? (
                  <View style={styles.splitRow}>
                    <Text style={styles.splitLabel}>Đội A (đã cọc {depositAmount.toLocaleString()}đ):</Text>
                    <Text style={[styles.splitVal, { color: COLORS.secondary }]}>Trả nốt {remainingTeamA.toLocaleString()} đ</Text>
                  </View>
                ) : (
                  <View style={styles.splitRow}>
                    <Text style={styles.splitLabel}>Đội A (đã trả 100%):</Text>
                    <Text style={[styles.splitVal, { color: COLORS.primary }]}>Nhận lại {priceShare.toLocaleString()} đ từ Đội B</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noPriceBox}>
                <MaterialIcons name="info" size={18} color={COLORS.primary} />
                <Text style={styles.noPriceText}>
                  Giá tiền sân sẽ được tự động tính ngay khi Chủ phòng chọn Sân từ Danh sách gợi ý của hệ thống sau khi 2 bên chốt kèo.
                </Text>
              </View>
            )}

            {/* Suggest Venue Button for Manager A */}
            {isCreatorA && (
              <Button
                variant="primary"
                onPress={handleOpenVenueSuggestions}
                style={styles.suggestVenueBtn}
              >
                📍 CHỌN SÂN TỪ GỢI Ý HỆ THỐNG
              </Button>
            )}

            {room.message && (
              <View style={styles.messageBox}>
                <Text style={styles.messageTitle}>Lời nhắn từ Đội A:</Text>
                <Text style={styles.messageContent}>{room.message}</Text>
              </View>
            )}
          </View>

          {/* Section Đội B Actions & Internal Poll */}
          {!isCreatorA && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>HÀNH ĐỘNG DÀNH CHO ĐỘI B</Text>
              
              {isManagerB ? (
                <Button variant="secondary" onPress={handleApplyDirect}>
                  XIN THAM GIA TRỰC TIẾP (MANAGER B)
                </Button>
              ) : (
                <View style={styles.pollCard}>
                  <Text style={styles.pollTitle}>KHOẢO SÁT NỘI BỘ CLB B DÀNH CHO TRẬN NÀY</Text>
                  <Text style={styles.pollDesc}>Cần tối thiểu {poll?.requiredVotes ?? 5} người bấm CÓ THỂ ĐÁ để mở nút Xin Tham Gia.</Text>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, ((poll?.currentYesVotes ?? 0) / (poll?.requiredVotes ?? 5)) * 100)}%` }]} />
                  </View>
                  <Text style={styles.progressText}>Tiến độ: {poll?.currentYesVotes ?? 0}/{poll?.requiredVotes ?? 5} người đã Vote Có mặt</Text>

                  <View style={styles.voteBtnRow}>
                    <TouchableOpacity style={[styles.voteBtn, styles.voteYes]} onPress={() => handleVotePoll(true)}>
                      <Text style={styles.voteYesText}>Quẹt Phải: ĐÁ ĐƯỢC (+1)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.voteBtn, styles.voteNo]} onPress={() => handleVotePoll(false)}>
                      <Text style={styles.voteNoText}>Quẹt Trái: BẬN</Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    variant="secondary"
                    disabled={!(poll?.isUnlocked)}
                    onPress={handleApplyDirect}
                  >
                    XIN THAM GIA (ĐÃ ĐỦ {poll?.requiredVotes ?? 5} VOTE)
                  </Button>
                </View>
              )}
            </View>
          )}

          {/* Section Đội A: Applications Review */}
          {isCreatorA && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DANH SÁCH ĐỘI B XIN THAM GIA ({applications.length})</Text>
              {applications.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có đội nào gửi yêu cầu xin tham gia.</Text>
              ) : (
                applications.map((app) => (
                  <View key={app.id} style={styles.appCard}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.appClubName}>{app.applicantClubName}</Text>
                      <Text style={styles.appCrp}>Điểm CRP: {app.applicantClubCrp ?? 100}</Text>
                    </View>
                    <Text style={styles.applicantUser}>Đại diện gửi: {app.applicantUserName}</Text>

                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={() => handleAcceptApp(app.id)}
                      style={styles.acceptBtn}
                    >
                      🤝 CHỐT KÈO VỚI ĐỘI NÀY
                    </Button>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* Suggested Venues Modal */}
        <Modal visible={showVenueModal} animationType="slide" onRequestClose={() => setShowVenueModal(false)}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.venueModalContainer}>
              <View style={styles.venueModalHeader}>
                <TouchableOpacity onPress={() => setShowVenueModal(false)}>
                  <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
                </TouchableOpacity>
                <Text style={styles.venueModalTitle}>Gợi Ý Sân Thi Đấu Phù Hợp</Text>
                <TouchableOpacity onPress={() => setShowVenueModal(false)}>
                  <Text style={styles.doneBtnText}>ĐÓNG</Text>
                </TouchableOpacity>
              </View>

              {loadingVenues ? (
                <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
              ) : (
                <ScrollView contentContainerStyle={styles.venueListContent} showsVerticalScrollIndicator={false}>
                  {suggestedVenues.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={styles.venueCard}
                      onPress={() => handleConfirmVenueSelection(v)}
                      activeOpacity={0.85}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.venueCardTitle}>{v.name}</Text>
                        <Text style={styles.venueCardAddress}>📍 {v.address}</Text>
                        <Text style={styles.venueCardRating}>⭐ {v.rating} (Đánh giá cao)</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={styles.venuePrice}>{v.hourlyPrice.toLocaleString()} đ/giờ</Text>
                        <Text style={styles.venueSplitPrice}>Cưa đôi: {(v.hourlyPrice / 2).toLocaleString()} đ/đội</Text>
                        <View style={styles.selectVenuePill}>
                          <Text style={styles.selectVenueText}>CHỌN SÂN NÀY</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontSize: TYPOGRAPHY.headlineMd.fontSize,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    color: COLORS.onSurface,
  },
  content: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, // 16px
    padding: SPACING.md, // 16px
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.onPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  clubTitle: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  crpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  crpBadge: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  paidBadge: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  holdBadge: {
    backgroundColor: COLORS.secondaryOpacity20,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  paidText: {
    color: COLORS.primary,
  },
  holdText: {
    color: COLORS.onSecondaryContainer,
  },
  ttlAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.amberOpacity10,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  ttlText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.amber,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  infoBox: {
    gap: 8,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurface,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  splitBox: {
    backgroundColor: COLORS.primaryOpacity05,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  splitTitle: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitLabel: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  splitVal: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  noPriceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
  },
  noPriceText: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
  suggestVenueBtn: {
    marginTop: SPACING.xs,
  },
  messageBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    gap: 4,
  },
  messageTitle: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '700',
  },
  messageContent: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurface,
    fontStyle: 'italic',
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '700',
  },
  pollCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  pollTitle: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
  pollDesc: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  voteBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  voteBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
  },
  voteYes: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  voteYesText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  voteNo: {
    backgroundColor: COLORS.surfaceContainerLow,
  },
  voteNoText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 13,
    color: COLORS.outline,
    fontStyle: 'italic',
  },
  appCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  appClubName: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  appCrp: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  applicantUser: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 13,
    color: COLORS.outline,
  },
  acceptBtn: {
    marginTop: 4,
  },
  venueModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  venueModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  venueModalTitle: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 16,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  doneBtnText: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
  },
  venueListContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  venueCardTitle: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  venueCardAddress: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  venueCardRating: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.amber,
    fontWeight: '700',
    marginTop: 2,
  },
  venuePrice: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '800',
  },
  venueSplitPrice: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  selectVenuePill: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 4,
  },
  selectVenueText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    color: COLORS.onSecondary,
    fontWeight: '800',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MatchRoomVM } from '../../../entities/match/model/match.types';

interface MatchCardProps {
  room: MatchRoomVM;
  onPress: () => void;
  isMyMatchView?: boolean;
}

export function MatchCard({ room, onPress, isMyMatchView = false }: MatchCardProps) {
  const isRanked = room.matchType === 'RANKED';
  const host = room.hostClub;
  const guest = room.guestClub;
  const booking = room.booking;

  const [hostImgError, setHostImgError] = useState(false);
  const [guestImgError, setGuestImgError] = useState(false);

  const hostAvatar = host.avatarUrl || host.logoUrl || (host as any).avatarImage;
  const guestAvatar = guest?.avatarUrl || guest?.logoUrl || (guest as any)?.avatarImage;

  const minSharePercent = Math.min(room.hostSharePercent, room.guestSharePercent);
  const minAmount = Math.round((booking.totalPrice * minSharePercent) / 100);

  const getFeeSplitLabel = () => {
    if (room.hostSharePercent === 50) return 'Chia đôi 50/50';
    if (room.hostSharePercent === 70 || room.guestSharePercent === 30) {
      return `Thắng chỉ trả 30% (~${minAmount.toLocaleString('vi-VN')}đ)`;
    }
    if (room.hostSharePercent === 100 || room.guestSharePercent === 0) {
      return 'Thắng MIỄN 100% tiền sân';
    }
    return `Thắng trả ${minSharePercent}% (~${minAmount.toLocaleString('vi-VN')}đ)`;
  };

  // Status & Match Result badge config
  const getStatusBadge = () => {
    switch (room.status) {
      case 'RESULT_FINAL': {
        const outcome = room.result?.outcome;
        if (outcome === 'DRAW') {
          return {
            label: 'HÒA',
            bg: '#FEF3C7',
            border: '#FCD34D',
            color: '#B45309',
            icon: 'swap-horizontal-outline',
          };
        }
        if (outcome === 'WIN_A') {
          return {
            label: isMyMatchView ? 'HOÀN TẤT' : `THẮNG: ${host.name}`,
            bg: '#DCFCE7',
            border: '#86EFAC',
            color: '#15803D',
            icon: 'trophy',
          };
        }
        if (outcome === 'WIN_B') {
          return {
            label: isMyMatchView ? 'HOÀN TẤT' : `THẮNG: ${guest?.name || 'Đối thủ'}`,
            bg: '#DCFCE7',
            border: '#86EFAC',
            color: '#15803D',
            icon: 'trophy',
          };
        }
        return {
          label: 'HOÀN TẤT',
          bg: '#DCFCE7',
          border: '#86EFAC',
          color: '#15803D',
          icon: 'checkmark-done-circle-outline',
        };
      }

      case 'MATCHED':
        return {
          label: 'ĐÃ CHỐT KÈO',
          bg: '#E0F2FE',
          border: '#7DD3FC',
          color: '#0369A1',
          icon: 'shield-checkmark',
        };

      case 'SCORE_CONFIRMING':
      case 'SCORE_PENDING':
        return {
          label: 'CHỜ DUYỆT TỶ SỐ',
          bg: '#FFEDD5',
          border: '#FDBA74',
          color: '#C2410C',
          icon: 'time-outline',
        };

      case 'DISPUTED':
        return {
          label: 'KHIẾU NẠI TỶ SỐ',
          bg: '#FEE2E2',
          border: '#FCA5A5',
          color: '#B91C1C',
          icon: 'alert-circle-outline',
        };

      case 'EXPIRED':
        return {
          label: (room.statusLabel || (isMyMatchView ? 'QUÁ HẠN' : 'HẾT HẠN')).toUpperCase(),
          bg: '#F1F5F9',
          border: '#CBD5E1',
          color: '#64748B',
          icon: 'time-outline',
        };

      case 'CANCELLED':
        return {
          label: (room.statusLabel || 'ĐÃ HỦY').toUpperCase(),
          bg: '#F1F5F9',
          border: '#CBD5E1',
          color: '#64748B',
          icon: 'close-circle-outline',
        };

      case 'OPEN':
      default:
        return {
          label: 'ĐANG TÌM ĐỐI THỦ',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.28)',
          color: '#059669',
          icon: 'radio-button-on-outline',
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Dynamic action button label
  const getActionBtnLabel = () => {
    switch (room.status) {
      case 'RESULT_FINAL':
        return 'Xem Kết Quả';
      case 'SCORE_CONFIRMING':
      case 'SCORE_PENDING':
        return room.permissions?.canConfirmScore ? 'Duyệt Tỷ Số Ngay' : 'Xem Tỷ Số';
      case 'MATCHED':
        return room.permissions?.canEnterScore ? 'Nhập Tỷ Số' : 'Chi Tiết Kèo';
      case 'EXPIRED':
      case 'CANCELLED':
        return 'Xem Chi Tiết';
      case 'OPEN':
      default:
        if (isMyMatchView) {
          const applicantCount = room.applicants?.length || 0;
          return applicantCount > 0 ? `Duyệt Kèo (${applicantCount})` : 'Quản Lý Kèo';
        }
        return 'Vào Ghép Kèo';
    }
  };

  const getSportIcon = () => {
    const sName = (booking.sportName || '').toLowerCase();
    if (sName.includes('bóng đá') || sName.includes('football')) return 'football-outline';
    if (sName.includes('pickleball')) return 'tennisball-outline';
    if (sName.includes('cầu lông') || sName.includes('badminton')) return 'badminton';
    if (sName.includes('bóng rổ') || sName.includes('basketball')) return 'basketball-outline';
    return 'trophy-outline';
  };

  // Outcome evaluation for My Match
  const getFinalScoreDisplay = () => {
    if (room.status === 'RESULT_FINAL' && room.result?.finalScoreText) {
      return room.result.finalScoreText;
    }
    if (room.scoreSubmission?.hostScore !== undefined && room.scoreSubmission?.guestScore !== undefined) {
      return `${room.scoreSubmission.hostScore} - ${room.scoreSubmission.guestScore}`;
    }
    return null;
  };

  const scoreText = getFinalScoreDisplay();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, isMyMatchView && styles.myMatchCard]}>
      {/* ── Top Header: Sport & Match Type & Status ── */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeftTags}>
          {/* Sport Tag */}
          <View style={styles.sportBadge}>
            {getSportIcon() === 'badminton' ? (
              <MaterialCommunityIcons name="badminton" size={12} color={COLORS.primary} />
            ) : (
              <Ionicons name={getSportIcon() as any} size={12} color={COLORS.primary} />
            )}
            <Text style={styles.sportBadgeText}>{booking.sportName || 'Thể thao'}</Text>
          </View>

          {/* Ranked / Friendly Tag */}
          <View style={[styles.typeBadge, isRanked ? styles.rankedBadge : styles.friendlyBadge]}>
            <Ionicons
              name={isRanked ? 'trophy' : 'people'}
              size={11}
              color={isRanked ? '#D97706' : '#0284C7'}
            />
            <Text style={[styles.typeBadgeText, isRanked ? styles.rankedText : styles.friendlyText]}>
              {isRanked ? 'Xếp hạng CRP' : 'Giao hữu'}
            </Text>
          </View>
        </View>

        {/* Status Pill */}
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg, borderColor: statusBadge.border }]}>
          <View style={[styles.statusPulseDot, { backgroundColor: statusBadge.color }]} />
          <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
            {statusBadge.label}
          </Text>
        </View>
      </View>

      {/* ── Center: Versus Battle Arena ── */}
      <View style={[styles.battleArena, isMyMatchView && styles.myBattleArena]}>
        {/* Left: Host Club */}
        <View style={styles.teamCol}>
          <View style={styles.teamAvatarWrap}>
            {hostAvatar && !hostImgError ? (
              <Image
                source={{ uri: hostAvatar }}
                style={styles.teamAvatar}
                resizeMode="cover"
                onError={() => setHostImgError(true)}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{(host.name || 'A').charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.hostCrownBadge}>
              <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.teamName} numberOfLines={1}>
            {host.name}
          </Text>
          <View style={styles.teamMetaPill}>
            <Text style={styles.teamEloText}>{host.clubElo} Elo</Text>
            <Text style={styles.teamLevelText}>• {host.levelLabel}</Text>
          </View>
          {isRanked && room.result?.hostCrpDelta !== undefined && (
            <View style={[
              styles.crpDeltaBadge,
              room.result.hostCrpDelta >= 0 ? styles.crpDeltaPlus : styles.crpDeltaMinus
            ]}>
              <Text style={[
                styles.crpDeltaText,
                room.result.hostCrpDelta >= 0 ? styles.crpDeltaTextPlus : styles.crpDeltaTextMinus
              ]}>
                {room.result.hostCrpDelta >= 0 ? `+${room.result.hostCrpDelta}` : room.result.hostCrpDelta} CRP
              </Text>
            </View>
          )}
        </View>

        {/* Middle: VS or Score Result Hero */}
        <View style={styles.vsBadgeContainer}>
          {scoreText ? (
            <View style={styles.scoreHeroBox}>
              <Text style={styles.scoreHeroText}>{scoreText}</Text>
              {room.status === 'RESULT_FINAL' ? (
                <View style={styles.finalTag}>
                  <Text style={styles.finalTagText}>CHUNG CUỘC</Text>
                </View>
              ) : (
                <View style={styles.pendingTag}>
                  <Text style={styles.pendingTagText}>CHỜ DUYỆT</Text>
                </View>
              )}
            </View>
          ) : (
            <>
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              {room.balanceLabel && room.status === 'OPEN' ? (
                <View style={styles.balanceChip}>
                  <MaterialIcons name="bolt" size={11} color="#D97706" />
                  <Text style={styles.balanceChipText}>{room.balanceLabel}</Text>
                </View>
              ) : (
                <View style={styles.vsSubline} />
              )}
            </>
          )}
        </View>

        {/* Right: Guest Club or Open Looking Slot */}
        <View style={styles.teamCol}>
          {guest ? (
            <>
              <View style={styles.teamAvatarWrap}>
                {guestAvatar && !guestImgError ? (
                  <Image
                    source={{ uri: guestAvatar }}
                    style={styles.teamAvatar}
                    resizeMode="cover"
                    onError={() => setGuestImgError(true)}
                  />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: '#0284C7' }]}>
                    <Text style={styles.avatarText}>{(guest.name || 'B').charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.teamName} numberOfLines={1}>
                {guest.name}
              </Text>
              <View style={styles.teamMetaPill}>
                <Text style={styles.teamEloText}>{guest.clubElo} Elo</Text>
                <Text style={styles.teamLevelText}>• {guest.levelLabel}</Text>
              </View>
              {isRanked && room.result?.guestCrpDelta !== undefined && (
                <View style={[
                  styles.crpDeltaBadge,
                  room.result.guestCrpDelta >= 0 ? styles.crpDeltaPlus : styles.crpDeltaMinus
                ]}>
                  <Text style={[
                    styles.crpDeltaText,
                    room.result.guestCrpDelta >= 0 ? styles.crpDeltaTextPlus : styles.crpDeltaTextMinus
                  ]}>
                    {room.result.guestCrpDelta >= 0 ? `+${room.result.guestCrpDelta}` : room.result.guestCrpDelta} CRP
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.seekingSlot}>
              <View style={styles.seekingAvatarDashed}>
                <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.seekingTitle}>Tìm đối thủ</Text>
              <View style={styles.targetLevelPill}>
                <Text style={styles.targetLevelText} numberOfLines={1}>
                  {room.desiredLevels && room.desiredLevels.length > 0 ? room.desiredLevels.join(', ') : 'Tương đương'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── Status Action Notice Callout (For My Matches) ── */}
      {isMyMatchView && (room.status === 'SCORE_CONFIRMING' || room.status === 'SCORE_PENDING') && (
        <View style={styles.urgentNoticeBox}>
          <Ionicons name="time" size={16} color="#C2410C" />
          <Text style={styles.urgentNoticeText}>
            {room.permissions?.canConfirmScore
              ? 'Đối thủ đã gửi kết quả trận đấu. Chạm để duyệt tỷ số ngay.'
              : 'Đã gửi kết quả trận đấu. Đang chờ đối thủ xác nhận...'}
          </Text>
        </View>
      )}

      {isMyMatchView && room.status === 'OPEN' && (room.applicants || []).filter((a: any) => a.status === 'PENDING').length > 0 && (
        <View style={[styles.urgentNoticeBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <Ionicons name="people" size={16} color="#059669" />
          <Text style={[styles.urgentNoticeText, { color: '#065F46' }]}>
            Có {(room.applicants || []).filter((a: any) => a.status === 'PENDING').length} CLB đang gửi lời mời ghép trận với bạn!
          </Text>
        </View>
      )}

      {/* ── Venue Location & Time Info Block ── */}
      <View style={styles.venueInfoBlock}>
        <View style={styles.venueRow}>
          <View style={styles.venueIconCircle}>
            <Ionicons name="location-sharp" size={13} color={COLORS.primary} />
          </View>
          <Text style={styles.venueNameText} numberOfLines={1}>
            {booking.facilityName}
            {booking.courtName ? ` • ${booking.courtName}` : ''}
            {booking.format ? ` (${booking.format})` : ''}
          </Text>
        </View>

        <View style={styles.venueRow}>
          <View style={[styles.venueIconCircle, { backgroundColor: 'rgba(2, 132, 199, 0.1)' }]}>
            <Ionicons name="time" size={13} color="#0284C7" />
          </View>
          <Text style={styles.timeText} numberOfLines={1}>
            {booking.date} • <Text style={styles.timeHighlight}>{booking.startTime} - {booking.endTime}</Text>
          </Text>
        </View>
      </View>

      {/* ── Footer: Fee Split Rule & Action CTA ── */}
      <View style={styles.cardFooter}>
        <View style={styles.feeRuleBox}>
          <Ionicons name="flame" size={14} color="#EA580C" />
          <Text style={styles.feeRuleText} numberOfLines={1}>
            {getFeeSplitLabel()}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[
          styles.actionBtn,
          (room.status === 'SCORE_CONFIRMING' && room.permissions?.canConfirmScore) && styles.actionBtnUrgent,
        ]}>
          <Text style={styles.actionBtnText}>{getActionBtnLabel()}</Text>
          <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },
  myMatchCard: {
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  headerLeftTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
  },
  sportBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
  },
  rankedBadge: {
    backgroundColor: '#FEF3C7',
  },
  friendlyBadge: {
    backgroundColor: '#E0F2FE',
  },
  typeBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
  },
  rankedText: {
    color: '#B45309',
  },
  friendlyText: {
    color: '#0284C7',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  statusPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '800',
  },
  battleArena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myBattleArena: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  teamAvatarWrap: {
    position: 'relative',
    marginBottom: 2,
  },
  teamAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    ...TYPOGRAPHY.titleMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  hostCrownBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  teamName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    maxWidth: 105,
  },
  teamMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  teamEloText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
  },
  teamLevelText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  crpDeltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
  },
  crpDeltaPlus: {
    backgroundColor: '#DCFCE7',
  },
  crpDeltaMinus: {
    backgroundColor: '#FEE2E2',
  },
  crpDeltaText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  crpDeltaTextPlus: {
    color: '#15803D',
  },
  crpDeltaTextMinus: {
    color: '#B91C1C',
  },
  vsBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    gap: 4,
  },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  vsText: {
    color: '#F8FAFC',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  vsSubline: {
    width: 24,
    height: 2,
    backgroundColor: '#CBD5E1',
    borderRadius: 1,
  },
  scoreHeroBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    gap: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  scoreHeroText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  finalTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  finalTagText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  pendingTag: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  pendingTagText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.3,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  balanceChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  seekingSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  seekingAvatarDashed: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
    marginBottom: 2,
  },
  seekingTitle: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 11.5,
  },
  targetLevelPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  targetLevelText: {
    ...TYPOGRAPHY.labelSm,
    color: '#6D28D9',
    fontWeight: '700',
    fontSize: 9.5,
    maxWidth: 90,
  },
  urgentNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  urgentNoticeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C2410C',
    flex: 1,
  },
  venueInfoBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    gap: 6,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueNameText: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
    flex: 1,
  },
  timeText: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11.5,
    color: '#64748B',
    flex: 1,
  },
  timeHighlight: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    gap: 10,
  },
  feeRuleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  feeRuleText: {
    ...TYPOGRAPHY.labelSm,
    color: '#C2410C',
    fontWeight: '700',
    fontSize: 11,
    flexShrink: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 13,
    paddingVertical: 7.5,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnUrgent: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
  },
  actionBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11.5,
  },
});


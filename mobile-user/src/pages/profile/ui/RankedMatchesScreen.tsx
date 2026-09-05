import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  StatusBar,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usersApi, RankedMatchHistoryItemDto } from '../../../shared/api/users';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar } from '../../../shared/ui';

type FilterType = 'ALL' | 'XE_VE' | 'CLUB_RANKED' | 'WIN' | 'LOSS';

export function RankedMatchesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<RankedMatchHistoryItemDto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<RankedMatchHistoryItemDto | null>(null);

  const fetchRankedHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.getRankedMatchHistory();
      setMatches(data);
    } catch (err: any) {
      Alert.alert('Thông báo', err.message || 'Không thể tải lịch sử trận đấu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankedHistory();
  }, [fetchRankedHistory]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (selectedFilter === 'XE_VE') return m.matchType === 'XE_VE';
      if (selectedFilter === 'CLUB_RANKED') return m.matchType === 'CLUB_RANKED';
      if (selectedFilter === 'WIN') return m.userOutcome === 'WIN';
      if (selectedFilter === 'LOSS') return m.userOutcome === 'LOSS';
      return true;
    });
  }, [matches, selectedFilter]);

  const totalWins = matches.filter((m) => m.userOutcome === 'WIN').length;
  const winRate = matches.length > 0 ? Math.round((totalWins / matches.length) * 100) : 0;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch {
      return isoString;
    }
  };

  const getSportIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('bóng đá') || lower.includes('football')) return 'soccer';
    if (lower.includes('cầu lông') || lower.includes('badminton')) return 'badminton';
    if (lower.includes('tennis')) return 'tennis';
    if (lower.includes('bóng rổ') || lower.includes('basketball')) return 'basketball';
    if (lower.includes('pickleball')) return 'tennis-ball';
    return 'trophy-outline';
  };

  const getOutcomeConfig = (outcome: string) => {
    switch (outcome) {
      case 'WIN':
        return {
          label: 'THẮNG',
          bg: '#ECFDF5',
          text: '#059669',
          border: '#A7F3D0',
          icon: 'trophy',
        };
      case 'LOSS':
        return {
          label: 'THUA',
          bg: '#FEF2F2',
          text: '#DC2626',
          border: '#FECACA',
          icon: 'close-circle',
        };
      case 'DRAW':
      default:
        return {
          label: 'HÒA',
          bg: '#FEF3C7',
          text: '#D97706',
          border: '#FDE68A',
          icon: 'remove-circle',
        };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch Sử Trận Xếp Hạng</Text>
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => router.push('/profile/elo-guide' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={22} color="#064E3B" />
        </TouchableOpacity>
      </View>

      {/* Filter Horizontal Scroll */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'XE_VE', label: 'Xé Vé' },
            { key: 'CLUB_RANKED', label: 'Xếp Hạng CLB' },
            { key: 'WIN', label: 'Trận Thắng' },
            { key: 'LOSS', label: 'Trận Thua' },
          ].map((f) => {
            const isSelected = selectedFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(f.key as FilterType)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#064E3B" />
          <Text style={styles.loadingText}>Đang tải lịch sử trận đấu...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Performance Overview Banner (Fixed text wrapping & compact display) */}
          <LinearGradient
            colors={['#064E3B', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsBanner}
          >
            <View style={styles.statsBannerRow}>
              <View style={styles.statsBannerCol}>
                <Text style={styles.statsBannerNum}>{matches.length}</Text>
                <Text style={styles.statsBannerLabel}>Trận Đã Đấu</Text>
              </View>
              <View style={styles.statsBannerDivider} />
              <View style={styles.statsBannerCol}>
                <Text style={[styles.statsBannerNum, { color: '#6EE7B7' }]}>{totalWins}</Text>
                <Text style={styles.statsBannerLabel}>Chiến Thắng</Text>
              </View>
              <View style={styles.statsBannerDivider} />
              <View style={styles.statsBannerCol}>
                <Text style={[styles.statsBannerNum, { color: '#93C5FD' }]}>{winRate}%</Text>
                <Text style={styles.statsBannerLabel}>Tỉ Lệ Thắng</Text>
              </View>
            </View>
          </LinearGradient>

          {/* List of Matches */}
          {filteredMatches.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="trophy-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Chưa có trận đấu nào</Text>
              <Text style={styles.emptySubtitle}>
                Hãy tham gia các ca Xé Vé hoặc thách đấu Xếp hạng CLB để bắt đầu tích lũy điểm xếp hạng Elo!
              </Text>
            </View>
          ) : (
            <View style={styles.matchesList}>
              {filteredMatches.map((m) => {
                const outcome = getOutcomeConfig(m.userOutcome);
                const isXeVe = m.matchType === 'XE_VE';
                const sportIconName = getSportIcon(m.sportName);

                return (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.matchCard}
                    onPress={() => setSelectedMatchForDetail(m)}
                    activeOpacity={0.85}
                  >
                    {/* Top Row: Sport Badge + Match Type Badge + Time */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardHeaderBadges}>
                        {/* Match Type Badge */}
                        <View
                          style={[
                            styles.matchTypeBadge,
                            { backgroundColor: isXeVe ? '#EFF6FF' : '#FEF3C7', borderColor: isXeVe ? '#BFDBFE' : '#FDE68A' },
                          ]}
                        >
                          <Ionicons
                            name={isXeVe ? 'ticket-outline' : 'trophy-outline'}
                            size={12}
                            color={isXeVe ? '#2563EB' : '#D97706'}
                          />
                          <Text style={[styles.matchTypeBadgeText, { color: isXeVe ? '#2563EB' : '#D97706' }]}>
                            {isXeVe ? 'XÉ VÉ' : 'CLB RANKED'}
                          </Text>
                        </View>

                        {/* Sport Pill */}
                        <View style={styles.sportPill}>
                          <MaterialCommunityIcons
                            name={sportIconName as any}
                            size={13}
                            color="#064E3B"
                          />
                          <Text style={styles.sportPillText}>{m.sportName}</Text>
                        </View>
                      </View>

                      <Text style={styles.playedAtText}>{formatDate(m.playedAt)}</Text>
                    </View>

                    {/* Venue & Court Name */}
                    <View style={styles.venueRow}>
                      <Ionicons name="location-outline" size={13} color="#64748B" />
                      <Text style={styles.venueText} numberOfLines={1}>
                        {m.venueName} {m.courtName ? `• ${m.courtName}` : ''}
                      </Text>
                    </View>

                    {/* Match Centerpiece: Teams & Score */}
                    <View style={styles.matchCenterpiece}>
                      {/* Host Team */}
                      <View style={styles.teamCol}>
                        <View style={styles.teamAvatarWrap}>
                          <Avatar size={38} source={m.hostAvatarUrl} fallbackType={isXeVe ? 'user' : 'club'} />
                          {m.userSide === 'HOST' && (
                            <View style={styles.userBadgeOnAvatar}>
                              <Text style={styles.userBadgeOnAvatarText}>BẠN</Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.teamNameText,
                            m.userSide === 'HOST' && styles.teamNameTextHighlight,
                          ]}
                          numberOfLines={1}
                        >
                          {m.hostName}
                        </Text>
                      </View>

                      {/* Score & Outcome Box */}
                      <View style={styles.scoreBox}>
                        <Text style={styles.scoreNumberText}>{m.scoreText}</Text>
                        <View
                          style={[
                            styles.outcomeBadge,
                            { backgroundColor: outcome.bg, borderColor: outcome.border },
                          ]}
                        >
                          <Text style={[styles.outcomeBadgeText, { color: outcome.text }]}>
                            {outcome.label}
                          </Text>
                        </View>
                      </View>

                      {/* Guest Team */}
                      <View style={styles.teamCol}>
                        <View style={styles.teamAvatarWrap}>
                          <Avatar size={38} source={m.guestAvatarUrl} fallbackType={isXeVe ? 'user' : 'club'} />
                          {m.userSide === 'GUEST' && (
                            <View style={styles.userBadgeOnAvatar}>
                              <Text style={styles.userBadgeOnAvatarText}>BẠN</Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.teamNameText,
                            m.userSide === 'GUEST' && styles.teamNameTextHighlight,
                          ]}
                          numberOfLines={1}
                        >
                          {m.guestName}
                        </Text>
                      </View>
                    </View>

                    {/* Footer: Points Progression (Before -> After) & Bonus Tags */}
                    <View style={styles.cardFooter}>
                      <View style={styles.pointsProgressionGroup}>
                        {m.personalEloDelta != null && (
                          <View
                            style={[
                              styles.pointDeltaPill,
                              { backgroundColor: m.personalEloDelta >= 0 ? '#ECFDF5' : '#FEF2F2' },
                            ]}
                          >
                            <Ionicons
                              name={m.personalEloDelta >= 0 ? 'trending-up' : 'trending-down'}
                              size={12}
                              color={m.personalEloDelta >= 0 ? '#059669' : '#DC2626'}
                            />
                            <Text
                              style={[
                                styles.pointDeltaPillText,
                                { color: m.personalEloDelta >= 0 ? '#059669' : '#DC2626' },
                              ]}
                            >
                              {m.eloBefore != null && m.eloAfter != null
                                ? `${m.eloBefore} → ${m.eloAfter} (${m.personalEloDelta >= 0 ? '+' : ''}${m.personalEloDelta} Elo)`
                                : `${m.personalEloDelta >= 0 ? '+' : ''}${m.personalEloDelta} Elo`}
                            </Text>
                          </View>
                        )}

                        {m.clubCrpDelta != null && (
                          <View
                            style={[
                              styles.pointDeltaPill,
                              { backgroundColor: m.clubCrpDelta >= 0 ? '#EFF6FF' : '#FEF2F2' },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="shield-star"
                              size={12}
                              color={m.clubCrpDelta >= 0 ? '#2563EB' : '#DC2626'}
                            />
                            <Text
                              style={[
                                styles.pointDeltaPillText,
                                { color: m.clubCrpDelta >= 0 ? '#2563EB' : '#DC2626' },
                              ]}
                            >
                              {m.crpBefore != null && m.crpAfter != null
                                ? `${m.crpBefore} → ${m.crpAfter} (${m.clubCrpDelta >= 0 ? '+' : ''}${m.clubCrpDelta} CRP)`
                                : `${m.clubCrpDelta >= 0 ? '+' : ''}${m.clubCrpDelta} CRP`}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.footerDetailBtn}>
                        <Text style={styles.footerDetailBtnText}>Chi tiết</Text>
                        <Ionicons name="chevron-forward" size={12} color="#059669" />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Match Details Modal (With Backdrop Dismiss & Polite Human-Centric Breakdown) */}
      <Modal
        visible={!!selectedMatchForDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMatchForDetail(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedMatchForDetail(null)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                {/* Drag Handle */}
                <View style={styles.modalHandleBar} />

                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.modalSportBadge}>
                      <MaterialCommunityIcons
                        name={getSportIcon(selectedMatchForDetail?.sportName || '') as any}
                        size={16}
                        color="#064E3B"
                      />
                      <Text style={styles.modalSportText}>
                        {selectedMatchForDetail?.sportName} • {selectedMatchForDetail?.matchType === 'XE_VE' ? 'Xé Vé' : 'Xếp Hạng CLB'}
                      </Text>
                    </View>
                    <Text style={styles.modalTimeText}>
                      {formatDate(selectedMatchForDetail?.playedAt)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedMatchForDetail(null)}
                    style={styles.modalCloseBtn}
                    hitSlop={10}
                  >
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {selectedMatchForDetail && (
                  <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                    {/* Score Center Hero */}
                    <View style={styles.detailHeroBox}>
                      <View style={styles.detailTeamCol}>
                        <View style={styles.detailAvatarWrap}>
                          <Avatar size={48} source={selectedMatchForDetail.hostAvatarUrl} fallbackType={selectedMatchForDetail.matchType === 'XE_VE' ? 'user' : 'club'} />
                        </View>
                        <Text style={styles.detailTeamName} numberOfLines={2}>
                          {selectedMatchForDetail.hostName}
                        </Text>
                        {selectedMatchForDetail.userSide === 'HOST' && (
                          <View style={styles.detailYouTag}>
                            <Text style={styles.detailYouTagText}>ĐỘI CỦA BẠN</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.detailScoreCol}>
                        <Text style={styles.detailScoreBig}>{selectedMatchForDetail.scoreText}</Text>
                        {(() => {
                          const oc = getOutcomeConfig(selectedMatchForDetail.userOutcome);
                          return (
                            <View style={[styles.outcomeBadge, { backgroundColor: oc.bg, borderColor: oc.border, paddingHorizontal: 12, paddingVertical: 4 }]}>
                              <Text style={[styles.outcomeBadgeText, { color: oc.text, fontSize: 11 }]}>
                                {oc.label}
                              </Text>
                            </View>
                          );
                        })()}
                      </View>

                      <View style={styles.detailTeamCol}>
                        <View style={styles.detailAvatarWrap}>
                          <Avatar size={48} source={selectedMatchForDetail.guestAvatarUrl} fallbackType={selectedMatchForDetail.matchType === 'XE_VE' ? 'user' : 'club'} />
                        </View>
                        <Text style={styles.detailTeamName} numberOfLines={2}>
                          {selectedMatchForDetail.guestName}
                        </Text>
                        {selectedMatchForDetail.userSide === 'GUEST' && (
                          <View style={styles.detailYouTag}>
                            <Text style={styles.detailYouTagText}>ĐỘI CỦA BẠN</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Venue Info Card */}
                    <View style={styles.detailInfoSection}>
                      <View style={styles.detailInfoRow}>
                        <Ionicons name="location" size={16} color="#059669" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailVenueTitle}>{selectedMatchForDetail.venueName}</Text>
                          {selectedMatchForDetail.courtName ? (
                            <Text style={styles.detailCourtSub}>{selectedMatchForDetail.courtName}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    {/* Points Delta Breakdown */}
                    <View style={styles.detailSectionBox}>
                      <Text style={styles.detailSectionTitle}>THAY ĐỔI ĐIỂM XẾP HẠNG</Text>
                      <View style={styles.detailPointsGrid}>
                        {selectedMatchForDetail.personalEloDelta != null && (
                          <View style={styles.pointDetailCard}>
                            <Text style={styles.pointDetailLabel}>Điểm Elo Cá Nhân</Text>
                            <Text
                              style={[
                                styles.pointDetailDelta,
                                { color: selectedMatchForDetail.personalEloDelta >= 0 ? '#059669' : '#DC2626' },
                              ]}
                            >
                              {selectedMatchForDetail.personalEloDelta >= 0 ? '+' : ''}
                              {selectedMatchForDetail.personalEloDelta} Elo
                            </Text>
                            {selectedMatchForDetail.eloBefore != null && selectedMatchForDetail.eloAfter != null && (
                              <Text style={styles.pointDetailSub}>
                                Từ {selectedMatchForDetail.eloBefore} → {selectedMatchForDetail.eloAfter}
                              </Text>
                            )}
                          </View>
                        )}

                        {selectedMatchForDetail.clubCrpDelta != null && (
                          <View style={styles.pointDetailCard}>
                            <Text style={styles.pointDetailLabel}>Điểm CLB (CRP)</Text>
                            <Text
                              style={[
                                styles.pointDetailDelta,
                                { color: selectedMatchForDetail.clubCrpDelta >= 0 ? '#2563EB' : '#DC2626' },
                              ]}
                            >
                              {selectedMatchForDetail.clubCrpDelta >= 0 ? '+' : ''}
                              {selectedMatchForDetail.clubCrpDelta} CRP
                            </Text>
                            {selectedMatchForDetail.crpBefore != null && selectedMatchForDetail.crpAfter != null && (
                              <Text style={styles.pointDetailSub}>
                                Từ {selectedMatchForDetail.crpBefore} → {selectedMatchForDetail.crpAfter}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Polite Human-Friendly Explanations */}
                    <View style={styles.detailSectionBox}>
                      <Text style={styles.detailSectionTitle}>GIẢI THÍCH CHI TIẾT TÍNH ĐIỂM</Text>
                      <View style={styles.explanationCardsList}>
                        {selectedMatchForDetail.explanation?.map((item, index) => (
                          <View key={index} style={styles.explanationItemRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#059669" />
                            <Text style={styles.explanationItemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Bonus Badges */}
                    {selectedMatchForDetail.bonusNotes && selectedMatchForDetail.bonusNotes.length > 0 && (
                      <View style={styles.detailSectionBox}>
                        <Text style={styles.detailSectionTitle}>GHI CHÚ & ĐIỂM THƯỞNG</Text>
                        <View style={styles.bonusTagRow}>
                          {selectedMatchForDetail.bonusNotes.map((note, idx) => (
                            <View key={idx} style={styles.bonusModalTag}>
                              <Ionicons name="gift-outline" size={13} color="#D97706" />
                              <Text style={styles.bonusModalTagText}>{note}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Action Button to Open Full Guide */}
                    <TouchableOpacity
                      style={styles.guideLinkBtn}
                      onPress={() => {
                        setSelectedMatchForDetail(null);
                        router.push('/profile/elo-guide' as any);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="help-circle-outline" size={16} color="#064E3B" />
                      <Text style={styles.guideLinkBtnText}>Tìm hiểu thêm về Quy tắc Elo & CRP</Text>
                      <Ionicons name="chevron-forward" size={14} color="#064E3B" />
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 14,
  },
  statsBanner: {
    borderRadius: 18,
    padding: 16,
  },
  statsBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statsBannerCol: {
    alignItems: 'center',
    flex: 1,
  },
  statsBannerNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statsBannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D1FAE5',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statsBannerDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  matchesList: {
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  matchTypeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  sportPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#064E3B',
  },
  playedAtText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  venueText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  matchCenterpiece: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  teamAvatarWrap: {
    position: 'relative',
  },
  teamAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  teamAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeOnAvatar: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    backgroundColor: '#059669',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userBadgeOnAvatarText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  teamNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    maxWidth: 100,
  },
  teamNameTextHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  scoreBox: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  scoreNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  outcomeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  outcomeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  pointsProgressionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  pointDeltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pointDeltaPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 8,
  },
  footerDetailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: {
    gap: 2,
  },
  modalSportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalSportText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalTimeText: {
    fontSize: 12,
    color: '#64748B',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollBody: {
    marginTop: 12,
  },
  detailHeroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailTeamCol: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  detailAvatarWrap: {
    position: 'relative',
  },
  detailAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTeamName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  detailYouTag: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detailYouTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  detailScoreCol: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  detailScoreBig: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
  },
  detailInfoSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailVenueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailCourtSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  detailSectionBox: {
    marginTop: 14,
    gap: 8,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  detailPointsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  pointDetailCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  pointDetailLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  pointDetailDelta: {
    fontSize: 16,
    fontWeight: '800',
  },
  pointDetailSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  explanationCardsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  explanationItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  explanationItemText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 17,
  },
  bonusTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bonusModalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  bonusModalTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  guideLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  guideLinkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
    flex: 1,
    marginLeft: 8,
  },
});

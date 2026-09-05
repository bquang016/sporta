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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usersApi, UserSportOverviewDto } from '../../../shared/api/users';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

type SportTabFilter = 'ALL' | 'VERIFIED' | 'CALIBRATING' | 'UNVERIFIED';

const SPORT_LEVELS = [
  { key: 'WEAK', label: 'Yếu', elo: 800, range: '0 - 899', desc: 'Mới tập chơi, nắm luật cơ bản, đang làm quen cảm giác bóng' },
  { key: 'WEAK_AVERAGE', label: 'Trung bình - Yếu', elo: 1050, range: '900 - 1199', desc: 'Chơi phong trào thường xuyên, thể lực trung bình, xử lý cơ bản' },
  { key: 'AVERAGE', label: 'Trung bình', elo: 1350, range: '1200 - 1499', desc: 'Kỹ thuật ổn định, hiểu chiến thuật, kiểm soát nhịp độ tốt' },
  { key: 'AVERAGE_GOOD', label: 'Trung bình - Khá', elo: 1650, range: '1500 - 1799', desc: 'Kỹ năng vững vàng, xử lý bóng nhanh, thể lực dồi dào' },
  { key: 'GOOD', label: 'Bán chuyên', elo: 1950, range: '1800 - 2099', desc: 'Tập luyện bài bản, thi đấu giải phong trào, kỹ chiến thuật cao' },
  { key: 'PRO', label: 'Chuyên nghiệp', elo: 2200, range: '2100+', desc: 'Vận động viên thi đấu chuyên nghiệp, đẳng cấp đỉnh cao' },
];

export function SportsEloScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<UserSportOverviewDto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<SportTabFilter>('ALL');
  const [selectedSportForEdit, setSelectedSportForEdit] = useState<UserSportOverviewDto | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchSportsElo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.getSportsEloOverview();
      setSports(data);
    } catch (err: any) {
      Alert.alert('Thông báo', err.message || 'Không thể tải danh sách môn thể thao');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSportsElo();
  }, [fetchSportsElo]);

  const handleSelectLevel = async (levelKey: string) => {
    if (!selectedSportForEdit) return;

    const isLocked =
      selectedSportForEdit.eloStatus === 'CALIBRATING' ||
      selectedSportForEdit.eloStatus === 'VERIFIED' ||
      (selectedSportForEdit.placementMatchesPlayed || 0) > 0 ||
      (selectedSportForEdit.totalRankedMatches || 0) > 0;

    if (isLocked) {
      Alert.alert('Không thể chỉnh sửa', 'Môn này đã tham gia trận đấu hoặc đang trong quá trình phân hạng Elo.');
      setSelectedSportForEdit(null);
      return;
    }

    try {
      setUpdating(true);
      const updated = await usersApi.updateSportLevel({
        sportId: selectedSportForEdit.sportId,
        level: levelKey,
      });
      setSports(updated);
      setSelectedSportForEdit(null);
      Alert.alert('Thành công', `Đã cập nhật trình độ môn ${selectedSportForEdit.sportName}!`);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trình độ');
    } finally {
      setUpdating(false);
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

  const filteredSports = useMemo(() => {
    return sports.filter((s) => {
      if (selectedFilter === 'VERIFIED') return s.eloStatus === 'VERIFIED';
      if (selectedFilter === 'CALIBRATING') return s.eloStatus === 'CALIBRATING';
      if (selectedFilter === 'UNVERIFIED') return !s.isRegistered || s.eloStatus === 'UNVERIFIED';
      return true;
    });
  }, [sports, selectedFilter]);

  const verifiedCount = sports.filter((s) => s.eloStatus === 'VERIFIED').length;
  const calibratingCount = sports.filter((s) => s.eloStatus === 'CALIBRATING').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elo Của Bạn</Text>
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => router.push('/profile/elo-guide' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={22} color="#064E3B" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { key: 'ALL', label: `Tất cả (${sports.length})` },
            { key: 'VERIFIED', label: `Đã xác thực (${verifiedCount})` },
            { key: 'CALIBRATING', label: `Đang phân hạng (${calibratingCount})` },
            { key: 'UNVERIFIED', label: 'Chưa xác thực' },
          ].map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(tab.key as SportTabFilter)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#064E3B" />
          <Text style={styles.loadingText}>Đang tải bảng xếp hạng Elo...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Banner */}
          <LinearGradient
            colors={['#064E3B', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryBanner}
          >
            <View style={styles.summaryHeader}>
              <View style={styles.summaryBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#A7F3D0" />
                <Text style={styles.summaryBadgeText}>HỆ THỐNG XẾP HẠNG SPORTA</Text>
              </View>
              <TouchableOpacity
                style={styles.guideLinkHeader}
                onPress={() => router.push('/profile/elo-guide' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.guideLinkHeaderText}>Xem Quy Tắc</Text>
                <Ionicons name="arrow-forward" size={12} color="#A7F3D0" />
              </TouchableOpacity>
            </View>
            <Text style={styles.summaryTitle}>Xếp Hạng Thể Thao Từng Môn</Text>
            <Text style={styles.summarySub}>
              Mỗi bộ môn có hệ thống Elo độc lập. Hoàn thành đủ 5 trận đấu phân hạng để nhận Huy hiệu Xác Thực chính thức!
            </Text>
          </LinearGradient>

          {/* Sports List with Distinct Card Designs per Status */}
          <View style={styles.sportsList}>
            {filteredSports.map((sport) => {
              const iconName = getSportIcon(sport.sportName);
              const status = sport.eloStatus || 'UNVERIFIED';
              const played = sport.placementMatchesPlayed || 0;
              const totalRanked = sport.totalRankedMatches || 0;

              const isVerified = status === 'VERIFIED';
              const isCalibrating = status === 'CALIBRATING';
              const hasPlayedMatches = played > 0 || totalRanked > 0;

              // Configured if registered or has Elo or is in active match lifecycle
              const isConfigured = Boolean(
                sport.isRegistered ||
                sport.eloRating != null ||
                isCalibrating ||
                isVerified ||
                hasPlayedMatches
              );
              const elo = sport.eloRating ?? 1350;
              const levelLabel = sport.levelLabel || 'Chưa thiết lập';

              // Strict locking rule: Can only set up / re-select initial level if NOT verified, NOT calibrating, and 0 matches played
              const canEditLevel = !isVerified && !isCalibrating && !hasPlayedMatches;

              return (
                <View
                  key={sport.sportId}
                  style={[
                    styles.sportCard,
                    isVerified && styles.sportCardVerified,
                    isCalibrating && styles.sportCardCalibrating,
                  ]}
                >
                  {/* Top Bar: Icon + Name + Verification Badge */}
                  <View style={styles.sportCardTop}>
                    <View style={styles.sportInfoGroup}>
                      <View
                        style={[
                          styles.sportIconCircle,
                          {
                            backgroundColor: isVerified ? '#ECFDF5' : isCalibrating ? '#FEF3C7' : '#F1F5F9',
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={iconName as any}
                          size={22}
                          color={isVerified ? '#059669' : isCalibrating ? '#D97706' : '#64748B'}
                        />
                      </View>

                      <View>
                        <View style={styles.sportNameRow}>
                          <Text style={styles.sportNameText}>{sport.sportName}</Text>
                          {/* Verification Badge */}
                          {isVerified ? (
                            <View style={[styles.badgePill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                              <Ionicons name="shield-checkmark" size={11} color="#059669" />
                              <Text style={[styles.badgeText, { color: '#059669' }]}>ĐÃ XÁC THỰC</Text>
                            </View>
                          ) : isCalibrating ? (
                            <View style={[styles.badgePill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                              <MaterialCommunityIcons name="timer-sand" size={11} color="#D97706" />
                              <Text style={[styles.badgeText, { color: '#D97706' }]}>PHÂN HẠNG {played}/5</Text>
                            </View>
                          ) : (
                            <View style={[styles.badgePill, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                              <MaterialCommunityIcons name="shield-account-outline" size={11} color="#64748B" />
                              <Text style={[styles.badgeText, { color: '#64748B' }]}>TỰ KHAI</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.sportLevelSub}>
                          Trình độ: <Text style={styles.levelBoldText}>{levelLabel}</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Elo rating value / Setup CTA */}
                    {isConfigured ? (
                      <View style={styles.eloScoreContainer}>
                        <Text
                          style={[
                            styles.eloScoreNumber,
                            isVerified && { color: '#059669' },
                            isCalibrating && { color: '#D97706' },
                          ]}
                        >
                          {elo.toLocaleString()}
                        </Text>
                        <Text style={styles.eloScoreLabel}>Điểm Elo</Text>
                      </View>
                    ) : canEditLevel ? (
                      <TouchableOpacity
                        style={styles.setupBtn}
                        onPress={() => setSelectedSportForEdit(sport)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.setupBtnText}>Thiết lập</Text>
                        <Ionicons name="add-circle" size={16} color="#059669" />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.eloScoreContainer}>
                        <Text style={[styles.eloScoreNumber, { color: '#64748B' }]}>---</Text>
                        <Text style={styles.eloScoreLabel}>Điểm Elo</Text>
                      </View>
                    )}
                  </View>

                  {/* Calibration Progress Bar for CALIBRATING */}
                  {isCalibrating && (
                    <View style={styles.calibratingProgressBox}>
                      <View style={styles.calibratingProgressHeader}>
                        <Text style={styles.calibratingProgressTitle}>
                          Tiến trình xác thực ({played}/5 trận)
                        </Text>
                        <Text style={styles.calibratingProgressPercent}>
                          {Math.round((played / 5) * 100)}%
                        </Text>
                      </View>
                      <View style={styles.calibratingProgressBar}>
                        <View
                          style={[
                            styles.calibratingProgressFill,
                            { width: `${Math.min(100, Math.max(12, (played / 5) * 100))}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.calibratingProgressHint}>
                        Còn thiếu {5 - played} trận nữa để hoàn tất phân hạng và mở khóa Huy hiệu Xác thực.
                      </Text>
                    </View>
                  )}

                  {/* Stats Row for Registered Sports */}
                  {isConfigured ? (
                    <View style={styles.statsRow}>
                      <View style={styles.statMiniCol}>
                        <Text style={styles.statMiniValue}>{sport.totalRankedMatches}</Text>
                        <Text style={styles.statMiniLabel}>Trận đã đấu</Text>
                      </View>
                      <View style={styles.statMiniDivider} />
                      <View style={styles.statMiniCol}>
                        <Text style={[styles.statMiniValue, { color: '#059669' }]}>{sport.totalWins}</Text>
                        <Text style={styles.statMiniLabel}>Trận thắng</Text>
                      </View>
                      <View style={styles.statMiniDivider} />
                      <View style={styles.statMiniCol}>
                        <Text style={[styles.statMiniValue, { color: '#2563EB' }]}>{sport.winRate}%</Text>
                        <Text style={styles.statMiniLabel}>Tỉ lệ thắng</Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Status Footer Actions / Locked Indicators */}
                  {isConfigured && (
                    <View style={styles.cardBottomBar}>
                      {canEditLevel ? (
                        <TouchableOpacity
                          style={styles.reselectBtn}
                          onPress={() => setSelectedSportForEdit(sport)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="square-edit-outline" size={14} color="#059669" />
                          <Text style={styles.reselectBtnText}>Chọn lại trình độ ban đầu</Text>
                        </TouchableOpacity>
                      ) : isVerified ? (
                        <View style={styles.lockedNoticeRow}>
                          <Ionicons name="shield-checkmark" size={14} color="#059669" />
                          <Text style={[styles.lockedNoticeText, { color: '#059669' }]}>
                            Huy hiệu đã xác thực chính thức • Điểm số cập nhật tự động qua các trận đấu
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.lockedNoticeRow}>
                          <Ionicons name="lock-closed" size={14} color="#D97706" />
                          <Text style={styles.lockedNoticeText}>
                            Đang trong giai đoạn phân hạng • Điểm Elo hiệu chỉnh tự động qua từng trận
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Level Selection Modal */}
      <Modal
        visible={!!selectedSportForEdit}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSportForEdit(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedSportForEdit(null)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalBox}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Chọn trình độ ban đầu</Text>
                    <Text style={styles.modalSubtitle}>
                      Môn: <Text style={{ fontWeight: '700', color: '#064E3B' }}>{selectedSportForEdit?.sportName}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedSportForEdit(null)}
                    style={styles.modalCloseBtn}
                    hitSlop={10}
                  >
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalNotice}>
                  Hệ thống sẽ cấp số điểm Elo khởi điểm tương ứng. Sau khi thi đấu 5 trận đầu, điểm số sẽ tự động hiệu chỉnh chính xác theo năng lực thực tế.
                </Text>

                <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                  <View style={styles.levelOptionsList}>
                    {SPORT_LEVELS.map((lvl) => {
                      const isSelected = selectedSportForEdit?.level === lvl.key;
                      return (
                        <TouchableOpacity
                          key={lvl.key}
                          style={[
                            styles.levelOptionItem,
                            isSelected && styles.levelOptionItemSelected,
                          ]}
                          onPress={() => handleSelectLevel(lvl.key)}
                          disabled={updating}
                          activeOpacity={0.8}
                        >
                          <View style={styles.levelOptionTop}>
                            <View style={styles.levelLabelGroup}>
                              <Text
                                style={[
                                  styles.levelLabelText,
                                  isSelected && styles.levelLabelTextSelected,
                                ]}
                              >
                                {lvl.label}
                              </Text>
                              <View style={styles.levelEloBadge}>
                                <Text style={styles.levelEloBadgeText}>{lvl.elo} Elo ({lvl.range})</Text>
                              </View>
                            </View>

                            <Ionicons
                              name={isSelected ? 'checkmark-circle' : 'radio-button-off'}
                              size={20}
                              color={isSelected ? '#059669' : '#CBD5E1'}
                            />
                          </View>
                          <Text style={styles.levelDescText}>{lvl.desc}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {updating && (
                  <View style={styles.updatingOverlay}>
                    <ActivityIndicator size="small" color="#064E3B" />
                    <Text style={styles.updatingText}>Đang cập nhật...</Text>
                  </View>
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
    gap: 16,
  },
  summaryBanner: {
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  summaryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  guideLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideLinkHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summarySub: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 18,
  },
  sportsList: {
    gap: 14,
  },
  sportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sportCardVerified: {
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
  },
  sportCardCalibrating: {
    borderColor: '#FDE68A',
    borderWidth: 1.5,
  },
  sportCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sportNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sportLevelSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  levelBoldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  eloScoreContainer: {
    alignItems: 'flex-end',
  },
  eloScoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  eloScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  setupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  setupBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  calibratingProgressBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
  },
  calibratingProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calibratingProgressTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  calibratingProgressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  calibratingProgressBar: {
    height: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  calibratingProgressFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 3,
  },
  calibratingProgressHint: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statMiniCol: {
    alignItems: 'center',
    flex: 1,
  },
  statMiniValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  statMiniLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  statMiniDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  cardBottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  reselectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  reselectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  lockedNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  lockedNoticeText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
    lineHeight: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNotice: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  levelOptionsList: {
    gap: 10,
    paddingVertical: 4,
  },
  levelOptionItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  levelOptionItemSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  levelOptionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  levelLabelTextSelected: {
    color: '#064E3B',
  },
  levelEloBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelEloBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  levelDescText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  updatingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 10,
  },
  updatingText: {
    fontSize: 12,
    color: '#064E3B',
    fontWeight: '600',
  },
});

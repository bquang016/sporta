import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SportProfileItem } from '../../../entities/user';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SportDetailModalProps {
  visible: boolean;
  sport: SportProfileItem | null;
  onClose: () => void;
}

export const SportDetailModal = React.memo(({
  visible,
  sport,
  onClose,
}: SportDetailModalProps) => {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'matches'>('profile');

  if (!visible || !sport) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* ── Top Header Navigation ── */}
        <View style={styles.navHeader}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>

          <View style={styles.sportHeaderCenter}>
            <View style={styles.headerIconCircle}>
              <Ionicons
                name={
                  sport.sportName === 'Bóng đá'
                    ? 'football'
                    : sport.sportName === 'Pickleball'
                    ? 'tennisball'
                    : 'fitness'
                }
                size={22}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.headerSportTitle}>{sport.sportName}</Text>
          </View>

          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {/* ── Scrollable Body Content ── */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Metric Summary (MATCHES, ACTIVITIES, AWARDS) */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>MATCHES</Text>
              <Text style={styles.metricValue}>{sport.matchesCount || 35}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>ACTIVITIES</Text>
              <Text style={styles.metricValue}>{sport.activitiesCount || 90}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>AWARDS</Text>
              <Text style={styles.metricValue}>{sport.awardsCount || 0}</Text>
            </View>
          </View>

          {/* ── 2 Tab Switcher (Profile | Matches) ── */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'matches' && styles.tabButtonActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('matches')}
            >
              <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>
                Matches
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── TAB 1: PROFILE CONTENT ── */}
          {activeTab === 'profile' && (
            <View style={styles.tabContent}>
              {/* 3 Rating Cards Row */}
              <View style={styles.ratingCardsRow}>
                <View style={styles.ratingCard}>
                  <View style={styles.duprBadge}>
                    <Text style={styles.duprBadgeText}>DUPR</Text>
                  </View>
                  <Text style={styles.ratingScore}>{sport.duprSingles || 3.925}</Text>
                  <Text style={styles.ratingSubLabel}>Singles</Text>
                  <Text style={styles.reliabilityText}>{sport.duprSinglesReliable || '1% Reliable'}</Text>
                </View>

                <View style={styles.ratingCard}>
                  <View style={styles.duprBadge}>
                    <Text style={styles.duprBadgeText}>DUPR</Text>
                  </View>
                  <Text style={styles.ratingScore}>{sport.duprDoubles || 3.41}</Text>
                  <Text style={styles.ratingSubLabel}>Doubles</Text>
                  <Text style={styles.reliabilityText}>{sport.duprDoublesReliable || '6% Reliable'}</Text>
                </View>

                <View style={styles.ratingCard}>
                  <Text style={styles.selfRatingTitle}>SELF RATING</Text>
                  <Text style={[styles.ratingScore, { marginTop: 12 }]}>{sport.ratingValue || '2.75'}</Text>
                </View>
              </View>

              {/* Yellow Pill Skill Tags Grid */}
              {sport.skillTags && sport.skillTags.length > 0 && (
                <View style={styles.skillsSection}>
                  <View style={styles.skillsGrid}>
                    {sport.skillTags.map((tag) => (
                      <View key={tag.id} style={styles.skillItem}>
                        <View style={styles.yellowPill}>
                          <Text style={styles.yellowPillText}>{tag.label}</Text>
                        </View>
                        <Text style={styles.crdText}>{tag.credits} crd</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Sportsmanship Credits */}
              {sport.sportsmanshipCredits && sport.sportsmanshipCredits.length > 0 && (
                <View style={styles.sportsmanshipSection}>
                  <View style={styles.sportsmanshipGrid}>
                    {sport.sportsmanshipCredits.map((sc) => (
                      <View key={sc.id} style={styles.sportsmanshipItem}>
                        <Text style={styles.sportsmanshipLabel}>{sc.label}</Text>
                        <Text style={styles.crdText}>{sc.credits} crd</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ── TAB 2: MATCHES CONTENT ── */}
          {activeTab === 'matches' && (
            <View style={styles.tabContent}>
              {sport.battles && sport.battles.length > 0 ? (
                sport.battles.map((battle) => (
                  <View key={battle.id} style={styles.battleBlock}>
                    <View style={styles.battleHeader}>
                      <Text style={styles.battleTitle} numberOfLines={1}>
                        {battle.title}
                      </Text>
                      <Text style={styles.battleDate}>{battle.date}</Text>
                    </View>

                    <View style={styles.roundsGrid}>
                      {battle.rounds.map((round) => (
                        <View key={round.id} style={styles.roundCard}>
                          <Text style={styles.roundName}>{round.roundName}</Text>
                          <View style={styles.matchVsRow}>
                            <View style={styles.teamColumn}>
                              <View style={styles.avatarGroup}>
                                {round.team1Avatars.map((url, idx) => (
                                  <Image
                                    key={idx}
                                    source={{ uri: url }}
                                    style={[styles.teamAvatar, idx > 0 && { marginLeft: -10 }]}
                                  />
                                ))}
                              </View>
                              <Text style={styles.teamNames} numberOfLines={2}>
                                {round.team1Names}
                              </Text>
                            </View>

                            <View style={styles.scoreBox}>
                              <Text style={styles.scoreText}>{round.score}</Text>
                            </View>

                            <View style={styles.teamColumn}>
                              <View style={styles.avatarGroup}>
                                {round.team2Avatars.map((url, idx) => (
                                  <Image
                                    key={idx}
                                    source={{ uri: url }}
                                    style={[styles.teamAvatar, idx > 0 && { marginLeft: -10 }]}
                                  />
                                ))}
                              </View>
                              <Text style={styles.teamNames} numberOfLines={2}>
                                {round.team2Names}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>

                    {battle.isDuprSubmitted && (
                      <View style={styles.duprSubmittedRow}>
                        <View style={styles.duprSubmittedBadge}>
                          <Text style={styles.duprMiniBadgeText}>DUPR</Text>
                          <Text style={styles.duprSubmittedText}>Submitted</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyMatches}>
                  <Ionicons name="trophy-outline" size={32} color={COLORS.outline} />
                  <Text style={styles.emptyMatchesText}>Chưa có lịch sử đấu trực tiếp.</Text>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    padding: 6,
  },
  sportHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSportTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  metricValue: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.grayText,
  },
  tabTextActive: {
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  tabContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    gap: SPACING.lg,
  },
  ratingCardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  ratingCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    minHeight: 115,
  },
  duprBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  duprBadgeText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selfRatingTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.grayText,
    letterSpacing: 0.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  ratingScore: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  ratingSubLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
    marginTop: 2,
  },
  reliabilityText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.grayText,
    marginTop: 2,
  },
  skillsSection: {
    alignItems: 'center',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  skillItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 90,
  },
  yellowPill: {
    backgroundColor: '#FACC15',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  yellowPillText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  crdText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.grayText,
  },
  sportsmanshipSection: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  sportsmanshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  sportsmanshipItem: {
    alignItems: 'center',
    gap: 4,
  },
  sportsmanshipLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  battleBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    paddingBottom: 8,
  },
  battleTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  battleDate: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  roundsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  roundCard: {
    width: '49%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.default,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 4,
  },
  roundName: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.grayText,
    textAlign: 'center',
  },
  matchVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceDim,
  },
  teamNames: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 10,
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  scoreBox: {
    paddingHorizontal: 4,
  },
  scoreText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 14,
    fontWeight: '900',
    color: '#2563EB',
  },
  duprSubmittedRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  duprSubmittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  duprMiniBadgeText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 9,
    color: COLORS.primary,
  },
  duprSubmittedText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: COLORS.primary,
  },
  emptyMatches: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyMatchesText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.grayText,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar, Button, Card, Badge } from '../../../shared/ui';
import { useClubs } from '../../../entities/club';

const SPORTS = [
  { id: 'all', name: 'Tất cả' },
  { id: 'football', name: 'Bóng đá', value: 'Bóng đá' },
  { id: 'basketball', name: 'Bóng rổ', value: 'Bóng rổ' },
  { id: 'badminton', name: 'Cầu lông', value: 'Cầu lông' },
  { id: 'pickleball', name: 'Pickleball', value: 'Pickleball' },
];

export function MyClubsScreen() {
  const router = useRouter();
  const { clubs, joinedIds } = useClubs();
  const [selectedSport, setSelectedSport] = useState('all');

  // Filter only clubs that user has joined
  const joinedClubs = clubs.filter(club => joinedIds.includes(club.id));

  const filteredJoinedClubs = joinedClubs.filter(club => {
    const sportObj = SPORTS.find(s => s.id === selectedSport);
    return selectedSport === 'all' || (sportObj && club.sport === sportObj.value);
  });

  const getActivityBadgeVariant = (level: string) => {
    switch (level) {
      case 'Rất sôi nổi': return 'success';
      case 'Trung bình': return 'warning';
      case 'Mới thành lập': return 'info';
      default: return 'default';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.7} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          Câu lạc bộ của tôi
        </Text>
        <Button
          variant="ghost"
          icon="add-circle-outline"
          title="Tạo CLB"
          textStyle={styles.createBtnText}
          style={styles.createBtn}
          onPress={() => router.push('/create-club')}
        />
      </View>

      {/* Sports Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.chipsOuterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.chipsContainer}
          >
            {SPORTS.map((sport) => {
              const isActive = selectedSport === sport.id;
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportChip,
                    isActive && styles.sportChipActive
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSport(sport.id)}
                >
                  <Text style={[
                    styles.sportChipText,
                    isActive && styles.sportChipTextActive
                  ]}>
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Clubs List */}
      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {filteredJoinedClubs.length > 0 ? (
          filteredJoinedClubs.map((club) => (
            <Card 
              key={club.id} 
              variant="default" 
              style={styles.clubCard}
              onPress={() => router.push({
                pathname: '/club-detail-joined/[id]',
                params: { id: club.id }
              })}
            >
              <View style={styles.cardHeader}>
                <Avatar 
                  size="lg" 
                  source={club.avatarImage} 
                  fallbackIcon={club.sportIcon as any} 
                  style={styles.avatar} 
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                  
                  {/* Row with sport and members */}
                  <View style={styles.infoRow}>
                    <Badge text={club.sport} variant="success_flat" style={styles.sportBadge} />
                    <View style={styles.memberBadge}>
                      <MaterialIcons name="people" size={14} color={COLORS.onSurfaceVariant} style={styles.memberIcon} />
                      <Text style={styles.infoText}>
                        {club.members}/{club.maxMembers}
                      </Text>
                    </View>
                    {club.averageElo && (
                      <View style={styles.eloBadge}>
                        <MaterialIcons name="star" size={14} color={COLORS.brandGold} style={styles.eloIcon} />
                        <Text style={styles.infoText}>
                          Elo: {club.averageElo}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Row with Area */}
                  <View style={styles.areaRow}>
                    <MaterialIcons name="location-on" size={14} color={COLORS.primary} style={styles.locationIcon} />
                    <Text style={styles.areaText} numberOfLines={1}>
                      {club.area || 'Chưa cập nhật khu vực'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : joinedClubs.length > 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={64} color={COLORS.outline} />
            <Text style={styles.emptyTitle}>Không tìm thấy câu lạc bộ</Text>
            <Text style={styles.emptyText}>
              Thử đổi bộ lọc môn thể thao khác để tìm câu lạc bộ bạn đã tham gia.
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={64} color={COLORS.outline} />
            <Text style={styles.emptyTitle}>Chưa tham gia câu lạc bộ nào</Text>
            <Text style={styles.emptyText}>
              Hãy khám phá các câu lạc bộ thể thao tuyệt vời xung quanh bạn để bắt đầu giao lưu luyện tập.
            </Text>
            <Button
              variant="primary"
              title="Khám phá ngay"
              icon="search"
              style={styles.exploreBtn}
              onPress={() => router.back()}
            />
          </View>
        ) }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
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
    right: 80,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
  },
  createBtn: {
    paddingHorizontal: SPACING.base,
    height: 36,
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollList: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  clubCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    gap: SPACING.base,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  avatar: {
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  clubName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    marginTop: 4,
  },
  sportBadge: {},
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
  },
  memberIcon: {
    marginRight: -2,
  },
  eloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
  },
  eloIcon: {
    marginRight: -2,
  },
  infoText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationIcon: {
    marginRight: -2,
  },
  areaText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: SPACING.base,
  },
  detailsBtn: {
    width: '100%',
    height: 36,
    borderRadius: BORDER_RADIUS.xl,
    borderColor: COLORS.primary,
  },
  detailsBtnText: {
    color: COLORS.primary,
    fontSize: 13,
  },
  // Modal Details Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    maxHeight: '85%',
    minHeight: '50%',
    overflow: 'hidden',
  },
  detailCoverContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  detailCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeDetailBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarContainer: {
    alignItems: 'flex-start',
    paddingLeft: SPACING.marginMobile,
    marginTop: -35,
    zIndex: 10,
  },
  detailAvatar: {
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceContainer,
  },
  detailScroll: {
    flex: 1,
  },
  detailInfoSection: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.lg,
  },
  detailClubName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    marginBottom: SPACING.base,
  },
  detailBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
    marginBottom: SPACING.md,
  },
  detailMetaContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    gap: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    marginBottom: SPACING.lg,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailMetaText: {
    fontSize: 14,
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    marginBottom: SPACING.base,
  },
  detailDescription: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  detailFooter: {
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 78, 59, 0.08)',
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: BORDER_RADIUS.default,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    marginTop: SPACING.base,
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.base,
  },
  exploreBtn: {
    width: '80%',
    borderRadius: BORDER_RADIUS.default,
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
    gap: SPACING.base,
  },
  chipsOuterContainer: {
    marginHorizontal: -SPACING.marginMobile,
  },
  chipsContainer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.base,
    gap: SPACING.base,
  },
  sportChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sportChipActive: {
    backgroundColor: COLORS.secondaryContainer,
  },
  sportChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
  },
  sportChipTextActive: {
    color: COLORS.onSecondaryContainer,
  },
});

export default MyClubsScreen;

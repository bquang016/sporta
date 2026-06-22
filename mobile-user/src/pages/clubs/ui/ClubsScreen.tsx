import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
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

export function ClubsScreen() {
  const router = useRouter();
  const { clubs, joinedIds } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredClubs = clubs.filter(club => {
    // 1. Show only clubs that user can join (not yet joined)
    const isJoined = joinedIds.includes(club.id);
    if (isJoined) return false;

    // 2. Filter by search query
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          club.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Filter by selected sport
    const sportObj = SPORTS.find(s => s.id === selectedSport);
    const matchesSport = selectedSport === 'all' || (sportObj && club.sport === sportObj.value);

    return matchesSearch && matchesSport;
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
    <View style={styles.container}>
      {/* Header wrapper to color the status bar and notch area white */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Câu lạc bộ</Text>
          <Button
            variant="ghost"
            icon="add-circle-outline"
            title="Tạo CLB"
            textStyle={styles.createBtnText}
            style={styles.createBtn}
            onPress={() => console.log('Create new club')}
          />
        </View>
      </SafeAreaView>

      {/* Search and Filters Section */}
      <View style={styles.filterSection}>
        {/* My Clubs section above search bar */}
        <TouchableOpacity 
          style={styles.myClubsCard} 
          activeOpacity={0.9} 
          onPress={() => router.push('/my-clubs')}
        >
          <View style={styles.myClubsLeft}>
            <View style={styles.myClubsIconContainer}>
              <MaterialIcons name="shield" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.myClubsTitle}>Câu lạc bộ của tôi</Text>
              <Text style={styles.myClubsSub}>Xem {joinedIds.length} câu lạc bộ bạn đã tham gia</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Search Bar at the top of filter section */}
        <View style={[
          styles.searchContainer,
          isSearchFocused && styles.searchContainerFocused
        ]}>
          <MaterialIcons name="search" size={20} color={COLORS.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên CLB hoặc môn thể thao..."
            placeholderTextColor={COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="cancel" size={20} color={COLORS.outline} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Sports filter chips */}
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
        {filteredClubs.length > 0 ? (
          filteredClubs.map((club) => (
            <Card 
              key={club.id} 
              variant="default" 
              style={styles.clubCard}
              onPress={() => router.push({
                pathname: '/club-detail-explore/[id]',
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
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={48} color={COLORS.outline} />
            <Text style={styles.emptyText}>
              {joinedIds.length === clubs.length 
                ? 'Bạn đã tham gia tất cả các câu lạc bộ!'
                : 'Không tìm thấy câu lạc bộ phù hợp'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
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
  headerTitle: {
    fontSize: 20,
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
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
    gap: SPACING.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.2)',
    paddingHorizontal: SPACING.sm,
    height: 44,
    gap: SPACING.base,
  },
  searchContainerFocused: {
    borderColor: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    padding: 0,
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
  scrollList: {
    padding: SPACING.marginMobile,
    paddingBottom: 90, // Avoid overlap with bottom tabs
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
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  emptyText: {
    color: COLORS.outline,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
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
  myClubsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.15)',
    borderRadius: BORDER_RADIUS.lg, // 16px radius for large cards
    padding: SPACING.md,
    // Add subtle shadow for premium look
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  myClubsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  myClubsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myClubsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
  },
  myClubsSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    marginTop: 2,
  },
});

export default ClubsScreen;

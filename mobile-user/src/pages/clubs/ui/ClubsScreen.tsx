import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar, Button, Card, Badge } from '../../../shared/ui';

interface Club {
  id: string;
  name: string;
  sport: string;
  sportIcon: string;
  members: number;
  maxMembers: number;
  activityLevel: 'Rất sôi nổi' | 'Trung bình' | 'Mới thành lập';
  activityColor: string;
  description: string;
}

const MOCK_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'FC Đống Đa Warriors',
    sport: 'Bóng đá',
    sportIcon: 'sports-soccer',
    members: 42,
    maxMembers: 50,
    activityLevel: 'Rất sôi nổi',
    activityColor: COLORS.primary,
    description: 'Nơi tập hợp anh em đam mê bóng đá phủi khu vực Đống Đa, giao lưu hàng tuần.',
  },
  {
    id: 'club-2',
    name: 'Hanoi Badminton Friends',
    sport: 'Cầu lông',
    sportIcon: 'sports-cricket',
    members: 128,
    maxMembers: 150,
    activityLevel: 'Rất sôi nổi',
    activityColor: COLORS.primary,
    description: 'CLB giao lưu cầu lông mọi trình độ tại Hà Nội. Sinh hoạt tối thứ 3, 5, 7.',
  },
  {
    id: 'club-3',
    name: 'Green Tennis Club',
    sport: 'Tennis',
    sportIcon: 'sports-tennis',
    members: 18,
    maxMembers: 30,
    activityLevel: 'Trung bình',
    activityColor: COLORS.secondary,
    description: 'Hội những người chơi tennis bán chuyên và chuyên nghiệp tại Cầu Giấy.',
  },
  {
    id: 'club-4',
    name: 'BK Dunkers',
    sport: 'Bóng rổ',
    sportIcon: 'sports-basketball',
    members: 15,
    maxMembers: 40,
    activityLevel: 'Mới thành lập',
    activityColor: '#2563EB',
    description: 'Cộng đồng bóng rổ cựu sinh viên Bách Khoa, tập luyện cuối tuần.',
  },
];

export function ClubsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my-clubs'>('all');
  const [joinedClubs, setJoinedClubs] = useState<string[]>(['club-1']);

  const handleJoinPress = (id: string) => {
    if (joinedClubs.includes(id)) {
      setJoinedClubs(joinedClubs.filter(clubId => clubId !== id));
    } else {
      setJoinedClubs([...joinedClubs, id]);
    }
  };

  const filteredClubs = MOCK_CLUBS.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || joinedClubs.includes(club.id);
    return matchesSearch && matchesTab;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
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

      {/* Search and Filter Tabs */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên CLB hoặc môn thể thao..."
            placeholderTextColor={COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>Khám phá</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'my-clubs' && styles.tabButtonActive]}
            onPress={() => setActiveTab('my-clubs')}
          >
            <Text style={[styles.tabText, activeTab === 'my-clubs' && styles.tabTextActive]}>CLB của tôi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Clubs List */}
      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {filteredClubs.length > 0 ? (
          filteredClubs.map((club) => {
            const isJoined = joinedClubs.includes(club.id);
            return (
              <Card key={club.id} variant="default" style={styles.clubCard}>
                <View style={styles.cardHeader}>
                  <Avatar size="md" fallbackIcon={club.sportIcon as any} style={styles.avatar} />
                  <View style={styles.headerInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.badges}>
                      <Badge text={club.sport} variant="default" />
                      <View style={styles.memberBadge}>
                        <MaterialIcons name="people" size={14} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.memberText}>
                          {club.members}/{club.maxMembers}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {club.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.activityIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: club.activityColor }]} />
                    <Text style={styles.activityText}>{club.activityLevel}</Text>
                  </View>
                  <Button
                    variant={isJoined ? 'outline' : 'primary'}
                    title={isJoined ? 'Rời nhóm' : 'Tham gia'}
                    icon={isJoined ? 'check' : 'person-add'}
                    style={[styles.joinBtn, isJoined && styles.joinedBtn]}
                    textStyle={isJoined ? styles.joinedBtnText : undefined}
                    onPress={() => handleJoinPress(club.id)}
                  />
                </View>
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={48} color={COLORS.outline} />
            <Text style={styles.emptyText}>Không tìm thấy câu lạc bộ nào</Text>
          </View>
        )}
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
    borderBottomColor: COLORS.outlineVariant,
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
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    gap: SPACING.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.sm,
    height: 40,
    gap: SPACING.base,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    padding: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  tabButton: {
    paddingVertical: SPACING.base,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  scrollList: {
    padding: SPACING.marginMobile,
    paddingBottom: 90, // Avoid overlap with bottom tabs
    gap: SPACING.md,
  },
  clubCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
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
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
  },
  memberText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  description: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activityText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
  },
  joinBtn: {
    height: 32,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
  },
  joinedBtn: {
    borderColor: COLORS.outlineVariant,
  },
  joinedBtnText: {
    color: COLORS.outline,
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
});

export default ClubsScreen;

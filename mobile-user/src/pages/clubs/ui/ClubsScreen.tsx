import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, SearchInput } from '../../../shared/ui';
import { Club, ClubCard, MOCK_CLUBS, SPORTS_FILTERS } from '../../../entities/club';

export function ClubsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('Tất cả');

  // Filter logic
  const filteredClubs = MOCK_CLUBS.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'Tất cả' || club.sport === selectedSport;
    return matchesSearch && matchesSport && club.canJoin;
  });

  const renderClubCard = ({ item }: { item: Club }) => (
    <ClubCard 
      club={item}
      renderActions={() => (
        <Button 
          title="Xem chi tiết"
          variant="outline"
          style={styles.joinButton}
          onPress={() => router.push(`/club/${item.id}`)}
        />
      )}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Top Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>KHÁM PHÁ</Text>
            <Text style={styles.headerTitle}>Hệ Thống CLB</Text>
          </View>
          
          {/* Ghost Button for My Clubs */}
          <Button 
            title="CLB của tôi"
            variant="outline"
            style={styles.myClubsButton}
            textStyle={styles.myClubsText}
            onPress={() => router.push('/my-clubs')}
          >
            <Ionicons name="bookmark-outline" size={16} color="#2b6954" style={styles.myClubsIcon} />
          </Button>
        </View>

        {/* Search Bar - using shared SearchInput */}
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Tìm kiếm câu lạc bộ..."
          style={styles.searchContainer}
          renderRight={() => (
            <Button 
              title=""
              variant="ghost"
              style={styles.filterIconButton}
              onPress={() => {}}
            >
              <Ionicons name="options" size={16} color="#FFFFFF" />
            </Button>
          )}
        />

        {/* Sports Filters horizontal list - Pill chips (24px radius) */}
        <View style={styles.filtersWrapper}>
          <FlatList
            data={SPORTS_FILTERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filtersContainer}
            renderItem={({ item }) => {
              const isActive = selectedSport === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedSport(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* List of Clubs */}
        <View style={styles.listContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>Có thể tham gia</Text>
            <Text style={styles.listCount}>({filteredClubs.length} CLB)</Text>
          </View>

          {filteredClubs.length > 0 ? (
            <FlatList
              data={filteredClubs}
              keyExtractor={(item) => item.id}
              renderItem={renderClubCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#9CA3AF" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Không tìm thấy câu lạc bộ phù hợp.</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Temporary import for TouchableOpacity styling
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16, // margin-mobile
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerSubtitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#444748',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191c20',
    marginTop: 2,
  },
  myClubsButton: {
    borderWidth: 1,
    borderColor: '#2b6954',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minHeight: 44,
  },
  myClubsIcon: {
    marginRight: 6,
  },
  myClubsText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#2b6954',
    fontSize: 13,
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: 20,
  },
  filterIconButton: {
    backgroundColor: '#2b6954',
    width: 36,
    height: 36,
    borderRadius: 18,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 36,
  },
  filtersWrapper: {
    marginBottom: 24,
    marginHorizontal: -16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#c4c7c8', // outline-variant
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24, // chips use 24px/pill radius
    marginRight: 8,
    height: 38,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#adedd3', // secondary-container
    borderColor: '#2b6954',
  },
  filterChipText: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: '#444748',
  },
  filterChipTextActive: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#306d58', // on-secondary-container
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191c20',
  },
  listCount: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 12,
    color: '#444748',
    marginLeft: 6,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  joinButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#191c20',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: 'HankenGrotesk-Regular',
    color: '#444748',
    fontSize: 14,
    textAlign: 'center',
  },
});

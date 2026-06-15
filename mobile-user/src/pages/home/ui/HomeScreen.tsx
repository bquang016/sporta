import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Avatar, Button, Card } from '../../../shared/ui';
import { SearchBar } from '../../../features/search-bar';
import { SportCategories } from '../../../features/sport-categories';
import { AuthCtaBanner } from '../../../features/auth-cta';
import { FacilityCard, Facility } from '../../../entities/facility';
import { MatchCard, Match } from '../../../entities/match';

const NEARBY_FACILITIES: Facility[] = [
  {
    id: 'green-field',
    name: 'Sân Green Field',
    rating: 4.8,
    location: 'Cầu Giấy',
    distance: '1.2km',
    price: '300k',
    status: '🟢 Còn chỗ tối nay',
    statusType: 'success',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAq-tAHmpVpmiMDrZCrWpMXMTdBpiwfcupc53mMrzwvT1FOHxU0AH9ft-_O-cmFyZWA-YZbbCSJVAvl-Vxtudy7wAL22hdB8joDeYHO_BlD6lv1k7-s6FCJHw8Pz8K4h9QJKq50M8TooPNDgtDc3BrreMNeLdK9HQK303C7jocY9NWXk7oQ656wQH1URb-9Q6Gr3kymX-jfBEyvM-kl2oEyeSN9-RQ4zaxVPMonmx3Tstn--C711m2ZyefEBDdoYk_dYjpUDmdGxcQ',
  },
  {
    id: 'dong-da-club',
    name: 'CLB Đống Đa',
    rating: 4.9,
    location: 'Đống Đa',
    distance: '2.5km',
    price: '120k',
    status: '🟡 Sắp hết chỗ',
    statusType: 'warning',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFiiAmFOeiD-HFzd-kWzojRqPjfpefxijnnDWwA-ZAtbHHhLYiy1wJZwvogILl6UwexNkrV9RkD-k6zkFfYKJ2kC3SFWl9IYvLkw_qI1dImnVdgYl4aRWxx3JBlYNPnqLL6SJ2j-81o6gSbQmoHQxZ371H_RKmPx9EwkrbT_5TBkNFGIyfGcm6BvJuT2j9Dc8sovqxpETq6LrbslUPoXmA3f1cZc2THnHsNZbZcRfkjKl6oTo1DWeMa6S24UEPZpaYTyMISwub5Yk',
  },
];

const HOT_MATCHES: Match[] = [
  {
    id: 'match-1',
    title: 'Giao lưu Sân Mỹ Đình',
    time: '19:00 - Hôm nay',
    elo: 'VÀNG',
    eloType: 'gold',
    sportIcon: 'sports-soccer',
    joinedCount: 7,
    maxCount: 10,
    statusText: 'Còn 3 chỗ',
    statusType: 'active',
  },
  {
    id: 'match-2',
    title: 'Bóng rổ Sân Bách Khoa',
    time: '20:30 - Ngày mai',
    elo: 'BẠC',
    eloType: 'silver',
    sportIcon: 'sports-basketball',
    joinedCount: 12,
    maxCount: 12,
    statusText: 'HẾT CHỖ',
    statusType: 'full',
  },
];

export function HomeScreen() {
  const router = useRouter();

  const handleFacilityPress = (id: string) => {
    router.push(`/booking/${id}`);
  };

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  const handleRegisterPress = () => {
    router.push('/(auth)/login'); // Or signup page if available
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar size="md" fallbackIcon="person" />
          <View>
            <Text style={styles.greeting}>Xin chào, Khách!</Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={14} color={COLORS.primary} />
              <Text style={styles.locationText}>Hà Nội</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.logoText}>SPORTA</Text>
          <Button 
            variant="ghost"
            icon="notifications"
            style={styles.notificationButton}
            onPress={() => console.log('Notification pressed')}
          />
        </View>
      </View>
      
      {/* Scrollable Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar 
          onFilterPress={() => console.log('Open Filter Modal')} 
        />
        
        {/* Sport Categories */}
        <SportCategories 
          onCategorySelect={(id) => console.log('Select category:', id)} 
        />
        
        {/* Auth CTA Banner */}
        <AuthCtaBanner 
          onLoginPress={handleLoginPress} 
          onRegisterPress={handleRegisterPress} 
        />
        
        {/* Quick Action Cards */}
        <View style={styles.quickActionsGrid}>
          <Card 
            variant="ghost"
            style={[styles.quickActionCard, styles.actionCardPrimary]}
            onPress={() => console.log('Book now')}
          >
            <MaterialIcons name="event-available" size={24} color={COLORS.primary} />
            <View>
              <Text style={[styles.actionCardTitle, { color: COLORS.primary }]}>Đặt sân ngay</Text>
              <Text style={[styles.actionCardSubtitle, { color: 'rgba(45, 106, 79, 0.7)' }]}>Giữ chỗ tức thì</Text>
            </View>
          </Card>
          
          <Card 
            variant="ghost"
            style={[styles.quickActionCard, styles.actionCardGray]}
            onPress={() => console.log('Match matching')}
          >
            <MaterialIcons name="groups" size={24} color={COLORS.primary} />
            <View>
              <Text style={[styles.actionCardTitle, { color: COLORS.onSurface }]}>Ghép kèo đá</Text>
              <Text style={styles.actionCardSubtitle}>Tìm người chơi cùng</Text>
            </View>
          </Card>
        </View>
        
        {/* Nearby Venues Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sân gần bạn</Text>
            <Button
              variant="ghost"
              icon="arrow-forward"
              style={styles.seeMoreBtn}
              onPress={() => console.log('See more')}
            />
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            decelerationRate="fast"
          >
            {NEARBY_FACILITIES.map((facility) => (
              <View key={facility.id} style={styles.cardContainer}>
                <FacilityCard 
                  facility={facility} 
                  onPress={() => handleFacilityPress(facility.id)}
                  onBookPress={() => handleFacilityPress(facility.id)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
        
        {/* Hot Matches Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trận đấu hot</Text>
            <Button
              variant="ghost"
              title="Lọc"
              icon="keyboard-arrow-down"
              iconPosition="right"
              textStyle={styles.filterDropdownText}
              style={styles.filterDropdown}
              onPress={() => console.log('Open Filter dropdown')}
            />
          </View>
          
          <View style={styles.matchList}>
            {HOT_MATCHES.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onPress={() => console.log('View match detail:', match.id)}
                onJoinPress={() => console.log('Join match:', match.id)}
              />
            ))}
          </View>
        </View>
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
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  notificationButton: {
    padding: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: 100, // Increased to avoid overlap with absolute positioned bottom tab bar
    gap: SPACING.marginMobile,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickActionCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xxl,
    minHeight: 100,
    justifyContent: 'center',
    gap: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionCardPrimary: {
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
  },
  actionCardGray: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  actionCardSubtitle: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
  },
  section: {
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  seeMoreBtn: {
    padding: SPACING.xs,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  filterDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  horizontalScroll: {
    paddingRight: SPACING.marginMobile,
    gap: SPACING.md,
  },
  cardContainer: {
    marginVertical: 4, // prevent shadow cropping
  },
  matchList: {
    gap: SPACING.sm,
  },
});
export default HomeScreen;

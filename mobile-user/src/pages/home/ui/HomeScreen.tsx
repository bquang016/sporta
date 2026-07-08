import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar, Button, Card } from '../../../shared/ui';
import { SearchBar } from '../../../features/search-bar';
import { SportCategories } from '../../../features/sport-categories';
import { AuthCtaBanner } from '../../../features/auth-cta';
import { FacilityCard, Facility } from '../../../entities/facility';
import { MatchCard, Match } from '../../../entities/match';
import { clubStore } from '../../../entities/club';

const NEARBY_FACILITIES: Facility[] = [
  {
    id: 'green-field',
    name: 'Sân Green Field',
    rating: 4.8,
    location: 'Cầu Giấy',
    distance: '1.2km',
    price: '350k',
    status: '🟢 Còn chỗ tối nay',
    statusType: 'success',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRI_WbsF_oyNYiLMb9oK7Dm3y6w39BRYXwgKn4BIuRp7CQ9vb-2NUDL_Fi2bYTm1AGCX8AkcWgfKPcjwP9ba_vXQ--Ro7V-RZMOzvRKSIz3YF985plPNcZoJ2CUCgNb_OMUB6q5yYYbUEd6gxEcPZzhNrQWwrc956zxXGydvPDXN6mk8L-5wHs7UtYzZbtQ8_zlH90kYKNbQ0KgcAto4dmTlMzNATIjHtfNvaokJY_yshJWhunjucTicKeRKwqNyRMG3SHJdgmKMw',
  },
  {
    id: 'dong-da-club',
    name: 'Nhà thi đấu Trung tâm',
    rating: 4.5,
    location: 'Đống Đa',
    distance: '2.5km',
    price: '500k',
    status: '🟡 Sắp hết chỗ',
    statusType: 'warning',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9VjV_Boq-m-L6DQCrUi4TuqXv4ziB_UMEyaSBpCC06D-VhJMf8k0VKDy7cFwJjwZzWqF5MObMpDYZ0bFGvZg3GEbKCaxJc_-K_Sxn3ZAX506_WXTQHUHoeNB75WPXy_R8yDDxK1a4TRDnwUFxwW3GizSR5XXOzrAcdysQLwWOgGUWkiMv9Fsl5Rmi44-ntayXHeMh66KzQzRGm5EN0qgehvk2-x43HOXiUnNotg3zUP9LfRD4u7kT4EcyjgydihqR3aGqF9yEmCo',
  },
];

const HOT_MATCHES: Match[] = [
  {
    id: 'match-1',
    title: 'Sân Green Field',
    time: '18:00 - 20:00 • Hôm nay',
    elo: 'Vàng',
    eloType: 'gold',
    sportIcon: 'sports-soccer',
    joinedCount: 7,
    maxCount: 10,
    statusText: 'Còn 3 chỗ',
    statusType: 'active',
  },
  {
    id: 'match-2',
    title: 'Hoop Heaven Park',
    time: '20:30 - 22:30 • Hôm nay',
    elo: 'Bạc',
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Khách');

  const checkAuth = async () => {
    try {
      let token = '';
      let name = '';
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken') || '';
        name = localStorage.getItem('userName') || '';
      } else {
        token = await SecureStore.getItemAsync('accessToken') || '';
        name = await SecureStore.getItemAsync('userName') || '';
      }

      if (token) {
        setIsAuthenticated(true);
        setUserName(name || 'Thành viên');
      } else {
        setIsAuthenticated(false);
        setUserName('Khách');
      }
    } catch (e) {
      setIsAuthenticated(false);
      setUserName('Khách');
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  const handleFacilityPress = (id: string) => {
    router.push(`/booking/${id}`);
  };

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  const handleRegisterPress = () => {
    router.push('/(auth)/register');
  };

  const handleAvatarPress = () => {
    if (isAuthenticated) {
      if (Platform.OS === 'web') {
        const confirmLogout = window.confirm(`Xin chào, ${userName}! Bạn có muốn đăng xuất tài khoản không?`);
        if (confirmLogout) {
          handleLogout();
        }
      } else {
        Alert.alert(
          'Tài khoản',
          `Xin chào, ${userName}! Bạn có muốn đăng xuất không?`,
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: handleLogout }
          ]
        );
      }
    } else {
      if (Platform.OS === 'web') {
        const confirmLogin = window.confirm('Bạn chưa đăng nhập. Bạn có muốn đăng nhập không?');
        if (confirmLogin) {
          handleLoginPress();
        }
      } else {
        Alert.alert(
          'Đăng nhập',
          'Bạn chưa đăng nhập. Bạn có muốn đăng nhập ngay?',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng nhập', onPress: handleLoginPress }
          ]
        );
      }
    }
  };

  const handleLogout = async () => {
    try {
      clubStore.reset();
      if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('userName');
        await SecureStore.deleteItemAsync('userEmail');
      }
      setIsAuthenticated(false);
      setUserName('Khách');
      if (Platform.OS !== 'web') {
        Alert.alert('Thành công', 'Đăng xuất thành công!');
      } else {
        window.alert('Đăng xuất thành công!');
      }
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header wrapper to color the status bar and notch area white */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
              <Avatar 
                size="md" 
                source={isAuthenticated ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDvAvS8IsEXOMdaPlOpYNiMS9-VKdo8uVg8qolFkyXxdSo-1iLSkwHiiY07MDIyX_bAMvj_gF8fOPA65sQrhzzwfhvvmg5Muh39lsugfq0gfD8bLRE1vCwVnTbBPT3tN-4SzQ73_eTSx_VkGEFhtSoIrO3IYAhKZPrFkTtSyWT-9HBioDHXL5XxtBbz2Tml2ookUYWG1P6ITH3NN4mB0iS24157jehzP-UqpWIxX2JbwVFSxIvmxMyrEEEGu7EjOtb1hgbZJuQNKkM" : null} 
                fallbackIcon="person" 
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Xin chào, {userName}!</Text>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={14} color={COLORS.primary} />
                <Text style={styles.locationText}>Hà Nội</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.logoText}>SPORTA</Text>
            <View style={{ position: 'relative' }}>
              <Button 
                variant="ghost"
                icon="notifications"
                style={styles.notificationButton}
                onPress={() => console.log('Notification pressed')}
              />
              {isAuthenticated && (
                <View style={styles.notificationBadge} />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
      
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
        
        {/* Auth CTA Banner (Only show if guest) */}
        {!isAuthenticated && (
          <AuthCtaBanner 
            onLoginPress={handleLoginPress} 
            onRegisterPress={handleRegisterPress} 
          />
        )}
        
        {/* Quick Action Cards */}
        <View style={styles.quickActionsGrid}>
          <Card 
            variant="ghost"
            style={[
              styles.quickActionCard, 
              isAuthenticated ? styles.actionCardAuthPrimary : styles.actionCardPrimary
            ]}
            onPress={() => console.log('Book now')}
          >
            <MaterialIcons 
              name="event-available" 
              size={24} 
              color={isAuthenticated ? COLORS.onPrimary : COLORS.primary} 
            />
            <View>
              <Text 
                style={[
                  styles.actionCardTitle, 
                  { color: isAuthenticated ? COLORS.onPrimary : COLORS.primary }
                ]}
              >
                Đặt sân ngay
              </Text>
              <Text 
                style={[
                  styles.actionCardSubtitle, 
                  { color: isAuthenticated ? `${COLORS.onPrimary}B3` : `${COLORS.primary}B3` }
                ]}
              >
                Giữ chỗ tức thì
              </Text>
            </View>
          </Card>
          
          <Card 
            variant="ghost"
            style={[
              styles.quickActionCard, 
              isAuthenticated ? styles.actionCardAuthOutline : styles.actionCardGray
            ]}
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
            <Text style={styles.sectionTitle}>
              {isAuthenticated ? 'Sân Chơi Xé Vé' : 'Trận đấu hot'}
            </Text>
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
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  greeting: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  locationText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoText: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
  },
  notificationButton: {
    padding: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: 104, // Multiple of 8 (13 * 8)
    gap: SPACING.marginMobile,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickActionCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, // 16px radius for large cards
    minHeight: 104, // Multiple of 8
    justifyContent: 'center',
    gap: SPACING.xs,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionCardPrimary: {
    backgroundColor: `${COLORS.primary}1A`, // Forest Green at 10% opacity
  },
  actionCardGray: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  actionCardAuthPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionCardAuthOutline: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: `${COLORS.outline}26`, // 15% opacity outline
  },
  notificationBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: SPACING.base,
    height: SPACING.base,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  actionCardTitle: {
    ...TYPOGRAPHY.bodyLg,
    fontWeight: '600',
  },
  actionCardSubtitle: {
    ...TYPOGRAPHY.labelSm,
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
    ...TYPOGRAPHY.headlineLgMobile,
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
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
  },
  horizontalScroll: {
    paddingRight: SPACING.marginMobile,
    gap: SPACING.md,
  },
  cardContainer: {
    marginVertical: SPACING.xs, // Prevent shadow cropping
  },
  matchList: {
    gap: SPACING.sm,
  },
});
export default HomeScreen;

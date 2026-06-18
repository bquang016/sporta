import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Card, Badge } from '../../../shared/ui';

interface MapPin {
  id: string;
  name: string;
  sport: 'soccer' | 'badminton' | 'tennis' | 'basketball';
  rating: number;
  distance: string;
  price: string;
  x: number; // percentage width
  y: number; // percentage height
}

const MOCK_PINS: MapPin[] = [
  { id: '1', name: 'Sân bóng Green Field', sport: 'soccer', rating: 4.8, distance: '0.8 km', price: '300k/h', x: 25, y: 35 },
  { id: '2', name: 'CLB Cầu lông Đống Đa', sport: 'badminton', rating: 4.9, distance: '1.2 km', price: '120k/h', x: 65, y: 20 },
  { id: '3', name: 'Sân Tennis Mỹ Đình', sport: 'tennis', rating: 4.7, distance: '2.5 km', price: '250k/h', x: 40, y: 55 },
  { id: '4', name: 'Nhà thi đấu Bách Khoa', sport: 'basketball', rating: 4.6, distance: '1.9 km', price: '180k/h', x: 70, y: 70 },
];

export function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(MOCK_PINS[0]);

  const filteredPins = MOCK_PINS.filter(pin => {
    const matchesSearch = pin.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || pin.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'soccer': return 'sports-soccer';
      case 'badminton': return 'sports-cricket'; // closest representation or cricket/badminton
      case 'tennis': return 'sports-tennis';
      case 'basketball': return 'sports-basketball';
      default: return 'sports';
    }
  };

  const getSportName = (sport: string) => {
    switch (sport) {
      case 'soccer': return 'Bóng đá';
      case 'badminton': return 'Cầu lông';
      case 'tennis': return 'Tennis';
      case 'basketball': return 'Bóng rổ';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sân vận động, CLB..."
            placeholderTextColor={COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="cancel" size={20} color={COLORS.outline} />
            </TouchableOpacity>
          ) : null}
        </View>
        <Button variant="ghost" icon="tune" style={styles.filterButton} onPress={() => {}} />
      </View>

      {/* Category List */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          <TouchableOpacity
            style={[styles.categoryChip, !selectedSport && styles.categoryChipActive]}
            onPress={() => setSelectedSport(null)}
          >
            <Text style={[styles.categoryChipText, !selectedSport && styles.categoryChipTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          {(['soccer', 'badminton', 'tennis', 'basketball'] as const).map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[styles.categoryChip, selectedSport === sport && styles.categoryChipActive]}
              onPress={() => setSelectedSport(sport)}
            >
              <MaterialIcons
                name={getSportIcon(sport)}
                size={16}
                color={selectedSport === sport ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                style={styles.chipIcon}
              />
              <Text style={[styles.categoryChipText, selectedSport === sport && styles.categoryChipTextActive]}>
                {getSportName(sport)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Simulated Map Canvas */}
      <View style={styles.mapCanvas}>
        {/* Map Grid Elements (Streets Mockup) */}
        <View style={[styles.mapStreet, { top: '30%', left: 0, right: 0, height: 16 }]} />
        <View style={[styles.mapStreet, { top: '60%', left: 0, right: 0, height: 12 }]} />
        <View style={[styles.mapStreet, { left: '35%', top: 0, bottom: 0, width: 14 }]} />
        <View style={[styles.mapStreet, { left: '75%', top: 0, bottom: 0, width: 10 }]} />
        <View style={[styles.mapStreet, { left: '15%', top: '30%', bottom: 0, width: 8, transform: [{ rotate: '45deg' }] }]} />
        
        {/* Map Parks (Green spaces Mockup) */}
        <View style={[styles.mapPark, { top: '10%', left: '10%', width: 80, height: 60 }]} />
        <View style={[styles.mapPark, { top: '45%', right: '10%', width: 70, height: 80 }]} />

        {/* Pins */}
        {filteredPins.map((pin) => {
          const isActive = selectedPin?.id === pin.id;
          return (
            <TouchableOpacity
              key={pin.id}
              style={[
                styles.pinContainer,
                { left: `${pin.x}%`, top: `${pin.y}%` },
                isActive && styles.pinContainerActive
              ]}
              onPress={() => setSelectedPin(pin)}
            >
              <View style={[styles.pinBubble, isActive && styles.pinBubbleActive]}>
                <MaterialIcons
                  name={getSportIcon(pin.sport)}
                  size={18}
                  color={isActive ? COLORS.onPrimary : COLORS.primary}
                />
              </View>
              <View style={[styles.pinArrow, isActive && styles.pinArrowActive]} />
            </TouchableOpacity>
          );
        })}

        {/* Floating Actions on Map */}
        <View style={styles.floatingButtons}>
          <TouchableOpacity style={styles.floatingActionBtn}>
            <MaterialIcons name="add" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingActionBtn}>
            <MaterialIcons name="remove" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.floatingActionBtn, { marginTop: SPACING.base }]}>
            <MaterialIcons name="my-location" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Venue Details (Bottom Sheet UI) */}
      {selectedPin && (
        <Card variant="default" style={styles.bottomCard}>
          <View style={styles.bottomCardHeader}>
            <View style={styles.badgeWrapper}>
              <Badge text={getSportName(selectedPin.sport)} variant="default" />
              <View style={styles.distanceBadge}>
                <MaterialIcons name="directions-walk" size={14} color={COLORS.primary} />
                <Text style={styles.distanceText}>{selectedPin.distance}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color={COLORS.secondary} />
              <Text style={styles.ratingText}>{selectedPin.rating}</Text>
            </View>
          </View>
          
          <Text style={styles.venueName}>{selectedPin.name}</Text>
          <Text style={styles.venuePrice}>
            Giá thuê: <Text style={styles.venuePriceVal}>{selectedPin.price}</Text>
          </Text>

          <View style={styles.cardActions}>
            <Button
              variant="outline"
              title="Đường đi"
              icon="directions"
              style={styles.cardActionBtn}
              onPress={() => console.log('Get directions for', selectedPin.name)}
            />
            <Button
              variant="primary"
              title="Đặt sân ngay"
              icon="event-available"
              style={[styles.cardActionBtn, styles.bookingBtn]}
              onPress={() => console.log('Book venue', selectedPin.id)}
            />
          </View>
        </Card>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.sm,
    height: 44,
    gap: SPACING.base,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    padding: 0,
  },
  filterButton: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryWrapper: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.base,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    gap: SPACING.xs,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
  },
  categoryChipTextActive: {
    color: COLORS.onPrimary,
  },
  chipIcon: {
    marginRight: -2,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#EAEBFF', // Light blue typical of maps
    position: 'relative',
    overflow: 'hidden',
  },
  mapStreet: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  mapPark: {
    position: 'absolute',
    backgroundColor: '#D1FAE5', // Soft green color
    borderRadius: 8,
    opacity: 0.7,
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    zIndex: 1,
  },
  pinContainerActive: {
    zIndex: 10,
  },
  pinBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pinBubbleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.primary,
    marginTop: -2,
  },
  pinArrowActive: {
    borderTopColor: COLORS.primary,
  },
  floatingButtons: {
    position: 'absolute',
    right: SPACING.marginMobile,
    top: SPACING.md,
    gap: 6,
  },
  floatingActionBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 85, // clear bottom navigation bar height (65 + extra spacing)
    left: SPACING.marginMobile,
    right: SPACING.marginMobile,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
    gap: 2,
  },
  distanceText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    marginBottom: 4,
  },
  venuePrice: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    marginBottom: SPACING.md,
  },
  venuePriceVal: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.base,
  },
  cardActionBtn: {
    flex: 1,
    height: 40,
  },
  bookingBtn: {
    backgroundColor: COLORS.primary,
  },
});

export default MapScreen;

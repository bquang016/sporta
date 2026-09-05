import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MyTicketsScreen } from '../../my-tickets/ui/MyTicketsScreen';
import { BookingHistoryScreen } from '../../profile/ui/BookingHistoryScreen';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

export function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'tickets'>('bookings');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Main Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý lịch & vé</Text>
      </View>

      {/* Segmented Control Switcher */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'bookings' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('bookings')}
          activeOpacity={0.85}
        >
          <MaterialIcons 
            name="event" 
            size={18} 
            color={activeTab === 'bookings' ? COLORS.primary : COLORS.onSurfaceVariant} 
          />
          <Text style={[styles.segmentText, activeTab === 'bookings' && styles.segmentTextActive]}>
            Lịch đặt sân
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'tickets' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('tickets')}
          activeOpacity={0.85}
        >
          <MaterialIcons 
            name="confirmation-number" 
            size={18} 
            color={activeTab === 'tickets' ? COLORS.primary : COLORS.onSurfaceVariant} 
          />
          <Text style={[styles.segmentText, activeTab === 'tickets' && styles.segmentTextActive]}>
            Vé xé của tôi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on selected tab */}
      {activeTab === 'tickets' ? (
        <MyTicketsScreen showHeader={false} />
      ) : (
        <BookingHistoryScreen showHeader={false} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  bodyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
});

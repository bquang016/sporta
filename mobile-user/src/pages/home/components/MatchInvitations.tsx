import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MatchInvitation } from '../types';

const MATCH_INVITATIONS: MatchInvitation[] = [
  {
    id: 'inv-1',
    sport: 'Bóng đá',
    title: 'Thiếu 3 người nè!!',
    location: 'Sân Green Field',
    time: '18:00 hôm nay',
    slots: { current: 7, max: 10 },
    gradient: ['#064E3B', '#0D9488'] as const,
    emoji: '🔥',
    imageUrl: 'https://images.unsplash.com/photo-1545151414-8a948e1ea54f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'inv-2',
    sport: 'Bóng rổ',
    title: 'Full court 5v5!',
    location: 'Hoop Heaven Park',
    time: '20:30 hôm nay',
    slots: { current: 8, max: 10 },
    gradient: ['#E65100', '#FB8C00'] as const,
    emoji: '🏀',
    imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'inv-3',
    sport: 'Cầu lông',
    title: 'Đôi nam !!',
    location: 'Sân CMC Đại học',
    time: '17:00 mai',
    slots: { current: 3, max: 4 },
    gradient: ['#1565C0', '#42A5F5'] as const,
    emoji: '🎯',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60',
  },
];

export function MatchInvitations() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Ghép kèo đá</Text>
          <View style={styles.liveDot} />
        </View>
        <TouchableOpacity
          onPress={() => console.log('See all matches')}
          style={styles.seeMoreButton}
          activeOpacity={0.7}
        >
          <Text style={styles.seeMoreText}>Tất cả</Text>
          <MaterialIcons name="arrow-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionSubtitle}>🔥 {MATCH_INVITATIONS.length} trận đang chờ bạn!</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.invitationScroll}
        decelerationRate="fast"
      >
        {/* Danh sách các kèo có sẵn */}
        {MATCH_INVITATIONS.map((inv) => (
          <TouchableOpacity
            key={inv.id}
            activeOpacity={0.85}
            onPress={() => console.log('Join invitation:', inv.id)}
            style={styles.cardContainer}
          >
            <ImageBackground
              source={{ uri: inv.imageUrl }}
              style={styles.invitationCardImage}
              imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
            >
              <View style={styles.invitationOverlay}>
                <Text style={styles.invCardTitle} numberOfLines={1}>{inv.title}</Text>
                
                <View style={styles.infoSection}>
                  <View style={styles.invCardInfo}>
                    <MaterialIcons name="location-on" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.invCardInfoText} numberOfLines={1}>{inv.location}</Text>
                  </View>
                  <View style={styles.invCardInfo}>
                    <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.invCardInfoText} numberOfLines={1}>{inv.time}</Text>
                  </View>
                </View>
                
                <View style={styles.invCardSlots}>
                  <View style={styles.invSlotsBar}>
                    <View style={[styles.invSlotsFill, { width: `${(inv.slots.current / inv.slots.max) * 100}%` }]} />
                  </View>
                  <Text style={styles.invSlotsText}>{inv.slots.current}/{inv.slots.max}</Text>
                </View>
                
                <View style={styles.invJoinBtn}>
                  <Text style={styles.invJoinText}>Tham gia</Text>
                  <MaterialIcons name="arrow-forward" size={14} color={COLORS.primary} />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.base,
    marginVertical: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#10B981',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  seeMoreText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
  invitationScroll: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  cardContainer: {
    width: 180,
  },
  invitationCardImage: {
    width: 180,
    height: 165,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  invitationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Translucent overlay to make white text highly visible
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  invCardTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  infoSection: {
    gap: 2,
  },
  invCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invCardInfoText: {
    ...TYPOGRAPHY.bodyMd,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  invCardSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  invSlotsBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  invSlotsFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
  },
  invSlotsText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontSize: 11,
  },
  invJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 6,
  },
  invJoinText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
});

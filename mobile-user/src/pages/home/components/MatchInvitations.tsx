import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface MatchItem {
  id: string;
  sport: string;
  sportIcon: keyof typeof Ionicons.glyphMap;
  title: string;
  hostName: string;
  hostAvatar: string;
  location: string;
  time: string;
  slotsCurrent: number;
  slotsMax: number;
  level: string;
  imageUrl: string;
  isHot?: boolean;
}

const MATCHES: MatchItem[] = [
  {
    id: 'match-1',
    sport: 'Bóng đá 7',
    sportIcon: 'football-outline',
    title: 'Kèo giao lưu vui vẻ 7v7',
    hostName: 'Tuấn Anh (FC Star)',
    hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    location: 'Sân bóng PVF Hưng Yên',
    time: '19:30 · Hôm nay',
    slotsCurrent: 11,
    slotsMax: 14,
    level: 'Trung bình',
    imageUrl: 'https://images.unsplash.com/photo-1545151414-8a948e1ea54f?w=600&auto=format&fit=crop&q=80',
    isHot: true,
  },
  {
    id: 'match-2',
    sport: 'Pickleball',
    sportIcon: 'tennisball-outline',
    title: 'Kèo đôi nam nữ giao lưu',
    hostName: 'Minh Trang',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    location: 'Cụm sân Pickleball Cầu Giấy',
    time: '18:00 · Ngày mai',
    slotsCurrent: 3,
    slotsMax: 4,
    level: 'Mới chơi',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    isHot: true,
  },
  {
    id: 'match-3',
    sport: 'Cầu lông',
    sportIcon: 'tennisball-outline',
    title: 'Đôi nam trình độ B/C',
    hostName: 'Hoàng Long',
    hostAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    location: 'Sân Cầu Lông Hồ Đền Lừ',
    time: '20:00 · Thứ 7',
    slotsCurrent: 2,
    slotsMax: 4,
    level: 'Khá - Giỏi',
    imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=600&auto=format&fit=crop&q=80',
    isHot: false,
  },
];

export function MatchInvitations() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <Ionicons name="people-outline" size={17} color={COLORS.primary} />
          </View>
          <View>
            <View style={styles.titleWithBadge}>
              <Text style={styles.sectionTitle}>Ghép Kèo Thể Thao</Text>
              <View style={styles.liveBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>Tham gia thi đấu & giao lưu ngay</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/clubs')}
          style={styles.seeAllButton}
          activeOpacity={0.75}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Horizontal Matches List ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
        decelerationRate="fast"
      >
        {MATCHES.map((item) => {
          const slotRatio = item.slotsCurrent / item.slotsMax;
          const slotPercent = Math.min(100, Math.round(slotRatio * 100));
          const slotsLeft = item.slotsMax - item.slotsCurrent;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.cardContainer}
              onPress={() => router.push('/clubs')}
            >
              <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.cardBg}
                imageStyle={styles.cardBgImage}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.25)', 'rgba(0, 20, 15, 0.65)', 'rgba(0, 10, 8, 0.95)']}
                  locations={[0, 0.45, 1]}
                  style={styles.cardGradient}
                >
                  {/* Top Bar: Sport Pill + Hot Pill */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.sportPill}>
                      <Ionicons name={item.sportIcon} size={12} color="#003527" />
                      <Text style={styles.sportPillText}>{item.sport}</Text>
                    </View>

                    {item.isHot && (
                      <View style={styles.hotPill}>
                        <Ionicons name="flame" size={11} color="#FFFFFF" />
                        <Text style={styles.hotPillText}>HOT</Text>
                      </View>
                    )}
                  </View>

                  {/* Middle Info */}
                  <View style={styles.cardMid}>
                    <Text style={styles.matchTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Host */}
                    <View style={styles.hostRow}>
                      <Image source={{ uri: item.hostAvatar }} style={styles.hostAvatar} />
                      <Text style={styles.hostName} numberOfLines={1}>
                        {item.hostName}
                      </Text>
                    </View>

                    {/* Location & Time */}
                    <View style={styles.infoMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.75)" />
                        <Text style={styles.metaItemText} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.75)" />
                        <Text style={styles.metaItemText} numberOfLines={1}>
                          {item.time}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Bottom: Slots + CTA */}
                  <View style={styles.cardBottom}>
                    <View style={styles.slotTrack}>
                      <View style={[styles.slotFill, { width: `${slotPercent}%` }]} />
                    </View>

                    <View style={styles.slotDetailsRow}>
                      <Text style={styles.slotCountText}>
                        Còn <Text style={styles.slotCountBold}>{slotsLeft} chỗ</Text> ({item.slotsCurrent}/{item.slotsMax})
                      </Text>

                      <View style={styles.joinBtn}>
                        <Text style={styles.joinBtnText}>Ghép ngay</Text>
                        <Ionicons name="arrow-forward" size={11} color="#003527" />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.xs + 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  sectionSub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  seeAllText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 11.5,
  },
  scrollList: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  cardContainer: {
    width: 225,
    height: 235,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBg: {
    width: '100%',
    height: '100%',
  },
  cardBgImage: {
    borderRadius: BORDER_RADIUS.xl,
  },
  cardGradient: {
    flex: 1,
    padding: SPACING.md - 2,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
  },
  sportPillText: {
    color: '#003527',
    fontSize: 10.5,
    fontWeight: '900',
  },
  hotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  hotPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  cardMid: {
    gap: 4,
  },
  matchTitle: {
    ...TYPOGRAPHY.titleMd,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14.5,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  hostAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  hostName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  infoMeta: {
    gap: 2,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10.5,
    flex: 1,
  },
  cardBottom: {
    gap: 6,
  },
  slotTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  slotFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  slotDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotCountText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
  },
  slotCountBold: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: BORDER_RADIUS.md,
  },
  joinBtnText: {
    color: '#003527',
    fontSize: 11,
    fontWeight: '900',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { PromoEvent } from '../types';
import { useQuery } from '@tanstack/react-query';
import { voucherApi } from '../../../features/voucher/api';
import { VoucherBanner } from '../../../features/voucher/ui/VoucherBanner';

const PROMO_EVENTS: PromoEvent[] = [
  {
    id: 'promo-1',
    title: 'Siêu Giải Đấu Mùa Hè 2026',
    subtitle: 'Tổng giải thưởng lên tới 50M. Đăng ký ngay!',
    badge: 'Giải đấu',
    gradient: ['#6200EA', '#00B0FF'] as const,
    icon: 'emoji-events',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1713628398381-9fa4a9228891?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGVhZ3VlfGVufDB8fDB8fHww',
  },
  {
    id: 'promo-2',
    title: 'Nhập mã SPORTA50 - Giảm 50k',
    subtitle: 'Áp dụng cho lượt đặt sân giờ vàng 17h-20h.',
    badge: 'Khuyến mãi',
    gradient: ['#00C853', '#00B0FF'] as const,
    icon: 'local-offer',
    imageUrl: '',
  },
  {
    id: 'promo-3',
    title: 'BXH Tuần: Vinh danh Chiến thần',
    subtitle: 'Top 1 ghép kèo nhận ngay 1 tháng miễn phí sân.',
    badge: 'Xếp hạng',
    gradient: ['#FF6D00', '#FFD600'] as const,
    icon: 'military-tech',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1714332694955-456500c17394?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG9ub3J8ZW58MHx8MHx8fDA%3D',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.marginMobile * 2;

export function PromoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: systemVouchers = [] } = useQuery({
    queryKey: ['systemVouchers'],
    queryFn: () => voucherApi.getSystemVouchers(),
  });

  const displayItems = [...systemVouchers, ...PROMO_EVENTS];

  // Tự động chuyển banner sau mỗi 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      if (displayItems.length === 0) return;
      const nextIndex = (activeIndex + 1) % displayItems.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * CARD_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < displayItems.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {displayItems.map((item, index) => {
          if ('discountType' in item) {
            // It's a Voucher
            return <VoucherBanner key={`v-${item.id}`} voucher={item} width={CARD_WIDTH} />;
          }
          // It's a PromoEvent
          const event = item as PromoEvent;
          return (
            <TouchableOpacity key={`p-${event.id}`} activeOpacity={0.9} style={styles.cardContainer}>
              <ImageBackground
                source={{ uri: event.imageUrl }}
                style={styles.imageCard}
                imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
              >
                <View style={styles.overlay}>
                  <View style={styles.cardHeader}>
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{event.badge}</Text>
                    </View>
                    <MaterialIcons name={event.icon as any} size={24} color="rgba(255, 255, 255, 0.9)" />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.title} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.subtitle} numberOfLines={2}>
                      {event.subtitle}
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Dấu chấm chuyển trang (Pagination Dots) sang trọng */}
      <View style={styles.pagination}>
        {displayItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  scrollContent: {
    gap: 0,
  },
  cardContainer: {
    width: CARD_WIDTH,
    paddingHorizontal: 2, // Spacing nhẹ ở rìa để cuộn mượt
  },
  imageCard: {
    width: '100%',
    height: 115,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Lớp phủ đen mờ bảo đảm độ tương phản chữ
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Tag mờ trong suốt sang trọng
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
  },
  cardBody: {
    gap: 2,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '800',
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 16,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: COLORS.outlineVariant,
  },
});

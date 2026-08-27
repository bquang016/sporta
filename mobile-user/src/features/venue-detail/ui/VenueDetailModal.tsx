import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
  Platform,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { fetchVenueDetail } from '../../../entities/facility/api/facilityApi';
import { VenueDetail } from '../../../entities/facility/model/facility.types';
import { Facility } from '../../../entities/facility/ui/FacilityCard';
import {
  MOCK_VENUE_RULES,
  MOCK_GALLERY_IMAGES,
  MOCK_DEFAULT_COURTS,
} from '../model/venueDetailMock';
import {
  ReviewCard,
  ReviewSummaryBanner,
  WriteReviewSheet,
  useVenueReviews,
} from '../../venue-rating';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 190;

export type VenueTabKey =
  | 'info'
  | 'services'
  | 'gallery'
  | 'rules'
  | 'reviews';

interface TabItem {
  key: VenueTabKey;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'info', label: 'Thông tin' },
  { key: 'services', label: 'Dịch vụ' },
  { key: 'gallery', label: 'Hình ảnh' },
  { key: 'rules', label: 'Chính sách & Quy định' },
  { key: 'reviews', label: 'Đánh giá' },
];

// Helper: Distance calculation (Haversine formula in KM)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface VenueDetailModalProps {
  visible: boolean;
  venueId: string | null;
  initialFacility?: Facility | null;
  onClose: () => void;
  onBookNow?: (venueId: string) => void;
}

export function VenueDetailModal({
  visible,
  venueId,
  initialFacility,
  onClose,
  onBookNow,
}: VenueDetailModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [activeTab, setActiveTab] = useState<VenueTabKey>('info');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedReviewFilter, setSelectedReviewFilter] = useState<'all' | '5' | '4'>('all');
  const [showWriteReview, setShowWriteReview] = useState(false);

  // 60FPS Slide & Fade Animation
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Request user location for exact distance calculation
  useEffect(() => {
    if (visible) {
      Location.getLastKnownPositionAsync({})
        .then((loc) => {
          if (loc?.coords) {
            setUserLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        })
        .catch(() => {
          // Fallback gracefully
        });
    }
  }, [visible]);

  // Entrance and Exit animations
  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);
      setActiveTab('info');
      setSelectedReviewFilter('all');

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      if (venueId) {
        let isMounted = true;
        fetchVenueDetail(venueId)
          .then((data) => {
            if (isMounted) setVenue(data);
          })
          .catch((err) => {
            console.log('Error fetching venue detail:', err);
          });

        return () => {
          isMounted = false;
        };
      }
    } else {
      setVenue(null);
      setActiveImageIndex(0);
    }
  }, [visible, venueId]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // PanResponder for smooth Swipe-Down to Dismiss on Header / Top Handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture downwards swipes with sufficient vertical movement
        return gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.6) {
          // Dismiss
          handleClose();
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            tension: 80,
            friction: 12,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Phone Call Action
  const handleCallOwner = () => {
    const rawPhone = venue?.ownerPhone || '0988123456';
    const cleanPhone = rawPhone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch((err) => {
      console.log('Cannot open dialer:', err);
    });
  };

  // Booking Action
  const handleBookingAction = () => {
    const targetId = venueId || (initialFacility?.id ? String(initialFacility.id) : null);
    if (!targetId) return;
    handleClose();
    if (onBookNow) {
      onBookNow(targetId);
    } else {
      router.push(`/booking/${targetId}`);
    }
  };

  // Share Action
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Khám phá cụm sân ${venueName} trên Sporta! Đặt lịch ngay: https://sporta.vn/venues/${venueId || ''}`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  // Open Google Maps Directions with coordinates or address
  const handleOpenDirections = () => {
    const lat = venue?.latitude ?? initialFacility?.latitude;
    const lng = venue?.longitude ?? initialFacility?.longitude;
    const venueLabel = encodeURIComponent(venue?.name || initialFacility?.name || 'Cụm sân Sporta');

    if (lat && lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${venueLabel}@${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${venueLabel})`,
        default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      });
      Linking.openURL(url!).catch(() => {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      });
    } else {
      const addressQuery = encodeURIComponent(
        venue?.location || initialFacility?.location || 'Sân thể thao'
      );
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`);
    }
  };

  // 1. Gather all uploaded images from API
  const allUploadedImages = useMemo(() => {
    const images: string[] = [];
    if (venue?.coverImage) images.push(venue.coverImage);
    if (initialFacility?.imageUrl && !images.includes(initialFacility.imageUrl)) {
      images.push(initialFacility.imageUrl);
    }
    if (venue?.detailImages && venue.detailImages.length > 0) {
      venue.detailImages.forEach((img) => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    return images.length > 0 ? images : MOCK_GALLERY_IMAGES;
  }, [venue, initialFacility]);

  const displayImages = allUploadedImages;

  const handleCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  // 2. Format opening / closing time from API
  const formatTime = (timeStr?: string | null, fallback = '06:00') => {
    if (!timeStr) return fallback;
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  const openTime = formatTime(venue?.openingTime, '06:00');
  const closeTime = formatTime(venue?.closingTime, '23:00');

  // 3. Dynamic Distance Calculation
  const calculatedDistanceStr = useMemo(() => {
    const venueLat = venue?.latitude ?? initialFacility?.latitude;
    const venueLng = venue?.longitude ?? initialFacility?.longitude;

    if (userLocation && venueLat && venueLng) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        venueLat,
        venueLng
      );
      return dist < 1 ? `Cách bạn ${Math.round(dist * 1000)} m` : `Cách bạn ${dist} km`;
    }

    if (initialFacility?.distance) {
      return `Cách bạn ${initialFacility.distance}`;
    }

    return 'Cách bạn 1.2 km';
  }, [userLocation, venue, initialFacility]);

  // 4. Price range from API
  const minPrice =
    venue?.minPrice ??
    (initialFacility?.price
      ? parseInt(initialFacility.price.replace(/\D/g, '')) * 1000
      : 120000);
  const maxPrice = venue?.maxPrice ?? 280000;
  const priceRangeText = `${(minPrice / 1000).toLocaleString('vi-VN')}k - ${(maxPrice / 1000).toLocaleString('vi-VN')}k`;

  // Venue Name & Location from API
  const venueName = venue?.name || initialFacility?.name || 'Cụm Sân Thể Thao';
  const venueLocation = venue?.location || initialFacility?.location || '128 Nguyễn Trãi, Thanh Xuân, Hà Nội';
  const sportName = venue?.sportName || initialFacility?.sport || 'Đa năng';
  const ownerPhoneNumber = venue?.ownerPhone || '0988 123 456';
  const venueDescription =
    venue?.description ||
    `Cụm sân ${venueName} được đầu tư hệ thống thảm sàn cao cấp đạt tiêu chuẩn thi đấu, giàn đèn LED chống chói 360 độ và không gian trần cao thông thoáng, sạch sẽ, mang lại trải nghiệm thi đấu thể thao tuyệt vời cho người chơi.`;

  const courtList = venue?.courts && venue.courts.length > 0 ? venue.courts : MOCK_DEFAULT_COURTS;

  // 5. Load real reviews from API
  const {
    data: reviewData,
    loading: reviewsLoading,
    loadMore: loadMoreReviews,
    refetch: refetchReviews,
  } = useVenueReviews(visible && venueId ? venueId : null);

  // Filter reviews client-side by star rating
  const filteredReviews = (reviewData?.reviews ?? []).filter((rev) => {
    if (selectedReviewFilter === 'all') return true;
    if (selectedReviewFilter === '5') return rev.rating >= 5;
    if (selectedReviewFilter === '4') return rev.rating >= 4 && rev.rating < 5;
    return true;
  });

  const canReview = reviewData?.canReview ?? false;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Floating Sheet Container with Sporta theme */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Top Anchor Header with Gesture Drag Area */}
          <View style={styles.topAnchorHeader} {...panResponder.panHandlers}>
            {/* Top Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Floating Top Actions */}
            <View style={styles.floatingTopActions}>
              <TouchableOpacity
                style={styles.floatingGlassBtn}
                activeOpacity={0.8}
                onPress={handleShare}
              >
                <MaterialIcons name="share" size={17} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.floatingGlassBtn}
                activeOpacity={0.8}
                onPress={handleClose}
              >
                <MaterialIcons name="close" size={19} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Scrollable Body - Locked top bounce to prevent white background exposure */}
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
            {/* 1. Hero Cover Carousel Section */}
            <View style={styles.carouselContainer} {...panResponder.panHandlers}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleCarouselScroll}
                scrollEventThrottle={16}
                bounces={false}
              >
                {displayImages.map((imgUri, index) => (
                  <View key={index} style={styles.imageSlide}>
                    <Image source={{ uri: imgUri }} style={styles.carouselImage} resizeMode="cover" />
                  </View>
                ))}
              </ScrollView>

              {/* Gradient Overlays */}
              <LinearGradient
                colors={['rgba(6, 78, 59, 0.45)', 'transparent']}
                style={styles.topGradientOverlay}
                pointerEvents="none"
              />

              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.4)']}
                style={styles.bottomGradientOverlay}
                pointerEvents="none"
              />

              {/* Image Counter Badge */}
              <View style={styles.carouselCountBadge}>
                <Text style={styles.carouselCountText}>
                  {activeImageIndex + 1}/{displayImages.length}
                </Text>
              </View>
            </View>

            {/* 2. Floating Info Card (Anchored firmly over hero image) */}
            <View style={styles.floatingHeroCardWrapper}>
              {/* Star Rating Curved Sporta Emerald Badge */}
              <View style={styles.starRatingBadgeTop}>
                <MaterialIcons name="star" size={15} color={COLORS.secondary} />
                <Text style={styles.starRatingBadgeText}>
                  {(venue?.averageRating ?? (initialFacility?.rating && initialFacility.rating > 0 ? initialFacility.rating : null)) != null
                    ? `${(venue?.averageRating ?? initialFacility!.rating).toFixed(1)} (${venue?.totalReviews ?? 0} đánh giá)`
                    : 'Chưa có đánh giá'}
                </Text>
              </View>

              <View style={styles.heroCardContent}>
                {/* Header row: Avatar + Name + Sport Tag */}
                <View style={styles.heroCardHeaderRow}>
                  <View style={styles.venueAvatarCircle}>
                    {displayImages[0] ? (
                      <Image source={{ uri: displayImages[0] }} style={styles.venueAvatarImg} />
                    ) : (
                      <MaterialIcons name="sports-tennis" size={26} color={COLORS.primary} />
                    )}
                  </View>

                  <View style={styles.venueNameCol}>
                    <Text style={styles.venueHeroTitle} numberOfLines={2}>
                      {venueName}
                    </Text>
                    <View style={styles.sportOutlineTag}>
                      <MaterialIcons name="sports" size={12} color={COLORS.primary} />
                      <Text style={styles.sportOutlineTagText}>{sportName}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.heroCardDivider} />

                {/* 3 Detail Info Rows with Sporta Primary Icons */}
                <View style={styles.heroInfoRowsList}>
                  {/* Row 1: Location & Distance */}
                  <View style={styles.heroInfoRow}>
                    <View style={styles.heroInfoIconWrapper}>
                      <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
                    </View>
                    <View style={styles.locationTextWrapper}>
                      <Text style={styles.heroInfoText} numberOfLines={2}>
                        {venueLocation}
                      </Text>
                      <View style={styles.distanceInlinePill}>
                        <MaterialIcons name="near-me" size={11} color={COLORS.primary} />
                        <Text style={styles.distanceInlinePillText}>{calculatedDistanceStr}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Row 2: Hours */}
                  <View style={styles.heroInfoRow}>
                    <View style={styles.heroInfoIconWrapper}>
                      <MaterialIcons name="schedule" size={17} color={COLORS.primary} />
                    </View>
                    <Text style={styles.heroInfoText}>
                      {openTime} - {closeTime} (Hàng ngày)
                    </Text>
                  </View>

                  {/* Row 3: Contact Phone */}
                  <TouchableOpacity
                    style={styles.heroInfoRow}
                    activeOpacity={0.75}
                    onPress={handleCallOwner}
                  >
                    <View style={styles.heroInfoIconWrapper}>
                      <MaterialIcons name="phone" size={17} color={COLORS.primary} />
                    </View>
                    <View style={styles.phoneTextCol}>
                      <Text style={styles.heroPhoneLinkText}>Liên hệ: {ownerPhoneNumber}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 3. Horizontal Underline Tabs Navigation */}
            <View style={styles.horizontalTabsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalTabsContainer}
                bounces={false}
              >
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[styles.tabUnderlineItem, isActive && styles.tabUnderlineItemActive]}
                      onPress={() => setActiveTab(tab.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.tabUnderlineText,
                          isActive && styles.tabUnderlineTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. Tab Content Area */}
            <View style={styles.tabContentBody}>
              {/* TAB 1: THÔNG TIN */}
              {activeTab === 'info' && (
                <View style={styles.tabPaneContainer}>
                  {/* Highlights Grid */}
                  <View style={styles.statsCard}>
                    <View style={styles.statCol}>
                      <Text style={styles.statLabel}>Khoảng giá</Text>
                      <Text style={styles.statValueHighlight}>{priceRangeText}</Text>
                      <Text style={styles.statUnit}>/ giờ</Text>
                    </View>
                    <View style={styles.statDivider} />

                    <View style={styles.statCol}>
                      <Text style={styles.statLabel}>Giờ mở cửa</Text>
                      <Text style={styles.statValue}>{openTime} - {closeTime}</Text>
                      <Text style={styles.statUnit}>Hàng ngày</Text>
                    </View>
                    <View style={styles.statDivider} />

                    <View style={styles.statCol}>
                      <Text style={styles.statLabel}>Quy mô</Text>
                      <Text style={styles.statValue}>{courtList.length} Sân</Text>
                      <Text style={styles.statUnit}>Tiêu chuẩn</Text>
                    </View>
                  </View>

                  {/* Navigation Map Action */}
                  <TouchableOpacity
                    style={styles.openDirectionsBtn}
                    activeOpacity={0.85}
                    onPress={handleOpenDirections}
                  >
                    <MaterialIcons name="directions" size={19} color={COLORS.primary} />
                    <Text style={styles.openDirectionsBtnText}>Chỉ đường Google Maps</Text>
                    <MaterialIcons name="open-in-new" size={15} color={COLORS.primary} />
                  </TouchableOpacity>

                  {/* Surcharge Notice if applicable */}
                  {venue?.hasSurcharge && venue.surchargeAmount ? (
                    <View style={styles.surchargeBox}>
                      <MaterialIcons name="info-outline" size={16} color="#B45309" />
                      <Text style={styles.surchargeText}>
                        Phụ phí giờ cao điểm: +{venue.surchargeAmount.toLocaleString('vi-VN')}đ ({venue.surchargeDescription || 'Khung giờ tối & cuối tuần'})
                      </Text>
                    </View>
                  ) : null}

                  {/* Description Section */}
                  <View style={styles.infoDescriptionCard}>
                    <View style={styles.sectionHeadingRow}>
                      <MaterialIcons name="article" size={18} color={COLORS.primary} />
                      <Text style={styles.sectionHeading}>Giới thiệu cụm sân</Text>
                    </View>
                    <Text style={styles.descriptionText}>{venueDescription}</Text>
                  </View>

                  {/* Quick Cancellation Policy Card */}
                  <TouchableOpacity
                    style={styles.quickPolicyCard}
                    activeOpacity={0.85}
                    onPress={() => setActiveTab('rules')}
                  >
                    <View style={styles.quickPolicyHeader}>
                      <View style={styles.quickPolicyIconCircle}>
                        <Ionicons name="shield-checkmark" size={17} color="#047857" />
                      </View>
                      <View style={styles.quickPolicyTitleGroup}>
                        <View style={styles.quickPolicyTitleRow}>
                          <Text style={styles.quickPolicyTitle}>Chính sách hoàn tiền & hủy sân</Text>
                          <View style={styles.quickPolicyGracePill}>
                            <Text style={styles.quickPolicyGracePillText}>Miễn phí 10p đầu</Text>
                          </View>
                        </View>
                        <Text style={styles.quickPolicySubtext} numberOfLines={1}>
                          {venue?.policy
                            ? `Hủy trước ${venue.policy.freeCancellationHours ?? 12}h hoàn 100% • Hủy muộn hoàn ${venue.policy.lateCancellationRefundRate ?? 50}%`
                            : 'Cụm sân này chưa cập nhật chính sách riêng'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.onSurfaceVariant} />
                    </View>
                  </TouchableOpacity>

                  {/* Courts list in venue */}
                  <View style={styles.courtsSectionBlock}>
                    <View style={styles.sectionHeadingRow}>
                      <MaterialIcons name="sports-tennis" size={18} color={COLORS.primary} />
                      <Text style={styles.sectionHeading}>Danh sách sân ({courtList.length} sân)</Text>
                    </View>

                    <View style={styles.courtsListContainer}>
                      {courtList.map((court: any, idx: number) => {
                        const courtNameDisplay = court.name || court.courtName || `Sân ${idx + 1}`;
                        const courtPrice = court.price || court.pricePerHour || minPrice;
                        return (
                          <View key={court.id || idx} style={styles.courtListItem}>
                            <View style={styles.courtListIndexCircle}>
                              <Text style={styles.courtListIndexText}>{idx + 1}</Text>
                            </View>
                            <View style={styles.courtListInfoCol}>
                              <Text style={styles.courtListName}>{courtNameDisplay}</Text>
                              <Text style={styles.courtListSub}>Mặt sàn tiêu chuẩn thi đấu</Text>
                            </View>
                            <View style={styles.courtListPriceCol}>
                              <Text style={styles.courtListPriceNumber}>
                                {(courtPrice / 1000).toLocaleString('vi-VN')}k
                              </Text>
                              <Text style={styles.courtListPriceUnit}>/ giờ</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 2: DỊCH VỤ (Sắp ra mắt) */}
              {activeTab === 'services' && (
                <View style={styles.tabPaneContainer}>
                  <View style={styles.comingSoonCard}>
                    <View style={styles.comingSoonIconCircle}>
                      <Ionicons name="sparkles" size={32} color={COLORS.secondary} />
                    </View>
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonBadgeText}>TÍNH NĂNG ĐANG PHÁT TRIỂN</Text>
                    </View>
                    <Text style={styles.comingSoonTitle}>Dịch vụ tiện ích sắp ra mắt</Text>
                    <Text style={styles.comingSoonSubtitle}>
                      Hệ thống đang tích hợp các dịch vụ tiện ích như thuê vợt & bóng, căn tin giải khát, căng cước và huấn luyện viên trực tiếp trên ứng dụng Sporta.
                    </Text>

                    <View style={styles.comingSoonFeaturesList}>
                      {[
                        'Cho thuê vợt & bóng thi đấu chuyên nghiệp',
                        'Căng cước vợt điện tử lấy ngay tại sân',
                        'Đặt trước nước giải khát & đồ ăn nhẹ',
                        'Huấn luyện viên cá nhân / kèm nhóm',
                      ].map((item, index) => (
                        <View key={index} style={styles.comingSoonFeatureRow}>
                          <MaterialIcons name="check-circle-outline" size={16} color={COLORS.primary} />
                          <Text style={styles.comingSoonFeatureText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 3: HÌNH ẢNH (Toàn bộ hình ảnh thực tế đã tải lên) */}
              {activeTab === 'gallery' && (
                <View style={styles.tabPaneContainer}>
                  <View style={styles.galleryHeaderRow}>
                    <Text style={styles.galleryTotalTitle}>
                      Toàn bộ hình ảnh cụm sân ({allUploadedImages.length} ảnh)
                    </Text>
                  </View>

                  <View style={styles.photoGrid}>
                    {allUploadedImages.map((imgUri, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.photoGridItem}
                        activeOpacity={0.85}
                        onPress={() => setPreviewImageUrl(imgUri)}
                      >
                        <Image source={{ uri: imgUri }} style={styles.photoGridImage} />
                        <View style={styles.photoGridOverlayBadge}>
                          <MaterialIcons name="zoom-in" size={14} color={COLORS.white} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* TAB 4: CHÍNH SÁCH & QUY ĐỊNH */}
              {activeTab === 'rules' && (
                <View style={styles.tabPaneContainer}>
                  {/* 1. Main Policy Section Header */}
                  <View style={styles.sectionHeadingRow}>
                    <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
                    <Text style={styles.sectionHeading}>Chính sách hoàn tiền & Hủy sân</Text>
                  </View>

                  {venue?.policy ? (
                    <View style={styles.policyCardWrapper}>
                      {/* 10-Minute Grace Period Card */}
                      <View style={styles.policyGraceCard}>
                        <View style={styles.policyGraceHeader}>
                          <View style={styles.policyGraceIconBox}>
                            <Ionicons name="flash" size={16} color="#047857" />
                          </View>
                          <View style={styles.policyGraceTitleGroup}>
                            <View style={styles.policyGraceTagRow}>
                              <Text style={styles.policyGraceTitle}>Miễn phí huỷ trong 10 phút sau khi đặt</Text>
                              <View style={styles.freeBadge}>
                                <Text style={styles.freeBadgeText}>Miễn phí 100%</Text>
                              </View>
                            </View>
                            <Text style={styles.policyGraceDesc}>
                              Trong vòng 10 phút sau khi đặt sân thành công, người chơi được miễn phí hủy và hoàn 100% toàn bộ số tiền vào Ví Sporta.
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Policy Tiers List */}
                      <View style={styles.policyTiersList}>
                        {/* Free Cancellation Tier */}
                        <View style={styles.policyTierItem}>
                          <View style={[styles.policyTierIconBox, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="checkmark-circle" size={18} color="#059669" />
                          </View>
                          <View style={styles.policyTierContent}>
                            <View style={styles.policyTierHeader}>
                              <Text style={styles.policyTierTitle}>
                                Hủy trước {venue.policy.freeCancellationHours ?? 12} tiếng
                              </Text>
                              <Text style={[styles.policyTierRate, { color: '#059669' }]}>Hoàn 100%</Text>
                            </View>
                            <Text style={styles.policyTierDesc}>
                              Hoàn 100% giá trị tiền vào Ví Sporta nếu gửi yêu cầu hủy trước giờ thi đấu từ {venue.policy.freeCancellationHours ?? 12} giờ trở lên.
                            </Text>
                          </View>
                        </View>

                        {/* Late Cancellation Tier */}
                        <View style={styles.policyTierItem}>
                          <View style={[styles.policyTierIconBox, { backgroundColor: '#FFFBEB' }]}>
                            <Ionicons name="alert-circle" size={18} color="#D97706" />
                          </View>
                          <View style={styles.policyTierContent}>
                            <View style={styles.policyTierHeader}>
                              <Text style={styles.policyTierTitle}>
                                Hủy từ 2h - {venue.policy.freeCancellationHours ?? 12}h
                              </Text>
                              <Text style={[styles.policyTierRate, { color: '#D97706' }]}>
                                Hoàn {venue.policy.lateCancellationRefundRate ?? 50}%
                              </Text>
                            </View>
                            <Text style={styles.policyTierDesc}>
                              Hoàn {venue.policy.lateCancellationRefundRate ?? 50}% số tiền vào Ví Sporta (khấu trừ {100 - (venue.policy.lateCancellationRefundRate ?? 50)}% phí hủy sân) khi hủy trong khoảng từ 2h đến {venue.policy.freeCancellationHours ?? 12}h trước giờ nhận sân.
                            </Text>
                          </View>
                        </View>

                        {/* Sát giờ (<2h) */}
                        <View style={styles.policyTierItem}>
                          <View style={[styles.policyTierIconBox, { backgroundColor: '#FEF2F2' }]}>
                            <Ionicons name="close-circle" size={18} color="#DC2626" />
                          </View>
                          <View style={styles.policyTierContent}>
                            <View style={styles.policyTierHeader}>
                              <Text style={styles.policyTierTitle}>Sát giờ thi đấu (dưới 2h)</Text>
                              <Text style={[styles.policyTierRate, { color: '#DC2626' }]}>Không hoàn tiền</Text>
                            </View>
                            <Text style={styles.policyTierDesc}>
                              Không hỗ trợ hoàn tiền đối với các yêu cầu hủy dưới 2 tiếng trước giờ thi đấu hoặc sau khi ca thi đấu đã bắt đầu.
                            </Text>
                          </View>
                        </View>

                        {/* Weather Condition Tier */}
                        <View style={styles.policyTierItem}>
                          <View style={[styles.policyTierIconBox, { backgroundColor: '#F0F9FF' }]}>
                            <Ionicons name="rainy" size={18} color="#0284C7" />
                          </View>
                          <View style={styles.policyTierContent}>
                            <View style={styles.policyTierHeader}>
                              <Text style={styles.policyTierTitle}>Thời tiết mưa bão</Text>
                              <Text style={[styles.policyTierRate, { color: venue.policy.rainRescheduleAllowed ? '#0284C7' : '#64748B' }]}>
                                {venue.policy.rainRescheduleAllowed ? 'Hỗ trợ dời lịch' : 'Không dời lịch'}
                              </Text>
                            </View>
                            <Text style={styles.policyTierDesc}>
                              {venue.policy.rainRescheduleAllowed
                                ? 'Cụm sân có áp dụng chính sách hỗ trợ đổi lịch / dời lịch thi đấu khi gặp điều kiện thời tiết bất khả kháng (mưa bão ngập sân).'
                                : 'Cụm sân không hỗ trợ dời lịch tự động do thời tiết, quý khách vui lòng liên hệ trực tiếp chủ sân để được hỗ trợ.'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    /* Fallback when policy is not configured */
                    <View style={styles.policyEmptyFallbackCard}>
                      <View style={styles.policyEmptyIconBox}>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.onSurfaceVariant} />
                      </View>
                      <View style={styles.policyEmptyTextCol}>
                        <Text style={styles.policyEmptyTitle}>Cụm sân này chưa cập nhật chính sách</Text>
                        <Text style={styles.policyEmptyDesc}>
                          Cụm sân hiện chưa thiết lập chính sách hoàn/hủy riêng trên hệ thống. Nếu có nhu cầu thay đổi lịch đặt, bạn vui lòng liên hệ trực tiếp chủ sân qua hotline để được hướng dẫn.
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 2. General Venue House Rules */}
                  <View style={[styles.sectionHeadingRow, { marginTop: SPACING.md }]}>
                    <MaterialIcons name="gavel" size={18} color={COLORS.primary} />
                    <Text style={styles.sectionHeading}>Nội quy chung tại cụm sân</Text>
                  </View>

                  <View style={styles.rulesListContainer}>
                    {MOCK_VENUE_RULES.filter(r => r.id !== 'rule-3').map((rule) => (
                      <View key={rule.id} style={styles.ruleCleanCardItem}>
                        <View style={styles.ruleCleanIconBox}>
                          <MaterialIcons name={rule.icon as any} size={19} color={COLORS.primary} />
                        </View>
                        <View style={styles.ruleCleanTextCol}>
                          <Text style={styles.ruleCleanTitle}>{rule.title}</Text>
                          <Text style={styles.ruleCleanDesc}>{rule.description}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* TAB 5: DANH GIA (Ket noi API thuc) */}
              {activeTab === 'reviews' && (
                <View style={styles.tabPaneContainer}>
                  {/* Summary Banner */}
                  <ReviewSummaryBanner
                    averageRating={reviewData?.averageRating ?? venue?.averageRating ?? 0}
                    totalReviews={reviewData?.totalReviews ?? venue?.totalReviews ?? 0}
                    avgSurfaceScore={reviewData?.avgSurfaceScore ?? 0}
                    avgLightingScore={reviewData?.avgLightingScore ?? 0}
                    avgServiceScore={reviewData?.avgServiceScore ?? 0}
                  />

                  {/* Write / Edit Review Button */}
                  {canReview && (
                    <TouchableOpacity
                      style={styles.writeReviewBtn}
                      activeOpacity={0.85}
                      onPress={() => setShowWriteReview(true)}
                    >
                      <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                      <Text style={styles.writeReviewBtnText}>
                        {reviewData?.hasReviewed ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá của bạn'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Filter Chips */}
                  <View style={styles.reviewChipsFilterRow}>
                    {[
                      { key: 'all', label: `Tất cả (${reviewData?.totalReviews ?? 0})` },
                      { key: '5', label: '5 Sao' },
                      { key: '4', label: '4 Sao' },
                    ].map((f) => (
                      <TouchableOpacity
                        key={f.key}
                        style={[
                          styles.reviewFilterChip,
                          selectedReviewFilter === f.key && styles.reviewFilterChipActive,
                        ]}
                        onPress={() => setSelectedReviewFilter(f.key as any)}
                      >
                        <Text
                          style={[
                            styles.reviewFilterChipText,
                            selectedReviewFilter === f.key && styles.reviewFilterChipTextActive,
                          ]}
                        >
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Reviews List */}
                  {reviewsLoading && filteredReviews.length === 0 ? (
                    <View style={styles.reviewsLoadingBox}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.reviewsLoadingText}>Đang tải đánh giá...</Text>
                    </View>
                  ) : filteredReviews.length === 0 ? (
                    <View style={styles.reviewsEmptyBox}>
                      <MaterialIcons name="rate-review" size={40} color={COLORS.outlineVariant} />
                      <Text style={styles.reviewsEmptyTitle}>Chưa có đánh giá</Text>
                      <Text style={styles.reviewsEmptyText}>
                        Hãy là người đầu tiên đánh giá cụm sân này!
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.reviewsList}>
                      {filteredReviews.map((rev) => (
                        <ReviewCard key={rev.id} review={rev} />
                      ))}
                      {reviewData?.hasMore && (
                        <TouchableOpacity
                          style={styles.loadMoreBtn}
                          onPress={loadMoreReviews}
                          activeOpacity={0.8}
                        >
                          {reviewsLoading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                          ) : (
                            <Text style={styles.loadMoreText}>Xem thêm đánh giá</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom Floating Action Bar */}
          <View style={[styles.bottomBarWrapper, { bottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.bottomBarContent}>
              {/* Call Owner Button */}
              <TouchableOpacity
                style={styles.callOwnerBtn}
                activeOpacity={0.8}
                onPress={handleCallOwner}
              >
                <View style={styles.callIconBox}>
                  <MaterialIcons name="phone" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.callOwnerText}>Liên hệ</Text>
              </TouchableOpacity>

              {/* Book Now Button */}
              <TouchableOpacity
                style={styles.bookNowBtn}
                activeOpacity={0.85}
                onPress={handleBookingAction}
              >
                <MaterialIcons name="calendar-today" size={18} color={COLORS.white} />
                <Text style={styles.bookNowBtnText}>Đặt lịch ngay</Text>
                <MaterialIcons name="chevron-right" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Fullscreen Photo Preview Modal */}
      {previewImageUrl && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewImageUrl(null)}
        >
          <View style={styles.photoPreviewModal}>
            <TouchableOpacity
              style={styles.photoPreviewCloseBtn}
              onPress={() => setPreviewImageUrl(null)}
            >
              <MaterialIcons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.photoPreviewImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}

      {/* WriteReview Sheet */}
      <WriteReviewSheet
        visible={showWriteReview}
        venueId={venueId}
        venueName={venueName}
        existingReview={reviewData?.myReview}
        onClose={() => setShowWriteReview(false)}
        onSuccess={() => {
          setShowWriteReview(false);
          refetchReviews();
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.94,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 24,
  },
  topAnchorHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    height: 44,
    justifyContent: 'center',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  floatingTopActions: {
    position: 'absolute',
    top: 8,
    right: 14,
    zIndex: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingGlassBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  sheetScroll: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    paddingBottom: 110,
  },
  carouselContainer: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: COLORS.surfaceContainerLow,
    position: 'relative',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  topGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 55,
  },
  bottomGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  carouselCountBadge: {
    position: 'absolute',
    bottom: 46,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  carouselCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  floatingHeroCardWrapper: {
    marginHorizontal: 16,
    marginTop: -38,
    zIndex: 10,
    position: 'relative',
  },
  starRatingBadgeTop: {
    position: 'absolute',
    top: -15,
    alignSelf: 'center',
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  starRatingBadgeText: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: '800',
  },
  heroCardContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  heroCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  venueAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  venueAvatarImg: {
    width: '100%',
    height: '100%',
  },
  venueNameCol: {
    flex: 1,
    gap: 4,
  },
  venueHeroTitle: {
    fontSize: 17,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 22,
  },
  sportOutlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity25,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  sportOutlineTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  heroInfoRowsList: {
    gap: 8,
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  heroInfoIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  locationTextWrapper: {
    flex: 1,
    gap: 2,
  },
  heroInfoText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  distanceInlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  distanceInlinePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  phoneTextCol: {
    flex: 1,
  },
  heroPhoneLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  horizontalTabsWrapper: {
    marginTop: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  horizontalTabsContainer: {
    paddingHorizontal: 16,
    gap: 18,
  },
  tabUnderlineItem: {
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabUnderlineItemActive: {
    borderBottomColor: COLORS.primary,
  },
  tabUnderlineText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabUnderlineTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  tabContentBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabPaneContainer: {
    gap: 14,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statValueHighlight: {
    fontSize: 13.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: COLORS.primary,
  },
  statUnit: {
    fontSize: 10,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  openDirectionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  openDirectionsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  surchargeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  surchargeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  infoDescriptionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  courtsSectionBlock: {
    gap: 8,
  },
  courtsListContainer: {
    gap: 8,
  },
  courtListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  courtListIndexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courtListIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  courtListInfoCol: {
    flex: 1,
  },
  courtListName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  courtListSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  courtListPriceCol: {
    alignItems: 'flex-end',
  },
  courtListPriceNumber: {
    fontSize: 14,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: COLORS.primary,
  },
  courtListPriceUnit: {
    fontSize: 10.5,
    color: '#64748B',
  },
  comingSoonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  comingSoonIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  comingSoonBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  comingSoonTitle: {
    fontSize: 17,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: '#0F172A',
  },
  comingSoonSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  comingSoonFeaturesList: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 6,
  },
  comingSoonFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comingSoonFeatureText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
  },
  galleryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryTotalTitle: {
    fontSize: 14,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoGridItem: {
    width: (SCREEN_WIDTH - 32 - 8) / 2,
    height: 125,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  photoGridOverlayBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Quick policy card in Info Tab
  quickPolicyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
  },
  quickPolicyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickPolicyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPolicyTitleGroup: {
    flex: 1,
    gap: 2,
  },
  quickPolicyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickPolicyTitle: {
    fontSize: 13,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#065F46',
  },
  quickPolicyGracePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 0.5,
    borderColor: '#86EFAC',
  },
  quickPolicyGracePillText: {
    fontSize: 9.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#047857',
  },
  quickPolicySubtext: {
    fontSize: 11.5,
    color: '#047857',
  },

  // Policy Section in Rules Tab
  policyCardWrapper: {
    gap: 10,
  },
  policyGraceCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  policyGraceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  policyGraceIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  policyGraceTitleGroup: {
    flex: 1,
    gap: 3,
  },
  policyGraceTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  policyGraceTitle: {
    fontSize: 13,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#065F46',
  },
  freeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 0.5,
    borderColor: '#86EFAC',
  },
  freeBadgeText: {
    fontSize: 9.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#047857',
  },
  policyGraceDesc: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16.5,
  },

  // Tiers
  policyTiersList: {
    gap: 8,
  },
  policyTierItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  policyTierIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  policyTierContent: {
    flex: 1,
    gap: 3,
  },
  policyTierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyTierTitle: {
    fontSize: 13,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  policyTierRate: {
    fontSize: 11.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
  },
  policyTierDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16.5,
  },

  // Empty fallback card
  policyEmptyFallbackCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  policyEmptyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  policyEmptyTextCol: {
    flex: 1,
    gap: 3,
  },
  policyEmptyTitle: {
    fontSize: 13.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#334155',
  },
  policyEmptyDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  rulesListContainer: {
    gap: 8,
  },
  ruleCleanCardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  ruleCleanIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  ruleCleanTextCol: {
    flex: 1,
    gap: 3,
  },
  ruleCleanTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  ruleCleanDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  ratingSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  ratingBigScoreCard: {
    width: 96,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  ratingBigScoreNumber: {
    fontSize: 26,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: COLORS.white,
  },
  ratingStarsBig: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingTotalSubText: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 1,
  },
  ratingProgressCol: {
    flex: 1,
    gap: 6,
  },
  ratingProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    width: 65,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  ratingProgressScore: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    width: 22,
    textAlign: 'right',
  },
  reviewChipsFilterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  reviewFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  reviewFilterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  reviewFilterChipTextActive: {
    color: COLORS.white,
  },
  reviewsList: {
    gap: 8,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewUserCol: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  reviewUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  verifiedRoleText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  reviewDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  reviewContent: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  reviewTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  reviewTag: {
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomBarWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 8,
    gap: 8,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  callOwnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: COLORS.primaryOpacity08,
    gap: 6,
  },
  callIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callOwnerText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  bookNowBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.white,
  },
  photoPreviewModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoPreviewImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.7,
  },

  // ─── Review Tab extras ───────────────────────────────────────────────────────
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryOpacity08,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  writeReviewBtnText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
  loadMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  loadMoreText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewsLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  reviewsLoadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
  },
  reviewsEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  reviewsEmptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  reviewsEmptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
    textAlign: 'center',
  },
});

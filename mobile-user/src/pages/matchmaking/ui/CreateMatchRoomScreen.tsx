import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { matchmakingApi, MatchFlowType } from '../../../shared/api/matchmaking';
import { MapPickerModal } from '../components/MapPickerModal';
import { getMyBookingsApi, BookingItem } from '../../../shared/api/bookings';
import { Button } from '../../../shared/ui';

const SPORT_FORMATS: Record<string, string[]> = {
  'Bóng đá': ['5v5', '7v7', '11v11'],
  'Bóng rổ': ['3x3', '5v5'],
  'Cầu lông': ['Đơn nam', 'Đôi nam', 'Đôi nam nữ'],
  'Pickleball': ['Đơn', 'Đôi'],
  'Tennis': ['Đơn', 'Đôi'],
};

export function CreateMatchRoomScreen({ route, navigation }: any) {
  const club = route?.params?.club || { id: 1, name: 'CLB Bóng đá Alpha', sportName: 'Bóng đá', sportEmoji: '⚽' };
  
  const [flowType, setFlowType] = useState<MatchFlowType>('PAID_100');
  
  // Real User Bookings for Flow 1
  const [realBookings, setRealBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');

  // Form states
  const [format, setFormat] = useState('7v7');
  const [hoursUntilMatch, setHoursUntilMatch] = useState('36');
  const [area, setArea] = useState('Khu vực Cầu Giấy, Hà Nội');
  const [latitude, setLatitude] = useState(21.0368);
  const [longitude, setLongitude] = useState(105.7905);
  
  const [minElo, setMinElo] = useState('1200');
  const [maxElo, setMaxElo] = useState('1800');
  const [message, setMessage] = useState('Tìm đối thủ giao lưu fair play, đúng giờ!');
  
  const [showMapModal, setShowMapModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await getMyBookingsApi();
      if (data && data.length > 0) {
        setRealBookings(data);
        setSelectedBookingId(data[0].id);
      } else {
        // Fallback upcoming bookings
        const mockFallback: BookingItem[] = [
          { id: 'b1', venueName: 'Sân bóng Chùa Hà', courtName: 'Sân 7A', date: '2026-07-23', startTime: '19:00', endTime: '20:30', totalPrice: 600000, status: 'CONFIRMED' },
          { id: 'b2', venueName: 'Sân bóng Cầu Giấy', courtName: 'Sân 5B', date: '2026-07-24', startTime: '20:30', endTime: '22:00', totalPrice: 450000, status: 'CONFIRMED' },
        ];
        setRealBookings(mockFallback);
        setSelectedBookingId(mockFallback[0].id);
      }
    } catch (err) {
      console.log('Error fetching user bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const availableFormats = SPORT_FORMATS[club.sportName] || ['5v5', '7v7'];

  // Dynamic TTL Calculation
  const hoursLeft = parseFloat(hoursUntilMatch) || 24;
  let dynamicTtlMinutes = 60;
  let isTtlDisabled = false;

  if (hoursLeft > 48) {
    dynamicTtlMinutes = 120;
  } else if (hoursLeft >= 24 && hoursLeft <= 48) {
    dynamicTtlMinutes = 60;
  } else if (hoursLeft >= 6 && hoursLeft < 24) {
    dynamicTtlMinutes = 30;
  } else if (hoursLeft < 6) {
    isTtlDisabled = true;
  }

  const selectedBooking = realBookings.find(b => b.id === selectedBookingId);
  const calculatedPriceShare = selectedBooking ? selectedBooking.totalPrice / 2.0 : undefined;

  const handleSubmit = async () => {
    if (flowType === 'DEPOSIT_HOLD' && isTtlDisabled) {
      Alert.alert('Lỗi', 'Sát giờ thi đấu (< 6h), vui lòng mua đứt sân để ghép trận!');
      return;
    }

    try {
      setLoading(true);
      await matchmakingApi.createMatchRoom({
        clubId: club.id,
        sportId: 1,
        format,
        minElo: parseInt(minElo, 10),
        maxElo: parseInt(maxElo, 10),
        area,
        latitude,
        longitude,
        expectedStartTime: new Date(Date.now() + hoursLeft * 3600 * 1000).toISOString(),
        priceSharePerTeam: calculatedPriceShare,
        flowType,
        depositAmount: flowType === 'DEPOSIT_HOLD' ? 50000 : undefined,
        bookingId: flowType === 'PAID_100' ? selectedBookingId : undefined,
        message,
      }, 1);

      Alert.alert('Thành công 🎉', `Đã tạo phòng chờ ghép trận cho ${club.name}!`);
      navigation?.goBack();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err.message || 'Không thể tạo phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo Phòng Ghép Trận</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Selected Club Banner Card */}
          <View style={styles.clubBannerCard}>
            <View style={styles.clubBannerLeft}>
              <View style={styles.clubAvatarCircle}>
                <Text style={styles.clubAvatarText}>{club.name?.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.clubBannerName} numberOfLines={1}>{club.name}</Text>
                <Text style={styles.clubBannerSport}>
                  {club.sportEmoji} Môn: <Text style={styles.highlightText}>{club.sportName}</Text> (Môn khóa cứng theo CLB)
                </Text>
              </View>
            </View>
            <MaterialIcons name="lock" size={18} color={COLORS.primary} />
          </View>

          {/* Flow Selection */}
          <Text style={styles.sectionLabel}>HÌNH THỨC GHÉP TRẬN</Text>
          <View style={styles.flowContainer}>
            <TouchableOpacity
              style={[styles.flowBox, flowType === 'PAID_100' && styles.activeFlowBox]}
              onPress={() => setFlowType('PAID_100')}
              activeOpacity={0.85}
            >
              <View style={styles.flowHeader}>
                <MaterialIcons name="verified" size={22} color={flowType === 'PAID_100' ? COLORS.primary : COLORS.outline} />
                <Text style={[styles.flowTitle, flowType === 'PAID_100' && styles.activeFlowTitle]}>Đã Mua Đứt Sân (100%)</Text>
              </View>
              <Text style={styles.flowDesc}>Chọn 1 trong các Sân đã đặt của bạn. Giá tiền cưa đôi tự động hiển thị từ đơn đặt.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.flowBox, flowType === 'DEPOSIT_HOLD' && styles.activeFlowBox]}
              onPress={() => setFlowType('DEPOSIT_HOLD')}
              activeOpacity={0.85}
            >
              <View style={styles.flowHeader}>
                <MaterialIcons name="timer" size={22} color={flowType === 'DEPOSIT_HOLD' ? COLORS.primary : COLORS.outline} />
                <Text style={[styles.flowTitle, flowType === 'DEPOSIT_HOLD' && styles.activeFlowTitle]}>Ghép Trận Giữ Chỗ (Dynamic TTL)</Text>
              </View>
              <Text style={styles.flowDesc}>Chọn Khu vực thi đấu trên Map để lọc khoảng cách. Khi 2 bên chốt kèo, hệ thống sẽ gợi ý Sân thi đấu kèm giá tiền chuẩn xác!</Text>
            </TouchableOpacity>
          </View>

          {/* Flow 1: Select Paid Booking */}
          {flowType === 'PAID_100' ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CHỌN SÂN ĐÃ ĐẶT (CHƯA ĐẾN GIỜ THI ĐẤU)</Text>
              {loadingBookings ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                realBookings.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.bookingItem, selectedBookingId === b.id && styles.activeBookingItem]}
                    onPress={() => setSelectedBookingId(b.id)}
                    activeOpacity={0.85}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookingTitle}>{b.venueName} - {b.courtName}</Text>
                      <Text style={styles.bookingTime}>🕒 Giờ đá: {b.startTime} ({b.date})</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.bookingPrice}>{b.totalPrice.toLocaleString()} đ</Text>
                      <Text style={styles.splitSubText}>Cưa đôi: {(b.totalPrice / 2).toLocaleString()} đ/đội</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            /* Flow 2: Location Map Picker & Dynamic TTL Config */
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>KHU VỰC THI ĐẤU MONG MUỐN (LỌC BÁN KÍNH TRÊN MAP)</Text>
              <TouchableOpacity style={styles.mapPickerCard} onPress={() => setShowMapModal(true)} activeOpacity={0.85}>
                <View style={styles.mapPickerLeft}>
                  <View style={styles.mapIconBg}>
                    <MaterialIcons name="map" size={24} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mapPickerTitle} numberOfLines={1}>{area}</Text>
                    <Text style={styles.mapPickerCoords}>Tọa độ ghim: {latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
                  </View>
                </View>
                <MaterialIcons name="edit-location" size={22} color={COLORS.primary} />
              </TouchableOpacity>

              <Text style={[styles.sectionLabel, { marginTop: SPACING.sm }]}>KHOẢNG CÁCH ĐẾN GIỜ ĐÁ (GIỜ)</Text>
              <TextInput
                style={styles.input}
                value={hoursUntilMatch}
                onChangeText={setHoursUntilMatch}
                keyboardType="numeric"
                placeholder="VD: 36 (giờ)"
              />

              {isTtlDisabled ? (
                <View style={styles.disabledTtlBanner}>
                  <MaterialIcons name="error" size={20} color={COLORS.error} />
                  <Text style={styles.disabledTtlText}>Sát giờ thi đấu (&lt; 6h), vui lòng mua đứt sân để ghép trận.</Text>
                </View>
              ) : (
                <View style={styles.ttlInfoBanner}>
                  <MaterialIcons name="hourglass-top" size={20} color={COLORS.amber} />
                  <Text style={styles.ttlInfoText}>
                    Thời gian đếm ngược Dynamic TTL nhả sân: <Text style={{ fontWeight: '800' }}>{dynamicTtlMinutes} phút</Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Format Selection */}
          <Text style={styles.sectionLabel}>THỂ THỨC THI ĐẤU ({club.sportName})</Text>
          <View style={styles.formatRow}>
            {availableFormats.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, format === f && styles.activeChip]}
                onPress={() => setFormat(f)}
              >
                <Text style={[styles.chipText, format === f && styles.activeChipText]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Elo Limits */}
          <Text style={styles.sectionLabel}>GIỚI HẠN ELO THÀNH VIÊN (MIN - MAX)</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} value={minElo} onChangeText={setMinElo} keyboardType="numeric" placeholder="Min Elo" />
            <Text style={styles.dashSeparator}>-</Text>
            <TextInput style={[styles.input, { flex: 1 }]} value={maxElo} onChangeText={setMaxElo} keyboardType="numeric" placeholder="Max Elo" />
          </View>

          {/* Message */}
          <Text style={styles.sectionLabel}>LỜI NHẮN VỚI ĐỐI THỦ</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            multiline
            placeholder="Yêu cầu riêng về trang phục, nước uống..."
          />

          <Button
            variant="secondary"
            onPress={handleSubmit}
            disabled={loading || (flowType === 'DEPOSIT_HOLD' && isTtlDisabled)}
            loading={loading}
            style={styles.submitBtn}
          >
            XÁC NHẬN TẠO PHÒNG
          </Button>
        </ScrollView>

        {/* Map Picker Modal */}
        <MapPickerModal
          visible={showMapModal}
          onClose={() => setShowMapModal(false)}
          area={area}
          setArea={setArea}
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontSize: TYPOGRAPHY.headlineMd.fontSize,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    color: COLORS.onSurface,
  },
  formContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  clubBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryOpacity05,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, // 16px
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  clubBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  clubAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubAvatarText: {
    color: COLORS.onPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  clubBannerName: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  clubBannerSport: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  highlightText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionLabel: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  flowContainer: {
    gap: SPACING.sm,
  },
  flowBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainerHigh,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  activeFlowBox: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flowTitle: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  activeFlowTitle: {
    color: COLORS.primary,
  },
  flowDesc: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
  },
  section: {
    gap: SPACING.sm,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainerHigh,
  },
  activeBookingItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  bookingTitle: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  bookingTime: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  bookingPrice: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  splitSubText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  mapPickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  mapPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  mapIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPickerTitle: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  mapPickerCoords: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    color: COLORS.outline,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: TYPOGRAPHY.bodyMd.fontSize,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  dashSeparator: {
    alignSelf: 'center',
    marginHorizontal: SPACING.xs,
    color: COLORS.outline,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ttlInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.amberOpacity10,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  ttlInfoText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.amber,
    flex: 1,
  },
  disabledTtlBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.errorContainer,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  disabledTtlText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.onErrorContainer,
    flex: 1,
  },
  formatRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  activeChipText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
});

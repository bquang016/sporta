import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { matchmakingApi, MatchFlowType } from '../../../shared/api/matchmaking';
import { CalendarPicker, AlertModal, Button } from '../../../shared/ui';
import { MapPickerModal } from '../components/MapPickerModal';
import { TimePickerModal } from '../components/TimePickerModal';
import { getMyBookingsApi, getSuggestedVenuesApi, BookingItem, VenueSuggestion } from '../../../shared/api/bookings';
import { usersApi } from '../../../shared/api/users';

// ─── Constants ──────────────────────────────────────────────────────────────

const SPORT_FORMATS: Record<string, string[]> = {
  'Bóng đá': ['5v5', '7v7', '11v11'],
  'Bóng rổ': ['3x3', '5v5'],
  'Cầu lông': ['Đơn nam', 'Đôi nam', 'Đôi nam nữ'],
  'Pickleball': ['Đơn', 'Đôi'],
  'Tennis': ['Đơn', 'Đôi'],
};

const DURATION_OPTIONS = [
  { label: '60\'', subLabel: '1 tiếng', minutes: 60 },
  { label: '90\'', subLabel: '1.5 tiếng', minutes: 90 },
  { label: '120\'', subLabel: '2 tiếng', minutes: 120 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function formatDateDisplay(d: Date) {
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${weekdays[d.getDay()]}, ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function applyTimeToDate(base: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const next = new Date(base);
  next.setHours(h || 18, m || 0, 0, 0);
  return next;
}

function getEndTime(startDate: Date, durationMinutes: number): string {
  const end = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  return `${pad2(end.getHours())}:${pad2(end.getMinutes())}`;
}

function formatLocalISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const hh = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  const ss = d.getSeconds().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateMatchRoomScreen({ route, navigation }: any) {
  const club = route?.params?.club ?? {
    id: 1,
    name: 'CLB Bóng đá Alpha',
    sportName: 'Bóng đá',
    sportEmoji: '⚽',
  };

  const [flowType, setFlowType] = useState<MatchFlowType>('PAID_100');

  // Flow 1 – Paid Booking
  const [realBookings, setRealBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');

  // Flow 2 – Venue & Court Selection
  const [suggestedVenues, setSuggestedVenues] = useState<VenueSuggestion[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueSuggestion | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<number>(1);
  const [selectedCourtName, setSelectedCourtName] = useState<string>('Sân 1 (Tiêu chuẩn)');
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showMockDepositModal, setShowMockDepositModal] = useState(false);

  // Flow 2 – Date + Time + Duration
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  const [startDate, setStartDate] = useState<Date>(tomorrow);
  const [selectedTime, setSelectedTime] = useState<string>('18:00');
  const [durationMinutes, setDurationMinutes] = useState(90);

  // Modals
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Alert Modal State
  const [alertModalConfig, setAlertModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttonText?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Common form fields
  const [format, setFormat] = useState(
    SPORT_FORMATS[club.sportName]?.[0] ?? '5v5'
  );
  const [area, setArea] = useState('Khu vực Cầu Giấy, Hà Nội');
  const [latitude, setLatitude] = useState(21.0368);
  const [longitude, setLongitude] = useState(105.7905);
  const [minElo, setMinElo] = useState('1200');
  const [maxElo, setMaxElo] = useState('1800');
  const [message, setMessage] = useState('Tìm đối thủ giao lưu fair play, đúng giờ!');
  const [loading, setLoading] = useState(false);
  const [myUserId, setMyUserId] = useState<number>(1);

  useEffect(() => {
    fetchUserBookings();
    getSuggestedVenuesApi().then(venues => {
      if (venues && venues.length > 0) {
        setSuggestedVenues(venues);
        setSelectedVenue(venues[0]);
        setArea(venues[0].address);
        setLatitude(venues[0].latitude);
        setLongitude(venues[0].longitude);
      } else {
        const defaultV: VenueSuggestion = { id: '1', name: 'Sân Bóng Chùa Hà', address: 'Quận Cầu Giấy, Hà Nội', latitude: 21.0368, longitude: 105.7905, hourlyPrice: 300000, rating: 4.8 };
        setSuggestedVenues([defaultV]);
        setSelectedVenue(defaultV);
      }
    }).catch(() => {});
    usersApi.getProfile().then(p => {
      if (p?.id) setMyUserId(p.id);
    }).catch(() => {});
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await getMyBookingsApi();
      if (data && data.length > 0) {
        setRealBookings(data);
        setSelectedBookingId(data[0].id);
      } else {
        setRealBookings([]);
        setSelectedBookingId('');
      }
    } catch (err) {
      console.log('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const availableFormats = SPORT_FORMATS[club.sportName] || ['5v5'];

  const startDateTime = applyTimeToDate(startDate, selectedTime);
  const endTimeStr = getEndTime(startDateTime, durationMinutes);

  // Checks if selected start time is less than 6 hours away
  const hoursUntilStart = (startDateTime.getTime() - Date.now()) / (1000 * 3600);
  const isTtlDisabled = hoursUntilStart < 6;

  let dynamicTtlMinutes = 60;
  if (hoursUntilStart > 48) dynamicTtlMinutes = 120;
  else if (hoursUntilStart >= 24) dynamicTtlMinutes = 60;
  else if (hoursUntilStart >= 6) dynamicTtlMinutes = 30;

  const selectedBooking = realBookings.find(b => b.id === selectedBookingId);
  const calculatedPriceShare = selectedBooking 
    ? selectedBooking.totalPrice / 2.0 
    : selectedVenue 
    ? selectedVenue.hourlyPrice / 2.0 
    : 150000;

  // ── Submit Handler ──────────────────────────────────────────────────────────
  const handlePressSubmit = () => {
    if (flowType === 'DEPOSIT_HOLD') {
      if (isTtlDisabled) {
        setAlertModalConfig({
          visible: true,
          title: 'Không thể tạo phòng ⚠️',
          message: 'Sát giờ thi đấu (< 6h), vui lòng mua đứt sân để ghép trận.',
          buttonText: 'Đã hiểu',
          onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
        });
        return;
      }
      // Open Mock Deposit Payment Dialog first for DEPOSIT_HOLD
      setShowMockDepositModal(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setShowMockDepositModal(false);

    if (flowType === 'PAID_100' && !selectedBookingId) {
      setAlertModalConfig({
        visible: true,
        title: 'Chưa chọn sân đặt ⚠️',
        message: 'Bạn chưa có sân đã đặt hợp lệ (chưa quá giờ & chưa dùng tạo phòng khác) để ghép trận.',
        buttonText: 'Đã hiểu',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    try {
      setLoading(true);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
      
      const createdRoom = await matchmakingApi.createMatchRoom({
        clubId: club.id,
        sportId: 1,
        format,
        minElo: parseInt(minElo, 10),
        maxElo: parseInt(maxElo, 10),
        area: selectedVenue ? `${selectedVenue.name} - ${selectedVenue.address}` : area,
        latitude,
        longitude,
        expectedStartTime: formatLocalISO(startDateTime),
        expectedEndTime: formatLocalISO(endDateTime),
        priceSharePerTeam: calculatedPriceShare,
        flowType,
        courtId: flowType === 'DEPOSIT_HOLD' ? selectedCourtId : undefined,
        depositAmount: flowType === 'DEPOSIT_HOLD' ? 50000 : undefined,
        bookingId: flowType === 'PAID_100' ? selectedBookingId : undefined,
        message,
      }, myUserId);

      setAlertModalConfig({
        visible: true,
        title: flowType === 'DEPOSIT_HOLD' ? 'Cọc 50.000đ giữ chỗ thành công 🎉' : 'Đã tạo phòng thành công 🎉',
        message: flowType === 'DEPOSIT_HOLD'
          ? `Đã cọc 50.000đ thành công (Auto-success).\nPhòng ghép giữ chỗ tại ${selectedVenue?.name || 'Sân bóng'} (${selectedCourtName}) cho ${club.name} đã sẵn sàng!\nKhung giờ: ${selectedTime} – ${endTimeStr}, ngày ${formatDateDisplay(startDate)}.`
          : `Phòng ghép trận cho ${club.name} đã sẵn sàng!\nKhung giờ: ${selectedTime} – ${endTimeStr}, ngày ${formatDateDisplay(startDate)}`,
        buttonText: 'Xem phòng ngay',
        onConfirm: () => {
          setAlertModalConfig(prev => ({ ...prev, visible: false }));
          if (createdRoom?.id) {
            navigation?.navigate?.('MatchRoomDetail', { roomId: createdRoom.id });
          } else {
            navigation?.goBack?.();
          }
        },
      });
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể tạo phòng';
      setAlertModalConfig({
        visible: true,
        title: 'Lỗi tạo phòng ❌',
        message: errMsg,
        buttonText: 'Thử lại',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>

        {/* ── Header ────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo Phòng Ghép Trận</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

          {/* ── CLB Banner ────────────────────────────────────────── */}
          <View style={styles.clubCard}>
            <View style={styles.clubCardLeft}>
              <View style={styles.clubAvatar}>
                <Text style={styles.clubAvatarText}>{club.name?.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                <Text style={styles.clubSport}>
                  {club.sportEmoji}{' '}
                  <Text style={styles.clubSportHighlight}>{club.sportName}</Text>
                  {' '}— Môn khóa theo CLB
                </Text>
              </View>
            </View>
            <MaterialIcons name="lock" size={18} color={COLORS.primary} />
          </View>

          {/* ── Hình thức ghép trận ───────────────────────────────── */}
          <Text style={styles.sectionLabel}>HÌNH THỨC GHÉP TRẬN</Text>
          <View style={styles.flowRow}>
            {([
              { key: 'PAID_100', icon: 'verified', title: 'Đã Mua Đứt Sân', desc: 'Chọn sân đã đặt, giá tiền cưa đôi tự động tính.' },
              { key: 'DEPOSIT_HOLD', icon: 'timer', title: 'Ghép Giữ Chỗ (TTL)', desc: 'Chọn lịch, khu vực. Hệ thống gợi ý sân sau khi 2 bên chốt kèo.' },
            ] as const).map(f => {
              const isActive = flowType === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.flowCard, isActive && styles.flowCardActive]}
                  onPress={() => setFlowType(f.key as MatchFlowType)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name={f.icon as any}
                    size={20}
                    color={isActive ? COLORS.primary : COLORS.outline}
                  />
                  <Text style={[styles.flowCardTitle, isActive && styles.flowCardTitleActive]}>
                    {f.title}
                  </Text>
                  <Text style={styles.flowCardDesc}>{f.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Flow 1: Chọn sân đã đặt ──────────────────────────── */}
          {flowType === 'PAID_100' && (
            <>
              <Text style={styles.sectionLabel}>CHỌN SÂN ĐÃ ĐẶT (CHƯA ĐẾN GIỜ THI ĐẤU)</Text>
              {loadingBookings ? (
                <View style={styles.centerLoader}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : realBookings.length === 0 ? (
                <View style={styles.bannerError}>
                  <MaterialIcons name="info" size={18} color={COLORS.error} />
                  <Text style={styles.bannerErrorText}>
                    Bạn chưa có sân đã đặt hợp lệ nào (chưa quá giờ & chưa tạo ghép trận khác). Vui lòng sang luồng "Ghép Giữ Chỗ (TTL)" để tạo phòng.
                  </Text>
                </View>
              ) : (
                realBookings.map(b => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.bookingCard, selectedBookingId === b.id && styles.bookingCardActive]}
                    onPress={() => setSelectedBookingId(b.id)}
                    activeOpacity={0.85}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookingVenue}>{b.venueName} — {b.courtName}</Text>
                      <Text style={styles.bookingTime}>🕒 {b.startTime}–{b.endTime} ({b.date})</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={styles.bookingPrice}>{b.totalPrice.toLocaleString()} đ</Text>
                      <Text style={styles.bookingSplit}>Cưa đôi: {(b.totalPrice / 2).toLocaleString()} đ</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* ── Flow 2: Lịch thi đấu & Sân ─────────────────────────── */}
          {flowType === 'DEPOSIT_HOLD' && (
            <>
              {/* Chọn Sân Thi Đấu cụ thể */}
              <Text style={styles.sectionLabel}>CHỌN SÂN THI ĐẤU & KHUNG GIỜ</Text>

              <TouchableOpacity
                style={styles.dateTriggerCard}
                onPress={() => setShowVenueModal(true)}
                activeOpacity={0.85}
              >
                <View style={styles.dateTriggerLeft}>
                  <View style={[styles.dateTriggerIconBg, { backgroundColor: COLORS.primaryOpacity15 }]}>
                    <MaterialIcons name="sports-soccer" size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateTriggerValue} numberOfLines={1}>
                      {selectedVenue ? selectedVenue.name : 'Chọn Sân bóng...'}
                    </Text>
                    <Text style={styles.dateTriggerSub} numberOfLines={1}>
                      {selectedCourtName} — {selectedVenue ? `${selectedVenue.hourlyPrice.toLocaleString()} đ/giờ` : ''}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
              </TouchableOpacity>

              {/* Chọn ngày — CalendarPicker */}
              <Text style={[styles.sectionLabel, { marginTop: SPACING.xs }]}>NGÀY THI ĐẤU DỰ KIẾN</Text>

              <TouchableOpacity
                style={styles.dateTriggerCard}
                onPress={() => setShowCalendar(true)}
                activeOpacity={0.85}
              >
                <View style={styles.dateTriggerLeft}>
                  <View style={styles.dateTriggerIconBg}>
                    <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.dateTriggerValue}>{formatDateDisplay(startDate)}</Text>
                    <Text style={styles.dateTriggerSub}>Nhấn để chọn ngày trên lịch</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
              </TouchableOpacity>

              {/* CalendarPicker Modal */}
              <CalendarPicker
                visible={showCalendar}
                selectedDate={startDate}
                minimumDate={new Date()}
                onConfirm={(date) => {
                  setStartDate(date);
                  setShowCalendar(false);
                }}
                onClose={() => setShowCalendar(false)}
              />

              {/* Chọn giờ bắt đầu */}
              <Text style={[styles.sectionLabel, { marginTop: SPACING.xs }]}>GIỜ BẮT ĐẦU DỰ KIẾN</Text>
              
              <TouchableOpacity
                style={styles.dateTriggerCard}
                onPress={() => setShowTimeModal(true)}
                activeOpacity={0.85}
              >
                <View style={styles.dateTriggerLeft}>
                  <View style={styles.dateTriggerIconBg}>
                    <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.dateTriggerValue}>{selectedTime}</Text>
                    <Text style={styles.dateTriggerSub}>Nhấn để đổi giờ (tuỳ chọn linh hoạt)</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
              </TouchableOpacity>

              {/* TimePicker Modal */}
              <TimePickerModal
                visible={showTimeModal}
                selectedTime={selectedTime}
                onConfirm={(t) => {
                  setSelectedTime(t);
                  setShowTimeModal(false);
                }}
                onClose={() => setShowTimeModal(false)}
              />

              {/* Chọn thời lượng */}
              <Text style={[styles.sectionLabel, { marginTop: SPACING.xs }]}>THỜI LƯỢNG TRẬN ĐẤU</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map(dur => {
                  const isActive = durationMinutes === dur.minutes;
                  return (
                    <TouchableOpacity
                      key={dur.minutes}
                      style={[styles.durationCard, isActive && styles.durationCardActive]}
                      onPress={() => setDurationMinutes(dur.minutes)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.durationMain, isActive && styles.durationMainActive]}>
                        {dur.label}
                      </Text>
                      <Text style={[styles.durationSub, isActive && styles.durationSubActive]}>
                        {dur.subLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Preview Card */}
              <View style={styles.previewCard}>
                <MaterialIcons name="access-time-filled" size={18} color={COLORS.primary} />
                <Text style={styles.previewText}>
                  Khung giờ thi đấu:{' '}
                  <Text style={styles.previewHighlight}>{selectedTime} – {endTimeStr}</Text>
                  {', ngày '}{formatDateDisplay(startDate)}
                </Text>
              </View>

              {/* Dynamic TTL Banner */}
              {isTtlDisabled ? (
                <View style={styles.bannerError}>
                  <MaterialIcons name="error-outline" size={18} color={COLORS.error} />
                  <Text style={styles.bannerErrorText}>
                    Sát giờ thi đấu (&lt; 6h) — vui lòng dùng luồng Mua Đứt Sân.
                  </Text>
                </View>
              ) : (
                <View style={styles.bannerInfo}>
                  <MaterialIcons name="hourglass-top" size={18} color={COLORS.amber} />
                  <Text style={styles.bannerInfoText}>
                    Hạn cọc hold Dynamic TTL:{' '}
                    <Text style={{ fontWeight: '800' }}>{dynamicTtlMinutes} phút</Text>
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ── Thể thức ──────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>THỂ THỨC ({club.sportName})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.xs }}>
            {availableFormats.map(f => {
              const isActive = format === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setFormat(f)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Elo ──────────────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>GIỚI HẠN ELO THÀNH VIÊN</Text>
          <View style={styles.eloRow}>
            <View style={styles.eloField}>
              <Text style={styles.eloFieldLabel}>Tối thiểu</Text>
              <TextInput
                style={styles.eloInput}
                value={minElo}
                onChangeText={setMinElo}
                keyboardType="numeric"
                placeholder="1000"
                placeholderTextColor={COLORS.outline}
              />
            </View>
            <View style={styles.eloDash} />
            <View style={styles.eloField}>
              <Text style={styles.eloFieldLabel}>Tối đa</Text>
              <TextInput
                style={styles.eloInput}
                value={maxElo}
                onChangeText={setMaxElo}
                keyboardType="numeric"
                placeholder="2000"
                placeholderTextColor={COLORS.outline}
              />
            </View>
          </View>

          {/* ── Lời nhắn ──────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>LỜI NHẮN VỚI ĐỐI THỦ</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            placeholder="Yêu cầu trang phục, nước uống..."
            placeholderTextColor={COLORS.outline}
          />

          {/* ── CTA Button — dùng Button shared/ui ───────────────── */}
          <Button
            variant="primary"
            size="lg"
            title={flowType === 'DEPOSIT_HOLD' ? 'XÁC NHẬN CỌC 50.000Đ & TẠO PHÒNG' : 'XÁC NHẬN TẠO PHÒNG'}
            icon="arrow-forward"
            iconPosition="right"
            loading={loading}
            disabled={loading || (flowType === 'DEPOSIT_HOLD' && isTtlDisabled)}
            onPress={handlePressSubmit}
            style={styles.submitBtn}
          />
        </ScrollView>

        {/* ── Venue Selection Modal (Chủ phòng chọn sân) ──────────── */}
        <Modal visible={showVenueModal} animationType="slide" onRequestClose={() => setShowVenueModal(false)}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowVenueModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Chọn Sân & Khung Giờ</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: SPACING.md, gap: SPACING.md }}>
              <Text style={styles.sectionLabel}>DANH SÁCH SÂN BÓNG GỢI Ý KHU VỰC</Text>
              {suggestedVenues.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.bookingCard,
                    selectedVenue?.id === v.id && styles.bookingCardActive,
                  ]}
                  onPress={() => {
                    setSelectedVenue(v);
                    setArea(v.address);
                    setLatitude(v.latitude);
                    setLongitude(v.longitude);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.bookingVenue}>{v.name}</Text>

                    {/* Court Selector for this Venue */}
                    <Text style={styles.bookingTime}>📍 {v.address}</Text>
                    
                    {selectedVenue?.id === v.id && (
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                        {['Sân 1 (Tiêu chuẩn)', 'Sân 2 (Mặt cỏ nhân tạo)', 'Sân 3 (Sân VIP)'].map((courtName, idx) => (
                          <TouchableOpacity
                            key={courtName}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 6,
                              backgroundColor: selectedCourtId === (idx + 1) ? COLORS.primary : COLORS.surfaceContainerLow,
                            }}
                            onPress={() => {
                              setSelectedCourtId(idx + 1);
                              setSelectedCourtName(courtName);
                            }}
                          >
                            <Text style={{ fontSize: 12, color: selectedCourtId === (idx + 1) ? '#FFF' : COLORS.onSurface }}>
                              {courtName.split(' ')[0]} {courtName.split(' ')[1]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.bookingPrice}>{v.hourlyPrice.toLocaleString()} đ/h</Text>
                    <Text style={styles.bookingSplit}>Cưa đôi: {(v.hourlyPrice / 2).toLocaleString()} đ</Text>
                    {selectedVenue?.id === v.id ? (
                      <Button
                        variant="primary"
                        size="sm"
                        title="ĐÃ CHỌN"
                        onPress={() => setShowVenueModal(false)}
                      />
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}

              <Button
                variant="primary"
                size="lg"
                title="XÁC NHẬN CHỌN SÂN NÀY"
                onPress={() => setShowVenueModal(false)}
                style={{ marginTop: SPACING.md }}
              />
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* ── Mock Deposit Payment Modal (Cọc 50.000đ Auto-success) ── */}
        <Modal visible={showMockDepositModal} transparent animationType="fade" onRequestClose={() => setShowMockDepositModal(false)}>
          <View style={styles.modalOverlayCenter}>
            <View style={[styles.tsModalCard, { width: '90%', maxWidth: 380 }]}>
              <View style={styles.tsModalHeader}>
                <View style={[styles.tsModalIconBox, { backgroundColor: COLORS.primaryOpacity15 }]}>
                  <MaterialIcons name="account-balance-wallet" size={26} color={COLORS.primary} />
                </View>
                <Text style={styles.tsModalTitle}>Thanh toán Cọc Giữ Chỗ</Text>
              </View>

              <Text style={styles.tsModalBody}>
                Thanh toán tạm thời (Mock Payment):{'\n'}
                📌 Tiền cọc giữ chỗ: <Text style={{ fontWeight: '800', color: COLORS.primary }}>50.000 đ</Text>{'\n'}
                📍 Sân chọn: <Text style={{ fontWeight: '800' }}>{selectedVenue?.name || 'Sân bóng'}</Text> ({selectedCourtName}){'\n'}
                🕒 Thời gian: <Text style={{ fontWeight: '800' }}>{selectedTime} - {endTimeStr}</Text>{'\n'}
                ⏱️ Hạn cọc Dynamic TTL: <Text style={{ fontWeight: '800', color: COLORS.amber }}>{dynamicTtlMinutes} phút</Text>{'\n\n'}
                *Nhấn nút bên dưới để tự động thanh toán cọc thành công.*
              </Text>

              <View style={styles.tsModalActions}>
                <TouchableOpacity
                  style={styles.tsModalSecondaryBtn}
                  onPress={() => setShowMockDepositModal(false)}
                >
                  <Text style={styles.tsModalSecondaryText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tsModalPrimaryBtn, { backgroundColor: COLORS.primary }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.tsModalPrimaryText}>Xác nhận cọc 50.000đ (Auto)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── Shared AlertModal for UI Notifications ──────────────── */}
        <AlertModal
          visible={alertModalConfig.visible}
          title={alertModalConfig.title}
          message={alertModalConfig.message}
          buttonText={alertModalConfig.buttonText}
          onConfirm={alertModalConfig.onConfirm}
        />

        {/* ── Map Modal ──────────────────────────────────────────── */}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    flex: 1,
    textAlign: 'center',
  },

  body: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: 40,
    gap: SPACING.md,
  },

  // Club Banner
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryOpacity05,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  clubCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  clubAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubAvatarText: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onPrimary,
    fontSize: 18,
  },
  clubName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  clubSport: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  clubSportHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Section Label
  sectionLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: -SPACING.xs,
  },

  // Flow Selection
  flowRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  flowCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
    gap: 5,
  },
  flowCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  flowCardTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: 4,
  },
  flowCardTitleActive: {
    color: COLORS.primary,
  },
  flowCardDesc: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },

  // Booking Cards
  centerLoader: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    gap: SPACING.sm,
  },
  bookingCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  bookingVenue: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  bookingTime: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    marginTop: 2,
  },
  bookingPrice: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
  },
  bookingSplit: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.secondary,
    fontWeight: '700',
  },

  // Date/Time Trigger Cards
  dateTriggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  dateTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  dateTriggerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTriggerValue: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  dateTriggerSub: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    marginTop: 1,
  },

  // Duration Cards
  durationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  durationCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    gap: 2,
  },
  durationCardActive: {
    backgroundColor: COLORS.primaryOpacity10,
    borderColor: COLORS.primary,
  },
  durationMain: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurfaceVariant,
    fontWeight: '800',
  },
  durationMainActive: {
    color: COLORS.primary,
  },
  durationSub: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
  },
  durationSubActive: {
    color: COLORS.primary,
  },

  // Preview Card
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryOpacity05,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  previewText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    flex: 1,
    lineHeight: 20,
  },
  previewHighlight: {
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Map Trigger
  mapTriggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  mapTriggerLeft: {
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
  mapTriggerValue: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  mapTriggerSub: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
  },

  // Banners
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.amberOpacity10,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  bannerInfoText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.amber,
    flex: 1,
  },
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.errorContainer,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  bannerErrorText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onErrorContainer,
    flex: 1,
  },

  // Format Chips
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
  },
  chipTextActive: {
    color: COLORS.onPrimary,
    fontWeight: '800',
  },

  // Elo Row
  eloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  eloField: {
    flex: 1,
    gap: 4,
  },
  eloFieldLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontWeight: '700',
  },
  eloInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  eloDash: {
    width: 16,
    height: 1.5,
    backgroundColor: COLORS.outline,
    marginTop: 22,
  },

  // Message
  messageInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    height: 80,
    textAlignVertical: 'top',
  },

  // Submit CTA
  submitBtn: {
    marginTop: SPACING.xs,
  },
});

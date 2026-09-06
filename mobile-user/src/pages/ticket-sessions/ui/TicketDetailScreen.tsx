import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { fetchSessionDetail } from '../../../entities/ticket/api/ticketApi';
import { TicketSession, SportLevel } from '../../../entities/ticket/model/ticket.types';
import { DevXeVeTestPanel } from '../../../features/ticket-sessions';
import { usersApi, UserProfileDto } from '../../../shared/api/users';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { getSportLevelMeta } from '../../../shared/lib/utils/elo';
import { AuthRequiredModal } from '../../../shared/ui/AuthRequiredModal';
import { loadNativeUserSessionAsync } from '../../../shared/lib/userSession';

export function TicketDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const sessionId = Array.isArray(id) ? id[0] : id;

  const [session, setSession] = useState<TicketSession | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  useEffect(() => {
    usersApi.getProfile().then(setCurrentUser).catch(() => {});
  }, []);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessionDetail(sessionId as string);
      setSession(data);
      // Auto-sync quantity to available remaining slots
      const rem = Math.max(0, data.maxSlots - data.bookedSlots);
      if (rem <= 0) {
        setQuantity(1);
      } else {
        setQuantity((q) => Math.min(q, rem));
      }
    } catch (err: any) {
      console.error('Failed to fetch session detail:', err);
      setError(err.message || 'Không thể tải thông tin ca xé vé');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useFocusEffect(
    useCallback(() => {
      loadSession();
    }, [loadSession])
  );


  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/ticket-sessions' as any);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[dateObj.getDay()];
      return `${dayName}, ${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  const calculateDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return '120 phút';
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const diffMins = (eh * 60 + em) - (sh * 60 + sm);
      return diffMins > 0 ? `${diffMins} phút` : '120 phút';
    } catch {
      return '120 phút';
    }
  };

  const openGoogleMaps = () => {
    if (!session) return;
    const query = encodeURIComponent(session.venueAddress || session.venueLocation || session.venueName);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết ca xé vé...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Ca Xé Vé</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error || 'Không tìm thấy thông tin ca xé vé'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadSession}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const remainingSlots = Math.max(0, session.maxSlots - session.bookedSlots);
  const isFull = remainingSlots <= 0 || session.status === 'FULL';
  const isAlmostFull = remainingSlots > 0 && remainingSlots <= 2;
  const totalPrice = session.pricePerTicket * quantity;
  const levelMeta = getSportLevelMeta(session.sportLevel);
  const progressPercent = Math.min(100, Math.round((session.bookedSlots / session.maxSlots) * 100));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Top Floating App Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Ca Xé Vé</Text>
        <TouchableOpacity onPress={loadSession} style={styles.reloadBtn} activeOpacity={0.8}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Hero Cover Banner ── */}
        <View style={styles.heroWrapper}>
          {session.coverImage ? (
            <Image source={{ uri: session.coverImage }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroFallback}>
              <Ionicons name="tennisball" size={56} color={COLORS.primary} />
            </View>
          )}

          {/* Gradient Overlay & Status Pill */}
          <View style={styles.heroOverlay}>
            <View style={styles.heroTopRow}>
              <View style={styles.sportTypePill}>
                <Ionicons name="trophy-outline" size={13} color="#FFFFFF" />
                <Text style={styles.sportTypePillText}>
                  {(session.sportName || 'PICKLEBALL').toUpperCase()}
                </Text>
              </View>

              <View
                style={[
                  styles.statusPill,
                  isFull ? styles.statusPillFull : isAlmostFull ? styles.statusPillAmber : styles.statusPillOpen,
                ]}
              >
                <View
                  style={[
                    styles.statusPillDot,
                    isFull ? { backgroundColor: '#EF4444' } : isAlmostFull ? { backgroundColor: '#F59E0B' } : { backgroundColor: '#10B981' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusPillText,
                    isFull ? { color: '#EF4444' } : isAlmostFull ? { color: '#D97706' } : { color: '#059669' },
                  ]}
                >
                  {isFull ? 'HẾT VÉ' : isAlmostFull ? 'SẮP HẾT VÉ' : 'ĐANG MỞ ĐẶT VÉ'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 1.5. DEV TEST PANEL (Only for DEV Testers / Admins) ── */}
        {(currentUser?.isDevTester || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
          <DevXeVeTestPanel session={session} onRefresh={loadSession} />
        )}

        {/* ── 1.8. Fixed Host Team Card (If Owner has fixed team) ── */}
        {session.hasHostTeam && (
          <View style={[styles.sectionCard, styles.hostTeamCard]}>
            <View style={styles.hostTeamHeader}>
              <View style={styles.hostTeamIconWrap}>
                <Ionicons name="shield" size={18} color="#4338CA" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.hostTeamTitle}>ĐỐI ĐẦU ĐỘI SÂN NHÀ</Text>
                  <View style={styles.hostTeamBadge}>
                    <Text style={styles.hostTeamBadgeText}>CHỜ THÁCH ĐẤU</Text>
                  </View>
                </View>
                <Text style={styles.hostTeamSubtitle}>
                  Đội sân nhà đang chờ đối thủ! Mua vé để cùng các đấu thủ khác lập đội so tài & tính điểm Elo xếp hạng.
                </Text>
              </View>
            </View>

            <View style={styles.hostTeamInfoBox}>
              <View style={styles.hostTeamInfoItem}>
                <Text style={styles.hostTeamInfoLabel}>TÊN ĐỘI SÂN NHÀ</Text>
                <Text style={styles.hostTeamInfoValue}>{session.hostTeamName || 'Đội Sân Nhà'}</Text>
              </View>
              <View style={styles.hostTeamInfoDivider} />
              <View style={styles.hostTeamInfoItem}>
                <Text style={styles.hostTeamInfoLabel}>TRÌNH ĐỘ ĐỘI NHÀ</Text>
                <Text style={styles.hostTeamInfoValue}>
                  {session.hostTeamLevel ? getSportLevelMeta(session.hostTeamLevel).label : levelMeta.label}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── 2. Venue Info & Court Details Card ── */}
        <View style={styles.sectionCard}>
          <View style={styles.venueTitleRow}>
            <View style={styles.venueTitleCol}>
              <View style={styles.verifiedRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#059669" />
                  <Text style={styles.verifiedBadgeText}>ĐÃ XÁC THỰC</Text>
                </View>
                <View style={styles.courtNameTag}>
                  <Text style={styles.courtNameTagText}>{session.courtName}</Text>
                </View>
              </View>

              <Text style={styles.venueNameText}>{session.venueName}</Text>
            </View>
          </View>

          {/* Address row with Maps button */}
          <View style={styles.addressBox}>
            <View style={styles.addressLeft}>
              <Ionicons name="location-sharp" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
              <Text style={styles.addressText}>
                {session.venueAddress || session.venueLocation || 'Địa chỉ cụm sân thể thao Sporta'}
              </Text>
            </View>
            <TouchableOpacity style={styles.mapsBtn} onPress={openGoogleMaps} activeOpacity={0.8}>
              <Ionicons name="navigate-outline" size={14} color={COLORS.primary} />
              <Text style={styles.mapsBtnText}>Chỉ đường</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. Schedule & Level Details Card ── */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardSectionTitle}>Thời gian & Trình độ thi đấu</Text>
          </View>

          <View style={styles.scheduleGrid}>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleColLabel}>Ngày chơi</Text>
              <Text style={styles.scheduleColValue}>{formatDateString(session.playDate)}</Text>
            </View>

            <View style={styles.scheduleColDivider} />

            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleColLabel}>Khung giờ</Text>
              <Text style={styles.scheduleColValue}>
                {session.startTime} - {session.endTime}
              </Text>
              <Text style={styles.scheduleDuration}>
                ({calculateDuration(session.startTime, session.endTime)})
              </Text>
            </View>
          </View>

          {/* Level Info Banner */}
          <View style={[styles.levelBanner, { backgroundColor: `${levelMeta.color}12`, borderColor: `${levelMeta.color}30` }]}>
            <View style={[styles.levelIconWrap, { backgroundColor: levelMeta.color }]}>
              <Ionicons name="medal-outline" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.levelTextCol}>
              <View style={styles.levelNameRow}>
                <Text style={styles.levelLabelPrefix}>Trình độ yêu cầu:</Text>
                <Text style={[styles.levelNameText, { color: levelMeta.color }]}>{levelMeta.label}</Text>
              </View>
              <Text style={styles.levelDescText}>{levelMeta.desc}</Text>
            </View>
          </View>
        </View>

        {/* ── 4. Slot Availability & Progress Card ── */}
        <View style={styles.sectionCard}>
          <View style={styles.slotHeaderRow}>
            <View style={styles.slotHeaderLeft}>
              <Ionicons name="people-outline" size={18} color={COLORS.primary} />
              <Text style={styles.cardSectionTitle}>Tình trạng chỗ trống</Text>
            </View>
            <Text style={[styles.slotBadgeBold, isFull ? styles.textRed : isAlmostFull ? styles.textAmber : styles.textGreen]}>
              {isFull ? 'HẾT SLOT' : `Còn ${remainingSlots} / ${session.maxSlots} vé`}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
                isFull ? { backgroundColor: COLORS.error } : isAlmostFull ? { backgroundColor: '#F59E0B' } : { backgroundColor: COLORS.primary },
              ]}
            />
          </View>

          <View style={styles.progressSubRow}>
            <Text style={styles.progressSubText}>Đã đặt: {session.bookedSlots} vé</Text>
            <Text style={styles.progressSubText}>Tổng số: {session.maxSlots} vé</Text>
          </View>
        </View>

        {/* ── 5. Quantity Selector Card (When Available) ── */}
        {!isFull && (
          <View style={styles.sectionCard}>
            <View style={styles.quantityCardRow}>
              <View style={styles.quantityInfoCol}>
                <Text style={styles.cardSectionTitle}>Số lượng vé đặt</Text>
                <Text style={styles.quantitySubText}>
                  Đặt cho bạn & bạn bè (Tối đa {remainingSlots} vé)
                </Text>
              </View>

              <View style={styles.counterControlRow}>
                <TouchableOpacity
                  style={[styles.counterBtn, quantity <= 1 && styles.counterBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  activeOpacity={0.75}
                >
                  <Ionicons name="remove" size={18} color={quantity <= 1 ? COLORS.outline : COLORS.primary} />
                </TouchableOpacity>

                <Text style={styles.counterNumberText}>{quantity}</Text>

                <TouchableOpacity
                  style={[styles.counterBtn, quantity >= remainingSlots && styles.counterBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.min(remainingSlots, q + 1))}
                  disabled={quantity >= remainingSlots}
                  activeOpacity={0.75}
                >
                  <Ionicons name="add" size={18} color={quantity >= remainingSlots ? COLORS.outline : COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quantityPriceRow}>
              <Text style={styles.quantityPriceLabel}>Đơn giá / vé:</Text>
              <Text style={styles.quantityPriceVal}>{formatCurrency(session.pricePerTicket)}</Text>
            </View>
          </View>
        )}

        {/* ── 6. Rules & Policy Card ── */}
        <View style={styles.rulesCard}>
          <View style={styles.rulesHeaderRow}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.rulesHeaderTitle}>Quy định & Hướng dẫn ca xé vé</Text>
          </View>

          <View style={styles.ruleItem}>
            <Ionicons name="qr-code-outline" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
            <Text style={styles.ruleItemText}>
              Mỗi vé được cấp 01 Mã QR & ShortCode riêng biệt để check-in độc lập tại cụm sân.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
            <Text style={styles.ruleItemText}>
              Cho phép check-in sớm từ 60 phút trước giờ bắt đầu để khởi động và chuẩn bị.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Ionicons name="warning-outline" size={16} color="#D97706" style={{ marginTop: 2 }} />
            <Text style={[styles.ruleItemText, { color: '#B45309', fontWeight: '600' }]}>
              Lưu ý: Vé xé mua theo suất cá nhân, không hỗ trợ hủy và không hoàn tiền sau khi thanh toán.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── 7. Sticky Bottom Action Bar ── */}
      <View style={[styles.bottomBarWrapper, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Tổng tiền ({quantity} vé):</Text>
          <Text style={styles.bottomPriceValue}>{formatCurrency(totalPrice)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutBtn, isFull && styles.checkoutBtnDisabled]}
          onPress={async () => {
            const sessionAuth = await loadNativeUserSessionAsync();
            if (!sessionAuth.isAuthenticated) {
              setAuthModalVisible(true);
              return;
            }
            router.push({
              pathname: '/ticket-payment/[id]',
              params: { id: session.id, quantity: String(quantity) },
            } as any);
          }}
          disabled={isFull}
          activeOpacity={0.85}
        >
          <Text style={[styles.checkoutBtnText, isFull && styles.checkoutBtnTextDisabled]}>
            {isFull ? 'Đã hết vé' : 'Tiếp tục thanh toán'}
          </Text>
          {!isFull && <Ionicons name="arrow-forward" size={18} color={COLORS.onSecondary} />}
        </TouchableOpacity>
      </View>

      {/* Auth Required Guard */}
      <AuthRequiredModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        actionTitle="Đăng nhập để mua vé xé"
        actionDescription="Vui lòng đăng nhập tài khoản Sporta để tiếp tục mua vé tham gia ca xé vé này."
        actionIcon="confirmation-number"
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 16.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: 160,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 8,
  },
  retryBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
  },

  /* Hero Section */
  heroWrapper: {
    height: 200,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  sportTypePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusPillOpen: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  statusPillAmber: {
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
  },
  statusPillFull: {
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
  },
  statusPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  /* Standard Section Card */
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  venueTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  venueTitleCol: {
    flex: 1,
    gap: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  verifiedBadgeText: {
    color: '#059669',
    fontSize: 9.5,
    fontWeight: '800',
  },
  courtNameTag: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  courtNameTagText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  venueNameText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.onSurface,
    lineHeight: 22,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    gap: 10,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
  },
  addressText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  mapsBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  /* Schedule Grid */
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  scheduleGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 12,
    borderRadius: BORDER_RADIUS.lg,
  },
  scheduleCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  scheduleColDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  scheduleColLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  scheduleColValue: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scheduleDuration: {
    fontSize: 10.5,
    color: COLORS.outline,
    fontWeight: '600',
  },

  /* Level Banner */
  levelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  levelIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelTextCol: {
    flex: 1,
    gap: 2,
  },
  levelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  levelLabelPrefix: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  levelNameText: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  levelDescText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },

  /* Slot Progress */
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotBadgeBold: {
    fontSize: 13,
    fontWeight: '900',
  },
  textGreen: {
    color: '#059669',
  },
  textAmber: {
    color: '#D97706',
  },
  textRed: {
    color: '#DC2626',
  },
  progressTrack: {
    height: 9,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  progressSubText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },

  /* Quantity Selector */
  quantityCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityInfoCol: {
    flex: 1,
    gap: 2,
  },
  quantitySubText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  counterControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  counterBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
    elevation: 0,
  },
  counterNumberText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    minWidth: 20,
    textAlign: 'center',
  },
  quantityPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    paddingTop: 8,
    marginTop: 4,
  },
  quantityPriceLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  quantityPriceVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.primary,
  },

  /* Rules & Policy */
  rulesCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: 8,
  },
  rulesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  rulesHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleItemText: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 16,
  },

  /* Sticky Bottom Bar */
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomPriceCol: {
    gap: 2,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  bottomPriceValue: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.secondary, // Dynamic Athletic Yellow #FED01B
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSecondary, // Deep Emerald text
    fontWeight: '900',
    fontSize: 14.5,
  },
  checkoutBtnTextDisabled: {
    color: COLORS.outline,
  },

  /* Host Team Card Styles */
  hostTeamCard: {
    backgroundColor: '#F5F7FF',
    borderColor: '#C7D2FE',
    borderWidth: 1.5,
    gap: 12,
  },
  hostTeamHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  hostTeamIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  hostTeamTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#312E81',
    letterSpacing: 0.3,
  },
  hostTeamBadge: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hostTeamBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  hostTeamSubtitle: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 15,
  },
  hostTeamInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  hostTeamInfoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  hostTeamInfoLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.4,
  },
  hostTeamInfoValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  hostTeamInfoDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
});

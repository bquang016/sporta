import React, { useState, useEffect, useRef } from 'react';
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
  Share,
  Platform,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { UserTicket, SportLevel } from '../../../entities/ticket/model/ticket.types';
import { getSportLevelLabel } from '../../../shared/lib/utils/elo';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TicketQrModalProps {
  visible: boolean;
  ticket: UserTicket | null;
  onClose: () => void;
}

export function TicketQrModal({ visible, ticket, onClose }: TicketQrModalProps) {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);

  // 60FPS Slide & Fade Animation (Hardware-accelerated via native driver)
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Entrance and Exit animations
  useEffect(() => {
    if (visible && ticket) {
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);
      setCopied(false);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 75,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, ticket]);

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

  // 60FPS PanResponder for smooth Swipe-Down to Dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.3;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 110 || gestureState.vy > 0.5) {
          handleClose();
        } else {
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

  if (!ticket) return null;

  const isUnused = ticket.status === 'UNUSED';
  const isUsed = ticket.status === 'USED';
  const isRefunded = ticket.status === 'REFUNDED';

  const getStatusLabel = () => {
    if (isUnused) return 'Vé hợp lệ • Chưa sử dụng';
    if (isUsed) return 'Đã check-in';
    if (isRefunded) return 'Vé đã hoàn trả';
    return ticket.status;
  };


  const getSportIcon = (): keyof typeof MaterialIcons.glyphMap => {
    const text = `${ticket.venueName || ''} ${ticket.courtName || ''}`.toLowerCase();
    if (
      text.includes('bóng đá') ||
      text.includes('football') ||
      text.includes('soccer') ||
      text.includes('futsal') ||
      text.includes('sân 7') ||
      text.includes('sân 5') ||
      text.includes('sân 11')
    ) {
      return 'sports-soccer';
    }
    if (text.includes('cầu lông') || text.includes('badminton')) {
      return 'sports-tennis';
    }
    if (text.includes('tennis') || text.includes('quần vợt')) {
      return 'sports-tennis';
    }
    if (text.includes('bóng rổ') || text.includes('basketball')) {
      return 'sports-basketball';
    }
    if (text.includes('bóng chuyền') || text.includes('volleyball')) {
      return 'sports-volleyball';
    }
    if (text.includes('pickleball')) {
      return 'sports-tennis';
    }
    return 'sports-soccer';
  };

  const formatDate = (dateStr: string) => {
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

  const handleCopyShortCode = async () => {
    if (!ticket.shortCode) return;
    await Clipboard.setStringAsync(ticket.shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCallOwner = () => {
    Linking.openURL('tel:0987654321').catch(() => {});
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Vé ca chơi tại ${ticket.venueName} (${ticket.courtName}), khung giờ ${ticket.startTime} - ${ticket.endTime}, ngày ${ticket.playDate}. Mã vé: ${ticket.shortCode}`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  const handleOpenDirections = () => {
    const query = encodeURIComponent(ticket.venueAddress || ticket.venueName);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    ticket.qrCodeToken || ticket.ticketId
  )}`;

  const totalPrice = ticket.totalPrice || (ticket.price ? ticket.price * (ticket.quantity || 1) : 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Backdrop Overlay */}
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

        {/* Floating Bottom Sheet Container */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* ── 1. CLEAN TOP HEADER (Drag Handle & Actions) ── */}
          <View style={styles.topAnchorHeader} {...panResponder.panHandlers}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.headerTopRow}>
              <View style={styles.headerLeftCol}>
                <View style={styles.brandBadge}>
                  <MaterialIcons name="confirmation-number" size={12} color="#064E3B" />
                  <Text style={styles.brandBadgeText}>SPORTA E-TICKET</Text>
                </View>
                <Text style={styles.headerTitleText}>Chi Tiết Vé Điện Tử</Text>
              </View>

              <View style={styles.headerRightBtns}>
                <TouchableOpacity
                  style={styles.actionCircleBtn}
                  activeOpacity={0.75}
                  onPress={handleShare}
                >
                  <MaterialIcons name="share" size={18} color="#0F172A" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCircleBtn}
                  activeOpacity={0.75}
                  onPress={handleClose}
                >
                  <MaterialIcons name="close" size={20} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── 2. SINGLE UNIFIED SCROLLABLE CONTENT (NO TABS) ── */}
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* ── 2A. VENUE & MATCH HERO CARD ── */}
            <View style={styles.heroCard}>
              <View style={styles.heroCardHeader}>
                <View style={styles.venueAvatar}>
                  <MaterialIcons name={getSportIcon()} size={22} color="#064E3B" />
                </View>

                <View style={styles.venueTitleBlock}>
                  <Text style={styles.venueName} numberOfLines={1}>
                    {ticket.venueName}
                  </Text>
                  <View style={styles.tagRow}>
                    <View style={styles.courtTag}>
                      <Text style={styles.courtTagText}>Sân: {ticket.courtName}</Text>
                    </View>
                    <View style={styles.levelTag}>
                      <Text style={styles.levelTagText}>{getSportLevelLabel(ticket.sportLevel)}</Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isUnused && styles.statusBadgeUnused,
                    isUsed && styles.statusBadgeUsed,
                    isRefunded && styles.statusBadgeRefunded,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isUnused && styles.statusBadgeTextUnused,
                      isUsed && styles.statusBadgeTextUsed,
                      isRefunded && styles.statusBadgeTextRefunded,
                    ]}
                  >
                    {getStatusLabel()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Match Details */}
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={17} color="#064E3B" />
                  <Text style={styles.detailTextBold}>
                    {ticket.startTime} - {ticket.endTime} • {formatDate(ticket.playDate)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="location-on" size={17} color="#64748B" />
                  <Text style={styles.detailText} numberOfLines={2}>
                    {ticket.venueAddress || ticket.venueName}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="receipt-long" size={17} color="#64748B" />
                  <Text style={styles.detailText}>
                    Số lượng: <Text style={styles.boldText}>{ticket.quantity || 1} vé</Text> • Mã đơn: <Text style={styles.boldText}>#{ticket.orderCode || ticket.ticketId.substring(0, 8).toUpperCase()}</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* ── 2B. QR CODE CENTERPIECE CARD ── */}
            <View style={styles.qrCard}>
              <Text style={styles.qrCardTitle}>MÃ QR XÁC THỰC NHẬN SÂN</Text>

              <View style={styles.qrFrame}>
                {/* Corner Targeting Brackets */}
                <View style={[styles.qrCorner, styles.cornerTopLeft]} />
                <View style={[styles.qrCorner, styles.cornerTopRight]} />
                <View style={[styles.qrCorner, styles.cornerBottomLeft]} />
                <View style={[styles.qrCorner, styles.cornerBottomRight]} />

                <Image
                  source={{ uri: qrImageUrl }}
                  style={[styles.qrImage, isUsed && { opacity: 0.18 }]}
                  resizeMode="contain"
                />

                {isUsed && (
                  <View style={styles.usedStampOverlay}>
                    <View style={styles.usedStampBadge}>
                      <MaterialIcons name="task-alt" size={32} color="#059669" />
                      <Text style={styles.usedStampText}>ĐÃ CHECK-IN</Text>
                    </View>
                  </View>
                )}
              </View>

              <Text style={styles.qrInstruction}>
                {isUsed
                  ? 'Vé này đã được đối soát & check-in thành công tại sân.'
                  : 'Đưa mã QR này cho ban quản lý sân để quét nhận sân khi đến thi đấu.'}
              </Text>

              {/* ShortCode Manual Box */}
              <View style={styles.shortCodeBox}>
                <View style={styles.shortCodeLeft}>
                  <Text style={styles.shortCodeLabel}>MÃ VÉ THỦ CÔNG</Text>
                  <Text style={styles.shortCodeValue}>#{ticket.shortCode}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.copyBtn, copied && styles.copyBtnActive]}
                  onPress={handleCopyShortCode}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={copied ? 'check' : 'content-copy'}
                    size={15}
                    color={copied ? '#059669' : '#064E3B'}
                  />
                  <Text style={[styles.copyBtnText, copied && styles.copyBtnTextActive]}>
                    {copied ? 'Đã sao chép' : 'Sao chép'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── 2C. 3-COLUMN SUMMARY STRIP ── */}
            <View style={styles.summaryStrip}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Số lượng</Text>
                <Text style={styles.summaryValue}>{ticket.quantity || 1} Vé</Text>
                <Text style={styles.summarySub}>Tiêu chuẩn</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Khung giờ</Text>
                <Text style={styles.summaryValue}>{ticket.startTime} - {ticket.endTime}</Text>
                <Text style={styles.summarySub}>Hàng ngày</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Tổng tiền</Text>
                <Text style={styles.summaryValue}>
                  {totalPrice > 0 ? `${totalPrice.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                </Text>
                <Text style={styles.summarySub}>Đã thanh toán</Text>
              </View>
            </View>

            {/* ── 2D. GOOGLE MAPS DIRECT BUTTON ── */}
            <TouchableOpacity
              style={styles.googleMapsBtn}
              onPress={handleOpenDirections}
              activeOpacity={0.8}
            >
              <MaterialIcons name="directions" size={18} color="#064E3B" />
              <Text style={styles.googleMapsBtnText}>Chỉ đường Google Maps đến sân</Text>
              <MaterialIcons name="open-in-new" size={15} color="#064E3B" />
            </TouchableOpacity>

            {/* ── 2E. CHECK-IN GUIDELINES CARD ── */}
            <View style={styles.rulesCard}>
              <View style={styles.rulesHeader}>
                <MaterialIcons name="info-outline" size={17} color="#064E3B" />
                <Text style={styles.rulesTitle}>Quy định & Lưu ý nhận sân</Text>
              </View>
              <View style={styles.ruleItem}>
                <MaterialIcons name="check-circle" size={16} color="#059669" />
                <Text style={styles.ruleText}>
                  Vui lòng có mặt tại sân trước 10-15 phút để làm thủ tục quét mã nhận sân đúng giờ thi đấu.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <MaterialIcons name="confirmation-number" size={16} color="#064E3B" />
                <Text style={styles.ruleText}>
                  Mỗi mã QR / ShortCode chỉ có hiệu lực quét 01 lần cho đúng số lượng slot đã đặt.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <MaterialIcons name="error-outline" size={16} color="#D97706" />
                <Text style={styles.ruleText}>
                  Vé xé ca chơi không hỗ trợ hoàn tiền hoặc hủy lịch sau khi thanh toán thành công.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* ── 3. BOTTOM FLOATING ACTION DOCK ── */}
          <View
            style={[
              styles.bottomDock,
              { paddingBottom: Math.max(insets.bottom, 12) + 6 },
            ]}
          >
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={handleCallOwner}
              activeOpacity={0.8}
            >
              <MaterialIcons name="phone" size={18} color="#064E3B" />
              <Text style={styles.contactBtnText}>Liên hệ sân</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleOpenDirections}
              activeOpacity={0.88}
            >
              <MaterialIcons name="directions" size={18} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Chỉ đường tới sân</Text>
              <MaterialIcons name="chevron-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.88,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },

  /* ── Top Header ── */
  topAnchorHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftCol: {
    gap: 2,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#064E3B',
    letterSpacing: 0.5,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Scroll Body ── */
  sheetScroll: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
    gap: 12,
  },

  /* ── Hero Card ── */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  venueAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueTitleBlock: {
    flex: 1,
    gap: 2,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courtTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  courtTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#064E3B',
  },
  levelTag: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusBadgeUnused: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeUsed: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeRefunded: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusBadgeTextUnused: {
    color: '#064E3B',
  },
  statusBadgeTextUsed: {
    color: '#64748B',
  },
  statusBadgeTextRefunded: {
    color: '#DC2626',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  detailsList: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#64748B',
    flex: 1,
  },
  detailTextBold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },

  /* ── QR Centerpiece Card ── */
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  qrCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  qrFrame: {
    width: 210,
    height: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrCorner: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderColor: '#064E3B',
  },
  cornerTopLeft: {
    top: 6,
    left: 6,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 5,
  },
  cornerTopRight: {
    top: 6,
    right: 6,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 5,
  },
  cornerBottomLeft: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 5,
  },
  cornerBottomRight: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 5,
  },
  usedStampOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usedStampBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 2,
    borderColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
  },
  usedStampText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  qrInstruction: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 16,
  },
  shortCodeBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shortCodeLeft: {
    gap: 1,
  },
  shortCodeLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  shortCodeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#064E3B',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  copyBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
  },
  copyBtnTextActive: {
    color: '#059669',
  },

  /* ── 3-Column Summary Strip ── */
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  summarySub: {
    fontSize: 10,
    fontWeight: '400',
    color: '#94A3B8',
  },
  summaryDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },

  /* ── Maps Button ── */
  googleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  googleMapsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064E3B',
  },

  /* ── Rules Card ── */
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#334155',
    lineHeight: 17,
  },

  /* ── Bottom Floating Dock ── */
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064E3B',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#064E3B',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TicketQrModal;

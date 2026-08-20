import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Voucher, UserVoucher, VoucherScope, DiscountType } from '../types';
import { voucherApi } from '../api';
import { useAlert } from '../../../shared/contexts/AlertContext';

interface VoucherDetailModalProps {
  visible: boolean;
  onClose: () => void;
  voucher?: Voucher | null;
  userVoucher?: UserVoucher | null;
  isAuthenticated: boolean;
  isAlreadyCollected?: boolean;
}

export function VoucherDetailModal({
  visible,
  onClose,
  voucher,
  userVoucher,
  isAuthenticated,
  isAlreadyCollected = false,
}: VoucherDetailModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [collecting, setCollecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCollected = !!userVoucher || isAlreadyCollected;
  const [collected, setCollected] = useState(isCollected);

  React.useEffect(() => {
    setCollected(!!userVoucher || isAlreadyCollected);
  }, [userVoucher, isAlreadyCollected]);

  if (!voucher && !userVoucher) return null;

  const vName = userVoucher?.voucherName || voucher?.name || userVoucher?.voucher?.name || 'Mã giảm giá Sporta';
  const vCode = userVoucher?.voucherCode || voucher?.code || userVoucher?.voucher?.code || '';
  const vDiscountType = userVoucher?.discountType || voucher?.discountType || userVoucher?.voucher?.discountType || DiscountType.PERCENTAGE;
  const vDiscountValue = userVoucher?.discountValue ?? voucher?.discountValue ?? userVoucher?.voucher?.discountValue ?? 0;
  const vMaxDiscount = userVoucher?.maxDiscountAmount ?? voucher?.maxDiscountAmount ?? userVoucher?.voucher?.maxDiscountAmount ?? null;
  const vMinOrder = userVoucher?.minOrderAmount ?? voucher?.minOrderAmount ?? userVoucher?.voucher?.minOrderAmount ?? 0;
  const vScope = userVoucher?.voucherScope || voucher?.voucherScope || userVoucher?.voucher?.voucherScope || VoucherScope.SYSTEM;
  const vStartDate = userVoucher?.startDate || voucher?.startDate || userVoucher?.voucher?.startDate || '';
  const vEndDate = userVoucher?.endDate || voucher?.endDate || userVoucher?.voucher?.endDate || '';
  const bannerImage = userVoucher?.bannerImageUrl || voucher?.bannerImageUrl || userVoucher?.voucher?.bannerImageUrl;
  const venueNames = userVoucher?.venueNames || voucher?.venueNames || userVoucher?.voucher?.venueNames;
  const venueIds = userVoucher?.venueIds || voucher?.venueIds || userVoucher?.voucher?.venueIds;
  const voucherId = userVoucher?.voucherId || voucher?.id;

  const totalQty = userVoucher?.totalQuantity ?? voucher?.totalQuantity ?? 100;
  const usedQty = userVoucher?.usedQuantity ?? voucher?.usedQuantity ?? 0;
  const remainingQty = userVoucher?.remainingQuantity ?? voucher?.remainingQuantity ?? Math.max(0, totalQty - usedQty);

  const usedPercentage = totalQty > 0 ? Math.min(100, Math.round((usedQty / totalQty) * 100)) : 0;
  const remainingPercentage = Math.max(0, 100 - usedPercentage);
  const isUrgent = remainingPercentage <= 30 && remainingPercentage > 0;
  const isSoldOut = totalQty > 0 && usedQty >= totalQty;

  const isSystem = vScope === VoucherScope.SYSTEM;

  const formatCurrency = (val: number | null | undefined) => {
    if (!val) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const discountText =
    vDiscountType === DiscountType.FIXED_AMOUNT
      ? formatCurrency(vDiscountValue)
      : `${vDiscountValue}%`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const handleCopyCode = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(vCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCollect = async () => {
    if (!isAuthenticated) {
      onClose();
      router.push('/(auth)/login');
      return;
    }

    const isValidUUID = voucherId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(voucherId);

    try {
      setCollecting(true);
      if (isValidUUID) {
        await voucherApi.collectVoucher(voucherId);
      } else if (vCode) {
        await voucherApi.collectVoucherByCode(vCode);
      } else if (voucherId) {
        await voucherApi.collectVoucher(voucherId);
      }
      setCollected(true);
      queryClient.invalidateQueries({ queryKey: ['myVouchers'] });

      const vStartDate = userVoucher?.startDate || voucher?.startDate;
      const isUpcoming = vStartDate ? new Date(vStartDate).getTime() > Date.now() : false;

      if (isUpcoming) {
        showAlert(
          'Đã lưu mã',
          `Đã lưu mã "${vCode}" vào ví voucher của bạn thành công. Lưu ý: Mã sẽ bắt đầu có hiệu lực từ ${formatDate(vStartDate!)}.`,
          undefined,
          { type: 'warning' }
        );
      } else {
        showAlert('Thành công', `Đã lưu mã "${vCode}" vào ví voucher của bạn!`, undefined, { type: 'success' });
      }
    } catch (e: any) {
      console.log('Error collecting voucher:', e);
      showAlert('Không thể lưu mã', e?.message || 'Không thể lưu voucher, vui lòng thử lại sau.', undefined, { type: 'error' });
    } finally {
      setCollecting(false);
    }
  };

  const handleUseNow = () => {
    onClose();
    if (!isSystem && venueIds && venueIds.length === 1) {
      router.push(`/booking/${venueIds[0]}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* ── Banner Header ── */}
          <View style={styles.bannerHeader}>
            {bannerImage ? (
              <Image source={{ uri: bannerImage }} style={styles.bannerImage} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['#064E3B', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerFallback}
              >
                <MaterialIcons name="local-offer" size={48} color="rgba(255,255,255,0.3)" />
              </LinearGradient>
            )}

            {/* Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Scope Badge */}
            <View style={styles.scopeBadge}>
              <Text style={styles.scopeBadgeText}>
                {isSystem ? 'VOUCHER TOÀN HỆ THỐNG' : 'VOUCHER CỤM SÂN'}
              </Text>
            </View>
          </View>

          {/* ── Scrollable Body ── */}
          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Title & Discount Highlight */}
            <View style={styles.titleSection}>
              <Text style={styles.voucherName}>{vName}</Text>

              {/* Code Pill + Copy */}
              {vCode ? (
                <View style={styles.codeRow}>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>Mã voucher:</Text>
                    <Text style={styles.codeValue}>{vCode}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode} activeOpacity={0.75}>
                    <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={COLORS.primary} />
                    <Text style={styles.copyBtnText}>{copied ? 'Đã chép' : 'Sao chép'}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            {/* ── Sold Out Alert Notice ── */}
            {isSoldOut && (
              <View style={styles.soldOutNotice}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.soldOutNoticeTitle}>Mã đã hết lượt sử dụng</Text>
                  <Text style={styles.soldOutNoticeSub}>
                    Rất tiếc, số lượng mã ưu đãi này đã được người dùng khác áp dụng hết.
                  </Text>
                </View>
              </View>
            )}

            {/* ── Progress Bar Card (Remaining Slots) ── */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressTitleWrap}>
                  <Ionicons
                    name={isUrgent ? 'flame' : 'ticket'}
                    size={16}
                    color={isUrgent ? '#EF4444' : COLORS.primary}
                  />
                  <Text style={[styles.progressTitle, isUrgent && styles.progressTitleUrgent]}>
                    {isUrgent ? 'Sắp hết lượt ưu đãi!' : 'Tiến độ phát hành mã'}
                  </Text>
                </View>
                <Text style={styles.progressQtyText}>
                  Còn <Text style={{ fontWeight: '900', color: COLORS.primary }}>{remainingQty}</Text> / {totalQty} mã
                </Text>
              </View>

              <View style={styles.progressTrackBig}>
                <View
                  style={[
                    styles.progressFillBig,
                    {
                      width: `${Math.max(6, usedPercentage)}%`,
                      backgroundColor: isUrgent ? '#EF4444' : '#10B981',
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressSubText}>
                {isUrgent
                  ? `Đã sử dụng ${usedPercentage}% số lượng mã. Hãy đặt sân ngay trước khi hết!`
                  : `Đã có ${usedQty} lượt đặt sân sử dụng mã khuyến mãi này.`}
              </Text>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailCard}>
                <Ionicons name="pricetag-outline" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Mức giảm</Text>
                <Text style={styles.detailValueBold}>Giảm {discountText}</Text>
              </View>

              <View style={styles.detailCard}>
                <Ionicons name="cart-outline" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Đơn tối thiểu</Text>
                <Text style={styles.detailValue}>{formatCurrency(vMinOrder)}</Text>
              </View>

              <View style={styles.detailCard}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Giảm tối đa</Text>
                <Text style={styles.detailValue}>
                  {vMaxDiscount ? formatCurrency(vMaxDiscount) : 'Không giới hạn'}
                </Text>
              </View>

              <View style={styles.detailCard}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Thời hạn</Text>
                <Text style={styles.detailValue}>
                  {formatDate(vStartDate)} - {formatDate(vEndDate)}
                </Text>
              </View>
            </View>

            {/* Applicable Scope Section */}
            <View style={styles.infoSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Phạm vi áp dụng</Text>
                {!isSystem && venueNames && venueNames.length > 0 && (
                  <Text style={styles.venueCountText}>{venueNames.length} cụm sân áp dụng</Text>
                )}
              </View>

              {isSystem ? (
                <View style={styles.scopeInfoRow}>
                  <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.scopeInfoText}>
                    Áp dụng cho tất cả các cụm sân thể thao trên toàn hệ thống Sporta.
                  </Text>
                </View>
              ) : venueNames && venueNames.length > 0 ? (
                <View style={styles.venueListWrap}>
                  {venueNames.map((name, index) => {
                    const vid = venueIds && venueIds[index] ? venueIds[index] : null;
                    return (
                      <TouchableOpacity
                        key={vid || `venue-${index}`}
                        style={styles.venueCardItem}
                        onPress={() => {
                          onClose();
                          if (vid) {
                            router.push(`/booking/${vid}`);
                          } else {
                            router.push('/search');
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.venueCardLeft}>
                          <View style={styles.venueIconCircle}>
                            <Ionicons name="business" size={15} color={COLORS.primary} />
                          </View>
                          <View style={styles.venueTextWrap}>
                            <Text style={styles.venueCardTitle} numberOfLines={1}>
                              {name}
                            </Text>
                            <Text style={styles.venueCardSub}>
                              Nhấn để xem sân & đặt lịch ngay
                            </Text>
                          </View>
                        </View>
                        <View style={styles.venueActionBtn}>
                          <Text style={styles.venueActionBtnText}>Đặt sân</Text>
                          <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.scopeInfoRow}>
                  <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.scopeInfoText}>
                    Áp dụng tại các cụm sân của đối tác phát hành.
                  </Text>
                </View>
              )}
            </View>

            {/* Terms & Conditions */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionHeading}>Điều kiện sử dụng</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>Mỗi tài khoản được sử dụng mã tối đa theo quy định của chương trình.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>Mã giảm giá được áp dụng trực tiếp tại bước xác nhận thanh toán đặt sân.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>Không có giá trị quy đổi thành tiền mặt hoặc chuyển nhượng.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>Chương trình có thể kết thúc sớm nếu hết số lượng mã khuyến mãi.</Text>
              </View>
            </View>
          </ScrollView>

          {/* ── Footer CTA ── */}
          <View style={styles.footer}>
            {!isAuthenticated ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleCollect} activeOpacity={0.85}>
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Đăng nhập để lưu mã</Text>
              </TouchableOpacity>
            ) : collected ? (
              <View style={styles.actionRow}>
                <View style={styles.collectedTag}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.collectedTagText}>Đã có trong ví</Text>
                </View>
                {isSoldOut ? (
                  <View style={[styles.collectedTag, { backgroundColor: COLORS.surfaceContainerHigh }]}>
                    <Text style={[styles.collectedTagText, { color: COLORS.onSurfaceVariant }]}>Hết lượt dùng</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.useNowBtn} onPress={handleUseNow} activeOpacity={0.85}>
                    <Text style={styles.useNowBtnText}>Đặt sân dùng ngay</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            ) : isSoldOut ? (
              <View style={[styles.primaryBtn, { backgroundColor: COLORS.surfaceContainerHigh }]} pointerEvents="none">
                <Text style={[styles.primaryBtnText, { color: COLORS.onSurfaceVariant }]}>Mã đã hết lượt</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, collecting && styles.primaryBtnDisabled]}
                onPress={handleCollect}
                activeOpacity={0.85}
                disabled={collecting}
              >
                {collecting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>Lưu vào ví voucher</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  bannerHeader: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scopeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scopeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollBody: {
    padding: SPACING.md + 2,
    gap: SPACING.md,
  },
  titleSection: {
    gap: 8,
  },
  voucherName: {
    ...TYPOGRAPHY.titleLg,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 24,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  codeValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryFixedDim,
  },
  copyBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  progressCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  progressTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  progressTitleUrgent: {
    color: '#EF4444',
  },
  progressQtyText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  progressTrackBig: {
    height: 7,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillBig: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailCard: {
    width: '48.5%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.lg,
    padding: 10,
    gap: 2,
  },
  detailLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  detailValue: {
    color: COLORS.onSurface,
    fontSize: 12.5,
    fontWeight: '700',
  },
  detailValueBold: {
    color: COLORS.primary,
    fontSize: 13.5,
    fontWeight: '900',
  },
  infoSection: {
    gap: 6,
  },
  sectionHeading: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 14,
  },
  scopeInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
  },
  scopeInfoText: {
    color: COLORS.onSurface,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    color: COLORS.primary,
    fontSize: 14,
    lineHeight: 18,
  },
  bulletText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  collectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.lg,
  },
  collectedTagText: {
    color: '#059669',
    fontSize: 12.5,
    fontWeight: '800',
  },
  useNowBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  useNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
  },
  soldOutNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  soldOutNoticeTitle: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
  soldOutNoticeSub: {
    color: '#991B1B',
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  venueCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  venueListWrap: {
    gap: 8,
  },
  venueCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  venueCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  venueIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 77, 64, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueTextWrap: {
    flex: 1,
    gap: 2,
  },
  venueCardTitle: {
    color: COLORS.onSurface,
    fontSize: 12.5,
    fontWeight: '800',
  },
  venueCardSub: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10.5,
  },
  venueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0, 77, 64, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: 6,
  },
  venueActionBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
});

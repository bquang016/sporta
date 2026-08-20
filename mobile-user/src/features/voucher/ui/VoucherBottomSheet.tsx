import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useAlert } from '../../../shared/contexts/AlertContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { useMyVouchers } from '../hooks';
import { voucherApi } from '../api';
import { UserVoucher, VoucherScope, DiscountType } from '../types';

interface VoucherBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  orderTotal: number;
  venueId: string;
  selectedVouchers: UserVoucher[];
  onApply: (vouchers: UserVoucher[]) => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const formatCurrency = (val: number | null | undefined) => {
  if (!val) return '0đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export const VoucherBottomSheet: React.FC<VoucherBottomSheetProps> = ({
  visible,
  onClose,
  orderTotal,
  venueId,
  selectedVouchers,
  onApply,
}) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { vouchers, fetchVouchers, loading } = useMyVouchers('ACTIVE');
  const [localSelection, setLocalSelection] = useState<UserVoucher[]>([]);

  // Input code state
  const [inputCode, setInputCode] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchVouchers();
      setLocalSelection(selectedVouchers);
    }
  }, [visible]);

  // Split vouchers into Eligible and Ineligible
  const { eligibleVouchers, ineligibleVouchers } = useMemo(() => {
    const eligible: UserVoucher[] = [];
    const ineligible: Array<{ voucher: UserVoucher; reason: string }> = [];

    vouchers.forEach((uv) => {
      const minOrder = uv.minOrderAmount ?? uv.voucher?.minOrderAmount ?? 0;
      const scope = uv.voucherScope || uv.voucher?.voucherScope || VoucherScope.SYSTEM;
      const vVenueIds = uv.venueIds || uv.voucher?.venueIds;
      const vStartDate = uv.startDate || uv.voucher?.startDate;
      const isUpcoming = vStartDate ? new Date(vStartDate).getTime() > Date.now() : false;
      const totalQty = uv.totalQuantity ?? uv.voucher?.totalQuantity;
      const usedQty = uv.usedQuantity ?? uv.voucher?.usedQuantity ?? 0;
      const isSoldOut = totalQty !== undefined && totalQty > 0 && usedQty >= totalQty;

      // If it's a VENUE voucher and specific venueIds are set, verify it contains venueId
      const isVenueApplicable = 
        scope === VoucherScope.SYSTEM ||
        !vVenueIds ||
        vVenueIds.length === 0 ||
        vVenueIds.includes(venueId);

      if (!isVenueApplicable) {
        const vVenueNames = uv.venueNames || uv.voucher?.venueNames;
        ineligible.push({
          voucher: uv,
          reason: vVenueNames && vVenueNames.length > 0
            ? `Chỉ áp dụng tại: ${vVenueNames.join(', ')}`
            : 'Mã khuyến mãi chỉ áp dụng cho cụm sân khác',
        });
      } else if (isSoldOut) {
        ineligible.push({
          voucher: uv,
          reason: 'Mã khuyến mãi đã hết lượt sử dụng',
        });
      } else if (isUpcoming) {
        ineligible.push({
          voucher: uv,
          reason: `Chưa đến ngày/giờ bắt đầu (${formatDate(vStartDate!)})`,
        });
      } else if (minOrder > orderTotal) {
        ineligible.push({
          voucher: uv,
          reason: `Đơn tối thiểu ${minOrder.toLocaleString('vi-VN')}đ (cần thêm ${(minOrder - orderTotal).toLocaleString('vi-VN')}đ)`,
        });
      } else {
        eligible.push(uv);
      }
    });

    return { eligibleVouchers: eligible, ineligibleVouchers: ineligible };
  }, [vouchers, orderTotal, venueId]);

  const toggleSelection = (uv: UserVoucher) => {
    const scope = uv.voucherScope || uv.voucher?.voucherScope || VoucherScope.SYSTEM;
    const isAlreadySelected = localSelection.some((v) => v.id === uv.id || v.voucherId === uv.voucherId);

    if (isAlreadySelected) {
      setLocalSelection((prev) => prev.filter((v) => v.id !== uv.id && v.voucherId !== uv.voucherId));
    } else {
      // Rule: Max 1 SYSTEM + 1 VENUE voucher
      const newSelection = localSelection.filter(
        (v) => (v.voucherScope || v.voucher?.voucherScope || VoucherScope.SYSTEM) !== scope
      );
      newSelection.push(uv);
      setLocalSelection(newSelection);
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;
    setSubmittingCode(true);
    try {
      const newUv = await voucherApi.collectVoucherByCode(inputCode.trim());
      setInputCode('');
      await fetchVouchers();
      queryClient.invalidateQueries({ queryKey: ['myVouchers'] });

      const vStartDate = newUv.startDate || newUv.voucher?.startDate;
      const isUpcoming = vStartDate ? new Date(vStartDate).getTime() > Date.now() : false;
      const minOrder = newUv.minOrderAmount ?? newUv.voucher?.minOrderAmount ?? 0;

      if (isUpcoming) {
        showAlert(
          'Đã lưu mã',
          `Mã "${newUv.voucherCode || inputCode.toUpperCase()}" đã được lưu vào ví thành công. Mã sẽ bắt đầu có hiệu lực từ ${formatDate(vStartDate!)}.`,
          undefined,
          { type: 'warning' }
        );
      } else if (minOrder > orderTotal) {
        showAlert(
          'Đã lưu mã',
          `Mã "${newUv.voucherCode || inputCode.toUpperCase()}" đã được lưu vào ví của bạn. Đơn hàng hiện tại chưa đạt giá trị tối thiểu ${formatCurrency(minOrder)}.`,
          undefined,
          { type: 'info' }
        );
      } else {
        toggleSelection(newUv);
        showAlert(
          'Áp dụng thành công',
          `Đã tự động chọn áp dụng mã "${newUv.voucherCode || inputCode.toUpperCase()}" cho đơn đặt sân của bạn!`,
          undefined,
          { type: 'success' }
        );
      }
    } catch (err: any) {
      showAlert(
        'Không thể áp dụng',
        err.message || 'Mã khuyến mãi không hợp lệ hoặc đã hết lượt.',
        undefined,
        { type: 'error' }
      );
    } finally {
      setSubmittingCode(false);
    }
  };

  // Calculate estimated discount saving with current local selection
  const estimatedSavings = useMemo(() => {
    let sum = 0;
    localSelection.forEach((uv) => {
      const vDiscountType = uv.discountType || uv.voucher?.discountType || DiscountType.PERCENTAGE;
      const vDiscountValue = uv.discountValue ?? uv.voucher?.discountValue ?? 0;
      const vMaxDiscount = uv.maxDiscountAmount ?? uv.voucher?.maxDiscountAmount;

      let discount = 0;
      if (vDiscountType === DiscountType.FIXED_AMOUNT) {
        discount = vDiscountValue;
      } else {
        discount = (orderTotal * vDiscountValue) / 100;
        if (vMaxDiscount && discount > vMaxDiscount) {
          discount = vMaxDiscount;
        }
      }
      sum += discount;
    });

    const maxAllowed = orderTotal * 0.8;
    return sum > maxAllowed ? maxAllowed : sum;
  }, [localSelection, orderTotal]);

  const handleApply = () => {
    onApply(localSelection);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          {/* ── Drag Handle ── */}
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>

          {/* ── Modal Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Chọn Voucher Khuyến Mãi</Text>
              <Text style={styles.subtitle}>Ví của bạn có {vouchers.length} mã khả dụng</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.75}>
              <Ionicons name="close" size={20} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* ── Enter Voucher Code Input Bar ── */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrap}>
              <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
              <TextInput
                style={styles.inputField}
                placeholder="Nhập mã voucher (VD: SPORTA50)..."
                placeholderTextColor={COLORS.outline}
                value={inputCode}
                onChangeText={setInputCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.inputBtn,
                (!inputCode.trim() || submittingCode) && styles.inputBtnDisabled,
              ]}
              onPress={handleApplyCode}
              disabled={!inputCode.trim() || submittingCode}
              activeOpacity={0.8}
            >
              {submittingCode ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.inputBtnText}>Áp dụng</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Policy Notice ── */}
          <View style={styles.policyNotice}>
            <Ionicons name="information-circle-outline" size={15} color={COLORS.primary} />
            <Text style={styles.policyNoticeText}>
              Áp dụng tối đa <Text style={{ fontWeight: '800' }}>1 mã Sporta</Text> và <Text style={{ fontWeight: '800' }}>1 mã Cụm sân</Text> cho đơn đặt.
            </Text>
          </View>

          {/* ── Scrollable Voucher List ── */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách voucher...</Text>
              </View>
            ) : vouchers.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="ticket-outline" size={48} color={COLORS.outlineVariant} />
                <Text style={styles.emptyTitle}>Chưa có mã khuyến mãi nào</Text>
                <Text style={styles.emptySub}>
                  Hãy săn thêm voucher từ banner trang chủ để nhận ưu đãi giảm giá!
                </Text>
              </View>
            ) : (
              <>
                {/* Eligible Vouchers Section */}
                {eligibleVouchers.length > 0 && (
                  <View style={styles.sectionWrap}>
                    <Text style={styles.sectionHeaderLabel}>
                      Mã có thể áp dụng ({eligibleVouchers.length})
                    </Text>
                    {eligibleVouchers.map((uv) => {
                      const isSelected = localSelection.some(
                        (v) => v.id === uv.id || v.voucherId === uv.voucherId
                      );
                      const isSystem =
                        (uv.voucherScope || uv.voucher?.voucherScope) === VoucherScope.SYSTEM;
                      const vName = uv.voucherName || uv.voucher?.name || 'Mã giảm giá';
                      const vCode = uv.voucherCode || uv.voucher?.code || '';
                      const vDiscountType =
                        uv.discountType || uv.voucher?.discountType || DiscountType.PERCENTAGE;
                      const vDiscountValue =
                        uv.discountValue ?? uv.voucher?.discountValue ?? 0;
                      const vMaxDiscount =
                        uv.maxDiscountAmount ?? uv.voucher?.maxDiscountAmount;
                      const vMinOrder =
                        uv.minOrderAmount ?? uv.voucher?.minOrderAmount ?? 0;
                      const vEndDate = uv.endDate || uv.voucher?.endDate || '';

                      const discountBigText =
                        vDiscountType === DiscountType.FIXED_AMOUNT
                          ? (vDiscountValue >= 1000 ? `${Math.round(vDiscountValue / 1000)}k` : `${vDiscountValue}đ`)
                          : `${vDiscountValue}%`;

                      return (
                        <TouchableOpacity
                          key={uv.id || uv.voucherId}
                          style={[
                            styles.selectCard,
                            isSelected && styles.selectCardSelected,
                          ]}
                          onPress={() => toggleSelection(uv)}
                          activeOpacity={0.88}
                        >
                          {/* Left Ticket Stub */}
                          <View
                            style={[
                              styles.cardLeftStub,
                              { backgroundColor: isSystem ? '#004D40' : '#1E293B' },
                            ]}
                          >
                            <View style={styles.scopeBadge}>
                              <Text style={styles.scopeBadgeText}>
                                {isSystem ? 'SPORTA' : 'CỤM SÂN'}
                              </Text>
                            </View>
                            <View style={styles.stubDiscountWrap}>
                              <Text style={styles.stubDiscountLabel}>GIẢM</Text>
                              <Text style={styles.stubDiscountNumber}>{discountBigText}</Text>
                            </View>
                            {/* Cutouts */}
                            <View style={[styles.cutout, styles.cutoutTop]} />
                            <View style={[styles.cutout, styles.cutoutBottom]} />
                          </View>

                          {/* Center Content */}
                          <View style={styles.cardCenter}>
                            <View style={styles.cardTitleRow}>
                              <Text style={styles.cardTitle} numberOfLines={1}>
                                {vName}
                              </Text>
                              {vCode ? (
                                <View style={styles.codeTag}>
                                  <Text style={styles.codeTagText}>{vCode}</Text>
                                </View>
                              ) : null}
                            </View>

                            <Text style={styles.cardCondition} numberOfLines={1}>
                              Đơn tối thiểu {formatCurrency(vMinOrder)}
                              {vMaxDiscount ? ` · Tối đa ${formatCurrency(vMaxDiscount)}` : ''}
                            </Text>

                            <View style={styles.cardFooter}>
                              <Ionicons name="time-outline" size={12} color={COLORS.outline} />
                              <Text style={styles.cardExpiry}>HSD: {formatDate(vEndDate)}</Text>
                            </View>
                          </View>

                          {/* Right Selection Radio Indicator */}
                          <View style={styles.cardRight}>
                            <View
                              style={[
                                styles.checkboxCircle,
                                isSelected && styles.checkboxCircleSelected,
                              ]}
                            >
                              {isSelected && (
                                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Ineligible Vouchers Section */}
                {ineligibleVouchers.length > 0 && (
                  <View style={[styles.sectionWrap, { marginTop: SPACING.md }]}>
                    <Text style={[styles.sectionHeaderLabel, { color: COLORS.outline }]}>
                      Chưa đủ điều kiện áp dụng ({ineligibleVouchers.length})
                    </Text>
                    {ineligibleVouchers.map(({ voucher: uv, reason }) => {
                      const isSystem =
                        (uv.voucherScope || uv.voucher?.voucherScope) === VoucherScope.SYSTEM;
                      const vName = uv.voucherName || uv.voucher?.name || 'Mã giảm giá';
                      const vDiscountType =
                        uv.discountType || uv.voucher?.discountType || DiscountType.PERCENTAGE;
                      const vDiscountValue =
                        uv.discountValue ?? uv.voucher?.discountValue ?? 0;
                      const vEndDate = uv.endDate || uv.voucher?.endDate || '';

                      const discountBigText =
                        vDiscountType === DiscountType.FIXED_AMOUNT
                          ? (vDiscountValue >= 1000 ? `${Math.round(vDiscountValue / 1000)}k` : `${vDiscountValue}đ`)
                          : `${vDiscountValue}%`;

                      return (
                        <View
                          key={uv.id || uv.voucherId}
                          style={[styles.selectCard, styles.selectCardDisabled]}
                        >
                          {/* Left Ticket Stub */}
                          <View
                            style={[
                              styles.cardLeftStub,
                              { backgroundColor: '#94A3B8' },
                            ]}
                          >
                            <View style={styles.scopeBadge}>
                              <Text style={styles.scopeBadgeText}>
                                {isSystem ? 'SPORTA' : 'CỤM SÂN'}
                              </Text>
                            </View>
                            <View style={styles.stubDiscountWrap}>
                              <Text style={styles.stubDiscountLabel}>GIẢM</Text>
                              <Text style={styles.stubDiscountNumber}>{discountBigText}</Text>
                            </View>
                            {/* Cutouts */}
                            <View style={[styles.cutout, styles.cutoutTop]} />
                            <View style={[styles.cutout, styles.cutoutBottom]} />
                          </View>

                          {/* Center Content */}
                          <View style={styles.cardCenter}>
                            <Text style={[styles.cardTitle, { color: COLORS.onSurfaceVariant }]} numberOfLines={1}>
                              {vName}
                            </Text>
                            <Text style={styles.cardIneligibleReason} numberOfLines={2}>{reason}</Text>
                            <View style={styles.cardFooter}>
                              <Ionicons name="time-outline" size={12} color={COLORS.outline} />
                              <Text style={styles.cardExpiry}>HSD: {formatDate(vEndDate)}</Text>
                            </View>
                          </View>

                          {/* Disabled Indicator */}
                          <View style={styles.cardRight}>
                            <View style={[styles.checkboxCircle, styles.checkboxCircleDisabled]} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* ── Sticky Bottom Bar (Flush to bottom, taller & prominent) ── */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
            <View style={styles.bottomSummary}>
              <Text style={styles.bottomSelectedCount}>
                Đã chọn: <Text style={{ fontWeight: '900', color: COLORS.primary }}>{localSelection.length}</Text> mã
              </Text>
              {estimatedSavings > 0 ? (
                <Text style={styles.bottomSavingText}>
                  Tiết kiệm: <Text style={styles.bottomSavingAmount}>-{formatCurrency(estimatedSavings)}</Text>
                </Text>
              ) : (
                <Text style={styles.bottomSubtext}>Chưa chọn mã giảm giá</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              <Text style={styles.applyBtnText}>
                {localSelection.length > 0 ? `Áp dụng (${localSelection.length})` : 'Xác nhận'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '86%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 17,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: 8,
    padding: 5,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.onSurface,
    paddingVertical: 4,
  },
  inputBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBtnDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
  inputBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 77, 64, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: SPACING.md,
    marginBottom: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 0.8,
    borderColor: 'rgba(0, 77, 64, 0.12)',
  },
  policyNoticeText: {
    fontSize: 12,
    color: COLORS.onSurface,
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 24,
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },
  emptyBox: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  emptySub: {
    fontSize: 12.5,
    color: COLORS.outline,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  sectionWrap: {
    gap: 9,
  },
  sectionHeaderLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  selectCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 77, 64, 0.02)',
  },
  selectCardDisabled: {
    opacity: 0.55,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  cardLeftStub: {
    width: 88,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: COLORS.surfaceContainerHigh,
    borderStyle: 'dashed',
  },
  scopeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  scopeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  stubDiscountWrap: {
    alignItems: 'center',
  },
  stubDiscountLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 8.5,
    fontWeight: '700',
  },
  stubDiscountNumber: {
    color: '#FED01B',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  cutout: {
    position: 'absolute',
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  cutoutTop: {
    top: -6,
  },
  cutoutBottom: {
    bottom: -6,
  },
  cardCenter: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    gap: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.onSurface,
    flex: 1,
  },
  codeTag: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: COLORS.surfaceContainerHigh,
  },
  codeTagText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  cardCondition: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  cardIneligibleReason: {
    fontSize: 10.5,
    color: COLORS.error,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  cardExpiry: {
    fontSize: 10,
    color: COLORS.outline,
  },
  cardRight: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  checkboxCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxCircleDisabled: {
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSummary: {
    flex: 1,
    gap: 2,
  },
  bottomSelectedCount: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  bottomSavingText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  bottomSavingAmount: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#059669',
  },
  bottomSubtext: {
    fontSize: 11.5,
    color: COLORS.outline,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

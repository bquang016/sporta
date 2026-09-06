import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { AlertModal } from '../../../shared/ui';
import { useCreateBooking } from '../../../entities/booking/model/useBooking';
import type { SlotInfo } from '../../../entities/facility/model/facility.types';
import { getWalletBalance, checkPaymentStatus } from '../../../features/wallet/api/walletApi';
import { VoucherBottomSheet } from '../../../features/voucher/ui/VoucherBottomSheet';
import { UserVoucher, DiscountType, VoucherScope } from '../../../features/voucher/types';
import { usersApi, isDevUser, UserProfileDto } from '../../../shared/api/users';

export function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { mutate: createBooking, loading } = useCreateBooking();
  const insets = useSafeAreaInsets();

  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);

  useEffect(() => {
    usersApi.getProfile().then(setCurrentUser).catch(() => {});
  }, []);

  const isDevTester = isDevUser(currentUser);

  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [isMethodsExpanded, setIsMethodsExpanded] = useState(true);

  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [voucherSheetVisible, setVoucherSheetVisible] = useState(false);
  const [selectedVouchers, setSelectedVouchers] = useState<UserVoucher[]>([]);

  const { data: balanceData } = useQuery({
    queryKey: ['wallet_balance'],
    queryFn: getWalletBalance,
  });

  const paymentMethods = useMemo(() => {
    const methods = [
      {
        id: 'wallet',
        label: 'Ví Sporta',
        sublabel: 'Thanh toán tức thì · Hoàn 5% vào ví',
        icon: 'wallet-outline',
        badge: 'KHUYÊN DÙNG',
        badgeColor: '#10B981',
        enabled: true,
      },
      {
        id: 'payos',
        label: 'Mã QR Ngân Hàng (PayOS)',
        sublabel: 'Quét VietQR từ mọi ứng dụng ngân hàng',
        icon: 'qr-code-outline',
        badge: undefined,
        badgeColor: undefined,
        enabled: true,
      },
      {
        id: 'cash',
        label: 'Thanh toán tại sân',
        sublabel: 'Trả tiền mặt hoặc chuyển khoản cho chủ sân',
        icon: 'cash-outline',
        badge: undefined,
        badgeColor: undefined,
        enabled: true,
      },
    ];

    if (isDevTester) {
      methods.push({
        id: 'dev',
        label: 'Thanh toán DEV',
        sublabel: 'Môi trường kiểm thử đặt sân (Tự động thành công)',
        icon: 'code-slash-outline',
        badge: 'DEV TESTER',
        badgeColor: '#7C3AED',
        enabled: true,
      });
    }

    return methods;
  }, [isDevTester]);

  // Parse params safely
  const venueId = params.venueId as string;
  const venueName = (params.venueName as string) || 'Cụm sân thể thao';
  const venueLocation = (params.venueLocation as string) || 'Chưa cập nhật địa chỉ';
  const venuePhone = (params.venuePhone as string) || '';
  const venueImage = (params.venueImage as string) || '';
  const venueSport = (params.venueSport as string) || 'Thể thao';
  const bookingDate = (params.bookingDate as string) || '';
  const rawTotalPrice = Number(params.totalPrice) || 0;

  // Selected Slots
  const selectedSlots: SlotInfo[] = useMemo(() => {
    try {
      if (params.slotsParam) {
        return JSON.parse(decodeURIComponent(params.slotsParam as string));
      }
    } catch (e) {
      console.error('Failed to parse slots', e);
    }
    return [];
  }, [params.slotsParam]);

  const displaySlots = useMemo(() => {
    return selectedSlots.map(slot => {
      const [h, m] = slot.time.split(':').map(Number);
      const date = new Date(2000, 0, 1, h, m);
      date.setMinutes(date.getMinutes() + 30);
      const endStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      return {
        ...slot,
        endTime: endStr,
      };
    });
  }, [selectedSlots]);

  // Safe Discount Calculation (Fixed undefined discountType)
  const totalDiscount = useMemo(() => {
    let sum = 0;
    selectedVouchers.forEach(uv => {
      if (!uv) return;
      const vDiscountType = uv.discountType || uv.voucher?.discountType || DiscountType.PERCENTAGE;
      const vDiscountValue = uv.discountValue ?? uv.voucher?.discountValue ?? 0;
      const vMaxDiscount = uv.maxDiscountAmount ?? uv.voucher?.maxDiscountAmount;

      let discount = 0;
      if (vDiscountType === DiscountType.FIXED_AMOUNT) {
        discount = vDiscountValue;
      } else {
        discount = (rawTotalPrice * vDiscountValue) / 100;
        if (vMaxDiscount && discount > vMaxDiscount) {
          discount = vMaxDiscount;
        }
      }
      sum += discount;
    });

    // Cap total discount at 80%
    const maxAllowed = rawTotalPrice * 0.8;
    return sum > maxAllowed ? maxAllowed : sum;
  }, [selectedVouchers, rawTotalPrice]);

  const finalPrice = Math.max(0, rawTotalPrice - totalDiscount);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDateString = (dateStr: string) => {
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

  const userBalance = balanceData?.balance || 0;
  const hasEnoughBalance = userBalance >= finalPrice;
  const isWalletSelected = selectedMethod === 'wallet';
  const disablePaymentBtn = loading || (isWalletSelected && !hasEnoughBalance);

  const toggleMethodsAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsMethodsExpanded(!isMethodsExpanded);
  };

  const handleRemoveVoucher = (voucherId: string) => {
    setSelectedVouchers(prev => prev.filter(v => v.id !== voucherId && v.voucherId !== voucherId));
  };

  const handlePayment = async () => {
    if (selectedSlots.length === 0) return;

    try {
      const ownerVoucher = selectedVouchers.find(
        (v) => (v.voucherScope || v.voucher?.voucherScope) === VoucherScope.VENUE
      );
      const systemVoucher = selectedVouchers.find(
        (v) => (v.voucherScope || v.voucher?.voucherScope) === VoucherScope.SYSTEM
      );

      const requestPayload = {
        slots: displaySlots.map((slot) => ({
          courtId: slot.courtId,
          bookingDate: bookingDate,
          startTime: `${slot.time}:00`,
          endTime: `${slot.endTime}:00`,
        })),
        paymentMethod: selectedMethod,
        ownerVoucherCode: ownerVoucher?.voucherCode || ownerVoucher?.voucher?.code,
        systemVoucherCode: systemVoucher?.voucherCode || systemVoucher?.voucher?.code,
      };

      const result = await createBooking(requestPayload);

      if (selectedMethod === 'payos' && result.checkoutUrl) {
        const returnUrl = Linking.createURL('/payment/success');
        const browserResult = await WebBrowser.openAuthSessionAsync(result.checkoutUrl, returnUrl);

        if (browserResult.type === 'success' || browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
          try {
            if (result.orderCode) {
              const statusRes = await checkPaymentStatus(result.orderCode);
              if (statusRes.status === 'PAID' || statusRes.status === 'COMPLETED') {
                router.push({
                  pathname: '/booking/success' as any,
                  params: { bookingId: result.id },
                });
                return;
              } else {
                setErrorMessage('Thanh toán chưa hoàn tất hoặc đã bị hủy.');
                setErrorModalVisible(true);
                return;
              }
            }
          } catch (e) {
            console.log('Failed to sync payment status', e);
          }
        }
      } else {
        router.push({
          pathname: '/booking/success' as any,
          params: { bookingId: result.id },
        });
      }
    } catch (error: any) {
      if (error.status === 409) {
        setConflictModalVisible(true);
      } else {
        setErrorMessage(error.message || 'Không thể tạo đơn đặt sân. Vui lòng thử lại!');
        setErrorModalVisible(true);
      }
    }
  };

  const activeMethodObj = paymentMethods.find(m => m.id === selectedMethod) || paymentMethods[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác Nhận & Thanh Toán</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Detailed Venue & Court Info Hero Card ── */}
        <View style={styles.venueCard}>
          <View style={styles.venueHeaderRow}>
            {venueImage ? (
              <Image source={{ uri: venueImage }} style={styles.venueThumb} resizeMode="cover" />
            ) : (
              <View style={styles.venueThumbFallback}>
                <Ionicons name="football-outline" size={26} color={COLORS.primary} />
              </View>
            )}

            <View style={styles.venueMeta}>
              <View style={styles.sportBadgeRow}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>{venueSport.toUpperCase()}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                  <Text style={styles.verifiedBadgeText}>ĐÃ XÁC THỰC</Text>
                </View>
              </View>

              <Text style={styles.venueNameText} numberOfLines={2}>
                {venueName}
              </Text>

              <View style={styles.venueAddressRow}>
                <Ionicons name="location-outline" size={13} color={COLORS.onSurfaceVariant} />
                <Text style={styles.venueAddressText} numberOfLines={1}>
                  {venueLocation}
                </Text>
              </View>
            </View>
          </View>

          {/* Date & Court Badges */}
          <View style={styles.bookingMetaStrip}>
            <View style={styles.dateBadgeWrap}>
              <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
              <Text style={styles.dateBadgeText}>{formatDateString(bookingDate)}</Text>
            </View>

            {venuePhone ? (
              <View style={styles.phoneBadgeWrap}>
                <Ionicons name="call-outline" size={13} color={COLORS.onSurfaceVariant} />
                <Text style={styles.phoneBadgeText}>{venuePhone}</Text>
              </View>
            ) : null}
          </View>

          {/* Booked Slots List */}
          <View style={styles.slotsContainer}>
            <Text style={styles.slotsLabel}>
              Khung giờ đã chọn ({displaySlots.length} slot):
            </Text>
            {displaySlots.map((slot, idx) => (
              <View key={`${slot.courtId}-${slot.time}-${idx}`} style={styles.slotRow}>
                <View style={styles.slotLeft}>
                  <View style={styles.courtDot} />
                  <Text style={styles.courtNameText}>{slot.courtName}</Text>
                  <View style={styles.timeTag}>
                    <Text style={styles.timeTagText}>
                      {slot.time} - {slot.endTime}
                    </Text>
                  </View>
                </View>
                <Text style={styles.slotPriceText}>{formatCurrency(slot.price)}</Text>
              </View>
            ))}
          </View>

          {/* Policy Notice */}
          <View style={styles.policyNotice}>
            <Ionicons name="shield-outline" size={14} color="#059669" />
            <Text style={styles.policyNoticeText}>
              Giữ sân 100% an toàn · Hủy trước 24h hoàn 50% tiền cọc
            </Text>
          </View>
        </View>

        {/* ── 2. Collapsible / Expandable Payment Methods ── */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionCardHeader}
            onPress={toggleMethodsAccordion}
            activeOpacity={0.8}
          >
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="card-outline" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                {!isMethodsExpanded && (
                  <Text style={styles.selectedMethodSubtitle}>
                    Đã chọn: {activeMethodObj.label}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.accordionToggleBtn}>
              <Text style={styles.accordionToggleText}>
                {isMethodsExpanded ? 'Thu gọn' : 'Đổi'}
              </Text>
              <Ionicons
                name={isMethodsExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.primary}
              />
            </View>
          </TouchableOpacity>

          {isMethodsExpanded ? (
            <View style={styles.methodsList}>
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                const isDevMethod = method.id === 'dev';
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodItem,
                      isSelected && (isDevMethod ? { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' } : styles.methodItemSelected),
                      isDevMethod && !isSelected && { borderColor: '#DDD6FE', backgroundColor: '#FAFAFF' },
                      !method.enabled && styles.methodItemDisabled,
                    ]}
                    onPress={() => method.enabled && setSelectedMethod(method.id)}
                    activeOpacity={0.8}
                    disabled={!method.enabled}
                  >
                    {/* Radio Button */}
                    <View style={[
                      styles.radioOuter,
                      isSelected && (isDevMethod ? { borderColor: '#7C3AED' } : styles.radioOuterSelected),
                    ]}>
                      {isSelected && <View style={[styles.radioInner, isDevMethod && { backgroundColor: '#7C3AED' }]} />}
                    </View>

                    <View style={[styles.methodIconWrap, isDevMethod && { backgroundColor: '#EDE9FE' }]}>
                      <Ionicons
                        name={method.icon as any}
                        size={20}
                        color={isDevMethod ? '#7C3AED' : (isSelected ? COLORS.primary : COLORS.onSurfaceVariant)}
                      />
                    </View>

                    <View style={styles.methodInfo}>
                      <View style={styles.methodTitleRow}>
                        <Text style={[
                          styles.methodLabel,
                          isSelected && (isDevMethod ? { color: '#7C3AED' } : styles.methodLabelSelected),
                        ]}>
                          {method.label}
                        </Text>
                        {method.badge ? (
                          <View
                            style={[
                              styles.methodBadge,
                              { backgroundColor: `${method.badgeColor}18` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.methodBadgeText,
                                { color: method.badgeColor },
                              ]}
                            >
                              {method.badge}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.methodSublabel}>{method.sublabel}</Text>

                      {method.id === 'wallet' && (
                        <View style={styles.walletBalanceBadge}>
                          <Text style={styles.walletBalanceLabel}>Số dư hiện tại:</Text>
                          <Text
                            style={[
                              styles.walletBalanceAmount,
                              hasEnoughBalance ? styles.balanceGreen : styles.balanceRed,
                            ]}
                          >
                            {formatCurrency(userBalance)}
                          </Text>
                          {!hasEnoughBalance && (
                            <TouchableOpacity
                              style={styles.topUpNowBtn}
                              onPress={() => router.push('/wallet')}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.topUpNowText}>Nạp ví</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Collapsed Compact View */
            <TouchableOpacity
              style={styles.collapsedMethodBar}
              onPress={toggleMethodsAccordion}
              activeOpacity={0.8}
            >
              <View style={styles.collapsedLeft}>
                <Ionicons name={activeMethodObj.icon as any} size={20} color={COLORS.primary} />
                <View>
                  <Text style={styles.collapsedTitle}>{activeMethodObj.label}</Text>
                  {activeMethodObj.id === 'wallet' && (
                    <Text style={styles.collapsedSub}>Số dư: {formatCurrency(userBalance)}</Text>
                  )}
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── 3. Voucher & Promotion Section ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIconBox}>
              <Ionicons name="ticket-outline" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Ưu đãi & Khuyến mãi</Text>
              <Text style={styles.sectionSubtitle}>Áp dụng tối đa 1 mã Sporta và 1 mã Cụm sân</Text>
            </View>
          </View>

          {/* Applied Vouchers Pills */}
          {selectedVouchers.length > 0 ? (
            <View style={styles.appliedVouchersList}>
              {selectedVouchers.map((uv) => {
                const isSystem = (uv.voucherScope || uv.voucher?.voucherScope) === VoucherScope.SYSTEM;
                const code = uv.voucherCode || uv.voucher?.code || 'VOUCHER';
                const discText =
                  (uv.discountType || uv.voucher?.discountType) === DiscountType.FIXED_AMOUNT
                    ? `${Math.round((uv.discountValue ?? uv.voucher?.discountValue ?? 0) / 1000)}k`
                    : `${uv.discountValue ?? uv.voucher?.discountValue ?? 0}%`;

                return (
                  <View key={uv.id || uv.voucherId} style={styles.voucherPill}>
                    <View style={[styles.voucherPillTag, { backgroundColor: isSystem ? '#004D40' : '#1E293B' }]}>
                      <Text style={styles.voucherPillTagText}>{isSystem ? 'SPORTA' : 'CỤM SÂN'}</Text>
                    </View>
                    <Text style={styles.voucherPillCode}>{code}</Text>
                    <Text style={styles.voucherPillDisc}>-Giảm {discText}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveVoucher(uv.id || uv.voucherId)}
                      style={styles.voucherPillRemove}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={16} color={COLORS.outline} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* Trigger Voucher Selector */}
          <TouchableOpacity
            style={styles.voucherTriggerBtn}
            onPress={() => setVoucherSheetVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.voucherTriggerLeft}>
              <Ionicons name="gift-outline" size={20} color={COLORS.primary} />
              <Text style={styles.voucherTriggerText}>
                {selectedVouchers.length > 0 ? 'Chọn lại hoặc thêm mã khác' : 'Chọn Sporta Voucher trong ví'}
              </Text>
            </View>
            <View style={styles.voucherTriggerRight}>
              {selectedVouchers.length > 0 ? (
                <View style={styles.voucherCountTag}>
                  <Text style={styles.voucherCountText}>{selectedVouchers.length} mã</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── 4. Price Breakdown Summary ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Tiền sân ({displaySlots.length} khung giờ)
            </Text>
            <Text style={styles.priceValue}>{formatCurrency(rawTotalPrice)}</Text>
          </View>

          {totalDiscount > 0 ? (
            <View style={styles.priceRow}>
              <View style={styles.discountLabelRow}>
                <Ionicons name="pricetag" size={14} color="#10B981" />
                <Text style={[styles.priceLabel, { color: '#059669', fontWeight: '700' }]}>
                  Giảm giá voucher
                </Text>
              </View>
              <Text style={[styles.priceValue, { color: '#059669', fontWeight: '800' }]}>
                -{formatCurrency(totalDiscount)}
              </Text>
            </View>
          ) : null}

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalSub}>Đã bao gồm thuế & phí sân</Text>
            </View>
            <Text style={styles.totalValue}>{formatCurrency(finalPrice)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Floating Sticky Bottom Checkout Bar (Flush to bottom & taller) ── */}
      <View style={[styles.bottomBarWrapper, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
        {isWalletSelected && !hasEnoughBalance && (
          <View style={styles.balanceAlert}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={styles.balanceAlertText}>
              Số dư ví không đủ (còn thiếu {formatCurrency(finalPrice - userBalance)}).
            </Text>
            <TouchableOpacity onPress={() => router.push('/wallet')} activeOpacity={0.8} style={styles.balanceTopUpBtn}>
              <Text style={styles.balanceTopUpBtnText}>Nạp ví ngay</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomBarContent}>
          <View style={styles.bottomPriceCol}>
            <Text style={styles.bottomPriceLabel}>Tổng thanh toán:</Text>
            <Text style={styles.bottomPriceValue}>{formatCurrency(finalPrice)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.checkoutBtn, disablePaymentBtn && styles.checkoutBtnDisabled]}
            onPress={handlePayment}
            disabled={disablePaymentBtn}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.checkoutBtnText}>Xác nhận đặt sân</Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Modals ── */}
      <AlertModal
        visible={conflictModalVisible}
        title="Sân đã được đặt"
        message="Rất tiếc, khung giờ này vừa có người nhanh tay hơn. Vui lòng chọn giờ khác!"
        buttonText="Quay lại chọn giờ"
        onConfirm={() => {
          setConflictModalVisible(false);
          router.back();
        }}
      />

      <AlertModal
        visible={errorModalVisible}
        title="Thông báo"
        message={errorMessage}
        buttonText="Đóng"
        onConfirm={() => setErrorModalVisible(false)}
      />

      {/* Voucher Selector Bottom Sheet */}
      <VoucherBottomSheet
        visible={voucherSheetVisible}
        onClose={() => setVoucherSheetVisible(false)}
        orderTotal={rawTotalPrice}
        venueId={venueId}
        selectedVouchers={selectedVouchers}
        onApply={(vouchers) => setSelectedVouchers(vouchers)}
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
    paddingBottom: 170, // generous bottom room so nothing is covered by the sticky bar
    gap: SPACING.md,
  },
  venueCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  venueHeaderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  venueThumb: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
  },
  venueThumbFallback: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueMeta: {
    flex: 1,
    gap: 3,
  },
  sportBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportBadge: {
    backgroundColor: 'rgba(0, 77, 64, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  sportBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  venueNameText: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 15,
    lineHeight: 20,
  },
  venueAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueAddressText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11.5,
    flex: 1,
  },
  bookingMetaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.lg,
  },
  dateBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateBadgeText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12.5,
  },
  phoneBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneBadgeText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11.5,
    fontWeight: '600',
  },
  slotsContainer: {
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 0.8,
    borderTopColor: COLORS.surfaceContainerLow,
  },
  slotsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 0.8,
    borderColor: COLORS.surfaceContainerHigh,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courtDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  courtNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  timeTag: {
    backgroundColor: 'rgba(0, 77, 64, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  slotPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
  },
  policyNoticeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
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
    gap: 12,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 77, 64, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    fontSize: 14.5,
    color: COLORS.onSurface,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  selectedMethodSubtitle: {
    fontSize: 11.5,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  accordionToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  accordionToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  methodsList: {
    gap: 8,
    marginTop: 4,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    backgroundColor: COLORS.surfaceContainerLowest,
    gap: 10,
  },
  methodItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 77, 64, 0.04)',
  },
  methodItemDisabled: {
    opacity: 0.5,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  methodIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
    gap: 2,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurface,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  methodLabelSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  methodBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  methodSublabel: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },
  walletBalanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 6,
    borderWidth: 0.8,
    borderColor: COLORS.surfaceContainerHigh,
    alignSelf: 'flex-start',
  },
  walletBalanceLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  walletBalanceAmount: {
    fontSize: 12,
    fontWeight: '800',
  },
  balanceGreen: {
    color: '#059669',
  },
  balanceRed: {
    color: COLORS.error,
  },
  topUpNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  topUpNowText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  collapsedMethodBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  collapsedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  collapsedSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  appliedVouchersList: {
    gap: 6,
  },
  voucherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 77, 64, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 77, 64, 0.15)',
    gap: 8,
  },
  voucherPillTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  voucherPillTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  voucherPillCode: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  voucherPillDisc: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    flex: 1,
  },
  voucherPillRemove: {
    padding: 2,
  },
  voucherTriggerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  voucherTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  voucherTriggerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  voucherTriggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voucherCountTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  voucherCountText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  discountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  totalSub: {
    fontSize: 10.5,
    color: COLORS.onSurfaceVariant,
  },
  totalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: SPACING.md,
    paddingTop: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
  },
  balanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 0.8,
    borderColor: '#FECACA',
  },
  balanceAlertText: {
    fontSize: 11.5,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },
  balanceTopUpBtn: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  balanceTopUpBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  bottomPriceCol: {
    gap: 2,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  bottomPriceValue: {
    fontSize: 21,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  checkoutBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  checkoutBtnDisabled: {
    backgroundColor: COLORS.outlineVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

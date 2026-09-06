import React, { useState, useEffect, useMemo } from 'react';
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
import { fetchSessionDetail, purchaseTicket } from '../../../entities/ticket/api/ticketApi';
import { TicketSession, PurchaseTicketPayload } from '../../../entities/ticket/model/ticket.types';
import { getWalletBalance, checkPaymentStatus } from '../../../features/wallet/api/walletApi';
import { VoucherBottomSheet } from '../../../features/voucher/ui/VoucherBottomSheet';
import { UserVoucher, DiscountType, VoucherScope } from '../../../features/voucher/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental && !(globalThis as any).nativeFabricUIManager) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function TicketPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const sessionId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const quantity = Number(Array.isArray(params.quantity) ? params.quantity[0] : params.quantity) || 1;

  const [session, setSession] = useState<TicketSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [isMethodsExpanded, setIsMethodsExpanded] = useState(true);

  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [voucherSheetVisible, setVoucherSheetVisible] = useState(false);
  const [selectedVouchers, setSelectedVouchers] = useState<UserVoucher[]>([]);

  // Fetch Wallet Balance
  const { data: balanceData, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet_balance'],
    queryFn: getWalletBalance,
  });

  const paymentMethods = [
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
      enabled: true,
    },
    {
      id: 'cash',
      label: 'Thanh toán tại sân',
      sublabel: 'Trả tiền mặt hoặc chuyển khoản cho chủ sân khi check-in',
      icon: 'cash-outline',
      enabled: true,
    },
    {
      id: 'dev',
      label: 'Thanh toán DEV (Test Auto Success)',
      sublabel: 'Môi trường kiểm thử mua vé',
      icon: 'code-slash-outline',
      enabled: true,
    },
  ];

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoadingSession(true);
      const data = await fetchSessionDetail(sessionId);
      setSession(data);
    } catch (err: any) {
      console.error('Failed to fetch session detail:', err);
      setErrorMessage(err.message || 'Không thể tải thông tin ca xé vé');
      setErrorModalVisible(true);
    } finally {
      setLoadingSession(false);
    }
  };

  const rawTotalPrice = useMemo(() => {
    if (!session) return 0;
    return session.pricePerTicket * quantity;
  }, [session, quantity]);

  // Safe Voucher Discount Calculation
  const totalDiscount = useMemo(() => {
    let sum = 0;
    selectedVouchers.forEach((uv) => {
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

  const userBalance = balanceData?.balance || 0;
  const hasEnoughBalance = userBalance >= finalPrice;
  const isWalletSelected = selectedMethod === 'wallet';
  const disablePaymentBtn = purchasing || loadingSession || (isWalletSelected && !hasEnoughBalance);

  const toggleMethodsAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsMethodsExpanded(!isMethodsExpanded);
  };

  const handleRemoveVoucher = (voucherId: string) => {
    setSelectedVouchers((prev) => prev.filter((v) => v.id !== voucherId && v.voucherId !== voucherId));
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/ticket-sessions' as any);
    }
  };

  const handlePayment = async () => {
    if (!session) return;

    try {
      setPurchasing(true);

      const ownerVoucher = selectedVouchers.find(
        (v) => (v.voucherScope || v.voucher?.voucherScope) === VoucherScope.VENUE
      );
      const systemVoucher = selectedVouchers.find(
        (v) => (v.voucherScope || v.voucher?.voucherScope) === VoucherScope.SYSTEM
      );

      const payload: PurchaseTicketPayload = {
        quantity,
        paymentMethod: selectedMethod,
        ownerVoucherCode: ownerVoucher?.voucherCode || ownerVoucher?.voucher?.code,
        systemVoucherCode: systemVoucher?.voucherCode || systemVoucher?.voucher?.code,
      };

      const result = await purchaseTicket(session.id, payload);

      // Handle PayOS Checkout
      if (selectedMethod === 'payos' && result.checkoutUrl) {
        const returnUrl = Linking.createURL('/payment/success');
        const browserResult = await WebBrowser.openAuthSessionAsync(result.checkoutUrl, returnUrl);

        if (browserResult.type === 'success' || browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
          try {
            if (result.orderCode) {
              const statusRes = await checkPaymentStatus(result.orderCode);
              if (statusRes.status === 'PAID' || statusRes.status === 'COMPLETED') {
                refetchWallet();
                router.replace('/my-tickets' as any);
                return;
              } else {
                setErrorMessage('Thanh toán PayOS chưa hoàn tất hoặc đã bị hủy.');
                setErrorModalVisible(true);
                return;
              }
            }
          } catch (e) {
            console.log('Failed to sync PayOS ticket status', e);
          }
        }
      }

      // Successful Purchase
      refetchWallet();
      router.replace('/my-tickets' as any);
    } catch (error: any) {
      console.error('Purchase ticket error:', error);
      if (
        error.status === 409 ||
        (error.message && (error.message.includes('vé cuối cùng') || error.message.includes('chỉ còn') || error.message.includes('trống')))
      ) {
        setConflictMessage(error.message || 'Rất tiếc, số lượng vé còn lại của ca này không đủ.');
        setConflictModalVisible(true);
      } else {
        setErrorMessage(error.message || 'Không thể thực hiện mua vé. Vui lòng thử lại!');
        setErrorModalVisible(true);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const activeMethodObj = paymentMethods.find((m) => m.id === selectedMethod) || paymentMethods[0];

  if (loadingSession) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang chuẩn bị thông tin thanh toán vé...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác Nhận & Thanh Toán Vé</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Không tìm thấy thông tin ca xé vé</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadSession}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác Nhận & Thanh Toán Vé</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Hero Ticket & Venue Summary Card ── */}
        <View style={styles.venueCard}>
          <View style={styles.venueHeaderRow}>
            {session.coverImage ? (
              <Image source={{ uri: session.coverImage }} style={styles.venueThumb} resizeMode="cover" />
            ) : (
              <View style={styles.venueThumbFallback}>
                <Ionicons name="tennisball" size={26} color={COLORS.primary} />
              </View>
            )}

            <View style={styles.venueMeta}>
              <View style={styles.sportBadgeRow}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>{(session.sportName || 'PICKLEBALL').toUpperCase()}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                  <Text style={styles.verifiedBadgeText}>ĐÃ XÁC THỰC</Text>
                </View>
              </View>

              <Text style={styles.venueNameText} numberOfLines={2}>
                {session.venueName}
              </Text>

              <View style={styles.venueAddressRow}>
                <Ionicons name="location-outline" size={13} color={COLORS.onSurfaceVariant} />
                <Text style={styles.venueAddressText} numberOfLines={1}>
                  {session.venueAddress || session.venueLocation || 'Địa điểm cụm sân Sporta'}
                </Text>
              </View>
            </View>
          </View>

          {/* Date & Court Meta Strip */}
          <View style={styles.bookingMetaStrip}>
            <View style={styles.dateBadgeWrap}>
              <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
              <Text style={styles.dateBadgeText}>{formatDateString(session.playDate)}</Text>
            </View>

            <View style={styles.courtBadgeWrap}>
              <Ionicons name="football-outline" size={14} color={COLORS.primary} />
              <Text style={styles.courtBadgeText}>{session.courtName}</Text>
            </View>
          </View>

          {/* Ticket Slot Detail Breakdown */}
          <View style={styles.slotsContainer}>
            <Text style={styles.slotsLabel}>Thông tin suất vé ({quantity} vé):</Text>
            <View style={styles.slotRow}>
              <View style={styles.slotLeft}>
                <View style={styles.courtDot} />
                <View>
                  <Text style={styles.courtNameText}>Ca xé vé ghép ({quantity} slot)</Text>
                  <View style={styles.timeTag}>
                    <Text style={styles.timeTagText}>
                      {session.startTime} - {session.endTime}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.slotPriceText}>{formatCurrency(rawTotalPrice)}</Text>
            </View>
          </View>

          {/* Policy Notice */}
          <View style={styles.policyNotice}>
            <Ionicons name="qr-code-outline" size={15} color="#059669" />
            <Text style={styles.policyNoticeText}>
              Cấp {quantity} mã QR & ShortCode riêng biệt · Không hoàn hủy theo quy định ca xé vé
            </Text>
          </View>
        </View>

        {/* ── 2. Collapsible Payment Methods Accordion ── */}
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
                  <Text style={styles.selectedMethodSubtitle}>Đã chọn: {activeMethodObj.label}</Text>
                )}
              </View>
            </View>

            <View style={styles.accordionToggleBtn}>
              <Text style={styles.accordionToggleText}>{isMethodsExpanded ? 'Thu gọn' : 'Đổi'}</Text>
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
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodItem,
                      isSelected && styles.methodItemSelected,
                      !method.enabled && styles.methodItemDisabled,
                    ]}
                    onPress={() => method.enabled && setSelectedMethod(method.id)}
                    activeOpacity={0.8}
                    disabled={!method.enabled}
                  >
                    {/* Radio Button */}
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>

                    <View style={styles.methodIconWrap}>
                      <Ionicons
                        name={method.icon as any}
                        size={20}
                        color={isSelected ? COLORS.primary : COLORS.onSurfaceVariant}
                      />
                    </View>

                    <View style={styles.methodInfo}>
                      <View style={styles.methodTitleRow}>
                        <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
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
              Tiền vé ({quantity} suất x {formatCurrency(session.pricePerTicket)})
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

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí phục vụ</Text>
            <Text style={[styles.priceValue, { color: '#059669', fontWeight: '700' }]}>Miễn phí (0đ)</Text>
          </View>

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

      {/* ── Sticky Bottom Checkout Bar ── */}
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
            <Text style={styles.bottomPriceLabel}>Tổng thanh toán ({quantity} vé):</Text>
            <Text style={styles.bottomPriceValue}>{formatCurrency(finalPrice)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.checkoutBtn, disablePaymentBtn && styles.checkoutBtnDisabled]}
            onPress={handlePayment}
            disabled={disablePaymentBtn}
            activeOpacity={0.85}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.checkoutBtnText}>Xác nhận mua vé</Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Race Condition / Conflict Modal (HTTP 409) ── */}
      <AlertModal
        visible={conflictModalVisible}
        title="Không đủ số lượng vé"
        message={conflictMessage || 'Rất tiếc, số lượng vé còn lại của ca này vừa có người đặt trước.'}
        buttonText="Quay lại danh sách"
        onConfirm={() => {
          setConflictModalVisible(false);
          router.replace('/(tabs)/ticket-sessions' as any);
        }}
      />

      {/* ── Error Modal ── */}
      <AlertModal
        visible={errorModalVisible}
        title="Thông báo"
        message={errorMessage}
        buttonText="Đóng"
        onConfirm={() => setErrorModalVisible(false)}
      />

      {/* ── Voucher Bottom Sheet ── */}
      <VoucherBottomSheet
        visible={voucherSheetVisible}
        onClose={() => setVoucherSheetVisible(false)}
        orderTotal={rawTotalPrice}
        venueId={session.venueId}
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
    paddingBottom: 170,
    gap: SPACING.md,
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

  /* Hero Venue & Ticket Card */
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
  courtBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courtBadgeText: {
    color: COLORS.primary,
    fontSize: 11.5,
    fontWeight: '800',
  },
  slotsContainer: {
    gap: 8,
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  slotsLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 11.5,
    fontWeight: '700',
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    ...TYPOGRAPHY.titleSm,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 13,
  },
  timeTag: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 2,
  },
  timeTagText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  slotPriceText: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 14.5,
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.lg,
  },
  policyNoticeText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    lineHeight: 15,
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
    gap: 12,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
    fontWeight: '800',
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
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  accordionToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },

  /* Methods List */
  methodsList: {
    gap: 8,
    marginTop: 4,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    backgroundColor: COLORS.surface,
    gap: 10,
  },
  methodItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  methodItemDisabled: {
    opacity: 0.5,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.primary,
  },
  methodIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    ...TYPOGRAPHY.titleSm,
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  methodLabelSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  methodSublabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 15,
  },
  walletBalanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  walletBalanceLabel: {
    fontSize: 10.5,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  walletBalanceAmount: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  balanceGreen: {
    color: '#059669',
  },
  balanceRed: {
    color: '#DC2626',
  },
  topUpNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  topUpNowText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  collapsedMethodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 4,
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  collapsedTitle: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  collapsedSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },

  /* Voucher Section */
  appliedVouchersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  voucherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    gap: 6,
  },
  voucherPillTag: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.sm,
  },
  voucherPillTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  voucherPillCode: {
    fontSize: 11.5,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  voucherPillDisc: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  voucherPillRemove: {
    padding: 2,
  },
  voucherTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 12,
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
    ...TYPOGRAPHY.titleSm,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  voucherTriggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voucherCountTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  voucherCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  /* Price Breakdown */
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },
  priceValue: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  discountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginVertical: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  totalSub: {
    fontSize: 10.5,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  totalValue: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },

  /* Sticky Bottom Bar */
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  balanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  balanceAlertText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  balanceTopUpBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  balanceTopUpBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

interface TopUpSheetProps {
  visible: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
  isSubmitting?: boolean;
}

const QUICK_AMOUNTS = [
  { value: 50000, label: '50.000đ' },
  { value: 100000, label: '100.000đ', popular: true },
  { value: 200000, label: '200.000đ' },
  { value: 500000, label: '500.000đ' },
  { value: 1000000, label: '1.000.000đ' },
  { value: 2000000, label: '2.000.000đ' },
];

export function TopUpSheet({ visible, onClose, onTopUp, isSubmitting }: TopUpSheetProps) {
  const [amountStr, setAmountStr] = useState('100.000');

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (!numericValue) {
      setAmountStr('');
      return;
    }
    const formatted = parseInt(numericValue, 10).toLocaleString('vi-VN');
    setAmountStr(formatted);
  };

  const currentNumericAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;
  const isValid = currentNumericAmount >= 10000 && currentNumericAmount <= 20000000;

  const handleTopUp = () => {
    if (isValid && !isSubmitting) {
      onTopUp(currentNumericAmount);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContent}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Sheet Header */}
              <View style={styles.header}>
                <View style={styles.headerIconCircle}>
                  <MaterialCommunityIcons name="wallet-plus" size={24} color="#064E3B" />
                </View>
                <Text style={styles.title}>Nạp Tiền Vào Ví</Text>
                <Text style={styles.subtitle}>
                  Nạp tiền nhanh qua cổng thanh toán tự động VietQR / PayOS
                </Text>
              </View>

              {/* Amount Input Box */}
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Số tiền nạp (VNĐ)</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    value={amountStr}
                    onChangeText={handleAmountChange}
                  />
                  {amountStr.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setAmountStr('')}
                      style={styles.clearBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
                {currentNumericAmount > 0 && currentNumericAmount < 10000 && (
                  <Text style={styles.errorText}>* Số tiền tối thiểu mỗi lần nạp là 10.000đ</Text>
                )}
                {currentNumericAmount > 20000000 && (
                  <Text style={styles.errorText}>* Số tiền tối đa mỗi lần nạp là 20.000.000đ</Text>
                )}
              </View>

              {/* Quick Amount Grid */}
              <Text style={styles.presetSectionTitle}>Chọn nhanh số tiền</Text>
              <View style={styles.quickGrid}>
                {QUICK_AMOUNTS.map((amt) => {
                  const isSelected = currentNumericAmount === amt.value;
                  return (
                    <TouchableOpacity
                      key={amt.value}
                      style={[styles.quickBtn, isSelected && styles.quickBtnActive]}
                      onPress={() => handleAmountChange(amt.value.toString())}
                      activeOpacity={0.7}
                    >
                      {amt.popular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>Phổ biến</Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.quickBtnText,
                          isSelected && styles.quickBtnTextActive,
                        ]}
                      >
                        {amt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Payment Gateway Trust Badge */}
              <View style={styles.gatewayBadge}>
                <MaterialCommunityIcons name="shield-check" size={18} color="#059669" />
                <Text style={styles.gatewayText}>
                  Bảo mật giao dịch bởi <Text style={{ fontWeight: '800' }}>PayOS & VietQR</Text>
                </Text>
              </View>

              {/* Footer CTA Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!isValid || isSubmitting) && styles.submitBtnDisabled,
                  ]}
                  onPress={handleTopUp}
                  disabled={!isValid || isSubmitting}
                  activeOpacity={0.88}
                >
                  <Text style={styles.submitBtnText}>
                    {isSubmitting
                      ? 'Đang khởi tạo thanh toán...'
                      : `Nạp ${currentNumericAmount > 0 ? currentNumericAmount.toLocaleString('vi-VN') + 'đ' : ''} qua PayOS`}
                  </Text>
                  {!isSubmitting && (
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  dragHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 18,
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#064E3B',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  input: {
    fontSize: 26,
    fontWeight: '900',
    color: '#064E3B',
    padding: 0,
    flex: 1,
  },
  clearBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#E11D48',
    marginTop: 4,
    fontWeight: '500',
  },
  presetSectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickBtn: {
    width: '31.5%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickBtnActive: {
    borderColor: '#064E3B',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 4,
    backgroundColor: '#FED01B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#064E3B',
  },
  quickBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  quickBtnTextActive: {
    color: '#064E3B',
    fontWeight: '800',
  },
  gatewayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  gatewayText: {
    fontSize: 11.5,
    color: '#166534',
  },
  footer: {
    marginTop: 4,
  },
  submitBtn: {
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#064E3B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});


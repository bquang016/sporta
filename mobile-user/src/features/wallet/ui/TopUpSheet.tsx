import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button/Button';

interface TopUpSheetProps {
  visible: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
  isSubmitting?: boolean;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export function TopUpSheet({ visible, onClose, onTopUp, isSubmitting }: TopUpSheetProps) {
  const [amountStr, setAmountStr] = React.useState('');

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
  const isValid = currentNumericAmount >= 10000 && currentNumericAmount <= 10000000;

  const handleTopUp = () => {
    if (isValid) {
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
              <View style={styles.dragHandle} />
              
              <View style={styles.header}>
                <Text style={styles.title}>Nạp tiền vào ví</Text>
                <Text style={styles.subtitle}>Chọn hoặc nhập số tiền bạn muốn nạp</Text>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.outlineVariant}
                  value={amountStr}
                  onChangeText={handleAmountChange}
                />
                <Text style={styles.currency}>VNĐ</Text>
              </View>
              {currentNumericAmount > 0 && currentNumericAmount < 10000 && (
                <Text style={styles.errorText}>Số tiền tối thiểu là 10,000đ</Text>
              )}
              {currentNumericAmount > 10000000 && (
                <Text style={styles.errorText}>Số tiền tối đa là 10,000,000đ</Text>
              )}

              <View style={styles.quickGrid}>
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.quickBtn,
                      currentNumericAmount === amt && styles.quickBtnActive
                    ]}
                    onPress={() => handleAmountChange(amt.toString())}
                  >
                    <Text style={[
                      styles.quickBtnText,
                      currentNumericAmount === amt && styles.quickBtnTextActive
                    ]}>
                      {amt.toLocaleString('vi-VN')}đ
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.footer}>
                <Button
                  title="Thanh toán qua PayOS"
                  onPress={handleTopUp}
                  disabled={!isValid || isSubmitting}
                  loading={isSubmitting}
                  size="lg"
                  variant={isValid ? 'secondary' : 'outline'}
                />
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    minHeight: '60%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  input: {
    ...TYPOGRAPHY.headlineXl,
    color: COLORS.primary,
    textAlign: 'center',
    minWidth: 100,
    padding: 0,
  },
  currency: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurfaceVariant,
    marginLeft: SPACING.sm,
    marginBottom: 4,
  },
  errorText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    justifyContent: 'center',
  },
  quickBtn: {
    width: '47%',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
  },
  quickBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E7EEFE',
  },
  quickBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
  },
  quickBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    marginTop: SPACING.xl * 2,
  },
});

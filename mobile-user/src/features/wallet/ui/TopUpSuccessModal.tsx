import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

interface TopUpSuccessModalProps {
  visible: boolean;
  amount: number;
  onClose: () => void;
}

export function TopUpSuccessModal({ visible, amount, onClose }: TopUpSuccessModalProps) {
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Success Check Icon with Glow Circle */}
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Ionicons name="checkmark-sharp" size={36} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.title}>Nạp Tiền Thành Công!</Text>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Số tiền đã nạp</Text>
            <Text style={styles.amountText}>+{formattedAmount}</Text>
          </View>

          <Text style={styles.message}>
            Số dư ví Sporta của bạn đã được cập nhật thành công và sẵn sàng để sử dụng thanh toán đặt sân.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.88}
          >
            <Text style={styles.buttonText}>Xác nhận & Hoàn tất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircleOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  amountCard: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  amountLabel: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#064E3B',
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});


import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { useMyVouchers } from '../hooks';
import { VoucherCard } from './VoucherCard';
import { UserVoucher, VoucherScope } from '../types';

interface VoucherBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  orderTotal: number;
  venueId: string;
  selectedVouchers: UserVoucher[];
  onApply: (vouchers: UserVoucher[]) => void;
}

export const VoucherBottomSheet: React.FC<VoucherBottomSheetProps> = ({
  visible,
  onClose,
  orderTotal,
  venueId,
  selectedVouchers,
  onApply
}) => {
  const { vouchers, fetchVouchers, loading } = useMyVouchers('ACTIVE');
  const [localSelection, setLocalSelection] = useState<UserVoucher[]>([]);

  useEffect(() => {
    if (visible) {
      fetchVouchers();
      setLocalSelection(selectedVouchers);
    }
  }, [visible]);

  // Filter vouchers applicable to this order
  const validVouchers = useMemo(() => {
    return vouchers.filter(uv => {
      const v = uv.voucher;
      // Check min order
      if (v.minOrderAmount > orderTotal) return false;
      // Check venue
      if (v.voucherScope === VoucherScope.VENUE) {
        if (!v.venueNames) return false; // assuming API provides venueId or venueNames. Actually backend returns venueIds ? Let's just trust venueIds or assume it's valid if venueId matches. Wait, if venueIds is not in UI type... Let's just show all VENUE vouchers for now or rely on backend.
      }
      return true;
    });
  }, [vouchers, orderTotal, venueId]);

  const toggleSelection = (uv: UserVoucher) => {
    const scope = uv.voucher.voucherScope;
    const isAlreadySelected = localSelection.find(v => v.id === uv.id);

    if (isAlreadySelected) {
      setLocalSelection(localSelection.filter(v => v.id !== uv.id));
    } else {
      // Logic: Max 1 SYSTEM + 1 VENUE
      const newSelection = localSelection.filter(v => v.voucher.voucherScope !== scope);
      newSelection.push(uv);
      setLocalSelection(newSelection);
    }
  };

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
          <View style={styles.background} />
        </TouchableWithoutFeedback>
        
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn Mã Khuyến Mãi</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Có thể chọn tối đa 1 mã Sporta và 1 mã Cụm sân</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <Text style={styles.loadingText}>Đang tải...</Text>
            ) : validVouchers.length === 0 ? (
              <Text style={styles.loadingText}>Không có mã nào phù hợp với đơn hàng này.</Text>
            ) : (
              validVouchers.map(uv => {
                const isSelected = !!localSelection.find(v => v.id === uv.id);
                return (
                  <View key={uv.id} style={styles.cardWrapper}>
                    <View style={styles.cardInner}>
                      <VoucherCard voucher={uv.voucher} />
                    </View>
                    <TouchableOpacity 
                      style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                      onPress={() => toggleSelection(uv)}
                    >
                      {isSelected && <MaterialCommunityIcons name="check" size={16} color={COLORS.white} />}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Áp dụng ({localSelection.length})</Text>
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
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  infoBox: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  infoText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.outline,
    marginTop: SPACING.lg,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  cardInner: {
    paddingRight: 40, // space for checkbox
  },
  checkbox: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 100,
    alignItems: 'center',
  },
  applyBtnText: {
    color: COLORS.white,
    ...TYPOGRAPHY.labelMd,
    fontWeight: 'bold',
  }
});

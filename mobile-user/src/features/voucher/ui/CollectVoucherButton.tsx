import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../shared/config/theme';
import { useCollectVoucher } from '../hooks';

interface CollectVoucherButtonProps {
  voucherId: string;
  isCollected: boolean;
  onSuccess?: () => void;
  style?: any;
}

export const CollectVoucherButton: React.FC<CollectVoucherButtonProps> = ({ 
  voucherId, 
  isCollected, 
  onSuccess,
  style 
}) => {
  const { collectVoucher, loading } = useCollectVoucher();

  const handlePress = () => {
    if (isCollected || loading) return;
    collectVoucher(voucherId, onSuccess, (err) => alert(err));
  };

  if (isCollected) {
    return (
      <TouchableOpacity style={[styles.button, styles.collected, style]} disabled>
        <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.onSurfaceVariant} />
        <Text style={styles.collectedText}>Đã lưu</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.onPrimary} />
      ) : (
        <Text style={styles.text}>Lưu mã</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  text: {
    color: COLORS.onPrimary,
    ...TYPOGRAPHY.labelSmall,
    fontWeight: 'bold',
  },
  collected: {
    backgroundColor: COLORS.surfaceVariant,
  },
  collectedText: {
    color: COLORS.onSurfaceVariant,
    ...TYPOGRAPHY.labelSmall,
    fontWeight: 'bold',
  }
});

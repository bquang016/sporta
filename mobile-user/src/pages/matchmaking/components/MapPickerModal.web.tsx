import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  area: string;
  setArea: (val: string) => void;
  latitude: number;
  longitude: number;
  setLatitude: (val: number) => void;
  setLongitude: (val: number) => void;
}

export function MapPickerModal({
  visible,
  onClose,
  area,
  setArea,
  latitude,
  longitude,
}: MapPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.mapModalContainer}>
        <View style={styles.mapModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.mapModalTitle}>Chọn Sân / Vị Trí (Web)</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.mapModalDone}>XONG</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.webFallbackContainer}>
          <MaterialIcons name="map" size={48} color={COLORS.primary} />
          <Text style={styles.webFallbackTitle}>Chế độ Web Browser</Text>
          <Text style={styles.webFallbackDesc}>
            Vui lòng nhập tên sân hoặc địa chỉ chi tiết bên dưới. Bản đồ tương tác ghim tọa độ đầy đủ hoạt động trên ứng dụng di động iOS / Android.
          </Text>
          <Text style={styles.coordsBadge}>Tọa độ ghim mặc định: {latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
        </View>

        <View style={styles.mapFooter}>
          <TextInput
            style={styles.mapInput}
            value={area}
            onChangeText={setArea}
            placeholder="Tên sân hoặc Địa chỉ chi tiết..."
          />
          <TouchableOpacity style={styles.mapConfirmBtn} onPress={onClose}>
            <Text style={styles.mapConfirmText}>XÁC NHẬN VỊ TRÍ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mapModalContainer: { flex: 1, backgroundColor: COLORS.background },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 48,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  mapModalTitle: { ...TYPOGRAPHY.titleMd, color: COLORS.onSurface, fontWeight: '700' },
  mapModalDone: { ...TYPOGRAPHY.labelMd, color: COLORS.primary, fontWeight: '800' },
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  webFallbackTitle: { ...TYPOGRAPHY.titleMd, color: COLORS.onSurface, fontWeight: '700' },
  webFallbackDesc: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurfaceVariant, textAlign: 'center' },
  coordsBadge: { ...TYPOGRAPHY.labelSm, color: COLORS.primary, fontWeight: '700' },
  mapFooter: {
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  mapInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...TYPOGRAPHY.bodyMd,
  },
  mapConfirmBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  mapConfirmText: { ...TYPOGRAPHY.labelMd, color: COLORS.onPrimary, fontWeight: '800' },
});

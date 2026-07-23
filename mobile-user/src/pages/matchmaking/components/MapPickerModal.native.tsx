import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
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
  setLatitude,
  setLongitude,
}: MapPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.mapModalContainer}>
        <View style={styles.mapModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.mapModalTitle}>Ghim Vị Trí / Chọn Sân Trên Bản Đồ</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.mapModalDone}>XONG</Text>
          </TouchableOpacity>
        </View>

        <MapView
          style={styles.mapView}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onPress={(e) => {
            setLatitude(e.nativeEvent.coordinate.latitude);
            setLongitude(e.nativeEvent.coordinate.longitude);
          }}
        >
          <Marker coordinate={{ latitude, longitude }} title="Sân thi đấu" description={area} />
        </MapView>

        <View style={styles.mapFooter}>
          <TextInput
            style={styles.mapInput}
            value={area}
            onChangeText={setArea}
            placeholder="Tên sân hoặc Địa chỉ chi tiết..."
          />
          <TouchableOpacity style={styles.mapConfirmBtn} onPress={onClose}>
            <Text style={styles.mapConfirmText}>CHỌN VỊ TRÍ NÀY</Text>
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
  mapView: { flex: 1 },
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

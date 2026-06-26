import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface CoverItem {
  id: string;
  name: string;
  url: string;
  color: string;
}

export interface CoverPickerModalProps {
  visible: boolean;
  onClose: () => void;
  covers: CoverItem[];
  onSelectCover: (cover: CoverItem) => void;
}

export function CoverPickerModal({ visible, onClose, covers, onSelectCover }: CoverPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn ảnh bìa mẫu</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalGrid}>
            {covers.map((cover) => (
              <TouchableOpacity
                key={cover.id}
                style={styles.coverThumbnailContainer}
                onPress={() => onSelectCover(cover)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: cover.url }} style={styles.coverThumbnail} />
                <Text style={styles.thumbnailLabel}>{cover.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity10,
  },
  modalTitle: {
    ...TYPOGRAPHY.bodyMd,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  modalGrid: {
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  coverThumbnailContainer: {
    width: '100%',
    height: 100,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  coverThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginTop: SPACING.xs,
    textAlign: 'center',
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    backgroundColor: COLORS.whiteOpacity70,
    paddingVertical: 2,
  },
});

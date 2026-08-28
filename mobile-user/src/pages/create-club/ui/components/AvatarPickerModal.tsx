import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface AvatarItem {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  avatars: AvatarItem[];
  onSelectAvatar: (avatar: AvatarItem) => void;
  onPickFromLibrary?: () => void;
}

export function AvatarPickerModal({ visible, onClose, avatars, onSelectAvatar, onPickFromLibrary }: AvatarPickerModalProps) {
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
            <Text style={styles.modalTitle}>Chọn ảnh đại diện</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
          
          {onPickFromLibrary && (
            <TouchableOpacity 
              style={styles.libraryButton}
              activeOpacity={0.8}
              onPress={onPickFromLibrary}
            >
              <MaterialIcons name="photo-library" size={20} color={COLORS.primary} />
              <Text style={styles.libraryButtonText}>Chọn từ thư viện của máy</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionLabel}>Hoặc chọn ảnh mẫu có sẵn:</Text>

          <ScrollView contentContainerStyle={styles.modalGridAvatars}>
            {avatars.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                style={styles.avatarThumbnailContainer}
                onPress={() => onSelectAvatar(avatar)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: avatar.url }} style={styles.avatarThumbnail} />
                <Text style={styles.thumbnailLabel}>{avatar.name}</Text>
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
    maxHeight: '75%',
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
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primaryOpacity08,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity30,
    borderRadius: BORDER_RADIUS.default,
    marginTop: SPACING.md,
    gap: SPACING.base,
  },
  libraryButtonText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.labelMd,
    fontWeight: '600',
  },
  sectionLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.md,
    marginBottom: -4,
  },
  modalGridAvatars: {
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  avatarThumbnailContainer: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    paddingTop: SPACING.base,
  },
  avatarThumbnail: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
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

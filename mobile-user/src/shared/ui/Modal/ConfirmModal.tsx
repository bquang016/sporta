import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';
import { Button } from '../Button/Button';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'primary',
  icon,
  iconColor = COLORS.primary,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <TouchableWithoutFeedback onPress={onCancel || onConfirm}>
        <View style={[styles.overlay, { padding: isSmallScreen ? SPACING.md : SPACING.lg }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContainer, { maxWidth: Math.min(width * 0.9, 360) }]}>
              {icon && (
                <View style={styles.iconContainer}>
                  <MaterialIcons name={icon} size={isSmallScreen ? 28 : 32} color={iconColor} />
                </View>
              )}
              
              <Text 
                style={[styles.title, isSmallScreen && { fontSize: 18 }]}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                numberOfLines={2}
              >
                {title}
              </Text>
              
              <Text style={[styles.message, isSmallScreen && { fontSize: 13 }]}>
                {message}
              </Text>
              
              <View style={[styles.buttonGroup, isSmallScreen && { gap: SPACING.xs }]}>
                {onCancel && (
                  <View style={styles.buttonWrapper}>
                    <Button 
                      title={cancelText}
                      variant="ghost"
                      onPress={onCancel}
                    />
                  </View>
                )}
                <View style={styles.buttonWrapper}>
                  <Button 
                    title={confirmText}
                    variant={confirmVariant}
                    onPress={onConfirm}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowBlack,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      } as any,
    }),
  },
  iconContainer: {
    marginBottom: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  message: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
});

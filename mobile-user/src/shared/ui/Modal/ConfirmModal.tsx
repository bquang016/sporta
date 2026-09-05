import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';

export type ConfirmModalVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'ghost';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ConfirmModalVariant;
  icon?: string; // Supports MaterialIcons or Ionicons name
  iconColor?: string;
  type?: 'success' | 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  useViewOverlay?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'primary',
  icon,
  iconColor,
  type,
  onConfirm,
  onCancel,
  useViewOverlay = false,
}: ConfirmModalProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  // Deduce type / theme intent
  const resolvedType = React.useMemo(() => {
    if (type) return type;
    if (confirmVariant === 'danger') return 'danger';
    if (confirmVariant === 'warning') return 'warning';
    if (iconColor === COLORS.error || iconColor === '#DC2626' || iconColor === '#BA1A1A') return 'danger';
    if (iconColor === '#D97706' || iconColor === '#F59E0B' || iconColor === '#B45309') return 'warning';
    if (iconColor === '#10B981' || iconColor === '#059669' || iconColor === COLORS.primary || icon === 'check-circle' || icon === 'checkmark-circle') return 'success';
    return 'info';
  }, [type, confirmVariant, iconColor, icon]);

  // Color scheme based on type
  const themeColors = React.useMemo(() => {
    switch (resolvedType) {
      case 'danger':
        return {
          icon: iconColor || '#DC2626',
          ringBg: '#FEF2F2',
          ringBorder: '#FECACA',
          confirmBtnBg: '#DC2626',
          confirmBtnText: '#FFFFFF',
          defaultIcon: 'alert-circle-outline' as const,
        };
      case 'warning':
        return {
          icon: iconColor || '#D97706',
          ringBg: '#FFFBEB',
          ringBorder: '#FDE68A',
          confirmBtnBg: '#D97706',
          confirmBtnText: '#FFFFFF',
          defaultIcon: 'warning-outline' as const,
        };
      case 'success':
        return {
          icon: iconColor || '#059669',
          ringBg: '#ECFDF5',
          ringBorder: '#A7F3D0',
          confirmBtnBg: COLORS.primary, // Deep Emerald
          confirmBtnText: '#FFFFFF',
          defaultIcon: 'checkmark-circle' as const,
        };
      case 'info':
      default:
        return {
          icon: iconColor || COLORS.primary,
          ringBg: '#F0FDF4',
          ringBorder: '#BBF7D0',
          confirmBtnBg: confirmVariant === 'secondary' ? COLORS.secondary : COLORS.primary,
          confirmBtnText: confirmVariant === 'secondary' ? COLORS.onSecondary : '#FFFFFF',
          defaultIcon: 'information-circle-outline' as const,
        };
    }
  }, [resolvedType, iconColor, confirmVariant]);

  // Render Icon with fallback
  const renderIcon = () => {
    const iconName = icon || themeColors.defaultIcon;
    const color = themeColors.icon;
    const size = isSmallScreen ? 28 : 32;

    // Handle MaterialIcons specific names
    if (
      iconName === 'error-outline' ||
      iconName === 'info-outline' ||
      iconName === 'help-outline' ||
      iconName === 'warning-amber'
    ) {
      return <MaterialIcons name={iconName as any} size={size} color={color} />;
    }

    // Check if it's Ionicons glyph or MaterialIcons glyph
    if (
      iconName === 'check-circle' || 
      iconName === 'checkmark-circle' || 
      iconName === 'alert-circle' || 
      iconName === 'warning' || 
      iconName === 'information-circle' ||
      iconName.includes('-outline')
    ) {
      const ioniconName = iconName === 'check-circle' ? 'checkmark-circle' : iconName;
      return <Ionicons name={ioniconName as any} size={size} color={color} />;
    }

    return <MaterialIcons name={iconName as any} size={size} color={color} />;
  };

  // Process message text for highlighted sections if any (e.g. balance or refund info separated by \n\n)
  const messageParts = message ? message.split('\n\n') : [];
  const mainMessage = messageParts[0] || '';
  const secondaryHighlight = messageParts.slice(1).join('\n\n');

  const renderContent = () => (
    <TouchableWithoutFeedback onPress={onCancel || onConfirm}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalCard, { maxWidth: Math.min(width * 0.9, 380) }]}>
            
            {/* Top Decorative Indicator Bar */}
            <View 
              style={[
                styles.topBar, 
                { backgroundColor: resolvedType === 'danger' ? '#EF4444' : resolvedType === 'warning' ? '#F59E0B' : COLORS.primary }
              ]} 
            />

            <View style={styles.contentContainer}>
              {/* Icon with Double Ring Glow */}
              <View style={[styles.iconOuterRing, { backgroundColor: themeColors.ringBg, borderColor: themeColors.ringBorder }]}>
                <View style={[styles.iconInnerCircle, { backgroundColor: '#FFFFFF' }]}>
                  {renderIcon()}
                </View>
              </View>
              
              {/* Title */}
              <Text 
                style={[styles.title, isSmallScreen && { fontSize: 17 }]}
                adjustsFontSizeToFit
                minimumFontScale={0.9}
                numberOfLines={2}
              >
                {title}
              </Text>
              
              {/* Main Message */}
              <Text style={[styles.message, isSmallScreen && { fontSize: 13 }]}>
                {mainMessage}
              </Text>

              {/* Secondary Highlight Box if exists */}
              {secondaryHighlight ? (
                <View style={styles.highlightBox}>
                  <Ionicons name="wallet-outline" size={16} color={COLORS.primary} style={{ marginTop: 1 }} />
                  <Text style={styles.highlightText}>
                    {secondaryHighlight}
                  </Text>
                </View>
              ) : null}
              
              {/* Action Buttons */}
              <View style={styles.buttonGroup}>
                {onCancel && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: themeColors.confirmBtnBg },
                    !onCancel && { flex: 1 }
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.confirmButtonText, { color: themeColors.confirmBtnText }]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  if (useViewOverlay) {
    if (!visible) return null;
    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
        {renderContent()}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      {renderContent()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    width: '100%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 12px 36px rgba(15, 23, 42, 0.2)',
      } as any,
    }),
  },
  topBar: {
    height: 4,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  iconOuterRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconInnerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0,0,0,0.06)',
      } as any,
    }),
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 19,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  message: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13.5,
    fontFamily: 'HankenGrotesk-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: SPACING.md,
    width: '100%',
  },
  highlightText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: 'HankenGrotesk-SemiBold',
    fontWeight: '700',
    color: '#065F46',
    lineHeight: 18,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: '#475569',
  },
  confirmButton: {
    flex: 1.2,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(6, 78, 59, 0.2)',
      } as any,
    }),
  },
  confirmButtonText: {
    fontSize: 13.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default ConfirmModal;

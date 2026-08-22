import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY, SPACING } from '../../../shared/config/theme';

interface ChatMessageBubbleProps {
  message: string;
  isUser: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, isUser }) => {
  if (isUser) {
    return (
      <View style={styles.userWrapper}>
        <View style={styles.userContainer}>
          <Text style={styles.userText}>{message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.botWrapper}>
      <View style={styles.botAvatar}>
        <Ionicons name="sparkles" size={13} color={COLORS.secondary} />
      </View>
      <View style={styles.botContainer}>
        <Text style={styles.botText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userWrapper: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
  },
  userContainer: {
    backgroundColor: COLORS.primary, // Deep Emerald Green
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: 4,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onPrimary,
    lineHeight: 22,
  },
  botWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(254, 208, 27, 0.4)',
  },
  botContainer: {
    flex: 1,
    backgroundColor: COLORS.surface, // Clean card surface
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  botText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    lineHeight: 22,
  },
});

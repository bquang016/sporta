import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export interface UserAvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: any;
  showBadge?: boolean;
  badgeText?: string | number;
}

const AVATAR_COLORS = [
  '#059669', // Emerald
  '#0284C7', // Sky
  '#7C3AED', // Violet
  '#D97706', // Amber
  '#DC2626', // Red
  '#2563EB', // Blue
  '#4F46E5', // Indigo
  '#0D9488', // Teal
  '#DB2777', // Pink
];

function getAvatarColor(name: string = ''): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function UserAvatar({
  uri,
  name = 'U',
  size = 36,
  style,
  showBadge = false,
  badgeText,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState<boolean>(false);

  const cleanUri = typeof uri === 'string' ? uri.trim() : '';
  const hasValidUri = Boolean(cleanUri && !imageError && (cleanUri.startsWith('http') || cleanUri.startsWith('data:')));
  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U';
  const bgColor = getAvatarColor(name);

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {hasValidUri ? (
        <Image
          source={{ uri: cleanUri }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E2E8F0' }}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            styles.fallbackWrap,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: bgColor,
            },
          ]}
        >
          <Text style={[styles.initialText, { fontSize: Math.max(10, Math.floor(size * 0.42)) }]}>
            {initial}
          </Text>
        </View>
      )}

      {showBadge && badgeText !== undefined && (
        <View style={[styles.badgeWrap, { bottom: -2, right: -2 }]}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  initialText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  badgeWrap: {
    position: 'absolute',
    backgroundColor: '#059669',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

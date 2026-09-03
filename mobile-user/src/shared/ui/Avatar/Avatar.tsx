import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  StyleProp,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';

export const DEFAULT_USER_AVATAR = require('../../../../assets/player/player_699x699.png');
export const DEFAULT_CLUB_AVATAR = require('../../../../assets/logo/club/699x699__1_-removebg-preview.png');

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;

export interface AvatarProps {
  source?: ImageSourcePropType | string | null;
  size?: AvatarSize;
  fallbackType?: 'user' | 'club';
  fallbackIcon?: keyof typeof MaterialIcons.glyphMap;
  text?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Avatar({
  source,
  size = 'md',
  fallbackType = 'user',
  fallbackIcon,
  text,
  style,
  textStyle,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [source]);

  // Determine dimensions
  let dim = 40;
  if (size === 'sm') dim = 32;
  else if (size === 'md') dim = 40;
  else if (size === 'lg') dim = 48;
  else if (size === 'xl') dim = 80;
  else if (size === 'xxl') dim = 120;
  else if (typeof size === 'number') dim = size;

  const sizeStyle: ViewStyle = {
    width: dim,
    height: dim,
    borderRadius: dim / 2,
  };

  const containerStyles = [
    styles.container,
    sizeStyle,
    style,
  ] as ViewStyle[];

  const renderContent = () => {
    // 1. If valid image source exists (number or valid string URI or source object) and hasn't errored
    const isInvalidBlob = typeof source === 'string' && source.startsWith('blob:') && Platform.OS !== 'web';
    const isValidString = typeof source === 'string' && source.trim().length > 0 && !isInvalidBlob;
    const isValidSource = source && (typeof source === 'number' || typeof source === 'object' || isValidString);

    if (isValidSource && !imageError) {
      const imgSource = typeof source === 'string' 
        ? { uri: source } 
        : typeof source === 'number' 
        ? source 
        : source;

      return (
        <Image 
          source={imgSource as ImageSourcePropType} 
          style={[styles.image, { borderRadius: dim / 2 }]} 
          resizeMode="cover" 
          onError={() => setImageError(true)}
        />
      );
    }

    // 2. If text (initials) exists (only when text is explicitly provided)
    if (text) {
      const initials = text.substring(0, 3).toUpperCase();
      const fontSize = dim * 0.35;
      return (
        <Text style={[styles.text, { fontSize }, textStyle]}>
          {initials}
        </Text>
      );
    }

    // 3. Explicit fallbackIcon if provided
    if (fallbackIcon) {
      const iconSize = dim * 0.6;
      return (
        <MaterialIcons 
          name={fallbackIcon} 
          size={iconSize} 
          color={COLORS.primary} 
        />
      );
    }

    // 4. Default Placeholders: Club vs User
    const defaultPlaceholder = fallbackType === 'club' ? DEFAULT_CLUB_AVATAR : DEFAULT_USER_AVATAR;
    return (
      <Image 
        source={defaultPlaceholder} 
        style={[styles.image, { borderRadius: dim / 2 }]} 
        resizeMode="cover" 
      />
    );
  };

  return (
    <View style={containerStyles}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: TYPOGRAPHY.labelMd.fontWeight,
    color: COLORS.primary,
  },
});

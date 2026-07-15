import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  StyleProp
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';

export type AvatarSize = 'sm' | 'md' | 'lg' | number;

export interface AvatarProps {
  source?: { uri: string } | string | null;
  size?: AvatarSize;
  fallbackIcon?: keyof typeof MaterialIcons.glyphMap;
  text?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Avatar({
  source,
  size = 'md',
  fallbackIcon = 'person',
  text,
  style,
  textStyle,
}: AvatarProps) {
  // Determine dimensions
  let dim = 40;
  if (size === 'sm') dim = 32;
  else if (size === 'md') dim = 40;
  else if (size === 'lg') dim = 48;
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
    // 1. If image source exists
    if (source) {
      const imgSource = typeof source === 'string' ? { uri: source } : source;
      return (
        <Image 
          source={imgSource} 
          style={[styles.image, { borderRadius: dim / 2 }]} 
          resizeMode="cover" 
        />
      );
    }

    // 2. If text (initials) exists
    if (text) {
      const initials = text.substring(0, 3).toUpperCase(); // Support up to 3 chars for "+X"
      const fontSize = dim * 0.35;
      return (
        <Text style={[styles.text, { fontSize }, textStyle]}>
          {initials}
        </Text>
      );
    }

    // 3. Fallback icon
    const iconSize = dim * 0.6;
    return (
      <MaterialIcons 
        name={fallbackIcon} 
        size={iconSize} 
        color={COLORS.primary} 
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
    backgroundColor: COLORS.primaryOpacity10,
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

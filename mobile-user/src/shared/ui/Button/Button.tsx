import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleProp, 
  ViewStyle, 
  TextStyle 
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export function Button({ 
  title, 
  variant = 'primary', 
  style, 
  textStyle, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant], style]} 
      activeOpacity={0.8}
      {...props}
    >
      {title && <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>{title}</Text>}
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  text: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: 'bold',
  },
  primary: {
    backgroundColor: '#FACC15',
  },
  text_primary: {
    color: '#191c20',
  },
  secondary: {
    backgroundColor: 'rgba(43, 105, 84, 0.08)',
  },
  text_secondary: {
    color: '#2b6954',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2b6954',
  },
  text_outline: {
    color: '#2b6954',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text_ghost: {
    color: '#2b6954',
  },
});

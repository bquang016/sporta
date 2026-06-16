import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  TextInputProps, 
  StyleProp, 
  ViewStyle 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
  renderRight?: () => React.ReactNode;
}

export function SearchInput({ 
  value, 
  onChangeText, 
  onClear, 
  style, 
  renderRight, 
  ...props 
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={[
      styles.searchContainer, 
      isFocused && styles.searchContainerFocused,
      style
    ]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? '#2b6954' : '#9CA3AF'} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {value !== '' && onClear ? (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      ) : (
        renderRight && renderRight()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ededf3', // low-surface container
    borderRadius: 8, // base component input radius
    paddingLeft: 16,
    paddingRight: 6,
    height: 48,
  },
  searchContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2b6954',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    fontFamily: 'HankenGrotesk-Regular',
    flex: 1,
    height: '100%',
    color: '#191c20',
    fontSize: 14,
  },
  clearButton: {
    padding: 6,
  },
});

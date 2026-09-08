import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OwnerWarningBannerProps {
  userRole?: string | null;
}

export function OwnerWarningBanner({ userRole }: OwnerWarningBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const insets = useSafeAreaInsets();

  if (userRole !== 'OWNER' && userRole !== 'ROLE_OWNER') {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.content}>
        <Ionicons name="warning" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.text}>
          Bạn đang dùng tài khoản Chủ sân. Ứng dụng này chỉ cho phép xem thông tin, không thể thực hiện giao dịch (đặt sân, mua vé, v.v.).
        </Text>
        <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EF4444', // Red-500
    width: '100%',
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'HankenGrotesk-Medium',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  }
});

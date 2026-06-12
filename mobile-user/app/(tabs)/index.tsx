import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ Sporta</Text>
      <Text>Đăng ký thành công và đã vào màn hình chính!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2A5C43', marginBottom: 10 }
});

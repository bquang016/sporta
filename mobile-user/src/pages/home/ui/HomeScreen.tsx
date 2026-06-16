import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../shared/ui';

export function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.userNameText}>Người chơi Sporta 👋</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={20} color="#2b6954" />
          </View>
        </View>

        {/* Promo / Hero Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerSubtitle}>SÂN CHƠI NĂNG ĐỘNG</Text>
            <Text style={styles.bannerTitle}>Tìm Đối Thủ &{'\n'}Giao Lưu Câu Lạc Bộ</Text>
            <Button 
              title="Khám phá ngay"
              variant="primary"
              style={styles.bannerButton}
              textStyle={styles.bannerButtonText}
              onPress={() => router.push('/(tabs)/clubs')}
            >
              <Ionicons name="arrow-forward" size={16} color="#191c20" />
            </Button>
          </View>
        </View>

        {/* Navigation Section */}
        <Text style={styles.sectionTitle}>Khám phá Sporta</Text>
        
        {/* Clubs Large Container */}
        <View style={styles.largeCard}>
          <View style={styles.largeCardContent}>
            <View style={styles.largeCardIconWrapper}>
              <Ionicons name="people" size={32} color="#2b6954" />
            </View>
            <View style={styles.largeCardTextContainer}>
              <Text style={styles.largeCardTitle}>Hệ Thống Câu Lạc Bộ</Text>
              <Text style={styles.largeCardDesc}>
                Tham gia các câu lạc bộ thể thao để cùng luyện tập, giao lưu và tham gia giải đấu hấp dẫn.
              </Text>
            </View>
          </View>
          
          <Button 
            title="Đến trang Câu lạc bộ"
            variant="primary"
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
            onPress={() => router.push('/(tabs)/clubs')}
          >
            <Ionicons name="chevron-forward" size={18} color="#191c20" />
          </Button>
        </View>

        {/* Quick Features Row */}
        <View style={styles.quickFeaturesContainer}>
          <TouchableOpacity 
            style={styles.smallCard}
            onPress={() => router.push('/(tabs)/bookings')}
            activeOpacity={0.9}
          >
            <View style={styles.smallCardIconWrapper}>
              <Ionicons name="calendar" size={24} color="#2b6954" />
            </View>
            <Text style={styles.smallCardTitle}>Đặt sân nhanh</Text>
            <Text style={styles.smallCardDesc}>Tìm kiếm và giữ chỗ sân chơi</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.smallCard}
            onPress={() => router.push('/(tabs)/wallet')}
            activeOpacity={0.9}
          >
            <View style={styles.smallCardIconWrapper}>
              <Ionicons name="wallet" size={24} color="#2b6954" />
            </View>
            <Text style={styles.smallCardTitle}>Ví Sporta Pay</Text>
            <Text style={styles.smallCardDesc}>Thanh toán tiện lợi, nhanh chóng</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9ff', // surface color
  },
  scrollContainer: {
    padding: 16, // margin-mobile
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  welcomeText: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 14,
    color: '#444748', // on-surface-variant
    fontWeight: '500',
  },
  userNameText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#191c20', // on-surface
    marginTop: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(43, 105, 84, 0.08)', // secondary color at 8% opacity
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2b6954', // secondary color
  },
  banner: {
    height: 160,
    borderRadius: 16, // large container
    backgroundColor: '#2b6954', // secondary color
    overflow: 'hidden',
    marginBottom: 28,
  },
  bannerOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bannerSubtitle: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#FACC15', // accent color
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
    marginBottom: 14,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FACC15', // accent color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8, // base component button radius
    alignSelf: 'flex-start',
    minHeight: 36,
  },
  bannerButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#191c20', // dark text
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  sectionTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#191c20', // on-surface
    marginBottom: 16,
  },
  largeCard: {
    backgroundColor: '#FFFFFF', // surface-container-lowest
    borderRadius: 16, // large container radius
    borderWidth: 1,
    borderColor: 'rgba(43, 105, 84, 0.15)', // secondary green at 15% opacity
    padding: 20,
    marginBottom: 20,
    shadowColor: '#2b6954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  largeCardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  largeCardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(43, 105, 84, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  largeCardTextContainer: {
    flex: 1,
  },
  largeCardTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b6954', // secondary color
    marginBottom: 4,
  },
  largeCardDesc: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 13,
    color: '#444748', // on-surface-variant
    lineHeight: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FACC15', // accent color
    paddingVertical: 12,
    borderRadius: 8, // base component button radius
    minHeight: 44,
  },
  primaryButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#191c20', // dark text
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
  quickFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8, // base component small card radius
    borderWidth: 1,
    borderColor: 'rgba(43, 105, 84, 0.15)',
    padding: 16,
    width: '48%',
    shadowColor: '#2b6954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  smallCardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(43, 105, 84, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallCardTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2b6954',
    marginBottom: 4,
  },
  smallCardDesc: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 11,
    color: '#444748',
    lineHeight: 14,
  },
});

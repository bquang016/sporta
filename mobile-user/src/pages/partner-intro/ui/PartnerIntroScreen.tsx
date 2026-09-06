import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ImageBackground, Platform, Dimensions, LayoutAnimation, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { Card } from '../../../shared/ui/Card';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental && !(globalThis as any).nativeFabricUIManager) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function PartnerIntroScreen() {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  return (
    <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={[styles.heroContainer, !showMore && { minHeight: Dimensions.get('window').height }]}>
        <ImageBackground 
          source={{ uri: '' }} 
          style={styles.heroBackground}
          imageStyle={{ opacity: 0.15 }}
        />
        <View style={styles.heroOverlay}>
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.onPrimary} />
              </TouchableOpacity>
              <View style={styles.headerLogo}>
                <MaterialCommunityIcons name="tennis" size={24} color={COLORS.onPrimary} />
                <Text style={styles.headerBrand}>Sporta Partners</Text>
              </View>
              <View style={styles.headerRight}>
                <MaterialCommunityIcons name="menu" size={24} color={COLORS.onPrimary} />
              </View>
            </View>
          </SafeAreaView>

          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>GIẢI PHÁP SỐ TOÀN DIỆN</Text>
            </View>
            
            <Text style={styles.heroTitle}>Trở thành đối tác của Sporta</Text>
            <Text style={styles.heroSubtitle}>Số hóa quy trình đặt sân, tối ưu hóa doanh thu và nâng tầm thương hiệu sân thể thao của bạn cùng cộng đồng Sporta Athletic lớn nhất khu vực.</Text>

            <Button 
              title="Đăng ký làm chủ sân ngay" 
              variant="primary" 
              size="lg"
              style={styles.heroButtonPrimary}
            />
            
            {!showMore && (
              <Button 
                title="Tìm hiểu thêm" 
                variant="outline" 
                icon={<MaterialCommunityIcons name="arrow-down" size={20} color={COLORS.onPrimary} />}
                iconPosition="right"
                style={styles.heroButtonOutline}
                textStyle={styles.heroButtonOutlineText}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowMore(true);
                }}
              />
            )}
          </View>
        </View>
      </View>

      {showMore && (
        <>
          {/* Why Choose Sporta */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tại sao chọn Sporta?</Text>
        <Text style={styles.sectionSubtitle}>Giải pháp đột phá giúp quản lý sân hiệu quả và chuyên nghiệp hơn.</Text>

        <View style={styles.featuresGrid}>
          <Card style={styles.featureCard}>
            <MaterialCommunityIcons name="trending-up" size={28} color={COLORS.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Tăng doanh thu</Text>
            <Text style={styles.featureDesc}>Tiếp cận hàng ngàn người chơi thể thao mỗi ngày thông qua hệ thống gợi ý thông minh dựa trên vị trí và Elo.</Text>
            <MaterialCommunityIcons name="cash" size={100} color={COLORS.primary} style={styles.featureWatermark} />
          </Card>

          <Card style={styles.featureCard}>
            <MaterialCommunityIcons name="clock-outline" size={28} color={COLORS.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Quản lý dễ dàng</Text>
            <Text style={styles.featureDesc}>Hệ thống quản lý lịch đặt sân tự động 24/7, loại bỏ sai sót và giảm thiểu thời gian vận hành thủ công.</Text>
          </Card>

          <Card style={[styles.featureCard, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
            <MaterialCommunityIcons name="bullhorn-outline" size={28} color={COLORS.secondary} style={styles.featureIcon} />
            <Text style={[styles.featureTitle, { color: COLORS.secondary }]}>Marketing miễn phí</Text>
            <Text style={[styles.featureDesc, { color: COLORS.onPrimary }]}>Hỗ trợ hình ảnh chuyên nghiệp quảng bá trên ứng dụng và mạng xã hội đối tác, thu hút người chơi trung thành.</Text>
          </Card>

          <Card style={styles.featureCard}>
            <MaterialCommunityIcons name="chart-bar" size={28} color={COLORS.primary} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Báo cáo chi tiết</Text>
            <Text style={styles.featureDesc}>Theo dõi doanh thu, tỷ lệ lấp đầy sân và hiệu suất kinh doanh theo thời gian thực với biểu đồ trực quan.</Text>
          </Card>
        </View>
      </View>

      {/* 3 Steps */}
      <View style={[styles.section, { backgroundColor: COLORS.surfaceBright }]}>
        <Text style={styles.sectionTitle}>3 bước để bắt đầu</Text>
        <Text style={styles.sectionSubtitle}>Quy trình đăng ký đơn giản, nhận khách chỉ trong 48h.</Text>

        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: COLORS.primary }]}>
              <MaterialCommunityIcons name="clipboard-edit-outline" size={24} color={COLORS.onPrimary} />
            </View>
            <Text style={styles.stepTitle}>1. Đăng ký</Text>
            <Text style={styles.stepDesc}>Điền thông tin sân và đăng tải hình ảnh chất lượng cao lên nền tảng.</Text>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: COLORS.primary }]}>
              <MaterialCommunityIcons name="check-decagram-outline" size={24} color={COLORS.onPrimary} />
            </View>
            <Text style={styles.stepTitle}>2. Xác minh</Text>
            <Text style={styles.stepDesc}>Đội ngũ Sporta sẽ liên hệ kiểm tra và hỗ trợ thiết lập hệ thống miễn phí.</Text>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, { backgroundColor: COLORS.primary }]}>
              <MaterialCommunityIcons name="rocket-launch-outline" size={24} color={COLORS.onPrimary} />
            </View>
            <Text style={styles.stepTitle}>3. Bắt đầu nhận khách</Text>
            <Text style={styles.stepDesc}>Sân của bạn sẽ hiển thị trên ứng dụng và bắt đầu nhận những đơn đặt sân đầu tiên.</Text>
          </View>
        </View>
      </View>

      {/* CTA Bottom */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Sẵn sàng để bứt phá cùng Sporta?</Text>
          <Text style={styles.ctaDesc}>Gia nhập mạng lưới hơn 500+ sân thể thao đã số hóa thành công và tăng trưởng hơn 40% doanh thu hằng tháng.</Text>
          
          <Button 
            title="Đăng ký làm chủ sân ngay" 
            variant="primary" 
            size="lg"
            style={styles.ctaButton}
            textStyle={{ color: COLORS.onSecondary }}
          />
          <Text style={styles.ctaSupport}>Hỗ trợ đối tác 24/7: 1900 123 456</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLogo}>
          <MaterialCommunityIcons name="tennis" size={20} color={COLORS.onSurfaceVariant} />
          <Text style={styles.footerBrand}>Sporta Athletic</Text>
        </View>
        <Text style={styles.footerCopy}>© 2024 Sporta Athletic. All rights reserved.</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Chính sách bảo mật</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLink}>Điều khoản sử dụng</Text>
        </View>
        <Text style={styles.footerContact}>Liên hệ hợp tác</Text>
      </View>
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroContainer: {
    backgroundColor: COLORS.brandGreen,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  heroBackground: {
    ...StyleSheet.absoluteFill,
  },
  heroOverlay: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerBrand: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.onPrimary,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.xl,
  },
  heroBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  heroBadgeText: {
    color: COLORS.onSecondary,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.headlineLgMobile.fontFamily,
    fontWeight: 'bold',
    fontSize: 36,
    lineHeight: 44,
    color: COLORS.onPrimary,
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.onPrimary,
    opacity: 0.9,
    marginBottom: SPACING.xl,
  },
  heroButtonPrimary: {
    marginBottom: SPACING.md,
  },
  heroButtonOutline: {
    borderColor: COLORS.onPrimary,
    borderWidth: 1.5,
  },
  heroButtonOutlineText: {
    color: COLORS.onPrimary,
  },
  section: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.marginMobile,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: 'bold',
    fontSize: 24,
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    lineHeight: 22,
  },
  featuresGrid: {
    gap: SPACING.md,
  },
  featureCard: {
    padding: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  featureDesc: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
  },
  featureWatermark: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 0.1,
  },
  stepsContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  stepItem: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    width: '100%',
  },
  stepCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  stepTitle: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  stepDesc: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  ctaSection: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
  },
  ctaCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: 'bold',
    fontSize: 24,
    color: COLORS.onPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  ctaDesc: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.onPrimary,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.xl,
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  ctaSupport: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.onPrimary,
    opacity: 0.8,
  },
  footer: {
    paddingVertical: SPACING.xl * 1.5,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  footerBrand: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },
  footerCopy: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
    marginBottom: SPACING.md,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  footerLink: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  footerDot: {
    color: COLORS.outlineVariant,
  },
  footerContact: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: 'bold',
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  }
});

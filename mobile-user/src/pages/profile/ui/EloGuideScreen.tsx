import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

export function EloGuideScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Collapsible FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quy Tắc Elo & Xác Thực</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <LinearGradient
          colors={['#064E3B', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#A7F3D0" />
            <Text style={styles.heroBadgeText}>HỆ THỐNG XẾP HẠNG SPORTA</Text>
          </View>
          <Text style={styles.heroTitle}>Minh Bạch • Công Bằng • Tôn Vinh Thực Lực</Text>
          <Text style={styles.heroDesc}>
            Tìm hiểu chi tiết về cơ chế tính điểm xếp hạng cá nhân (Elo), điểm câu lạc bộ (CRP) và quyền lợi xác thực trên toàn hệ thống Sporta.
          </Text>
        </LinearGradient>

        {/* Section 1: What is Elo */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="information-circle" size={20} color="#059669" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>1. Điểm Elo Là Gì & Để Làm Gì?</Text>
              <Text style={styles.sectionSubtitle}>Thước đo tiêu chuẩn quốc tế</Text>
            </View>
          </View>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureHeading}>Thước đo thực lực chuẩn xác</Text>
                <Text style={styles.featureText}>
                  Điểm Elo phản ánh phong độ và trình độ thực tế của bạn cho từng bộ môn thể thao riêng biệt (Bóng đá, Cầu lông, Tennis, Pickleball...).
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureBullet}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureHeading}>Ghép trận ngang tài ngang sức</Text>
                <Text style={styles.featureText}>
                  Hệ thống tự động tìm kiếm đối thủ và đồng đội có trình độ tương đương trong các ca Xé Vé và Thách Đấu CLB, xóa bỏ tình trạng lệch trình gây chán nản.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureBullet}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureHeading}>Điều kiện gia nhập CLB chất lượng</Text>
                <Text style={styles.featureText}>
                  Nhiều câu lạc bộ phong trào uy tín sử dụng mức điểm Elo tối thiểu để xét duyệt thành viên và phân chia bảng đấu giải đấu.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: 3-Stage Roadmap */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="timeline-clock" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>2. Lộ Trình 3 Giai Đoạn Xác Thực</Text>
              <Text style={styles.sectionSubtitle}>Từ người mới đến vận động viên chính thức</Text>
            </View>
          </View>

          <View style={styles.timelineContainer}>
            {/* Step 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconCol}>
                <View style={[styles.timelineBadgeCircle, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                  <MaterialCommunityIcons name="shield-account-outline" size={18} color="#64748B" />
                </View>
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.stageTitleRow}>
                  <Text style={styles.stageTitle}>Giai đoạn 1: TỰ KHAI</Text>
                  <View style={[styles.stagePill, { backgroundColor: '#F1F5F9' }]}>
                    <Text style={[styles.stagePillText, { color: '#64748B' }]}>0/5 trận</Text>
                  </View>
                </View>
                <Text style={styles.stageDesc}>
                  Khi mới tham gia môn thể thao, bạn được tự chọn mức trình độ ban đầu (Yếu &lt; 900 Elo → Chuyên nghiệp ≥ 2100 Elo) dựa trên kinh nghiệm cá nhân.
                </Text>
                <View style={styles.stageNoticeBox}>
                  <Ionicons name="create-outline" size={14} color="#64748B" />
                  <Text style={styles.stageNoticeText}>
                    Bạn có thể tự do chọn lại trình độ ban đầu trước khi bắt đầu trận đấu đầu tiên.
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconCol}>
                <View style={[styles.timelineBadgeCircle, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                  <MaterialCommunityIcons name="timer-sand" size={18} color="#D97706" />
                </View>
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.stageTitleRow}>
                  <Text style={styles.stageTitle}>Giai đoạn 2: ĐANG PHÂN HẠNG</Text>
                  <View style={[styles.stagePill, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.stagePillText, { color: '#D97706' }]}>1 - 5 trận</Text>
                  </View>
                </View>
                <Text style={styles.stageDesc}>
                  Hệ thống áp dụng cơ chế "Tăng tốc định vị". Trong 5 trận đầu, số điểm cộng/trừ sau mỗi trận sẽ có biên độ lớn gấp đôi bình thường để nhanh chóng đưa bạn về đúng thứ hạng thực lực.
                </Text>
                <View style={[styles.stageNoticeBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                  <Ionicons name="lock-closed-outline" size={14} color="#D97706" />
                  <Text style={[styles.stageNoticeText, { color: '#92400E' }]}>
                    Trình độ tự khai sẽ bị khóa. Điểm Elo được quyết định 100% bằng kết quả thi đấu.
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconCol}>
                <View style={[styles.timelineBadgeCircle, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#059669" />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.stageTitleRow}>
                  <Text style={styles.stageTitle}>Giai đoạn 3: ĐÃ XÁC THỰC</Text>
                  <View style={[styles.stagePill, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.stagePillText, { color: '#059669' }]}>Từ trận thứ 6</Text>
                  </View>
                </View>
                <Text style={styles.stageDesc}>
                  Sau khi hoàn thành đủ 5 trận phân hạng, bạn nhận Huy Hiệu Xác Thực chính thức. Điểm số đi vào quỹ đạo ổn định và được công nhận rộng rãi trên toàn hệ thống Sporta.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: How points are calculated */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="calculator" size={20} color="#D97706" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>3. Cơ Chế Tính Điểm Thắng / Thua</Text>
              <Text style={styles.sectionSubtitle}>Dựa trên thực lực tương quan</Text>
            </View>
          </View>

          <View style={styles.calcGrid}>
            <View style={styles.calcCard}>
              <View style={[styles.calcBadge, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="trending-up" size={16} color="#059669" />
                <Text style={[styles.calcBadgeText, { color: '#059669' }]}>KHI CHIẾN THẮNG</Text>
              </View>
              <Text style={styles.calcDesc}>
                • Thắng đối thủ có điểm cao hơn (thắng ngược dòng): Được <Text style={{ fontWeight: '700', color: '#059669' }}>cộng nhiều điểm</Text>.{'\n'}
                • Thắng đối thủ có điểm thấp hơn: Được cộng mức điểm vừa phải.
              </Text>
            </View>

            <View style={styles.calcCard}>
              <View style={[styles.calcBadge, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="trending-down" size={16} color="#DC2626" />
                <Text style={[styles.calcBadgeText, { color: '#DC2626' }]}>KHI THUA TRẬN</Text>
              </View>
              <Text style={styles.calcDesc}>
                • Thua đối thủ mạnh hơn: Bị <Text style={{ fontWeight: '700', color: '#DC2626' }}>trừ rất ít điểm</Text> vì đây là kết quả dự kiến.{'\n'}
                • Thua đối thủ yếu hơn nhiều: Bị trừ nhiều điểm hơn bình thường.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Bonuses & CRP Pool */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="gift" size={20} color="#059669" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>4. Điểm Thưởng & Quỹ Điểm Sporta</Text>
              <Text style={styles.sectionSubtitle}>Khuyến khích và bảo vệ người chơi</Text>
            </View>
          </View>

          <View style={styles.bonusGrid}>
            <View style={styles.bonusBox}>
              <View style={styles.bonusIconWrap}>
                <MaterialCommunityIcons name="fire" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bonusBoxTitle}>Thưởng Chuỗi Thắng (+5 CRP)</Text>
                <Text style={styles.bonusBoxDesc}>
                  Khi CLB của bạn duy trì chuỗi từ 3 trận thắng liên tiếp trở lên, hệ thống sẽ tự động thưởng thêm 5 điểm vào quỹ điểm CLB sau mỗi trận thắng tiếp theo.
                </Text>
              </View>
            </View>

            <View style={styles.bonusBox}>
              <View style={styles.bonusIconWrap}>
                <Ionicons name="sunny" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bonusBoxTitle}>Trận Đầu Ngày (+3 CRP)</Text>
                <Text style={styles.bonusBoxDesc}>
                  Chiến thắng trận đấu đầu tiên trong mỗi ngày để nhận phần quà khích lệ tinh thần rèn luyện thể thao hàng ngày từ Sporta.
                </Text>
              </View>
            </View>

            <View style={styles.bonusBox}>
              <View style={styles.bonusIconWrap}>
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bonusBoxTitle}>Bảo Vệ Điểm Thua (Giảm 30%)</Text>
                <Text style={styles.bonusBoxDesc}>
                  Quỹ Trợ Cấp Thể Thao của Sporta sẽ tài trợ bù đắp, đội thua chỉ bị trừ 70% số điểm trận đấu thay vì trừ toàn bộ số điểm!
                </Text>
              </View>
            </View>

            <View style={styles.bonusBox}>
              <View style={styles.bonusIconWrap}>
                <Ionicons name="ribbon" size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bonusBoxTitle}>Thưởng Trưởng Ca Xé Vé</Text>
                <Text style={styles.bonusBoxDesc}>
                  Thành viên đứng ra tạo ca và điều phối các trận xé vé giao lưu được ghi nhận huy hiệu đóng góp cộng đồng thể thao Sporta.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 5: FAQs */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="help-circle" size={20} color="#475569" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>5. Câu Hỏi Thường Gặp</Text>
              <Text style={styles.sectionSubtitle}>Giải đáp thắc mắc phổ biến</Text>
            </View>
          </View>

          <View style={styles.faqList}>
            {[
              {
                q: 'Tại sao khi tôi thua trận lại bị trừ nhiều điểm Elo hơn là khi thắng?',
                a: 'Hệ thống áp dụng nguyên lý Hiệu chỉnh thực lực (Calibration). Đa số người chơi khi mới tham gia thường tự khai trình độ bằng hoặc cao hơn thực tế. Do đó, khi bạn nhận kết quả thua (nhất là thua đối thủ dưới cơ hoặc thua cách biệt lớn), hệ thống sẽ trừ điểm quyết liệt hơn để nhanh chóng đưa bạn về đúng vùng đối thủ vừa sức, tránh để bạn tiếp tục vào các trận đấu quá tầm gây nản lòng hoặc chấn thương. Ngược lại, khi thắng, điểm được tích lũy bền vững (+16 đến +24 Elo) để phản ánh đúng đẳng cấp được tôi luyện qua thời gian dài.',
              },
              {
                q: 'Tôi cần khoảng bao nhiêu trận thắng để nâng một bậc trình độ (ví dụ từ Yếu lên Trung bình)?',
                a: 'Khoảng cách giữa các bậc trình độ (Yếu &lt; 900 Elo → Trung bình 1200 - 1499 Elo → Chuyên nghiệp ≥ 2100 Elo) là từ 300 đến 600 Elo. Trong thể thao thực tế, không ai có thể lên trình chỉ sau vài trận đấu. Bạn cần duy trì phong độ và thắng ròng khoảng 15 đến 25 trận để chính thức nâng một bậc trình độ trên hệ thống.',
              },
              {
                q: 'Thắng với cách biệt tỷ số lớn (5 - 0, 10 - 1...) có được thưởng thêm điểm không?',
                a: 'Có. Khi bạn và đồng đội giành chiến thắng áp đảo (Margin of Victory), hệ thống sẽ cộng thêm điểm Elo cá nhân và cộng thêm điểm CRP cho CLB để ghi nhận sự vượt trội về mặt phong độ và hiệu số bàn thắng.',
              },
              {
                q: 'Tôi có thể tự chỉnh sửa lại trình độ sau khi đã chơi trận đầu tiên không?',
                a: 'Không. Để đảm bảo tính công bằng và chống tình trạng "smurfing" (người chơi giỏi cố tình hạ điểm để bắt nạt người mới), ngay sau khi bắt đầu trận đấu phân hạng đầu tiên, trình độ tự chọn sẽ bị khóa và điểm số được tính toán hoàn toàn tự động qua kết quả thi đấu.',
              },
              {
                q: 'Điểm Elo của môn này có ảnh hưởng sang môn thể thao khác không?',
                a: 'Hoàn toàn không. Mỗi bộ môn thể thao (Bóng đá, Cầu lông, Tennis, Pickleball, Bóng rổ...) sở hữu hệ thống xếp hạng và điểm Elo hoàn toàn độc lập.',
              },
              {
                q: 'Điểm CRP của CLB khác gì với điểm Elo cá nhân?',
                a: 'Điểm Elo là thước đo thực lực cá nhân của riêng bạn trong từng môn. Điểm CRP (Club Ranking Points) là tổng điểm uy tín của cả Câu lạc bộ theo mùa giải, dùng để xếp hạng CLB trong toàn khu vực và toàn quốc.',
              },
            ].map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.faqItem}
                  onPress={() => toggleFaq(idx)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestionRow}>
                    <Text style={styles.faqQuestionText}>{faq.q}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </View>
                  {isExpanded && (
                    <Text style={styles.faqAnswerText}>{faq.a}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Nav Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => router.push('/profile/sports-elo' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="trophy-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnPrimaryText}>Xem Elo Của Bạn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => router.push('/profile/ranked-matches' as any)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="history" size={18} color="#064E3B" />
            <Text style={styles.actionBtnSecondaryText}>Lịch Sử Trận Đấu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  heroDesc: {
    fontSize: 13,
    color: '#D1FAE5',
    lineHeight: 19,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  sectionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  featureList: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureBullet: {
    marginTop: 2,
  },
  featureHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  featureText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 2,
  },
  timelineContainer: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 32,
  },
  timelineBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
    gap: 6,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  stagePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stageDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  stageNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  stageNoticeText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    lineHeight: 15,
  },
  calcGrid: {
    gap: 10,
  },
  calcCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  calcBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  calcDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  bonusGrid: {
    gap: 10,
  },
  bonusBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bonusIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bonusBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  bonusBoxDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginTop: 2,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064E3B',
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actionBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
  },
});

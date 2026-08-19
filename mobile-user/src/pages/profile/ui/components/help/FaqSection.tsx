import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';

export type FaqCategory = 'all' | 'booking' | 'payment' | 'account';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'f-1',
    category: 'booking',
    question: 'Làm sao để biết tôi đã đặt sân thành công?',
    answer: 'Sau khi thanh toán hoàn tất, hệ thống sẽ tự động hiển thị màn hình "Đặt sân thành công" kèm mã QR Code và mã đơn đặt sân (#SP-xxxx). Đơn vị đặt cũng sẽ xuất hiện trong tab Profile -> Lịch sử đặt sân.'
  },
  {
    id: 'f-2',
    category: 'booking',
    question: 'Tôi có thể đổi giờ hoặc đổi sân sau khi đã đặt không?',
    answer: 'Bạn có thể yêu cầu đổi giờ hoặc đổi sân nếu thời gian đổi cách giờ đá tối thiểu 12 tiếng. Vui lòng liên hệ trực tiếp số điện thoại chủ sân trong phần Chi tiết đơn hàng để được hỗ trợ xếp lại lịch.'
  },
  {
    id: 'f-3',
    category: 'booking',
    question: 'Chính sách hủy sân và hoàn tiền như thế nào?',
    answer: 'Trường hợp hủy trước 24h: Hoàn tiền 100% về Ví Sporta. Hủy từ 12h - 24h: Hoàn 50%. Hủy dưới 12h: Không hoàn tiền theo chính sách đảm bảo giữ sân cho chủ sân.'
  },
  {
    id: 'f-4',
    category: 'payment',
    question: 'Tôi đã trừ tiền trong ví/ngân hàng nhưng hệ thống báo thất bại thì làm sao?',
    answer: 'Trường hợp này thường do ngân hàng xử lý chậm. Hệ thống sẽ tự động đối soát sau 5-10 phút. Nếu đơn hàng vẫn chưa cập nhật, bạn hãy chụp hóa đơn chuyển tiền và gửi Yêu cầu hỗ trợ (Support Ticket) để nhân viên hoàn tiền hoặc kích hoạt lại đơn cho bạn.'
  },
  {
    id: 'f-5',
    category: 'payment',
    question: 'Làm thế nào để áp dụng mã giảm giá / Voucher?',
    answer: 'Tại bước Thanh toán đặt sân, chạm vào mục "Mã giảm giá / Voucher", chọn mã phù hợp trong danh sách ưu đãi của bạn để được trừ tiền trực tiếp vào hóa đơn.'
  },
  {
    id: 'f-6',
    category: 'payment',
    question: 'Tôi muốn lấy hóa đơn VAT thì phải làm thế nào?',
    answer: 'Vui lòng tích chọn ô "Yêu cầu xuất hóa đơn VAT" tại bước nhập thông tin thanh toán và nhập Mã số thuế + Tên công ty. Hóa đơn điện tử sẽ được gửi qua email của bạn trong 2-3 ngày làm việc.'
  },
  {
    id: 'f-7',
    category: 'account',
    question: 'Làm sao để đổi số điện thoại nhận thông báo?',
    answer: 'Vào tab Profile -> Cài đặt tài khoản -> Thông tin cá nhân -> Chạm vào Số điện thoại để cập nhật và xác thực lại OTP mới.'
  },
  {
    id: 'f-8',
    category: 'account',
    question: 'Cách tìm đối ghép trận / tham gia câu lạc bộ?',
    answer: 'Bạn có thể vào tab "Ghép trận / CLB" trên thanh điều hướng để xem danh sách các kèo giao hữu đang tìm đối hoặc bấm "Tham gia CLB" để kết nối cùng các đồng đội có cùng trình độ Elo.'
  }
];

interface FaqSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FaqSection({ searchQuery, onSearchChange }: FaqSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('f-1');

  const categories: { id: FaqCategory; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'booking', label: 'Đặt sân & Lịch đặt' },
    { id: 'payment', label: 'Thanh toán & Voucher' },
    { id: 'account', label: 'Tài khoản & Dịch vụ' },
  ];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = searchQuery.trim() === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color={COLORS.onSurfaceVariant} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm câu hỏi (vd: Hủy sân, Trừ tiền, Đổi SĐT...)"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={COLORS.outline}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <MaterialIcons name="close" size={20} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoryRow}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, isActive && styles.catChipActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Accordion FAQ Items */}
      <View style={styles.faqList}>
        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyFaq}>
            <MaterialIcons name="search-off" size={48} color={COLORS.outline} />
            <Text style={styles.emptyFaqText}>Không tìm thấy câu hỏi phù hợp</Text>
          </View>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  activeOpacity={0.8}
                  onPress={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                >
                  <View style={styles.questionIconBg}>
                    <MaterialIcons name="help-outline" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.questionText}>{faq.question}</Text>
                  <MaterialIcons 
                    name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color={COLORS.onSurfaceVariant} 
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqBody}>
                    <View style={styles.faqDivider} />
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  catChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
  },
  catLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  catLabelActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  faqList: {
    gap: SPACING.sm,
  },
  emptyFaq: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyFaqText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  questionIconBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryOpacity12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    flex: 1,
  },
  faqBody: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  faqDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginBottom: SPACING.xs + 2,
  },
  answerText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
});

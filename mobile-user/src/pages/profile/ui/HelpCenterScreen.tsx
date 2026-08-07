import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  StatusBar,
  Linking,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { useAlert } from '../../../shared/contexts/AlertContext';

export type HelpTab = 'faq' | 'contact' | 'tickets';
export type FaqCategory = 'all' | 'booking' | 'payment' | 'account';

interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

interface TicketItem {
  id: string;
  code: string;
  type: string;
  bookingCode?: string;
  title: string;
  description: string;
  imageUri?: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  response?: string;
}

const FAQ_DATA: FaqItem[] = [
  // Đặt sân & Lịch đặt
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
    answer: '• Hủy trước 12h: Hoàn tiền 100% về ví/tài khoản.\n• Hủy từ 4h - 12h: Hoàn tiền 50% giá trị đơn đặt.\n• Hủy dưới 4h trước giờ đá: Không áp dụng hoàn tiền theo quy định chung của các cụm sân.'
  },

  // Thanh toán & Voucher
  {
    id: 'f-4',
    category: 'payment',
    question: 'Tôi đã bị trừ tiền ngân hàng nhưng hệ thống báo thất bại?',
    answer: 'Do gián đoạn kết nối cổng thanh toán, tiền của bạn có thể tạm thời bị treo. Hệ thống sẽ tự động rà soát giao dịch trong 15-30 phút. Nếu đơn hàng vẫn chưa xác nhận, vui lòng gửi Yêu cầu hỗ trợ kèm ảnh chụp biên lai trừ tiền để CSKH hoàn tiền thủ công.'
  },
  {
    id: 'f-5',
    category: 'payment',
    question: 'Làm thế nào để áp dụng mã giảm giá?',
    answer: 'Tại bước Thanh toán đơn đặt sân, nhập mã ưu đãi vào ô "Mã giảm giá / Voucher" và bấm "Áp dụng". Số tiền giảm sẽ được trừ trực tiếp vào Tổng thanh toán.'
  },
  {
    id: 'f-6',
    category: 'payment',
    question: 'Tôi muốn lấy hóa đơn VAT thì phải làm thế nào?',
    answer: 'Đối với các khách hàng doanh nghiệp hoặc cá nhân cần xuất hóa đơn VAT, vui lòng tick vào mục "Yêu cầu xuất hóa đơn VAT" khi thanh toán hoặc gửi yêu cầu hỗ trợ trong vòng 7 ngày sau khi kết thúc ca đá.'
  },

  // Tài khoản & Dịch vụ
  {
    id: 'f-7',
    category: 'account',
    question: 'Làm sao để đổi số điện thoại nhận thông báo?',
    answer: 'Bạn vào tab Profile -> Cài đặt tài khoản -> Thông tin cá nhân -> Chỉnh sửa số điện thoại và tiến hành xác thực lại mã OTP gửi về số máy mới.'
  },
  {
    id: 'f-8',
    category: 'account',
    question: 'Cách tìm đối ghép trận / tham gia câu lạc bộ?',
    answer: 'Tại màn hình chính, chuyển sang tab "Vé xé & Ghép trận" hoặc "Câu lạc bộ". Bạn có thể tự mở phòng ghép trận mới hoặc chọn gia nhập các câu lạc bộ thể thao gần khu vực sống của mình.'
  }
];

const INITIAL_TICKETS: TicketItem[] = [
  {
    id: 't-1',
    code: '#TK-9281',
    type: 'Lỗi thanh toán',
    bookingCode: '#SP9A82X1',
    title: 'Đã bị trừ 350k qua MoMo nhưng chưa nhận mã vé',
    description: 'Tôi đã thanh toán thành công lúc 14:30 nhưng app chưa hiện vé.',
    status: 'responded',
    createdAt: '28/07/2026 14:35',
    response: 'Sporta CSKH: Đã xác minh giao dịch thành công. Đơn hàng #SP9A82X1 của bạn đã được cập nhật sang trạng thái Đã Thanh Toán. Chúc bạn có trận đấu vui vẻ!'
  },
  {
    id: 't-2',
    code: '#TK-8102',
    type: 'Sự cố tại sân',
    bookingCode: '#SP7K21M4',
    title: 'Chủ sân tự ý đóng cửa ca đá 17h00',
    description: 'Tôi đến sân nhưng chủ sân báo nghỉ đột xuất.',
    status: 'pending',
    createdAt: '22/07/2026 17:10',
  }
];

export function HelpCenterScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<HelpTab>('faq');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('f-1');

  // Support Tickets State
  const [tickets, setTickets] = useState<TicketItem[]>(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  // Submit Ticket Modal Form State
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [ticketType, setTicketType] = useState('Lỗi thanh toán');
  const [relatedBookingCode, setRelatedBookingCode] = useState('#SP9A82X1');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile' as any);
    }
  };

  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaqId(prev => prev === id ? null : id);
  };

  // Image Picker for Ticket Evidence
  const handlePickEvidence = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showAlert('Cần cấp quyền', 'Vui lòng cấp quyền thư viện để chọn ảnh minh chứng.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEvidenceImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const handleSubmitTicket = () => {
    if (!ticketTitle.trim() || !ticketDesc.trim()) {
      showAlert('Cảnh báo', 'Vui lòng nhập đầy đủ tiêu đề và mô tả sự cố.');
      return;
    }

    const newTicket: TicketItem = {
      id: `t-${Date.now()}`,
      code: `#TK-${Math.floor(1000 + Math.random() * 9000)}`,
      type: ticketType,
      bookingCode: relatedBookingCode,
      title: ticketTitle.trim(),
      description: ticketDesc.trim(),
      imageUri: evidenceImage || undefined,
      status: 'pending',
      createdAt: 'Hôm nay vừa xong'
    };

    setTickets([newTicket, ...tickets]);
    setIsSubmitModalVisible(false);
    setTicketTitle('');
    setTicketDesc('');
    setEvidenceImage(null);

    showAlert('Gửi thành công', 'Yêu cầu hỗ trợ của bạn đã được gửi tới bộ phận CSKH. Chúng tôi sẽ phản hồi trong thời gian sớm nhất!');
  };

  const getStatusBadge = (status: 'pending' | 'responded' | 'closed') => {
    switch (status) {
      case 'pending':
        return { label: 'Đang xử lý', bg: '#FFF3C4', text: '#B78103', icon: 'hourglass-empty' as const };
      case 'responded':
        return { label: 'Đã phản hồi', bg: COLORS.primaryOpacity15, text: COLORS.primary, icon: 'mark-chat-read' as const };
      case 'closed':
        return { label: 'Đã đóng', bg: COLORS.surfaceContainerLow, text: COLORS.onSurfaceVariant, icon: 'check-circle' as const };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trung Tâm Trợ Giúp</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      {/* Segmented Tab Switcher */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'faq' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('faq')}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name="help-outline" 
            size={16} 
            color={activeTab === 'faq' ? COLORS.primary : COLORS.onSurfaceVariant} 
          />
          <Text style={[styles.segmentText, activeTab === 'faq' && styles.segmentTextActive]}>
            FAQ & Câu Hỏi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'contact' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('contact')}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name="headset-mic" 
            size={16} 
            color={activeTab === 'contact' ? COLORS.primary : COLORS.onSurfaceVariant} 
          />
          <Text style={[styles.segmentText, activeTab === 'contact' && styles.segmentTextActive]}>
            Kênh Liên Hệ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'tickets' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('tickets')}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name="confirmation-number" 
            size={16} 
            color={activeTab === 'tickets' ? COLORS.primary : COLORS.onSurfaceVariant} 
          />
          <Text style={[styles.segmentText, activeTab === 'tickets' && styles.segmentTextActive]}>
            Yêu Cầu Hỗ Trợ
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── TAB 1: FAQ & Câu Hỏi Thường Gặp ─── */}
      {activeTab === 'faq' && (
        <ScrollView contentContainerStyle={styles.tabScrollContent} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchBarWrapper}>
            <MaterialIcons name="search" size={20} color={COLORS.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm câu hỏi (ví dụ: hủy sân, hoàn tiền...)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsContainer}>
            <TouchableOpacity
              style={[styles.catChip, activeCategory === 'all' && styles.catChipActive]}
              onPress={() => setActiveCategory('all')}
            >
              <Text style={[styles.catChipText, activeCategory === 'all' && styles.catChipTextActive]}>Tất cả</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, activeCategory === 'booking' && styles.catChipActive]}
              onPress={() => setActiveCategory('booking')}
            >
              <Text style={[styles.catChipText, activeCategory === 'booking' && styles.catChipTextActive]}>Đặt sân & Lịch đặt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, activeCategory === 'payment' && styles.catChipActive]}
              onPress={() => setActiveCategory('payment')}
            >
              <Text style={[styles.catChipText, activeCategory === 'payment' && styles.catChipTextActive]}>Thanh toán & Voucher</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, activeCategory === 'account' && styles.catChipActive]}
              onPress={() => setActiveCategory('account')}
            >
              <Text style={[styles.catChipText, activeCategory === 'account' && styles.catChipTextActive]}>Tài khoản & Dịch vụ</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Accordion Questions List */}
          <View style={styles.faqList}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map(item => {
                const isExpanded = expandedFaqId === item.id;
                return (
                  <View key={item.id} style={styles.faqCard}>
                    <TouchableOpacity 
                      style={styles.faqHeaderRow}
                      activeOpacity={0.8}
                      onPress={() => toggleFaq(item.id)}
                    >
                      <Text style={styles.faqQuestionText}>{item.question}</Text>
                      <MaterialIcons 
                        name={isExpanded ? "expand-less" : "expand-more"} 
                        size={22} 
                        color={COLORS.primary} 
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.faqBody}>
                        <View style={styles.faqDivider} />
                        <Text style={styles.faqAnswerText}>{item.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyFaq}>
                <MaterialIcons name="sentiment-dissatisfied" size={48} color={COLORS.outline} />
                <Text style={styles.emptyFaqText}>Không tìm thấy câu hỏi nào phù hợp</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ─── TAB 2: Kênh Hỗ Trợ Trực Tiếp ─── */}
      {activeTab === 'contact' && (
        <ScrollView contentContainerStyle={styles.tabScrollContent} showsVerticalScrollIndicator={false}>
          {/* Hotline Emergency Card */}
          <View style={styles.contactCardPrimary}>
            <View style={styles.contactCardHeader}>
              <View style={styles.emergencyIconBg}>
                <MaterialIcons name="phone-in-talk" size={24} color={COLORS.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactPrimaryTitle}>Hotline Tổng Đài Khẩn Cấp</Text>
                <Text style={styles.contactPrimarySub}>Dành cho trường hợp sự cố tại sân, trùng ca, sân đóng cửa</Text>
              </View>
            </View>

            <View style={styles.phoneBox}>
              <Text style={styles.phoneNumberText}>1900 6868</Text>
              <TouchableOpacity 
                style={styles.callNowBtn}
                activeOpacity={0.85}
                onPress={() => Linking.openURL('tel:19006868')}
              >
                <MaterialIcons name="call" size={18} color={COLORS.white} />
                <Text style={styles.callNowBtnText}>Bấm Gọi Trực Tiếp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Direct Support Channels */}
          <View style={styles.contactCard}>
            <Text style={styles.cardSectionTitle}>CÁC KÊNH HỖ TRỢ TRỰC TUYẾN</Text>

            {/* Zalo OA */}
            <TouchableOpacity 
              style={styles.contactRowItem}
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://zalo.me/sporta')}
            >
              <View style={[styles.channelIconBg, { backgroundColor: '#E5F3FF' }]}>
                <MaterialCommunityIcons name="chat-processing" size={22} color="#0068FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelName}>Chat Zalo Official Account</Text>
                <Text style={styles.channelDesc}>Nhắn tin với nhân viên tư vấn hỗ trợ 24/7</Text>
              </View>
              <MaterialIcons name="open-in-new" size={18} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Email Support */}
            <TouchableOpacity 
              style={styles.contactRowItem}
              activeOpacity={0.8}
              onPress={() => Linking.openURL('mailto:hotro@sporta.vn')}
            >
              <View style={[styles.channelIconBg, { backgroundColor: '#FFEDEA' }]}>
                <MaterialIcons name="mail-outline" size={22} color="#D93025" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelName}>Email Hỗ Trợ Khách Hàng</Text>
                <Text style={styles.channelDesc}>hotro@sporta.vn (Giải quyết khiếu nại & hóa đơn)</Text>
              </View>
              <MaterialIcons name="send" size={18} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Working Hours */}
          <View style={styles.workingHoursCard}>
            <MaterialIcons name="access-time" size={22} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.workingHoursTitle}>Khung Giờ Hoạt Động</Text>
              <Text style={styles.workingHoursText}>8:00 - 22:00 hàng ngày (Kể cả Thứ 7, Chủ Nhật & Ngày lễ)</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ─── TAB 3: Gửi & Theo Dõi Yêu Cầu Hỗ Trợ ─── */}
      {activeTab === 'tickets' && (
        <ScrollView contentContainerStyle={styles.tabScrollContent} showsVerticalScrollIndicator={false}>
          {/* Create New Ticket Banner */}
          <View style={styles.ticketBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Gửi Yêu Cầu Khiếu Nại / Hỗ Trợ</Text>
              <Text style={styles.bannerSub}>Dùng khi cần khiếu nại sự cố thanh toán, thái độ chủ sân hoặc yêu cầu hoàn tiền thủ công</Text>
            </View>
            <TouchableOpacity 
              style={styles.createTicketBtn}
              activeOpacity={0.85}
              onPress={() => setIsSubmitModalVisible(true)}
            >
              <MaterialIcons name="add" size={18} color={COLORS.white} />
              <Text style={styles.createTicketBtnText}>Tạo Yêu Cầu</Text>
            </TouchableOpacity>
          </View>

          {/* Tickets List Header */}
          <Text style={styles.ticketSectionHeader}>DANH SÁCH YÊU CẦU CỦA TÔI ({tickets.length})</Text>

          {/* Ticket Items */}
          <View style={styles.ticketList}>
            {tickets.map(ticket => {
              const badge = getStatusBadge(ticket.status);
              return (
                <TouchableOpacity 
                  key={ticket.id}
                  style={styles.ticketCard}
                  activeOpacity={0.85}
                  onPress={() => setSelectedTicket(ticket)}
                >
                  <View style={styles.ticketCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ticketCode}>{ticket.code} • <Text style={styles.ticketType}>{ticket.type}</Text></Text>
                      <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                    </View>
                    <View style={[styles.ticketBadge, { backgroundColor: badge.bg }]}>
                      <MaterialIcons name={badge.icon} size={12} color={badge.text} />
                      <Text style={[styles.ticketBadgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <View style={styles.ticketDivider} />

                  <View style={styles.ticketFooter}>
                    <Text style={styles.ticketDate}>Tạo lúc: {ticket.createdAt}</Text>
                    <Text style={styles.viewDetailText}>Xem chi tiết phản hồi →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Modal Submit Support Ticket */}
      <Modal
        visible={isSubmitModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsSubmitModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsSubmitModalVisible(false)}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Gửi Yêu Cầu Hỗ Trợ</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Loại vấn đề */}
            <Text style={styles.inputLabel}>Chọn loại vấn đề</Text>
            <View style={styles.typeChipsRow}>
              {['Lỗi thanh toán', 'Sự cố tại sân', 'Thái độ chủ sân', 'Khác'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, ticketType === t && styles.typeChipActive]}
                  onPress={() => setTicketType(t)}
                >
                  <Text style={[styles.typeChipText, ticketType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Đơn hàng liên quan */}
            <Text style={styles.inputLabel}>Đơn đặt sân liên quan</Text>
            <View style={styles.selectBookingBox}>
              <MaterialIcons name="receipt-long" size={20} color={COLORS.primary} />
              <TextInput
                style={styles.bookingCodeInput}
                value={relatedBookingCode}
                onChangeText={setRelatedBookingCode}
                placeholder="Nhập mã đơn (ví dụ #SP9A82X1)"
              />
            </View>

            {/* Tiêu đề */}
            <Text style={styles.inputLabel}>Tiêu đề sự cố</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Tóm tắt ngắn gọn vấn đề gặp phải"
              value={ticketTitle}
              onChangeText={setTicketTitle}
            />

            {/* Mô tả chi tiết */}
            <Text style={styles.inputLabel}>Mô tả chi tiết sự cố</Text>
            <TextInput
              style={[styles.textInput, { height: 100 }]}
              placeholder="Vui lòng cung cấp chi tiết thời gian, hình thức thanh toán hoặc diễn biến tại sân..."
              value={ticketDesc}
              onChangeText={setTicketDesc}
              multiline
            />

            {/* Tải ảnh minh chứng */}
            <Text style={styles.inputLabel}>Ảnh màn hình / Video minh chứng (Tùy chọn)</Text>
            <TouchableOpacity 
              style={styles.uploadImageBox}
              activeOpacity={0.8}
              onPress={handlePickEvidence}
            >
              {evidenceImage ? (
                <Image source={{ uri: evidenceImage }} style={styles.uploadedPreview} />
              ) : (
                <View style={styles.uploadPlaceholderCol}>
                  <MaterialIcons name="cloud-upload" size={32} color={COLORS.primary} />
                  <Text style={styles.uploadPlaceholderText}>Chạm để chọn ảnh chụp biên lai / sự cố</Text>
                </View>
              )}
            </TouchableOpacity>

            <Button
              title="Gửi Yêu Cầu Hỗ Trợ"
              variant="primary"
              style={{ marginTop: SPACING.xl }}
              onPress={handleSubmitTicket}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Ticket Response Detail Modal */}
      <Modal
        visible={!!selectedTicket}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTicket(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ticketDetailCard}>
            <TouchableOpacity 
              style={styles.closeModalIcon}
              onPress={() => setSelectedTicket(null)}
            >
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>

            <Text style={styles.ticketDetailCode}>{selectedTicket?.code} • {selectedTicket?.type}</Text>
            <Text style={styles.ticketDetailTitle}>{selectedTicket?.title}</Text>

            <View style={styles.ticketDetailDivider} />

            <Text style={styles.detailLabelHeader}>Nội dung sự cố đã gửi:</Text>
            <Text style={styles.detailBodyText}>{selectedTicket?.description}</Text>

            {selectedTicket?.response ? (
              <View style={styles.responseBox}>
                <View style={styles.responseHeaderRow}>
                  <MaterialIcons name="verified-user" size={18} color={COLORS.primary} />
                  <Text style={styles.responseHeaderTitle}>Phản hồi từ Sporta CSKH:</Text>
                </View>
                <Text style={styles.responseText}>{selectedTicket.response}</Text>
              </View>
            ) : (
              <View style={styles.pendingResponseBox}>
                <MaterialIcons name="hourglass-empty" size={20} color="#B78103" />
                <Text style={styles.pendingResponseText}>Yêu cầu đang được bộ phận CSKH xử lý. Vui lòng đợi trong giây lát.</Text>
              </View>
            )}

            <Button
              title="Đóng"
              variant="outline"
              style={{ marginTop: SPACING.lg, width: '100%' }}
              onPress={() => setSelectedTicket(null)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
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
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    gap: SPACING.xs,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs + 3,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: 4,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primaryOpacity15,
  },
  segmentText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  tabScrollContent: {
    padding: SPACING.marginMobile,
    gap: SPACING.md,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.onSurface,
  },
  categoryChipsContainer: {
    gap: SPACING.xs,
  },
  catChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  catChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  faqList: {
    gap: SPACING.sm,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  faqQuestionText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    flex: 1,
    lineHeight: 20,
  },
  faqBody: {
    marginTop: SPACING.xs,
  },
  faqDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs + 2,
  },
  faqAnswerText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  emptyFaq: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  emptyFaqText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  contactCardPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  contactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emergencyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactPrimaryTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  contactPrimarySub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  phoneNumberText: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  callNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D93025',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  callNowBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '800',
  },
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    gap: SPACING.xs,
  },
  cardSectionTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  contactRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.md,
  },
  channelIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  channelDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  workingHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity10,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  workingHoursTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  workingHoursText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  ticketBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    gap: SPACING.sm,
  },
  bannerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  bannerSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  createTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
    borderRadius: BORDER_RADIUS.md,
    gap: 2,
  },
  createTicketBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
  },
  ticketSectionHeader: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  ticketList: {
    gap: SPACING.md,
  },
  ticketCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  ticketCode: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
  },
  ticketType: {
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  ticketTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  ticketBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '800',
  },
  ticketDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs + 2,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  viewDetailText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  modalHeaderTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalScroll: {
    padding: SPACING.marginMobile,
  },
  inputLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  typeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  typeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  typeChipActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  typeChipText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  typeChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  selectBookingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: SPACING.xs,
  },
  bookingCodeInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  uploadImageBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity30,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadedPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadPlaceholderCol: {
    alignItems: 'center',
    gap: 4,
  },
  uploadPlaceholderText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  ticketDetailCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    position: 'relative',
  },
  closeModalIcon: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  ticketDetailCode: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
  },
  ticketDetailTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 4,
  },
  ticketDetailDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.md,
  },
  detailLabelHeader: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  detailBodyText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
    marginTop: 4,
    lineHeight: 19,
  },
  responseBox: {
    backgroundColor: COLORS.primaryOpacity10,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: 4,
  },
  responseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responseHeaderTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  responseText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
    lineHeight: 19,
  },
  pendingResponseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  pendingResponseText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: '#B78103',
    flex: 1,
  },
});

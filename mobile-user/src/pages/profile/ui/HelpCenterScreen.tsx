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
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { useAlert } from '../../../shared/contexts/AlertContext';

import { FaqSection } from './components/help/FaqSection';
import { ContactChannelsSection } from './components/help/ContactChannelsSection';
import { SupportTicketSection, TicketItem } from './components/help/SupportTicketSection';

export type HelpTab = 'faq' | 'contact' | 'tickets';

export function HelpCenterScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<HelpTab>('faq');
  const [searchQuery, setSearchQuery] = useState('');

  // Support Tickets State
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [isCreateTicketModal, setIsCreateTicketModal] = useState(false);

  // Ticket Form State
  const [ticketType, setTicketType] = useState('Thanh toán & Trừ tiền');
  const [ticketBookingCode, setTicketBookingCode] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketImageUri, setTicketImageUri] = useState<string | undefined>(undefined);

  const handlePickProofImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showAlert('Cần cấp quyền', 'Vui lòng cấp quyền thư viện ảnh để đính kèm bằng chứng.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTicketImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking proof image:', err);
    }
  };

  const handleSubmitTicket = () => {
    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      showAlert('Cảnh báo', 'Vui lòng nhập đầy đủ Tiêu đề và Nội dung cần hỗ trợ.');
      return;
    }

    const newTicket: TicketItem = {
      id: `t-${Date.now()}`,
      code: `#TK${Math.floor(1000 + Math.random() * 9000)}`,
      type: ticketType,
      bookingCode: ticketBookingCode.trim() || undefined,
      title: ticketTitle.trim(),
      description: ticketDescription.trim(),
      imageUri: ticketImageUri,
      status: 'pending',
      createdAt: 'Vừa xong',
    };

    setTickets([newTicket, ...tickets]);
    setIsCreateTicketModal(false);

    // Reset Form
    setTicketTitle('');
    setTicketDescription('');
    setTicketBookingCode('');
    setTicketImageUri(undefined);

    showAlert(
      'Gửi Yêu Cầu Thành Công', 
      'Yêu cầu hỗ trợ của bạn đã được tiếp nhận. Đội ngũ CSKH Sporta sẽ xử lý và phản hồi trong thời gian sớm nhất.'
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trung Tâm Trợ Giúp</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Navigation Filter Tabs */}
      <View style={styles.tabNav}>
        {[
          { id: 'faq', label: 'FAQ (Câu hỏi)', icon: 'quiz' },
          { id: 'contact', label: 'Hỗ trợ trực tiếp', icon: 'support-agent' },
          { id: 'tickets', label: 'Yêu cầu (Ticket)', icon: 'confirmation-number' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabNavBtn, isActive && styles.tabNavBtnActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab.id as HelpTab)}
            >
              <MaterialIcons 
                name={tab.icon as any} 
                size={18} 
                color={isActive ? COLORS.primary : COLORS.onSurfaceVariant} 
              />
              <Text style={[styles.tabNavText, isActive && styles.tabNavTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: FAQ Accordion Component */}
        {activeTab === 'faq' && (
          <FaqSection 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* Section 2: Contact Channels Component */}
        {activeTab === 'contact' && (
          <ContactChannelsSection />
        )}

        {/* Section 3: Support Ticket List Component */}
        {activeTab === 'tickets' && (
          <SupportTicketSection 
            tickets={tickets}
            onOpenCreateTicketModal={() => setIsCreateTicketModal(true)}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Ticket Modal */}
      <Modal
        visible={isCreateTicketModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCreateTicketModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsCreateTicketModal(false)}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Gửi Yêu Cầu Hỗ Trợ</Text>

            <TouchableOpacity onPress={handleSubmitTicket}>
              <Text style={styles.modalHeaderSubmit}>Gửi</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Loại vấn đề */}
            <Text style={styles.inputLabel}>Nhóm vấn đề cần hỗ trợ</Text>
            <View style={styles.typeRow}>
              {['Thanh toán & Trừ tiền', 'Đặt sân & Đổi giờ', 'Voucher & Ưu đãi', 'Khác'].map((t) => {
                const isSelected = ticketType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                    onPress={() => setTicketType(t)}
                  >
                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Mã đơn (Tùy chọn) */}
            <Text style={styles.inputLabel}>Mã đơn đặt sân (Nếu có)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Vd: #SP9A82X1"
              value={ticketBookingCode}
              onChangeText={setTicketBookingCode}
            />

            {/* Tiêu đề */}
            <Text style={styles.inputLabel}>Tiêu đề vấn đề (*)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Tóm tắt ngắn gọn vấn đề"
              value={ticketTitle}
              onChangeText={setTicketTitle}
            />

            {/* Nội dung chi tiết */}
            <Text style={styles.inputLabel}>Mô tả chi tiết (*)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Mô tả cụ thể sự cố hoặc câu hỏi của bạn..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={ticketDescription}
              onChangeText={setTicketDescription}
            />

            {/* Đính kèm ảnh bằng chứng */}
            <Text style={styles.inputLabel}>Ảnh bằng chứng (Hóa đơn chuyển tiền, ảnh lỗi...)</Text>
            {ticketImageUri ? (
              <View style={styles.proofPreviewWrapper}>
                <Image source={{ uri: ticketImageUri }} style={styles.proofPreviewImg} />
                <TouchableOpacity style={styles.removeProofBtn} onPress={() => setTicketImageUri(undefined)}>
                  <MaterialIcons name="close" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadProofBtn} onPress={handlePickProofImage}>
                <MaterialIcons name="add-a-photo" size={24} color={COLORS.primary} />
                <Text style={styles.uploadProofText}>Tải ảnh lên</Text>
              </TouchableOpacity>
            )}

            <Button
              title="Tạo & Gửi Ticket"
              variant="primary"
              style={{ marginTop: SPACING.xl }}
              onPress={handleSubmitTicket}
            />
          </ScrollView>
        </SafeAreaView>
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
  backBtn: {
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
  tabNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingHorizontal: SPACING.marginMobile,
  },
  tabNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabNavBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  tabNavText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  tabNavTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    padding: SPACING.marginMobile,
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
  modalHeaderSubmit: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '800',
  },
  modalScroll: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl * 2,
  },
  inputLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  typeRow: {
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
  typeChipSelected: {
    backgroundColor: COLORS.primaryOpacity10,
    borderColor: COLORS.primary,
  },
  typeChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  typeChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
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
  textArea: {
    height: 100,
  },
  uploadProofBtn: {
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    gap: 4,
  },
  uploadProofText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
  },
  proofPreviewWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  proofPreviewImg: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removeProofBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.blackOpacity50,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

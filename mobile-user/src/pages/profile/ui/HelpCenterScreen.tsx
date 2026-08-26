import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  StatusBar,
  Image,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, ConfirmModal } from '../../../shared/ui';
import { useAlert } from '../../../shared/contexts/AlertContext';

import { FaqSection } from './components/help/FaqSection';
import { ContactChannelsSection } from './components/help/ContactChannelsSection';
import { SupportTicketSection } from './components/help/SupportTicketSection';
import { createSupportTicketApi, getMySupportTicketsApi, confirmResolvedTicketApi, reopenTicketApi, cancelTicketApi, replyTicketApi, SupportTicketItem } from '../../../shared/api/supportTicketApi';
import { uploadImageApi } from '../../../shared/api/upload';

export type HelpTab = 'faq' | 'contact' | 'tickets';

export function HelpCenterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { showAlert, showConfirm } = useAlert();
  const insets = useSafeAreaInsets();
  const modalTopPadding = Platform.OS === 'ios' ? (insets.top > 0 ? insets.top : 47) : insets.top;

  const [activeTab, setActiveTab] = useState<HelpTab>(params.tab === 'tickets' ? 'tickets' : 'faq');

  useEffect(() => {
    if (params.tab === 'tickets') {
      setActiveTab('tickets');
    }
  }, [params.tab]);
  const [searchQuery, setSearchQuery] = useState('');

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [isCreateTicketModal, setIsCreateTicketModal] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Ticket Form State
  const [ticketType, setTicketType] = useState('Thanh toán & Trừ tiền');
  const [ticketBookingCode, setTicketBookingCode] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketImageUris, setTicketImageUris] = useState<string[]>([]);

  // Reply Ticket Modal State
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImageUris, setReplyImageUris] = useState<string[]>([]);
  const [submittingReply, setSubmittingReply] = useState(false);

  // In-Modal Alert State (uses view overlay so alerts pop up immediately on top of active modals without iOS modal layering conflicts)
  const [inModalAlert, setInModalAlert] = useState<{
    title: string;
    message: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    iconColor?: string;
    onConfirm?: () => void;
    confirmText?: string;
  } | null>(null);

  const showInModalAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
    options?: {
      icon?: keyof typeof MaterialIcons.glyphMap;
      iconColor?: string;
      confirmText?: string;
    }
  ) => {
    const lowerTitle = (title || '').toLowerCase();
    let icon: keyof typeof MaterialIcons.glyphMap = 'info-outline';
    let iconColor = COLORS.primary;

    if (lowerTitle.includes('lỗi') || lowerTitle.includes('thất bại') || lowerTitle.includes('error') || lowerTitle.includes('cần cấp quyền')) {
      icon = 'error-outline';
      iconColor = '#DC2626';
    } else if (lowerTitle.includes('cảnh báo') || lowerTitle.includes('chú ý') || lowerTitle.includes('warning') || lowerTitle.includes('thiếu')) {
      icon = 'warning-amber';
      iconColor = '#F59E0B';
    } else if (lowerTitle.includes('thành công') || lowerTitle.includes('hoàn tất') || lowerTitle.includes('success')) {
      icon = 'check-circle-outline';
      iconColor = '#059669';
    }

    setInModalAlert({
      title,
      message,
      onConfirm,
      icon: options?.icon || icon,
      iconColor: options?.iconColor || iconColor,
      confirmText: options?.confirmText || 'Đóng',
    });
  };

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const data = await getMySupportTicketsApi();
      setTickets(data || []);
    } catch (err: any) {
      console.error('Lỗi lấy danh sách ticket:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handlePickProofImage = async () => {
    if (ticketImageUris.length >= 3) {
      showInModalAlert('Thông báo', 'Bạn chỉ được đính kèm tối đa 3 ảnh bằng chứng.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showInModalAlert('Cần cấp quyền', 'Vui lòng cấp quyền thư viện ảnh để đính kèm bằng chứng.');
        return;
      }

      const maxRemaining = 3 - ticketImageUris.length;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxRemaining,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUris = result.assets.map((asset) => asset.uri);
        setTicketImageUris((prev) => [...prev, ...pickedUris].slice(0, 3));
      }
    } catch (err) {
      console.error('Error picking proof image:', err);
    }
  };

  const handleRemoveProofImage = (index: number) => {
    setTicketImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitTicket = async () => {
    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      showInModalAlert('Cảnh báo', 'Vui lòng nhập đầy đủ Tiêu đề và Nội dung cần hỗ trợ.');
      return;
    }

    try {
      setSubmittingTicket(true);
      let uploadedUrls: string[] = [];

      if (ticketImageUris.length > 0) {
        uploadedUrls = await Promise.all(
          ticketImageUris.map(async (uri) => {
            try {
              const uploadRes = await uploadImageApi(uri, 'general');
              return uploadRes || uri;
            } catch (e) {
              console.warn('Lỗi upload ảnh đính kèm:', e);
              return uri;
            }
          })
        );
      }

      const imageUrlPayload = uploadedUrls.length > 0 ? uploadedUrls.join(',') : undefined;

      await createSupportTicketApi({
        ticketType,
        bookingCode: ticketBookingCode.trim() || undefined,
        title: ticketTitle.trim(),
        description: ticketDescription.trim(),
        imageUrl: imageUrlPayload,
      });

      setIsCreateTicketModal(false);

      // Reset Form
      setTicketTitle('');
      setTicketDescription('');
      setTicketBookingCode('');
      setTicketImageUris([]);

      await fetchTickets();

      showAlert(
        'Gửi Yêu Cầu Thành Công', 
        'Yêu cầu hỗ trợ của bạn đã được gửi lên hệ thống và chuyển sang trạng thái Mới Tiếp Nhận. Ban quản trị Sporta sẽ kiểm tra và phản hồi sớm nhất.'
      );
    } catch (err: any) {
      showInModalAlert('Lỗi tạo Ticket', err.message || 'Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại sau.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleConfirmResolved = (ticketId: string) => {
    showConfirm(
      'Xác Nhận Đóng Ticket',
      'Bạn có chắc chắn sự cố đã được giải quyết hài lòng và muốn đóng Ticket này không?',
      async () => {
        try {
          await confirmResolvedTicketApi(ticketId);
          showAlert('Thành công', 'Cảm ơn bạn đã xác nhận. Ticket hỗ trợ đã hoàn tất và đóng thành công.');
          fetchTickets();
        } catch (err: any) {
          showAlert('Lỗi', err.message || 'Không thể xác nhận ticket.');
        }
      },
      undefined,
      'Xác nhận & Đóng',
      'Hủy'
    );
  };

  const handleReopenTicket = (ticketId: string) => {
    showConfirm(
      'Mở Lại Yêu Cầu Hỗ Trợ',
      'Bạn chưa hài lòng với kết quả giải quyết và muốn mở lại Ticket để Ban quản trị hỗ trợ tiếp?',
      async () => {
        try {
          await reopenTicketApi(ticketId);
          showAlert('Đã Mở Lại Ticket', 'Trạng thái Ticket đã được chuyển về Đang Xử Lý. Ban quản trị sẽ kiểm tra và hỗ trợ bạn thêm.');
          fetchTickets();
        } catch (err: any) {
          showAlert('Lỗi', err.message || 'Không thể mở lại ticket.');
        }
      },
      undefined,
      'Mở lại Ticket',
      'Hủy'
    );
  };

  const handleCancelTicket = (ticketId: string) => {
    showConfirm(
      'Hủy Yêu Cầu Hỗ Trợ',
      'Bạn có chắc chắn muốn hủy yêu cầu hỗ trợ (ticket) này không?',
      async () => {
        try {
          await cancelTicketApi(ticketId);
          showAlert('Đã Hủy Ticket', 'Đã hủy yêu cầu hỗ trợ thành công.');
          fetchTickets();
        } catch (err: any) {
          showAlert('Lỗi', err.message || 'Không thể hủy ticket.');
        }
      },
      undefined,
      'Hủy Ticket',
      'Quay lại'
    );
  };

  const handleOpenReplyModal = (ticketId: string) => {
    setReplyingTicketId(ticketId);
    setReplyMessage('');
    setReplyImageUris([]);
    setIsReplyModalVisible(true);
  };

  const handlePickReplyImage = async () => {
    if (replyImageUris.length >= 3) {
      showInModalAlert('Thông báo', 'Bạn chỉ được đính kèm tối đa 3 ảnh bằng chứng.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showInModalAlert('Cần cấp quyền', 'Vui lòng cấp quyền thư viện ảnh để đính kèm bằng chứng.');
        return;
      }

      const maxRemaining = 3 - replyImageUris.length;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxRemaining,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUris = result.assets.map((asset) => asset.uri);
        setReplyImageUris((prev) => [...prev, ...pickedUris].slice(0, 3));
      }
    } catch (err) {
      console.error('Error picking reply image:', err);
    }
  };

  const handleRemoveReplyImage = (index: number) => {
    setReplyImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReply = async () => {
    if (!replyingTicketId) return;
    if (!replyMessage.trim() && replyImageUris.length === 0) {
      showInModalAlert('Cảnh báo', 'Vui lòng nhập nội dung phản hồi hoặc đính kèm ít nhất 1 ảnh bằng chứng.');
      return;
    }

    try {
      setSubmittingReply(true);
      let uploadedUrls: string[] = [];

      if (replyImageUris.length > 0) {
        uploadedUrls = await Promise.all(
          replyImageUris.map(async (uri) => {
            try {
              const uploadRes = await uploadImageApi(uri, 'general');
              return uploadRes || uri;
            } catch (e) {
              console.warn('Lỗi upload ảnh đính kèm phản hồi:', e);
              return uri;
            }
          })
        );
      }

      const imageUrlPayload = uploadedUrls.length > 0 ? uploadedUrls.join(',') : undefined;

      await replyTicketApi(replyingTicketId, {
        message: replyMessage.trim(),
        imageUrl: imageUrlPayload,
      });

      setIsReplyModalVisible(false);
      setReplyingTicketId(null);
      setReplyMessage('');
      setReplyImageUris([]);

      await fetchTickets();

      showAlert(
        'Gửi Phản Hồi Thành Công',
        'Phản hồi và bằng chứng bổ sung của bạn đã được gửi. Trạng thái ticket đã được cập nhật sang "Đang xử lý".'
      );
    } catch (err: any) {
      showInModalAlert('Lỗi phản hồi Ticket', err.message || 'Không thể gửi phản hồi. Vui lòng thử lại sau.');
    } finally {
      setSubmittingReply(false);
    }
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
            onConfirmResolved={handleConfirmResolved}
            onReopenTicket={handleReopenTicket}
            onCancelTicket={handleCancelTicket}
            onReplyTicket={handleOpenReplyModal}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Ticket Modal */}
      <Modal
        visible={isCreateTicketModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setInModalAlert(null);
          setIsCreateTicketModal(false);
        }}
      >
        <View style={[styles.modalHeaderSafeArea, { paddingTop: modalTopPadding }]}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setIsCreateTicketModal(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.modalHeaderIconBtn}
            >
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Gửi Yêu Cầu Hỗ Trợ</Text>

            <View style={styles.modalHeaderIconBtn} />
          </View>
        </View>

        <SafeAreaView style={styles.modalContainer} edges={['bottom', 'left', 'right']}>

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
            <View style={styles.imageLabelRow}>
              <Text style={styles.inputLabel}>Ảnh bằng chứng (Hóa đơn, ảnh lỗi...)</Text>
              <Text style={styles.imageCountText}>{ticketImageUris.length}/3 ảnh</Text>
            </View>

            <View style={styles.proofGridContainer}>
              {ticketImageUris.map((uri, index) => (
                <View key={index} style={styles.proofPreviewWrapper}>
                  <Image source={{ uri }} style={styles.proofPreviewImg} />
                  <TouchableOpacity 
                    style={styles.removeProofBtn} 
                    onPress={() => handleRemoveProofImage(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="close" size={14} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}

              {ticketImageUris.length < 3 && (
                <TouchableOpacity style={styles.uploadProofBtn} onPress={handlePickProofImage}>
                  <MaterialIcons name="add-a-photo" size={22} color={COLORS.primary} />
                  <Text style={styles.uploadProofText}>Tải ảnh lên</Text>
                </TouchableOpacity>
              )}
            </View>

            <Button
              title={submittingTicket ? "Đang gửi..." : "Tạo & Gửi Ticket"}
              variant="primary"
              style={{ marginTop: SPACING.xl }}
              onPress={handleSubmitTicket}
              disabled={submittingTicket}
              loading={submittingTicket}
            />
          </ScrollView>
        </SafeAreaView>

        {inModalAlert && isCreateTicketModal && (
          <ConfirmModal
            visible={!!inModalAlert}
            title={inModalAlert.title}
            message={inModalAlert.message}
            confirmText={inModalAlert.confirmText || 'Đóng'}
            icon={inModalAlert.icon}
            iconColor={inModalAlert.iconColor}
            onConfirm={() => {
              const cb = inModalAlert.onConfirm;
              setInModalAlert(null);
              if (cb) cb();
            }}
            useViewOverlay={true}
          />
        )}
      </Modal>

      {/* Reply Ticket Modal */}
      <Modal
        visible={isReplyModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setInModalAlert(null);
          setIsReplyModalVisible(false);
        }}
      >
        <View style={[styles.modalHeaderSafeArea, { paddingTop: modalTopPadding }]}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setIsReplyModalVisible(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.modalHeaderIconBtn}
            >
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Phản Hồi & Bổ Sung Thông Tin</Text>

            <TouchableOpacity onPress={handleSubmitReply} style={styles.modalHeaderIconBtn}>
              <Text style={styles.modalHeaderSubmit}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SafeAreaView style={styles.modalContainer} edges={['bottom', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.inputLabel}>Nội dung phản hồi / Giải trình bổ sung (*)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Nhập thông tin bổ sung hoặc giải trình cho bộ phận hỗ trợ..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={replyMessage}
              onChangeText={setReplyMessage}
            />

            <View style={styles.imageLabelRow}>
              <Text style={styles.inputLabel}>Ảnh bằng chứng bổ sung (Hóa đơn, ảnh lỗi...)</Text>
              <Text style={styles.imageCountText}>{replyImageUris.length}/3 ảnh</Text>
            </View>

            <View style={styles.proofGridContainer}>
              {replyImageUris.map((uri, index) => (
                <View key={index} style={styles.proofPreviewWrapper}>
                  <Image source={{ uri }} style={styles.proofPreviewImg} />
                  <TouchableOpacity 
                    style={styles.removeProofBtn} 
                    onPress={() => handleRemoveReplyImage(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="close" size={14} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}

              {replyImageUris.length < 3 && (
                <TouchableOpacity style={styles.uploadProofBtn} onPress={handlePickReplyImage}>
                  <MaterialIcons name="add-a-photo" size={22} color={COLORS.primary} />
                  <Text style={styles.uploadProofText}>Tải ảnh lên</Text>
                </TouchableOpacity>
              )}
            </View>

            <Button
              title={submittingReply ? "Đang gửi..." : "Gửi Phản Hồi & Bổ Sung"}
              variant="primary"
              style={{ marginTop: SPACING.xl }}
              onPress={handleSubmitReply}
              disabled={submittingReply}
              loading={submittingReply}
            />
          </ScrollView>
        </SafeAreaView>

        {inModalAlert && isReplyModalVisible && (
          <ConfirmModal
            visible={!!inModalAlert}
            title={inModalAlert.title}
            message={inModalAlert.message}
            confirmText={inModalAlert.confirmText || 'Đóng'}
            icon={inModalAlert.icon}
            iconColor={inModalAlert.iconColor}
            onConfirm={() => {
              const cb = inModalAlert.onConfirm;
              setInModalAlert(null);
              if (cb) cb();
            }}
            useViewOverlay={true}
          />
        )}
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
  modalHeaderSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  modalHeaderIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
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
  imageLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  imageCountText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  proofGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  uploadProofBtn: {
    width: 90,
    height: 90,
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
    fontSize: 11,
    color: COLORS.primary,
  },
  proofPreviewWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
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
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

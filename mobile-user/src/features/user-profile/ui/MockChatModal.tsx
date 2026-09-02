import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PublicUserProfile } from '../../../entities/user';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar } from '../../../shared/ui';

export interface MockChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
  isMatchInvite?: boolean;
  matchData?: {
    sportName: string;
    timeSlot: string;
    status: 'pending' | 'accepted';
  };
}

interface MockChatModalProps {
  visible: boolean;
  profile?: PublicUserProfile;
  user?: any;
  initialMatchInvite?: { sportName: string; timeSlot: string } | null;
  onClose: () => void;
  onOpenProfile?: (userId: string) => void;
}

export const MockChatModal = React.memo(({
  visible,
  profile,
  user,
  initialMatchInvite,
  onClose,
  onOpenProfile,
}: MockChatModalProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 24);

  // Normalize user / profile prop safely
  const chatUser = useMemo(() => {
    if (profile) return profile;
    if (user) {
      return {
        id: user.id || 'user-default',
        fullName: user.name || user.fullName || 'Người dùng Sporta',
        avatarUrl: user.avatar || user.avatarUrl || null,
        handle: user.handle || '@user',
        isVerified: true,
      };
    }
    return {
      id: 'user-default',
      fullName: 'Người dùng Sporta',
      avatarUrl: null,
      handle: '@user',
      isVerified: true,
    };
  }, [profile, user]);

  const [messages, setMessages] = useState<MockChatMessage[]>([
    {
      id: 'm-1',
      sender: 'other',
      text: `Chào bạn! Mình là ${chatUser.fullName}. Rất vui được kết nối giao lưu thể thao trên Sporta! 🏸⚽`,
      timestamp: '15:20',
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  // If new match invite was sent, prepend to state
  useEffect(() => {
    if (initialMatchInvite) {
      const inviteMsg: MockChatMessage = {
        id: `m-invite-${Date.now()}`,
        sender: 'me',
        text: `LỜI MỜI THI ĐẤU GIAO LƯU`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isMatchInvite: true,
        matchData: {
          sportName: initialMatchInvite.sportName,
          timeSlot: initialMatchInvite.timeSlot,
          status: 'pending',
        },
      };
      setMessages((prev) => [...prev, inviteMsg]);
    }
  }, [initialMatchInvite]);

  const [inputText, setInputText] = useState('');

  const QUICK_PROMPTS = [
    '⚽ Cáp kèo bóng đá',
    '🏸 Giao lưu Cầu lông',
    '🏓 Thách đấu Pickleball',
    '⏰ Tối nay 19:30 rảnh không?',
    '👍 Ok chốt kèo nhé!',
  ];

  const sendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: MockChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'me',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Friendly mock auto-reply after 1s
    setTimeout(() => {
      const replyMsg: MockChatMessage = {
        id: `m-reply-${Date.now()}`,
        sender: 'other',
        text: 'Cảm ơn bạn đã nhắn tin! Mình đã nhận được tin nhắn và sẽ cáp kèo giao lưu với bạn sớm nhất nhé! 🏅',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);
  };

  const handleAcceptMatchInvite = (msgId: string, sportName: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId && msg.matchData
          ? { ...msg, matchData: { ...msg.matchData, status: 'accepted' } }
          : msg
      )
    );

    // Close chat and navigate to court booking screen for selected sport
    onClose();
    router.push({
      pathname: '/search',
      params: { sport: sportName },
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.safeArea, { paddingTop: topPadding }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          {/* ── Messenger Top Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onClose}>
              <Ionicons name="chevron-back" size={26} color={COLORS.onSurface} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerUserRow}
              activeOpacity={0.8}
              onPress={() => {
                if (onOpenProfile) onOpenProfile(chatUser.id);
              }}
            >
              <View style={styles.avatarWrapper}>
                <Avatar size={40} source={chatUser.avatarUrl} fallbackType="user" />
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.headerTextGroup}>
                <View style={styles.nameRow}>
                  <Text style={styles.headerName} numberOfLines={1}>
                    {chatUser.fullName}
                  </Text>
                  {chatUser.isVerified && (
                    <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />
                  )}
                </View>
                <Text style={styles.headerStatusText}>Đang hoạt động trên Sporta</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoButton}
              activeOpacity={0.7}
              onPress={() => {
                if (onOpenProfile) onOpenProfile(chatUser.id);
              }}
            >
              <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Chat Messages Scroll ── */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {/* System Security Notice */}
            <View style={styles.systemNotice}>
              <Ionicons name="shield-checkmark" size={15} color={COLORS.primary} />
              <Text style={styles.systemNoticeText}>
                Khung chat thể thao bảo mật. Hãy trao đổi văn minh & tôn trọng bạn tập!
              </Text>
            </View>

            {/* Date Divider Pill */}
            <View style={styles.dateDividerWrapper}>
              <View style={styles.dateDividerPill}>
                <Text style={styles.dateDividerText}>Hôm nay</Text>
              </View>
            </View>

            {/* Messages Loop */}
            {messages.map((msg) => {
              const isMe = msg.sender === 'me';

              // Render Match Invite Rich Card inside Chat
              if (msg.isMatchInvite && msg.matchData) {
                const isAccepted = msg.matchData.status === 'accepted';
                return (
                  <View key={msg.id} style={styles.matchInviteCardWrapper}>
                    <View style={styles.matchCard}>
                      <View style={styles.matchCardHeader}>
                        <View style={styles.sportBadgeCircle}>
                          <Ionicons name="trophy" size={16} color="#FFFFFF" />
                        </View>
                        <Text style={styles.matchCardTitle}>LỜI MỜI THI ĐẤU GIAO LƯU</Text>
                      </View>

                      <View style={styles.matchCardBody}>
                        <Text style={styles.matchSportName}>{msg.matchData.sportName}</Text>
                        <View style={styles.matchTimeRow}>
                          <Ionicons name="time-outline" size={15} color={COLORS.primary} />
                          <Text style={styles.matchTimeText}>{msg.matchData.timeSlot}</Text>
                        </View>
                      </View>

                      <View style={styles.matchCardFooter}>
                        <TouchableOpacity
                          style={[styles.acceptBtn, isAccepted && styles.acceptedBtn]}
                          disabled={isAccepted}
                          activeOpacity={0.85}
                          onPress={() => handleAcceptMatchInvite(msg.id, msg.matchData!.sportName)}
                        >
                          <Ionicons
                            name={isAccepted ? 'checkmark-done' : 'flash'}
                            size={15}
                            color="#FFFFFF"
                          />
                          <Text style={styles.acceptBtnText}>
                            {isAccepted ? 'Đã đồng ý • Chuyển sang đặt sân' : 'Đồng ý & Đặt sân ngay'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }

              // Standard Text Message Bubbles (Messenger Style)
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubbleWrapper,
                    isMe ? styles.myMsgWrapper : styles.otherMsgWrapper,
                  ]}
                >
                  {!isMe && (
                    <Image source={{ uri: chatUser.avatarUrl }} style={styles.bubbleAvatar} />
                  )}
                  <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.otherMsgText]}>
                      {msg.text}
                    </Text>
                    <Text style={[styles.timestamp, isMe ? styles.timeMe : styles.timeOther]}>
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* ── Quick Sport Prompts Toolbar ── */}
          <View style={styles.quickPromptsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsContent}
            >
              {QUICK_PROMPTS.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptChip}
                  activeOpacity={0.75}
                  onPress={() => sendMessage(prompt)}
                >
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── Pure Text Input Toolbar (Messenger / Zalo Style) ── */}
          <View style={styles.inputToolbarContainer}>
            <View style={styles.inputCapsule}>
              <TextInput
                style={styles.textInput}
                placeholder={`Nhắn tin cho ${chatUser.fullName}...`}
                placeholderTextColor={COLORS.outline}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => sendMessage(inputText)}
                returnKeyType="send"
                multiline={false}
              />
            </View>

            {/* Dynamic Send / Like Button */}
            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={styles.sendCircleBtn}
                activeOpacity={0.8}
                onPress={() => sendMessage(inputText)}
              >
                <Ionicons name="paper-plane" size={17} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.likeQuickBtn}
                activeOpacity={0.7}
                onPress={() => sendMessage('👍')}
              >
                <Text style={styles.likeEmojiText}>👍</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* ── Messenger Top Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  backButton: {
    padding: 4,
    marginRight: 4,
  },
  headerUserRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceDim,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  headerTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  headerStatusText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 1,
  },
  infoButton: {
    padding: 6,
  },

  /* ── Chat Messages Scroll ── */
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    gap: 10,
  },
  systemNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    gap: 6,
  },
  systemNoticeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  dateDividerWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  dateDividerPill: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  dateDividerText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10.5,
    color: COLORS.grayText,
  },

  /* ── Message Bubbles (Messenger Style) ── */
  messageBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  myMsgWrapper: {
    justifyContent: 'flex-end',
  },
  otherMsgWrapper: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  msgText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    lineHeight: 20,
  },
  myMsgText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  otherMsgText: {
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  timestamp: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 9.5,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timeOther: {
    color: COLORS.grayText,
  },

  /* ── Match Invite Rich Card ── */
  matchInviteCardWrapper: {
    alignItems: 'center',
    marginVertical: 6,
  },
  matchCard: {
    width: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryOpacity15,
    padding: SPACING.md,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  matchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchCardTitle: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  matchCardBody: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    gap: 4,
  },
  matchSportName: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 16,
    color: COLORS.onSurface,
  },
  matchTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchTimeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.primary,
  },
  matchCardFooter: {
    marginTop: 2,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.default,
    gap: 6,
  },
  acceptedBtn: {
    backgroundColor: '#10B981',
  },
  acceptBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* ── Quick Sport Prompts Toolbar ── */
  quickPromptsWrapper: {
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  quickPromptsContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  promptChip: {
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  promptChipText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.primary,
  },

  /* ── Pure Text Input Toolbar ── */
  inputToolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    gap: 10,
  },
  inputCapsule: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  textInput: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
    padding: 0,
  },
  sendCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeQuickBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeEmojiText: {
    fontSize: 24,
  },
});

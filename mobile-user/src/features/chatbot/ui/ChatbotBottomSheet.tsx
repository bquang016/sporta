import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
  Keyboard,
  Easing,
  KeyboardEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ChatMessageBubble } from './ChatMessageBubble';
import { VenueCardMessage } from './VenueCardMessage';
import { QuickPromptChips } from './QuickPromptChips';
import { TypingIndicator } from './TypingIndicator';
import { VenueDetailModal } from '../../../features/venue-detail';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY, SPACING } from '../../../shared/config/theme';

import * as SecureStore from 'expo-secure-store';
import { getBaseUrl } from '../../../shared/api/config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.84;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  cards?: any[];
}

export interface ChatbotBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ChatbotBottomSheet: React.FC<ChatbotBottomSheetProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const keyboardHeightAnim = useRef(new Animated.Value(0)).current;

  const DEFAULT_QUICK_REPLIES = [
    'Tìm sân đá bóng gần đây',
    'Ghép kèo bóng đá tối nay',
    'Tìm đối thủ Pickleball',
    'Sân cầu lông giá rẻ',
  ];

  const INITIAL_MESSAGES: Message[] = [
    {
      id: 'welcome',
      text: 'Xin chào! Mình là Sporta AI ✨ Mình có thể giúp bạn tìm sân bóng, sân cầu lông/pickleball còn trống hoặc tìm đối thủ ghép kèo giao hữu. Bạn cần hỗ trợ gì hôm nay?',
      isUser: false,
    },
  ];

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);
  const [selectedVenueIdForModal, setSelectedVenueIdForModal] = useState<string | null>(null);
  const [isVenueModalVisible, setIsVenueModalVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const sessionIdRef = useRef('session-' + Date.now());
  const lastTokenRef = useRef<string | null>(null);

  const handleResetChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setQuickReplies(DEFAULT_QUICK_REPLIES);
    sessionIdRef.current = 'session-' + Date.now();
  }, []);

  // Check and reset conversation when switching user account
  useEffect(() => {
    if (visible) {
      const checkUserSession = async () => {
        let token = '';
        if (Platform.OS === 'web') {
          token = localStorage.getItem('accessToken') || '';
        } else {
          token = (await SecureStore.getItemAsync('accessToken')) || '';
        }

        if (lastTokenRef.current !== null && lastTokenRef.current !== token) {
          // Token changed (User logged in with a different account or logged out)
          console.log('[Chatbot] Account changed detected, resetting chat session...');
          handleResetChat();
        }
        lastTokenRef.current = token;
      };
      checkUserSession();
    }
  }, [visible, handleResetChat]);

  // Smooth synchronized keyboard tracking with exact easing
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e: KeyboardEvent) => {
      const targetHeight = e.endCoordinates ? e.endCoordinates.height : 280;
      const duration = Platform.OS === 'ios' ? (e.duration || 250) : 180;

      Animated.timing(keyboardHeightAnim, {
        toValue: Platform.OS === 'ios' ? Math.max(0, targetHeight - 14) : targetHeight,
        duration: duration,
        easing: Platform.OS === 'ios' ? Easing.bezier(0.33, 1, 0.68, 1) : Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    };

    const onKeyboardHide = (e: KeyboardEvent) => {
      const duration = Platform.OS === 'ios' ? (e.duration || 250) : 180;

      Animated.timing(keyboardHeightAnim, {
        toValue: 0,
        duration: duration,
        easing: Platform.OS === 'ios' ? Easing.bezier(0.33, 1, 0.68, 1) : Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeightAnim]);

  // Entrance and Exit Animations matching VenueDetailModal
  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 75,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [backdropOpacity, translateY, onClose]);

  // Swipe-down pan responder for top handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderGrant: () => {
        Keyboard.dismiss();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.6) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleActionPress = (id: string, cardType?: string, action: 'detail' | 'book' = 'detail') => {
    console.log('[Chatbot] Action pressed for card ID:', id, 'Type:', cardType, 'Action:', action);
    Keyboard.dismiss();

    if (cardType === 'match_room' || cardType === 'partner') {
      handleClose();
      if (id && id !== 'all' && !id.startsWith('u')) {
        router.push(`/matchmaking/${id}` as any);
      } else {
        router.push('/matchmaking' as any);
      }
    } else if (cardType === 'club') {
      handleClose();
      if (id) {
        router.push(`/club-detail-explore/${id}` as any);
      } else {
        router.push('/matchmaking' as any);
      }
    } else {
      // Default: Venue
      if (action === 'book') {
        handleClose();
        if (id) {
          router.push(`/booking/${id}` as any);
        }
      } else {
        // Open rich VenueDetailModal for overview (images, facilities, location, rules, reviews)
        if (id) {
          setSelectedVenueIdForModal(id);
          setIsVenueModalVisible(true);
        }
      }
    }
  };

  const handleSend = async (text: string) => {
    if (!text || !text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setQuickReplies([]);

    try {
      let token = '';
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken') || '';
      } else {
        token = (await SecureStore.getItemAsync('accessToken')) || '';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiUrl = `${getBaseUrl()}/chat`;
      console.log('[Chatbot] Sending message to:', apiUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId: sessionIdRef.current, message: text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('[Chatbot] Server error:', response.status, errText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Chatbot] Response received:', data);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.replyText || '',
        isUser: false,
        cards: data.cards || [],
      };

      setMessages((prev) => [...prev, botMsg]);
      if (data.quickReplies) setQuickReplies(data.quickReplies);
    } catch (error: any) {
      console.error('[Chatbot] Error in handleSend:', error);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        text:
          error.name === 'AbortError'
            ? 'Xin lỗi, kết nối quá hạn. Bạn thử lại nhé!'
            : error.message === 'Rate limit exceeded'
            ? 'Bạn thao tác hơi nhanh, vui lòng chờ một chút nhé!'
            : 'Xin lỗi, mình đang gặp sự cố, bạn thử lại sau nhé.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    return (
      <View style={{ marginBottom: SPACING.xs }}>
        {item.text ? <ChatMessageBubble message={item.text} isUser={item.isUser} /> : null}
        {item.cards &&
          item.cards.map((card, idx) => (
            <VenueCardMessage
              key={`${item.id}-${idx}`}
              card={card}
              onActionPress={(id, cardType, action) => handleActionPress(id, cardType, action)}
            />
          ))}
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleClose}
            />
          </Animated.View>

          {/* Sliding Sheet Container */}
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            {/* Header with Drag Gesture Handler */}
            <View style={styles.header} {...panResponder.panHandlers}>
              <View style={styles.handleIndicator} />
              <View style={styles.headerRow}>
                <View style={styles.brandRow}>
                  <View style={styles.avatarBadge}>
                    <Ionicons name="sparkles" size={16} color={COLORS.secondary} />
                  </View>
                  <View>
                    <View style={styles.titleWithStatus}>
                      <Text style={styles.headerTitle}>Sporta AI Assistant</Text>
                      <View style={styles.statusPill}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Sẵn sàng</Text>
                      </View>
                    </View>
                    <Text style={styles.headerSubtitle}>Trợ lý tìm sân & ghép kèo thông minh</Text>
                  </View>
                </View>
                <View style={styles.headerRightActions}>
                  <TouchableOpacity 
                    onPress={handleResetChat} 
                    style={styles.headerIconBtn} 
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Làm mới đoạn chat"
                  >
                    <Ionicons name="refresh" size={17} color={COLORS.outline} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleClose} 
                    style={styles.headerIconBtn} 
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Đóng"
                  >
                    <Ionicons name="close" size={20} color={COLORS.outline} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Smooth Keyboard-Adjusted Content */}
            <Animated.View style={[styles.sheetContent, { paddingBottom: keyboardHeightAnim }]}>
              {/* Chat message list */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              />

              {isLoading && <TypingIndicator />}

              {!isLoading && <QuickPromptChips prompts={quickReplies} onSelect={handleSend} />}

              {/* Input Footer */}
              <View style={styles.inputBar}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tìm sân trống, ghép kèo đối thủ, CLB..."
                    placeholderTextColor={COLORS.outline}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={() => handleSend(inputText)}
                    returnKeyType="send"
                    onFocus={() => {
                      setTimeout(() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                      }, 50);
                    }}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                  onPress={() => handleSend(inputText)}
                  disabled={!inputText.trim()}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={inputText.trim() ? COLORS.onSecondary : 'rgba(0, 53, 39, 0.4)'}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>

      {/* ── Venue Detail Overview Modal from AI recommendation ── */}
      {selectedVenueIdForModal && (
        <VenueDetailModal
          visible={isVenueModalVisible}
          venueId={selectedVenueIdForModal}
          onClose={() => {
            setIsVenueModalVisible(false);
            setSelectedVenueIdForModal(null);
          }}
          onBookNow={(venueId: string) => {
            setIsVenueModalVisible(false);
            setSelectedVenueIdForModal(null);
            handleClose();
            router.push(`/booking/${venueId}` as any);
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 30, 24, 0.55)', // Deep Emerald tinted dark overlay
  },
  sheetContainer: {
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.background, // #F9F9FF
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 25,
    overflow: 'hidden',
  },
  sheetContent: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: 'center',
  },
  handleIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.outlineVariant,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadge: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary, // Deep Emerald
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(254, 208, 27, 0.5)',
  },
  titleWithStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginRight: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xl,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  statusText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingVertical: SPACING.md,
    paddingBottom: 16,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  textInput: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 15,
    color: COLORS.onSurface,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary, // Athletic Gold button
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
});



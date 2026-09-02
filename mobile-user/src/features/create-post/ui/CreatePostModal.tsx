import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { uploadImageApi } from '../../../shared/api/upload';
import { getJoinedClubsApi } from '../../../shared/api/clubs';
import { MatchmakingApiRepository } from '../../../shared/api/matchmaking';
import { usersApi, UserProfileDto } from '../../../shared/api/users';
import { MatchRoomVM } from '../../../entities/match/model/match.types';
import { Post, PostAudience, POST_BACKGROUNDS, PostBackground } from '../../../entities/post';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar } from '../../../shared/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COOLDOWN_DURATION_MS = 30 * 60 * 1000; // 30 phút
const COOLDOWN_STORAGE_KEY = '@sporta_match_cooldowns';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<Post> & Record<string, any>) => void;
  initialMode?: 'COMMUNITY' | 'MATCH_FINDING';
  currentUser?: any;
}

interface SportOption {
  id: string;
  name: string;
  iconName: any;
  iconLib: 'ionicons' | 'material';
}

const SPORTS_TAG_OPTIONS: SportOption[] = [
  { id: 'football', name: 'Đá bóng', iconName: 'football-outline', iconLib: 'ionicons' },
  { id: 'pickleball', name: 'Pickleball', iconName: 'tennisball-outline', iconLib: 'ionicons' },
  { id: 'basketball', name: 'Bóng rổ', iconName: 'basketball-outline', iconLib: 'ionicons' },
  { id: 'badminton', name: 'Cầu lông', iconName: 'badminton', iconLib: 'material' },
];

/**
 * Kiểm tra xem lịch thi đấu của trận đấu có ở tương lai hay không
 */
function isMatchInFuture(booking?: { date?: string; startTime?: string; endTime?: string }): boolean {
  if (!booking || !booking.date) return false;
  const dateStr = booking.date.trim();
  const timeStr = (booking.endTime || booking.startTime || '23:59').trim();

  try {
    const numbers = dateStr.match(/\d+/g);
    if (!numbers || numbers.length < 3) return false;

    let year = 0;
    let month = 0;
    let day = 0;

    if (numbers[0].length === 4) {
      year = parseInt(numbers[0], 10);
      month = parseInt(numbers[1], 10) - 1;
      day = parseInt(numbers[2], 10);
    } else if (numbers[2].length === 4) {
      year = parseInt(numbers[2], 10);
      month = parseInt(numbers[1], 10) - 1;
      day = parseInt(numbers[0], 10);
    } else {
      return false;
    }

    const timeParts = timeStr.split(':');
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;

    const matchEnd = new Date(year, month, day, hours, minutes, 0);
    return matchEnd.getTime() > Date.now();
  } catch {
    return false;
  }
}

export const CreatePostModal = React.memo(({
  visible,
  onClose,
  onSubmitPost,
  initialMode = 'COMMUNITY',
  currentUser,
}: CreatePostModalProps) => {
  if (!visible) return null;

  return (
    <CreatePostModalContent
      visible={visible}
      onClose={onClose}
      onSubmitPost={onSubmitPost}
      initialMode={initialMode}
      currentUser={currentUser}
    />
  );
});

function CreatePostModalContent({
  visible,
  onClose,
  onSubmitPost,
  initialMode,
  currentUser,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<Post> & Record<string, any>) => void;
  initialMode: 'COMMUNITY' | 'MATCH_FINDING';
  currentUser?: any;
}) {
  const router = useRouter();

  // Mode: COMMUNITY | MATCH_FINDING
  const [postMode, setPostMode] = useState<'COMMUNITY' | 'MATCH_FINDING'>(initialMode);
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<PostAudience>('PUBLIC');
  const [selectedClub, setSelectedClub] = useState<{ id: string; name: string; avatarUrl: string } | null>(null);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);

  // Sport Tag
  const [selectedSportTag, setSelectedSportTag] = useState<string | null>(null);
  const [showSportPicker, setShowSportPicker] = useState(false);

  // Background Template Selection (Facebook Style)
  const [selectedBackground, setSelectedBackground] = useState<PostBackground | null>(null);

  // Match Finding State
  const [myOpenRooms, setMyOpenRooms] = useState<MatchRoomVM[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<MatchRoomVM | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [cooldownMap, setCooldownMap] = useState<Record<string, number>>({});
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  // Audience Menu
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState<Array<{ id: string; name: string; avatarUrl: string }>>([]);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch User Profile on visible
  useEffect(() => {
    if (!visible) return;
    let isMounted = true;
    usersApi.getProfile()
      .then((profile) => {
        if (isMounted && profile) setUserProfile(profile);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [visible]);

  // Fetch Cooldown Map
  const loadCooldowns = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(COOLDOWN_STORAGE_KEY);
      if (raw) {
        setCooldownMap(JSON.parse(raw));
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadCooldowns();
  }, [loadCooldowns]);

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch User's Open Matchmaking Rooms
  const loadMyOpenRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const matches = await MatchmakingApiRepository.listMyMatches();
      const openMatches = (matches || []).filter((m) => {
        if (m.status !== 'OPEN') return false;
        if (m.guestClub) return false;
        if (!isMatchInFuture(m.booking)) return false;
        return true;
      });

      setMyOpenRooms(openMatches);
      if (openMatches.length > 0) {
        setSelectedRoom(openMatches[0]);
      } else {
        setSelectedRoom(null);
      }
    } catch (err) {
      console.log('Error loading my matches for post:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (visible && postMode === 'MATCH_FINDING') {
      loadMyOpenRooms();
    }
  }, [visible, postMode, loadMyOpenRooms]);

  // Fetch Joined Clubs with proper avatar mapping
  useEffect(() => {
    if (!visible) return;
    let isMounted = true;
    const fetchClubs = async () => {
      try {
        const clubs = await getJoinedClubsApi();
        if (isMounted && Array.isArray(clubs)) {
          setJoinedClubs(
            clubs.map((c) => ({
              id: String(c.id),
              name: c.name,
              avatarUrl:
                c.avatarImage ||
                c.avatarUrl ||
                c.logoUrl ||
                c.logo ||
                'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200',
            }))
          );
        }
      } catch (err) {
        console.log('Error loading joined clubs:', err);
      }
    };
    fetchClubs();
    return () => { isMounted = false; };
  }, [visible]);

  const getRemainingCooldownSec = (roomId: string): number => {
    const sharedAt = cooldownMap[roomId];
    if (!sharedAt) return 0;
    const elapsed = nowTimestamp - sharedAt;
    return Math.max(0, Math.ceil((COOLDOWN_DURATION_MS - elapsed) / 1000));
  };

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets) {
        const newUris = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => [...prev, ...newUris].slice(0, 5));
        setSelectedBackground(null);
      }
    } catch (err) {
      console.log('Error picking images:', err);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectBackground = (bg: PostBackground | null) => {
    setSelectedBackground(bg);
    if (bg) {
      setSelectedImages([]);
    }
  };

  const selectedRoomRemainingSec = selectedRoom ? getRemainingCooldownSec(String(selectedRoom.id)) : 0;
  const isSelectedRoomLocked = selectedRoomRemainingSec > 0;

  const isSubmitDisabled =
    isUploading ||
    (postMode === 'COMMUNITY' && !content.trim() && selectedImages.length === 0) ||
    (postMode === 'MATCH_FINDING' && (!selectedRoom || isSelectedRoomLocked));

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    setIsUploading(true);
    try {
      let uploadedMediaUrls: string[] = [];
      if (selectedImages.length > 0) {
        for (const uri of selectedImages) {
          if (uri.startsWith('http')) {
            uploadedMediaUrls.push(uri);
          } else {
            const uploadedUrl = await uploadImageApi(uri);
            uploadedMediaUrls.push(uploadedUrl);
          }
        }
      }

      if (postMode === 'COMMUNITY') {
        const postData: Partial<Post> & Record<string, any> = {
          content: content.trim(),
          mediaUrls: uploadedMediaUrls,
          backgroundGradient: selectedBackground ? [...selectedBackground.colors] : undefined,
          backgroundId: selectedBackground ? selectedBackground.id : undefined,
          type: 'COMMUNITY',
          audience,
          clubId: selectedClub ? selectedClub.id : undefined,
          clubInfo: selectedClub || undefined,
          sportName: selectedSportTag || undefined,
        };
        onSubmitPost(postData);
        onClose();
      } else {
        if (!selectedRoom) return;

        const booking = selectedRoom.booking;
        const guestShare = selectedRoom.guestSharePercent || 50;
        const totalFee = booking?.totalPrice || 0;
        const guestAmount = Math.round((totalFee * guestShare) / 100);

        const defaultCaption = content.trim() ||
          `Kèo ghép trận ${booking?.sportName || 'thể thao'} tại ${booking?.facilityName || 'sân đấu'} - ${booking?.courtName || 'sân'}! Cần tìm đối thủ giao lưu vui vẻ hoặc tranh hạng!`;

        const postData: Partial<Post> & Record<string, any> = {
          content: defaultCaption,
          note: selectedRoom.note,
          mediaUrls: uploadedMediaUrls,
          type: 'MATCH_FINDING',
          audience: 'PUBLIC',
          matchRoomId: String(selectedRoom.id),
          clubInfo: selectedRoom.hostClub
            ? {
                id: String(selectedRoom.hostClub.id),
                name: selectedRoom.hostClub.name,
                avatarUrl:
                  selectedRoom.hostClub.avatarUrl ||
                  (selectedRoom.hostClub as any).avatarImage ||
                  (selectedRoom.hostClub as any).logoUrl ||
                  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200',
              }
            : undefined,
          sportName: booking?.sportName || 'Pickleball',
          venueId: (booking as any)?.venueId || (booking as any)?.facilityId || (selectedRoom as any)?.facilityId,
          venueName: `${booking?.facilityName || 'Sân đấu'} - ${booking?.courtName || 'Sân'}`,
          timeSlot: `${booking?.date || ''} • ${booking?.startTime || ''} - ${booking?.endTime || ''}`,
          playDate: booking?.date,
          startTime: booking?.startTime,
          endTime: booking?.endTime,
          targetLevel:
            selectedRoom.desiredLevels && selectedRoom.desiredLevels.length > 0
              ? selectedRoom.desiredLevels.join(', ')
              : 'Tương đương',
          slotsNeeded: 1,
          totalPrice: totalFee,
          memberFee: `${guestShare}% (${guestAmount.toLocaleString('vi-VN')} đ)`,
          memberFeeAmount: guestAmount,
          currency: 'VND',
        };

        const newCooldowns = { ...cooldownMap, [String(selectedRoom.id)]: Date.now() };
        setCooldownMap(newCooldowns);
        try {
          await AsyncStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(newCooldowns));
        } catch {}

        onSubmitPost(postData);
        onClose();
      }
    } catch (err: any) {
      console.log('Error creating post:', err);
      Alert.alert('Không thể đăng bài', err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsUploading(false);
    }
  };

  const userAvatar = userProfile?.avatarUrl || currentUser?.avatarUrl || null;
  const userName = userProfile?.fullName || currentUser?.name || 'Thành viên Sporta';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* ── 1. Facebook-style Minimal Header ── */}
          <View style={styles.cleanHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>

            {/* Mode Switcher */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentBtn, postMode === 'COMMUNITY' && styles.segmentBtnActive]}
                onPress={() => setPostMode('COMMUNITY')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentBtnText, postMode === 'COMMUNITY' && styles.segmentBtnTextActive]}>
                  Bài viết
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, postMode === 'MATCH_FINDING' && styles.segmentBtnActive]}
                onPress={() => setPostMode('MATCH_FINDING')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentBtnText, postMode === 'MATCH_FINDING' && styles.segmentBtnTextActive]}>
                  Lên kèo
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.postButton, isSubmitDisabled && styles.postButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              activeOpacity={0.8}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.postButtonText, isSubmitDisabled && styles.postButtonTextDisabled]}>
                  Đăng
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={selectedBackground ? { paddingHorizontal: 0 } : { paddingHorizontal: SPACING.md }}
            showsVerticalScrollIndicator={false}
          >
            {/* ── 2. User Info Line ── */}
            <View style={[styles.userSection, selectedBackground && { paddingHorizontal: SPACING.md }]}>
              <Avatar size={42} source={userAvatar} fallbackType="user" />
              <View style={styles.userMetaCol}>
                <Text style={styles.userName}>{userName}</Text>

                {/* Audience Pill */}
                {postMode === 'COMMUNITY' && (
                  <TouchableOpacity
                    style={styles.audiencePill}
                    onPress={() => setShowAudienceMenu(!showAudienceMenu)}
                    activeOpacity={0.7}
                  >
                    {audience === 'PUBLIC' ? (
                      <Ionicons name="globe-outline" size={12} color="#64748B" />
                    ) : selectedClub?.avatarUrl ? (
                      <Image source={{ uri: selectedClub.avatarUrl }} style={styles.pillClubAvatar} />
                    ) : (
                      <Ionicons name="shield-checkmark-outline" size={12} color="#64748B" />
                    )}
                    <Text style={styles.audiencePillText}>
                      {audience === 'PUBLIC'
                        ? 'Công khai'
                        : selectedClub
                        ? selectedClub.name
                        : 'Nội bộ CLB'}
                    </Text>
                    <Ionicons name="chevron-down" size={10} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* ── 3. Audience Dropdown ── */}
            {showAudienceMenu && postMode === 'COMMUNITY' && (
              <View style={[styles.audienceCard, selectedBackground && { marginHorizontal: SPACING.md }]}>
                <TouchableOpacity
                  style={[styles.audienceRow, audience === 'PUBLIC' && styles.audienceRowActive]}
                  onPress={() => {
                    setAudience('PUBLIC');
                    setSelectedClub(null);
                    setShowAudienceMenu(false);
                  }}
                >
                  <Ionicons name="globe-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.audienceRowTitle}>Mọi người (Công khai)</Text>
                  {audience === 'PUBLIC' && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                </TouchableOpacity>

                {joinedClubs.map((club) => {
                  const isSelected = audience === 'CLUB_MEMBERS' && selectedClub?.id === club.id;
                  return (
                    <TouchableOpacity
                      key={`club-aud-${club.id}`}
                      style={[styles.audienceRow, isSelected && styles.audienceRowActive]}
                      onPress={() => {
                        setAudience('CLUB_MEMBERS');
                        setSelectedClub(club);
                        setShowAudienceMenu(false);
                      }}
                    >
                      <Image source={{ uri: club.avatarUrl }} style={styles.miniClubAvatar} />
                      <Text style={styles.audienceRowTitle} numberOfLines={1}>{club.name}</Text>
                      {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ── 4. Mode 1: COMMUNITY Post Form ── */}
            {postMode === 'COMMUNITY' && (
              <View style={styles.contentContainer}>
                {/* Full-width Gradient Canvas when background selected (Facebook Style) */}
                {selectedBackground ? (
                  <LinearGradient
                    colors={selectedBackground.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fullWidthEditorCanvas}
                  >
                    <TextInput
                      style={styles.gradientTextInput}
                      placeholder="Bạn đang nghĩ gì?"
                      placeholderTextColor="rgba(255,255,255,0.7)"
                      multiline
                      value={content}
                      onChangeText={setContent}
                      autoFocus
                      textAlignVertical="center"
                    />
                  </LinearGradient>
                ) : (
                  <TextInput
                    style={styles.cleanTextInput}
                    placeholder="Bạn muốn chia sẻ điều gì hôm nay?"
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={content}
                    onChangeText={setContent}
                    autoFocus
                    textAlignVertical="top"
                  />
                )}

                {/* Selected Sport Tag Badge */}
                {selectedSportTag && (
                  <View style={[styles.selectedSportRow, selectedBackground && { paddingHorizontal: SPACING.md }]}>
                    <View style={styles.activeTagBadge}>
                      <Ionicons name="pricetag" size={12} color={COLORS.primary} />
                      <Text style={styles.activeTagText}>{selectedSportTag}</Text>
                      <TouchableOpacity onPress={() => setSelectedSportTag(null)} hitSlop={8}>
                        <Ionicons name="close-circle" size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Attached Images Grid */}
                {selectedImages.length > 0 && (
                  <View style={[styles.imagesGrid, selectedBackground && { paddingHorizontal: SPACING.md }]}>
                    {selectedImages.map((uri, idx) => (
                      <View key={`img-${idx}`} style={styles.cleanImageWrapper}>
                        <Image source={{ uri }} style={styles.cleanImage} />
                        <TouchableOpacity style={styles.cleanRemoveBtn} onPress={() => removeImage(idx)}>
                          <Ionicons name="close" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Background Swatches Bar (Facebook Style) */}
                {selectedImages.length === 0 && (
                  <View style={[styles.backgroundsBarWrap, selectedBackground && { paddingHorizontal: SPACING.md }]}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.backgroundsScroll}
                    >
                      {/* No background option */}
                      <TouchableOpacity
                        style={[
                          styles.bgSwatch,
                          styles.noBgSwatch,
                          !selectedBackground && styles.noBgSwatchActive,
                        ]}
                        onPress={() => handleSelectBackground(null)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="ban-outline"
                          size={18}
                          color={!selectedBackground ? COLORS.primary : '#64748B'}
                        />
                      </TouchableOpacity>

                      {/* 9 Gradient Swatches */}
                      {POST_BACKGROUNDS.map((bg) => {
                        const isSelected = selectedBackground?.id === bg.id;
                        return (
                          <TouchableOpacity
                            key={`bg-${bg.id}`}
                            style={[
                              styles.bgSwatch,
                              isSelected && styles.bgSwatchActive,
                            ]}
                            onPress={() => handleSelectBackground(bg)}
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={bg.colors}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.bgSwatchGradient}
                            />
                            {isSelected && (
                              <View style={styles.bgCheckmark}>
                                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Sport Picker Row (Collapsible) */}
                {showSportPicker && (
                  <View style={[styles.sportPickerContainer, selectedBackground && { marginHorizontal: SPACING.md }]}>
                    <Text style={styles.sportPickerLabel}>Chọn môn thể thao:</Text>
                    <View style={styles.sportChipsWrap}>
                      {SPORTS_TAG_OPTIONS.map((sport) => {
                        const isSelected = selectedSportTag === sport.name;
                        return (
                          <TouchableOpacity
                            key={`sp-${sport.id}`}
                            style={[styles.cleanSportChip, isSelected && styles.cleanSportChipActive]}
                            onPress={() => {
                              setSelectedSportTag(isSelected ? null : sport.name);
                              setShowSportPicker(false);
                            }}
                            activeOpacity={0.7}
                          >
                            {sport.iconLib === 'material' ? (
                              <MaterialCommunityIcons
                                name={sport.iconName}
                                size={14}
                                color={isSelected ? '#FFFFFF' : COLORS.onSurface}
                              />
                            ) : (
                              <Ionicons
                                name={sport.iconName}
                                size={14}
                                color={isSelected ? '#FFFFFF' : COLORS.onSurface}
                              />
                            )}
                            <Text style={[styles.cleanSportChipText, isSelected && styles.cleanSportChipTextActive]}>
                              {sport.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ── 5. Mode 2: MATCH_FINDING (Open Matches Selection) ── */}
            {postMode === 'MATCH_FINDING' && (
              <View style={styles.matchFindingContainer}>
                <View style={styles.matchSectionHeader}>
                  <Text style={styles.matchHeading}>Chọn kèo đang mở để đăng bài</Text>
                  <Text style={styles.matchSubheading}>
                    Chỉ hiển thị các trận sắp diễn ra và chưa có đối thủ. Mỗi kèo có thời gian chờ 30 phút giữa các lần đăng.
                  </Text>
                </View>

                {loadingRooms ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang tải các phòng đấu của bạn...</Text>
                  </View>
                ) : myOpenRooms.length === 0 ? (
                  <View style={styles.emptyMatchBox}>
                    <View style={styles.emptyIconCircle}>
                      <Ionicons name="tennisball-outline" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Không có kèo nào đang mở</Text>
                    <Text style={styles.emptySub}>
                      Các trận đã kết thúc hoặc đã có đối thủ sẽ không hiển thị ở đây. Hãy tạo kèo mới tại mục Ghép kèo nhé!
                    </Text>
                    <TouchableOpacity
                      style={styles.createRoomCTA}
                      onPress={() => {
                        onClose();
                        router.push('/matchmaking' as any);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                      <Text style={styles.createRoomCTAText}>Tạo phòng ghép kèo mới</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.matchCardsList}>
                    {myOpenRooms.map((room) => {
                      const isSelected = selectedRoom?.id === room.id;
                      const booking = room.booking;
                      const remainingSec = getRemainingCooldownSec(String(room.id));
                      const isLocked = remainingSec > 0;

                      return (
                        <TouchableOpacity
                          key={`room-${room.id}`}
                          style={[
                            styles.cleanRoomCard,
                            isSelected && styles.cleanRoomCardSelected,
                            isLocked && styles.cleanRoomCardLocked,
                          ]}
                          onPress={() => setSelectedRoom(room)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.roomTopRow}>
                            <View style={styles.sportBadge}>
                              <Text style={styles.sportBadgeText}>
                                {booking?.sportName || 'Pickleball'} • {booking?.format || 'Đôi'}
                              </Text>
                            </View>

                            {/* Cooldown Status Badge */}
                            {isLocked ? (
                              <View style={styles.cooldownBadge}>
                                <Ionicons name="time-outline" size={11} color="#D97706" />
                                <Text style={styles.cooldownText}>
                                  Đăng lại sau {formatCountdown(remainingSec)}
                                </Text>
                              </View>
                            ) : (
                              <View style={styles.readyBadge}>
                                <Text style={styles.readyText}>Sẵn sàng chia sẻ</Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.venueName} numberOfLines={1}>
                            {booking?.facilityName} - {booking?.courtName}
                          </Text>

                          <View style={styles.timeRow}>
                            <Ionicons name="calendar-outline" size={12} color="#64748B" />
                            <Text style={styles.timeText}>
                              {booking?.date} • {booking?.startTime} - {booking?.endTime}
                            </Text>
                          </View>

                          <View style={styles.roomFooterRow}>
                            <Text style={styles.levelText}>
                              Trình: {room.desiredLevels?.join(', ') || 'Tương đương'}
                            </Text>
                            <Text style={styles.feeText}>
                              Chia {room.hostSharePercent}% / {room.guestSharePercent}%
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Extra Note for Selected Match */}
                    {selectedRoom && (
                      <View style={styles.matchRoomInputsContainer}>
                        {/* 1. Original Note for Opponents from MatchRoom.java (Read-only Preview) */}
                        {selectedRoom.note ? (
                          <View style={styles.roomNotePreviewBox}>
                            <View style={styles.roomNoteHeaderRow}>
                              <Ionicons name="chatbox-ellipses-outline" size={14} color={COLORS.primary} />
                              <Text style={styles.roomNoteHeaderTitle}>Ghi chú cho đối thủ (từ phòng đấu):</Text>
                            </View>
                            <Text style={styles.roomNoteText}>"{selectedRoom.note}"</Text>
                          </View>
                        ) : null}

                        {/* 2. Post Title / Caption Input */}
                        <View style={styles.postTitleInputWrap}>
                          <Text style={styles.postTitleLabel}>Tiêu đề bài viết chia sẻ lên Bảng tin:</Text>
                          <TextInput
                            style={styles.cleanPostTitleInput}
                            placeholder="Ví dụ: Kèo tối nay cần 1 đối thủ giao lưu nhiệt tình, vào ghép ngay nhé..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            value={content}
                            onChangeText={setContent}
                          />
                        </View>

                        {isSelectedRoomLocked && (
                          <View style={styles.lockNotice}>
                            <Ionicons name="information-circle-outline" size={16} color="#D97706" />
                            <Text style={styles.lockNoticeText}>
                              Kèo này vừa được đăng gần đây. Vui lòng chờ đếm ngược{' '}
                              <Text style={{ fontWeight: '700' }}>{formatCountdown(selectedRoomRemainingSec)}</Text>{' '}
                              để chia sẻ lại.
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>

          {/* ── 6. Bottom Clean Action Bar (Facebook Style) ── */}
          {postMode === 'COMMUNITY' && (
            <View style={styles.bottomActionBar}>
              <TouchableOpacity style={styles.actionIconBtn} onPress={pickImages} activeOpacity={0.7}>
                <Ionicons name="images-outline" size={22} color="#10B981" />
                <Text style={styles.actionIconLabel}>Ảnh/Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => setShowSportPicker(!showSportPicker)}
                activeOpacity={0.7}
              >
                <Ionicons name="pricetag-outline" size={20} color="#6366F1" />
                <Text style={styles.actionIconLabel}>Môn thể thao</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => {
                  if (selectedBackground) {
                    handleSelectBackground(null);
                  } else {
                    handleSelectBackground(POST_BACKGROUNDS[0]);
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="color-palette-outline" size={21} color="#EC4899" />
                <Text style={styles.actionIconLabel}>Phông nền</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cleanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.full,
    padding: 3,
  },
  segmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontWeight: '500',
  },
  segmentBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  postButtonText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  postButtonTextDisabled: {
    color: '#94A3B8',
  },
  scrollBody: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  userMetaCol: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...TYPOGRAPHY.titleSm,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  audiencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  audiencePillText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  audienceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    padding: 6,
    marginBottom: SPACING.md,
  },
  audienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.sm,
    gap: 8,
  },
  audienceRowActive: {
    backgroundColor: '#F0FDF4',
  },
  audienceRowTitle: {
    ...TYPOGRAPHY.bodySm,
    flex: 1,
    color: COLORS.onSurface,
  },
  miniClubAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  contentContainer: {
    paddingBottom: SPACING.md,
  },
  cleanTextInput: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    minHeight: 140,
    padding: 0,
    fontSize: 17,
    lineHeight: 24,
  },
  fullWidthEditorCanvas: {
    width: '100%',
    minHeight: 320,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
  },
  gradientTextInput: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    width: '100%',
    minHeight: 120,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  selectedSportRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  activeTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  activeTagText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  backgroundsBarWrap: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
    marginBottom: 8,
  },
  backgroundsScroll: {
    gap: 10,
    alignItems: 'center',
  },
  bgSwatch: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgSwatchActive: {
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.08 }],
  },
  noBgSwatch: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  noBgSwatchActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
    transform: [{ scale: 1.08 }],
  },
  bgSwatchGradient: {
    width: '100%',
    height: '100%',
  },
  bgCheckmark: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillClubAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  sportPickerContainer: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  sportPickerLabel: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    marginBottom: 6,
  },
  sportChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cleanSportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  cleanSportChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cleanSportChipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurface,
  },
  cleanSportChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  cleanImageWrapper: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  cleanImage: {
    width: '100%',
    height: '100%',
  },
  cleanRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchFindingContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  matchSectionHeader: {
    marginBottom: SPACING.sm,
  },
  matchHeading: {
    ...TYPOGRAPHY.titleSm,
    color: COLORS.onSurface,
    fontSize: 14,
  },
  matchSubheading: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
  },
  emptyMatchBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: 6,
    marginVertical: SPACING.md,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleSm,
    color: COLORS.onSurface,
  },
  emptySub: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  createRoomCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
    marginTop: 8,
  },
  createRoomCTAText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  matchCardsList: {
    gap: 10,
    marginTop: 8,
  },
  cleanRoomCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
  },
  cleanRoomCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  cleanRoomCardLocked: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBEB',
  },
  roomTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sportBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  sportBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: '#334155',
    fontWeight: '600',
    fontSize: 11,
  },
  cooldownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  cooldownText: {
    ...TYPOGRAPHY.labelSm,
    color: '#D97706',
    fontWeight: '700',
    fontSize: 11,
  },
  readyBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  readyText: {
    ...TYPOGRAPHY.labelSm,
    color: '#16A34A',
    fontWeight: '600',
    fontSize: 11,
  },
  venueName: {
    ...TYPOGRAPHY.titleSm,
    color: COLORS.onSurface,
    fontSize: 14,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  timeText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontSize: 11,
  },
  roomFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  levelText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontSize: 11,
  },
  feeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  matchRoomInputsContainer: {
    marginTop: 10,
    gap: 10,
  },
  roomNotePreviewBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  roomNoteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  roomNoteHeaderTitle: {
    ...TYPOGRAPHY.labelSm,
    color: '#475569',
    fontWeight: '700',
    fontSize: 11,
  },
  roomNoteText: {
    ...TYPOGRAPHY.bodySm,
    color: '#334155',
    fontStyle: 'italic',
    fontSize: 12.5,
    lineHeight: 18,
  },
  postTitleInputWrap: {
    marginTop: 2,
  },
  postTitleLabel: {
    ...TYPOGRAPHY.labelSm,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 12,
  },
  cleanPostTitleInput: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurface,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    minHeight: 65,
    fontSize: 13,
  },
  lockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 6,
    gap: 6,
  },
  lockNoticeText: {
    ...TYPOGRAPHY.labelSm,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
    fontSize: 11,
  },
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-around',
  },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionIconLabel: {
    ...TYPOGRAPHY.labelSm,
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
  },
});

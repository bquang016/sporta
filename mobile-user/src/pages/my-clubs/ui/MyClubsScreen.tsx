import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, SearchInput } from '../../../shared/ui';
import { Club, ClubCard, INITIAL_JOINED_CLUBS, SPORTS_FILTERS } from '../../../entities/club';

export function MyClubsScreen() {
  const router = useRouter();
  const [joinedClubs, setJoinedClubs] = useState<Club[]>(INITIAL_JOINED_CLUBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('Tất cả');
  
  // Helper function to render correct sport icon
  const renderSportIcon = (sport: string, size: number, color: string) => {
    switch (sport) {
      case 'Bóng đá':
        return <Ionicons name="football" size={size} color={color} />;
      case 'Bóng rổ':
        return <Ionicons name="basketball" size={size} color={color} />;
      case 'Cầu lông':
        return <MaterialCommunityIcons name="badminton" size={size} color={color} />;
      case 'Pickle ball':
        return <Ionicons name="tennisball" size={size} color={color} />;
      default:
        return <Ionicons name="people" size={size} color={color} />;
    }
  };

  // Full-page Modal state variables
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubSport, setNewClubSport] = useState('Bóng đá');
  const [newClubArea, setNewClubArea] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [memberLimit, setMemberLimit] = useState(25);
  const [memberLimitInput, setMemberLimitInput] = useState('25');
  const [isPrivate, setIsPrivate] = useState(false);

  // Filter logic
  const filteredClubs = joinedClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (club.area && club.area.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSport = selectedSport === 'Tất cả' || club.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const handleDecrement = () => {
    const newVal = Math.max(2, memberLimit - 1);
    setMemberLimit(newVal);
    setMemberLimitInput(newVal.toString());
  };

  const handleIncrement = () => {
    const newVal = Math.min(50, memberLimit + 1);
    setMemberLimit(newVal);
    setMemberLimitInput(newVal.toString());
  };

  const handleCreateClub = () => {
    if (!newClubName.trim()) {
      alert('Vui lòng nhập tên câu lạc bộ!');
      return;
    }
    if (!newClubArea.trim()) {
      alert('Vui lòng nhập khu vực hoạt động!');
      return;
    }
    
    // Ensure final limit is clamped
    let finalLimit = memberLimit;
    if (isNaN(finalLimit) || finalLimit < 2) {
      finalLimit = 2;
    } else if (finalLimit > 50) {
      finalLimit = 50;
    }

    const newClub: Club = {
      id: Date.now().toString(),
      name: newClubName.trim(),
      sport: newClubSport,
      members: 1,
      memberLimit: finalLimit,
      isPrivate: isPrivate,
      area: newClubArea.trim(),
      description: newClubDesc.trim() || 'Chưa có mô tả chi tiết.',
      joined: true
    };

    setJoinedClubs([newClub, ...joinedClubs]);
    
    // Reset form & close modal
    setNewClubName('');
    setNewClubSport('Bóng đá');
    setNewClubArea('');
    setNewClubDesc('');
    setMemberLimit(25);
    setMemberLimitInput('25');
    setIsPrivate(false);
    setIsModalVisible(false);
    
    alert(`Câu lạc bộ "${newClub.name}" đã được tạo thành công!`);
  };

  const renderClubCard = ({ item }: { item: Club }) => (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => router.push({ pathname: '/club/[id]', params: { id: item.id, from: 'my-clubs' } })}
    >
      <ClubCard 
        club={item}
        renderActions={() => (
          <View style={styles.joinedTag}>
            <Ionicons name="checkmark-circle" size={14} color="#2b6954" />
            <Text style={styles.joinedTagText}>Đã tham gia</Text>
          </View>
        )}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Top Header Section with Back Arrow & Create Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#2b6954" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>CLB Của Tôi</Text>
          
          {/* Accent-colored Create Club Button */}
          <Button 
            title="Tạo CLB"
            variant="primary"
            style={styles.createButton}
            textStyle={styles.createButtonText}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={16} color="#191c20" style={styles.createIcon} />
          </Button>
        </View>

        {/* Search Bar - using shared SearchInput */}
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Tìm kiếm câu lạc bộ của bạn..."
          style={styles.searchContainer}
        />

        {/* Sports Filters horizontal list - Pill chips (24px radius) */}
        <View style={styles.filtersWrapper}>
          <FlatList
            data={SPORTS_FILTERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filtersContainer}
            renderItem={({ item }) => {
              const isActive = selectedSport === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedSport(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* List of Joined Clubs */}
        <View style={styles.listContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>Đang tham gia</Text>
            <Text style={styles.listCount}>({filteredClubs.length} CLB)</Text>
          </View>

          {filteredClubs.length > 0 ? (
            <FlatList
              data={filteredClubs}
              keyExtractor={(item) => item.id}
              renderItem={renderClubCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#9CA3AF" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Bạn chưa tham gia câu lạc bộ nào phù hợp.</Text>
            </View>
          )}
        </View>

        {/* Full-Page Create Club Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContainer}
            >
              {/* Full-Page Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  onPress={() => setIsModalVisible(false)}
                  style={styles.modalCloseButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="#2b6954" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Tạo Câu Lạc Bộ</Text>
                <View style={{ width: 32 }} />
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Image Placeholders Section (Cover and Avatar) */}
                <View style={styles.imageSection}>
                  <TouchableOpacity style={styles.coverPlaceholder} activeOpacity={0.8}>
                    <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                    <Text style={styles.coverPlaceholderText}>Chọn ảnh bìa</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.avatarPlaceholder} activeOpacity={0.8}>
                    <View style={styles.avatarInner}>
                      <Ionicons name="camera-outline" size={24} color="#6B7280" />
                      <Text style={styles.avatarPlaceholderText}>Avatar</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                  {/* Name Input */}
                  <Text style={styles.inputLabel}>
                    Tên câu lạc bộ <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="VD: FC Real Madrid Sài Gòn..."
                    placeholderTextColor="#9CA3AF"
                    value={newClubName}
                    onChangeText={setNewClubName}
                  />

                  {/* Sport Choice List */}
                  <Text style={styles.inputLabel}>
                    Chọn môn thể thao <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.sportGridContainer}>
                    {SPORTS_FILTERS.slice(1).map((sport) => {
                      const isSelected = newClubSport === sport;
                      return (
                        <TouchableOpacity
                          key={sport}
                          style={[
                            styles.sportGridBtn,
                            isSelected && styles.sportGridBtnActive
                          ]}
                          onPress={() => setNewClubSport(sport)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.sportGridIconWrapper}>
                            {renderSportIcon(sport, 22, "#064E3B")}
                          </View>
                          <Text style={[
                            styles.sportGridText,
                            isSelected && styles.sportGridTextActive
                          ]}>
                            {sport}
                          </Text>
                          {isSelected && (
                            <Ionicons 
                              name="checkmark-circle" 
                              size={18} 
                              color="#064E3B" 
                              style={styles.checkmarkBadge} 
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Area of Operation Choice (Manual TextInput) */}
                  <Text style={styles.inputLabel}>
                    Khu vực hoạt động <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="VD: Quận 1, Cầu Giấy, Bình Thạnh..."
                    placeholderTextColor="#9CA3AF"
                    value={newClubArea}
                    onChangeText={setNewClubArea}
                  />

                  {/* Description Input (Optional) */}
                  <Text style={styles.inputLabel}>Bio / Mô tả câu lạc bộ</Text>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    placeholder="VD: Giao lưu đá bóng phủi, giao lưu kỹ năng học hỏi... (Không bắt buộc)"
                    placeholderTextColor="#9CA3AF"
                    value={newClubDesc}
                    onChangeText={setNewClubDesc}
                    multiline={true}
                    numberOfLines={4}
                  />

                  {/* Member Limit Stepper Counter (Max 50) */}
                  <View style={styles.stepperSection}>
                    <View style={styles.stepperInfo}>
                      <Text style={styles.inputLabelNoMargin}>Giới hạn thành viên</Text>
                      <Text style={styles.stepperSubtext}>Nhập số hoặc chọn (Tối đa 50)</Text>
                    </View>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity 
                        style={[styles.stepperButton, memberLimit <= 2 && styles.stepperButtonDisabled]} 
                        onPress={handleDecrement}
                        disabled={memberLimit <= 2}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={16} color={memberLimit <= 2 ? "#9CA3AF" : "#2b6954"} />
                      </TouchableOpacity>
                      
                      {/* Clickable Numeric input in the stepper (8px radius) */}
                      <TextInput
                        style={styles.stepperInput}
                        value={memberLimitInput}
                        onChangeText={(text) => {
                          const cleanedText = text.replace(/[^0-9]/g, '');
                          setMemberLimitInput(cleanedText);
                          if (cleanedText) {
                            const val = parseInt(cleanedText, 10);
                            if (!isNaN(val)) {
                              setMemberLimit(val);
                            }
                          }
                        }}
                        onBlur={() => {
                          let val = parseInt(memberLimitInput, 10);
                          if (isNaN(val) || val < 2) {
                            val = 2;
                          } else if (val > 50) {
                            val = 50;
                          }
                          setMemberLimit(val);
                          setMemberLimitInput(val.toString());
                        }}
                        keyboardType="number-pad"
                        selectTextOnFocus={true}
                      />
                      
                      <TouchableOpacity 
                        style={[styles.stepperButton, memberLimit >= 50 && styles.stepperButtonDisabled]} 
                        onPress={handleIncrement}
                        disabled={memberLimit >= 50}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={16} color={memberLimit >= 50 ? "#9CA3AF" : "#2b6954"} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Privacy Mode Selector Cards - 8px radius */}
                  <Text style={styles.inputLabel}>Chế độ riêng tư</Text>
                  <View style={styles.privacyOptionContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.privacyCard, 
                        isPrivate === false && styles.privacyCardActive
                      ]}
                      onPress={() => setIsPrivate(false)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.privacyCardHeader}>
                        <Ionicons name="earth" size={20} color={isPrivate === false ? '#2b6954' : '#6B7280'} />
                        {isPrivate === false && <Ionicons name="checkmark-circle" size={16} color="#2b6954" />}
                      </View>
                      <Text style={styles.privacyCardTitle}>Công khai</Text>
                      <Text style={styles.privacyCardDesc}>Thành viên vào trực tiếp mà không cần duyệt đơn.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.privacyCard, 
                        isPrivate === true && styles.privacyCardActive
                      ]}
                      onPress={() => setIsPrivate(true)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.privacyCardHeader}>
                        <Ionicons name="lock-closed" size={20} color={isPrivate === true ? '#2b6954' : '#6B7280'} />
                        {isPrivate === true && <Ionicons name="checkmark-circle" size={16} color="#2b6954" />}
                      </View>
                      <Text style={styles.privacyCardTitle}>Riêng tư</Text>
                      <Text style={styles.privacyCardDesc}>Người chơi cần nộp đơn và được duyệt để vào.</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Fixed Bottom Action Button */}
              <View style={styles.modalFooterActions}>
                <Button 
                  title="Tạo Câu Lạc Bộ"
                  variant="primary"
                  style={styles.submitButton}
                  textStyle={styles.submitButtonText}
                  onPress={handleCreateClub}
                />
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16, // margin-mobile
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#191c20',
    flex: 1,
    textAlign: 'left',
    marginLeft: 4,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    minHeight: 40,
  },
  createIcon: {
    marginRight: 4,
  },
  createButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#191c20',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 20,
  },
  filtersWrapper: {
    marginBottom: 24,
    marginHorizontal: -16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#c4c7c8', // outline-variant
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24, // chips use 24/pill radius
    marginRight: 8,
    height: 38,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#adedd3', // secondary-container
    borderColor: '#2b6954',
  },
  filterChipText: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: '#444748',
  },
  filterChipTextActive: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#306d58',
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191c20',
  },
  listCount: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 12,
    color: '#444748',
    marginLeft: 6,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
  joinedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 105, 84, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  joinedTagText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#2b6954',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: 'HankenGrotesk-Regular',
    color: '#444748',
    fontSize: 14,
    textAlign: 'center',
  },
  // Full-page Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(43, 105, 84, 0.1)',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2b6954',
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  // Form Styles
  imageSection: {
    width: '100%',
    height: 180,
    marginBottom: 36,
    position: 'relative',
  },
  coverPlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(43, 105, 84, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(43, 105, 84, 0.15)',
  },
  coverPlaceholderText: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
  },
  avatarPlaceholder: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ededf3', // surface-container-low
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#191c20',
    marginBottom: 8,
    marginTop: 16,
  },
  requiredAsterisk: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#ba1a1a',
    fontWeight: 'bold',
  },
  inputLabelNoMargin: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#191c20',
  },
  textInput: {
    fontFamily: 'HankenGrotesk-Regular',
    backgroundColor: '#ededf3', // surface-container-low
    borderRadius: 8, // base component input corners
    paddingHorizontal: 16,
    height: 48,
    color: '#191c20',
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  textAreaInput: {
    height: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  sportGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  sportGridBtn: {
    width: '48.5%',
    height: 84,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#c4c7c8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  sportGridBtnActive: {
    borderColor: '#064E3B',
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
  },
  sportGridIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  sportGridText: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 13,
    color: '#444748',
    fontWeight: '600',
  },
  sportGridTextActive: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#064E3B',
    fontWeight: 'bold',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  // Stepper styles
  stepperSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(43, 105, 84, 0.1)',
  },
  stepperInfo: {
    flex: 1,
  },
  stepperSubtext: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 12,
    color: '#444748',
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ededf3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  stepperValue: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191c20',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  stepperInput: {
    backgroundColor: '#ededf3',
    borderRadius: 8,
    minWidth: 44,
    height: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#191c20',
    marginHorizontal: 8,
  },
  // Privacy styles
  privacyOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
    marginTop: 4,
  },
  privacyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#c4c7c8',
    borderRadius: 8, // base component small cards (8px)
    padding: 16,
    marginHorizontal: 6,
  },
  privacyCardActive: {
    borderColor: '#2b6954',
    backgroundColor: 'rgba(43, 105, 84, 0.02)',
  },
  privacyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  privacyCardTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#191c20',
    marginBottom: 4,
  },
  privacyCardDesc: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 11,
    color: '#444748',
    lineHeight: 15,
  },
  modalFooterActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderColor: 'rgba(43, 105, 84, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    height: 50,
  },
  submitButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#191c20',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

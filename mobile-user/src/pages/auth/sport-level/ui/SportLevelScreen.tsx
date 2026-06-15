import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerUser } from '../../../../shared/api/auth';
import * as SecureStore from 'expo-secure-store';

const SPORTS_LIST = [
  { id: 1, name: 'Bóng đá', icon: 'soccer' },
  { id: 2, name: 'Cầu lông', icon: 'badminton' },
  { id: 3, name: 'Pickleball', icon: 'tennis-ball' },
  { id: 4, name: 'Bóng rổ', icon: 'basketball' },
];

const LEVELS = [
  { id: 'WEAK', label: 'Yếu', desc: 'Mới làm quen, nắm cơ bản luật chơi.' },
  { id: 'WEAK_AVERAGE', label: 'Trung Bình Yếu', desc: 'Có thể chơi được nhưng còn nhiều lỗi kỹ thuật.' },
  { id: 'AVERAGE', label: 'Trung Bình', desc: 'Có thể duy trì nhịp độ và chơi thường xuyên.' },
  { id: 'AVERAGE_GOOD', label: 'Trung bình khá', desc: 'Kỹ năng ổn định, kiểm soát nhịp độ tốt.' },
  { id: 'GOOD', label: 'Khá', desc: 'Nắm vững kỹ thuật, thi đấu ổn định.' }
];

export function SportLevelScreen() {
  const router = useRouter();
  const { registrationToken, email, password, fullName, dateOfBirth, gender } = useLocalSearchParams();

  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [sportLevels, setSportLevels] = useState<Record<number, string>>({});
  const [expandedSport, setExpandedSport] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleExpand = (sportId: number) => {
    setExpandedSport(prev => prev === sportId ? null : sportId);
  };

  const handleLevelChange = (sportId: number, levelId: string) => {
    if (sportLevels[sportId] === levelId) {
      // Bỏ chọn nếu bấm lại vào level đang chọn
      setSelectedSports(selectedSports.filter(id => id !== sportId));
      const newLevels = { ...sportLevels };
      delete newLevels[sportId];
      setSportLevels(newLevels);
    } else {
      if (!selectedSports.includes(sportId)) {
        setSelectedSports([...selectedSports, sportId]);
      }
      setSportLevels({ ...sportLevels, [sportId]: levelId });
    }
  };

  const handleSubmit = async () => {
    if (selectedSports.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một môn thể thao và trình độ tương ứng.');
      return;
    }

    setLoading(true);
    try {
      const sportsPayload = selectedSports.map(sportId => ({
        sportId,
        level: sportLevels[sportId]
      }));

      const payload = {
        registrationToken,
        password,
        fullName,
        dateOfBirth,
        gender,
        sports: sportsPayload
      };

      const response = await registerUser(payload);
      if (Platform.OS === 'web') {
        localStorage.setItem('accessToken', response.accessToken);
      } else {
        await SecureStore.setItemAsync('accessToken', response.accessToken);
      }
      
      if (Platform.OS !== 'web') {
        Alert.alert('Thành công', 'Đăng ký hoàn tất!');
      } else {
        window.alert('Đăng ký hoàn tất!');
      }
      router.replace('/(tabs)');
      
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi lưu thông tin.');
      } else {
        window.alert('Lỗi: ' + (error.message || 'Có lỗi xảy ra khi lưu thông tin.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2A5C43" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sporta</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressTextLeft}>BƯỚC 2 TRÊN 2</Text>
          <Text style={styles.progressTextRight}>100% HOÀN TẤT</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Chọn bộ môn{'\n'}& Trình độ</Text>
        <Text style={styles.subtitle}>
          Giúp chúng tôi kết nối bạn với những người chơi cùng đẳng cấp.
        </Text>

        <View style={styles.sportsList}>
          {SPORTS_LIST.map(sport => {
            const isExpanded = expandedSport === sport.id;
            const isSelected = selectedSports.includes(sport.id);
            const currentLevelId = sportLevels[sport.id];
            const currentLevel = LEVELS.find(l => l.id === currentLevelId);

            return (
              <View key={sport.id} style={[styles.sportCard, isExpanded && styles.sportCardExpanded]}>
                <TouchableOpacity 
                  style={styles.sportHeader} 
                  activeOpacity={0.7} 
                  onPress={() => toggleExpand(sport.id)}
                >
                  <View style={styles.sportHeaderLeft}>
                    <View style={styles.sportIconContainer}>
                      <MaterialCommunityIcons 
                        name={sport.icon as any} 
                        size={28} 
                        color="#2A5C43" 
                      />
                    </View>
                    <View style={styles.sportNameContainer}>
                      <Text style={styles.sportName}>{sport.name}</Text>
                      {isSelected && currentLevel && (
                        <Text style={styles.sportLevelLabel}>{currentLevel.label.toUpperCase()}</Text>
                      )}
                    </View>
                  </View>
                  <MaterialCommunityIcons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="#666" 
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.sportExpandedContent}>
                    {currentLevel ? (
                      <View style={styles.levelQuoteContainer}>
                        <Text style={styles.levelQuoteText}>"{currentLevel.desc}"</Text>
                      </View>
                    ) : (
                      <View style={styles.levelQuoteContainer}>
                        <Text style={styles.levelQuoteText}>"Vui lòng chọn trình độ của bạn"</Text>
                      </View>
                    )}

                    <View style={styles.levelTabsContainer}>
                      {LEVELS.map(level => {
                        const isLevelSelected = currentLevelId === level.id;
                        return (
                          <TouchableOpacity 
                            key={level.id}
                            style={[styles.levelTab, isLevelSelected && styles.levelTabActive]}
                            onPress={() => handleLevelChange(sport.id, level.id)}
                          >
                            <Text style={[styles.levelTabText, isLevelSelected && styles.levelTabTextActive]}>
                              {level.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        <View style={{ height: 50 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>HOÀN TẤT HỒ SƠ</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2A5C43',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2A5C43',
    borderRadius: 2,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTextLeft: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  progressTextRight: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2A5C43',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 10,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: '#4A4A4A',
    marginBottom: 30,
    lineHeight: 22,
  },
  sportsList: {
    marginBottom: 20,
  },
  sportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sportCardExpanded: {
    borderColor: '#E0E0E0',
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  sportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sportNameContainer: {
    justifyContent: 'center',
  },
  sportName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sportLevelLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2A5C43',
    marginTop: 4,
  },
  sportExpandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  levelQuoteContainer: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  levelQuoteText: {
    fontSize: 13,
    color: '#4B5563',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  levelTabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelTab: {
    width: '48%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  levelTabActive: {
    backgroundColor: '#2A5C43',
    borderColor: '#2A5C43',
  },
  levelTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  levelTabTextActive: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: '#F8F9FA',
  },
  submitButton: {
    backgroundColor: '#FFCC00',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
});

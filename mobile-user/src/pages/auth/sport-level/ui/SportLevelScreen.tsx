import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerUser } from '../../../../shared/api/auth';
import * as SecureStore from 'expo-secure-store';

const SPORTS_LIST = [
  { id: 1, name: 'Bóng đá', icon: 'soccer' },
  { id: 2, name: 'Cầu lông', icon: 'badminton' },
  { id: 3, name: 'Pickleball', icon: 'tennis-ball' }, // using tennis as fallback
];

const LEVELS = [
  { id: 'BEGINNER', label: 'Mới chơi', desc: 'Mới làm quen, nắm cơ bản luật chơi.' },
  { id: 'INTERMEDIATE', label: 'Trung bình', desc: 'Có thể duy trì nhịp độ và chơi thường xuyên.' },
  { id: 'ADVANCED', label: 'Khá', desc: 'Nắm vững kỹ thuật, thi đấu ổn định.' },
  { id: 'EXPERT', label: 'Giỏi', desc: 'Trình độ thi đấu cao, chuyên nghiệp.' }
];

export function SportLevelScreen() {
  const router = useRouter();
  const { registrationToken, email, password, fullName, dateOfBirth, gender } = useLocalSearchParams();

  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [sportLevels, setSportLevels] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleSport = (sportId: number) => {
    if (selectedSports.includes(sportId)) {
      setSelectedSports(selectedSports.filter(id => id !== sportId));
      const newLevels = { ...sportLevels };
      delete newLevels[sportId];
      setSportLevels(newLevels);
    } else {
      setSelectedSports([...selectedSports, sportId]);
      setSportLevels({ ...sportLevels, [sportId]: 'BEGINNER' });
    }
  };

  const handleLevelChange = (sportId: number, levelId: string) => {
    setSportLevels({ ...sportLevels, [sportId]: levelId });
  };

  const handleSubmit = async () => {
    if (selectedSports.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một môn thể thao.');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2A5C43" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sporta</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressTextLeft}>BƯỚC 2 TRÊN 2</Text>
          <Text style={styles.progressTextRight}>100% Hoàn tất</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Chọn bộ môn & Trình độ</Text>
        <Text style={styles.subtitle}>
          Giúp chúng tôi kết nối bạn với những người chơi cùng đẳng cấp.
        </Text>

        <View style={styles.sportsGrid}>
          {SPORTS_LIST.map(sport => {
            const isSelected = selectedSports.includes(sport.id);
            return (
              <TouchableOpacity
                key={sport.id}
                style={[styles.sportCard, isSelected && styles.sportCardActive]}
                onPress={() => toggleSport(sport.id)}
              >
                <View style={[styles.sportIconContainer, isSelected && styles.sportIconContainerActive]}>
                  <MaterialCommunityIcons 
                    name={sport.icon as any} 
                    size={30} 
                    color={isSelected ? '#fff' : '#2A5C43'} 
                  />
                </View>
                <Text style={styles.sportName}>{sport.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedSports.map(sportId => {
          const sport = SPORTS_LIST.find(s => s.id === sportId);
          const currentLevelId = sportLevels[sportId];
          const currentLevel = LEVELS.find(l => l.id === currentLevelId);

          return (
            <View key={sportId} style={styles.levelSection}>
              <View style={styles.levelHeader}>
                <MaterialCommunityIcons name="chart-bar" size={20} color="#2A5C43" />
                <Text style={styles.levelTitle}>Trình độ {sport?.name}</Text>
              </View>
              
              <View style={styles.levelQuoteContainer}>
                <Text style={styles.levelQuoteText}>"{currentLevel?.desc}"</Text>
              </View>

              <View style={styles.levelTabsContainer}>
                {LEVELS.map(level => {
                  const isLevelSelected = currentLevelId === level.id;
                  return (
                    <TouchableOpacity 
                      key={level.id}
                      style={[styles.levelTab, isLevelSelected && styles.levelTabActive]}
                      onPress={() => handleLevelChange(sportId, level.id)}
                    >
                      <Text style={[styles.levelTabText, isLevelSelected && styles.levelTabTextActive]}>
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
        
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A5C43',
    marginLeft: 15,
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
    color: '#2A5C43',
  },
  progressTextRight: {
    fontSize: 10,
    color: '#2A5C43',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sportCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sportCardActive: {
    borderColor: '#2A5C43',
    backgroundColor: '#F0F9F5',
  },
  sportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sportIconContainerActive: {
    backgroundColor: '#2A5C43',
  },
  sportName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  levelSection: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2A5C43',
    marginLeft: 10,
  },
  levelQuoteContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  levelQuoteText: {
    fontSize: 13,
    color: '#2A5C43',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  levelTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  levelTab: {
    width: '48%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  levelTabActive: {
    backgroundColor: '#2A5C43',
    borderColor: '#2A5C43',
  },
  levelTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  levelTabTextActive: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#FFCC00',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

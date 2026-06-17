import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerUser } from '../../../../shared/api/auth';
import * as SecureStore from 'expo-secure-store';

import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';

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
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')} 
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
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
                        color={COLORS.primary} 
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
                    color={COLORS.outline} 
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
        <Button 
          title="HOÀN TẤT HỒ SƠ"
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    color: COLORS.primary,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTextLeft: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: 'bold',
    color: COLORS.outline,
  },
  progressTextRight: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: TYPOGRAPHY.headlineLg.fontFamily,
    fontWeight: TYPOGRAPHY.headlineLg.fontWeight,
    color: COLORS.onSurface,
    marginBottom: 10,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    color: COLORS.onSurfaceVariant,
    marginBottom: 30,
    lineHeight: 22,
  },
  sportsList: {
    marginBottom: 20,
  },
  sportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, // 16px radius for large cards
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sportCardExpanded: {
    borderColor: COLORS.outline,
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
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sportNameContainer: {
    justifyContent: 'center',
  },
  sportName: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    color: COLORS.onSurface,
  },
  sportLevelLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    color: COLORS.primary,
    marginTop: 4,
  },
  sportExpandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  levelQuoteContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  levelQuoteText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    color: COLORS.onSurfaceVariant,
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
    borderColor: COLORS.outlineVariant,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
  },
  levelTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelTabText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: TYPOGRAPHY.labelMd.fontWeight,
    color: COLORS.onSurface,
  },
  levelTabTextActive: {
    color: COLORS.onPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: COLORS.background,
  },
});

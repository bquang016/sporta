import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export function PersonalInfoScreen() {
  const router = useRouter();
  const { registrationToken, email, password } = useLocalSearchParams();

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');

  const handleNext = () => {
    if (!fullName.trim() || !dateOfBirth) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ họ tên và ngày sinh.');
      return;
    }

    const formattedDob = `${dateOfBirth.getFullYear()}-${(dateOfBirth.getMonth() + 1).toString().padStart(2, '0')}-${dateOfBirth.getDate().toString().padStart(2, '0')}`;

    router.push({
      pathname: '/(auth)/sport-level',
      params: {
        registrationToken,
        email,
        password,
        fullName,
        dateOfBirth: formattedDob,
        gender
      }
    });
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2A5C43" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sporta</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressTextLeft}>BƯỚC 1 TRÊN 2</Text>
          <Text style={styles.progressTextRight}>50% Hoàn tất</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Text style={styles.subtitle}>
          Chào mừng bạn! Hãy cho chúng tôi biết một chút về bạn để cá nhân hóa trải nghiệm tập luyện.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Nguyễn Văn A"
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày sinh</Text>
          <TouchableOpacity 
            style={styles.dateInputContainer} 
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateInputText, !dateOfBirth && { color: '#999' }]}>
              {dateOfBirth ? formatDate(dateOfBirth) : 'DD/MM/YYYY'}
            </Text>
            <MaterialCommunityIcons name="calendar-blank-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[styles.genderOption, gender === 'MALE' && styles.genderOptionActive]}
              onPress={() => setGender('MALE')}
            >
              <Text style={[styles.genderText, gender === 'MALE' && styles.genderTextActive]}>Nam</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.genderOption, gender === 'FEMALE' && styles.genderOptionActive]}
              onPress={() => setGender('FEMALE')}
            >
              <Text style={[styles.genderText, gender === 'FEMALE' && styles.genderTextActive]}>Nữ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.genderOption, gender === 'OTHER' && styles.genderOptionActive]}
              onPress={() => setGender('OTHER')}
            >
              <Text style={[styles.genderText, gender === 'OTHER' && styles.genderTextActive]}>Khác</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.securityInfo}>
          <View style={styles.securityIconContainer}>
            <MaterialCommunityIcons name="lock-outline" size={24} color="#fff" />
          </View>
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Bảo mật thông tin</Text>
            <Text style={styles.securityDesc}>
              Thông tin của bạn được mã hóa và chỉ dùng để đề xuất các hoạt động thể thao phù hợp.
            </Text>
          </View>
        </View>

      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Tiếp tục</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    zIndex: 10,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#2A5C43',
    lineHeight: 20,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  genderOption: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: '#2A5C43',
    borderRadius: 10,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  genderTextActive: {
    color: '#fff',
  },
  securityInfo: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  securityIconContainer: {
    backgroundColor: '#2A5C43',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A5C43',
    marginBottom: 4,
  },
  securityDesc: {
    fontSize: 12,
    color: '#2A5C43',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
  },
  nextButton: {
    backgroundColor: '#FFCC00',
    borderRadius: 25,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';

export function PersonalInfoScreen() {
  const router = useRouter();
  const { registrationToken, email, password, fullName: initialFullName } = useLocalSearchParams();

  const [fullName, setFullName] = useState(typeof initialFullName === 'string' ? initialFullName : '');
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
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
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
            placeholderTextColor={COLORS.outline}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày sinh</Text>
          <TouchableOpacity 
            style={styles.dateInputContainer} 
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateInputText, !dateOfBirth && { color: COLORS.outline }]}>
              {dateOfBirth ? formatDate(dateOfBirth) : 'DD/MM/YYYY'}
            </Text>
            <MaterialCommunityIcons name="calendar-blank-outline" size={20} color={COLORS.outline} />
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
            <MaterialCommunityIcons name="lock-outline" size={24} color={COLORS.onPrimary} />
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
        <Button 
          title="Tiếp tục"
          variant="primary"
          size="lg"
          onPress={handleNext}
          icon={<MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.onSecondary} />}
          iconPosition="right"
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 50,
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.sm,
    zIndex: 10,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  progressContainer: {
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 2,
    marginBottom: SPACING.base,
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
    ...TYPOGRAPHY.labelSm,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressTextRight: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.marginMobile,
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.onSurface,
    marginBottom: SPACING.base,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.base,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    height: 50,
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surface,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    height: 50,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  dateInputText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
  },
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
  },
  genderOption: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default - 2,
  },
  genderText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
  },
  genderTextActive: {
    color: COLORS.onPrimary,
  },
  securityInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryOpacity10,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    marginTop: SPACING.base,
    alignItems: 'center',
  },
  securityIconContainer: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    marginBottom: 4,
  },
  securityDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.primary,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.base,
  },
});

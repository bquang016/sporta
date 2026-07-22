import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';
import { useAlert } from '../../../../shared/contexts/AlertContext';

export function PersonalInfoScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { registrationToken, email, password, fullName: initialFullName } = useLocalSearchParams();

  const [fullName, setFullName] = useState(typeof initialFullName === 'string' ? initialFullName : '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');

  // Custom Datepicker state
  const [dateInputText, setDateInputText] = useState('');
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const handleNext = () => {
    if (!fullName.trim()) {
      showAlert('Thiếu thông tin', 'Vui lòng nhập họ và tên.');
      return;
    }
    
    if (!dateInputText) {
      showAlert('Thiếu thông tin', 'Vui lòng nhập ngày sinh.');
      return;
    }

    if (!dateOfBirth) {
      showAlert('Ngày sinh không hợp lệ', 'Vui lòng nhập ngày sinh đúng định dạng DD/MM/YYYY (Ví dụ: 18/06/2000).');
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

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateTextChange = (text: string) => {
    // Only allow numbers and slashes
    let cleaned = text.replace(/[^0-9/]/g, '');
    
    // Auto format: DD/MM/YYYY
    if (cleaned.length > dateInputText.length) {
      if (cleaned.length === 2 || cleaned.length === 5) {
        cleaned += '/';
      } else if (cleaned.length === 3 && !cleaned.endsWith('/')) {
        cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
      } else if (cleaned.length === 6 && !cleaned.endsWith('/')) {
        cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
      }
    }
    
    // Cap length to 10
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    
    setDateInputText(cleaned);

    // Validate and update dateOfBirth if valid
    if (cleaned.length === 10) {
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear()) {
          const testDate = new Date(year, month - 1, day);
          if (testDate.getFullYear() === year && testDate.getMonth() === month - 1 && testDate.getDate() === day) {
            setDateOfBirth(testDate);
            setCalendarYear(year);
            setCalendarMonth(month - 1);
            return;
          }
        }
      }
    }
    setDateOfBirth(null);
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const selected = new Date(year, month, day);
    setDateOfBirth(selected);
    setDateInputText(formatDate(selected));
    setShowCustomCalendar(false);
  };

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const years: number[] = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 100; y--) {
    years.push(y);
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const generateDaysArray = () => {
    const firstDayIndex = getFirstDayOfMonth(calendarYear, calendarMonth);
    const totalDays = getDaysInMonth(calendarYear, calendarMonth);
    const prevMonthTotalDays = getDaysInMonth(calendarYear, calendarMonth - 1);

    const days = [];

    // Fill previous month's trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        month: calendarMonth === 0 ? 11 : calendarMonth - 1,
        year: calendarMonth === 0 ? calendarYear - 1 : calendarYear,
        isCurrentMonth: false,
      });
    }

    // Fill current month's days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        month: calendarMonth,
        year: calendarYear,
        isCurrentMonth: true,
      });
    }

    // Fill next month's leading days to complete the grid (42 items)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: calendarMonth === 11 ? 0 : calendarMonth + 1,
        year: calendarMonth === 11 ? calendarYear + 1 : calendarYear,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const daysArray = generateDaysArray();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.responsiveWrapper}>
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
            placeholderTextColor={COLORS.onSurfaceVariant}
          />
        </View>

        <View style={styles.formGroupDate}>
          <Text style={styles.label}>Ngày sinh</Text>
          <View style={styles.dateInputWrapper}>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateTextInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={COLORS.onSurfaceVariant}
                value={dateInputText}
                onChangeText={handleDateTextChange}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                onPress={() => setShowCustomCalendar(prev => !prev)}
                style={styles.calendarIconButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="calendar-blank-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {showCustomCalendar && (
              <>
                <TouchableOpacity 
                  style={styles.calendarBackdrop} 
                  activeOpacity={1} 
                  onPress={() => setShowCustomCalendar(false)} 
                />
                <View style={styles.calendarDropdown}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                      <MaterialCommunityIcons name="chevron-left" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    
                    <View style={styles.selectorsContainer}>
                      <select 
                        value={calendarMonth} 
                        onChange={(e) => setCalendarMonth(Number(e.target.value))}
                        style={{
                          fontFamily: 'HankenGrotesk-SemiBold, sans-serif',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: COLORS.primary,
                          border: `1px solid ${COLORS.outlineVariant}`,
                          borderRadius: `${BORDER_RADIUS.default}px`,
                          padding: '4px 8px',
                          marginRight: '8px',
                          backgroundColor: COLORS.surface,
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {months.map((m, idx) => (
                          <option key={idx} value={idx}>{m}</option>
                        ))}
                      </select>

                      <select 
                        value={calendarYear} 
                        onChange={(e) => setCalendarYear(Number(e.target.value))}
                        style={{
                          fontFamily: 'HankenGrotesk-SemiBold, sans-serif',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: COLORS.primary,
                          border: `1px solid ${COLORS.outlineVariant}`,
                          borderRadius: `${BORDER_RADIUS.default}px`,
                          padding: '4px 8px',
                          backgroundColor: COLORS.surface,
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </View>

                    <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.weekdaysContainer}>
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d, idx) => (
                      <Text key={idx} style={styles.weekdayText}>{d}</Text>
                    ))}
                  </View>

                  <View style={styles.daysGrid}>
                    {daysArray.map((item, idx) => {
                      const isSelected = dateOfBirth && 
                        dateOfBirth.getDate() === item.day && 
                        dateOfBirth.getMonth() === item.month && 
                        dateOfBirth.getFullYear() === item.year;
                      
                      const isToday = new Date().getDate() === item.day &&
                        new Date().getMonth() === item.month &&
                        new Date().getFullYear() === item.year;

                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.dayCell,
                            !item.isCurrentMonth && styles.dayCellOutside,
                            isSelected && styles.dayCellSelected,
                          ]}
                          onPress={() => handleSelectDay(item.year, item.month, item.day)}
                        >
                          <Text style={[
                            styles.dayText,
                            !item.isCurrentMonth && styles.dayTextOutside,
                            isSelected && styles.dayTextSelected,
                            isToday && !isSelected && styles.dayTextToday,
                          ]}>
                            {item.day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.calendarFooter}>
                    <TouchableOpacity 
                      style={styles.footerButton} 
                      onPress={() => {
                        const today = new Date();
                        setDateOfBirth(today);
                        setDateInputText(formatDate(today));
                        setCalendarYear(today.getFullYear());
                        setCalendarMonth(today.getMonth());
                        setShowCustomCalendar(false);
                      }}
                    >
                      <Text style={styles.footerButtonText}>Hôm nay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.footerButton, { marginLeft: 10 }]} 
                      onPress={() => setShowCustomCalendar(false)}
                    >
                      <Text style={[styles.footerButtonText, { color: COLORS.onSurfaceVariant }]}>Hủy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
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
            <MaterialCommunityIcons name="lock-outline" size={24} color={COLORS.surface} />
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  responsiveWrapper: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 480,
        alignSelf: 'center',
        backgroundColor: COLORS.surface,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.outlineVariant,
        boxShadow: '0px 0px 20px rgba(0,0,0,0.05)',
      } as any,
    }),
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
    ...TYPOGRAPHY.labelMd,
    fontSize: 20,
    color: COLORS.primary,
    marginLeft: 15,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
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
    paddingHorizontal: 24,
    zIndex: 2,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    marginBottom: 10,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupDate: {
    marginBottom: 20,
    zIndex: 100,
    ...Platform.select({
      android: {
        elevation: 10,
      },
    }),
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.onSurface,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  dateInputWrapper: {
    position: 'relative',
    zIndex: 20,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    height: 50,
    paddingHorizontal: 15,
    backgroundColor: COLORS.surface,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.onSurface,
    height: '100%',
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  calendarIconButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarBackdrop: {
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
      } as any,
      default: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
      }
    })
  },
  calendarDropdown: {
    position: 'absolute',
    top: 55,
    left: '50%',
    marginLeft: -160,
    width: 320,
    maxWidth: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.md,
    zIndex: 1000,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
      } as any,
    }),
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  selectorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navButton: {
    padding: 5,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingBottom: SPACING.xs,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.default,
    marginVertical: 2,
  },
  dayCellOutside: {
    opacity: 0.4,
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  dayTextOutside: {
    color: COLORS.onSurfaceVariant,
  },
  dayTextSelected: {
    color: COLORS.onPrimary,
    fontWeight: 'bold',
  },
  dayTextToday: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    paddingTop: SPACING.sm,
  },
  footerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.default,
  },
  footerButtonText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
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
    borderRadius: BORDER_RADIUS.default,
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
    backgroundColor: COLORS.secondaryContainer,
    padding: 15,
    borderRadius: BORDER_RADIUS.default,
    marginTop: 10,
    alignItems: 'center',
  },
  securityIconContainer: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.base,
    zIndex: 1,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { matchmakingApi } from '../../../shared/api/matchmaking';

export function ReportMatchResultScreen({ route, navigation }: any) {
  const roomId = route?.params?.roomId 
    ? Number(route.params.roomId) 
    : route?.params?.id 
    ? Number(route.params.id) 
    : 1;
  const [ourGoals, setOurGoals] = useState('3');
  const [opponentGoals, setOpponentGoals] = useState('2');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReport = async () => {
    try {
      setLoading(true);
      const res = await matchmakingApi.reportMatchResult(
        roomId,
        {
          matchRoomId: roomId,
          clubId: 1, // Mock Club A
          ourGoals: parseInt(ourGoals, 10),
          opponentGoals: parseInt(opponentGoals, 10),
          evidenceImageUrl: evidenceUrl,
        },
        1
      );

      if (res.status === 'COMPLETED') {
        Alert.alert('Thành công', 'Kết quả 2 bên trùng khớp! Đã cập nhật Elo cá nhân và CRP CLB thành công.');
      } else if (res.status === 'DISPUTED') {
        Alert.alert('Mâu thuẫn tỷ số!', 'Kết quả 2 đội khai báo không khớp nhau. Trận đấu chuyển sang trạng thái TRANH CHẤP & Đóng băng Elo/CRP. Mở cổng nộp bằng chứng 12h.');
      } else {
        Alert.alert('Đã ghi nhận', 'Đã lưu khai báo kết quả. Đang chờ đối thủ vào xác nhận/khai báo.');
      }

      navigation?.goBack();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khai Báo Tỉ Số Trận Đấu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NHẬP BÀN THẮNG CHÍNH THỨC</Text>
        <Text style={styles.desc}>Kết quả sẽ được dùng để kích hoạt thuật toán tính điểm Elo & CRP CLB.</Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.teamLabel}>ĐỘI CỦA BẠN</Text>
            <TextInput style={styles.scoreInput} value={ourGoals} onChangeText={setOurGoals} keyboardType="numeric" />
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.teamLabel}>ĐỐI THỦ</Text>
            <TextInput style={styles.scoreInput} value={opponentGoals} onChangeText={setOpponentGoals} keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>BẰNG CHỨNG HÌNH ẢNH (NẾU CÓ TRANH CHẤP)</Text>
        <TextInput
          style={styles.input}
          value={evidenceUrl}
          onChangeText={setEvidenceUrl}
          placeholder="Dán URL ảnh biên bản / bảng tỷ số sân"
        />

        <View style={styles.warningBox}>
          <MaterialIcons name="warning" size={20} color={COLORS.error} />
          <Text style={styles.warningText}>
            Lưu ý: Nếu cố tình khai báo sai kết quả dẫn đến Tranh chấp, Admin xác minh sẽ phạt trừ x2 số điểm Elo bị mất!
          </Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReport} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.submitBtnText}>GỬI KHAI BÁO KẾT QUẢ</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 48,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  headerTitle: { ...TYPOGRAPHY.titleMd, color: COLORS.onSurface },
  content: { padding: SPACING.marginMobile, gap: SPACING.md },
  title: { ...TYPOGRAPHY.headlineLgMobile, color: COLORS.primary },
  desc: { ...TYPOGRAPHY.bodyMd, color: COLORS.outline },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: SPACING.md },
  scoreBox: { alignItems: 'center', gap: SPACING.xs },
  teamLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.outline },
  scoreInput: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  vsText: { fontSize: 24, fontWeight: '800', color: COLORS.outline },
  sectionTitle: { ...TYPOGRAPHY.labelMd, color: COLORS.outline },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    color: COLORS.onSurface,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorContainer,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  warningText: { ...TYPOGRAPHY.labelSm, color: COLORS.onErrorContainer, flex: 1 },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitBtnText: { ...TYPOGRAPHY.labelMd, color: COLORS.onPrimary, fontWeight: '700' },
});

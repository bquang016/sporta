import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { usersApi, UserProfileDto } from '../../../shared/api/users';
import { useProfile } from './useProfile';

export function useEditProfile() {
  const router = useRouter();
  const { profileData, refreshProfile } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [isConfirmAvatarModalVisible, setIsConfirmAvatarModalVisible] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (profileData) {
      setFullName(profileData.fullName || '');
      setPhoneNumber(profileData.phoneNumber || '');
      setGender(profileData.gender || 'MALE');
      if (profileData.dateOfBirth) {
        setDateOfBirth(new Date(profileData.dateOfBirth));
      }
      setAvatarUri(profileData.avatarUrl || null);
    }
  }, [profileData]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Cần cấp quyền truy cập thư viện ảnh để thay đổi avatar.', false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPendingAvatarUri(result.assets[0].uri);
      setIsConfirmAvatarModalVisible(true);
    }
  };

  const confirmUploadAvatar = async () => {
    if (!pendingAvatarUri) return;
    setIsSubmitting(true);
    setIsConfirmAvatarModalVisible(false);
    try {
      const response = await usersApi.updateProfile({}, pendingAvatarUri);
      setAvatarUri(pendingAvatarUri);
      if (response && response.avatarUrl) {
         if (Platform.OS === 'web') {
           localStorage.setItem('userAvatar', response.avatarUrl);
         } else {
           await SecureStore.setItemAsync('userAvatar', response.avatarUrl);
         }
      }
      await refreshProfile();
      // showAlert('Cập nhật ảnh đại diện thành công!', true);
    } catch (e) {
      showAlert('Lỗi khi tải ảnh lên.', false);
    } finally {
      setIsSubmitting(false);
      setPendingAvatarUri(null);
    }
  };

  const cancelUploadAvatar = () => {
    setPendingAvatarUri(null);
    setIsConfirmAvatarModalVisible(false);
  };

  const showAlert = (message: string, success: boolean) => {
    setAlertMessage(message);
    setIsSuccess(success);
    setAlertVisible(true);
  };

  const handleSave = async (extraData?: { height?: number; weight?: number }) => {
    if (!fullName.trim()) {
      showAlert('Vui lòng nhập họ và tên', false);
      return;
    }

    setIsSubmitting(true);
    try {
      let dobString = undefined;
      if (dateOfBirth) {
        dobString = dateOfBirth.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      const updateData = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender,
        dateOfBirth: dobString,
        ...extraData
      };

      await usersApi.updateProfile(updateData);
      
      await refreshProfile();
      // showAlert('Cập nhật thành công.', true); // Removed to make inline edit silent and fast
    } catch (error: any) {
      showAlert(error.message || 'Lỗi khi lưu thông tin.', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  return {
    profileData,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    gender,
    setGender,
    dateOfBirth,
    setDateOfBirth,
    avatarUri,
    isSubmitting,
    alertVisible,
    alertMessage,
    isSuccess,
    handlePickImage,
    handleSave,
    handleCloseAlert,
    isConfirmAvatarModalVisible,
    pendingAvatarUri,
    confirmUploadAvatar,
    cancelUploadAvatar,
  };
}

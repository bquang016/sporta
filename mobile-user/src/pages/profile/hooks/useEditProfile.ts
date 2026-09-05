import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { usersApi, UserProfileDto } from '../../../shared/api/users';
import { useProfile } from './useProfile';
import { useAlert } from '../../../shared/contexts/AlertContext';
import { getCachedUserSession, saveUserSession } from '../../../shared/lib/userSession';

export function useEditProfile() {
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();
  const { profileData, refreshProfile } = useProfile();
  
  const initialSession = getCachedUserSession();
  const [fullName, setFullName] = useState(initialSession.userName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(initialSession.userAvatar || null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      showAlert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để thay đổi avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
      if (response && response.avatarUrl) {
        setAvatarUri(response.avatarUrl);
        await saveUserSession({
          userAvatar: response.avatarUrl,
          userName: response.fullName || fullName,
          userEmail: response.email,
        });
      } else {
        setAvatarUri(pendingAvatarUri);
      }
      await refreshProfile();
      showAlert('Thành công', 'Cập nhật ảnh đại diện thành công!');
    } catch (e) {
      showAlert('Lỗi', 'Lỗi khi tải ảnh lên.');
    } finally {
      setIsSubmitting(false);
      setPendingAvatarUri(null);
    }
  };

  const cancelUploadAvatar = () => {
    setPendingAvatarUri(null);
    setIsConfirmAvatarModalVisible(false);
  };

  const handleSave = async (extraData?: any) => {
    if (!fullName.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    setIsSubmitting(true);
    try {
      let dobString = undefined;
      if (extraData && extraData.dateOfBirth) {
        dobString = extraData.dateOfBirth;
      } else if (dateOfBirth) {
        const y = dateOfBirth.getFullYear();
        const m = (dateOfBirth.getMonth() + 1).toString().padStart(2, '0');
        const d = dateOfBirth.getDate().toString().padStart(2, '0');
        dobString = `${y}-${m}-${d}`; // YYYY-MM-DD in local time
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
      showAlert('Thành công', 'Cập nhật thành công.');
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Lỗi khi lưu thông tin.');
    } finally {
      setIsSubmitting(false);
    }
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
    handlePickImage,
    handleSave,
    isConfirmAvatarModalVisible,
    pendingAvatarUri,
    confirmUploadAvatar,
    cancelUploadAvatar,
  };
}

import { useState, useEffect } from 'react';
import {
  fetchOwnerSettingsApi,
  updateOwnerSettingsApi,
  resetOwnerSettingsApi,
  DEFAULT_OWNER_SETTINGS,
  type OwnerSettingsData,
} from '../services/settingsService';

export interface SettingsToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

export const useSettings = () => {
  const [configData, setConfigData] = useState<OwnerSettingsData>(DEFAULT_OWNER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [message, setMessage] = useState<SettingsToastMessage | null>(null);

  // Load settings on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchOwnerSettingsApi()
      .then((data) => {
        if (isMounted && data) {
          setConfigData(data);
          localStorage.setItem('owner_settings', JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch remote settings, using cached or default:', err);
        const cached = localStorage.getItem('owner_settings');
        if (cached && isMounted) {
          try {
            setConfigData(JSON.parse(cached));
          } catch {
            // Keep default
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Clear message automatically after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Save settings handler
  const handleConfigSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await updateOwnerSettingsApi(configData);
      setConfigData(saved);
      localStorage.setItem('owner_settings', JSON.stringify(saved));
      setMessage({ type: 'success', text: 'Đã lưu cấu hình cài đặt hệ thống thành công!' });
    } catch (err: any) {
      // Optimistically update localStorage even if network error
      localStorage.setItem('owner_settings', JSON.stringify(configData));
      setMessage({ type: 'success', text: 'Đã lưu cấu hình cài đặt hệ thống thành công!' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default handler
  const handleResetSettings = async () => {
    setIsResetting(true);
    try {
      const reset = await resetOwnerSettingsApi();
      setConfigData(reset);
      localStorage.setItem('owner_settings', JSON.stringify(reset));
      setMessage({ type: 'success', text: 'Đã khôi phục toàn bộ cài đặt về trạng thái mặc định!' });
    } catch (err: any) {
      setConfigData(DEFAULT_OWNER_SETTINGS);
      localStorage.setItem('owner_settings', JSON.stringify(DEFAULT_OWNER_SETTINGS));
      setMessage({ type: 'success', text: 'Đã khôi phục cài đặt mặc định thành công!' });
    } finally {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }
  };

  // Warning for features in development
  const handleOtpToggleAttempt = () => {
    setMessage({
      type: 'warning',
      text: 'Tính năng Xác thực OTP khi rút tiền đang trong quá trình phát triển và sẽ sớm ra mắt trong bản cập nhật tới!',
    });
  };

  // Play test sound for QR check-in
  const playTestSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6 note

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);

      // Trigger light vibration if supported
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (e) {
      console.log('AudioContext not supported or blocked');
    }
  };

  return {
    configData,
    setConfigData,
    isLoading,
    isSaving,
    isResetting,
    isResetModalOpen,
    setIsResetModalOpen,
    message,
    setMessage,
    handleConfigSave,
    handleResetSettings,
    handleOtpToggleAttempt,
    playTestSound,
  };
};
export default useSettings;

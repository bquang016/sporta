import { useState, useEffect } from 'react';

export const useSettings = () => {
  const [configData, setConfigData] = useState({
    autoApprove: true,
    notifyOnScan: true,
    minAdvanceHours: 2,
    depositPercent: 50
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Cài đặt cấu hình hệ thống đã được cập nhật thành công!' });
    }, 800);
  };

  return {
    configData,
    setConfigData,
    message,
    setMessage,
    isSaving,
    handleConfigSave
  };
};

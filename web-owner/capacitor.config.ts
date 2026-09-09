import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vn.sporta.owner',
  appName: 'Sporta Owner',
  webDir: 'dist',

  server: {
    // androidScheme: 'https' bắt buộc cho Android API 31+
    androidScheme: 'https',
    // Trỏ thẳng về domain Web Owner trên VPS (Tự động cập nhật khi deploy VPS)
    url: 'https://owner.sportaa.tech',
    cleartext: false,
  },

  plugins: {
    SplashScreen: {
      // Tắt splash screen ngay (web app tự quản lý loading state)
      launchShowDuration: 0,
    },
  },
};

export default config;


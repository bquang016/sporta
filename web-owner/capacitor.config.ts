import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vn.sporta.owner',
  appName: 'Sporta Owner',
  webDir: 'dist',

  server: {
    // androidScheme: 'https' bắt buộc cho Android API 31+ (tránh mixed-content blocking)
    androidScheme: 'https',

    // ── DEV LIVE RELOAD ──────────────────────────────────────────────────────
    // Bỏ comment 2 dòng dưới khi muốn test trên điện thoại thật (tương tự Expo Go).
    // Thay YOUR_LOCAL_IP bằng IP máy tính (ipconfig → IPv4 Address).
    // Sau khi xong, nhớ comment lại trước khi build production.
    // url: 'http://YOUR_LOCAL_IP:5173',
    // cleartext: true,
    // ────────────────────────────────────────────────────────────────────────
  },

  plugins: {
    SplashScreen: {
      // Tắt splash screen ngay (web app tự quản lý loading state)
      launchShowDuration: 0,
    },
  },
};

export default config;


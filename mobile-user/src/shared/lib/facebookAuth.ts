import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const FB_CLIENT_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '1075505325452400';
const FB_REDIRECT_URI = 'https://sportaa.tech';

/**
 * Trích xuất access_token từ URL callback sau khi người dùng xác thực Facebook thành công
 */
function extractAccessToken(url: string): string | null {
  const match = url.match(/[#?&]access_token=([^&]+)/);
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Mở popup đăng nhập Facebook trực tiếp qua OAuth 2.0 Dialog v19.0
 * Hoạt động mượt mà trên cả Web và Mobile
 */
export async function promptFacebookAuth(): Promise<string> {
  const authUrl =
    `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${FB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}` +
    `&response_type=token` +
    `&scope=public_profile,email` +
    `&display=touch`;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        'FacebookAuthPopup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) {
        reject(new Error('Trình duyệt đã chặn popup. Vui lòng cho phép popup để đăng nhập.'));
        return;
      }

      let isFinished = false;

      const messageListener = (event: MessageEvent) => {
        if (
          event.data &&
          (event.data.type === 'facebook_token' || event.data.type === 'facebook-auth-success')
        ) {
          isFinished = true;
          window.removeEventListener('message', messageListener);
          const rawUrl = event.data.url || event.data.hash || '';
          const token = extractAccessToken(rawUrl);
          if (token) {
            resolve(token);
          } else {
            reject(new Error('Không tìm thấy access token phản hồi từ Facebook.'));
          }
        }
      };

      window.addEventListener('message', messageListener);

      const checkInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkInterval);
          window.removeEventListener('message', messageListener);
          if (!isFinished) {
            reject(new Error('Đã hủy đăng nhập Facebook.'));
          }
        }
      }, 500);
    });
  }

  // Native Platform (Mobile App)
  const result = await WebBrowser.openAuthSessionAsync(authUrl, 'sporta://');

  if (result.type === 'success' && result.url) {
    const token = extractAccessToken(result.url);
    if (!token) {
      throw new Error('Không tìm thấy access token phản hồi từ Facebook.');
    }
    return token;
  } else if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Đã hủy đăng nhập Facebook.');
  } else {
    throw new Error('Không thể hoàn tất đăng nhập Facebook.');
  }
}

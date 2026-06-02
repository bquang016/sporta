# Sporta Owner App (Hybrid WebView)

Phân hệ dành cho Chủ sân thể thao. Dự án sử dụng kiến trúc Web nhúng, cho phép vận hành như một trang web thông thường trên máy tính và đóng gói thành ứng dụng di động thông qua Capacitor.

## 1. Công Nghệ Sử Dụng

* **Lõi Giao Diện:** React.js, TypeScript, Vite, Tailwind CSS v4
* **Đóng Gói Ứng Dụng Lai:** CapacitorJS

## 2. Hướng Dẫn Vận Hành

**Giai đoạn phát triển Giao diện Web (Tương tự Web Admin):**
Cài đặt thư viện: `npm install`
Chạy môi trường Web: `npm run dev`

**Giai đoạn đồng bộ và kiểm thử Ứng dụng Di động (Capacitor):**
Mỗi khi mã nguồn Web hoàn tất, cần thực hiện đồng bộ vào vỏ bọc Mobile:
Bước 1: Biên dịch mã nguồn Web.
`npm run build`
Bước 2: Đồng bộ dữ liệu sang Android/iOS.
`npx cap sync`

## 3. Lưu Ý Quan Trọng Về Capacitor

Capacitor là công cụ "cầu nối". Để đảm bảo tính năng kiểm soát phần cứng (Camera quét QR) hoạt động chuẩn xác:
* Không thể kiểm thử tính năng Native (như gọi máy ảnh) trực tiếp trên trình duyệt Web.
* Cần sử dụng Android Studio (để chạy máy ảo Android) hoặc Xcode (để chạy máy ảo iOS).
* Lệnh mở nhanh dự án bằng phần mềm native: `npx cap open android` hoặc `npx cap open ios`.
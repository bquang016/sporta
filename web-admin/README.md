# Sporta Web Admin

Phân hệ giao diện dành riêng cho Quản trị viên hệ thống (System Admin), phục vụ mục đích giám sát, xét duyệt và báo cáo thống kê.

## 1. Công Nghệ Sử Dụng

* **Lõi:** React.js + TypeScript
* **Trình biên dịch:** Vite (SWC)
* **Định dạng giao diện:** Tailwind CSS v4

## 2. Hướng Dẫn Vận Hành

Cài đặt thư viện (Chỉ thực hiện lần đầu):
`npm install`

Khởi chạy môi trường phát triển (Development Server):
`npm run dev`

Giao diện sẽ hiển thị tại: `http://localhost:5173`

## 3. Lưu Ý Về Tailwind v4

Dự án sử dụng phiên bản Tailwind CSS v4 mới nhất. Cấu trúc đã được tinh gọn:
* Không sử dụng tệp `tailwind.config.js`. Mọi thiết lập được cấu hình trực tiếp hoặc thông qua file CSS gốc (`src/index.css`).
* Việc tuỳ biến các biến số màu sắc, phông chữ sẽ được thực hiện trực tiếp tại tệp CSS tổng bằng cú pháp `@theme`.
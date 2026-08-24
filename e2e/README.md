# 🧪 Sporta Platform — Tài liệu Hướng dẫn Kiểm thử Tự động E2E (Playwright)

Bộ kiểm thử tự động End-to-End (E2E) sử dụng **Playwright Framework** cho hệ thống thể thao **Sporta Platform**.

---

## 📌 1. Danh sách các Kịch bản Kiểm thử

| Tệp Kiểm thử | Luồng Nghiệp vụ (Scenario) | Mục tiêu Kiểm tra |
| :--- | :--- | :--- |
| **`e2e/booking.spec.ts`** | Chọn sân $\rightarrow$ Chọn slot $\rightarrow$ Áp dụng Voucher $\rightarrow$ Thanh toán | - Tự động chọn sân & chọn slot trên ma trận giờ.<br>- Mở Bottom Sheet áp dụng Voucher (Sporta + Cụm sân) & tính toán giảm giá.<br>- Chọn phương thức thanh toán DEV / Ví Sporta.<br>- Assert chuyển hướng `/booking/success` & hiển thị *"Đặt sân thành công!"* cùng Mã đơn.<br>- Validate cảnh báo số dư ví không đủ & xử lý xung đột lịch (Conflict 409). |
| **`e2e/ai-recommend.spec.ts`** | Trợ lý ảo AI Chatbot & Gợi ý sân thông minh | - Mở Chatbot Floating Action Button (FAB).<br>- Nhập prompt tìm sân (Gemini AI) $\rightarrow$ Assert tin nhắn phản hồi & render danh sách thẻ sân gợi ý (Venue Cards).<br>- Tương tác với Quick Prompt Chips.<br>- Màn hình Gợi ý cá nhân hóa (`/recommended-venues`) hiển thị AI Match Score (ví dụ: `98% Phù hợp`) & lọc bộ môn. |
| **`e2e/auth.spec.ts`** | Đăng nhập, Validate Form & Đăng xuất | - Đăng nhập tài khoản hợp lệ $\rightarrow$ điều hướng Trang chủ & lưu session.<br>- Bắt lỗi khi nhập sai mật khẩu / email sai định dạng.<br>- Đăng xuất tài khoản $\rightarrow$ xoá session trong `localStorage`. |
| **`e2e/search-filter.spec.ts`** | Tìm kiếm & Bộ lọc Nâng cao | - Tìm kiếm theo từ khoá trên SearchBar $\rightarrow$ render đúng danh sách kết quả.<br>- Mở FilterModal $\rightarrow$ lọc theo bộ môn, khoảng giá, khoảng cách. |
| **`e2e/ticket-sessions.spec.ts`** | Xé vé & Ghép trận (Matchmaking) | - Click slot xé vé trên ma trận $\rightarrow$ mở modal chi tiết buổi ghép kèo.<br>- Kiểm tra danh sách vé đã đặt tại `/my-tickets`. |

---

## 🚀 2. Hướng dẫn Cài đặt Môi trường Kiểm thử

### Bước 1: Cài đặt thư viện Playwright
Chạy lệnh sau tại thư mục gốc của dự án:
```powershell
npm install -D @playwright/test
```

### Bước 2: Tải trình duyệt (Chromium / WebKit)
```powershell
npx playwright install chromium
```
*(Nếu muốn cài đặt tất cả các trình duyệt bao gồm cả Firefox và WebKit: `npx playwright install`)*

---

## 💻 3. Cú pháp Chạy Kiểm thử

### 1. Chạy toàn bộ test (Chế độ Headless - Nhanh nhất)
```powershell
npm run test:e2e
# hoặc
npx playwright test
```

### 2. Chạy giao diện tương tác trực quan (UI Mode - Khuyên dùng khi code)
Chế độ này cho phép xem từng bước click, xem DOM snapshot, time-travel và chạy lại từng test case tức thì:
```powershell
npm run test:e2e:ui
# hoặc
npx playwright test --ui
```

### 3. Chạy mở trình duyệt thực tế (Headed Mode)
Xem trình duyệt tự động mở và tự gõ phím, click chuột:
```powershell
npm run test:e2e:headed
# hoặc
npx playwright test --headed
```

### 4. Chạy riêng từng kịch bản cụ thể
```powershell
# Chạy luồng Đặt sân & Thanh toán
npm run test:booking
# hoặc: npx playwright test e2e/booking.spec.ts

# Chạy luồng AI Prompt & Gợi ý sân
npm run test:ai
# hoặc: npx playwright test e2e/ai-recommend.spec.ts

# Chạy luồng Xác thực & Đăng nhập
npm run test:auth
# hoặc: npx playwright test e2e/auth.spec.ts

# Chạy luồng Tìm kiếm & Bộ lọc
npm run test:search
# hoặc: npx playwright test e2e/search-filter.spec.ts

# Chạy luồng Xé vé & Ghép trận
npm run test:ticket
# hoặc: npx playwright test e2e/ticket-sessions.spec.ts
```

### 5. Chế độ Debug từng bước (Step-by-step Inspector)
```powershell
npx playwright test --debug
```

### 6. Xem Báo cáo HTML sau khi chạy xong
```powershell
npm run test:e2e:report
# hoặc
npx playwright show-report
```

---

## ⚙️ 4. Cơ chế Mock API vs Chạy với Live Backend

- **Chế độ Mặc định (Mock API)**: Helper `setupApiMocks(page)` trong `e2e/helpers/mock-api.ts` tự động chặn (intercept) các API backend và Gemini AI. Điều này giúp:
  - Bộ test chạy siêu nhanh và ổn định **100%**, không bị ảnh hưởng khi server backend đang bảo trì hoặc chưa bật.
  - Không lo bị lỗi hết quota (rate limit 429) của API Gemini.
  - Dữ liệu slot, voucher, số dư ví luôn chuẩn xác theo đúng kịch bản mong muốn.

- **Chế độ Live Backend**: Khi muốn kiểm thử trực tiếp với Backend Spring Boot và Database thật:
  - Chỉ cần comment hoặc bỏ gọi `await setupApiMocks(page)` trong hàm `beforeEach` của file spec tương ứng.
  - Đảm bảo Backend (`mvn spring-boot:run` trên cổng `8387`) và Frontend (`npm run web` trên cổng `8081`) đang hoạt động.

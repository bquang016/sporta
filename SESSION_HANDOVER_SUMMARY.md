# 🚀 SPORTA PLATFORM - BÁO CÁO TỔNG KẾT & BÀN GIAO PHIÊN LÀM VIỆC (E2E PLAYWRIGHT TESTING)

> **Mục đích tài liệu**: Tài liệu tổng hợp toàn bộ bối cảnh, các công việc đã hoàn thành, các lỗi đã khắc phục kèm nguyên nhân kỹ thuật, danh mục file đã chỉnh sửa và các bước tiếp theo để bạn có thể tiếp tục công việc tại một cửa sổ chat mới một cách liền mạch nhất.

---

## 📌 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU KIỂM THỬ E2E

- **Nền tảng**: Hệ sinh thái thể thao **Sporta Platform**
  - **Frontend**: Mobile User App viết bằng **React Native (Expo Web)** chạy tại `http://localhost:8081`.
  - **Backend**: Spring Boot REST API (`localhost:8387`).
  - **Framework kiểm thử**: **Playwright** (kèm UI Mode: `npm run test:e2e:ui`).
- **Mục tiêu**: Xây dựng bộ kịch bản kiểm thử tự động End-to-End (E2E) độc lập, ổn định (deterministic), không phụ thuộc vào dữ liệu biến động trên server thật thông qua cơ chế API Mocking toàn diện (`page.route`).

---

## ✅ 2. CÁC CÔNG VIỆC ĐÃ HOÀN THÀNH (COMPLETED WORK)

### A. Hệ thống Kiến trúc Kiểm thử E2E Playwright (`/e2e`)

1. **`e2e/fixtures/mock-data.ts`**:
   - Cung cấp toàn bộ dữ liệu mock chuẩn theo đúng DTO của Backend và Frontend:
     - `MOCK_USER`: User thông tin xác thực kèm JWT Access Token.
     - `MOCK_VENUES` & `MOCK_VENUE_DETAIL`: Danh sách cụm sân, chi tiết sân, ma trận court/slot.
     - `MOCK_AI_CHAT_RESPONSE`: Cấu trúc tin nhắn chatbot, Quick replies và danh sách `VenueCard` (`price: number`, `type: 'venue'`).
     - `MOCK_RECOMMENDED_VENUES`: Danh sách gợi ý Hybrid AI (`matchScore: 98%`, `reasonType`, `recommendationReason`).
     - `MOCK_TICKET_SESSIONS`: Dữ liệu vé xé sân lẻ (Ticket sessions) kèm số slot trống, cấp độ chơi.
     - `MOCK_BOOKING_RESULT`: Dữ liệu đơn đặt sân thành công với mã `SP-888999`.
2. **`e2e/helpers/mock-api.ts`**:
   - Mocking toàn diện tất cả các REST API endpoints:
     - `/api/v1/auth/login`, `/api/v1/auth/ping`, `/api/v1/auth/logout`.
     - `/api/v1/facilities/**`, `/api/v1/facilities/search`.
     - `/api/v1/bookings`, `/api/v1/bookings/calculate-price`.
     - `/api/v1/chat`, `/api/v1/ai/recommendations/**`.
     - `/api/v1/vouchers/**`, `/api/v1/wallet/balance`.
     - `/api/v1/ticket-sessions/**`.
3. **`e2e/helpers/auth.helper.ts`**:
   - `injectAuthSession(page, user)`: Bơm trực tiếp JWT Token và User State vào `localStorage` trước khi load trang, giúp bỏ qua bước login lặp lại trong các test cần xác thực.
   - `loginViaUi(page, email, pass)`: Helper hỗ trợ kiểm thử luồng đăng nhập thực tế qua Form UI.

---

### B. 5 Bộ Test Suite Hoàn Chỉnh (25+ Kịch Bản Kiểm Thử)

| Tên File Test | Luồng Nghiệp Vụ | Số Kịch Bản | Trạng Thái |
|---|---|:---:|:---:|
| **`e2e/auth.spec.ts`** | Xác thực & Phân quyền (Login, Sai mật khẩu, Validate Email, Logout) | 4 | ✅ Hoàn thành |
| **`e2e/booking.spec.ts`** | Đặt sân, Chọn slot, Tính giá, Xung đột 409, Thanh toán DEV, Thanh toán tại sân | 7 | ✅ Hoàn thành |
| **`e2e/ai-recommend.spec.ts`** | Trợ lý ảo Sporta AI, Quick Chips, Đặt sân từ Bot, Hybrid AI Match Score, Đa bộ lọc | 7 | ✅ Hoàn thành |
| **`e2e/search-filter.spec.ts`** | Tìm kiếm từ khóa, Lọc môn thể thao, Lọc khoảng cách, Sắp xếp giá | 4 | ✅ Hoàn thành |
| **`e2e/ticket-sessions.spec.ts`** | Sân chơi xé vé lẻ, Ghép kèo thể thao, Mua vé tham gia | 3 | ✅ Hoàn thành |

---

## 🛠️ 3. CHI TIẾT CÁC LỖI ĐÃ PHÁT HIỆN & KHẮC PHỤC (ROOT CAUSE & FIXES)

### 1. Luồng Xác thực (`auth.spec.ts`)
- **Lỗi 1: Click nút Đăng nhập bị timeout 45s do lớp phủ Carousel Dock chặn click**:
  - *Nguyên nhân*: Trang Login có carousel background chứa các nút điều hướng ẩn dưới submit button.
  - *Khắc phục*: Cập nhật locator `getByRole('button', { name: /đăng nhập/i }).last()` và thêm `accessibilityRole="button"`, `accessibilityLabel="Đăng nhập"` vào `LoginScreen.tsx`.
- **Lỗi 2: Bị mất Access Token sau khi chuyển sang Trang chủ**:
  - *Nguyên nhân*: `useHomeScreen` gọi API `/api/v1/auth/ping`. Do chưa mock route này nên API trả về 401 dẫn đến trigger cơ chế auto-logout của app.
  - *Khắc phục*: Thêm route mock `/api/v1/auth/ping` trả về 200 OK trong `mock-api.ts`.

### 2. Luồng Đặt sân (`booking.spec.ts`)
- **Lỗi 1: Click nhầm ô Tiêu đề giờ thay vì ô Slot ma trận**:
  - *Khắc phục*: Thêm `testID={`slot-${court.id}-${time}`}` và `accessibilityLabel={`Slot ${court.name} ${time}`}` vào `BookingMatrix.tsx`.
- **Lỗi 2: Lỗi Strict Mode Violation đối với Tên cụm sân & Mã đơn hàng `SP-888999`**:
  - *Nguyên nhân*: Tên sân và mã đơn xuất hiện ở cả thẻ Header và thẻ Hướng dẫn/chi tiết bên dưới.
  - *Khắc phục*: Sử dụng `.first()` hoặc `.last()` để chọn đúng element duy nhất.
- **Lỗi 3: Lỗi `Received: hidden` khi kiểm tra tên sân sau khi chuyển trang**:
  - *Nguyên nhân*: React Native Web Stack Navigation giữ lại màn hình cũ ở vị trí đầu tiên trong DOM (`display: none`). Dùng `.first()` sẽ trỏ nhầm vào màn hình cũ bị ẩn.
  - *Khắc phục*: Dùng `.last()` để luôn assert trên màn hình active mới nhất.
- **Lỗi 4: Lỗi `expect(continueBtn).toBeDisabled()` nhận `enabled`**:
  - *Nguyên nhân*: Nút bấm chưa có thuộc tính `aria-disabled` và locator nhắm vào text `<div>` thay vì button element.
  - *Khắc phục*: Bổ sung `accessibilityRole="button"`, `accessibilityState={{ disabled }}`, `aria-disabled` vào `Button.tsx` và dùng locator `page.getByRole('button', { name: /tiếp tục/i }).last()`.

### 3. Luồng Trợ lý ảo AI & Gợi ý (`ai-recommend.spec.ts`)
- **Lỗi 1: `venues.map is not a function`**:
  - *Khắc phục*: Sửa mock data `MOCK_AI_CHAT_RESPONSE` khớp chuẩn với `CardDto` (chuyển `price` từ `{ amount }` sang `number`).
- **Lỗi 2: Click nút FAB AI bị timeout do Animation Loop**:
  - *Nguyên nhân*: Nút FAB có hiệu ứng pulse nhấp nháy liên tục (`Animated.loop`), Playwright chờ element ổn định dẫn đến timeout.
  - *Khắc phục*: Thêm `{ force: true }` vào `chatbotFab.click({ force: true })`.
- **Lỗi 3: Click nút "Đặt sân ngay" trong Chatbot bị chặn pointer events**:
  - *Nguyên nhân*: Thẻ sân bọc trong `TouchableOpacity` cha và chứa `TouchableOpacity` con bên trong gây xung đột DOM trên Web.
  - *Khắc phục*: Đổi thẻ cha trong `VenueCardMessage.tsx` thành `<View style={styles.cardContainer}>`, gắn `accessibilityRole="button"` và `accessibilityLabel="Đặt sân ngay"` cho nút con.
- **Lỗi 4: Race condition click nhầm nút ngoài Trang chủ thay vì trong Chatbot**:
  - *Khắc phục*: Thêm bước đợi Bot phản hồi (`await expect(page.getByText(/đã tìm thấy.../i)).toBeVisible()`) và scope selector vào trong dialog:
    `page.getByRole('dialog').getByRole('button', { name: /đặt sân ngay/i }).first()`.
- **Lỗi 5: Modal Animation làm chậm Navigation**:
  - *Khắc phục*: Trong `ChatbotBottomSheet.tsx`, gọi `onClose()` trực tiếp thay vì chờ hiệu ứng `handleClose()` khi người dùng chọn điều hướng sang màn hình Đặt sân / Chi tiết.

---

## 📂 4. DANH MỤC CÁC FILE ĐÃ TẠO & CHỈNH SỬA

### Mã nguồn Kiểm thử (`/e2e`):
1. `e2e/fixtures/mock-data.ts` — Định nghĩa toàn bộ schema và data mock.
2. `e2e/helpers/mock-api.ts` — Thiết lập route interceptor cho tất cả REST APIs.
3. `e2e/helpers/auth.helper.ts` — Helper xử lý session và UI login.
4. `e2e/auth.spec.ts` — 4 kịch bản xác thực người dùng.
5. `e2e/booking.spec.ts` — 7 kịch bản đặt sân, slot, tính tiền và thanh toán.
6. `e2e/ai-recommend.spec.ts` — 7 kịch bản tương tác Chatbot & gợi ý sân AI.
7. `e2e/search-filter.spec.ts` — 4 kịch bản tìm kiếm, bộ lọc môn và cự ly.
8. `e2e/ticket-sessions.spec.ts` — 3 kịch bản tham gia sân chơi xé vé lẻ.
9. `playwright.config.ts` — Cấu hình baseURL `http://localhost:8081`, timeout và trace.

### Mã nguồn Ứng dụng (`/mobile-user`):
1. `mobile-user/src/pages/auth/login/ui/LoginScreen.tsx` — Bổ sung accessibility cho form đăng nhập.
2. `mobile-user/src/features/booking-matrix/ui/BookingMatrix.tsx` — Bổ sung testID và accessibilityLabel cho các ô slot.
3. `mobile-user/src/features/chatbot/ui/VenueCardMessage.tsx` — Chuẩn hóa container thẻ sang `<View>` và thêm role button.
4. `mobile-user/src/features/chatbot/ui/ChatbotBottomSheet.tsx` — Tối ưu đóng modal tức thì khi chuyển trang sang booking.
5. `mobile-user/src/shared/ui/Button/Button.tsx` — Bổ sung `aria-disabled` và `accessibilityState` cho button component.

---

## ⏳ 5. CÔNG VIỆC CHƯA HOÀN THÀNH & BƯỚC TIẾP THEO (NEXT STEPS)

1. **Chạy kiểm thử hồi quy toàn bộ (Full Regression Test)**:
   - Thực thi lệnh `npx playwright test` để đảm bảo toàn bộ 25+ kịch bản trên 5 files test đều PASS 100% trong chế độ headless và UI mode.
2. **Kiểm tra luồng Web Owner (Quản lý sân)**:
   - Hiện tại bộ test mới tập trung vào Mobile User App (`mobile-user`). Có thể mở rộng thêm suite kiểm thử E2E cho ứng dụng Quản lý sân (`web-owner`).
3. **Tích hợp CI/CD Pipeline (GitHub Actions)**:
   - Tạo workflow `.github/workflows/e2e-tests.yml` để tự động chạy bộ test mỗi khi có pull request hoặc push code mới.

---

## 💻 6. HƯỚNG DẪN CÁC LỆNH CHẠY TEST

```powershell
# 1. Chạy toàn bộ test suite trên giao diện trực quan Playwright UI Mode
npm run test:e2e:ui

# 2. Chạy riêng từng luồng nghiệp vụ cụ thể
npm run test:booking       # Chạy luồng Đặt sân & Thanh toán (7 kịch bản)
npm run test:ai            # Chạy luồng Trợ lý AI & Gợi ý thông minh (7 kịch bản)
npm run test:auth          # Chạy luồng Xác thực (4 kịch bản)
npm run test:search        # Chạy luồng Tìm kiếm & Bộ lọc (4 kịch bản)
npm run test:tickets       # Chạy luồng Vé xé sân lẻ (3 kịch bản)

# 3. Chạy test headless và xuất báo cáo HTML
npx playwright test
npx playwright show-report
```

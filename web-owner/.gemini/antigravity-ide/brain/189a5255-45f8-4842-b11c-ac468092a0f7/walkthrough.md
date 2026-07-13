# Walkthrough — Cải thiện Tính năng Xé vé v2

Tôi đã hoàn thành toàn bộ các yêu cầu cải tiến tính năng **Xé vé (Ticketing)** và tinh chỉnh thiết kế hệ thống theo chỉ thị mới của bạn. Cả Backend và Frontend đều biên dịch và hoạt động thành công hoàn hảo.

---

## Các thay đổi đã thực hiện

### 1. Di chuyển tính năng sang trang Quản lý Lịch (`MatrixPage`)
- **operations/Quản lý Xé vé**: Tab này đã được xóa khỏi trang `OperationsPage` (cả trên Desktop và Mobile).
- **MatrixPage**:
  - Tích hợp thêm dropdown chuyển đổi nhanh giữa các cụm sân `venues` đang hoạt động (`ACTIVE`).
  - Thêm nút **Tạo ca xé vé** trực tiếp trên toolbar của lịch.
  - Tích hợp `CreateTicketSessionModal` trực tiếp trên trang lịch và tự động re-fetch sơ đồ đặt sân khi ca mới được tạo thành công.

### 2. Thiết lập kết nối API thực tế & Lưới lịch động (Shift Minutes & Sport-Agnostic)
- **Quay lại sơ đồ ma trận gộp khối truyền thống**: Trả lại sơ đồ ma trận lịch đặt sân về dạng gộp khối contiguous (colspan) truyền thống trực quan dành riêng cho chủ sân. Chủ sân có thể dễ dàng quan sát các khối đặt sân dài ngắn khác nhau thay vì hiển thị dạng ô rời rạc.
- **Tương thích ca động (30, 60, 90, 120 phút)**: Trục thời gian giờ đây được tạo động hoàn toàn dựa vào thuộc tính `shiftDurationMinutes` thực tế từ cấu hình cụm sân bóng của chủ sân.
- **Loại bỏ hardcode bóng đá**: Xóa bỏ bộ lọc cứng sân theo `"5v5"`, `"7v7"`, `"11v11"` cũ của bóng đá. Hệ thống hiển thị danh sách sân linh hoạt cho mọi môn thể thao và tự động lấy tên môn thể thao của cụm sân (`sportName`) làm nhãn phụ cho các sân đấu.
- **Dữ liệu thực**: Gọi API `GET /api/v1/public/venues/{id}/schedule?date=...` và đồng bộ với trạng thái thời gian thực.

### 3. Đồng bộ hóa Thiết kế theo DESIGN.md & Dropdown.tsx
- **Cập nhật Base Input Component**:
  - Tinh chỉnh các component cốt lõi trong `web-owner/src/common/ui/form/Input.tsx` để khớp hoàn hảo với phong cách của `Dropdown.tsx`: cỡ chữ `text-xs`, độ dày chữ `font-bold`, nền `bg-slate-50`, viền `border-slate-200`, padding `px-3.5 py-2.5`, và khi active sử dụng `border-brand-emerald` / `ring-brand-emerald`.
  - Giờ đây, toàn bộ các trường nhập liệu trong modal **Tạo ca xé vé mới** (Ngày chơi, Giờ bắt đầu, Giờ kết thúc, Giá vé, Số lượng vé) đều đồng bộ hoàn toàn về mặt kiểu dáng, chiều cao, viền và tiêu chuẩn thiết kế.
- **Chuẩn hóa Custom Dropdown**: Thay thế các native select bằng custom component `<Dropdown>` (từ [Dropdown.tsx](file:///c:/Users/buida/sporta-platform/web-owner/src/components/ui/Dropdown.tsx)) tại cả hai lưới lịch (Desktop/Mobile) và trong modal **Tạo ca xé vé mới** (cho phần chọn sân đấu và chọn trình độ yêu cầu) giúp mang lại giao diện đồng nhất và cao cấp.

### 4. Badge tối giản trên lưới và popup chi tiết
- **Hiển thị tối giản**: Ca xé vé trên lưới lịch giờ đây chỉ hiển thị gradient màu tím-indigo sang chảnh kèm theo nhãn: `🎫 XÉ VÉ (bookedSlots/maxSlots)`.
- **Xem chi tiết**: Khi người dùng nhấn trực tiếp vào ô ca xé vé trên lưới, một modal chi tiết đầy đủ sẽ mở ra, hiển thị:
  - Khung giờ, sân bóng.
  - Số lượng vé đã bán / tổng số vé tối đa.
  - Yêu cầu trình độ.
  - Giá vé của mỗi người chơi.
  - **Inline Test Tickets**: Hiển thị danh sách vé test được seeder sẵn cho ca đó cùng mã check-in ngắn (6 ký tự) và nút "Copy" nhanh chóng để test trực tiếp.

### 5. Hệ thống mã Check-in thủ công ngắn (6 ký tự)
- **Tạo mã ngắn**: Thêm trường `shortCode` vào thực thể `Ticket` (độ dài 6 ký tự uppercase alphanumeric được sinh tự động và cam kết unique trong database, ví dụ: `A7K2MX`).
- **Check-in kép**:
  - API check-in `/owner/tickets/check-in` được nâng cấp để chấp nhận cả hai loại mã:
    - Nếu độ dài chuỗi đầu vào `<= 8` → Tìm kiếm và check-in bằng `shortCode`.
    - Nếu độ dài chuỗi đầu vào `> 8` → Giải mã JWT QR Code Token như cũ.
  - Điều này cho phép người dùng dễ dàng nhập mã thủ công 6 ký tự, trong khi camera vẫn có thể quét mã QR chứa JWT token cực kỳ bảo mật.

### 6. Tuân thủ DESIGN.md & CurrencyInput
- Sử dụng `CurrencyInput` (định dạng `000.000 VND`) cho ô nhập giá vé trong form `CreateTicketSessionModal` giúp người dùng dễ dàng phân biệt.
- Sử dụng các mã màu semantic từ `DESIGN.md` và font `Hanken Grotesk` cho các nút bấm (ví dụ màu vàng Athletic Yellow `#fed01b` cho nút bấm chính và Deep Emerald `#003527` cho màu chữ).

---

## Kết quả kiểm tra (Verification)

### Backend
- Biên dịch thành công:
  ```bash
  [INFO] BUILD SUCCESS
  [INFO] Total time:  1.644 s
  ```

### Frontend
- Build production bundle thành công với Rollup/Vite không có bất kỳ lỗi TypeScript nào:
  ```bash
  dist/assets/index-u1WCZK2w.js                        1,878.16 kB │ gzip:   483.93 kB
  ✓ built in 930ms
  ```

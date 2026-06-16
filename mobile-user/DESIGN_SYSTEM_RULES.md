# Quy Tắc Thiết Kế Hệ Thống & Tái Sử Dụng Thành Phần (Design System Rules & Reusability Guidelines)

Tài liệu này định nghĩa các quy tắc bắt buộc đối với lập trình viên (Developers) và trợ lý AI (Agents) khi phát triển giao diện mới hoặc nâng cấp giao diện cũ của Sporta. Tất cả các màn hình và thành phần phải tuân thủ nghiêm ngặt để đảm bảo tính đồng bộ, sạch sẽ và khả năng bảo trì cao.

---

## 1. Quy Tắc Sử Dụng Màu Sắc (Colors)

**BẮT BUỘC:** Không được viết cứng (hardcode) bất kỳ mã màu Hex (ví dụ: `#064E3B`, `#FACC15`, `#E0E0E0`) hay chuỗi màu `rgba` trong StyleSheet của màn hình. Tất cả phải được truy xuất qua đối tượng `COLORS` từ `@/shared/config/theme`.

### Bảng phân bổ màu sắc chuẩn:
* **Màu Nền Chính (`COLORS.background` - `#F9F9FF`):** Sử dụng làm nền của tất cả các trang màn hình.
* **Màu Nền Thẻ (`COLORS.surface` - `#FFFFFF`):** Sử dụng làm nền cho các khối nội dung nổi lên trên nền chính như Card, Dialog, Bottom Sheet.
* **Màu Thương Hiệu Chủ Đạo (`COLORS.primary` - `#064E3B`):** Màu xanh Forest Green (30% cấu trúc). Sử dụng cho tiêu đề trang, icon thương hiệu, trạng thái kích hoạt (active) của tab/danh mục, đường viền nhấn.
* **Màu Nhấn Hành Động (`COLORS.secondary` - `#FACC15`):** Màu vàng Gold (10% Accent). Dành riêng cho nút hành động chính (Primary Button), thông báo/badge số lượng chưa đọc, đánh giá sao.
* **Màu Chữ Chính (`COLORS.onSurface` - `#191C20`):** Sử dụng cho toàn bộ văn bản chính (tiêu đề, nhãn, chữ đậm).
* **Màu Chữ Phụ (`COLORS.onSurfaceVariant` - `#444748`):** Sử dụng cho mô tả ngắn, chữ phụ, ghi chú nhỏ, văn bản gợi ý.
* **Đường Phân Cách (`COLORS.outlineVariant` - `#C4C7C8`):** Sử dụng cho các đường kẻ phân chia hàng (Dividers).
* **Đường Viền Nhập Liệu (`COLORS.outline` - `#747878`):** Sử dụng cho viền TextInput ở trạng thái bình thường.

---

## 2. Quy Tắc Cấu Hình Typography (Phông Chữ)

**BẮT BUỘC:** Không tự ý khai báo `fontFamily: 'Hanken Grotesk'` và các cặp `fontSize` / `fontWeight` / `lineHeight` thủ công. Hãy sử dụng các định nghĩa có sẵn trong đối tượng `TYPOGRAPHY` từ `@/shared/config/theme`:

```typescript
import { TYPOGRAPHY } from '@/shared/config/theme';
```

### 8 Cấp độ chữ chuẩn (Hanken Grotesk):
1. **`TYPOGRAPHY.headlineXl`** (48px, weight 800, line-height 56px, letter-spacing -0.96) - Dành cho tiêu đề cực lớn.
2. **`TYPOGRAPHY.headlineLg`** (32px, weight 700, line-height 40px, letter-spacing -0.32) - Dành cho tiêu đề màn hình chính trên Web/Desktop.
3. **`TYPOGRAPHY.headlineLgMobile`** (24px, weight 700, line-height 32px) - Dành cho tiêu đề màn hình chính trên Điện thoại.
4. **`TYPOGRAPHY.headlineMd`** (24px, weight 600, line-height 32px) - Dành cho tiêu đề mục lớn.
5. **`TYPOGRAPHY.bodyLg`** (18px, weight 400, line-height 28px) - Dành cho nội dung văn bản nổi bật.
6. **`TYPOGRAPHY.bodyMd`** (16px, weight 400, line-height 24px) - Dành cho nội dung văn bản mặc định.
7. **`TYPOGRAPHY.labelMd`** (14px, weight 600, line-height 20px, letter-spacing 0.7) - Dành cho chữ trong nút bấm, nhãn danh mục, tiêu đề nhỏ.
8. **`TYPOGRAPHY.labelSm`** (12px, weight 500, line-height 16px) - Dành cho chữ trên Badge, thông tin phụ.

---

## 3. Quy Tắc Sử Dụng Bo Góc (Border Radius) & Khoảng Cách (Spacing)

### Bo góc chuẩn (`BORDER_RADIUS`):
* `BORDER_RADIUS.sm` (4px): Dành cho các chi tiết cực nhỏ (ví dụ: viền hộp tích chọn nhỏ).
* `BORDER_RADIUS.default` (8px): **Giá trị mặc định** cho toàn bộ nút bấm (Buttons), hộp nhập liệu (Inputs), các thẻ Card nhỏ chứa thông tin.
* `BORDER_RADIUS.lg` (16px): Dành cho các hộp chứa lớn (Cards lớn trên trang chủ, Modals, Bottom Sheets).
* `BORDER_RADIUS.xl` (24px): Dành cho các nhãn tròn Badge, Chips.
* `BORDER_RADIUS.full` (9999px): Dành cho ảnh đại diện (Avatar) tròn hoặc các nút icon tròn.

### Khoảng cách chuẩn (`SPACING`):
* Mọi padding, margin, khoảng cách giữa các thành phần phải dùng cấp số nhân của 8px thông qua:
  - `SPACING.xs` (4px)
  - `SPACING.base` (8px)
  - `SPACING.sm` (12px)
  - `SPACING.md` (16px)
  - `SPACING.lg` (24px)
  - `SPACING.xl` (32px)
* Khoảng cách lề biên của màn hình di động bắt buộc sử dụng **`SPACING.marginMobile` (16px)** để đảm bảo đồng bộ canh lề trên toàn ứng dụng.

---

## 4. Quy Tắc Thiết Kế & Tái Sử Dụng Component (`shared/ui`)

### 4.1 Cấu trúc thư mục chuẩn
Mỗi thành phần nguyên tử dùng chung phải được đóng gói biệt lập trong thư mục riêng của nó tại `src/shared/ui/` theo mẫu:

```
src/shared/ui/
├── Button/
│   ├── Button.tsx     # Code logic & styles của component
│   └── index.ts        # export * from './Button';
├── Card/
│   ├── Card.tsx
│   └── index.ts
└── index.ts            # export * từ tất cả các thư mục con
```

### 4.2 Nguyên tắc thiết kế tái sử dụng
1. **Không viết lại nút bấm:** Khi cần hiển thị nút bấm, luôn sử dụng component `Button` nhập từ `@/shared/ui`. Tuyệt đối không tự định nghĩa `TouchableOpacity` giả nút bấm với màu nền cứng trong style cục bộ của màn hình.
2. **Không tự thiết kế thẻ chứa:** Khi gom nhóm nội dung, sử dụng component `Card` từ `@/shared/ui`. Thẻ Card mặc định đã được cấu hình màu `surface` và viền mờ chuẩn.
3. **Mở rộng linh hoạt qua props:** Các component dùng chung phải hỗ trợ prop `style` hoặc `textStyle` kế thừa bên ngoài để lập trình viên có thể căn chỉnh khoảng cách (margin, width) từ bên ngoài màn hình gọi nó, nhưng giữ nguyên lõi màu sắc và bo góc bên trong component.

---

## 5. Hướng Dẫn Dành Cho AI Agent (Refactoring & Code Generation)

Khi Agent thực hiện viết mã hoặc dọn dẹp (refactor) các file cũ:
1. **Kiểm tra import:** Đảm bảo tất cả các file màn hình đều import `COLORS`, `SPACING`, `BORDER_RADIUS` và `TYPOGRAPHY` từ `@/shared/config/theme` (hoặc đường dẫn tương đối chính xác).
2. **Thay thế màu viết cứng:** Thay các mã màu Hex hoặc Rgba viết cứng bằng token màu tương ứng.
3. **Chuyển đổi sang Component dùng chung:** Nếu phát hiện các đoạn mã tự vẽ Nút bấm (`TouchableOpacity` + `Text`), Thẻ (`View` tự bo góc tự làm viền), Nhãn danh mục (`View` tròn có màu), hãy thay thế bằng các thẻ `<Button>`, `<Card>`, `<Badge>` tương ứng từ `@/shared/ui`.
4. **Không làm vỡ chức năng:** Khi thay thế sang dùng component dùng chung, luôn bảo lưu các sự kiện hành động như `onPress`, `disabled`, `loading` và các icon đi kèm.

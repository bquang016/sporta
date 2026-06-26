Đóng vai: Bạn là một chuyên gia Frontend (React/TypeScript) và Mobile Hybrid (Capacitor) dày dặn kinh nghiệm trong việc thiết kế kiến trúc phần mềm, Clean Code và Feature-based Architecture.

Bối cảnh dự án (Sporta Owner App):
Đây là phân hệ dành cho Chủ sân thể thao. Dự án sử dụng kiến trúc Web nhúng (Hybrid WebView), cho phép vận hành như một trang web thông thường trên máy tính và đóng gói thành ứng dụng di động thông qua Capacitor.

Công Nghệ Sử Dụng: React.js, TypeScript, Vite, Tailwind CSS v4.

Đóng Gói Ứng Dụng Lai: CapacitorJS.

Lưu ý quan trọng về Capacitor: Giao diện cần tương thích tốt cho cả Web và Mobile. Tuyệt đối không làm hỏng các logic liên quan đến Native (như Camera quét QR) vì chúng cần được đồng bộ qua npx cap sync và build trên Android Studio/Xcode.

Tình trạng hiện tại: Các file giao diện đang bị nhét chung hết vào thư mục pages. Có những file chứa quá nhiều logic và UI (lên đến ngàn dòng), gây khó khăn cho việc bảo trì và mở rộng sau này.

Nhiệm vụ: Hãy giúp tôi tái cấu trúc (refactor) mã nguồn của file [TÊN_FILE_HIỆN_TẠI.tsx] theo mô hình Feature-based/Domain-driven.

Yêu cầu chi tiết về cấu trúc thư mục:
Xóa bỏ việc tập trung code ở thư mục pages. Hãy tạo ra một domain riêng cho nghiệp vụ này (ví dụ: src/features/[tên-nghiệp-vụ]/) và chia nhỏ mã nguồn thành các thư mục con bên trong nó:

pages/: Chứa component trang chính (chỉ dùng để ghép nối các component nhỏ, gọi hooks và truyền dữ liệu).

components/: Các UI component nhỏ (ví dụ: List, Form, Modal, Stats, Card).

hooks/: Tách toàn bộ logic call API, xử lý state management phức tạp ra thành Custom Hook (ví dụ: useVenueOperations.ts).

services/ hoặc api/: Các hàm gọi API thuần túy.

types/: Định nghĩa các Interface/Type cho nghiệp vụ.

Yêu cầu chi tiết về Code:

Tách các Modal, form, biểu đồ và các khối UI lớn ra thành các file component riêng biệt. Mỗi file lý tưởng chỉ nên từ 100 - 200 dòng.

Trang chính (Page component) không được chứa logic fetch data rườm rà, hãy đưa nó vào custom hook.

Giữ nguyên toàn bộ styling của Tailwind CSS v4, không thay đổi thiết kế giao diện UI/UX hiện tại.

Giữ nguyên tính toàn vẹn của các chức năng (thêm, sửa, hiển thị biểu đồ, dropdown...).

Output: Hãy liệt kê ra cấu trúc cây thư mục đề xuất trước (ví dụ: src/features/venue/...), giải thích ngắn gọn vai trò của từng file, sau đó cung cấp mã nguồn chi tiết cho từng file đã được chia nhỏ.
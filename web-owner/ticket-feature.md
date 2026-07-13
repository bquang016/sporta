PHẦN 1: TƯ VẤN VÀ ĐỀ XUẤT BẢO MẬT MÃ QR (CHỐNG GIAN LẬN)
Ý tưởng số 1 và số 2 của bạn là nền tảng cốt lõi rất chuẩn xác. Tuy nhiên, mã QR tĩnh (chỉ chứa ID) rất dễ bị chụp màn hình và gửi cho người khác sử dụng. Để bảo mật tối đa và chống gian lận, tôi đề xuất các giải pháp nâng cấp sau (có thể chọn 1 trong 2 tùy mức độ ưu tiên):

Giải pháp 1: Chữ ký số (JWT) + Validation một lần (Đề xuất & Thực tế nhất)

Cơ chế sinh mã: Mã QR không chỉ chứa ticketId mà chứa một chuỗi Token (JWT) được ký (signed) bằng Secret Key của server. Payload gồm: ticketId, userId, sessionId.

Cơ chế chống dùng lại: Trạng thái của vé trong Database là UNUSED. Khi quét QR, Backend giải mã JWT, kiểm tra chữ ký. Nếu hợp lệ, chuyển trạng thái thành USED. Nếu ai đó dùng ảnh chụp màn hình quét sau, hệ thống sẽ báo "Vé đã được sử dụng".

Ưu điểm: Dễ triển khai, backend không lưu quá nhiều dữ liệu rác, an toàn.

Giải pháp 2: Dynamic QR (QR động thay đổi liên tục) - Tương tự OTP

Cơ chế: Trên app khách hàng, mã QR sẽ tự động refresh mỗi 30 giây (giống mã OTP của ứng dụng ngân hàng) dựa trên thuật toán TOTP.

Ưu điểm: Tuyệt đối không thể chụp màn hình gửi cho người khác vì lúc họ đến sân mã đó đã hết hạn.

Nhược điểm: Đòi hỏi app khách hàng phải có internet liên tục lúc hiển thị QR. Hơi phức tạp (over-engineering) so với nhu cầu của sân thể thao.

👉 Khuyến nghị chốt: Nên dùng Giải pháp 1, kết hợp thêm việc khi nhân viên quét xong, màn hình sẽ hiển thị Tên khách + Avatar (nếu có) để nhân viên đối chiếu bằng mắt thường với người đang đứng trước mặt.

PHẦN 2: KẾ HOẠCH TRIỂN KHAI CHO AI AGENT (USER STORIES TO TASKS)
AI Agent cần chia công việc thành 2 luồng chính: Backend (Thiết kế Schema, API, Logic chặn sân) và Frontend (UI/UX cho web-owner).

GIAI ĐOẠN 1: THIẾT KẾ BACKEND (/backend/sporta)
1. Database Schema & Entities

Tạo Entity TicketSession (Ca xé vé):

id (UUID)

venue_id, court_id (Để khóa sân)

play_date (LocalDate)

start_time (LocalTime) - Tuân thủ quy tắc kiến trúc số 3

end_time (LocalTime)

price_per_ticket (BigDecimal)

max_slots (Integer)

booked_slots (Integer - mặc định 0)

skill_level (Enum: BEGINNER, INTERMEDIATE, ADVANCED, ALL)

status (Enum: OPEN, FULL, CANCELLED)

Tạo Entity Ticket (Vé khách đã mua):

id (UUID)

session_id (FK tới TicketSession)

user_id (FK tới User)

status (Enum: UNUSED, USED, REFUNDED)

qr_code_token (String - JWT token)

2. Xử lý Logic chặn sân (Double Booking Prevention)

Trong TicketSessionService, khi tạo thành công 1 TicketSession, hệ thống phải gọi đến LockLog hoặc cơ chế tạo Booking nội bộ để khóa (lock) court_id trong khoảng thời gian từ start_time đến end_time. Khách hàng thông thường sẽ không thể đặt nguyên sân vào khung giờ này nữa.

3. API Endpoints cần tạo:

GET /api/owner/ticket-sessions/today: Lấy danh sách các trận xé vé hôm nay của Venue.

POST /api/owner/ticket-sessions: Tạo mới 1 trận xé vé.

POST /api/owner/tickets/check-in: Nhận chuỗi token từ mã QR, verify JWT, kiểm tra UNUSED, chuyển thành USED và trả về thông tin (Tên khách, Giờ chơi, Số sân).

GIAI ĐOẠN 2: THIẾT KẾ FRONTEND CHỦ SÂN (/web-owner)
Tuân thủ quy tắc: Khớp tuyệt đối DTO, không tạo ô nhập thủ công cho dữ liệu dẫn xuất.

1. Định nghĩa DTO & Services (TypeScript)

Tạo ticketSession.types.ts khớp với DTO Backend.

Cập nhật venueService.ts hoặc tạo ticketService.ts chứa các hàm gọi API: getTodaySessions, createSession, scanTicketCheckIn.

2. Giao diện Cụm "Quản lý Xé vé" (Ticket Sessions Tab)

Vị trí: Tích hợp vào OperationsSidebar hoặc một Tab mới trong OperationsOverviewTab.tsx / DesktopDashboardPage.tsx.

Component TicketSessionList:

Trạng thái rỗng: Hiển thị Empty State với nội dung "Hôm nay sân chưa tạo trận xé vé nào" cùng nút "Tạo trận ngay".

Trạng thái có dữ liệu: Hiển thị dạng lưới (Grid/Card) thông tin các trận: Khung giờ, Cấp độ, Số slot đã lấp đầy (ví dụ: 5/10), Giá vé.

Component CreateTicketSessionModal:

Form fields:

Date Picker (Mặc định hôm nay).

Time Picker: Khung giờ bắt đầu & Kết thúc (Chỉ gửi HH:mm về backend).

Select Court: Chọn sân cụ thể sẽ diễn ra trận đấu.

Number Input: Giá vé/người.

Number Input: Số lượng tối đa (Max slots).

Select: Trình độ (Skill Level).

Lưu ý UI: Sử dụng các component dùng chung có sẵn trong src/common/ui/form/.

3. Giao diện & Chức năng "Quét QR Check-in"

Vị trí: Một nút nổi (FloatingActionButton) hoặc nút to rõ ràng trên Dashboard/Sidebar có tên "Quét mã QR".

Component QRScannerModal:

Tích hợp thư viện quét mã vạch/QR (khuyến nghị html5-qrcode hoặc react-qr-reader bản mới nhất hỗ trợ hook).

Yêu cầu quyền truy cập Camera của thiết bị.

Sau khi quét thành công chuỗi string, lập tức tạm dừng camera (pause scanner), gọi API POST /check-in.

Kết quả trả về sau khi quét:

Thành công (Hiển thị Alert xanh/Dialog success): Hiện Tên khách hàng, Trình độ, Trận xé vé (Sân số mấy, Khung giờ). Có nút "Hoàn tất".

Thất bại (Hiển thị Alert đỏ): Vé không hợp lệ, Vé đã được sử dụng trước đó (kèm thời gian đã quét), Vé không thuộc sân này. Có nút "Quét lại".

PHẦN 3: PROMPT MẪU ĐỂ GIAO VIỆC CHO AI AGENT
Bạn có thể copy đoạn prompt dưới đây, giao cho AI để bắt đầu implement từng phần để đảm bảo code sinh ra không bị lỗi:

Nhiệm vụ 1 (Backend): "Hãy đóng vai trò Backend Developer cho dự án Sporta. Dựa trên System Context, hãy tạo Entity TicketSession và Ticket. Tạo REST API Controller, Service, Repository cho Chủ sân để tạo mới TicketSession. Đảm bảo rằng khi lưu TicketSession, hệ thống sẽ tự động tạo một LockLog để khóa sân (Court) tương ứng, ngăn chặn việc đặt sân truyền thống (double booking). Hãy dùng định dạng LocalTime cho start_time và end_time. Trả về cho tôi code Java hoàn chỉnh."

Nhiệm vụ 2 (Backend Security): "Viết hàm sinh JWT Token cho Ticket và API Check-in. API Check-in POST /api/owner/tickets/check-in sẽ nhận vào chuỗi token quét từ QR, kiểm tra validate JWT, kiểm tra trạng thái vé. Nếu UNUSED thì đổi thành USED và trả về ResponseDTO chứa tên user, số sân, thời gian. Nếu đã USED thì ném ra CustomException."

Nhiệm vụ 3 (Frontend /web-owner): "Tôi đang làm việc trong /web-owner. Hãy viết các interfaces TypeScript DTO cho TicketSession và tạo hook useTicketSessions.ts sử dụng React Query (hoặc SWR tùy stack hiện tại). Tiếp theo, tạo component CreateTicketSessionModal.tsx sử dụng form, tuân thủ UI components trong src/common/ui. Form yêu cầu: Chọn ngày, Chọn giờ (TimePicker gửi string HH:mm), Chọn sân, Mức giá, Số slot, Trình độ."

Nhiệm vụ 4 (Frontend /web-owner): "Tạo component TicketScannerModal.tsx tích hợp chức năng mở Camera để quét mã QR. Khi quét ra đoạn mã, tự động gọi API check-in mà ta đã khai báo. Xử lý UI hiển thị kết quả Thành công (báo số sân thực tế cho khách) hoặc Thất bại (Vé giả/đã dùng) bằng các Toast hoặc Modal feedback."
# Sporta Backend API

Phân hệ Backend chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ, giao dịch thanh toán và đối soát dữ liệu cho nền tảng Sporta.

## 1. Công Nghệ Sử Dụng

* **Ngôn ngữ:** Java 21
* **Framework:** Spring Boot 3.2.x
* **Cơ sở dữ liệu:** PostgreSQL 15
* **Bảo mật:** Spring Security (Dự kiến tích hợp JWT/OAuth2)

## 2. Hướng Dẫn Vận Hành

Yêu cầu cơ sở dữ liệu PostgreSQL đã được khởi chạy thông qua Docker Compose ở thư mục gốc.

Thực thi lệnh sau để biên dịch và chạy ứng dụng:
`./mvnw spring-boot:run`
(Hoặc chạy trực tiếp file `ApiApplication.java` thông qua IDE).

Máy chủ API sẽ hoạt động tại: `http://localhost:8387`

## 3. Lưu Ý Đặc Biệt Về PostgreSQL

Đây là hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, có một số khác biệt so với MySQL cần lưu ý:
* **Kiểu dữ liệu:** PostgreSQL kiểm tra kiểu dữ liệu rất nghiêm ngặt. Phải sử dụng đúng chuẩn (ví dụ: `UUID` thay vì `VARCHAR` cho khóa chính định danh).
* **Thay đổi cấu trúc:** Tuyệt đối không thay đổi cấu trúc bảng (Table Schema) trực tiếp thông qua công cụ quản lý giao diện. Mọi thay đổi cấu trúc cần được quản lý thông qua Entity JPA hoặc công cụ Migration (sẽ được tích hợp sau).
* **Dữ liệu không gian:** Nền tảng được chuẩn bị để sử dụng PostGIS trong tương lai nhằm xử lý các nghiệp vụ tìm kiếm sân theo tọa độ địa lý.
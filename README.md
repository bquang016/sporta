# Nền Tảng Sàn Giao Dịch Thể Thao - Sporta Platform

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc hệ thống và hướng dẫn khởi tạo môi trường phát triển nội bộ cho dự án Sporta.

## 1. Tổng Quan Kiến Trúc Hệ Thống

Hệ thống được thiết kế theo mô hình Monorepo, bao gồm 4 phân hệ chính và 1 cơ sở dữ liệu tập trung:

* `backend/`: Hệ thống API cốt lõi xử lý nghiệp vụ (Java 21, Spring Boot).
* `web-admin/`: Giao diện quản trị viên hệ thống (React.js, Vite, Tailwind v4).
* `web-owner/`: Ứng dụng lai (Hybrid App) dành cho chủ sân quản lý và xé vé (React.js, Capacitor).
* `mobile-user/`: Ứng dụng di động dành cho người dùng tìm và đặt sân (React Native, Expo).
* `Cơ sở dữ liệu`: PostgreSQL 15, được chứa trong Docker container.

## 2. Yêu Cầu Môi Trường (Prerequisites)

Để vận hành mã nguồn, thiết bị cần được cài đặt các phần mềm sau:
* Node.js (Phiên bản 20.x trở lên).
* Java Development Kit (JDK 21).
* Docker Desktop (Dành cho việc chạy cơ sở dữ liệu).
* Ứng dụng Expo Go trên thiết bị di động (Dành cho việc kiểm thử `mobile-user`).

## 3. Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

Bước 1: Khởi động Cơ sở dữ liệu nội bộ.
Từ thư mục gốc `sporta-platform`, thực thi lệnh:
`docker-compose up -d`

Bước 2: Khởi chạy các phân hệ con.
Di chuyển vào từng thư mục (`backend`, `web-admin`, `web-owner`, `mobile-user`) và làm theo hướng dẫn trong file README riêng của từng phân hệ.

## 4. Quy Tắc Làm Việc Nhóm

* **Quản lý nhánh (Branching):** Mọi tính năng mới phải được phát triển trên nhánh riêng biệt xuất phát từ nhánh `develop` (Cú pháp: `feature/tên-tính-năng`).
* **Pull Request:** Bắt buộc tạo Pull Request và yêu cầu ít nhất một thành viên xem xét (Review Code) trước khi gộp mã nguồn.
* **Cấu trúc thư mục:** Không cài đặt các thư viện (npm/maven) tại thư mục gốc. Mỗi phân hệ sở hữu cơ chế quản lý gói độc lập.
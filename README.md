# RibbitTalk Frontend

Tài liệu hướng dẫn cài đặt và chạy Frontend (Next.js + TailwindCSS + Docker) cho dự án RibbitTalk. Mọi thao tác đều được đóng gói sẵn trong Docker.

---

## 1. Chuẩn bị ban đầu (Setup)

**Bước 1: Tạo file cấu hình môi trường (.env)**
Mở terminal tại thư mục `frontend` và tạo file `.env`:
```bash
# Nội dung file .env nên có:
PORT=3004
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

**Bước 2: Cài đặt thư viện trên máy gốc (tùy chọn nhưng nên làm)**
Lệnh này giúp trình soạn thảo (VS Code, WebStorm...) của bạn nhận diện code, không bị báo lỗi đỏ và tự động gợi ý code.
```bash
npm install
```

---

## 2. Môi trường Phát triển (Development / Hot-reload)

Khi làm UI hoặc ghép API, sử dụng chế độ này. Khi lưu file, trình duyệt sẽ tự động cập nhật thay đổi (hot-reload).

**Khởi động Frontend (chạy ngầm):**
```bash
docker compose up -d
```

**Xem log để biết Next.js đã compile xong chưa:**
```bash
docker compose logs -f nextjs_frontend_dev
```
*Truy cập ứng dụng tại: http://localhost:3004*

**Tắt Frontend:**
```bash
docker compose down
```

---

## 3. Môi trường Thực tế (Production)

Khi đưa lên server chạy thực tế, Next.js cần được build thành các file tĩnh để tối ưu hóa tốc độ.

**Bước 1: Build Docker Image và Chạy**
```bash
docker compose --profile prod up -d --build
```
*(Lệnh `--build` là bắt buộc để Next.js lấy code mới nhất và tiến hành chạy `npm run build` ở bên trong container).*

**Bước 2: Xem log Production**
```bash
docker compose logs -f nextjs_frontend_prod
```

**Bước 3: Tắt Production**
```bash
docker compose --profile prod down
```

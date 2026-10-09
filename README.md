# 🎀 My Profile — Pastel Bunny Portfolio

Chào mừng bạn đến với website cá nhân của mình! 🌷🐰

Đây là không gian nhỏ để mình giới thiệu bản thân, chia sẻ hành trình học tập và định hướng nghề nghiệp, đồng thời lưu lại các dự án, thành tích và kinh nghiệm đã tích lũy trong quá trình học **Thương mại điện tử (E-commerce)**.

Mình quan tâm đến lĩnh vực **Business Analysis (BA)**, đặc biệt là phân tích yêu cầu, quy trình nghiệp vụ và cách công nghệ có thể hỗ trợ giải quyết các vấn đề trong kinh doanh.

## 🌸 Các trang trên website

| Trang | Nội dung |
|---|---|
| **Home** | Lời chào, giới thiệu ngắn và các lĩnh vực mình quan tâm |
| **About** | Thông tin cá nhân và định hướng nghề nghiệp |
| **Skills** | Các kỹ năng đang học tập và phát triển |
| **Projects** | Bài tập, dự án cá nhân và dự án học tập; có bộ lọc theo danh mục |
| **Achievements** | Thành tích và những dấu mốc đáng nhớ |
| **Experience** | Kinh nghiệm và hoạt động đã tham gia |
| **Contact** | Liên kết mạng xã hội và biểu mẫu liên hệ |

## ✨ Điểm nổi bật

- Giao diện pastel hồng nhẹ nhàng, kết hợp các chi tiết dễ thương lấy cảm hứng từ thỏ.
- Thiết kế responsive, hỗ trợ hiển thị trên máy tính và điện thoại.
- Hiệu ứng tương tác nhẹ nhàng: chữ tự gõ ở trang chủ, nội dung xuất hiện khi cuộn, hiệu ứng lấp lánh và hiệu ứng khi nhấp chuột.
- Tôn trọng cài đặt giảm chuyển động của thiết bị.
- Form liên hệ cho phép khách truy cập gửi tin nhắn về email.
- Có cơ chế chống spam cho form liên hệ, gồm ô bẫy bot và giới hạn số lần gửi.

## 🛠️ Công nghệ sử dụng

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express
- Mailgun API hoặc SMTP để gửi email

## 📂 Cấu trúc dự án

```text
my-profile/
├── server.js
├── lib/
│   ├── contact.js
│   └── mailgun.js
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── các trang HTML
├── .env.example
├── package.json
└── README.md
```

## 🚀 Chạy dự án trên máy tính

### Yêu cầu
- Node.js phiên bản 18 trở lên
- npm

### Cài đặt

1. Clone repository về máy và mở thư mục dự án.
2. Cài đặt các gói phụ thuộc:

   ```bash
   npm install
   ```

3. Tạo file `.env` từ file mẫu:

   ```bash
   cp .env.example .env
   ```

   Trên Windows, bạn cũng có thể sao chép `.env.example` và đổi tên bản sao thành `.env`.

4. Điền các biến môi trường cần thiết vào `.env`.
5. Khởi động server:

   ```bash
   npm start
   ```

6. Mở trình duyệt tại `http://localhost:3000`.

## 💌 Cấu hình gửi email

Điền thông tin email trong file `.env` trên máy hoặc trong phần Environment của nền tảng hosting:

```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_verified_mailgun_domain
MAILGUN_REGION=us
MAIL_FROM=contact@your_verified_mailgun_domain
MAIL_TO=your_email@example.com
```

**Lưu ý bảo mật và cấu hình:**
- Thay các giá trị mẫu bằng thông tin của bạn.
- `MAIL_FROM` cần phù hợp với domain và cấu hình gửi thư trên Mailgun.
- Nếu sử dụng Mailgun Sandbox, hãy kiểm tra người nhận đã được xác minh/ủy quyền theo yêu cầu của tài khoản.
- Nếu frontend và backend được triển khai ở hai địa chỉ khác nhau, hãy cấu hình `ALLOWED_ORIGIN` và cập nhật `CONTACT_ENDPOINT` trong `public/js/script.js` để trỏ đến backend.
- **Không commit file `.env` hoặc công khai API key trên GitHub.** Chỉ lưu khóa bí mật trong biến môi trường của máy hoặc nền tảng hosting.

## 🌐 Triển khai website

1. Đưa mã nguồn lên GitHub, bảo đảm không tải lên file `.env` hoặc thông tin bí mật.
2. Triển khai backend trên nền tảng hỗ trợ Node.js, chẳng hạn Render hoặc Railway.
3. Cấu hình các biến môi trường trong phần cài đặt của dịch vụ backend.
4. Cập nhật endpoint liên hệ của frontend để trỏ đến backend đã triển khai.
5. Cấu hình domain gửi thư trên Mailgun, bao gồm các bản ghi xác thực được yêu cầu.
6. Gửi thử biểu mẫu liên hệ và kiểm tra log backend cùng trạng thái trong Mailgun.

> GitHub Pages chỉ lưu trữ nội dung tĩnh; nó không chạy trực tiếp server Node.js. Nếu dùng GitHub Pages cho frontend, backend cần được triển khai riêng.

## 🎨 Tùy chỉnh giao diện

- **Ảnh đại diện:** `public/images/avatar.jpg`
- **Logo:** `public/images/logo.png`
- **Favicon:** `public/images/favicon.png`
- **Màu sắc và font chữ:** `public/css/style.css`
- **Liên kết mạng xã hội:** cập nhật các placeholder như `YOUR_GITHUB_LINK`, `YOUR_LINKEDIN_LINK` và `YOUR_INSTAGRAM_LINK` trong các trang tương ứng.

## 🌱 Định hướng phát triển

- Bổ sung thêm các dự án học tập và dự án cá nhân liên quan đến Business Analysis.
- Chia sẻ kinh nghiệm, tài liệu và bài học thông qua blog cá nhân.
- Cải thiện trải nghiệm trên điện thoại, khả năng truy cập và hiệu năng.
- Khám phá các tính năng AI hỗ trợ khách truy cập tìm nội dung phù hợp trên website.

## 💗 Lời kết

Website này ghi lại hành trình học hỏi và phát triển của mình — từng bước nhỏ một. Mình vẫn đang tiếp tục học tập, thử nghiệm và khám phá con đường phù hợp để trở thành Business Analyst.

Cảm ơn bạn đã ghé thăm góc nhỏ của mình! 🌸🐇

---

Made with ♡ by **Khanh**

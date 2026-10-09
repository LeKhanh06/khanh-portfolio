require('dotenv').config();
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const { makeLimiter, createHandler } = require('./lib/contact');
const { createMailgunTransport } = require('./lib/mailgun');

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = '465',
  SMTP_SECURE = 'true',
  SMTP_USER,
  SMTP_PASS,
  MAIL_TO,
  MAIL_FROM,
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_REGION = 'us',
  ALLOWED_ORIGIN = '',
  PORT = 3000,
} = process.env;

// Có khóa Mailgun → gửi bằng Mailgun API; không có → gửi bằng SMTP (vd Gmail)
const useMailgun = Boolean(MAILGUN_API_KEY && MAILGUN_DOMAIN);

if (useMailgun) {
  if (!MAIL_TO) console.warn('⚠  Thiếu MAIL_TO trong .env — chưa biết gửi tin nhắn về mail nào.');
} else if (!SMTP_USER || !SMTP_PASS) {
  console.warn('⚠  Chưa cấu hình Mailgun hay SMTP trong .env — form liên hệ sẽ không gửi được mail.');
}

const transporter = useMailgun
  ? createMailgunTransport({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN, region: MAILGUN_REGION })
  : nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

transporter.verify()
  .then(() => console.log(useMailgun ? '✓ Dùng Mailgun API' : '✓ Kết nối SMTP sẵn sàng'))
  .catch(err => console.warn('⚠  Chưa kết nối được SMTP:', err.message));

const mailFrom = MAIL_FROM || (useMailgun ? `postmaster@${MAILGUN_DOMAIN}` : SMTP_USER);
const mailTo = MAIL_TO || SMTP_USER;

const limiter = makeLimiter({ windowMs: 10 * 60 * 1000, max: 3 });   // 3 tin / 10 phút / IP
setInterval(() => limiter.sweep(), 10 * 60 * 1000).unref();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);          // chạy sau proxy của Render/Railway/Vercel… để lấy đúng IP người gửi

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});

// CORS: chỉ cần khi trang web và server nằm ở hai địa chỉ khác nhau
const allowedOrigins = ALLOWED_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    });
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.post('/api/contact', createHandler({
  transporter,
  limiter,
  from: mailFrom,
  to: mailTo,
}));

// JSON sai định dạng / quá lớn → trả lỗi gọn thay vì trang lỗi mặc định
app.use('/api', (err, req, res, next) => {
  res.status(400).json({ ok: false, error: 'Invalid request.' });
});

// Phục vụ website (đặt toàn bộ file site vào thư mục /public)
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));

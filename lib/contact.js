// Logic của form liên hệ: kiểm tra dữ liệu, giới hạn tần suất, dựng mail.
// Tách riêng (không phụ thuộc Express) để dễ kiểm thử.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 80, email: 120, messageMin: 5, messageMax: 3000 };

const clean = v => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim() : '');

// Trả về { data } nếu hợp lệ, hoặc { error } (thông báo hiển thị cho người dùng)
function validate(body = {}) {
  const name = clean(body.name).replace(/\s+/g, ' ');
  const email = clean(body.email);
  const message = clean(body.message);

  if (!name || !email || !message) return { error: 'Please fill in all fields.' };
  if (name.length > LIMITS.name) return { error: 'Your name is too long.' };
  if (email.length > LIMITS.email || !EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' };
  if (message.length < LIMITS.messageMin) return { error: 'Your message is a bit too short.' };
  if (message.length > LIMITS.messageMax) return { error: `Your message is too long (max ${LIMITS.messageMax} characters).` };
  return { data: { name, email, message } };
}

// Giới hạn: mỗi IP tối đa `max` lần trong `windowMs`
function makeLimiter({ windowMs = 10 * 60 * 1000, max = 3 } = {}) {
  const hits = new Map();
  return {
    take(key, now = Date.now()) {
      const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
      if (recent.length >= max) { hits.set(key, recent); return false; }
      recent.push(now);
      hits.set(key, recent);
      return true;
    },
    sweep(now = Date.now()) {
      for (const [k, v] of hits) {
        const recent = v.filter(t => now - t < windowMs);
        if (recent.length) hits.set(k, recent); else hits.delete(k);
      }
    },
  };
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function buildMail({ name, email, message }, { from, to }) {
  const oneLineName = name.replace(/[\r\n]+/g, ' ');
  return {
    from: { name: 'Portfolio Contact', address: from },
    to,
    replyTo: { name: oneLineName, address: email },   // bấm "Trả lời" là trả lời thẳng cho người gửi
    subject: `[Portfolio] New message from ${oneLineName}`,
    text: `Name: ${oneLineName}\nEmail: ${email}\n\n${message}`,
    html:
      `<div style="font-family:Arial,sans-serif;max-width:560px;line-height:1.6;color:#2d1b3d">` +
      `<h2 style="margin:0 0 12px;color:#b8386f">New message from your portfolio</h2>` +
      `<p style="margin:4px 0"><b>Name:</b> ${esc(oneLineName)}</p>` +
      `<p style="margin:4px 0"><b>Email:</b> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` +
      `<hr style="border:none;border-top:1px solid #eee;margin:14px 0">` +
      `<p style="white-space:pre-wrap;margin:0">${esc(message)}</p></div>`,
  };
}

// Tạo hàm xử lý cho POST /api/contact
function createHandler({ transporter, limiter, from, to, log = console }) {
  return async function contactHandler(req, res) {
    if (!limiter.take(req.ip || 'unknown')) {
      return res.status(429).json({ ok: false, error: 'Too many messages. Please try again in a few minutes.' });
    }

    const body = req.body || {};

    // Ô ẩn "company_url": người thật không thấy nên không điền; bot điền → giả vờ thành công, không gửi mail
    if (typeof body.company_url === 'string' && body.company_url.trim() !== '') {
      log.warn('Honeypot triggered, mail skipped');
      return res.json({ ok: true });
    }

    const { data, error } = validate(body);
    if (error) return res.status(400).json({ ok: false, error });

    try {
      await transporter.sendMail(buildMail(data, { from, to }));
      return res.json({ ok: true });
    } catch (err) {
      log.error('Send mail failed:', err && err.message);
      return res.status(502).json({ ok: false, error: 'Could not send your message right now. Please try again later.' });
    }
  };
}

module.exports = { validate, makeLimiter, buildMail, createHandler, LIMITS };

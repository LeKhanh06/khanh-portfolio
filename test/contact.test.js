const test = require('node:test');
const assert = require('node:assert');
const { validate, makeLimiter, buildMail, createHandler } = require('../lib/contact');

const good = { name: 'Lan Anh', email: 'lan@example.com', message: 'Hello, I would like to talk about an internship.' };
const fakeRes = () => ({ statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } });
const mk = (over = {}) => {
  const sent = [];
  const transporter = { sendMail: async m => { if (over.fail) throw new Error('smtp down'); sent.push(m); } };
  const handler = createHandler({ transporter, limiter: over.limiter || makeLimiter(), from: 'me@gmail.com', to: 'me@gmail.com', log: { error() {} } });
  return { sent, handler };
};

test('validate: thiếu trường / email sai / quá dài / quá ngắn', () => {
  assert.ok(validate({}).error);
  assert.ok(validate({ ...good, name: '   ' }).error);
  assert.match(validate({ ...good, email: 'abc' }).error, /valid email/);
  assert.match(validate({ ...good, message: 'hi' }).error, /short/);
  assert.match(validate({ ...good, message: 'x'.repeat(3001) }).error, /too long/);
  assert.match(validate({ ...good, name: 'a'.repeat(81) }).error, /too long/);
  assert.ok(validate({ name: ['x'], email: 5, message: {} }).error);          // sai kiểu dữ liệu
});

test('validate: dữ liệu hợp lệ được làm sạch', () => {
  const { data } = validate({ ...good, name: '  Lan    Anh ' });
  assert.strictEqual(data.name, 'Lan Anh');
});

test('limiter: chặn khi quá số lần, mở lại sau khi hết thời gian', () => {
  const l = makeLimiter({ windowMs: 1000, max: 2 });
  assert.ok(l.take('ip', 0)); assert.ok(l.take('ip', 10));
  assert.strictEqual(l.take('ip', 20), false);
  assert.ok(l.take('other', 20));
  assert.ok(l.take('ip', 2000));
});

test('buildMail: escape HTML, chống chèn header, có replyTo', () => {
  const m = buildMail({ name: 'Eve\r\nBcc: x@y.z', email: 'e@x.com', message: '<script>alert(1)</script>' }, { from: 'me@gmail.com', to: 'me@gmail.com' });
  assert.ok(!m.subject.includes('\n') && !m.subject.includes('\r'));
  assert.ok(!m.html.includes('<script>'));
  assert.match(m.html, /&lt;script&gt;/);
  assert.strictEqual(m.replyTo.address, 'e@x.com');
});

test('handler: gửi mail thành công', async () => {
  const { sent, handler } = mk(); const res = fakeRes();
  await handler({ ip: '1.1.1.1', body: good }, res);
  assert.deepStrictEqual(res.body, { ok: true });
  assert.strictEqual(sent.length, 1);
  assert.strictEqual(sent[0].to, 'me@gmail.com');
});

test('handler: dữ liệu sai → 400, không gửi', async () => {
  const { sent, handler } = mk(); const res = fakeRes();
  await handler({ ip: '1.1.1.1', body: { ...good, email: 'no' } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(sent.length, 0);
});

test('handler: bot điền ô ẩn → báo ok nhưng KHÔNG gửi', async () => {
  const { sent, handler } = mk(); const res = fakeRes();
  await handler({ ip: '2.2.2.2', body: { ...good, website: 'http://spam.example' } }, res);
  assert.deepStrictEqual(res.body, { ok: true });
  assert.strictEqual(sent.length, 0);
});

test('handler: quá giới hạn → 429', async () => {
  const { sent, handler } = mk({ limiter: makeLimiter({ max: 2 }) });
  for (let i = 0; i < 2; i++) await handler({ ip: '3.3.3.3', body: good }, fakeRes());
  const res = fakeRes();
  await handler({ ip: '3.3.3.3', body: good }, res);
  assert.strictEqual(res.statusCode, 429);
  assert.strictEqual(sent.length, 2);
});

test('handler: SMTP lỗi → 502 với thông báo thân thiện', async () => {
  const { handler } = mk({ fail: true }); const res = fakeRes();
  await handler({ ip: '4.4.4.4', body: good }, res);
  assert.strictEqual(res.statusCode, 502);
  assert.ok(!/smtp down/.test(res.body.error));
});

test('handler: body rỗng / undefined không làm sập', async () => {
  const { handler } = mk(); const res = fakeRes();
  await handler({ ip: '5.5.5.5' }, res);
  assert.strictEqual(res.statusCode, 400);
});

// ---- Mailgun transport ----
const { createMailgunTransport } = require('../lib/mailgun');
test('mailgun: gọi đúng địa chỉ, xác thực, Reply-To và nội dung', async () => {
  let call;
  const t = createMailgunTransport({ apiKey: 'key-123', domain: 'mg.example.com', fetchImpl: async (url, opt) => { call = { url, opt }; return { ok: true }; } });
  await t.sendMail(buildMail(good, { from: 'postmaster@mg.example.com', to: 'me@gmail.com' }));
  assert.strictEqual(call.url, 'https://api.mailgun.net/v3/mg.example.com/messages');
  assert.strictEqual(call.opt.headers.Authorization, 'Basic ' + Buffer.from('api:key-123').toString('base64'));
  assert.strictEqual(call.opt.body.get('to'), 'me@gmail.com');
  assert.strictEqual(call.opt.body.get('h:Reply-To'), '"Lan Anh" <lan@example.com>');
  assert.match(call.opt.body.get('subject'), /Lan Anh/);
});
test('mailgun: vùng EU và lỗi từ Mailgun được ném ra', async () => {
  let url;
  const ok = createMailgunTransport({ apiKey: 'k', domain: 'd.com', region: 'eu', fetchImpl: async u => { url = u; return { ok: true }; } });
  await ok.sendMail(buildMail(good, { from: 'a@d.com', to: 'b@c.com' }));
  assert.ok(url.startsWith('https://api.eu.mailgun.net/'));
  const bad = createMailgunTransport({ apiKey: 'k', domain: 'd.com', fetchImpl: async () => ({ ok: false, status: 401, text: async () => 'Forbidden' }) });
  await assert.rejects(() => bad.sendMail(buildMail(good, { from: 'a@d.com', to: 'b@c.com' })), /Mailgun 401/);
});
test('mailgun: tên có dấu ngoặc kép/xuống dòng không phá header', () => {
  const m = buildMail({ ...good, name: 'Ev"e\nX' }, { from: 'a@d.com', to: 'b@c.com' });
  const body = new URLSearchParams();
  let captured; createMailgunTransport({ apiKey: 'k', domain: 'd.com', fetchImpl: async (u, o) => { captured = o.body; return { ok: true }; } }).sendMail(m);
  return Promise.resolve().then(() => { assert.ok(!/[\r\n]/.test(captured.get('h:Reply-To'))); });
});

// Gửi mail qua Mailgun HTTP API (cổng 443, không cần SMTP, không cần cài thêm thư viện).
// Có cùng giao diện `sendMail(mail)` với Nodemailer nên dùng thay thế được.

const fmt = a => (typeof a === 'string' ? a : `"${String(a.name || '').replace(/["\\\r\n]/g, '')}" <${a.address}>`);

function createMailgunTransport({ apiKey, domain, region = 'us', fetchImpl = fetch }) {
  const base = String(region).toLowerCase() === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';
  return {
    async sendMail(mail) {
      const body = new URLSearchParams({
        from: fmt(mail.from), to: mail.to, subject: mail.subject, text: mail.text, html: mail.html,
      });
      if (mail.replyTo) body.set('h:Reply-To', fmt(mail.replyTo));

      const res = await fetchImpl(`${base}/v3/${domain}/messages`, {
        method: 'POST',
        headers: { Authorization: 'Basic ' + Buffer.from('api:' + apiKey).toString('base64') },
        body,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Mailgun ${res.status}: ${detail.slice(0, 200)}`);
      }
    },
    async verify() { return true; },
  };
}

module.exports = { createMailgunTransport };

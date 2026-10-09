const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasHover = matchMedia('(hover: hover)').matches;

const BUNNY = `<svg class="motif-svg" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="sp1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD3E6"/><stop offset=".55" stop-color="#FF8FBD"/><stop offset="1" stop-color="#E6498F"/></linearGradient></defs><path d="M30 2 C32 20 40 28 58 30 C40 32 32 40 30 58 C28 40 20 32 2 30 C20 28 28 20 30 2Z" fill="url(#sp1)"/><path d="M52 6 C52.8 12 55 14 60 15 C55 16 52.8 18 52 24 C51.2 18 49 16 44 15 C49 14 51.2 12 52 6Z" fill="#FFB6D3"/><circle cx="14" cy="52" r="3.5" fill="#FFD3E6"/></svg>`;

// ===== Toast =====
const toast = document.createElement('div');
toast.className = 'toast';
document.body.appendChild(toast);
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Menu hamburger trên mobile =====
const navLinks = document.getElementById('nav-links');
const burger = document.getElementById('hamburger');
burger.innerHTML = '<b></b><b></b><b></b>';
burger.setAttribute('aria-label', 'Menu');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});

// ===== Tô sáng trang hiện tại =====
const currentPage = location.pathname.split('/').pop() || 'index.html';
navLinks.querySelectorAll('a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
});

// ===== Chuyển trang mượt =====
document.querySelectorAll('a[href$=".html"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => (location.href = a.href), 250);
  });
});
window.addEventListener('pageshow', () => document.body.classList.remove('leaving'));

// ===== Hiệu ứng xuất hiện khi cuộn (lần lượt, rồi trả lại hover mượt) =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('visible');
    observer.unobserve(el);
    setTimeout(() => { el.style.transitionDelay = ''; el.classList.add('done'); }, 1200);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 0.12 + 's';
  observer.observe(el);
});

// ===== Header đổ bóng + Back to Top + thanh tiến trình =====
const header = document.querySelector('.header');
const progress = document.createElement('div');
progress.className = 'progress';
document.body.appendChild(progress);
const backTop = document.createElement('button');
backTop.className = 'back-top';
backTop.setAttribute('aria-label', 'Back to top');
backTop.innerHTML = '<span class="arr"></span>';
document.body.appendChild(backTop);
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', scrollY > 20);
  backTop.classList.toggle('show', scrollY > 400);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

// ===== Card: vệt sáng theo chuột + nghiêng 3D nhẹ =====
document.addEventListener('pointermove', e => {
  const c = e.target.closest && e.target.closest('.card');
  if (!c) return;
  const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  c.style.setProperty('--mx', x + 'px');
  c.style.setProperty('--my', y + 'px');
  if (hasHover && !reduceMotion && c.classList.contains('done') && c.tagName !== 'FORM') {
    const rx = (y / r.height - .5) * -6, ry = (x / r.width - .5) * 6;
    c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  }
});
document.addEventListener('pointerout', e => {
  const c = e.target.closest && e.target.closest('.card');
  if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
});

// ===== Sparkles bay lên ở nền =====
if (!reduceMotion) {
  const box = document.createElement('div');
  box.className = 'sparkles';
  const chars = ['✦', '♡', '✧', '❀', '·'];
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left = Math.random() * 100 + '%';
    s.textContent = chars[i % chars.length];
    s.style.fontSize = 10 + Math.random() * 16 + 'px';
    s.style.animationDuration = 12 + Math.random() * 14 + 's';
    s.style.animationDelay = -Math.random() * 20 + 's';
    if (i % 2) s.style.color = 'var(--pink)';
    if (i % 3 === 0) s.style.color = 'var(--sky)';
    box.appendChild(s);
  }
  document.body.appendChild(box);
}

// ===== Vệt lấp lánh theo con trỏ (chỉ desktop) =====
if (hasHover && !reduceMotion) {
  let last = 0;
  window.addEventListener('pointermove', e => {
    const now = performance.now();
    if (now - last < 70) return;
    last = now;
    const t = document.createElement('span');
    t.className = 'trail';
    t.textContent = Math.random() > .5 ? '✦' : '♡';
    t.style.left = e.clientX + 'px';
    t.style.top = e.clientY + 'px';
    t.style.setProperty('--tx', (Math.random() - .5) * 40 + 'px');
    t.style.setProperty('--ty', 20 + Math.random() * 30 + 'px');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 800);
  });
}

// ===== Gõ chữ ở Hero (chỉ trang Home) =====
const heroSub = document.querySelector('.hero h2');
if (heroSub && !reduceMotion) {
  const text = heroSub.textContent.trim();
  heroSub.setAttribute('aria-label', text);
  heroSub.style.minHeight = heroSub.offsetHeight + 'px';
  heroSub.textContent = '';
  heroSub.classList.add('typing');
  let i = 0;
  setTimeout(function type() {
    heroSub.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(type, 45);
    else setTimeout(() => heroSub.classList.remove('typing'), 2500);
  }, 600);
}

// ===== Lọc project (chỉ chạy ở projects.html) =====
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.filter;
    document.querySelectorAll('.project').forEach(card => {
      const match = type === 'all' || card.dataset.category === type;
      card.classList.toggle('hide', !match);
      if (match) { card.classList.remove('show'); void card.offsetWidth; card.classList.add('show'); }
    });
  });
});

// ===== Form liên hệ: kiểm tra + gửi lên server (chỉ chạy ở contact.html) =====
// Cùng một server phục vụ web + API → để '/api/contact'.
// Nếu web đặt chỗ khác (vd GitHub Pages), đổi thành địa chỉ đầy đủ của server, vd 'https://ten-app.onrender.com/api/contact'
const CONTACT_ENDPOINT = '/api/contact';

const form = document.getElementById('contact-form');
if (form) {
  const err = document.getElementById('form-error');
  const submitBtn = form.querySelector('button[type="submit"]');
  let sending = false;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;

    const f = form.elements;
    const name = f.name.value.trim(), email = f.email.value.trim(), msg = f.message.value.trim();
    if (!name || !email || !msg) { err.textContent = 'Please fill in all fields.'; return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Please enter a valid email address.'; return; }
    err.textContent = '';

    sending = true;
    const label = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: msg, company_url: f.company_url ? f.company_url.value : '' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        err.textContent = data.error || 'Something went wrong. Please try again.';
      } else {
        form.reset();
        showToast('Thank you for reaching out! I will reply soon ♡');
      }
    } catch (_) {
      err.textContent = 'Network error. Please check your connection and try again.';
    } finally {
      sending = false;
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
}

// ================= V2: hiệu ứng thêm =================
// Màn hình chào (chỉ lần đầu mỗi phiên)
try {
  if (!sessionStorage.getItem('seen') && !reduceMotion) {
    const ld = document.createElement('div');
    ld.className = 'loader';
    ld.innerHTML = `<span>${BUNNY}</span><i></i>`;
    document.body.appendChild(ld);
    sessionStorage.setItem('seen', '1');
    setTimeout(() => ld.classList.add('hide'), 1000);
    setTimeout(() => ld.remove(), 1700);
  }
} catch (e) {}

// Tim/sao nổ ra khi click
if (!reduceMotion) {
  document.addEventListener('click', e => {
    const chars = ['♡', '✦', '❀', '✧'];
    for (let i = 0; i < 10; i++) {
      const b = document.createElement('span');
      b.className = 'burst';
      b.textContent = chars[i % chars.length];
      b.style.left = e.clientX + 'px';
      b.style.top = e.clientY + 'px';
      b.style.color = ['var(--rose)', 'var(--sky)', 'var(--pink)', 'var(--sky)'][i % 4];
      const a = (i / 10) * Math.PI * 2, d = 50 + Math.random() * 60;
      b.style.setProperty('--bx', Math.cos(a) * d + 'px');
      b.style.setProperty('--by', Math.sin(a) * d + 'px');
      b.style.setProperty('--br', (Math.random() - .5) * 240 + 'deg');
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 900);
    }
  });
}

// Nút "hít" theo con trỏ
if (hasHover && !reduceMotion) {
  document.querySelectorAll('.btn:not(.disabled)').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3 - 3}px)`;
    });
    btn.addEventListener('pointerleave', () => (btn.style.transform = ''));
  });
}

// Hero: avatar & chữ di chuyển nhẹ theo chuột (parallax)
const heroEl = document.querySelector('.hero');
if (heroEl) {
  if (hasHover && !reduceMotion) {
    const av = heroEl.querySelector('.avatar-wrap'), tx = heroEl.querySelector('.hero-inner > div');
    heroEl.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      av.style.transform = `translate(${x * 24}px,${y * 18}px)`;
      tx.style.transform = `translate(${x * -8}px,${y * -6}px)`;
    });
  }

}

// Thay emoji thỏ trong HTML bằng họa tiết lấp lánh SVG
document.querySelectorAll('.mascot, .mascot-big, .bunny').forEach(el => (el.innerHTML = BUNNY));

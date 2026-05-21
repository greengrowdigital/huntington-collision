// Huntington Collision Center — Premium interactions

// Loader
window.addEventListener('load', () => {
  setTimeout(() => {
    const l = document.querySelector('.loader');
    if (l) l.classList.add('hidden');
  }, 1100);
});

// Scroll progress
const scrollBar = document.querySelector('.scroll-progress');
if (scrollBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    scrollBar.style.width = pct + '%';
  });
}

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal,.reveal-stagger').forEach(el => io.observe(el));

// Side rail visibility + active
const rail = document.querySelector('.side-rail');
if (rail) {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const railLinks = Array.from(rail.querySelectorAll('a'));
  window.addEventListener('scroll', () => {
    rail.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
    let active = null;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= 200 && r.bottom > 200) { active = s.id; break; }
    }
    railLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active));
  });
}

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');
if (menuBtn && menuPanel) {
  menuBtn.addEventListener('click', () => menuPanel.classList.toggle('hidden'));
  menuPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menuPanel.classList.add('hidden')));
}

// Language toggle (EN/ES)
const I18N_KEY = 'hc-lang';
function applyLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-en],[data-es]').forEach(el => {
    const v = el.getAttribute('data-' + lang);
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll('[data-en-html],[data-es-html]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-html');
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-en-placeholder],[data-es-placeholder]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-placeholder');
    if (v != null) el.setAttribute('placeholder', v);
  });
  document.querySelectorAll('.lang-toggle [data-lang]').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });
  try { localStorage.setItem(I18N_KEY, lang); } catch (_) {}
}
const savedLang = (() => { try { return localStorage.getItem(I18N_KEY); } catch (_) { return null; } })() || 'en';
applyLang(savedLang);
document.querySelectorAll('.lang-toggle [data-lang]').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang')));
});

// Before/after slider
document.querySelectorAll('.ba-slider').forEach(slider => {
  const after = slider.querySelector('.ba-after');
  const handle = slider.querySelector('.ba-handle');
  if (!after || !handle) return;
  const move = (clientX) => {
    const r = slider.getBoundingClientRect();
    let x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    after.style.clipPath = `inset(0 ${(1 - x) * 100}% 0 0)`;
    handle.style.left = (x * 100) + '%';
  };
  let dragging = false;
  slider.addEventListener('mousedown', (e) => { dragging = true; move(e.clientX); });
  window.addEventListener('mousemove', (e) => { if (dragging) move(e.clientX); });
  window.addEventListener('mouseup', () => dragging = false);
  slider.addEventListener('touchstart', (e) => { dragging = true; move(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove', (e) => { if (dragging) move(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => dragging = false);
});

// Quote modal
const quoteOpen = document.querySelectorAll('[data-open-quote]');
const quoteModal = document.getElementById('quoteModal');
const quoteClose = document.querySelectorAll('[data-close-quote]');
quoteOpen.forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); if (quoteModal) quoteModal.classList.add('open'); }));
quoteClose.forEach(b => b.addEventListener('click', () => quoteModal && quoteModal.classList.remove('open')));
if (quoteModal) quoteModal.addEventListener('click', (e) => { if (e.target === quoteModal) quoteModal.classList.remove('open'); });

// Forms — fake submit handler
document.querySelectorAll('form[data-fake]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const out = form.querySelector('[data-form-result]');
    if (out) {
      const lang = document.documentElement.lang;
      out.textContent = lang === 'es'
        ? 'Gracias. Te contactaremos en menos de 24h.'
        : 'Thank you. We will reach out in under 24h.';
      out.classList.remove('hidden');
    }
    form.reset();
  });
});

// Year
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

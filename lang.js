// Language switcher: EN (default, lives in the HTML) / UA (from i18n-uk.js).
// Elements with data-i18n="<key>" get their innerHTML swapped.
// The choice is saved in localStorage.
(() => {
  const LANGS = { en: 'EN', uk: 'UA' };
  const root = document.documentElement;
  const originals = new Map();
  let originalTitle = '';

  function apply(lang) {
    const dict = lang === 'uk' ? window.I18N_UK || {} : null;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (!originals.has(el)) originals.set(el, el.innerHTML);
      const key = el.dataset.i18n;
      el.innerHTML = dict && dict[key] ? dict[key] : originals.get(el);
    });
    if (dict && dict.__title && document.body.dataset.page === 'home') {
      document.title = dict.__title;
    } else {
      document.title = originalTitle;
    }
    root.lang = lang;
    document.querySelectorAll('.lang-current').forEach((n) => (n.textContent = LANGS[lang]));
    document.querySelectorAll('.lang-menu [data-lang]').forEach((b) => {
      b.parentElement.hidden = b.dataset.lang === lang;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    originalTitle = document.title;
    let lang = 'en';
    try { lang = localStorage.getItem('lang') === 'uk' ? 'uk' : 'en'; } catch (e) {}
    apply(lang);

    const wrap = document.querySelector('.lang');
    if (!wrap) return;
    const btn = wrap.querySelector('.lang-btn');
    const menu = wrap.querySelector('.lang-menu');

    const open = (state) => {
      menu.hidden = !state;
      btn.setAttribute('aria-expanded', String(state));
      wrap.classList.toggle('is-open', state);
    };

    btn.addEventListener('click', (e) => { e.stopPropagation(); open(menu.hidden); });
    menu.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lang]');
      if (!b) return;
      const next = b.dataset.lang;
      try { localStorage.setItem('lang', next); } catch (err) {}
      apply(next);
      open(false);
      btn.focus();
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) open(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); } });
  });
})();

// "Back" on case pages: return to the previous page of this site if there is one.
// If that page is another case (reached via "Next case" at the bottom), land at
// its top instead of the restored scroll position; the portfolio list keeps its
// position so you don't lose your place there.
const BACK_TOP_KEY = 'backToTop';
document.addEventListener('click', (e) => {
  const a = e.target.closest('.back-link');
  if (!a) return;
  try {
    const ref = document.referrer && new URL(document.referrer);
    if (ref && ref.origin === location.origin && history.length > 1) {
      e.preventDefault();
      if (/\/case-[^/]*\.html$/.test(ref.pathname)) sessionStorage.setItem(BACK_TOP_KEY, '1');
      history.back();
    }
  } catch (err) {}
});

window.addEventListener('pageshow', () => {
  let flag = null;
  try { flag = sessionStorage.getItem(BACK_TOP_KEY); sessionStorage.removeItem(BACK_TOP_KEY); } catch (err) {}
  if (!flag) return;
  const top = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  top();
  requestAnimationFrame(top);            // after the browser's own scroll restoration
  setTimeout(top, 50);
});

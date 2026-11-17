// Scroll reveal: content blocks fade + slide up as they enter the viewport.
// Elements are picked automatically (outermost match wins, so a card fades as
// one unit, not word by word). Blocks entering together get a small stagger.
// Skipped for prefers-reduced-motion; the header (.nav) is never animated.
document.addEventListener('DOMContentLoaded', () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const SELECTOR = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'figure', 'img', 'table',
    '.section-head', '.cta', '.tags', '.job-years', '.cols > div', '.btn', '.text-link',
  ].join(',');
  const STAGGER = 70;   // ms between blocks revealed in the same batch
  const MAX_DELAY = 350;

  const candidates = [...document.querySelectorAll(`.container ${SELECTOR.split(',').join(', .container ')}`)]
    .filter((el) => !el.closest('.nav'));
  const set = new Set(candidates);
  const items = candidates.filter((el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
    return true;
  });

  items.forEach((el) => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    let i = 0;
    entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach((e) => {
        const el = e.target;
        el.style.transitionDelay = Math.min(i++ * STAGGER, MAX_DELAY) + 'ms';
        el.classList.add('is-visible');
        io.unobserve(el);
        // drop the delay afterwards so hover transitions aren't slowed down
        const done = (ev) => {
          if (ev.target !== el || ev.propertyName !== 'transform') return;
          el.style.transitionDelay = '';
          el.classList.add('reveal-done');
          el.removeEventListener('transitionend', done);
        };
        el.addEventListener('transitionend', done);
      });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

  items.forEach((el) => io.observe(el));
});

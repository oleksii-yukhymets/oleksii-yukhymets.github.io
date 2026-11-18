// Lightbox for case pages: click a screenshot to see it larger.
// Closes on click, Esc or the close button. Styles are injected here so the
// shared stylesheet does not need a new version.
(() => {
  const SELECTOR = '.cs-img img, .shot-frame img, .phones img';

  const css = `
    .lb-zoomable { cursor: zoom-in; }
    .lb { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;
      padding: 4vh 4vw; background: rgba(8, 8, 9, .86); opacity: 0;
      transition: opacity .2s ease; cursor: zoom-out; }
    .lb.is-open { opacity: 1; }
    .lb img { max-width: 100%; max-height: 92vh; width: auto; height: auto;
      border-radius: 10px; box-shadow: 0 24px 80px rgba(0, 0, 0, .5);
      transform: scale(.97); transition: transform .2s ease; background: #fff; }
    .lb.is-open img { transform: scale(1); }
    .lb-close { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px;
      border: 0; border-radius: 50%; background: rgba(255, 255, 255, .12); color: #fff;
      font-size: 22px; line-height: 40px; cursor: pointer; }
    .lb-close:hover { background: rgba(255, 255, 255, .22); }
    @media (prefers-reduced-motion: reduce) { .lb, .lb img { transition: none; } }
  `;

  let box = null;
  let lastFocus = null;

  function close() {
    if (!box) return;
    const el = box;
    box = null;
    el.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = '';
    setTimeout(() => el.remove(), 200);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  function open(img) {
    lastFocus = document.activeElement;
    box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', img.alt || 'Image');

    const big = document.createElement('img');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lb-close';
    btn.setAttribute('aria-label', 'Close');
    btn.textContent = '×';

    box.append(big, btn);
    box.addEventListener('click', close);
    document.body.appendChild(box);
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => box && box.classList.add('is-open'));
    btn.focus({ preventScroll: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    document.querySelectorAll(SELECTOR).forEach((img) => {
      img.classList.add('lb-zoomable');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('click', (e) => { e.preventDefault(); open(img); });
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
      });
    });
  });
})();

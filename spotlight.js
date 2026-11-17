// Cursor spotlight: a soft radial glow that follows the mouse.
// Visible only in the dark theme (hidden via CSS for [data-theme="light"]),
// skipped on touch devices and for prefers-reduced-motion.
document.addEventListener('DOMContentLoaded', () => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const CONFIG = {
    radius: 200,        // px
    brightness: 0.15,   // alpha at the centre
    color: '77,123,245', // #4d7bf5 — site --accent-text (dark theme)
    smoothing: 0.1,     // 0..1, lower = more lag; 1 = instant
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) CONFIG.smoothing = 1;

  const el = document.createElement('div');
  el.className = 'cursor-spotlight';
  el.setAttribute('aria-hidden', 'true');
  el.style.setProperty('--spot-r', CONFIG.radius + 'px');
  el.style.setProperty('--spot-c', `rgba(${CONFIG.color}, ${CONFIG.brightness})`);
  document.body.appendChild(el);

  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, seen = false;

  const tick = () => {
    x += (tx - x) * CONFIG.smoothing;
    y += (ty - y) * CONFIG.smoothing;
    el.style.setProperty('--spot-x', x + 'px');
    el.style.setProperty('--spot-y', y + 'px');
    raf = (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? requestAnimationFrame(tick) : 0;
  };

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!seen) { x = tx; y = ty; seen = true; }
    el.classList.add('is-active');
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => el.classList.remove('is-active'));
});

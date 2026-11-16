// Theme toggle with a "curtain" transition: dark (default) / light.
// A full-screen curtain in the next theme's colour drops from the top,
// the theme switches underneath it, then the curtain rises back up.
// The initial theme is applied by an inline snippet in <head> to avoid a flash.
// The choice is saved in localStorage.
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  const root = document.documentElement;
  const DURATION = 550; // ms, keep in sync with .theme-curtain transition
  const BG = { dark: '#080809', light: '#ffffff' };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const curtain = document.createElement('div');
  curtain.className = 'theme-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(curtain);

  let busy = false;

  const current = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

  const sync = () => {
    const light = current() === 'light';
    btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    btn.setAttribute('aria-pressed', String(!light));
  };

  const apply = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) {}
    sync();
  };

  sync();

  btn.addEventListener('click', () => {
    if (busy) return;
    const next = current() === 'light' ? 'dark' : 'light';

    if (reduceMotion.matches) { apply(next); return; }

    busy = true;
    curtain.style.background = BG[next];
    curtain.classList.add('is-falling');          // scaleY 0 -> 1

    setTimeout(() => {
      apply(next);
      curtain.classList.remove('is-falling');     // scaleY 1 -> 0 (rising)
      setTimeout(() => { busy = false; }, DURATION + 60);
    }, DURATION);
  });
});

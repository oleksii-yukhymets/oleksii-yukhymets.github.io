// Theme toggle: dark (default) / light. Choice is saved in localStorage.
// The initial theme is applied by an inline snippet in <head> to avoid a flash.
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => {
    const light = root.dataset.theme === 'light';
    btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    btn.setAttribute('aria-pressed', String(light));
  };
  sync();
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });
});

// ASCII avatar, inspired by the 21st.dev "Electric Gaze" recipe and rendered
// live from images/avatar.png. The face is drawn as ASCII characters on a dark
// field with faint flickering noise. Hovering the avatar shows the real photo.
// Markup: <figure class="avatar avatar-ascii"><img src="images/avatar.png" alt="…"></figure>
// Static frame for prefers-reduced-motion; paused while off-screen / tab hidden.
document.addEventListener('DOMContentLoaded', () => {
  const fig = document.querySelector('.avatar-ascii');
  const img = fig && fig.querySelector('img');
  if (!fig || !img) return;

  const CFG = {
    cell: 3,                      // CSS px per character cell
    ramp: ' .:-=+*#%@',           // dark -> bright
    // per theme: background dot colour, shadow -> highlight character tint
    dark:  { noise: [90, 180, 255], face: [[70, 72, 80], [236, 232, 226]] },
    light: { noise: [28, 78, 215],  face: [[165, 167, 175], [22, 24, 30]] },
    fps: 30,
  };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  fig.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let cols = 0, rows = 0, size = 0, base = null, raf = 0, last = 0, visible = true;

  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // Sample the photo into a cols x rows brightness grid (levels + vignette so
  // the grey studio wall drops to black and the face pops, as in the reference).
  const sample = () => {
    size = fig.clientWidth;
    if (!size) return false;
    cols = rows = Math.round(size / CFG.cell);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    const octx = off.getContext('2d', { willReadFrequently: true });
    octx.drawImage(img, 0, 0, cols, rows);
    let data;
    try { data = octx.getImageData(0, 0, cols, rows).data; } catch (e) { return false; } // file:// taint

    base = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x, p = i * 4;
        const lum = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
        const nx = x / cols - 0.5, ny = y / rows - 0.42;
        const vignette = 1 - smooth(0.22, 0.5, Math.hypot(nx * 1.15, ny));
        base[i] = Math.pow(smooth(0.26, 0.8, lum), 1.1) * vignette;
      }
    }
    return true;
  };

  const draw = () => {
    const cell = size / cols;
    ctx.clearRect(0, 0, size, size);
    ctx.font = `600 ${cell * 1.25}px ui-monospace, Menlo, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const theme = CFG[document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'];
    const [n0, n1, n2] = theme.noise;
    const [lo, hi] = theme.face;
    const ramp = CFG.ramp, R = ramp.length - 1;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let b = base[y * cols + x];
        if (!reduceMotion) b += (Math.random() - 0.5) * 0.08 * b;

        const cx = (x + 0.5) * cell, cy = (y + 0.5) * cell;
        if (b < 0.06) {
          // background noise: faint flickering dots
          if (Math.random() < (reduceMotion ? 0.05 : 0.07)) {
            ctx.fillStyle = `rgba(${n0},${n1},${n2},${0.08 + Math.random() * 0.18})`;
            ctx.fillText('.', cx, cy);
          }
          continue;
        }

        const k = Math.min(1, b);
        const r = lo[0] + (hi[0] - lo[0]) * k, g = lo[1] + (hi[1] - lo[1]) * k, bl = lo[2] + (hi[2] - lo[2]) * k;
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${bl | 0},${Math.min(1, 0.25 + k * 0.85)})`;
        ctx.fillText(ramp[Math.min(R, Math.round(k * R))], cx, cy);
      }
    }
  };

  const loop = (now) => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (now - last >= 1000 / CFG.fps) { last = now; draw(); }
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && !reduceMotion) raf = requestAnimationFrame(loop); };

  const init = () => {
    if (!sample()) return;                // keep the plain photo on failure
    fig.classList.add('is-ascii');
    draw();
    start();
  };

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(fig);
  document.addEventListener('visibilitychange', start);
  // redraw immediately on theme switch (matters for the static reduced-motion frame)
  new MutationObserver(() => { if (base) draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new ResizeObserver(() => { if (base && fig.clientWidth !== size && sample()) draw(); }).observe(fig);

  if (img.complete && img.naturalWidth) init(); else img.addEventListener('load', init, { once: true });
});

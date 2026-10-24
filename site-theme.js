/* Run in the head so the chosen color mode is set before the first paint. */
(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'webkd-color-mode';
  const query = new URLSearchParams(location.search);
  const preview = query.has('design') || query.get('explore') === '1';
  let preference;
  let customAccent = '';
  if (!preview) {
    try { preference = localStorage.getItem(key); } catch { /* Default to light mode. */ }
  }
  if (!['light', 'dark'].includes(preference)) preference = null;
  root.dataset.mode = preference || 'light';

  function channels(color) {
    if (/^#[\da-f]{6}$/i.test(color)) return color.slice(1).match(/../g).map(v => parseInt(v, 16));
    return color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  }
  function luminance(rgb) {
    const c = rgb.map(value => {
      const v = value / 255;
      return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
    });
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
  }
  function contrast(a, b) { return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); }

  function refresh() {
    const dark = root.dataset.mode === 'dark';
    root.style.colorScheme = dark ? 'dark' : 'light';
    for (const property of ['--accent', '--accent-dark', '--accent-ink']) root.style.removeProperty(property);
    if (customAccent) root.style.setProperty('--accent', customAccent);
    const style = getComputedStyle(root);
    const accent = channels(style.getPropertyValue('--accent').trim());
    if (accent?.length === 3) {
      const lightInk = [255, 255, 255], darkInk = [23, 26, 24];
      const l = luminance(accent);
      root.style.setProperty('--accent-ink', contrast(l, luminance(darkInk)) >= contrast(l, 1) ? '#171a18' : '#ffffff');
      if (customAccent) {
        const surfaces = ['--paper', '--surface', '--tint'].map(p => channels(style.getPropertyValue(p).trim())).filter(Boolean).map(luminance);
        const readable = [...accent];
        for (let n = 0; n < 50 && surfaces.some(s => contrast(luminance(readable), s) < 4.8); n++) {
          for (let i = 0; i < 3; i++) readable[i] = Math.round(readable[i] + ((dark ? lightInk[i] : 0) - readable[i]) * .12);
        }
        root.style.setProperty('--accent-dark', `rgb(${readable.join(',')})`);
      }
    }
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      // A stable name with a pressed state; the tooltip describes the next action.
      toggle.setAttribute('aria-label', 'Dark mode');
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.title = `Switch to ${dark ? 'light' : 'dark'} mode`;
      toggle.querySelector('.theme-label').textContent = dark ? 'Dark' : 'Light';
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', style.getPropertyValue('--paper').trim());
  }

  function setMode(mode) {
    preference = mode;
    root.dataset.mode = mode;
    if (!preview) {
      try { localStorage.setItem(key, mode); } catch { /* Keep the selection for this visit. */ }
    }
    refresh();
  }
  window.addEventListener('webkd:designchange', event => {
    customAccent = event.detail.customAccent || '';
    if (preview && !preference) root.dataset.mode = event.detail.palette === 'night' ? 'dark' : 'light';
    refresh();
  });
  window.addEventListener('storage', event => {
    if (preview || event.key !== key) return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    root.dataset.mode = preference || 'light';
    refresh();
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const run = () => setMode(root.dataset.mode === 'dark' ? 'light' : 'dark');
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(run);
      else run();
    });
    refresh();
  });
})();

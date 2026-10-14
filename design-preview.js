/* Shared presentation settings for the explorer iframe and exported site URLs. */
(() => {
  'use strict';
  const root = document.documentElement;
  const query = new URLSearchParams(location.search);
  const embedded = query.get('explore') === '1' && window.parent !== window;
  const choices = {
    palette: ['notebook', 'blueprint', 'workshop', 'plum', 'mono', 'night'],
    typography: ['editorial', 'technical', 'scholarly', 'swiss'],
    hero: ['split', 'centered', 'paper'],
    accent: ['marker', 'underline', 'dot', 'quiet'],
    density: ['spacious', 'balanced', 'compact'],
    corners: ['sharp', 'soft'],
    animation: ['deep', 'overview', 'static']
  };
  const defaults = { palette: 'notebook', typography: 'editorial', hero: 'split', accent: 'marker', density: 'balanced', corners: 'sharp', sections: ['idea', 'method', 'results', 'paper'], animation: 'deep', customAccent: '' };
  let settings = { ...defaults, sections: [...defaults.sections] };
  const heading = document.getElementById('hero-title');
  const originalHeading = 'Teaching Agents<br>in Their <em>Own Style</em>';
  const video = document.querySelector('.method-film video');
  const filmLabel = document.getElementById('film-duration');
  const originalFilmLabel = filmLabel?.textContent;
  let currentAnimation = 'deep';
  let poster;

  function validate(input) {
    const value = { ...settings, sections: [...settings.sections] };
    if (!input || typeof input !== 'object' || Array.isArray(input)) return value;
    for (const [key, allowed] of Object.entries(choices)) {
      if (allowed.includes(input[key])) value[key] = input[key];
    }
    if (Array.isArray(input.sections) && input.sections.length === 4 && new Set(input.sections).size === 4 && input.sections.every(id => defaults.sections.includes(id))) value.sections = [...input.sections];
    if (Object.prototype.hasOwnProperty.call(input, 'customAccent')) value.customAccent = typeof input.customAccent === 'string' && /^#[0-9a-f]{6}$/i.test(input.customAccent) ? input.customAccent : '';
    return value;
  }

  function loadFonts() {
    if (document.getElementById('design-fonts')) return;
    const link = document.createElement('link');
    link.id = 'design-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@400;500;600&display=swap';
    document.head.append(link);
  }

  function setAnimation(mode) {
    if (!video || mode === currentAnimation) return;
    video.pause();
    video.closest('.method-film').dataset.mode = mode;
    if (mode === 'static') {
      if (!poster) {
        poster = document.createElement('img');
        poster.className = 'design-method-poster';
        poster.src = 'assets/webkd-method-poster.png?v=20261014-r3';
        poster.alt = 'WEBKD method and training objective. Full explanation and equations follow below.';
        video.after(poster);
      }
      poster.hidden = false;
      video.hidden = true;
    } else {
      if (poster) poster.hidden = true;
      video.hidden = false;
      video.poster = mode === 'overview' ? 'assets/webkd-overview-poster.png' : 'assets/webkd-method-poster.png?v=20261014-r3';
      video.querySelector('source').src = mode === 'overview' ? 'assets/webkd-overview.mp4' : 'assets/webkd-method.mp4?v=20261014-r3';
      video.load();
    }
    if (filmLabel) filmLabel.textContent = mode === 'overview' ? '22 seconds · Overview animation' : mode === 'static' ? 'Static diagram · Manim' : originalFilmLabel;
    currentAnimation = mode;
  }

  function apply(input) {
    settings = validate(input);
    root.dataset.design = 'active';
    root.dataset.theme = settings.palette;
    for (const key of ['typography', 'hero', 'accent', 'density', 'corners']) root.dataset[key] = settings[key];
    heading.innerHTML = settings.hero === 'paper' ? '<span class="paper-heading-main">Teaching Agents in Their <em>Own Style:</em></span> <span class="paper-heading-subtitle">Black-Box Teacher Distillation for Web Agents</span>' : originalHeading;
    const main = document.getElementById('main');
    settings.sections.forEach((id, index) => {
      const section = document.getElementById(id);
      if (section?.parentElement === main) main.append(section);
      const number = section?.querySelector('.section-number span');
      if (number) number.textContent = String(index + 1).padStart(2, '0');
    });
    const nav = document.getElementById('nav');
    settings.sections.forEach(id => { const link = nav?.querySelector(id === 'paper' ? '.nav-paper' : `a[href="#${id}"]`); if (link) nav.append(link); });
    setAnimation(settings.animation);
    if (settings.typography !== 'editorial') loadFonts();
    window.dispatchEvent(new CustomEvent('webkd:designchange', { detail: settings }));
    if (embedded) parent.postMessage({ type: 'webkd:applied', settings: { ...settings, sections: [...settings.sections] } }, '*');
  }

  if (embedded) {
    root.dataset.preview = 'embedded';
    window.addEventListener('message', event => {
      if (event.source !== parent || !event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'webkd:configure') apply(event.data.settings);
      if (event.data.type === 'webkd:focus' && ['hero', ...defaults.sections].includes(event.data.section)) {
        const section = event.data.section === 'hero' ? document.querySelector('.hero') : document.getElementById(event.data.section);
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    apply(defaults);
    parent.postMessage({ type: 'webkd:ready' }, '*');
  } else {
    apply(window.WEBKD_SITE_DESIGN || defaults);
    if (query.has('design')) {
      try { apply(JSON.parse(query.get('design'))); } catch { /* Invalid shared configurations keep the published design. */ }
    }
  }
})();

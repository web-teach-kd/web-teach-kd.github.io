/* Scroll state, active navigation, reveals, and first-view bar growth. Content stays visible without it. */
(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('nav');

  // The header gains its hairline once the page scrolls.
  if (header) {
    let queued = false;
    const sync = () => { queued = false; header.classList.toggle('is-scrolled', scrollY > 8); };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(sync); } }, { passive: true });
    sync();
  }

  if (!('IntersectionObserver' in window)) return;

  // Mark the nav link for the section in the middle of the viewport. Links are looked up
  // each time because the design explorer can reorder them.
  if (nav) {
    const sections = ['.hero', '#idea', '#method', '#results', '#paper'].map(selector => document.querySelector(selector)).filter(Boolean);
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        nav.querySelectorAll('a[href^="#"]').forEach(link => {
          if (id && link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (!root.classList.contains('motion-ok') || reduce.matches) return;

  const fold = innerHeight * .92;
  const small = matchMedia('(max-width: 760px)').matches;
  const step = small ? 50 : 80;
  const tagged = new Set();
  const pending = new Set();
  let observed = false;

  function settle(element) {
    if (!tagged.has(element)) return;
    tagged.delete(element);
    element.removeAttribute('data-reveal');
    element.classList.remove('is-revealed');
    element.style.removeProperty('--reveal-rise');
    element.style.removeProperty('--reveal-delay');
  }
  function tag(element, index, rise) {
    if (!element || element.getBoundingClientRect().top <= fold) return false;
    element.dataset.reveal = '';
    element.style.setProperty('--reveal-rise', `${small ? Math.round(rise * .7) : rise}px`);
    element.style.setProperty('--reveal-delay', `${Math.min(index, 4) * step}ms`);
    tagged.add(element);
    return true;
  }
  function reveal(element) {
    if (!tagged.has(element)) return;
    element.classList.add('is-revealed');
    const done = event => {
      if (event && (event.target !== element || event.pseudoElement || event.propertyName !== 'transform')) return;
      element.removeEventListener('transitionend', done);
      settle(element);
    };
    element.addEventListener('transitionend', done);
    setTimeout(done, 1800);
  }
  function revealNow() {
    [...tagged].forEach(settle);
    pending.forEach(panel => panel.classList.remove('is-pending'));
    pending.clear();
  }

  // Each trigger reveals its own items in reading order the first time it enters view.
  const groups = [
    ['.insight-layout', trigger => [[trigger.querySelector('.insight-copy'), 12], [trigger.querySelector('.insight-figure'), 20]]],
    ['#method .section-head', trigger => [[trigger, 12]]],
    ['.method-film', trigger => [[trigger, 20]]],
    ['.method-grid', trigger => [...trigger.querySelectorAll(':scope > .method-step')].map(item => [item, 16])],
    ['.loss-explainer', trigger => [[trigger, 12]]],
    ['#results .section-head', trigger => [[trigger, 12]]],
    ['.benchmark-panel', trigger => [[trigger, 20]]],
    ['.paper-layout', trigger => [...trigger.querySelectorAll(':scope > div')].map(item => [item, 12])],
  ];
  const members = new Map();
  groups.forEach(([selector, items]) => document.querySelectorAll(selector).forEach(trigger => {
    const list = items(trigger).filter(([element, rise], index) => tag(element, index, rise)).map(([element]) => element);
    if (list.length) members.set(trigger, list);
  }));

  const revealObserver = new IntersectionObserver(entries => {
    observed = true;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      members.get(entry.target)?.forEach(reveal);
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  members.forEach((_, trigger) => revealObserver.observe(trigger));

  // Bars grow from zero the first time a row is on screen, so a visible value never sits
  // beside an empty track. Final widths come from results.js.
  function grow(panel) {
    if (!pending.has(panel)) return;
    pending.delete(panel);
    panel.classList.add('is-entering');
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.remove('is-pending')));
    setTimeout(() => panel.classList.remove('is-entering'), 1600);
  }
  const barObserver = new IntersectionObserver(entries => {
    observed = true;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      barObserver.unobserve(entry.target);
      const panel = entry.target.closest('.benchmark-panel');
      if (panel) grow(panel);
    });
  }, { threshold: 0 });
  document.querySelectorAll('.benchmark-panel[data-ready="true"]').forEach(panel => {
    const rows = panel.querySelector('.benchmark-rows');
    if (!rows || rows.getBoundingClientRect().top <= innerHeight) return;
    panel.classList.add('is-pending');
    pending.add(panel);
    barObserver.observe(rows);
  });

  // Content passed by an instant jump, or reached by keyboard focus, is shown at once.
  function settleGroup(trigger) {
    members.get(trigger)?.forEach(settle);
    members.delete(trigger);
    revealObserver.unobserve(trigger);
  }
  let skipQueued = false;
  addEventListener('scroll', () => {
    if (skipQueued || (!members.size && !pending.size)) return;
    skipQueued = true;
    requestAnimationFrame(() => {
      skipQueued = false;
      members.forEach((_, trigger) => { if (trigger.getBoundingClientRect().bottom < 0) settleGroup(trigger); });
      pending.forEach(panel => {
        const rows = panel.querySelector('.benchmark-rows');
        if (!rows || rows.getBoundingClientRect().bottom >= 0) return;
        pending.delete(panel);
        panel.classList.remove('is-pending');
        barObserver.unobserve(rows);
      });
    });
  }, { passive: true });
  addEventListener('focusin', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const hidden = target.closest('[data-reveal]');
    if (hidden) members.forEach((list, trigger) => { if (list.includes(hidden)) settleGroup(trigger); });
    const panel = target.closest('.benchmark-panel.is-pending');
    if (panel) grow(panel);
  });

  // The open equation cards settle in one after another.
  const loss = document.querySelector('.loss-details');
  loss?.addEventListener('toggle', () => {
    if (!loss.open || reduce.matches || typeof Element.prototype.animate !== 'function') return;
    loss.querySelectorAll('.loss-detail').forEach((card, index) => card.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
      { duration: 480, delay: index * 45, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }
    ));
  });

  // Failsafes: print, a mid-visit reduced-motion change, or an observer that never reports.
  addEventListener('beforeprint', revealNow);
  reduce.addEventListener?.('change', event => { if (event.matches) { root.classList.remove('motion-ok'); revealNow(); } });
  setTimeout(() => { if (!observed) revealNow(); }, 2000);
})();

/* The film starts when it is visible, and never undoes a viewer's manual pause. */
(() => {
  'use strict';
  const video = document.getElementById('method-video');
  if (!video) return;
  const film = video.closest('.method-film');
  const speedControl = film.querySelector('.film-speed-control');
  const speedLabel = document.getElementById('film-speed-label');
  const durationLabel = document.getElementById('film-duration');
  const rateButtons = [...film.querySelectorAll('[data-playback-rate]')];
  const allowedRates = [.5, .75, 1, 1.25, 1.5, 2];
  let playbackRate = 1;
  let inView = false;
  let manuallyPaused = false;
  let automaticPausePending = false;
  let sourceChanging = false;
  let autoplayBlocked = false;
  let playPending = false;
  let chapterRequest = null;
  let sourceKey = video.querySelector('source')?.getAttribute('src') || video.getAttribute('src') || '';
  let currentMode = film.dataset.mode || 'deep';

  // Native autoplay would run before a below-the-fold film can be seen.
  video.autoplay = false;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  function available() {
    return !video.hidden && film.dataset.mode !== 'static' && video.getClientRects().length > 0;
  }
  function canPlay() {
    return available() && inView && !document.hidden;
  }
  function updateDuration() {
    if (!durationLabel) return;
    const mode = film.dataset.mode || 'deep';
    if (mode === 'static' || video.hidden) {
      durationLabel.textContent = 'Static diagram · Method + loss';
      return;
    }
    const description = mode === 'overview' ? 'Overview' : 'Method + loss';
    durationLabel.textContent = Number.isFinite(video.duration) && video.duration > 0 && !sourceChanging
      ? `${Math.round(video.duration)} seconds · ${description}`
      : description;
  }
  function updateSpeed() {
    if (speedLabel) speedLabel.textContent = `${playbackRate}×`;
    rateButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.playbackRate) === playbackRate)));
  }
  function pauseAutomatically() {
    if (!video.paused) {
      automaticPausePending = true;
      video.pause();
    }
  }
  function playWhenVisible() {
    if (!canPlay() || manuallyPaused || autoplayBlocked || video.ended || playPending || !video.paused) return;
    playPending = true;
    const result = video.play();
    Promise.resolve(result).catch(error => {
      if (error?.name === 'NotAllowedError') autoplayBlocked = true;
      // Native controls remain available when a browser declines autoplay.
    }).finally(() => {
      playPending = false;
      if (!canPlay()) pauseAutomatically();
    });
  }
  function reconcileVisibility() {
    if (canPlay()) playWhenVisible();
    else pauseAutomatically();
  }

  // A pause caused by native playback controls becomes a durable user choice.
  video.addEventListener('pause', () => {
    if (automaticPausePending) {
      automaticPausePending = false;
      return;
    }
    if (sourceChanging || video.ended || !available()) return;
    manuallyPaused = true;
  });
  video.addEventListener('play', () => {
    manuallyPaused = false;
    autoplayBlocked = false;
    if (!canPlay()) pauseAutomatically();
  });
  video.addEventListener('ended', () => { chapterRequest = null; });
  video.addEventListener('ratechange', () => {
    if (sourceChanging) return;
    if (Number.isFinite(video.playbackRate) && video.playbackRate > 0) playbackRate = video.playbackRate;
    updateSpeed();
  });

  function applyChapter() {
    if (chapterRequest === null || video.readyState < 1 || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.max(0, Math.min(chapterRequest, video.duration - .05));
    chapterRequest = null;
    manuallyPaused = false;
    autoplayBlocked = false;
    playWhenVisible();
  }
  video.addEventListener('loadedmetadata', () => {
    sourceChanging = false;
    video.playbackRate = playbackRate;
    updateDuration();
    applyChapter();
    playWhenVisible();
  });
  video.addEventListener('durationchange', updateDuration);

  // The chapter timeline fills with playback and marks the current chapter.
  const chapters = [...film.querySelectorAll('[data-film-seek]')];
  const starts = chapters.map(button => Number(button.dataset.filmSeek));
  function updateChapters() {
    if (!chapters.length || !Number.isFinite(video.duration)) return;
    const time = video.currentTime;
    let current = -1;
    starts.forEach((start, index) => { if (time >= start) current = index; });
    chapters.forEach((button, index) => {
      const end = index < starts.length - 1 ? starts[index + 1] : video.duration;
      const progress = index < current ? 1 : index > current ? 0 : Math.min(1, (time - starts[index]) / Math.max(.001, end - starts[index]));
      button.style.setProperty('--chapter-progress', progress.toFixed(3));
      button.classList.toggle('is-done', index < current);
      if (index === current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
  ['timeupdate', 'seeked', 'loadedmetadata'].forEach(type => video.addEventListener(type, updateChapters));

  film.querySelectorAll('[data-film-seek]').forEach(button => button.addEventListener('click', () => {
    const seconds = Number(button.dataset.filmSeek);
    if (!Number.isFinite(seconds) || seconds < 0 || !available()) return;
    chapterRequest = seconds;
    manuallyPaused = false;
    autoplayBlocked = false;
    video.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    applyChapter();
    if (video.readyState < 1 && video.networkState === video.NETWORK_EMPTY) video.load();
  }));

  rateButtons.forEach(button => button.addEventListener('click', () => {
    const rate = Number(button.dataset.playbackRate);
    if (!allowedRates.includes(rate)) return;
    playbackRate = rate;
    video.defaultPlaybackRate = rate;
    video.playbackRate = rate;
    updateSpeed();
    if (speedControl) {
      speedControl.open = false;
      speedControl.querySelector('summary')?.focus();
    }
  }));
  document.addEventListener('pointerdown', event => {
    if (speedControl?.open && !speedControl.contains(event.target)) speedControl.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && speedControl?.open) {
      speedControl.open = false;
      speedControl.querySelector('summary')?.focus();
      event.preventDefault();
    }
  });
  // The menu opens upward unless the sticky header leaves too little room above it.
  speedControl?.addEventListener('toggle', () => {
    if (!speedControl.open) return;
    const menu = speedControl.querySelector('.film-speed-menu');
    const summary = speedControl.querySelector('summary');
    if (!menu || !summary) return;
    const box = summary.getBoundingClientRect();
    const ceiling = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    const above = box.top - ceiling;
    const below = innerHeight - box.bottom;
    speedControl.classList.toggle('opens-down', above < menu.offsetHeight + 8 && below > above);
  });

  // The design explorer can hide the video or replace its source synchronously.
  new MutationObserver(() => {
    const nextSource = video.querySelector('source')?.getAttribute('src') || video.getAttribute('src') || '';
    const nextMode = film.dataset.mode || 'deep';
    const changed = nextSource !== sourceKey || nextMode !== currentMode;
    if (changed) {
      sourceKey = nextSource;
      currentMode = nextMode;
      sourceChanging = video.readyState < 1 || nextMode === 'static';
      chapterRequest = null;
      autoplayBlocked = false;
    }
    if (speedControl) {
      const hideSpeed = nextMode === 'static';
      if (speedControl.hidden !== hideSpeed) speedControl.hidden = hideSpeed;
      if (speedControl.hidden) speedControl.open = false;
    }
    updateDuration();
    reconcileVisibility();
  }).observe(film, { attributes:true, attributeFilter:['data-mode', 'hidden', 'src'], subtree:true });

  document.addEventListener('visibilitychange', reconcileVisibility);
  pauseAutomatically();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      inView = entry.isIntersecting && entry.intersectionRatio >= .2;
      reconcileVisibility();
    }, { threshold:[0, .2] });
    observer.observe(video);
  } else {
    const checkViewport = () => {
      const rect = video.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
      inView = rect.height > 0 && visibleHeight / rect.height >= .2;
      reconcileVisibility();
    };
    window.addEventListener('scroll', checkViewport, { passive:true });
    window.addEventListener('resize', checkViewport, { passive:true });
    checkViewport();
  }
  updateSpeed();
  updateDuration();
})();

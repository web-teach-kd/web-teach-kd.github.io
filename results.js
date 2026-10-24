/* TimeWarp values from the paper and OnlineMind2Web values from the supplied table. */
(() => {
  'use strict';
  const data = window.WEBKD_RESULTS;
  if (!data?.timewarp || !Array.isArray(data.models) || !Array.isArray(data.methods)) return;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const chartMethods = ['behavior_cloning_tw', 'mgrpo', 'takeover', 'webkd'];
  const methodById = new Map(data.methods.map(method => [method.id, method]));
  const modelById = new Map(data.models.map(model => [model.id, model]));
  const format = (value, precision) => Number.isFinite(value) ? value.toFixed(precision) : '—';
  const valueFor = (model, method, version) => data.timewarp.models?.[model]?.[method]?.[version];
  const versionsFor = kind => kind === 'seen' ? ['v6'] : ['v1', 'v2', 'v3', 'v4', 'v5'];
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bars and whiskers glide from their previous widths; the numbers never animate.
  function snapshot(rows) {
    const widths = new Map();
    rows.querySelectorAll('.benchmark-row[data-method]').forEach(row => {
      const bar = row.querySelector('.benchmark-bar'), error = row.querySelector('.benchmark-error');
      widths.set(row.dataset.method, { width: bar?.style.width, left: error?.style.left, errorWidth: error?.style.width });
    });
    return widths;
  }
  function glide(panel, rows, previous) {
    if (!previous.size || reduceMotion() || typeof Element.prototype.animate !== 'function' || panel.classList.contains('is-pending')) return;
    const timing = { duration: 500, easing: 'cubic-bezier(.2,.7,.2,1)' };
    rows.querySelectorAll('.benchmark-row[data-method]').forEach(row => {
      const before = previous.get(row.dataset.method);
      if (!before) return;
      const bar = row.querySelector('.benchmark-bar'), error = row.querySelector('.benchmark-error');
      if (bar && before.width && before.width !== bar.style.width) bar.animate([{ width: before.width }, { width: bar.style.width }], timing);
      if (error && before.left && (before.left !== error.style.left || before.errorWidth !== error.style.width)) {
        error.animate([{ left: before.left, width: before.errorWidth }, { left: error.style.left, width: error.style.width }], timing);
      }
    });
  }

  function axisMaximum(kind) {
    let maximum = 0;
    for (const model of data.models) for (const method of chartMethods) for (const version of versionsFor(kind)) {
      const value = valueFor(model.id, method, version);
      if (Number.isFinite(value?.mean)) maximum = Math.max(maximum, value.mean + (Number.isFinite(value.se) ? value.se : 0));
    }
    const step = maximum <= 10 ? 2 : maximum <= 25 ? 5 : maximum <= 60 ? 10 : 20;
    return Math.min(100, Math.max(step, Math.ceil(maximum / step) * step));
  }

  function createPanel(panel) {
    const kind = panel.dataset.benchmark;
    const versions = versionsFor(kind);
    const state = { model: data.models[0].id, version: versions[0] };
    const maximum = axisMaximum(kind);
    const modelGroup = panel.querySelector('.benchmark-models');
    const rows = panel.querySelector('.benchmark-rows');
    const status = panel.querySelector('.benchmark-status');
    const select = panel.querySelector('.benchmark-version');
    modelGroup.innerHTML = data.models.map(model => `<button type="button" data-student="${escape(model.id)}" aria-pressed="${model.id === state.model}">${escape(model.label)}</button>`).join('');
    if (select) select.innerHTML = versions.map(version => `<option value="${version}">TimeWarp ${version}</option>`).join('');

    function render() {
      const model = modelById.get(state.model);
      modelGroup.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.student === state.model)));
      panel.querySelector('.benchmark-context').textContent = `${model.label} · TimeWarp ${state.version}`;
      const previous = snapshot(rows);
      rows.innerHTML = chartMethods.filter(method => methodById.has(method)).map(methodId => {
        const method = methodById.get(methodId);
        const value = valueFor(state.model, methodId, state.version);
        if (!Number.isFinite(value?.mean)) return `<div class="benchmark-row" data-method="${escape(methodId)}"><span class="benchmark-method">${escape(method.label)}</span><span class="benchmark-unreported">Not reported</span></div>`;
        const mean = value.mean;
        const hasError = Number.isFinite(value.se);
        const low = Math.max(0, mean - (hasError ? value.se : 0));
        const high = Math.min(maximum, mean + (hasError ? value.se : 0));
        const label = `${method.label}: ${format(mean, 1)} percent${hasError ? ', standard error ' + format(value.se, 2) + ' percentage points' : ''}`;
        return `<div class="benchmark-row${methodId === 'webkd' ? ' is-webkd' : ''}" data-method="${escape(methodId)}">
          <span class="benchmark-method">${escape(method.label)}</span>
          <span class="benchmark-track" aria-hidden="true"><span class="benchmark-bar" style="width:${mean / maximum * 100}%"></span>${hasError ? `<span class="benchmark-error" style="left:${low / maximum * 100}%;width:${(high - low) / maximum * 100}%"></span>` : ''}</span>
          <span class="benchmark-number" aria-label="${escape(label)}">${format(mean, 1)}${hasError ? `<span> ± ${format(value.se, 2)}</span>` : ''}</span>
        </div>`;
      }).join('');
      glide(panel, rows, previous);
      panel.querySelector('.benchmark-axis').innerHTML = Array.from({length:5}, (_, index) => `<span>${format(maximum * index / 4, maximum % 4 ? 1 : 0)}${index === 4 ? '%' : ''}</span>`).join('');
      status.textContent = `${model.label}, TimeWarp ${state.version}. Mean success rates and standard errors displayed.`;
    }
    modelGroup.addEventListener('click', event => {
      const button = event.target.closest('button[data-student]');
      if (!button || !modelById.has(button.dataset.student)) return;
      state.model = button.dataset.student;
      render();
    });
    select?.addEventListener('change', () => { if (versions.includes(select.value)) { state.version = select.value; render(); } });
    render();
    panel.dataset.ready = 'true';
  }

  function createOnlinePanel(panel) {
    const online = data.onlineMind2Web;
    if (!online?.models || !Array.isArray(online.modelIds) || !Array.isArray(online.difficulties) || !Array.isArray(online.methods)) return;
    const models = online.modelIds.map(id => modelById.get(id)).filter(Boolean);
    if (!models.length || !online.difficulties.length) return;
    const difficulties = new Map(online.difficulties.map(difficulty => [difficulty.id, difficulty]));
    const state = { model: models[0].id, difficulty: difficulties.has('overall') ? 'overall' : online.difficulties[0].id };
    const maximum = 25;
    const modelGroup = panel.querySelector('.benchmark-models');
    const select = panel.querySelector('.benchmark-difficulty');
    const rows = panel.querySelector('.benchmark-rows');
    const status = panel.querySelector('.benchmark-status');
    const percent = value => Number.isFinite(value) ? value * 100 : NaN;
    const getValue = (method, difficulty) => online.models[state.model]?.[method]?.[difficulty];
    modelGroup.innerHTML = models.map(model => `<button type="button" data-student="${escape(model.id)}" aria-pressed="${model.id === state.model}">${escape(model.label)}</button>`).join('');
    select.innerHTML = online.difficulties.map(difficulty => `<option value="${escape(difficulty.id)}">${escape(difficulty.label)}</option>`).join('');
    select.value = state.difficulty;
    panel.querySelector('.benchmark-axis').innerHTML = [0, 5, 10, 15, 20, 25].map(value => `<span>${value}${value === maximum ? '%' : ''}</span>`).join('');

    function render() {
      const model = modelById.get(state.model);
      const difficulty = difficulties.get(state.difficulty);
      modelGroup.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.student === state.model)));
      panel.querySelector('.benchmark-context').textContent = `${model.label} · ${difficulty.label}`;
      const previous = snapshot(rows);
      rows.innerHTML = online.methods.map(method => {
        const value = getValue(method.id, state.difficulty);
        const mean = percent(value?.mean);
        const se = percent(value?.se);
        if (!Number.isFinite(mean)) return `<div class="benchmark-row" data-method="${escape(method.id)}"><span class="benchmark-method">${escape(method.label)}</span><span class="benchmark-unreported">Not reported</span></div>`;
        const hasError = Number.isFinite(se);
        const low = Math.max(0, mean - (hasError ? se : 0));
        const high = Math.min(maximum, mean + (hasError ? se : 0));
        const label = `${method.label}: ${format(mean, 1)} percent${hasError ? ', standard error ' + format(se, 1) + ' percentage points' : ''}`;
        return `<div class="benchmark-row${method.id === 'webkd' ? ' is-webkd' : ''}" data-method="${escape(method.id)}">
          <span class="benchmark-method">${escape(method.label)}</span>
          <span class="benchmark-track" aria-hidden="true"><span class="benchmark-bar" style="width:${Math.min(maximum, mean) / maximum * 100}%"></span>${hasError ? `<span class="benchmark-error" style="left:${low / maximum * 100}%;width:${Math.max(0, high - low) / maximum * 100}%"></span>` : ''}</span>
          <span class="benchmark-number" aria-label="${escape(label)}">${format(mean, 1)}${hasError ? `<span> ± ${format(se, 1)}</span>` : ''}</span>
        </div>`;
      }).join('');
      glide(panel, rows, previous);
      status.textContent = `${model.label}, OnlineMind2Web, ${difficulty.label}. Seven methods displayed as mean success rate and standard error. The axis remains 0 to 25 percent.`;
    }
    modelGroup.addEventListener('click', event => {
      const button = event.target.closest('button[data-student]');
      if (!button || !online.modelIds.includes(button.dataset.student)) return;
      state.model = button.dataset.student;
      render();
    });
    select.addEventListener('change', () => {
      if (!difficulties.has(select.value)) return;
      state.difficulty = select.value;
      render();
    });
    render();
    panel.dataset.ready = 'true';
  }

  document.querySelectorAll('[data-benchmark="seen"],[data-benchmark="unseen"]').forEach(createPanel);
  document.querySelectorAll('[data-benchmark="online"]').forEach(createOnlinePanel);
})();

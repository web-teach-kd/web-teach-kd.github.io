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
    const table = panel.querySelector('.benchmark-table');
    const status = panel.querySelector('.benchmark-status');
    const select = panel.querySelector('.benchmark-version');
    modelGroup.innerHTML = data.models.map(model => `<button type="button" data-student="${escape(model.id)}" aria-pressed="${model.id === state.model}">${escape(model.label)}</button>`).join('');
    if (select) select.innerHTML = versions.map(version => `<option value="${version}">TimeWarp ${version}</option>`).join('');

    function render() {
      const model = modelById.get(state.model);
      modelGroup.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.student === state.model)));
      panel.querySelector('.benchmark-context').textContent = `${model.label} · TimeWarp ${state.version}`;
      rows.innerHTML = chartMethods.filter(method => methodById.has(method)).map(methodId => {
        const method = methodById.get(methodId);
        const value = valueFor(state.model, methodId, state.version);
        if (!Number.isFinite(value?.mean)) return `<div class="benchmark-row"><span class="benchmark-method">${escape(method.label)}</span><span class="benchmark-unreported">Not reported</span></div>`;
        const mean = value.mean;
        const hasError = Number.isFinite(value.se);
        const low = Math.max(0, mean - (hasError ? value.se : 0));
        const high = Math.min(maximum, mean + (hasError ? value.se : 0));
        const label = `${method.label}: ${format(mean, 1)} percent${hasError ? ', standard error ' + format(value.se, 2) + ' percentage points' : ''}`;
        return `<div class="benchmark-row${methodId === 'webkd' ? ' is-webkd' : ''}">
          <span class="benchmark-method">${escape(method.label)}</span>
          <span class="benchmark-track" aria-hidden="true"><span class="benchmark-bar" style="width:${mean / maximum * 100}%"></span>${hasError ? `<span class="benchmark-error" style="left:${low / maximum * 100}%;width:${(high - low) / maximum * 100}%"></span>` : ''}</span>
          <span class="benchmark-number" aria-label="${escape(label)}">${format(mean, 1)}${hasError ? `<span> ± ${format(value.se, 2)}</span>` : ''}</span>
        </div>`;
      }).join('');
      panel.querySelector('.benchmark-axis').innerHTML = Array.from({length:5}, (_, index) => `<span>${format(maximum * index / 4, maximum % 4 ? 1 : 0)}${index === 4 ? '%' : ''}</span>`).join('');
      panel.querySelector('.benchmark-scale-note').textContent = `0–${maximum}% scale, fixed across ${kind === 'seen' ? 'students' : 'students and versions'}`;
      const tableVersions = versionsFor(kind);
      table.innerHTML = `<caption>${escape(model.label)} · TimeWarp ${kind === 'seen' ? 'v6' : 'unseen versions v1–v5'} · Success rate (%)</caption>
        <thead><tr><th scope="col">Method</th>${tableVersions.map(version => `<th scope="col"${version === state.version ? ' class="is-selected-version"' : ''}>${version}<span>Mean ± SE</span></th>`).join('')}</tr></thead>
        <tbody>${data.methods.map(method => `<tr${method.id === 'webkd' ? ' class="is-webkd"' : ''}><th scope="row">${escape(method.label)}</th>${tableVersions.map(version => {
          const value = valueFor(state.model, method.id, version);
          return `<td${version === state.version ? ' class="is-selected-version"' : ''}>${Number.isFinite(value?.mean) ? `${format(value.mean, 1)} <span>± ${format(value.se, 2)}</span>` : '—'}</td>`;
        }).join('')}</tr>`).join('')}</tbody>${data.timewarp.teacher ? `<tfoot><tr><th scope="row">${escape(data.timewarp.teacher.label)}<span>Teacher reference</span></th>${tableVersions.map(version => {
          const value = data.timewarp.teacher.values?.[version];
          return `<td>${Number.isFinite(value?.mean) ? `${format(value.mean, 1)} <span>± ${format(value.se, 2)}</span>` : '—'}</td>`;
        }).join('')}</tr></tfoot>` : ''}`;
      status.textContent = `${model.label}, TimeWarp ${state.version}. Mean success rates and standard errors displayed. The complete table is available below.`;
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
    const table = panel.querySelector('.benchmark-table');
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
      rows.innerHTML = online.methods.map(method => {
        const value = getValue(method.id, state.difficulty);
        const mean = percent(value?.mean);
        const se = percent(value?.se);
        if (!Number.isFinite(mean)) return `<div class="benchmark-row"><span class="benchmark-method">${escape(method.label)}</span><span class="benchmark-unreported">Not reported</span></div>`;
        const hasError = Number.isFinite(se);
        const low = Math.max(0, mean - (hasError ? se : 0));
        const high = Math.min(maximum, mean + (hasError ? se : 0));
        const label = `${method.label}: ${format(mean, 1)} percent${hasError ? ', standard error ' + format(se, 1) + ' percentage points' : ''}`;
        return `<div class="benchmark-row${method.id === 'webkd' ? ' is-webkd' : ''}">
          <span class="benchmark-method">${escape(method.label)}</span>
          <span class="benchmark-track" aria-hidden="true"><span class="benchmark-bar" style="width:${Math.min(maximum, mean) / maximum * 100}%"></span>${hasError ? `<span class="benchmark-error" style="left:${low / maximum * 100}%;width:${Math.max(0, high - low) / maximum * 100}%"></span>` : ''}</span>
          <span class="benchmark-number" aria-label="${escape(label)}">${format(mean, 1)}${hasError ? `<span> ± ${format(se, 1)}</span>` : ''}</span>
        </div>`;
      }).join('');
      table.innerHTML = `<caption>${escape(model.label)} · OnlineMind2Web · Success rate (%)</caption>
        <thead><tr><th scope="col">Method</th>${online.difficulties.map(item => `<th scope="col"${item.id === state.difficulty ? ' class="is-selected-version"' : ''}>${escape(item.label)}<span>Mean ± SE</span></th>`).join('')}</tr></thead>
        <tbody>${online.methods.map(method => `<tr${method.id === 'webkd' ? ' class="is-webkd"' : ''}><th scope="row">${escape(method.label)}</th>${online.difficulties.map(item => {
          const value = getValue(method.id, item.id);
          return `<td${item.id === state.difficulty ? ' class="is-selected-version"' : ''}>${Number.isFinite(value?.mean) ? `${format(percent(value.mean), 1)} <span>± ${format(percent(value.se), 1)}</span>` : '—'}</td>`;
        }).join('')}</tr>`).join('')}</tbody>`;
      status.textContent = `${model.label}, OnlineMind2Web, ${difficulty.label}. Seven methods displayed as mean success rate and standard error. The axis remains 0 to 25 percent. All difficulties are available in the table below.`;
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

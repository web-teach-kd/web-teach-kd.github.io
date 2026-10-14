/* WEBKD design workbook. Everything stays local; the preview receives validated settings. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storageKey = 'webkd-design-workbook-v1';
  const palettes = {
    notebook:{name:'Field notes',colors:['#f7f7ef','#252820','#d3df81'],description:'Ivory, ink, and olive. Editing marks feel natural; the research stays in the foreground.'},
    blueprint:{name:'Blueprint',colors:['#f2f5f9','#192a40','#bad7ff'],description:'Cool paper and blue. A more technical mood, especially with diagrams and structured labels.'},
    workshop:{name:'Workshop',colors:['#faf3ec','#392a25','#edc0a5'],description:'Warm paper and terracotta. More human and editorial; keep numerical results in a restrained tone.'},
    plum:{name:'Plum',colors:['#f8f4f8','#302334','#dfb8ef'],description:'Soft plum with deep ink. Expressive without relying on a saturated technology gradient.'},
    mono:{name:'Just ink',colors:['#f5f5f3','#202120','#d4d8d2'],description:'A restrained monochrome study. Typography, rules, and whitespace have to carry the hierarchy.'},
    night:{name:'After hours',colors:['#151c24','#eff4f7','#b9e69a'],description:'Deep slate and a bright green accent. Strong diagram contrast; use highlights sparingly.'}
  };
  const typefaces = {
    editorial:{name:'Editorial',fonts:'DM Sans + Instrument Serif',family:"'DM Sans'",sample:"'Instrument Serif'",description:'A readable sans with an expressive serif accent. Strong for a concept-first story.'},
    technical:{name:'Technical',fonts:'Space Grotesk + IBM Plex Sans',family:"'Space Grotesk'",sample:"'Space Grotesk'",description:'Geometric headings and practical text. Use when the method and interface diagrams should lead.'},
    scholarly:{name:'Scholarly',fonts:'Source Serif 4 + Source Sans 3',family:"'Source Serif 4'",sample:"'Source Serif 4'",description:'A contemporary journal feel. Particularly suited to a paper-first title and visible equations.'},
    swiss:{name:'Swiss',fonts:'Manrope throughout',family:"'Manrope'",sample:"'Manrope'",description:'One type family, clear hierarchy. Information density and spacing do more of the expressive work.'}
  };
  const labels = {
    palette:Object.fromEntries(Object.entries(palettes).map(([k,v])=>[k,v.name])),
    typography:Object.fromEntries(Object.entries(typefaces).map(([k,v])=>[k,v.name+' · '+v.fonts])),
    hero:{split:'Split story',centered:'Centered story',paper:'Paper first'},
    accent:{marker:'Highlighter + editing marks',underline:'Precise underlines',dot:'Dots + annotations',quiet:'Quiet decoration'},
    density:{spacious:'Spacious',balanced:'Balanced',compact:'Compact'},
    corners:{sharp:'Square edges',soft:'Soft edges'},
    animation:{deep:'Full explanation + loss',overview:'22-second overview',static:'Static diagram'}
  };
  const sectionNames={idea:'The idea',method:'Method + loss',results:'Evidence',paper:'Paper & citation'};
  const orders={story:['idea','method','results','paper'],evidence:['results','idea','method','paper'],method:['method','idea','results','paper']};
  const defaults={palette:'notebook',typography:'editorial',hero:'split',accent:'marker',density:'balanced',corners:'sharp',animation:'deep',customAccent:'',sections:[...orders.story]};
  const presets={
    field:{name:'Field notes',note:'Concept first. Editorial typography, olive edits, and a concrete correction lead the page.',settings:{...defaults}},
    technical:{name:'Technical atlas',note:'Mechanics first. Blue accents, geometric headings, and the method before the example.',settings:{...defaults,palette:'blueprint',typography:'technical',accent:'dot',hero:'centered',density:'compact',sections:[...orders.method]}},
    journal:{name:'The journal',note:'A research essay. The full paper title and scholarly typography set an academic tone.',settings:{...defaults,palette:'workshop',typography:'scholarly',hero:'paper',accent:'underline',density:'spacious'}},
    ink:{name:'Just ink',note:'Evidence first. A compact, monochrome page with one sans-serif family and minimal decoration.',settings:{...defaults,palette:'mono',typography:'swiss',hero:'paper',accent:'quiet',density:'compact',sections:[...orders.evidence]}}
  };
  function sanitiseSettings(input){
    const settings=clone(defaults);
    if(!input||typeof input!=='object')return settings;
    for(const key of Object.keys(labels))if(Object.hasOwn(labels[key],input[key]))settings[key]=input[key];
    if(Array.isArray(input.sections)&&input.sections.length===4&&new Set(input.sections).size===4&&input.sections.every(v=>Object.hasOwn(sectionNames,v)))settings.sections=[...input.sections];
    if(typeof input.customAccent==='string'&&/^#[0-9a-f]{6}$/i.test(input.customAccent))settings.customAccent=input.customAccent;
    return settings;
  }
  function initialState(){return {version:1,settings:clone(defaults),notes:'',questions:'',saved:Object.entries(presets).map(([id,p])=>({id:'preset-'+id,name:p.name,note:p.note,settings:sanitiseSettings(p.settings)}))};}
  function sanitiseWorkspace(value){
    if(!value||typeof value!=='object'||!value.settings)throw Error('This is not a WEBKD explorer workspace.');
    const clean={version:1,settings:sanitiseSettings(value.settings),notes:typeof value.notes==='string'?value.notes.slice(0,30000):'',questions:typeof value.questions==='string'?value.questions.slice(0,15000):'',saved:[]};
    if(Array.isArray(value.saved))clean.saved=value.saved.slice(0,50).filter(s=>s&&typeof s.name==='string').map((s,i)=>({id:'saved-'+i+'-'+Date.now(),name:s.name.slice(0,70),note:typeof s.note==='string'?s.note.slice(0,1200):'',settings:sanitiseSettings(s.settings)}));
    return clean;
  }
  let state=initialState();
  try{const data=JSON.parse(localStorage.getItem(storageKey));if(data)state=sanitiseWorkspace(data);}catch{}
  let activeTab='playground',device='desktop',compareA='current',compareB=state.saved[1]?.id||state.saved[0]?.id||'current';
  let toastTimer;
  function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3000);}
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));$('#save-indicator').textContent='Working document · saved on this browser';}catch{$('#save-indicator').textContent='Browser storage unavailable · export to keep changes';}}
  function currentEntry(){return {id:'current',name:'Current working design',note:'Your live controls, including unsaved changes.',settings:state.settings};}
  function getEntry(id){return id==='current'?currentEntry():state.saved.find(s=>s.id===id)||currentEntry();}
  function post(frame,settings){frame?.contentWindow?.postMessage({type:'webkd:configure',settings:clone(settings)},'*');}
  function sendPreview(){post($('#live-preview'),state.settings);if(activeTab==='compare'){post($('#compare-frame-a'),getEntry(compareA).settings);post($('#compare-frame-b'),getEntry(compareB).settings);}}
  window.addEventListener('message',event=>{
    if(!event.data||event.data.type!=='webkd:ready')return;
    if(event.source===$('#live-preview').contentWindow)post($('#live-preview'),state.settings);
    if(event.source===$('#compare-frame-a').contentWindow)post($('#compare-frame-a'),getEntry(compareA).settings);
    if(event.source===$('#compare-frame-b').contentWindow)post($('#compare-frame-b'),getEntry(compareB).settings);
  });
  $$('iframe').forEach(frame=>frame.addEventListener('load',()=>{
    const settings=frame.id==='live-preview'?state.settings:getEntry(frame.id.endsWith('-a')?compareA:compareB).settings;
    post(frame,settings);
  }));
  function scaleFrames(){
    $$('.frame-stage').forEach(stage=>{
      if(!stage.getClientRects().length)return;
      const parent=stage.parentElement;
      const available=parent.clientWidth-(parent.id==='preview-shell'?parseFloat(getComputedStyle(parent).paddingLeft)*2:0);
      const width=Number(stage.dataset.logicalWidth),height=Number(stage.dataset.logicalHeight);
      const scale=Math.min(1,available/width);
      stage.style.width=Math.min(width,available)+'px';stage.style.height=height*scale+'px';
      const frame=stage.querySelector('iframe');frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform=`scale(${scale})`;
    });
  }
  const resizeObserver=new ResizeObserver(scaleFrames);
  $$('.preview-shell,.comparison-card').forEach(el=>resizeObserver.observe(el));
  window.addEventListener('resize',scaleFrames);
  function setTab(tab){
    if(!['playground','compare','structure','math','notes'].includes(tab))return;
    activeTab=tab;
    $$('[data-tab]').forEach(button=>{const selected=button.dataset.tab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    $$('[role=tabpanel]').forEach(panel=>panel.hidden=panel.id!=='panel-'+tab);
    if(tab!=='math')$('#math-film').pause();
    if(tab==='compare'){$$('.comparison-stage iframe').forEach(frame=>{if(!frame.getAttribute('src'))frame.src=frame.dataset.src;});renderComparison();}
    if(tab==='notes')renderDecisions();
    requestAnimationFrame(scaleFrames);
    sendPreview();
  }
  $$('[data-tab]').forEach(button=>button.addEventListener('click',()=>setTab(button.dataset.tab)));
  $('.workspace-tabs').addEventListener('keydown',event=>{
    const tabs=$$('[data-tab]'),index=tabs.indexOf(document.activeElement);if(index<0)return;
    let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
    event.preventDefault();tabs[next].focus();setTab(tabs[next].dataset.tab);
  });
  $$('[data-go-tab]').forEach(button=>button.addEventListener('click',()=>{setTab(button.dataset.goTab);window.scrollTo({top:0,behavior:'smooth'});}));
  function setSetting(key,value){state.settings=sanitiseSettings({...state.settings,[key]:value});renderControls();sendPreview();persist();}
  function swatches(settings){const colors=[...palettes[settings.palette].colors];if(settings.customAccent)colors[2]=settings.customAccent;return `<span class="swatches" aria-hidden="true">${colors.map(c=>`<i style="background:${c}"></i>`).join('')}</span>`;}
  $('#palette-options').innerHTML=Object.entries(palettes).map(([key,p])=>`<button class="palette-button" data-palette="${key}" aria-pressed="false">${swatches({palette:key})}${p.name}</button>`).join('');
  $('#type-options').innerHTML=Object.entries(typefaces).map(([key,t])=>`<button class="type-button" data-type="${key}" aria-pressed="false"><span><strong style="font-family:${t.family}">${t.name}</strong><small>${t.fonts}</small></span><span class="type-sample" style="font-family:${t.sample}">Aa</span></button>`).join('');
  $$('[data-palette]').forEach(button=>button.addEventListener('click',()=>{state.settings.customAccent='';setSetting('palette',button.dataset.palette);}));
  $$('[data-type]').forEach(button=>button.addEventListener('click',()=>setSetting('typography',button.dataset.type)));
  $$('[data-setting]').forEach(button=>button.addEventListener('click',()=>setSetting(button.dataset.setting,button.dataset.value)));
  $$('[data-select]').forEach(select=>select.addEventListener('change',()=>setSetting(select.dataset.select,select.value)));
  $('#custom-accent').addEventListener('input',event=>setSetting('customAccent',event.target.value));
  $('#clear-accent').addEventListener('click',()=>setSetting('customAccent',''));
  $('#order-select').addEventListener('change',event=>{if(orders[event.target.value])setSetting('sections',[...orders[event.target.value]]);});
  function renderOrder(){
    $('#order-list').innerHTML=state.settings.sections.map((id,index)=>`<li><span>${sectionNames[id]}</span><span class="order-actions"><button data-move="${index}" data-step="-1" aria-label="Move ${sectionNames[id]} earlier" ${index===0?'disabled':''}>↑</button><button data-move="${index}" data-step="1" aria-label="Move ${sectionNames[id]} later" ${index===3?'disabled':''}>↓</button></span></li>`).join('');
    $('#order-select').value=Object.keys(orders).find(key=>orders[key].join()===state.settings.sections.join())||'custom';
    $$('[data-move]').forEach(button=>button.addEventListener('click',()=>{const from=Number(button.dataset.move),to=from+Number(button.dataset.step),sections=[...state.settings.sections];[sections[from],sections[to]]=[sections[to],sections[from]];setSetting('sections',sections);const moved=$(`[data-move="${to}"][data-step="${button.dataset.step}"]`);if(moved&&!moved.disabled)moved.focus();}));
  }
  function settingRows(settings){return [['Palette',labels.palette[settings.palette]+(settings.customAccent?' · '+settings.customAccent:'')],['Typography',labels.typography[settings.typography]],['Hero',labels.hero[settings.hero]],['Accents',labels.accent[settings.accent]],['Spacing',labels.density[settings.density]],['Edges',labels.corners[settings.corners]],['Method visual',labels.animation[settings.animation]],['Reading order',settings.sections.map(s=>sectionNames[s]).join(' → ')]];}
  function renderControls(){
    const s=state.settings;
    $$('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===s.palette)));
    $$('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===s.typography)));
    $$('[data-setting]').forEach(b=>b.setAttribute('aria-pressed',String(s[b.dataset.setting]===b.dataset.value)));
    $$('[data-select]').forEach(select=>select.value=s[select.dataset.select]);
    $('#custom-accent').value=s.customAccent||palettes[s.palette].colors[2];
    $('#palette-description').textContent=palettes[s.palette].description;
    $('#type-description').textContent=typefaces[s.typography].description;
    $('#hero-description').textContent={split:'A quick premise on one side; a concrete example on the other. The fastest route to understanding.',centered:'A larger statement, centered authors, then the example below. More expressive and slower to unfold.',paper:'The full paper title takes priority. A familiar academic structure with less visual theatre.'}[s.hero];
    $('#current-summary').textContent=[palettes[s.palette].name,typefaces[s.typography].name,labels.hero[s.hero],labels.density[s.density]].join(' / ');
    $('#open-preview').href='index.html?design='+encodeURIComponent(JSON.stringify(s));
    $('#design-reason').textContent=s.hero==='paper'?'Check the title’s line breaks and the space given to authors. The first screen should feel like a clear invitation into the research, with one obvious route to the paper.':s.typography==='technical'?'Look at the relationship between headings, trace labels, and diagrams. They should feel like one technical language, with the explanatory example still readable at a glance.':'Does the visual language explain the research before someone reads the abstract? Editing marks make the teacher’s role tangible; generous margins let the example do the work.';
    renderOrder();
    if(activeTab==='compare')renderComparison();
    if(activeTab==='notes')renderDecisions();
  }
  $$('[data-device]').forEach(button=>button.addEventListener('click',()=>{device=button.dataset.device;const sizes={desktop:[1280,1040],tablet:[768,1100],mobile:[390,844]},[width,height]=sizes[device],stage=$('#live-preview').parentElement;stage.dataset.logicalWidth=width;stage.dataset.logicalHeight=height;$('#viewport-label').textContent=width+' px';$$('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));scaleFrames();}));
  $$('[data-focus]').forEach(button=>button.addEventListener('click',()=>$('#live-preview').contentWindow.postMessage({type:'webkd:focus',section:button.dataset.focus},'*')));
  $$('[data-preset]').forEach(button=>button.addEventListener('click',()=>{const p=presets[button.dataset.preset];state.settings=sanitiseSettings(p.settings);renderControls();sendPreview();persist();toast(p.name+' applied');}));
  $('#reset-design').addEventListener('click',()=>{state.settings=clone(defaults);renderControls();sendPreview();persist();toast('Controls reset. Saved directions and notes kept.');});
  $$('[data-order-preset]').forEach(button=>button.addEventListener('click',()=>{setSetting('sections',[...orders[button.dataset.orderPreset]]);setTab('playground');window.scrollTo({top:0,behavior:'smooth'});toast('Reading order updated in the live preview.');}));
  function renderComparison(){
    const entries=[currentEntry(),...state.saved];
    if(!entries.some(e=>e.id===compareA))compareA='current';if(!entries.some(e=>e.id===compareB))compareB=state.saved[0]?.id||'current';
    for(const side of ['a','b']){const select=$('#compare-'+side),id=side==='a'?compareA:compareB;select.innerHTML=entries.map(e=>`<option value="${escape(e.id)}">${escape(e.name)}</option>`).join('');select.value=id;const entry=getEntry(id);$('#compare-note-'+side).textContent=entry.note;post($('#compare-frame-'+side),entry.settings);}
    const a=settingRows(getEntry(compareA).settings),b=settingRows(getEntry(compareB).settings);
    $('#comparison-diff').innerHTML=a.map((row,i)=>`<tr${row[1]!==b[i][1]?' class="difference"':''}><th scope="row">${row[0]}</th><td>${escape(row[1])}</td><td>${escape(b[i][1])}</td></tr>`).join('');
    requestAnimationFrame(scaleFrames);
  }
  $('#compare-a').addEventListener('change',event=>{compareA=event.target.value;renderComparison();});$('#compare-b').addEventListener('change',event=>{compareB=event.target.value;renderComparison();});
  $('#swap-comparison').addEventListener('click',()=>{[compareA,compareB]=[compareB,compareA];renderComparison();});
  $$('[data-use-comparison]').forEach(button=>button.addEventListener('click',()=>{const entry=getEntry(button.dataset.useComparison==='a'?compareA:compareB);state.settings=clone(entry.settings);renderControls();persist();setTab('playground');toast(entry.name+' is now your working direction.');}));
  const saveDialog=$('#save-dialog');
  $$('[data-save-direction]').forEach(button=>button.addEventListener('click',()=>{$('#direction-name').value=palettes[state.settings.palette].name+' / '+typefaces[state.settings.typography].name;$('#direction-note').value='';saveDialog.showModal();$('#direction-name').select();}));
  $('#close-save').addEventListener('click',()=>saveDialog.close());
  $('#save-direction-form').addEventListener('submit',event=>{event.preventDefault();const name=$('#direction-name').value.trim();if(!name)return;state.saved.push({id:'direction-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:name.slice(0,70),note:$('#direction-note').value.trim().slice(0,1200),settings:clone(state.settings)});persist();saveDialog.close();renderDecisions();if(activeTab==='compare')renderComparison();toast('Direction saved. It is available in Compare and Decisions.');});
  function renderDecisions(){
    $('#decision-summary').innerHTML=settingRows(state.settings).map(([k,v])=>`<div><dt>${k}</dt><dd>${escape(v)}</dd></div>`).join('');
    $('#decision-notes').value=state.notes;$('#open-questions').value=state.questions;
    $('#saved-directions').innerHTML=state.saved.length?state.saved.map(s=>`<article class="saved-card">${swatches(s.settings)}<h3>${escape(s.name)}</h3><p>${escape(s.note||'No note yet. This snapshot preserves the full design configuration.')}</p><p class="saved-meta">${escape(typefaces[s.settings.typography].name)} / ${escape(labels.hero[s.settings.hero])}<br>${escape(s.settings.sections.map(id=>sectionNames[id]).join(' → '))}</p><div class="saved-actions"><button class="button small" data-load-direction="${escape(s.id)}">Use direction</button><button class="button small" data-compare-direction="${escape(s.id)}">Compare</button><button class="delete-direction" data-delete-direction="${escape(s.id)}" aria-label="Remove ${escape(s.name)}">Remove</button></div></article>`).join(''):'<p>Save a direction from the playground to keep a snapshot here.</p>';
    $$('[data-load-direction]').forEach(b=>b.addEventListener('click',()=>{state.settings=clone(getEntry(b.dataset.loadDirection).settings);renderControls();persist();setTab('playground');toast('Saved direction applied.');}));
    $$('[data-compare-direction]').forEach(b=>b.addEventListener('click',()=>{compareA='current';compareB=b.dataset.compareDirection;setTab('compare');window.scrollTo({top:0,behavior:'smooth'});}));
    $$('[data-delete-direction]').forEach(b=>b.addEventListener('click',()=>{const removed=state.saved.find(s=>s.id===b.dataset.deleteDirection);state.saved=state.saved.filter(s=>s.id!==b.dataset.deleteDirection);persist();renderDecisions();toast('Removed '+removed.name+'. Current settings are unchanged.');}));
  }
  $('#decision-notes').addEventListener('input',event=>{state.notes=event.target.value;persist();});$('#open-questions').addEventListener('input',event=>{state.questions=event.target.value;persist();});
  function download(filename,content,type){const url=URL.createObjectURL(new Blob([content],{type})),link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('#export-json').addEventListener('click',()=>download('webkd-design-workspace.json',JSON.stringify(state,null,2),'application/json'));
  function brief(){return ['WEBKD DESIGN DECISION BRIEF','',...settingRows(state.settings).map(([k,v])=>k+': '+v),'','DIRECTION & RATIONALE',state.notes||'(To be decided)','','OPEN QUESTIONS',state.questions||'(None recorded)','','SAVED DIRECTIONS',...state.saved.flatMap(s=>['',s.name,s.note,...settingRows(s.settings).map(([k,v])=>'  '+k+': '+v)]),'','ANIMATION','Full Manim treatment: student contexts, extra surprisal, action information, within-step rank weights, weighted CE and role-asymmetric anchoring.','Equations: supplied WEBKD preprint, Eqs. 2, 4, 5, 10 and Appendix B.4/B.5.'].join('\n');}
  $('#export-brief').addEventListener('click',()=>download('webkd-design-brief.txt',brief(),'text/plain'));
  $('#print-brief').addEventListener('click',()=>{$('#print-document').innerHTML=`<p class="print-muted">WEBKD / DESIGN WORKING DOCUMENT</p><h1>Design decision brief</h1><p>Current direction, rationale, and saved alternatives.</p><h2>Working direction</h2><table><tbody>${settingRows(state.settings).map(([k,v])=>`<tr><th>${k}</th><td>${escape(v)}</td></tr>`).join('')}</tbody></table><h2>Direction & rationale</h2><p>${escape(state.notes||'To be decided.')}</p><h2>Questions to resolve</h2><p>${escape(state.questions||'None recorded.')}</p><h2>Saved directions</h2>${state.saved.map(s=>`<article class="print-snapshot"><h3>${escape(s.name)}</h3><p>${escape(s.note)}</p><p class="print-muted">${settingRows(s.settings).map(([k,v])=>escape(k+': '+v)).join('<br>')}</p></article>`).join('')}<h2>Motion & mathematical explanation</h2><p>Show the student’s original contexts, the perplexity premium, leave-one-out action information, the within-step weight map, and the two terms of the objective. Use the paper’s exact masks and weighted-mean denominators.</p><p class="print-muted">Source: supplied WEBKD preprint, Eqs. 2, 4, 5, 10 and Appendix B.4/B.5. This document records design choices, not new experimental findings.</p>`;window.print();});
  $('#import-json').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('Please use a workspace file smaller than 1 MB.');const next=sanitiseWorkspace(JSON.parse(await file.text()));state=next;persist();renderControls();renderDecisions();sendPreview();$('#import-status').textContent='Workspace imported, including settings, notes, and saved directions.';toast('Workspace restored.');}catch(error){$('#import-status').textContent=error.message||'The workspace could not be read.';}event.target.value='';});
  // A deliberately small numerical example. Every CE and seed/current log-ratio is fixed.
  const spans=[{role:'Think',label:'Choose the correct textbox',delta:.12,ce:2.2,d:.35},{role:'Plan',label:'Search, then compare prices',delta:.025,ce:1.6,d:.18},{role:'Memory',label:'Remember the previous page',delta:-.03,ce:.8,d:-.12}];
  const otherRoles=[{role:'Action',ce:1.3,d:.6},{role:'Step',ce:1.1,d:.08}];
  $('#span-controls').innerHTML=spans.map((s,i)=>`<div class="span-control"><div class="span-title"><label for="span-${i}">${s.role}: ${s.label}</label><output id="delta-${i}" for="span-${i}"></output></div><input type="range" id="span-${i}" min="-0.2" max="0.2" step="0.005" value="${s.delta}" aria-label="${s.role} action contribution in nats"><div class="span-feedback"><span id="rank-${i}"></span><span class="span-weight-track" aria-hidden="true"><i class="span-weight-bar" id="bar-${i}"></i></span><span id="weight-${i}"></span></div></div>`).join('');
  function renderLab(){
    const deltas=spans.map(s=>s.delta),spread=Math.max(...deltas)-Math.min(...deltas),gate=Math.min(1,spread/.05),phi=.1;
    const weights=deltas.map(value=>{const lower=deltas.filter(v=>v<value-1e-9).length,equal=deltas.filter(v=>Math.abs(v-value)<1e-9).length,rank=(lower+(equal-1)/2)/(deltas.length-1);return {rank,weight:Math.min(1,Math.max(phi,phi+(1-phi)*(.5+(rank-.5)*gate)))};});
    spans.forEach((s,i)=>{$('#delta-'+i).textContent=(s.delta>=0?'+':'')+s.delta.toFixed(3)+' nats';$('#rank-'+i).textContent='rank '+weights[i].rank.toFixed(2);$('#weight-'+i).textContent='w '+weights[i].weight.toFixed(3);$('#bar-'+i).style.width=weights[i].weight*100+'%';});
    const mask=$('#mask-select').value,beta=Number($('#beta-slider').value);$('#beta-output').textContent=beta.toFixed(2);
    const rows=[...spans,...otherRoles].map((s,i)=>({...s,weight:i<3?weights[i].weight:1,gamma:mask==='none'?0:mask==='all'?1:i<3?1:.000001}));
    const weighted=rows.reduce((sum,r)=>sum+r.weight*r.ce,0)/rows.reduce((sum,r)=>sum+r.weight,0),gammaSum=rows.reduce((sum,r)=>sum+r.gamma,0),anchor=gammaSum?rows.reduce((sum,r)=>sum+r.gamma*(Math.exp(r.d)-r.d-1),0)/gammaSum:0;
    $('#loss-lab-table').innerHTML=rows.map(r=>`<tr><th scope="row">${r.role}</th><td>${r.weight.toFixed(3)}</td><td>${r.gamma===.000001?'10⁻⁶':r.gamma}</td><td>${r.ce.toFixed(1)}</td><td>${r.d.toFixed(2)}</td></tr>`).join('');
    $('#weighted-ce').textContent=weighted.toFixed(4);$('#anchor-term').textContent=(beta*anchor).toFixed(4);$('#loss-total').textContent=(weighted+beta*anchor).toFixed(4);
    $('#weight-intuition').textContent=(spread<1e-9?'All contributions are tied: every rationale span receives 0.55, the midpoint between 0.1 and 1.':spread<.05?'The contribution spread is only '+spread.toFixed(3)+' nats, inside the 0.05-nat dead zone. The weights contract toward 0.55 instead of exaggerating small differences.':'The contribution spread is at least 0.05 nats. Ranks use the full linear map v = 0.1 + 0.9r. Ties share their average rank.')+' Action and step CE weights stay at 1. '+(mask==='rationale'?'Only rationale receives meaningful anchoring.':mask==='all'?'This comparison also anchors the corrected action and step.':'The anchor is off; only weighted imitation remains.');
  }
  spans.forEach((s,i)=>$('#span-'+i).addEventListener('input',event=>{s.delta=Number(event.target.value);renderLab();}));
  $('#beta-slider').addEventListener('input',renderLab);$('#mask-select').addEventListener('change',renderLab);
  $$('[data-lab-preset]').forEach(button=>button.addEventListener('click',()=>{const values={distinct:[.12,.025,-.03],tied:[.025,.025,.025],close:[.025,.02,.015]}[button.dataset.labPreset];spans.forEach((s,i)=>{s.delta=values[i];$('#span-'+i).value=values[i];});renderLab();}));
  $$('[data-chapter]').forEach(button=>button.addEventListener('click',async()=>{const video=$('#math-film');const seek=()=>{video.currentTime=Math.min(Number(button.dataset.chapter),Math.max(0,video.duration-.1));video.play().catch(()=>toast('Press play to start the selected chapter.'));};if(video.readyState>=1)seek();else{video.addEventListener('loadedmetadata',seek,{once:true});video.load();}$$('[data-chapter]').forEach(b=>b.classList.toggle('is-active',b===button));}));
  renderControls();renderDecisions();renderLab();persist();scaleFrames();
  if(location.hash) setTab(location.hash.slice(1));
})();

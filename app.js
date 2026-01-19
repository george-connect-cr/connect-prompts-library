/* Connect Prompt Library (GitHub Pages-ready)
   - Loads prompts.json
   - Search + filters
   - Drawer detail with Copy + Favorite
   - Dark mode + Language toggle
   - Favorites + Recent using localStorage
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  lang: 'es',
  theme: 'light',
  prompts: [],
  filtered: [],
  categories: [],
  tags: [],
  q: '',
  categoryKey: 'all',
  complexity: 'all',
  tag: 'all',
  favorites: new Set(),
  recent: [],
  showOnlyFavorites: false,
  activePrompt: null
};

const LS_KEYS = {
  theme: 'connect_prompt_theme',
  lang: 'connect_prompt_lang',
  favorites: 'connect_prompt_favs',
  recent: 'connect_prompt_recent'
};

const i18n = {
  es: {
    sub: 'Asistencia extraordinaria',
    guide: 'Guía',
    favorites: 'Favoritos',
    lang: 'Idioma',
    theme: 'Tema',
    title: 'Librería de Prompts IA',
    lead: 'Encuentra prompts listos para usar. Optimizados con el marco T‑C‑R‑E‑I (Tarea, Contexto, Reglas, Ejemplo, Inputs).',
    clear: 'Limpiar',
    hint: 'Tip: abre un prompt y copia con un click. Guarda favoritos.',
    browse: 'Explorar',
    recent: 'Recientes',
    quick: 'Atajos',
    export: 'Exportar',
    copy: 'Copiar',
    copied: '¡Copiado!',
    prompt: 'Prompt',
    variables: 'Variables',
    how: 'Cómo usarlo',
    guideTitle: 'Guía rápida: prompts efectivos (TCREI)',
    gT: 'Di exactamente qué necesitas y para qué.',
    gC: 'Incluye audiencia, país, canal, datos disponibles, limitaciones.',
    gR: 'Formato, tono, qué evitar, criterios de calidad.',
    gE: 'Incluye 1 ejemplo corto si el output es delicado.',
    gI: 'Pega la información (texto, tabla, bullets).',
    guideNoteTitle: 'Regla de oro:',
    guideNote: 'si el resultado se usará con cliente, añade restricciones de tono y pide verificación de datos antes de afirmar.',
    guideBuilder: 'Plantilla lista para copiar',
    searchPH: 'Buscar: informe, correo, proveedores, incidentes…',
    allCategories: 'Todas las categorías',
    allComplexity: 'Complejidad: Todas',
    level: 'Nivel',
    allTags: 'Todas las etiquetas',
    results: (n, total) => `${n} resultados · ${total} prompts`,
    showingFavs: 'Mostrando favoritos',
    countMeta: (n) => `${n} categorías`,
    recentEmpty: 'Aún no hay recientes.',
    favEmpty: 'No tienes favoritos todavía.'
  },
  en: {
    sub: 'Extraordinary assistance',
    guide: 'Guide',
    favorites: 'Favorites',
    lang: 'Language',
    theme: 'Theme',
    title: 'AI Prompt Library',
    lead: 'Find ready-to-use prompts optimized with the T‑C‑R‑E‑I framework (Task, Context, Rules, Example, Inputs).',
    clear: 'Clear',
    hint: 'Tip: open a prompt and copy in one click. Save favorites.',
    browse: 'Browse',
    recent: 'Recent',
    quick: 'Shortcuts',
    export: 'Export',
    copy: 'Copy',
    copied: 'Copied!',
    prompt: 'Prompt',
    variables: 'Variables',
    how: 'How to use',
    guideTitle: 'Quick guide: effective prompts (TCREI)',
    gT: 'Be explicit about what you need and why.',
    gC: 'Add audience, country, channel, available data, constraints.',
    gR: 'Output format, tone, what to avoid, quality criteria.',
    gE: 'Include 1 short example if output is sensitive.',
    gI: 'Paste the inputs (text, table, bullets).',
    guideNoteTitle: 'Rule of thumb:',
    guideNote: 'if it will face customers, add tone constraints and ask the model to verify data before asserting.',
    guideBuilder: 'Copy-ready template',
    searchPH: 'Search: report, email, vendors, incidents…',
    allCategories: 'All categories',
    allComplexity: 'Complexity: All',
    level: 'Level',
    allTags: 'All tags',
    results: (n, total) => `${n} results · ${total} prompts`,
    showingFavs: 'Showing favorites',
    countMeta: (n) => `${n} categories`,
    recentEmpty: 'No recent items yet.',
    favEmpty: 'No favorites yet.'
  }
};

function loadLS() {
  try {
    const theme = localStorage.getItem(LS_KEYS.theme);
    const lang = localStorage.getItem(LS_KEYS.lang);
    const favs = JSON.parse(localStorage.getItem(LS_KEYS.favorites) || '[]');
    const recent = JSON.parse(localStorage.getItem(LS_KEYS.recent) || '[]');

    if (theme === 'dark' || theme === 'light') state.theme = theme;
    if (lang === 'en' || lang === 'es') state.lang = lang;
    if (Array.isArray(favs)) state.favorites = new Set(favs);
    if (Array.isArray(recent)) state.recent = recent;
  } catch (e) {
    // ignore
  }
}

function saveLS() {
  localStorage.setItem(LS_KEYS.theme, state.theme);
  localStorage.setItem(LS_KEYS.lang, state.lang);
  localStorage.setItem(LS_KEYS.favorites, JSON.stringify([...state.favorites]));
  localStorage.setItem(LS_KEYS.recent, JSON.stringify(state.recent));
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  $('#themePill').textContent = state.theme === 'dark' ? '☾' : '☀︎';
}

function t(key, ...args) {
  const v = i18n[state.lang][key];
  if (typeof v === 'function') return v(...args);
  return v ?? key;
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  $('#langPill').textContent = state.lang.toUpperCase();
  $('#q').placeholder = t('searchPH');
  $$('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    el.textContent = t(k);
  });
  // lead contains strong tag -> set via innerHTML
  const lead = $('[data-i18n="lead"]');
  lead.innerHTML = state.lang === 'es'
    ? 'Encuentra prompts listos para usar. Optimizados con el marco <strong>T‑C‑R‑E‑I</strong> (Tarea, Contexto, Reglas, Ejemplo, Inputs).'
    : 'Find ready-to-use prompts optimized with the <strong>T‑C‑R‑E‑I</strong> framework (Task, Context, Rules, Example, Inputs).';

  buildSelects();
  render();
}

async function loadPrompts() {
  const res = await fetch('prompts.json', { cache: 'no-store' });
  const data = await res.json();
  state.prompts = data.prompts;

  // Categories
  const byCat = new Map();
  const tagSet = new Set();
  for (const p of state.prompts) {
    byCat.set(p.category.key, p.category);
    (p.tags || []).forEach(tag => tagSet.add(tag));
  }
  state.categories = [...byCat.values()];
  state.tags = [...tagSet].sort((a,b)=>a.localeCompare(b));

  $('#buildMeta').textContent = `v${data.meta?.version || '—'} · ${data.meta?.count || state.prompts.length} prompts · ${data.meta?.framework || 'TCREI'}`;
  $('#countMeta').textContent = t('countMeta', state.categories.length);

  buildQuickChips();
  buildSelects();
  filter();
  render();
}

function buildSelects() {
  const catSel = $('#categorySelect');
  const cxSel = $('#complexitySelect');
  const tagSel = $('#tagSelect');

  // Category select
  catSel.innerHTML = '';
  catSel.append(new Option(state.lang === 'es' ? t('allCategories') : t('allCategories'), 'all'));
  state.categories
    .sort((a,b) => (a[state.lang]||'').localeCompare(b[state.lang]||''))
    .forEach(c => catSel.append(new Option(c[state.lang], c.key)));
  catSel.value = state.categoryKey;

  // Complexity select
  cxSel.innerHTML = '';
  cxSel.append(new Option(t('allComplexity'), 'all'));
  cxSel.append(new Option(`${t('level')} 1`, '1'));
  cxSel.append(new Option(`${t('level')} 2`, '2'));
  cxSel.append(new Option(`${t('level')} 3`, '3'));
  cxSel.value = state.complexity;

  // Tags select
  tagSel.innerHTML = '';
  tagSel.append(new Option(t('allTags'), 'all'));
  state.tags.forEach(tag => tagSel.append(new Option(tag, tag)));
  tagSel.value = state.tag;
}

function buildQuickChips() {
  const chips = $('#quickChips');
  chips.innerHTML = '';
  const presets = [
    { es: '📌 Informes', en: '📌 Reports', q: 'informe report resumen' },
    { es: '✉️ Correos', en: '✉️ Emails', q: 'correo email' },
    { es: '📞 Operación', en: '📞 Ops', q: 'operación ops servicio caso' },
    { es: '🛡️ Cyber', en: '🛡️ Cyber', q: 'seguridad incident vulnerabilidad' },
    { es: '📊 Datos', en: '📊 Data', q: 'datos dashboard KPI SQL' },
    { es: '👥 RRHH', en: '👥 HR', q: 'rrhh reclutamiento desempeño' },
  ];
  presets.forEach(p => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.textContent = p[state.lang];
    b.addEventListener('click', () => {
      state.q = p.q;
      $('#q').value = state.q;
      filter();
      render();
    });
    chips.appendChild(b);
  });
}

function norm(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
}

function filter() {
  const q = norm(state.q);
  state.filtered = state.prompts.filter(p => {
    if (state.showOnlyFavorites && !state.favorites.has(p.id)) return false;

    if (state.categoryKey !== 'all' && p.category.key !== state.categoryKey) return false;
    if (state.complexity !== 'all' && String(p.complexity) !== String(state.complexity)) return false;
    if (state.tag !== 'all' && !(p.tags||[]).includes(state.tag)) return false;

    if (!q) return true;
    const hay = [
      p.id,
      p.title?.es, p.title?.en,
      p.category?.es, p.category?.en,
      (p.tags||[]).join(' '),
      p.prompt?.es, p.prompt?.en
    ].map(norm).join(' | ');
    return q.split(/\s+/).every(tok => hay.includes(tok));
  });
}

function renderCategoryList() {
  const list = $('#categoryList');
  const counts = state.prompts.reduce((m,p)=>{
    m[p.category.key]=(m[p.category.key]||0)+1; return m;
  },{});

  list.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'catbtn';
  allBtn.type = 'button';
  allBtn.setAttribute('aria-current', state.categoryKey==='all');
  allBtn.innerHTML = `<span>${state.lang==='es'?'Todas':'All'}</span><span class="count">${state.prompts.length}</span>`;
  allBtn.addEventListener('click', ()=>{ state.categoryKey='all'; $('#categorySelect').value='all'; filter(); render(); });
  list.appendChild(allBtn);

  state.categories
    .sort((a,b)=>(a[state.lang]||'').localeCompare(b[state.lang]||''))
    .forEach(c => {
      const b = document.createElement('button');
      b.className = 'catbtn';
      b.type = 'button';
      b.setAttribute('aria-current', state.categoryKey===c.key);
      b.innerHTML = `<span>${c[state.lang]}</span><span class="count">${counts[c.key]||0}</span>`;
      b.addEventListener('click', ()=>{
        state.categoryKey=c.key;
        $('#categorySelect').value=c.key;
        filter();
        render();
      });
      list.appendChild(b);
    });
}

function badgeForComplexity(level){
  const lvl = Number(level||1);
  const cls = lvl===1?'badge--lvl1':(lvl===2?'badge--lvl2':'badge--lvl3');
  const label = state.lang==='es' ? `Nivel ${lvl}` : `Level ${lvl}`;
  return `<span class="badge ${cls}">${label}</span>`;
}

function renderGrid() {
  const grid = $('#grid');
  grid.innerHTML = '';

  const items = state.filtered;
  for (const p of items) {
    const el = document.createElement('article');
    el.className = 'card';
    el.tabIndex = 0;

    const isFav = state.favorites.has(p.id);
    const title = p.title[state.lang];
    const cat = p.category[state.lang];

    const tags = (p.tags||[]).slice(0,4).map(tg => `<span class="tag">${tg}</span>`).join('');

    el.innerHTML = `
      <div class="card__top">
        <div>
          <div class="card__title">${title}</div>
          <div class="card__meta">${cat} · ${p.id}</div>
        </div>
        <div class="badges">
          ${badgeForComplexity(p.complexity)}
          <span class="badge">${isFav ? '★' : '☆'}</span>
        </div>
      </div>
      <div class="card__tags">${tags}</div>
    `;

    const open = () => openDrawer(p.id);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); open(); } });
    grid.appendChild(el);
  }
}

function renderRecent() {
  const box = $('#recentList');
  box.innerHTML = '';

  const items = state.recent
    .map(id => state.prompts.find(p=>p.id===id))
    .filter(Boolean)
    .slice(0,6);

  if (items.length===0) {
    const d = document.createElement('div');
    d.className='muted';
    d.textContent = t('recentEmpty');
    box.appendChild(d);
    return;
  }

  items.forEach(p => {
    const b = document.createElement('button');
    b.className='recentbtn';
    b.type='button';
    b.textContent = p.title[state.lang];
    b.addEventListener('click', ()=>openDrawer(p.id));
    box.appendChild(b);
  });
}

function render() {
  renderCategoryList();
  renderRecent();
  renderGrid();

  $('#resultStat').textContent = state.showOnlyFavorites ? t('showingFavs') : t('results', state.filtered.length, state.prompts.length);
  $('#countMeta').textContent = t('countMeta', state.categories.length);
}

function setDrawerOpen(open) {
  const overlay = $('#overlay');
  const drawer = $('#drawer');
  if (open) {
    overlay.hidden = false;
    drawer.hidden = false;
    document.body.style.overflow='hidden';
  } else {
    overlay.hidden = true;
    drawer.hidden = true;
    document.body.style.overflow='';
  }
}

function openDrawer(id) {
  const p = state.prompts.find(x=>x.id===id);
  if (!p) return;
  state.activePrompt = p;

  $('#drawerCategory').textContent = `${p.category[state.lang]} · ${p.id}`;
  $('#drawerTitle').textContent = p.title[state.lang];

  $('#drawerPrompt').textContent = p.prompt[state.lang];

  const badges = $('#drawerBadges');
  badges.innerHTML = `${badgeForComplexity(p.complexity)} ${(p.tags||[]).slice(0,3).map(tg=>`<span class="badge">${tg}</span>`).join('')}`;

  const vars = $('#drawerVars');
  vars.innerHTML = '';
  (p.variables||[]).forEach(v => {
    const s = document.createElement('span');
    s.className='var';
    s.textContent = `{{${v}}}`;
    vars.appendChild(s);
  });

  const how = $('#drawerHow');
  how.innerHTML = '';
  const steps = state.lang==='es'
    ? [
        'Copia el prompt.',
        'Reemplaza las variables {{...}} con tu información real.',
        'Si falta contexto, agrega 2–3 bullets en la sección C (Contexto).',
        'Pide output en el formato exacto que necesitas (tabla / bullets / JSON).'
      ]
    : [
        'Copy the prompt.',
        'Replace {{...}} variables with your real information.',
        'If context is missing, add 2–3 bullets under C (Context).',
        'Request the exact output format you need (table / bullets / JSON).'
      ];
  steps.forEach(st => {
    const li = document.createElement('li');
    li.textContent = st;
    how.appendChild(li);
  });

  // Favorite button
  const isFav = state.favorites.has(p.id);
  $('#btnFav').textContent = isFav ? '★' : '☆';

  // Update recent
  state.recent = [p.id, ...state.recent.filter(x=>x!==p.id)].slice(0,12);
  saveLS();
  renderRecent();

  setDrawerOpen(true);
  setTimeout(()=>$('#btnCopy').focus(), 0);
}

function closeDrawer(){
  setDrawerOpen(false);
  state.activePrompt = null;
}

async function copyActivePrompt() {
  if (!state.activePrompt) return;
  const text = state.activePrompt.prompt[state.lang];
  try {
    await navigator.clipboard.writeText(text);
    const btn = $('#btnCopy');
    const old = btn.textContent;
    btn.textContent = t('copied');
    setTimeout(()=>btn.textContent = old, 900);
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

function toggleFavorite() {
  if (!state.activePrompt) return;
  const id = state.activePrompt.id;
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);

  saveLS();
  $('#btnFav').textContent = state.favorites.has(id) ? '★' : '☆';
  render();
}

function openGuide(open){
  const m = $('#guideModal');
  m.hidden = !open;
}

function exportFiltered() {
  const payload = {
    meta: {
      exportedAt: new Date().toISOString(),
      lang: state.lang,
      count: state.filtered.length
    },
    prompts: state.filtered
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `connect-prompts-${state.lang}-${state.filtered.length}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

function bindEvents() {
  $('#q').addEventListener('input', (e)=>{
    state.q = e.target.value;
    filter();
    renderGrid();
    $('#resultStat').textContent = state.showOnlyFavorites ? t('showingFavs') : t('results', state.filtered.length, state.prompts.length);
  });

  $('#btnClear').addEventListener('click', ()=>{
    state.q='';
    $('#q').value='';
    state.categoryKey='all';
    state.complexity='all';
    state.tag='all';
    state.showOnlyFavorites=false;
    $('#categorySelect').value='all';
    $('#complexitySelect').value='all';
    $('#tagSelect').value='all';
    filter();
    render();
  });

  $('#categorySelect').addEventListener('change', (e)=>{
    state.categoryKey = e.target.value;
    filter();
    render();
  });
  $('#complexitySelect').addEventListener('change', (e)=>{
    state.complexity = e.target.value;
    filter();
    render();
  });
  $('#tagSelect').addEventListener('change', (e)=>{
    state.tag = e.target.value;
    filter();
    render();
  });

  $('#btnTheme').addEventListener('click', ()=>{
    state.theme = state.theme==='dark' ? 'light' : 'dark';
    applyTheme();
    saveLS();
  });

  $('#btnLang').addEventListener('click', ()=>{
    state.lang = state.lang==='es' ? 'en' : 'es';
    saveLS();
    applyI18n();
  });

  $('#overlay').addEventListener('click', closeDrawer);
  $('#btnClose').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape') {
      if(!$('#guideModal').hidden) openGuide(false);
      else closeDrawer();
    }
  });

  $('#btnCopy').addEventListener('click', copyActivePrompt);
  $('#btnFav').addEventListener('click', toggleFavorite);

  $('#btnFavorites').addEventListener('click', ()=>{
    state.showOnlyFavorites = !state.showOnlyFavorites;
    filter();
    render();
    // if opening favorites and none, gently set search
    if (state.showOnlyFavorites && state.filtered.length===0) {
      $('#resultStat').textContent = t('favEmpty');
    }
  });

  $('#btnClearRecent').addEventListener('click', ()=>{
    state.recent = [];
    saveLS();
    renderRecent();
  });

  $('#btnGuide').addEventListener('click', ()=>openGuide(true));
  $('#btnGuideClose').addEventListener('click', ()=>openGuide(false));
  $('#guideModal').addEventListener('click', (e)=>{ if(e.target.id==='guideModal') openGuide(false); });

  $('#btnExport').addEventListener('click', exportFiltered);
}

function init() {
  loadLS();
  applyTheme();
  bindEvents();
  applyI18n();
  loadPrompts().catch(err => {
    console.error(err);
    $('#grid').innerHTML = `<div class="card"><div class="card__title">Error</div><div class="card__meta">No se pudo cargar prompts.json</div></div>`;
  });
}

init();

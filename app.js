/* global PROMPTS */
const state = {
  q: "",
  cat: "Todos",
  output: "",
  level: "",
  lang: "ES",
  theme: localStorage.getItem("theme") || "dark"
};

const els = {
  q: document.getElementById("q"),
  clearBtn: document.getElementById("clearBtn"),
  cats: document.getElementById("cats"),
  grid: document.getElementById("grid"),
  count: document.getElementById("count"),
  outputFilter: document.getElementById("outputFilter"),
  levelFilter: document.getElementById("levelFilter"),
  chips: document.getElementById("chips"),
  themeBtn: document.getElementById("themeBtn"),
  langBtn: document.getElementById("langBtn"),

  modal: document.getElementById("modal"),
  closeModal: document.getElementById("closeModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalMeta: document.getElementById("modalMeta"),
  modalPrompt: document.getElementById("modalPrompt"),
  modalExample: document.getElementById("modalExample"),
  modalNotes: document.getElementById("modalNotes"),
  copyBtn: document.getElementById("copyBtn"),
  copyVarsBtn: document.getElementById("copyVarsBtn"),
  varsList: document.getElementById("varsList"),
};

function setTheme(theme){
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  localStorage.setItem("theme", theme);
  els.themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
}
setTheme(state.theme);

function uniq(arr){ return [...new Set(arr)].sort(); }

function getCategories(){
  return ["Todos", ...uniq(PROMPTS.map(p => p.category))];
}

function matches(p){
  const q = state.q.trim().toLowerCase();
  const hay = `${p.title} ${p.category} ${(p.tags||[]).join(" ")} ${p.output} ${p.level} ${p.prompt}`.toLowerCase();
  if (q && !hay.includes(q)) return false;
  if (state.cat && state.cat !== "Todos" && p.category !== state.cat) return false;
  if (state.output && p.output !== state.output) return false;
  if (state.level && p.level !== state.level) return false;
  return true;
}

function renderCats(){
  els.cats.innerHTML = "";
  getCategories().forEach(c => {
    const b = document.createElement("button");
    b.className = "catBtn" + (state.cat === c ? " active" : "");
    b.textContent = c;
    b.onclick = () => { state.cat = c; render(); };
    els.cats.appendChild(b);
  });
}

function renderChips(){
  const hot = [
    {label:"Minutas", q:"minuta"},
    {label:"M3", q:"m3"},
    {label:"Audara", q:"audara"},
    {label:"Helios", q:"helios"},
    {label:"Phishing", q:"phishing"},
    {label:"KPI", q:"kpi"},
    {label:"Incidente", q:"incidente"},
    {label:"SLA", q:"sla"},
    {label:"WhatsApp", q:"whatsapp"},
  ];
  els.chips.innerHTML = "";
  hot.forEach(x => {
    const c = document.createElement("button");
    c.className = "chip";
    c.textContent = x.label;
    c.onclick = () => { state.q = x.q; els.q.value = x.q; render(); };
    els.chips.appendChild(c);
  });
}

function card(p){
  const d = document.createElement("div");
  d.className = "card";

  const top = document.createElement("div");
  top.className = "cardTop";

  const t = document.createElement("div");
  t.innerHTML = `<div class="cardTitle">${escapeHtml(p.title)}</div><div class="badge">${escapeHtml(p.output)} · ${escapeHtml(p.level)}</div>`;
  top.appendChild(t);

  d.appendChild(top);

  const meta = document.createElement("div");
  meta.className = "cardMeta";
  const tags = (p.tags || []).slice(0,4);
  tags.forEach(tag => {
    const s = document.createElement("span");
    s.className = "tag";
    s.textContent = tag;
    meta.appendChild(s);
  });
  d.appendChild(meta);

  const bottom = document.createElement("div");
  bottom.className = "cardBottom";
  bottom.innerHTML = `<span class="badge">${escapeHtml(p.category)}</span>`;
  const btn = document.createElement("button");
  btn.className = "linkBtn";
  btn.textContent = "Ver";
  btn.onclick = () => openPrompt(p);
  bottom.appendChild(btn);

  d.appendChild(bottom);
  return d;
}

function render(){
  renderCats();
  const filtered = PROMPTS.filter(matches);

  els.grid.innerHTML = "";
  filtered.forEach(p => els.grid.appendChild(card(p)));
  els.count.textContent = `${filtered.length} prompts (de ${PROMPTS.length})`;
}

function detectVars(text){
  const m = text.match(/{{\s*[^}]+\s*}}/g) || [];
  return uniq(m.map(x => x.trim()));
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
  }catch{
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

function openPrompt(p){
  els.modal.classList.remove("hidden");
  els.modalTitle.textContent = p.title;
  els.modalMeta.textContent = `${p.category} · Output: ${p.output} · Nivel: ${p.level} · Tags: ${(p.tags||[]).join(", ")}`;
  els.modalPrompt.textContent = p.prompt;
  els.modalExample.textContent = p.example || "Ejemplo no disponible.";
  els.modalNotes.innerHTML = `<ul>${(p.notes||[]).map(n => `<li>${escapeHtml(n)}</li>`).join("")}</ul>`;

  const vars = detectVars(p.prompt);
  els.varsList.innerHTML = vars.length
    ? vars.map(v => `<span class="varItem">${escapeHtml(v)}</span>`).join("")
    : `<span class="badge">Sin variables</span>`;

  els.copyBtn.onclick = () => copyToClipboard(p.prompt);
  els.copyVarsBtn.onclick = () => {
    const extra = vars.length ? `\n\nVariables:\n- ${vars.join("\n- ")}` : "\n\nVariables: (ninguna)";
    copyToClipboard(p.prompt + extra);
  };

  // tabs
  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tabPanel").forEach(x => x.classList.add("hidden"));
  document.querySelector(`.tab[data-tab="prompt"]`).classList.add("active");
  document.getElementById("tab-prompt").classList.remove("hidden");
}

function closePrompt(){
  els.modal.classList.add("hidden");
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

els.closeModal.onclick = closePrompt;
els.modal.addEventListener("click", (e) => { if (e.target === els.modal) closePrompt(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePrompt(); });

els.q.addEventListener("input", (e) => { state.q = e.target.value; render(); });
els.clearBtn.onclick = () => { state.q=""; els.q.value=""; render(); };
els.outputFilter.onchange = (e) => { state.output = e.target.value; render(); };
els.levelFilter.onchange = (e) => { state.level = e.target.value; render(); };

els.themeBtn.onclick = () => setTheme(state.theme === "light" ? "dark" : "light");

els.langBtn.onclick = () => {
  // MVP: solo ES (deja el botón para evolución)
  state.lang = state.lang === "ES" ? "EN" : "ES";
  els.langBtn.textContent = state.lang;
  alert("MVP: prompts en ES. Si quieres, genero versión EN automáticamente en prompts.js.");
};

renderChips();
render();

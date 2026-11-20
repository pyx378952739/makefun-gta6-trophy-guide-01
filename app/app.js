// Leonida Ledger — GTA VI trophy guide & tracker (offline, static, no network).
// Progress lives in localStorage; export/import moves it as JSON.
const KEY = 'leonida-ledger-v1';
const SETTINGS_KEY = 'leonida-ledger-settings-v1';
const DEMO_SEED = [2, 3, 4, 5, 8, 15, 16, 19, 21, 32, 35, 42, 44]; // 13/55, plausible early-game set

const CATEGORIES = {
  story: 'Story',
  side: 'Side missions',
  activities: 'Activities',
  collectibles: 'Collectibles',
  heists: 'Heists & crime',
  misc: 'Misc',
  platinum: 'Platinum',
};

// Roadmap phases, in the order a player should work them.
const PHASES = [
  { name: '1 · Play the story', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    about: 'Main missions only. The chapter trophies and the named-mission trophies land here, and the final mission closes the story. Before the finale, clear every story-window trophy on the Missables page.' },
  { name: '2 · Strangers & side stories', ids: [22, 23, 24, 25, 26, 27, 29],
    about: 'The stranger strands and the character finales: Andy, Kenton, Billy, Randy and Tyrone, plus Bret\u2019s hunt and 8 full stranger strands. Take side missions whenever they appear; each chain ends in a finale trophy.' },
  { name: '3 · Activities & skills', ids: [15, 16, 17, 18, 19, 20, 21, 28, 46],
    about: 'Stunts, the shooting range, races, fishing, the arcade, meditation and bowling. The Shooting Range golds are the hardest skill test on the list; save them for a focused session.' },
  { name: '4 · Collectibles & exploration', ids: [30, 31, 35, 42],
    about: 'Card sets, WAiNK It locations, 100 vehicles and all 52 areas of Leonida. Do these together: exploring new ground for one fills the others in at the same time.' },
  { name: '5 · Heists, robberies & money', ids: [39, 40, 41, 43, 52, 53, 54, 55],
    about: 'Jewelry stores, bank vaults, armored trucks, gang operations, laundering marked bills, spending, garages and the Scooter Bros app. Rob steadily, launder after every big job.' },
  { name: '6 · Cleanup & odd jobs', ids: [32, 33, 34, 36, 37, 38, 44, 45, 47, 48, 49, 50, 51],
    about: 'Challenges, partner trophies, Combat Focus, the airport, the showroom, the cocktail on Ocean Beach and the odd one-offs. Do the partner trophies while your partner is available.' },
  { name: '7 · The platinum', ids: [1, 14],
    about: '100% completion, then the platinum itself. Nothing left to do here but finish: by the time you reach this phase, the in-game stats page should show only a short cleanup list.' },
];

const GRADE_RANK = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const phaseOf = new Map();
PHASES.forEach((p, i) => p.ids.forEach((id) => phaseOf.set(id, i)));

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let settings = { spoilers: false, theme: 'paper' };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')); } catch { /* keep defaults */ }

// Screenshot helpers: ?seed=2,3,4 seeds progress when nothing is saved;
// ?open=33 opens one trophy's guide; ?spoilers=on / ?theme=night override settings.
const params = new URLSearchParams(location.search);
if (params.has('seed') && earned.size === 0) {
  for (const n of params.get('seed').split(',')) {
    const id = Number(n.trim());
    if (byId.has(id)) earned.add(id);
  }
  save();
}
if (params.get('spoilers') === 'on') settings.spoilers = true;
if (params.get('spoilers') === 'off') settings.spoilers = false;
if (params.get('theme') === 'night' || params.get('theme') === 'paper') settings.theme = params.get('theme');
const openId = Number(params.get('open') ?? '') || null;

function save() { localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b))); }
function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
function applyTheme() { document.documentElement.dataset.theme = settings.theme; }

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function medal(t) {
  const m = el('span', 'medal ' + t.grade, GRADE_LETTER[t.grade]);
  m.title = t.grade;
  return m;
}

function chip(text, cls) { return el('span', 'chip ' + (cls || ''), text); }

function isHidden(t) { return t.spoiler && !settings.spoilers && !earned.has(t.id); }

function trophyCard(t, opts = {}) {
  const card = el('article', 'trophy' + (earned.has(t.id) ? ' earned' : ''));
  const row = el('div', 'trophy-row');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Earned: ' + t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save();
    render();
  });
  row.append(box, medal(t));
  const main = el('div', 'trophy-main');
  if (isHidden(t)) {
    main.append(el('p', 'trophy-name hidden-name', 'Story trophy — hidden'));
    main.append(el('p', 'trophy-desc', 'Turn spoilers on in Settings, or earn it, to see the name and description.'));
  } else {
    main.append(el('p', 'trophy-name', t.name));
    main.append(el('p', 'trophy-desc', t.description));
  }
  const meta = el('div', 'trophy-meta');
  meta.append(chip(t.grade, 'grade-' + t.grade));
  meta.append(chip(CATEGORIES[t.category] || t.category));
  if (t.missable) meta.append(chip('Missable', 'missable'));
  if (earned.has(t.id)) meta.append(chip('Earned', 'earned-chip'));
  main.append(meta);
  row.append(main);
  if (!isHidden(t)) {
    const toggle = el('button', 'guide-toggle', 'Guide');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    row.append(toggle);
    const guide = el('div', 'guide');
    guide.hidden = true;
    guide.append(el('h4', null, 'How to get it'));
    for (const para of t.guide.split(/(?<=[.!?])\s+/)) guide.append(el('p', null, para));
    if (t.missable && t.miss_window) {
      const note = el('p', 'miss-note');
      note.append(el('b', null, 'Missable — '));
      note.append(document.createTextNode(t.miss_window));
      guide.append(note);
    }
    const src = el('p', 'sources');
    src.append(el('b', null, 'Sources: '));
    src.append(document.createTextNode(
      'Name, description and grade: the official PS5 trophy list on Exophase (frozen 2026-11-18). ' +
      'PSNProfiles: no rarity count verified at the time of writing, so none is shown. ' +
      'Guide: our own advice from the official description, not yet checked in the game.'));
    guide.append(src);
    card.append(row, guide);
    toggle.addEventListener('click', () => {
      guide.hidden = !guide.hidden;
      toggle.setAttribute('aria-expanded', String(!guide.hidden));
      toggle.textContent = guide.hidden ? 'Guide' : 'Hide guide';
    });
    if (openId === t.id) {
      guide.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.textContent = 'Hide guide';
    }
  } else {
    card.append(row);
  }
  return card;
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  document.getElementById('earned-count').textContent = String(n);
  document.getElementById('progress-fill').style.width = (n / total * 100).toFixed(1) + '%';
  document.getElementById('progress-pct').textContent = Math.round(n / total * 100) + '%';
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${GRADE_LETTER[g]} ${got}/${all}`;
  }).join(' · ');
  document.getElementById('grade-counts').textContent = counts;
  const miss = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  document.getElementById('missables-badge').textContent = miss ? String(miss) : '';
}

function nextUp() {
  const open = trophies.filter((t) => !earned.has(t.id));
  const score = (t) => {
    let s = (phaseOf.get(t.id) ?? 6) * 10;
    if (t.missable) s -= 25;
    s += GRADE_RANK[t.grade] * 3;
    if (t.category === 'misc') s -= 2;
    return s;
  };
  return open.sort((a, b) => score(a) - score(b) || a.id - b.id).slice(0, 5);
}

function reasonFor(t) {
  if (t.missable) return 'Missable — do it while its window is open.';
  if (t.category === 'story') return 'Next story beat in your current phase.';
  if (t.category === 'misc') return 'Quick win you can do in free roam right now.';
  return 'Next in your current roadmap phase.';
}

function viewChecklist() {
  const panel = el('section', 'view-panel');
  panel.append(el('h2', null, 'Checklist'));
  panel.append(el('p', 'lede', 'All 55 official trophies. Tick one off when it pops on your PS5 — progress is saved in this browser only. Story trophies stay hidden until earned unless you turn spoilers on.'));
  const next = nextUp();
  if (next.length) {
    const box = el('div', 'nextup');
    box.append(el('h3', null, 'Next up'));
    const ol = el('ol');
    for (const t of next) {
      const li = el('li');
      li.append(el('b', null, isHidden(t) ? 'Story trophy' : t.name + ' '));
      li.append(el('span', 'why', reasonFor(t)));
      ol.append(li);
    }
    box.append(ol);
    panel.append(box);
  }
  const controls = el('div', 'controls');
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search trophies…';
  search.setAttribute('aria-label', 'Search trophies');
  const grade = document.createElement('select');
  grade.setAttribute('aria-label', 'Filter by grade');
  for (const [v, label] of [['all', 'All grades'], ['platinum', 'Platinum'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']]) {
    const o = document.createElement('option');
    o.value = v; o.textContent = label; grade.append(o);
  }
  const cat = document.createElement('select');
  cat.setAttribute('aria-label', 'Filter by category');
  const catOpts = [['all', 'All categories'], ...Object.entries(CATEGORIES).map(([v, l]) => [v, l])];
  for (const [v, label] of catOpts) {
    const o = document.createElement('option');
    o.value = v; o.textContent = label; cat.append(o);
  }
  const spoil = el('label', 'check');
  const spoilBox = document.createElement('input');
  spoilBox.type = 'checkbox';
  spoilBox.checked = settings.spoilers;
  spoil.append(spoilBox, document.createTextNode(' Show spoilers'));
  spoilBox.addEventListener('change', () => { settings.spoilers = spoilBox.checked; saveSettings(); render(); });
  controls.append(search, grade, cat, spoil);
  panel.append(controls);
  const countLine = el('p', 'count-line');
  const list = el('div', 'trophy-list');
  panel.append(countLine, list);
  function draw() {
    const q = search.value.trim().toLowerCase();
    const shown = trophies.filter((t) => {
      if (grade.value !== 'all' && t.grade !== grade.value) return false;
      if (cat.value !== 'all' && t.category !== cat.value) return false;
      if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
      return true;
    });
    const got = shown.filter((t) => earned.has(t.id)).length;
    countLine.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${got} earned in this view`;
    list.replaceChildren();
    if (!shown.length) { list.append(el('p', 'empty', 'No trophies match those filters.')); return; }
    for (const t of shown) list.append(trophyCard(t));
  }
  search.addEventListener('input', draw);
  grade.addEventListener('change', draw);
  cat.addEventListener('change', draw);
  draw();
  return panel;
}

function viewRoadmap() {
  const panel = el('section', 'view-panel');
  panel.append(el('h2', null, 'Platinum roadmap'));
  panel.append(el('p', 'lede', 'The 55 trophies in seven phases, built from the official descriptions. Work them in order: story first, side stories second, then activities, collectibles and robberies, cleanup last, and the 100% trophy before the platinum.'));
  for (const phase of PHASES) {
    const got = phase.ids.filter((id) => earned.has(id)).length;
    const box = el('div', 'phase');
    const head = el('div', 'phase-head');
    head.append(el('h3', null, phase.name));
    head.append(el('span', 'phase-count', `${got} / ${phase.ids.length}`));
    box.append(head);
    box.append(el('p', null, phase.about));
    const track = el('div', 'progress-track');
    const fill = el('div', 'progress-fill');
    fill.style.width = (got / phase.ids.length * 100) + '%';
    track.append(fill);
    box.append(track);
    const list = el('div', 'trophy-list');
    list.style.marginTop = '12px';
    for (const id of phase.ids) list.append(trophyCard(byId.get(id)));
    box.append(list);
    panel.append(box);
  }
  return panel;
}

function viewMissables() {
  const panel = el('section', 'view-panel');
  panel.append(el('h2', null, 'Missable trophies'));
  const lede = el('p', 'lede');
  lede.append(document.createTextNode('GTA 6 launched 2026-11-19, and whether missions can be replayed has not been verified in the game yet. So this page is a play-it-safe list built from the official descriptions: anything tied to a specific mission, a one-time choice, a partner who may not stay available, or a one-off world event is listed here with its window. '));
  lede.append(el('strong', null, 'If mission replay exists, none of these are truly missable — but do them while the window is open anyway.'));
  panel.append(lede);
  const miss = trophies.filter((t) => t.missable);
  const got = miss.filter((t) => earned.has(t.id)).length;
  panel.append(el('p', 'count-line', `${got} of ${miss.length} missable trophies earned`));
  const groups = [
    ['Story missions', ['story']],
    ['Side-story finales', ['side']],
    ['Partner, choices & one-off events', ['misc']],
  ];
  for (const [title, cats] of groups) {
    const items = miss.filter((t) => cats.includes(t.category));
    if (!items.length) continue;
    panel.append(el('h3', null, title));
    const list = el('div', 'trophy-list');
    for (const t of items) list.append(trophyCard(t));
    panel.append(list);
  }
  panel.append(el('p', 'note', 'Chapter trophies are not listed here: chapters are story progress, and finishing a chapter cannot be skipped. The final mission is listed because the official description does not say what remains open afterwards.'));
  return panel;
}

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function viewSettings() {
  const panel = el('section', 'view-panel');
  panel.append(el('h2', null, 'Settings'));
  panel.append(el('p', 'lede', 'Spoilers, theme, and your saved progress. Progress is stored only in this browser (localStorage) — nothing leaves your device.'));
  const grid = el('div', 'settings-grid');

  const c1 = el('div', 'setting-card');
  c1.append(el('h3', null, 'Spoilers'));
  c1.append(el('p', null, 'Story trophies (mission and chapter names) are hidden until earned. Turn spoilers on to see them all.'));
  const spoilRow = el('div', 'row');
  const spoilBtn = el('button', 'btn ghost', settings.spoilers ? 'Spoilers: on' : 'Spoilers: off');
  spoilBtn.type = 'button';
  spoilBtn.addEventListener('click', () => { settings.spoilers = !settings.spoilers; saveSettings(); render(); });
  spoilRow.append(spoilBtn);
  c1.append(spoilRow);

  const c2 = el('div', 'setting-card');
  c2.append(el('h3', null, 'Theme'));
  c2.append(el('p', null, 'Paper is the light look; Night is the dark look. Both use one coral accent and system fonts only.'));
  const themeRow = el('div', 'row');
  for (const [v, label] of [['paper', 'Paper (light)'], ['night', 'Night (dark)']]) {
    const b = el('button', 'btn' + (settings.theme === v ? '' : ' ghost'), label);
    b.type = 'button';
    b.addEventListener('click', () => { settings.theme = v; saveSettings(); applyTheme(); render(); });
    themeRow.append(b);
  }
  c2.append(themeRow);

  const c3 = el('div', 'setting-card');
  c3.append(el('h3', null, 'Progress'));
  c3.append(el('p', null, `You have earned ${earned.size} of ${trophies.length} trophies. Export a backup, import one on another device, load the 13-of-55 demo set, or start over.`));
  const row = el('div', 'row');
  const exp = el('button', 'btn', 'Export progress');
  exp.type = 'button';
  exp.addEventListener('click', () => download('leonida-ledger-progress.json', JSON.stringify({ app: 'leonida-ledger', version: 1, earned: [...earned].sort((a, b) => a - b), exported_at: new Date().toISOString() }, null, 2)));
  const impLabel = el('label', 'btn ghost');
  impLabel.textContent = 'Import progress';
  const imp = document.createElement('input');
  imp.type = 'file';
  imp.accept = 'application/json';
  imp.hidden = true;
  imp.addEventListener('change', async () => {
    const f = imp.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const ids = Array.isArray(data) ? data : data.earned;
      const next = new Set();
      for (const id of ids ?? []) if (byId.has(Number(id))) next.add(Number(id));
      earned = next;
      save();
      render();
    } catch { alert('That file is not a valid progress export.'); }
  });
  impLabel.append(imp);
  const demo = el('button', 'btn ghost', 'Load demo progress (13/55)');
  demo.type = 'button';
  demo.addEventListener('click', () => { earned = new Set(DEMO_SEED); save(); render(); });
  const reset = el('button', 'btn danger', 'Reset progress');
  reset.type = 'button';
  reset.addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone.')) { earned = new Set(); save(); render(); }
  });
  row.append(exp, impLabel, demo, reset);
  c3.append(row);

  const c4 = el('div', 'setting-card');
  c4.append(el('h3', null, 'Sources & honesty'));
  c4.append(el('p', null, 'Names, descriptions and grades come from the official PS5 trophy list on Exophase (frozen 2026-11-18), cross-checked against PSNProfiles. No PSN rarity counts are shown: none had been verified when this guide was written. Guides are our own words from the official descriptions alone; anything not pinned down by them is marked unverified in the guide itself.'));
  grid.append(c1, c2, c3, c4);
  panel.append(grid);
  return panel;
}

function render() {
  applyTheme();
  renderProgress();
  const route = (location.hash.replace(/^#\/?/, '') || '').split('/')[0];
  document.querySelectorAll('.tab').forEach((a) => {
    a.classList.toggle('active', (a.dataset.route || '') === route);
  });
  const view = document.getElementById('view');
  view.replaceChildren(
    route === 'roadmap' ? viewRoadmap()
    : route === 'missables' ? viewMissables()
    : route === 'settings' ? viewSettings()
    : viewChecklist(),
  );
}

window.addEventListener('hashchange', render);
render();

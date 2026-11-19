// Leonida Trophy Guide — tracker: checklist saved in localStorage, filters, spoiler
// mode, export/import. Loads only data/trophies.json from its own server; no network
// at run time. URL params (?view=roadmap, ?filter=, ?spoiler=1, ?open=<id>,
// ?earned=<id,id>) set the initial state, used for screenshots and deep links.
const STORE_KEY = 'gta6-trophy-guide-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

const listEl = document.getElementById('trophyList');
const countLine = document.getElementById('countLine');
const emptyState = document.getElementById('emptyState');
const filterNote = document.getElementById('filterNote');
const progressText = document.getElementById('progressText');
const progressDetail = document.getElementById('progressDetail');
const progressFill = document.getElementById('progressFill');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const spoilerBox = document.getElementById('spoiler');
const saveNote = document.getElementById('saveNote');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = loadEarned();
let filter = 'all';
let openId = null;
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    const known = new Set(trophies.map((t) => t.name));
    return new Set(Array.isArray(raw) ? raw.filter((n) => known.has(n)) : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
  saveNote.textContent = 'Progress saved in this browser.';
}

function isStoryHidden(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.name);
}

function kindMatches(t) {
  if (filter === 'all') return true;
  if (filter === 'story') return t.kind === 'story';
  if (filter === 'missable') return t.missable === true;
  if (filter === 'collectibles') return t.kind === 'collectible';
  if (filter === 'activities') return t.kind === 'activity';
  if (filter === 'online') return t.kind === 'online';
  if (filter === 'earned') return earned.has(t.name);
  if (filter === 'todo') return !earned.has(t.name);
  return true;
}

function textMatches(t) {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return true;
  return (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q);
}

function gradeMatches(t) {
  return gradeSelect.value === 'all' || t.grade === gradeSelect.value;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  const labels = {
    platinum: 'Platinum', story: 'Story', side: 'Stranger strand', collectible: 'Collectible',
    activity: 'Activity', crime: 'Crime', exploration: 'Exploration',
    economy: 'Money', completion: '100% completion', misc: 'Moment',
  };
  return labels[kind] ?? kind;
}

function countText(t) {
  if (t.count == null) return '';
  if (t.id === 52 || t.id === 53) return '$' + t.count.toLocaleString('en-US');
  return String(t.count);
}

function renderProgress() {
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.name)) byGrade[t.grade] += 1;
  progressText.textContent = `${earned.size} of ${trophies.length} earned`;
  progressDetail.textContent =
    `${byGrade.platinum} platinum · ${byGrade.gold} gold · ${byGrade.silver} silver · ${byGrade.bronze} bronze`;
  progressFill.style.width = `${(earned.size / trophies.length) * 100}%`;
}

function sourceList(t) {
  const items = (t.sources ?? []).map((s) => {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
    } else {
      li.textContent = s.name;
    }
    return li;
  });
  const ul = document.createElement('ul');
  ul.className = 'sources';
  ul.append(...items);
  return ul;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.name) ? ' earned' : '');
  card.dataset.trophyId = String(t.id);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveEarned();
    render();
  });
  head.append(box);

  const title = document.createElement('div');
  title.className = 'card-title';
  const h3 = document.createElement('h3');
  if (isStoryHidden(t)) {
    h3.textContent = 'Hidden story trophy';
    h3.className = 'spoiler-hidden';
  } else {
    h3.textContent = t.name;
    if (earned.has(t.name)) h3.className = 'earned-name';
  }
  title.append(h3);
  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = isStoryHidden(t)
    ? 'Spoilers hidden — earn this trophy in the game to reveal its name and description.'
    : t.description;
  title.append(desc);
  head.append(title);
  card.append(head);

  const badges = document.createElement('div');
  badges.className = 'badges';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = 'badge ' + t.grade;
  gradeBadge.textContent = gradeLabel(t.grade);
  badges.append(gradeBadge);
  const kindBadge = document.createElement('span');
  kindBadge.className = 'badge';
  kindBadge.textContent = kindLabel(t.kind);
  badges.append(kindBadge);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'badge missable';
    m.textContent = '⚠ Missable';
    badges.append(m);
  }
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'badge hidden-t';
    h.textContent = 'Hidden on PS5';
    badges.append(h);
  }
  if (t.count != null) {
    const c = document.createElement('span');
    c.className = 'badge count';
    c.textContent = 'Target: ' + countText(t);
    badges.append(c);
  }
  card.append(badges);

  const guideBtn = document.createElement('button');
  guideBtn.type = 'button';
  guideBtn.className = 'guide-btn';
  const open = openId === t.id;
  guideBtn.textContent = open ? 'Hide guide ▲' : 'Show guide ▼';
  guideBtn.setAttribute('aria-expanded', String(open));
  guideBtn.addEventListener('click', () => {
    openId = openId === t.id ? null : t.id;
    render();
  });
  card.append(guideBtn);

  if (open) {
    const guide = document.createElement('div');
    guide.className = 'guide';
    const p = document.createElement('p');
    p.textContent = t.guide;
    guide.append(p);
    const label = document.createElement('p');
    label.textContent = 'Sources:';
    guide.append(label);
    guide.append(sourceList(t));
    card.append(guide);
  }
  return card;
}

function render() {
  renderProgress();
  const shown = trophies.filter((t) => kindMatches(t) && gradeMatches(t) && textMatches(t));
  listEl.replaceChildren(...shown.map(trophyCard));
  countLine.textContent = filter === 'all' && !searchInput.value && gradeSelect.value === 'all'
    ? `Showing all ${trophies.length} trophies — ${earned.size} earned, ${trophies.length - earned.size} to go. Tick one when you earn it in the game.`
    : `Showing ${shown.length} of ${trophies.length} trophies — ${earned.size} earned overall.`;

  if (filter === 'online') {
    filterNote.hidden = false;
    filterNote.textContent = 'There are no online trophies: all 55 are single-player and offline. Sources: PowerPyx trophy guide; Output Lag trophy list.';
  } else if (filter === 'missable') {
    filterNote.hidden = false;
    filterNote.textContent = 'Only one trophy is flagged missable: Positive Mental Attitude. Do Lucia’s Chapter 1 balcony meditation and keep a Chapter 1 save.';
  } else {
    filterNote.hidden = true;
  }

  emptyState.hidden = shown.length !== 0;
  if (shown.length === 0) {
    emptyState.textContent = filter === 'online'
      ? 'No online trophies in this game — every one of the 55 is earned offline, in single-player.'
      : 'No trophies match this filter. Try clearing the search or choosing another filter.';
  }
}

function setFilter(next) {
  filter = next;
  for (const chip of document.querySelectorAll('#filters .chip')) {
    chip.classList.toggle('active', chip.dataset.filter === next);
  }
  render();
}

document.querySelectorAll('#filters .chip').forEach((chip) => {
  chip.addEventListener('click', () => setFilter(chip.dataset.filter));
});
searchInput.addEventListener('input', render);
gradeSelect.addEventListener('change', render);
spoilerBox.addEventListener('change', () => {
  spoilerOn = spoilerBox.checked;
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
  render();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', platform: 'PS5', earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const known = new Set(trophies.map((t) => t.name));
    const valid = (Array.isArray(names) ? names : []).filter((n) => known.has(n));
    if (valid.length === 0) throw new Error('no known trophy names in file');
    earned = new Set(valid);
    saveEarned();
    saveNote.textContent = `Imported ${valid.length} earned trophies from ${file.name}.`;
  } catch {
    saveNote.textContent = 'Import failed: that file is not a trophy-progress export from this guide.';
  }
  event.target.value = '';
  render();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!earned.size) return;
  earned = new Set();
  saveEarned();
  saveNote.textContent = 'Checklist reset.';
  render();
});

// Initial state from URL params (screenshots and deep links).
function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view === 'roadmap') {
    document.getElementById('roadmap').scrollIntoView();
  }
  const f = params.get('filter');
  if (f && [...document.querySelectorAll('#filters .chip')].some((c) => c.dataset.filter === f)) {
    filter = f;
    for (const chip of document.querySelectorAll('#filters .chip')) {
      chip.classList.toggle('active', chip.dataset.filter === f);
    }
  }
  if (params.get('spoiler') === '1') {
    spoilerOn = true;
    spoilerBox.checked = true;
    localStorage.setItem(SPOILER_KEY, '1');
  }
  const open = Number(params.get('open'));
  if (Number.isInteger(open) && trophies.some((t) => t.id === open)) openId = open;
  const pre = params.get('earned');
  if (pre) {
    const byId = new Map(trophies.map((t) => [t.id, t.name]));
    for (const part of pre.split(',')) {
      const name = byId.get(Number(part));
      if (name) earned.add(name);
    }
    saveEarned();
  }
}

spoilerBox.checked = spoilerOn;
applyUrlParams();
render();

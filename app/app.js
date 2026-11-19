// Leonida Trophy Guide — tracker logic: load the 55 trophies, render the checklist,
// save ticks in localStorage, filter by kind/grade/search, hide story spoilers,
// export progress to a file and import it back. No network at run time beyond
// fetching this app's own data/trophies.json.
const STORAGE_KEY = 'leonida-trophy-guide-progress-v1';
const SPOILER_KEY = 'leonida-trophy-guide-spoilers-v1';

const listEl = document.getElementById('trophyList');
const metaEl = document.getElementById('listMeta');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeCountsEl = document.getElementById('gradeCounts');
const searchEl = document.getElementById('search');
const gradeFilterEl = document.getElementById('gradeFilter');
const kindFiltersEl = document.getElementById('kindFilters');
const spoilerToggle = document.getElementById('spoilerToggle');
const hideEarnedEl = document.getElementById('hideEarned');
const onlineNote = document.getElementById('onlineNote');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byName = new Map(trophies.map((t) => [t.name, t]));

let earned = loadEarned();
let activeKind = 'all';
let spoilerOn = loadSpoiler();

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((n) => byName.has(n)) : []);
  } catch {
    return new Set();
  }
}

function loadSpoiler() {
  const saved = localStorage.getItem(SPOILER_KEY);
  return saved === null ? true : saved === '1';
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function kindLabel(kind) {
  return { story: 'Story', collectibles: 'Collectibles', activities: 'Activities', crime: 'Crime', quests: 'Character quest', misc: 'One-off', completion: '100% completion', platinum: 'Platinum' }[kind] ?? kind;
}

function isStorySpoiler(trophy) {
  return trophy.kind.includes('story') && spoilerOn && !earned.has(trophy.name);
}

function trophyMatches(trophy) {
  if (gradeFilterEl.value !== 'all' && trophy.grade !== gradeFilterEl.value) return false;
  if (activeKind === 'missable' && !trophy.missable) return false;
  if (activeKind === 'online') return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && !trophy.kind.includes(activeKind)) return false;
  if (hideEarnedEl.checked && earned.has(trophy.name)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(trophy.name.toLowerCase().includes(q) || trophy.description.toLowerCase().includes(q))) return false;
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  progressText.textContent = `${done} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  const counts = {};
  for (const t of trophies) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  const earnedByGrade = {};
  for (const name of earned) {
    const g = byName.get(name)?.grade;
    if (g) earnedByGrade[g] = (earnedByGrade[g] ?? 0) + 1;
  }
  gradeCountsEl.innerHTML = '';
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const span = document.createElement('span');
    span.innerHTML = '';
    span.textContent = `${grade}: ${earnedByGrade[grade] ?? 0}/${counts[grade] ?? 0}`;
    gradeCountsEl.append(span);
  }
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  for (const trophy of shown) {
    const card = document.createElement('article');
    card.className = `trophy${earned.has(trophy.name) ? ' earned' : ''}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned();
      renderProgress();
      renderList();
    });
    card.append(box);

    const body = document.createElement('div');
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    if (isStorySpoiler(trophy)) {
      name.textContent = 'Hidden story trophy';
      const tag = document.createElement('span');
      tag.className = 'hidden-tag';
      tag.textContent = 'SPOILER HIDDEN';
      name.append(tag);
    } else {
      name.textContent = trophy.name;
      if (trophy.hidden) {
        const tag = document.createElement('span');
        tag.className = 'hidden-tag';
        tag.textContent = 'HIDDEN ON PS5';
        name.append(tag);
      }
    }
    body.append(name);

    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = isStorySpoiler(trophy)
      ? 'A story trophy — its name and description stay hidden until you earn it. Tick the box when it pops.'
      : trophy.description;
    body.append(desc);

    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    const gradeTag = document.createElement('span');
    gradeTag.className = `tag grade-${trophy.grade}`;
    gradeTag.textContent = trophy.grade.toUpperCase();
    tags.append(gradeTag);
    for (const kind of trophy.kind) {
      const tag = document.createElement('span');
      tag.className = `tag kind-${kind}`;
      tag.textContent = kindLabel(kind);
      tags.append(tag);
    }
    if (trophy.missable) {
      const tag = document.createElement('span');
      tag.className = 'tag missable';
      tag.textContent = 'MISSABLE';
      tags.append(tag);
    }
    body.append(tags);

    const details = document.createElement('details');
    details.className = 'guide-toggle';
    const summary = document.createElement('summary');
    summary.textContent = isStorySpoiler(trophy) ? 'Guide (hidden with spoilers)' : 'How to get it — guide & sources';
    details.append(summary);
    if (isStorySpoiler(trophy)) {
      const mask = document.createElement('p');
      mask.className = 'spoiler-mask';
      mask.textContent = 'Turn off “Hide story spoilers” above, or earn this trophy, to read its guide.';
      details.append(mask);
    } else {
      const guide = document.createElement('p');
      guide.className = 'guide-text';
      guide.textContent = trophy.guide;
      details.append(guide);
      const sources = document.createElement('p');
      sources.className = 'guide-sources';
      sources.textContent = 'Sources: ';
      trophy.sources.forEach((source, i) => {
        if (i > 0) sources.append(document.createTextNode(' · '));
        const a = document.createElement('a');
        a.href = source.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = source.name;
        sources.append(a);
      });
      details.append(sources);
    }
    body.append(details);
    card.append(body);
    listEl.append(card);
  }
  metaEl.textContent = activeKind === 'online'
    ? 'Online trophies: 0 of 55 — every trophy is single-player.'
    : `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  onlineNote.hidden = activeKind !== 'online';
  renderProgress();
}

function exportProgress() {
  const payload = { app: 'leonida-trophy-guide', exported: new Date().toISOString(), earned: [...earned].sort() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const next = new Set(names.filter((n) => typeof n === 'string' && byName.has(n)));
    earned = next;
    saveEarned();
    renderList();
    alert(`Imported ${earned.size} earned trophies.`);
  } catch {
    alert('That file is not a Leonida Trophy Guide export — no progress was changed.');
  }
}

spoilerToggle.checked = spoilerOn;
spoilerToggle.addEventListener('change', () => {
  spoilerOn = spoilerToggle.checked;
  saveSpoiler();
  renderList();
});
searchEl.addEventListener('input', renderList);
gradeFilterEl.addEventListener('change', renderList);
hideEarnedEl.addEventListener('change', renderList);
kindFiltersEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-kind]');
  if (!button) return;
  activeKind = button.dataset.kind;
  for (const b of kindFiltersEl.querySelectorAll('button')) b.classList.toggle('active', b === button);
  renderList();
});
exportBtn.addEventListener('click', exportProgress);
importFile.addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
resetBtn.addEventListener('click', () => {
  if (confirm('Clear all earned ticks? This cannot be undone (export first if you want a backup).')) {
    earned = new Set();
    saveEarned();
    renderList();
  }
});

renderList();

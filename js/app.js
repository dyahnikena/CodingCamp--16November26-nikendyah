/**
 * Todo List Life Dashboard — app.js
 * Vanilla JS · LocalStorage · No frameworks
 */

'use strict';

/* ================================================================
   HELPERS
   ================================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function getLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(msg, duration = 2800) {
  const toast = $('#toast');
  const toastMsg = $('#toastMsg');
  toastMsg.textContent = msg;
  toast.hidden = false;
  toast.classList.remove('fade-out');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => { toast.hidden = true; }, 420);
  }, duration);
}

/* ================================================================
   GREETING & CLOCK
   ================================================================ */

function getGreetingText(hour) {
  if (hour >= 5  && hour < 12) return '🌤 Good Morning';
  if (hour >= 12 && hour < 17) return '☀️ Good Afternoon';
  if (hour >= 17 && hour < 21) return '🌆 Good Evening';
  return '🌙 Good Night';
}

function updateClock() {
  const now = new Date();
  const hour = now.getHours();

  $('#greeting').textContent = getGreetingText(hour);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  $('#datetime').textContent = `${timeStr} · ${dateStr}`;
}

updateClock();
setInterval(updateClock, 1000);

/* ================================================================
   THEME
   ================================================================ */

const html = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  setLS('theme', theme);
}

applyTheme(getLS('theme', 'light'));

$('#themeToggle').addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(next);
});

/* ================================================================
   FOCUS TIMER
   ================================================================ */

const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // 326.73

const timerDisplay = $('#timerDisplay');
const timerRing    = $('#timerRing');

let timerDuration  = getLS('pomodoroDuration', 25) * 60; // in seconds
let timerRemaining = timerDuration;
let timerRunning   = false;
let timerInterval  = null;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(timerRemaining);
  const progress = timerRemaining / timerDuration;
  timerRing.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  timerRing.classList.toggle('low', timerRemaining <= 60 && timerRunning);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      showToast('⏰ Focus session complete! Take a break.', 4000);
      updateTimerUI();
      return;
    }
    timerRemaining--;
    updateTimerUI();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerRing.classList.remove('low');
}

function resetTimer() {
  stopTimer();
  timerRemaining = timerDuration;
  updateTimerUI();
}

$('#timerStart').addEventListener('click', startTimer);
$('#timerStop').addEventListener('click', stopTimer);
$('#timerReset').addEventListener('click', resetTimer);

$('#pomodoroSet').addEventListener('click', () => {
  const val = parseInt($('#pomodoroMinutes').value, 10);
  if (!val || val < 1 || val > 120) {
    showToast('Please enter a value between 1 and 120 minutes.');
    return;
  }
  stopTimer();
  timerDuration  = val * 60;
  timerRemaining = timerDuration;
  setLS('pomodoroDuration', val);
  updateTimerUI();
  showToast(`⏱ Timer set to ${val} minute${val !== 1 ? 's' : ''}.`);
});

// Restore saved duration on load
$('#pomodoroMinutes').value = getLS('pomodoroDuration', 25);
updateTimerUI();

/* ================================================================
   TO-DO LIST
   ================================================================ */

let tasks = getLS('tasks', []);
// Each task: { id, text, done }

function saveTasks() {
  setLS('tasks', tasks);
}

function getSortedTasks() {
  const mode = $('#sortSelect').value;
  const copy = [...tasks];
  if (mode === 'az')    return copy.sort((a, b) => a.text.localeCompare(b.text));
  if (mode === 'za')    return copy.sort((a, b) => b.text.localeCompare(a.text));
  if (mode === 'done')  return copy.sort((a, b) => Number(a.done) - Number(b.done));
  if (mode === 'undone')return copy.sort((a, b) => Number(b.done) - Number(a.done));
  return copy;
}

function renderTasks() {
  const list    = $('#todoList');
  const empty   = $('#todoEmpty');
  const sorted  = getSortedTasks();

  list.innerHTML = '';

  if (sorted.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `todo__item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="todo__check" aria-label="Mark done" ${task.done ? 'checked' : ''}>
      <span class="todo__text">${escapeHtml(task.text)}</span>
      <div class="todo__actions">
        <button class="btn btn--edit" aria-label="Edit task" title="Edit">✏️</button>
        <button class="btn btn--danger" aria-label="Delete task" title="Delete">🗑</button>
      </div>
    `;

    // Checkbox
    li.querySelector('.todo__check').addEventListener('change', e => {
      task.done = e.target.checked;
      saveTasks();
      renderTasks();
    });

    // Edit
    li.querySelector('.btn--edit').addEventListener('click', () => openEditModal(task));

    // Delete
    li.querySelector('.btn--danger').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    list.appendChild(li);
  });
}

$('#todoForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = $('#todoInput');
  const text  = input.value.trim();
  if (!text) return;

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  input.value = '';
  input.focus();
});

$('#sortSelect').addEventListener('change', renderTasks);

renderTasks();

/* ── Edit Modal ── */
let editingTask = null;

function openEditModal(task) {
  editingTask = task;
  $('#editInput').value = task.text;
  $('#editModal').hidden = false;
  $('#editInput').focus();
}

function closeEditModal() {
  editingTask = null;
  $('#editModal').hidden = true;
}

$('#editSave').addEventListener('click', () => {
  if (!editingTask) return;
  const val = $('#editInput').value.trim();
  if (!val) return;
  editingTask.text = val;
  saveTasks();
  renderTasks();
  closeEditModal();
});

$('#editCancel').addEventListener('click', closeEditModal);

$('.modal__backdrop').addEventListener('click', closeEditModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeEditModal();
  if (e.key === 'Enter' && !$('#editModal').hidden) {
    e.preventDefault();
    $('#editSave').click();
  }
});

/* ================================================================
   QUICK LINKS
   ================================================================ */

let links = getLS('quickLinks', []);
// Each link: { id, name, url }

function saveLinks() {
  setLS('quickLinks', links);
}

function getFavicon(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?sz=16&domain_url=${encodeURIComponent(origin)}`;
  } catch {
    return '';
  }
}

function renderLinks() {
  const container = $('#linkList');
  const empty     = $('#linksEmpty');

  container.innerHTML = '';

  if (links.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  links.forEach(link => {
    const chip = document.createElement('div');
    chip.className = 'link-chip';

    const faviconSrc = getFavicon(link.url);
    const imgTag = faviconSrc
      ? `<img src="${faviconSrc}" width="14" height="14" alt="" onerror="this.style.display='none'">`
      : '';

    chip.innerHTML = `
      <a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer">
        ${imgTag}${escapeHtml(link.name)}
      </a>
      <button class="link-chip__delete" aria-label="Remove link" title="Remove">×</button>
    `;

    chip.querySelector('.link-chip__delete').addEventListener('click', () => {
      links = links.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    container.appendChild(chip);
  });
}

$('#linkForm').addEventListener('submit', e => {
  e.preventDefault();
  const nameInput = $('#linkName');
  const urlInput  = $('#linkUrl');
  const name = nameInput.value.trim();
  let   url  = urlInput.value.trim();

  if (!name || !url) return;

  // Ensure protocol
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ id: Date.now(), name, url });
  saveLinks();
  renderLinks();
  nameInput.value = '';
  urlInput.value  = '';
  nameInput.focus();
});

renderLinks();

/* ================================================================
   SECURITY HELPERS
   ================================================================ */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  // Allow safe http/https URLs only
  const safe = /^https?:\/\//i.test(str) ? str : '#';
  return escapeHtml(safe);
}

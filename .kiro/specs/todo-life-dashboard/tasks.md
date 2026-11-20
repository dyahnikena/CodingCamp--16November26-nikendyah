# Implementation Plan: Todo List Life Dashboard

## Overview

Implement a client-side, single-page productivity dashboard in three files: `index.html`, `css/style.css`, and `js/app.js`. All state persists in `localStorage`. The build order follows dependency order: shared infrastructure first, then widgets in increasing complexity, then integration.

## Tasks

- [ ] 1. Scaffold HTML structure and CSS design tokens
  - Write the full `index.html` skeleton: `<header>` with greeting/clock and theme-toggle button, `<main class="dashboard">` with three `<section>` cards (Focus Timer, To-Do List, Quick Links), edit-task modal `<div id="editModal">`, and toast `<div id="toast">`.
  - Write CSS design tokens (`:root` custom properties for colors, radii, shadows, font), dark-theme overrides (`[data-theme="dark"]`), reset rules, and base typography.
  - Add `.header` layout and `.dashboard` CSS Grid (`repeat(auto-fit, minmax(320px,1fr))`).
  - Add `.card`, `.btn`, `.input`, `.label` shared component styles.
  - Add `@media (max-width: 600px)` breakpoint that collapses to a single column.
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 2. Implement LocalStorage helpers and security helpers
  - [ ] 2.1 Implement `getLS(key, fallback)` and `setLS(key, value)` in `js/app.js`
    - `getLS` JSON-parses `localStorage.getItem(key)`; returns `fallback` on missing key or parse error.
    - `setLS` JSON-serializes `value` and writes to `localStorage`.
    - _Requirements: 4.7, 4.8, 6.5, 6.6_

  - [ ] 2.2 Implement `escapeHtml(str)` and `escapeAttr(str)` in `js/app.js`
    - `escapeHtml` replaces `& < > " '` with their HTML entities.
    - `escapeAttr` returns `escapeHtml(str)` for `http://` or `https://` URLs; substitutes `"#"` for all other strings.
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 2.3 Write property test for `escapeHtml` (Property 22)
    - **Property 22: HTML escaping eliminates all injection characters**
    - **Validates: Requirements 7.1, 7.2**
    - Create `tests/pbt.html` loading fast-check from CDN.
    - Generator: `fc.string()`. Assert output has no literal `& < > " '`.

  - [ ]* 2.4 Write property test for `escapeAttr` (Property 23)
    - **Property 23: escapeAttr substitutes unsafe URLs with a safe placeholder**
    - **Validates: Requirements 7.3**
    - Generator: `fc.string()` filtered for non-`http(s)` inputs; assert result `=== "#"`. Generator: `fc.webUrl()`; assert result is not `"#"`.

- [ ] 3. Implement Greeting & Clock widget
  - [ ] 3.1 Implement `getGreetingText(hour)` and `updateClock()` in `js/app.js`
    - `getGreetingText` maps hours 5–11 → morning, 12–16 → afternoon, 17–20 → evening, 0–4 and 21–23 → night.
    - `updateClock` reads `new Date()`, calls `getGreetingText`, sets `#greeting` and `#datetime` `textContent`.
    - Call `updateClock()` once on load; then `setInterval(updateClock, 1000)`.
    - Add CSS styles for `.greeting` (primary color, bold) and `.datetime` (muted, small).
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 3.2 Write property test for `getGreetingText` (Property 1)
    - **Property 1: Greeting function covers all 24 hours**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Generator: `fc.integer({min:0, max:23})`. Assert output is non-empty string with correct zone mapping.

- [ ] 4. Implement Theme Toggle
  - [ ] 4.1 Implement `applyTheme(theme)` and wire `#themeToggle` click in `js/app.js`
    - `applyTheme` sets `data-theme` on `<html>` and calls `setLS("theme", theme)`.
    - On load: `applyTheme(getLS("theme", "light"))`.
    - Toggle handler: reads current `data-theme`, flips to the other value, calls `applyTheme`.
    - Add CSS for `.btn--icon` (round icon button), sun/moon visibility rules (`[data-theme="light"] .icon-moon { display:none }` and inverse).
    - Add color-scheme transitions on `body` for smooth theme swap.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.2 Write property test for theme persistence (Property 2)
    - **Property 2: Theme persistence round-trip**
    - **Validates: Requirements 2.2, 2.3**
    - Generator: `fc.constantFrom("light","dark")`. Assert `applyTheme(t)` → `getLS("theme") === t`.

- [ ] 5. Implement Focus Timer widget
  - [ ] 5.1 Implement `formatTime(seconds)` in `js/app.js`
    - Pads minutes and seconds to two digits; returns `"MM:SS"`.
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 5.2 Write property test for `formatTime` (Property 3)
    - **Property 3: Timer format is always MM:SS**
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - Generator: `fc.integer({min:0, max:7200})`. Assert output matches `/^[0-9]{2}:[0-9]{2}$/`.

  - [ ] 5.3 Implement timer state variables and `updateTimerUI()` in `js/app.js`
    - Declare `timerDuration`, `timerRemaining`, `timerRunning`, `timerInterval`.
    - On load: initialize from `getLS("pomodoroDuration", 25) * 60`; set `#pomodoroMinutes` input value.
    - `updateTimerUI` updates `#timerDisplay` text and SVG ring `stroke-dashoffset`; toggles `.low` class when `timerRemaining ≤ 60` and `timerRunning === true`.
    - Add SVG ring CSS (`.timer__ring`, `.timer__ring-track`, `.timer__ring-progress`, `.timer__ring-progress.low`).
    - _Requirements: 3.1, 3.6, 3.10, 3.11_

  - [ ]* 5.4 Write property test for `updateTimerUI` low-time warning (Property 5)
    - **Property 5: Low-time warning is applied at or below 60 seconds while running**
    - **Validates: Requirements 3.6**
    - Generator: `fc.integer({min:0, max:60})` with `timerRunning = true`; assert `.low` class present. Generator: `fc.integer({min:61})` with running timer; assert no `.low` class.

  - [ ] 5.5 Implement `startTimer()`, `stopTimer()`, and `resetTimer()` in `js/app.js`
    - `startTimer`: no-ops if already running; sets `timerRunning = true`, starts `setInterval` that decrements `timerRemaining` and calls `updateTimerUI`; calls `showToast` and stops on zero.
    - `stopTimer`: clears interval, sets `timerRunning = false`, removes `.low` class.
    - `resetTimer`: calls `stopTimer`, restores `timerRemaining = timerDuration`, calls `updateTimerUI`.
    - Wire `#timerStart`, `#timerStop`, `#timerReset` click listeners.
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [ ]* 5.6 Write property test for `resetTimer` (Property 4)
    - **Property 4: Timer reset restores full duration**
    - **Validates: Requirements 3.4**
    - Generator: `fc.integer({min:60, max:7200})`. After `resetTimer()`, assert `timerRemaining === timerDuration` and `timerRunning === false`.

  - [ ] 5.7 Implement custom Pomodoro duration input in `js/app.js`
    - `#pomodoroSet` click: parse `#pomodoroMinutes` value as integer; if outside 1–120 call `showToast` and return; otherwise call `stopTimer`, update `timerDuration` and `timerRemaining`, call `setLS("pomodoroDuration", val)`, call `updateTimerUI`.
    - _Requirements: 3.7, 3.8, 3.9_

  - [ ]* 5.8 Write property test for Pomodoro duration persistence (Property 6)
    - **Property 6: Pomodoro duration persistence round-trip**
    - **Validates: Requirements 3.9, 3.10**
    - Generator: `fc.integer({min:1, max:120})`. After setting, assert `getLS("pomodoroDuration") === val`.

- [ ] 6. Checkpoint — verify timer and clock
  - Ensure all implemented functions and UI are wired correctly, the timer counts down and stops at zero with a toast, the clock updates every second, and theme persists on reload. Ask the user if questions arise.

- [ ] 7. Implement To-Do List widget
  - [ ] 7.1 Implement `saveTasks()`, `getSortedTasks()`, and `renderTasks()` in `js/app.js`
    - `saveTasks` writes `tasks[]` to `setLS("tasks", tasks)`.
    - `getSortedTasks` shallow-copies `tasks[]` and sorts by `#sortSelect` value (`default`, `az`, `za`, `done`, `undone`) using `localeCompare`.
    - `renderTasks` clears `#todoList`, iterates sorted tasks, creates `<li class="todo__item">` with checkbox, escaped label, edit and delete buttons; toggles `#todoEmpty`.
    - On load: `tasks = getLS("tasks", [])` then `renderTasks()`.
    - Wire `#sortSelect` `change` → `renderTasks`.
    - Add CSS for `.todo__item`, `.todo__item.done`, `.todo__check`, `.todo__text`, `.todo__actions`, `.todo__empty`, `@keyframes slideIn`.
    - _Requirements: 4.5, 4.6, 4.7, 4.8, 4.9, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 7.2 Write property test for `getSortedTasks` non-mutation (Property 14)
    - **Property 14: getSortedTasks does not mutate the source array**
    - **Validates: Requirements 5.7**
    - Generator: `fc.array(taskArb)` + `fc.constantFrom(sortModes)`. Assert original `tasks` order unchanged.

  - [ ]* 7.3 Write property test for sorted view element identity (Property 15)
    - **Property 15: Sorted view contains exactly the same tasks as the source**
    - **Validates: Requirements 5.1, 5.2**
    - Generator: same as 7.2. Assert sorted array `id` set equals source `id` set.

  - [ ]* 7.4 Write property test for locale sort correctness (Property 16)
    - **Property 16: Locale sort order is correct in both directions**
    - **Validates: Requirements 5.3, 5.4**
    - Generator: `fc.array(taskArb, {minLength:2})`. A→Z: adjacent pairs satisfy `localeCompare ≤ 0`; Z→A: `≥ 0`.

  - [ ]* 7.5 Write property test for done-sort partitioning (Property 17)
    - **Property 17: Done-sort partitions tasks correctly**
    - **Validates: Requirements 5.5, 5.6**
    - Generator: `fc.array(taskArb)`. done-last: all `done===false` before all `done===true`; done-first: inverse.

  - [ ] 7.6 Implement `addTask(text)` via `#todoForm` submit handler in `js/app.js`
    - Trim input; return early on empty string.
    - Push `{ id: Date.now(), text, done: false }` to `tasks[]`; call `saveTasks()` and `renderTasks()`.
    - Clear and re-focus `#todoInput`.
    - _Requirements: 4.1_

  - [ ]* 7.7 Write property test for adding a valid task (Property 7)
    - **Property 7: Adding a valid task grows the list by one with done=false**
    - **Validates: Requirements 4.1**
    - Generator: `fc.array(taskArb)` + `fc.string({minLength:1}).filter(s=>s.trim())`. Assert length increases by 1 and new task `done === false`.

  - [ ]* 7.8 Write property test for whitespace-only task rejection (Property 8)
    - **Property 8: Whitespace-only task descriptions are rejected**
    - **Validates: Requirements 4.1**
    - Generator: `fc.stringOf(fc.constantFrom(' ','\t','\n'))`. Assert list length and contents unchanged.

  - [ ] 7.9 Implement edit modal: `openEditModal`, `closeEditModal`, `saveEdit` in `js/app.js`
    - `openEditModal(task)`: set `editingTask`, populate `#editInput`, remove `hidden` from `#editModal`, focus input.
    - `closeEditModal()`: clear `editingTask`, set `#editModal hidden`.
    - `saveEdit()`: trim `#editInput`; return early if empty; mutate `editingTask.text`; call `saveTasks()`, `renderTasks()`, `closeEditModal()`.
    - Close triggers: cancel button click, backdrop click, `Escape` key.
    - Save triggers: save button click, `Enter` key while modal open.
    - Add CSS for `.modal`, `.modal__backdrop`, `.modal__box`, `.modal__actions`, `@keyframes popIn`.
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 7.10 Write property test for edit saves new label (Property 9)
    - **Property 9: Edit saves the new label**
    - **Validates: Requirements 4.3**
    - Generator: task arbitrary + `fc.string({minLength:1}).filter(s=>s.trim())`. After `saveEdit()`, assert `task.text === newLabel.trim()`.

  - [ ]* 7.11 Write property test for cancel discards changes (Property 10)
    - **Property 10: Cancel discards changes**
    - **Validates: Requirements 4.4**
    - Generator: task arbitrary. After `closeEditModal()` without saving, assert `task.text` unchanged.

  - [ ]* 7.12 Write property test for completion toggle inverse (Property 11)
    - **Property 11: Completion toggle is its own inverse**
    - **Validates: Requirements 4.5**
    - Generator: `fc.record({done:fc.boolean(), …})`. Double-toggle returns `done` to original value.

  - [ ]* 7.13 Write property test for delete removes task by id (Property 12)
    - **Property 12: Delete removes the targeted task by id**
    - **Validates: Requirements 4.6**
    - Generator: `fc.array(taskArb, {minLength:1})` + pick one task. After delete, no task with that `id` in array; all others intact.

  - [ ]* 7.14 Write property test for task persistence round-trip (Property 13)
    - **Property 13: Task persistence round-trip**
    - **Validates: Requirements 4.7, 4.8**
    - Generator: `fc.array(taskArb)`. `saveTasks()` → `getLS("tasks")` has same `id/text/done` per task.

- [ ] 8. Implement Quick Links widget
  - [ ] 8.1 Implement `saveLinks()`, `getFavicon(url)`, and `renderLinks()` in `js/app.js`
    - `saveLinks` writes `links[]` to `setLS("quickLinks", links)`.
    - `getFavicon` extracts origin from URL, returns Google favicon service URL; returns `""` on parse error.
    - `renderLinks` clears `#linkList`, creates `.link-chip` elements with favicon `<img>`, escaped label as anchor (`target="_blank" rel="noopener noreferrer"`), and delete button; toggles `#linksEmpty`.
    - On load: `links = getLS("quickLinks", [])` then `renderLinks()`.
    - Add CSS for `.links__form`, `.links__list`, `.link-chip`, `.link-chip__delete`, `.links__empty`.
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 8.2 Write property test for link persistence round-trip (Property 21)
    - **Property 21: Link persistence round-trip**
    - **Validates: Requirements 6.5, 6.6**
    - Generator: `fc.array(linkArb)`. `saveLinks()` → `getLS("quickLinks")` has same `id/name/url` per link.

  - [ ] 8.3 Implement `addLink` via `#linkForm` submit handler in `js/app.js`
    - Trim name and URL; return early if either is empty.
    - Prepend `"https://"` if URL does not match `/^https?:\/\//i`.
    - Push `{ id: Date.now(), name, url }` to `links[]`; call `saveLinks()` and `renderLinks()`.
    - Clear and re-focus `#linkName`.
    - _Requirements: 6.1, 6.2_

  - [ ]* 8.4 Write property test for adding a valid link (Property 18)
    - **Property 18: Adding a valid link grows the list by one**
    - **Validates: Requirements 6.1**
    - Generator: `fc.array(linkArb)` + valid name/URL pair. Assert length increases by 1.

  - [ ]* 8.5 Write property test for URL auto-prefix (Property 19)
    - **Property 19: URL auto-prefix always produces an http(s) URL**
    - **Validates: Requirements 6.2**
    - Generator: `fc.string()` and `fc.webUrl()`. After prefix logic: result starts with `http://` or `https://`; already-prefixed URLs unchanged.

  - [ ]* 8.6 Write property test for link delete (Property 20)
    - **Property 20: Link delete removes the targeted link by id**
    - **Validates: Requirements 6.4**
    - Generator: `fc.array(linkArb, {minLength:1})` + pick one link. After delete, no link with that `id`; others intact.

- [ ] 9. Implement Toast notification system
  - [ ] 9.1 Implement `showToast(message, duration)` in `js/app.js`
    - Set `#toastMsg.textContent`, remove `hidden` from `#toast`, clear any pending timer.
    - After `duration` ms: add `.fade-out` class; after 420 ms more: set `hidden = true`.
    - Re-entrant: if called while a toast is visible, replace message and restart timer.
    - Add CSS for `.toast` (fixed bottom-center, pill shape, `pointer-events:none`) and `.toast.fade-out` (`opacity:0`, 0.4 s transition).
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10. Checkpoint — full integration review
  - Verify all widgets are wired end-to-end: add/edit/delete tasks persists and survives reload; add/remove links persists; Pomodoro timer counts down and fires toast at zero; theme toggle persists; sort control re-renders task list; XSS inputs render as escaped text; `javascript:` link URL renders `href="#"`. Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Each task references specific requirements for traceability.
- Property tests live in `tests/pbt.html` and load fast-check from CDN; they are standalone and require no build step.
- Checkpoints 6 and 10 are integration sanity gates — open the page in a browser and verify manually before moving on.
- All user-supplied strings (`task.text`, `link.name`) must pass through `escapeHtml` before DOM insertion; `link.url` must pass through `escapeAttr` for `href` attributes.
- `Date.now()` is used as ID; millisecond collisions are acceptable for a personal dashboard.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1"] },
    { "id": 4, "tasks": ["4.2", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3"] },
    { "id": 6, "tasks": ["5.4", "5.5"] },
    { "id": 7, "tasks": ["5.6", "5.7"] },
    { "id": 8, "tasks": ["5.8", "6"] },
    { "id": 9, "tasks": ["7.1"] },
    { "id": 10, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 11, "tasks": ["7.7", "7.8", "7.9"] },
    { "id": 12, "tasks": ["7.10", "7.11", "7.12", "7.13", "7.14", "8.1"] },
    { "id": 13, "tasks": ["8.2", "8.3"] },
    { "id": 14, "tasks": ["8.4", "8.5", "8.6", "9.1"] },
    { "id": 15, "tasks": ["10"] }
  ]
}
```

# Requirements Document

## Introduction

The Todo List Life Dashboard is a single-page web application that runs entirely in the browser with no backend server. It combines four productivity widgets — a contextual greeting with live clock, a configurable Pomodoro focus timer, a to-do list, and a quick-links launcher — into one clean, minimal interface. All user data persists in the browser's Local Storage. The app is built with HTML, CSS, and Vanilla JavaScript only (no frameworks), and can be used as a standalone web page or as a browser extension.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Widget**: A self-contained UI card within the Dashboard (e.g., Greeting, Timer, To-Do, Quick Links).
- **Greeting_Widget**: The header area displaying the current time, date, and a time-of-day greeting.
- **Timer**: The configurable Pomodoro focus timer Widget.
- **Todo_List**: The Widget for managing tasks.
- **Task**: A single to-do item with a text label and a completion state (done or not done).
- **Quick_Links**: The Widget for saving and opening bookmarked URLs.
- **Link**: A saved Quick Links entry consisting of a display label and a URL.
- **Local_Storage**: The browser's `localStorage` API, used as the sole persistence mechanism.
- **Theme**: The visual color scheme of the Dashboard, either `light` or `dark`.
- **Pomodoro_Duration**: The configurable length of a focus session in whole minutes (1–120).
- **Toast**: A transient notification message displayed at the bottom of the screen.

---

## Requirements

### Requirement 1: Greeting and Live Clock

**User Story:** As a user, I want to see the current time, date, and a greeting that reflects the time of day, so that the Dashboard feels personal and contextually aware each time I open it.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current local time, updated every second.
2. THE Greeting_Widget SHALL display the current local date, including the weekday, day, month, and year.
3. WHEN the local hour is between 05:00 and 11:59 inclusive, THE Greeting_Widget SHALL display a morning greeting.
4. WHEN the local hour is between 12:00 and 16:59 inclusive, THE Greeting_Widget SHALL display an afternoon greeting.
5. WHEN the local hour is between 17:00 and 20:59 inclusive, THE Greeting_Widget SHALL display an evening greeting.
6. WHEN the local hour is between 21:00 and 04:59 inclusive, THE Greeting_Widget SHALL display a night greeting.

---

### Requirement 2: Light / Dark Theme Toggle

**User Story:** As a user, I want to switch between a light and a dark visual theme, so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control that switches the active Theme between `light` and `dark`.
2. WHEN the Theme is changed, THE Dashboard SHALL persist the selected Theme value to Local_Storage.
3. WHEN the Dashboard is loaded, THE Dashboard SHALL retrieve the previously saved Theme from Local_Storage and apply it before rendering any content.
4. IF no Theme value exists in Local_Storage, THEN THE Dashboard SHALL apply the `light` Theme by default.
5. WHEN the Theme changes, THE Dashboard SHALL apply the new color scheme to all visible elements without requiring a page reload.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a countdown timer I can start, pause, and reset, so that I can structure focused work sessions using the Pomodoro technique.

#### Acceptance Criteria

1. THE Timer SHALL initialize with a Pomodoro_Duration of 25 minutes on first use.
2. WHEN the user activates the Start control, THE Timer SHALL begin counting down from the current remaining time, decrementing once per second.
3. WHEN the user activates the Pause control, THE Timer SHALL stop decrementing and preserve the remaining time.
4. WHEN the user activates the Reset control, THE Timer SHALL stop any active countdown and restore the remaining time to the full Pomodoro_Duration.
5. WHEN the countdown reaches zero, THE Timer SHALL stop automatically and THE Dashboard SHALL display a Toast notifying the user that the focus session is complete.
6. WHILE the remaining time is 60 seconds or less and the Timer is running, THE Timer SHALL display the progress indicator in a warning color distinct from the default color.
7. WHEN the user submits a custom duration value between 1 and 120 inclusive, THE Timer SHALL set the Pomodoro_Duration to that value, stop any active countdown, and reset the remaining time to the new Pomodoro_Duration.
8. WHEN the user submits a custom duration value outside the range 1–120, THE Timer SHALL display a Toast describing the valid range and SHALL NOT change the Pomodoro_Duration.
9. WHEN a Pomodoro_Duration is set by the user, THE Timer SHALL persist that value to Local_Storage.
10. WHEN the Dashboard is loaded, THE Timer SHALL retrieve the saved Pomodoro_Duration from Local_Storage and initialize with that value.
11. IF no Pomodoro_Duration exists in Local_Storage, THEN THE Timer SHALL initialize with a Pomodoro_Duration of 25 minutes.

---

### Requirement 4: To-Do List — Task Management

**User Story:** As a user, I want to add, edit, complete, and delete tasks, so that I can track my work and mark progress throughout the day.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task label of up to 120 characters, THE Todo_List SHALL add a new Task with that label and a completion state of `not done`.
2. WHEN the user activates the edit control for a Task, THE Dashboard SHALL open a modal dialog pre-filled with the Task's current label.
3. WHEN the user saves the edit modal with a non-empty label, THE Todo_List SHALL update the Task's label to the new value and close the modal.
4. WHEN the user cancels the edit modal, THE Todo_List SHALL discard any changes and close the modal.
5. WHEN the user toggles the completion control for a Task, THE Todo_List SHALL update that Task's completion state to the opposite value.
6. WHEN the user activates the delete control for a Task, THE Todo_List SHALL remove that Task permanently.
7. THE Todo_List SHALL persist all Task data to Local_Storage after every add, edit, completion toggle, or delete operation.
8. WHEN the Dashboard is loaded, THE Todo_List SHALL retrieve and display all previously saved Tasks from Local_Storage.
9. IF Local_Storage contains no Task data, THEN THE Todo_List SHALL display an empty-state message.

---

### Requirement 5: To-Do List — Sorting

**User Story:** As a user, I want to sort my task list by different criteria, so that I can quickly find the tasks most relevant to me.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a sort control with the following options: Default (insertion order), A → Z (alphabetical ascending), Z → A (alphabetical descending), Done last (incomplete tasks first), Done first (completed tasks first).
2. WHEN the user changes the sort control, THE Todo_List SHALL re-render the task list in the selected order immediately.
3. WHEN tasks are sorted by A → Z, THE Todo_List SHALL order Tasks by their label using locale-aware string comparison in ascending order.
4. WHEN tasks are sorted by Z → A, THE Todo_List SHALL order Tasks by their label using locale-aware string comparison in descending order.
5. WHEN tasks are sorted by Done last, THE Todo_List SHALL place all incomplete Tasks before all completed Tasks.
6. WHEN tasks are sorted by Done first, THE Todo_List SHALL place all completed Tasks before all incomplete Tasks.
7. THE Todo_List SHALL apply the sort to the rendered view only and SHALL NOT alter the underlying storage order of Tasks.

---

### Requirement 6: Quick Links

**User Story:** As a user, I want to save and launch bookmarked URLs from the Dashboard, so that I can reach frequently used sites with one click.

#### Acceptance Criteria

1. WHEN the user submits a Link entry with a non-empty label (up to 30 characters) and a non-empty URL, THE Quick_Links Widget SHALL add a new Link chip to the display.
2. WHEN a submitted URL does not begin with `http://` or `https://`, THE Quick_Links Widget SHALL prepend `https://` to the URL before saving.
3. WHEN the user activates a Link chip, THE Dashboard SHALL open the Link's URL in a new browser tab without navigating away from the Dashboard.
4. WHEN the user activates the remove control on a Link chip, THE Quick_Links Widget SHALL permanently remove that Link.
5. THE Quick_Links Widget SHALL persist all Link data to Local_Storage after every add or remove operation.
6. WHEN the Dashboard is loaded, THE Quick_Links Widget SHALL retrieve and display all previously saved Links from Local_Storage.
7. IF Local_Storage contains no Link data, THEN THE Quick_Links Widget SHALL display an empty-state message.

---

### Requirement 7: Data Integrity and Security

**User Story:** As a user, I want any text I enter to be rendered safely, so that the Dashboard is not vulnerable to cross-site scripting through task labels or link names.

#### Acceptance Criteria

1. WHEN rendering a Task label, THE Dashboard SHALL HTML-escape all special characters (`&`, `<`, `>`, `"`, `'`) before inserting the label into the DOM.
2. WHEN rendering a Link label, THE Dashboard SHALL HTML-escape all special characters before inserting the label into the DOM.
3. WHEN rendering a Link URL as an `href` attribute, THE Dashboard SHALL allow only URLs beginning with `http://` or `https://` and SHALL substitute `#` for any URL that does not match this pattern.

---

### Requirement 8: Toast Notifications

**User Story:** As a user, I want brief, non-blocking feedback messages when certain actions complete, so that I know the Dashboard has responded to my input.

#### Acceptance Criteria

1. WHEN a Toast is triggered, THE Dashboard SHALL display the Toast message at the bottom of the viewport for approximately 2800 milliseconds, then hide it automatically.
2. WHEN a second Toast is triggered before the first has hidden, THE Dashboard SHALL replace the first Toast's message with the new message and restart the display timer.
3. THE Dashboard SHALL render Toast messages without blocking user interaction with any other Widget.

---

### Requirement 9: Responsive Layout

**User Story:** As a user, I want the Dashboard to be usable on both desktop and mobile screens, so that I can access it from any device.

#### Acceptance Criteria

1. THE Dashboard SHALL render all Widgets in a multi-column grid layout on viewports 601 pixels wide or wider.
2. WHEN the viewport width is 600 pixels or narrower, THE Dashboard SHALL render all Widgets in a single-column layout.
3. THE Dashboard SHALL use a single CSS file (`css/style.css`) and a single JavaScript file (`js/app.js`) with no additional external file dependencies beyond optional CDN-hosted fonts or icons.

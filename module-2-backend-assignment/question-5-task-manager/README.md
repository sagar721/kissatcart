# QUESTION 5 — Mini Project: Modular Backend Utility

# Task Manager (CLI) — Node.js ES Modules Mini Project

## 1. Project Title

**Task Manager — A Command-Line Task Management Utility built with Node.js, ES Modules, `fs/promises` and `.env` configuration**

## 2. Student Details

| Field | Details |
|-------|---------|
| Name | SAGAR KUMAR |
| PRN | SOE25BTAM29 |
| Section | A |
| Module | Module 2 — Modern JavaScript for Backend Development |
| Question | Question 5 — Mini Project: Modular Backend Utility |

## 3. Project Overview

Task Manager is a small command-line (CLI) backend utility that helps a user manage daily tasks. A user can add a task, view all tasks, mark a task as completed and delete a task directly from the terminal. Tasks are stored in a JSON file (`data/tasks.json`), so no database is required. All file operations are asynchronous, the code is organised into ES Modules, and the application name and data-file location are read from a `.env` file instead of being hardcoded.

## 4. Objectives

- Organise a Node.js application into separate ES Modules (configuration, data, services, main app).
- Use modern JavaScript features: `let`/`const`, arrow functions, template literals, destructuring, spread operator, default values and optional chaining.
- Perform asynchronous file operations using Promises and `async/await` (`fs/promises`).
- Validate user input and handle errors with clear, friendly messages.
- Store configuration in `.env` and read it using `process.env` (via `dotenv`).
- Demonstrate both successful execution and error scenarios.

## 5. Technologies Used

| Technology | Purpose |
|------------|---------|
| Node.js (v18 or above, LTS recommended) | JavaScript runtime |
| JavaScript (ES6+, ES Modules) | Programming language and module system |
| `node:fs/promises` (built-in) | Asynchronous reading/writing of the JSON file |
| `node:path`, `node:url` (built-in) | Building file paths that work on Windows, macOS and Linux |
| `dotenv` (only external dependency) | Loads variables from `.env` into `process.env` |
| JSON file | Simple persistent storage for tasks |

## 6. Features

- **Add task** — creates a task with an auto-incremented ID, `completed: false` and a `createdAt` timestamp.
- **List tasks** — shows all tasks in a table with status and a summary (total / completed / pending).
- **Complete task** — marks a task as completed and stores `completedAt`.
- **Delete task** — removes a task by ID.
- **Input validation** — empty title, title longer than 100 characters, duplicate title, non-numeric or negative ID.
- **Friendly error handling** — invalid task ID, task not found, already completed task, unknown command, missing `.env` configuration and corrupted data file.
- **Help command** — lists all available commands.
- **Automatic data file creation** — if `tasks.json` or the `data` folder is missing, it is created automatically on the first add.

## 7. Folder Structure

```text
question-5-task-manager/
├── src/
│   ├── config/
│   │   └── config.js          # Loads and validates .env configuration
│   ├── data/
│   │   └── taskRepository.js  # Reads/writes tasks.json (async fs/promises)
│   ├── services/
│   │   └── taskService.js     # Business logic + validation + TaskError
│   └── app.js                 # Entry point: parses CLI command and prints results
├── data/
│   └── tasks.json             # Task storage (starts as an empty array [])
├── .env.example               # Sample environment configuration
├── .gitignore                 # Ignores node_modules/ and .env
├── package.json               # "type": "module", scripts and dotenv dependency
├── package-lock.json          # Exact dependency versions (created by npm install)
└── README.md                  # Project documentation (this file)
```

| File | Responsibility |
|------|----------------|
| `src/config/config.js` | **Application configuration module.** Loads `.env` with `dotenv`, checks that `APP_NAME` and `DATA_FILE` exist, converts `DATA_FILE` into an absolute path and exports a frozen `config` object. |
| `src/data/taskRepository.js` | **Data module.** The only file that touches the disk. Exports `readTasks()` and `saveTasks()` using `fs/promises`. |
| `src/services/taskService.js` | **Logic module.** Exports `addTask`, `listTasks`, `completeTask`, `deleteTask` and the custom `TaskError` class. Validates input and applies business rules. |
| `src/app.js` | **Main application module.** Reads the command from `process.argv`, calls the correct service function and prints success or error messages. |

## 8. Installation Steps

**Prerequisite:** Node.js 18 or newer (check with `node -v`).

```bash
# 1. Open a terminal inside the project folder
cd module-2-backend-assignment/question-5-task-manager

# 2. Install the only dependency (dotenv)
npm install
```

## 9. Environment Setup

Create a `.env` file by copying the example file:

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows Command Prompt
copy .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

`.env.example` / `.env` content:

```text
APP_NAME=Task Manager
DATA_FILE=./data/tasks.json
```

| Variable | Meaning | Used in |
|----------|---------|---------|
| `APP_NAME` | Name printed in the header of every command | `src/config/config.js` → `config.appName` |
| `DATA_FILE` | Path of the JSON file where tasks are stored (relative to the project folder) | `src/config/config.js` → `config.dataFile` |

`.env` is listed in `.gitignore`, so real configuration is never committed — only `.env.example` is shared.

## 10. How to Run

```bash
node src/app.js <command> [arguments]
```

or using the npm script (note the `--` before the arguments):

```bash
npm start -- <command> [arguments]
```

`npm run dev` starts the app in watch mode (`node --watch`), which restarts it automatically when a source file changes — useful while developing.

> Tip: Before taking screenshots, make sure `data/tasks.json` contains only `[]` so that task IDs start from 1.

## 11. Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `add "<title>"` | Add a new task | `node src/app.js add "Complete backend assignment"` |
| `list` | Show all tasks | `node src/app.js list` |
| `complete <id>` | Mark a task as completed | `node src/app.js complete 1` |
| `delete <id>` | Delete a task | `node src/app.js delete 1` |
| `help` | Show the help message | `node src/app.js help` |

## 12. Example Successful Execution

The following output was produced by running the commands one after another starting with an empty `data/tasks.json`. (Dates and times will show your own system time.)

```text
$ node src/app.js help
=== Task Manager ===

Task Manager - available commands:
  node src/app.js add "<task title>"   Add a new task
  node src/app.js list                 Show all tasks
  node src/app.js complete <id>        Mark a task as completed
  node src/app.js delete <id>          Delete a task
  node src/app.js help                 Show this help message

$ node src/app.js add "Complete backend assignment"
=== Task Manager ===
Task added successfully: "Complete backend assignment" (ID: 1)

$ node src/app.js add "Prepare for DBMS quiz"
=== Task Manager ===
Task added successfully: "Prepare for DBMS quiz" (ID: 2)

$ node src/app.js add "Submit Module 2 report"
=== Task Manager ===
Task added successfully: "Submit Module 2 report" (ID: 3)

$ node src/app.js list
=== Task Manager ===
ID   STATUS    TITLE                                     CREATED
------------------------------------------------------------------------------
1    [ ]       Complete backend assignment               10/6/2026, 9:43:45 AM
2    [ ]       Prepare for DBMS quiz                     10/6/2026, 9:43:45 AM
3    [ ]       Submit Module 2 report                    10/6/2026, 9:43:45 AM
------------------------------------------------------------------------------
Total: 3 | Completed: 0 | Pending: 3

$ node src/app.js complete 1
=== Task Manager ===
Task 1 marked as completed: "Complete backend assignment"

$ node src/app.js delete 2
=== Task Manager ===
Task deleted successfully: "Prepare for DBMS quiz" (ID: 2)

$ node src/app.js list
=== Task Manager ===
ID   STATUS    TITLE                                     CREATED
------------------------------------------------------------------------------
1    [done]    Complete backend assignment               10/6/2026, 9:43:45 AM
3    [ ]       Submit Module 2 report                    10/6/2026, 9:43:45 AM
------------------------------------------------------------------------------
Total: 2 | Completed: 1 | Pending: 1
```

Contents of `data/tasks.json` after these commands:

```json
[
  {
    "id": 1,
    "title": "Complete backend assignment",
    "completed": true,
    "createdAt": "2026-10-06T04:13:45.170Z",
    "completedAt": "2026-10-06T04:13:45.422Z"
  },
  {
    "id": 3,
    "title": "Submit Module 2 report",
    "completed": false,
    "createdAt": "2026-10-06T04:13:45.303Z"
  }
]
```

## 13. Example Error Handling

Continuing from the state above:

```text
$ node src/app.js complete 99
=== Task Manager ===
ERROR: Task with ID 99 was not found.

$ node src/app.js delete 99
=== Task Manager ===
ERROR: Task with ID 99 was not found.

$ node src/app.js complete abc
=== Task Manager ===
ERROR: Invalid task ID "abc". The ID must be a positive whole number.

$ node src/app.js add ""
=== Task Manager ===
ERROR: Task title cannot be empty. Usage: node src/app.js add "Your task title"

$ node src/app.js add "Complete backend assignment"
=== Task Manager ===
ERROR: A task with the title "Complete backend assignment" already exists.

$ node src/app.js complete 1
=== Task Manager ===
ERROR: Task with ID 1 is already completed.

$ node src/app.js remove 1
=== Task Manager ===
ERROR: Unknown command "remove".

Task Manager - available commands:
  node src/app.js add "<task title>"   Add a new task
  node src/app.js list                 Show all tasks
  node src/app.js complete <id>        Mark a task as completed
  node src/app.js delete <id>          Delete a task
  node src/app.js help                 Show this help message
```

**Missing configuration** (when `.env` has not been created):

```text
$ node src/app.js list
CONFIG ERROR: Missing environment variable(s): APP_NAME, DATA_FILE
Create a .env file by copying .env.example (see README.md), then run the command again.
```

**Corrupted data file** (if `tasks.json` contains invalid JSON, e.g. `{bad json`):

```text
$ node src/app.js list
=== Task Manager ===
ERROR: Something went wrong - The data file "tasks.json" is corrupted (invalid JSON). Fix it or replace its content with [].
```

In every error case the program prints a clear message and exits with exit code `1` instead of crashing with a stack trace.

## 14. Explanation of Asynchronous Operations

- `taskRepository.js` uses `readFile`, `writeFile` and `mkdir` from **`node:fs/promises`**. Each of these returns a **Promise**, so the file is read/written without blocking the main thread.
- Every service function (`addTask`, `completeTask`, …) is an **`async` function** and uses **`await`** to wait for the file operation to finish before continuing. For example:

  ```javascript
  const tasks = await readTasks();      // wait for file to be read
  await saveTasks([...tasks, newTask]); // wait for file to be written
  ```

- In `app.js`, each command handler is `async` and `main()` uses `await handler(args)` inside `try...catch`, so any rejected Promise is caught and turned into a friendly message.
- Using `async/await` keeps the code readable from top to bottom, like synchronous code, while still being non-blocking.

## 15. Explanation of ES Modules

- `package.json` contains `"type": "module"`, so Node.js treats all `.js` files as **ES Modules**.
- Modules share code with **`export`** and **`import`** (no `require()` is used anywhere):
  - `config.js` → `export default config`
  - `taskRepository.js` → `export const readTasks`, `export const saveTasks`
  - `taskService.js` → named exports `addTask`, `listTasks`, `completeTask`, `deleteTask`, `TaskError`
  - `app.js` → `import config from './config/config.js'` and `import { addTask, ... } from './services/taskService.js'`
- Built-in modules are imported with the `node:` prefix (e.g. `import { readFile } from 'node:fs/promises'`).
- Because ES Modules have no `__dirname`, `config.js` uses `import.meta.url` with `fileURLToPath()` to find the project folder. This lets the app find `.env` and `tasks.json` correctly even when it is started from another folder.
- Dependency flow is one-way and easy to follow: `app.js → taskService.js → taskRepository.js → config.js`.

## 16. Error Handling Approach

1. **Custom error class** — `TaskError` (in `taskService.js`) represents expected errors caused by user input (empty title, invalid ID, task not found, duplicate title, already completed).
2. **Validation before any file change** — `validateTitle()` and `parseId()` check input first, so invalid data is never written to `tasks.json`.
3. **Central `try...catch` in `app.js`** — all command handlers are awaited inside one `try...catch`.
   - `TaskError` → prints only the friendly message.
   - Any other error (e.g. permission denied, corrupted file) → prints `Something went wrong - ...` instead of an ugly stack trace.
4. **Safe file reading** — `readTasks()` returns an empty list when the file does not exist (`ENOENT`) and gives a clear message when the JSON is corrupted.
5. **Configuration check at startup** — `config.js` stops the program with a clear message if `.env` values are missing.
6. **Exit codes** — `process.exitCode = 1` is set on errors, so scripts and other tools can detect that the command failed, while the process still ends normally.

## 17. Conclusion

The Task Manager mini project fulfils all the requirements of Question 5. It is organised into ES Modules with separate configuration, data and logic layers; it uses modern JavaScript features such as arrow functions, template literals, destructuring and the spread operator; all file operations are asynchronous using `fs/promises` with `async/await`; configuration is loaded from `.env` through `process.env`; and both successful operations and error scenarios are handled with clear messages. The project is simple, but its structure can easily be extended — for example, by replacing the JSON file with a database or adding a REST API — without changing the business logic.

---

## Appendix — Complete Source Code

### `package.json`

```json
{
  "name": "task-manager",
  "version": "1.0.0",
  "description": "Module 2 - Question 5: CLI Task Manager built with Node.js ES Modules, async fs/promises and dotenv",
  "type": "module",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "node --watch src/app.js"
  },
  "keywords": ["nodejs", "es-modules", "cli", "task-manager"],
  "author": "SAGAR KUMAR (SOE25BTAM29)",
  "license": "ISC",
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "dotenv": "^16.4.7"
  }
}
```

### `src/config/config.js`

```javascript
// Configuration module: loads settings from the .env file using dotenv.
// No configuration value is hardcoded anywhere else in the application.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Project root = two folders above this file (src/config -> project root).
// This lets the app work even if it is started from another folder.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

const REQUIRED_VARIABLES = ['APP_NAME', 'DATA_FILE'];

const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]?.trim());

// Stop early with a clear message instead of failing later with a confusing error.
if (missing.length > 0) {
  console.error(`CONFIG ERROR: Missing environment variable(s): ${missing.join(', ')}`);
  console.error('Create a .env file by copying .env.example (see README.md), then run the command again.');
  process.exit(1);
}

const { APP_NAME, DATA_FILE } = process.env;

const config = Object.freeze({
  appName: APP_NAME.trim(),
  // Relative paths in .env are resolved from the project root.
  dataFile: path.resolve(projectRoot, DATA_FILE.trim()),
});

export default config;
```

### `src/data/taskRepository.js`

```javascript
// Data module (repository): the ONLY place that reads/writes the JSON file.
// All file operations are asynchronous and use fs/promises.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import config from '../config/config.js';

const { dataFile } = config;

// Reads all tasks. If the file does not exist yet, start with an empty list.
export const readTasks = async () => {
  try {
    const content = await readFile(dataFile, 'utf8');
    if (!content.trim()) return [];

    const tasks = JSON.parse(content);
    if (!Array.isArray(tasks)) {
      throw new SyntaxError('Data file must contain a JSON array.');
    }
    return tasks;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    if (error instanceof SyntaxError) {
      throw new Error(`The data file "${path.basename(dataFile)}" is corrupted (invalid JSON). Fix it or replace its content with [].`);
    }
    throw error;
  }
};

// Saves all tasks. Creates the data folder automatically if it is missing.
export const saveTasks = async (tasks) => {
  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
};
```

### `src/services/taskService.js`

```javascript
// Service module (business logic): validation and task operations.
// It uses the repository for storage, so it never touches files directly.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

import { readTasks, saveTasks } from '../data/taskRepository.js';

const MAX_TITLE_LENGTH = 100;

// Custom error for problems caused by user input (expected errors).
export class TaskError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TaskError';
  }
}

// ---------- Validation helpers ----------
const validateTitle = (title) => {
  const cleanTitle = String(title ?? '').trim();
  if (!cleanTitle) {
    throw new TaskError('Task title cannot be empty. Usage: node src/app.js add "Your task title"');
  }
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    throw new TaskError(`Task title is too long (${cleanTitle.length} characters). Maximum allowed is ${MAX_TITLE_LENGTH}.`);
  }
  return cleanTitle;
};

const parseId = (value) => {
  const id = Number(value);
  if (value === undefined || !Number.isInteger(id) || id <= 0) {
    throw new TaskError(`Invalid task ID "${value ?? ''}". The ID must be a positive whole number.`);
  }
  return id;
};

const findTaskIndex = (tasks, id) => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new TaskError(`Task with ID ${id} was not found.`);
  }
  return index;
};

// ---------- Task operations (all async) ----------
export const addTask = async (title) => {
  const cleanTitle = validateTitle(title);
  const tasks = await readTasks();

  const duplicate = tasks.some((task) => task.title.toLowerCase() === cleanTitle.toLowerCase());
  if (duplicate) {
    throw new TaskError(`A task with the title "${cleanTitle}" already exists.`);
  }

  const nextId = tasks.length > 0 ? Math.max(...tasks.map(({ id }) => id)) + 1 : 1;
  const newTask = {
    id: nextId,
    title: cleanTitle,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await saveTasks([...tasks, newTask]);
  return newTask;
};

export const listTasks = async () => readTasks();

export const completeTask = async (idValue) => {
  const id = parseId(idValue);
  const tasks = await readTasks();
  const index = findTaskIndex(tasks, id);

  if (tasks[index].completed) {
    throw new TaskError(`Task with ID ${id} is already completed.`);
  }

  tasks[index] = { ...tasks[index], completed: true, completedAt: new Date().toISOString() };
  await saveTasks(tasks);
  return tasks[index];
};

export const deleteTask = async (idValue) => {
  const id = parseId(idValue);
  const tasks = await readTasks();
  const index = findTaskIndex(tasks, id);

  const [deletedTask] = tasks.splice(index, 1);
  await saveTasks(tasks);
  return deletedTask;
};
```

### `src/app.js`

```javascript
// Main application module: reads the command from the terminal,
// calls the service layer and prints friendly messages.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A
//
// Usage:
//   node src/app.js add "Complete backend assignment"
//   node src/app.js list
//   node src/app.js complete 1
//   node src/app.js delete 1
//   node src/app.js help

import config from './config/config.js';
import { addTask, listTasks, completeTask, deleteTask, TaskError } from './services/taskService.js';

const { appName } = config;

const showHelp = () => {
  console.log(`
${appName} - available commands:
  node src/app.js add "<task title>"   Add a new task
  node src/app.js list                 Show all tasks
  node src/app.js complete <id>        Mark a task as completed
  node src/app.js delete <id>          Delete a task
  node src/app.js help                 Show this help message
`);
};

const printTasks = (tasks) => {
  if (tasks.length === 0) {
    console.log('No tasks found. Add one with: node src/app.js add "Your task"');
    return;
  }

  console.log('ID   STATUS    TITLE                                     CREATED');
  console.log('-'.repeat(78));
  tasks.forEach(({ id, title, completed, createdAt }) => {
    const status = completed ? '[done]' : '[ ]';
    const created = new Date(createdAt).toLocaleString();
    console.log(`${String(id).padEnd(4)} ${status.padEnd(9)} ${title.padEnd(41)} ${created}`);
  });

  const doneCount = tasks.filter(({ completed }) => completed).length;
  console.log('-'.repeat(78));
  console.log(`Total: ${tasks.length} | Completed: ${doneCount} | Pending: ${tasks.length - doneCount}`);
};

// Command handlers stored in an object instead of a long if/else chain.
const commands = {
  add: async (args) => {
    const task = await addTask(args.join(' '));
    console.log(`Task added successfully: "${task.title}" (ID: ${task.id})`);
  },
  list: async () => {
    printTasks(await listTasks());
  },
  complete: async ([id]) => {
    const task = await completeTask(id);
    console.log(`Task ${task.id} marked as completed: "${task.title}"`);
  },
  delete: async ([id]) => {
    const task = await deleteTask(id);
    console.log(`Task deleted successfully: "${task.title}" (ID: ${task.id})`);
  },
  help: async () => showHelp(),
};

const main = async () => {
  const [command = 'help', ...args] = process.argv.slice(2);

  console.log(`=== ${appName} ===`);

  const handler = commands[command.toLowerCase()];
  if (!handler) {
    console.error(`ERROR: Unknown command "${command}".`);
    showHelp();
    process.exitCode = 1;
    return;
  }

  try {
    await handler(args);
  } catch (error) {
    if (error instanceof TaskError) {
      // Expected error caused by user input -> friendly message only.
      console.error(`ERROR: ${error.message}`);
    } else {
      // Unexpected error (file permission, corrupted file, etc.).
      console.error(`ERROR: Something went wrong - ${error.message}`);
    }
    process.exitCode = 1;
  }
};

main();
```

### `.gitignore`

```text
node_modules/
.env
!.env.example
```

### `data/tasks.json` (initial content)

```json
[]
```

---

## Screenshot Checklist (Question 5)

Run these commands inside `question-5-task-manager` (with `data/tasks.json` set to `[]` first) and take one screenshot of each terminal screen:

| # | What to capture | Command(s) |
|---|-----------------|------------|
| 1 | Project installed successfully | `npm install` |
| 2 | Help / available commands | `node src/app.js help` |
| 3 | Adding tasks (success) | `node src/app.js add "Complete backend assignment"` then `node src/app.js add "Prepare for DBMS quiz"` then `node src/app.js add "Submit Module 2 report"` |
| 4 | Listing tasks | `node src/app.js list` |
| 5 | Completing and deleting a task | `node src/app.js complete 1` then `node src/app.js delete 2` then `node src/app.js list` |
| 6 | Error: task not found | `node src/app.js complete 99` and `node src/app.js delete 99` |
| 7 | Error: invalid input | `node src/app.js complete abc` and `node src/app.js add ""` |
| 8 | Error: missing `.env` configuration (optional) | Temporarily rename `.env` to `.env.backup`, run `node src/app.js list`, then rename it back |
| 9 | Folder structure in VS Code / file explorer | Expand all folders in the sidebar |
| 10 | `.env` usage | Open `.env.example` and `src/config/config.js` side by side |

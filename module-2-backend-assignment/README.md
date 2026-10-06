# Module 2 — Modern JavaScript for Backend Development

**Backend Development Assignment**

| Name | PRN | Section |
|------|-----|---------|
| SAGAR KUMAR | SOE25BTAM29 | A |

This folder contains the complete solution for all five questions of the Module 2 assignment. Every question is a separate, runnable Node.js project that uses ES Modules (`"type": "module"`). The full written report is in [`SAGAR_KUMAR_Backend_Assignment_Module_2.md`](./SAGAR_KUMAR_Backend_Assignment_Module_2.md).

## Project Folder Structure

```text
module-2-backend-assignment/
│
├── README.md                                    # This file (overview + run guide + checklists)
├── SAGAR_KUMAR_Backend_Assignment_Module_2.md   # Final assignment report
│
├── question-1/                  # Modern JavaScript (ES6+) refactoring
│   ├── legacy.js                # Old-style code (before)
│   ├── app.js                   # Refactored modern code (after)
│   ├── package.json
│   └── README.md
│
├── question-2/                  # Modular backend application (ES Modules)
│   ├── src/
│   │   ├── data/
│   │   │   └── students.js
│   │   ├── utils/
│   │   │   └── studentUtils.js
│   │   └── app.js
│   ├── package.json
│   └── README.md
│
├── question-3/                  # Event Loop demonstration
│   ├── app.js
│   ├── sample.txt
│   ├── package.json
│   └── README.md
│
├── question-4/                  # Reliable async application (try/catch/finally)
│   ├── app.js
│   ├── data/
│   │   ├── valid-marks.json
│   │   └── invalid-marks.json
│   ├── package.json
│   └── README.md
│
└── question-5-task-manager/     # Mini project: CLI Task Manager
    ├── src/
    │   ├── config/
    │   │   └── config.js
    │   ├── data/
    │   │   └── taskRepository.js
    │   ├── services/
    │   │   └── taskService.js
    │   └── app.js
    ├── data/
    │   └── tasks.json
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    └── README.md
```

## Requirements

- **Node.js 18 or newer** (Node.js 20 / 22 LTS recommended). Check with `node -v`.
- npm (comes with Node.js).
- Works on Windows, macOS and Linux. Questions 1–4 use only built-in Node.js modules; Question 5 uses one package, `dotenv`.

## How to Install and Run Everything

Open a terminal in the `module-2-backend-assignment` folder.

```bash
# ---------- Question 1 ----------
cd question-1
node legacy.js          # legacy version (for comparison)
node app.js             # refactored modern version
cd ..

# ---------- Question 2 ----------
cd question-2
node src/app.js         # or: npm start
cd ..

# ---------- Question 3 ----------
cd question-3
node app.js
cd ..

# ---------- Question 4 ----------
cd question-4
node app.js valid       # success case
node app.js invalid     # failure case (invalid data)
node app.js missing     # failure case (file not found)
node app.js             # all three cases together
cd ..

# ---------- Question 5 ----------
cd question-5-task-manager
npm install
cp .env.example .env    # Windows CMD: copy .env.example .env | PowerShell: Copy-Item .env.example .env
node src/app.js help
```

## Successful Test Commands

| Question | Command (run inside the question folder) | Expected result |
|----------|------------------------------------------|-----------------|
| Q1 | `node app.js` | Modern billing report, then `Protected by const` and `Protected by Object.freeze()` messages |
| Q2 | `node src/app.js` | Student report, topper, CSE list, pass/fail count, search result |
| Q3 | `node app.js` | Steps 1–8 in the order SYNC → MICROTASK → TIMER → FILE I/O → TIMER |
| Q4 | `node app.js valid` | `SUCCESS: Processed 4 student records.` + `CLEANUP` line |
| Q5 | `node src/app.js add "Complete backend assignment"` | `Task added successfully: "Complete backend assignment" (ID: 1)` |
| Q5 | `node src/app.js add "Prepare for DBMS quiz"` | `Task added successfully: "Prepare for DBMS quiz" (ID: 2)` |
| Q5 | `node src/app.js add "Submit Module 2 report"` | `Task added successfully: "Submit Module 2 report" (ID: 3)` |
| Q5 | `node src/app.js list` | Table of 3 tasks |
| Q5 | `node src/app.js complete 1` | `Task 1 marked as completed: "Complete backend assignment"` |
| Q5 | `node src/app.js delete 2` | `Task deleted successfully: "Prepare for DBMS quiz" (ID: 2)` |
| Q5 | `node src/app.js list` | Task 1 shown as `[done]`, task 3 pending |

## Error Test Commands

| Question | Command | Expected result |
|----------|---------|-----------------|
| Q2 | `node src/app.js` (built-in search for ID 10) | `5) Search ID 10: No student found with this ID.` |
| Q4 | `node app.js invalid` | `ERROR: Invalid marks "ninety" for Meera Iyer. Marks must be a number between 0 and 100.` + `CLEANUP` line |
| Q4 | `node app.js missing` | `ERROR: The data file was not found. Please check the file name and try again.` + `CLEANUP` line |
| Q5 | `node src/app.js complete 99` | `ERROR: Task with ID 99 was not found.` |
| Q5 | `node src/app.js delete 99` | `ERROR: Task with ID 99 was not found.` |
| Q5 | `node src/app.js complete abc` | `ERROR: Invalid task ID "abc". The ID must be a positive whole number.` |
| Q5 | `node src/app.js add ""` | `ERROR: Task title cannot be empty. Usage: node src/app.js add "Your task title"` |
| Q5 | `node src/app.js add "Complete backend assignment"` (again) | `ERROR: A task with the title "Complete backend assignment" already exists.` |
| Q5 | `node src/app.js complete 1` (again) | `ERROR: Task with ID 1 is already completed.` |
| Q5 | `node src/app.js remove 1` | `ERROR: Unknown command "remove".` + help text |
| Q5 | Rename `.env` to `.env.backup`, then `node src/app.js list` | `CONFIG ERROR: Missing environment variable(s): APP_NAME, DATA_FILE` (rename it back afterwards) |

> Before testing Question 5, make sure `question-5-task-manager/data/tasks.json` contains only `[]` so that IDs start from 1 and match the expected output.

## Screenshot Checklist

Screenshots are **not** included in this folder — they must be taken on your own computer after running the commands. Take one clear screenshot of each of the following terminal screens (make sure the command itself is visible in the screenshot):

| # | Screenshot | Command(s) | Folder |
|---|------------|-----------|--------|
| 1 | `node -v` showing the Node.js version | `node -v` | any |
| 2 | Q1 legacy output | `node legacy.js` | `question-1` |
| 3 | Q1 modern output | `node app.js` | `question-1` |
| 4 | Q2 modular app output | `node src/app.js` | `question-2` |
| 5 | Q2 folder structure (VS Code sidebar expanded) | — | `question-2` |
| 6 | Q3 event loop execution order | `node app.js` | `question-3` |
| 7 | Q4 success case | `node app.js valid` | `question-4` |
| 8 | Q4 failure case – invalid data | `node app.js invalid` | `question-4` |
| 9 | Q4 failure case – missing file | `node app.js missing` | `question-4` |
| 10 | Q5 `npm install` completed | `npm install` | `question-5-task-manager` |
| 11 | Q5 help | `node src/app.js help` | `question-5-task-manager` |
| 12 | Q5 add three tasks (success) | three `add` commands | `question-5-task-manager` |
| 13 | Q5 list tasks | `node src/app.js list` | `question-5-task-manager` |
| 14 | Q5 complete + delete + list | `complete 1`, `delete 2`, `list` | `question-5-task-manager` |
| 15 | Q5 error – task not found | `node src/app.js complete 99` and `node src/app.js delete 99` | `question-5-task-manager` |
| 16 | Q5 error – invalid input | `node src/app.js complete abc` and `node src/app.js add ""` | `question-5-task-manager` |
| 17 | Q5 error – missing `.env` (optional) | rename `.env`, run `node src/app.js list`, rename back | `question-5-task-manager` |
| 18 | Q5 folder structure + `.env.example` open in editor | — | `question-5-task-manager` |

## Final Submission Checklist

- [ ] All five question folders are present and each program runs without errors.
- [ ] `question-5-task-manager/node_modules/` and `.env` are **not** included in the submitted ZIP/repository (`.env.example` **is** included).
- [ ] `question-5-task-manager/data/tasks.json` is reset to `[]` (or contains the demo tasks shown in your screenshots).
- [ ] Every README file is present (one per question + this overview).
- [ ] `SAGAR_KUMAR_Backend_Assignment_Module_2.md` is included (export to PDF if a PDF is required).
- [ ] All 18 screenshots from the checklist are taken and inserted into the report or attached in a `screenshots/` folder.
- [ ] Name, PRN and Section are correct on the cover page: **SAGAR KUMAR, SOE25BTAM29, Section A**.

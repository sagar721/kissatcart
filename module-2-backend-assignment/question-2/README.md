# QUESTION 2 — Modular Backend Application

**Title:** Student Result Management Application using ES Modules

**Student:** SAGAR KUMAR | **PRN:** SOE25BTAM29 | **Section:** A

---

## Aim / Objective

To redesign a single-file Node.js student application into a modular application using ES Modules (`import` / `export`), with a separate data module, a reusable utility/logic module and a main application module, and to show that the imported functionality works correctly.

## Approach

**Problem (before):** the original program kept the student array, the calculation functions (average, grade, topper, search) and the printing logic in one file. Any change — even adding one student — meant editing the same large file, and the functions could not be reused in another program.

**Solution (after):** the code is split by responsibility:

1. **Data module** (`src/data/students.js`) — only stores the student records and the `PASS_MARKS` constant.
2. **Utility / logic module** (`src/utils/studentUtils.js`) — reusable, pure functions that work on any list of students.
3. **Main application module** (`src/app.js`) — imports the data and the functions and runs the program.
4. **`package.json`** contains `"type": "module"`, so Node.js treats every `.js` file as an ES Module and allows `import`/`export`.

### Folder structure

```text
question-2/
├── src/
│   ├── data/
│   │   └── students.js        # Data module (named exports)
│   ├── utils/
│   │   └── studentUtils.js    # Logic module (named exports + default export)
│   └── app.js                 # Main application module (entry point)
├── package.json               # "type": "module" enables ES Modules
└── README.md
```

### Explanation of every important file

| File | Role |
|------|------|
| `package.json` | Project metadata. `"type": "module"` enables ES Module syntax. `npm start` runs `node src/app.js`. |
| `src/data/students.js` | Exports `students` (array of records) and `PASS_MARKS` using **named exports**. Contains no logic, so data can later be replaced by a database without touching other files. |
| `src/utils/studentUtils.js` | Imports `PASS_MARKS` from the data module and exports reusable functions: `getAverage`, `getGrade`, `hasPassed`, `findStudentById`, `filterByBranch`, `getTopper`, `formatStudent` (**named exports**) and `buildReport` (**default export**). |
| `src/app.js` | Entry point. Imports the data and the functions, then prints a full report, the topper, CSE students, pass/fail count and a search by ID (found and not found). |

## Code

### `package.json`

```json
{
  "name": "question-2-student-modules",
  "version": "1.0.0",
  "description": "Module 2 - Question 2: Modular student management application using ES Modules",
  "type": "module",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js"
  },
  "author": "SAGAR KUMAR (SOE25BTAM29)",
  "license": "ISC"
}
```

### `src/data/students.js` — data module

```javascript
// Data module: holds only the student records and related constants.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

// Named export - other modules import exactly what they need.
export const PASS_MARKS = 40;

export const students = [
  { id: 1, name: 'Aarav Sharma', branch: 'CSE', marks: { maths: 88, physics: 76, programming: 95 } },
  { id: 2, name: 'Diya Patel', branch: 'CSE', marks: { maths: 92, physics: 89, programming: 90 } },
  { id: 3, name: 'Kabir Singh', branch: 'ECE', marks: { maths: 35, physics: 42, programming: 38 } },
  { id: 4, name: 'Ananya Gupta', branch: 'ME', marks: { maths: 67, physics: 71, programming: 60 } },
  { id: 5, name: 'Rohan Verma', branch: 'CSE', marks: { maths: 55, physics: 48, programming: 72 } },
];
```

### `src/utils/studentUtils.js` — utility / logic module

```javascript
// Utility / logic module: reusable functions that work on student data.
// These functions do not depend on where the data comes from, so they can
// be reused with any list of students (file, database, API, etc.).
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

import { PASS_MARKS } from '../data/students.js';

// Average of all subject marks for one student.
export const getAverage = ({ marks }) => {
  const scores = Object.values(marks);
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Number((total / scores.length).toFixed(2));
};

// Converts an average into a grade.
export const getGrade = (average) => {
  if (average >= 90) return 'A+';
  if (average >= 75) return 'A';
  if (average >= 60) return 'B';
  if (average >= PASS_MARKS) return 'C';
  return 'F';
};

// A student passes only if every subject is at or above PASS_MARKS.
export const hasPassed = ({ marks }) =>
  Object.values(marks).every((score) => score >= PASS_MARKS);

export const findStudentById = (students, id) =>
  students.find((student) => student.id === id) ?? null;

export const filterByBranch = (students, branch) =>
  students.filter((student) => student.branch === branch);

export const getTopper = (students) =>
  students.reduce((best, current) =>
    getAverage(current) > getAverage(best) ? current : best);

export const formatStudent = (student) => {
  const average = getAverage(student);
  const status = hasPassed(student) ? 'PASS' : 'FAIL';
  return `${String(student.id).padEnd(3)} ${student.name.padEnd(14)} ${student.branch.padEnd(5)} ` +
    `Avg: ${average.toFixed(2).padStart(6)}  Grade: ${getGrade(average).padEnd(3)} ${status}`;
};

// Default export - the main helper of this module.
const buildReport = (students) => students.map(formatStudent).join('\n');

export default buildReport;
```

### `src/app.js` — main application module

```javascript
// Main application module: imports data and logic, then runs the program.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

import { students, PASS_MARKS } from './data/students.js';
import buildReport, {
  getAverage,
  getGrade,
  hasPassed,
  findStudentById,
  filterByBranch,
  getTopper,
} from './utils/studentUtils.js';

const line = '-'.repeat(60);

console.log('STUDENT RESULT MANAGEMENT (ES Modules Demo)');
console.log(line);

// 1. Full report using the default export
console.log('1) Complete result report:');
console.log(buildReport(students));
console.log(line);

// 2. Topper using a named export
const topper = getTopper(students);
console.log(`2) Class topper: ${topper.name} (${topper.branch}) with average ${getAverage(topper)}`);

// 3. Filter by branch
const cseStudents = filterByBranch(students, 'CSE');
console.log(`3) CSE students (${cseStudents.length}): ${cseStudents.map(({ name }) => name).join(', ')}`);

// 4. Pass / fail summary
const passed = students.filter(hasPassed);
const failed = students.filter((student) => !hasPassed(student));
console.log(`4) Passed: ${passed.length} | Failed: ${failed.length} (pass marks = ${PASS_MARKS} in every subject)`);

// 5. Search by ID (found and not found)
const searchIds = [4, 10];
searchIds.forEach((id) => {
  const student = findStudentById(students, id);
  if (student) {
    const average = getAverage(student);
    console.log(`5) Search ID ${id}: ${student.name}, average ${average}, grade ${getGrade(average)}`);
  } else {
    console.log(`5) Search ID ${id}: No student found with this ID.`);
  }
});

console.log(line);
console.log('All imported functions executed successfully.');
```

## Expected Output

Run from inside the `question-2` folder:

```text
$ node src/app.js
STUDENT RESULT MANAGEMENT (ES Modules Demo)
------------------------------------------------------------
1) Complete result report:
1   Aarav Sharma   CSE   Avg:  86.33  Grade: A   PASS
2   Diya Patel     CSE   Avg:  90.33  Grade: A+  PASS
3   Kabir Singh    ECE   Avg:  38.33  Grade: F   FAIL
4   Ananya Gupta   ME    Avg:  66.00  Grade: B   PASS
5   Rohan Verma    CSE   Avg:  58.33  Grade: C   PASS
------------------------------------------------------------
2) Class topper: Diya Patel (CSE) with average 90.33
3) CSE students (3): Aarav Sharma, Diya Patel, Rohan Verma
4) Passed: 4 | Failed: 1 (pass marks = 40 in every subject)
5) Search ID 4: Ananya Gupta, average 66, grade B
5) Search ID 10: No student found with this ID.
------------------------------------------------------------
All imported functions executed successfully.
```

(`npm start` gives exactly the same output.)

Every line of the output comes from a function that was imported from another module, which demonstrates that `export` and `import` are working correctly.

## Explanation

### Types of exports used

- **Named export** — `export const students = [...]` is imported with the same name inside braces: `import { students, PASS_MARKS } from './data/students.js'`.
- **Default export** — `export default buildReport` is imported without braces and can be given any name: `import buildReport, { getAverage } from './utils/studentUtils.js'`.
- In ES Modules the **file extension `.js` must be written** in relative imports.

### Why modular JavaScript is better than one large file

1. **Separation of concerns** — each file has one job (data, logic or application flow), so the code is easier to understand.
2. **Reusability** — the functions in `studentUtils.js` can be imported by any other program (for example an API server) without copying code.
3. **Maintainability** — adding a student only changes `students.js`; changing the grading rule only changes `getGrade()`. A change in one place does not risk breaking unrelated code.
4. **Easier testing and debugging** — small pure functions can be tested individually, and errors are easier to locate.
5. **Encapsulation** — only exported values are visible to other files; everything else stays private to its module, avoiding global variable conflicts.
6. **Team work** — different developers can work on different modules at the same time with fewer merge conflicts.

## Conclusion

The student application was successfully redesigned into a data module, a reusable logic module and a main application module using ES Modules. The program output confirms that both named and default imports work correctly. This modular structure makes the application cleaner, easier to extend, and allows the same logic to be reused in future backend projects.

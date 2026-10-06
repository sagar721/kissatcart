# QUESTION 4 — Reliable Asynchronous Application

**Title:** Asynchronous Student Marks Processor with Error Handling

**Student:** SAGAR KUMAR | **PRN:** SOE25BTAM29 | **Section:** A

---

## Aim / Objective

To build a small asynchronous Node.js program that retrieves data from a JSON file and processes it using Promises and `async/await`, and handles both successful and failed operations using `try...catch...finally`, meaningful success messages and user-friendly error messages.

## Approach

1. **Retrieve data:** `loadRecords()` reads a JSON file using `fs/promises` (`readFile` returns a Promise) and parses it.
2. **Process data:** `processRecords()` returns a `new Promise(...)` that, after a short delay, either
   - **resolves** with a summary (count, average, topper, passed), or
   - **rejects** with a custom `ValidationError` if any marks are invalid.
3. **Control flow:** `runCase()` is an `async` function that uses `await` inside `try...catch...finally`:
   - `try` → runs the steps and prints a **SUCCESS** message.
   - `catch` → converts any error into a **friendly ERROR message** using `getFriendlyMessage()`.
   - `finally` → always stops the progress-indicator timer (cleanup) and prints the time taken.
4. Three test cases are provided:
   - `valid` → correct data → **success**
   - `invalid` → wrong marks (`"ninety"`) → **validation failure**
   - `missing` → file does not exist → **file failure**

### Files

| File | Purpose |
|------|---------|
| `app.js` | The asynchronous processing program |
| `data/valid-marks.json` | Correct input data (success case) |
| `data/invalid-marks.json` | Input with invalid marks (failure case) |
| `package.json` | Enables ES Modules and adds test scripts |

## Code

### `app.js`

```javascript
// QUESTION 4 - RELIABLE ASYNCHRONOUS APPLICATION
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A
//
// The program reads a JSON file of student marks asynchronously,
// validates it, and calculates a small result summary.
//
// Usage:
//   node app.js valid     -> success case (data/valid-marks.json)
//   node app.js invalid   -> failure case: bad data inside the file
//   node app.js missing   -> failure case: file does not exist
//   node app.js           -> runs all three cases one after another

import { readFile } from 'node:fs/promises';

// Custom error class so we can tell "expected" validation errors
// apart from unexpected programming errors.
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const DATA_FILES = {
  valid: 'valid-marks.json',
  invalid: 'invalid-marks.json',
  missing: 'does-not-exist.json',
};

// Promise-based helper: simulates a slow operation (like a network/database call).
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Step 1: Retrieve data asynchronously (fs/promises returns a Promise).
const loadRecords = async (fileName) => {
  const fileUrl = new URL(`./data/${fileName}`, import.meta.url);
  const text = await readFile(fileUrl, 'utf8');
  return JSON.parse(text);
};

// Step 2: Process data - returns a Promise that resolves or rejects.
const processRecords = (records) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Array.isArray(records) || records.length === 0) {
        reject(new ValidationError('The file must contain a non-empty list of students.'));
        return;
      }

      const badRecord = records.find(
        ({ marks }) => typeof marks !== 'number' || marks < 0 || marks > 100,
      );
      if (badRecord) {
        reject(new ValidationError(
          `Invalid marks "${badRecord.marks}" for ${badRecord.name}. Marks must be a number between 0 and 100.`,
        ));
        return;
      }

      const total = records.reduce((sum, { marks }) => sum + marks, 0);
      const topper = records.reduce((best, cur) => (cur.marks > best.marks ? cur : best));
      resolve({
        count: records.length,
        average: (total / records.length).toFixed(2),
        topper: topper.name,
        passed: records.filter(({ marks }) => marks >= 40).length,
      });
    }, 300);
  });

// Converts any technical error into a message that a normal user can understand.
const getFriendlyMessage = (error) => {
  if (error instanceof ValidationError) return error.message;
  if (error.code === 'ENOENT') return 'The data file was not found. Please check the file name and try again.';
  if (error instanceof SyntaxError) return 'The data file is not valid JSON.';
  return 'Something unexpected went wrong. Please try again later.';
};

// Main async workflow with try...catch...finally
const runCase = async (caseName) => {
  const fileName = DATA_FILES[caseName];
  console.log(`\n=== Case: ${caseName.toUpperCase()} (${fileName}) ===`);

  // A simple progress indicator that must always be stopped (cleanup).
  const progress = setInterval(() => process.stdout.write('.'), 100);
  const startTime = Date.now();
  process.stdout.write('Processing');

  try {
    const records = await loadRecords(fileName);
    await delay(200);
    const { count, average, topper, passed } = await processRecords(records);

    process.stdout.write('\n');
    console.log(`SUCCESS: Processed ${count} student records.`);
    console.log(`         Class average: ${average} | Topper: ${topper} | Passed: ${passed}/${count}`);
    return true;
  } catch (error) {
    process.stdout.write('\n');
    console.log(`ERROR: ${getFriendlyMessage(error)}`);
    // Technical code is kept short for developers; the user sees the friendly text above.
    console.log(`       (error type: ${error.code ?? error.name})`);
    return false;
  } finally {
    // finally runs in BOTH success and failure, so the timer never leaks.
    clearInterval(progress);
    console.log(`CLEANUP: Progress timer stopped. Time taken: ${Date.now() - startTime} ms`);
  }
};

const main = async () => {
  const [requested] = process.argv.slice(2);

  if (requested && !DATA_FILES[requested]) {
    console.log(`ERROR: Unknown case "${requested}". Use one of: ${Object.keys(DATA_FILES).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const cases = requested ? [requested] : Object.keys(DATA_FILES);
  for (const caseName of cases) {
    await runCase(caseName);
  }
  console.log('\nApplication finished normally - no crash occurred.');
};

main();
```

### `data/valid-marks.json`

```json
[
  { "name": "Aarav Sharma", "marks": 86 },
  { "name": "Diya Patel", "marks": 91 },
  { "name": "Kabir Singh", "marks": 38 },
  { "name": "Ananya Gupta", "marks": 66 }
]
```

### `data/invalid-marks.json`

```json
[
  { "name": "Rohan Verma", "marks": 72 },
  { "name": "Meera Iyer", "marks": "ninety" },
  { "name": "Ishaan Rao", "marks": 105 }
]
```

### `package.json`

```json
{
  "name": "question-4-reliable-async",
  "version": "1.0.0",
  "description": "Module 2 - Question 4: Reliable asynchronous data processing with error handling",
  "type": "module",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "test:success": "node app.js valid",
    "test:invalid": "node app.js invalid",
    "test:missing": "node app.js missing"
  },
  "author": "SAGAR KUMAR (SOE25BTAM29)",
  "license": "ISC"
}
```

## Expected Output

Run the commands from inside the `question-4` folder. (The number of dots and the time in ms may differ slightly on your computer.)

### Test 1 — Successful case

```text
$ node app.js valid

=== Case: VALID (valid-marks.json) ===
Processing.....
SUCCESS: Processed 4 student records.
         Class average: 70.25 | Topper: Diya Patel | Passed: 3/4
CLEANUP: Progress timer stopped. Time taken: 504 ms

Application finished normally - no crash occurred.
```

### Test 2 — Failure case (invalid data)

```text
$ node app.js invalid

=== Case: INVALID (invalid-marks.json) ===
Processing.....
ERROR: Invalid marks "ninety" for Meera Iyer. Marks must be a number between 0 and 100.
       (error type: ValidationError)
CLEANUP: Progress timer stopped. Time taken: 504 ms

Application finished normally - no crash occurred.
```

### Test 3 — Failure case (missing file)

```text
$ node app.js missing

=== Case: MISSING (does-not-exist.json) ===
Processing
ERROR: The data file was not found. Please check the file name and try again.
       (error type: ENOENT)
CLEANUP: Progress timer stopped. Time taken: 1 ms

Application finished normally - no crash occurred.
```

### Run all cases together

```text
$ node app.js

=== Case: VALID (valid-marks.json) ===
Processing.....
SUCCESS: Processed 4 student records.
         Class average: 70.25 | Topper: Diya Patel | Passed: 3/4
CLEANUP: Progress timer stopped. Time taken: 505 ms

=== Case: INVALID (invalid-marks.json) ===
Processing....
ERROR: Invalid marks "ninety" for Meera Iyer. Marks must be a number between 0 and 100.
       (error type: ValidationError)
CLEANUP: Progress timer stopped. Time taken: 503 ms

=== Case: MISSING (does-not-exist.json) ===
Processing
ERROR: The data file was not found. Please check the file name and try again.
       (error type: ENOENT)
CLEANUP: Progress timer stopped. Time taken: 1 ms

Application finished normally - no crash occurred.
```

The same tests can also be run with `npm run test:success`, `npm run test:invalid` and `npm run test:missing`.

## Explanation

| Requirement | Implementation |
|-------------|----------------|
| Promise-based execution | `readFile` from `fs/promises`, `delay()` and `processRecords()` all return Promises (`new Promise((resolve, reject) => ...)`). |
| `async/await` | `loadRecords`, `runCase` and `main` are `async` functions; `await` waits for each Promise in a readable top-to-bottom style. |
| `try...catch` | Every awaited step in `runCase` is inside one `try` block; a rejected Promise automatically jumps to `catch`. |
| Appropriate error handling | A custom `ValidationError` class separates bad input from system errors such as `ENOENT` (file not found) and `SyntaxError` (bad JSON). |
| Meaningful success message | `SUCCESS: Processed 4 student records.` followed by average, topper and pass count. |
| User-friendly error message | `getFriendlyMessage()` turns technical errors into plain sentences, e.g. *“The data file was not found. Please check the file name and try again.”* |
| `finally` for cleanup | The progress `setInterval` is cleared in `finally`, so it is stopped in both success and failure. Without this, the timer would keep the process running forever. |

### How this approach prevents unexpected application failure

1. **No unhandled Promise rejections** — every `await` is inside `try...catch`, so a rejected Promise is caught instead of crashing Node.js with an `UnhandledPromiseRejection` error.
2. **Input is validated before use** — wrong data types or out-of-range marks are rejected early with a clear reason instead of producing a wrong average (`NaN`).
3. **Different errors are handled differently** — validation errors, missing files and invalid JSON each get a specific message, and any unknown error still gets a safe generic message.
4. **Resources are always released** — `finally` guarantees the timer is cleared, so the program exits normally in every case.
5. **One failure does not stop the rest** — when all three cases run together, the failure of case 2 does not prevent case 3 from running, and the program ends with *“Application finished normally - no crash occurred.”*

## Conclusion

The program demonstrates reliable asynchronous programming with Promises and `async/await`. Using `try...catch` for errors, a custom error class for validation, user-friendly messages and `finally` for cleanup, the application handles both success and failure gracefully and never crashes unexpectedly.

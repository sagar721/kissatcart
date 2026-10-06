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

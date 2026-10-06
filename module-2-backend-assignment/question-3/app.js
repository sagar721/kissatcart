// QUESTION 3 - EVENT LOOP & ASYNCHRONOUS EXECUTION
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A
//
// Every operation calls log() with its type. A step counter records the
// exact order in which Node.js actually ran each piece of code.

import { readFile } from 'node:fs';

let step = 0;
const executionOrder = [];

const log = (type, message) => {
  step += 1;
  executionOrder.push(`${step}. [${type}] ${message}`);
  console.log(`Step ${String(step).padStart(2)} | ${type.padEnd(10)} | ${message}`);
};

// Path is built from this file's location so it works from any folder.
const filePath = new URL('./sample.txt', import.meta.url);

console.log('EVENT LOOP DEMONSTRATION');
console.log('-'.repeat(70));

// ---------- Synchronous code (runs on the Call Stack immediately) ----------
log('SYNC', 'Program started');

// ---------- Async 1: Timer with 0 ms delay (Timers phase / Callback Queue) ----------
setTimeout(() => {
  log('TIMER', 'setTimeout with 0 ms delay finished');
}, 0);

// ---------- Async 2: File read (handled by libuv thread pool, Poll phase) ----------
readFile(filePath, 'utf8', (error, data) => {
  if (error) {
    log('FILE I/O', `Could not read file: ${error.message}`);
    return;
  }
  log('FILE I/O', `fs.readFile finished -> "${data.trim()}"`);
});

// ---------- Async 3: Timer with a longer delay ----------
setTimeout(() => {
  log('TIMER', 'setTimeout with 100 ms delay finished');
  printSummary();
}, 100);

// ---------- Async 4: Promise (Microtask Queue) ----------
Promise.resolve().then(() => {
  log('MICROTASK', 'Promise.then() callback executed');
});

// ---------- Async 5: queueMicrotask (Microtask Queue) ----------
queueMicrotask(() => {
  log('MICROTASK', 'queueMicrotask() callback executed');
});

// ---------- More synchronous code ----------
let sum = 0;
for (let i = 1; i <= 1_000_000; i += 1) {
  sum += i;
}
log('SYNC', `Heavy loop finished, sum of 1..1,000,000 = ${sum}`);
log('SYNC', 'Program finished (end of main script)');

function printSummary() {
  console.log('-'.repeat(70));
  console.log('FINAL EXECUTION ORDER:');
  executionOrder.forEach((entry) => console.log(`  ${entry}`));
}

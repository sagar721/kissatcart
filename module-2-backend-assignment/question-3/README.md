# QUESTION 3 — Event Loop & Asynchronous Execution

**Title:** Demonstrating the Execution Order of Synchronous and Asynchronous Code in Node.js

**Student:** SAGAR KUMAR | **PRN:** SOE25BTAM29 | **Section:** A

---

## Aim / Objective

To build a small Node.js program that mixes synchronous code with several asynchronous operations (timers, file reading, Promises and microtasks), record the actual order in which they run, and explain the role of the Call Stack, Node.js APIs, Event Loop and Callback Queue.

## Approach

1. A helper function `log(type, message)` increases a step counter and stores every message in an `executionOrder` array, so the real execution order is recorded.
2. The script contains:
   - **Synchronous operations:** start message, a loop that adds numbers from 1 to 1,000,000, and an end message.
   - **Asynchronous operations:**
     - `setTimeout(..., 0)` — timer with zero delay
     - `fs.readFile()` — reading `sample.txt` from disk
     - `setTimeout(..., 100)` — timer with a longer delay
     - `Promise.resolve().then()` — Promise microtask
     - `queueMicrotask()` — microtask
3. The asynchronous operations are written **before** the heavy loop in the source code, to show that writing order is not the same as execution order.
4. When the last timer finishes, the program prints the final recorded order.

### Files

| File | Purpose |
|------|---------|
| `app.js` | Event Loop demonstration program |
| `sample.txt` | Small text file read with `fs.readFile()` |
| `package.json` | Enables ES Modules (`"type": "module"`) and `npm start` |

## Code

### `app.js`

```javascript
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
```

### `sample.txt`

```text
Hello from sample.txt - this file was read asynchronously by fs.readFile().
```

## Expected Output

Run from inside the `question-3` folder:

```text
$ node app.js
EVENT LOOP DEMONSTRATION
----------------------------------------------------------------------
Step  1 | SYNC       | Program started
Step  2 | SYNC       | Heavy loop finished, sum of 1..1,000,000 = 500000500000
Step  3 | SYNC       | Program finished (end of main script)
Step  4 | MICROTASK  | Promise.then() callback executed
Step  5 | MICROTASK  | queueMicrotask() callback executed
Step  6 | TIMER      | setTimeout with 0 ms delay finished
Step  7 | FILE I/O   | fs.readFile finished -> "Hello from sample.txt - this file was read asynchronously by fs.readFile()."
Step  8 | TIMER      | setTimeout with 100 ms delay finished
----------------------------------------------------------------------
FINAL EXECUTION ORDER:
  1. [SYNC] Program started
  2. [SYNC] Heavy loop finished, sum of 1..1,000,000 = 500000500000
  3. [SYNC] Program finished (end of main script)
  4. [MICROTASK] Promise.then() callback executed
  5. [MICROTASK] queueMicrotask() callback executed
  6. [TIMER] setTimeout with 0 ms delay finished
  7. [FILE I/O] fs.readFile finished -> "Hello from sample.txt - this file was read asynchronously by fs.readFile()."
  8. [TIMER] setTimeout with 100 ms delay finished
```

> Note: Steps 1–6 always appear in this order. Step 7 (file read) depends on disk speed; on almost every computer it finishes after the 0 ms timer and before the 100 ms timer, as shown.

## Explanation

### Main components

| Component | Role in this program |
|-----------|---------------------|
| **Call Stack** | The place where JavaScript actually runs functions, one at a time (Node.js runs JavaScript on a single main thread). The whole main script, including the heavy loop, runs on the Call Stack first. Nothing else can run until the stack is empty. |
| **Node.js APIs (libuv)** | Features provided by Node.js outside the JavaScript engine, such as timers (`setTimeout`) and file system access (`fs.readFile`). When we call them, Node.js starts the work in the background (timer system or libuv thread pool) and JavaScript continues with the next line immediately. |
| **Callback Queue (Task / Macrotask Queue)** | When a background operation finishes (timer expires, file is read), its callback is placed in a queue to wait. In Node.js there are separate queues for each Event Loop phase — e.g. the **timers** queue and the **poll (I/O)** queue. |
| **Microtask Queue** | A higher-priority queue for `Promise.then()` and `queueMicrotask()` callbacks. It is emptied completely as soon as the Call Stack becomes empty, before the Event Loop moves to any callback queue. |
| **Event Loop** | A continuous loop that checks: “Is the Call Stack empty?” If yes, it first runs all microtasks, then takes the next ready callback from the callback queues (timers → I/O poll → check …) and pushes it onto the Call Stack. |

### Step-by-step execution sequence

1. **Step 1 – SYNC:** `log('SYNC', 'Program started')` runs directly on the Call Stack.
2. `setTimeout(..., 0)` is handed to the **Node.js timer API**. The callback is **not** run now.
3. `readFile()` is handed to **libuv**, which reads the file in a background thread.
4. `setTimeout(..., 100)` is registered with the timer API.
5. `Promise.resolve().then(...)` and `queueMicrotask(...)` put their callbacks into the **Microtask Queue**.
6. **Step 2 – SYNC:** the heavy loop runs completely on the Call Stack (it blocks everything else while it runs).
7. **Step 3 – SYNC:** “Program finished” is printed. The main script ends and the **Call Stack becomes empty**.
8. **Steps 4–5 – MICROTASKS:** the Event Loop first empties the Microtask Queue, in the order the callbacks were added: `Promise.then()` and then `queueMicrotask()`.
9. **Step 6 – TIMER (0 ms):** the Event Loop enters the **timers phase**. The 0 ms timer has already expired (the loop took longer than that), so its callback moves from the callback queue to the Call Stack.
10. **Step 7 – FILE I/O:** in the **poll phase**, the completed file read is found and its callback runs, printing the file content.
11. **Step 8 – TIMER (100 ms):** after about 100 ms, the second timer callback runs in the next timers phase and prints the final summary. No work is left, so the process exits.

### Why can an asynchronous callback with a very small delay run after synchronous code?

- `setTimeout(fn, 0)` does **not** mean “run immediately”. It means “run `fn` **no earlier than** 0 ms from now”. (Node.js actually treats 0 as a minimum of 1 ms.)
- When the timer expires, the callback is only **placed in the Callback Queue**. It still has to wait for the Event Loop to move it to the Call Stack.
- The Event Loop only takes a callback from the queue **when the Call Stack is empty**. While synchronous code (like our 1,000,000-iteration loop) is running, the stack is busy, so the callback must wait — even though its delay finished long ago.
- In addition, all **microtasks** (Promises, `queueMicrotask`) are run before the next callback is taken from the timers queue.
- Therefore, the delay is only the **minimum** waiting time, not a guaranteed execution time. This is why Steps 1–5 appear before the 0 ms timer.

## Conclusion

The program clearly shows that Node.js runs all synchronous code first on the Call Stack, while asynchronous operations are handled by Node.js APIs in the background. When the stack is empty, the Event Loop runs microtasks first and then callbacks from the callback queues (timers, then I/O). Understanding this order helps backend developers avoid blocking the main thread and predict when callbacks will execute.

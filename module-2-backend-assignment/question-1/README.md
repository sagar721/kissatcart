# QUESTION 1 — Modern JavaScript

**Title:** Refactoring a Legacy Order-Billing Module using ES6+ Features

**Student:** SAGAR KUMAR | **PRN:** SOE25BTAM29 | **Section:** A

---

## Aim / Objective

To refactor a small part of a legacy Node.js application (an order-billing module) written in old JavaScript syntax into modern JavaScript (ES6+), and to explain how `let`/`const`, arrow functions, template literals and other modern features improve readability, maintainability and reliability.

## Approach

1. Take a small legacy module (`legacy.js`) that prints a billing report for customer orders. It uses `var`, `function` expressions, string concatenation with `+`, manual `for` loops and `||` for default values.
2. Rewrite the same logic in `app.js` using modern syntax, without changing the business result (the totals must stay the same).
3. Add one extra order with missing data to show that the modern version is also safer.
4. Run both versions and compare the output.

### Files

| File | Purpose |
|------|---------|
| `legacy.js` | The original legacy code (problem / before refactoring) |
| `app.js` | The refactored modern JavaScript version (solution) |
| `package.json` | Marks the folder as an ES Module project and adds `npm start` |

## Code

### Problem — legacy approach (`legacy.js`)

```javascript
// QUESTION 1 - LEGACY VERSION (before refactoring)
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A
//
// This is the old style code taken from a legacy order-billing module.
// Problems: `var` is function-scoped and can be re-declared by mistake,
// string concatenation with + is hard to read, every callback needs the
// long `function` keyword, and default values are handled manually with ||.

var TAX_RATE = 0.18;

var orders = [
  { id: 101, customer: "Aman", items: [{ name: "Keyboard", price: 750, qty: 2 }, { name: "Mouse", price: 400, qty: 1 }] },
  { id: 102, customer: "Priya", items: [{ name: "Monitor", price: 8500, qty: 1 }] },
  { id: 103, customer: "Rohit", items: [{ name: "USB Cable", price: 150, qty: 3 }], discount: 10 }
];

function calculateSubtotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price * items[i].qty;
  }
  return total;
}

function generateBill(order) {
  var discount = order.discount || 0;
  var subtotal = calculateSubtotal(order.items);
  var afterDiscount = subtotal - (subtotal * discount) / 100;
  var tax = afterDiscount * TAX_RATE;
  var finalAmount = afterDiscount + tax;

  return "Order #" + order.id + " | Customer: " + order.customer +
    " | Subtotal: Rs. " + subtotal.toFixed(2) +
    " | Discount: " + discount + "%" +
    " | Tax: Rs. " + tax.toFixed(2) +
    " | Total: Rs. " + finalAmount.toFixed(2);
}

console.log("=== Legacy Billing Report ===");
for (var j = 0; j < orders.length; j++) {
  console.log(generateBill(orders[j]));
}

var highValue = orders.filter(function (order) {
  return calculateSubtotal(order.items) > 1000;
});
var names = [];
for (var k = 0; k < highValue.length; k++) {
  names.push(highValue[k].customer);
}
console.log("High value customers: " + names.join(", "));
```

**Problems in the legacy code**

- `var` is function-scoped, can be re-declared silently, and values that should never change (like `TAX_RATE`) can be overwritten by mistake.
- Long string concatenation with `+` and `" | "` is hard to read and easy to break.
- Manual `for` loops with index variables (`i`, `j`, `k`) add noise and can cause off-by-one errors.
- `order.discount || 0` treats a valid value `0` the same as "missing", and if `order.items` is missing the program crashes.

### Solution — refactored modern code (`app.js`)

```javascript
// QUESTION 1 - MODERN JAVASCRIPT (ES6+) REFACTORED VERSION
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A
//
// This file is the refactored version of legacy.js (order-billing module).
// Features used:
//   1. let and const
//   2. Arrow functions
//   3. Template literals
//   4. Extra ES6+ features: destructuring, default parameters,
//      array methods (reduce/filter/map), optional chaining (?.),
//      nullish coalescing (??) and Object.freeze()

// const -> this value must never change, so reassigning it causes an error.
// Object.freeze() also stops properties from being changed accidentally.
const CONFIG = Object.freeze({
  TAX_RATE: 0.18,
  HIGH_VALUE_LIMIT: 1000,
  CURRENCY: 'Rs.',
});

const orders = [
  {
    id: 101,
    customer: 'Aman',
    items: [
      { name: 'Keyboard', price: 750, qty: 2 },
      { name: 'Mouse', price: 400, qty: 1 },
    ],
  },
  { id: 102, customer: 'Priya', items: [{ name: 'Monitor', price: 8500, qty: 1 }] },
  { id: 103, customer: 'Rohit', items: [{ name: 'USB Cable', price: 150, qty: 3 }], discount: 10 },
  { id: 104, customer: 'Neha' }, // order with missing items (handled safely)
];

// Arrow function + destructuring of each item + reduce() instead of a for loop.
// Default parameter (items = []) protects against undefined input.
const calculateSubtotal = (items = []) =>
  items.reduce((total, { price, qty }) => total + price * qty, 0);

// Small helper that formats money in one place (easy to change later).
const formatMoney = (amount) => `${CONFIG.CURRENCY} ${amount.toFixed(2)}`;

const generateBill = (order) => {
  // Object destructuring with a default value for discount.
  const { id, customer, discount = 0 } = order;

  // Optional chaining (?.) + nullish coalescing (??):
  // if order.items is missing we use an empty array instead of crashing.
  const items = order?.items ?? [];

  const subtotal = calculateSubtotal(items);
  const afterDiscount = subtotal - (subtotal * discount) / 100;
  const tax = afterDiscount * CONFIG.TAX_RATE;
  const finalAmount = afterDiscount + tax;

  // Template literal: the whole line is readable in one go.
  return `Order #${id} | Customer: ${customer} | Items: ${items.length} | ` +
    `Subtotal: ${formatMoney(subtotal)} | Discount: ${discount}% | ` +
    `Tax: ${formatMoney(tax)} | Total: ${formatMoney(finalAmount)}`;
};

console.log('=== Modern Billing Report ===');
orders.forEach((order) => console.log(generateBill(order)));

// filter() + map() chain replaces the manual loop and temporary array.
const highValueCustomers = orders
  .filter(({ items }) => calculateSubtotal(items) > CONFIG.HIGH_VALUE_LIMIT)
  .map(({ customer }) => customer);

console.log(`High value customers: ${highValueCustomers.join(', ')}`);

// let is used only where the value really changes (block-scoped counter).
let totalRevenue = 0;
for (const order of orders) {
  totalRevenue += calculateSubtotal(order.items);
}
console.log(`Total revenue before tax: ${formatMoney(totalRevenue)}`);

// Demonstrating the reliability benefit of const + Object.freeze().
try {
  CONFIG = {}; // reassigning a const variable
} catch (error) {
  console.log(`Protected by const: ${error.name} - ${error.message}`);
}

try {
  CONFIG.TAX_RATE = 0.5; // ES Modules run in strict mode, so this throws
} catch (error) {
  console.log(`Protected by Object.freeze(): ${error.name} - ${error.message}`);
}
console.log(`TAX_RATE is still ${CONFIG.TAX_RATE}`);
```

## Expected Output

Run the commands from inside the `question-1` folder (Node.js 18 or above).

**Legacy version (for comparison):**

```text
$ node legacy.js
=== Legacy Billing Report ===
Order #101 | Customer: Aman | Subtotal: Rs. 1900.00 | Discount: 0% | Tax: Rs. 342.00 | Total: Rs. 2242.00
Order #102 | Customer: Priya | Subtotal: Rs. 8500.00 | Discount: 0% | Tax: Rs. 1530.00 | Total: Rs. 10030.00
Order #103 | Customer: Rohit | Subtotal: Rs. 450.00 | Discount: 10% | Tax: Rs. 72.90 | Total: Rs. 477.90
High value customers: Aman, Priya
```

**Refactored modern version:**

```text
$ node app.js
=== Modern Billing Report ===
Order #101 | Customer: Aman | Items: 2 | Subtotal: Rs. 1900.00 | Discount: 0% | Tax: Rs. 342.00 | Total: Rs. 2242.00
Order #102 | Customer: Priya | Items: 1 | Subtotal: Rs. 8500.00 | Discount: 0% | Tax: Rs. 1530.00 | Total: Rs. 10030.00
Order #103 | Customer: Rohit | Items: 1 | Subtotal: Rs. 450.00 | Discount: 10% | Tax: Rs. 72.90 | Total: Rs. 477.90
Order #104 | Customer: Neha | Items: 0 | Subtotal: Rs. 0.00 | Discount: 0% | Tax: Rs. 0.00 | Total: Rs. 0.00
High value customers: Aman, Priya
Total revenue before tax: Rs. 10850.00
Protected by const: TypeError - Assignment to constant variable.
Protected by Object.freeze(): TypeError - Cannot assign to read only property 'TAX_RATE' of object '#<Object>'
TAX_RATE is still 0.18
```

The billing totals for orders 101–103 are identical in both versions, which proves the refactoring did not change the business logic. The modern version also handles order 104 (missing `items`) without crashing.

## Explanation

| Modern feature | Where it is used | How it helps |
|----------------|------------------|--------------|
| **`const`** | `CONFIG`, `orders`, all functions, `subtotal`, `tax` | A `const` variable cannot be reassigned. Values that should never change are protected — the output shows `TypeError: Assignment to constant variable`. A reader immediately knows the value is fixed. **(Reliability, readability)** |
| **`let`** | `totalRevenue` | Used only where the value really changes. `let` is block-scoped, so the variable does not leak outside the block like `var` does, and it cannot be re-declared in the same scope. **(Reliability)** |
| **Arrow functions** | `calculateSubtotal`, `formatMoney`, `generateBill`, all callbacks | Shorter syntax, implicit return for one-line functions, and callbacks such as `.map(({ customer }) => customer)` read like plain English. **(Readability)** |
| **Template literals** | Bill line, summary messages | Variables are written directly inside the string with `${...}`. There is no need to open and close quotes and add `+` around every variable, so the final output format is easy to see and change. **(Readability, maintainability)** |
| **Destructuring** | `const { id, customer, discount = 0 } = order`, `({ price, qty })` | Extracts only the needed properties in one line and documents which fields a function uses. **(Readability)** |
| **Default parameters / values** | `(items = [])`, `discount = 0` | Missing values get a safe default automatically, instead of manual `||` checks. **(Reliability)** |
| **Optional chaining `?.` and nullish coalescing `??`** | `order?.items ?? []` | If `items` is missing, an empty array is used and the program does not crash with `Cannot read properties of undefined`. Unlike `||`, `??` only replaces `null`/`undefined`, so a real value of `0` is kept. **(Reliability)** |
| **Array methods `reduce`, `filter`, `map`, `forEach`, `for...of`** | Subtotal and high-value customer list | Replace manual index loops and temporary arrays. The intent (“sum”, “filter”, “pick names”) is clear and there are no index bugs. **(Maintainability)** |
| **`Object.freeze()`** | `CONFIG` | Prevents properties of the configuration object from being changed at runtime. Because ES Modules run in strict mode, an accidental change throws an error instead of failing silently. **(Reliability)** |

## Conclusion

The refactored module produces the same billing results as the legacy code but is shorter, easier to read and safer. `const` and `let` prevent accidental reassignment and scope leaks, arrow functions and array methods remove boilerplate, and template literals make output strings readable. Additional ES6+ features such as destructuring, default values, optional chaining and nullish coalescing protect the application from missing data, which makes the code more reliable and easier to maintain in the future.

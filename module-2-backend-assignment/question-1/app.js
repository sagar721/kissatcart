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

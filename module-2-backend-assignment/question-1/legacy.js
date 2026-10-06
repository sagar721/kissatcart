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

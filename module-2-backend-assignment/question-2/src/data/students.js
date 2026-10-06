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

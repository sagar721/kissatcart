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

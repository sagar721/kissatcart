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

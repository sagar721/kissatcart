-- =====================================================================
-- DBMS Lab (U25AMILPC307) - Practical P5
-- Aggregate and Grouping Queries: COUNT, SUM, AVG, MIN, MAX,
-- GROUP BY, HAVING, ROLLUP and CUBE
-- Database : college_db            DBMS : PostgreSQL 17
-- Student  : Sagar Kumar (SOE25BTAM29), Section A
-- =====================================================================

-- ---------------------------------------------------------------------
-- Screenshot 1 : COUNT / SUM / AVG
-- ---------------------------------------------------------------------

-- Q1. Total number of students
SELECT COUNT(*) AS total_students
FROM student;

-- Q2. COUNT(*) vs COUNT(column): COUNT(marks) ignores NULL marks
SELECT COUNT(*)     AS total_enrollments,
       COUNT(marks) AS graded_enrollments
FROM enrollment;

-- Q3. Total monthly salary expense of all faculty
SELECT SUM(salary) AS total_salary_expense
FROM faculty;

-- Q4. Average marks (rounded to 2 decimal places)
SELECT ROUND(AVG(marks), 2) AS average_marks
FROM enrollment;

-- ---------------------------------------------------------------------
-- Screenshot 2 : MIN / MAX
-- ---------------------------------------------------------------------

-- Q5. Highest marks
SELECT MAX(marks) AS highest_marks
FROM enrollment;

-- Q6. Lowest marks
SELECT MIN(marks) AS lowest_marks
FROM enrollment;

-- Q7. Salary range of faculty
SELECT MIN(salary) AS min_salary,
       MAX(salary) AS max_salary,
       MAX(salary) - MIN(salary) AS salary_gap
FROM faculty;

-- Q8. Youngest and oldest student (MIN/MAX on a DATE column)
SELECT MIN(date_of_birth) AS oldest_student_dob,
       MAX(date_of_birth) AS youngest_student_dob
FROM student;

-- ---------------------------------------------------------------------
-- Screenshot 3 : GROUP BY
-- ---------------------------------------------------------------------

-- Q9. Department-wise student count
SELECT d.department_name,
       COUNT(s.student_id) AS total_students
FROM department d
LEFT JOIN student s
       ON d.department_id = s.department_id
GROUP BY d.department_name
ORDER BY total_students DESC, d.department_name;

-- Q10. Average, highest and lowest marks per course
SELECT c.course_name,
       COUNT(e.marks)         AS students_graded,
       ROUND(AVG(e.marks), 2) AS average_marks,
       MAX(e.marks)           AS highest,
       MIN(e.marks)           AS lowest
FROM course c
JOIN enrollment e
  ON c.course_id = e.course_id
GROUP BY c.course_name
ORDER BY average_marks DESC;

-- ---------------------------------------------------------------------
-- Screenshot 4 : HAVING
-- ---------------------------------------------------------------------

-- Q11. Courses whose average marks are greater than 75
SELECT c.course_name,
       ROUND(AVG(e.marks), 2) AS average_marks
FROM course c
JOIN enrollment e
  ON c.course_id = e.course_id
GROUP BY c.course_name
HAVING AVG(e.marks) > 75
ORDER BY average_marks DESC;

-- Q12. Departments having at least 3 second-year students
--      (WHERE filters rows first, HAVING then filters the groups)
SELECT d.department_name,
       COUNT(*) AS second_year_students
FROM department d
JOIN student s
  ON d.department_id = s.department_id
WHERE s.year_of_study = 2
GROUP BY d.department_name
HAVING COUNT(*) >= 3
ORDER BY second_year_students DESC;

-- ---------------------------------------------------------------------
-- Screenshot 5 : ROLLUP
-- ---------------------------------------------------------------------

-- Display NULLs visibly so the super-aggregate rows are easy to spot
\pset null '(null)'

-- Q13. Student count by department and year of study, with ROLLUP.
--      (null) in year_of_study  = subtotal for that department
--      (null) in both columns   = grand total
SELECT d.department_name,
       s.year_of_study,
       COUNT(*) AS total_students
FROM student s
JOIN department d ON s.department_id = d.department_id
GROUP BY ROLLUP (d.department_name, s.year_of_study)
ORDER BY d.department_name, s.year_of_study;

-- Q14. Enrollments and average marks per course, with a subtotal for
--      every department and one grand total row (labelled using GROUPING()).
SELECT CASE WHEN GROUPING(d.department_name) = 1 THEN '** GRAND TOTAL **'
            ELSE d.department_name END                   AS department,
       CASE WHEN GROUPING(d.department_name) = 1 THEN '-- All Courses --'
            WHEN GROUPING(c.course_name) = 1     THEN '-- Dept Subtotal --'
            ELSE c.course_name END                       AS course,
       COUNT(e.enrollment_id)                            AS enrollments,
       ROUND(AVG(e.marks), 2)                            AS avg_marks
FROM enrollment e
JOIN course c     ON e.course_id = c.course_id
JOIN department d ON c.department_id = d.department_id
GROUP BY ROLLUP (d.department_name, c.course_name)
ORDER BY GROUPING(d.department_name), d.department_name,
         GROUPING(c.course_name), c.course_name;

-- ---------------------------------------------------------------------
-- Screenshot 6 : CUBE
-- ---------------------------------------------------------------------

-- Q15. Student count for every combination of department and gender,
--      including department totals, gender totals and a grand total.
SELECT COALESCE(d.department_name, 'ALL DEPARTMENTS') AS department,
       CASE WHEN GROUPING(s.gender) = 1 THEN 'ALL'
            ELSE s.gender END                       AS gender,
       COUNT(*)                                     AS total_students
FROM student s
JOIN department d ON s.department_id = d.department_id
GROUP BY CUBE (d.department_name, s.gender)
ORDER BY GROUPING(d.department_name), d.department_name,
         GROUPING(s.gender), s.gender;

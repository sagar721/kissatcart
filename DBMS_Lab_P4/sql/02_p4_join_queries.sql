-- =====================================================================
-- DBMS Lab P4 : Multi-Table Join Queries (INNER, OUTER, SELF, CROSS)
-- Database : college_db          Server : PostgreSQL 17
-- =====================================================================
\pset null '(null)'
\pset pager off

-- Q0. Verify PostgreSQL server version and current database
SELECT version(), current_database();

-- Q1. INNER JOIN : students with their department
SELECT s.student_id, s.student_name, d.department_name
FROM student s
INNER JOIN department d
ON s.department_id = d.department_id
ORDER BY s.student_id;

-- Q2. LEFT OUTER JOIN : all students, department if allotted
SELECT s.student_id, s.student_name, d.department_name
FROM student s
LEFT OUTER JOIN department d
ON s.department_id = d.department_id
ORDER BY s.student_id;

-- Q3. RIGHT OUTER JOIN : all departments, with faculty if any
SELECT f.faculty_name, f.designation, d.department_name
FROM faculty f
RIGHT OUTER JOIN department d
ON f.department_id = d.department_id
ORDER BY d.department_id, f.faculty_id;

-- Q4. FULL OUTER JOIN : courses and faculty, matched or not
SELECT c.course_code, c.course_name, f.faculty_name
FROM course c
FULL OUTER JOIN faculty f
ON c.faculty_id = f.faculty_id
ORDER BY c.course_id, f.faculty_id;

-- Q5. SELF JOIN : pairs of faculty in the same department
SELECT f1.faculty_name AS faculty_1,
       f2.faculty_name AS faculty_2,
       d.department_name
FROM faculty f1
INNER JOIN faculty f2
ON  f1.department_id = f2.department_id
AND f1.faculty_id < f2.faculty_id
INNER JOIN department d
ON  f1.department_id = d.department_id
ORDER BY d.department_name, f1.faculty_id, f2.faculty_id;

-- Q6. CROSS JOIN : every AI&ML student paired with every AI&ML course
SELECT s.student_name, c.course_code, c.course_name
FROM student s
CROSS JOIN course c
WHERE s.department_id = 10
AND   c.department_id = 10
ORDER BY s.student_id, c.course_id;

-- Q7. CROSS JOIN size = rows(student) x rows(course)
SELECT (SELECT COUNT(*) FROM student) AS students,
       (SELECT COUNT(*) FROM course)  AS courses,
       COUNT(*)                       AS cross_join_rows
FROM student CROSS JOIN course;

-- Q8. 3-table JOIN : student -> enrollment -> course
SELECT s.student_name, c.course_name, e.marks
FROM student s
INNER JOIN enrollment e ON s.student_id = e.student_id
INNER JOIN course c     ON e.course_id  = c.course_id
ORDER BY s.student_id, c.course_id;

-- Q9. 4-table JOIN : student -> enrollment -> course -> faculty
SELECT s.student_name, c.course_name,
       COALESCE(f.faculty_name, 'Not Assigned') AS faculty_name,
       e.marks
FROM student s
INNER JOIN enrollment e ON s.student_id = e.student_id
INNER JOIN course c     ON e.course_id  = c.course_id
LEFT  JOIN faculty f    ON c.faculty_id = f.faculty_id
ORDER BY s.student_id, c.course_id;

-- Q10. 5-table JOIN : toppers (marks >= 85) with department and faculty
SELECT s.student_name, d.department_name, c.course_name,
       f.faculty_name, e.marks
FROM student s
INNER JOIN department d ON s.department_id = d.department_id
INNER JOIN enrollment e ON s.student_id    = e.student_id
INNER JOIN course c     ON e.course_id     = c.course_id
INNER JOIN faculty f    ON c.faculty_id    = f.faculty_id
WHERE e.marks >= 85
ORDER BY e.marks DESC;

-- Q11. LEFT JOIN + IS NULL : students not enrolled in any course
SELECT s.student_id, s.student_name, s.admission_year
FROM student s
LEFT JOIN enrollment e ON s.student_id = e.student_id
WHERE e.enrollment_id IS NULL
ORDER BY s.student_id;

-- Q12. Multi-table JOIN + GROUP BY : department-wise summary
SELECT d.department_name,
       COUNT(DISTINCT s.student_id) AS total_students,
       COUNT(e.enrollment_id)       AS enrollments,
       ROUND(AVG(e.marks), 2)       AS avg_marks
FROM department d
LEFT JOIN student s    ON d.department_id = s.department_id
LEFT JOIN enrollment e ON s.student_id    = e.student_id
GROUP BY d.department_id, d.department_name
ORDER BY d.department_id;

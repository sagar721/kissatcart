-- ============================================================
-- DBMS Lab  |  Practical P3
-- DML Operations and Data Retrieval
-- INSERT, SELECT, WHERE, ORDER BY, LIMIT, UPDATE, DELETE
-- Database : college_db (same as P1 / P2)   |   PostgreSQL 17
-- Student  : Sagar Kumar (SOE25BTAM29)
-- ============================================================

-- @shot ss01 | Connecting to college_db and listing the tables created in P1/P2
SELECT version();
\dt

-- @shot ss02 | INSERT: department, faculty and student tables
INSERT INTO department (dept_id, dept_name, hod_name, building) VALUES
(101, 'Computer Science',        'Dr. Anil Sharma',  'Block A'),
(102, 'Artificial Intelligence', 'Dr. Kavita Mehta', 'Block C'),
(103, 'Electronics',             'Dr. Rajesh Patil', 'Block B');

INSERT INTO faculty (faculty_id, faculty_name, designation, email, dept_id) VALUES
(201, 'Dr. Anil Sharma',  'Professor',           'anil.sharma@college.edu',  101),
(202, 'Dr. Kavita Mehta', 'Associate Professor', 'kavita.mehta@college.edu', 102),
(203, 'Dr. Rajesh Patil', 'Assistant Professor', 'rajesh.patil@college.edu', 103);

INSERT INTO student (student_id, prn, student_name, gender, dob, email, city, semester, dept_id) VALUES
(1, 'SOE25BTAM29', 'Sagar Kumar',  'M', '2006-08-14', 'sagar.kumar@college.edu',  'Pune',   3, 102),
(2, 'SOE25BTCS07', 'Rahul Sharma', 'M', '2006-03-22', 'rahul.sharma@college.edu', 'Nashik', 3, 101),
(3, 'SOE25BTAM41', 'Priya Singh',  'F', '2006-11-05', 'priya.singh@college.edu',  'Nagpur', 3, 102),
(4, 'SOE25BTEC15', 'Aman Verma',   'M', '2005-12-19', 'aman.verma@college.edu',   'Indore', 3, 103),
(5, 'SOE25BTCS33', 'Neha Joshi',   'F', '2006-06-30', 'neha.joshi@college.edu',   'Pune',   3, 101);

-- @shot ss03 | INSERT: course and enrollment tables
INSERT INTO course (course_code, course_name, credits, semester, dept_id, faculty_id) VALUES
('CS201', 'Data Structures',             4, 3, 101, 201),
('CS202', 'Database Management Systems', 4, 3, 101, 201),
('CS203', 'Operating Systems',           3, 3, 101, 203),
('AI201', 'Artificial Intelligence',     3, 3, 102, 202);

INSERT INTO enrollment (enrollment_id, student_id, course_code, enrollment_date, marks, grade) VALUES
(1,  1, 'CS202', '2025-07-21', 86, 'A+'),
(2,  1, 'CS201', '2025-07-21', 78, 'A'),
(3,  1, 'AI201', '2025-07-21', 91, 'O'),
(4,  2, 'CS202', '2025-07-21', 72, 'A'),
(5,  2, 'CS201', '2025-07-21', 65, 'B+'),
(6,  2, 'CS203', '2025-07-22', 58, 'B'),
(7,  3, 'CS202', '2025-07-21', 94, 'O'),
(8,  3, 'AI201', '2025-07-21', 88, 'A+'),
(9,  4, 'CS201', '2025-07-22', 47, 'C'),
(10, 4, 'CS203', '2025-07-22', 62, 'B+'),
(11, 5, 'CS202', '2025-07-21', 68, 'B+'),
(12, 5, 'CS203', '2025-07-22', 81, 'A+');

-- @shot ss04 | SELECT *: department, faculty and student
SELECT * FROM department;
SELECT * FROM faculty;
SELECT * FROM student;

-- @shot ss05 | SELECT *: course and enrollment
SELECT * FROM course;
SELECT * FROM enrollment;

-- @shot ss06 | SELECT with WHERE (=, >=, LIKE, BETWEEN, AND)
SELECT student_id, prn, student_name, city FROM student WHERE dept_id = 102;
SELECT enrollment_id, student_id, course_code, marks, grade FROM enrollment WHERE marks >= 85;
SELECT course_code, course_name, credits FROM course WHERE course_name LIKE '%Systems';
SELECT student_id, course_code, marks FROM enrollment WHERE marks BETWEEN 60 AND 75 AND course_code <> 'CS202';
SELECT student_name, city FROM student WHERE city = 'Pune' AND gender = 'F';

-- @shot ss07 | SELECT with ORDER BY (ASC, DESC, multiple columns)
SELECT student_id, student_name, city FROM student ORDER BY student_name ASC;
SELECT student_id, course_code, marks, grade FROM enrollment WHERE course_code = 'CS202' ORDER BY marks DESC;
SELECT student_name, dept_id, dob FROM student ORDER BY dept_id ASC, dob DESC;

-- @shot ss08 | SELECT with LIMIT and OFFSET
SELECT enrollment_id, student_id, course_code, marks FROM enrollment ORDER BY marks DESC LIMIT 3;
SELECT enrollment_id, student_id, course_code, marks FROM enrollment ORDER BY marks DESC LIMIT 3 OFFSET 3;
SELECT student_name, dob FROM student ORDER BY dob ASC LIMIT 1;

-- @shot ss09 | UPDATE a single row (re-evaluation) with verification
SELECT enrollment_id, student_id, course_code, marks, grade FROM enrollment WHERE student_id = 5 AND course_code = 'CS202';
UPDATE enrollment SET marks = 72, grade = 'A' WHERE student_id = 5 AND course_code = 'CS202';
SELECT enrollment_id, student_id, course_code, marks, grade FROM enrollment WHERE student_id = 5 AND course_code = 'CS202';

-- @shot ss10 | UPDATE using an expression and UPDATE of a text column, with verification
UPDATE enrollment SET marks = marks + 3, grade = 'B' WHERE course_code = 'CS201' AND marks < 50;
SELECT enrollment_id, student_id, course_code, marks, grade FROM enrollment WHERE course_code = 'CS201' ORDER BY student_id;
UPDATE student SET city = 'Mumbai' WHERE prn = 'SOE25BTCS07';
SELECT student_id, prn, student_name, city FROM student WHERE prn = 'SOE25BTCS07';

-- @shot ss11 | DELETE with WHERE and verification
SELECT enrollment_id, student_id, course_code, marks FROM enrollment WHERE student_id = 4;
DELETE FROM enrollment WHERE student_id = 4 AND course_code = 'CS203';
SELECT enrollment_id, student_id, course_code, marks FROM enrollment WHERE student_id = 4;
SELECT COUNT(*) AS total_enrollments FROM enrollment;

-- @shot ss12 | DELETE blocked by FOREIGN KEY, and final state of enrollment
DELETE FROM student WHERE student_id = 4;
SELECT * FROM enrollment ORDER BY enrollment_id;

DROP DATABASE IF EXISTS normalization_db;
CREATE DATABASE normalization_db;
USE normalization_db;
CREATE TABLE result_1nf (
    roll_no       CHAR(3),
    student_name  VARCHAR(30),
    dept_code     VARCHAR(5),
    dept_name     VARCHAR(30),
    hod_name      VARCHAR(30),
    course_id     CHAR(5),
    course_title  VARCHAR(30),
    instr_id      CHAR(3),
    instr_name    VARCHAR(30),
    marks         INT,
    PRIMARY KEY (roll_no, course_id)
);
INSERT INTO result_1nf VALUES
  ('S01', 'Aarav Sharma', 'CSE', 'Computer Engg', 'Anil Kulkarni',
   'CS101', 'Programming in C', 'I03', 'Rahul Patil', 78),
  ('S01', 'Aarav Sharma', 'CSE', 'Computer Engg', 'Anil Kulkarni',
   'CS301', 'DBMS', 'I01', 'Anil Kulkarni', 91),
  ('S02', 'Isha Gupta', 'CSE', 'Computer Engg', 'Anil Kulkarni',
   'CS101', 'Programming in C', 'I03', 'Rahul Patil', 88),
  ('S02', 'Isha Gupta', 'CSE', 'Computer Engg', 'Anil Kulkarni',
   'CS301', 'DBMS', 'I01', 'Anil Kulkarni', 74),
  ('S03', 'Rohan Mehta', 'AIML', 'AI and ML', 'Meera Joshi',
   'CS101', 'Programming in C', 'I03', 'Rahul Patil', 65),
  ('S03', 'Rohan Mehta', 'AIML', 'AI and ML', 'Meera Joshi',
   'AI201', 'Python for DS', 'I04', 'Sneha Deshmukh', 81);

SELECT 'roll_no -> student_name, dept_code' AS fd, COUNT(*) AS violations
FROM  (SELECT roll_no FROM result_1nf GROUP BY roll_no
       HAVING COUNT(DISTINCT student_name, dept_code) > 1) t
UNION ALL
SELECT 'dept_code -> dept_name, hod_name', COUNT(*)
FROM  (SELECT dept_code FROM result_1nf GROUP BY dept_code
       HAVING COUNT(DISTINCT dept_name, hod_name) > 1) t
UNION ALL
SELECT 'course_id -> course_title, instr_id', COUNT(*)
FROM  (SELECT course_id FROM result_1nf GROUP BY course_id
       HAVING COUNT(DISTINCT course_title, instr_id) > 1) t
UNION ALL
SELECT 'instr_id -> instr_name', COUNT(*)
FROM  (SELECT instr_id FROM result_1nf GROUP BY instr_id
       HAVING COUNT(DISTINCT instr_name) > 1) t;

SELECT dept_code, dept_name, hod_name, COUNT(*) AS times_stored
FROM   result_1nf GROUP BY dept_code, dept_name, hod_name;

START TRANSACTION;
UPDATE result_1nf SET dept_name = 'Computer Science' WHERE roll_no = 'S01';
SELECT DISTINCT dept_code, dept_name FROM result_1nf ORDER BY dept_code;
ROLLBACK;

INSERT INTO result_1nf (roll_no, course_id, course_title, instr_id, instr_name)
VALUES (NULL, 'CS401', 'Advanced Databases', 'I01', 'Anil Kulkarni');

START TRANSACTION;
DELETE FROM result_1nf WHERE roll_no = 'S03' AND course_id = 'AI201';
SELECT COUNT(*) AS rows_about_AI201_or_I04 FROM result_1nf
WHERE  course_id = 'AI201' OR instr_id = 'I04';
ROLLBACK;

CREATE TABLE student_2nf (
    roll_no CHAR(3) PRIMARY KEY, student_name VARCHAR(30),
    dept_code VARCHAR(5), dept_name VARCHAR(30), hod_name VARCHAR(30));
CREATE TABLE course_2nf (
    course_id CHAR(5) PRIMARY KEY, course_title VARCHAR(30),
    instr_id CHAR(3), instr_name VARCHAR(30));
CREATE TABLE result_2nf (
    roll_no CHAR(3), course_id CHAR(5), marks INT,
    PRIMARY KEY (roll_no, course_id),
    FOREIGN KEY (roll_no)   REFERENCES student_2nf (roll_no),
    FOREIGN KEY (course_id) REFERENCES course_2nf (course_id));

INSERT INTO student_2nf
    SELECT DISTINCT roll_no, student_name, dept_code, dept_name, hod_name
    FROM   result_1nf;
INSERT INTO course_2nf
    SELECT DISTINCT course_id, course_title, instr_id, instr_name FROM result_1nf;
INSERT INTO result_2nf SELECT roll_no, course_id, marks FROM result_1nf;

SELECT * FROM student_2nf;
SELECT * FROM course_2nf;

CREATE TABLE department (
    dept_code VARCHAR(5) PRIMARY KEY, dept_name VARCHAR(30), hod_name VARCHAR(30));
CREATE TABLE instructor (
    instr_id CHAR(3) PRIMARY KEY, instr_name VARCHAR(30));
CREATE TABLE student (
    roll_no CHAR(3) PRIMARY KEY, student_name VARCHAR(30), dept_code VARCHAR(5),
    FOREIGN KEY (dept_code) REFERENCES department (dept_code));
CREATE TABLE course (
    course_id CHAR(5) PRIMARY KEY, course_title VARCHAR(30), instr_id CHAR(3),
    FOREIGN KEY (instr_id) REFERENCES instructor (instr_id));
CREATE TABLE result (
    roll_no CHAR(3), course_id CHAR(5), marks INT,
    PRIMARY KEY (roll_no, course_id),
    FOREIGN KEY (roll_no)   REFERENCES student (roll_no),
    FOREIGN KEY (course_id) REFERENCES course (course_id));

INSERT INTO department SELECT DISTINCT dept_code, dept_name, hod_name FROM student_2nf;
INSERT INTO instructor SELECT DISTINCT instr_id, instr_name FROM course_2nf;
INSERT INTO student    SELECT roll_no, student_name, dept_code FROM student_2nf;
INSERT INTO course     SELECT course_id, course_title, instr_id FROM course_2nf;
INSERT INTO result     SELECT * FROM result_2nf;

SELECT * FROM department;
SELECT * FROM instructor;
SELECT * FROM student;
SELECT * FROM course;

SELECT COUNT(*) AS rows_after_join
FROM   result r
JOIN   student s    ON s.roll_no = r.roll_no
JOIN   department d ON d.dept_code = s.dept_code
JOIN   course c     ON c.course_id = r.course_id
JOIN   instructor i ON i.instr_id = c.instr_id;

SELECT * FROM result_1nf
EXCEPT
SELECT r.roll_no, s.student_name, d.dept_code, d.dept_name, d.hod_name,
       c.course_id, c.course_title, i.instr_id, i.instr_name, r.marks
FROM   result r
JOIN   student s    ON s.roll_no = r.roll_no
JOIN   department d ON d.dept_code = s.dept_code
JOIN   course c     ON c.course_id = r.course_id
JOIN   instructor i ON i.instr_id = c.instr_id;

UPDATE department SET dept_name = 'Computer Science' WHERE dept_code = 'CSE';
SELECT s.roll_no, d.dept_name
FROM   student s JOIN department d ON d.dept_code = s.dept_code;

INSERT INTO instructor VALUES ('I05', 'Pooja Kale');
INSERT INTO course VALUES ('CS401', 'Advanced Databases', 'I01');

DELETE FROM result WHERE roll_no = 'S03' AND course_id = 'AI201';
SELECT c.course_id, c.course_title, i.instr_name
FROM   course c JOIN instructor i ON i.instr_id = c.instr_id
WHERE  c.course_id IN ('AI201', 'CS401');

CREATE TABLE teaching (
    student    CHAR(3),
    subject    VARCHAR(10),
    instructor VARCHAR(30),
    PRIMARY KEY (student, subject)
);
INSERT INTO teaching VALUES
    ('S01', 'DBMS', 'Anil Kulkarni'),
    ('S01', 'Python', 'Sneha Deshmukh'),
    ('S02', 'DBMS', 'Rahul Patil'),
    ('S03', 'DBMS', 'Anil Kulkarni'),
    ('S03', 'Python', 'Sneha Deshmukh');

START TRANSACTION;
INSERT INTO teaching VALUES ('S04', 'Java', 'Anil Kulkarni');
SELECT instructor, GROUP_CONCAT(DISTINCT subject) AS subjects
FROM   teaching GROUP BY instructor HAVING COUNT(DISTINCT subject) > 1;
ROLLBACK;

CREATE TABLE instructor_subject (
    instructor VARCHAR(30) PRIMARY KEY,
    subject    VARCHAR(10) NOT NULL);
CREATE TABLE student_instructor (
    student    CHAR(3),
    instructor VARCHAR(30),
    PRIMARY KEY (student, instructor),
    FOREIGN KEY (instructor) REFERENCES instructor_subject (instructor));
INSERT INTO instructor_subject SELECT DISTINCT instructor, subject FROM teaching;
INSERT INTO student_instructor SELECT student, instructor FROM teaching;

INSERT INTO instructor_subject VALUES ('Anil Kulkarni', 'Java');

SELECT * FROM teaching
EXCEPT
SELECT si.student, isub.subject, si.instructor
FROM   student_instructor si JOIN instructor_subject isub USING (instructor);
SELECT * FROM instructor_subject;

CREATE TABLE course_book (
    course_id  CHAR(5),
    instructor VARCHAR(30),
    textbook   VARCHAR(20),
    PRIMARY KEY (course_id, instructor, textbook)
);
INSERT INTO course_book VALUES
    ('CS301', 'Anil Kulkarni', 'Silberschatz'),
    ('CS301', 'Anil Kulkarni', 'Elmasri-Navathe'),
    ('CS301', 'Rahul Patil', 'Silberschatz'),
    ('CS301', 'Rahul Patil', 'Elmasri-Navathe'),
    ('AI301', 'Meera Joshi', 'Tom Mitchell'),
    ('AI301', 'Meera Joshi', 'Aurelien Geron');

SELECT course_id, COUNT(*) AS rows_stored,
       COUNT(DISTINCT instructor) AS instructors, COUNT(DISTINCT textbook) AS textbooks
FROM   course_book GROUP BY course_id;

CREATE TABLE course_instructor (
    course_id CHAR(5), instructor VARCHAR(30), PRIMARY KEY (course_id, instructor));
CREATE TABLE course_textbook (
    course_id CHAR(5), textbook VARCHAR(20), PRIMARY KEY (course_id, textbook));
INSERT INTO course_instructor SELECT DISTINCT course_id, instructor FROM course_book;
INSERT INTO course_textbook   SELECT DISTINCT course_id, textbook   FROM course_book;

SELECT COUNT(*) AS rows_after_join
FROM   course_instructor ci JOIN course_textbook ct USING (course_id);
SELECT * FROM course_book
EXCEPT
SELECT ci.course_id, ci.instructor, ct.textbook
FROM   course_instructor ci JOIN course_textbook ct USING (course_id);

INSERT INTO course_textbook VALUES ('CS301', 'C. J. Date');
SELECT ci.course_id, ci.instructor, ct.textbook
FROM   course_instructor ci JOIN course_textbook ct USING (course_id)
WHERE  ci.course_id = 'CS301'
ORDER BY ci.instructor, ct.textbook;

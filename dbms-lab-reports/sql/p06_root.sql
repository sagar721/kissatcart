DROP DATABASE IF EXISTS college_db;
CREATE DATABASE college_db;
USE college_db;

CREATE TABLE department (
    dept_id     INT            NOT NULL,
    dept_code   VARCHAR(10)    NOT NULL,
    dept_name   VARCHAR(40)    NOT NULL,
    building    VARCHAR(20),
    budget      DECIMAL(12,2)  DEFAULT 1000000.00,
    CONSTRAINT pk_department PRIMARY KEY (dept_id),
    CONSTRAINT uq_dept_code  UNIQUE (dept_code),
    CONSTRAINT chk_budget    CHECK (budget > 0)
);

CREATE TABLE instructor (
    instr_id     INT            NOT NULL,
    instr_name   VARCHAR(40)    NOT NULL,
    designation  VARCHAR(20)    NOT NULL,
    dept_id      INT,
    salary       DECIMAL(10,2)  NOT NULL,
    email        VARCHAR(40)    NOT NULL,
    mentor_id    INT,
    CONSTRAINT pk_instructor   PRIMARY KEY (instr_id),
    CONSTRAINT uq_instr_email  UNIQUE (email),
    CONSTRAINT chk_salary      CHECK (salary BETWEEN 30000 AND 300000),
    CONSTRAINT fk_instr_dept   FOREIGN KEY (dept_id)
        REFERENCES department (dept_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_instr_mentor FOREIGN KEY (mentor_id)
        REFERENCES instructor (instr_id) ON DELETE SET NULL
);

CREATE TABLE student (
    student_id    INT            NOT NULL AUTO_INCREMENT,
    roll_no       VARCHAR(10)    NOT NULL,
    student_name  VARCHAR(40)    NOT NULL,
    gender        CHAR(1)        NOT NULL,
    dob           DATE           NOT NULL,
    dept_id       INT            NOT NULL,
    city          VARCHAR(30)    DEFAULT 'Pune',
    email         VARCHAR(40)    NOT NULL,
    CONSTRAINT pk_student       PRIMARY KEY (student_id),
    CONSTRAINT uq_roll_no       UNIQUE (roll_no),
    CONSTRAINT uq_student_email UNIQUE (email),
    CONSTRAINT chk_gender       CHECK (gender IN ('M', 'F', 'O')),
    CONSTRAINT chk_dob          CHECK (dob >= '1995-01-01'),
    CONSTRAINT fk_student_dept  FOREIGN KEY (dept_id)
        REFERENCES department (dept_id) ON UPDATE CASCADE
);

CREATE TABLE student_phone (
    student_id  INT       NOT NULL,
    phone       CHAR(10)  NOT NULL,
    CONSTRAINT pk_student_phone PRIMARY KEY (student_id, phone),
    CONSTRAINT chk_phone        CHECK (phone REGEXP '^[6-9][0-9]{9}$'),
    CONSTRAINT fk_phone_student FOREIGN KEY (student_id)
        REFERENCES student (student_id) ON DELETE CASCADE
);

CREATE TABLE course (
    course_id   CHAR(5)      NOT NULL,
    title       VARCHAR(40)  NOT NULL,
    dept_id     INT          NOT NULL,
    credits     TINYINT      NOT NULL,
    instr_id    INT,
    prereq_id   CHAR(5),
    CONSTRAINT pk_course        PRIMARY KEY (course_id),
    CONSTRAINT uq_course_title  UNIQUE (title),
    CONSTRAINT chk_credits      CHECK (credits BETWEEN 1 AND 5),
    CONSTRAINT fk_course_dept   FOREIGN KEY (dept_id)
        REFERENCES department (dept_id) ON UPDATE CASCADE,
    CONSTRAINT fk_course_instr  FOREIGN KEY (instr_id)
        REFERENCES instructor (instr_id) ON DELETE SET NULL,
    CONSTRAINT fk_course_prereq FOREIGN KEY (prereq_id)
        REFERENCES course (course_id)
);

CREATE TABLE enrollment (
    student_id  INT      NOT NULL,
    course_id   CHAR(5)  NOT NULL,
    semester    TINYINT  NOT NULL,
    marks       INT,
    grade       CHAR(2),
    CONSTRAINT pk_enrollment  PRIMARY KEY (student_id, course_id),
    CONSTRAINT chk_semester   CHECK (semester BETWEEN 1 AND 8),
    CONSTRAINT chk_marks      CHECK (marks BETWEEN 0 AND 100),
    CONSTRAINT fk_enr_student FOREIGN KEY (student_id)
        REFERENCES student (student_id) ON DELETE CASCADE,
    CONSTRAINT fk_enr_course  FOREIGN KEY (course_id) REFERENCES course (course_id)
);

INSERT INTO department (dept_id, dept_code, dept_name, building, budget) VALUES
    (10, 'CSE',   'Computer Engineering',     'A Block', 2500000),
    (20, 'AIML',  'AI and Machine Learning',  'B Block', 3000000),
    (30, 'ECE',   'Electronics and Telecomm', 'C Block', 1800000),
    (40, 'MECH',  'Mechanical Engineering',   'D Block', 1500000),
    (50, 'CIVIL', 'Civil Engineering',        'D Block', 1200000);

INSERT INTO instructor VALUES
    (101, 'Anil Kulkarni',  'Professor',  10, 185000, 'anil.k@example.com',   NULL),
    (102, 'Meera Joshi',    'Professor',  20, 172000, 'meera.j@example.com',  101),
    (103, 'Rahul Patil',    'Asst. Prof', 10,  82000, 'rahul.p@example.com',  101),
    (104, 'Sneha Deshmukh', 'Assoc. Prof', 20, 115000, 'sneha.d@example.com',  102),
    (105, 'Vikram Shinde',  'Professor',  30, 168000, 'vikram.s@example.com', 101),
    (106, 'Pooja Kale',     'Asst. Prof', 20,  78000, 'pooja.k@example.com',  104),
    (107, 'Nitin Pawar',    'Asst. Prof', 50,  76000, 'nitin.p@example.com',  105),
    (108, 'Kavita More',    'Assoc. Prof', 40, 112000, 'kavita.m@example.com', 105);

INSERT INTO student
    (roll_no, student_name, gender, dob, dept_id, city, email) VALUES
  ('S24CS001', 'Aarav Sharma',  'M', '2005-03-14', 10, 'Pune',   'aarav@example.com'),
  ('S24CS002', 'Isha Gupta',    'F', '2005-07-22', 10, 'Mumbai', 'isha@example.com'),
  ('S24AI001', 'Rohan Mehta',   'M', '2005-01-09', 20, 'Pune',   'rohan@example.com'),
  ('S24AI002', 'Priya Nair',    'F', '2004-11-30', 20, 'Nashik', 'priya@example.com'),
  ('S24AI003', 'Kunal Verma',   'M', '2005-05-18', 20, 'Pune',   'kunal@example.com'),
  ('S24EC001', 'Sneha Iyer',    'F', '2005-09-02', 30, 'Nagpur', 'sneha@example.com'),
  ('S24EC002', 'Aditya Rao',    'M', '2004-12-25', 30, 'Mumbai', 'aditya@example.com'),
  ('S24ME001', 'Neha Kulkarni', 'F', '2005-02-11', 40, 'Pune',   'neha@example.com'),
  ('S24CS003', 'Yash Jadhav',   'M', '2005-08-05', 10, NULL,     'yash@example.com'),
  ('S24AI004', 'Ananya Desai',  'F', '2005-04-27', 20, 'Mumbai', 'ananya@example.com');

INSERT INTO student_phone VALUES
    (1, '9876500011'), (1, '9876500012'), (2, '9876500021'), (3, '9876500031'),
    (4, '9876500041'), (4, '9876500042'), (6, '9876500061'), (9, '9876500091');

INSERT INTO course VALUES
    ('CS101', 'Programming in C',            10, 4, 103,  NULL),
    ('CS201', 'Data Structures',             10, 4, 103,  'CS101'),
    ('CS301', 'Database Management Systems', 10, 3, 101,  'CS201'),
    ('CS401', 'Advanced Databases',          10, 3, 101,  'CS301'),
    ('AI201', 'Python for Data Science',     20, 3, 104,  'CS101'),
    ('AI301', 'Machine Learning',            20, 4, 102,  'AI201'),
    ('AI401', 'Deep Learning',               20, 3, 106,  'AI301'),
    ('EC201', 'Digital Electronics',         30, 3, 105,  NULL),
    ('EC301', 'Signals and Systems',         30, 4, NULL, 'EC201'),
    ('ME201', 'Engineering Mechanics',       40, 3, 108,  NULL);

INSERT INTO enrollment (student_id, course_id, semester, marks, grade) VALUES
    (1, 'CS101', 3, 78, 'A'),  (1, 'CS201', 3, 85, 'A+'), (1, 'CS301', 4, 91, 'O'),
    (1, 'AI201', 3, 72, 'A'),  (2, 'CS101', 3, 88, 'A+'), (2, 'CS201', 3, 67, 'B+'),
    (2, 'CS301', 4, 74, 'A'),  (3, 'CS101', 3, 65, 'B+'), (3, 'AI201', 3, 81, 'A+'),
    (3, 'AI301', 4, 89, 'A+'), (3, 'CS301', 4, 70, 'A'),  (4, 'AI201', 3, 92, 'O'),
    (4, 'AI301', 4, 76, 'A'),  (4, 'AI401', 4, 84, 'A+'), (5, 'AI201', 3, 58, 'B'),
    (5, 'AI301', 4, 63, 'B+'), (6, 'EC201', 3, 79, 'A'),  (6, 'CS101', 3, 55, 'B'),
    (6, 'EC301', 4, 82, 'A+'), (7, 'EC201', 3, 45, 'C'),  (7, 'EC301', 4, 61, 'B+'),
    (8, 'CS101', 3, 78, 'A'),  (9, 'CS201', 3, 90, 'O'),  (9, 'CS301', 4, 95, 'O'),
    (9, 'CS401', 4, 88, 'A+');

SELECT instr_name, salary
FROM   instructor
WHERE  salary > (SELECT AVG(salary) FROM instructor)
ORDER BY salary DESC;

SELECT s.student_name, e.marks
FROM   enrollment e JOIN student s ON s.student_id = e.student_id
WHERE  e.course_id = 'CS101'
  AND  e.marks > (SELECT AVG(marks) FROM enrollment WHERE course_id = 'CS101');

SELECT roll_no, student_name
FROM   student
WHERE  student_id IN (SELECT student_id FROM enrollment
                      WHERE course_id IN (SELECT course_id FROM course
                                          WHERE instr_id = 101));

SELECT course_id, title
FROM   course
WHERE  course_id NOT IN (SELECT course_id FROM enrollment);

SELECT instr_name, dept_id, salary
FROM   instructor
WHERE  salary > ALL (SELECT salary FROM instructor WHERE dept_id = 20);

SELECT instr_name, dept_id, salary
FROM   instructor
WHERE  dept_id <> 20
  AND  salary < ANY (SELECT salary FROM instructor WHERE dept_id = 20);

SELECT e.student_id, e.course_id, e.marks
FROM   enrollment e
WHERE  e.marks > (SELECT AVG(e2.marks) FROM enrollment e2
                  WHERE  e2.course_id = e.course_id)
ORDER BY e.course_id, e.marks DESC;

SELECT d.dept_code, d.dept_name
FROM   department d
WHERE  NOT EXISTS (SELECT 1 FROM student s WHERE s.dept_id = d.dept_id);

SELECT s.roll_no, s.student_name
FROM   student s
WHERE  EXISTS (SELECT 1 FROM enrollment e
               WHERE e.student_id = s.student_id AND e.marks >= 90);

SELECT t.student_id, t.avg_marks
FROM   (SELECT student_id, ROUND(AVG(marks), 2) AS avg_marks
        FROM   enrollment GROUP BY student_id) AS t
WHERE  t.avg_marks >= 80;

SELECT d.dept_code,
       (SELECT COUNT(*) FROM course c WHERE c.dept_id = d.dept_id)  AS courses,
       (SELECT COUNT(*) FROM student s WHERE s.dept_id = d.dept_id) AS students
FROM   department d
ORDER BY d.dept_id;

WITH course_stats AS (
    SELECT course_id, ROUND(AVG(marks), 2) AS avg_marks, MAX(marks) AS top_marks
    FROM   enrollment
    GROUP BY course_id
)
SELECT c.course_id, c.title, cs.avg_marks, cs.top_marks
FROM   course c JOIN course_stats cs ON cs.course_id = c.course_id
WHERE  cs.avg_marks > 78;

WITH dept_avg AS (
    SELECT c.dept_id, AVG(e.marks) AS avg_marks
    FROM   enrollment e JOIN course c ON c.course_id = e.course_id
    GROUP BY c.dept_id
),
best AS (
    SELECT MAX(avg_marks) AS best_avg FROM dept_avg
)
SELECT d.dept_name, ROUND(da.avg_marks, 2) AS avg_marks
FROM   dept_avg da
JOIN   best b       ON da.avg_marks = b.best_avg
JOIN   department d ON d.dept_id = da.dept_id;

WITH RECURSIVE sem (n) AS (
    SELECT 1                              -- anchor member
    UNION ALL
    SELECT n + 1 FROM sem WHERE n < 8     -- recursive member
)
SELECT n AS semester,
       IF(n % 2 = 1, 'Odd (Jul-Dec)', 'Even (Jan-Jun)') AS term
FROM   sem;

WITH RECURSIVE prereq_chain AS (
    SELECT course_id, title, prereq_id, 0 AS level
    FROM   course
    WHERE  course_id = 'AI401'
    UNION ALL
    SELECT c.course_id, c.title, c.prereq_id, pc.level + 1
    FROM   course c
    JOIN   prereq_chain pc ON c.course_id = pc.prereq_id
)
SELECT level, course_id, title, prereq_id
FROM   prereq_chain
ORDER BY level;

WITH RECURSIVE hierarchy AS (
    SELECT instr_id, instr_name, mentor_id, 1 AS level,
           CAST(instr_name AS CHAR(200)) AS path
    FROM   instructor
    WHERE  mentor_id IS NULL
    UNION ALL
    SELECT i.instr_id, i.instr_name, i.mentor_id, h.level + 1,
           CONCAT(h.path, ' > ', i.instr_name)
    FROM   instructor i
    JOIN   hierarchy h ON i.mentor_id = h.instr_id
)
SELECT level, CONCAT(REPEAT('    ', level - 1), instr_name) AS instructor, path
FROM   hierarchy
ORDER BY path;

SELECT @@cte_max_recursion_depth;
WITH RECURSIVE endless (n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM endless
)
SELECT COUNT(*) FROM endless;

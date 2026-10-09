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

CREATE VIEW v_student_result AS
SELECT s.roll_no, s.student_name, d.dept_code, c.course_id, c.title,
       e.semester, e.marks, e.grade
FROM   enrollment e
JOIN   student s    ON s.student_id = e.student_id
JOIN   department d ON d.dept_id = s.dept_id
JOIN   course c     ON c.course_id = e.course_id;

SELECT roll_no, student_name, course_id, marks, grade
FROM   v_student_result
WHERE  dept_code = 'AIML' AND marks >= 80
ORDER BY marks DESC;

CREATE VIEW v_dept_summary AS
SELECT d.dept_code,
       COUNT(DISTINCT s.student_id) AS students,
       ROUND(AVG(e.marks), 2)       AS avg_marks
FROM   department d
LEFT JOIN student s    ON s.dept_id = d.dept_id
LEFT JOIN enrollment e ON e.student_id = s.student_id
GROUP BY d.dept_code;

SELECT * FROM v_dept_summary ORDER BY students DESC;

SELECT table_name, is_updatable, check_option
FROM   information_schema.views
WHERE  table_schema = 'college_db';

CREATE VIEW v_cse_student AS
SELECT student_id, roll_no, student_name, gender, dob, dept_id, email
FROM   student
WHERE  dept_id = 10
WITH CHECK OPTION;

INSERT INTO v_cse_student (roll_no, student_name, gender, dob, dept_id, email)
VALUES ('S24CS004', 'Om Patil', 'M', '2005-06-10', 10, 'om@example.com');
INSERT INTO v_cse_student (roll_no, student_name, gender, dob, dept_id, email)
VALUES ('S24AI005', 'Riya Shah', 'F', '2005-02-02', 20, 'riya@example.com');
UPDATE v_cse_student SET email = 'om.patil@example.com' WHERE roll_no = 'S24CS004';
SELECT roll_no, student_name, dept_id, email FROM v_cse_student;

UPDATE v_dept_summary SET students = 0 WHERE dept_code = 'CSE';

CREATE OR REPLACE VIEW v_dept_summary AS
SELECT d.dept_code,
       COUNT(DISTINCT s.student_id) AS students,
       ROUND(AVG(e.marks), 2)       AS avg_marks,
       MAX(e.marks)                 AS top_marks
FROM   department d
LEFT JOIN student s    ON s.dept_id = d.dept_id
LEFT JOIN enrollment e ON e.student_id = s.student_id
GROUP BY d.dept_code;
SELECT * FROM v_dept_summary WHERE students > 0;

DROP VIEW v_cse_student;
SHOW FULL TABLES WHERE table_type = 'VIEW';

EXPLAIN FORMAT=TREE
SELECT course_id, marks FROM v_student_result WHERE roll_no = 'S24CS001'\G

CREATE TABLE attendance (
    att_id      INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT     NOT NULL,
    course_id   CHAR(5) NOT NULL,
    att_date    DATE    NOT NULL,
    status      CHAR(1) NOT NULL       -- P = present, A = absent
);
SET SESSION cte_max_recursion_depth = 100000;
INSERT INTO attendance (student_id, course_id, att_date, status)
WITH RECURSIVE seq (n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 100000
)
SELECT 1 + n % 10,
       ELT(1 + n % 9, 'CS101', 'CS201', 'CS301', 'CS401', 'AI201',
                      'AI301', 'AI401', 'EC201', 'EC301'),
       DATE_ADD('2025-07-01', INTERVAL n % 180 DAY),
       IF(n % 7 = 0, 'A', 'P')
FROM   seq;
ANALYZE TABLE attendance;
SELECT COUNT(*) AS total_rows, MIN(att_date), MAX(att_date) FROM attendance;

SELECT COUNT(*) AS absentees
FROM   attendance
WHERE  att_date = '2025-08-14' AND status = 'A';

EXPLAIN
SELECT COUNT(*) AS absentees
FROM   attendance
WHERE  att_date = '2025-08-14' AND status = 'A'\G

EXPLAIN ANALYZE
SELECT COUNT(*) AS absentees
FROM   attendance
WHERE  att_date = '2025-08-14' AND status = 'A'\G

CREATE INDEX idx_att_date_status ON attendance (att_date, status);
SELECT index_name, seq_in_index, column_name, cardinality
FROM   information_schema.statistics
WHERE  table_schema = 'college_db' AND table_name = 'attendance';

SELECT COUNT(*) AS absentees
FROM   attendance
WHERE  att_date = '2025-08-14' AND status = 'A';

EXPLAIN
SELECT COUNT(*) AS absentees
FROM   attendance
WHERE  att_date = '2025-08-14' AND status = 'A'\G

EXPLAIN ANALYZE
SELECT COUNT(*) AS absentees
FROM   attendance
WHERE  att_date = '2025-08-14' AND status = 'A'\G

EXPLAIN SELECT COUNT(*) FROM attendance
WHERE  YEAR(att_date) = 2025 AND MONTH(att_date) = 8\G

EXPLAIN SELECT COUNT(*) FROM attendance
WHERE  att_date BETWEEN '2025-08-01' AND '2025-08-31'\G

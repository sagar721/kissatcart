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

CREATE TABLE lab_batch (batch CHAR(2) PRIMARY KEY);
CREATE TABLE lab_slot  (slot_day CHAR(3), slot_time VARCHAR(11),
                        PRIMARY KEY (slot_day, slot_time));
CREATE TABLE grade_scale (grade CHAR(2) PRIMARY KEY, min_marks INT, max_marks INT);
INSERT INTO lab_batch VALUES ('B1'), ('B2'), ('B3');
INSERT INTO lab_slot  VALUES ('Mon', '10:00-12:00'), ('Wed', '14:00-16:00');
INSERT INTO grade_scale VALUES ('O', 90, 100), ('A+', 80, 89), ('A', 70, 79),
       ('B+', 60, 69), ('B', 50, 59), ('C', 40, 49), ('F', 0, 39);

SELECT s.roll_no, s.student_name, d.dept_code, d.dept_name
FROM   student s
INNER JOIN department d ON s.dept_id = d.dept_id
ORDER BY d.dept_code, s.roll_no;

SELECT s.roll_no, s.student_name, c.title, e.marks, e.grade
FROM   enrollment e
JOIN   student s ON s.student_id = e.student_id
JOIN   course  c ON c.course_id  = e.course_id
WHERE  c.course_id = 'CS301'
ORDER BY e.marks DESC;

SELECT d.dept_code, COUNT(s.student_id) AS no_of_students
FROM   department d
LEFT JOIN student s ON s.dept_id = d.dept_id
GROUP BY d.dept_id, d.dept_code
ORDER BY d.dept_id;

SELECT s.roll_no, s.student_name, e.course_id
FROM   student s
LEFT JOIN enrollment e ON e.student_id = s.student_id
WHERE  e.student_id IS NULL;

SELECT c.course_id, c.title, i.instr_name
FROM   instructor i
RIGHT JOIN course c ON c.instr_id = i.instr_id
ORDER BY c.course_id;

SELECT c.course_id, c.title
FROM   enrollment e
RIGHT JOIN course c ON c.course_id = e.course_id
WHERE  e.course_id IS NULL;

SELECT i.instr_name, c.course_id
FROM   instructor i FULL OUTER JOIN course c ON c.instr_id = i.instr_id;

SELECT i.instr_name, c.course_id
FROM   instructor i LEFT JOIN course c ON c.instr_id = i.instr_id
UNION
SELECT i.instr_name, c.course_id
FROM   instructor i RIGHT JOIN course c ON c.instr_id = i.instr_id
ORDER BY instr_name IS NULL, instr_name, course_id;

SELECT i.instr_name AS instructor, i.designation,
       m.instr_name AS mentor
FROM   instructor i
LEFT JOIN instructor m ON i.mentor_id = m.instr_id
ORDER BY i.instr_id;

SELECT a.student_name AS student_1, b.student_name AS student_2, a.city
FROM   student a
JOIN   student b ON a.city = b.city AND a.student_id < b.student_id
ORDER BY a.city, student_1;

SELECT b.batch, s.slot_day, s.slot_time
FROM   lab_batch b
CROSS JOIN lab_slot s
ORDER BY b.batch, s.slot_day;

SELECT student_id, course_id, title, marks
FROM   enrollment JOIN course USING (course_id)
WHERE  student_id = 4;

SELECT dept_id, dept_code, course_id, title
FROM   department NATURAL JOIN course
WHERE  dept_code = 'ECE';

SELECT s.student_name, e.course_id, e.marks, g.grade AS computed_grade
FROM   enrollment e
JOIN   student s     ON s.student_id = e.student_id
JOIN   grade_scale g ON e.marks BETWEEN g.min_marks AND g.max_marks
WHERE  e.course_id = 'CS101'
ORDER BY e.marks DESC;

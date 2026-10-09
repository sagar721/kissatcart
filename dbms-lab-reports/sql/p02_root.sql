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

SELECT table_name, constraint_name, constraint_type
FROM   information_schema.table_constraints
WHERE  table_schema = 'college_db'
ORDER BY FIELD(table_name, 'department', 'instructor', 'student',
               'student_phone', 'course', 'enrollment'), constraint_type;

SELECT constraint_name, check_clause
FROM   information_schema.check_constraints
WHERE  constraint_schema = 'college_db'
ORDER BY constraint_name;

INSERT INTO department (dept_id, dept_code, dept_name, building, budget) VALUES
    (10, 'CSE',  'Computer Engineering',    'A Block', 2500000),
    (20, 'AIML', 'AI and Machine Learning', 'B Block', 3000000);
INSERT INTO department (dept_id, dept_code, dept_name)
    VALUES (30, 'ECE', 'Electronics');
INSERT INTO instructor VALUES
    (101, 'Anil Kulkarni', 'Professor',  10, 185000, 'anil.k@example.com',  NULL),
    (103, 'Rahul Patil',   'Asst. Prof', 10,  82000, 'rahul.p@example.com', 101);
INSERT INTO student (roll_no, student_name, gender, dob, dept_id, email) VALUES
    ('S24CS001', 'Aarav Sharma', 'M', '2005-03-14', 10, 'aarav@example.com'),
    ('S24AI001', 'Rohan Mehta',  'M', '2005-01-09', 20, 'rohan@example.com');
INSERT INTO student_phone VALUES
    (1, '9876500011'), (1, '9876500012'), (2, '9876500031');
INSERT INTO course VALUES ('CS101', 'Programming in C', 10, 4, 103, NULL),
                          ('CS201', 'Data Structures',  10, 4, 103, 'CS101');
INSERT INTO enrollment VALUES (1, 'CS101', 3, 78, 'A'), (2, 'CS101', 3, 65, 'B+');
SELECT * FROM department;
SELECT student_id, roll_no, student_name, dept_id, city FROM student;

INSERT INTO department VALUES (10, 'MECH', 'Mechanical', 'D Block', 1500000);
INSERT INTO department VALUES (40, 'CSE', 'Computer Science', 'A Block', 900000);
INSERT INTO department VALUES (40, 'MECH', NULL, 'D Block', 1500000);
INSERT INTO department VALUES (40, 'MECH', 'Mechanical', 'D Block', -500);
INSERT INTO instructor VALUES (104, 'Sneha Deshmukh', 'Assoc. Prof', 20, 15000,
                               'sneha.d@example.com', NULL);
INSERT INTO instructor VALUES (104, 'Sneha Deshmukh', 'Assoc. Prof', 99, 115000,
                               'sneha.d@example.com', NULL);
INSERT INTO student (roll_no, student_name, gender, dob, dept_id, email)
VALUES ('S24CS009', 'Test Student', 'X', '2005-01-01', 10, 'test@example.com');
INSERT INTO student (roll_no, student_name, gender, dob, dept_id, email)
VALUES ('S24CS009', 'Test Student', 'M', '1990-01-01', 10, 'test@example.com');
INSERT INTO student_phone VALUES (1, '12345');
INSERT INTO course VALUES ('CS301', 'DBMS', 10, 7, 101, 'CS201');
INSERT INTO enrollment VALUES (1, 'CS101', 3, 80, 'A+');
INSERT INTO enrollment VALUES (1, 'CS201', 3, 120, NULL);
DELETE FROM department WHERE dept_id = 10;
DROP TABLE department;

UPDATE department SET dept_id = 11 WHERE dept_id = 10;
SELECT roll_no, dept_id FROM student;
SELECT instr_id, instr_name, dept_id FROM instructor;
DELETE FROM student WHERE student_id = 1;
SELECT * FROM student_phone;
SELECT * FROM enrollment;
DELETE FROM instructor WHERE instr_id = 103;
SELECT course_id, title, instr_id FROM course;

ALTER TABLE course
    ADD CONSTRAINT chk_course_id CHECK (course_id REGEXP '^[A-Z]{2}[0-9]{3}$');
INSERT INTO course VALUES ('cs-99', 'Bad Course Id', 11, 3, NULL, NULL);
ALTER TABLE instructor
    ADD COLUMN joining_date DATE NOT NULL DEFAULT '2020-06-01';
ALTER TABLE instructor DROP CHECK chk_salary;
ALTER TABLE instructor
    ADD CONSTRAINT chk_salary CHECK (salary BETWEEN 40000 AND 300000);
ALTER TABLE student MODIFY city VARCHAR(30) NOT NULL DEFAULT 'Pune';
ALTER TABLE student DROP INDEX uq_student_email;
ALTER TABLE student ADD CONSTRAINT uq_student_email UNIQUE (email);
DESCRIBE instructor;

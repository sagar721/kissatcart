-- ============================================================
-- College Management System : schema created in P1 / P2
-- Database : college_db   (PostgreSQL 17)
-- Re-run here only so that P3 can be executed on a fresh server.
-- ============================================================

CREATE TABLE department (
    dept_id     INT          PRIMARY KEY,
    dept_name   VARCHAR(60)  NOT NULL UNIQUE,
    hod_name    VARCHAR(60),
    building    VARCHAR(40)
);

CREATE TABLE faculty (
    faculty_id    INT          PRIMARY KEY,
    faculty_name  VARCHAR(60)  NOT NULL,
    designation   VARCHAR(40),
    email         VARCHAR(80)  UNIQUE,
    dept_id       INT          REFERENCES department(dept_id)
);

CREATE TABLE student (
    student_id    INT          PRIMARY KEY,
    prn           VARCHAR(15)  NOT NULL UNIQUE,
    student_name  VARCHAR(60)  NOT NULL,
    gender        CHAR(1)      CHECK (gender IN ('M','F')),
    dob           DATE,
    email         VARCHAR(80)  UNIQUE,
    city          VARCHAR(40),
    semester      INT          CHECK (semester BETWEEN 1 AND 8),
    dept_id       INT          REFERENCES department(dept_id)
);

CREATE TABLE course (
    course_code   VARCHAR(10)  PRIMARY KEY,
    course_name   VARCHAR(80)  NOT NULL,
    credits       INT          CHECK (credits BETWEEN 1 AND 6),
    semester      INT,
    dept_id       INT          REFERENCES department(dept_id),
    faculty_id    INT          REFERENCES faculty(faculty_id)
);

CREATE TABLE enrollment (
    enrollment_id    INT           PRIMARY KEY,
    student_id       INT           NOT NULL REFERENCES student(student_id),
    course_code      VARCHAR(10)   NOT NULL REFERENCES course(course_code),
    enrollment_date  DATE          DEFAULT CURRENT_DATE,
    marks            NUMERIC(5,2)  CHECK (marks BETWEEN 0 AND 100),
    grade            VARCHAR(2),
    UNIQUE (student_id, course_code)
);

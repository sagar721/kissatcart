-- =====================================================================
-- DBMS Lab (U25AMILPC307) - College Management System database
-- Database : college_db          Server : PostgreSQL 17
-- Creates the five tables used in P1-P3 and loads sample data for P4.
-- Run as:  psql -U postgres -f 01_college_db_setup.sql
-- =====================================================================

DROP DATABASE IF EXISTS college_db;
CREATE DATABASE college_db;
\c college_db

-- 1. DEPARTMENT ---------------------------------------------------------
CREATE TABLE department (
    department_id    INT          PRIMARY KEY,
    department_name  VARCHAR(60)  NOT NULL UNIQUE,
    building         VARCHAR(30),
    established_year INT
);

-- 2. FACULTY ------------------------------------------------------------
CREATE TABLE faculty (
    faculty_id     INT           PRIMARY KEY,
    faculty_name   VARCHAR(50)   NOT NULL,
    designation    VARCHAR(30),
    email          VARCHAR(60)   UNIQUE,
    salary         NUMERIC(10,2) CHECK (salary > 0),
    department_id  INT REFERENCES department(department_id)
);

-- 3. STUDENT ------------------------------------------------------------
CREATE TABLE student (
    student_id     INT          PRIMARY KEY,
    student_name   VARCHAR(50)  NOT NULL,
    gender         CHAR(1)      CHECK (gender IN ('M','F')),
    city           VARCHAR(30),
    admission_year INT,
    department_id  INT REFERENCES department(department_id)   -- NULL = not yet allotted
);

-- 4. COURSE -------------------------------------------------------------
CREATE TABLE course (
    course_id      INT          PRIMARY KEY,
    course_code    VARCHAR(15)  NOT NULL UNIQUE,
    course_name    VARCHAR(60)  NOT NULL,
    credits        INT          CHECK (credits BETWEEN 1 AND 5),
    department_id  INT REFERENCES department(department_id),
    faculty_id     INT REFERENCES faculty(faculty_id)          -- NULL = not yet assigned
);

-- 5. ENROLLMENT ---------------------------------------------------------
CREATE TABLE enrollment (
    enrollment_id  INT  PRIMARY KEY,
    student_id     INT  NOT NULL REFERENCES student(student_id),
    course_id      INT  NOT NULL REFERENCES course(course_id),
    semester       VARCHAR(5),
    marks          INT  CHECK (marks BETWEEN 0 AND 100),
    UNIQUE (student_id, course_id)
);

-- ------------------------------ DATA ----------------------------------
INSERT INTO department VALUES
 (10, 'Artificial Intelligence & ML', 'Block A', 2020),
 (20, 'Computer Science',             'Block B', 2008),
 (30, 'Electronics & Telecom',        'Block C', 2008),
 (40, 'Mechanical Engineering',       'Block D', 2010),
 (50, 'Civil Engineering',            'Block E', 2025);   -- new: no faculty yet

INSERT INTO faculty VALUES
 (101, 'Dr. Anita Deshmukh', 'Professor',           'anita.d@college.edu',   125000, 10),
 (102, 'Prof. Rahul Mehta',  'Assistant Professor', 'rahul.m@college.edu',    78000, 10),
 (103, 'Dr. Sneha Kulkarni', 'Associate Professor', 'sneha.k@college.edu',    98000, 20),
 (104, 'Prof. Vikram Joshi', 'Assistant Professor', 'vikram.j@college.edu',   76000, 20),
 (105, 'Dr. Priya Nair',     'Professor',           'priya.n@college.edu',   120000, 30),
 (106, 'Prof. Amit Patil',   'Assistant Professor', 'amit.p@college.edu',     72000, 40),
 (107, 'Prof. Kavita Rao',   'Associate Professor', 'kavita.r@college.edu',   95000, 10);

INSERT INTO student VALUES
 (1,  'Aarav Sharma',  'M', 'Pune',      2024, 10),
 (2,  'Diya Patel',    'F', 'Mumbai',    2024, 10),
 (3,  'Rohan Verma',   'M', 'Nagpur',    2024, 20),
 (4,  'Ishita Gupta',  'F', 'Pune',      2024, 20),
 (5,  'Kabir Singh',   'M', 'Nashik',    2024, 30),
 (6,  'Meera Iyer',    'F', 'Chennai',   2024, 10),
 (7,  'Arjun Reddy',   'M', 'Hyderabad', 2024, 40),
 (8,  'Sana Khan',     'F', 'Mumbai',    2024, 20),
 (9,  'Neha Joshi',    'F', 'Pune',      2025, NULL),   -- department not allotted
 (10, 'Yash Kulkarni', 'M', 'Kolhapur',  2025, NULL);   -- department not allotted

INSERT INTO course VALUES
 (201, 'U25AMILPC307', 'DBMS Lab',                 1, 10, 102),
 (202, 'U25AMPC301',   'Machine Learning',         4, 10, 101),
 (203, 'U25CSPC302',   'Data Structures',          4, 20, 103),
 (204, 'U25CSPC303',   'Operating Systems',        3, 20, 104),
 (205, 'U25ETPC301',   'Digital Electronics',      3, 30, 105),
 (206, 'U25AMPE304',   'Deep Learning',            3, 10, NULL),   -- faculty not assigned
 (207, 'U25MEPC301',   'Thermodynamics',           3, 40, 106);

INSERT INTO enrollment VALUES
 (1,  1, 201, 'III', 88),
 (2,  1, 202, 'III', 79),
 (3,  2, 201, 'III', 92),
 (4,  2, 202, 'III', 85),
 (5,  3, 203, 'III', 74),
 (6,  3, 204, 'III', 67),
 (7,  4, 203, 'III', 81),
 (8,  5, 205, 'III', 70),
 (9,  6, 201, 'III', 95),
 (10, 6, 206, 'III', 90),
 (11, 7, 207, 'III', 63),
 (12, 8, 204, 'III', 77),
 (13, 8, 201, 'III', 84);
-- students 9 and 10 have no enrollment yet

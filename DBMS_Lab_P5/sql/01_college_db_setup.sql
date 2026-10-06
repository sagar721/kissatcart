-- =====================================================================
-- DBMS Lab (U25AMILPC307) - College Management System
-- Database : college_db            DBMS : PostgreSQL 17
-- Student  : Sagar Kumar (SOE25BTAM29), Section A
-- File     : 01_college_db_setup.sql
-- Purpose  : (Re)creates the college_db tables and sample data used
--            across the practicals so P5 can be run from a clean state.
-- Run as   : psql -U postgres -d college_db -f 01_college_db_setup.sql
-- =====================================================================

DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS department;

-- ---------------------------------------------------------------------
-- 1. department
-- ---------------------------------------------------------------------
CREATE TABLE department (
    department_id    SERIAL       PRIMARY KEY,
    department_name  VARCHAR(100) NOT NULL UNIQUE,
    hod_name         VARCHAR(100),
    building         VARCHAR(50)
);

-- ---------------------------------------------------------------------
-- 2. faculty
-- ---------------------------------------------------------------------
CREATE TABLE faculty (
    faculty_id     SERIAL        PRIMARY KEY,
    faculty_name   VARCHAR(100)  NOT NULL,
    email          VARCHAR(100)  UNIQUE,
    designation    VARCHAR(50),
    salary         NUMERIC(10,2) CHECK (salary > 0),
    department_id  INT REFERENCES department(department_id)
);

-- ---------------------------------------------------------------------
-- 3. student
-- ---------------------------------------------------------------------
CREATE TABLE student (
    student_id     SERIAL        PRIMARY KEY,
    first_name     VARCHAR(50)   NOT NULL,
    last_name      VARCHAR(50),
    email          VARCHAR(100)  UNIQUE,
    gender         CHAR(1)       CHECK (gender IN ('M', 'F')),
    date_of_birth  DATE,
    year_of_study  INT           CHECK (year_of_study BETWEEN 1 AND 4),
    department_id  INT REFERENCES department(department_id)
);

-- ---------------------------------------------------------------------
-- 4. course
-- ---------------------------------------------------------------------
CREATE TABLE course (
    course_id      SERIAL        PRIMARY KEY,
    course_code    VARCHAR(15)   NOT NULL UNIQUE,
    course_name    VARCHAR(100)  NOT NULL,
    credits        INT           CHECK (credits BETWEEN 1 AND 5),
    department_id  INT REFERENCES department(department_id),
    faculty_id     INT REFERENCES faculty(faculty_id)
);

-- ---------------------------------------------------------------------
-- 5. enrollment
-- ---------------------------------------------------------------------
CREATE TABLE enrollment (
    enrollment_id    SERIAL       PRIMARY KEY,
    student_id       INT NOT NULL REFERENCES student(student_id),
    course_id        INT NOT NULL REFERENCES course(course_id),
    enrollment_date  DATE         DEFAULT CURRENT_DATE,
    marks            NUMERIC(5,2) CHECK (marks BETWEEN 0 AND 100),
    UNIQUE (student_id, course_id)
);

-- ---------------------------------------------------------------------
-- Sample data
-- ---------------------------------------------------------------------
INSERT INTO department (department_name, hod_name, building) VALUES
('Computer Science',        'Dr. Rajesh Sharma', 'Block A'),
('AI and Machine Learning', 'Dr. Priya Mehta',   'Block B'),
('Electronics',             'Dr. Anil Verma',    'Block C'),
('Mechanical',              'Dr. Suresh Patil',  'Block D'),
('Civil',                   'Dr. Kavita Joshi',  'Block E');

INSERT INTO faculty (faculty_name, email, designation, salary, department_id) VALUES
('Dr. Rajesh Sharma', 'rajesh.sharma@college.edu', 'Professor',           125000, 1),
('Prof. Neha Gupta',  'neha.gupta@college.edu',    'Assistant Professor',  72000, 1),
('Dr. Priya Mehta',   'priya.mehta@college.edu',   'Professor',           130000, 2),
('Prof. Amit Kulkarni','amit.kulkarni@college.edu','Associate Professor',  95000, 2),
('Dr. Anil Verma',    'anil.verma@college.edu',    'Professor',           118000, 3),
('Prof. Sneha Rao',   'sneha.rao@college.edu',     'Assistant Professor',  68000, 3),
('Dr. Suresh Patil',  'suresh.patil@college.edu',  'Professor',           115000, 4),
('Dr. Kavita Joshi',  'kavita.joshi@college.edu',  'Professor',           112000, 5);

INSERT INTO student (first_name, last_name, email, gender, date_of_birth, year_of_study, department_id) VALUES
('Aarav',   'Singh',     'aarav.singh@student.edu',     'M', '2006-03-14', 2, 1),
('Diya',    'Patel',     'diya.patel@student.edu',      'F', '2006-07-22', 2, 1),
('Rohan',   'Deshmukh',  'rohan.deshmukh@student.edu',  'M', '2005-11-05', 3, 1),
('Ananya',  'Iyer',      'ananya.iyer@student.edu',     'F', '2006-01-30', 2, 1),
('Sagar',   'Kumar',     'sagar.kumar@student.edu',     'M', '2006-05-18', 2, 2),
('Ishita',  'Nair',      'ishita.nair@student.edu',     'F', '2006-09-09', 2, 2),
('Kunal',   'Jadhav',    'kunal.jadhav@student.edu',    'M', '2005-12-12', 3, 2),
('Meera',   'Reddy',     'meera.reddy@student.edu',     'F', '2006-04-25', 2, 2),
('Arjun',   'Malhotra',  'arjun.malhotra@student.edu',  'M', '2006-02-17', 2, 2),
('Pooja',   'Shinde',    'pooja.shinde@student.edu',    'F', '2005-08-03', 3, 3),
('Vikram',  'Chauhan',   'vikram.chauhan@student.edu',  'M', '2006-06-21', 2, 3),
('Sneha',   'Kapoor',    'sneha.kapoor@student.edu',    'F', '2006-10-11', 2, 3),
('Rahul',   'Pawar',     'rahul.pawar@student.edu',     'M', '2005-05-29', 3, 4),
('Tanvi',   'More',      'tanvi.more@student.edu',      'F', '2006-12-01', 2, 4),
('Nikhil',  'Bhosale',   'nikhil.bhosale@student.edu',  'M', '2006-08-15', 2, 4);
-- Note: the Civil department (id 5) intentionally has no students yet.

INSERT INTO course (course_code, course_name, credits, department_id, faculty_id) VALUES
('CS201', 'Data Structures',         4, 1, 1),
('CS202', 'Operating Systems',       3, 1, 2),
('AM201', 'Database Management',     4, 2, 3),
('AM202', 'Machine Learning',        4, 2, 4),
('EC201', 'Digital Electronics',     3, 3, 5),
('EC202', 'Signals and Systems',     3, 3, 6),
('ME201', 'Thermodynamics',          4, 4, 7),
('CE201', 'Structural Analysis',     3, 5, 8);

INSERT INTO enrollment (student_id, course_id, enrollment_date, marks) VALUES
-- Computer Science students
( 1, 1, '2025-07-21', 78.00), ( 1, 2, '2025-07-21', 72.50),
( 2, 1, '2025-07-21', 88.00), ( 2, 2, '2025-07-21', 81.00),
( 3, 1, '2025-07-22', 65.00), ( 3, 2, '2025-07-22', 58.50),
( 4, 1, '2025-07-22', 92.00), ( 4, 3, '2025-07-22', 85.50),
-- AI and ML students
( 5, 3, '2025-07-21', 89.50), ( 5, 4, '2025-07-21', 91.00),
( 6, 3, '2025-07-21', 76.00), ( 6, 4, '2025-07-21', 82.50),
( 7, 3, '2025-07-22', 68.00), ( 7, 4, '2025-07-22', 73.00),
( 8, 3, '2025-07-22', 94.00), ( 8, 4, '2025-07-22', 87.00),
( 9, 3, '2025-07-23', 71.50), ( 9, 4, '2025-07-23', NULL),   -- result awaited
-- Electronics students
(10, 5, '2025-07-21', 62.00), (10, 6, '2025-07-21', 55.00),
(11, 5, '2025-07-21', 74.00), (11, 6, '2025-07-21', 69.50),
(12, 5, '2025-07-22', 81.50), (12, 6, '2025-07-22', 77.00),
-- Mechanical students
(13, 7, '2025-07-21', 59.00), (13, 8, '2025-07-21', 63.50),
(14, 7, '2025-07-22', 84.00),
(15, 7, '2025-07-22', 70.50), (15, 8, '2025-07-22', 66.00);

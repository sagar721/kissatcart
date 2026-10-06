-- =====================================================================
-- DBMS Lab (U25AMILPC307) - Practical P1
-- Database Creation and ER Modeling: College Management System
-- Student : Sagar Kumar (PRN SOE25BTAM29), Section A
-- Target  : PostgreSQL 17  (run with:  psql -U postgres -f p1_college_db.sql)
-- =====================================================================

-- 1. Create the database and connect to it
CREATE DATABASE college_db;
\c college_db

-- 2. Create tables (parent tables first, then child tables)
CREATE TABLE department (
    department_id   INT GENERATED ALWAYS AS IDENTITY,
    department_name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_department PRIMARY KEY (department_id),
    CONSTRAINT uq_department_name UNIQUE (department_name)
);
CREATE TABLE student (
    student_id    INT GENERATED ALWAYS AS IDENTITY,
    student_name  VARCHAR(100) NOT NULL,
    email         VARCHAR(120) NOT NULL,
    phone         VARCHAR(15),
    department_id INT NOT NULL,
    CONSTRAINT pk_student PRIMARY KEY (student_id),
    CONSTRAINT uq_student_email UNIQUE (email),
    CONSTRAINT fk_student_department FOREIGN KEY (department_id)
        REFERENCES department (department_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE TABLE faculty (
    faculty_id    INT GENERATED ALWAYS AS IDENTITY,
    faculty_name  VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    CONSTRAINT pk_faculty PRIMARY KEY (faculty_id),
    CONSTRAINT fk_faculty_department FOREIGN KEY (department_id)
        REFERENCES department (department_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE TABLE course (
    course_id   INT GENERATED ALWAYS AS IDENTITY,
    course_name VARCHAR(100) NOT NULL,
    credits     SMALLINT NOT NULL,
    faculty_id  INT NOT NULL,
    CONSTRAINT pk_course PRIMARY KEY (course_id),
    CONSTRAINT chk_course_credits CHECK (credits BETWEEN 1 AND 6),
    CONSTRAINT fk_course_faculty FOREIGN KEY (faculty_id)
        REFERENCES faculty (faculty_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE TABLE enrollment (
    enrollment_id   INT GENERATED ALWAYS AS IDENTITY,
    student_id      INT NOT NULL,
    course_id       INT NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    marks           NUMERIC(5,2),
    CONSTRAINT pk_enrollment PRIMARY KEY (enrollment_id),
    CONSTRAINT uq_enrollment_student_course UNIQUE (student_id, course_id),
    CONSTRAINT chk_enrollment_marks CHECK (marks BETWEEN 0 AND 100),
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id)
        REFERENCES student (student_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id)
        REFERENCES course (course_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- 3. Verify the structure
\dt
\d student
\d faculty
\d course
\d enrollment
SELECT tc.table_name, tc.constraint_name, tc.constraint_type,
       kcu.column_name, ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
 AND tc.constraint_type = 'FOREIGN KEY'
WHERE tc.table_schema = 'public'
  AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
ORDER BY tc.table_name, tc.constraint_type DESC;

-- 4. Sample data (used only to verify that the schema works)
INSERT INTO department (department_name) VALUES
    ('Computer Science and Engineering'),
    ('Artificial Intelligence and Machine Learning'),
    ('Electronics and Telecommunication');
INSERT INTO faculty (faculty_name, department_id) VALUES
    ('Dr. Anita Kulkarni', 1),
    ('Prof. Rahul Mehta', 2),
    ('Dr. Sunil Patil', 3);
INSERT INTO student (student_name, email, phone, department_id) VALUES
    ('Aarav Sharma', 'aarav.sharma@college.edu', '9876500001', 1),
    ('Priya Nair', 'priya.nair@college.edu', '9876500002', 2),
    ('Rohan Desai', 'rohan.desai@college.edu', '9876500003', 2),
    ('Sneha Joshi', 'sneha.joshi@college.edu', '9876500004', 3);
INSERT INTO course (course_name, credits, faculty_id) VALUES
    ('Database Management Systems', 4, 1),
    ('Machine Learning', 3, 2),
    ('Digital Electronics', 3, 3);
INSERT INTO enrollment (student_id, course_id, enrollment_date, marks) VALUES
    (1, 1, '2026-07-15', 82.50),
    (2, 1, '2026-07-15', 91.00),
    (2, 2, '2026-07-16', 88.00),
    (3, 2, '2026-07-16', 76.50),
    (4, 3, '2026-07-17', 69.00),
    (3, 1, '2026-07-17', NULL);

-- 5. Join across all five tables
SELECT s.student_name, c.course_name, f.faculty_name,
       e.enrollment_date, e.marks
FROM enrollment e
JOIN student s ON s.student_id = e.student_id
JOIN course c  ON c.course_id  = e.course_id
JOIN faculty f ON f.faculty_id = c.faculty_id
ORDER BY e.enrollment_id;

-- 6. Constraint checks (each statement below is EXPECTED to fail with an ERROR)
INSERT INTO enrollment (student_id, course_id) VALUES (99, 1);
INSERT INTO enrollment (student_id, course_id, marks) VALUES (4, 1, 120);
INSERT INTO enrollment (student_id, course_id) VALUES (1, 1);
DELETE FROM department WHERE department_id = 1;

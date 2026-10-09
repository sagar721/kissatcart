DROP DATABASE IF EXISTS college_db;
CREATE DATABASE college_db;
SHOW DATABASES LIKE 'college%';
USE college_db;

CREATE TABLE department (
    dept_id    INT            PRIMARY KEY,
    dept_code  VARCHAR(10)    NOT NULL UNIQUE,
    dept_name  VARCHAR(40)    NOT NULL,
    building   VARCHAR(20),
    budget     DECIMAL(12,2)
);

CREATE TABLE instructor (
    instr_id     INT            PRIMARY KEY,
    instr_name   VARCHAR(40)    NOT NULL,
    designation  VARCHAR(20),
    salary       DECIMAL(10,2),
    email        VARCHAR(40),
    dept_id      INT,        -- WORKS_IN  (N:1)  -> FK on the N side
    mentor_id    INT,        -- MENTORS   (recursive 1:N)
    FOREIGN KEY (dept_id)   REFERENCES department (dept_id),
    FOREIGN KEY (mentor_id) REFERENCES instructor (instr_id)
);

CREATE TABLE student (
    student_id    INT          PRIMARY KEY,
    roll_no       VARCHAR(10)  NOT NULL UNIQUE,
    student_name  VARCHAR(40)  NOT NULL,
    gender        CHAR(1),
    dob           DATE,        -- age is derived from dob, so it is not stored
    city          VARCHAR(30),
    email         VARCHAR(40),
    dept_id       INT NOT NULL,                       -- BELONGS_TO (N:1)
    FOREIGN KEY (dept_id) REFERENCES department (dept_id)
);

CREATE TABLE student_phone (                          -- multivalued attribute
    student_id  INT,
    phone       CHAR(10),
    PRIMARY KEY (student_id, phone),
    FOREIGN KEY (student_id) REFERENCES student (student_id)
);

CREATE TABLE course (
    course_id  CHAR(5)      PRIMARY KEY,
    title      VARCHAR(40)  NOT NULL,
    credits    TINYINT,
    dept_id    INT NOT NULL,   -- OFFERS    (1:N)
    instr_id   INT,            -- TEACHES   (1:N)
    prereq_id  CHAR(5),        -- PREREQ_OF (recursive 1:N)
    FOREIGN KEY (dept_id)   REFERENCES department (dept_id),
    FOREIGN KEY (instr_id)  REFERENCES instructor (instr_id),
    FOREIGN KEY (prereq_id) REFERENCES course (course_id)
);

CREATE TABLE enrollment (      -- ENROLLS (M:N) becomes a separate relation
    student_id  INT,
    course_id   CHAR(5),
    semester    TINYINT,
    marks       INT,
    grade       CHAR(2),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES student (student_id),
    FOREIGN KEY (course_id)  REFERENCES course (course_id)
);

SHOW TABLES;
DESCRIBE student;
DESCRIBE enrollment;

SELECT table_name            AS child_table,
       column_name           AS fk_column,
       referenced_table_name AS parent_table,
       referenced_column_name AS parent_column
FROM   information_schema.key_column_usage
WHERE  table_schema = 'college_db'
  AND  referenced_table_name IS NOT NULL
ORDER BY child_table, fk_column;

INSERT INTO department VALUES (10, 'CSE', 'Computer Engineering', 'A Block', 2500000);
INSERT INTO instructor VALUES (101, 'Anil Kulkarni', 'Professor', 185000,
                               'anil.k@example.com', 10, NULL);
INSERT INTO student VALUES (1, 'S24CS001', 'Aarav Sharma', 'M', '2005-03-14',
                            'Pune', 'aarav@example.com', 10);
INSERT INTO student_phone VALUES (1, '9876500011'), (1, '9876500012');
INSERT INTO course VALUES ('CS301', 'Database Management Systems', 3, 10, 101, NULL);
INSERT INTO enrollment VALUES (1, 'CS301', 4, 91, 'O');
SELECT s.roll_no, s.student_name, s.dob,
       TIMESTAMPDIFF(YEAR, s.dob, '2026-10-09') AS age_on_2026_10_09,
       COUNT(p.phone) AS phone_count
FROM   student s LEFT JOIN student_phone p ON p.student_id = s.student_id
GROUP BY s.student_id;

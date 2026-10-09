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

CREATE TABLE wallet (
    student_id  INT           PRIMARY KEY,
    balance     DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_balance CHECK (balance >= 0),
    FOREIGN KEY (student_id) REFERENCES student (student_id)
);
CREATE TABLE college_account (
    acc_id   INT PRIMARY KEY,
    balance  DECIMAL(12,2) NOT NULL
);
CREATE TABLE fee_payment (
    receipt_no  INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT           NOT NULL,
    amount      DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    FOREIGN KEY (student_id) REFERENCES student (student_id)
);
INSERT INTO wallet VALUES (1, 60000), (2, 45000), (3, 15000), (4, 80000);
INSERT INTO college_account VALUES (1, 500000);

SELECT @@autocommit;
START TRANSACTION;
UPDATE wallet          SET balance = balance - 40000 WHERE student_id = 1;
UPDATE college_account SET balance = balance + 40000 WHERE acc_id = 1;
INSERT INTO fee_payment (student_id, amount) VALUES (1, 40000);
COMMIT;
SELECT w.student_id, w.balance AS wallet_balance, a.balance AS college_balance
FROM   wallet w, college_account a
WHERE  w.student_id = 1 AND a.acc_id = 1;

START TRANSACTION;
UPDATE wallet          SET balance = balance - 40000 WHERE student_id = 2;
UPDATE college_account SET balance = balance + 40000 WHERE acc_id = 1;
SELECT student_id, balance FROM wallet WHERE student_id = 2;
ROLLBACK;
SELECT student_id, balance FROM wallet WHERE student_id = 2;
SELECT balance AS college_balance FROM college_account WHERE acc_id = 1;

START TRANSACTION;
UPDATE wallet SET balance = balance - 5000 WHERE student_id = 4;
SAVEPOINT after_exam_fee;
UPDATE wallet SET balance = balance - 30000 WHERE student_id = 4;
SELECT student_id, balance FROM wallet WHERE student_id = 4;
ROLLBACK TO SAVEPOINT after_exam_fee;
COMMIT;
SELECT student_id, balance FROM wallet WHERE student_id = 4;

START TRANSACTION;
UPDATE college_account SET balance = balance + 40000 WHERE acc_id = 1;
UPDATE wallet          SET balance = balance - 40000 WHERE student_id = 3;
ROLLBACK;
SELECT (SELECT balance FROM wallet WHERE student_id = 3)       AS wallet_3,
       (SELECT balance FROM college_account WHERE acc_id = 1)  AS college_balance;

DELIMITER $$
CREATE FUNCTION get_grade(p_marks INT)
RETURNS CHAR(2)
DETERMINISTIC
BEGIN
    RETURN CASE
        WHEN p_marks IS NULL THEN NULL
        WHEN p_marks >= 90 THEN 'O'   WHEN p_marks >= 80 THEN 'A+'
        WHEN p_marks >= 70 THEN 'A'   WHEN p_marks >= 60 THEN 'B+'
        WHEN p_marks >= 50 THEN 'B'   WHEN p_marks >= 40 THEN 'C'
        ELSE 'F'
    END;
END$$
DELIMITER ;

SELECT get_grade(95) AS g95, get_grade(83) AS g83,
       get_grade(47) AS g47, get_grade(12) AS g12;
SELECT student_id, course_id, marks, grade, get_grade(marks) AS computed
FROM   enrollment WHERE course_id = 'CS301';

DELIMITER $$
CREATE PROCEDURE pay_fee(IN p_student INT, IN p_amount DECIMAL(10,2))
BEGIN
    DECLARE v_balance DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
    SELECT balance INTO v_balance FROM wallet
    WHERE  student_id = p_student FOR UPDATE;
    IF v_balance IS NULL OR v_balance < p_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient wallet balance';
    END IF;
    UPDATE wallet SET balance = balance - p_amount WHERE student_id = p_student;
    UPDATE college_account SET balance = balance + p_amount WHERE acc_id = 1;
    INSERT INTO fee_payment (student_id, amount) VALUES (p_student, p_amount);
    COMMIT;
    SELECT CONCAT('Receipt ', LAST_INSERT_ID(), ': fee of ', p_amount,
                  ' paid by student ', p_student) AS message;
END$$
DELIMITER ;

CALL pay_fee(2, 40000);
CALL pay_fee(3, 40000);
SELECT * FROM fee_payment;
SELECT * FROM wallet;

DELIMITER $$
CREATE PROCEDURE dept_stats(IN p_dept_code VARCHAR(10),
                            OUT p_students INT, OUT p_avg DECIMAL(5,2))
BEGIN
    SELECT COUNT(DISTINCT s.student_id), AVG(e.marks)
    INTO   p_students, p_avg
    FROM   student s
    JOIN   department d ON d.dept_id = s.dept_id
    LEFT JOIN enrollment e ON e.student_id = s.student_id
    WHERE  d.dept_code = p_dept_code;
END$$
DELIMITER ;

CALL dept_stats('AIML', @n, @avg);
SHOW WARNINGS;
SELECT @n AS aiml_students, @avg AS aiml_avg_marks;

CREATE TABLE marks_audit (
    audit_id    INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT, course_id CHAR(5),
    old_marks   INT, new_marks INT,
    changed_by  VARCHAR(60)
);

CREATE TRIGGER trg_enrollment_bi BEFORE INSERT ON enrollment
FOR EACH ROW SET NEW.grade = get_grade(NEW.marks);

CREATE TRIGGER trg_enrollment_bu BEFORE UPDATE ON enrollment
FOR EACH ROW SET NEW.grade = get_grade(NEW.marks);

DELIMITER $$
CREATE TRIGGER trg_enrollment_au AFTER UPDATE ON enrollment
FOR EACH ROW
BEGIN
    IF NOT (OLD.marks <=> NEW.marks) THEN
        INSERT INTO marks_audit
            (student_id, course_id, old_marks, new_marks, changed_by)
        VALUES (OLD.student_id, OLD.course_id, OLD.marks, NEW.marks, USER());
    END IF;
END$$
DELIMITER ;

INSERT INTO enrollment (student_id, course_id, semester, marks)
VALUES (10, 'AI201', 3, 86);
UPDATE enrollment SET marks = 52 WHERE student_id = 7 AND course_id = 'EC201';
SELECT * FROM enrollment
WHERE  (student_id, course_id) IN ((10, 'AI201'), (7, 'EC201'));
SELECT * FROM marks_audit;
SELECT trigger_name, action_timing, event_manipulation, event_object_table
FROM   information_schema.triggers
WHERE  trigger_schema = 'college_db';

DROP USER IF EXISTS 'prof_rahul'@'localhost', 'stu_aarav'@'localhost';
DROP ROLE IF EXISTS 'faculty_role', 'student_role';

CREATE VIEW v_course_results AS
SELECT s.roll_no, e.course_id, e.marks, e.grade
FROM   enrollment e JOIN student s ON s.student_id = e.student_id;

CREATE ROLE 'faculty_role', 'student_role';
GRANT SELECT ON college_db.* TO 'faculty_role';
GRANT UPDATE (marks) ON college_db.enrollment TO 'faculty_role';
GRANT EXECUTE ON PROCEDURE college_db.dept_stats TO 'faculty_role';
GRANT SELECT ON college_db.v_course_results TO 'student_role';

CREATE USER 'prof_rahul'@'localhost' IDENTIFIED BY 'Faculty@123';
CREATE USER 'stu_aarav'@'localhost'  IDENTIFIED BY 'Student@123';
GRANT 'faculty_role' TO 'prof_rahul'@'localhost';
GRANT 'student_role' TO 'stu_aarav'@'localhost';
SET DEFAULT ROLE ALL TO 'prof_rahul'@'localhost', 'stu_aarav'@'localhost';

SHOW GRANTS FOR 'faculty_role';
SHOW GRANTS FOR 'stu_aarav'@'localhost' USING 'student_role';
SELECT * FROM marks_audit;
REVOKE UPDATE (marks) ON college_db.enrollment FROM 'faculty_role';
SHOW GRANTS FOR 'faculty_role';

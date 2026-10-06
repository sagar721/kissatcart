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

SELECT s.student_name, c.course_name, f.faculty_name,
       e.enrollment_date, e.marks
FROM enrollment e
JOIN student s ON s.student_id = e.student_id
JOIN course c  ON c.course_id  = e.course_id
JOIN faculty f ON f.faculty_id = c.faculty_id
ORDER BY e.enrollment_id;

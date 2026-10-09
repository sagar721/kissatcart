-- Login:  mysql -u prof_rahul -p college_db
SELECT CURRENT_USER(), CURRENT_ROLE();
SELECT * FROM v_course_results WHERE course_id = 'CS101';
UPDATE enrollment SET marks = 80 WHERE student_id = 8 AND course_id = 'CS101';
UPDATE enrollment SET grade = 'O' WHERE student_id = 8 AND course_id = 'CS101';
DELETE FROM student WHERE student_id = 8;
CALL dept_stats('CSE', @n, @avg);
SELECT @n, @avg;

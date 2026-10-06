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
\dt

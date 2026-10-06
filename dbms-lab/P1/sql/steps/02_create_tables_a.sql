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

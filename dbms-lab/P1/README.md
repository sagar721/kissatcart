# DBMS Lab (U25AMILPC307): Practical P1

**Database Creation and ER Modeling: College Management System**
Sagar Kumar · PRN SOE25BTAM29 · Section A · B.Tech, Year 2, Semester III

## Deliverables

| File | What it is |
|---|---|
| `P1_DBMS_Lab_Record_Sagar_Kumar.pdf` | Final practical record, ready to submit (19 pages, A4) |
| `P1_DBMS_Lab_Record_Sagar_Kumar.docx` | Editable Word version with the same content |
| `source/P1_DBMS_Lab_Record.html` | Editable HTML source that the PDF is printed from |
| `sql/p1_college_db.sql` | Complete SQL script (PostgreSQL 17) |
| `sql/steps/*.sql` | The exact commands typed for each screenshot |
| `diagrams/er_diagram.svg` | Figure 1: ER diagram (Chen notation) |
| `diagrams/schema_diagram.svg` | Figure 2: Relational schema diagram |
| `screenshots/SS01–SS09` | Real psql execution screenshots, with `SHA256SUMS.txt` |

## How the screenshots were produced

Every screenshot is a real capture of a live, interactive `psql` 17.11 session
connected to a PostgreSQL 17.11 server (Linux, local socket, port 5433), taken on 06-10-2026.
`tools/capture_psql_screenshot.sh` opens an `xterm` and starts `psql` in it. It then types
the commands from `sql/steps/NN_*.sql` line by line, waits for PostgreSQL to answer, and
grabs the window with ImageMagick `import`. The only post-processing is cropping the empty
border. No image generation was used, and none of the output was typed in by hand.
The images in the PDF are pixel-identical to the files in `screenshots/`.

| # | File | Commands executed (`sql/steps/`) |
|---|---|---|
| 1 | `SS01_create_database.png` | `01_create_database.sql`: `psql --version`, `SHOW server_version`, `CREATE DATABASE college_db`, `\l`, `\c` |
| 2 | `SS02_create_department_student_faculty.png` | `02_create_tables_a.sql`: `CREATE TABLE department / student / faculty` |
| 3 | `SS03_create_course_enrollment_list_tables.png` | `03_create_tables_b.sql`: `CREATE TABLE course / enrollment`, `\dt` |
| 4 | `SS04_describe_student_faculty.png` | `04_describe_student_faculty.sql`: `\d student`, `\d faculty` |
| 5 | `SS05_describe_course_enrollment.png` | `05_describe_course_enrollment.sql`: `\d course`, `\d enrollment` |
| 6 | `SS06_verify_primary_foreign_keys.png` | `06_verify_keys.sql`: PK/FK listing from `information_schema` |
| 7 | `SS07_insert_sample_data.png` | `07_insert_sample_data.sql`: sample `INSERT`s |
| 8 | `SS08_join_query_output.png` | `08_join_query.sql`: 4-table join |
| 9 | `SS09_constraint_enforcement.png` | `09_constraint_tests.sql`: invalid FK, marks > 100, duplicate enrollment, delete of referenced department (each is expected to fail) |

## Reproducing on your own computer (if your lab requires your own screenshots)

1. Open **SQL Shell (psql)** (Windows) or a terminal (`psql -U postgres`) for PostgreSQL 17.
2. Run the files in `sql/steps/` in order, or paste their contents. Run `01` while connected to
   the default `postgres` database. It ends with `\c college_db`, and the remaining files run inside `college_db`.
3. After each file, take a screenshot of the terminal window. Each one should show the typed
   commands and PostgreSQL's replies (`CREATE DATABASE`, `CREATE TABLE`, the `\d` tables,
   query results, `ERROR:` lines for step 9).
4. Replace `screenshots/SSNN_*.png` with your images (same file names), then rebuild:
   `python3 source/build.py && python3 source/build_docx.py`. In Word you can also just
   right-click each screenshot → *Change Picture*.

If you re-run the script, drop the old database first with `DROP DATABASE IF EXISTS college_db;`.

## Rebuilding

```bash
python3 diagrams/make_diagrams.py   # regenerate the two diagrams
python3 source/build.py             # HTML -> PDF (headless Chromium) + header/footer
python3 source/build_docx.py        # Word version
```

# DBMS Lab – Practical P4: Multi-Table Join Queries

Sagar Kumar · PRN SOE25BTAM29 · Sec. A · B.Tech Year 2, Sem III · U25AMILPC307 DBMS Lab

**Deliverable:** `DBMS_Lab_P4_Sagar_Kumar_SOE25BTAM29.pdf` (31 pages, A4)

## Contents

| Path | What it is |
|---|---|
| `sql/01_college_db_setup.sql` | Creates `college_db` (department, faculty, student, course, enrollment) and loads the sample data |
| `sql/02_p4_join_queries.sql` | All P4 queries, Q0–Q12 (INNER, LEFT, RIGHT, FULL, SELF, CROSS, and 3/4/5-table joins) |
| `sql/queries.json` | The same queries split one per query; the PDF and the screenshot capture both read from this file |
| `outputs/*.txt` | psql 17 output for each query, plus `base_tables.txt` and `table_structures.txt` |
| `screenshots/Q*.png` | Screenshots of the pgAdmin 4 v9.18 Query Tool after each query was run (1280×960 at 2× scale) |
| `screenshots/verification_report.json` | Cross-check results: editor text = SQL, result grid = psql rows, and the SHA-256 of each image |
| `build_pdf.py`, `make_diagrams.py`, `verify_screenshots.py` | Scripts that generate the PDF, draw the diagrams and check the screenshots |

## How the outputs were produced

1. A PostgreSQL **17.10** server was started, and `01_college_db_setup.sql` was loaded with psql 17.
2. Each query in `queries.json` went through **pgAdmin 4 v9.18** (Query Tool connected as
   `college_db/postgres@PostgreSQL 17`): it was entered in the editor, run with F5, and the screen was
   captured. At capture time the editor text and the result-grid cells were also recorded.
3. `verify_screenshots.py sql/queries.json` re-ran every query in psql. It confirmed that the editor text
   equals the SQL and that every grid cell equals the psql row. All 13 queries passed.
4. `python3 make_diagrams.py && python3 build_pdf.py` builds the PDF. The build stops if any check failed.

## Re-running on your own machine

```bash
psql -U postgres -f sql/01_college_db_setup.sql      # creates college_db (drops it first if it exists)
psql -U postgres -d college_db -f sql/02_p4_join_queries.sql
```

If your P1–P3 `college_db` uses different column names or rows, adjust `01_college_db_setup.sql`.
Then re-run the queries: the row counts in the PDF assume the sample data in this script.

# DBMS Lab – Practical P5 (Aggregate and Grouping Queries)

Sagar Kumar · SOE25BTAM29 · Section A · U25AMILPC307 DBMS Lab · `college_db` on PostgreSQL 17

| File | What it is |
|---|---|
| `DBMS_Lab_P5_Sagar_Kumar_SOE25BTAM29.pdf` | Final submission (15 pages) |
| `sql/01_college_db_setup.sql` | Re-creates the 5 tables (department, faculty, student, course, enrollment) and sample data |
| `sql/02_p5_aggregate_queries.sql` | The 15 P5 queries (COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING, ROLLUP, CUBE) |
| `sql/p5_actual_output.txt` | Full psql transcript of running the queries file |
| `screenshots/*_raw.png` | Untouched xterm window captures of the live psql session |
| `screenshots/*.png` | Same captures with only the empty black area around the text trimmed |
| `capture_screenshots.py` | Script that typed the queries into psql (xdotool) and captured the window |
| `build_pdf.py` | Builds the PDF from the SQL file and screenshots (`python3 build_pdf.py`) |

## How the screenshots were produced

PostgreSQL **17.11** (official `postgres:17` Docker image) was run, `college_db` was loaded
from `01_college_db_setup.sql`, and `psql` was opened in a real xterm. Each query was typed at
the `college_db=#` prompt and the terminal window was captured. Nothing in the
screenshots was drawn or edited.

## Re-running on your own machine (to take your own screenshots)

```bash
psql -U postgres -c "CREATE DATABASE college_db;"     # skip if it already exists
psql -U postgres -d college_db -f sql/01_college_db_setup.sql   # WARNING: drops & recreates the 5 tables
psql -U postgres -d college_db
```

Then paste each block from `sql/02_p5_aggregate_queries.sql` and capture:

| Screenshot | Queries |
|---|---|
| 0 | `SELECT version();` and `\dt` |
| 1 | Q1–Q4 (COUNT / SUM / AVG) |
| 2 | Q5–Q8 (MIN / MAX) |
| 3(a), 3(b) | Q9, Q10 (GROUP BY) |
| 4 | Q11–Q12 (HAVING) |
| 5(a), 5(b) | `\pset null '(null)'` + Q13, Q14 (ROLLUP) |
| 6 | Q15 (CUBE) |

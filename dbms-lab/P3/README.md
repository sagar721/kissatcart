# DBMS Lab – Practical P3 (Sagar Kumar, SOE25BTAM29)

**Submission file:** `P3_DBMS_Lab_Sagar_Kumar_SOE25BTAM29.pdf` (A4, 15 pages)

| Path | Contents |
|---|---|
| `sql/00_schema_from_P1_P2.sql` | The `college_db` schema (department, faculty, student, course, enrollment) |
| `sql/P3_dml_operations.sql` | Every P3 query, grouped in the order they were run (one group per screenshot) |
| `screenshots/ssNN.png` | Real screenshots of the xterm/psql 17.10 session |
| `screenshots/ssNN.txt` | Exact terminal text captured at the same moment (tmux `capture-pane`) |
| `build_pdf.py` | Builds the PDF from the SQL file and screenshots |
| `tools/capture.py`, `tools/reset_db.sh` | Script that typed the queries into a live psql session and took the screenshots |

## How the screenshots were produced
- Server: PostgreSQL **17.10**. Client: **psql 17.10**, in an interactive session in a real `xterm` window on Linux.
- Starting from an empty `college_db` (schema only), the queries were typed into psql in the order shown. The screen was grabbed after each group with ImageMagick `import`.
- The only post-processing was cropping away the blank part of the terminal window. Long lines wrap exactly as the terminal wrapped them.

## Consistency check
| Check | Status |
|---|---|
| Same database as P1/P2 (`college_db`) | ✔ Screenshot 1 shows `college_db=#` and `\dt` |
| Same table names: department, faculty, student, course, enrollment | ✔ `\dt` lists exactly these 5 |
| SQL syntax valid on PostgreSQL 17 | ✔ Every statement ran. The only error is the intended FK violation in ss12 |
| Outputs correspond to the actual queries | ✔ The script was re-run on a fresh database and every result line was compared with the captured text: 12/12 groups match (in ss12 the long ERROR line is wrapped at 124 columns, but the text is the same) |
| No fake screenshots | ✔ All 12 come from the live session above |
| No fabricated output | ✔ The numbers in "Explanation of Results" come from the captured output (27 rows inserted; UPDATE 1 ×3; DELETE 1; 12 → 11 enrollments) |

**Note:** The P1/P2 files were not available, so the column definitions in `00_schema_from_P1_P2.sql` were rebuilt from the table names. Before you submit, check them against your own P1/P2. If any column differs, edit the SQL, run it again in your psql, and replace the screenshots.

#!/usr/bin/env python3
"""Builds DBMS_Lab_P5_Sagar_Kumar_SOE25BTAM29.pdf from the SQL file and the
screenshots captured from the live PostgreSQL 17 psql session."""
import os
import re

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (Image as RLImage, KeepTogether, PageBreak, Paragraph,
                                Preformatted, SimpleDocTemplate, Spacer, Table, TableStyle)

HERE = os.path.dirname(os.path.abspath(__file__))
SQL = open(os.path.join(HERE, "sql", "02_p5_aggregate_queries.sql")).read()
SHOTS = os.path.join(HERE, "screenshots")
OUT = os.path.join(HERE, "DBMS_Lab_P5_Sagar_Kumar_SOE25BTAM29.pdf")

PAGE_W, PAGE_H = A4
MARGIN = 2.0 * cm
TEXT_W = PAGE_W - 2 * MARGIN
NAVY = colors.HexColor("#1f3864")

# ----------------------------------------------------------------- styles
body = ParagraphStyle("body", fontName="Times-Roman", fontSize=11.5, leading=15.5,
                      alignment=TA_JUSTIFY, spaceAfter=5)
bullet = ParagraphStyle("bullet", parent=body, leftIndent=16, bulletIndent=4, spaceAfter=2)
h1 = ParagraphStyle("h1", fontName="Times-Bold", fontSize=14, leading=18, textColor=NAVY,
                    spaceBefore=10, spaceAfter=6)
h2 = ParagraphStyle("h2", fontName="Times-Bold", fontSize=12.5, leading=16, spaceBefore=8,
                    spaceAfter=4)
caption = ParagraphStyle("caption", fontName="Times-Italic", fontSize=10, leading=13,
                         alignment=TA_CENTER, spaceBefore=3, spaceAfter=10)
code = ParagraphStyle("code", fontName="Courier", fontSize=8.8, leading=11)
cell = ParagraphStyle("cell", fontName="Times-Roman", fontSize=10.5, leading=13)
cellb = ParagraphStyle("cellb", parent=cell, fontName="Times-Bold")
title = ParagraphStyle("title", fontName="Times-Bold", fontSize=17, leading=22,
                       alignment=TA_CENTER, textColor=NAVY)
subtitle = ParagraphStyle("subtitle", fontName="Times-Roman", fontSize=12.5, leading=17,
                          alignment=TA_CENTER)


def P(text, style=body):
    return Paragraph(text, style)


def bullets(items):
    return [Paragraph(t, bullet, bulletText="•") for t in items]


def grid(rows, widths, header=True):
    data = [[P(c, cellb if (header and r == 0) else cell) for c in row]
            for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#7f7f7f")),
             ("VALIGN", (0, 0), (-1, -1), "TOP"),
             ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
             ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]
    if header:
        style.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#d9e2f3")))
    t.setStyle(TableStyle(style))
    return t


def code_box(text):
    t = Table([[Preformatted(text, code)]], colWidths=[TEXT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f3f3f3")),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#a6a6a6")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    return t


def query(n):
    """Exact text of query Qn (comment + statement) from the SQL file."""
    m = re.search(r"(-- Q%d\..*?;)\n" % n, SQL, re.S)
    return m.group(1)


def shot(name, cap, scale=0.45, label=None):
    path = os.path.join(SHOTS, name + ".png")
    w, h = Image.open(path).size
    s = min(scale, TEXT_W / w)
    img = RLImage(path, width=w * s, height=h * s)
    frame = Table([[img]], colWidths=[w * s + 2])
    frame.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#404040")),
                               ("LEFTPADDING", (0, 0), (-1, -1), 1),
                               ("RIGHTPADDING", (0, 0), (-1, -1), 1),
                               ("TOPPADDING", (0, 0), (-1, -1), 1),
                               ("BOTTOMPADDING", (0, 0), (-1, -1), 1)]))
    items = [frame, P(cap, caption)]
    if label:
        items.insert(0, P(label, body))
    return KeepTogether(items)


def on_page(c, doc):
    c.saveState()
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.8)
    c.line(MARGIN, PAGE_H - 1.35 * cm, PAGE_W - MARGIN, PAGE_H - 1.35 * cm)
    c.line(MARGIN, 1.35 * cm, PAGE_W - MARGIN, 1.35 * cm)
    c.setFont("Times-Roman", 9.5)
    c.drawString(MARGIN, PAGE_H - 1.15 * cm, "DBMS Lab (U25AMILPC307)")
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 1.15 * cm,
                      "Practical P5: Aggregate and Grouping Queries")
    c.drawString(MARGIN, 0.9 * cm, "Sagar Kumar  |  PRN: SOE25BTAM29  |  Section A")
    c.drawRightString(PAGE_W - MARGIN, 0.9 * cm, "Page %d" % doc.page)
    c.restoreState()


# ---------------------------------------------------------------- content
s = []

s += [Spacer(1, 4), P("DBMS LAB &ndash; PRACTICAL P5", title), Spacer(1, 4),
      P("Aggregate and Grouping Queries &ndash; Using Aggregate Functions, "
        "GROUP BY, HAVING, ROLLUP and CUBE", subtitle), Spacer(1, 12)]

details = [["Name", "Sagar Kumar", "PRN", "SOE25BTAM29"],
           ["Program", "Bachelor of Technology", "Section", "A"],
           ["Year", "2", "Semester", "III"],
           ["Course Code", "U25AMILPC307", "Course Title", "DBMS Lab"],
           ["Practical", "P5", "Database / DBMS", "college_db / PostgreSQL 17"]]
dt = Table([[P(r[0], cellb), P(r[1], cell), P(r[2], cellb), P(r[3], cell)] for r in details],
           colWidths=[3.0 * cm, 5.5 * cm, 3.4 * cm, TEXT_W - 11.9 * cm])
dt.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#7f7f7f")),
                        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#d9e2f3")),
                        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#d9e2f3")),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
s += [dt, Spacer(1, 10)]

# 1. Aim
s += [P("1. Aim", h1),
      P("To write and execute aggregate and grouping queries on the College Management "
        "System database (<b>college_db</b>) in PostgreSQL 17 using the aggregate functions "
        "COUNT(), SUM(), AVG(), MIN() and MAX() together with the GROUP BY, HAVING, "
        "ROLLUP and CUBE clauses.")]

# 2. Objective
s += [P("2. Objective", h1)]
s += bullets([
    "To summarise many rows of a table into a single value using aggregate functions.",
    "To understand how aggregate functions treat NULL values (COUNT(*) vs COUNT(column)).",
    "To divide rows into groups with GROUP BY and compute one summary row per group.",
    "To filter groups with HAVING and to understand the difference between WHERE and HAVING.",
    "To produce sub-totals and grand totals in one query with GROUP BY ROLLUP.",
    "To produce totals for every combination of grouping columns with GROUP BY CUBE, and to "
    "identify super-aggregate rows with the GROUPING() function.",
])

# 3. Theory
s += [P("3. Theory", h1),
      P("In a relational database, data is stored row by row, but reports usually need "
        "<i>summary</i> information &ndash; how many students are there, what is the average "
        "mark of a course, which department has the most students. SQL provides "
        "<b>aggregate functions</b> for this purpose. An aggregate function takes a set of "
        "rows as input and returns a single value as output."),
      P("3.1 GROUP BY", h2),
      P("Without GROUP BY, an aggregate function treats the whole result as one group and "
        "returns exactly one row. The GROUP BY clause divides the rows into groups that have "
        "the same value(s) in the listed column(s); the aggregate is then computed separately "
        "for each group, giving one output row per group. Every column in the SELECT list "
        "must either appear in the GROUP BY clause or be used inside an aggregate function."),
      P("3.2 HAVING", h2),
      P("WHERE filters individual rows <i>before</i> grouping, so it cannot contain aggregate "
        "functions. HAVING filters whole groups <i>after</i> the aggregates have been "
        "calculated, so conditions such as <font face='Courier'>AVG(marks) &gt; 75</font> "
        "must be written in HAVING. A query can use both: WHERE first removes unwanted "
        "rows, GROUP BY forms groups from the remaining rows and HAVING keeps only the "
        "groups that satisfy the condition."),
      P("Logical order of evaluation of a SELECT statement:", body),
      code_box("FROM / JOIN  ->  WHERE  ->  GROUP BY  ->  aggregate functions  ->  HAVING\n"
               "             ->  SELECT  ->  ORDER BY  ->  LIMIT"),
      Spacer(1, 6),
      P("3.3 ROLLUP", h2),
      P("<font face='Courier'>GROUP BY ROLLUP (a, b)</font> produces normal groups and, in the "
        "same result, <b>hierarchical sub-totals</b> and a <b>grand total</b>. It works from "
        "right to left, removing one column at a time. ROLLUP of <i>n</i> columns produces "
        "<i>n</i> + 1 grouping sets. In the extra (super-aggregate) rows, the column that has "
        "been \"rolled up\" is shown as NULL. ROLLUP is used when the columns form a "
        "hierarchy, e.g. Department &rarr; Course, or Year &rarr; Month &rarr; Day."),
      P("3.4 CUBE", h2),
      P("<font face='Courier'>GROUP BY CUBE (a, b)</font> produces totals for <b>every "
        "possible combination</b> of the listed columns. CUBE of <i>n</i> columns produces "
        "2<super>n</super> grouping sets. It is used for cross-tabulation (multi-dimensional "
        "analysis) when the columns are independent of each other, e.g. Department and "
        "Gender."),
      grid([["Clause", "Equivalent GROUPING SETS", "Rows generated for"],
            ["GROUP BY a, b", "((a, b))", "each (a, b) pair only"],
            ["GROUP BY ROLLUP (a, b)", "((a, b), (a), ())",
             "each (a, b) pair + sub-total of each a + grand total"],
            ["GROUP BY CUBE (a, b)", "((a, b), (a), (b), ())",
             "each (a, b) pair + total of each a + total of each b + grand total"]],
           [4.3 * cm, 4.6 * cm, TEXT_W - 8.9 * cm]),
      Spacer(1, 8),
      P("3.5 GROUPING() function", h2),
      P("Because super-aggregate rows show NULL in the rolled-up column, it can be confused "
        "with a real NULL in the data. <font face='Courier'>GROUPING(column)</font> returns "
        "<b>1</b> when the column has been aggregated away in that row (sub-total / total "
        "row) and <b>0</b> when it is a normal group value. It is used with CASE to print "
        "meaningful labels such as 'Dept Subtotal' or 'GRAND TOTAL', and in ORDER BY to "
        "place total rows after the detail rows.")]

# 4. Aggregate functions
s += [P("4. Aggregate Functions Explanation", h1),
      grid([["Function", "Purpose", "NULL handling", "Example (college_db)"],
            ["COUNT(*)", "Counts all rows in the group", "Counts rows even if columns are NULL",
             "COUNT(*) FROM student"],
            ["COUNT(col)", "Counts non-NULL values of a column", "Ignores NULLs",
             "COUNT(marks) FROM enrollment"],
            ["COUNT(DISTINCT col)", "Counts distinct non-NULL values", "Ignores NULLs",
             "COUNT(DISTINCT course_id)"],
            ["SUM(col)", "Adds all values (numeric columns)", "Ignores NULLs",
             "SUM(salary) FROM faculty"],
            ["AVG(col)", "Arithmetic mean = SUM / COUNT(col)",
             "Ignores NULLs (not counted in the divisor)", "AVG(marks) FROM enrollment"],
            ["MIN(col)", "Smallest value (numbers, dates, text)", "Ignores NULLs",
             "MIN(marks), MIN(date_of_birth)"],
            ["MAX(col)", "Largest value (numbers, dates, text)", "Ignores NULLs",
             "MAX(marks), MAX(salary)"]],
           [3.3 * cm, 4.6 * cm, 4.2 * cm, TEXT_W - 12.1 * cm]),
      Spacer(1, 6),
      P("On an empty input, COUNT returns 0 while SUM, AVG, MIN and MAX return NULL. "
        "ROUND(value, 2) is used with AVG() in this practical because AVG on a NUMERIC "
        "column returns many decimal places.")]

# 5. SQL Queries (database + environment first)
s += [PageBreak(), P("5. SQL Queries", h1), P("5.1 Database and Environment", h2),
      P("The same College Management System database <b>college_db</b> used in P1&ndash;P4 is "
        "used here. It contains five related tables:"),
      grid([["Table", "Columns (PK underlined)", "Rows"],
            ["department", "<u>department_id</u>, department_name, hod_name, building", "5"],
            ["faculty", "<u>faculty_id</u>, faculty_name, email, designation, salary, "
             "department_id (FK)", "8"],
            ["student", "<u>student_id</u>, first_name, last_name, email, gender, "
             "date_of_birth, year_of_study, department_id (FK)", "15"],
            ["course", "<u>course_id</u>, course_code, course_name, credits, "
             "department_id (FK), faculty_id (FK)", "8"],
            ["enrollment", "<u>enrollment_id</u>, student_id (FK), course_id (FK), "
             "enrollment_date, marks", "29"]],
           [2.6 * cm, TEXT_W - 4.0 * cm, 1.4 * cm]),
      Spacer(1, 6),
      P("Two details of the data are useful for this practical: the <b>Civil</b> department "
        "has no students yet, and one enrollment (Arjun Malhotra in Machine Learning) has "
        "<b>marks = NULL</b> because the result is awaited. These show how aggregates handle "
        "empty groups and NULL values."),
      P("<b>Environment:</b> PostgreSQL 17.11 server, queries typed in the <b>psql</b> "
        "command-line client connected to college_db. All screenshots below were captured "
        "from this live psql session. The complete scripts are 01_college_db_setup.sql "
        "(tables and sample data) and 02_p5_aggregate_queries.sql (the queries below).")]

GROUPS = []


def section(heading, qnums, shots, explanations, pre=None, new_page=True):
    GROUPS.append(dict(heading=heading.split(" ", 1)[1], qnums=qnums, shots=shots,
                       explanations=explanations, pre=pre))


section("6.1 COUNT(), SUM() and AVG()  (Queries 1 &ndash; 4)", [1, 2, 3, 4],
        [("ss1", "Screenshot 1: COUNT, SUM and AVG results (psql, PostgreSQL 17.11)")],
        ["<b>Q1</b> &ndash; COUNT(*) counts every row of the student table: <b>15</b> students.",
         "<b>Q2</b> &ndash; COUNT(*) returns <b>29</b> enrollments, but COUNT(marks) returns "
         "<b>28</b> because COUNT(column) skips the one enrollment whose marks are NULL.",
         "<b>Q3</b> &ndash; SUM(salary) adds the salaries of all 8 faculty members: "
         "<b>835000.00</b>.",
         "<b>Q4</b> &ndash; AVG(marks) = 75.54. The NULL mark is ignored, so the average is "
         "taken over the 28 graded enrollments (SUM / 28, not SUM / 29). ROUND(&hellip;, 2) "
         "keeps two decimal places."], new_page=False)

section("6.2 MIN() and MAX()  (Queries 5 &ndash; 8)", [5, 6, 7, 8],
        [("ss2", "Screenshot 2: MIN and MAX results (psql, PostgreSQL 17.11)")],
        ["<b>Q5 / Q6</b> &ndash; The highest mark in any course is <b>94.00</b> and the "
         "lowest is <b>55.00</b>.",
         "<b>Q7</b> &ndash; Several aggregates can be used in one SELECT and combined in "
         "expressions: salaries range from 68000.00 to 130000.00, a gap of 62000.00.",
         "<b>Q8</b> &ndash; MIN and MAX also work on DATE columns. The smallest date of birth "
         "(2005-05-29) belongs to the oldest student and the largest (2006-12-01) to the "
         "youngest."])

section("6.3 GROUP BY  (Queries 9 &ndash; 10)", [9, 10],
        [("ss3a", "Screenshot 3(a): Department-wise student count using GROUP BY"),
         ("ss3b", "Screenshot 3(b): Course-wise average, highest and lowest marks using "
                  "GROUP BY")],
        ["<b>Q9</b> &ndash; Students are grouped by department and counted. A LEFT JOIN is "
         "used so that the Civil department, which has no students, still appears. "
         "COUNT(s.student_id) is used instead of COUNT(*) so that Civil shows <b>0</b>; "
         "COUNT(*) would wrongly show 1 because the LEFT JOIN creates one row with NULL "
         "student columns.",
         "<b>Q10</b> &ndash; Enrollment rows are grouped by course and five aggregates are "
         "computed per group. Machine Learning has the best average (83.38) and shows "
         "students_graded = 4 because the NULL mark is not counted. Structural Analysis has "
         "the lowest average (64.75)."])

section("6.4 HAVING  (Queries 11 &ndash; 12)", [11, 12],
        [("ss4", "Screenshot 4: Filtering groups using HAVING")],
        ["<b>Q11</b> &ndash; After grouping by course, HAVING AVG(e.marks) &gt; 75 keeps only "
         "the courses whose average is above 75. Out of 8 courses, 3 qualify: Machine "
         "Learning (83.38), Database Management (80.75) and Data Structures (80.75).",
         "<b>Q12</b> &ndash; Shows WHERE and HAVING together. WHERE year_of_study = 2 first "
         "removes third-year students, GROUP BY counts the remaining students per department "
         "and HAVING COUNT(*) &gt;= 3 keeps only departments with at least three second-year "
         "students: AI and Machine Learning (4) and Computer Science (3).",
         "An aggregate cannot be written in WHERE &ndash; PostgreSQL rejects it with "
         "<i>ERROR: aggregate functions are not allowed in WHERE</i>; such conditions belong "
         "in HAVING."])

section("6.5 ROLLUP  (Queries 13 &ndash; 14)", [13, 14],
        [("ss5a", "Screenshot 5(a): GROUP BY ROLLUP with super-aggregate rows shown as "
                  "(null)"),
         ("ss5b", "Screenshot 5(b): GROUP BY ROLLUP with sub-total and grand-total rows "
                  "labelled using GROUPING()")],
        ["<b>\\pset null '(null)'</b> is a psql command that only changes how NULL is "
         "displayed, so that the rows added by ROLLUP are easy to see.",
         "<b>Q13</b> &ndash; ROLLUP (department_name, year_of_study) generates the grouping "
         "sets (department, year), (department) and (). So for each department we get one "
         "row per year, then a department sub-total row where year_of_study is (null) "
         "(e.g. AI and Machine Learning = 5), and finally one grand-total row where both "
         "columns are (null) with <b>15</b> students. 8 detail rows + 4 sub-totals + 1 grand "
         "total = 13 rows.",
         "<b>Q14</b> &ndash; ROLLUP over the hierarchy Department &rarr; Course. GROUPING() "
         "returns 1 for a rolled-up column, and CASE uses it to print '-- Dept Subtotal --' "
         "and '** GRAND TOTAL **' instead of NULL. The ORDER BY on GROUPING() places each "
         "sub-total after its courses and the grand total last.",
         "Sub-total and total averages are calculated from the underlying rows, not by "
         "averaging the course averages: AI and Machine Learning = 81.80 over its 10 graded "
         "enrollments, and the grand total 75.54 equals the overall average from Q4. The "
         "enrollments column counts all 29 enrollments (COUNT(e.enrollment_id)), while "
         "AVG() ignores the one NULL mark."],
        pre="-- Display NULLs visibly so the super-aggregate rows are easy to spot\n"
            "\\pset null '(null)'")

section("6.6 CUBE  (Query 15)", [15],
        [("ss6", "Screenshot 6: GROUP BY CUBE &ndash; department &times; gender totals")],
        ["<b>Q15</b> &ndash; CUBE (department_name, gender) generates 2<super>2</super> = 4 "
         "grouping sets: (department, gender), (department), (gender) and ().",
         "Rows with a real gender value give the count for that department and gender; rows "
         "with gender = 'ALL' are department totals; rows with 'ALL DEPARTMENTS' and F / M are "
         "gender totals across the college (7 female, 8 male); the last row is the grand "
         "total (15).",
         "The (gender) totals &ndash; 'ALL DEPARTMENTS / F' and 'ALL DEPARTMENTS / M' &ndash; "
         "are exactly the rows that ROLLUP would <i>not</i> produce. This is the difference "
         "between CUBE and ROLLUP.",
         "COALESCE replaces the NULL department in the super-aggregate rows with 'ALL "
         "DEPARTMENTS' (safe here because department_name is NOT NULL), and GROUPING() is "
         "used for the gender label. Civil does not appear because the INNER JOIN keeps only "
         "departments that have students."])

# 5.2 the queries, grouped by concept
for i, g in enumerate(GROUPS, 2):
    block = [P("5.%d %s" % (i, g["heading"]), h2)]
    if g["pre"]:
        block += [code_box(g["pre"]), Spacer(1, 5)]
    s.append(KeepTogether(block + [code_box(query(g["qnums"][0])), Spacer(1, 5)]))
    for n in g["qnums"][1:]:
        s += [code_box(query(n)), Spacer(1, 5)]

# 6. Actual output: screenshots captured from the live psql session
s += [PageBreak(), P("6. Actual Output", h1),
      P("The following screenshots were captured from the psql client while executing the "
        "above queries on PostgreSQL 17.11. Each screenshot shows the query exactly as typed "
        "at the <font face='Courier'>college_db=#</font> prompt and the rows returned by the "
        "server."),
      shot("ss0_connection",
           "Screenshot 0: psql connected to college_db &ndash; server version "
           "(PostgreSQL 17.11) and the five tables (\\dt)")]
for g in GROUPS:
    for name, cap in g["shots"]:
        s.append(shot(name, cap))

# 7. Query explanation
s += [PageBreak(), P("7. Query Explanation", h1)]
for i, g in enumerate(GROUPS, 1):
    refs = ", ".join(re.match(r"(Screenshot \S+?):", c).group(1) for _, c in g["shots"])
    s.append(KeepTogether([P("7.%d %s &ndash; %s" % (i, g["heading"], refs), h2)]
                          + bullets(g["explanations"])[:2]))
    s += bullets(g["explanations"])[2:]

# 8. Result
s += [PageBreak(), P("8. Result", h1),
      P("Aggregate and grouping queries were successfully written and executed on the "
        "<b>college_db</b> College Management System database in PostgreSQL 17.11. "
        "COUNT(), SUM(), AVG(), MIN() and MAX() were used to summarise student, faculty and "
        "enrollment data; GROUP BY was used to produce department-wise and course-wise "
        "summaries; HAVING was used to filter groups based on aggregate conditions; and "
        "GROUP BY ROLLUP and GROUP BY CUBE were used to generate sub-totals, cross-totals "
        "and grand totals in a single query, with GROUPING() used to label the "
        "super-aggregate rows. All outputs were verified against the actual results "
        "returned by PostgreSQL.")]

# 9. Viva
s += [P("9. Viva Questions and Answers", h1)]
viva = [
    ("What is an aggregate function?",
     "A function that takes a set of rows as input and returns a single summary value, "
     "e.g. COUNT, SUM, AVG, MIN and MAX."),
    ("What is the difference between COUNT(*), COUNT(column) and COUNT(DISTINCT column)?",
     "COUNT(*) counts all rows including those with NULLs; COUNT(column) counts only the "
     "non-NULL values of that column; COUNT(DISTINCT column) counts unique non-NULL values. "
     "In college_db, COUNT(*) FROM enrollment = 29 but COUNT(marks) = 28."),
    ("How do aggregate functions handle NULL values?",
     "All aggregate functions except COUNT(*) ignore NULLs. AVG(marks) therefore divides by "
     "the number of non-NULL marks (28), not by the number of rows (29)."),
    ("What is the difference between WHERE and HAVING?",
     "WHERE filters individual rows before grouping and cannot use aggregate functions. "
     "HAVING filters groups after GROUP BY and aggregation, so it can use aggregates such as "
     "AVG(marks) &gt; 75."),
    ("Can an aggregate function be used in the WHERE clause?",
     "No. PostgreSQL gives the error \"aggregate functions are not allowed in WHERE\". The "
     "condition must be written in HAVING (or in a subquery)."),
    ("What rule applies to the SELECT list when GROUP BY is used?",
     "Every selected column must either appear in GROUP BY or be inside an aggregate "
     "function. (PostgreSQL also allows columns that are functionally dependent on a grouped "
     "primary key.)"),
    ("Can HAVING be used without GROUP BY?",
     "Yes. The whole table is then treated as one group, e.g. SELECT COUNT(*) FROM student "
     "HAVING COUNT(*) &gt; 10;"),
    ("What is the logical order of execution of a SELECT query with grouping?",
     "FROM/JOIN &rarr; WHERE &rarr; GROUP BY &rarr; aggregates &rarr; HAVING &rarr; SELECT "
     "&rarr; ORDER BY &rarr; LIMIT."),
    ("What does GROUP BY ROLLUP do?",
     "It adds hierarchical sub-totals and a grand total to the normal grouped result. "
     "ROLLUP (a, b) = GROUPING SETS ((a, b), (a), ()); for n columns it creates n + 1 "
     "grouping sets."),
    ("What does GROUP BY CUBE do?",
     "It produces aggregates for every combination of the grouping columns. CUBE (a, b) = "
     "GROUPING SETS ((a, b), (a), (b), ()); for n columns it creates 2<super>n</super> "
     "grouping sets."),
    ("What is the difference between ROLLUP and CUBE?",
     "ROLLUP is hierarchical and depends on column order (sub-totals only from right to "
     "left); CUBE is non-hierarchical and gives totals for all combinations. For two "
     "columns, CUBE gives the extra (b) totals &ndash; e.g. gender totals across all "
     "departments &ndash; which ROLLUP does not."),
    ("What is the GROUPING() function?",
     "GROUPING(column) returns 1 if the column was aggregated away in that row (a sub-total "
     "or total row) and 0 otherwise. It distinguishes the NULL produced by ROLLUP/CUBE from "
     "a real NULL in the data and is used to label total rows."),
    ("What is GROUPING SETS?",
     "A clause that lists exactly which groupings to compute in one query, e.g. GROUP BY "
     "GROUPING SETS ((department_name), (gender), ()). ROLLUP and CUBE are shorthand forms "
     "of GROUPING SETS."),
    ("Why was LEFT JOIN with COUNT(s.student_id) used for the department-wise count?",
     "The LEFT JOIN keeps departments that have no students (Civil). COUNT(s.student_id) "
     "returns 0 for Civil because its student_id is NULL, whereas COUNT(*) would return 1."),
    ("Why is ROUND() used with AVG()?",
     "AVG() on a NUMERIC column returns a value with many decimal places "
     "(e.g. 75.5357142857142857); ROUND(AVG(marks), 2) makes it readable as 75.54."),
]
for i, (q, a) in enumerate(viva, 1):
    s.append(KeepTogether([P("<b>Q%d. %s</b>" % (i, q), ParagraphStyle(
        "vq", parent=body, spaceAfter=1, spaceBefore=3)), P("<b>Ans:</b> " + a)]))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                        topMargin=1.9 * cm, bottomMargin=1.9 * cm,
                        title="DBMS Lab Practical P5 - Aggregate and Grouping Queries",
                        author="Sagar Kumar (SOE25BTAM29)",
                        subject="U25AMILPC307 DBMS Lab")
doc.build(s, onFirstPage=on_page, onLaterPages=on_page)
print("wrote", OUT)

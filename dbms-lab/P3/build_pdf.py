"""Builds P3_DBMS_Lab_Sagar_Kumar_SOE25BTAM29.pdf from the SQL script and the
real psql screenshots in ./screenshots (captured from an actual PostgreSQL 17 session)."""
import os, re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
                                TableStyle, Image, PageBreak, KeepTogether, Preformatted, CondPageBreak)

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(HERE, "screenshots")
OUT = os.path.join(HERE, "P3_DBMS_Lab_Sagar_Kumar_SOE25BTAM29.pdf")

F = "/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("Serif", F + "LiberationSerif-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Serif-Bold", F + "LiberationSerif-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Serif-Italic", F + "LiberationSerif-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Serif-BoldItalic", F + "LiberationSerif-BoldItalic.ttf"))
pdfmetrics.registerFont(TTFont("Mono", F + "LiberationMono-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Mono-Bold", F + "LiberationMono-Bold.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("Serif", normal="Serif", bold="Serif-Bold", italic="Serif-Italic", boldItalic="Serif-BoldItalic")
registerFontFamily("Mono", normal="Mono", bold="Mono-Bold", italic="Mono", boldItalic="Mono-Bold")

ST = {
    "body": ParagraphStyle("body", fontName="Serif", fontSize=11.5, leading=16, alignment=TA_JUSTIFY, spaceAfter=6),
    "bullet": ParagraphStyle("bullet", fontName="Serif", fontSize=11.5, leading=15.5, leftIndent=18, bulletIndent=6, spaceAfter=3),
    "h1": ParagraphStyle("h1", fontName="Serif-Bold", fontSize=14.5, leading=19, spaceBefore=12, spaceAfter=6, textColor=colors.black, keepWithNext=1),
    "h2": ParagraphStyle("h2", fontName="Serif-Bold", fontSize=12.5, leading=16, spaceBefore=9, spaceAfter=4, keepWithNext=1),
    "cap": ParagraphStyle("cap", fontName="Serif-Italic", fontSize=10.5, leading=13, alignment=TA_CENTER, spaceBefore=4, spaceAfter=12),
    "code": ParagraphStyle("code", fontName="Mono", fontSize=7.4, leading=9.8),
    "cell": ParagraphStyle("cell", fontName="Serif", fontSize=10.5, leading=13),
    "cellb": ParagraphStyle("cellb", fontName="Serif-Bold", fontSize=10.5, leading=13),
    "cellm": ParagraphStyle("cellm", fontName="Mono", fontSize=9, leading=12),
    "q": ParagraphStyle("q", fontName="Serif-Bold", fontSize=11.5, leading=15.5, spaceBefore=7, spaceAfter=2),
}
TEXT_W = A4[0] - 4.2 * cm


def P(t, s="body"): return Paragraph(t, ST[s])
def H1(t): return P(t, "h1")
def H2(t): return P(t, "h2")
def bullets(items): return [Paragraph(i, ST["bullet"], bulletText="•") for i in items]


def wrap_sql(line, limit=100):
    """Break an over-long one-line query before a clause keyword (layout only)."""
    out = []
    while len(line) > limit:
        cut = max(line.rfind(k, 0, limit) for k in (" FROM ", " WHERE ", " AND ", " ORDER BY ", " LIMIT "))
        if cut <= 4:
            break
        out.append(line[:cut])
        line = "    " + line[cut + 1:]
    return out + [line]


def code(text):
    text = "\n".join(l for ln in text.strip("\n").split("\n") for l in wrap_sql(ln))
    pre = Preformatted(text, ST["code"])
    t = Table([[pre]], colWidths=[TEXT_W])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3F3F3")),
                           ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#9A9A9A")),
                           ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                           ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    return t


def grid(rows, widths, header=True, mono_cols=()):
    data = []
    for r_i, r in enumerate(rows):
        row = []
        for c_i, c in enumerate(r):
            st = "cellb" if (header and r_i == 0) else ("cellm" if c_i in mono_cols else "cell")
            row.append(Paragraph(str(c), ST[st]))
        data.append(row)
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    sty = [("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#6E6E6E")),
           ("VALIGN", (0, 0), (-1, -1), "TOP"),
           ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]
    if header:
        sty.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E4E4E4")))
    t.setStyle(TableStyle(sty))
    return t


FIG = [0]


def shot(name, caption):
    FIG[0] += 1
    path = os.path.join(SHOTS, name + ".png")
    from PIL import Image as PI
    w, h = PI.open(path).size
    dw = TEXT_W
    dh = dw * h / w
    img = Image(path, width=dw, height=dh)
    framed = Table([[img]], colWidths=[dw + 2])
    framed.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#555555")),
                                ("LEFTPADDING", (0, 0), (-1, -1), 1), ("RIGHTPADDING", (0, 0), (-1, -1), 1),
                                ("TOPPADDING", (0, 0), (-1, -1), 1), ("BOTTOMPADDING", (0, 0), (-1, -1), 1)]))
    return KeepTogether([framed, P(f"Screenshot {FIG[0]}: {caption}", "cap")])


# ---------------------------------------------------------------- SQL chunks
def sql_chunks():
    chunks, cur = [], None
    for line in open(os.path.join(HERE, "sql", "P3_dml_operations.sql")):
        m = re.match(r"-- @shot (\w+) \| (.*)", line)
        if m:
            cur = [m.group(1), m.group(2).strip(), []]
            chunks.append(cur)
        elif cur is not None:
            cur[2].append(line.rstrip("\n"))
    return {c[0]: (c[1], "\n".join(c[2]).strip()) for c in chunks}


SQL = sql_chunks()
SCHEMA = open(os.path.join(HERE, "sql", "00_schema_from_P1_P2.sql")).read()
SCHEMA = SCHEMA[SCHEMA.index("CREATE TABLE department"):]


# ---------------------------------------------------------------- page decor
def decorate(c, doc):
    c.saveState()
    w, h = A4
    if doc.page > 1:
        c.setFont("Serif", 9.5)
        c.setFillColor(colors.HexColor("#333333"))
        c.drawString(2.1 * cm, h - 1.35 * cm, "U25AMILPC307 – DBMS Lab  |  Practical P3")
        c.drawRightString(w - 2.1 * cm, h - 1.35 * cm, "Sagar Kumar  |  PRN: SOE25BTAM29")
        c.setStrokeColor(colors.HexColor("#888888")); c.setLineWidth(0.5)
        c.line(2.1 * cm, h - 1.5 * cm, w - 2.1 * cm, h - 1.5 * cm)
        c.line(2.1 * cm, 1.5 * cm, w - 2.1 * cm, 1.5 * cm)
        c.drawCentredString(w / 2, 1.0 * cm, f"Page {doc.page}")
    c.restoreState()


def cover():
    s = []
    big = ParagraphStyle("big", fontName="Serif-Bold", fontSize=22, leading=28, alignment=TA_CENTER)
    mid = ParagraphStyle("mid", fontName="Serif-Bold", fontSize=15, leading=20, alignment=TA_CENTER)
    sm = ParagraphStyle("sm", fontName="Serif", fontSize=12.5, leading=18, alignment=TA_CENTER)
    s += [Spacer(1, 2.2 * cm), Paragraph("Bachelor of Technology", mid), Spacer(1, 4),
          Paragraph("Second Year – Semester III", sm), Spacer(1, 1.3 * cm),
          Paragraph("DBMS Lab", big), Paragraph("Course Code: U25AMILPC307", sm), Spacer(1, 1.2 * cm),
          Paragraph("PRACTICAL P3", mid), Spacer(1, 8),
          Paragraph("DML Operations and Data Retrieval – INSERT, UPDATE, DELETE,<br/>"
                    "and Filtering using WHERE, ORDER BY and LIMIT", ParagraphStyle(
                        "t", fontName="Serif-Bold", fontSize=14, leading=20, alignment=TA_CENTER)),
          Spacer(1, 6),
          Paragraph("Database: <i>college_db</i> (College Management System) &nbsp;|&nbsp; PostgreSQL 17", sm),
          Spacer(1, 1.6 * cm)]
    rows = [["Name of Student", "Sagar Kumar"], ["PRN", "SOE25BTAM29"], ["Section", "A"],
            ["Program", "Bachelor of Technology"], ["Year / Semester", "2 / III"],
            ["Course Code", "U25AMILPC307"], ["Course Title", "DBMS Lab"], ["Practical No.", "P3"],
            ["Date of Performance", ""], ["Date of Submission", ""]]
    t = Table([[Paragraph(a, ST["cellb"]), Paragraph(b, ST["cell"])] for a, b in rows],
              colWidths=[5.2 * cm, 8.3 * cm], rowHeights=[0.78 * cm] * len(rows))
    t.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.6, colors.black),
                           ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                           ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EFEFEF"))]))
    s += [t, Spacer(1, 2.4 * cm)]
    sig = Table([[Paragraph("____________________<br/>Signature of Student", ParagraphStyle("a", parent=sm, fontSize=11)),
                  Paragraph("____________________<br/>Signature of Faculty", ParagraphStyle("b", parent=sm, fontSize=11))]],
                colWidths=[TEXT_W / 2] * 2)
    s += [sig, PageBreak()]
    return s


def body():
    s = []
    # 1 AIM
    s += [H1("1. Aim"),
          P("To perform Data Manipulation Language (DML) operations – <b>INSERT</b>, <b>UPDATE</b> and "
            "<b>DELETE</b> – on the College Management System database <i>college_db</i> created in "
            "Practicals P1 and P2, and to retrieve data using <b>SELECT</b> with filtering and sorting through the "
            "<b>WHERE</b>, <b>ORDER BY</b> and <b>LIMIT</b> clauses in PostgreSQL 17.")]
    # 2 OBJECTIVE
    s += [H1("2. Objective")] + bullets([
        "To populate the tables <i>department, faculty, student, course</i> and <i>enrollment</i> with meaningful sample data using single and multi-row <b>INSERT INTO</b> statements.",
        "To display complete table contents using <b>SELECT *</b> and selected columns using a column list.",
        "To filter rows with the <b>WHERE</b> clause using comparison (=, &lt;&gt;, &gt;=), logical (AND), range (BETWEEN) and pattern (LIKE) operators.",
        "To sort result sets with <b>ORDER BY</b> in ascending and descending order and on multiple columns.",
        "To restrict the number of rows returned using <b>LIMIT</b> and <b>OFFSET</b> (Top-N queries and paging).",
        "To modify existing records with <b>UPDATE</b> and remove records with <b>DELETE</b>, and verify every change with a SELECT.",
        "To observe how the FOREIGN KEY constraints defined in P2 protect referential integrity during DELETE.",
    ])
    # 3 THEORY
    s += [H1("3. Theory"),
          H2("3.1 Data Manipulation Language (DML)"),
          P("SQL commands are grouped into DDL (CREATE, ALTER, DROP), DML (INSERT, UPDATE, DELETE), DQL (SELECT), "
            "DCL (GRANT, REVOKE) and TCL (COMMIT, ROLLBACK). DDL defines the <i>structure</i> of the database, "
            "which was done in P1 and P2. DML works on the <i>data</i> stored inside that structure – it adds, "
            "changes and removes rows without altering the table definition. SELECT is often grouped with DML "
            "because it is the statement used to read the data that DML writes."),
          H2("3.2 INSERT INTO"),
          P("INSERT adds new rows to a table. Listing the column names is good practice because the statement "
            "then does not depend on the physical order of columns. PostgreSQL allows several rows in one "
            "statement; the whole statement succeeds or fails as one unit. Every value is checked against the "
            "column's data type and the PRIMARY KEY, UNIQUE, NOT NULL, CHECK and FOREIGN KEY constraints. "
            "On success psql prints <font name='Mono'>INSERT 0 n</font>, where n is the number of rows inserted "
            "(the 0 is a legacy OID field)."),
          code("INSERT INTO table_name (col1, col2, ...) VALUES (v1, v2, ...), (v1, v2, ...);"),
          H2("3.3 SELECT and the WHERE clause"),
          P("SELECT retrieves rows. <font name='Mono'>SELECT *</font> returns all columns; a column list returns "
            "only the required columns (projection). The WHERE clause keeps only the rows for which the condition "
            "is TRUE (selection)."),
          grid([["Operator type", "Operators", "Example used in this practical"],
                ["Comparison", "=, &lt;&gt;, &lt;, &gt;, &lt;=, &gt;=", "WHERE marks &gt;= 85"],
                ["Logical", "AND, OR, NOT", "WHERE city = 'Pune' AND gender = 'F'"],
                ["Range (inclusive)", "BETWEEN a AND b", "WHERE marks BETWEEN 60 AND 75"],
                ["Pattern", "LIKE / ILIKE with % and _", "WHERE course_name LIKE '%Systems'"],
                ["Set membership", "IN (...)", "WHERE dept_id IN (101, 102)"],
                ["Null test", "IS NULL / IS NOT NULL", "WHERE grade IS NULL"]],
               [3.3 * cm, 4.6 * cm, TEXT_W - 7.9 * cm], mono_cols=(1, 2)),
          Spacer(1, 6),
          code("SELECT col1, col2 FROM table_name WHERE condition;"),
          H2("3.4 ORDER BY"),
          P("Rows in a relational table have no guaranteed order, so ORDER BY is the only way to get a "
            "predictable sequence. ASC (default) sorts ascending and DESC sorts descending. When more than one "
            "column is given, the second column decides the order only among rows that have equal values in "
            "the first. In PostgreSQL NULLs sort last in ASC and first in DESC unless NULLS FIRST/LAST is written."),
          code("SELECT ... FROM table_name ORDER BY col1 ASC, col2 DESC;"),
          H2("3.5 LIMIT and OFFSET"),
          P("LIMIT n returns at most n rows; OFFSET m skips the first m rows. They are applied after ORDER BY, "
            "so LIMIT must be combined with ORDER BY to obtain meaningful results such as “top 3 marks”. "
            "LIMIT/OFFSET together are used for paging (page k of size n uses OFFSET (k−1)×n)."),
          code("SELECT ... FROM table_name ORDER BY col DESC LIMIT n OFFSET m;"),
          H2("3.6 UPDATE"),
          P("UPDATE changes column values of existing rows. The SET list may contain constants or expressions "
            "based on the current value (for example <font name='Mono'>marks = marks + 3</font>). Only the rows "
            "matching the WHERE clause are changed; <b>without WHERE every row in the table is updated</b>. psql "
            "reports <font name='Mono'>UPDATE n</font> with the number of rows affected."),
          code("UPDATE table_name SET col1 = value1, col2 = expr WHERE condition;"),
          H2("3.7 DELETE"),
          P("DELETE removes rows that satisfy the WHERE condition; without WHERE it removes all rows but keeps the "
            "table structure. If a row is still referenced by a FOREIGN KEY in another table, PostgreSQL rejects "
            "the delete (default ON DELETE NO ACTION) so that no orphan child rows are left. psql reports "
            "<font name='Mono'>DELETE n</font>."),
          code("DELETE FROM table_name WHERE condition;"),
          P("In psql every statement runs in <i>autocommit</i> mode, so each successful DML statement is "
            "committed immediately; wrapping statements in BEGIN … COMMIT/ROLLBACK makes them a single transaction."),
          ]
    # 4 DATABASE DESCRIPTION
    s += [H1("4. Database Description"),
          P("The practical uses the same <b>College Management System</b> database, <b>college_db</b>, designed in "
            "P1 and P2. It contains five related tables. A department has many faculty members, students and "
            "courses; each course is taught by one faculty member; and the <i>enrollment</i> table resolves the "
            "many-to-many relationship between <i>student</i> and <i>course</i>, storing the marks and grade "
            "obtained."),
          grid([["Table", "Primary key", "Foreign keys", "Purpose"],
                ["department", "dept_id", "–", "Academic departments"],
                ["faculty", "faculty_id", "dept_id → department", "Teaching staff"],
                ["student", "student_id", "dept_id → department", "Registered students (PRN is UNIQUE)"],
                ["course", "course_code", "dept_id → department, faculty_id → faculty", "Courses offered in Semester III"],
                ["enrollment", "enrollment_id", "student_id → student, course_code → course", "Student–course registrations with marks and grade"]],
               [2.5 * cm, 2.8 * cm, 5.6 * cm, TEXT_W - 10.9 * cm]),
          Spacer(1, 8),
          P("<b>Grading scheme used for the <i>grade</i> column:</b> O (90–100), A+ (80–89), A (70–79), "
            "B+ (60–69), B (50–59), C (40–49), F (below 40)."),
          Paragraph("<b>Table structure (as created in P1/P2):</b>", ParagraphStyle("lbl", parent=ST["body"], keepWithNext=1)),
          code(SCHEMA),
          Spacer(1, 6),
          ]
    # 5 SQL QUERIES
    s += [PageBreak(), H1("5. SQL Queries"),
          P("The queries below were executed in the order shown, in one psql session connected to "
            "<i>college_db</i>. Each group corresponds to one screenshot in Section 7.")]
    titles = {
        "ss01": "5.1 Connect to the database and verify the tables from P1/P2",
        "ss02": "5.2 INSERT – department, faculty, student",
        "ss03": "5.3 INSERT – course, enrollment",
        "ss04": "5.4 SELECT * – department, faculty, student",
        "ss05": "5.5 SELECT * – course, enrollment",
        "ss06": "5.6 SELECT with WHERE",
        "ss07": "5.7 SELECT with ORDER BY",
        "ss08": "5.8 SELECT with LIMIT / OFFSET",
        "ss09": "5.9 UPDATE – re-evaluation of marks (with verification)",
        "ss10": "5.10 UPDATE – expression-based update and text column update (with verification)",
        "ss11": "5.11 DELETE – withdrawal from a course (with verification)",
        "ss12": "5.12 DELETE on a referenced row, and final state of enrollment",
    }
    notes = {
        "ss01": "Shell command used to start the session: <font name='Mono'>psql -U postgres -d college_db</font>",
        "ss09": "Neha Joshi's DBMS (CS202) answer sheet was re-evaluated: marks 68 → 72, grade B+ → A.",
        "ss10": "Grace of 3 marks to students scoring below 50 in Data Structures (CS201); Rahul Sharma changed his city to Mumbai.",
        "ss11": "Aman Verma withdrew from Operating Systems (CS203).",
        "ss12": "Attempt to delete Aman Verma from <i>student</i> while he still has an enrollment row.",
    }
    for k, (cap, sql) in SQL.items():
        blk = [H2(titles[k])]
        if k in notes:
            blk.append(P(notes[k]))
        blk.append(code(sql))
        s.append(KeepTogether(blk))
    # 6 EXECUTION
    s += [H1("6. Execution"),
          grid([["Item", "Details"],
                ["DBMS", "PostgreSQL 17.10 (server)"],
                ["Client", "psql 17.10 – PostgreSQL interactive terminal (Linux, x86_64)"],
                ["Database", "college_db (schema from P1/P2, tables initially empty)"],
                ["Mode", "Interactive psql session, autocommit ON, pager OFF"]],
               [3.2 * cm, TEXT_W - 3.2 * cm]),
          Spacer(1, 8),
          P("<b>Procedure:</b>")] + [
        Paragraph(t, ST["bullet"], bulletText=f"{i}.") for i, t in enumerate([
            "Started the PostgreSQL 17 server and opened a terminal.",
            "Connected to the database with <font name='Mono'>psql -U postgres -d college_db</font> and confirmed the server version and the five tables using <font name='Mono'>SELECT version();</font> and <font name='Mono'>\\dt</font>.",
            "Typed the INSERT statements for the parent tables first (department, faculty, student) and then for the child tables (course, enrollment), so that every FOREIGN KEY value already existed.",
            "Displayed all tables using SELECT * to verify the inserted data.",
            "Executed the WHERE, ORDER BY and LIMIT/OFFSET queries.",
            "Executed the UPDATE statements, each followed by a SELECT to verify the change.",
            "Executed the DELETE statements, each followed by a SELECT to verify the change, and displayed the final enrollment table.",
            "Captured a screenshot of the terminal after each group of statements (Section 7) and exited psql with <font name='Mono'>\\q</font>.",
        ], 1)]
    # 7 OUTPUT
    s += [PageBreak(), H1("7. Output"),
          P("The following screenshots were taken from the psql terminal while the queries of Section 5 were "
            "being executed. They are shown in execution order and have not been edited apart from cropping "
            "the empty part of the terminal window.")]
    for k, (cap, _) in SQL.items():
        s.append(shot(k, cap))
    # 8 EXPLANATION
    s += [H1("8. Explanation of Results")]
    expl = [
        ("Connection (Screenshot 1)",
         "<font name='Mono'>SELECT version()</font> confirms PostgreSQL 17.10, and <font name='Mono'>\\dt</font> lists exactly the five tables of P1/P2 – course, department, enrollment, faculty and student – so the practical runs on the same database."),
        ("INSERT (Screenshots 2–3)",
         "psql replied <font name='Mono'>INSERT 0 3</font> (department), <font name='Mono'>INSERT 0 3</font> (faculty), <font name='Mono'>INSERT 0 5</font> (student), <font name='Mono'>INSERT 0 4</font> (course) and <font name='Mono'>INSERT 0 12</font> (enrollment): 27 rows in total, with no constraint violation. Inserting the parent tables before the child tables satisfied all FOREIGN KEY constraints."),
        ("SELECT * (Screenshots 4–5)",
         "Each table returned exactly the rows inserted – 3, 3, 5, 4 and 12 rows. NUMERIC(5,2) values such as 86 are displayed as 86.00, and dates are shown in ISO format (YYYY-MM-DD)."),
        ("WHERE (Screenshot 6)",
         "<font name='Mono'>dept_id = 102</font> returned the two Artificial Intelligence students, Sagar Kumar and Priya Singh. <font name='Mono'>marks &gt;= 85</font> returned 4 enrollments (86, 91, 94, 88). <font name='Mono'>LIKE '%Systems'</font> matched only course names ending in “Systems”: Database Management Systems and Operating Systems. <font name='Mono'>BETWEEN 60 AND 75 AND course_code &lt;&gt; 'CS202'</font> returned 2 rows (65.00 and 62.00); the CS202 marks 72 and 68 were excluded by the second condition. The AND condition on city and gender returned only Neha Joshi."),
        ("ORDER BY (Screenshot 7)",
         "Names were sorted alphabetically from Aman Verma to Sagar Kumar. The DBMS (CS202) marks were listed in descending order 94, 86, 72, 68, giving a rank list. In the two-column sort, students were grouped by dept_id 101, 102, 103 and, inside each department, the younger student (later date of birth) appears first because of <font name='Mono'>dob DESC</font>."),
        ("LIMIT / OFFSET (Screenshot 8)",
         "<font name='Mono'>LIMIT 3</font> after sorting by marks DESC gave the top three scores (94, 91, 88). <font name='Mono'>LIMIT 3 OFFSET 3</font> skipped those and returned the next three (86, 81, 78) – the second “page”. <font name='Mono'>ORDER BY dob ASC LIMIT 1</font> returned the oldest student, Aman Verma (2005-12-19)."),
        ("UPDATE (Screenshots 9–10)",
         "Each UPDATE reported <font name='Mono'>UPDATE 1</font>, i.e. exactly one row matched the WHERE clause. The verification SELECTs show Neha Joshi's CS202 row changed from 68.00/B+ to 72.00/A; Aman Verma's CS201 marks increased by the expression <font name='Mono'>marks + 3</font> from 47 to 50.00 with grade B, while the other CS201 rows (78.00 and 65.00, not below 50) were unchanged; and Rahul Sharma's city changed from Nashik to Mumbai."),
        ("DELETE (Screenshots 11–12)",
         "Before the delete Aman Verma (student_id 4) had two enrollments; <font name='Mono'>DELETE 1</font> removed the CS203 row and the verification SELECT shows only CS201 remaining. The total number of enrollments fell from 12 to 11. The attempt to delete student 4 from the <i>student</i> table failed with a foreign key violation on <font name='Mono'>enrollment_student_id_fkey</font>, because enrollment 9 still references that student – PostgreSQL protected referential integrity and no data was lost. The final enrollment listing shows all 11 rows with the updated values (rows 9 and 11) and without row 10."),
    ]
    for h, t in expl:
        s += [P(f"<b>{h}:</b> {t}")]
    # 9 RESULT
    s += [H1("9. Result"),
          P("DML operations INSERT, UPDATE and DELETE were successfully performed on the College Management "
            "System database <i>college_db</i> in PostgreSQL 17. Data was retrieved using SELECT, filtered with "
            "WHERE (comparison, logical, BETWEEN and LIKE operators), sorted with ORDER BY and restricted with "
            "LIMIT/OFFSET. Every modification was verified with a SELECT statement, and the FOREIGN KEY "
            "constraints from P2 were observed to prevent deletion of a referenced student record.")]
    # 10 VIVA
    s += [H1("10. Viva Questions and Answers")]
    qa = [
        ("What is DML? Name its commands.",
         "Data Manipulation Language is the part of SQL used to manage data inside tables. Its commands are INSERT, UPDATE and DELETE (and MERGE); SELECT is used to query the data."),
        ("What is the difference between DELETE, TRUNCATE and DROP?",
         "DELETE is DML; it removes selected rows using WHERE and fires row-level triggers. TRUNCATE is DDL; it removes all rows quickly without scanning them and cannot use WHERE. DROP removes the table itself, including its structure, data and constraints."),
        ("What happens if the WHERE clause is omitted in UPDATE or DELETE?",
         "The operation is applied to every row of the table – all rows are updated or all rows are deleted. Running the WHERE condition as a SELECT first is a safe habit."),
        ("Why is ORDER BY necessary when LIMIT is used?",
         "Without ORDER BY the order of rows is not guaranteed, so LIMIT would return an arbitrary set of rows. With ORDER BY the result is deterministic, e.g. the top three marks."),
        ("What does OFFSET do?",
         "OFFSET m skips the first m rows of the sorted result. LIMIT 3 OFFSET 3 returns rows 4 to 6 and is used for paging."),
        ("Is BETWEEN inclusive?",
         "Yes. <font name='Mono'>marks BETWEEN 60 AND 75</font> is equivalent to <font name='Mono'>marks &gt;= 60 AND marks &lt;= 75</font>."),
        ("Explain the wildcards used with LIKE.",
         "% matches any sequence of zero or more characters and _ matches exactly one character. LIKE is case-sensitive in PostgreSQL; ILIKE performs a case-insensitive match."),
        ("What is the meaning of “INSERT 0 12” in psql?",
         "It is the command tag returned by the server: 0 is the OID field (always 0 for tables without OIDs) and 12 is the number of rows inserted."),
        ("Why did DELETE FROM student WHERE student_id = 4 fail?",
         "The enrollment table has a FOREIGN KEY on student_id referencing student. Enrollment 9 still referred to student 4, so deleting the parent would create an orphan row; PostgreSQL rejected it. It could succeed only if the child rows were deleted first or the key was defined with ON DELETE CASCADE."),
        ("What is the difference between WHERE and HAVING?",
         "WHERE filters individual rows before grouping; HAVING filters groups after GROUP BY and can use aggregate functions such as COUNT or AVG."),
        ("How can a DML change be undone?",
         "By running the statements inside a transaction: BEGIN; … ROLLBACK; In psql's default autocommit mode, each statement is committed immediately and cannot be rolled back afterwards."),
        ("What is the RETURNING clause in PostgreSQL?",
         "INSERT, UPDATE and DELETE can end with RETURNING column_list to return the affected rows, e.g. <font name='Mono'>DELETE FROM enrollment WHERE ... RETURNING *;</font> – useful to see exactly what was changed."),
        ("Why should column names be listed in an INSERT statement?",
         "The statement then does not depend on the column order of the table, columns with defaults can be skipped, and it is easier to read and maintain."),
        ("Can one INSERT statement add many rows?",
         "Yes, by writing several value lists separated by commas after VALUES, as done for all five tables in this practical. The statement is atomic: if any row violates a constraint, none of the rows are inserted."),
    ]
    for i, (q, a) in enumerate(qa, 1):
        s.append(KeepTogether([P(f"Q{i}. {q}", "q"), P(f"<b>Ans:</b> {a}")]))
    return s


def build():
    doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=2.1 * cm, rightMargin=2.1 * cm,
                          topMargin=2.0 * cm, bottomMargin=2.0 * cm,
                          title="DBMS Lab Practical P3 - DML Operations and Data Retrieval",
                          author="Sagar Kumar (SOE25BTAM29)", subject="U25AMILPC307 DBMS Lab")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=decorate)])
    doc.build(cover() + body())
    print("wrote", OUT)


if __name__ == "__main__":
    build()

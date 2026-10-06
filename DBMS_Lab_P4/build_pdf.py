"""Build the DBMS Lab Practical P4 record (PDF) from real execution artefacts.

Inputs (all produced by actually running PostgreSQL 17 / pgAdmin 4):
  sql/queries.json                     - SQL text of every query (single source of truth)
  outputs/Q*.txt, base_tables.txt      - verbatim psql output
  screenshots/Q*.png                   - pgAdmin 4 Query Tool screenshots
  screenshots/verification_report.json - editor-text / grid-vs-psql cross-check
"""
import json
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (CondPageBreak, Image, KeepTogether, PageBreak, Paragraph,
                                Preformatted, SimpleDocTemplate, Spacer, Table, TableStyle)

HERE = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(HERE, *a)

# ----------------------------------------------------------------- fonts
LIB, DJ = '/usr/share/fonts/truetype/liberation/', '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('Serif', LIB + 'LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Serif-Bold', LIB + 'LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Serif-Italic', LIB + 'LiberationSerif-Italic.ttf'))
pdfmetrics.registerFont(TTFont('Serif-BoldItalic', LIB + 'LiberationSerif-BoldItalic.ttf'))
pdfmetrics.registerFontFamily('Serif', normal='Serif', bold='Serif-Bold', italic='Serif-Italic',
                              boldItalic='Serif-BoldItalic')
pdfmetrics.registerFont(TTFont('Sans', LIB + 'LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Sans-Bold', LIB + 'LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Mono', DJ + 'DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('Mono-Bold', DJ + 'DejaVuSansMono-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Sym', DJ + 'DejaVuSans.ttf'))

NAVY = colors.HexColor('#1f3a5f')
INK = colors.HexColor('#222222')
GREY_BG = colors.HexColor('#f4f5f7')
CODE_BG = colors.HexColor('#f7f9fc')
RULE = colors.HexColor('#b8c2cf')
GREEN = colors.HexColor('#1e7b3c')

# ----------------------------------------------------------------- student
STUDENT = [
    ('Name', 'Sagar Kumar'), ('PRN', 'SOE25BTAM29'), ('Section', 'A'),
    ('Program', 'Bachelor of Technology'), ('Year', '2'), ('Semester', 'III'),
    ('Course Code', 'U25AMILPC307'), ('Course Title', 'DBMS Lab'), ('Practical No.', 'P4'),
]
TITLE = 'Multi-Table Join Queries – Implementing INNER, OUTER, SELF, and CROSS JOIN on relational tables'

# ----------------------------------------------------------------- styles
st = {}
st['body'] = ParagraphStyle('body', fontName='Serif', fontSize=11, leading=15.2, textColor=INK,
                            alignment=TA_JUSTIFY, spaceAfter=5)
st['bullet'] = ParagraphStyle('bullet', parent=st['body'], leftIndent=16, bulletIndent=4, spaceAfter=2.5)
st['h1'] = ParagraphStyle('h1', fontName='Serif-Bold', fontSize=15, leading=19, textColor=NAVY,
                          spaceBefore=10, spaceAfter=6)
st['h2'] = ParagraphStyle('h2', fontName='Serif-Bold', fontSize=12.5, leading=16, textColor=NAVY,
                          spaceBefore=9, spaceAfter=4)
st['h3'] = ParagraphStyle('h3', fontName='Serif-Bold', fontSize=11, leading=14, textColor=INK,
                          spaceBefore=6, spaceAfter=3)
st['small'] = ParagraphStyle('small', parent=st['body'], fontSize=9.5, leading=12.5)
st['caption'] = ParagraphStyle('caption', fontName='Serif-Italic', fontSize=9.5, leading=12,
                               textColor=colors.HexColor('#444444'), alignment=TA_CENTER, spaceBefore=3)
st['cell'] = ParagraphStyle('cell', fontName='Serif', fontSize=10, leading=12.5, textColor=INK)
st['cellb'] = ParagraphStyle('cellb', parent=st['cell'], fontName='Serif-Bold')
st['cellm'] = ParagraphStyle('cellm', parent=st['cell'], fontName='Mono', fontSize=8.6, leading=11)
st['q'] = ParagraphStyle('q', parent=st['body'], fontName='Serif-Bold', spaceBefore=6, spaceAfter=2)
st['a'] = ParagraphStyle('a', parent=st['body'], leftIndent=14)

FRAME_W = A4[0] - 2 * 20 * mm


def para(t, s='body'):
    return Paragraph(t, st[s])


def bullets(items, s='bullet'):
    return [Paragraph(i, st[s], bulletText='•') for i in items]


def boxed(flowable, bg=CODE_BG, border=RULE, pad=6):
    t = Table([[flowable]], colWidths=[FRAME_W])  # flowable may be a list
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), bg), ('BOX', (0, 0), (-1, -1), 0.6, border),
                           ('LEFTPADDING', (0, 0), (-1, -1), pad), ('RIGHTPADDING', (0, 0), (-1, -1), pad),
                           ('TOPPADDING', (0, 0), (-1, -1), pad), ('BOTTOMPADDING', (0, 0), (-1, -1), pad)]))
    return t


def mono_block(text, max_size=8.6, bg=CODE_BG, label=None):
    """Monospace block, font shrunk only as much as needed so the widest line fits."""
    lines = text.rstrip('\n').split('\n')
    width = max(len(l) for l in lines)
    avail = FRAME_W - 14
    size = min(max_size, avail / (max(width, 1) * 0.602))
    style = ParagraphStyle('m', fontName='Mono', fontSize=size, leading=size * 1.32, textColor=INK)
    body = Preformatted(text.rstrip('\n'), style)
    if label:
        lab = Paragraph(label, ParagraphStyle('lab', fontName='Sans-Bold', fontSize=7.5, leading=9,
                                              textColor=colors.HexColor('#5b6b7f')))
        t = Table([[lab], [body]], colWidths=[FRAME_W])
        t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), bg), ('BOX', (0, 0), (-1, -1), 0.6, RULE),
                               ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
                               ('TOPPADDING', (0, 0), (-1, 0), 5), ('BOTTOMPADDING', (0, 0), (-1, 0), 1),
                               ('TOPPADDING', (0, 1), (-1, 1), 2), ('BOTTOMPADDING', (0, 1), (-1, 1), 6)]))
        return t
    return boxed(body, bg=bg)


def grid(data, widths, header=True, mono_cols=(), zebra=True, font=10):
    rows = []
    for r, row in enumerate(data):
        out = []
        for c, v in enumerate(row):
            if r == 0 and header:
                s = ParagraphStyle('hd', parent=st['cellb'], textColor=colors.white, fontSize=font)
            elif c in mono_cols:
                s = st['cellm']
            else:
                s = ParagraphStyle('cl', parent=st['cell'], fontSize=font, leading=font * 1.25)
            out.append(Paragraph(str(v), s))
        rows.append(out)
    t = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    ts = [('GRID', (0, 0), (-1, -1), 0.5, RULE), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
          ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
          ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5)]
    if header:
        ts.append(('BACKGROUND', (0, 0), (-1, 0), NAVY))
    if zebra:
        for r in range(1 if header else 0, len(rows)):
            if r % 2 == 0:
                ts.append(('BACKGROUND', (0, r), (-1, r), GREY_BG))
    t.setStyle(TableStyle(ts))
    return t


# ----------------------------------------------------------------- page decoration
def on_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(NAVY)
    canvas.setLineWidth(0.8)
    canvas.line(20 * mm, h - 14 * mm, w - 20 * mm, h - 14 * mm)
    canvas.setFont('Sans', 8.5)
    canvas.setFillColor(NAVY)
    canvas.drawString(20 * mm, h - 12 * mm, 'DBMS Lab (U25AMILPC307)  |  Practical P4: Multi-Table Join Queries')
    canvas.drawRightString(w - 20 * mm, h - 12 * mm, 'Sagar Kumar  |  PRN: SOE25BTAM29  |  Sec. A')
    canvas.line(20 * mm, 14 * mm, w - 20 * mm, 14 * mm)
    canvas.setFont('Sans', 8.5)
    canvas.drawString(20 * mm, 9.5 * mm, 'B.Tech  |  Year 2  |  Semester III')
    canvas.drawRightString(w - 20 * mm, 9.5 * mm, f'Page {doc.page}')
    canvas.restoreState()


def on_first_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(NAVY)
    canvas.setLineWidth(2.2)
    canvas.rect(12 * mm, 12 * mm, w - 24 * mm, h - 24 * mm)
    canvas.setLineWidth(0.6)
    canvas.rect(14 * mm, 14 * mm, w - 28 * mm, h - 28 * mm)
    canvas.restoreState()


# ----------------------------------------------------------------- data
queries = {q['id']: q for q in json.load(open(P('sql', 'queries.json')))}
verify = {v['id']: v for v in json.load(open(P('screenshots', 'verification_report.json')))}
assert all(v['editor_matches_sql'] and v['grid_matches_psql'] for v in verify.values()), \
    'verification failed - rerun capture before building the PDF'
out_txt = {qid: open(P('outputs', f'{qid}.txt')).read() for qid in queries}
base_txt = open(P('outputs', 'base_tables.txt')).read().strip().split('\n\n')

# Per-query text: (heading, purpose shown in section 6, explanation of the output for section 8)
QINFO = {
    'Q0': ('Environment check: server version and current database',
           'Before running the joins, the server version and the connected database are confirmed. '
           '<font name="Mono">version()</font> returns the PostgreSQL build string and '
           '<font name="Mono">current_database()</font> returns the database the session is connected to.',
           None),
    'Q1': ('INNER JOIN – Student + Department',
           'Lists every student together with the name of his/her department. The <b>ON</b> clause matches '
           '<font name="Mono">student.department_id</font> (foreign key) with '
           '<font name="Mono">department.department_id</font> (primary key). Only rows having a match in '
           '<i>both</i> tables are returned.',
           '8 of the 10 students are returned. Neha Joshi (9) and Yash Kulkarni (10) have '
           '<font name="Mono">department_id = NULL</font>; since NULL is never equal to any value, the join '
           'condition is not satisfied and an INNER JOIN silently drops them. Department 50 (Civil '
           'Engineering) is also absent because no student belongs to it.'),
    'Q2': ('LEFT OUTER JOIN – Student + Department',
           'Same pair of tables, but every row of the <i>left</i> table (student) is preserved. Where no '
           'department matches, the department columns are filled with NULL.',
           '10 rows are returned – all students. The 8 matched rows are identical to Q1; the 2 extra rows '
           '(Neha Joshi, Yash Kulkarni) show <font name="Mono">[null]</font> in <i>department_name</i>. '
           'Rows(LEFT JOIN) = rows(INNER JOIN) + unmatched left rows = 8 + 2 = 10.'),
    'Q3': ('RIGHT OUTER JOIN – Faculty + Department',
           'Every row of the <i>right</i> table (department) is preserved, whether or not any faculty member '
           'works in it. Useful for spotting departments that still need staff.',
           '8 rows: the 7 faculty members with their departments, plus one extra row for <b>Civil '
           'Engineering</b> (established 2025) whose <i>faculty_name</i> and <i>designation</i> are NULL '
           'because no faculty row references department 50. The same result could be written as '
           '<font name="Mono">department d LEFT JOIN faculty f</font>.'),
    'Q4': ('FULL OUTER JOIN – Course + Faculty',
           'Returns matched course–faculty pairs <i>and</i> the unmatched rows from both sides: courses '
           'without a teacher and teachers without a course.',
           '8 rows = 6 matched pairs + 1 unmatched course + 1 unmatched faculty. <b>Deep Learning</b> '
           '(U25AMPE304) has <font name="Mono">faculty_id = NULL</font>, so its faculty column is NULL; '
           '<b>Prof. Kavita Rao</b> (107) is not assigned to any course, so her course columns are NULL. '
           'FULL OUTER JOIN = LEFT JOIN <font name="Sym">∪</font> RIGHT JOIN.'),
    'Q5': ('SELF JOIN – Faculty members in the same department',
           'The faculty table is joined with itself using two aliases, <font name="Mono">f1</font> and '
           '<font name="Mono">f2</font>. Two rows pair up when they share the same department. The extra '
           'condition <font name="Mono">f1.faculty_id &lt; f2.faculty_id</font> removes a person paired with '
           'himself/herself and removes mirror duplicates (A,B)/(B,A). A third table, department, supplies '
           'the department name.',
           '4 pairs. AI &amp; ML has 3 faculty members, giving C(3,2) = 3 pairs; Computer Science has 2, '
           'giving 1 pair; Electronics and Mechanical have only one faculty member each, so they produce no '
           'pair. Without the &lt; condition the result would contain 3² + 2² + 1 + 1 = 15 rows '
           '(including self-pairs and mirrored pairs).'),
    'Q6': ('CROSS JOIN – Student × Course (AI &amp; ML)',
           'A CROSS JOIN has no join condition: it pairs every row of the first table with every row of the '
           'second (Cartesian product). Here it is restricted with WHERE to AI &amp; ML students and AI &amp; ML '
           'courses – a practical use is generating every possible registration combination.',
           '3 AI &amp; ML students (Aarav, Diya, Meera) × 3 AI &amp; ML courses (DBMS Lab, Machine '
           'Learning, Deep Learning) = 9 rows. Each student appears once with every course.'),
    'Q7': ('CROSS JOIN – size of the full Cartesian product',
           'Counts the rows of the unrestricted <font name="Mono">student CROSS JOIN course</font> and compares '
           'with the individual table sizes.',
           'student has 10 rows and course has 7 rows, so the Cartesian product has 10 × 7 = 70 rows, '
           'confirming |A × B| = |A| · |B|. This is why a missing join condition in a real query '
           'produces a huge, meaningless result.'),
    'Q8': ('Three-table JOIN – Student → Enrollment → Course',
           'enrollment is a bridge (associative) table that resolves the many-to-many relationship between '
           'student and course. Two join conditions are needed for three tables: student–enrollment on '
           '<font name="Mono">student_id</font> and enrollment–course on '
           '<font name="Mono">course_id</font>.',
           '13 rows – exactly one per enrollment record. Students 9 and 10 are not enrolled, so they do '
           'not appear. The output shows the student name, the course name and the marks, which are stored '
           'in three different tables.'),
    'Q9': ('Four-table JOIN – Student → Enrollment → Course → Faculty',
           'Extends Q8 with the faculty who teaches each course. faculty is joined with a <b>LEFT</b> JOIN so '
           'that a course without an assigned teacher is not lost, and '
           '<font name="Mono">COALESCE</font> replaces the NULL name with ‘Not Assigned’.',
           '13 rows, same as Q8. For Meera Iyer’s Deep Learning enrollment the faculty is shown as '
           '<b>Not Assigned</b>. Had the last join been an INNER JOIN, that row would have been dropped and '
           'only 12 rows returned.'),
    'Q10': ('Five-table JOIN – Toppers with department and faculty',
            'Uses all five tables of college_db. It lists enrollments with marks ≥ 85 together with the '
            'student’s department, the course and the teaching faculty, sorted by marks (highest first).',
            '4 rows. Five enrollments actually have marks ≥ 85 (95, 92, 90, 88, 85), but Meera Iyer’s '
            'Deep Learning record (90) is missing because its course has no faculty and every join here is '
            'an INNER JOIN. This shows that each INNER JOIN in a chain can eliminate rows – an outer join '
            '(as in Q9) is needed when optional relationships must be kept.'),
    'Q11': ('LEFT JOIN + IS NULL – Students not enrolled in any course (anti-join)',
            'A LEFT JOIN keeps every student; students with no enrollment get NULL in all enrollment columns. '
            'Filtering on <font name="Mono">e.enrollment_id IS NULL</font> keeps only those unmatched students.',
            '2 rows: Neha Joshi and Yash Kulkarni, both admitted in 2025, have not enrolled in any course. '
            'The same result can be obtained with <font name="Mono">NOT EXISTS</font> or '
            '<font name="Mono">NOT IN</font>.'),
    'Q12': ('Multi-table JOIN + GROUP BY – Department-wise summary',
            'Starts from department and LEFT JOINs student and enrollment so that every department appears '
            'even if it has no students. Aggregate functions then count students and enrollments and '
            'average the marks per department.',
            '5 rows, one per department. AI &amp; ML: 3 students, 6 enrollments, average (88+79+92+85+95+90)/6 '
            '= 88.17. Computer Science: 3 students, 5 enrollments, average 383/5 = 76.60. Civil Engineering '
            'appears with 0 students and a NULL average only because LEFT JOINs were used; '
            '<font name="Mono">COUNT(column)</font> ignores NULLs, which is why it shows 0 and not 1.'),
}
ORDER = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12']
FIG = {qid: i + 1 for i, qid in enumerate(ORDER)}


def sql_body(qid):
    """SQL exactly as typed into pgAdmin, minus the leading '-- Qn.' comment line shown as a heading."""
    return queries[qid]['sql']


# ----------------------------------------------------------------- story
story = []

# ---- cover page
story += [Spacer(1, 18 * mm),
          Paragraph('PRACTICAL RECORD', ParagraphStyle('c0', fontName='Sans-Bold', fontSize=13, leading=16,
                                                       alignment=TA_CENTER, textColor=colors.HexColor('#5b6b7f'))),
          Spacer(1, 4 * mm),
          Paragraph('DBMS Lab', ParagraphStyle('c1', fontName='Serif-Bold', fontSize=30, leading=36,
                                               alignment=TA_CENTER, textColor=NAVY)),
          Paragraph('Course Code: U25AMILPC307', ParagraphStyle('c2', fontName='Serif', fontSize=13, leading=18,
                                                                alignment=TA_CENTER, textColor=INK)),
          Spacer(1, 10 * mm),
          Paragraph('Practical No. P4', ParagraphStyle('c3', fontName='Serif-Bold', fontSize=17, leading=22,
                                                       alignment=TA_CENTER, textColor=INK)),
          Spacer(1, 2 * mm),
          Paragraph(TITLE, ParagraphStyle('c4', fontName='Serif-Italic', fontSize=13.5, leading=19,
                                          alignment=TA_CENTER, textColor=INK, leftIndent=20, rightIndent=20)),
          Spacer(1, 12 * mm)]
cover = Table([[Paragraph(k, st['cellb']), Paragraph(v, st['cell'])] for k, v in STUDENT],
              colWidths=[48 * mm, 88 * mm], hAlign='CENTER')
cover.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.6, RULE), ('BACKGROUND', (0, 0), (0, -1), GREY_BG),
                           ('TOPPADDING', (0, 0), (-1, -1), 5.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5.5),
                           ('LEFTPADDING', (0, 0), (-1, -1), 8), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
story += [cover, Spacer(1, 10 * mm)]
env = Table([[Paragraph('<b>Database</b>', st['cell']), Paragraph('college_db (College Management System)', st['cell'])],
             [Paragraph('<b>DBMS</b>', st['cell']), Paragraph('PostgreSQL 17 (server 17.10)', st['cell'])],
             [Paragraph('<b>Client tools</b>', st['cell']), Paragraph('pgAdmin 4 (v9.18) Query Tool; psql 17', st['cell'])]],
            colWidths=[48 * mm, 88 * mm], hAlign='CENTER')
env.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.6, RULE), ('TOPPADDING', (0, 0), (-1, -1), 4.5),
                         ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5), ('LEFTPADDING', (0, 0), (-1, -1), 8)]))
story += [env, Spacer(1, 16 * mm)]
sig = Table([[Paragraph('Date of Performance: ____________', st['cell']),
              Paragraph('Date of Submission: ____________', st['cell'])],
             [Spacer(1, 14 * mm), Spacer(1, 14 * mm)],
             [Paragraph('Marks: ______ / ______', st['cell']),
              Paragraph('Signature of Faculty: ____________', st['cell'])]],
            colWidths=[FRAME_W / 2 - 6 * mm] * 2, hAlign='CENTER')
story += [sig, PageBreak()]

# ---- contents
story += [para('Contents', 'h1')]
toc = [('1', 'Aim'), ('2', 'Objectives'), ('3', 'Theory'), ('4', 'Database Schema'), ('5', 'Join Concepts'),
       ('6', 'SQL Queries'), ('7', 'Actual Outputs (psql text + pgAdmin screenshots)'),
       ('8', 'Explanation of Results'), ('9', 'Result'), ('10', 'Viva Questions and Answers'),
       ('A', 'Appendix: Screenshot verification log')]
story += [grid([['No.', 'Section']] + [[a, b] for a, b in toc], [18 * mm, FRAME_W - 18 * mm]), Spacer(1, 6 * mm)]

# ---- 1. Aim
story += [para('1. Aim', 'h1'),
          para('To write and execute multi-table join queries on the College Management System database '
               '(<b>college_db</b>) in PostgreSQL 17, implementing <b>INNER JOIN</b>, <b>LEFT OUTER JOIN</b>, '
               '<b>RIGHT OUTER JOIN</b>, <b>FULL OUTER JOIN</b>, <b>SELF JOIN</b> and <b>CROSS JOIN</b>, and joins '
               'involving three or more tables.')]

# ---- 2. Objectives
story += [para('2. Objectives', 'h1')] + bullets([
    'To understand how related data stored in separate normalised tables is combined using primary-key / '
    'foreign-key relationships.',
    'To implement INNER, LEFT, RIGHT and FULL OUTER joins and observe how each treats unmatched rows and NULL values.',
    'To use a SELF JOIN with table aliases to compare rows of the same table.',
    'To generate a Cartesian product with CROSS JOIN and verify that |A × B| = |A| · |B|.',
    'To write meaningful 3-, 4- and 5-table joins (student → enrollment → course → faculty → department) '
    'and combine joins with WHERE, GROUP BY and aggregate functions.',
    'To execute every query on a real PostgreSQL 17 server and record the actual output.',
])

# ---- 3. Theory
story += [para('3. Theory', 'h1'),
          para('3.1 What is a Join?', 'h2'),
          para('In a relational database, data is split across several tables (normalisation) to avoid '
               'redundancy. A <b>join</b> is the relational operation that recombines rows from two or more tables '
               'into a single result, based on a related column – usually a <b>foreign key</b> in one table '
               'that references the <b>primary key</b> of another. In relational algebra a join is a Cartesian '
               'product followed by a selection:'),
          boxed(Paragraph('<font name="Sym">R \u22c8<sub>\u03b8</sub> S  =  \u03c3<sub>\u03b8</sub> ( R \u00d7 S )</font>'
                          '&nbsp;&nbsp;&nbsp;&nbsp; e.g. &nbsp;<font name="Sym">student \u22c8<sub>s.department_id = '
                          'd.department_id</sub> department</font>',
                          ParagraphStyle('ra', fontName='Serif', fontSize=10.5, leading=15, alignment=TA_CENTER))),
          Spacer(1, 4),
          para('where θ is the join condition. If θ uses only equality (=) the join is an <b>equi-join</b>; '
               'if it uses other comparison operators (&lt;, &gt;, &lt;&gt;, …) it is a <b>theta join</b>. A '
               '<b>natural join</b> is an equi-join on all columns having the same name, with duplicate columns removed.'),
          para('3.2 General Syntax (ANSI SQL / PostgreSQL)', 'h2'),
          mono_block('SELECT  column_list\n'
                     'FROM    table1 [AS] t1\n'
                     '{ [INNER] JOIN | LEFT [OUTER] JOIN | RIGHT [OUTER] JOIN | FULL [OUTER] JOIN }\n'
                     '        table2 [AS] t2  ON t1.col = t2.col        -- or USING (col)\n'
                     '[ CROSS JOIN table3 ]                              -- no ON clause\n'
                     '[ WHERE condition ] [ GROUP BY ... ] [ ORDER BY ... ];', max_size=9),
          Spacer(1, 4),
          para('3.3 Types of Joins', 'h2')] + bullets([
    '<b>INNER JOIN</b> – returns only those row combinations for which the join condition is TRUE. '
    'Unmatched rows of both tables are discarded. <font name="Mono">JOIN</font> alone means INNER JOIN.',
    '<b>LEFT OUTER JOIN</b> – returns all rows of the left table; columns of the right table are NULL '
    'where there is no match.',
    '<b>RIGHT OUTER JOIN</b> – returns all rows of the right table; columns of the left table are NULL '
    'where there is no match. <font name="Mono">A RIGHT JOIN B</font> ≡ <font name="Mono">B LEFT JOIN A</font>.',
    '<b>FULL OUTER JOIN</b> – returns matched rows plus unmatched rows from <i>both</i> tables (union of '
    'LEFT and RIGHT join results).',
    '<b>SELF JOIN</b> – a table joined with itself. It is not a separate keyword; it is an ordinary '
    'inner/outer join in which the same table appears twice under different <b>aliases</b>.',
    '<b>CROSS JOIN</b> – the Cartesian product: every row of the first table combined with every row of '
    'the second. It has no join condition; result size = rows(A) × rows(B).',
]) + [
    para('3.4 Joins on More Than Two Tables', 'h2'),
    para('Joins are evaluated as a chain: the result of the first join is itself a (virtual) table that is '
         'joined with the next table. To connect <i>n</i> tables at least <i>n − 1</i> join conditions are '
         'required; otherwise a Cartesian product is produced. A many-to-many relationship (student–course) '
         'is resolved through a bridge table (enrollment), so reaching course from student always passes through '
         'enrollment.'),
    para('3.5 NULLs and Outer Joins', 'h2'),
    para('A comparison with NULL is never TRUE (it is UNKNOWN), so a row whose foreign key is NULL can never '
         'satisfy an equality join condition. Outer joins are therefore needed to keep such rows. Columns supplied '
         'by the missing side are filled with NULL and can be replaced for display using '
         '<font name="Mono">COALESCE()</font>. A condition on the optional table placed in the WHERE clause '
         '(instead of ON) turns an outer join back into an inner join.'),
    para('3.6 How PostgreSQL Executes Joins', 'h2'),
    para('The PostgreSQL query planner chooses one of three physical join algorithms – <b>Nested Loop</b>, '
         '<b>Hash Join</b> or <b>Merge Join</b> – depending on table sizes, indexes and statistics. The chosen '
         'plan can be inspected with <font name="Mono">EXPLAIN</font> / <font name="Mono">EXPLAIN ANALYZE</font>. '
         'Indexes on join columns (primary keys are indexed automatically) make joins faster.'),
]

# ---- 4. Database schema
story += [PageBreak(), para('4. Database Schema', 'h1'),
          para('The practical uses the College Management System database <b>college_db</b>, consisting of five '
               'related tables. The complete creation and data script is provided as '
               '<font name="Mono">sql/01_college_db_setup.sql</font>.'),
          para('4.1 Relationships', 'h2')]
story += [grid([
    ['Parent table (PK)', 'Child table (FK)', 'Cardinality', 'Meaning'],
    ['department (department_id)', 'faculty (department_id)', '1 : N', 'A department has many faculty members'],
    ['department (department_id)', 'student (department_id)', '1 : N', 'A department has many students (FK may be NULL)'],
    ['department (department_id)', 'course (department_id)', '1 : N', 'A department offers many courses'],
    ['faculty (faculty_id)', 'course (faculty_id)', '1 : N', 'A faculty member teaches courses (FK may be NULL)'],
    ['student (student_id)', 'enrollment (student_id)', '1 : N', 'Bridge table resolving student M:N course'],
    ['course (course_id)', 'enrollment (course_id)', '1 : N', ''],
], [40 * mm, 38 * mm, 23 * mm, FRAME_W - 101 * mm], font=9.5), Spacer(1, 4)]
story += [Spacer(1, 4), Image(P('assets', 'schema.png'), width=FRAME_W * 0.86, height=FRAME_W * 0.86 * 1000 / 1240),
          para('Figure B \u2013 Schema diagram of college_db (arrows point from the parent/PK side to the child/FK side)',
               'caption')]

story += [CondPageBreak(80 * mm), para('4.2 Table Structures', 'h2')]
STRUCT = {
    'department': [['department_id', 'INT', 'PRIMARY KEY'], ['department_name', 'VARCHAR(60)', 'NOT NULL, UNIQUE'],
                   ['building', 'VARCHAR(30)', ''], ['established_year', 'INT', '']],
    'faculty': [['faculty_id', 'INT', 'PRIMARY KEY'], ['faculty_name', 'VARCHAR(50)', 'NOT NULL'],
                ['designation', 'VARCHAR(30)', ''], ['email', 'VARCHAR(60)', 'UNIQUE'],
                ['salary', 'NUMERIC(10,2)', 'CHECK (salary &gt; 0)'],
                ['department_id', 'INT', 'FK → department(department_id)']],
    'student': [['student_id', 'INT', 'PRIMARY KEY'], ['student_name', 'VARCHAR(50)', 'NOT NULL'],
                ['gender', 'CHAR(1)', "CHECK (gender IN ('M','F'))"], ['city', 'VARCHAR(30)', ''],
                ['admission_year', 'INT', ''], ['department_id', 'INT', 'FK → department; NULL = not yet allotted']],
    'course': [['course_id', 'INT', 'PRIMARY KEY'], ['course_code', 'VARCHAR(15)', 'NOT NULL, UNIQUE'],
               ['course_name', 'VARCHAR(60)', 'NOT NULL'], ['credits', 'INT', 'CHECK (credits BETWEEN 1 AND 5)'],
               ['department_id', 'INT', 'FK → department(department_id)'],
               ['faculty_id', 'INT', 'FK → faculty; NULL = not yet assigned']],
    'enrollment': [['enrollment_id', 'INT', 'PRIMARY KEY'], ['student_id', 'INT', 'NOT NULL, FK → student'],
                   ['course_id', 'INT', 'NOT NULL, FK → course'], ['semester', 'VARCHAR(5)', ''],
                   ['marks', 'INT', 'CHECK (marks BETWEEN 0 AND 100)'], ['(student_id, course_id)', '', 'UNIQUE']],
}
for i, (t, rows) in enumerate(STRUCT.items(), 1):
    story.append(KeepTogether([para(f'({chr(96 + i)}) {t.upper()}', 'h3'),
                               grid([['Column', 'Data type', 'Constraint']] + rows,
                                    [48 * mm, 32 * mm, FRAME_W - 80 * mm], mono_cols=(0, 1), font=9.5)]))

story += [para('4.3 Sample Data (verbatim psql output of SELECT * FROM each table)', 'h2'),
          para('The data deliberately contains <i>unmatched</i> rows so that the difference between the join types '
               'becomes visible: two students without a department (9, 10), a department without faculty or '
               'students (50 – Civil Engineering), a course without a teacher (206 – Deep Learning), a faculty '
               'member without a course (107 – Prof. Kavita Rao) and two students without enrollments (9, 10).')]
for name, block in zip(['department', 'faculty', 'student', 'course', 'enrollment'], base_txt):
    story += [KeepTogether([para(f'SELECT * FROM {name} ORDER BY 1;', 'h3'),
                            mono_block(block, max_size=8.2, bg=GREY_BG)]), Spacer(1, 3)]

# ---- 5. Join concepts
story += [PageBreak(), para('5. Join Concepts', 'h1'),
          para('The shaded area in each diagram shows which rows appear in the result (A = left table, B = right '
               'table). These are illustrative diagrams, not screenshots.')]
imgs = [Image(P('assets', f), width=FRAME_W / 3 - 4, height=(FRAME_W / 3 - 4) * 0.74)
        for f in ['inner.png', 'left.png', 'right.png', 'full.png', 'self.png', 'cross.png']]
dt = Table([imgs[:3], imgs[3:]], colWidths=[FRAME_W / 3] * 3)
dt.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
story += [dt, Spacer(1, 4), para('Figure A – Illustrative join diagrams', 'caption'), Spacer(1, 6)]
story += [grid([
    ['Join', 'Rows returned', 'Unmatched rows', 'Used in'],
    ['INNER JOIN', 'Only matching pairs', 'Dropped from both tables', 'Q1, Q5, Q8, Q10'],
    ['LEFT OUTER JOIN', 'All left rows + matches', 'Right-side columns = NULL', 'Q2, Q9, Q11, Q12'],
    ['RIGHT OUTER JOIN', 'All right rows + matches', 'Left-side columns = NULL', 'Q3'],
    ['FULL OUTER JOIN', 'All rows of both tables', 'NULL on the missing side', 'Q4'],
    ['SELF JOIN', 'Pairs of rows from one table', 'Depends on inner/outer form', 'Q5'],
    ['CROSS JOIN', 'rows(A) × rows(B)', 'No condition, so none', 'Q6, Q7'],
], [34 * mm, 44 * mm, 52 * mm, FRAME_W - 130 * mm], font=9.5)]
story += [para('Key points', 'h2')] + bullets([
    '<font name="Mono">INNER</font> and <font name="Mono">OUTER</font> are optional keywords: '
    '<font name="Mono">JOIN</font> = INNER JOIN, <font name="Mono">LEFT JOIN</font> = LEFT OUTER JOIN.',
    'For an inner join, the order of tables does not change the result; for LEFT/RIGHT joins it does.',
    'Table aliases (<font name="Mono">s</font>, <font name="Mono">d</font>, <font name="Mono">f1</font>, '
    '<font name="Mono">f2</font> …) shorten queries and are mandatory in a self join.',
    'In an outer join, conditions on the optional table belong in the ON clause; putting them in WHERE removes '
    'the NULL-extended rows.',
    'An anti-join (rows with no match) is written as <font name="Mono">LEFT JOIN … WHERE right.pk IS NULL</font>.',
])

# ---- 6. SQL queries
story += [PageBreak(), para('6. SQL Queries', 'h1'),
          para('All queries are stored in <font name="Mono">sql/02_p4_join_queries.sql</font>. Each one was typed into '
               'the pgAdmin 4 Query Tool exactly as printed below and executed with F5 on PostgreSQL 17.')]
for qid in ORDER:
    head, purpose, _ = QINFO[qid]
    story += [CondPageBreak(60 * mm),
              para(f'6.{FIG[qid]} {qid}: {head}', 'h2'),
              para(purpose),
              mono_block(sql_body(qid), max_size=9, label='SQL')]

# ---- 7. Actual outputs
story += [PageBreak(), para('7. Actual Outputs', 'h1')]
auth = [para('<b>Authenticity of outputs and screenshots</b>', 'small'),
        para('Every output in this section comes from <b>real execution</b> on a PostgreSQL 17.10 server, database '
             '<font name="Mono">college_db</font>. Each query has two records:', 'small')] + bullets([
    '<b>psql text output</b>: copied verbatim from the psql 17 client (NULL shown as <font name="Mono">(null)</font>).',
    '<b>ACTUAL SCREENSHOT</b>: a screen capture of the pgAdmin 4 (v9.18) Query Tool after the query was run '
    'with F5 (NULL shown as <font name="Mono">[null]</font>). No screenshot is simulated, edited or drawn.',
    'Cross-check: for every screenshot, the text in the pgAdmin editor was compared with the SQL in Section 6, '
    'and the result-grid cells were compared cell-by-cell with the psql output. All 13 matched (Appendix A).',
], s='bullet') + [para('<b>No placeholders were needed</b>: all 13 screenshots are actual captures.', 'small')]
story += [boxed(auth, bg=colors.HexColor('#eef6f0'), border=GREEN, pad=8), Spacer(1, 6)]


def badge(text, color):
    t = Table([[Paragraph(text, ParagraphStyle('b', fontName='Sans-Bold', fontSize=7.5, leading=9,
                                               textColor=colors.white))]], hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), color), ('LEFTPADDING', (0, 0), (-1, -1), 5),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 5), ('TOPPADDING', (0, 0), (-1, -1), 2),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 2)]))
    return t


SHOT_W = FRAME_W * 0.9
SHOT_H = SHOT_W * 1920 / 2560
for qid in ORDER:
    head, _, _ = QINFO[qid]
    v = verify[qid]
    n = FIG[qid]
    story += [PageBreak(),
              para(f'7.{n} {qid}: {head}', 'h2'),
              mono_block(sql_body(qid), max_size=8, label='SQL EXECUTED'),
              Spacer(1, 3),
              mono_block(out_txt[qid], max_size=8, bg=GREY_BG, label='ACTUAL OUTPUT – psql 17 (text)'),
              Spacer(1, 4),
              KeepTogether([
                  badge(f'ACTUAL SCREENSHOT  •  Figure {n}', GREEN),
                  Spacer(1, 2),
                  Image(P('screenshots', v['file']), width=SHOT_W, height=SHOT_H, hAlign='CENTER'),
                  para(f'Figure {n} – {qid} executed in pgAdmin 4 Query Tool, connection '
                       f'college_db/postgres@PostgreSQL 17. pgAdmin status bar: '
                       f'“{v["pgadmin_status"].split(" LF")[0]}”. Rows returned: {v["rows"]}.', 'caption'),
              ])]

# ---- 8. Explanation
story += [PageBreak(), para('8. Explanation of Results', 'h1'),
          para('The table compares the number of rows each query returned (from the actual outputs in Section 7) '
               'and the reason for that count.')]
counts = [['Query', 'Join type', 'Rows', 'Why this many rows']]
short = {'Q1': ('INNER', '10 students − 2 with NULL department'),
         'Q2': ('LEFT OUTER', '8 matched + 2 unmatched students'),
         'Q3': ('RIGHT OUTER', '7 faculty + 1 department without faculty'),
         'Q4': ('FULL OUTER', '6 matched + 1 course w/o faculty + 1 faculty w/o course'),
         'Q5': ('SELF (INNER)', 'C(3,2) + C(2,2) = 3 + 1 pairs'),
         'Q6': ('CROSS', '3 students × 3 courses'),
         'Q7': ('CROSS', '10 × 7 = 70 counted in one row'),
         'Q8': ('INNER (3 tables)', 'one row per enrollment'),
         'Q9': ('INNER + LEFT (4 tables)', 'one row per enrollment, faculty optional'),
         'Q10': ('INNER (5 tables)', '5 records ≥ 85, 1 lost (no faculty)'),
         'Q11': ('LEFT + IS NULL', 'students with no enrollment'),
         'Q12': ('LEFT (3 tables) + GROUP BY', 'one row per department')}
for qid in ORDER[1:]:
    counts.append([qid, short[qid][0], str(verify[qid]['rows']), short[qid][1]])
story += [grid(counts, [16 * mm, 44 * mm, 14 * mm, FRAME_W - 74 * mm], font=9.5), Spacer(1, 6)]
for qid in ORDER[1:]:
    head, _, expl = QINFO[qid]
    story += [KeepTogether([para(f'{qid}: {head}', 'h3'), para(expl)])]
story += [para('Overall observations', 'h2')] + bullets([
    'INNER JOIN returned 8 students while LEFT JOIN returned 10: the difference is exactly the rows whose foreign '
    'key is NULL. Outer joins never return fewer rows than the corresponding inner join.',
    'RIGHT JOIN on faculty–department exposed a department with no staff; FULL OUTER JOIN exposed unmatched '
    'rows on both sides at once.',
    'The SELF JOIN needed two aliases and a non-equality condition (&lt;) to avoid self-pairs and duplicate pairs.',
    'The CROSS JOIN result size (70) equalled the product of the table sizes (10 × 7).',
    'In multi-table joins every INNER JOIN in the chain can remove rows (Q10 lost one record); a LEFT JOIN keeps '
    'optional relationships (Q9).',
])

# ---- 9. Result
story += [CondPageBreak(45 * mm), para('9. Result', 'h1'),
          para('Multi-table join queries were successfully implemented and executed on the <b>college_db</b> '
               'College Management System database in PostgreSQL 17. INNER, LEFT OUTER, RIGHT OUTER, FULL OUTER, SELF '
               'and CROSS joins were demonstrated, along with 3-, 4- and 5-table joins, an anti-join and a join with '
               'GROUP BY. The actual outputs were verified, and it was observed that inner joins return only matching '
               'rows, outer joins preserve unmatched rows with NULLs, a self join compares rows of the same table, and a '
               'cross join returns the Cartesian product.')]

# ---- 10. Viva
story += [Spacer(1, 6), para('10. Viva Questions and Answers', 'h1')]
VIVA = [
    ('What is a join? Why is it needed?',
     'A join combines rows from two or more tables based on a related column. It is needed because a normalised '
     'database stores related facts (student, department, course) in separate tables to avoid redundancy.'),
    ('What is the difference between INNER JOIN and OUTER JOIN?',
     'INNER JOIN returns only rows satisfying the join condition. OUTER JOIN (LEFT/RIGHT/FULL) also returns '
     'unmatched rows of one or both tables, filling the missing columns with NULL.'),
    ('Are LEFT JOIN and RIGHT JOIN interchangeable?',
     'Yes. <i>A RIGHT JOIN B</i> gives the same rows as <i>B LEFT JOIN A</i>; only the default column order differs. '
     'LEFT JOIN is used more often for readability.'),
    ('What is a SELF JOIN? Why are aliases compulsory in it?',
     'A self join joins a table with itself, e.g. finding faculty of the same department. Since the same table '
     'name appears twice, aliases (f1, f2) are required to tell the two copies apart.'),
    ('What is a CROSS JOIN? How many rows does it produce?',
     'It is the Cartesian product of two tables with no join condition. It produces rows(A) × rows(B) rows '
     '(10 × 7 = 70 for student and course). It is useful for generating all combinations.'),
    ('What happens if the join condition is omitted in a multi-table query?',
     'A Cartesian product is produced, giving a very large and mostly meaningless result.'),
    ('What is the difference between equi-join, theta join and natural join?',
     'An equi-join uses only "=" in the condition; a theta join may use any comparison (&lt;, &gt;, &lt;&gt;); a natural '
     'join is an equi-join on all columns with the same name, and the common column appears once.'),
    ('Why is NATURAL JOIN considered risky?',
     'It joins automatically on every same-named column. If a new column with the same name is added later '
     '(e.g. created_at), the join condition changes silently.'),
    ('What is the difference between ON and USING?',
     'ON allows any condition and different column names. USING (col) is shorthand when both tables have a column '
     'of the same name and returns that column only once.'),
    ('Does the position of a filter (ON vs WHERE) matter in an outer join?',
     'Yes. A condition in ON is applied while matching, so unmatched rows are still kept. The same condition in WHERE '
     'is applied after the join and removes NULL-extended rows, effectively turning it into an inner join.'),
    ('How do you find students who have not enrolled in any course?',
     'Use an anti-join: student LEFT JOIN enrollment ... WHERE enrollment.enrollment_id IS NULL (or NOT EXISTS).'),
    ('How many join conditions are required to join n tables?',
     'At least n − 1 join conditions. For example, the 5-table join Q10 uses 4 ON conditions.'),
    ('What is FULL OUTER JOIN? Is it supported in every DBMS?',
     'It returns all rows from both tables, matched where possible. PostgreSQL, Oracle and SQL Server support it; '
     'MySQL does not, and it is emulated there using LEFT JOIN UNION RIGHT JOIN.'),
    ('Which join algorithms does PostgreSQL use?',
     'Nested Loop Join, Hash Join and Merge Join. The planner chooses one using table statistics and indexes; '
     'EXPLAIN shows the chosen plan.'),
    ('What is the difference between a join and a subquery?',
     'A join combines columns from several tables into one result row. A subquery is a query nested inside another, '
     'often used for filtering. Many subqueries can be rewritten as joins, which the optimiser often runs more efficiently.'),
]
for i, (q, a) in enumerate(VIVA, 1):
    story += [KeepTogether([para(f'Q{i}. {q}', 'q'), para(f'<b>Ans.</b> {a}', 'a')])]

# ---- Appendix
story += [PageBreak(), para('Appendix A – Screenshot Verification Log', 'h1'),
          para('Generated by <font name="Mono">verify_screenshots.py</font>. "Editor = SQL" means the text in the '
               'pgAdmin editor at capture time equals the SQL printed in this record. "Grid = psql" means every cell of '
               'the pgAdmin result grid equals the row returned by psql for the same SQL. The SHA-256 fingerprints '
               'identify the exact image files in the <font name="Mono">screenshots/</font> folder.')]
rows = [['Fig.', 'Query', 'File', 'Rows', 'Editor = SQL', 'Grid = psql', 'SHA-256 (first 16 hex)']]
for qid in ORDER:
    v = verify[qid]
    rows.append([str(FIG[qid]), qid, v['file'], str(v['rows']), 'Yes' if v['editor_matches_sql'] else 'NO',
                 'Yes' if v['grid_matches_psql'] else 'NO', v['sha256'][:16]])
story += [grid(rows, [11 * mm, 14 * mm, 20 * mm, 13 * mm, 23 * mm, 22 * mm, FRAME_W - 103 * mm],
               mono_cols=(6,), font=9)]
story += [Spacer(1, 8), para('Capture environment', 'h2'), grid([
    ['Item', 'Value'],
    ['DBMS server', 'PostgreSQL 17.10 (x86_64 Linux)'],
    ['GUI client', 'pgAdmin 4 v9.18, Query Tool (desktop mode, rendered in Chromium)'],
    ['CLI client', 'psql 17'],
    ['Database / user', 'college_db / postgres'],
    ['Capture date (UTC)', verify['Q1']['captured_at'][:10]],
], [45 * mm, FRAME_W - 45 * mm], font=9.5)]

# ----------------------------------------------------------------- build
doc = SimpleDocTemplate(P('DBMS_Lab_P4_Sagar_Kumar_SOE25BTAM29.pdf'), pagesize=A4,
                        leftMargin=20 * mm, rightMargin=20 * mm, topMargin=20 * mm, bottomMargin=19 * mm,
                        title='DBMS Lab Practical P4 - Multi-Table Join Queries', author='Sagar Kumar (SOE25BTAM29)',
                        subject='U25AMILPC307 DBMS Lab - INNER, OUTER, SELF and CROSS JOIN')
doc.build(story, onFirstPage=on_first_page, onLaterPages=on_page)
print('written', doc.filename)

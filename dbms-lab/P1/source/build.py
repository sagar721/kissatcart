"""Builds the P1 practical record.

  source/record_template.html  ->  source/P1_DBMS_Lab_Record.html  (editable source)
                               ->  P1_DBMS_Lab_Record_Sagar_Kumar.pdf

Steps: fill the template with the SQL text and the screenshot list, print the
HTML to PDF with headless Chromium, then stamp the running header/footer
(page numbers) on every page except the cover.

Run:  python3 source/build.py
"""
import html
import subprocess
import tempfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source"
STEPS = ROOT / "sql" / "steps"
SHOTS = ROOT / "screenshots"
CHROMIUM = "/opt/pw-browsers/chromium"
PDF_OUT = ROOT / "P1_DBMS_Lab_Record_Sagar_Kumar.pdf"

# (file, commands shown, purpose)
SCREENSHOTS = [
    ("SS01_create_database.png", "psql --version; SHOW server_version; CREATE DATABASE college_db; \\l college_db; \\c college_db",
     "Confirms PostgreSQL 17 and creates the database college_db."),
    ("SS02_create_department_student_faculty.png", "CREATE TABLE department / student / faculty",
     "Creates the parent table and the two tables that reference it."),
    ("SS03_create_course_enrollment_list_tables.png", "CREATE TABLE course / enrollment; \\dt",
     "Creates the remaining tables and lists all five tables."),
    ("SS04_describe_student_faculty.png", "\\d student; \\d faculty",
     "Shows columns, PK, UNIQUE and FK constraints of student and faculty."),
    ("SS05_describe_course_enrollment.png", "\\d course; \\d enrollment",
     "Shows columns, PK, UNIQUE, CHECK and FK constraints of course and enrollment."),
    ("SS06_verify_primary_foreign_keys.png", "SELECT … FROM information_schema.table_constraints …",
     "Lists every primary key and foreign key with the referenced table."),
    ("SS07_insert_sample_data.png", "INSERT INTO department / faculty / student / course / enrollment",
     "Inserts sample rows to test the schema."),
    ("SS08_join_query_output.png", "SELECT … FROM enrollment JOIN student JOIN course JOIN faculty",
     "Joins the tables through their foreign keys."),
    ("SS09_constraint_enforcement.png", "Invalid INSERTs and DELETE",
     "Shows PostgreSQL rejecting a missing FK value, marks > 100, a duplicate enrollment and deletion of a referenced department."),
]

CAPTIONS = [
    "Checking the PostgreSQL version, creating the database college_db and connecting to it",
    "Creating the tables department, student and faculty",
    "Creating the tables course and enrollment, then listing all tables with \\dt",
    "Structure and constraints of the student and faculty tables (\\d)",
    "Structure and constraints of the course and enrollment tables (\\d)",
    "Verifying all primary keys and foreign keys from information_schema",
    "Inserting sample data into all five tables",
    "Join query across enrollment, student, course and faculty",
    "Constraint enforcement – invalid operations rejected by PostgreSQL",
]

PX_TO_MM = 0.2      # same scale for every screenshot so text size is consistent
MAX_MM = 172


def png_width(path):
    with open(path, "rb") as f:
        head = f.read(24)
    return int.from_bytes(head[16:20], "big")


def sql_create_text():
    parts = [
        "-- Create the database and connect to it",
        "CREATE DATABASE college_db;",
        "\\c college_db",
        "",
        "-- Parent table",
    ]
    a = (STEPS / "02_create_tables_a.sql").read_text().rstrip("\n").split("\n")
    # insert short comments before each CREATE TABLE after the first
    out = []
    for line in a:
        if line.startswith("CREATE TABLE student"):
            out += ["", "-- Department 1 : N Student"]
        elif line.startswith("CREATE TABLE faculty"):
            out += ["", "-- Department 1 : N Faculty"]
        out.append(line)
    b = [l for l in (STEPS / "03_create_tables_b.sql").read_text().rstrip("\n").split("\n") if l != "\\dt"]
    for line in b:
        if line.startswith("CREATE TABLE course"):
            out += ["", "-- Faculty 1 : N Course"]
        elif line.startswith("CREATE TABLE enrollment"):
            out += ["", "-- Student M : N Course (associative table)"]
        out.append(line)
    return html.escape("\n".join(parts + out))


def build_html():
    tpl = (SRC / "record_template.html").read_text()
    rows, figs = [], []
    for i, ((fname, cmds, purpose), cap) in enumerate(zip(SCREENSHOTS, CAPTIONS), start=1):
        p = SHOTS / fname
        assert p.exists(), p
        w = min(png_width(p) * PX_TO_MM, MAX_MM)
        rows.append(f"<tr><td>{i}</td><td><code>{html.escape(cmds)}</code></td><td>{html.escape(purpose)}</td></tr>")
        figs.append(
            f'<figure>\n  <img src="../screenshots/{fname}" style="width:{w:.1f}mm" alt="{html.escape(cap)}">\n'
            f"  <figcaption><b>Screenshot {i}:</b> {html.escape(cap)}</figcaption>\n</figure>"
        )
    out = (tpl.replace("{{SQL_CREATE}}", sql_create_text())
              .replace("{{SCREENSHOT_TABLE}}", "\n  ".join(rows))
              .replace("{{SCREENSHOT_FIGURES}}", "\n".join(figs)))
    dst = SRC / "P1_DBMS_Lab_Record.html"
    dst.write_text(out)
    return dst


def print_pdf(src_html, raw_pdf):
    subprocess.run([CHROMIUM, "--headless", "--no-sandbox", "--disable-gpu",
                    "--no-pdf-header-footer", "--allow-file-access-from-files",
                    f"--print-to-pdf={raw_pdf}", src_html.as_uri()],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def stamp(raw_pdf, out_pdf):
    pdfmetrics.registerFont(TTFont("Serif", "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"))
    reader = PdfReader(raw_pdf)
    n = len(reader.pages)
    W, H = A4
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
        c = canvas.Canvas(tmp.name, pagesize=A4)
        for i in range(n):
            if i > 0:
                c.setFont("Serif", 9)
                c.setFillGray(0.2)
                c.drawString(18 * mm, H - 12 * mm, "U25AMILPC307 – DBMS Lab  |  Practical P1")
                c.drawRightString(W - 18 * mm, H - 12 * mm, "Sagar Kumar  |  PRN: SOE25BTAM29  |  Section A")
                c.setStrokeGray(0.45)
                c.setLineWidth(0.5)
                c.line(18 * mm, H - 13.8 * mm, W - 18 * mm, H - 13.8 * mm)
                c.line(18 * mm, 13.5 * mm, W - 18 * mm, 13.5 * mm)
                c.drawString(18 * mm, 9.5 * mm, "College Management System – ER Modeling and Database Creation")
                c.drawRightString(W - 18 * mm, 9.5 * mm, f"Page {i + 1} of {n}")
            c.showPage()
        c.save()
        overlay = PdfReader(tmp.name)
        writer = PdfWriter()
        for page, ov in zip(reader.pages, overlay.pages):
            page.merge_page(ov)
            writer.add_page(page)
        writer.add_metadata({
            "/Title": "DBMS Lab Practical P1 – Database Creation and ER Modeling (College Management System)",
            "/Author": "Sagar Kumar (SOE25BTAM29)",
            "/Subject": "U25AMILPC307 DBMS Lab – Practical P1",
        })
        with open(out_pdf, "wb") as f:
            writer.write(f)
    return n


if __name__ == "__main__":
    src = build_html()
    with tempfile.TemporaryDirectory() as d:
        raw = Path(d) / "raw.pdf"
        print_pdf(src, raw)
        pages = stamp(raw, PDF_OUT)
    print(f"wrote {src}\nwrote {PDF_OUT} ({pages} pages)")

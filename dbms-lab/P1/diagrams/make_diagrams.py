"""Generates the two vector diagrams used in the P1 record.

  er_diagram.svg      - ER diagram (Chen notation) for the College Management System
  schema_diagram.svg  - Relational schema diagram (tables, PK/FK, 1:N links)

Run:  python3 make_diagrams.py
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent
FONT = "Liberation Sans, Arial, Helvetica, sans-serif"
INK = "#111"


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# --------------------------------------------------------------------------
# Figure 1: ER diagram, Chen notation
# --------------------------------------------------------------------------
def er_diagram():
    W, H = 1100, 850
    el = []

    def line(x1, y1, x2, y2, double=False):
        if not double:
            el.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-width="1.4"/>')
            return
        # total participation: two parallel lines
        dx, dy = x2 - x1, y2 - y1
        n = (dx * dx + dy * dy) ** 0.5
        ox, oy = -dy / n * 2.6, dx / n * 2.6
        for k in (1, -1):
            el.append(f'<line x1="{x1+k*ox:.1f}" y1="{y1+k*oy:.1f}" x2="{x2+k*ox:.1f}" y2="{y2+k*oy:.1f}" '
                      f'stroke="{INK}" stroke-width="1.3"/>')

    def entity(cx, cy, name, w=160, h=52):
        el.append(f'<rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" fill="#fff" stroke="{INK}" stroke-width="2"/>')
        el.append(f'<text x="{cx}" y="{cy+6}" text-anchor="middle" font-size="17" font-weight="700">{name}</text>')

    def assoc_entity(cx, cy, name, w=200, h=78):
        el.append(f'<rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" fill="#fff" stroke="{INK}" stroke-width="2"/>')
        dw, dh = w - 14, h - 12
        pts = f"{cx},{cy-dh/2} {cx+dw/2},{cy} {cx},{cy+dh/2} {cx-dw/2},{cy}"
        el.append(f'<polygon points="{pts}" fill="#fff" stroke="{INK}" stroke-width="1.6"/>')
        el.append(f'<text x="{cx}" y="{cy+6}" text-anchor="middle" font-size="15" font-weight="700">{name}</text>')

    def relation(cx, cy, name, w=150, h=74):
        pts = f"{cx},{cy-h/2} {cx+w/2},{cy} {cx},{cy+h/2} {cx-w/2},{cy}"
        el.append(f'<polygon points="{pts}" fill="#fff" stroke="{INK}" stroke-width="1.8"/>')
        el.append(f'<text x="{cx}" y="{cy+5}" text-anchor="middle" font-size="14" font-weight="700" font-style="italic">{name}</text>')

    def attr(cx, cy, label, kind="", w=158, h=36):
        # kind: "" plain, "pk" primary key (underlined), "fk" foreign key (dashed, italic)
        dash = ' stroke-dasharray="5 3"' if kind == "fk" else ""
        el.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{w/2}" ry="{h/2}" fill="#fff" stroke="{INK}" stroke-width="1.3"{dash}/>')
        style = ""
        if kind == "pk":
            style = ' text-decoration="underline" font-weight="700"'
        elif kind == "fk":
            style = ' font-style="italic"'
        text = label + (" (FK)" if kind == "fk" else "")
        el.append(f'<text x="{cx}" y="{cy+5}" text-anchor="middle" font-size="13.5"{style}>{esc(text)}</text>')

    def card(x, y, t):
        el.append(f'<text x="{x}" y="{y}" text-anchor="middle" font-size="17" font-weight="700">{t}</text>')

    # positions
    DEP = (550, 120)
    STU = (330, 400)
    FAC = (790, 400)
    CRS = (790, 690)
    ENR = (330, 690)
    BEL = (430, 262)
    WRK = (670, 262)
    TCH = (790, 545)

    # ---- connectors (drawn first so shapes sit on top)
    # Department - Belongs_To - Student
    line(DEP[0] - 80, DEP[1] + 14, BEL[0], BEL[1])
    line(BEL[0] - 20, BEL[1] + 28, STU[0] + 20, STU[1] - 26, double=True)
    card(485, 182, "1")
    card(392, 352, "N")
    # Department - Works_In - Faculty
    line(DEP[0] + 80, DEP[1] + 14, WRK[0], WRK[1])
    line(WRK[0] + 20, WRK[1] + 28, FAC[0] - 20, FAC[1] - 26, double=True)
    card(615, 182, "1")
    card(708, 352, "N")
    # Faculty - Teaches - Course
    line(FAC[0], FAC[1] + 26, TCH[0], TCH[1])
    line(TCH[0], TCH[1] + 37, CRS[0], CRS[1] - 26, double=True)
    card(808, 472, "1")
    card(808, 634, "N")
    # Student - Enrollment - Course  (M:N resolved by associative entity)
    line(STU[0], STU[1] + 26, ENR[0], ENR[1] - 39)
    line(ENR[0] + 100, ENR[1], CRS[0] - 80, CRS[1])
    card(350, 470, "M")
    card(690, 682, "N")

    # ---- attributes
    def attach(a, ex, ey, side, k=""):
        w = (176 if k == "fk" else 158) / 2
        sx, sy = {"r": (a[0] + w, a[1]), "l": (a[0] - w, a[1]),
                  "b": (a[0], a[1] + 18), "t": (a[0], a[1] - 18)}[side]
        line(sx, sy, ex, ey)

    dep_attrs = [((390, 48), "department_id", "pk"), ((710, 48), "department_name", "")]
    for (p, lab, k) in dep_attrs:
        attach(p, DEP[0] + (-40 if p[0] < DEP[0] else 40), DEP[1] - 26, "b", k)

    stu_attrs = [((100, 300), "student_id", "pk"), ((100, 350), "student_name", ""),
                 ((100, 400), "email", ""), ((100, 450), "phone", ""),
                 ((100, 500), "department_id", "fk")]
    for (p, lab, k) in stu_attrs:
        attach(p, STU[0] - 80, STU[1] + (p[1] - STU[1]) * 0.18, "r", k)

    fac_attrs = [((1000, 340), "faculty_id", "pk"), ((1000, 400), "faculty_name", ""),
                 ((1000, 460), "department_id", "fk")]
    for (p, lab, k) in fac_attrs:
        attach(p, FAC[0] + 80, FAC[1] + (p[1] - FAC[1]) * 0.25, "l", k)

    crs_attrs = [((1000, 615), "course_id", "pk"), ((1000, 665), "course_name", ""),
                 ((1000, 715), "credits", ""), ((1000, 765), "faculty_id", "fk")]
    for (p, lab, k) in crs_attrs:
        attach(p, CRS[0] + 80, CRS[1] + (p[1] - CRS[1]) * 0.18, "l", k)

    enr_attrs = [((100, 640), "enrollment_id", "pk"), ((100, 690), "enrollment_date", ""),
                 ((100, 740), "marks", ""), ((250, 805), "student_id", "fk"),
                 ((450, 805), "course_id", "fk")]
    for (p, lab, k) in enr_attrs[:3]:
        attach(p, ENR[0] - 100, ENR[1] + (p[1] - ENR[1]) * 0.3, "r", k)
    for (p, lab, k) in enr_attrs[3:]:
        attach(p, ENR[0] + (-40 if p[0] < ENR[0] else 40), ENR[1] + 39, "t", k)

    # shapes
    entity(*DEP, "DEPARTMENT", w=180)
    entity(*STU, "STUDENT")
    entity(*FAC, "FACULTY")
    entity(*CRS, "COURSE")
    assoc_entity(*ENR, "ENROLLMENT")
    relation(*BEL, "Belongs_To")
    relation(*WRK, "Works_In")
    relation(*TCH, "Teaches")
    for group in (dep_attrs, stu_attrs, fac_attrs, crs_attrs, enr_attrs):
        for (p, lab, k) in group:
            attr(p[0], p[1], lab, k, w=176 if k == "fk" else 158)

    # Enrolls label on the M:N path
    el.append(f'<text x="545" y="676" text-anchor="middle" font-size="13" font-style="italic">enrolls in (M : N)</text>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
           f'font-family="{FONT}" fill="{INK}">\n<rect width="{W}" height="{H}" fill="#fff"/>\n'
           + "\n".join(el) + "\n</svg>\n")
    (OUT / "er_diagram.svg").write_text(svg)


# --------------------------------------------------------------------------
# Figure 2: Relational schema diagram
# --------------------------------------------------------------------------
TABLES = {
    "department": [("PK", "department_id", "INT"), ("", "department_name", "VARCHAR(100)")],
    "student": [("PK", "student_id", "INT"), ("", "student_name", "VARCHAR(100)"),
                ("", "email", "VARCHAR(120)"), ("", "phone", "VARCHAR(15)"),
                ("FK", "department_id", "INT")],
    "faculty": [("PK", "faculty_id", "INT"), ("", "faculty_name", "VARCHAR(100)"),
                ("FK", "department_id", "INT")],
    "course": [("PK", "course_id", "INT"), ("", "course_name", "VARCHAR(100)"),
               ("", "credits", "SMALLINT"), ("FK", "faculty_id", "INT")],
    "enrollment": [("PK", "enrollment_id", "INT"), ("FK", "student_id", "INT"),
                   ("FK", "course_id", "INT"), ("", "enrollment_date", "DATE"),
                   ("", "marks", "NUMERIC(5,2)")],
}


def schema_diagram():
    W, H = 1100, 720
    TW, HH, RH = 290, 34, 28
    pos = {"department": (405, 30), "student": (40, 230), "faculty": (770, 230),
           "enrollment": (40, 540), "course": (770, 540)}
    el = []

    def box(name):
        x, y = pos[name]
        rows = TABLES[name]
        h = HH + RH * len(rows)
        el.append(f'<rect x="{x}" y="{y}" width="{TW}" height="{h}" fill="#fff" stroke="{INK}" stroke-width="1.8"/>')
        el.append(f'<rect x="{x}" y="{y}" width="{TW}" height="{HH}" fill="#e6e6e6" stroke="{INK}" stroke-width="1.8"/>')
        el.append(f'<text x="{x+TW/2}" y="{y+23}" text-anchor="middle" font-size="16" font-weight="700">{name.upper()}</text>')
        for i, (k, col, typ) in enumerate(rows):
            ry = y + HH + RH * i
            if i:
                el.append(f'<line x1="{x}" y1="{ry}" x2="{x+TW}" y2="{ry}" stroke="#bbb" stroke-width="0.8"/>')
            if k:
                el.append(f'<text x="{x+10}" y="{ry+19}" font-size="12" font-weight="700">{k}</text>')
            style = ' font-weight="700" text-decoration="underline"' if k == "PK" else (' font-style="italic"' if k == "FK" else "")
            el.append(f'<text x="{x+44}" y="{ry+19}" font-size="14"{style}>{col}</text>')
            el.append(f'<text x="{x+TW-10}" y="{ry+19}" text-anchor="end" font-size="12.5" fill="#444">{typ}</text>')
        el.append(f'<line x1="{x+36}" y1="{y+HH}" x2="{x+36}" y2="{y+h}" stroke="#bbb" stroke-width="0.8"/>')

    def row_y(name, col):
        x, y = pos[name]
        for i, (_, c, _) in enumerate(TABLES[name]):
            if c == col:
                return y + HH + RH * i + RH / 2

    def one(x, y, d):  # bar for "one" end; d = direction the line leaves the box (+1 right/down)
        el.append(f'<line x1="{x+10*d}" y1="{y-8}" x2="{x+10*d}" y2="{y+8}" stroke="{INK}" stroke-width="1.6"/>')
        el.append(f'<line x1="{x+15*d}" y1="{y-8}" x2="{x+15*d}" y2="{y+8}" stroke="{INK}" stroke-width="1.6"/>')

    def many(x, y, d):  # crow's foot, horizontal
        el.append(f'<line x1="{x}" y1="{y-9}" x2="{x+16*d}" y2="{y}" stroke="{INK}" stroke-width="1.6"/>')
        el.append(f'<line x1="{x}" y1="{y+9}" x2="{x+16*d}" y2="{y}" stroke="{INK}" stroke-width="1.6"/>')
        el.append(f'<line x1="{x+20*d}" y1="{y-8}" x2="{x+20*d}" y2="{y+8}" stroke="{INK}" stroke-width="1.6"/>')

    def many_v(x, y, d):  # crow's foot, vertical (d=+1 line leaves downwards)
        el.append(f'<line x1="{x-9}" y1="{y}" x2="{x}" y2="{y+16*d}" stroke="{INK}" stroke-width="1.6"/>')
        el.append(f'<line x1="{x+9}" y1="{y}" x2="{x}" y2="{y+16*d}" stroke="{INK}" stroke-width="1.6"/>')
        el.append(f'<line x1="{x-8}" y1="{y+20*d}" x2="{x+8}" y2="{y+20*d}" stroke="{INK}" stroke-width="1.6"/>')

    def one_v(x, y, d):
        for off in (10, 15):
            el.append(f'<line x1="{x-8}" y1="{y+off*d}" x2="{x+8}" y2="{y+off*d}" stroke="{INK}" stroke-width="1.6"/>')

    def path(pts):
        el.append('<polyline points="' + " ".join(f"{a},{b}" for a, b in pts)
                  + f'" fill="none" stroke="{INK}" stroke-width="1.6"/>')

    def label(x, y, t, anchor="middle"):
        el.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="14" font-weight="700">{t}</text>')

    def note(x, y, t, anchor="middle"):
        el.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="12.5" font-style="italic" fill="#333">{esc(t)}</text>')

    dx, dy = pos["department"]
    dep_pk_y = row_y("department", "department_id")
    # department -> student.department_id
    sx, sy = pos["student"]
    s_fk = row_y("student", "department_id")
    path([(dx, dep_pk_y), (sx + TW / 2, dep_pk_y), (sx + TW / 2, sy)])
    one(dx, dep_pk_y, -1)
    many_v(sx + TW / 2, sy, -1)
    label(dx - 26, dep_pk_y - 10, "1")
    label(sx + TW / 2 + 16, sy - 26, "N", "start")
    note(sx + TW / 2 + 8, dep_pk_y - 12, "belongs to", "start")
    # department -> faculty.department_id
    fx, fy = pos["faculty"]
    path([(dx + TW, dep_pk_y), (fx + TW / 2, dep_pk_y), (fx + TW / 2, fy)])
    one(dx + TW, dep_pk_y, 1)
    many_v(fx + TW / 2, fy, -1)
    label(dx + TW + 26, dep_pk_y - 10, "1")
    label(fx + TW / 2 + 16, fy - 26, "N", "start")
    note(fx + TW / 2 - 8, dep_pk_y - 12, "works in", "end")
    # faculty -> course.faculty_id
    cx, cy = pos["course"]
    fac_bottom = fy + HH + RH * len(TABLES["faculty"])
    path([(fx + TW / 2, fac_bottom), (cx + TW / 2, cy)])
    one_v(fx + TW / 2, fac_bottom, 1)
    many_v(cx + TW / 2, cy, -1)
    label(fx + TW / 2 + 16, fac_bottom + 22, "1", "start")
    label(cx + TW / 2 + 16, cy - 26, "N", "start")
    note(fx + TW / 2 - 12, (fac_bottom + cy) / 2 + 4, "teaches", "end")
    # student -> enrollment.student_id
    ex, ey = pos["enrollment"]
    stu_bottom = sy + HH + RH * len(TABLES["student"])
    path([(sx + TW / 2, stu_bottom), (ex + TW / 2, ey)])
    one_v(sx + TW / 2, stu_bottom, 1)
    many_v(ex + TW / 2, ey, -1)
    label(sx + TW / 2 + 16, stu_bottom + 22, "1", "start")
    label(ex + TW / 2 + 16, ey - 26, "N", "start")
    note(sx + TW / 2 - 12, (stu_bottom + ey) / 2 + 4, "enrolls", "end")
    # course -> enrollment.course_id
    c_pk = row_y("course", "course_id")
    e_fk = row_y("enrollment", "course_id")
    midx = (ex + TW + cx) / 2
    path([(cx, c_pk), (midx, c_pk), (midx, e_fk), (ex + TW, e_fk)])
    one(cx, c_pk, -1)
    many(ex + TW, e_fk, 1)
    label(cx - 26, c_pk - 10, "1")
    label(ex + TW + 30, e_fk - 12, "N")
    note(midx + 8, (c_pk + e_fk) / 2 + 4, "is taken in", "start")

    for t in TABLES:
        box(t)

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
           f'font-family="{FONT}" fill="{INK}">\n<rect width="{W}" height="{H}" fill="#fff"/>\n'
           + "\n".join(el) + "\n</svg>\n")
    (OUT / "schema_diagram.svg").write_text(svg)


if __name__ == "__main__":
    er_diagram()
    schema_diagram()
    print("wrote", OUT / "er_diagram.svg", OUT / "schema_diagram.svg")

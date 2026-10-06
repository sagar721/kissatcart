"""Draw the illustrative join diagrams (Venn-style) used in the Join Concepts section."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
FILL, EDGE = '#5a86bd', '#1f2d3d'

def venn(name, left, inner, right, title, la='A', lb='B'):
    fig, ax = plt.subplots(figsize=(2.2, 1.7), dpi=220)
    a, b = (-0.45, 0), (0.45, 0)
    if left:
        ax.add_patch(Circle(a, 0.8, color=FILL, alpha=1.0, lw=0))
    if right:
        ax.add_patch(Circle(b, 0.8, color=FILL, alpha=1.0, lw=0))
    if inner and not (left or right):
        ca = Circle(a, 0.8, color=FILL, alpha=1.0, lw=0)
        ax.add_patch(ca)
        ca.set_clip_path(Circle(b, 0.8, transform=ax.transData))
    for c in (a, b):
        ax.add_patch(Circle(c, 0.8, fill=False, ec=EDGE, lw=1.4))
    ax.text(-1.0, 0, la, ha='center', va='center', fontsize=11, color='white' if left else EDGE, weight='bold')
    ax.text(1.0, 0, lb, ha='center', va='center', fontsize=11, color='white' if right else EDGE, weight='bold')
    ax.set_title(title, fontsize=9, weight='bold', color=EDGE)
    ax.set_xlim(-1.4, 1.4); ax.set_ylim(-0.95, 0.95); ax.set_aspect('equal'); ax.axis('off')
    fig.savefig(os.path.join(OUT, name), bbox_inches='tight', transparent=False, facecolor='white'); plt.close(fig)

def cross():
    fig, ax = plt.subplots(figsize=(2.2, 1.7), dpi=220)
    rows, cols = ['s1', 's2', 's3'], ['c1', 'c2', 'c3']
    for i, r in enumerate(rows):
        ax.text(-0.6, 2 - i + 0.5, r, ha='center', va='center', fontsize=8, color=EDGE, weight='bold')
        for j in range(3):
            ax.add_patch(Rectangle((j, 2 - i), 0.92, 0.92, color=FILL, alpha=1.0))
            ax.text(j + 0.46, 2 - i + 0.46, f'{r},{cols[j]}', ha='center', va='center', fontsize=5.5, color='white')
    for j, c in enumerate(cols):
        ax.text(j + 0.46, 3.3, c, ha='center', va='center', fontsize=8, color=EDGE, weight='bold')
    ax.set_title('CROSS JOIN (3 x 3 = 9)', fontsize=9, weight='bold', color=EDGE)
    ax.set_xlim(-1.1, 3.1); ax.set_ylim(-0.2, 3.7); ax.set_aspect('equal'); ax.axis('off')
    fig.savefig(os.path.join(OUT, 'cross.png'), bbox_inches='tight', facecolor='white'); plt.close(fig)

def self_join():
    fig, ax = plt.subplots(figsize=(2.2, 1.7), dpi=220)
    ca = Circle((-0.45, 0), 0.8, color=FILL, alpha=1.0, lw=0); ax.add_patch(ca)
    ca.set_clip_path(Circle((0.45, 0), 0.8, transform=ax.transData))
    for c in ((-0.45, 0), (0.45, 0)):
        ax.add_patch(Circle(c, 0.8, fill=False, ec=EDGE, lw=1.4, ls='--' if c[0] > 0 else '-'))
    ax.text(-1.0, 0, 'f1', ha='center', va='center', fontsize=10, color=EDGE, weight='bold')
    ax.text(1.0, 0, 'f2', ha='center', va='center', fontsize=10, color=EDGE, weight='bold')
    ax.set_title('SELF JOIN (faculty x faculty)', fontsize=9, weight='bold', color=EDGE)
    ax.set_xlim(-1.4, 1.4); ax.set_ylim(-0.95, 0.95); ax.set_aspect('equal'); ax.axis('off')
    fig.savefig(os.path.join(OUT, 'self.png'), bbox_inches='tight', facecolor='white'); plt.close(fig)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    venn('inner.png', False, True, False, 'INNER JOIN')
    venn('left.png', True, True, False, 'LEFT OUTER JOIN')
    venn('right.png', False, True, True, 'RIGHT OUTER JOIN')
    venn('full.png', True, True, True, 'FULL OUTER JOIN')
    self_join(); cross()
    print('diagrams written to', OUT)


def schema():
    """Table boxes with PK/FK columns and 1:N relationship lines for college_db."""
    tables = {
        'department': ((0.0, 5.2), ['department_id  PK', 'department_name', 'building', 'established_year']),
        'faculty':    ((-4.6, 2.2), ['faculty_id  PK', 'faculty_name', 'designation', 'email', 'salary',
                                     'department_id  FK']),
        'student':    ((4.6, 2.2), ['student_id  PK', 'student_name', 'gender', 'city', 'admission_year',
                                    'department_id  FK']),
        'course':     ((-2.3, -1.6), ['course_id  PK', 'course_code', 'course_name', 'credits',
                                      'department_id  FK', 'faculty_id  FK']),
        'enrollment': ((2.6, -1.6), ['enrollment_id  PK', 'student_id  FK', 'course_id  FK', 'semester', 'marks']),
    }
    W, LH, HH = 3.0, 0.36, 0.5
    fig, ax = plt.subplots(figsize=(7.6, 5.6), dpi=220)
    box = {}
    for name, ((cx, top), cols) in tables.items():
        h = HH + LH * len(cols) + 0.1
        x0 = cx - W / 2
        ax.add_patch(Rectangle((x0, top - h), W, h, fc='white', ec=EDGE, lw=1.3, zorder=3))
        ax.add_patch(Rectangle((x0, top - HH), W, HH, fc=EDGE, ec=EDGE, lw=1.3, zorder=3))
        ax.text(cx, top - HH / 2, name.upper(), ha='center', va='center', color='white', fontsize=9.5,
                weight='bold', zorder=4)
        for i, c in enumerate(cols):
            key = 'PK' in c or 'FK' in c
            ax.text(x0 + 0.12, top - HH - LH * (i + 0.6), c, ha='left', va='center', fontsize=7.6,
                    family='DejaVu Sans Mono', color='#8a1c1c' if 'PK' in c else ('#1c4f8a' if key else '#333333'),
                    weight='bold' if key else 'normal', zorder=4)
        box[name] = (x0, top - h, W, h)

    def edge(a, b, pa, pb, label):
        ax.annotate('', xy=pb, xytext=pa, zorder=2,
                    arrowprops=dict(arrowstyle='-|>', color='#5b6b7f', lw=1.2, shrinkA=0, shrinkB=0))
        mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
        ax.text(mx, my, label, fontsize=7, ha='center', va='center', color='#5b6b7f',
                bbox=dict(fc='white', ec='none', pad=0.6), zorder=5)

    dx, dy, dw, dh = box['department']
    fx, fy, fw, fh = box['faculty']
    sx, sy, sw, sh = box['student']
    cx_, cy_, cw, ch = box['course']
    ex, ey, ew, eh = box['enrollment']
    edge('department', 'faculty', (dx, dy + dh * 0.45), (fx + fw / 2, fy + fh), '1 : N')
    edge('department', 'student', (dx + dw, dy + dh * 0.45), (sx + sw / 2, sy + sh), '1 : N')
    edge('department', 'course', (dx + dw * 0.35, dy), (cx_ + cw * 0.7, cy_ + ch), '1 : N  offers')
    edge('faculty', 'course', (fx + fw / 2, fy), (cx_ + cw * 0.2, cy_ + ch), '1 : N  teaches')
    edge('student', 'enrollment', (sx + sw / 2, sy), (ex + ew * 0.75, ey + eh), '1 : N')
    edge('course', 'enrollment', (cx_ + cw, cy_ + ch * 0.5), (ex, ey + eh * 0.5), '1 : N')
    ax.set_xlim(-6.3, 6.3); ax.set_ylim(-4.6, 5.4); ax.set_aspect('equal'); ax.axis('off')
    fig.savefig(os.path.join(OUT, 'schema.png'), bbox_inches='tight', facecolor='white'); plt.close(fig)


if __name__ == '__main__':
    schema()

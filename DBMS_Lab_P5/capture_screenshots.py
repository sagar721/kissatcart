#!/usr/bin/env python3
"""Drive a real xterm running psql (PostgreSQL 17 container) and capture
genuine screenshots. Queries are typed into the live psql session with
xdotool; the xterm window is then captured with ImageMagick `import`.
The only post-processing is trimming unused blank rows below the output."""
import os, re, subprocess, sys, time

SQL = sys.argv[1]
OUT = sys.argv[2]
ENV = dict(os.environ, DISPLAY=":99")
COLS, ROWS = 122, 60


def sh(*a, **k):
    return subprocess.run(a, env=ENV, check=True, capture_output=True, text=True, timeout=60, **k).stdout


def type_line(wid, line):
    if line:
        sh("xdotool", "type", "--delay", "4", "--", line)
    sh("xdotool", "key", "Return")
    time.sleep(0.15)


def clear(wid):
    sh("xdotool", "key", "ctrl+l")
    time.sleep(0.6)


def capture(wid, name):
    time.sleep(1.5)
    path = os.path.join(OUT, name + "_raw.png")
    sh("import", "-window", wid, path)
    print("captured", path)


def blocks():
    """Split the P5 SQL file into screenshot blocks (lines to type)."""
    text = open(SQL).read()
    parts = re.split(r"-- -+\n-- Screenshot (\S+) : [^\n]*\n-- -+\n", text)
    out = []
    for i in range(1, len(parts), 2):
        lines = [l for l in parts[i + 1].splitlines() if l.strip()]
        out.append((parts[i], lines))
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    subprocess.Popen(
        ["xterm", "-T", "psql - college_db", "-geometry", f"{COLS}x{ROWS}+0+0",
         "-fa", "DejaVu Sans Mono", "-fs", "13", "-bg", "#0c0c0c", "-fg", "#d4d4d4",
         "-bw", "0", "+sb", "-b", "10",
         "-e", "docker", "exec", "-it", "pg17", "psql", "-P", "pager=off", "-U", "postgres", "-d", "college_db"],
        env=ENV, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(3)
    wid = sh("xdotool", "search", "--name", "psql - college_db").split()[0]
    sh("xdotool", "mousemove", "300", "300")
    sh("xdotool", "windowfocus", "--sync", wid)

    # Screenshot 0: connection banner, server version and the five tables
    type_line(wid, "SELECT version();")
    type_line(wid, "\\dt")
    capture(wid, "ss0_connection")

    split = {"5": [("5a", "-- Q13."), ("5b", "-- Q14.")],
             "3": [("3a", "-- Q9."), ("3b", "-- Q10.")]}
    for num, lines in blocks():
        groups = [(num, lines)]
        if num in split:
            (n1, m1), (n2, m2) = split[num]
            k = next(i for i, l in enumerate(lines) if l.startswith(m2))
            groups = [(n1, lines[:k]), (n2, lines[k:])]
        for name, ls in groups:
            clear(wid)
            for l in ls:
                type_line(wid, l)
            capture(wid, f"ss{name}")
    type_line(wid, "\\q")
    time.sleep(1)


main()

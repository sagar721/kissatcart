"""Run P3 SQL interactively in a real psql 17 session inside xterm (on Xvfb)
and take genuine screenshots of the terminal after each chunk."""
import os, re, subprocess, sys, time
from PIL import Image

SQL = "/home/user/kissatcart/dbms-lab/P3/sql/P3_dml_operations.sql"
OUT = "/home/user/kissatcart/dbms-lab/P3/screenshots"
COLS, ROWS = 124, 72
DISP = ":99"
os.makedirs(OUT, exist_ok=True)

env = dict(os.environ)
env.update({
    "DISPLAY": DISP,
    "PATH": "/opt/pg17full/postgresql-17.10.0-x86_64-unknown-linux-gnu/bin:" + env["PATH"],
    "PGHOST": "/tmp", "PGPORT": "5433", "PSQLRC": "/srv/pg17/psqlrc",
    "TERM": "xterm",
})


def sh(*a, **k):
    return subprocess.run(a, env=env, check=True, capture_output=True, text=True, **k).stdout


def pane():
    return sh("tmux", "capture-pane", "-p", "-t", "lab")


def wait_prompt(timeout=15):
    t0 = time.time()
    while time.time() - t0 < timeout:
        lines = [l for l in pane().rstrip("\n").split("\n")]
        while lines and lines[-1].strip() == "":
            lines.pop()
        if lines and re.search(r"(college_db=# ?|\$ ?)$", lines[-1]):
            return
        time.sleep(0.2)
    raise RuntimeError("prompt not seen:\n" + pane())


def type_line(text):
    body = text[:-1] if text.endswith(";") else text
    if body:
        sh("tmux", "send-keys", "-t", "lab", "-l", "--", body)
    if text.endswith(";"):
        sh("tmux", "send-keys", "-t", "lab", "-H", "3b")
    sh("tmux", "send-keys", "-t", "lab", "Enter")


def parse_chunks():
    chunks, cur = [], None
    for line in open(SQL):
        m = re.match(r"-- @shot (\w+) \| (.*)", line)
        if m:
            cur = {"id": m.group(1), "caption": m.group(2).strip(), "stmts": [], "buf": []}
            chunks.append(cur)
            continue
        if cur is None or line.startswith("--"):
            continue
        s = line.rstrip("\n")
        if not s.strip():
            continue
        cur["buf"].append(s)
        if s.endswith(";") or s.startswith("\\"):
            cur["stmts"].append(cur["buf"])
            cur["buf"] = []
    return chunks


def screenshot(name):
    raw = f"{OUT}/.raw.png"
    sh("import", "-display", DISP, "-window", "root", raw)
    im = Image.open(raw).convert("RGB")
    W, H = im.size
    px = im.load()
    right = max(x for x in range(W) if px[x, 20] != (0, 0, 0)) + 1
    xb = next(y for y in range(10, H) if all(px[x, y] == (0, 0, 0) for x in range(10, right - 10, 50)))
    last = max(y for y in range(4, xb - 2) if any(px[x, y][0] < 128 for x in range(4, right - 4)))
    bottom = min(xb, last + 14)
    im.crop((0, 0, right, bottom)).save(f"{OUT}/{name}.png")
    os.remove(raw)
    with open(f"{OUT}/{name}.txt", "w") as f:
        f.write(pane().rstrip() + "\n")


def main():
    subprocess.run(["tmux", "kill-server"], capture_output=True)
    time.sleep(0.5)
    xvfb = subprocess.Popen(["Xvfb", DISP, "-screen", "0", "1400x1500x24", "-dpi", "96"], env=env)
    time.sleep(1.5)
    sh("tmux", "-f", "/dev/null", "new-session", "-d", "-s", "lab", "-x", str(COLS), "-y", str(ROWS),
       "env PS1='$ ' bash --norc --noprofile")
    sh("tmux", "set", "-g", "status", "off")
    term = subprocess.Popen(["xterm", "-geometry", f"{COLS}x{ROWS}+0+0", "-fa", "DejaVu Sans Mono",
                             "-fs", "11", "-bg", "white", "-fg", "black", "-b", "6",
                             "-e", "tmux", "attach", "-t", "lab"], env=env)
    time.sleep(2)
    wait_prompt()

    for i, ch in enumerate(parse_chunks()):
        if i == 0:
            type_line("clear"); time.sleep(0.5); wait_prompt()
            type_line("psql -U postgres -d college_db"); time.sleep(1); wait_prompt()
        else:
            type_line("\\! clear"); time.sleep(0.6); wait_prompt()
        for st in ch["stmts"]:
            for ln in st:
                type_line(ln)
                time.sleep(0.05)
            time.sleep(0.4)
            wait_prompt()
        time.sleep(0.8)
        screenshot(ch["id"])
        print("captured", ch["id"], ch["caption"])
    type_line("\\q")
    time.sleep(0.5)
    term.terminate(); xvfb.terminate()


main()

"""Cross-check every pgAdmin screenshot against a direct psql run of the same SQL.

For each query: (1) the text typed into the pgAdmin editor must equal the SQL in
sql/02_p4_join_queries.sql, (2) the result-grid cells scraped from pgAdmin at
capture time must equal the rows psql returns, (3) the PNG's SHA-256 is recorded.
"""
import hashlib, json, os, re, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
log = json.load(open(os.path.join(here, 'screenshots', 'capture_log.json')))
queries = {q['id']: q for q in json.load(open(sys.argv[1]))}
norm = lambda s: re.sub(r'\s+', ' ', s.replace(' ', ' ')).strip()
ok_all, report = True, []
for e in log:
    q = queries[e['id']]
    rows = subprocess.run(['psql17', '-h', '127.0.0.1', '-U', 'postgres', '-d', 'college_db', '-X',
                           '-A', '-t', '-F', '\x1f', '-P', 'null=[null]', '-c', q['sql']],
                          capture_output=True, text=True, check=True).stdout.rstrip('\n').split('\n')
    psql_rows = [r.split('\x1f') for r in rows if r != '']
    editor_ok = norm(e['editor_text']) == norm(q['sql'])
    grid_ok = e['grid'] == psql_rows
    sha = hashlib.sha256(open(os.path.join(here, 'screenshots', e['file']), 'rb').read()).hexdigest()
    ok_all &= editor_ok and grid_ok
    report.append({'id': e['id'], 'file': e['file'], 'editor_matches_sql': editor_ok,
                   'grid_matches_psql': grid_ok, 'rows': len(psql_rows), 'sha256': sha,
                   'pgadmin_status': e['status'], 'captured_at': e['captured_at']})
    print(f"{e['id']:>4}  editor={editor_ok}  grid==psql={grid_ok}  rows={len(psql_rows)}")
    if not grid_ok:
        print('   pgAdmin:', e['grid'][:3]); print('   psql   :', psql_rows[:3])
json.dump(report, open(os.path.join(here, 'screenshots', 'verification_report.json'), 'w'), indent=1)
print('ALL VERIFIED' if ok_all else 'MISMATCH FOUND'); sys.exit(0 if ok_all else 1)

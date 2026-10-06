"""Split 02_p4_join_queries.sql into one block per query (-- Qn. ... header)."""
import json, re, sys
src = open(sys.argv[1]).read()
blocks = re.split(r'\n(?=-- Q\d+\.)', src)
out = []
for b in blocks[1:]:
    b = b.strip()
    m = re.match(r'-- (Q\d+)\. (.*)', b)
    out.append({"id": m.group(1), "title": m.group(2).strip(), "sql": b})
json.dump(out, open(sys.argv[2], 'w'), indent=1)
print(len(out), "queries")

#!/bin/bash
# Usage: capture.sh <sql-file> <out.png> <db|-> <rows>
set -e
SQL=$1; OUT=$2; DB=$3; ROWS=${4:-60}
export DISPLAY=:99
CONN="psql -h /tmp -p 5433 -U postgres -P pager=off"
[ "$DB" != "-" ] && CONN="$CONN -d $DB"
xterm -fa 'DejaVu Sans Mono' -fs 10 -bg white -fg black +sb -b 10 -geometry 124x$ROWS \
  -xrm 'XTerm*cursorColor: white' -T psql \
  -e env PATH=/opt/pg17/bin:$PATH PS1='$ ' HOME=/tmp/xh bash --norc --noprofile -i &
XPID=$!
sleep 2
WID=$(xdotool search --pid $XPID | tail -1)
xdotool windowfocus --sync $WID; [ -n "$PRE" ] && { xdotool type --delay 8 "$PRE"; xdotool key Return; sleep 1; }; xdotool type --delay 8 "$CONN"; xdotool key Return
sleep 2
while IFS= read -r line || [ -n "$line" ]; do
  [ -n "$line" ] && xdotool type --delay 5 -- "$line"
  xdotool key Return
  case "$line" in *\;|\\*) sleep 1.5;; *) sleep 0.15;; esac
done < "$SQL"
sleep 2
import -window $WID "$OUT.raw.png"
kill $XPID
convert "$OUT.raw.png" -bordercolor white -border 1 -trim +repage -bordercolor white -border 14 "$OUT"
rm "$OUT.raw.png"
identify "$OUT"

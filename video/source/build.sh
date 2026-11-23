#!/bin/bash
# Full build: timings -> sfx cues -> audio mix -> parallel frame render -> encode
set -e
S=/tmp/claude-0/-home-user-endo-connections/5b3a7ac3-4798-5ac3-8803-0331f2d65480/scratchpad
OUT=${1:-/home/user/endo-connections/video/the-hidden-toothache.mp4}
cd $S
echo "Infinite Perspective" > music_name.txt
tts/.venv/bin/python assemble.py $S
export NODE_PATH=/opt/node22/lib/node_modules
node render.js "file://$S/web/index.html" sfx sfx.json
tts/.venv/bin/python mix.py $S Infinite_Perspective.mp3
TOTAL=$(python3 -c "import json;print(json.loads(open('$S/web/timings.js').read()[len('window.TIMINGS='):-1])['total'])")
NF=$(python3 -c "import math;print(math.ceil($TOTAL*30))")
mkdir -p frames
W=3; CH=$(( (NF + W - 1) / W ))
for i in $(seq 0 $((W-1))); do
  a=$((i*CH)); b=$(( (i+1)*CH )); [ $b -gt $NF ] && b=$NF
  node render.js "file://$S/web/index.html" frames $a $b frames > render_$i.log 2>&1 &
done
wait
mkdir -p "$(dirname "$OUT")"
ffmpeg -y -loglevel error -framerate 30 -i frames/f%06d.jpg -i final_mix.wav \
  -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -tune animation \
  -c:a aac -b:a 192k -movflags +faststart -shortest "$OUT"
echo "BUILD DONE $OUT $NF frames"

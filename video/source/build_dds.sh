#!/bin/bash
set -e
S=/tmp/claude-0/-home-user-endo-connections/5b3a7ac3-4798-5ac3-8803-0331f2d65480/scratchpad
OUT=${1:-/home/user/endo-connections/video/the-hidden-toothache-reel-clinicians.mp4}
cd $S
export NODE_PATH=/opt/node22/lib/node_modules VW=1080 VH=1920
node render.js "file://$S/web/reel_dds.html" sfx reel2/sfx.json
TMF=$S/web/dds_timings.js NARR=$S/reel2/narration.wav SFXF=$S/reel2/sfx.json OUTF=$S/reel2/mix.wav tts/.venv/bin/python mix.py $S Infinite_Perspective.mp3
TOTAL=$(python3 -c "import json;print(json.loads(open('$S/web/dds_timings.js').read()[len('window.TIMINGS='):-1])['total'])")
NF=$(python3 -c "import math;print(math.ceil($TOTAL*30))")
mkdir -p reel2/frames
W=3; CH=$(( (NF + W - 1) / W ))
for i in $(seq 0 $((W-1))); do a=$((i*CH)); b=$(( (i+1)*CH )); [ $b -gt $NF ] && b=$NF
  node render.js "file://$S/web/reel_dds.html" frames $a $b reel2/frames > reel2/render_$i.log 2>&1 & done
wait
ffmpeg -y -loglevel error -framerate 30 -i reel2/frames/f%06d.jpg -i reel2/mix.wav -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$OUT"
echo "BUILD DONE $OUT $NF frames"

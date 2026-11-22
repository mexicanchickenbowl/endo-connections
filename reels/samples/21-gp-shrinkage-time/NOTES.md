# 21 · Warm GP: when does it stop shrinking?

**Style:** strip-chart recorder / dilatometer print-out. Dark green hammertone instrument panel, cream cards in brass
corner mounts, scrolling cream chart paper with green-grey grid and sprocket holes, red (volume) and blue
(temperature) ink pens on a carriage, typewritten notes (Courier Prime, Special Elite title), violet rubber stamps
(Barlow Condensed), an analog stopwatch whose dial is the same composite time axis.

**Output:** `reels/out/21-gp-shrinkage-time.mp4`, 20.6 s, 1080x1920, 30 fps, silent. Poster at t = 19.2 s (complete
summary frame). Files: `index.html`, `reel.js`.

## Concept
The paper runs right to left under two pens. The time ruler changes scale twice (minutes, hours, days), each change
marked on the paper with a double line and the typed note "CHART SPEED CHANGED". A canal cutaway with a loupe sits
above the chart; its wall gap grows in step with the red trace. Past 24 h both pens lift and the paper runs blank.

## Storyboard (s)
| t | Chart | Cutaway / stopwatch | Reading card |
|---|---|---|---|
| 0–1.0 | Blank paper, pens lower (0.45–0.75) | GP glowing, no gap; crown pressed | (empty) |
| 1.0–5.2 | Minutes segment 0–10 min. Blue falls 75→37 °C, red drops. Stamp COOLING 4.6 | Glow fades, gap opens | 1.4–5.75 "1.0–2.3 % linear shrinkage / in 10 min · 75→37 °C · in vitro" |
| 5.2–6.0 | Paper stops, mark 1, note "CHART SPEED CHANGED" | hand enters HOURS | |
| 6.0–11.0 | Hours segment to 24 h. Blue flat, red creeps and flattens by 10 h. Bracket "45 min–10 h" 8.2, stamp CRYSTALLIZING 9.0 | Gap widens slowly | 6.1–10.9 "Keeps shrinking: 45 min–10 h / held at 37 °C · in vitro" |
| 11.0–11.8 | Stamp STABLE / IN VITRO, pens lift, mark 2, note | | 11.3 "Then stable to 24 h." |
| 11.8–13.8 | Days segment, no trace. 13.95 hatch + stamp NO DATA FOUND | hand in DAYS | 12.6 "After 24 h: no data found" (out 15.3) |
| 15.35–19.6 | Whole record stays visible | New card: sealer film, plugger compacts warm GP, cools with a hairline gap | 15.7–19.6 "Compact it warm. Use sealer. (in vitro)" |
| 19.6–20.6 | Text out, fast paper feed (motion-blurred), pens and stopwatch reset | Card back to start | loops into frame 0 |

Reading times checked against `Kit.readSecs`: 3.85 s, 4.3 s, 3.6 s / 2.3 s, 3.4 s fully visible.
Must-read words: about 63.

## On-screen claims and sources
All facts come from `RESEARCH.md` (fact-checked brief); I ran no new searches.
1. "1.0–2.3 % linear shrinkage in 10 min · 75→37 °C · in vitro": Lottanti S, Tauböck TT, Zehnder M. J Endod
   2014;40:721-4. PMID 24767571 (abstract: 0.96 ± 0.20 % to 2.31 ± 0.26 %, 3 brands). 10 min is the observation window.
2. "Keeps shrinking: 45 min–10 h · held at 37 °C · in vitro" and bracket "45 min–10 h": Lee CQ, Chang Y, Cobb CM,
   Robinson S, Hellmuth EM. J Endod 1997;23:579-82. PMID 9587286 (abstract). Four products; the abstract does not
   define time zero; slow water-bath cycle.
3. Stamp "CRYSTALLIZING": inferred mechanism, not stated by Lee. Basis: Grassi MD et al. J Endod 1989;15:517-21,
   PMID 2639948 (isothermal shrinkage during crystallization); Schilder H et al. OOO 1985;59:285-96, PMID 3856822.
   The source line of that scene says "mechanism inferred (Grassi 1989 J Endod)".
4. "Then stable to 24 h." and stamp "STABLE / IN VITRO": Lee 1997 (24-h hold).
5. "After 24 h: no data found" and stamp "NO DATA FOUND": literature search (RESEARCH.md L4). Not "never measured".
6. "Compact it warm. (in vitro)": Marlin J, MSD thesis, Boston University 1971, thesis abstract only. Published as
   Marlin J, Schilder H. OOO 1973;36:872-9, PMID 4524837; the paper was not read.
7. "Use sealer. (in vitro)": Wu MK, Fan B, Wesselink PR. Int Endod J 2000;33:121-5. PMID 11307452 (abstract; more
   leakage without sealer at 48 h).
8. Scale plate "75°C" / "37°C": start and end of Lottanti's controlled drop.

## What is schematic
- Shapes of both traces, including how the drop is split between cooling and the tail. No y-scale is shown.
- The time axis is a composite of two bench experiments (legend: "CURVES SCHEMATIC · BENCH DATA · COMPOSITE TIMELINE").
- When the blue trace reaches 37 °C inside the 10-min window.
- The canal cutaway: gap exaggerated (labelled); the compaction/sealer card is labelled "schematic" and shows a
  smaller gap, not none.
- Stopwatch read-out and "days ?" ticks follow the same composite axis.
- Top and bottom panel lettering (model name, chart-speed knob) is decoration.

## Deviations from the brief
- No "seconds" scale: no source gives seconds to cool or stiffen, so the ruler runs minutes, hours, days.
- No four-product fan of traces: only the range is known, so one trace plus the bracket.

## Design rationale
Machine-printed items (traces, ticks, tick labels) appear at the pen; operator items (stamps, notes, bracket) land on
paper already recorded. The record is 826 px long so the whole run fits on screen for the summary frame. Red ties the
title question, the volume trace, the bracket and the key numbers together.

## Known weaknesses
- Phase stamps land near the end of each phase, because they need recorded paper to sit on.
- "sealer" in the loupe touches the lens rim.
- Scale-plate and legend labels are 30 px; dial zone names are 28 px (supplementary).

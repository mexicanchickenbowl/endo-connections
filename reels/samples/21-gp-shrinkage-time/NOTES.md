# 21 · Warm GP: when does it stop shrinking?

**Style:** strip-chart recorder / dilatometer print-out. Dark green hammertone instrument panel, cream cards in brass
corner mounts, scrolling cream chart paper with green-grey grid and sprocket holes, red (GP size) and blue
(temperature) ink pens on a carriage, typewritten notes (Courier Prime, Special Elite title), violet rubber stamps
(Barlow Condensed), an analog stopwatch whose dial is the same composite time axis.

**Output:** `reels/out/21-gp-shrinkage-time.mp4`, 20.6 s, 1080x1920, 30 fps, silent. Poster at t = 19.2 s (complete
summary frame). Files: `index.html`, `reel.js`.

## Concept
The paper runs right to left under two pens. The time ruler changes scale twice (minutes, hours, days); each change
is marked on the paper with a double line, the first one also with the typed note "CHART SPEED CHANGED". A no-sealer
canal cutaway with a loupe sits above the chart; its wall gap grows in step with the red trace. Past 24 h both pens
lift, the stopwatch stops at ">24 h" and the paper runs blank.

## Storyboard (s)
| t | Chart | Cutaway / stopwatch | Reading card |
|---|---|---|---|
| 0–0.7 | Blank paper, pens lower (0.25–0.55) | GP glowing, no gap, no gap label; crown pressed 0.5–0.7 | 0.8 typing starts |
| 0.7–5.2 | Minutes segment 0–10 min (300 px). Blue falls 75→37 °C, red drops. "1.0–2.3% linear" prints under the red trace as the paper passes the pen. Stamp COOLING 4.3 | Glow fades, gap opens, "gap exaggerated" fades in with it | 0.8–5.85 "1.0–2.3 % linear shrinkage / in 10 min · 75→37 °C" |
| 5.2–6.0 | Paper stops, mark 1, light note "CHART SPEED CHANGED" | read-out 10 min | |
| 6.0–11.0 | Hours segment to 24 h (346 px). Blue flat, red creeps and flattens by 10 h. Bracket 8.2 + "45 min–10 h" 8.5, stamp CRYSTALLIZING? 9.86 | Gap widens slowly | 6.1–10.9 "Keeps shrinking for 45 min–10 h / held at 37 °C" |
| 11.0–12.1 | Stamp STABLE 11.1, mark 2 at 11.5, pens lift 11.7–12.0 | read-out 24 h | 11.3 "Then stable to 24 h." (out 15.3) |
| 12.1–13.9 | Days segment (180 px), no trace. 14.05 hatch + stamp NO DATA FOUND | hand stays on 24 h, read-out ">24 h" | |
| 15.35–19.6 | Whole record stays visible; paper shaded 20 % 15.5–18.9 so the eye goes to the card | New card: sealer film, plugger compacts warm GP, cools with a hairline gap ("illustration") | 15.7–19.6 "Compact it warm. Use sealer. (in vitro)" |
| 19.6–20.6 | Text and annotations fade (19.6–19.85), fast paper feed (motion-blurred, up to 26 sub-samples), pens and stopwatch reset | Card back to start | loops into frame 0 |

Reading times, fully visible vs `Kit.readSecs`: caption 1 4.3 s (3.8), caption 2 4.1 s (3.8), caption 3 3.7 s (2.3),
payoff 3.3 s (2.9; payoff scene 3.9 s). Must-read words: about 50 (title 7, captions 29, chart print/stamps/notes 14).
Diagram labels (legend, ruler, scale plate, card labels) add about 28.

## On-screen claims and sources
1. "1.0–2.3 % linear shrinkage / in 10 min · 75→37 °C" and the chart print "1.0–2.3% linear": Lottanti S, Tauböck TT,
   Zehnder M. J Endod 2014;40:721-4. PMID 24767571 (abstract: brand means 0.96 ± 0.20 % to 2.31 ± 0.26 %, 3 backfill
   brands). 10 min is the observation window. The range is the spread of three brand means, not of single specimens.
2. "Keeps shrinking for 45 min–10 h / held at 37 °C" and bracket "45 min–10 h": Lee CQ, Chang Y, Cobb CM, Robinson S,
   Hellmuth EM. J Endod 1997;23:579-82. PMID 9587286 (abstract). The range is the time to stabilize across four
   products; GP was first heated to 80 °C in a slow water-bath cycle; the abstract does not define time zero, so the
   bracket position on the composite axis is schematic.
3. Stamp "CRYSTALLIZING?": inferred mechanism, hence the question mark; not stated by Lee. Basis: Grassi MD et al.
   J Endod 1989;15:517-21, PMID 2639948 (isothermal shrinkage during crystallization); Schilder H et al. OOO
   1985;59:285-96, PMID 3856822. The COOLING and CRYSTALLIZING? stamps are not exclusive phases: Meyer KM et al.,
   Schweiz Monatsschr Zahnmed 2006;116:356-61 (PMID 16708520; abstract) found the fastest shrinkage between 55 and
   40 °C for conventional GP (45–40 °C for the α/β Multifill GP), and Hsu YH et al., J Dent Sci 2020;15:28-33 (PMID
   32256997; PMC7109509 full text, Results) found crystallization exotherms on cooling at 52 and 32 °C (5 °C/min;
   52 °C only at 20 °C/min) in soft-type backfill GP only; the regular type showed none. So crystallization
   probably starts during cooling and continues at 37 °C, at least in some products.
4. "Then stable to 24 h." and stamp "STABLE": Lee 1997 (24-h hold), one study. Goodman AS, "The thermo-mechanical
   properties of gutta-percha", M.Sc.D. thesis, Boston University (hdl.handle.net/2144/40150; thesis note 1973, the
   repository record says "date issued 1976"; thesis abstract and OCR methods read; the volume data behind Schilder
   1985) instead says contraction on cooling to 37 °C "continued over a 24 hour holding period".
   The caption states the disagreement.
5. Stamp "NO DATA FOUND", ruler "days ?", stopwatch ">24 h": literature search of PubMed abstracts (RESEARCH.md L4).
   Not "never measured". Indirect long-term data point to expansion, not more shrinkage: Wu 2000 (PMID 11307452,
   leakage of sealer-free GP fell by 6 months; expansion is the authors' inference) and Michaud 2008 (PMID 19026888,
   GP cone sections expanded in eugenol at 24 h, 7 d and 30 d; cones not heat-cycled).
6. "Compact it warm. (in vitro)": Marlin J, MSD thesis, Boston University 1971 (hdl.handle.net/2144/45904), thesis
   abstract only. Schilder warm vertical technique (GP temperature rise 4–20.5 °C); "more than compensates for any
   shrinkage ... upon cooling"; the abstract asks for confirmation studies. Probably published as Marlin J, Schilder H.
   OOO 1973;36:872-9, PMID 4524837 (different title, no abstract, paper not read). Not tested against 75 °C backfill
   GP or the hours-long tail.
7. "Use sealer. (in vitro)": Bradshaw GB, Hall A, Edmunds DH. Int Endod J 1989;22:17-20. PMID 2599657 (abstract: "The
   sealing ability of thermoplasticized gutta-percha was enhanced by the use of a sealer"; dye penetration, injected
   GP; lateral condensation leaked least).
8. Scale plate "75°C" / "37°C": start and end of Lottanti's controlled drop.

## What is schematic
- Shapes of both traces, including how the drop is split between cooling and the tail. No y-scale is shown. The red
  trace is labelled "GP SIZE" because its first segment is tied to a linear % and its second to a volume dilatometer.
- The time axis is a composite of two bench experiments (legend: "SCHEMATIC CURVES · 2 BENCH STUDIES (IN VITRO)").
- When the blue trace reaches 37 °C inside the 10-min window.
- Both canal views are illustrations. No cited study measured a wall gap, in a canal or over hours. Card A is headed
  "NO-SEALER CANAL · SCHEMATIC" with "gap exaggerated"; card B is labelled "illustration" and shows a smaller gap,
  not none.
- The stopwatch dial follows the same composite axis and stops at 24 h; the dashed arc past it is empty.
- Top and bottom panel lettering (model name, chart-speed knob) is decoration.

## Deviations from the brief
- No "seconds" scale: no source gives seconds to cool or stiffen, so the ruler runs minutes, hours, days.
- No four-product fan of traces: only the range is known, so one trace plus the bracket.

## Design rationale
Machine-printed items (traces, ticks, tick labels, the cooling reading) appear at the pen; operator items (stamps,
note, bracket) land only on paper that has already passed the pen (stamp times are computed from the stamp width).
The record is 826 px long so the whole run fits on screen for the summary frame. Red ties the title question, the
size trace, the bracket and the key numbers together.

## Review changes (after independent science + design review)
Science
- Legend "VOLUME" is now "GP SIZE" (linear % and volume are not merged).
- Payoff source line is now "Marlin 1971 BU thesis · Bradshaw 1989 Int Endod J". Wu 2000 no longer supports "Use
  sealer" (its main result is that sealer-free GP leaked less at 6 months); Bradshaw 1989 was checked on PubMed
  (abstract). "publ. OOO 1973" removed; meta.json says "probably published as".
- Card A header is "NO-SEALER CANAL · SCHEMATIC"; "gap exaggerated" fades in only once a gap is drawn. Card B label
  "schematic" is now "illustration".
- Stamp is "CRYSTALLIZING?"; the long two-citation source line is now "Lee 1997 J Endod".
- Stopwatch shows ">24 h" past 24 h and the hand stays on the 24 h tick (no "6 d" on the poster); zone names removed.
- "37°C" sits above its blue tick inside the temperature lane, clear of the red lane and of both pens.
- Caption 2 is "Keeps shrinking for 45 min–10 h" (44 px so that it fits).
- Caption (700 characters) now carries: Goodman/Schilder disagreement, "by product", inferred crystallization,
  indirect expansion data, compaction limited to cooling shrinkage, "neither covers the late tail", "no wall gap
  measured". meta.json claims rewritten to match (brand means, Bradshaw, Goodman, Wong lead).
Design
- Text cut from about 63 to about 50 must-read words: "in vitro" appears once in the legend and once in the payoff;
  second "CHART SPEED CHANGED" note, "After 24 h: no data found" line and the "IN VITRO" stamp line deleted.
- Caption timings now exceed `Kit.readSecs`; caption second lines are 38 px bold.
- Strip rebalanced (10 min = 300 px, 24 h = 646 px, days 180 px); stamp anchors recomputed.
- Summary frame: "1.0–2.3% linear" printed under the cooling trace, bracket label 36 px bold, STABLE 42 px.
- Lanes shifted so the parked pens no longer cover the scale-plate labels.
- Loupe B: wall moved left, sealer film 22 px wide, "sealer" on a typed label strip inside the rim with the leader dot
  in the film.
- Events around 11–12 s staggered (stamp 11.1, caption 11.3, mark 11.5, pen lift 11.7, feed 12.1); first note demoted
  to regular weight, gray.
- Fast feed: up to 26 blur sub-samples and annotations fade out first, so no comb pattern.
- Title header "WARM GUTTA-PERCHA" 44 px, "OPERATOR" removed. Read-out window widened. Mark triangles moved inside the
  grid; "10 min" / "24 h" labels moved 8 px away from the mark lines. Ink starts at 0.7 s.
- Dentin block shortened so "gap exaggerated" (30 px) has a clean strip; header 24 px, darker green.
- Chart paper is shaded 20 % during the payoff (15.5–18.9 s), clear again for the poster frame.

Deviations from the review, with reasons
- Chart print is "1.0–2.3% linear" at 30 px bold, not "1.0–2.3 %" at 34 px: the word "linear" must travel with the
  number on the poster frame, and 34 px with "linear" does not fit the 300 px cooling segment.
- Stopwatch zone names were removed instead of enlarged to 30 px: at 30 px they do not fit the 200° dial without
  the hand crossing them.
- "37°C" is above its tick (science item) rather than below it (design item); the blue pen passes over it for about
  2 s during cooling.
- Michaud 2008 is cited in NOTES.md and meta.json only; the 700-character caption names Wu 2000 for the expansion hint.
- The title is 80 px (it always was; the review assumed 92 px), so the header change needed no size cut.

Checks: stills in `_stills/fix1`, `_stills/fix` (10 frames, `--safe`), `_stills/fix2`; frames pulled from the final MP4
in `_stills/fix-mp4`; ffprobe: h264 1080x1920, 30 fps, 618 frames, 20.6 s.

## Final QA (fresh-eyes pass)
Checked 23 stills with `--safe` (`_stills/final-qa`), 12 transition stills (`_stills/final-qa2`), the caption
changeover (`_stills/final-qa3`) and frames pulled from the final MP4 (`_stills/final-qa-mp4`). No clipped, overlapping
or sub-30 px must-read text; nothing must-read in the no-go zones; hook readable from frame 0; payoff fully visible
about 3.3 s; poster (19.2 s) reads inside the 3:4 crop. Citations on screen and in meta.json re-fetched from PubMed
(PMIDs 24767571, 9587286, 2599657, 4524837, 11307452, 19026888, 6985547, 2639948, 3856822): all match.

Defects found and fixed
- Loop pop: the CHART SPEED knob ended on "cm/h" (0°) but frame 0 shows "cm/min" (−52°). It now turns back to
  cm/min during the reset (19.9–20.4 s), so the last frame equals the first.
- Caption ghosting at 6.10–6.15 s: caption 1 was still fading (20 → 0 %) while caption 2 typed its first letters on
  the same line. Caption 1 now ends at 5.85 s and is gone by 6.10 s (fully visible 4.3 s, `Kit.readSecs` 3.8 s).
- meta.json caption: the 24-h contraction is attributed to Goodman's thesis alone (it is not in the Schilder 1985
  PubMed abstract) and the Refs line now lists "Goodman 1973, Marlin 1971, BU theses"; Schilder 1985 stays for the
  inferred crystallization. 699 characters. The Wu 2000 source in the claims list is now a full citation.

Left as is (judged not defects): the motion-blurred ruler labels show a faint comb for a frame or two at the start of
the fast feed (19.85–19.95 s); card headers are 24 px fine print.

Final render: ffprobe h264 1080x1920, 30 fps, 618 frames, 20.6 s = `REEL.duration`.

## Citation audit (independent, PubMed re-check)
Scope: every citation on screen, in meta.json (claims and the caption Refs line) and in NOTES.md / RESEARCH.md.
Method: PubMed metadata + abstract re-fetched for PMIDs 24767571, 9587286, 2639948, 3856822, 11307452, 19026888,
6985547, 4524837, 2599657, 16708520, 32256997, 41872366, 8269881, 6948908, 34492231, 41685848, 39873081, 40217031;
PMC full text re-read for Hsu 2020 (PMC7109509); the other 21 journal citations in RESEARCH.md matched to their PMIDs
by journal + year + volume + first page + first author (PubMed citation matcher); both BU thesis records re-read in
`_scratch/` (Marlin: repository abstract; Goodman: repository abstract + OCR text).

Result
- On screen: "Lottanti 2014 J Endod", "Lee 1997 J Endod" (twice), "Marlin 1971 BU thesis · Bradshaw 1989 Int Endod J".
  First author, year and journal are right for all four, and each abstract (thesis abstract for Marlin) contains the
  number or statement shown with the stated conditions (linear %, 10 min, 75→37 °C; 45 min–10 h, held at 37 °C,
  24-h hold; compaction; sealer). No on-screen change, so the video was not re-rendered (ffprobe of the existing
  MP4: h264 1080x1920, 30 fps, 618 frames, 20.6 s).
- meta.json: every first author, year, journal, volume, page range and PMID belongs to one real paper and supports
  its claim. No wrong PMID, year, journal or author found.

Changes made
- NOTES claim 3 and meta.json claim 3: Hsu 2020's exotherms (52 and 32 °C) were found in soft-type backfill GP
  only (regular type: none) and the figures are in the PMC full text, not the abstract; Meyer 2006's "55–40 °C"
  is for conventional GP (α/β Multifill: 45–40 °C). Both qualifiers and full citations added; meta.json claim 3
  now names Hsu 2020 as the basis for "probably starts during cooling" (it named only Grassi and Schilder).
- NOTES claim 4, meta.json claims 4 and 6: thesis handles added (Goodman hdl.handle.net/2144/40150, Marlin
  hdl.handle.net/2144/45904); Goodman's year discrepancy noted (thesis note 1973, repository "date issued 1976").
- RESEARCH.md (b)6, suggested meta.json claims, storyline row and short Refs line still paired "Use sealer" with
  Wu 2000 and wrote "publ. OOO 1973" for Marlin. They now point to Bradshaw 1989 and "probably published as", in
  line with the Addendum.

Not resolved
- Wong, Peters & Lorton 1981 is still unread (see Known weaknesses). The stamp says NO DATA FOUND, which is a
  statement about the search, so the on-screen wording was kept.

## Known weaknesses
- Phase stamps land near the end of each phase (COOLING 4.3 s, CRYSTALLIZING? 9.9 s), because they need recorded
  paper to sit on.
- The caption is telegraphic to stay at 700 characters.
- Before posting, someone with journal access should read Wong, Peters & Lorton, J Endod 1981;7:551-8 (PMID
  6985547); if it reports warm-GP volume beyond 24 h, the NO DATA FOUND stamp must change. Still unread at the
  citation audit (no PubMed abstract, not in PMC). The only description found is second-hand: Abedi H et al., Dent
  Res J (Isfahan) 2009;6:55-58 (PMID 21528031, PMC3075455 full text) says Wong et al. used split molds and that
  vertical-condensation fills were 2.8 % heavier than lateral-condensation fills. That is a weight comparison; it
  neither confirms nor excludes volume-over-time data. Part 2 (Wong, Peters, Lorton & Bernier, J Endod 1982;8:4-9,
  PMID 6948908, chloroform techniques) is indexed with the MeSH term "Time Factors", so the series may have
  followed fillings over time.
- Card headers are 24 px and the source lines 25 px (fine print). Peak frame time in the fast feed is about 150 ms.

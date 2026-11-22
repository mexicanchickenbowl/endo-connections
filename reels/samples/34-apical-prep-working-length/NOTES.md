# 34 · Working length and apical preparation size: what the evidence says

**Style:** whiteboard marker talk. A portrait dry-erase board with an aluminum frame, a marker tray (four markers, felt
eraser, tray shadow on the wall), faint ghosting of earlier writing, spare magnets, a soft glare band. Drawings in four
marker colors (black = anatomy, blue = labels / instruments / irrigant, red = worse outcome / debris, green = target)
with hand-drawn wobble from the vendored **rough.js** (seeded, so every frame is deterministic), yellow and green
highlighter swipes, magnet-held paper slips for the key numbers, a yellow sticky for the evidence tag. Fonts: Permanent
Marker (header, all numbers) and Patrick Hand (notes).
**Duration:** 25.6 s · 1080×1920 · 30 fps · silent · poster at 23.7 s (the complete summary board). US spelling.
**Files:** `index.html` (page contract), `wb.js` (marker engine: rough.js → polylines → draw-on strokes, glyph-by-glyph
handwriting, paper slips, magnets, tape, eraser, highlighter), `reel.js` (timeline, three scenes, props, `render(t)`).

## Concept
A teacher's board that asks two questions in its header and answers them in turn. **Where to stop?** A big apex is
sketched (the foramen opens on the side of the root, short of the radiographic apex; the minor constriction sits inside
it), a paper ruler slides in, a green highlighter marks 0–2 mm short of the radiographic apex, a file settles at the
constriction, and the three classic outcome numbers go up on magnets at their own levels (short, in the zone, long).
**How big?** The board is wiped; two apical thirds are drawn side by side with the same needle at the same depth:
in the small preparation the irrigant turns back just past the needle and debris stays apically, in the larger one the
stream reaches the apical third and most debris leaves. The one clinical trial result goes up on a slip. The board is
wiped again and rebuilt as a two-line summary with every number re-pinned and an evidence-quality sticky.

## Storyboard (seconds)
| t | Beat | Must-read text on screen |
|---|------|--------------------------|
| 0–3.4 | **Hook + anatomy.** Header is fully written and highlighted on frame 0. Black marker draws the root outline, canal walls (constriction, then the funnel to a side-exit foramen), CDJ line, dentin hatch, cross-hatched cementum, socket line. Blue labels with leader dots from 2.3 s. | **WHERE TO STOP? · HOW BIG?** · minor constriction · CDJ · major foramen · radiographic apex · fine print "schematic · not to scale" |
| 3.4–12.0 | **Part 1, where to stop.** Red double underline under the first question. Paper ruler slides in (3.45–4.1), dashed zero line from the root tip, green highlighter paints 0–2 mm (4.3–4.9), blue file slides down and stops at the constriction, 1 mm short on the ruler (4.7–5.55). Slips snap on: 94% (5.35), red overfill is scribbled beyond the foramen and 76% (6.35), 68% (7.1). Denominator is written (7.5–8.05), then a red brace spanning one millimeter with the per-mm note (8.15–9.1), source line, and a green circle round the file tip (9.8). Slips and ruler slide off from 11.7. | ruler "mm 0 1 2 3" · **94%** 0–2 mm short · **76%** long · **68%** >2 mm short · healed · necrotic + lesion · 8–10 yr · per mm short **~12–14%** lower odds · src "Sjögren 1990, J Endod · Chugal 2003, OOOOE · Ng 2011, Int Endod J" |
| 12.0–12.8 | Eraser lifts off the tray and wipes the board in four sweeps; the ink disappears exactly where it has passed. | — |
| 12.5–18.6 | **Part 2, how big.** Underline moves to the second question. Two roots are drawn (12.55–14.3), the same needle slides into both (13.65–14.25), labels, then blue dashed stream lines march: turn back just below the needle in the small canal, run to the apical end and back up the walls in the large one; red specks are carried out of the large canal (two stay), and stay apically in the small one. Caption 15.0–16.05. RCT slip snaps on at 16.4. | **<#30** · **≥#30** · irrigant reaches apical third · (in vitro) · debris · slip: RCT · mand. molars · healed at 12 mo · binding file +2 → **48%** · +3 or more → **71–92%** · fine print "schematic · not to scale" · src "Khademi 2006 · Boutsioukis 2021 · Saini 2012, J Endod" |
| 18.6–19.4 | Second wipe; the RCT slip is lifted and re-pinned higher while the eraser works under it. | — |
| 19.1–24.2 | **Summary (takeaway).** Line 1 is written (19.2–19.7) and highlighted, the three outcome slips fly back in, denominator and per-mm note, line 2 (20.6–21.1), the #30 line, the yellow sticky snaps on at 21.15, source line, second highlight (21.65–21.9). Everything is on the board from 21.6 s; slips start to leave at 24.18 s: **2.6 s complete hold**, line 1 visible 4.8 s. | ① Infected canals: stop 0–2 mm short · ② Binding file +3 sizes beat +2 · sticky **Certainty: LOW** · cohorts · in vitro · small RCTs · (repeats: the three slips, denominator, per-mm note "(2 cohorts)", RCT slip, "≥#30: irrigant reaches apical third (in vitro)") · one 22 px source line |
| 24.5–25.6 | Final wipe; eraser returns to the tray. Last frame = first frame (checked: identical), so the loop is seamless and no two texts ever overlap. | — |

Reading times (`Kit.readSecs` needed vs seconds fully visible): per-mm note 2.6 / 3.1; denominator 2.3 / 4.5; slips
94% 2.0 / 6.1, 76% 1.4 / 5.1, 68% 2.0 / 4.3; part 2 caption incl. "(in vitro)" 2.6 / 2.8; RCT slip 5.0 / 7.7 (stays into
the summary); summary line 1 2.6 / 4.8; line 2 2.6 / 3.7; #30 line 2.9 / 3.6; sticky 2.9 / 3.0. Anatomy labels stay
for more than 8 s; the header never leaves.

Text budget: about 74 must-read words in total if every label and every number-with-unit counts as one word (header 5,
anatomy labels 7, ruler 1, three slips 8, denominator 4, per-mm note 6, part 2 labels and caption 9, RCT slip 14,
summary lines and sticky 20). That is above the ~60 target; it is the price of putting a denominator on every number.
All must-read text is 36 px or larger (33.8 px for the RCT slip header after it is re-pinned at 94% scale); the only
smaller text is fine print: three source lines (26, 26, 22 px) and "schematic · not to scale" (26 px).
Seven evidence numbers on screen: 94, 76, 68, 12–14, #30, 48, 71–92 (plus the 0–2 mm zone itself).

## On-screen claims and sources
Sources were researched and independently fact-checked in `RESEARCH.md`. In addition, on 2026-11-22 I re-read on PubMed
the abstracts of PMIDs 2084204, 12847449, 21366626, 16631839, 34118256, 22980168 and 38135112 against the exact wording
below. "Abstract" = the PubMed abstract contains it; "full text" = read in the paper by the fact-checker.

1. **Apex sketch: radiographic apex, major foramen opening on the side of the root, minor constriction inside it, CDJ.**
   Schematic textbook anatomy (Hargreaves & Berman, *Cohen's Pathways of the Pulp*; cited as a textbook, not re-read).
   No anatomy number is printed. The off-tip foramen is consistent with Martos J et al., Int Endod J 2009;42(4):329–34,
   PMID 19220517, doi:10.1111/j.1365-2591.2008.01513.x (abstract: foramen at the tip of the root in 40%).
2. **Green zone "0–2 mm short" of the radiographic apex; slips 94% (0–2 mm short), 76% (long), 68% (>2 mm short);
   "healed · necrotic + lesion · 8–10 yr".**
   Sjögren U, Hägglund B, Sundqvist G, Wing K. J Endod 1990;16(10):498–504, PMID 2084204,
   doi:10.1016/S0099-2399(07)80180-4. The abstract confirms the design (356 patients, 8–10 yr), 86% healing with
   necrosis + radiolucency, and that the level of root filling significantly affected outcome. **The 94 / 76 / 68
   breakdown is not in the abstract; it was confirmed only through open-access papers that quote it (PMC3574741); the
   primary full text was not read.** The unit is roots, so the screen says "necrotic + lesion", never "teeth".
   "Long" = overfilled. Primary-verified fallback if this is challenged: Ng 2011 full text, primary treatment per root,
   2–4 yr: flush 86%, short 74%, long 67% (not shown).
3. **"per mm short ~12–14% lower odds" (summary adds "(2 cohorts)").**
   Chugal NM, Clive JM, Spångberg LSW. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2003;96(1):81–90,
   PMID 12847449, doi:10.1016/s1079-2104(02)91703-8 (abstract: "In teeth/roots with apical periodontitis, a millimeter
   loss in working length increased the chance of treatment failure by 14%").
   Ng Y-L, Mann V, Gulabivala K. Int Endod J 2011;44(7):583–609, PMID 21366626, doi:10.1111/j.1365-2591.2011.01872.x
   (abstract: extension of canal cleaning as close as possible to the terminus, P = 0.001; full text read by the
   fact-checker: odds of success reduced by 12%, OR 0.88, 95% CI 0.79–0.97, per mm un-instrumented short of the
   apex-locator zero). Worded as odds, never as percentage points of success.
4. **"<#30" vs "≥#30": "irrigant reaches apical third (in vitro)"; "debris" in the smaller preparation.**
   Khademi A, Yazdizadeh M, Feizianfard M. J Endod 2006;32(5):417–20, PMID 16631839, doi:10.1016/j.joen.2005.11.008
   (abstract: SEM of debris and smear layer in the apical third of extracted mandibular molar mesiobuccal canals,
   master apical file #20/25/30/35: "the minimum instrumentation size needed for penetration of irrigants to the apical
   third of the root canal is a #30 file"). The stream lines are a drawing, in line with the flow model of
   Boutsioukis C, Gutierrez Nova P. J Endod 2021;47(9):1487–95, PMID 34118256, doi:10.1016/j.joen.2021.06.001
   (abstract: irrigant could not penetrate to working length at 20 or 25/.06; a 30-G open-ended needle at low flow
   reached it at 30/.06). Boutsioukis 2010 (Int Endod J) is deliberately not cited: it did not model size 30.
5. **Slip "RCT · mand. molars · healed at 12 mo: binding file +2 → 48%; +3 or more → 71–92%".**
   Saini HR, Tewari S, Sangwan P, Duhan J, Gupta A. J Endod 2012;38(10):1309–15, PMID 22980168,
   doi:10.1016/j.joen.2012.06.024 (abstract: mandibular first molars; 167 randomized, 129 evaluated at 12 months;
   healing 48%, 71.43%, 80%, 84.61%, 92% for 2, 3, 4, 5, 6 sizes past the first apical binding file; only the +2 group
   was significantly worse).
6. **Summary line 1 "Infected canals: stop 0–2 mm short".** Restates items 2–3 (wording approved by the fact-check;
   "infected" because Chugal 2003 found the opposite trend in teeth with a normal pulp and periapex).
7. **Summary line 2 "Binding file +3 sizes beat +2"** and **"≥#30: irrigant reaches apical third (in vitro)".**
   Descriptive restatement of items 5 and 4. The +2 group was also the worst in Fatima S et al., J Endod
   2021;47(9):1345–51, PMID 34058250 (abstract), and a 2026 systematic review found +3 better than +2 (Shao W et al.,
   J Endod 2026, online ahead of print, PMID 42946041, doi:10.1016/j.joen.2026.10.008; in NOTES only).
8. **Sticky "Certainty: LOW · cohorts · in vitro · small RCTs".**
   Sabeti MA, Saqib Ihsan M, Aminoshariae A. J Endod 2024;50(3):292–8, PMID 38135112,
   doi:10.1016/j.joen.2023.11.007 (abstract: two studies, "overall quality of evidence was low") for apical size and
   healing. For working length the tag is a description of the evidence type (observational cohorts with substantial
   heterogeneity), **not a published GRADE rating**.

### Residual risk recorded from the fact-check
- Three number sets rest on secondary quotation only because the primary full texts could not be opened:
  **Sjögren 1990's 94 / 76 / 68 (on screen)**, Dummer 1984's 0.89 mm (0.07–2.69) and Kuttler 1955's 0.524 / 0.659 mm
  (both kept off screen and out of the caption).
- The ESE S3 guideline (2023) was not opened and is not cited for any recommendation.
- Shao 2026 is in press and is cited only here, as "online ahead of print".
- Not claimed anywhere: that #30 is a clinical threshold for healing; that a larger size eliminates bacteria; "2 RCTs"
  or "RCTs agree" (Souza 2012, Eur J Dent, PMID 23077417, and Mittal 2016, J Conserv Dent, PMID 27656054, found no
  lasting benefit of extra enlargement); that the constriction can be located clinically.

## What is schematic
- The apex sketch is not to scale (labeled). The ruler is internally consistent at 170 px per mm: the green band is
  exactly 0–2 mm from the root tip, the file stops at the constriction, which is drawn 1 mm short of the tip, and the
  foramen opens about 0.6 mm short on the side. These are illustrative positions, not measurements; anatomy varies and
  a constriction is often absent (Wu 2000, PMID 10630950).
- The cementum layer and where the CDJ meets the canal wall are drawn for orientation only.
- Part 2: canal widths are exaggerated; the needle is the same width and depth in both canals; it is drawn open-ended;
  the irrigant never leaves the foramen; debris is reduced, not eliminated, in the larger canal (two specks stay). The
  stream lines and specks are a drawing, not a simulation, and carry no scale. Labeled "schematic · not to scale" and
  "(in vitro)".
- The RCT slip is laid out in rows so that its two results do not line up under the two canals (the trial compared
  sizes relative to the first binding file, not ISO sizes).

## Design rationale
- One canvas, three layers of meaning: static board (pre-rendered once), erasable marker ink (drawn per scene into an
  ink layer, given a streaky dry-marker texture, multiplied onto the board), and physical props on top (paper, magnets,
  tape, eraser). The eraser removes ink only, exactly where its felt has passed; paper slips are slid off or re-pinned.
- The ghost layer is the faint residue of all three scenes, baked into the board, so the board looks used and the
  last frame equals the first.
- Numbers are always on paper, large and neat (Permanent Marker, 78–90 px), colored by meaning; qualifiers are in
  Patrick Hand beside them. The header is the hook and the table of contents: a red underline shows which question is
  being answered.
- Safe areas: all text within x 64–1016, y 230–1580; nothing readable in the right-hand button column (x > 960 below
  y = 1100), checked with `--safe`. The handle is on a strip of masking tape at the lower left.

## Change log
- v1: first build. Self-QA passes: (1) fixed a missing "i" in "file" (per-glyph layout now sums single-glyph advances,
  so ligatures cannot swallow a letter), reduced the ghosting from 8.5% to 2.6% and removed blurry dust patches, added
  cementum cross-hatch, removed the "4" that collided with "mm" on the ruler, opened the top of the file;
  (2) slips now leave before the eraser arrives, the RCT slip is held in front of the board during the second wipe,
  debris is carried out in step with the returning stream, summary retimed for a 2.6 s complete hold, total 26.0 → 25.6 s;
  (3) summary source line shortened to stay out of the button column, RCT slip changed from two columns to rows,
  part 2 source line now names the flow-model paper, "(2 cohorts)" added to the per-mm line in the summary, "≥#30" line
  added to the summary so the poster is a complete study card.

## Review changes (v2, after independent science + design review)
The v2 build supersedes the storyboard times, word count and wording above where they differ. New timeline: 24.9 s
(was 25.6); hook/anatomy 0-2.6 s, part 1 2.6-11.2, wipe, part 2 11.7-17.4, wipe, summary 17.9-23.3, final wipe; poster
22.9 s. About 65 must-read words (was about 74). Last frame = first frame (pixel-identical, re-checked).

Science
- Per-mm note is now "per mm short ~12-14% **worse odds**" (part 1 and summary; "(2 cohorts)" dropped on screen).
  "Worse" covers both Chugal 2003 (14% higher chance of failure per mm, radiographic apex, apical periodontitis, 4 yr)
  and Ng 2011 (12% lower odds of success per un-instrumented mm, apex-locator zero, 2-4 yr). The caption spells out both.
  The design reviewer's alternative "less healing" was not used: it is not accurate for Chugal's failure metric.
- "Long" scribble redrawn: it leaves the side-exit foramen and runs on past the dashed 0 line (the line now extends
  left across it), below the root tip, so the 76% is unambiguously "beyond the radiographic apex" (Sjögren's category).
- Summary line 1 is now "Infected: fill 0-2 mm short of x-ray apex" (reference point and "fill", not "stop").
- Caption: the wrong sentence "Vital cases did as well slightly shorter" is replaced by Chugal 2003's actual finding
  (normal pulp/periapex: successes 1.23 mm, failures 0.20 mm short; abstract). Added: definition of "long", one Swedish
  cohort per root, in vitro conditions for #30, "only +2 significantly worse", Wu 2002 on the first binding file
  (PMID 11985678, abstract re-read on PubMed 2026-11-22: in 90% of canals the first binding instrument was smaller
  than the canal's short diameter), schematic note on the constriction, Boutsioukis 2021 and Wu 2002 in Refs.
- Sticky now reads "Evidence: LOW" (not the GRADE word "Certainty"); the caption says which part has a published
  rating (Sabeti 2024, apical size only).
- Fatima 2021 source note corrected: only +2 with 4% taper was lowest (57.1%); +2 with 6% taper did not differ from +3.
- Still open before posting: check 94 / 76 / 68 against the results table of Sjögren 1990 (J Endod 16:498-504).

Design
- Cut: the blue "≥#30 ..." line in the summary (now caption only), "(2 cohorts)", "mand. molars" on the RCT slip.
- Hook: root outline and canal are drawn in the first 0.9 s and the paper ruler slides in at 0.5 s, so by 1.0 s there
  is a recognizable apex plus a prop; labels from 1.5 s; part 1 starts at 2.6 s.
- Summary: sticky at +1.7 s, second highlight done at +2.35 s; complete board held 20.25-23.32 s (3.07 s).
- Wipes: each sweep 0.20 s (was 0.16), and the three hard ghost copies are replaced by a continuous smear (18
  sub-frame copies across the previous frame interval). Four rows kept: three rows cannot cover the 1230 px of ink
  with a 320 px eraser.
- Poster/grid crop: header moved down 24 px (highlighter top at y 270, 30 px inside the 3:4 crop); summary re-spaced
  (47 px between RCT slip and sticky, 55 px to the source line).
- Ghosting is built from strokes only (no text) and blurred 4.5 px, so no residue is readable.
- "schematic / not to scale" is now two short lines in free space (left margin in part 1, between the roots in
  part 2); blue anatomy labels right-aligned at x 226, clear of the socket line.
- RCT slip pinned 0.8 s earlier (B0 + 3.1). Handle tape moved up to y 1541-1579 (inside the safe line). Summary source
  line is 24 px with the four papers whose numbers are on that board (Sjögren, Saini, Chugal, Ng).
- File and needle are clipped below the header underline.

## Final QA (2026-11-22)
- Rendered 23 stills with `--safe` (`_stills/final-qa`), t = 0 to 24.85 s. No clipped, overlapping or missing text, no
  NaN/undefined, no blank frames; last frame equals the first (clean board, header only), so nothing ghosts at the loop.
  Header hook is fully legible at t = 0; complete summary board held 20.25-23.3 s; poster (22.9 s) reads inside the
  3:4 crop. Video: 1080x1920, 30 fps, ffprobe 24.9 s = REEL.duration; rendered after the last source edit.
- Every on-screen number re-checked against RESEARCH.md (94/76/68 Sjögren 1990; 12-14% Chugal 2003 + Ng 2011; #30
  Khademi 2006; 48% and 71-92% Saini 2012). No reel source change, no re-render.
- meta.json: caption was about 1,900 characters; the schema asks for 300-700. Rewritten to fit (numbers, denominators,
  refs for each claim, schematic note). The longer nuance stays in the claims' source fields and in this file:
  "long" = filling material radiographically beyond the apex; Chugal 2003 = 14% higher chance of failure per mm from the
  radiographic apex (apical periodontitis, 4 yr), Ng 2011 = 12% lower odds of healing per un-instrumented mm from the
  apex-locator zero (2-4 yr); normal pulp/periapex in Chugal 2003: successes 1.23 mm, failures 0.20 mm short; #30 is from
  extracted mesiobuccal canals with syringe irrigation and depends on taper and needle (Boutsioukis & Gutierrez Nova
  2021); the first binding file under-reads the canal (Wu 2002); the published "low" rating covers apical size only
  (Sabeti 2024).
- Left as is: the label "constriction" starts at x = 59, 5 px outside the 64 px side margin (no Instagram UI there).
- Still open before posting: check 94 / 76 / 68 against the results table of Sjögren 1990 (primary full text not read).

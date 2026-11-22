# 36 · EdgeFile X7 shaping route: access to apex

**Style:** transit route map. Off-white "pocket map" paper with fold creases and grain, a dark title band with a line
bullet, thick colored routes with rounded 45° bends, white-ringed station dots, an interchange capsule, a key strip, a
LINE INFO timetable box, a "you are here" marker and a small vehicle marker that rides the line. Type is Barlow
Condensed (labels) and Barlow (overline, handle). Original map language: no transit authority's roundel, bullets or
layout are imitated. No manufacturer logo or trade dress; the product name appears as plain text only.

**Duration:** 22.4 s · 1080×1920 · 30 fps · silent · `reels/out/36-x7-file-sequence.mp4` (poster at t = 21.0 s, the
complete map)

**Files:** `index.html` (page shell), `map.js` (everything else, one full-frame canvas, fast capture path).

## Concept
The request was "one of the most efficient and effective file sequences with X7 files". The evidence brief found that
no study has compared sequences for this system, so the reel does not rank anything. It shows the **manufacturer's
sequence and settings** as a route from ACCESS to the OBTURATE terminus, plus the habits the directions ask for at
every file and **one** evidence flag (hand preflaring, in vitro). A fine-print line says what the map is: "Schematic ·
manufacturer IFU / US DFU + one in vitro study · no sequence is proven 'most efficient'", and a yellow tab on the
notice says "FOLLOW THE CURRENT DFU". The crown-down sequence (the only X7 sequence in the US-labelled DFU) is in the
caption, not on screen (removed at review for the word budget).

Each line color is one phase: **1 Negotiate** (blue), **2 Shape** (red), **3 Enlarge** (violet), **4 Finish** (green).
A phase chip in the key is gray until its line starts drawing, and an 8 px bar under it fills as the line is drawn.
A **white dashed core** on a route means conditional service: the 20/.04 loop (only after the 25 stops short) and the
whole violet line (only if a larger shape is wanted); the "IF WANTED" tag carries a sample of that core. White
**diamonds** between consecutive file stations are the "every file" service points; each time the marker crosses one,
the four habit icons in the EVERY FILE box light in turn. At the terminus the marker is withdrawn from service as the
single-use notice appears.

## Storyboard (times in s)
| t | What happens | New must-read text |
|---|---|---|
| 0.0–0.5 | Hook. Title band, key strip (gray chips), ghost (planned) network, LINE INFO box, compass ornament pointing to APEX, marker parked at the first station with a "YOU ARE HERE" tag | EDGEFILE X7 · SHAPING ROUTE / **ACCESS → APEX**; key: Negotiate · Shape · Enlarge · Finish; LINE INFO: SPEED 300–500 rpm · TORQUE LIMIT 300 g·cm |
| 0.5–2.7 | Motion starts at 0.5 s: line 1 (blue) draws ACCESS → SCOUT → the WORKING LENGTH capsule (pops 2.6). The "YOU ARE HERE" tag rides with the marker to SCOUT and fades at 1.7–1.95 (on screen 1.7 s = `Kit.readSecs` for three words) | ACCESS (1.0); SCOUT (1.95) |
| 2.7–3.8 | Working-length labels arrive one by one; apex-locator and radiograph pictograms pop in white-ringed circles | WORKING LENGTH · #10 K, then #15 K · **= GLIDE PATH** |
| 3.55–5.3 | Dotted leader runs from the glide-path tag; the evidence flag unfurls (3.8–4.35). Compass fades (3.2–3.8) | EVIDENCE · IN VITRO — Hand preflaring first: shaped about 6× more blocks (fine print: ProTaper S1, resin blocks: mean 59 vs 10 before breaking · Berutti 2004, J Endod) |
| 5.3–6.6 | Marker turns and crosses the capsule onto line 2; the LINE INFO box pings (yellow outline) | — |
| 6.9–7.9 | Line 2 (red) draws to 17/.04; the label lands first (7.8) | 17/.04 |
| 8.0–9.0 | Only then the EVERY FILE box slides in while the marker is parked; four icons pop 0.15 s apart (8.2–8.65) | EVERY FILE: irrigate · recap #10–15 · clean flutes · inspect |
| 9.0–10.0 | 17/.04 → 25/.04; diamond ping and icon ripple | 25/.04 (9.9) |
| 10.3–12.3 | The conditional loop draws back from 25/.04; the marker turns, reverses to 20/.04 (10.4–11.05), waits, then returns to 25/.04 (11.7–12.3): "alternate 20 and 25" shown as motion, with a double arrow beside the label | 20/.04 ⇄ · only after 25 stops short (11.0–11.5) |
| 12.5–14.4 | Line 3 (violet, white core) draws round the 45° bend to LARGER .04; the .06 branch draws to its own station (13.3–14.1) | IF WANTED (12.65); LARGER .04 / all canals (13.6); LARGER .06 / straight to mildly curved (14.1) |
| 14.9–16.1 | → IRRIGATE; the .06 branch reaches the junction as the marker passes it | IRRIGATE (15.7) |
| 16.1–16.9 | Line 4 (green) to the OBTURATE terminus | OBTURATE / check cone fit (16.8) |
| 17.2–18.2 | Marker is withdrawn; notice slides up with the "do not re-use" sign; fine print (17.8) | One patient · one procedure · then discard; tab FOLLOW THE CURRENT DFU |
| 18.2–21.6 | **End card, held 3.4 s**: the whole map as a one-screen protocol. One confirmation wave runs down the stations (18.4–19.6) and through the diamonds and icons | — |
| 21.6–22.4 | Live layer cross-fades back to the ghost map (21.6–22.06); only then the intro state returns (22.08–22.36). Frame 0 = last frame | — |

All labels persist once shown, so every text is on screen for longer than `Kit.readSecs`. Only about 10 new words
arrive in the last second of the build (notice + tab), against a 3.4 s hold.

**Must-read words** (text ≥ 30 px, persistent): about **79** (title 6, key 4, LINE INFO 9, stations and their
sub-labels 38, evidence flag 8, EVERY FILE 8, notice 6). Tags at 28 px ("EVIDENCE · IN VITRO", "FOLLOW THE CURRENT
DFU") and the transient "YOU ARE HERE" are not in that count. Down from about 94, still above the ~60-word budget in
SPEC.md; see "Known weaknesses".

## On-screen claims and sources
Two kinds of source are kept apart. **Manufacturer directions** are instructions, not evidence. All manufacturer text
and every citation below come from `RESEARCH.md` (researched and independently fact-checked on 2026-11-22; PMIDs
re-fetched, manufacturer PDFs re-downloaded). No new fact was added at build time.

- **IFU** = EdgeEndo, "Instructions for Use – EdgeFile X7", REF 99.EX7.10.01A.XX. The document prints **no revision
  date**; the PDF was created 5 Mar 2026 (modified 8 Sep 2026); multilingual, address block FKG Dentaire Sàrl,
  Switzerland. https://edgeendo.com/wp-content/uploads/2026/03/IFU-EdgeFile-X7_Multilingual-New-Footer.pdf, accessed
  22 Nov 2026. (Called "IFU 2026" in RESEARCH.md and in older notes; the screen now says just "IFU".)
- **US DFU** = EdgeEndo, "Rotary / Reciprocating Files — Directions for Use", DFU-RF-US Rev D 06/23,
  https://edgeendo.com/wp-content/uploads/2023/08/DFU-RF-US-D-Rotary-File-USA-DFU-Rev-D.pdf, accessed 22 Nov 2026.

| # | On screen | Source and what it literally says | Kind |
|---|---|---|---|
| 1 | LINE INFO (header "IFU · DFU"): SPEED 300–500 rpm · TORQUE LIMIT 300 g·cm | IFU §1: "Recommended speed 300-500 rpm continuous rotation. Torque limit : 300 g·cm (2.94 N·cm)." In the US DFU the same values are an **option**: "Use the same hand piece with the same speed and torque settings you are currently using with your rotary system. Or if you wish, you can use … Speed: 300-500 rpm · Torque: 2.94 N-cm/300 g-cm" | manufacturer (recommended in the IFU; optional in the US DFU) |
| 2 | ACCESS | IFU simplified technique step 1: "Create straight line access to canal orifices." | manufacturer (IFU) |
| 3 | SCOUT | Step 2: "Locate canals and explore using stainless steel hand instruments." No file size is given | manufacturer (IFU) |
| 4 | WORKING LENGTH · #10 K, then #15 K · apex-locator and radiograph pictograms · = GLIDE PATH | IFU step 4: "Using a #10 K file or larger file to determine the working length with an apex locator and radiographs in each canal. This will also form a glide path in each canal." US DFU: "Establish patency by taking a #10 K-File 1mm past the canal terminus, and at least a #15 K-File to the terminus." The label meets both; the "1 mm past" patency detail is in the caption | manufacturer (both) |
| 5 | EVIDENCE · IN VITRO — "Hand preflaring first: shaped about 6× more blocks"; fine print "ProTaper S1, resin blocks: mean 59 vs 10 before breaking · Berutti 2004, J Endod" | Berutti E, Negro AR, Lendini M, Pasqualini D. J Endod 2004;30(4):228-30. **PMID 15085052**, doi:10.1097/00004770-200404000-00011. Abstract: mean number of Endo-Training-Blocks one ProTaper S1 shaped before breaking, 59 with manual preflaring vs 10 without (P<.01). 59/10 = 5.9, written "about 6×". Abstract only; the preflaring size is **not in the abstract** (secondary sources suggest up to about #20; unverified), so the flag does not show that a #10 K alone is enough. Conventional NiTi, resin blocks, not the X7. The outcome is blocks shaped, not time | evidence (in vitro, other system) |
| 6 | 17/.04 | Step 5: "Use #17/04 file in one or more passes, alternating with small-sized hand files if necessary, until working length is reached." | manufacturer (IFU) |
| 7 | 25/.04; loop 20/.04 ⇄ "only after 25 stops short" | Step 6: "Next use #25/04 to working length passively; if instrument has not reached working length use smaller additional shaping instrument #20/04 to working length alternating between #20/04 and #25/04." | manufacturer (IFU) |
| 8 | EVERY FILE: irrigate | Step 3: "Irrigate before each hand or rotary file with liquid NaOCI [sic] or 17% EDTA." US DFU: "Irrigate and lubricate the canal frequently" | manufacturer (both) |
| 9 | EVERY FILE: recap #10–15 | "Between each rotary file recapitulate with a #10 or #15 tip hand file to maintain glide path…" — in the **crown-down** sections of both documents. The simplified technique says "alternating with small-sized hand files if necessary" | manufacturer (both; crown-down text) |
| 10 | EVERY FILE: clean flutes · inspect | IFU §5: "Regularly clean flutes and inspect instrument during use, and discard if it shows any signs of distortion or wear." US DFU: "Clean the flutes frequently and at least after removing the files from the canal." The documents **conflict** on what follows inspection: the US DFU, "Safe Unwinding (Heat Treat only)": "As a safety feature the files are designed to unwind. They may be used until the files unwind backwards." Conservative rule: discard. Not on screen | manufacturer (both) |
| 11 | IF WANTED → LARGER .04 / all canals · LARGER .06 / straight to mildly curved | Step 7: "After #25/04 reaches working length if clinician desires a larger apical or canal shape, take a #25/06 or other additional larger 04 or 06 instruments (#30, #35, #40, etc...)." The taper rule is the pair of crown-down section headings in both documents. No angle is given | manufacturer (step 7 = IFU; taper rule = both) |
| 12 | IRRIGATE (solid station, no tag) | US DFU "Disinfecting": "After each canal is fully shaped, rinse the canals for 1 minute with 17% Liquid EDTA to remove the canal Smear Layer. Rinse the canals for 5 minutes with 5% NaOCl to remove debris and bacteria." (further rinses follow). Not a step of the IFU simplified technique. Recipe not shown, no "activate" claim | manufacturer (US DFU) |
| 13 | OBTURATE / check cone fit | Both documents: "…sometimes you may need to drop down in cone tip size if the corresponding gutta percha to your final rotary file does not go to length." Supporting literature (not on screen): Keith AM, et al. J Endod 2024;50(12):1766-71, **PMID 39393517** (abstract; EdgeTaper Platinum, not X7) | manufacturer (both) |
| 14 | One patient · one procedure · then discard | IFU §5: "Each instrument may be used to treat up to four (4) canals during a single procedure. Discard after use." US DFU: "Endodontic files are single use only…", "Once file is used do not reuse." True under both; the 4-canal cap (IFU only) was removed from the screen at review | manufacturer (both) |
| 15 | FOLLOW THE CURRENT DFU | The brief's mandatory line; the two live documents differ | — |
| 16 | Fine print: "Schematic · manufacturer IFU / US DFU + one in vitro study · no sequence is proven 'most efficient'" | No study comparing EdgeFile X7 sequences on PubMed (searches of 22 Nov 2026 in RESEARCH.md). Peters OA. J Endod 2004;30(8):559-67, **PMID 15273636** (abstract) | absence of evidence + review |

**In the caption / meta.json only (`caption`, `caption_extras`):** crown-down 25 → 20 → (17), which is in both
documents and is the only X7 sequence in the US DFU; the US DFU patency wording; the inspect/unwinding conflict; speed
and torque being optional in the US DFU and "minimal apical pressure" being US DFU wording; "re-confirm working length
after coronal flaring" (Stabholz 1995, PMID 7714445; Ibarrola 1999, PMID 10687543); US DFU precaution 7 ("Take each
file to length only one time and for no more than one second").

Station notation: the IFU prints "17/04"; the map uses the conventional "17/.04".

## What is schematic
- The whole thing is a **route diagram of a procedure**, not anatomy: positions, distances and bends mean nothing
  (the fine print inside the safe area starts with "Schematic"; the caption says "Schematic map").
- The violet line is drawn through LARGER .04 with no separate bypass. The "IF WANTED" tag and the white dashed core
  mark the whole line as optional; going from 25/.04 straight to the finish is what the IFU describes when no larger
  shape is wanted.
- LARGER .04 and LARGER .06 are drawn as two branches because they are alternatives, not consecutive steps.
- The diamonds mark "between files"; the IFU's wording is "before each hand or rotary file" (irrigate), "between each
  rotary file" (recapitulate, crown-down text) and "regularly" (clean flutes, inspect).
- The 6× figure is a ratio of two group means (blocks shaped before breakage) from one in vitro study on a different
  file system. It is labeled in vitro, with the raw means, the unit and the system in the fine print.

## Left off the screen on purpose
The crown-down sequence and the 4-canal cap (caption / notes only since the review), "minimal apical pressure"
(US DFU wording), pecking amplitude or stroke count (not in any X7 document), any fatigue number or brand comparison, the cross-section
(manufacturer page and papers disagree), curvature in degrees, a required apical size (Khademi 2006 was the first item
to cut), the pooled fracture incidence of Gomes 2021 (no denominator in the abstract), the manufacturer's final-rinse
recipe, the "unwinding is a safety feature" sentence of the older DFUs, EdgeX7 Utopia settings, and "wet canal = lower
torque" (Boessler 2007; cut for the word budget). See RESEARCH.md section (e).

## Design rationale
- **Layout.** Lines 1 and 2 run down the left with labels to the right; the route then turns through a 45° bend and
  runs horizontally so the .04 / .06 fork can be labeled above and below. The right column holds three boxes in reading
  order: settings, evidence, habits. Everything a viewer must read sits inside x 64–1016, y 230–1580, and nothing is in
  the button column (x > 960, y > 1100): the EVERY FILE box ends at y = 1098 and the lower labels stop at x = 950.
- **Instruction vs evidence** are visually different: solid ink-ringed stations and ink boxes for the manufacturer's
  directions, a cream flag with a yellow "EVIDENCE · IN VITRO" tab and a dotted leader for the one literature item.
- **Palette.** Paper #F6F3EC, ink #17202F, four line colors (blue, red, violet, green) and one yellow accent. It is not
  taken from the manufacturer's packaging.
- **Motion.** One focal point at a time: the marker moves with ease-in-out between stops; labels fade in with a short
  slide; boxes arrive while the marker is parked. The reverse-and-return on the loop shows "alternate" without words.
- **Loop.** The colored network cross-fades back to the gray planned route, then the start state returns.
- **Under the app UI.** The top of the title band carries a faint decorative network; the footer carries the
  "not to scale" line and a four-color rule. Neither needs to be read.

## Known weaknesses
- About 79 must-read words, against a budget of ~60. The requested end card is a full protocol; during playback only
  the station names need reading.
- **The caption cannot be posted as is**: "Disclosure: [REQUIRED BEFORE POSTING …]" must be replaced by the account
  owner's true statement (`publish_blocked` in meta.json). The caption was cut to under 700 characters in final QA; the
  document-status lines moved to `caption_extras` in meta.json.
- "recap #10–15" uses the crown-down wording on the simplified route.
- The main line is printed only in the undated multilingual IFU; a US reader's leaflet (DFU-RF-US Rev D) prints
  crown-down only. This is in the caption, not on screen; the screen says only "IFU · DFU" and "FOLLOW THE CURRENT DFU".
- Berutti 2004, Peters 2004 and Keith 2024 were read as abstracts only. The preflaring size in Berutti 2004 is unknown
  from the abstract.
- The optional violet line has no separate bypass from 25/.04 to the finish.
- On the static end card the 20/.04 loop can still be read as a 17 → 20 → 25 step-up; the label "only after 25 stops
  short" and the double arrow carry the order.

## Review changes (independent science + design review)
Science
- Working length sub-label "#10 K or larger" → "#10 K, then #15 K" (meets both the IFU and the stricter US DFU).
- Evidence flag: "Glide path first: file lasted about 6× longer" → "Hand preflaring first: shaped about 6× more
  blocks"; fine print now "ProTaper S1, resin blocks: mean 59 vs 10 before breaking · Berutti 2004, J Endod".
- IRRIGATE: the "convention" tag and the dashed ring were removed; final irrigation is a printed step of the US DFU.
- Crown-down inset removed from the screen; the caption now states that crown-down is in both documents and is the
  only X7 sequence in the US DFU, and that the main line is printed only in the multilingual IFU.
- "IFU 2026" is no longer used on screen or in meta.json (the document is undated); meta.json cites the REF number and
  the PDF creation date.
- Fine print: "+ evidence-informed habits" → "+ one in vitro study"; it now starts with "Schematic".
- Loop label "if 25 won't reach length" → "only after 25 stops short".
- Caption / `caption_extras`: US DFU patency wording, inspect/unwinding conflict, optional status of speed and torque
  in the US DFU, re-confirm working length after flaring, the one-second rule. Disclosure placeholder made explicit and
  `publish_blocked` added (the true statement is not known to the builder).
- RESEARCH.md: correction note added (the "unwinding" sentence is in the current US DFU Rev D, not only older DFUs).

Design
- Cut about 15 must-read words: crown-down inset, "max 4 canals per file — IFU 2026", "= 2.94 N·cm", the APICAL
  PRESSURE row (LINE INFO is now two rows), "straight-line", "hand files".
- Lower-left: notice box is one line (y 1476–1548) with the "FOLLOW THE CURRENT DFU" tab on its top edge; .06 branch
  moved up 8 px (still 45°); fine print at y 1570.
- Hook: the marker starts at 0.5 s (was 1.3 s); "YOU ARE HERE" rides with it and stays 1.7 s. All later times moved up
  0.8 s; duration 23.6 → 22.4 s.
- 17/.04 lands (7.8 s) before the EVERY FILE card comes in (8.0 s, icons 0.15 s apart).
- Sub-labels 32 px medium → 36 px semibold (loop label 33 px); EVERY FILE labels 30 → 32 px ("#10/#15" → "#10–15").
- Marker 1.35× larger, filled with the current line color, white chevron, stronger halo; heading eases over 0.2 s
  before each leg instead of snapping.
- Apex-locator and radiograph pictograms enlarged and set in white-ringed circles.
- ACCESS station moved down 18 px so the terminus buffer no longer stacks under the key strip.
- "IF WANTED" tag carries a sample of the white dashed core. Key bars 5 → 8 px; phase chips are gray until their line
  starts.

## Change log
- Build 1: layout, network, boxes, timing.
- Pass 2: moved the boxes clear of the key strip; torque conversion moved under its label (it collided with the value);
  loop and stations respaced; marker withdrawn at the terminus so the terminus stays visible on the end card.
- Pass 3: fixed the loop join (labels now fade out fully before the "YOU ARE HERE" state returns); all tags and box
  headers raised to 28–30 px; notice box made taller; diamond pings added; header and footer decoration.
- Pass 4: .06 branch now reaches the junction as the marker passes it; white dashed core extended from the 20/.04 loop
  to the whole optional violet line; flat shadows on the boxes; end hold lengthened (duration 23.0 → 23.6 s).
- Review pass: see "Review changes" above (duration 23.6 → 22.4 s).
- Final QA: 18 stills with --safe (t = 0 … 22.35 s) checked frame by frame; no clipping, overlap, safe-area, glyph or
  loop defects; video 22.4 s (ffprobe) and poster (t = 21.0) confirmed. Reel source unchanged, no re-render.
  meta.json: topic cut to <= 140 characters, caption cut from 873 to under 700 characters (document-status, patency
  and Berutti details moved to `caption_extras`). Left as is: "about 6× more blocks" (59 vs 10 is 5.9× as many; the
  raw means are printed directly under it); the Disclosure placeholder still blocks posting.

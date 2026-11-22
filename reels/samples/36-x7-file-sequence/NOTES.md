# 36 · EdgeFile X7 shaping route: access to apex

**Style:** transit route map. Off-white "pocket map" paper with fold creases and grain, a dark title band with a line
bullet, thick colored routes with rounded 45° bends, white-ringed station dots, an interchange capsule, a key strip, a
LINE INFO timetable box, a "you are here" marker and a small vehicle marker that rides the line. Type is Barlow
Condensed (labels) and Barlow (overline, handle). Original map language: no transit authority's roundel, bullets or
layout are imitated. No manufacturer logo or trade dress; the product name appears as plain text only.

**Duration:** 23.6 s · 1080×1920 · 30 fps · silent · `reels/out/36-x7-file-sequence.mp4` (poster at t = 22.3 s, the
complete map)

**Files:** `index.html` (page shell), `map.js` (everything else, one full-frame canvas, fast capture path).

## Concept
The request was "one of the most efficient and effective file sequences with X7 files". The evidence brief found that
no study has compared sequences for this system, so the reel does not rank anything. It shows the **manufacturer's
sequence and settings** as a route from ACCESS to the OBTURATE terminus, plus the habits the directions ask for at
every file, **one** evidence flag (glide path, in vitro), and the alternative the US-labelled leaflet prints
(crown-down). A fine-print line says what the map is: "Manufacturer IFU 2026 / US DFU 2023 + evidence-informed habits ·
no sequence is proven 'most efficient'", and a tag in the notice says "FOLLOW THE CURRENT DFU".

Each line color is one phase: **1 Negotiate** (blue), **2 Shape** (red), **3 Enlarge** (violet), **4 Finish** (green).
A **white dashed core** on a route means conditional service: the 20/.04 loop (only if the 25 will not reach length)
and the whole violet line (only if a larger shape is wanted). White **diamonds** between consecutive file stations are
the "every file" service points; each time the marker crosses one, the four habit icons in the EVERY FILE box light in
turn. At the terminus the marker is withdrawn from service as the single-use notice appears.

## Storyboard (times in s)
| t | What happens | New must-read text |
|---|---|---|
| 0.0–1.3 | Hook. Title band, key strip, ghost (planned) network, LINE INFO box, compass ornament pointing to APEX, marker parked at the first station with a "YOU ARE HERE" tag (fades 0.7–0.95). ACCESS station pops at 0.5 | EDGEFILE X7 · SHAPING ROUTE / **ACCESS → APEX**; key: Negotiate · Shape · Enlarge · Finish; LINE INFO: SPEED 300–500 rpm · TORQUE LIMIT 300 g·cm (= 2.94 N·cm) · APICAL PRESSURE minimal; ACCESS / straight-line (0.95) |
| 1.3–3.5 | Line 1 (blue) draws ACCESS → SCOUT → the WORKING LENGTH interchange capsule (pops 3.4) | SCOUT / hand files (2.1) |
| 3.5–4.5 | Working-length labels arrive one by one; apex-locator and radiograph pictograms pop beside the file size | WORKING LENGTH · #10 K or larger · **= GLIDE PATH** |
| 4.35–6.1 | Dotted leader runs from the glide-path tag; the evidence flag unfurls (4.6–5.15). Compass fades (4.0–4.6) | EVIDENCE · IN VITRO — Glide path first: file lasted about 6× longer (fine print: ProTaper S1 in resin blocks: mean 59 vs 10 · Berutti 2004, J Endod) |
| 6.1–7.4 | Marker crosses the capsule onto line 2; the LINE INFO box pings (yellow outline) | — |
| 7.7–9.6 | Line 2 (red) draws to 17/.04. At the first diamond (8.2) the EVERY FILE box slides in and its four icons pop (8.5, 8.8, 9.1, 9.4) | 17/.04 (8.6); EVERY FILE: irrigate · recap #10/#15 · clean flutes · inspect |
| 9.8–10.8 | 17/.04 → 25/.04; diamond ping and icon ripple at about 10.3 | 25/.04 (10.7) |
| 11.1–13.1 | The conditional loop draws back from 25/.04 (11.1–11.9); the marker reverses to 20/.04 (11.2–11.85), waits, then returns to 25/.04 (12.5–13.1): "alternate 20 and 25" shown as motion, with a double arrow beside the label | 20/.04 ⇄ · if 25 won't reach length (11.8–12.3) |
| 13.3–15.2 | Line 3 (violet, white core) draws round the 45° bend to LARGER .04; the .06 branch draws to its own station (14.1–14.9) | IF WANTED (13.45); LARGER .04 / all canals (14.4); LARGER .06 / straight to mildly curved (14.9) |
| 15.7–16.9 | → IRRIGATE (dashed ring = convention stop); the .06 branch reaches the junction as the marker passes it | IRRIGATE (16.5) + "convention" tag (16.8) |
| 16.9–17.9 | Line 4 (green) to the OBTURATE terminus | OBTURATE / check cone fit (17.6) |
| 18.0–18.9 | Marker is withdrawn (fades 18.0–18.45); notice slides up with the "do not re-use" sign | One patient · one procedure · then discard / max 4 canals per file — IFU 2026 / FOLLOW THE CURRENT DFU |
| 18.8–19.4 | Crown-down inset and fine print | ALTERNATIVE SERVICE · CROWN-DOWN · 25 → 20 → (17) · to resistance · US DFU 2023 |
| 19.4–22.8 | **End card, held 3.4 s**: the whole map as a one-screen protocol. One confirmation wave runs down the stations (19.7–20.9) and through the diamonds and icons (20.8–21.6) | — |
| 22.8–23.6 | Live layer cross-fades back to the ghost map (22.8–23.26); only then the intro state returns (23.28–23.56), so no two texts ghost over each other. Frame 0 = last frame | — |

All labels persist once shown, so every text is on screen for longer than `Kit.readSecs`.

**Must-read words** (text ≥ 30 px, persistent): about **94** (title 6, key 4, LINE INFO 12, stations and their
sub-labels 39, evidence flag 8, EVERY FILE 8, notice 13, crown-down inset 4 — the stations figure includes IF WANTED
and "convention"). Tags at 28 px ("EVIDENCE · IN VITRO", "FOLLOW THE CURRENT DFU") and the transient "YOU ARE HERE" are
not in that count. This is above the ~60-word budget in SPEC.md; see "Known weaknesses".

## On-screen claims and sources
Two kinds of source are kept apart. **Manufacturer directions** are instructions, not evidence. All manufacturer text
and every citation below come from `RESEARCH.md` (researched and independently fact-checked on 2026-11-22; PMIDs
re-fetched, manufacturer PDFs re-downloaded). No new fact was added at build time.

- **IFU 2026** = EdgeEndo, "Instructions for Use – EdgeFile X7", REF 99.EX7.10.01A.XX (PDF created 5 Mar 2026),
  https://edgeendo.com/wp-content/uploads/2026/03/IFU-EdgeFile-X7_Multilingual-New-Footer.pdf, accessed 22 Nov 2026.
- **US DFU 2023** = EdgeEndo, "Rotary / Reciprocating Files — Directions for Use", DFU-RF-US Rev D 06/23,
  https://edgeendo.com/wp-content/uploads/2023/08/DFU-RF-US-D-Rotary-File-USA-DFU-Rev-D.pdf, accessed 22 Nov 2026.

| # | On screen | Source and what it literally says | Kind |
|---|---|---|---|
| 1 | SPEED 300–500 rpm · TORQUE LIMIT 300 g·cm (= 2.94 N·cm) | IFU 2026 §1: "Recommended speed 300-500 rpm continuous rotation. Torque limit : 300 g·cm (2.94 N·cm)." US DFU 2023 offers the same values as an option ("Speed: 300-500 rpm · Torque: 2.94 N-cm/300 g-cm") | manufacturer (both documents) |
| 2 | APICAL PRESSURE minimal | US DFU 2023 precaution: "Do not force the files down canals, use minimal apical pressure." **Not in IFU 2026**, which says only "to working length passively". The box header reads "IFU · DFU" for this reason | manufacturer (US DFU only) |
| 3 | ACCESS / straight-line | IFU 2026 simplified technique step 1: "Create straight line access to canal orifices." | manufacturer (IFU 2026) |
| 4 | SCOUT / hand files | Step 2: "Locate canals and explore using stainless steel hand instruments." The IFU gives **no file size** for this step, so none is shown | manufacturer (IFU 2026) |
| 5 | WORKING LENGTH · #10 K or larger · apex-locator and radiograph pictograms · = GLIDE PATH | Step 4: "Using a #10 K file or larger file to determine the working length with an apex locator and radiographs in each canal. This will also form a glide path in each canal." The US DFU 2023 is stricter (patency with a #10 K and "at least a #15 K-File to the terminus"); not shown | manufacturer (IFU 2026) |
| 6 | EVIDENCE · IN VITRO — "Glide path first: file lasted about 6× longer"; fine print "ProTaper S1 in resin blocks: mean 59 vs 10 · Berutti 2004, J Endod" | Berutti E, Negro AR, Lendini M, Pasqualini D. J Endod 2004;30(4):228-30. **PMID 15085052**, doi:10.1097/00004770-200404000-00011. Abstract: mean number of Endo-Training-Blocks one ProTaper S1 shaped before breaking, 59 with manual preflaring vs 10 without (P<.01). 59/10 = 5.9, written "about 6×". Abstract only; conventional NiTi, resin blocks, not the X7. Outcome is file life, not a separation count | evidence (in vitro, other system) |
| 7 | 17/.04 | Step 5: "Use #17/04 file in one or more passes, alternating with small-sized hand files if necessary, until working length is reached." | manufacturer (IFU 2026) |
| 8 | 25/.04; loop 20/.04 ⇄ "if 25 won't reach length" | Step 6: "Next use #25/04 to working length passively; if instrument has not reached working length use smaller additional shaping instrument #20/04 to working length alternating between #20/04 and #25/04." | manufacturer (IFU 2026) |
| 9 | EVERY FILE: irrigate | Step 3: "Irrigate before each hand or rotary file with liquid NaOCI [sic] or 17% EDTA." US DFU: "Irrigate and lubricate the canal frequently" | manufacturer (both) |
| 10 | EVERY FILE: recap #10/#15 | "Between each rotary file recapitulate with a #10 or #15 tip hand file to maintain glide path…" — this sentence is in the **crown-down** sections of both documents. The simplified technique itself says "alternating with small-sized hand files if necessary". The icon carries the crown-down wording over to the simplified route | manufacturer (both; crown-down text) |
| 11 | EVERY FILE: clean flutes · inspect | IFU 2026 §5: "Regularly clean flutes and inspect instrument during use, and discard if it shows any signs of distortion or wear." US DFU: "Clean the flutes frequently and at least after removing the files from the canal." | manufacturer (both) |
| 12 | IF WANTED → LARGER .04 / all canals · LARGER .06 / straight to mildly curved | Step 7: "After #25/04 reaches working length if clinician desires a larger apical or canal shape, take a #25/06 or other additional larger 04 or 06 instruments (#30, #35, #40, etc...)." The taper rule is the pair of **crown-down section headings** in both documents ("04 Taper Crown Down for All Canals", "06 Taper Crown Down for Straight to Mildly Curved Canals"). Applying it to step 7 is a reasonable reading, not a quoted step. No angle or radius is given by the manufacturer, and none is shown | manufacturer (step 7 = IFU 2026; taper rule = both) |
| 13 | IRRIGATE + "convention" tag (dashed station ring) | Not a step of the IFU 2026 technique. Kept as a convention stop; no recipe and no "activate" claim | convention |
| 14 | OBTURATE / check cone fit | Both documents: "When using a master gutta percha cone that matches the largest file taken to length, remember sometimes you may need to drop down in cone tip size if the corresponding gutta percha to your final rotary file does not go to length." Supporting literature (not on screen): Keith AM, Hinman SE, Dickens NE, Kim JJ, Scott RV, Osborne NH. J Endod 2024;50(12):1766-71, **PMID 39393517** (abstract; EdgeTaper Platinum, not X7) | manufacturer (both) |
| 15 | One patient · one procedure · then discard · max 4 canals per file — IFU 2026 | IFU 2026 §5: "Each instrument may be used to treat up to four (4) canals during a single procedure. Discard after use." US DFU 2023: "Endodontic files are single use only…", "Once file is used do not reuse." The wording on screen is true under both; the 4-canal cap is named as IFU 2026 because the US DFU does not print it. The round sign is my drawing of the generic "do not re-use" symbol | manufacturer (cap = IFU 2026) |
| 16 | FOLLOW THE CURRENT DFU | The brief's mandatory line; the two live documents differ (see RESEARCH.md D2) | — |
| 17 | ALTERNATIVE SERVICE · CROWN-DOWN · 25 → 20 → (17) · to resistance · US DFU 2023 | US DFU 2023, X7 row: "Start with a 25/04 rotary file. Take the 25/04 to resistance or working length (whichever occurs first). If resistance is met … go to a 20/04 … On occasion a 17/04 may be needed". This is the **only** sequence in the US-labelled DFU (it is also printed in IFU 2026); the 17 is in parentheses because it is occasional | manufacturer (both) |
| 18 | Fine print: "Manufacturer IFU 2026 / US DFU 2023 + evidence-informed habits · no sequence is proven 'most efficient'" | No study comparing EdgeFile X7 sequences on PubMed (searches of 22 Nov 2026 in RESEARCH.md). Peters OA. J Endod 2004;30(8):559-67, **PMID 15273636** (abstract) lists "specific instrument sequence" among the less significant factors for shaping outcome | absence of evidence + review |

Station notation: the IFU prints "17/04"; the map uses the conventional "17/.04".

## What is schematic
- The whole thing is a **route diagram of a procedure**, not anatomy: positions, distances and bends mean nothing
  (the footer under the safe area reads "SCHEMATIC ROUTE MAP · NOT TO SCALE"; the caption says "Schematic map").
- The violet line is drawn through LARGER .04 with no separate bypass. The "IF WANTED" tag and the white dashed core
  mark the whole line as optional; going from 25/.04 straight to the finish is what the IFU describes when no larger
  shape is wanted.
- LARGER .04 and LARGER .06 are drawn as two branches because they are alternatives, not consecutive steps.
- The diamonds mark "between files"; the IFU's wording is "before each hand or rotary file" (irrigate), "between each
  rotary file" (recapitulate, crown-down text) and "regularly" (clean flutes, inspect).
- The 6× figure is a ratio of two means from one in vitro study on a different file system. It is labeled in vitro,
  with the raw means and the system in the fine print.

## Left off the screen on purpose
Pecking amplitude or stroke count (not in any X7 document), any fatigue number or brand comparison, the cross-section
(manufacturer page and papers disagree), curvature in degrees, a required apical size (Khademi 2006 was the first item
to cut), the pooled fracture incidence of Gomes 2021 (no denominator in the abstract), the manufacturer's final-rinse
recipe, the "unwinding is a safety feature" sentence of the older DFUs, EdgeX7 Utopia settings, and "wet canal = lower
torque" (Boessler 2007; cut for the word budget). See RESEARCH.md section (e).

## Design rationale
- **Layout.** Lines 1 and 2 run down the left with labels to the right; the route then turns through a 45° bend and
  runs horizontally so the .04 / .06 fork can be labeled above and below. The right column holds three boxes in reading
  order: settings, evidence, habits. Everything a viewer must read sits inside x 64–1016, y 230–1580, and nothing is in
  the button column (x > 960, y > 1100): the EVERY FILE box ends at y = 1098 and the lower labels stop at x = 950.
- **Instruction vs evidence vs convention** are visually different: solid ink-ringed stations and ink boxes for the
  manufacturer's directions, a cream flag with a yellow "EVIDENCE · IN VITRO" tab and a dotted leader for the one
  literature item, and a dashed ring plus a dashed "convention" tag for the stop that is neither.
- **Palette.** Paper #F6F3EC, ink #17202F, four line colors (blue, red, violet, green) and one yellow accent. It is not
  taken from the manufacturer's packaging.
- **Motion.** One focal point at a time: the marker moves with ease-in-out between stops; labels fade in with a short
  slide; boxes arrive while the marker is parked. The reverse-and-return on the loop shows "alternate" without words.
- **Loop.** The colored network cross-fades back to the gray planned route, then the start state returns.
- **Under the app UI.** The top of the title band carries a faint decorative network; the footer carries the
  "not to scale" line and a four-color rule. Neither needs to be read.

## Known weaknesses
- About 94 must-read words, against a budget of ~60. The requested end card is a full protocol (nine stations, settings,
  four habits, reuse statement, alternative sequence), so the map is reference-dense. During playback only the station
  names need reading; the boxes are for the screenshot.
- "recap #10/#15" uses the crown-down wording on the simplified route (row 10 above).
- "Minimal apical pressure" comes from the US DFU only, the main line from IFU 2026 only. The box header and the fine
  print name both documents but do not say which line comes from which.
- The apex locator and radiograph are pictograms without labels.
- The sponsorship / no-relationship statement in the caption is a placeholder for the account owner to fill in, and
  the owner should check which leaflet ships in his boxes before posting.
- Berutti 2004, Peters 2004 and Keith 2024 were read as abstracts only (full texts not read by either research pass).

## Change log
- Build 1: layout, network, boxes, timing.
- Pass 2: moved the boxes clear of the key strip; torque conversion moved under its label (it collided with the value);
  loop and stations respaced; marker withdrawn at the terminus so the terminus stays visible on the end card.
- Pass 3: fixed the loop join (labels now fade out fully before the "YOU ARE HERE" state returns); all tags and box
  headers raised to 28–30 px; notice box made taller; diamond pings added; header and footer decoration.
- Pass 4: .06 branch now reaches the junction as the marker passes it; white dashed core extended from the 20/.04 loop
  to the whole optional violet line; flat shadows on the boxes; end hold lengthened (duration 23.0 → 23.6 s).

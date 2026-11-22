# 41 · Periapical healing: seven prognostic factors (after nonsurgical root canal treatment)

**Style:** stained-glass rose window. One Canvas 2D frame: a dark ashlar wall, a round rose window in a carved stone
surround (bead moulding, roll, splayed reveal), a central pane showing a root apex with a golden nimbus where the
periapical tissues are, and seven petal panes, one per factor, each in its own jewel tone (ruby, amber, emerald,
sapphire, amethyst, teal, rose) with a leaded pictogram medallion and a numbered roundel. Below the window, a carved
stone tablet takes the list. Fraunces 600/700 and italic (title, factor names, numerals, second lines), Inter 600
(header, favorable direction), Inter 400/500 (source line, handle).
**Duration:** 29.3 s · 1080×1920 · silent · poster at 28.2 s (the fully lit window and the complete list).
American spelling.
**Files:** `index.html` (page contract), `rose.js` (geometry, glass builder, pictograms, light, text, `render(t)`).
**Sibling reels:** 39 (surgery factors) and 40 (tooth-survival conditions) are separate. This reel is only about
periapical healing; nothing on screen mentions tooth survival, tooth loss or extraction.

## Concept
A study aid for a board/quiz list. The chapter's summary names seven factors with "a major impact on periapical
health" after root canal treatment. The window starts unlit. Light comes through one petal at a time; as it does, the
counter turns to that number in the pane's color and the factor is carved into the tablet as a row: numeral, factor
name, and the state associated with better healing. Rows stay, so the list builds into the finished cheat sheet, which
is then held with the whole window lit for 4.0 s.

Wording is association only: the column head reads "BETTER HEALING ASSOCIATED WITH". The center pane is lit softly
from the start and fully at the end; it never "heals" on screen, so nothing implies that the seven together guarantee
an outcome.

## Storyboard (seconds, as built after the independent review)
| t | Beat | On screen |
|---|------|-----------|
| 0.0–1.0 | **Hook.** Title is legible on frame 0. Window dim, center pane glows softly. Tablet shows its header and seven faint slot numerals. | Periapical healing · after nonsurgical root canal treatment · **7** FACTORS |
| 1.0–4.2 | **Pane 1** (ruby) lights over 0.85 s with a shaft of light and a red pool on the floor; counter 1 / 7; row 1 is carved 0.25–0.9 s after the pane starts. | 1 Periapical lesion: presence, size → none, or smaller |
| 4.2–7.1 | **Pane 2** (amber). Earlier panes settle to about three-quarters brightness. | 2 Patency at the canal terminus → achieved |
| 7.1–12.1 | **Pane 3** (emerald); 5.0 s because of the second line (in at +0.9 to +1.3 s). | 3 Apical extent of preparation → flush · *flush: root filling 0–2 mm within the radiographic apex* |
| 12.1–16.3 | **Pane 4** (sapphire); 4.2 s because of the second line. | 4 Intraoperative culture test → negative · *a prognostic factor, though not routine practice* |
| 16.3–18.6 | **Pane 5** (amethyst). | 5 Iatrogenic perforation → none |
| 18.6–21.8 | **Pane 6** (teal). | 6 Root-filling quality on radiograph → good, no voids |
| 21.8–23.7 | **Pane 7** (rose). | 7 Final coronal restoration → good quality |
| 23.7–24.5 | All seven panes and the center rise to full light. | 7 / 7 |
| 24.5–28.5 | **Payoff / summary hold (4.0 s fully lit; the list is complete from 22.7 s, 5.8 s in all).** One slow pass of brighter light (24.6–27.6); poster at 28.2. | whole frame |
| 28.5–29.3 | Rows fade (0.55 s), lights go down, counter returns to "7 FACTORS": the last frame equals frame 0. | title only |

Reading: every row stays from the moment it is carved until 28.5 s. Time each row is complete on screen before the
next pane starts to light, against `Kit.readSecs` of the whole row: row 1 2.3 s (2.9), row 2 2.0 s (2.6), row 3 3.7 s
(5.0), row 4 2.9 s (4.1), row 5 1.4 s (1.7), row 6 2.3 s (2.9); row 7 runs into the summary hold. The full
`readSecs` for every row before the next reveal does not fit in 30 s with this much text (see the review section).

Type sizes: title 82 px; counter numeral 104 px; factor names 36 px; favorable direction 31 px; second lines 30 px;
tablet header and "FACTORS" 30 px; tablet numerals 38 px; numerals in the glass about 34 px; source line 23 px and
handle 24 px (fine print). Must-read words on the final frame: about 68 (title block 9, header 5, rows 54). That is
over the usual 60-word budget because the reel is a seven-item list with two qualifiers the brief asked for.

Safe area: all text sits in x 62–1013, y 238–1578; below y 1100 nothing readable goes right of x 954. The floor and
its pools of colored light (y > 1662) are decoration in the covered zone.

## On-screen statements, chapter wording and evidence
Source for all seven: Ng Y-L, Gulabivala K. Evaluation of Outcomes. Chapter 17 in *Cohen's Pathways of the Pulp*,
12th ed. Section "Summary of Factors Influencing Periapical Healing Following Nonsurgical Root Canal Treatment" and the
preceding section "Factors Affecting Periapical Health or Healing Following Root Canal Treatment". Chapter quotes are
kept short. Details and the PubMed cross-check are in RESEARCH.md.

| # | On screen | Chapter's bullet (short quote) | Evidence basis in the chapter | Status |
|---|---|---|---|---|
| 1 | Periapical lesion: presence, size → none, or smaller | "Presence (Fig. 17.20) and size (Fig. 17.21) of periapical lesion" | Pooled OR 2.4 (95% CI 1.7–3.5) favoring no periapical radiolucency (nonvital teeth); pooled OR 2.2 (1.3–3.7), small (<5 mm) vs large (≥5 mm). Ng 2011 abstract: no lesion P = 0.003; smaller lesion P ≤ 0.001 | Matches chapter |
| 2 | Patency at the canal terminus → achieved | "Patency at the canal terminus (achieving patency significantly increased the chance of success twofold)" | Ng, Mann & Gulabivala 2011 (prospective); abstract: P = 0.001 | Matches chapter |
| 3 | Apical extent of preparation → flush · flush: root filling 0–2 mm within the radiographic apex | "Apical extent of chemomechanical preparation in relation to the radiographic apex (Fig. 17.22)" | Fig. 17.22, pooled probability of periapical health: underextended 0.76, flush 0.81, overextended 0.66 (root fillings). "Flush" = 0–2 mm within the radiographic apex; long fillings had the lowest success. Ng 2011 abstract: cleaning "as close as possible to its apical terminus" (P = 0.001) | Matches chapter, with a nuance (below) |
| 4 | Intraoperative culture test → negative · a prognostic factor, though not routine practice | "Outcome of intraoperative culture test (see Fig. 17.19)" | Pooled OR 2.1 (1.5–2.9) favoring a negative preobturation culture, 15 studies incl. Sjögren 1997 (94% vs 68% healed at 5 yr, abstract). Chapter: the practice "has fallen out of clinical favor" | Matches chapter |
| 5 | Iatrogenic perforation → none | "Iatrogenic perforation (if present, reduces the odds of success by 30%)" | Ng 2011; its abstract gives "absence of tooth/root perforation (P = 0.06)" | Matches chapter |
| 6 | Root-filling quality on radiograph → good, no voids | "Quality of root canal treatment judged by the radiographic appearance of the root filling (Fig. 17.23)" | Pooled OR 3.9 (2.5–6.2), good-quality vs suboptimal root filling. Unsatisfactory = "inadequate seal," "poor apical seal," or "radiographic presence of voids". Ng 2008 abstract: "root filling with no voids" | Matches chapter (shortened; see below) |
| 7 | Final coronal restoration → good quality | "Quality of the final coronal restoration (Fig. 17.24)" | Pooled OR 1.9 (1.5–2.5), satisfactory vs unsatisfactory restoration; "good-quality coronal restoration, regardless of type". Ng 2011 abstract: P ≤ 0.001 | Matches chapter |

Header and framing: "BETTER HEALING ASSOCIATED WITH" (association wording); the chapter's own lead-in is "considered as
having a major impact on periapical health subsequent to root canal treatment".

### Nuances a reviewer should know
- **Row 3.** The chapter's bullet names the apical extent of *preparation* but cites Fig. 17.22, which pools the
  apical extent of *root fillings* (short >2 mm, flush 0–2 mm, long beyond the apex). The chapter explains that most
  studies could not separate the two, that the London Eastman study found both to affect healing independently, and
  that canals are normally filled as far as they are prepared. The second line now says so in words: "flush: root
  filling 0–2 mm within the radiographic apex" (it used to read "0–2 mm within the radiographic apex, not beyond",
  which presented the root-filling category as if it were a measurement of the preparation).
- **Row 6.** The chapter treats radiographic root-filling quality as a surrogate for the quality of the whole
  treatment and says the criteria "have not been well defined". "No voids" is one of the three criteria it lists for
  an unsatisfactory filling (with inadequate seal and poor apical seal); it was chosen because it also appears in the
  Ng 2008 abstract.
- **Row 5.** The chapter states a 30% reduction in the odds of success; the Ng 2011 abstract reports this factor with
  P = 0.06. No number is on screen.
- **Row 4.** The culture test is shown as a factor like the others; the second line says it is prognostic but not
  routine, as the resident asked and as the chapter describes.
- **No odds ratios on screen.** Each would need its comparison and pooling stated. They are listed in the table
  above.

## What is schematic
- The pictograms are icons, not anatomy to scale: the patency file projects well past the foramen, the ruler ticks
  are not millimeters, the culture plate and the radiograph are stylized.
- Each pictogram shows the *factor*, not the favorable state (pane 1 shows a lesion, pane 4 a plate with colonies,
  pane 5 a perforation). The favorable state is given in words in the tablet.
- The golden nimbus in the center pane marks the periapical region; it is not a depiction of healing.

## Could not be verified
- The edition number and book title are not printed in the extracted chapter text. The part outline (Part III,
  chapters 17–25) and page number (652) are consistent with the 12th edition, and the file was supplied as such.
- Ng 2011, Ng 2008 and Sjögren 1997 were checked from PubMed abstracts only. The "twofold" (patency) and "30%"
  (perforation) figures are the chapter's and were not checked against the 2011 full text.
- Forest plots were read from captions and study labels; the graphics did not come through in the extraction.
- Nothing in the resident's list was unsupported by the chapter.

## Self-QA log
1. First build: wall, window, tablet. Changed the pane ground from one shared cobalt to each pane's own deep jewel
   tone (cobalt kept as the petal border) so each factor has one color in the glass, the counter and the list.
2. Lead lines of covered pieces showed through later pieces (radiating lines across the center root). The came layer
   now follows painter's order: each piece erases the leads beneath it before its own lead is drawn.
3. Active medallions were overexposed by bloom plus the light shaft. Pale glass tinted, dentin darkened, bloom
   reduced, shafts start below the medallion.
4. Culture plate redrawn (blood-agar red, one serpentine streak, colonies thinning out); file in the patency pane
   widened; radiograph root darkened for contrast with the filling.
5. Row 3 could not carry its definition on one line at 30 px, so the window was reduced by 3% and row pitch set to
   47 px to make room for a second line; row 4 already had one.
6. Counter crossfade showed "1" over "7" for a few frames; now sequential.
7. Final checks with `--safe`: 12-frame sheet, every factor state, t = 0, last frame; no console errors; ffprobe
   1080×1920, 30 fps, H.264 + AAC, 26.57 s.

## Known weaknesses
- Text-heavy for a reel (about 68 must-read words) and static in composition; it is a list by design.
- Medallions are about 140 px across on a 1080 px frame; the pictograms read as icons, not as teaching diagrams.
- The light shafts pass over lower panes and the tablet as a faint colored haze.
- "Flush" for the extent of preparation borrows the root-filling category; the second line of row 3 now states this.

## Independent review
Done by a second reviewer who did not build the reel, against the resident's copy of the chapter (read as extracted
text: the whole section "Factors Affecting Periapical Health or Healing Following Root Canal Treatment" through the
summary list, the captions of Figs. 17.19–17.24, and reference-list entries 150, 153 and 201; forest-plot graphics do
not come through in the extraction, so pooled values are from the captions).

### Checked against the chapter
- The summary list has seven bullets, in the same order as the resident's list and the seven rows. Nothing missing,
  added or merged. The lead-in is "major impact on periapical health"; the section heading says "Periapical Healing".
- Rows 1, 2, 4, 5 and 7 match the bullets and the direction given in the text or figure captions (absence vs
  presence of a radiolucency, small vs large; patency achieved; preobturation negative vs positive culture;
  perforation "if present" lowers the odds; satisfactory vs unsatisfactory coronal restoration).
- Row 4: the chapter says requiring a negative culture "has fallen out of clinical favor" and still reports the
  pooled association, so "a prognostic factor, though not routine practice" is supported.
- Row 6: the figure compares "good quality versus suboptimal quality" root fillings. "No voids" is one of the three
  criteria the chapter gives for an unsatisfactory filling (with "inadequate seal" and "poor apical seal"), and the
  chapter says the criteria "have not been well defined". Left as built (there is no room for all three at 31 px);
  the meta.json source now lists the three criteria. A resident should not read "no voids" as the whole definition.
- No odds ratio or percentage is on screen. The header says "associated with". Nothing on screen, in meta.json or in
  the caption mentions tooth survival, tooth loss or extraction except the caption's "Healing, not tooth survival".
- Reference numbers: 150 = Ng, Mann & Gulabivala 2011; 153 = Ng et al. 2008, Part 2; 201 = Seltzer et al. 1963.

### Changed
1. **Row 3, second line.** Was "0–2 mm within the radiographic apex, not beyond", which read as a measurement of
   the preparation. The chapter's bullet names the extent of *preparation* but cites a figure of *root fillings*
   (underextended, flush, overextended), and "0 to 2 mm within the radiographic apex (flush)" is defined for root
   fillings. Now "flush: root filling 0–2 mm within the radiographic apex". The claim, its source and the caption in
   meta.json say the same.
2. **Timing.** Every row had the same 2.55 s slot (3.05 s for rows 3 and 4), so each row was complete on screen for
   only about 1.4 s before the next pane lit, and the second lines of rows 3 and 4 for about 1.35 s. Slots are now
   set per row by word count (3.2, 2.9, 5.0, 4.2, 2.3, 3.2, 1.9 s), the carving of each row starts 0.1 s earlier and
   finishes sooner, the intro is 1.0 s instead of 1.5 s, and the fully lit hold is 4.0 s (list complete for 5.8 s).
   Duration 26.55 s → 29.3 s. Rows are now complete for 70–82% of `Kit.readSecs` before the next reveal; reaching
   100% for all rows would need about 34 s, over the 30 s limit. All rows stay until 28.5 s.
3. **meta.json.** Duration; claim 3 and its source; the three criteria in the source of claim 6; caption rewritten
   (study summary of the chapter, healing not survival, associations not causation, culture prognostic though not
   routine, schematic icons; 697 characters).
4. **Source hygiene.** RESEARCH.md now refers to "the resident's copy of the chapter" only; the builder's extracted
   full-text copy in `_scratch/` was deleted.

### Visual QA (stills with `--safe`: 16-frame sheet before, 11 targeted frames after the changes)
- Text sizes as listed above: nothing must-read under 30 px; source line 23 px and handle 24 px are fine print.
- All text inside x 62–1013, y 238–1580 (the descenders of the 23 px source line reach about y 1582); below y 1100 nothing readable right of x 954. The new second line of
  row 3 ends at about x 872.
- Panes and roundels numbered 1–7 once each, clockwise from the top; pictograms in order (lesion, file through the
  terminus, ruler to the apex, culture plate, perforation, root filling on a radiograph, crown) match rows 1–7 and
  their colors. Counter reads 7 at rest, then 1/7 … 7/7 in step with the panes.
- Title readable on frame 0; last frame equals frame 0; no overlap, clipping or missing glyphs; no render errors.
- Poster (28.2 s) is the complete, fully lit summary frame.

### Not verified
- Edition and book title are not printed in the extracted text (builder's note stands).
- The primary papers were not re-read; the review checked the reel against the chapter only.

Final render after the review: 879 frames, 1080×1920, 30 fps, H.264 + AAC, ffprobe duration 29.30 s
(`REEL.duration` 29.3), no render errors.

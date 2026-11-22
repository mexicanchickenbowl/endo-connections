# 41 · Periapical healing: seven prognostic factors (after nonsurgical root canal treatment)

**Style:** stained-glass rose window. One Canvas 2D frame: a dark ashlar wall, a round rose window in a carved stone
surround (bead moulding, roll, splayed reveal), a central pane showing a root apex with a golden nimbus where the
periapical tissues are, and seven petal panes, one per factor, each in its own jewel tone (ruby, amber, emerald,
sapphire, amethyst, teal, rose) with a leaded pictogram medallion and a numbered roundel. Below the window, a carved
stone tablet takes the list. Fraunces 600/700 and italic (title, factor names, numerals, second lines), Inter 600
(header, favorable direction), Inter 400/500 (source line, handle).
**Duration:** 26.55 s · 1080×1920 · silent · poster at 24.85 s (the fully lit window and the complete list).
American spelling.
**Files:** `index.html` (page contract), `rose.js` (geometry, glass builder, pictograms, light, text, `render(t)`).
**Sibling reels:** 39 (surgery factors) and 40 (tooth-survival conditions) are separate. This reel is only about
periapical healing; nothing on screen mentions tooth survival, tooth loss or extraction.

## Concept
A study aid for a board/quiz list. The chapter's summary names seven factors with "a major impact on periapical
health" after root canal treatment. The window starts unlit. Light comes through one petal at a time; as it does, the
counter turns to that number in the pane's color and the factor is carved into the tablet as a row: numeral, factor
name, and the state associated with better healing. Rows stay, so the list builds into the finished cheat sheet, which
is then held with the whole window lit for 4.6 s.

Wording is association only: the column head reads "BETTER HEALING ASSOCIATED WITH". The center pane is lit softly
from the start and fully at the end; it never "heals" on screen, so nothing implies that the seven together guarantee
an outcome.

## Storyboard (seconds, as built)
| t | Beat | On screen |
|---|------|-----------|
| 0.0–1.5 | **Hook.** Title is legible on frame 0. Window dim, center pane glows softly (0.15–1.3). Tablet shows its header and seven faint slot numerals. | Periapical healing · after nonsurgical root canal treatment · **7** FACTORS |
| 1.5–4.05 | **Pane 1** (ruby) lights over 0.85 s with a shaft of light and a red pool on the floor; counter 1 / 7; row 1 is carved 0.35–1.15 s after the pane starts. | 1 Periapical lesion: presence, size → none, or smaller |
| 4.05–6.6 | **Pane 2** (amber). Earlier panes settle to about three-quarters brightness. | 2 Patency at the canal terminus → achieved |
| 6.6–9.65 | **Pane 3** (emerald); 0.5 s longer for the second line (in at +1.2 s). | 3 Apical extent of preparation → flush · *0–2 mm within the radiographic apex, not beyond* |
| 9.65–12.7 | **Pane 4** (sapphire); 0.5 s longer for the second line. | 4 Intraoperative culture test → negative · *a prognostic factor, though not routine practice* |
| 12.7–15.25 | **Pane 5** (amethyst). | 5 Iatrogenic perforation → none |
| 15.25–17.8 | **Pane 6** (teal). | 6 Root-filling quality on radiograph → good, no voids |
| 17.8–20.35 | **Pane 7** (rose). | 7 Final coronal restoration → good quality |
| 20.35–21.15 | All seven panes and the center rise to full light. | 7 / 7 |
| 21.15–25.75 | **Payoff / summary hold (4.6 s).** Complete list under the fully lit window; one slow pass of brighter light (21.25–24.25); poster at 24.85. | whole frame |
| 25.75–26.55 | Rows fade (0.55 s), lights go down, counter returns to "7 FACTORS": the last frame equals frame 0. | title only |

Reading: every row stays from the moment it is carved until 25.75 s. The shortest-lived row (7) is fully visible for
about 6.8 s; `Kit.readSecs` for its five words is 2.3 s. Row 3 (13 words with its second line) needs 4.7 s and is
visible for more than 17 s.

Type sizes: title 82 px; counter numeral 104 px; factor names 36 px; favorable direction 31 px; second lines 30 px;
tablet header and "FACTORS" 30 px; tablet numerals 38 px; numerals in the glass about 34 px; source line 23 px and
handle 24 px (fine print). Must-read words on the final frame: about 67 (title block 9, header 5, rows 53). That is
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
| 3 | Apical extent of preparation → flush · 0–2 mm within the radiographic apex, not beyond | "Apical extent of chemomechanical preparation in relation to the radiographic apex (Fig. 17.22)" | Fig. 17.22, pooled probability of periapical health: underextended 0.76, flush 0.81, overextended 0.66 (root fillings). "Flush" = 0–2 mm within the radiographic apex; long fillings had the lowest success. Ng 2011 abstract: cleaning "as close as possible to its apical terminus" (P = 0.001) | Matches chapter, with a nuance (below) |
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
  that canals are normally filled as far as they are prepared. "Flush · 0–2 mm within the radiographic apex, not
  beyond" is therefore the chapter's root-filling category used as the yardstick for apical extent.
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
- Text-heavy for a reel (about 67 must-read words) and static in composition; it is a list by design.
- Medallions are about 140 px across on a 1080 px frame; the pictograms read as icons, not as teaching diagrams.
- The light shafts pass over lower panes and the tablet as a faint colored haze.
- "Flush" for the extent of preparation borrows the root-filling category (see the nuance on row 3).

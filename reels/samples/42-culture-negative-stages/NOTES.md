# 42 · Negative cultures at three treatment stages — NOTES

**Status: DRAFT study animation for resident review. Not for public posting until approved.**
Fourth of the Chapter 17 set (39 bowling alley, 40 star chart, 41 stained glass). Evidence brief: `RESEARCH.md`.

## Concept

A quiz/board study card: three side-by-side donut snapshots of the **proportion of cases with a negative culture**
at three stages of root canal treatment, as pooled by Ng & Gulabivala. The numbers are pooled from different studies,
so the reel shows three separate snapshots on a common scale. It has no arrows, no connecting line and no
"each step adds X%" wording.

Style: mid-century science-textbook plate. Three-ink offset print (deep teal, brick red, mustard) plus charcoal on
warm paper with grain, slight plate misregistration, halftone dots and ink dropout; geometric tile bands fill the
Instagram no-go zones as decoration. Type: Space Grotesk (title), Barlow / Barlow Condensed (labels), IBM Plex Mono
(numerals, handle).

Colour key, constant throughout: **teal (solid) = culture-negative; brick with halftone dots = culture-positive**.
The dots are a second, non-colour cue. Mustard is accent only (tag strip, study range bar, highlighter). The two
broth tubes in the legend tie the colours to a culture result: clear broth = negative, cloudy broth = positive.

All geometry comes from one `DATA` object in `index.html` (`neg`, `min`, `max` per stage; `pos = 100 − neg`;
arc angle = `neg / 100 × 2π`), with a load-time check that negative + positive = 100 and min ≤ pooled ≤ max.

## Storyboard (27.2 s, 30 fps, loops)

| Time (s) | What happens |
|---|---|
| 0.0 | Resting frame = first and last frame: tag strip, title, legend, three ghost rings with A/B/C badges, source lines |
| 0.25–1.35 | Ring keylines draw on (same size, same 12 o'clock start tick on each) |
| 1.4–4.1 | **A** label in; teal arc sweeps clockwise 0 → 31% while the counter runs 0 → 31; brick remainder fills; table rows 31% / 69% |
| 4.0–7.05 | **B** the same, 0 → 52; rows 52% / 48% |
| 6.85–10.15 | **C** the same, 0 → 71; rows 71% / 29% |
| 10.1–11.85 | Range tracks draw: 0–100 axis, mustard min–max bar growing out from the pooled average, diamond marker, "range across studies" label |
| 11.85–15.9 | Complete comparison frame held 4.05 s (poster at 14.0 s) |
| 15.9–16.25 | Title fades out of the headline slot (donuts, legend and tag stay) |
| 16.25–22.05 | Takeaway 1 (fully visible 16.65–21.75 = 5.10 s; readSecs 5.04): "A larger share of cases test negative in NaOCl studies, and after a dressing." The 52 and 71 counters give one small pulse each |
| 22.05–26.9 | Takeaway 2 (fully visible 22.45–26.60 = 4.15 s; readSecs 4.13): "But ranges are wide — and negative culture ≠ sterile canal." Highlighter on "ranges are wide"; the three range bars swell once |
| 26.6–27.15 | Rows fade to the ghost rings; title returns; frame equals t = 0 |

The sweep time grows with the value (1.40 / 1.75 / 2.05 s). The counter always shows the rounded share currently
drawn and settles exactly on 31, 52 and 71.

## On-screen text (complete)

- Tag strip (always on): `POOLED FROM DIFFERENT STUDIES · NOT ONE COHORT` · `@natebrooksendo`
- Title: `Negative cultures` / `at three stages of root canal treatment`
- Legend (always on): `culture-negative` (clear tube, teal swatch) · `culture-positive` (cloudy tube, dotted brick swatch) ·
  track key `◆ pooled average` / `▬ study range`
- A: `Instrumentation + water or saline` · hole `31%` `negative` · `cases culture-negative … 31%` · `culture-positive … 69%` · track `0 … 100` · `range across studies 0–79%`
- B: `Instrumentation + NaOCl 0.5–5%` · `52%` `negative` · `52%` / `48%` · `range across studies 13–95%`
- C: `Next visit, after antibacterial dressing` · `71%` `negative` · `71%` / `29%` · `range across studies 25–100%`
- Takeaway 1: `A larger share of cases test negative in NaOCl studies, and after a dressing.`
- Takeaway 2: `But ranges are wide — and negative culture ≠ sterile canal.`
- Fine print (24 px): `Weighted pooled averages of culture studies · case = a sampled tooth or canal` /
  `Ng & Gulabivala, Cohen’s Pathways of the Pulp, 12th ed., ch. 17 · Gulabivala & Ng, Int Endod J 2023`

Sizes: title 90 px; subtitle 36; tag 30; stage labels 46; counter 116 (% sign 54); "negative" in the hole 30; table
rows 36 with 34 px numerals; range label 32 / 30; legend 32; track key 30; axis end labels 30; takeaways 50. Fine
print only: source lines 24, handle 24.

## Every on-screen number — source and kind

| On screen | Kind of number | Source |
|---|---|---|
| 31% culture-negative, water/saline | weighted pooled average of the proportion of cases with a negative culture after mechanical preparation with a neutral irrigant | Ch. 17 text after Table 17.9 ("weighted pooled average in 31% of the cases"); Gulabivala & Ng 2023 p. 100 — both read |
| 69% culture-positive | arithmetic complement, 100 − 31 | derived |
| range 0–79% | lowest and highest study value | same two sources |
| 52% culture-negative, NaOCl | weighted pooled average, sampled immediately after debridement | same two sources |
| 48% | 100 − 52 | derived |
| 0.5–5% | range of NaOCl concentrations across the pooled studies | chapter "0.5% to 5%"; review "0.5%–5.0%" |
| range 13–95% | lowest and highest study value | same two sources |
| 71% culture-negative, next visit after dressing | chapter: "on average"; review: "weighted pooled average". Sampled at the subsequent visit after an active interappointment antibacterial dressing | same two sources |
| 29% | 100 − 71 | derived |
| range 25–100% | lowest and highest study value | same two sources |
| "cases" / "case = a sampled tooth or canal" | unit | sources say "cases"; Table 17.9 sample sizes are mostly teeth, sometimes canals |
| track axis 0 and 100 | scale of the range track, percent of cases | — |

Nothing on screen is modelled or schematic; the tile bands are decoration and carry no data.

## Underlying studies (summary; full table in RESEARCH.md)

Table 17.9 lists 40 culture studies from 1953 to 2013 and reports the percentage of samples with bacteria present
(positive). The negative-culture figures are in the chapter text. Rows traced to the range limits: Byström &
Sundqvist 1981 (saline, 0% negative), Byström & Sundqvist 1983 (0.5% NaOCl, 13%), Xavier 2013 (calcium hydroxide,
25%), Byström 1985 and Yared & Bou Dagher 1994 (calcium hydroxide, 100%). Twenty of the table's studies were checked against
PubMed abstracts; counts matched for Sjögren 1997, Shuping 2000, Card 2002, Kvist 2004, Chu 2006, Molander 1990,
Ørstavik 1991 (next-visit sample) and both Siqueira 2007 papers. The dressings pooled in stage C are mixed (calcium
hydroxide, CMCP, clindamycin, iodine–potassium iodide, chlorhexidine, antibiotic/steroid pastes).

## Not verified

- The weighting method and the exact rows behind each pooled average are not described in either source, so 31 / 52 /
  71 cannot be re-derived exactly. A crude re-sum of the water/saline rows gives about 26–32% (my arithmetic only).
- The study behind the 95% upper limit for NaOCl and the 79% upper limit for water/saline could not be pinned down
  with certainty from the scrambled table extraction (79% is probably Bence 1973).
- Table rows not listed in RESEARCH.md were not checked. No primary full text was read; primary studies are not cited
  on screen or in the caption.
- Gulabivala & Ng 2019 (the review's cited source for the pooled figures) was not read.
- McGurkin-Smith 2005 is not among the chapter's or the review's listed studies.

## The odds ratios are a different question (kept off the screen)

- Chapter 17, Fig. 17.19: pooled OR 2.1 (95% CI 1.5–2.9) for periapical health with a preobturation negative versus
  positive culture.
- Gulabivala & Ng 2023, Figure 4: the same 15 studies re-pooled, OR 1.6 (95% CI 1.4–1.9; I² = 61%). The review's text
  still says "twofold".

These are odds of healing by culture result. They are not proportions of culture-negative cases, so they are not in
or on the donuts. They are also not shown as a footnote card: a legible card needs about 5–7 s more reading time,
which would push the reel past 28 s and well past the ~60-word budget. They are in the caption (`meta.json`) and here.

## Guardrails applied

- Three snapshots with a permanent "pooled from different studies · not one cohort" tag; no arrows, staircase,
  trend line or "additional X%" text.
- Quantity labelled on every panel as "cases culture-negative"; never "bacteria killed" or "remaining".
- "negative culture ≠ sterile canal" stated once, in the final takeaway.
- No recommendation to culture; the caption says so explicitly.
- Same donut size, start angle, direction and two-colour key on all three panels; a range track per panel.

## QA record

- Three still passes with `--safe` (12-frame sheets plus full-resolution frames at t = 0, each settle frame, 14.0 s,
  both takeaways and the last frame). No console errors.
- Arc check from rendered pixels at t = 14.0 s (ring sampled at 7200 angles): teal share 30.9% / 52.2% / 71.4% of the
  inked ring, against 31 / 52 / 71. The 3 px paper gaps at the start angle and the split account for the difference.
- First and last video frames match (v1: mean absolute difference 0.6 of 255, compression noise; v2: see Independent review).
- Safe area: all must-read text within x 64–1016, y 238–1580; row C and the fine print stay left of x = 956.

## Known weaknesses

- Text-heavy for a reel (about 90 must-read words); the three rows are parallel, which keeps it scannable.
- The resting first/last frame shows only the header and ghost rings for about 1.4 s.
- Teal and brick are close in lightness; the halftone dots on brick are the fallback cue for color-vision deficiency.

## Change log

- v1: research, build, three QA passes, render.
- v2 (independent review): takeaway 1 reworded; track key and axis end labels raised from 22 px to 30 px; takeaway 1
  hold lengthened, duration 26.0 → 27.2 s; meta.json claims and caption updated; re-rendered. Details below.

## Independent review

Done by a second reviewer who did not build the reel. Sources were re-read, not taken from the builder's notes.

### Checked against the sources

- **Chapter** (the resident's copy of the chapter; section "Root Canal Bacterial Culture Results Prior to Obturation",
  Table 17.9, the paragraph after it, Fig. 17.19 caption). Confirmed: A "weighted pooled average in 31% of the cases
  (range 0% to 79%)", water or saline only; B "weighted pooled average of 52% (range 13% to 95%)", NaOCl
  "concentration range 0.5% to 5%", "immediately"; C "on average in 71% of cases (range 25% to 100%)", "in the
  subsequent visit", "active interappointment antibacterial dressing". Fig. 17.19: pooled OR 2.1 (95% CI 1.5, 2.9).
  Table 17.9 has 40 study rows and the sentence cites 40 reference numbers.
- **2023 review** (full text, journal pp. 100–101 and Figure 4). Confirmed the same three figures and ranges, each
  labelled "(weighted pooled average)"; NaOCl "0.5%–5.0%"; Figure 4 pooled OR 1.6 (95% CI 1.4, 1.9; table row 1.62,
  1.39–1.90; I² = 61.2%). Citation confirmed on PubMed (PMID 36710532).
- **Unit.** Both texts say "cases"; the table header says "samples"; sample sizes are mostly teeth, some canals.
  "case = a sampled tooth or canal" is a fair gloss.
- **"Weighted pooled averages"** in the fine print is the review's wording for all three; the chapter writes
  "on average" for the third. Both sources are on the source line, so the line stands.
- **Stage C label.** Neither text names the dressing; "antibacterial dressing" follows the sources. The mixed agents
  are in the caption ("various agents") and in meta.json.
- **Range limits traced in Table 17.9** (my reading): 0% = Byström & Sundqvist 1981 (15/15 positive with saline);
  79% = Bence 1973 (21% positive after the last file size); 13% = Byström & Sundqvist 1983 (13/15 positive);
  25% = Xavier 2013 (18/24 positive after calcium hydroxide); 100% = Sjögren 1991 (7-day), Yared & Bou Dagher 1994,
  Byström 1985. The 95% upper limit for NaOCl is probably Stewart 1961 (0.5% NaOCl with Gly-oxide or hydrogen
  peroxide: 4/77 positive overall = 95% negative). That is an inference; the sources do not say which row it is.
- **Primary studies re-checked on PubMed (abstracts only):** Sjögren 1997 (PMID 9477818; 22 of 55 canals positive),
  Shuping 2000 (PMID 11471648; 61.9% bacteria-free after NaOCl, 92.5% after calcium hydroxide), Card 2002
  (PMID 12470024; 100% / 81.5% / 89%), Kvist 2004 (PMID 15273638; 29% and 36% positive after medication), Chu 2006
  (PMID 16410062; 13/27, 8/26, 11/35 positive), Wang 2007 (PMID 17963947), Byström & Sundqvist 1981 (PMID 6947391),
  Byström & Sundqvist 1983 (PMID 6572884; 12 of 15 bacteria-free at the fifth appointment), Xavier 2013
  (PMID 23880258; design only). All agree with RESEARCH.md. Two notes: the Wang 2007 abstract is internally
  inconsistent ("8.3% (4/36)"; 3/36 = 8.3%), so the chapter's 3/36 is consistent with the stated percentage; the
  first-visit figures for Byström & Sundqvist 1981 and 1983 (15/15 and 13/15) are not in the abstracts.

### Data-vis checks (from rendered frames)

- Teal arc ends at 30.8% / 51.9% / 70.9% of the turn (ring sampled at three radii, 7200 angles each, t = 14 s),
  starting at 12 o'clock, clockwise, same radii on all three. Negative + positive = 100 on each panel.
- Range bars span 0.5–78.4, 13.5–94.4 and 25.2–99.3 on the 0–100 track (the bar outline accounts for the half-point);
  diamonds sit at 31.0, 51.9 and 70.8.
- No arrows, connectors or trend line between panels. Colour key constant; brick always carries the dot pattern on
  donuts, swatches and tube. A deuteranopia estimate of the two inks gives a dark blue-gray against olive, with a
  lightness difference as well; every segment is also labelled directly.
- Safe areas with `--safe`: nothing must-read above y 230, below y 1580 or in the right column (x > 960, y > 1100).
- Comparison frame complete 11.85–15.9 s (4.05 s); poster (14.0 s) is that frame. First and last frames identical.
- Final video (v2): ffprobe 27.2 s, 816 frames, 1080 × 1920, 30 fps, H.264; first and last video frames differ by a
  mean of 0.7 of 255 (compression noise).
- Odds ratios appear nowhere on screen.

### Changed

1. Takeaway 1 was "More cases test negative after NaOCl and after a dressing." It read as one group of cases followed
   through treatment. Now "A larger share of cases test negative in NaOCl studies, and after a dressing." Hold
   lengthened to match (5.10 s visible, readSecs 5.04); duration 26.0 → 27.2 s.
2. Track key ("pooled average" / "study range") and the axis end labels (0, 100) were 22 px mono. They decode the
   chart, so they are now 30 px Barlow Condensed.
3. meta.json: duration, takeaway claim, fine-print claim, caption (adds the 95% CI for OR 2.1, "various agents" for
   the dressing; 691 characters).

### Not verified / to know before using it for a quiz

- The weighting method and the rows behind each pooled figure are not given in either source. The review attributes
  the figures to Gulabivala & Ng 2019, which was not read.
- The sources' own wording is sequential ("increased the frequency of negative cultures"). The reel is deliberately
  more cautious than the sources on this point.
- Some studies contribute to more than one stage (for example Shuping 2000, Kvist 2004), so the three pools overlap
  in part. "Not one cohort" is still correct for the pooled figures.
- The table's next-visit column includes a few arms that are not interappointment dressings in the usual sense
  (10-minute iodine–potassium iodide, 10-minute calcium hydroxide). Whether these entered the 71% is not stated.
- Subgroups can exceed the published range (Card 2002: 100% of cuspid/bicuspid canals negative after 1% NaOCl, against
  an upper limit of 95%). The ranges appear to be study-level values.
- The chapter (OR 2.1) and the 2023 review (OR 1.6) pool the same 15 studies. The review's running text still says
  "twofold". In the review's Figure 4 one study carries 42.7% of the weight, which is unusual for a random-effects
  model with I² = 61%; the reason for the different pooled values is not explained in either source.
- No primary full text was read.

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

## Storyboard (26.0 s, 30 fps, loops)

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
| 16.25–20.85 | Takeaway 1 (fully visible 16.65–20.55 = 3.90 s; readSecs 3.83): "More cases test negative after NaOCl and after a dressing." The 52 and 71 counters give one small pulse each |
| 20.85–25.7 | Takeaway 2 (fully visible 21.25–25.40 = 4.15 s; readSecs 4.13): "But ranges are wide — and negative culture ≠ sterile canal." Highlighter on "ranges are wide"; the three range bars swell once |
| 25.4–25.95 | Rows fade to the ghost rings; title returns; frame equals t = 0 |

The sweep time grows with the value (1.40 / 1.75 / 2.05 s). The counter always shows the rounded share currently
drawn and settles exactly on 31, 52 and 71.

## On-screen text (complete)

- Tag strip (always on): `POOLED FROM DIFFERENT STUDIES · NOT ONE COHORT` · `@natebrooksendo`
- Title: `Negative cultures` / `at three stages of root canal treatment`
- Legend (always on): `culture-negative` (clear tube, teal swatch) · `culture-positive` (cloudy tube, dotted brick swatch) ·
  fine-print key `◆ pooled average` / `▬ study range`
- A: `Instrumentation + water or saline` · hole `31%` `negative` · `cases culture-negative … 31%` · `culture-positive … 69%` · track `0 … 100` · `range across studies 0–79%`
- B: `Instrumentation + NaOCl 0.5–5%` · `52%` `negative` · `52%` / `48%` · `range across studies 13–95%`
- C: `Next visit, after antibacterial dressing` · `71%` `negative` · `71%` / `29%` · `range across studies 25–100%`
- Takeaway 1: `More cases test negative after NaOCl and after a dressing.`
- Takeaway 2: `But ranges are wide — and negative culture ≠ sterile canal.`
- Fine print (24 px): `Weighted pooled averages of culture studies · case = a sampled tooth or canal` /
  `Ng & Gulabivala, Cohen’s Pathways of the Pulp, 12th ed., ch. 17 · Gulabivala & Ng, Int Endod J 2023`

Sizes: title 90 px; subtitle 36; tag 30; stage labels 46; counter 116 (% sign 54); "negative" in the hole 30; table
rows 36 with 34 px numerals; range label 32 / 30; legend 32; takeaways 50. Fine print only: source lines 24, track key
22, axis end labels 22, handle 24.

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
- First and last video frames match (mean absolute difference 0.6 of 255, compression noise).
- Safe area: all must-read text within x 64–1016, y 238–1580; row C and the fine print stay left of x = 956.

## Known weaknesses

- Text-heavy for a reel (about 80 must-read words); the three rows are parallel, which keeps it scannable.
- The resting first/last frame shows only the header and ghost rings for about 1.4 s.
- Teal and brick are close in lightness; the halftone dots on brick are the fallback cue for color-vision deficiency.
- The fine-print key (22 px) explains the diamond and bar; the 32 px range label repeats the essential part.

## Change log

- v1: research, build, three QA passes, render.

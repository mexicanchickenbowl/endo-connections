# 24 — kVp, mA and exposure time: what each knob does inside the X-ray tube head · retro control console

Silent, 23.4 s, 1080x1920, one 2D canvas (`index.html` + `reel.js`), deterministic `render(t)`.
Evidence brief: `RESEARCH.md` (researched, then independently fact-checked). Only its section (b) "recommended
on-screen facts" is used on screen, with the [FC] wording constraints and the "Do not claim" list.
The three papers named on screen (McCollough 1997, PMID 9225393; Zink 1997, PMID 9308113; Seibert 2004, PMID 15347692)
and Nickoloff 1993 (PMID 8290728, cited in these notes and meta.json only) were re-pulled from PubMed at build time;
the EC RP136 and IAEA SRS 108 sentences were re-read in the saved extracts (`_scratch/dl/`).

## Concept
The whole frame is one 1970s instrument: walnut cheeks, warm-charcoal faceplate, brushed-aluminum control strip.
A smoked "dial glass" carries the captions like a tuner dial (the red tuning pointer is the reel's progress bar).
Below it an inspection window shows the tube head in cutaway; below that a VU-style heat meter, a small image viewer,
an EXPOSE lamp with an mAs counter, and a round CRT scope showing the X-ray spectrum; at the bottom three knurled
knobs (mA, kVp, TIME) with red seven-segment readouts. One knob is turned at a time and ONLY its consequences move:

- **mA**: filament brighter, electron stream twice as dense, spectrum twice as tall, end point fixed at 60 keV.
- **kVp**: same number of electrons, each one faster and brighter on impact; spectrum end point slides 60 -> 70 keV and
  the curve grows; the image swatch loses contrast (tagged "exaggerated").
- **TIME**: nothing in the tube changes; the EXPOSE lamp simply stays on twice as long and the mAs counter runs
  0.80 -> 1.60.

The takeaway is a three-line cheat sheet on the window glass: **mA -> how many · kVp -> how hard (+ how many) ·
time -> how long**.

## Storyboard (timings in seconds)
| Time | Scene | What moves | Must-read text |
|---|---|---|---|
| 0.0–2.2 | Hook | Console at rest (4 mA, 60 kVp, 0.10 s). EXPOSE lights at 0.35: electron stream, photons, heat needle swings up, anode glows. Each knob gives a +/-10 degree nudge with its lamp (0.45, 0.75, 1.05 s; readouts do not change). | `3 KNOBS` · `What does each do?` · tube labels `FILAMENT`, `TUNGSTEN TARGET`, `ALUMINUM FILTER`, `COLLIMATOR`, legend `ELECTRONS`, `X-RAY PHOTONS` · gauge `~99% HEAT` (all persistent) |
| 2.2–6.4 | mA | Knob 4 -> 8 (2.7–4.2). Filament and space-charge cloud brighten, electrons per second double, photons double, heat needle doubles. Scope: curve doubles, stored dashed trace shows the old one, `MAX 60 keV` marker does not move. Tag `8 mA ->` along the stream (arrow = direction of electron flow). | `mA -> HOW MANY` · `more electrons, more photons · same energies` |
| 6.4–13.6 | kVp, three beats | Beat 1 (6.4–9.8): knob 60 -> 70 (7.2–8.8). Electron count unchanged; longer tails, bigger impact flashes; photons shorter-wavelength; heat needle +1/6; tag `(-) 70 kVp (+)` across the gap; scope end point slides to `MAX 70 keV`; the swatch flattens with the knob (plate still reads `IMAGE`, with `exaggerated` under it). Beat 2 (9.8–11.4): headline gains `+ HOW MANY`, sub line swaps, area gained over the stored 60 kVp trace is tinted. Beat 3 (11.4–13.3): tint drops to 40%, the swatch plate lights `kVp ↑ LESS CONTRAST`. | `kVp -> HOW HARD` · `max keV = kVp`, then `+ HOW MANY` · `output ~ kVp²`, then swatch `kVp ↑ LESS CONTRAST` `exaggerated` |
| 13.6–18.0 | TIME | Beam off (13.2). Exposure 1 at 0.10 s: lamp on 14.5–15.3, counter 0 -> 0.80 mAs, exactly 5 of 10 LED segments; a peak-hold bar stays at the 0.1 s mark. Knob 0.10 -> 0.20 s (15.4–16.1). Exposure 2: lamp on 16.25–17.85 (twice as long), counter 0 -> 1.60 mAs, 10 segments, running past the peak-hold bar. Tube, scope and heat rate identical in both. The swatch label is dimmed (no glow) during this scene. | `TIME -> HOW LONG` · `same beam, on longer · mAs = mA × s` |
| 18.0–23.4 | End card (all rows fully visible 19.35–22.35, 3.0 s) | Window glass goes dark as soon as the lamp is out (18.0–18.35), three rows light one by one (18.25, 18.55, 18.85) with the matching knob lamp; title returns in the dial glass (18.35–18.7). 22.35–22.6 rows fade, 22.6–22.95 the glass clears, 22.5–23.2 knobs turn back and displays go dark, so the last frame equals the first. | `mA -> HOW MANY` `same energies` / `kVp -> HOW HARD` `+ how many` `max keV = kVp` `output ~ kVp²` / `TIME -> HOW LONG` `mAs = mA × s` |

Must-read words: about 59 (hook 6, mA 9, kVp 11, swatch 4, TIME 11, tube labels and legend 9, gauge 2, scope marker 3,
in-tube tags 4). The end card repeats the three headlines and formulas and adds no new words.
Not counted: instrument name plates (`EXPOSE`, `mAs`, `IMAGE`, the engraved scope ring `X-RAY SPECTRUM · PHOTONS ·
ENERGY · keV · SCHEMATIC`, knob names and scale numbers), the source line, `SCHEMATIC`, the handle, and the model
plate / `POWER` lamp in the top strip that the Reels UI covers.
Poster = 21.0 s (complete cheat sheet + final knob settings + heat, contrast and spectrum panels).

## On-screen claims and their sources
Single engraved source line (24–25 px, baseline y 1561, on screen for the whole reel):
`McCollough; Zink, Radiographics 1997 · Seibert, J Nucl Med Technol 2004 · values illustrative`
(EC RP136 and Pita de Melo 2026 are in the caption's Refs line; Zink stays on screen because it carries the 99% number.)

| # | On screen | Source | Verified from |
|---|---|---|---|
| 1 | `mA -> HOW MANY` · `more electrons, more photons · same energies`; filament glows brighter with mA | Seibert JA. J Nucl Med Technol 2004;32(3):139-47. PMID 15347692: "A larger filament current produces more heat and releases a greater number of electrons"; tube current = "the number of electrons traveling between the electrodes". McCollough CH. Radiographics 1997;17(4):967-84. PMID 9225393: "The quantity of x-rays produced varies proportionally to the tube potential squared, tube current, exposure time..."; `same energies`: "The shape of the x-ray spectrum is affected by the atomic number of the anode material, tube potential, filtration, and voltage waveform" (tube current is not in that list). | Seibert: full text (research stage, re-read by the fact-check); McCollough: abstract (re-pulled at build) |
| 2 | `kVp -> HOW HARD` · `max keV = kVp` ("hits harder" is shown, not written: longer tails, bigger impact flash); tag `70 kVp` across the gap; scope marker `MAX 60/70 keV` | Seibert 2004 (PMID 15347692): "Each electron attains a kinetic energy (in keV) equal to the applied tube voltage"; "maximum x-ray energy (in keV) determined by the peak potential difference (in kVp)". | full text |
| 3 | `+ HOW MANY` · `output ~ kVp²` ("~" = approximately proportional; caption: "tube output rises roughly with kVp²") | McCollough 1997 (PMID 9225393), sentence above; Nickoloff EL, Berman HL. Radiographics 1993;13(6):1337-48. PMID 8290728: "radiation output increases by approximately the square of the tube potential". "Output" = exposure / air kerma at the port, hence the "~". | abstracts (both re-pulled at build) |
| 4 | `TIME -> HOW LONG` · `same beam, on longer · mAs = mA × s`; counter 0.80 -> 1.60 mAs | McCollough 1997 (PMID 9225393): proportional to exposure time; Seibert 2004 (PMID 15347692): "the combination of tube current and exposure time in milliampere-seconds (mAs)". 8 mA x 0.10 s = 0.8 mAs; x 0.20 s = 1.6 mAs. | abstract; full text; arithmetic |
| 5 | `~99% HEAT`; needle = heating rate kV x mA on an arbitrary scale (the `kV × mA` face legend was removed: it could not be 30 px) | Zink FE. Radiographics 1997;17(5):1259-68. PMID 9308113: "only 1% of the electric energy converted to x-ray photons and the remaining 99% converted to heat" (diagnostic tubes in general; the X-ray share is energy dependent and at 60-70 kVp on tungsten it is, by the standard textbook efficiency formula, nearer 0.5%, a figure not read in any source here, so only "~99% heat" is written and it is a safe understatement). Heat unit = mA x kVp x s: Seibert 2004 (heat-loading section). | abstract (re-pulled at build); full text |
| 6 | `kVp ↑ LESS CONTRAST` + `exaggerated` (step wedge and mini radiograph flatten only in the kVp scene; drawn density-matched, raw-beam background stays black) | European Commission. Radiation Protection 136: European guidelines on radiation protection in dental radiology. 2004, sect. 4.1: "'Low' kilovoltages produce images of higher contrast than do higher kilovoltages." Caveat (caption): 60 vs 70 kVp had "minimal impact" on contrast with three CMOS sensors in one phantom study — Pita de Melo D et al. Dentomaxillofac Radiol 2026. PMID 42538829. | guideline full text (extract re-read); abstract |
| 7 | Tube labels `FILAMENT`, `TUNGSTEN TARGET`, `ALUMINUM FILTER`, `COLLIMATOR`; low-energy photons end in the filter; the collimator trims the beam | Seibert 2004 (filament, thermionic emission, "a metal focusing cup (cathode cup)", "Targets used in x-ray tubes are generally made of tungsten"; Fig. 3 caption: "transformer oil and expansion bellows to provide electrical and heat build-up protection". It does NOT mention a copper anode block or an aluminum filter. The copper block is standard textbook anatomy: seen only in an online chapter excerpt of Whaites E, Drage N, Radiography and Radiology for Dental Care Professionals, 3rd ed., at the research stage, not re-verified; drawn, not labeled. White and Pharoah was not read and is not cited); EC RP136 (2004) sect. 4.2: "Filtration of the X-ray beam preferentially removes lower energy X-ray photons from the beam." and "Filtration using aluminium is an established component of dental X-ray equipment."; sect. 4.3 "Collimation, field-size trimming". No filter thickness, HVL or field-size number is shown. | full text; guideline full text |
| 8 | Readouts `4 -> 8` mA, `60 -> 70` kVp, `0.10 -> 0.20` s, tagged `values illustrative` | Realistic, not prescriptive: IAEA Safety Reports Series No. 108 (2022) sect. 5.1.2.1: minimum 60 kV; "The tube current is usually 3.5 to 8 mA"; sub-second exposures. | guideline full text (extract re-read) |

Wording guards taken from the fact-check: no "1% X-rays"; no mean-energy number or fraction; no tungsten K lines
drawn and no K-line annotation; the square law keeps its "~"; nothing attributed to White and Pharoah, NCRP 177 or
the ADA 2024 recommendations; no dose figure tied to any setting; the swatch changes only with kVp and never
darkens with mA or time; the caption does not say the operator can "only" change time.

## What is schematic (labelled on screen)
- **Spectrum (scope ring engraved `SCHEMATIC`, 30 px, visible whenever the scope is).** Toy model, not a measured
  dental spectrum: photons(E) proportional to mA x (kV/E - 1) x exp(-mu(E) x 2 mm Al), NIST aluminum mu/rho,
  constant potential. Normalised so 70 kVp / 8 mA peaks at 88% of the screen. It is zero at E = kVp, essentially empty
  below about 15 keV, the hump stays near 30 keV, 60 -> 70 kVp raises the peak about x1.3 and the area about x1.5
  (inside the x1.4–1.5 the fact-check allows). The x-axis carries real keV (20, 40, moving `MAX` marker); the
  y-axis has no scale. No characteristic lines.
- **Tube window (`SCHEMATIC`, bottom right).** Not to scale. Electron number, speed and tail length are symbolic:
  emission rate follows mA only; kVp changes transit time (0.48 -> 0.38 s on screen), tail and impact flash, not the
  number emitted. The stream is "pre-filled" so the lamp, the stream and the photons switch together.
- **Photon wave packets.** Rate follows mA x the unfiltered Kramers integral; each packet's energy is sampled from
  the Kramers shape (15 keV to kVp), shown as wavelength; a packet stops in the filter with probability
  1 - transmission(2 mm Al), or at the collimator if it leaves outside +/-12 degrees. Proportions are the toy model's.
- **Heat.** Needle = kV x mA normalised (70 x 8 = 0.74 of the scale; 60 x 4 = 0.32), spring-damped; anode glow is a
  lagged copy. No watts, joules or temperatures.
- **Time scene** is slow motion: 0.10 s of exposure is drawn over 0.8 s, 0.20 s over 1.6 s. The LED bar is 0.02 s per segment.
- **Image swatch.** A drawn mini periapical + step wedge. At 70 kVp the OBJECT tones are compressed to 50% contrast
  about a pivot just under mid-gray; the directly exposed background is left black (raising kVp never lightens the
  raw-beam area). Swatch drawn density-matched, as in textbook step-wedge figures; at unchanged mAs the real image
  would also be darker ("density up, contrast down"). Far larger than the real 60-vs-70 kVp effect, hence
  `exaggerated`, which is on screen whenever the flattened swatch is. Principle: EC RP136 (2004) sect. 4.1.
- **`8 mA` tag.** The arrowheads point cathode -> anode: arrow = direction of electron flow (Seibert defines tube
  current as "the number of electrons traveling between the electrodes"); conventional current runs the other way.
- **Hook nudge.** The +/-10 degree knob wiggle in the first second is a flourish; readouts and the tube do not react.
- Console values are illustrative (`values illustrative` in the source line). Real wall units often fix kV and mA
  or offer a few steps; the three free knobs are a teaching console.

## Design rationale
- Style: warm charcoal powder-coat, brushed aluminum with engraved black legends, walnut end cheeks, amber
  back-lit dial glass, cream VU face, red LED seven-segment readouts (drawn segment by segment), green P31-type
  CRT. Oswald for legends and numerals, Barlow Condensed for labels and fine print.
- Colour is semantic and matches the caption words: ice blue = electrons, phosphor green = X-ray photons (same green
  as the scope trace, which is their spectrum), orange-red = heat, amber = the console speaking.
- One focal point at a time on a busy panel: the active knob's jewel lamp is lit, its knob gets a warm ring while it
  turns and leaves an orange arc from the old to the new setting, and the two idle knob columns sit in shade.
- Each knob's value is also written where it acts inside the tube (`8 mA` along the stream, `70 kVp` across the
  gap), so the console and the cutaway read as one system.
- Layout: all must-read text is inside x 64–950 / y 234–1570; the knob readouts end at x 942; only bezel metal and
  screws enter the Instagram button column. The top louvers / model plate and the bottom grille are decoration
  under the Reels UI.
- Loop: the hook title is already back in the dial glass during the end card; the cheat sheet fades and the knobs
  turn home before t = 23.4, so frame 702 equals frame 0 (only the tuning pointer jumps back).

## Change log
- v1: full build (console, tube cutaway, scope, meters, three scenes, cheat sheet).
- v2: scale arcs narrowed to +/-120 degrees and knobs resized (adjacent scale numbers collided); decorative
  transformer replaced by an electrons / photons legend; `Al FILTER` -> `ALUMINUM FILTER` (read as "AI");
  handle moved to the dial glass; cheat-sheet backdrop made opaque (tube labels ghosted through).
- v3: `8 mA` and `70 kVp` tags inside the tube; scope axis words moved to the engraved bezel ring at 30 px;
  EC RP136 added to the source line for the contrast claim; knob-column shading; seven-segment decimal point fixed.
- v4: electron stream pre-filled so EXPOSE lamp, stream, photons and mAs counter switch together (the counter used
  to run before the first photon appeared); hook lengthened to 2.8 s; gained-photon area tint in the kVp scene.
- v5 (resumed session): caption reading time rebalanced (kVp scene +0.3 s, second beat at 10.4 s, TIME scene and end
  card shifted by 0.3 s, cheat-sheet rows 0.35 s apart; total still 24.0 s); `more photons too` -> `more photons`;
  heat needle full scale 0.8 -> 0.74 and the `kV × mA` face legend made smaller (the needle crossed it at 70 kVp /
  8 mA); cheat sheet now closes its dark glass before the rows appear and fades the rows before the glass clears
  (tube labels used to ghost through the text during both crossfades). Video and poster re-rendered after these edits.
- v6: independent science + design review, see "Review changes" below.
- **Final QA (v7, fresh-eyes pass after v6).** 22 stills with `--safe` across the timeline plus 14 at the scene
  changeovers (`_stills/final-qa`, `_stills/final-qa-trans`, `_stills/final-qa-fix`). Checked: safe areas (nothing
  must-read above y 230, below y 1580 or in x > 960 / y > 1100; readouts end at x 942, source line baseline 1561),
  sizes (all must-read >= 30 px; fine print 22-25 px), loop (t = 23.35 equals t = 0), hook readable at t = 0, cheat
  sheet held 3.0 s, seven-segment counter (0.80 / 1.60 mAs, 5 / 10 LED segments), swatch direction, polarity of the
  `70 kVp` tag, poster inside the 3:4 crop. The five PMIDs behind the on-screen source line and the caption
  (9225393, 9308113, 15347692, 8290728, 42538829) were re-pulled from PubMed: authors, journals, years and the quoted
  abstract sentences all match.
  - Fixed (reel.js, `head()` in `drawCaption`): during the kVp second beat the words `+ HOW MANY` faded in while the
    headline was still sliding left, so for about 0.25 s (9.85-10.1 s) they were cut off by the right edge of the dial
    glass (`+ HOW MA`). They now light up only once they sit fully inside the glass (10.1-10.25 s); fully visible from
    10.25 s as before, so the caption timing table is unchanged.
  - meta.json: claims re-ordered to on-screen order (the persistent schematic items, i.e. tube, filter / collimator,
    heat gauge and scope, are on screen from t = 0 and now come first); the heat claim no longer says "slightly more
    at dental kV" (that rests on an efficiency formula not read in any source here); the tube claim no longer names
    White and Pharoah (book not read: the fact-check asked that it not be cited); caption sentence changed from
    "time is the working control" to "time is the main control" (some units do offer kV / mA steps); caption is now
    695 characters; duration 23.4 confirmed with ffprobe.
  - Notes corrected, no change made: the title -> mA changeover does not overlap, the glass is empty for one frame at
    2.3 s (also for about 0.05 s at 6.4 s and 13.6 s), which reads as a normal dip; during the reset (22.5-23.2 s)
    the mAs counter goes dark while the three knob readouts count back to 4 / 60 / 0.10.
  - Accepted as is: hook title fully visible 2.1 s on first view against readSecs 2.6 s (it is on screen continuously
    from 18.7 s through the loop); contrast claim relies on EC RP136 in the caption Refs, not in the on-screen line.
  - Video and poster re-rendered after the fix (702 frames, 23.4 s).
- **Citation audit (v8, independent pass; documentation only, no change on screen, no re-render).**
  - Checked: all 24 PMIDs in RESEARCH.md / NOTES.md / meta.json re-pulled from PubMed (first author, year, journal,
    volume, issue, pages, DOI and the quoted abstract sentences all match; no wrong or misattributed paper). Seibert 2004
    is not in PMC: the quoted sentences were re-read in the free full text at tech.snmjournals.org (two fetch passes).
    EC RP136 sect. 4.1-4.3 and IAEA SRS 108 sect. 5.1.2.1 re-read in the saved extracts. The on-screen source line was
    read off a frame of the delivered video (`_scratch/audit/`): `McCollough; Zink, Radiographics 1997 · Seibert, J Nucl
    Med Technol 2004 · values illustrative`, correct as written (McCollough 17(4):967-84 and Zink 17(5):1259-68 are both
    Radiographics 1997). Video unchanged: 1080x1920, 30 fps, 702 frames, 23.4 s (ffprobe).
  - Which on-screen claim rests on what: `~99% HEAT` = Zink 1997 abstract only; `output ~ kVp²` = McCollough 1997 and
    Nickoloff 1993 abstracts only (Seibert states neither: confirmed again in the full text); `max keV = kVp`, the
    filament / electron statements and `mAs` = Seibert full text; `LESS CONTRAST` = EC RP136 sect. 4.1 (a guideline,
    cited as a guideline, in the caption Refs line; it is not in the on-screen source line).
  - Fixed, claim-source table row 7 and meta.json claim 1: the notes said Seibert does not mention the oil housing and
    listed the focusing cup as textbook-only. Seibert's text has "a metal focusing cup (cathode cup)" and its Fig. 3
    caption has the transformer oil in the tube housing; only the copper anode block and the aluminum filter are absent
    from it. meta.json also said "no textbook was read": a textbook chapter excerpt (Whaites and Drage) was read online
    at the research stage for the copper block, so the wording now says that, and that it was not re-verified.
  - Fixed, row 7: the pointer "White and Pharoah, Oral Radiology, ch. 1" is removed (book never opened in this project;
    the chapter number was unverified and the fact-check asked that nothing be attributed to it).
  - Fixed, row 7 and meta.json claim 2: the `ALUMINUM FILTER` label now has its own quoted sentence (EC RP136 sect. 4.2,
    "Filtration using aluminium is an established component of dental X-ray equipment").
  - Fixed, row 1 and meta.json claim 5: `same energies` now quotes the McCollough abstract sentence that carries it
    (spectrum shape depends on anode material, tube potential, filtration and waveform, not on tube current).
  - Fixed, meta.json claim 4: "negligible at 70 kVp" is marked as physics reasoning, not a sentence read in a source
    (Seibert gives only the >69.5 kVp threshold).
  - Fixed, header of this file: three papers are named on screen, not four (Nickoloff 1993 is in the notes only).
  - Not verified by this audit (none of it is on screen or in the caption): the Hellen-Halme 2013 full-text details in
    RESEARCH.md row 26, the 21 CFR / Oregon / NIST transition-energy rows, and the online textbook excerpts.

## Review changes (v6, after independent science + design review)
Science
- Swatch direction fixed: `tone()` keeps gv <= 0.1 unchanged and compresses only object tones (pivot 0.45, k 0.5, no
  lift). Measured luma 60 -> 70 kVp: raw-beam background 15 -> 15 (was 58 -> 99), wedge 224/173/123/73/31 ->
  164/139/114/89/67, enamel 233 -> 173.
- Caption rewritten (698 characters): "tube output rises roughly with kVp²" and "Many intraoral units fix kV or nearly
  so: time is the working control" (EC RP136 sect. 4.1: "kilovoltage is usually either fixed or minimally variable").
  It does not say that mAs leaves contrast unchanged.
- meta.json sources corrected: copper anode / oil housing are textbook anatomy, not Seibert; collimation = RP136
  sect. 4.3; heat claim reworded (general diagnostic-tube figure; needle = kV x mA, arbitrary scale); spectrum claim
  now carries the K-line note.
- Kept `output ~ kVp²` (not ∝): the fact-check asked that the square law stay marked as approximate (Nickoloff 1993:
  "approximately the square"); the caption spells it out.
- Suggested first comment on the post (no room in the 700-character caption): "No tungsten K lines drawn: they need
  >69.5 kV (Seibert 2004), so none at 60 and negligible at 70 kVp." Never "impossible at 70 kVp".

Design
- Text: hook question cut to `What does each do?`; kVp subs cut to `max keV = kVp` and `output ~ kVp²`; `kV × mA`
  face legend deleted. About 59 must-read words (was about 68).
- Duration 24.0 -> 23.4 s: hook 2.8 -> 2.2 s (first knob turn at 2.7 s), every later scene shifted; the end card
  starts 0.15 s after the EXPOSE lamp goes out (was 0.55 s) and its rows come in 0.3 s apart.
- Hook motion: each knob nudges +/-10 degrees with its lamp and a warm ring at 0.45 / 0.75 / 1.05 s.
- kVp scene sequenced into three beats (hits harder -> more photons -> less contrast): the swatch plate reads
  `IMAGE` until 11.4 s, then lights the claim; the gain tint falls to 40% at the same moment.
- Knob header row rebuilt: [lamp][name][readout] is one tight group centered on its knob, readout windows 78 px
  (TIME 130 px, right edge x 942). Each readout window is 16 px from its own name and at least 55 px from the next lamp.
- LED time bar: `clamp(S.segs - i)`, so exactly 5 segments at 0.10 s, 10 at 0.20 s, none at 0. Peak-hold bar at the
  0.1 s mark from the end of exposure 1 until the reset. Exposure 1 now starts 0.65 s after the TIME caption is
  readable (was 0.05 s).
- Sizes: `MAX` 30 px, scope axis numbers 30 px, `s` unit 30 px. Marker label raised 18 px with a dark halo so it no
  longer touches the trace.
- Swatch label loses its glow and drops to 60% during the TIME scene, full again on the end card.
- Caption fades 0.3 -> 0.2 s; the title -> mA changeover is back to back (title out 2.1-2.3 s, mA in 2.3-2.5 s).
- End card: formula column moved to x+640 at 46 px (side margins now about 52 / 73 px, was 52 / 125); backdrop fully opaque.
- Source line raised to baseline 1561 and shortened; handle dims to 58% while a scene caption is showing.
- Swatch artwork: rounder crowns, pulp horns, thin PDL line with lamina dura, 0.9 px blur on the tooth/bone layer,
  film grain (same seed in both swatches).

## Caption timing check (fully visible vs Kit.readSecs)
| Caption | Fully visible | Words | readSecs |
|---|---|---|---|
| Hook title | 0–2.1 s (and 18.7–23.4 s before the loop) | 6 | 2.6 s (continuous across the loop; first view 2.1 s) |
| mA headline + sub | 2.5–6.2 s (3.7 s) | 9 | 3.5 s |
| kVp headline + first sub | 6.65–9.65 s (3.0 s; headline stays to 13.4) | 3 + 4 tokens | 2.9 s |
| `+ HOW MANY` + second sub | 10.25–13.4 s (3.15 s) | 2 + 3 tokens | 2.3 s |
| Swatch `kVp ↑ LESS CONTRAST` | 11.85–13.3 s at full glow, then dimmed to the end | 4 | 2.0 s |
| TIME headline + sub | 13.85–18.1 s (4.25 s) | 3 + 4 + formula | 3.5–4.1 s depending on how the formula is counted |
| Cheat sheet (all three rows) | 19.35–22.35 s (3.0 s) | repeats only | payoff hold >= 2.5 s |

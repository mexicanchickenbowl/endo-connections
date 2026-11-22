# 23 · From X-ray to pixel — digital intraoral sensor teardown (CMOS/CCD + PSP)

**Style:** exploded 3-D product teardown. three.js r169 (vendored): a charcoal intraoral sensor on a light-gray
studio sweep opens into its layers, soft pre-blurred contact shadows, thin leader lines and Space Grotesk / Inter
call-outs in a tidy left column. Photons are small glowing darts (amber = X-ray, green = visible light, blue =
charge, white squares = digital numbers, red = laser, blue-violet = stimulated emission). Silent, 24.0 s, 1080 × 1920.
A slow 11° camera orbit runs through the teardown (leaders follow the projected 3-D anchors).

**One-line concept:** follow one exposure down the stack — X-ray → light (scintillator) → guided light (fiber-optic
plate) → charge in every pixel (CMOS) → number (ADC) → gray level on a screen — then swap the detector for a PSP
plate (trapped electrons → red laser → blue-violet light → photomultiplier) and end on a side-by-side comparison of
the two objects (thick closed sensor with its cable, thin plate). Erasing is in the caption, not on screen.

## Files
- `index.html` — page contract, compositing: 2-D backdrop → WebGL (transparent canvas) → 2-D labels on one canvas.
- `scene.js` — the 3-D scene (sensor layers, ghost teeth, particle sprites, small screen, PSP scanner, camera keys);
  `update(t)` poses everything and returns projected anchor points for the labels.
- `overlay.js` — backdrop gradient, title, call-outs, PSP steps, end card, source lines.
- `radiograph.js` — procedural mandibular periapical (4 teeth, enamel / dentin / pulp / PDL / lamina dura /
  trabecular bone) and its X-ray transmission map. The same map drives the ghost-tooth outlines, the fate of every
  dart, the scintillator flashes, the height of every charge well, the PSP dot pattern and the gray levels on screen.
- `timeline.js` — shared timings and grid constants.
- `RESEARCH.md` — evidence brief (fact-checked); this reel only states what it supports.

## Storyboard (s)
| t | Beat | On screen (must-read text) |
|---|---|---|
| 0–1.95 | **Hook.** Closed sensor on the studio floor, cable trailing off; a flat section of four teeth floats above it; amber X-ray darts fall through the teeth. Slow orbit. | "From X-ray to pixel" (112 px, full ink to 1.65 s); kicker "DIGITAL INTRAORAL X-RAY SENSOR"; "schematic · not to scale" (stays on for the whole reel); handle top right |
| 1.55–3.15 | **Explode.** Layers rise in sequence (lid first), camera pulls back and settles into the teardown view; layer names stagger in from 2.4 s. The orbit continues slowly (yaw 34° → 23° by 12.65 s). | 01 Housing · 02 Scintillator · 03 Fiber-optic plate · 04 CMOS chip · 05 Read-out + ADC |
| 3.4–4.6 | **Scintillator.** Darts that get past the teeth pass the lid and end in green flashes on the scintillator (fewer under enamel). Darts are only drawn below the header lines. | 02: "X-ray → visible light", "CsI or Gd oxysulfide" |
| 4.6–5.8 | **Fiber-optic plate.** Green light leaves the scintillator and runs straight down the fibers, which light up. | 03: "guides light" |
| 5.8–8.2 | **CMOS.** Light reaches the chip; a blue charge "well" (bar) rises on each of 36 × 27 schematic pixels in proportion to its exposure; amber darts drop to 35% so the chip is the focal point; at 6.75 s the transistors in the corner of every pixel light up. Exposure ends 7.9 s, ghost teeth fade. | 04: "light → charge", "transistors per pixel" |
| 7.65–8.55 | The small screen slides in below the stack, in standby (dark gray glass with a soft reflection, not black). | — |
| 8.2–10.75 | **Read-out.** A row-select line sweeps the chip, wells drain row by row, blue charge packets run to the ADC package, white squares (numbers) run down the cable; the screen goes live and coarse gray blocks appear row by row. | 05: "charge → number", "8–16 bit"; 06 Image: "number → gray level" |
| 10.75–12.65 | Blocks refine into the smooth radiograph; every call-out returns to full ink; the kicker becomes a 36 px headline. The complete frame is **held 1.5 s** (11.15–12.65). **Poster frame t = 12.0 s.** | all six call-outs; headline "DIGITAL INTRAORAL X-RAY SENSOR"; source: "White & Pharoah 7e (textbook) / Farman TT 2005, OOOOE" |
| 12.65–13.6 | **Swap.** Sensor closes and slides out right, pulling its cable with it (the cable stays plugged into the screen, so there is no loose end); the PSP plate on its scanner bed slides in from the left; screen back to standby; camera cranes up a little. | kicker "PHOSPHOR PLATE (PSP) + SCANNER"; "PSP plate / Eu-doped barium fluorohalide" |
| 13.65–14.55 | **Exposure.** Darts through the ghost teeth; blue dots grow on the plate (size ∝ exposure) = latent image. No read-out hardware is in frame. | ① "X-rays → trapped electrons" |
| 14.5–16.4 | **Scan** (a separate step). The read-out carriage (laser on an arm, light guide, photomultiplier tube) slides in from the right with the cable, then crosses the plate; red laser fan + flying spot; blue-violet light hops into the guide; scanned dots shrink (only part of the stored signal is released); the image builds line by line on the screen. Held to 17.05 s. | ② "red laser → blue-violet light"; pinned tag "photomultiplier"; source: "White & Pharoah 7e (textbook) / Leblans 2011, Materials" |
| 17.1–17.9 | Two motions: scanner, its cable and the screen slide out together to the left (the plate stays), then the plate rises to float level while the closed sensor arrives above it from the right. | — |
| 17.8–23.35 | **End card** (on screen 5.5 s; all lines fully visible about 4.5 s). The comparison is shown, not only stated: thick closed housing with a cable above, a thin, flat sheet (edge-on enough to see its thickness, gently rocking, never bending) below. | kicker "TWO DETECTORS". A "Sensor" (CMOS · CCD, 30 px): "image in seconds", "rigid". B "PSP plate": "thin, film-sized", "wide latitude", "needs a scanner". Source: "White & Pharoah 7e (textbook) / Berkhout 2004, DMFR (in vitro)" |
| 23.3–24.0 | **Loop.** Text is gone before the move; plate exits, sensor settles onto the floor, ghost teeth and title fade back in; last frame = first frame. | title |

Must-read words on screen: about 61 (34 sensor part incl. title, 13 PSP part, 14 end card), function lines 34 px,
names 38–48 px. Fine print (kicker, "schematic · not to scale", source lines, handle) is 24–26 px.
Out-of-focus call-outs never drop below 85% ink; focus is carried by the leader line and its terminal dot.

## On-screen claims and sources
Journal items were checked on PubMed in the research stage (abstract unless "full text"); DOIs and the full
fact-check log are in `RESEARCH.md`. "W&P" = White SC, Pharoah MJ. *Oral Radiology: Principles and Interpretation*,
7th ed., Elsevier Mosby 2014, Ch. 4 "Digital Imaging" (Ludlow JB, Mol A) — a **textbook**, read through an online
reproduction of the first part of the chapter; the printed page and the 8th/9th editions were not seen.

| On-screen claim | Source |
|---|---|
| Layer order: housing → scintillator → fiber-optic plate → CMOS chip → read-out electronics | W&P Fig. 4-3 caption ("Exploded view of CMOS sensor"; a manufacturer-supplied figure). |
| 02 Scintillator: "X-ray → visible light" | W&P: "The scintillator screen fluoresces when exposed to x-rays and forms a visible light radiographic image"; silicon is "more sensitive to light than to x rays". |
| "CsI or Gd oxysulfide" | Farman TT et al. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99:608-13. PMID 15829886 (abstract: thallium-doped cesium iodide and terbium-doped gadolinium oxysulfide screens on an intraoral CCD); same group 2006;101:219-23, PMID 16448925. Now named in the on-screen source line ("Farman TT 2005, OOOOE"; "TT" because Farman AG & Farman TT also published in that journal in 2005, 99:485). **Board note (in the caption):** the W&P 7e solid-state paragraph prints "Gadolinium oxybromide compounds… or cesium iodide"; "gadolinium oxysulfide" appears only in its flat-panel paragraph. "CsI" is set in IBM Plex Sans so the capital I has serifs. |
| 03 Fiber-optic plate: "guides light" | W&P Fig. 4-3 ("couples the scintillator screen to the CMOS chip to reduce image noise") and Fig. 4-4 ("fiberoptics to improve resolution"). "less noise" was taken off screen (textbook wording from a manufacturer figure; no PubMed-indexed dental measurement found) and is kept only here. Not every sensor has a fiber-optic plate: W&P says the scintillator is "coated directly on the CCD surface or coupled to the surface by fiberoptics" (caption: "in some sensors"). |
| 04 CMOS chip: "light → charge" | W&P: the chip "creates a charge in each pixel proportional to the exposure"; electron-hole pairs → "charge packets… each packet corresponds to one pixel". |
| "transistors per pixel" | W&P: "Each pixel is isolated from its neighboring pixels and is directly connected to a transistor… addressed separately." Plural because the engineering reference describes a "standard three transistor CMOS active pixel sensor": Arvanitis CD et al., Med Phys 2007;34:4612-25, PMID 18196789 (abstract; mammography bench detector). "Amplifier in each pixel" was not used: RESEARCH.md correction 2 keeps to the textbook's word. |
| 05 Read-out + ADC: "charge → number", "8–16 bit" | W&P: analog-to-digital conversion = sampling + quantization; "Current digital detectors capture data at 8, 10, 12, or 16 bits". |
| 06 Image: "number → gray level" | W&P (gray scale / contrast resolution section). Display convention used: more exposure → fuller well → darker pixel. |
| "PSP plate — Eu-doped barium fluorohalide" | W&P: "'europium-doped' barium fluorohalide… polyester base similar to radiographic film". (The exact formula BaFBr:Eu²⁺ is the typical medical CR phosphor — Leblans 2011, IAEA handbook — and is not printed.) |
| ① "X-rays → trapped electrons" | W&P: electrons trapped at halogen vacancies (F-centers); "the number of trapped electrons is proportional to x-ray exposure and represents a latent image". Leblans P et al. Materials (Basel) 2011;4:1034-86. PMID 28879966, PMC5448636 (full text). |
| ② "red laser → blue-violet light" + "photomultiplier" | Leblans 2011 (full text): "A red laser beam is moved over the plate"; energy "set free as blue photons"; "A light guide transfers the emitted light to a photomultiplier tube". W&P: red light "around 600 nm"; "Fiberoptics conduct light from the PSP plate to a photomultiplier tube". IAEA, *Diagnostic Radiology Physics* 2014, Ch. 7 (handbook): "photostimulated light (usually blue)". No wavelength is printed. **Board note (in the caption):** W&P 7e prints "energy is released in the green spectrum between 300 and 500 nm… the remaining green light is detected"; the resident should check this wording against the printed edition used for boards (only an online reproduction of the 7th edition was read). |
| (caption only) "bright light erases" | W&P: plates "must be erased… by flooding the plate with a bright light"; Leblans 2011. The on-screen erase beat was removed in review. |
| End card A — Sensor (CMOS · CCD): "image in seconds", "rigid" | Kamburoğlu K et al. Imaging Sci Dent 2022;52:93-101. PMID 35387105, PMC8967495 (full text, re-read in the review round: "the radiographic images are available to view in a matter of seconds after the exposure"; CMOS detectors "are bulky and rigid"). W&P: "rapid availability of the image after exposure"; "sensor bulk… most detectors incorporate an electronic cable". |
| End card B — PSP plate: "thin, film-sized", "needs a scanner" | W&P: plates "provide handling characteristics similar to intraoral film"; laser scanner read-out. Kamburoğlu 2022 (full text): plates have "the same shape and dimensions of conventional films" but are "more rigid than film" — so the plate is never shown bending and "flexible" is not written. thin: Kamburoğlu 2022, PMC full text ("the thinner nature of PSP sensors, which enabled easier detector positioning", the authors' reading of Farrier et al.). |
| "wide latitude" (no comparison; source line says "in vitro") | Berkhout WE et al. Dentomaxillofac Radiol 2004;33:1-5. PMID 15140814 (abstract, in vitro: phosphor plate exposure range "very wide"; its own conclusion is the flip side, plates give good images even at high exposure times, "which may result in an unnecessarily high dose" — carried in the caption as "can hide overexposure"). Borg E, Attaelmanan A, Gröndahl HG. Dentomaxillofac Radiol 2000;29:70-5. PMID 10808218 (abstract: PSP "wide exposure range"). Deliberately **not** "wider than sensors": Farman AG, Farman TT. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99:485-9, PMID 15772598, and Marinho-Vieira LE et al., Dentomaxillofac Radiol 2023;52:20220370, PMID 36988093 ("PSP-based systems may not necessarily have a wider range than sensor-based systems"). |

### Deliberately left off screen (caption / study notes)
- Pixel size and resolution: pixels as small as ≈ 20 µm (19.5 µm: Farman & Farman, Int J Comput Dent 1999;2:183-96,
  PMID 11351483; Kamburoğlu 2022) → ≈ 25 lp/mm in theory (two pixels per line pair); measured values are lower
  (Brüllmann et al., Oral Surg Oral Med Oral Pathol Oral Radiol 2013;115:e55-61, PMID 23706925: four of five sensors
  9.9–18.8 LP/mm at 10% contrast).
- CCD read-out ("bucket brigade" to one amplifier), history dates (CCD introduced to dentistry 1987, PSP 1994).
- Latent-image fading ("scan promptly"): real, but the textbook itself says early fading is usually not clinically
  meaningful for adequately exposed plates; no number or deadline is shown.
- Any dose comparison with film, sensor/plate thickness, "direct / indirect" labels (the two fields use the words
  in opposite senses).

## What is schematic
- The whole model: one generic sensor design (with a fiber-optic plate), layer thicknesses, gaps, cable, PCB layout,
  the "ADC" package. Not to scale — labeled on screen for the entire reel.
- 36 × 27 pixel grid (real sensors have > 10⁶ pixels); well heights = normalized transmission of the procedural
  radiograph; fill and read-out are slowed enormously (a real exposure and read-out take a fraction of a second to
  seconds). Row-by-row block build-up on the screen is illustrative.
- Dart counts, flash sizes, the gaps the light crosses between exploded layers (in a real sensor the layers touch),
  and colors (no color word or wavelength is claimed for the scintillator light; "blue-violet" follows the sources).
- The PSP scanner: a carriage with a light guide, a photomultiplier tube and a laser on an arm is a schematic of a
  flying-spot reader, not a specific product. Exposure and scanning are drawn as two steps: the read-out carriage is
  out of frame while the plate is exposed and slides in afterwards. The plate still sits on the scanner bed in open
  light during the exposure, which is not how plates are handled (the textbook stresses that ambient light fades the
  latent image). Dots shrink to about 40% after the laser passes to suggest that scanning releases only part of the
  stored signal (Leblans 2011: "roughly 50%" for medical CR plates) — no number is shown. Erasing is not drawn.
- End card: both detectors float; sizes are the schematic model's (the plate is drawn about as large as the sensor),
  the sensor's wall height and the plate's thickness are not to scale.
- The radiograph is drawn procedurally (attenuation values tuned to look like a periapical, not measured).

## Design rationale
- **Teardown grammar.** Numbered call-outs sit in a fixed left column; the function of a layer is revealed under its
  name when the photons reach it, and stays afterwards, so the poster frame at 12.0 s is a complete, labeled
  summary of the sensor. Focus is shown by the leader line and its dot; text stays at ≥ 85% ink so the material
  names remain readable on a phone.
- **Color carries the physics** instead of sentences: amber → green → blue → white squares → gray; the colored
  words in the labels use the same hues.
- **Uneven explode gaps**: the biggest gap is above the chip so the charge wells are visible; the fiber-optic plate
  shows its side (fibers), which is where its story is.
- **Layout**: must-read text x 64–416 (labels) and never in the right-hand button column; the screen and its image
  end above y = 1570; source lines sit at the bottom of the label column. Every call-out block has ≥ 56 px of air
  between its last baseline and the next rule (rules at y = 446 / 556 / 748 / 896 / 1088 / 1282).
- **One cable, never a loose end**: the screen's cable always leads to the detector that feeds it (sensor, then the
  scanner carriage), and leaves the frame only attached to something.
- **Performance**: the PMREM environment map is applied only to glossy/metal materials (software GL); the tool's
  font warm-up sweep skips the 3-D pass (it only needs the 2-D text).

## Change log
- v1: first build. Ghost teeth changed from thick translucent extrusions to a flat four-tooth section (reads as
  teeth at a 25–30° camera elevation); erase lamp changed from a solid panel to a ring light so the plate stays
  visible; PSP camera and screen position adjusted to clear the button column; "photomultiplier" tag moved off the
  laser fan; end card and PSP step 3 retimed for reading time (duration 23.9 → 24.0 s); wording trimmed
  ("guides light, less noise", "bright light erases").

## Review changes (v2, after independent science + design review)
Science
- PSP light color: on-screen "blue-violet light" kept (Leblans 2011, IAEA). The caption now warns that the board
  textbook prints "green" (and "Gd oxybromide" for the scintillator): "Boards: W&P 7e says …".
- Scintillator source line now names the paper that supports the material: "White & Pharoah 7e (textbook) /
  Farman TT 2005, OOOOE".
- End card: "wide latitude" kept, source row now "Berkhout 2004, DMFR (in vitro)"; caption carries the flip side
  ("can hide overexposure, not always wider than today's sensors").
- Caption replaced (696 characters): "in some sensors" instead of "in many sensors", "Farman TT 2005", board note,
  in vitro + overexposure caveat.
- "a transistor at every pixel" → "transistors per pixel" (one line). "instant image" → "image in seconds"
  (Kamburoğlu 2022, full text re-read). "CsI" set with a serifed capital I. "thin" now sourced (Kamburoğlu 2022).
- Exposure and scanning are two steps: the read-out carriage enters only after the exposure.
Design
- Text load 67 → about 61 words: "less noise" cut, transistor line shortened to one line, PSP step 3 ("bright light
  erases") and the ring-light erase lamp deleted. Function lines 30 → 34 px; blocks re-spaced.
- Dim floor raised to 85% ink; material lines and "8–16 bit" in #3a414c weight 500.
- Finished teardown held 1.5 s (was about 0.45 s), paid for by the deleted erase beat; duration still 24.0 s.
- PSP section: two steps only; step 2 holds to the end of the section.
- Swaps: no loose cable ends (single cable logic, see above); 17.1–17.9 s reduced to two motions (scanner + screen
  out left together; plate rises while the sensor arrives).
- End card shows the comparison: closed sensor (thick body + cable) over a thin, level plate with grain, inset line
  and a soft sheen; kicker "TWO DETECTORS"; "CMOS · CCD" 30 px; lines fully visible about 4.5 s.
- Screen arrives only at the read-out beat (7.65–8.55 s) and idles in a dark-gray standby state; black only while
  an image is being written.
- Camera orbit during the teardown widened from 4.5° to 11° (yaw 34° → 23°), elevation fixed.
- Nits applied: title fade starts 1.65 s (was 1.4 s) and names start 2.4 s; darts are not drawn above y ≈ 300 px
  and drop to 35% after 5.8 s; the summary/cover frame gets a 36 px headline (the restyled kicker); laser head
  rebuilt (rounded charcoal housing, lens barrel, thicker post with a foot).
- Not done: the PSP call-out has no index number (it is a part label, not a step; the steps carry ① ②).

## Change log (v2)
- timeline.js retimed (see storyboard); scene.js: camera keys, monitor arrival/standby, cable hand-over, carriage
  entry, end-card poses, plate face detail, erase lamp removed; overlay.js: sizes, spacing, dim floors, sources,
  headline; meta.json claims + caption; RESEARCH.md addendum.


## Final QA (2026-11-22)
Fresh-eyes pass on the shipped build (no change to the reel sources, so no re-render).
- **Frames:** 23 stills with `--safe` in `_stills/final-qa` (t = 0 … 23.95 s) plus 21 transition frames pulled from
  the rendered MP4 (1.75–2.5, 8.1–8.35, 10.9–11.1, 12.75–13.5, 14.6–14.85, 16.5–18.1, 23.35–23.75 s). No clipped,
  overlapping or ghosted text; no missing glyphs; no popping objects or blank frames. All text sits in x 64–1016,
  y 254–1571; nothing must-read in the button column (the "photomultiplier" tag is above y = 1100; the screen ends
  at x ≈ 955). Must-read text ≥ 30 px; 22–26 px only for index numbers, kickers, "schematic · not to scale",
  source rows and the handle. Kickers, source rows and call-out sets never overlap in time (gaps ≥ 0.1 s).
- **Hook / takeaway / loop:** title at full ink 0–1.65 s; end card fully visible ≈ 18.45–23.0 s; text is gone by
  23.35 s, before the loop move; video frame 719 vs frame 0: mean difference 0.5 gray levels.
- **Video:** `reels/out/23-digital-xray-sensor.mp4` 1080 × 1920, 30 fps, 720 frames, ffprobe duration 24.000 s
  (= `REEL.duration`), silent AAC track. Poster = the t = 12.0 s summary frame (complete labeled teardown +
  radiograph), fully inside the 3:4 crop.
- **Claims re-checked:** the textbook quotes behind every on-screen line were found again in the downloaded
  reproduction (`_scratch/dl/pd`): "8, 10, 12, or 16 bits", "directly connected to a transistor", "europium-doped
  barium fluorohalide", "photomultiplier tube", and the two board-note wordings ("Gadolinium oxybromide compounds",
  "green spectrum between 300 and 500 nm"). Based on articles retrieved from PubMed, the eight journal citations
  used in meta.json match their records (authors, year, volume, pages, abstract wording):
  Farman TT 2005 (https://doi.org/10.1016/j.tripleo.2004.08.013), Leblans 2011 (https://doi.org/10.3390/ma4061034),
  Berkhout 2004 (https://doi.org/10.1259/dmfr/40677472), Marinho-Vieira 2023 (https://doi.org/10.1259/dmfr.20220370),
  Kamburoğlu 2022 (https://doi.org/10.5624/isd.20210241), Arvanitis 2007 (https://doi.org/10.1118/1.2804744),
  Borg 2000 (https://doi.org/10.1038/sj/dmfr/4600501), Farman & Farman 2005 (https://doi.org/10.1016/j.tripleo.2004.04.002).
- **meta.json:** claim and caption text unchanged (9 claims in on-screen order, caption 696 characters). Source
  strings tidied only: the textbook is cited in full once and abbreviated afterwards, a change-log remark about the
  removed "less noise" wording was taken out of the source field (it stays in the claims table above), exact
  textbook phrases added for the ADC and PSP rows, "Kamburoğlu" spelled with its diacritic.
- **Open item for the account owner (not a build defect):** the caption's board note quotes White & Pharoah 7e
  from an online reproduction; compare with the printed edition used for boards before posting.

# 23 · From X-ray to pixel — digital intraoral sensor teardown (CMOS/CCD + PSP)

**Style:** exploded 3-D product teardown. three.js r169 (vendored): a charcoal intraoral sensor on a light-gray
studio sweep opens into its layers, soft pre-blurred contact shadows, thin leader lines and Space Grotesk / Inter
call-outs in a tidy left column. Photons are small glowing darts (amber = X-ray, green = visible light, blue =
charge, white squares = digital numbers, red = laser, blue-violet = stimulated emission). Silent, 24.0 s, 1080 × 1920.

**One-line concept:** follow one exposure down the stack — X-ray → light (scintillator) → guided light (fiber-optic
plate) → charge in every pixel (CMOS) → number (ADC) → gray level on a screen — then swap the detector for a PSP
plate (trapped electrons → red laser → blue-violet light → photomultiplier → erase) and end on a two-line comparison.

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
| 0–1.7 | **Hook.** Closed sensor on the studio floor, cable trailing off; a flat section of four teeth floats above it; amber X-ray darts fall through the teeth. Slow orbit. | "From X-ray to pixel" (112 px); kicker "DIGITAL INTRAORAL X-RAY SENSOR"; "schematic · not to scale" (stays on for the whole reel); handle top right |
| 1.55–3.15 | **Explode.** Layers rise in sequence (lid first), camera pulls back and settles into the teardown view; the small screen slides in below; layer names stagger in from 2.2 s. | 01 Housing · 02 Scintillator · 03 Fiber-optic plate · 04 CMOS chip · 05 Read-out + ADC |
| 3.4–4.6 | **Scintillator.** Darts that get past the teeth pass the lid and end in green flashes on the scintillator (fewer under enamel). | 02: "X-ray → visible light", "CsI or Gd oxysulfide" |
| 4.6–5.8 | **Fiber-optic plate.** Green light leaves the scintillator and runs straight down the fibers, which light up. | 03: "guides light, less noise" |
| 5.8–8.2 | **CMOS.** Light reaches the chip; a blue charge "well" (bar) rises on each of 36 × 27 schematic pixels in proportion to its exposure; at 6.75 s the transistor in the corner of every pixel lights up. Exposure ends 7.9 s, ghost teeth fade. | 04: "light → charge", "a transistor at every pixel" |
| 8.2–10.75 | **Read-out.** A row-select line sweeps the chip, wells drain row by row, blue charge packets run to the ADC package, white squares (numbers) run down the cable; coarse gray blocks appear on the screen row by row. | 05: "charge → number", "8–16 bit"; 06 Image: "number → gray level" |
| 10.75–11.6 | Blocks refine into the smooth radiograph; every call-out returns to full ink. **Poster frame t = 11.35 s** (complete labeled teardown + image). | all six call-outs; source: "White & Pharoah, Oral Radiology 7e (textbook)" |
| 11.6–12.55 | **Swap.** Sensor closes and slides out right; PSP plate on a schematic scanner bed slides in from the left; camera cranes up a little. | kicker "PHOSPHOR PLATE (PSP) + SCANNER"; "PSP plate / Eu-doped barium fluorohalide" |
| 12.65–13.65 | **Exposure.** Darts through the ghost teeth; blue dots grow on the plate (size ∝ exposure) = latent image. | ① "X-rays → trapped electrons" |
| 13.8–15.4 | **Scan.** Carriage with a light guide and photomultiplier tube crosses the plate; red laser fan + flying spot; blue-violet light hops into the guide; scanned dots shrink (only part of the stored signal is released); the image builds line by line on the screen. | ② "red laser → blue-violet light"; pinned tag "photomultiplier" |
| 15.4–16.8 | **Erase** (separate step). Carriage parks, a ring light comes down and floods the plate; remaining dots vanish. | ③ "bright light erases"; source: "White & Pharoah 7e (textbook) / Leblans 2011, Materials" |
| 17.1–17.9 | Rig leaves; plate lifts and tilts toward the camera (flat, never bent); sensor returns half-exploded above it. | — |
| 17.85–23.3 | **End card** (on screen 5 s; all lines fully visible for about 4 s). | A "Sensor" (CMOS · CCD): "instant image", "rigid". B "PSP plate": "thin, film-sized", "wide latitude", "needs a scanner". Source: "White & Pharoah 7e (textbook) / Berkhout 2004, DMFR" |
| 23.25–24.0 | **Loop.** Text is gone before the move; plate exits, sensor closes and settles, ghost teeth and title fade back in; last frame = first frame. | title |

Must-read words on screen: about 67 (38 sensor part, 16 PSP part, 13 end card), all ≥ 30 px. Fine print (kicker,
"schematic · not to scale", "CMOS · CCD" tag, source lines, handle) is 24–26 px.

## On-screen claims and sources
Journal items were checked on PubMed in the research stage (abstract unless "full text"); DOIs and the full
fact-check log are in `RESEARCH.md`. "W&P" = White SC, Pharoah MJ. *Oral Radiology: Principles and Interpretation*,
7th ed., Elsevier Mosby 2014, Ch. 4 "Digital Imaging" (Ludlow JB, Mol A) — a **textbook**, read through an online
reproduction of the first part of the chapter; the printed page and the 8th/9th editions were not seen.

| On-screen claim | Source |
|---|---|
| Layer order: housing → scintillator → fiber-optic plate → CMOS chip → read-out electronics | W&P Fig. 4-3 caption ("Exploded view of CMOS sensor"; a manufacturer-supplied figure). |
| 02 Scintillator: "X-ray → visible light" | W&P: "The scintillator screen fluoresces when exposed to x-rays and forms a visible light radiographic image"; silicon is "more sensitive to light than to x rays". |
| "CsI or Gd oxysulfide" | Farman TT et al. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99:608-13. PMID 15829886 (abstract: thallium-doped cesium iodide and terbium-doped gadolinium oxysulfide screens on an intraoral CCD); same group 2006;101:219-23, PMID 16448925. |
| 03 Fiber-optic plate: "guides light, less noise" | W&P Fig. 4-3 ("couples the scintillator screen to the CMOS chip to reduce image noise") and Fig. 4-4 ("fiberoptics to improve resolution"). Textbook wording from a manufacturer figure; no PubMed-indexed dental measurement found. Not every sensor has one (caption says "in many sensors"). |
| 04 CMOS chip: "light → charge" | W&P: the chip "creates a charge in each pixel proportional to the exposure"; electron-hole pairs → "charge packets… each packet corresponds to one pixel". |
| "a transistor at every pixel" | W&P: "Each pixel is isolated from its neighboring pixels and is directly connected to a transistor… addressed separately." Physics support: Arvanitis CD et al., Med Phys 2007;34:4612-25, PMID 18196789 (abstract; three-transistor CMOS active pixel sensor, mammography bench detector). |
| 05 Read-out + ADC: "charge → number", "8–16 bit" | W&P: analog-to-digital conversion = sampling + quantization; "Current digital detectors capture data at 8, 10, 12, or 16 bits". |
| 06 Image: "number → gray level" | W&P (gray scale / contrast resolution section). Display convention used: more exposure → fuller well → darker pixel. |
| "PSP plate — Eu-doped barium fluorohalide" | W&P: "'europium-doped' barium fluorohalide… polyester base similar to radiographic film". (The exact formula BaFBr:Eu²⁺ is the typical medical CR phosphor — Leblans 2011, IAEA handbook — and is not printed.) |
| ① "X-rays → trapped electrons" | W&P: electrons trapped at halogen vacancies (F-centers); "the number of trapped electrons is proportional to x-ray exposure and represents a latent image". Leblans P et al. Materials (Basel) 2011;4:1034-86. PMID 28879966, PMC5448636 (full text). |
| ② "red laser → blue-violet light" + "photomultiplier" | Leblans 2011 (full text): "A red laser beam is moved over the plate"; energy "set free as blue photons"; "A light guide transfers the emitted light to a photomultiplier tube". W&P: red light "around 600 nm"; "Fiberoptics conduct light from the PSP plate to a photomultiplier tube". IAEA, *Diagnostic Radiology Physics* 2014, Ch. 7 (handbook): "photostimulated light (usually blue)". No wavelength is printed (W&P 7e prints "green spectrum between 300 and 500 nm"). |
| ③ "bright light erases" | W&P: plates "must be erased… by flooding the plate with a bright light"; Leblans 2011. |
| End card A — Sensor (CMOS · CCD): "instant image", "rigid" | W&P: "rapid availability of the image after exposure"; "sensor bulk… most detectors incorporate an electronic cable". Kamburoğlu K et al. Imaging Sci Dent 2022;52:93-101. PMID 35387105 (full text: CMOS detectors "bulky and rigid"; image "available to view in a matter of seconds"). |
| End card B — PSP plate: "thin, film-sized", "needs a scanner" | W&P: plates "provide handling characteristics similar to intraoral film"; laser scanner read-out. Kamburoğlu 2022 (full text): plates have "the same shape and dimensions of conventional films" but are "more rigid than film" — so the plate is never shown bending and "flexible" is not written. "Thin" is descriptive. |
| "wide latitude" (no comparison) | Berkhout WE et al. Dentomaxillofac Radiol 2004;33:1-5. PMID 15140814 (abstract, in vitro: phosphor plate exposure range "very wide"). Borg E, Attaelmanan A, Gröndahl HG. Dentomaxillofac Radiol 2000;29:70-5. PMID 10808218 (abstract: PSP "wide exposure range"). Deliberately **not** "wider than sensors": Farman AG, Farman TT. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99:485-9, PMID 15772598, and Marinho-Vieira LE et al., Dentomaxillofac Radiol 2023;52:20220370, PMID 36988093 ("PSP-based systems may not necessarily have a wider range than sensor-based systems"). |

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
  flying-spot reader, not a specific product; the plate is exposed and scanned in the same place for clarity. Dots
  shrink to about 40% after the laser passes to suggest that scanning releases only part of the stored signal
  (Leblans 2011: "roughly 50%" for medical CR plates) — no number is shown.
- The radiograph is drawn procedurally (attenuation values tuned to look like a periapical, not measured).

## Design rationale
- **Teardown grammar.** Numbered call-outs sit in a fixed left column; the function of a layer is revealed under its
  name when the photons reach it, and stays (dimmed) afterwards, so the poster frame at 11.35 s is a complete,
  labeled summary of the sensor. Only the active call-out is at full ink: one focal point at a time.
- **Color carries the physics** instead of sentences: amber → green → blue → white squares → gray; the colored
  words in the labels use the same hues.
- **Uneven explode gaps**: the biggest gap is above the chip so the charge wells are visible; the fiber-optic plate
  shows its side (fibers), which is where its story is.
- **Layout**: must-read text x 64–416 (labels) and never in the right-hand button column; the screen and its image
  end above y = 1570; source lines sit at the bottom of the label column.
- **Performance**: the PMREM environment map is applied only to glossy/metal materials (software GL); the tool's
  font warm-up sweep skips the 3-D pass (it only needs the 2-D text).

## Change log
- v1: first build. Ghost teeth changed from thick translucent extrusions to a flat four-tooth section (reads as
  teeth at a 25–30° camera elevation); erase lamp changed from a solid panel to a ring light so the plate stays
  visible; PSP camera and screen position adjusted to clear the button column; "photomultiplier" tag moved off the
  laser fan; end card and PSP step 3 retimed for reading time (duration 23.9 → 24.0 s); wording trimmed
  ("guides light, less noise", "bright light erases").

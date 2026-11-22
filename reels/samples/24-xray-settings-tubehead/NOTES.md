# 24 — kVp, mA and exposure time: what each knob does inside the X-ray tube head · retro control console

Silent, 24.0 s, 1080x1920, one 2D canvas (`index.html` + `reel.js`), deterministic `render(t)`.
Evidence brief: `RESEARCH.md` (researched, then independently fact-checked). Only its section (b) "recommended
on-screen facts" is used on screen, with the [FC] wording constraints and the "Do not claim" list.
The four papers named on screen were re-pulled from PubMed at build time (PMIDs 9225393, 9308113, 15347692, 8290728);
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
| 0.0–2.8 | Hook | Console at rest (4 mA, 60 kVp, 0.10 s). EXPOSE lights at 0.35: electron stream, photons, heat needle swings up, anode glows. The three knob lamps blink in turn (0.95–2.2). | `3 KNOBS` · `What does each do inside the tube?` · tube labels `FILAMENT`, `TUNGSTEN TARGET`, `ALUMINUM FILTER`, `COLLIMATOR`, legend `ELECTRONS`, `X-RAY PHOTONS` · gauge `~99% HEAT` (all persistent) |
| 2.8–7.0 | mA | Knob 4 -> 8 (3.5–5.0). Filament and space-charge cloud brighten, electrons per second double, photons double, heat needle doubles. Scope: curve doubles, stored dashed trace shows the old one, `MAX 60 keV` marker does not move. Tag `8 mA ->` along the stream. | `mA -> HOW MANY` · `more electrons, more photons · same energies` |
| 7.0–13.9 | kVp | Knob 60 -> 70 (7.8–9.4). Electron count unchanged; longer tails, bigger impact flashes; photons shorter-wavelength and more of them; heat needle +1/6. Tag `(-) 70 kVp (+)` across the gap. Scope end point slides to `MAX 70 keV`. Swatch flattens. At 10.3 the headline gains `+ HOW MANY`, the sub line swaps, and the area gained over the stored 60 kVp trace is tinted. | `kVp -> HOW HARD` · `each electron hits harder · max keV = kVp`, then `+ HOW MANY` · `more photons too · output ~ kVp²` · swatch `kVp ↑ LESS CONTRAST` `exaggerated` |
| 13.9–18.2 | TIME | Beam off (13.5). Exposure 1 at 0.10 s: lamp on 14.3–15.1, counter 0 -> 0.80 mAs, 5 of 10 LED segments. Knob 0.10 -> 0.20 s (15.2–15.9). Exposure 2: lamp on 16.05–17.65 (twice as long), counter 0 -> 1.60 mAs, 10 segments. Tube, scope and heat rate identical in both. | `TIME -> HOW LONG` · `same beam, on longer · mAs = mA × s` |
| 18.2–24.0 | End card (all rows fully visible 19.95–22.95) | Window glass darkens; three rows light one by one with the matching knob lamp; title returns in the dial glass. 22.95–23.8: rows fade, knobs turn back, displays go dark, so the last frame equals the first. | `mA -> HOW MANY` `same energies` / `kVp -> HOW HARD` `+ how many` `max keV = kVp` `output ~ kVp²` / `TIME -> HOW LONG` `mAs = mA × s` |

Must-read words: about 63 distinct (hook 9, mA 9, kVp 17, time 10, swatch 4, gauge 2, tube labels and legend 9,
scope marker 3). The end card repeats the three headlines and formulas and adds no new words.
Not counted: instrument name plates (`EXPOSE`, `mAs`, `IMAGE`, the engraved scope ring `X-RAY SPECTRUM · PHOTONS ·
ENERGY · keV · SCHEMATIC`, knob names and scale numbers), the `8 mA` / `70 kVp` tags (they repeat the readouts), the
source line, `SCHEMATIC`, the handle, and the model plate / `POWER` lamp in the top strip that the Reels UI covers.
Poster = 21.6 s (complete cheat sheet + final knob settings + heat, contrast and spectrum panels).

## On-screen claims and their sources
Single engraved source line (22–24 px, on screen for the whole reel):
`McCollough; Zink, Radiographics 1997 · Seibert, J Nucl Med Technol 2004 · EC RP136 2004 · values illustrative`

| # | On screen | Source | Verified from |
|---|---|---|---|
| 1 | `mA -> HOW MANY` · `more electrons, more photons · same energies`; filament glows brighter with mA | Seibert JA. J Nucl Med Technol 2004;32(3):139-47. PMID 15347692: "A larger filament current produces more heat and releases a greater number of electrons"; tube current = "the number of electrons traveling between the electrodes". McCollough CH. Radiographics 1997;17(4):967-84. PMID 9225393: "The quantity of x-rays produced varies proportionally to the tube potential squared, tube current, exposure time..." | Seibert: full text (research stage, re-read by the fact-check); McCollough: abstract (re-pulled at build) |
| 2 | `kVp -> HOW HARD` · `each electron hits harder · max keV = kVp`; tag `70 kVp` across the gap; scope marker `MAX 60/70 keV` | Seibert 2004 (PMID 15347692): "Each electron attains a kinetic energy (in keV) equal to the applied tube voltage"; "maximum x-ray energy (in keV) determined by the peak potential difference (in kVp)". | full text |
| 3 | `+ HOW MANY` · `more photons too · output ~ kVp²` | McCollough 1997 (PMID 9225393), sentence above; Nickoloff EL, Berman HL. Radiographics 1993;13(6):1337-48. PMID 8290728: "radiation output increases by approximately the square of the tube potential". "Output" = exposure / air kerma at the port, hence the "~". | abstracts (both re-pulled at build) |
| 4 | `TIME -> HOW LONG` · `same beam, on longer · mAs = mA × s`; counter 0.80 -> 1.60 mAs | McCollough 1997 (PMID 9225393): proportional to exposure time; Seibert 2004 (PMID 15347692): "the combination of tube current and exposure time in milliampere-seconds (mAs)". 8 mA x 0.10 s = 0.8 mAs; x 0.20 s = 1.6 mAs. | abstract; full text; arithmetic |
| 5 | `~99% HEAT`; needle follows `kV × mA` | Zink FE. Radiographics 1997;17(5):1259-68. PMID 9308113: "only 1% of the electric energy converted to x-ray photons and the remaining 99% converted to heat" (diagnostic tubes in general; the X-ray share is energy dependent, so only "~99% heat" is written). Heat unit = mA x kVp x s: Seibert 2004 (heat-loading section). | abstract (re-pulled at build); full text |
| 6 | `kVp ↑ LESS CONTRAST` + `exaggerated` (step wedge and mini radiograph flatten only in the kVp scene) | European Commission. Radiation Protection 136: European guidelines on radiation protection in dental radiology. 2004, sect. 4.1: "'Low' kilovoltages produce images of higher contrast than do higher kilovoltages." Caveat (caption): 60 vs 70 kVp had "minimal impact" on contrast with three CMOS sensors in one phantom study — Pita de Melo D et al. Dentomaxillofac Radiol 2026. PMID 42538829. | guideline full text (extract re-read); abstract |
| 7 | Tube labels `FILAMENT`, `TUNGSTEN TARGET`, `ALUMINUM FILTER`, `COLLIMATOR`; low-energy photons end in the filter | Seibert 2004 (tube components, thermionic emission, tungsten target); EC RP136 (2004) sect. 4.2: "Filtration of the X-ray beam preferentially removes lower energy X-ray photons from the beam." No filter thickness, HVL or field-size number is shown. | full text; guideline full text |
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
- **Heat.** Needle = kV x mA normalised (70 x 8 = 0.8 of the scale; 60 x 4 = 0.34), spring-damped; anode glow is a
  lagged copy. No watts, joules or temperatures.
- **Time scene** is slow motion: 0.10 s of exposure is drawn over 0.8 s. The LED bar is 0.02 s per segment.
- **Image swatch.** A drawn mini periapical + step wedge; tone curve compressed to 50% contrast at 70 kVp. Far larger
  than the real 60-vs-70 kVp effect, hence `exaggerated`.
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
- Layout: all must-read text is inside x 64–950 / y 234–1580; the knob readouts end at x 942; only bezel metal and
  screws enter the Instagram button column. The top louvers / model plate and the bottom grille are decoration
  under the Reels UI.
- Loop: the hook title is already back in the dial glass during the end card; the cheat sheet fades and the knobs
  turn home before t = 24, so frame 720 equals frame 0 (only the tuning pointer jumps back).

## Change log
- v1: full build (console, tube cutaway, scope, meters, three scenes, cheat sheet).
- v2: scale arcs narrowed to +/-120 degrees and knobs resized (adjacent scale numbers collided); decorative
  transformer replaced by an electrons / photons legend; `Al FILTER` -> `ALUMINUM FILTER` (read as "AI");
  handle moved to the dial glass; cheat-sheet backdrop made opaque (tube labels ghosted through).
- v3: `8 mA` and `70 kVp` tags inside the tube; scope axis words moved to the engraved bezel ring at 30 px;
  EC RP136 added to the source line for the contrast claim; knob-column shading; seven-segment decimal point fixed.
- v4: electron stream pre-filled so EXPOSE lamp, stream, photons and mAs counter switch together (the counter used
  to run before the first photon appeared); hook lengthened to 2.8 s; gained-photon area tint in the kVp scene.

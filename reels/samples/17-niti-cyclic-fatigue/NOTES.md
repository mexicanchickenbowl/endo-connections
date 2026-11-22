# 17 · Why NiTi rotary files snap in curves: cyclic fatigue

**Style:** oscilloscope / CRT. Green P31-style phosphor vector graphics on near-black, with scanlines, a two-pass
bloom, phosphor persistence (decaying trace and trails), a graticule, VT323 and Share Tech Mono labels, inverse-video
and outlined tags, small knobs and readouts (`CH1 STRAIN`, `CYCLES`, `R`, `d`). The phone frame is the instrument's
screen. Its bezel, screws and a dim control panel (INTENSITY / FOCUS / TIME/DIV …) sit under the Reels UI at the top
and bottom. The reel opens with a CRT power-on (the beam line opens up) and ends with a power-off (line, then dot), so
the loop joins cleanly.

**Duration:** 22.0 s · 1080×1920 · 30 fps · silent · `reels/out/17-niti-cyclic-fatigue.mp4` (poster at t = 19.4 s)

## Concept
A file rotates in a curved canal, drawn as vector lines. A marked point on its surface at the midpoint of the curve
moves from the outer (stretched) side to the inner (squeezed) side and back on every turn. The scope trace (CH1 STRAIN)
draws the resulting sine wave, and a cross-section inset (rotated so its T half faces the outer side of the curve, as in
the canal) shows the point going round the T and C halves. The formula ε ≈ d / (2R) then lights up with live numbers
while the curve tightens and the file gets thicker, and the trace amplitude grows to match. Next the playback goes to
fast-forward. The trace becomes a dense band, the cycle counter races, and a microcrack starts at a surface flaw and
grows in the fractography inset, ring by ring (striations), as a small peripheral crescent. The file then separates.
The fragment stays in the canal, the trace goes flat, most of the fracture face fills with overload dimples, and a note
says there was no unwinding first. The hook names this as one of two mechanisms (the other is torsion). Payoff:
**"EVERY TURN IN A CURVE SPENDS FATIGUE LIFE\*"** with the fatigue-limit caveat in fine print.

## Storyboard (times in s)
| t | Caption (VT323, typed in, erased in reverse) | Visuals |
|---|---|---|
| 0.00–0.36 | (power-on) | Dot grows to a beam line (0–0.1), then the line opens up into the screen (mirror of the power-off) |
| 0.12–3.40 | **WHY NiTi FILES / SNAP IN CURVES** (104 px; typed by 0.42 s) + 30 px sub-line *mechanism 1 of 2: cyclic fatigue · the other: torsion* | Root and canal draw on (0.3–1.05). The file slides in (0.5–1.2). PEAK STRAIN reads live, ± 0.0 → 3.0 %, and the trace rises as the file bends into the curve (0.75–1.25). Rotation starts at 1.2–1.6 ("▶ SLOW-MO", 1 rev/s) |
| 1.8 → | | Dashed section cut at the curve midpoint, with a dashed leader to the inset. The marked point oscillates across the file with a persistence trail. "SECTION AT CURVE" inset (T half facing the outer side) shows the rotating point. TENSION + / STRETCHED and − COMPRESSION / SQUEEZED tags brighten in turn (passive side stays legible) |
| 3.40–6.90 | **Every turn = one / tension–compression cycle** | Sine trace (4 %/div); CYCLES counts at each tension peak. Panel: PEAK STRAIN ± 3.0 %, knobs R 5.0 mm / d 0.30 mm, "example values" |
| 6.90–10.60 | **Tighter curve, thicker file / → more strain** | Panel types **ε ≈ d / (2R) = 3.0 %**. Display B dims to 55 % (7.4–10.4). R knob 5.0 → 3.0 mm (7.6–8.8): the canal tightens, the radius arrow (centre → file axis) shrinks, ε 3.0 → 5.0 %. d knob 0.30 → 0.36 mm (9.1–9.9): ε 6.0 %. Plain-word legend: "R = radius of curvature", "d = file Ø at the curve" |
| 10.60–14.45 | **Surface flaw → microcrack, / grows every cycle** | "▶▶ FAST-FWD" (10.65–11.9 ramp, up to 240 rev/s displayed). Trace becomes a dense, dimmed band; display B dims to 60 % (12.0–14.55). Inset title fades out, then the fractography view appears: "ORIGIN: / SURFACE FLAW" (left, with leader), crack front grows as striation arcs (STRIATIONS label). Focus ring (r 52) on the crack at the file's outer surface, tagged "microscopic, / not visible / clinically". FATIGUE LIFE USED meter (toy model) fills |
| 14.55 | | **Fracture** (N = 741, illustrative): hot frozen beat (0.2 s), burst ring (5 px, r → 122), both fracture faces bright, shank spins down and retracts 130 px, status STOP, "■ SEPARATED", the trace goes flat, dimples fill ~90 % of the face (OVERLOAD) |
| 14.45–17.75 | **Then: sudden fracture, / often without warning** | "FRACTURE AT N = 741\*" tag (backing cleared) with "\*toy model · values illustrative" under it. Note (36 px): "no unwinding first, / unlike many torsional failures" |
| 17.75–21.62 | **EVERY TURN IN A CURVE / SPENDS [FATIGUE LIFE]\*** (92 px; inverse block painted after the bloom) + 24 px "\*above ~0.7% strain (fatigue limit) · Cheung & Darvell IEJ 2007" | Displays dim to 70 % |
| 21.62–21.98 | (power-off; the takeaway stays on screen and collapses with it) | Screen collapses to a line, then the line shrinks toward a dot; frame 0 picks up at the same short line |

Every caption stays fully visible for at least `Kit.readSecs` (computed: hook 2.78 s vs 2.62; scene 2 2.98 vs 2.62;
scene 3 3.18 vs 2.92; scene 4 3.33 vs 2.92; scene 5 2.78 vs 2.62; takeaway 3.55 vs 3.22).

## On-screen claims and sources
(Retrieved and checked via PubMed.)

1. **"Every turn = one tension–compression cycle"** (a file rotating while bent: the outer fibres are in tension,
   the inner fibres in compression, and each point alternates once per revolution). This is the rotating-bending
   fatigue model used in endodontic cyclic-fatigue testing:
   - Pruett JP, Clement DJ, Carnes DL. *Cyclic fatigue testing of nickel-titanium endodontic instruments.*
     J Endod 1997;23(2):77-85. PMID 9220735. doi:10.1016/S0099-2399(97)80250-6
   - Cheung GSP, Darvell BW. *Fatigue testing of a NiTi rotary instrument. Part 1: Strain-life relationship.*
     Int Endod J 2007;40(8):612-8. PMID 17532775. doi:10.1111/j.1365-2591.2007.01262.x ("rotational bending")
   - Li UM, Lee BS, Shih CT, Lan WH, Lin CP. *Cyclic fatigue of endodontic nickel titanium rotary instruments:
     static and dynamic tests.* J Endod 2002;28(6):448-51. PMID 12067126. doi:10.1097/00004770-200206000-00007.
     Abstract states it directly: instruments rotating in curved canals "are subjected to both tensile and
     compressive stress", localized at the point of curvature. (Added in the citation audit: the Pruett and Cheung
     abstracts only imply the alternation via the rotating-bending set-up.)
2. **ε ≈ d / (2R)** (written with brackets so it cannot be read as (d/2)·R; surface strain amplitude, d = file diameter at the curve, R = radius of curvature). This is the
   standard outer-fibre strain of a bent beam (ε = y/R with y = d/2). It is purely geometric, so it holds even though
   NiTi's stress–strain curve is non-linear. Cheung & Darvell 2007 (Part 1) computed each specimen's surface strain
   amplitude from its curvature and the diameter of the fracture cross-section, and showed a strain-life
   relationship typical of metals. **Correction to the brief:** the PubMed abstract of Pruett 1997 does not state the
   formula, so on screen it is credited to "simple beam bending", not to Pruett. Pruett is credited for the
   cycle/curvature findings below. R is the radius of the file's axis (neutral axis); the on-screen radius arrow now
   runs from the centre of curvature to the file/canal centreline, not to the inner wall. On screen the symbols are
   defined in words during scene 3 ("R = radius of curvature", "d = file Ø at the curve") and the knob values are
   labelled "example values".
3. **Worked numbers:** d 0.30 mm, R 5.0 mm → 0.30 / (2 × 5.0) = **3.0 %** (the brief's example, arithmetic
   correct). R 3.0 mm → **5.0 %**. d 0.36 mm → **6.0 %**. Live values in between (e.g. R 3.2 → 4.7 %). All
   **schematic** example values: real d depends on tip size, taper and depth, and real R on the canal. R = 5 mm and
   2 mm were the radii Pruett used. 6 % is at the upper end of NiTi's recoverable (superelastic) strain range; it is
   kept as a deliberately severe example and flagged as an example value.
4. **"Tighter curve, thicker file → more strain"** (and so fewer cycles to failure):
   - Pruett 1997: cycles to failure fell significantly as the radius of curvature fell (5 → 2 mm) and as the angle
     rose above 30°. Larger instruments (#40) failed sooner than #30. rpm did not affect cycles to failure. Fracture
     occurred at the point of maximum flexure (the midpoint of the curve), which is why the reel puts the crack and
     fracture there.
   - Haïkel Y et al. *Dynamic and cyclic fatigue of engine-driven rotary NiTi endodontic instruments.*
     J Endod 1999;25(6):434-40. PMID 10530246. doi:10.1016/S0099-2399(99)80274-X. Radius of curvature was the most
     significant factor, and fracture time fell as diameter rose.
   - Not on screen: the **angle** of curvature also shortens life (Pruett 1997: cycles fell as the angle rose above
     30°). Angle sets how much of the file is strained, not the peak strain, so it is left out of ε ≈ d/(2R); the
     caption's "tighter curve" means smaller R.
5. **"Surface flaw → microcrack"** and inset label **"ORIGIN: SURFACE FLAW"** (was "Crack starts at a groove" /
   "ORIGIN: GROOVE"; changed after review because grooves are only one kind of initiation site):
   - Anderson ME, Price JWH, Parashos P. *Fracture resistance of electropolished rotary NiTi endodontic instruments.*
     J Endod 2007;33(10):1212-6. PMID 17889692. doi:10.1016/j.joen.2007.07.007. Milling grooves, cracks, pits and
     metal rollover were seen on the surface. Electropolishing improved cyclic-fatigue life, "likely … caused by a
     reduction in surface irregularities that serve as points for stress concentration and crack initiation."
   - Kuhn G, Tavernier B, Jordan L. J Endod 2001;27(8):516-20. PMID 11501589. Surface state is an important factor
     in fracture initiation.
   - Cheung GSP, Shen Y, Darvell BW. *Does electropolishing improve the low-cycle fatigue behavior of a NiTi rotary
     instrument in hypochlorite?* J Endod 2007;33(10):1217-21. PMID 17889693. doi:10.1016/j.joen.2007.07.022.
     Electropolished files never showed more than one crack origin (fewer than non-electropolished), yet LCF life
     was not better in NaOCl. Together with Anderson 2007 (life improved, in air) the benefit of a smoother surface
     is contested, so the reel only says cracks start at a surface flaw (groove, pit, crack, rollover), and cracks
     also start on electropolished or EDM files.
   - **"microscopic, not visible clinically"** (tag beside the focus ring): Cheung GSP, Peng B, Bian Z, Shen Y,
     Darvell BW. *Defects in ProTaper S1 instruments after clinical use: fractographic examination.* Int Endod J
     2005;38(11):802-9. PMID 16218972. doi:10.1111/j.1365-2591.2005.01020.x. Low-power or lateral examination failed
     to reveal the true failure mechanism; striations needed high-power SEM. This paper examines files *after*
     fracture, so "not visible clinically" (before fracture) is an inference, supported together with Cheung &
     Darvell 2007 Part 2 (PMID 17511786: the fatigue region is "microscopic striations", seen by SEM) and Shen et al.
     2006 (PMID 16410072: ProTaper "more likely to separate without warning").
6. **"grows every cycle" / STRIATIONS / OVERLOAD (dimples) / ORIGIN** (fatigue fractography):
   - Cheung GSP, Darvell BW. *Fatigue testing of a NiTi rotary instrument. Part 2: Fractographic analysis.*
     Int Endod J 2007;40(8):619-25. PMID 17511786. doi:10.1111/j.1365-2591.2007.01256.x. Every fracture surface
     showed one or more crack origins, a region of striations, and an area of dimples (final rupture). There is a
     critical crack extension before final rupture; 1/√(crack radius) rose linearly with strain amplitude.
   - Cheung GSP, Darvell BW. *Low-cycle fatigue of rotary NiTi endodontic instruments in hypochlorite solution.*
     Dent Mater 2008;24(6):753-9. PMID 17996288. doi:10.1016/j.dental.2007.09.004. √(crack extension) is inversely
     related to strain amplitude; there is a critical crack extent that falls as strain rises (also PMID 17889693).
   - **Proportions (changed after review):** at the 6 % strain shown, the striated fatigue zone is drawn as a small
     peripheral crescent (crack extent capped at 0.42 r from the origin, well short of the centroid), and ~90 % of the
     face is the dimpled final-overload zone. The earlier build ran the fatigue zone past the centroid, which is the
     wrong way round for high strain.
   - Cheung GSP et al. Int Endod J 2005;38(11):802-9. PMID 16218972. Fatigue striations in clinically fractured
     files.
   - The inset is **schematic**. A single origin is drawn (the simplest case: Part 2 found one or more origins on
     every face, multiple origins more often in water, and non-electropolished files had more origins in NaOCl).
     Striation spacing widens as the crack grows (the usual crack-growth behaviour). It is not a trace of a real
     micrograph. The crack on the file in display A starts at the outer surface and is drawn to a depth of ~0.4 Ø
     (exaggerated vs the inset's ~0.2 Ø so it can be seen; display A is "not to scale"), always short of the axis.
7. **"Then: sudden fracture, often without warning"** and **"no unwinding first, unlike many torsional
   failures"** (36 px; line 1 shortened from "beforehand" so it clears the root outline):
   - Sattapan B, Nervo GJ, Palamara JE, Messer HH. *Defects in rotary NiTi files after clinical use.*
     J Endod 2000;26(3):161-5. PMID 11199711. doi:10.1097/00004770-200003000-00008. Fractures split into torsional
     (55.7 %) and flexural-fatigue (44.3 %) types. Torsional failures are associated with deformation such as
     unwinding (this classification is in the full text; the PubMed abstract gives only the split, so Shen 2006
     below is the direct abstract-level support for "without warning").
   - Shen Y, Cheung GS, Bian Z, Peng B. J Endod 2006;32(1):61-5. PMID 16410072. doi:10.1016/j.joen.2005.10.017.
     Flexural fatigue was behind most separations. ProTaper was "more likely to separate without warning", ProFile
     unwound more often.
   - The wording was kept conservative ("often", "many") because some torsional failures also lack visible
     unwinding, and clinically both mechanisms often combine (Plotino 2009; Parashos & Messer 2006).
7a. **Hook sub-line "mechanism 1 of 2: cyclic fatigue · the other: torsion"** (added after review). The hook asks why
   files snap in curves; cyclic fatigue is one of two mechanisms and their relative share is disputed:
   - Sattapan 2000 (above): torsional 55.7 % vs flexural fatigue 44.3 % of fractures.
   - Parashos P, Gordon I, Messer HH. *Factors influencing defects of rotary nickel-titanium endodontic instruments
     after clinical use.* J Endod 2004;30(10):722-5. PMID 15448468. doi:10.1097/01.don.0000129963.42882.c9.
     Fractures 5 % (3.5 % flexural, 1.5 % torsional).
   - Shen 2006 (above) and Cheung 2005 (above): fatigue dominant on fractography.
   - Plotino G, Grande NM, Cordaro M, Testarelli L, Gambarini G. J Endod 2009;35(11):1469-76. PMID 19840633.
     doi:10.1016/j.joen.2009.06.015. Clinically both act together.
   - The status line now reads "CH1 ▪ NiTi CYCLIC FATIGUE" on every frame (topic shows on the cover too).
8. **Takeaway "Every turn in a curve spends fatigue life\*"** with 24 px fine print **"\*above ~0.7% strain (fatigue
   limit) · Cheung & Darvell IEJ 2007"** (added after review): a cumulative-damage statement consistent with
   low-cycle fatigue, bounded by the fatigue limit at about 0.7 % strain found in Part 1 (PMID 17532775). Below it
   (very gentle curves, thin files; e.g. d 0.30 mm needs R ≳ 21 mm) damage per cycle is negligible. Typical clinical
   combinations (e.g. d 0.3 mm, R ≤ 10 mm → ε ≥ 1.5 %) are above it.
8a. **Not on screen (clinical corollary):** the reel shows the static-test model (file held at one depth, so the same
   point flexes every turn). In-and-out (pecking) motion moves the peak-strain zone along the file and lengthens time
   to failure: Li UM, Lee BS, Shih CT, Lan WH, Lin CP. *Cyclic fatigue of endodontic nickel titanium rotary
   instruments: static and dynamic tests.* J Endod 2002;28(6):448-51. PMID 12067126.
   doi:10.1097/00004770-200206000-00007. Left off screen because display A has no free fine-print slot in scenes 2–4
   without crowding the focal point.
9. Background reviews: Parashos P, Messer HH. J Endod 2006;32(11):1031-43. PMID 17055902. Plotino G et al. *A review
   of cyclic fatigue testing of NiTi rotary instruments.* J Endod 2009;35(11):1469-76. PMID 19840633. Plotino notes
   that, because instruments probably fit loosely in the test tubes/grooves, the reported curvature is likely
   overstated (files were actually bent less severely than reported, i.e. the true radius was larger), so real
   strains in those tests are uncertain and probably lower than the nominal geometry implies.

## What is schematic, modelled or exaggerated (all flagged on screen)
- "schematic · not to scale" (display A): the file width is exaggerated about 2.4× relative to R. Root and canal
  outlines are idealised. A 60° curve is used (Pruett's largest angle). The section inset is shown "laid flat" and
  rotated so its tension half faces the outer side of the curve (matching the canal view); during the morph to the
  fracture face it turns a further 30° so the origin sits on the left beside its labels.
- "example values" (formula panel knobs): R 5.0 → 3.0 mm, d 0.30 → 0.36 mm, ε 3.0 → 6.0 %.
- "values illustrative" (trace) and **"FRACTURE AT N = 741\*" / "\*toy model · values illustrative"** directly under
  the tag: the trace amplitudes follow the formula, but the cycle count at fracture (**N = 741**) is not a measured
  value. Real cycles to failure vary widely with instrument design, alloy and heat
  treatment, environment (water shortens LCF life: Cheung & Darvell, Int Endod J 2007;40(8):612-8, PMID 17532775;
  water and NaOCl: Cheung GSP, Shen Y, Darvell BW. *Effect of environment on low-cycle fatigue of a nickel-titanium
  instrument.* J Endod 2007;33(12):1433-7, PMID 18037053, doi:10.1016/j.joen.2007.08.007), and test method.
- "toy model" (FATIGUE LIFE USED meter): a Miner's-rule damage sum with N_f ∝ ε⁻². The exponent comes from the
  apparent fatigue-ductility exponent of about −0.45 to −0.55 reported by Cheung & Darvell 2007 (Part 1), so
  1/c ≈ −2. It is normalised so that 100 % = fracture. The crack size in the inset is a monotonic function of this
  damage, with crack initiation folded in.
- Speeds: "SLOW-MO" shows 1 rev/s (clinical rotary speeds are about 250–600 rpm, roughly 4–10 rev/s).
  "FAST-FWD" ramps the displayed rate to 240 rev/s, so hundreds of cycles fit into about 3 s.
- The strain is shown rising as the file enters the curve: a non-rotating bent file carries a static strain at that
  point, and rotation turns it into the alternating cycle.

## Design rationale
- **One instrument, three linked views.** Mechanism (canal + file + section), signal (CH1 strain vs time) and law
  (formula + knobs). The same marked point appears on the file, on the section and as the trace's beam head, so the
  viewer can link them without narration.
- **CRT idioms with a job to do.** The sweep beam and persistence show time passing. Fast-forward turns into a
  dense band, as a real scope shows a high-frequency signal. After fracture, the fading band is a lingering
  memory of the cycles. Inverse video is used only for the payoff words, and that block is painted on the composed
  frame after the bloom (solid rgb(110,255,160) with #021a0c letters, ≈ 14:1 before scanlines) so glow cannot fill
  the letters; a dim copy on the phosphor layer still feeds the halo. Outlined tags are used elsewhere.
- **One focal point at a time.** Scene 3 dims display B to 55 % so the eye goes canal → formula; fast-forward dims
  display B to 60 % and the band fill/edges are lighter, so the crack (focus ring + inset) leads.
- **Typography.** VT323 for captions and readouts (76–104 px) and Share Tech Mono for labels (≥30 px). Fine print
  (sources, "toy model", "schematic") is 24 px. VT323 has no ε, ≈ or →: ε uses JetBrains Mono (Greek subset), and ≈,
  →, ▶ and ■ are drawn as vector strokes to match the beam look. Ligatures are disabled (`textRendering =
  'optimizeSpeed'`), so "file" does not collapse into the fi ligature.
- **Palette.** A single phosphor green whose hue rises toward white-green at high intensity (additive `lighter`
  compositing), on a #010302 screen. No second colour, to commit to the monochrome-CRT idea.
- **Safe areas.** All readable content is inside x 64–1016, y 230–1580. Below y 1100, everything that must be read
  stays left of x 950; the big ε value is right-aligned at 946. The handle `@natebrooksendo` is in the scope's
  status line (top right, y ≈ 260). The hook and poster sit inside the 3:4 grid crop.
- **Determinism.** Rotation phase, strain amplitude and the damage integral are precomputed tables, integrated at
  1 ms steps from the timeline. Persistence trails and the sweep sample those tables, and all noise is seeded.
  Bloom = layer → ½-res blur → ¼-res blur, added back on top. About 120 ms per frame, canvas fast path.

## Change log
- v1: first build (canal and file vector drawing, section inset, sweep trace, formula panel, fractography, life
  meter, CRT body).
- v2 (QA pass 1):
  - Fixed the instrument body mask, which covered the screen at 70 % because of a translucent `destination-out` fill.
  - Disabled ligatures.
  - Fixed reversed apex caps.
  - Moved the d call-out to the outer side and the radius line to 0.82 of the arc, so neither collides with the
    section cut.
  - Replaced the A–A letters with a simple cut.
  - Moved the speed tag off the root outline.
  - Made strain start at 0 and rise during insertion.
- v3 (QA pass 2):
  - The section inset is larger and centred in scene B, then moves up for scene C.
  - Added the ε-vs-R mini-plot to fill the empty bottom-right in scene C.
  - Toned down the fast-forward band (dimmer interior, bright edges).
  - The crack now nucleates earlier and the acceleration starts earlier, so crack growth spans its caption.
  - The STRIATIONS label is now tied to crack size.
  - Outlined tags replace inverse video for small labels.
  - Added a dashed focus ring around the crack site.
  - Added the torsional-vs-fatigue note.
- v4 (QA pass 3):
  - The big strain value was entering the right-hand button column; it is now right-aligned at x 946.
  - Removed a full-screen bright wash during power-on/off (photosensitivity), leaving only a thin beam line.
  - The PEAK STRAIN → formula change is now sequential, with no overlap.
  - Takeaway dims the displays to 50 %.
  - The FRACTURE tag is now outlined for legibility.
  - Poster moved to 16.4 s.
- v5 (independent science + design review). See "Review changes" below.
- v6 (Final QA, fresh-eyes pass):
  - The takeaway caption vanished at 21.63 s, a few frames before the power-off squash finished (empty caption band
    while the screen collapsed). It is now held to the end (t1 = DUR) and collapses with the screen.
  - The section/fractography inset shrank ~12 % and its labels slid right as the takeaway dimmed the displays (its
    radius was scaled by the dim factor). Size now follows the reveal only; the dim affects brightness only.
  - Re-checked on PubMed: Cheung & Darvell 2007 Part 1 abstract states "A fatigue limit was present at about 0.7%
    strain" (PMID 17532775); other on-screen sources (PMIDs 9220735, 17511786, 17889692, 16218972, 11199711,
    16410072, 10530246) match NOTES. Video re-rendered; gallery metadata in meta.json.
- Citation audit (2026-11-22). Every PMID in the reel, meta.json and NOTES was fetched from PubMed and its first
  author, year, journal, volume/pages and abstract checked against the claim it is attached to: 9220735 (Pruett
  1997), 17532775 (Cheung & Darvell 2007 Part 1), 17511786 (Part 2), 10530246 (Haïkel 1999), 17889692 (Anderson
  2007), 17889693 (Cheung, Shen & Darvell 2007, electropolishing), 18037053 (Cheung, Shen & Darvell 2007,
  environment), 16218972 (Cheung 2005), 11199711 (Sattapan 2000), 16410072 (Shen 2006), 15448468 (Parashos 2004),
  11501589 (Kuhn 2001), 17996288 (Cheung & Darvell, Dent Mater 2008), 19840633 (Plotino 2009), 17055902 (Parashos &
  Messer 2006), 12067126 (Li 2002). All exist and match. On-screen source lines (Pruett et al. J Endod 1997;
  Anderson J Endod 2007; Cheung & Darvell IEJ 2007; Cheung IEJ 2005; Sattapan et al. J Endod 2000; Shen et al.
  J Endod 2006; takeaway fine print "Cheung & Darvell IEJ 2007" for the ~0.7 % fatigue limit) are correct, so the
  reel and video were not changed. Fixes:
  - NOTES: PMID 18037053 was credited to "Cheung & Darvell 2007"; it is Cheung, Shen & Darvell, J Endod
    2007;33(12):1433-7 (water and NaOCl). Water alone is now credited to Part 1 (PMID 17532775).
  - NOTES: Plotino 2009 paraphrase "reported test radii are probably overstated" could be read backwards; reworded
    to the abstract's meaning (curvature overstated: files bent less severely than reported).
  - "microscopic, not visible clinically": Cheung 2005 examines files after fracture, so support for "not visible
    clinically" was indirect. Added Cheung & Darvell Part 2 (microscopic striations, PMID 17511786) and Shen 2006
    ("separate without warning", PMID 16410072) to meta.json and NOTES; on-screen wording kept.
  - "Every turn = one tension–compression cycle": added Li et al. J Endod 2002 (PMID 12067126), whose abstract states
    the tensile/compressive alternation directly, to meta.json and NOTES.
  - Sattapan 2000: noted that the unwinding/torsional classification is from the full text (abstract gives only
    the 55.7/44.3 % split); Shen 2006 carries the abstract-level support for "without warning".
  - Caption Refs: "Cheung & Darvell 2007, Int Endod J" is two papers, now "(Parts 1-2)"; added "Shen 2006, J Endod"
    for the "no visible unwinding first" line.
  - Not changed (nit): the scene-4 source line omits "et al." for Anderson (3 authors) and Cheung 2005 (5 authors).
    Author, journal and year still identify the right papers, and adding "et al." would push the line past x 960
    into the right-hand button column at y 1570 (it already spans x 70–937 at 24 px).

## Review changes
Science:
- Fractography proportions: crack extent capped at 0.42 r (was 1.12 r), so the striated zone is a small peripheral
  crescent short of the centroid and dimples fill ~90 % of the face (Cheung & Darvell 2007 Part 2; Dent Mater 2008).
- "Crack starts at a groove" → **"Surface flaw → microcrack, / grows every cycle"**; inset label
  **"ORIGIN: / SURFACE FLAW"** (Anderson 2007; Cheung, Shen & Darvell 2007).
- Tag **"microscopic, / not visible / clinically"** next to the focus ring (Cheung et al. 2005); caption says
  "microcrack"; source line adds Cheung IEJ 2005.
- Hook sub-line **"mechanism 1 of 2: cyclic fatigue · the other: torsion"** (Sattapan 2000; Parashos 2004;
  Plotino 2009).
- Takeaway now ends in "\*" with fine print **"\*above ~0.7% strain (fatigue limit) · Cheung & Darvell IEJ 2007"**.
- **"FRACTURE AT N = 741\*"** with **"\*toy model · values illustrative"** directly under it (26 px).
- Nits: formula **ε ≈ d / (2R)** in the panel and source line; "example values" label in the formula panel; R and d
  defined in words (scene 3); radius arrow now ends on the file/canal centreline; first source line now
  "rotating-bending fatigue test: Pruett et al. J Endod 1997"; status line no longer uses "ROTATING-BEND" (it now
  reads "NiTi CYCLIC FATIGUE"); angle-of-curvature, single-origin and pecking (Li 2002) caveats recorded above
  (not on screen).
Design:
- Payoff inverse block painted after the bloom (dark letters on a solid bright block, ≈ 14:1) instead of being cut
  out of the phosphor layer (was ~1.4–2.1:1).
- Scene 3: ε-vs-R mini-plot removed; its area now holds "R = radius of curvature" / "d = file Ø at the curve"
  (30 px, brighten with their knob); dead alpha-0 line removed; display B dimmed to 55 % (7.4–10.4 s).
- Fast-forward: band fill 0.03 → 0.012, edge dots 0.8 → 0.45, display B dimmed to 60 % (12.0 s → fracture); crack on
  the file is a hot zig-zag line from the outer surface, focus ring radius 40 → 52; inset radius 110 → 125.
- Fracture: brief hot frozen beat (0.2 s), retraction 72 → 130 px, burst ring 5 px wide to r 122 at 1.4 intensity,
  both fracture faces at 1.3, FRACTURE tag in at +0.05 → +0.25 s.
- Section inset rotated so its T half faces the outer normal (as the canal's TENSION label), with a dashed leader
  from the section cut to the inset (scene 2); labels T / C / 0 stay upright; the inset turns a further 30° during
  the morph so the origin sits on the left.
- Inset title cross-fade staggered: "SECTION AT CURVE" gone by morph + 0.25 s, fractography labels from morph + 0.4 s.
- ORIGIN label moved left of the inset with a real leader ("ORIGIN: / SURFACE FLAW"); STRIATIONS above it and
  OVERLOAD below it, each with a leader. The reviewer's exact spot (left at the origin's height with the origin on
  top) would have collided with the FAST-FWD / SEPARATED tag, hence the left-side origin.
- Status line "CH1 ▪ NiTi CYCLIC FATIGUE"; poster moved to 19.4 s (takeaway + separated file + fractography);
  takeaway dim floor 0.5 → 0.7.
- TENSION / COMPRESSION tags: floor 0.62, sub-labels × 0.8 (passive side stays ≈ 4:1); compression labels moved up
  36 px to clear the new leader.
- Torsional note at MONO 36 / 0.9, baselines 868 / 910; line 1 shortened to "no unwinding first," to clear the root
  outline.
- Timing: DUR 21.6 → 22.0; hook +0.2 s, scene 3 +0.2 s (all later times shifted); file insertion 0.5–1.2 s, rotation
  from 1.2 s, inset from 1.8 s, so the right half fills while the title is up. All captions now clear readSecs by
  0.16–0.41 s.
- Loop seam: power-on mirrors the power-off (short line grows 0.2 → 1 W in 0.1 s, then opens).
- Nits: 100% tag separated from the meter (bar 210 → 190 px); FRACTURE tag backing cleared so the band edge no longer
  pierces it; PEAK STRAIN value now shows from 0.6 s and rises live 0.0 → 3.0 % as the file bends in; d call-out reads
  "d 0.30 mm" (46 px) with longer bracket ticks at full intensity while d changes.
- Layout: hook 112 → 104 px with its top at y 296; display A top moved 488 → 494 to make room for the sub-line.


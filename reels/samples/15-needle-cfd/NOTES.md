# 15 · Needle CFD — side-vented vs open-ended: where the irrigant really goes

**Format:** 1080×1920, 22.5 s, silent. **Style:** CFD post-processing look (ParaView/Fluent-like): dark grey
viewport, thin white geometry outlines, banded velocity contours + evenly spaced streamlines coloured by
velocity magnitude (turbo), animated tracer particles, canal wall coloured by wall shear stress (magma),
vertical colour bars, measuring tape, probe markers, a "mesh → solve → post-process" intro, IBM Plex Sans/Mono.

## Concept
Two 30 G needles, both 3 mm short of working length (WL) in the same size 45/.06 canal (the set-up of
Boutsioukis et al. 2010). The viewer watches the flow field "solve", then follows a CFD analyst's
post-processing session: (1) a dye front of tracers leaves the open-ended needle and its jet runs almost to WL
(measuring tape + reach arrow), (2) the side-vented jet hits the wall and rolls into vortices; the tape shows a
reach of 1–1.5 mm and a hatched near-stagnant zone beyond, (3) the field is re-coloured by pressure apical to the
tips to show the open-ended trade-off (apical pressure), and (4) the side-vented needle is moved to 1 mm short;
that case is shown as a labelled schematic of the published 3-D CFD result (not the toy model).
Takeaway: **tip design guides needle depth** (in canals enlarged to ≥ size 30–35).

## How the flow pictures were made (what is real, what is schematic)
- The flow fields are **not traced from a paper figure**. They are a *toy* 2-D simulation I ran for this reel:
  `sim/lbm.cjs` — lattice Boltzmann, D2Q9, two-relaxation-time collision + Smagorinsky sub-grid term,
  80 cells/mm. Geometry: size 45/.06 tapered canal (closed at WL, small corner fillets), 30 G needle
  OD 0.32 mm / ID 0.196 mm, open-ended (flat) or closed-ended with one side vent (vent 0.05–0.55 mm above the
  closed tip, facing −x). Parabolic inflow in the lumen, pressure outlet at the coronal end.
  Spin-up at Re 15 (to settle slow apical eddies; the 1 mm side-vented case was started directly at Re 900
  because the low-Re start diverged in its narrow gaps), ramp to **Re 900** (≈ the real Reynolds number of
  0.15 mL/s through a 0.196 mm lumen with a water-like irrigant: Re = 5 m/s × 0.196 mm / 1e-6 m²/s ≈ 980),
  then time-averaged over the last 25 000 steps. `sim/export.cjs` packs u, v, p into `field.js`.
- Because it is 2-D (a slice, not a 3-D canal), absolute numbers are not meaningful; it reproduces the
  *qualitative* patterns reported by 3-D CFD: open-ended jet reaching ~WL with recirculation along the walls;
  side-vented jet hitting the wall facing the vent with a series of vortices apical to the tip and a
  near-stagnant apex; higher apical pressure for the open-ended needle (toy ratio ≈ 5:1; Shen et al. 2010, as reported
  by Singh et al. 2024, found ~2.5–3× lower pressure for closed-ended needles — not shown as a number on screen). In the 2-D slice the side-vent flow returns under the
  closed tip and up the opposite side; in 3-D it can also spread around the circumference.
- Colours: speed, wall shear stress and pressure are all shown **relative** (colour bars say "relative",
  ends "high"/"low", no numbers). Internally the speed colour is linear and saturates at 1.6× the mean lumen
  speed (mean lumen speed ≈ 5 m/s for 0.15 mL/s ÷ π·(0.098 mm)² = 4.97 m/s); this number is not on screen
  because the 2-D slice makes canal speeds 5–10× too high (see review changes). Particle speeds are slowed
  for playback. Canal width is exaggerated ×2.2 (lengths along the canal are true scale).
- On screen: "Schematic 2-D toy model, width ×2.2", "Re 900 (toy) · time-averaged", "relative", and per-beat
  notes on what the 2-D slice exaggerates.
- The side-vented needle 1 mm short is **not** shown with toy flow (the 2-D toy under-predicted reach there and
  produced a 2-D gap jet artefact). The final beat shows the needle move + re-mesh, then a cyan *schematic*
  (dashed flow arrows, shaded replacement zone, reach bar to WL) labelled "schematic of 3-D CFD result", with the
  footnote "Side-vented 1 mm: 3-D CFD schematic (Boutsioukis 2010); Singh 2024 disagrees".
- Reference flow rate: the Boutsioukis 3-D models were run at 0.26 mL/s (≈ 8.6 m/s inlet in a 30 G lumen; Singh 2024
  uses the same 0.26 mL/s ↔ 8.6 m/s mapping and the Boutsioukis needle geometry, citing those flow rates as clinically realistic);
  the reel runs at 0.15 mL/s. The patterns are qualitatively similar; the footnote says "patterns after".
- Vent geometry (schematic simplification): the toy side vent spans 0.05–0.55 mm above the closed tip; the
  reference single side-vented model (KerrHawe probe, Singh 2024 Table 1, after Boutsioukis) has a 0.96 mm vent
  starting 0.5 mm from the tip. The toy's jet therefore hits the wall slightly more apically. Not re-run.

## Storyboard (t in s) — after review
| t | Visual | On-screen text |
|---|--------|----------------|
| 0.0–3.0 | Frame 0 = faint velocity field (loop target); mesh sweeps in (0–0.6), coloured field by 1.1 s, streamlines grow, tracers released as a dye front at 1.1 s, wall-shear band + bars by 2.0 s | **Where does the irrigant really go?** · panel labels · header fades in after the hook |
| 3.0–7.4 | Focus open-ended (side-vented dimmed); tracers reach WL ≈ 4.8 s as the tape + reach arrow land | **Open-ended: the jet drives toward WL** · "reach: almost to WL" · legend "streamline / tracer (from needle)" |
| 7.4–12.4 | Focus side-vented; pulse on the wall hit; tape with 1–1.5 mm reach bar; hatched zone beyond | **Side-vented: jet hits the wall, then vortices** · "shear peak", "vortex", "little exchange", "reach ≈ 1–1.5 mm" (open-ended readout stays, dimmed, for comparison) |
| 12.4–15.6 | Field re-coloured by pressure apical to the tips only (lumens hatched grey, coronal field greyed); pulsing probes at the foramen; bars at the 3-D CFD ratio (side-vented = 0.41 × open-ended) | **Open-ended: higher apical pressure** · "more extrusion ex vivo" / "lower" |
| 15.6–22.5 | Side-vented needle slides to 1 mm + re-mesh; schematic of the 3-D CFD result with reach bar to WL; open-ended panel dims during the move, WSS at 50 %; last 0.4 s fades to the frame-0 state and the hook | **Tip design guides needle depth** · "in canals enlarged to ≥ size 30–35" · "2–3 mm short of WL" · "1 mm short of WL" · "reach: to WL" · "never let it bind · deeper = more apical pressure" (all fully visible ≈ 17.9–22.1 s) |

## On-screen claims and sources (verified on PubMed)
1. **Open-ended jet reaches toward / nearly to WL (needle 3 mm short, 45/.06), more irrigant replacement** —
   Boutsioukis C, Verhaagen B, Versluis M, Kastrinakis E, Wesselink PR, van der Sluis LWM. *J Endod* 2010;36(5):875–9.
   PMID 20416437, doi:10.1016/j.joen.2009.12.026 ("open-ended needles created a jet toward the apex and maximum
   irrigant replacement"); Boutsioukis C et al. *Int Endod J* 2010;43(10):874–81, PMID 20618879 (flat needle 3 mm
   short: replacement almost to WL in size 35–55/.06).
2. **Side-vented: series of vortices, less replacement** — Boutsioukis et al. *J Endod* 2010, PMID 20416437.
3. **Side-vented reach ≈ 1–1.5 mm beyond the tip (0.15–0.2 mL/s in the footnote)** — Boutsioukis C, Lambrianidis T, Kastrinakis E.
   *Int Endod J* 2009;42(2):144–55, PMID 19134043 ("irrigant replacement was limited to 1–1.5 mm apical to the needle
   tip"; note the 2009 abstract says this held "for all flow rates tested", 0.02–0.79 mL/s); flow-rate dependence:
   Boutsioukis C, Arias-Moliz MT. *Int Endod J* 2022;55 Suppl 3:588–612, PMID 35338652 (<0.05 mL/s hardly reaches the
   tip; 1–1.5 mm at 0.15–0.20 mL/s, citing Boutsioukis & Gutierrez Nova 2021, Boutsioukis 2009 and Verhaagen 2012).
4. **Wall shear stress concentrated where the side-vent jet hits the wall ("shear hot spot")** — Chen JE et al.
   *Aust Endod J* 2014;40(2):54–60, PMID 25244218 (side-vented WSS "localised to a small region of the canal wall");
   Singh S et al. *Odontology* 2024;112(4):1248–56, PMID 38703256 (closed-ended: stress on the walls facing the
   vent; open-ended: apical to the outlet). Shown in relative units only.
5. **Open-ended → higher apical pressure; more extrusion ex vivo** — Boutsioukis et al. 2010 (PMID 20416437,
   20850673, 20618879); Psimma Z et al. *Int Endod J* 2013;46(7):619–31, PMID 23240919 (open-ended extruded
   significantly more irrigant than closed-ended; caveat: "Not simulating tissue resistance in ex vivo experiments may
   lead to significant overestimation of irrigant extrusion" → on-screen "(ex vivo may overstate it)").
6. **Placement: open-ended 2–3 mm short of WL; side-vented 1 mm short of WL; never let it bind** (review wording:
   closed-ended "within 1 mm from WL"; shown as "1 mm short" = the CFD position that reached WL) —
   Boutsioukis & Arias-Moliz 2022, PMID 35338652; side-vented reached WL only at 1 mm: Boutsioukis C et al.
   *J Endod* 2010;36(10):1664–8, PMID 20850673; binding/wedging ↑ extrusion (esp. open-ended): Psimma Z et al.
   *J Endod* 2013;39(4):521–4, PMID 23522549.
7. **Header numbers** — 30 G = current clinical standard (PMID 35338652); 0.15 mL/s is within the clinically
   realistic range used in CFD/ex vivo work (0.083–0.26 mL/s); 30 G dimensions OD 0.320 / ID 0.196 mm as used in the
   Boutsioukis models (reported in Singh 2024, PMID 38703256, Table 1: 0.26 mL/s ↔ 8.6 m/s, 0.083 mL/s ↔ 2.7 m/s);
   canal 45/.06 = the 2010 needle-type study geometry.

### Corrections to the brief
- "Replacement ~1–1.5 mm beyond the tip" is from **Boutsioukis et al. 2009 (Int Endod J)**, not the 2010 J Endod
  needle-type paper; and it depends on flow rate (2022 review) — shown with "at 0.15–0.2 mL/s".
- **Gauge ID:** the Boutsioukis 30 G needles have ID ≈ 0.196 mm (not 0.16 mm). 0.1 mL/s through 0.196 mm gives
  ≈ 3.3 m/s mean, not 5 m/s; 5 m/s corresponds to ≈ 0.15 mL/s. The reel uses 0.15 mL/s ↔ ≈ 5 m/s.
  (The 0.16 mm ID would apply to an ISO "thin-wall" 30 G; real needles vary — Boutsioukis 2007, PMID 17645515.)
- "Wall shear stress concentrated near the outlet" is shown for the side-vented needle as a hot spot on the wall
  *facing* the vent (not on the needle). For open-ended needles WSS is spread apical to the outlet.
- Did not claim any magnitude comparison of WSS between needle types (studies disagree: Chen 2014 vs Singh 2024).

8. **Apical-pressure bars** — side-vented bar = 0.41 × open-ended: Singh S et al. *Odontology* 2024;112(4):1248–56,
   PMID 38703256, doi:10.1007/s10266-024-00940-2, Table 2 (6 % taper, 3 mm: 42.36 vs 103.63 kPa at 0.26 mL/s = 0.41;
   8.22 vs 17.48 kPa at 0.083 mL/s = 0.47). Footnote "3-D CFD ratio ≈ 2–2.5× at 3 mm". Direction also in Shen Y et al.
   *J Endod* 2010;36(5):884–9, PMID 20416439 (apical pressure lowest with the side-vented closed-end needle).
9. **"deeper = more apical pressure"** — Boutsioukis et al. 2010, PMID 20850673 ("Both needles showed a similar gradual
   decrease in apical pressure as the distance from the WL increased"); Psimma et al. *J Endod* 2013, PMID 23522549
   ("Irrigant extrusion decreased as needles moved away from working length"); Singh 2024 (pressure maximal at 1 mm).
10. **"in canals enlarged to ≥ size 30–35"** — Boutsioukis & Arias-Moliz 2022 (PMID 35338652): "When 30-31G needles are
   used, the root canal needs to be enlarged to a minimum apical size 30–35 in order to prevent their binding";
   "The irrigant cannot reach up to the WL in root canals prepared to apical size 25 or smaller irrespective of the type
   and size of the needle" (citing Boutsioukis & Gutierrez Nova, *J Endod* 2021;47(9):1487–95, PMID 34118256,
   doi:10.1016/j.joen.2021.06.001).
11. **2-D exaggeration footnote "3-D CFD wall speeds ≈ 0–0.7 m/s"** — Shen et al. 2010, PMID 20416439 ("Irrigant
   velocities on canal walls were very low (0-0.7 m/s) compared with that within the needle lumen (approximately 7 m/s)").
12. **"Singh 2024 disagrees" (side-vented at 1 mm)** — Singh 2024: SSVN penetration "limited to less than 0.5 mm apical
   to the tip"; "none of the needles tested ... could effectively deliver the irrigant up to the apex", explicitly
   contradicting earlier studies ("even when the tip is 1 mm from the apical constriction"). Singh also found open-ended
   penetration "limited to less than 1 mm from the needle exit" (size 30 canal), so the disagreement is about reach for
   both tips; the caption says so. **Shear scale note** — Chen 2014 (side-vented WSS higher but localised) vs Singh 2024
   (open-ended highest).

## Design rationale
- One scientific-software grammar throughout: viewport, colour bars, probe crosshair, measuring tape,
  mesh/solver intro, status bar ("LBM D2Q9 · … · time-averaged"), mono labels. No cartoon elements.
- Two scalar fields, two colour maps that never compete: velocity = turbo (in the fluid), WSS = magma (on the wall
  only). In the pressure beat the velocity colour bar is *replaced* (like switching "colour by" in ParaView).
- Linear velocity scale so the jets pop and the stagnant apex reads as dark; streamlines are lifted 16 % toward
  white so slow vortices stay visible. Slow particles are drawn smaller/dimmer so the eye follows moving fluid.
- Focus is steered by dimming the other panel to ~30 % rather than by moving the camera; one callout at a time.
- Captions ≤ 8 words at 56–66 px; readouts 40 px; must-read labels (bar titles/ends, ruler, WL, callouts) 30 px,
  "relative" sub-titles and the 1 mm schematic tag 26 px; citations 22 px (each footnote line ≤ 820 px, checked at
  runtime — a console warning fires if a line is too wide). All readable text in x 64–1016, y 230–1580; nothing
  readable at x > 960 below y 1100.

## Files & reproduction
- `index.html` (page contract), `reel.js` (render), `field.js` (generated data, ~0.8 MB: open3 + side3)
- `sim/lbm.cjs` (solver), `sim/export.cjs` (packer → `field.js`), `sim/preview.py` (diagnostic previews),
  `sim/meta/*.json|log` (run parameters, apical pressure, logs). Raw float fields are in the git-ignored `sim/_scratch/`.
- Re-run (≈ 5 min per case on one core):
  ```
  node sim/lbm.cjs open3 --re 900 --cs 0.18 --re0 15 --s0 50000 --sr 15000 --steps 50000 --avg 25000 --out sim/_scratch/out900
  node sim/lbm.cjs side3 --re 900 --cs 0.18 --re0 15 --s0 50000 --sr 15000 --steps 50000 --avg 25000 --out sim/_scratch/out900
  # (side1, the 1 mm case, is no longer used in the reel)
  node sim/export.cjs
  ```
- In the page, the decoded velocity is lightly smoothed (two 1-2-1 passes everywhere, six more in slow
  recirculation zones) to remove time-averaging noise before streamlines are traced (Jobard–Lefer evenly spaced).

## Change log
- v1: first build (Re 300 toy fields) → open-ended jet stopped ~1.2 mm short of WL and side-vented reach
  was ~0.1 mm: inconsistent with 3-D CFD. Re-ran at Re 900 (≈ physical) → open-ended reaches WL, side-vented
  shows the stacked vortices; adopted.
- Log velocity scale replaced by linear (jets were indistinguishable from return flow).
- Pressure beat: replaced a decorative red glow with a real pressure re-colouring of the toy field.
- Colour bars moved inside the safe area (x 64–1016); small labels bumped to ≥ 28–30 px.
- Needle move in the last beat now shows a re-mesh + "solving…" ticker instead of an empty canal.

## Review changes (independent science + design review)
Science
- **Velocity colour bar** no longer has m/s ticks (a 2-D slice makes the return flow 5–10× too fast). Now "speed ·
  relative", ends "high"/"low"; footnote "2-D slice exaggerates return flow; 3-D CFD wall speeds ≈ 0–0.7 m/s (Shen 2010)".
- **Apical-pressure bars** now encode the 3-D CFD ratio (side-vented 0.41 × open-ended, Singh 2024 Table 2, 6 %, 3 mm)
  instead of the toy ratio (~0.2); fine print "Bars: 3-D CFD ratio ≈ 2–2.5× at 3 mm (Singh 2024); the 2-D toy field
  exaggerates it".
- **Side-vented 1 mm case**: toy flow removed. Needle move + re-mesh, then a labelled schematic of the 3-D CFD result
  (reach to WL, Boutsioukis 2010, PMID 20850673), with "Singh 2024 disagrees" in the footnote. `side1` dropped from
  `field.js` (1.24 MB → 0.81 MB) and from `sim/export.cjs`.
- **Trade-off line** added: "never let it bind · deeper = more apical pressure".
- **2-D artefacts flagged/de-emphasised**: wall-shear band desaturated coronal to the open-ended tip, on the wall opposite
  the vent and > 1 mm from the vent; footnotes "2-D slice exaggerates return flow & coronal shear; 3-D flow spreads
  around needle" and "Wall shear: one relative scale; studies differ on its peak (Chen 2014; Singh 2024)".
- **Pressure view**: lumens masked (hatched grey); pressure colours only apical to each tip; coronal field greyed.
- **Takeaway caption** "Tip design guides needle depth" + "in canals enlarged to ≥ size 30–35"; footnote adds
  Boutsioukis & Gutierrez Nova 2021.
- **Citations matched to claims**: P1 "Reach: Boutsioukis et al., Int Endod J 2010"; P2 "Reach 1–1.5 mm at
  0.15–0.2 mL/s: Boutsioukis et al. 2009 · IEJ review 2022"; readout "reach: almost to WL".
- Nits: 'stagnant' label removed (hatched "little exchange" zone instead); "within 1 mm" → "1 mm short of WL"; extrusion
  footnote "(ex vivo overestimates it)"; invented "residual 1.0e-6" replaced by the real run length
  "115 000 steps · time-averaged"; 0.26 mL/s reference flow rate and the vent-geometry difference recorded above.
Design
- **Beats restructured** (P3 folded into P1/P2): hook 0–3.0, open-ended 3.0–7.4, side-vented 7.4–12.4, pressure
  12.4–15.6, takeaway 15.6–22.5. Duration 22.0 → 22.5 s. Every caption is fully visible ≥ Kit.readSecs; the complete
  takeaway is held ≈ 4.2 s (17.9–22.1 s).
- **P2 caption** shortened to "Side-vented: / jet hits the wall, then vortices" with 4.4 s full visibility; 'reverse flow'
  callout deleted; "at 0.15–0.2 mL/s" moved to the footnote.
- **"more extrusion ex vivo"** starts with the bars (≈ 2.2 s fully visible); redundant "higher/lower apical pressure"
  bar labels replaced by "lower" (30 px, dim) under the side-vented bar.
- **Tracers** only on streamlines that pass through the needle lumen, 1 per 45 px, released as a dye front at 1.1 s
  (open-ended tracers reach WL ≈ 4.8 s, as the reach arrow lands); closed eddies inside the literature reach zone keep
  slow tracers, eddies beyond it (side-vented apex) stay empty.
- **Hook energy**: coloured field within the first second (mesh 0–0.6 s, field 0.4–1.1 s, tracers/WSS 1.4–2.0 s);
  header fades in after the hook at y 270; poster moved to 2.1 s (hook over the full field).
- **Pressure focal point**: clipped to the apical region; pulsing rings on both foramen probes.
- **Label collisions**: 'shear peak' (renamed) clears panel A; canals moved to x 326/760 and width exaggeration
  2.4 → 2.2 so 30 px bar titles fit beside the canals.
- **Legibility**: horizontal colour-bar titles (speed / pressure / wall shear, 30 px) with "relative" 26 px; high/low
  ends, 'WL' and ruler labels 30 px (ruler labels on dark pills).
- Nits: open-ended panel dims during the needle move; WSS at 50 % in the takeaway; velocity↔pressure bar swap runs in
  sequence; loop: last 0.4 s fades to the faint frame-0 field, needle slides back, hook fades in; footnotes kept within
  x 120–940; pulse ring on the labelled shear peak (opposite-wall spot desaturated).


## Final QA (fresh-eyes review)
- Stills at 0, 0.5, 1.0, 2.1, 3.5, 4.8, 6.5, 8.5, 10, 12, 13.5, 15, 16.5, 18, 19.5, 21, 22.1, 22.3, 22.45 s plus beat
  transitions (7.5, 9.4, 12.5, 15.7, 16.0, 17.2 s) with `--safe` (`_stills/final-qa/`). No clipped/overlapping text, no
  tofu/NaN, no readable text in the no-go zones (top-bar/status-bar chrome is decoration; "reference: 3-D CFD" is repeated
  in-frame as "schematic of 3-D CFD result"), no console warnings. Hook readable from t = 0, takeaway fully visible
  ≈ 17.7–22.1 s (≥ readSecs), loop fades cleanly to the frame-0 state.
- Sources re-checked on PubMed (20416437, 20850673, 20618879, 19134043, 20416439, 25244218, 23240919, 23522549, 34118256,
  35338652 full text, 38703256 full text). Review wording confirmed: "optimum position for the open-ended needles is at
  2–3 mm short of WL, whereas closed-ended needles need to be placed within 1 mm from WL ... always without binding";
  "1–1.5 mm apically to the tip when the flow rate is increased to 0.15–0.20 mL/s"; "minimum apical size 30–35".
  Singh 2024 Table 2 confirmed (6 %, 3 mm: 103.63 vs 42.36 kPa at 0.26 mL/s; 17.48 vs 8.22 at 0.083 mL/s). Note: Singh's
  canal is apical size 30 (not 45 as in the header); the bars encode only the needle-type ratio, footnoted to Singh.
- Video: `reels/out/15-needle-cfd.mp4` 22.5 s (= REEL.duration), 675 frames, 1080×1920; poster (2.1 s, hook over the full
  field) reads inside the 3:4 crop. No reel changes needed, so no re-render. Gallery metadata written to `meta.json`.

## Citation audit
- Every literature citation on screen (reel.js footnotes), in `meta.json` (claims[].source + caption Refs) and in this file
  was re-checked against PubMed metadata (first author, year, journal, volume/pages, PMID): 20416437, 20416439, 20618879,
  19134043, 20850673, 25244218, 23240919, 23522549, 34118256, 35338652, 38703256, 17645515. All 12 PMIDs resolve to the
  paper named (no wrong PMID, year, journal or first author). Abstracts read for each; full text read for Singh 2024
  (PMC11415444: Table 1 vent 0.96 mm / 0.5 mm from tip; Table 2 6 %, 3 mm: 103.63 vs 42.36 kPa at 0.26 mL/s, 17.48 vs
  8.22 at 0.083 mL/s; Shen "2.5–3 times lower"; shear on the wall opposite/facing the vent) and for the 2022 IEJ review
  (PMC9321999: "2–3 mm short of WL ... within 1 mm from WL ... always without binding"; "0.15–0.20 mL/s"; "minimum
  apical size 30–35"; "size 25 or smaller").
- Fixed (on screen): extrusion footnote "(ex vivo overestimates it)" → "(ex vivo may overstate it)". Psimma 2013 (IEJ)
  says ex vivo set-ups that do not simulate tissue resistance *may* overestimate extrusion; the old wording generalised
  it. Checked with stills (`_stills/audit/`, t = 13.5/15.0 s: line fits, x ≈ 135–925), video re-rendered once
  (ffprobe: h264 1080×1920, 30 fps, 675 frames, 22.5 s + silent AAC; frame at 14.0 s shows the new wording).
- Fixed (meta.json): extrusion claim reworded to match Psimma and given the J Endod 2013 paper as a second source;
  side-vented reach source now names Boutsioukis & Gutierrez Nova 2021 (the review's source for the flow-rate
  dependence); Singh disagreement spelled out. Caption: "studies disagree on side-vented reach" → "studies disagree on
  reach (a 2024 CFD study found shorter reach for all tips)", because Singh 2024 also found shorter open-ended reach;
  Refs line completed (Boutsioukis 2010 J Endod & Int Endod J; Psimma 2013 Int Endod J & J Endod; Singh 2024,
  Odontology), since the caption's claims rest on those papers too.
- Fixed (NOTES): 0.26 mL/s reference flow-rate sentence no longer implies Singh reported the Boutsioukis flow rate; added
  the 2009 "for all flow rates tested" nuance, the Psimma tissue-resistance caveat, and Singh's open-ended result.
- Not changed: on-screen author/year/journal strings (all correct); "Chen 2014" is the issue year (e-pub 2013).

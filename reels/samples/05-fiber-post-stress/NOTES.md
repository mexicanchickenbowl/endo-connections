# 05 · Fiber vs metal post: where the stress goes (FEA style)

**Output:** `reels/out/05-fiber-post-stress.mp4` (22.0 s, 1080×1920, 30 fps) + poster `reels/out/05-fiber-post-stress.jpg` (t = 14.3 s)
**Files:** `index.html` (page shell), `geometry.js` (tooth geometry, crack paths, schematic stress fields), `reel.js` (mesh, rendering, timeline)

## Concept
The whole reel looks like a screen from finite-element software. It's a dark charcoal UI with a menu bar, toolbar, Geometry/Mesh/Setup/Results
tabs, a status chip, a docked property panel, a console log and a status bar. All text is IBM Plex Mono. It shows a **split-screen
comparison** of the *same* crowned, post-restored maxillary central incisor: a 2-D labio-palatal section with the same mesh in both panels.
The only difference is the post: **A = prefabricated metal post**, **B = glass-fiber post**.

The reel walks through an FEA-style workflow, and each step carries one idea:
1. **Geometry → mesh** (0–1.2 s): the outline draws itself, triangular elements fill in from crown to apex, and a muted element-quality
   histogram (computed from the actual mesh) fills in at the same time.
2. **Materials** (0.6–5.4 s): the regions take on material colours (crown, core, post, dentin, GP, bone; labelled on panel A) and an
   elastic-modulus bar chart shows the stiffness mismatch with dentin. This is the *why*.
3. **Load case 1 · 100 N @ 45°** (4.7–10.9 s): an oblique palatal load arrow pulses and a banded turbo **von Mises (schematic, relative)**
   field is *revealed* in the **dentin only** (other bodies keep their material colour, slightly dimmed = "not plotted"). MX probes mark
   the true maximum of each plotted field (computed from the field). Metal: along the post–dentin interface. Fiber: cervical dentin.
4. **Load case 2 · lab-style overload (illustrative)** (10.8–16.8 s): the cracks grow one panel at a time with FEA-style element erosion.
   Metal: oblique **root fracture** from the palatal cervical side, past the post, exiting labially **below the crest**. Fiber:
   **core / cervical** fracture at the core–dentin level, **above the crest**. Labelled as lab outcomes, then a caveat: clinical studies
   show similar root-fracture rates. At 15.4 s the dentin collar (ferrule) is outlined in amber on both teeth and labelled.
5. **Result summary dialog** (16.7–21.5 s), in two beats: *A post retains the core. It doesn't reinforce the root.* then
   *Ferrule + remaining dentin matter most.* while the ferrule collar of the mini tooth fills amber. Fine print: *With a 1.5–2 mm ferrule,
   post type matters less. Clinical evidence: limited.*
6. **Outro** (21.5–21.95 s): the frame dissolves into the exact first frame (empty viewports), so the loop is seamless.

## Storyboard / timings (s)
| t | Viewports | Dock (bottom panel) | Chip |
|---|---|---|---|
| 0.0 | title, subtitle, chip, empty panels, "vs" all fully visible (hook at frame 0) | MESH · element quality (empty axis, n = 0) | LOAD CASE 1 · 100 N @ 45° (grey dot = not applied yet) |
| 0–0.6 / 0.1–1.0 | outlines draw on / mesh builds crown→apex | histogram grows (single muted colour), n live (= status-bar count) | |
| 0.6–1.2 | material colours fade in; labels on panel A 0.7–3.6 | | |
| 1.2–5.4 | | Elastic modulus E (GPa, approx.) chart; rows 1.3–2.6; caption "Metal/zirconia ≈ 4–11× dentin" fully visible 2.7–5.1 (2.4 s; readSecs 2.0) | |
| 4.7–5.45 | load arrows ("100 N") + colour bar build | | dot turns magenta |
| 5.4–6.9 | stress field revealed in dentin (soft front from the load point) | | |
| 6.0 / 6.9 → 10.9 | MX A pops 6.2, MX B pops 7.1 | RESULTS · von Mises in dentin: METAL "along the post–dentin interface" (full 6.35–10.55), FIBER "cervical dentin, like natural teeth" (full 7.25–10.55; readSecs 2.6 each) | |
| 10.8–11.3 | load ramps (label → OVERLOAD) | | LOAD CASE 2 · lab-style overload (illustrative) |
| 11.0–11.9 | metal crack; "below crest" tag 11.7; footer "illustrative crack" | FAILURE MODE · lab tests: ✕ ROOT FRACTURE / often non-restorable (11.7) | |
| 11.9–12.8 | fiber crack; "above crest" tag 12.6 | ✓ CORE / CERVICAL / often restorable (12.6) | |
| 13.2–16.8 | | "Caveat — clinical studies: root-fracture rates similar" (full 13.5–16.5 = 3.0 s; readSecs 2.92) | |
| 15.4–16.0 | ferrule collar outlined amber on both panels, "ferrule" label (panel A) | | |
| 16.7–21.5 | viewports dim; dialog line 1 (full 17.15–21.5 = 4.35 s; readSecs 3.83), line 2 + collar fill (full 18.45–21.5 = 3.05 s; readSecs 2.62) | SUMMARY: schematic disclaimer, "Real FEA differences are modest; studies disagree", "Full sources in the caption" | |
| 21.5–21.95 | dissolve to frame 0 | | back to LOAD CASE 1 |

The handle `@natebrooksendo` sits in the dock header, right-aligned at x = 940 (inside the safe area, clear of the Reels button column).
Poster frame: t = 14.3 s (both cracks, failure modes and caveat on screen).

## On-screen claims and sources
All PubMed-indexed. I read the abstracts myself, and the full text where it says "(full text)".

| On-screen text | Source(s) | Notes |
|---|---|---|
| **Load case 100 N @ 45°**, palatal surface (chip + console) | Nokar S et al., *J Dent (Tehran)* 2018;15:69-78, PMID 29971124 (full text); Asmussen E et al., *J Prosthet Dent* 2005;94:321-9, PMID 16198168; Yang B et al., *Int Dent J* 2025;75:100918, PMID 40684680 | A common FEA load case for incisors. A model setting, not a finding. |
| **Dentin E 18–25 GPa** | Kinney JH et al., *Crit Rev Oral Biol Med* 2003;14:13-29, PMID 12764017 (Young's modulus 20–25 GPa); Nokar 2018 Table 1 (FEA input 18.6 GPa) | The brief said "15–20". |
| **Fiber post 20–40 GPa (axial)** | Nokar 2018 Table 1 (quartz 18.7, carbon 21, glass fiber 40 GPa FEA inputs); Badami V et al., *Cureus* 2022, PMID 36324349; Lassila LV et al., *Dent Mater* 2004, PMID 14698771 | Fiber posts are anisotropic: these values are along the fibre axis; the transverse modulus is much lower and several FEA studies model them as orthotropic (e.g. Coelho 2009, PMID 20019417). The reel's model is isotropic (simplification). |
| **Gold alloy ~90, titanium ~110, steel/zirconia ~200 GPa** | Nokar 2018 Table 1 (gold 88, Ti 112, steel 200, zirconia 200); Badami 2022 (Ti 115; steel/Ni-Cr/zirconia ~200) | These are bulk material Young's moduli used as FEA inputs (footer "Typical FEA input values: Kinney 2003 · Nokar 2018"). Measured *flexural* moduli of whole posts are lower and geometry-dependent: Plotino G et al., *Dent Mater* 2007, PMID 17116326 measured dentin 17.5, FRC posts from 24.4 and stainless-steel posts 108.6 GPa in 3-point bending (so Plotino is no longer cited on the chart). |
| **"Metal/zirconia ≈ 4–11× dentin"** | Computed from the chart values: 90/25 ≈ 3.6 → 200/18 ≈ 11 | |
| **RESULTS · von Mises in dentin. METAL: "along the post–dentin interface"** (MX on the palatal post–dentin interface, cervical/middle third, y ≈ 12.7 mm) | Pegoretti A et al., *Biomaterials* 2002, PMID 12059016 (gold cast post: "greatest stress concentration at the post-dentin interface"); Adanir N, Belli S, *Eur J Dent* 2007;1:67-71, PMID 19212479 (labio-lingual incisor section, 45° load: steel post "greatest stress concentration at the post/dentin interface", followed by Ti, gold); Lanza A et al., *Dent Mater* 2005, PMID 16026666 (very stiff post creates tension/shear zones in dentin and at the interfaces) | No apical hotspot any more: Sorrentino R et al., *Dent Mater* 2007, PMID 17070903 found minimum stress at the apical post and root apex; Nokar 2018 found the concentrations at the cervical root and the cervical/middle-third junction. Stiff posts also concentrate stress *in the post itself* (Coelho 2009, PMID 20019417); the post is not plotted here (result scoped to dentin), which avoids the "red post = post soaks it up" misreading. |
| **FIBER: "cervical dentin, like natural teeth"** (MX at palatal cervical dentin) | Pegoretti 2002 (glass-fibre post: field "quite similar to that of the natural tooth" except force concentration at the cervical margin); Adanir & Belli 2007 (post with modulus closest to dentin: highest stress at the cervical third); Nokar 2018 (fiber posts: higher concentration between the middle and cervical thirds) | Cervical dentin shows a high band in *both* panels (all FEA models do), just the dominant peak differs. |
| **"Schematic, not a solve · relative scale, contrast exaggerated"**; colour bar "von Mises (schematic, relative)" | — | Real FEA differences in peak dentin stress between post materials are modest and the direction is disputed: Nokar 2018 (peak radicular-dentin stress 18.0–24.5 MPa across all 12 models; cast posts lowest); Asmussen 2005 (stresses decreased from glass fiber to titanium to zirconia). Summary dock: "Real FEA differences are modest; studies disagree." |
| **Crack tags "below crest" / "above crest"**; footer "illustrative crack"; chip "lab-style overload (illustrative)" | — | A linear static FEA cannot predict crack initiation or paths. The crack lines only illustrate the *location class* of lab failure modes. The metal crack now starts at the palatal cervical tension side (where FEA tensile peaks sit) and exits labially below the crest — it no longer implies an apical stress riser at the post tip. |
| **✕ ROOT FRACTURE: often non-restorable / ✓ CORE / CERVICAL: often restorable** (header "FAILURE MODE · lab tests") | Akkayan B, Gülmez T, *J Prosthet Dent* 2002, PMID 12011860; Fokkinga WA et al., *Int J Prosthodont* 2004, PMID 15382786 (FRC posts significantly more favourable / reparable failures than prefabricated and cast metal posts) | "often" and "lab tests" on purpose. |
| **"Cast posts often fail at higher loads, but less favourably."** (fine print) | Fokkinga 2004 (custom-cast post systems: higher failure loads than prefabricated FRC; FRC more favourable failure modes) | Prevents the "fiber is stronger" misreading. Sirimai 1999 reported similar (cast strongest, all failures tooth fractures) — not re-verified here, NOTES only. |
| **"Caveat — clinical studies: root-fracture rates similar"** | Figueiredo FE et al., *J Endod* 2015, PMID 25459568 (7 RCTs + 7 cohort studies: similar root-fracture incidence); Martins MD et al., *J Dent* 2021, PMID 34274439 (RR 0.78, 95% CI 0.41–1.49, NS; GRADE low); Wang X et al., *Quintessence Int* 2019, PMID 30600326 (4 RCTs ≥3 y, teeth with ≤2 walls: no difference in root fracture; fiber higher survival, RR 0.57, high-quality evidence for survival) | "trials" → "studies" (Figueiredo pooled RCTs and cohorts). Post type *within* a class also matters: Figueiredo found prefabricated metal posts had about twice the root-fracture incidence of cast posts, and carbon-fiber about twice that of glass-fiber — hence the panel labels "PREFAB METAL POST" / "GLASS-FIBER POST". |
| **"A post retains the core. It doesn't reinforce the root."** | Schwartz RS, Robbins JW, *J Endod* 2004, PMID 15107639; Guzy GE, Nicholls JI, *J Prosthet Dent* 1979, PMID 379307; Naumann M et al., *J Endod* 2018, PMID 29229457 | |
| **"Ferrule + remaining dentin matter most."** (amber collar on both panels + mini tooth) | Naumann 2018 ("Ferrule effect and maintaining cavity walls are the predominant factors"); Juloski J et al., *J Endod* 2012;38:11-9, PMID 22152612 | |
| **"With a 1.5–2 mm ferrule, post type matters less. Clinical evidence: limited."** | Juloski 2012 ("Providing an adequate ferrule lowers the impact of the post and core system…"); Yang 2025, PMID 40684680 ("A sufficiently large ferrule height can effectively compensate for the stress concentration of highly rigid materials"); Martins 2021 (GRADE low); Wang 2019 (high-quality only for survival) | The model itself has a ~1.7–2 mm ferrule, so this line ties the comparison to the takeaway. "low certainty" → "limited" because certainty is not uniformly low across outcomes (Wang 2019). |
| Dock: **"Stress maps: schematic pattern, not a solve."** / "Full sources in the caption." | — | Honesty disclaimer; full source list below and in the IG caption. |

### Residual gutta-percha (geometry, not text)
The post now ends flat directly on the GP (no gap), and **~4.6 mm of GP** remains (post end 18.3 mm, GP to 22.9 mm, apex 23.5 mm).
Nixon C et al., *Todays FDA* 1991, PMID 1931298 (3 mm leaked significantly more than 4–5 mm; 6–7 mm best); Hiltner RS et al., *J Endod*
1992, PMID 9796515 (no leakage differences between removal methods when 4 mm remained). Residual GP ≥ 4–5 mm is the usual recommendation.

### Real controversy (why the reel shows *where*, not *how much*)
The FEA literature is **not unanimous on stress magnitude**. Nokar 2018 found cast metal posts gave *lower* peak dentin stress than FRC
posts; Asmussen 2005 found stresses *decreased* from glass fiber to titanium to zirconia. Others (Pegoretti 2002; Adanir & Belli 2007;
Barjau-Escribano 2006, PMID 16536193; most of the 22 studies in Badami 2022) favour fiber posts. Results depend on crown and core
materials, ferrule, bonding, 2-D vs 3-D modelling and load. So the reel shows the commonly reported **location pattern**, uses an
unnumbered relative colour bar, says "contrast exaggerated", and states that real differences are modest and studies disagree.
Von Mises also shows *where* stress concentrates, not whether it is tensile or compressive (tension drives fracture in brittle dentin,
Nokar 2018 discussion) — kept in NOTES only to limit on-screen text.

## What is schematic / not to scale
- **The stress fields are not FEA output.** They are analytic fields (`GEO.field()` in `geometry.js`): a cantilever-bending term that peaks
  near the alveolar crest at the outer surfaces, plus material-specific terms (metal: post–dentin interface band centred at y ≈ 12.8 mm;
  fiber: cervical hotspots) shaped after the patterns cited above. Only the dentin result is plotted. The MX probes sit at the computed
  maximum of each plotted field. The "flood" is a **reveal** of a static result from the load point, not wave propagation.
- **The geometry is a stylised 2-D labio-palatal incisor section**: ~23.5 mm long, crown ~10.5 mm, post 5.0–18.3 mm (flat end on the GP),
  ~4.6 mm residual GP, ferrule ~1.7–2 mm, crest ~2 mm below the CEJ. Each viewport says "2-D · not to scale". Materials are modelled as
  linear-elastic and isotropic (fiber posts are really orthotropic).
- **The mesh is real but meaningless**: a variable-density Poisson-disk + Delaunay triangulation (d3.Delaunay). Counts and the quality
  histogram are computed from it, but no solve runs on it. The fake "solver" progress beat was removed.
- **The crack paths are illustrative** (in-viewport footer "illustrative crack" during the failure beat).
- **The overload ramp is visual.** No failure loads are shown; the fine print only says cast posts often fail at higher loads.

## Design rationale
- **Style:** an engineering-software pastiche (original UI, no real product branding). Charcoal panels, 1 mm grid, banded **turbo** contour
  (12 bands), element edges over the field, black outlines, axes triad, fixed-support symbols on the bone, MX probe flags, status bar.
  Magenta = loads (not in the turbo map); amber = ferrule / takeaway; red ✕ vs teal ✓ (drawn icons, not glyphs) for failure modes so the
  pair also separates for deuteranopes.
- **Result scoped to dentin** (as FEA tools do when a result is plotted on one body), so MX in each panel is the visibly hottest dentin and
  the post itself never reads as "the red thing".
- **One focal point at a time:** cracks and their failure-mode columns are staggered (metal first, then fiber); MX flags pop with their
  caption; the dock title is tied to its body's fade; the chart replaces the old solver beat.
- **Text load cut:** chip has only two states, no solver text, short captions, 3-line end dock instead of a 7-line source list.
- **Legibility:** captions ≥ 36 px, labels ≥ 30 px (material labels 30, chart 32, crack tags 32, MX 30, MAX/MIN 28, dock titles 30,
  "ferrule" 32); only fine print is 22–24 px. Readable text inside x 64–1016 / y 230–1580 and left of x 960 below y 1100 (checked with
  `--safe`). Hook title and poster inside the 3:4 crop.
- **Loop:** title/chip/panels fully drawn at frame 0; the last 0.45 s dissolves into a cached copy of frame 0 (first and last frames are
  pixel-identical).
- **Deterministic:** mesh `Kit.rng(505)`, textures `Kit.noise2`, everything set from `t` in `render(t)`; one full-frame canvas.

## Change log
- v1: first build: geometry, mesh, fields, flood, cracks, chart, captions, dialog.
- v2: mesh clipped to the viewports (bone mesh was bleeding past the panel edges). Removed the "GPa" label that overlapped the handle. Moved
  the "bone" label off the axes triad. Moved "2-D · not to scale" out of the Reels button column. Made the cracks bolder (black gap, eroded
  elements, white edge, widening). Re-placed the crack tags as two-line boxes that no longer cover the cracks. Blunted the incisal edge and
  smoothed the palatal CEJ. Refined the mesh (~1.4k elements).
- v3: filled the empty dock moments with an element-quality histogram (during meshing) and a solver progress bar (before results). Made the
  dock crossfades sequential, so text never ghosts over text. Re-timed captions and the dialog to meet `Kit.readSecs`. Changed the chart
  footer to "~4–11×" so it holds across the dentin 18–25 GPa range. Added fiber texture to the fiber post, a bigger mini tooth with a
  ferrule bracket, and a gentle glow on the ferrule.
- v4 (review round): see "Review changes" below.
- Final QA (fresh-eyes pass): (1) the in-viewport footer "illustrative crack path" (23 chars) ran to x ≈ 1004 in panel B, i.e. into the
  Reels button column (x > 960, y > 1100), so "path" would sit under the like/comment buttons; shortened to "illustrative crack"
  (18 chars, same length as "2-D · not to scale", ends x ≈ 938) in both panels. (2) The panel-A "ferrule" label box (x 73–221) peeked
  out 11 px left of the result dialog (x ≥ 84) from 16.7 s until the outro; it now fades out with the dialog (16.7–17.1 s). Science re-checked
  against the abstracts (Figueiredo 2015, Martins 2021, Wang 2019, Fokkinga 2004, Akkayan 2002, Pegoretti 2002, Adanir & Belli 2007,
  Nokar 2018, Kinney 2003, Juloski 2012, Naumann 2018, Schwartz & Robbins 2004): no on-screen claim changed. Video re-rendered (22.0 s,
  660 frames), poster unchanged at t = 14.3 s. Gallery metadata in `meta.json`.

## Review changes (v4, after independent science + design review)
Science
- **MX / apical hotspot (must):** removed the apical dentin hotspot at the metal post tip (0.50 G term → 0.08; 0.14 term deleted). The metal
  field now peaks in a band along the post–dentin interface (cervical/middle third), the cervical bending term was raised in panel A
  (0.50 → 0.70) so cervical dentin reads high in both panels, and MX is computed as the true maximum of each plotted field (A: palatal
  post–dentin interface at y ≈ 12.7 mm; B: palatal cervical dentin). Captions now "along the post–dentin interface" / "cervical dentin, like
  natural teeth"; source line "Patterns after Pegoretti 2002 · Adanir & Belli 2007 · Nokar 2018".
- **Shared colour scale:** colour bar retitled "von Mises (schematic, relative)"; results fine print "Schematic, not a solve · relative
  scale, contrast exaggerated"; summary dock "Real FEA differences are modest; studies disagree."
- **Chart sources:** footer now "Typical FEA input values: Kinney 2003 · Nokar 2018"; Plotino's measured flexural values (steel ≈ 109 GPa)
  kept in NOTES only.
- **GP continuity:** post end is now near-flat and sits directly on the GP (GP top edge = post end cap; no dentin band/gap, also in the
  mini tooth); residual GP ~4.6 mm (post end 18.3, GP 18.1–22.9 mm). Metal crack start moved accordingly.
- **Solver theatre removed:** no "Solving [K]{u} = {F}" / progress bar; console reads "results (dentin): SCHEMATIC pattern, not a solve".
- **Crack honesty:** chip "LOAD CASE 2 · lab-style overload (illustrative)"; in-viewport footer "illustrative crack path"; metal crack now
  starts at the palatal cervical tension side and exits labially below the crest (no apical stress-riser story).
- **Ferrule line:** dialog fine print "With a 1.5–2 mm ferrule, post type matters less. Clinical evidence: limited." (Juloski 2012; Yang 2025).
- Nits applied: "clinical studies" (not trials); "limited" (not low certainty); panels "A · PREFAB METAL POST" / "B · GLASS-FIBER POST";
  dock title "Elastic modulus E (GPa, approx.)" and "(axial)" after the fiber value; "below/above crest"; Nokar and Adanir & Belli on screen;
  failure-load fine print "Cast posts often fail at higher loads, but less favourably." (Fokkinga 2004). Flood described as a reveal and the
  von Mises tension/compression caveat recorded here (not on screen, to limit text).

Design
- **Chart timing (must):** caption shortened to "Metal/zirconia ≈ 4–11× dentin" (36 px) and fully visible 2.7–5.1 s; solver beat dropped;
  chart runs 1.2–5.4 s; material labels moved earlier (0.7–3.6 s) so they don't compete with the chart caption.
- **Results scoped to dentin:** post/crown/core/GP keep their material colour (dimmed ×0.78 = "not plotted"); dock title "RESULTS · von
  Mises in dentin"; MX = visible maximum in each panel.
- **Ferrule shown before told:** amber outline of the dentin collar on both panels at 15.4 s with a 32 px "ferrule" label; dialog
  restructured (text column ≤ 600 px, mini tooth ×17 in its own column, "ferrule" 32 px) and staggered: line 1 at 16.75 s, line 2 at 18.1 s
  with the collar filling amber in sync.
- **Text load:** chip frozen to two states; solver text removed; captions shortened; end dock 3 short lines instead of 7 source lines.
- **Sizes:** material labels 30 px, chart labels/values 32 px (bars start x 372, k 2.1, "~200" ends x ≈ 881), crack tags 32 px in 124×82
  boxes, fail-band sub-lines 36 px, MAX/MIN 28 px, dock titles 30 px, "100 N"/"OVERLOAD" 30 px, MX 30 px, dialog title 30 px.
- **Loop:** title/subtitle/"vs"/dock at full alpha from frame 0; outlines start at t = 0; 21.5–21.95 s dissolve into a cached frame 0 —
  first and last frames are pixel-identical (checked).
- **Load label:** "F ↑↑" replaced by "OVERLOAD" (no arrow glyphs), anchored up-left of the arrow tail and not wobbling with the pulse.
- **Hook → money shot:** histogram drawn in one muted cyan; mesh 0.1–1.0 s, materials 0.6–1.2 s; load at 4.7 s, field reveal 5.4 s.
- **Crack climax staggered:** metal crack 11.0–11.9 s + its tag/column at 11.7 s; fiber crack 11.9–12.8 s + tag/column at 12.6 s; caveat
  13.2 s.
- **Caption timing:** METAL caption 6.0–10.9 s, FIBER 6.9–10.9 s (staggered, each with its MX pop).
- Nits applied: live element/node counts shared by histogram and status bar (chip no longer shows a count); tabs Geometry → Mesh → Setup →
  Results in order; dock titles tied to their body fade; crack gap thinned (4–7 px, 8 px halo) with 1 px red edges on eroded elements;
  red ✕ / teal ✓ drawn icons and teal (#3ad0d8) instead of green.
- Not applied: enlarging the tooth (S 26.5 → 28.5) with a 290 px dock — the dock needs its 340 px for the 32 px chart rows + 36 px caption
  and for the two-column failure band + caveat; at S 28.5 the side tags would no longer fit inside the 432 px panels.

## IG caption source list
Kinney 2003 (PMID 12764017) · Nokar 2018 (29971124) · Plotino 2007 (17116326) · Pegoretti 2002 (12059016) · Adanir & Belli 2007 (19212479) ·
Lanza 2005 (16026666) · Sorrentino 2007 (17070903) · Coelho 2009 (20019417) · Asmussen 2005 (16198168) · Badami 2022 (36324349) ·
Akkayan & Gülmez 2002 (12011860) · Fokkinga 2004 (15382786) · Figueiredo 2015 (25459568) · Martins 2021 (34274439) · Wang 2019 (30600326) ·
Schwartz & Robbins 2004 (15107639) · Guzy & Nicholls 1979 (379307) · Naumann 2018 (29229457) · Juloski 2012 (22152612) · Yang 2025 (40684680) ·
Nixon 1991 (1931298) · Hiltner 1992 (9796515)

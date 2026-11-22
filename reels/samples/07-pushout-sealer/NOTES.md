# 07 · Push-out bond strength: what the MPa measures

**Style:** a lab-instrument HUD. The phone frame is the control screen of a universal testing machine: dark graphite
panels with corner brackets, JetBrains Mono everywhere, amber for load and data, teal for geometry and status, and a
sparing red for DEBOND. A status strip shows `UTM-07 · PUSH-OUT · ROOT FILLING/DENTIN`, with a state chip that steps through
READY → PREP → MOUNT → JOG → RUN → DEBOND → STOP → INSPECT → CALC → DONE. Below it sit step tabs (01 SLICE … 05 CALC),
a camera/section viewport with a caption bar, three live readouts (FORCE N · DISPL. mm · RATE mm/min) and a
gridded force–displacement plot. Decorative machine telemetry and a test timeline sit under the Reels UI (top and
bottom).

**Technique:** a procedural test simulation on one 2D canvas, deterministic in `render(t)`. The specimen is rendered
once in setup as macro-photo-style textures: a root with cylindrical shading and streaks, and a slice face with
radial dentinal tubules, saw marks, a cementum rim, a sealer ring, a GP core and a wet sheen. These textures are
then cut, flipped and re-projected in perspective (`drawDisk`: elevation angle plus an extruded side wall). The load
is a toy force–displacement model, F(d), driven by the crosshead rate. The plot, readouts, plunger travel,
interface glow and debond all read from that one function.

**Duration:** 22.0 s · 1080×1920 · 30 fps · silent · `reels/out/07-pushout-sealer.mp4` (poster at t = 9.3 s, just
after debond)

## Concept
A filled root is cut into a 1 mm slice. The slice flips up into a macro view (dentin, sealer, GP core labelled), then
tumbles forward onto its coronal face ("FLIPPED: APICAL UP") and becomes a schematic **section A–A** on a support jig.
A plunger narrower than the canal comes down onto the **apical** face and pushes toward the wider coronal end. The
test runs at 0.50 mm/min (shown 10× faster, `SIM ×10`, with the real test time in the RATE box). As it runs, force
builds and the interfaces glow with shear, brightest near the loaded and supported edges. The curve draws live. At
peak, a crack runs down both walls, the force drops, **DEBOND** flags and the plot and FORCE brackets flash red once.
The plug then moves only as far as the crosshead (slip drawn ×4, labelled "slip exaggerated"). The plunger lifts off
and friction holds the partly extruded plug. The exposed wall shows **sealer left on wall**. Three stereomicroscope
tiles then compare **ADHESIVE** (sealer–dentin *or* sealer–GP, a split tile), **COHESIVE** (within sealer, core or
dentin) and **MIXED**. This specimen is tagged MIXED. Next, **τ = F / A** is worked through: the peak force flies
from the plot into the formula, A is the nominal canal-wall (frustum) area from the apical radius r and coronal radius
R, and the result is **τ = 2.94 MPa (1 N/mm² = 1 MPa)**. The result box morphs into the report card: **2.94 MPa ·
illustrative**, then "Mean shear stress to dislodge the filling: adhesion + friction + interlock", then **A LAB NUMBER.
Compare within a study, not across studies.** and **Clinical relevance: unproven.**

## Storyboard (times in s)
| t | Caption / text | Visuals |
|---|---|---|
| 0.00–1.66 | Title **PUSH-OUT TEST** + **What does the MPa actually measure?** at full opacity from frame 0 (persistent header, identical on every frame) · "SYSTEM READY · SPECIMEN LOADED" (decorative) | HUD panels boot (0–0.6). The root fades in and a teal scan line reveals the filled canal (0.35–1.5). Label "filled canal / sealer + gutta-percha" (1.0–2.9). Plot shows a dashed ghost of the rising curve, a pulsing "? N" where the peak will be, and **PEAK FORCE → ? MPa** |
| 1.78–4.42 | **▸ 1 mm slice of filled root** | Root slides left. Cut planes sweep (2.0–2.75). "1 mm" dimension. Pieces separate (2.85). The slice lifts into a macro 3/4 view (3.1–4.0). DENTIN / SEALER / GP CORE leaders and a "1 mm" wall dimension (3.9–4.78). Root pieces dim to 15 % so the labels stand clear |
| 4.66–7.60 | **▸ Push apical → coronal (toward wider end)** | Slice tumbles forward through face-on to edge-on, coronal face down (4.78–5.5). Tag **FLIPPED: APICAL UP** (4.95–7.45). Cross-fade to SECTION A–A. Jig rises. Legend, APICAL/CORONAL labels, SUPPORT JIG. Plunger jogs down (5.75–6.75, status JOG). PLUNGER "Ø < canal Ø" (6.3–8.9, appears once the tip has passed its leader point) |
| 6.80 | | Contact, status RUN, amber `SIM ×10` chip |
| 7.84–10.88 | **▸ Force climbs… then drops at debond** | Live FORCE / DISPL. readouts, "real t" in the RATE box. Curve draws with a crosshair over the ghost. F arrow. Shear glow, edge-weighted. GP indents under the plunger |
| 8.96 | | **Peak 8.03 N** (illustrative): crack, DEBOND tag, status DEBOND, plot + FORCE brackets flash red (0.3 s), "F max 8.03 N", "debond", "failure load = peak · real curves vary" |
| 8.96–11.05 | | Plug moves with the crosshead (slip ×4, "slip exaggerated") and protrudes past the coronal face. Crosshead stops at 9.92 (STOP). Plunger retracts. Plug stays, held by friction. **sealer left on wall** leader (9.41–11.05) |
| 11.24–13.50 | **▸ Where did it break?** | Three STEREO 40× tiles (schematic). Cracks open in turn (11.5–12.6). ADHESIVE split: sealer–dentin / "or" / sealer–GP. COHESIVE "within sealer, core or dentin". MIXED "both patterns", highlighted, with a **THIS TEST** chip on its border (12.5) |
| 13.86–16.86 | **▸ Peak force ÷ canal-wall area** | Frustum (apical r on top, coronal R on the bottom, h; "A = canal-wall area (nominal)"; "illustrative values · taper exaggerated"). τ = F / A, then the frustum area formula. 8.03 N flies from the plot peak and lands as the F value (15.0). r 0.42 · R 0.45 mm (radii) · h 1.00 mm · Ø 0.84→0.90. A = 2.73 mm² and **τ = 2.94 MPa** appear as final values with no count-up. "1 N/mm² = 1 MPa". Settled by 16.25 |
| 17.00–22.00 | Report card: **2.94 MPa** · *illustrative* · τ = F / A · one slice, one lab → Mean shear stress to dislodge the filling: adhesion + friction + interlock → **A LAB NUMBER.** → **Compare within a study, / not across studies.** → **Clinical relevance: unproven.** / no link to seal or outcomes shown → fine print + sources | Calc fades out (17.0–17.12) while the τ box morphs into the card number (17.0–17.4). HUD dims under the card. Fully revealed by 18.3 and held to 21.8. 21.8–22.0: card, overlay and panels ease back to the frame-0 look (header only), so the loop is seamless |

**Reading-time check (`Kit.readSecs`):** captions are fully visible for 2.64 / 2.94 / 2.96 / 2.34 / 3.20 s against
2.62 / 2.92 / 2.62 / 2.01 / 2.32 s needed. Card: "A LAB NUMBER. Compare within a study, not across studies." is fully
visible for 3.85 s (3.83 s needed). The "mean shear stress" line is fully visible for 4.2 s (10 words + 2 "+" → 4.44 s
counting symbols as words, 3.83 s without). "Clinical relevance: unproven." is fully visible for 3.65 s. Captions fade
sequentially and never overlap.

## On-screen claims and sources
(Checked via PubMed. PMIDs and DOIs below.)

1. **Thin-slice push-out, 1 mm slices.** 1 mm (±0.1) horizontal sections are the most common format:
   - Pane ES, Palamara JEA, Messer HH. *Critical evaluation of the push-out test for root canal filling materials.*
     J Endod 2013;39(5):669-73. PMID 23611388. doi:10.1016/j.joen.2012.12.032 ("One-millimeter sections")
   - Nagas E et al. *Dentin moisture conditions affect the adhesion of root canal sealers.* J Endod 2012;38(2):240-4.
     PMID 22244645. doi:10.1016/j.joen.2011.09.027 (1-mm slices, 1 mm/min)
   - Sagsen B et al. *Push-out bond strength of two new calcium silicate-based endodontic sealers to root canal
     dentine.* Int Endod J 2011;44(12):1088-91. PMID 21895700. doi:10.1111/j.1365-2591.2011.01925.x (1 mm ± 0.1;
     plungers of 1.0 / 0.5 / 0.3 mm for coronal / middle / apical; 1 mm/min)
   - Al-Haddad AY, Kutty MG, Che Ab Aziz ZA. *Push-out bond strength of experimental apatite calcium phosphate based
     coated gutta-percha.* Int J Biomater 2018:1731857. PMID 30154852. doi:10.1155/2018/1731857 (1 ± 0.1 mm)
   - The brief said "1–2 mm". 1 mm is shown because it is the dominant choice. Thickness varies across studies and
     affects results (Collares 2016, Brichko 2018 below).
2. **"Push apical → coronal (toward wider end)", "FLIPPED: APICAL UP" and "Ø < canal Ø".**
   - Deniz Sungur D et al. *Push-out bond strength and dentinal tubule penetration of different root canal sealers
     used with coated core materials.* Restor Dent Endod 2016;41(2):114-20. PMID 27200279.
     doi:10.5395/rde.2016.41.2.114 (full text: 0.76 mm plunger "sized to contact only the core material". Force
     "applied from apical to coronal direction because of the convergence of the root canal")
   - Al-Haddad 2018 (full text: 0.8 mm plunger. The apical surface faced the plunger, which contacted the filling
     only)
   - Pane 2013: a punch at 90 % of canal diameter had no effect, but 50–60 % gave lower push-out strength
   - Chen WP et al. *Limitations of push-out test in bond strength measurement.* J Endod 2013;39(2):283-7.
     PMID 23321247. doi:10.1016/j.joen.2012.11.002 (FEA: interfacial stresses mostly unaffected when the
     pin/specimen diameter ratio is < 0.85 and thickness/diameter is > 0.6)
   - On screen the plunger is 0.70 mm against a 0.84 mm apical canal diameter (ratio 0.83). The section drawing
     uses about 0.81.
3. **RATE 0.50 mm/min.** Al-Haddad 2018 used 0.5 mm/min. Nagas 2012, Sagsen 2011 and Deniz Sungur 2016 used
   1 mm/min, so 0.5–1 mm/min is typical, as the brief said. Load velocity significantly affects results (Collares
   2016). `SIM ×10` is honest about the time-lapse. The RATE box shows real elapsed test time: d / (0.5 mm/min), so
   0.26 mm = 31.2 s.
4. **Force–displacement curve and "debond" at the sharp drop.** Al-Haddad 2018 recorded the failure load "at the point
   where a sudden sharp drop of the stress-strain curve was displayed". The curve shape (toe, softening rise,
   micro-crack hiccup, drop, low frictional tail) is a **toy model**, labelled "toy model · values illustrative".
   Pane 2013 notes that the soft GP core deforms plastically under load (the GP indents under the plunger on screen)
   and that load profiles vary with orientation.
5. **Failure modes.** Al-Haddad 2018 (full text) defines adhesive failure (at the sealer/dentin or sealer/core
   interface), cohesive failure (within the filling material) and mixed. Some authors also count cohesive failure
   within dentin or core. On screen, ADHESIVE is a split tile reading "sealer–dentin or sealer–GP", and COHESIVE reads
   "within sealer, core or dentin". With conventional GP, the sealer–core interface is often the weak link:
   - Gesi A et al. *Interfacial strength of Resilon and gutta-percha to intraradicular dentin.* J Endod
     2005;31(11):809-13. PMID 16249724. doi:10.1097/01.don.0000158230.15853.b7 (GP/AH Plus slices "failed exclusively
     along the gutta-percha/sealer interface")
   - Deniz Sungur 2016 (sealers do not bond to GP)
   Supporting studies:
   - Jainaen A, Palamara JEA, Messer HH. *Push-out bond strengths of the dentine-sealer interface with and without a
     main cone.* Int Endod J 2007;40(11):882-90. PMID 17877721. doi:10.1111/j.1365-2591.2007.01308.x (thin sealer films
     failed cohesively, bulk sealer mostly adhesively)
   - Ungor M, Onay EO, Orucoglu H. *Push-out bond strengths: the Epiphany-Resilon endodontic obturation system compared
     with different pairings of Epiphany, Resilon, AH Plus and gutta-percha.* Int Endod J 2006;39(8):643-7.
     PMID 16872459. doi:10.1111/j.1365-2591.2006.01132.x (stereomicroscope at 25×; failure mainly adhesive to dentine)
   - "STEREO 40×" is a generic label. Studies use roughly 25–56×. The tiles are **schematic**. "THIS TEST: MIXED"
     belongs to the illustrative specimen and matches the sealer remnants left on the wall in the section view.
6. **τ = F / A, with A = π(R + r)√((R − r)² + h²).** τ is used because push-out strength is a nominal interfacial
   *shear* stress (σ usually means normal stress). The unit note "1 N/mm² = 1 MPa" is shown. This is the lateral surface area of a conical frustum (pure
   geometry), with R and r the coronal and apical canal radii and h the slice thickness. **The brief's formula is
   correct.** The literature also uses simpler approximations: 2πrh, a cylinder (Deniz Sungur 2016), and mean
   circumference × thickness (Al-Haddad 2018, after Sly et al.). That variety is why "area formula" appears in the
   takeaway fine print.
7. **Live numbers (illustrative):** R 0.45, r 0.42, h 1.00 mm gives A = π × 0.87 × √(0.0009 + 1) = **2.73 mm²**.
   F = 8.03 N gives τ = 8.03 / 2.734 = **2.94 MPa**. The geometry matches a 1 mm slice about 7.4–8.4 mm from the tip of
   a 40/.06 preparation (diameter 0.84 → 0.90 mm, R − r = 0.03 mm). The diagram exaggerates the taper and says so.
   The 2.94 MPa result sits within the range reported for sealer + GP push-out, which is itself very method
   dependent: epoxy 1.41–2.0 MPa (AH 26/GP, Deniz Sungur 2016; AH Plus/GP, Ungor 2006), calcium-silicate BC 4.65 MPa
   (EndoSequence BC sealer + conventional GP, Al-Haddad 2018), and 2.0 MPa with a main cone against 6.6 MPa for
   sealer alone (Jainaen 2007). It is labelled "illustrative" on the plot, the calc view, and directly under the
   number on the report card. The calc line reads "r 0.42 · R 0.45 mm (radii)" plus "Ø 0.84→0.90", with the
   frustum labelled apical r (top) and coronal R (bottom). That way the values are not misread as file-size
   diameters.
8. **"A LAB NUMBER. Compare within a study, not across studies."**
   - Brichko J, Burrow MF, Parashos P. *Design variability of the push-out bond test in endodontic research: a
     systematic review.* J Endod 2018;44(8):1237-45. PMID 29935874. doi:10.1016/j.joen.2018.05.003 ("considerable
     variation… resulting in a large range of reported values". No pooled comparison was possible)
   - Collares FM et al. *The influence of methodological variables on the push-out resistance to dislodgement of root
     filling materials: a meta-regression analysis.* Int Endod J 2016;49(9):836-49. PMID 26331627.
     doi:10.1111/iej.12539 (sealer, core, technique, slice thickness, storage time, load velocity and tooth portion
     all significantly influence MPa)
   - Pane 2013: "despite limitations, the push-out test may still be suitable for **ranking**" (i.e. within a study)
9. **"Clinical relevance: unproven." / "no link to seal or outcomes shown".** No clinical study links push-out MPa
   to seal or treatment outcome, and the direct lab evidence found none:
   - Moinzadeh AT et al. *The correlation between fluid transport and push-out strength in root canals filled with a
     methacrylate-based filling material.* Int Endod J 2015;48(2):193-8. PMID 24749656. doi:10.1111/iej.12300 (no
     significant correlation between dislocation resistance and fluid transport)
   - Background: Tay FR, Pashley DH. *Monoblocks in root canals: a hypothetical or a tangible goal.* J Endod
     2007;33(4):391-8. PMID 17368325. doi:10.1016/j.joen.2006.10.009 (monoblock controversy)
   "Unproven" replaces v1's "debated", which implied evidence on both sides.
10. **Fine print: "Slice thickness, root third, core material, plunger size, load speed, storage & area formula all
    shift the MPa."** Collares 2016 (core material, tooth portion, slice thickness, storage time and load velocity were
    all significant), Pane 2013 (punch size, core stiffness / plastic deformation), Chen 2013 (geometry, filler
    modulus). For the area formula, see item 6: a different A for the same F gives a different τ by definition.
12. **"Mean shear stress to dislodge the filling: adhesion + friction + interlock" and "A = canal-wall area
    (nominal)".** For a GP + sealer slice the push-out value is not pure sealer–dentin adhesion. It is the nominal
    average shear stress needed to dislodge the whole filling:
    - Collares 2016 deliberately calls it "push-out resistance to dislodgement"
    - Goracci C et al. *The contribution of friction to the dislocation resistance of bonded fiber posts.* J Endod
      2005;31(8):608-12. PMID 16044046. doi:10.1097/01.don.0000153841.23594.91 (thin-slice push-out of fiber posts;
      dislocation resistance "contributed largely by sliding friction")
    - Gesi 2005 (failure along the GP/sealer interface, not the dentin)
    - Pane 2013 (value depends on core stiffness and plastic deformation)
    - Chen 2013 and Soares CJ et al., Dent Mater 2008;24(10):1405-11, PMID 18420265, doi:10.1016/j.dental.2008.03.004
      (FEA: interfacial stress is not uniform, so F/A is a nominal mean). The shear glow is drawn brighter at the
      loaded and supported edges for this reason.
    - "Interlock" = micromechanical retention (sealer tags, wall irregularities). The line lists contributions the test
      cannot separate; it does not rank them. Nuance: tubule-tag depth has not correlated with push-out values in
      several studies (De-Deus G et al., Eur Endod J 2017;2(1):1-5, PMID 33403329, doi:10.5152/eej.2017.16059, AH Plus;
      Tedesco M et al., Braz Dent J 2019;30(6):555-62, PMID 31800749, doi:10.1590/0103-6440201902766; Deniz Sungur 2016:
      "tubule penetration has limited effect on bond strength"), so the share
      from interlock is uncertain and may be small.
13. **Post-debond behaviour.** In a displacement-controlled test the crosshead cannot jump. After the peak the plug moves
    only as far as the crosshead travels (0.08 mm past peak, drawn ×4 and labelled "slip exaggerated"). The plunger then
    lifts off, and the low friction tail on the curve (about 1–2 N, toy model) is what holds the partly extruded plug.
    Al-Haddad 2018 takes the failure load at the "sudden sharp drop … or complete dislodgement". The plot note "failure
    load = peak · real curves vary" covers GP fillings that yield plastically rather than drop cleanly (Pane 2013).
11. Decorative text (`UTM-07`, `LOAD CELL 500 N · CAL OK`, footer telemetry) describes a fictional generic machine.
    It is not a claim and not a real brand.

Background reading not shown on screen: Goracci C et al., Eur J Oral Sci 2004 (PMID 15279655): push-out was more
dependable than microtensile testing for luted posts. Rahimi M et al., J Endod 2009 (PMID 19084140): sealers behave
differently as thin and thick films.

## What is schematic or modelled (and flagged on screen)
- Section A–A: "SCHEMATIC · NOT TO SCALE". The canal is enlarged and its taper exaggerated (52 → 70 px radius over the
  slice). Plunger indentation is exaggerated. Post-debond slip is drawn ×4 and labelled "slip exaggerated".
- Force–displacement curve: "toy model · values illustrative". Peak 8.03 N at 0.18 mm, residual friction about
  1–2 N.
- Test speed: `SIM ×10` (real time shown separately).
- Failure-mode tiles: "SCHEMATIC". Calc: "illustrative values · taper exaggerated". Report: "illustrative".
- The macro slice is a procedural render, not a photograph. The canal is enlarged relative to the root.

## Design rationale
- **Instrument as narrator.** With no voice-over, the UI's own state (tabs, status chip, live readouts) carries the
  procedure, the way a real test screen would. The viewer reads "RUN → DEBOND → STOP" without any extra text.
- **One physical model drives everything.** Plot, readouts, plunger travel and interface glow all come from F(d), so
  the peak on the curve, the crack and the readout drop happen on the same frame. That makes "the MPa is just the peak
  of this curve" visible.
- **Colour semantics.** Amber means force or data (curve, F arrow, F value, τ). Teal means geometry and dimensions
  (cut planes, r / R / h, labels). Red is used only for failure. Material colours stay consistent across the macro,
  section and tile views (ivory dentin, gold sealer, salmon GP).
- **Honest payoff.** The biggest number in the reel (2.94 MPa) sits directly above "A LAB NUMBER." on purpose:
  precision on screen is not the same as transferability.
- Legibility: captions are 36 px, labels and HUD units 28–30 px, readouts 54 px, fine print 22–26 px. Everything that must be read
  sits inside x 64–1016 / y 244–1576, and the readouts and plot stop at x 950 to stay clear of the Reels button
  column.

## Change log
- v1: full build. QA pass 1 fixed the plot "N" label overlapping the header, the test-time text overlapping the
  displacement value (moved to the RATE box), the legend colliding with the plunger collet (made vertical), the DEBOND
  tag overlapping the slice (moved above), the frustum "h" label being clipped (diagram shifted right) and the "r"
  label touching the ellipse.
- QA pass 2: replaced the carrot-shaped root with a near-parallel root with a rounded apex. Centred the root during
  the hook, then slid it left. Clipped the canal overlay out of the saw gap. Gave the coronal piece an elliptical cut
  edge. Limited camera crop marks to the camera views.
- QA pass 3: made caption fades sequential (removes a double-caption frame at 4.85 s). Made the F arrow fade before
  DEBOND. Made the plug's post-debond slide and drop larger (a visible "pop-out"). Moved the LOAD/FAIL phase boundary
  to 10.9 s so the section finishes before the tiles enter.

## Review changes (independent science + design review)
Science:
- **What the MPa measures (must).** Status strip changed from SEALER/DENTIN to `ROOT FILLING/DENTIN`. Calc label is now
  "A = canal-wall area (nominal)". Caption 5 is now "Peak force ÷ canal-wall area". The report card adds "Mean shear
  stress to dislodge the filling: adhesion + friction + interlock" (30 px) under the number. Sources line: Collares
  2016 · Gesi 2005 · Pane 2013 · Brichko 2018 · Moinzadeh 2015.
- **Failure modes.** ADHESIVE is now a split tile (top: crack at sealer|dentin; "or"; bottom: crack at sealer|GP) with
  the sub-caption "sealer–dentin / or sealer–GP". COHESIVE is now "within sealer, / core or dentin".
- **Debond pop removed.** There is no 16 px jump and no gravity free-fall. The plug moves exactly with the crosshead
  (drawn ×4, "slip exaggerated") and protrudes past the coronal face. The plunger then retracts, the plug stays (held
  by friction), and the GP dent persists.
- **Radii.** The calc now reads "r 0.42 · R 0.45 mm (radii)" and "h 1.00 mm · Ø 0.84→0.90". The frustum labels say
  "apical" at r (top) and "coronal" at R (bottom). R was moved off the dashed back ellipse.
- **Clinical relevance** is now "unproven", with "no link to seal or outcomes shown" (Moinzadeh 2015 IEJ, PMID
  24749656).
- Nits: the fine print adds root third and core material. σ became τ, with "1 N/mm² = 1 MPa". There is no count-up:
  A and τ appear as final values only. "illustrative" now sits directly under the 150 px number. The slice visibly
  flips (tumbles forward onto its coronal face), with a FLIPPED: APICAL UP tag. Caption 2 is now "Push apical →
  coronal (toward wider end)" and is held past plunger contact. The plot adds "failure load = peak · real curves
  vary". The shear glow is edge-weighted (FEA non-uniformity). NOTES item 7 range corrected: epoxy 1.41–2.0 MPa,
  calcium-silicate BC 4.65 MPa.

Design:
- **HUD legibility (must).** Readouts are taller (RO.h 112). Labels and units are 28 px in txt2, and "DISPLACEMENT" is
  now "DISPL.". The value baseline is at y+92 and the plot was moved to y 1236 (axes 1300/1506). The plot title is 26
  px txt2, the axis units N/mm are 28 px txt2, "debond" is 30 px, the legend is 30 px with 24 px swatches, and the tabs
  are 30 px (inactive tabs in C.dim, not C.faint).
- **Retime.** The jog is shorter (5.75–6.75; contact at 6.8; all load times −0.6 s). The post-debond hold is longer
  (section exits at 11.05). The tiles leave at 13.55. Calc runs 13.68–17.0 and the card starts at 17.0. All captions
  and the key card lines meet `Kit.readSecs`.
- **Calc → card.** The calc fades out (0.12 s) before the card fills in, and the τ box morphs (rect + 50→150 px text)
  into the card number. There is no double exposure and nothing from the calc is left around the card. The card is
  taller (h 992) and the dim overlay is 0.88, so no plot tick labels peek out underneath.
- **Fly-in.** "F =" and "peak force" fade in first. The ghost value (drawn outside the viewport clip, so it visibly
  leaves the plot) fades over the last 10 % of its flight, and the amber value appears with a 1.15→1 pop as it lands.
  No double text.
- **Evidence for MIXED.** Remnant patches are 11 px with a 1.5 px #fff3d6 edge. The teal leader label "sealer left on
  wall" (30 px) shows 9.41–11.05 and points at the exposed left-wall patch.
- **Plot does work from frame 0.** It shows a dashed ghost of the rising curve, a pulsing "? N" peak marker and
  "PEAK FORCE → ? MPa" (30 px) until the real curve overwrites them at contact. "AWAITING TEST" was removed.
- **Loop.** The title, subtitle and status line are drawn at full opacity on every frame. Over 21.8–22.0 the card,
  overlay and all panels ease back to their t = 0 state (the stage light pool also boots with the HUD), so the last
  frame matches frame 0.
- **THIS TEST** is a 210×42 chip with 28 px text, centred on the MIXED tile's bottom border. The tiles are h 430 and
  their subtitles are at +366/+400.
- Nits: the macro "1 mm" label is clear of the root (pieces dim to 15 %). `SIM ×10` is a 24 px amber outlined chip.
  The RATE box shows "real t / 26.8 s" in txt2. The section dentin uses buildDisk-scale mottling with short, faint
  tubules (no wood grain). The plot and FORCE brackets flash red once at debond. The F arrow fades out before the
  DEBOND tag appears. The τ box pulse was reduced to 3 % so it stays inside the viewport.


## Final QA (fresh-eyes pass)
- Rendered 16 evenly spaced stills plus t = 0, 21.85, 21.95 and spot times (--safe). No tofu, NaN or clipped text.
  Everything that must be read stays inside the safe area. The readouts, plot and card stop at x 950, clear of the
  button column. The hook reads at t = 0, the card is held 18.3–21.8 and the loop returns to the header-only frame 0.
- Fixed: the PLUNGER / "Ø < canal Ø" leader faded in at 6.0 s while the jogging plunger tip was still above it, so the
  dot pointed at empty space (about 85 px below the tip at 6.2 s). The label now fades in over 6.3–6.5, after the tip
  has passed, and its tip is clamped to the shank (min(700, tipY − 12)). It is held to 8.6 (fade 8.6–8.9), so it is
  fully visible for 2.1 s, about Kit.readSecs (2.3 s for 5 tokens). It does not touch the F arrow or the DEBOND tag.
- Fixed: the FLIPPED: APICAL UP tag's left edge overlapped the plunger collet by about 4 px (6.3–7.45 s). The tag is
  now right-aligned to the status chip (x = 1004 − w, w = text + 60), which leaves a 6 px gap.
- Science: re-checked Collares 2016, Brichko 2018, Pane 2013, Moinzadeh 2015 and Goracci 2005 abstracts against the
  on-screen wording, and re-checked the arithmetic (A = 2.734 mm², τ = 8.03 / 2.734 = 2.94 MPa). Added a source and
  nuance note for "interlock" in item 12. No on-screen text changed.
- Left as is (cosmetic): during the card hold, the left edges of the FORCE readout and plot labels (x 80–95) show very
  faintly through the 0.88 overlay. The 24 px "apical/coronal" frustum labels are secondary: the section view and
  "(radii)" line carry the meaning.
- Video re-rendered once at the end. Poster stays at t = 9.3 s (DEBOND frame, title inside the 3:4 crop).

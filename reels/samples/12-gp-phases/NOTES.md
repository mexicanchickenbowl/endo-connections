# 12 · Why warm GP shrinks: the crystalline phases of gutta-percha (β → α → amorphous → β)

**Style:** clean journal figure. Bright white page, thin black axes (left and bottom only, Nature-style), Inter for
text and IBM Plex Sans for numbers (the °C readout and tick labels). Three restrained accent colours carry the
meaning everywhere: **blue = β**, **orange = α**, **grey = amorphous**. Bold panel letters **A / B / C**, a "Fig. 1 |"
running head, and the captions are set like a figure legend (a bold lead phrase, then plain text). Lots of white
space, no decoration and no gradients except the faint transition bands.

**Duration:** 22.0 s (v2, after review; v1 was 21.6 s) · 1080×1920 · 30 fps · silent · `reels/out/12-gp-phases.mp4` (poster at t = 15.3 s)

> **v2 note:** the sections "Concept", "Storyboard" and "Design rationale" below describe v1. Where they disagree with
> the **Review changes (v2)** section at the end, the v2 section is current.

## Concept
One temperature timeline drives three synchronised panels, so the viewer sees a single event three ways.

- **A, the material view.** A schematic volume–temperature curve. A dot heats from room temperature through the
  two transition bands (42–49 °C and 53–59 °C), peaks at 70 °C, then cools to about body temperature along a lower
  path. This closes a hysteresis loop and leaves a visible drop, labelled *shrinks on cooling*. Pulse rings mark
  each transition as the dot crosses it.
- **B, the molecular view.** Schematic trans-1,4-polyisoprene chains. They start as an aligned β lattice, change
  into a staggered α lattice (side groups alternate, so the repeat is two units long), and then melt into random
  coils. A front sweeps across the lattice from left to right at each change. On cooling the box splits in two:
  **very slow (~0.5 °C per hour) → α** and **normal or rapid → β**.
- **C, the clinical view.** A cone in a canal with an irregularity on one wall. The GP is tinted by its phase and
  holds filler dots (ZnO). It softens, then flows into the irregularity. On cooling it pulls away from the walls and
  its top drops below a dashed ghost line. A plugger then comes in and compacts it.

Payoff: **"Compact while it cools."** with the subline "Hold plugger pressure to offset shrinkage."

## Storyboard v1 (times in s; superseded, see Review changes)
| t | Legend caption (40 px, fully visible) | A | B | C |
|---|---|---|---|---|
| 0–3.3 | 0.30–3.32 **As supplied.** Most cones are **β** phase. | Dot at 22 °C ("room temp."). Inset "Inside a GP cone (by weight)": a bar that is ~15 % blue (GP polymer ~10–20 %) and the rest grey with dots (mostly ZnO filler, plus radiopacifier and wax) | β lattice, slight thermal jiggle | Cone in the canal, gap at the irregularity: *solid* |
| 3.3–6.9 | 3.60–6.85 **Heat to ~42–49 °C.** **β** converts to **α**. | Dot accelerates, then slows inside the 42–49 °C band (band label bolds). Pulse ring at ~45.5 °C. Body-temperature marker fades in | β → α front sweeps left to right (rows stagger, side groups alternate) | Orange tint, heat shimmer at the orifice: *softening* |
| 6.9–10.2 | 7.15–10.20 **~53–59 °C.** Melts: **amorphous**, flowable. | Volume jumps across the 53–59 °C band. Pulse ring. Dot climbs to 70 °C ("peak") | Chains melt into random coils (larger thermal motion) | Grey tint. GP flows into the irregularity and expands slightly: *flows* |
| 10.2–13.75 | 10.50–13.75 **Cooling.** Very slow → **α**; normal → **β**. | Cooling branch is drawn back along the melt line, supercooled below 53 °C, then drops as it recrystallises (~47 → 39 °C). Pulse ring | Box splits (11.0–11.6): "very slow, ~0.5 °C per hour" recrystallises to α, "normal or rapid cooling" to β. α and β badges | Still *flows*, then blue tint as it recrystallises |
| 13.75–17.3 | 14.05–17.30 **Shrinkage.** It contracts as it cools and recrystallises. | Shrinkage bracket (hot volume → final volume) with "shrinks on cooling". Dot settles at ~37 °C ("≈ body temp.") | Split boxes fade (15.4–15.85), and the single β box returns (15.7–16.2), the same as frame 0 | Gaps open at both walls with inward arrows, and the top drops below a dashed ghost line: *shrinks*. Plugger enters (15.5–16.35) and compacts (16.3–17.4): *compacted* |
| 17.6–21.6 | **Compact while it cools.** (62 px) + "Hold plugger pressure to offset shrinkage." (4.0 s, needs 3.83 s) | Complete loop held. Traces fade 21.15–21.55 so the loop restarts on an empty plot | β crystal | Plugger holds, then lifts out at 21.15–21.55 |

Every caption is fully visible for at least `Kit.readSecs` (checked numerically: 3.02 ≥ 2.92 · 3.25 ≥ 3.22 ·
3.05 ≥ 2.32 · 3.25 ≥ 3.22 · 3.25 ≥ 3.22 · takeaway 4.00 ≥ 3.83). Captions fade in over 0.14 s and out over 0.12 s, so
two captions never overlap. A small source line under the fine print changes with each section.

## On-screen claims and sources
All checked against PubMed records (abstracts or PMC full text) during this build.

1. **"Gutta-percha: 3 phases", "β → α → amorphous", "trans-1,4-polyisoprene".** GP is trans-1,4-polyisoprene. It has
   two crystalline forms, α and β, which differ in single-bond configuration and molecular repeat distance, plus an
   amorphous melt. Bunn 1942 is the original crystallography (Proc R Soc Lond A 180:40; not indexed in PubMed),
   cited by:
   - Goodman A, Schilder H, Aldrich W. *The thermomechanical properties of gutta-percha. II. The history and
     molecular chemistry of gutta-percha.* Oral Surg Oral Med Oral Pathol 1974;37(6):954-61. PMID 4598930.
     doi:10.1016/0030-4220(74)90448-4
   - Vishwanath V, Rao HM. *Gutta-percha in endodontics – a comprehensive review of material science.* J Conserv
     Dent 2019;22(3):216-22. PMID 31367101. doi:10.4103/JCD.JCD_420_18 (full text: "trans isomer, differing only in
     single bond configuration and molecular repeat distance"; α is the natural form; most commercial products are β).
   - Liao SC et al. *The investigation of thermal behaviour and physical properties of several types of contemporary
     gutta-percha points.* Int Endod J 2021;54(11):2125-32. PMID 34420210. doi:10.1111/iej.13615
2. **"Most cones are β phase."** Combe EC, Cohen BD, Cummings K. *Alpha- and beta-forms of gutta-percha in products
   for root canal filling.* Int Endod J 2001;34(6):447-51. PMID 11556511. doi:10.1046/j.1365-2591.2001.00415.x.
   Only four newer products contained α; all the others were β. Also Vishwanath & Rao 2019. Worded "most", not "all",
   because some thermoplastic products are α.
3. **Inset: "GP polymer ~10–20 %", "mostly ZnO filler (+ radiopacifier, wax)".**
   - Friedman CE, Sandrik JL, Heuer MA, Rapp GW. *Composition and physical properties of gutta-percha endodontic
     filling materials.* J Endod 1977;3(8):304-8. PMID 268405. doi:10.1016/S0099-2399(77)80035-6. The PubMed
     abstract is unavailable, so the numbers are taken from secondary sources. These are the classic values (≈18–22 %
     GP, 59–76 % ZnO, 1–4 % waxes/resins, 1–18 % metal sulfates). Hsu et al. 2020 quotes them, citing its refs 5–8
     together, and Liao 2021 cites Friedman 1975/1977, Gurgel-Filho 2003 and Maniglia-Ferreira 2013 for 14.5–22.4 %
     GP. Gurgel-Filho 2003 (below) is primary data for the same range.
   - Gurgel-Filho ED et al. *Chemical and X-ray analyses of five brands of dental gutta-percha cone.* Int Endod J
     2003;36(4):302-7. PMID 12702126. Brands contained 14.5–20.4 % GP and 66.5–84.3 % ZnO, and some had no BaSO₄.
   - Liao et al. 2021: six current brands contained 8.5–17 % GP and 77–86.5 % inorganic matter, 3.5–6 % wax/resin.
   - **Correction to the brief.** "ZnO ~60–75 %, GP ~20 %" matches the 1977 data, but current cones often contain
     less GP and more filler. The screen therefore says GP ~10–20 % and "mostly ZnO" without a ZnO percentage. The
     bar draws the GP segment at 15 %, which is illustrative.
4. **"Heat to ~42–49 °C. β converts to α"** and **"~53–59 °C. Melts: amorphous"** (the two bands in A).
   - Schilder H, Goodman A, Aldrich W. *The thermomechanical properties of gutta-percha. III. Determination of phase
     transition temperatures for gutta-percha.* Oral Surg Oral Med Oral Pathol 1974;38(1):109-14. PMID 4525950.
     doi:10.1016/0030-4220(74)90321-1. The PubMed abstract is unavailable. The 42–49 °C and 53–59 °C ranges are
     quoted from this paper in the full texts of Liao et al. 2021 and Hsu et al. 2020, so the brief's ranges are
     correct.
   - Modern DSC broadly agrees, with brand variation: Liao 2021 found β→α onset 39.9–46.5 °C (peak 48–50.6) and
     α→amorphous onset 53.2–54.6 °C (peak ~60). Hsu 2020 found 40–49 and 52–59 °C (regular type) and 38–49 and
     50–58 °C (soft type). Hence the "~" on screen and "ranges vary by brand" in the fine print.
   - "flowable": amorphous, heated GP flows under compaction (Vishwanath & Rao 2019; Hsu 2020 rheology).
5. **"Cooling. Very slow → α; normal → β"** and **"~0.5 °C per hour"**. Liao 2021 (full text): "When the amorphous
   phase is cooled under the rate less than 0.5 °C/h, the α-form will recrystallize (Bunn, 1942; Goodman et al.,
   1974)". Vishwanath & Rao 2019: cooled rapidly → β, extremely slowly (0.5 °C/h) → α. The brief was correct.
   **Nuance (not on screen):** Hsu 2020 saw no crystallisation exotherm on cooling for one regular-type backfill GP
   at 5 or 20 °C/min, while a soft-type GP recrystallised (to β). Liao 2021 likewise saw **no exothermic peaks on
   cooling at 5 °C/min in any of the six cone brands**. This is the "slow" in the on-screen line "Recrystallisation
   is slow & product-dependent (Liao 2021; Hsu 2020; Lee 1997)". Hsu 2020 supplies "product-dependent", and Lee 1997
   supplies the continued shrinkage at 37 °C for 45 min–10 h. Recrystallisation kinetics therefore depend on the
   product. "Normal → β" is the classic textbook simplification (stated explicitly by Vishwanath & Rao 2019).
6. **"Shrinkage. It contracts as it cools and recrystallises"**, the *shrinks on cooling* bracket in A and the gaps in C.
   - Schilder H, Goodman A, Aldrich W. *The thermomechanical properties of gutta-percha. Part V. Volume changes in
     bulk gutta-percha as a function of temperature and its relationship to molecular phase transformation.* Oral
     Surg Oral Med Oral Pathol 1985;59(3):285-96. PMID 3856822. doi:10.1016/0030-4220(85)90169-0. By dilatometry,
     volume changes on heating and cooling are directly related to the molecular transformation. Keeping apical GP
     ≤ 45 °C avoids the transformation and keeps volume changes small.
   - Lottanti S, Tauböck TT, Zehnder M. *Shrinkage of backfill gutta-percha upon cooling.* J Endod 2014;40(5):721-4.
     PMID 24767571. doi:10.1016/j.joen.2013.09.043. Linear shrinkage of 0.96–2.31 % from 75 → 37 °C. "Shrinks quickly
     and extensively upon cooling."
   - Lee CQ et al. *Dimensional stability of thermosensitive gutta-percha.* J Endod 1997;23(9):579-82. PMID 9587286.
     Expanded +11.6 to +12.3 % (volume) when heated to 80 °C and shrank on cooling. At 37 °C it kept shrinking for
     45 min to 10 h.
   - Grassi MD, Plazek DJ, Michanowicz AE, Chay IC. *Changes in the physical properties of the Ultrafil
     low-temperature (70 °C) thermoplasticized gutta-percha system.* J Endod 1989;15(11):517-21. PMID 2639948.
     doi:10.1016/S0099-2399(89)80192-X. Isothermal volumetric shrinkage during crystallisation: ≈2.6 % for GP
     points and Ultrafil Blue, 2.2 % for Ultrafil White, and 4.6 % for raw GP. This is the "recrystallises" part.
   - Tsukada G et al. J Oral Rehabil 2004;31(11):1139-44. PMID 15525394. Marked specific-volume change at the
     first-order transition (42–60 °C). Melted GP shrinks a lot as it sets.
   - No shrinkage percentage is shown on screen, because published values vary widely with product, method
     (linear vs volumetric) and temperature span (≈1–7 %). Meyer KM et al. (*Analysis of shrinkage of different
     gutta-percha types using optical measurement methods.* Schweiz Monatsschr Zahnmed 2006;116(4):356-61. PMID
     16708520) reported 6.5–7.3 % from 90 → 35 °C.
7. **Takeaway: "Compact while it cools. Hold plugger pressure to offset shrinkage."**
   - Hsu YH et al. *Thermal behavior and viscoelastic properties of gutta-percha used for back-filling the root
     canal.* J Dent Sci 2020;15(1):28-33. PMID 32256997. doi:10.1016/j.jds.2019.10.002. Full text: "Schilder used a
     plugger to compact the gutta-percha during its cooling to overcome the problem of volumetric shrinkage." It
     concludes that soft-type GP "must be compacted more often over time".
   - Lottanti 2014 (above) gives the shrinkage rationale. This is the standard warm-vertical-compaction teaching.
8. **37 °C "body" marker, 22 °C start, 70 °C peak.** These are illustrative anchors. In natural teeth fitted with
   thermocouples, Goodman, Schilder & Aldrich (Part IV, Oral Surg Oral Med Oral Pathol 1981;51(5):544-51, PMID
   6941146) measured about 80 °C in the body of the canal and a peak of 45 °C apically during warm vertical
   packing. Thermal effects rarely reached more than 4–6 mm into the material. This is the measured basis for
   "apical GP stays ≲45 °C". Schilder 1985 (Part V) adds why it matters: GP kept at or below 45 °C apically
   avoids the molecular transformation, so its volume change stays small.

## What is schematic, toy or not to scale (said on screen: "schematic", "not to scale", "ranges vary by brand")
- **A:** the y-axis is "Volume (schematic)", with arbitrary units and no numbers. Slopes and step heights are
  illustrative. The recrystallisation on cooling is drawn at ~47 → 39 °C, below the melting range (supercooling).
  This is consistent with Meyer 2006, where the largest shrinkage per 5 °C came on cooling at the bottom of or
  below the melting range: 45–40 °C for the Multifill α and β GPs, and 55–40 °C for commercial GP. It is drawn,
  not measured. The
  loop closes on the β line at 37 °C, which is idealised: Lee 1997 found volume still changing for hours.
- **B:** toy chain drawings with no atomic positions or real cell parameters. "Two-unit vs one-unit repeat" is shown
  by alternating vs uniform side groups and staggered vs aligned rows. Thermal jiggle is decorative.
- **C:** a uniformly heated canal is a simplification (real heating is local, Goodman 1981). The gap width is
  exaggerated about 10× so it can be seen. The dots stand for filler and are not to scale.
- **Time is compressed:** "very slow" cooling at ~0.5 °C/h would take hours. The fork in B is conceptual.

## Design rationale
- **One clock, three views.** A single function `T(t)` (monotone cubic through keyframes, so there is no overshoot
  and speed changes are smooth) drives the dot, the lattice morph, the canal and the readout. They cannot drift out
  of sync, and the viewer learns that the curve, the molecules and the clinic are the same event.
- **Colour as the legend.** Blue, orange and grey are reused in the traces (each colour blends into the next across
  a transition), the lattice, the GP tint, the state words and the Greek letters in captions and title. Because of
  that, panel A needs no separate key.
- **The dot slows inside each band,** so the eye stays on the transition while panel B changes. Pulse rings mark the
  midpoints. The changes in B sweep across the lattice as a front, so they look like a phase change and not a
  crossfade.
- **Journal typography.** Hierarchy: 74 px title → 40 px legend → 28–30 px axis and panel labels → 22 px fine print.
  Direct labels on the curves replace a legend box, and the plot has only left and bottom axes. Captions sit in a
  ruled legend block under the figure, like a printed figure.
- **Loop.** The B box returns to a single β lattice before the end, and the A traces and the plugger fade out in the
  last 0.45 s, so the last frame flows back into the first (empty plot, β lattice, dot at room temperature). Only C
  keeps its compacted shape.
- **Layout and safe areas.** Everything readable sits in x 64–1016 and y 230–1580. Panel C stays left of x = 955
  below y 1100, clear of the Reels button column. The handle `@natebrooksendo` is in the running head, top right,
  in muted grey.

## Change log
- v1: first build. Fixed: overlapping inset labels; the takeaway was not bold; captions crowded the fine print; the
  β-box merge left ghosted lattices (now a sequential fade-out and fade-in); the canal was too small; the C state
  word touched the root apex (root shortened); amorphous coils bunched up (starts now stratified); light-grey text
  had low contrast (`amorText` #6b717a, fine print #6c727b); captions overlapped while crossfading (fades
  shortened); the heat shimmer was clipped (moved into the canal orifice); the takeaway subline was too long for
  its read time (shortened); the lower pair of shrink arrows in C crossed where the GP is narrow (only the upper
  pair is kept); "flows" in C now appears after the melt midpoint (8.05 s), in sync with B.

## Review changes (v2)
Independent science and design reviews were applied. All 'must' and 'should' issues are fixed and all nits are done.
Literature re-checked on PubMed for this pass: Goodman, Schilder & Aldrich 1981 (PMID 6941146,
doi:10.1016/0030-4220(81)90017-7: ~80 °C in the body of the canal, apical peak 45 °C, thermal effects rarely more
than 4–6 mm into the material); Schilder et al. 1985 (PMID 3856822: apical GP kept ≤45 °C avoids the molecular
transformation); Lee et al. 1997 (PMID 9587286, doi:10.1016/S0099-2399(06)81126-X: +11.6 to +12.3 % volume at 80 °C;
at 37 °C shrinkage continued for 45 min–10 h; the final volume was still +5.5 to +7.2 %).

### Science
- **The plugger now works on hot GP, and pressure is held all through cooling** (the 'must' issue). Old order: cool,
  let the gaps open, then compact cold β GP. New order in C: *solid → softening → mouldable → compacting (plugger
  enters at 6.45 s, T ≈ 58–70 °C) → pressure held, as it cools → adapted*. The GP top follows the plugger down as the
  GP shrinks, and the walls never open. The shrink gap is shown only as a dashed counterfactual outline with
  inward arrows (12.95–16.7 s), keyed "--- no pressure" under the state word. The takeaway now lands after 7+ s of
  held pressure (Hsu et al. 2020: "Schilder used a plugger to compact the gutta-percha during its cooling to
  overcome the problem of volumetric shrinkage").
- **Local heating in C** (must). Each GP depth has its own temperature, `T_local = 22 + (T − 22)·profile(depth)`.
  The coronal/middle GP melts (grey). A thin band reaches only α, and the apical ~30 % of the GP stays β (max ≈41 °C)
  and gets no shrink gap. The heating front moves down from the orifice; on cooling the recrystallisation front
  moves up (deepest/coolest rows first). The thin α band stays orange after cooling, since α is the stable form and
  that band never melted; it is ~8 px and returns to the frame-0 cone at the loop. Header is now "In the canal
  (schematic)", and the fine print (5.5–8.75 s) says "C: heating is local; apical GP stays ≲45 °C (Goodman 1981;
  Schilder 1985)".
- **Volume axis** (should). The y-axis has a break symbol (//) and reads "Volume (not to scale)". The whole curve is
  raised (β at 22 °C now sits ~110 px above the axis, not ~50), so the hot:cold height ratio is ~2.7× instead of
  ~5.5×. The shrink bracket carries an italic "exaggerated" tag.
- **Cooling is slow and incomplete** (should). Recrystallisation in A is gradual (`xRel = sm((47.5 − T)/9.5)`) and
  only 50 % complete when the dot reaches 37 °C. The dot stops above the β line, with a dotted down-arrow labelled
  "keeps shrinking / for minutes–hours" (Lee 1997). Panel B's right box reads "normal cooling / over minutes–hours",
  and "or rapid" is gone (Hsu 2020: rapidly cooled regular GP stayed amorphous). The fine print adds
  "Recrystallisation is slow & product-dependent (Liao 2021; Hsu 2020; Lee 1997)". Caption 4 is "**Cooling rate**
  picks the crystal; it forms slowly."
- **Melt caption** (should): "**~53–59 °C:** amorphous, flows under pressure." C says "mouldable" until the plugger
  presses, and the irregularity fills only under compaction (Vishwanath & Rao 2019; Liao 2021).
- **Takeaway subline** (should): "Warm techniques: held pressure helps compensate." The scope is now warm techniques
  only, "offset" is gone, and it is hedged with "helps". On-screen source during shrinkage and takeaway: "Hsu et
  al. J Dent Sci 2020; Lottanti et al. J Endod 2014; Schilder et al. 1985".
- Nits: the intro source line now cites the β claim ("β form: Combe 2001"). The composition is "Cones ≈ 8–22 % GP,
  mostly ZnO (Friedman 1977; Liao 2021)" (the composition inset is cut; see design). Title and subtitle: "Why warm
  GP shrinks / 2 crystal forms + melt: β → α → amorphous → β on cooling" (the "3 phases" wording is gone). The fine
  print gives "melt peak ≈60 °C by DSC (Liao et al. 2021)" next to Schilder's 53–59 °C band. "*trans*" is set in
  italic in the B header. The fine print adds "time compressed", and the fork sub-label is "~0.5 °C/h".

### Design
- **Intro.** The composition inset is cut. Heating starts at 1.0 s (`Tof` keyframes [0,22],[1.0,22],[2.4,42],
  [4.1,49],[4.9,53],[6.7,59],[7.8,70],[8.6,70], then cooling [10.2,52],[12.2,47],[14.6,40],[15.6,37.8],[17.6,37.2],
  [22,37]). Caption 1 is "**As supplied:** mostly β phase." (0.15–2.48 s). The hook title is "Why warm GP shrinks".
- **No colour blending anywhere.** The trace, the dot, the B beads and the C fill all switch hard between blue,
  orange and grey (dominant phase). The dot changes colour with a 0.2 s radial wipe timed to the pulse ring. The A
  bands are tinted half-and-half with the split at the band midpoint, where the trace switches. C uses a vertical
  gradient with hard stops: a top-down heating front and a bottom-up recrystallisation front.
- **Fork sequencing (11.0 s in v1, now 9.05 s).** The main label fades out 8.9–9.15. The box frame splits
  geometrically 9.05–9.65. The full lattice fades out 9.05–9.3 and the fork lattices fade in 9.25–9.65 (never more
  than two layers). The fork labels fade in 9.5–9.75 only after the split. Crystallisation in the fork runs
  9.9–11.9 (time-driven, conceptual). A 30 px "or" sits in a 36 px gutter. Caption 4 no longer repeats the labels.
- **The fork boxes stay to the end** (no mid-story blank). They merge back into the single β box only at the loop
  (21.6–21.95). The β box widens, each frame-0 chain point glides from its matching fraction along the fork chain,
  side groups cross-fade, and the α box fades under it.
- **Focus envelope** (`FOCUS`, 0.3 s eases). Heating: A, B 1.0 · C 0.55. Hot compaction (6.45): C 1.0 · A 0.55 ·
  B 0.4. Cooling fork (8.9): B 1.0 · A, C 0.55. Shrinkage (12.5): A, C 1.0 · B 0.4. Takeaway (15.55): C 1.0 ·
  A, B 0.4. Loop (21.6): back to the heating state. Dimmed panels are drawn into an offscreen layer and composited
  with alpha, so no hatch shows through the canal and no stroke overlaps look beaded.
- **Panel C is larger.** B is 500 px wide (fork boxes 232 px each) and C is drawn 1.2× wider in a 610–960 clip.
  The plugger is a tapered trapezoid (42 → 36 px half-width) with a rounded working end, and its top 40 px fades to
  white, so it comes from above the panel. Two ink chevrons show held pressure. A single orange arrow labelled
  "heat" (30 px) replaces the heat-shimmer squiggles.
- **Legibility.** Everything must-read is now ≥30 px: band labels 30 px bold, "body" 30 px ink2, "on cooling" 30 px,
  panel headers 30 px, fork sub-labels 30 px, badges 30 px, and the takeaway subline 36 px. Only the running
  head/handle (26 px, decorative) and the fine print (22 px) are smaller.
- **Bottom block.** Every caption is a single line. Caption 5 is "**Shrinkage.** It contracts as it cools." The
  takeaway headline baseline is 1462 (62 px), the subline 1514 (36 px), and the fine print 1550/1574. Fine-print
  lines are ≤ 896 px, so they stay left of the button column.
- **Loop.** DUR = 22.0. The takeaway is fully visible 15.7–21.6 (5.9 s ≥ 3.83 s) and fades over 21.6–21.85. Over
  21.6–21.95 the readout, status, body marker, traces, dot, source line and C state all return to the frame-0
  state, the plugger lifts out, and the GP returns to the original cone. The lattice jiggle noise is blended to its
  t = 0 phase, so the last frame matches frame 0 pixel for pixel (diff checked: 1 px > 15 levels).
- Nits: the running head and handle moved to y 270/262 (clear of the 240 px grid crop). The title is at 352, the
  subtitle at 398 and the rule at 420. Panel A's header is at 470 and the plot is at y0 506. The α/β badges sit in
  the top-right corner, and the fork lattices are built 34 px lower so badges never touch a chain. The shrink-bracket
  labels have white knock-outs, so the moving guide line passes behind them.

### Storyboard v2 (times in s)
| t | Caption (40 px, single line) | A | B | C |
|---|---|---|---|---|
| 0–2.5 | 0.15–2.48 **As supplied:** mostly β phase. | Empty plot; dot fades in at 22 °C and starts heating at 1.0 | β lattice | Cone, *solid*; "heat" arrow from 1.0 |
| 2.5–5.5 | 2.75–5.40 **~42–49 °C:** β converts to α. | Dot slows in the 42–49 band; colour wipe + ring at 45.5 °C (~3.1 s) | β → α front sweeps left → right | Orange front moves down from the orifice: *softening* |
| 5.5–9.0 | 5.67–8.92 **~53–59 °C:** amorphous, flows under pressure. | Melt step; ring at 56 °C; peak 70 °C 7.8–8.6 | Chains melt to coils | Coronal/middle grey, apex blue: *mouldable*; plugger enters 6.45–7.05, compacts 7.05–8.3 (fills the irregularity): *compacting* |
| 9.0–12.5 | 9.19–12.45 **Cooling rate** picks the crystal; it forms slowly. | Dot slides back down the melt line (supercooled) | Box splits: very slow ~0.5 °C/h → α *or* normal cooling, over minutes–hours → β; badges | *pressure held / as it cools*; top follows the plugger down |
| 12.5–15.6 | 12.72–15.40 **Shrinkage.** It contracts as it cools. | Gradual recrystallisation (ring at 42.75 °C, ~13.7 s); bracket "shrinks / on cooling / exaggerated" tracks the dot; dotted tail "keeps shrinking / for minutes–hours" | (dimmed) | Recrystallisation front rises; dashed "no pressure" ghost with inward arrows |
| 15.7–21.6 | **Compact while it cools.** + "Warm techniques: held pressure helps compensate." | (dimmed) dot at 37 °C above the β line | (dimmed) fork boxes | *adapted* (from 16.9) |
| 21.6–22.0 | — | Traces, dot and readout fade | Fork merges into the single β box | Plugger lifts out, cone resets, *solid* |

## Change log: Final QA (fresh-eyes review)
Stills were rendered across the whole timeline with `--safe` (`_stills/final-qa`, fixes checked in `_stills/final-qa-fix`).
All on-screen PMIDs were re-checked on PubMed (4525950, 11556511, 34420210, 32256997, 24767571, 9587286, 3856822,
6941146, 268405).
- **Fixed: the dot covered the "amorphous" label at the 70 °C peak** (about 7.6–8.8 s; the white dot sat on "…us").
  The label now sits at T = 62 and is raised to 34 px above the curve. It clears the peak dot by about 12 px and the
  cooling dot's path, and stays below the "53–59 °C" band label.
- **Fixed: the dashed shrink-bracket guide line ran through the "α" curve label** (about 13.6–14.4 s, as the dot crossed
  α's height). The α label is now drawn after the bracket guide, on a white knock-out like the bracket labels. It sits
  in the gap between the bands, so the knock-out never cuts a band tint.
- Checked and left alone: hook readable at t = 0 · takeaway fully visible 15.7–21.6 s · the last frame matches frame 0 ·
  no tofu glyphs (≈, ≲, β, α, °, – all render) · all must-read text inside the safe area (the second fine-print line's
  descenders end at y ≈ 1579) · captions ≤ x 960 · claims match the sources above.
- Video re-rendered: `reels/out/12-gp-phases.mp4` is 22.000 s, 660 frames, 1080×1920 at 30 fps. The poster stays at
  t = 15.3 s (the full hysteresis loop + shrink bracket, the fork, held pressure with the no-pressure ghost; the title
  is inside the 3:4 crop).

## Change log: Citation audit
Every literature citation was audited against PubMed: the five on-screen source lines in `reel.js`, every
`claims[].source` and the caption's Refs line in `meta.json`, and every reference in this file. For each paper,
first author, year, journal, volume/pages, PMID and DOI were checked against the PubMed record. The abstract (or the
PMC full text for Liao 2021, Hsu 2020 and Vishwanath & Rao 2019) was read against the claim the paper is attached
to. Frames from the rendered MP4 were also checked: the fine print in the published video matches the source.

**Verified (PMID → same first author, year and journal; supports its claim):**
Combe 2001 Int Endod J (11556511) · Friedman 1977 J Endod (268405; no abstract, so the composition figures rest on
secondary quotes) · Liao 2021 Int Endod J (34420210) · Schilder 1974 Part III, Oral Surg Oral Med Oral Pathol
(4525950; no abstract, ranges quoted by Liao 2021 and Hsu 2020) · Goodman 1974 Part II (4598930) · Goodman 1981
Part IV (6941146) · Schilder 1985 Part V (3856822) · Hsu 2020 J Dent Sci (32256997) · Lee 1997 J Endod (9587286) ·
Lottanti 2014 J Endod (24767571) · Vishwanath & Rao 2019 J Conserv Dent (31367101) · Gurgel-Filho 2003 Int Endod J
(12702126) · Grassi 1989 J Endod (2639948) · Tsukada 2004 J Oral Rehabil (15525394) · Meyer 2006 Schweiz
Monatsschr Zahnmed (16708520). Bunn 1942 (Proc R Soc Lond A 180:40) is not in PubMed. It is cited only through
Liao 2021 and Vishwanath & Rao 2019, and never on screen.

**On screen: no errors found, so the reel was not changed and the video was not re-rendered.** The existing
`reels/out/12-gp-phases.mp4` is 22.000 s, 660 frames, 1080×1920 at 30 fps.

**Fixed (meta.json / NOTES only):**
- `meta.json`, claim "Cooling rate picks the crystal". Its sources (Liao 2021, Hsu 2020) state only the slow → α
  half. Neither states "normal cooling → β" as a general rule: Hsu's regular-type GP did not crystallise at
  5–20 °C/min. Added Vishwanath & Rao 2019 (PMID 31367101), which states both halves explicitly. Annotated Liao
  (no cooling exotherm at 5 °C/min) and Lee 1997 (shrinkage continues 45 min–10 h) for "recrystallisation is slow".
- `meta.json` caption Refs line. It omitted the sources for two caption claims: "Most cones are β phase" (Combe
  2001) and "Apical GP stays cooler (≲45 °C)" (Goodman 1981). It also omitted Liao 2021, the source for "ranges vary
  by brand". All three are added, and "Oral Surg" is expanded to the full abbreviation, Oral Surg Oral Med Oral
  Pathol.
- NOTES item 3, Friedman 1977. The note said the composition values were "as summarised by Hsu 2020". In fact Hsu
  quotes them from its refs 5–8 jointly, and the Friedman abstract is not on PubMed. The provenance is now stated
  honestly, with Liao 2021's discussion and Gurgel-Filho 2003's primary data as support.
- NOTES item 5. The support for "slow" in the on-screen line "Recrystallisation is slow & product-dependent (Liao
  2021; …)" was undocumented. It is Liao 2021's finding of no exothermic peaks on cooling at 5 °C/min in all six
  brands, and that finding is now recorded.
- NOTES item 6, Grassi 1989. The title and DOI were added. The shrinkage figures are now attributed correctly:
  ≈2.6 % for points and Ultrafil Blue and 2.2 % for Ultrafil White (previously "2.2–2.6 % for dental GP").
- NOTES, Meyer 2006. The journal (Schweiz Monatsschr Zahnmed 2006;116:356-61) and title were added. "Largest
  shrinkage at 45–40 °C" applied only to the Multifill α and β GPs; for commercial GP it was 55–40 °C. Both the
  claims section and the schematic section are corrected.
- NOTES item 8, Goodman 1981. "In the clinic" is now "in natural teeth fitted with thermocouples". Goodman 1981 is
  recorded as the measured basis for "apical GP stays ≲45 °C", and Schilder 1985 as the reason it matters (it gives
  the rationale and does not measure apical temperature).

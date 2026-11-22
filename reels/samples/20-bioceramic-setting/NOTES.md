# 20 · How a bioceramic sealer sets (and what can form at the wall)

**Style:** isometric 3-D diorama. Canvas 2D with a true isometric projection, pastel sky-blue to lilac gradient,
iso dot lattice, soft pre-blurred ambient-occlusion shadows, translucent "glass" sealer block, Space Grotesk.
**Duration:** 24 s · 1080×1920 · silent · poster at 23.2 s. Spelling: US (dentin, mineralize) for an AAE/J Endod audience.
**Files:** `index.html` (page contract), `reel.js` (scene, all drawing, `render(t)`).

## Concept
A tidy tabletop diorama: a slab of root dentin (top face = canal wall, base toward the root surface), cut open so its
tubules show as fluid-filled channels, with a translucent block of premixed calcium-silicate sealer on top. One focal
process at a time: water comes up the tubules → grains hydrate into a C–S–H gel matrix with Ca(OH)₂ plates → Ca²⁺ / OH⁻
leach out and a pH gauge climbs (in reality from minutes, overlapping the set) → phosphate (schematic route; PBS bath in
the lab) meets Ca²⁺ → apatite-like needles nucleate along the interface and shallow, uneven "tag-like Ca–P deposits"
form in some tubule mouths. It ends on the mineralized diorama plus a hedged, in-vitro takeaway.

## Storyboard (seconds), as revised after review
| t | Beat | On screen |
|---|------|-----------|
| 0–3.4 | **Hook.** Title fully opaque on frame 0. Dentin slab extrudes, sealer grains pop in, glass block fades in; camera settles. Callouts arrive after the title has been read (2.3 / 2.5 / 2.7 s): root dentin / sealer · canal side / tubules · toward root surface. | "PREMIXED CALCIUM-SILICATE SEALERS" · **How a bioceramic sealer sets** · "…and what can form at the wall" |
| 3.4–7.3 | **① Water in** (chip: minutes–hours). Fluid rises in the cut tubules; H₂O molecules travel up and into grains; a clearly visible water front soaks upward through the paste and rings each grain blue as it passes. | "Premixed sealer: water from the dentin soaks in" · chip: "Very dry canal → may stay unset" · src: Xuereb 2015, Antunes 2026 |
| 7.3–10.9 | **② Hydration** (chip: hours–days). Bottom-up wave: grain cores shrink, a short fuzzy C–S–H rim grows, gel strands mesh neighbouring grains, the paste tint becomes a continuous translucent lilac gel; hexagonal Ca(OH)₂ plates nucleate. | "Silicate grains hydrate: C–S–H gel + Ca(OH)₂" · icon equation C₃S/C₂S (tri-/dicalcium silicate) + H₂O → C–S–H + Ca(OH)₂ · src: Camilleri 2011 (simplified), final set ≥168 h Loushine 2011 |
| 10.9–15.1 | **③ Ions out** (chip: from minutes). Sealer contents recede to half opacity; Ca²⁺ (green) and OH⁻ (deep blue), drawn 1.5× larger, leave the grains/plates: some escape, some wait in tubule mouths, some settle on the dentin. pH bar fills; "rising…" fades out fully, then the dashed 10–12 band and its label fade in and the knob fades away. | "Ca²⁺ and OH⁻ leach out; pH climbs" · pH card "~10–12 in lab tests (water)" + "Steps overlap: pH rises within minutes, before setting · Lee 2017" |
| 15.1–18.9 | **④ Apatite** (chip: days–months (lab)). Camera pushes in 7 %. Orange phosphate tetrahedra rise in 8 of 11 tubules ("phosphate from tissue fluid / lab: PBS bath · route schematic"), meet the waiting Ca²⁺ in a soft mint-white burst, and shallow, uneven Ca–P plugs grow into those mouths (3 tubules stay empty); needle clusters nucleate on the surface; an irregular mint interfacial band grows. | "Phosphate + Ca²⁺ → apatite-like layer" · icon equation phosphate + Ca²⁺ + OH⁻ → apatite-like · callouts "tag-like Ca–P deposits", "apatite-like layer" · src: Han & Okiji 2013 (incl. a premixed sealer, in PBS) / Xuereb 2015 / MTA: Sarkar 2005 |
| 18.9–24 | **Takeaway** (headline held 4.15 s). Sealer contents return to full opacity, camera eases back, a glint runs along the new mineral layer; last 0.5 s dissolves into frame 0 for the loop. | "BIOCERAMIC SEALERS · TAKEAWAY" · **Water sets it. In vitro, calcium + phosphate form apatite-like mineral.** · fine print: "Premixed sealers can take days to set and need dentin moisture." / "Ion release = some solubility; long-term seal effect debated." / two 23 px source lines: "Loushine 2011 J Endod · Xuereb 2015 J Endod" and "Han & Okiji 2013 IEJ · Donnermeyer 2019 Odontology" |

Reading times (`Kit.readSecs` vs fully visible): hook title 2.32 / 3.05 s; subtitle 2.92 / 3.05; ① caption 3.22 / 3.30;
① chip 2.92 / 3.10; ② 2.92 / 3.00; ③ 2.92 / 3.60; pH label 2.32 / 2.40; ④ 2.62 / 3.20; phosphate callout 2.01 / 2.05;
takeaway headline 4.13 / 4.15. Persistent: `@natebrooksendo` bottom-left, "schematic · not to scale · time compressed"
bottom-right (now kept through the end card).

## On-screen claims and sources (verified on PubMed)
1. **Hydraulic calcium-silicate sealers set by hydration, followed by calcium-phosphate precipitation** (overall story).
   Donnermeyer D, Bürklein S, Dammaschke T, Schäfer E. *Endodontic sealers based on calcium silicates: a systematic
   review.* Odontology 2019;107:421–436. PMID 30554288, doi:10.1007/s10266-018-0400-3: "a hydration reaction of the calcium
   silicate is followed by a precipitation reaction of calcium phosphate"; ready-to-use (premixed) sealers need an
   external water supply, two-component sealers carry their own water. Hence the kicker "PREMIXED".
   Camilleri J, Atmeh A, Li X, Meschi N. *Present status and future directions: hydraulic materials for endodontic use.*
   Int Endod J 2022;55 Suppl 3:710–777. PMID 35167119, doi:10.1111/iej.13709: "only materials whose primary reaction is
   with water can be classified as hydraulic"; tri-/dicalcium silicate + radiopacifier + additives + aqueous or
   non-aqueous vehicle. (The radiopacifier, e.g. ZrO₂, and the non-aqueous vehicle are omitted from the diorama for clarity.)
2. **"Premixed sealer: water from the dentin soaks in" / "Very dry canal → may stay unset" / "need dentin moisture"**
   - Xuereb M, Vella P, Damidot D, Sammut CV, Camilleri J. *In situ assessment of the setting of tricalcium silicate-based
     sealers using a dentin pressure model.* J Endod 2015;41:111–124. PMID 25442723, doi:10.1016/j.joen.2014.09.015. The
     premixed sealer "requires moisture from the root dentin to hydrate" and "did not set in a dry environment".
   - Antunes TBM et al. *Influence of drying protocol on the setting and crystalline phase formation of calcium
     silicate-based sealers.* Aust Endod J 2026;52:168–177. PMID 41364608, doi:10.1111/aej.70044. Ready-to-use sealer set
     faster in moist canals; the powder/liquid sealer showed no difference. "Dentine moisture is crucial for the setting
     of ready-to-use calcium silicate-based sealers."
   - Lee JK et al. Bioinorg Chem Appl 2017:2582849. PMID 28210204, doi:10.1155/2017/2582849. The premixed sealer did not
     set in a humid incubator even after one month.
3. **"can take days to set" / step-2 chip "hours–days" / src "final set ≥168 h".** Loushine BA et al. J Endod 2011;37:673–677.
   PMID 21496669, doi:10.1016/j.joen.2011.01.003: at least 168 h to final set (Gilmore). Setting times vary by product and
   moisture (Lee 2017 Table 3: the premixed EndoSeal MTA set in ~1223 min ≈ 20 h, EndoSequence BC Sealer had not set after a
   month; Lee also notes other reports in which it did set), hence the hedged "can take days". Loushine is used only for the
   setting time (step-2 source line and, since the citation audit, the end-card source line). It also found that excess water reduced microhardness, so the message is "needs moisture", not "the
   wetter the better" (not on screen).
4. **"Silicate grains hydrate: C–S–H gel + Ca(OH)₂"; C₃S/C₂S (tri-/dicalcium silicate) + H₂O → C–S–H + Ca(OH)₂ (simplified).**
   Camilleri J. Dent Mater 2011;27:836–844. PMID 21600643; Camilleri J. Int Endod J 2007;40:462–470. PMID 17459120,
   doi:10.1111/j.1365-2591.2007.01248.x; Camilleri J, Sorrentino F, Damidot D. Dent Mater 2013;29:580–593. PMID 23537569
   (reaction rims around the grains); Marciano MA et al. Dent Mater 2016;32:e30–e40. PMID 26727694, doi:10.1016/j.dental.2015.11.008.
5. **"Ca²⁺ and OH⁻ leach out; pH climbs" / "~10–12 in lab tests (water)" / "Steps overlap: pH rises within minutes, before
   setting" / step-3 chip "from minutes".**
   - Lee et al. 2017, Table 5 (distilled water): premixed sealer pH 11.64 already at 3 min, 11.6–11.8 over 24 h, while
     the same sealer had not set after a month; EndoSeal MTA 10.4–10.9 fresh over 24 h (Table 5) and up to 11.3 once set
     (Table 6, 4 weeks). A resin-based MTA-containing sealer in the same
     table stayed at pH 8.5–10.0, so the label refers to the hydraulic sealer in water. The fill end point is
     illustrative; the knob fades out once the literature band appears.
   - Candeiro GT et al. J Endod 2012;38:842–845. PMID 22595123, doi:10.1016/j.joen.2012.02.029 (raised pH and Ca²⁺ from 3 h).
   - Zhou HM et al. J Endod 2013;39:1281–1286. PMID 24041392, doi:10.1016/j.joen.2013.06.012 (alkaline at all times).
   - Caveat: Angkasuvan V et al. Clin Exp Dent Res 2022;8:900–905. PMID 35384399, doi:10.1002/cre2.573 (alkaline pH not
     sustained at the outer root surface of obturated teeth; sealer tested was BioRoot RCS, a powder/liquid CS sealer,
     not a premixed one).
6. **"Ion release = some solubility; long-term seal effect debated."** Donnermeyer 2019: bioactivity "is a consequence of
   the slight solubility of these materials … but solubility of the sealer might also compromise the quality of
   sealing". Zhou 2013: the premixed sealer had the highest solubility of the five sealers (still within ISO 6876).
   Silva Almeida LH et al. J Endod 2017;43:527–535. PMID 28216270, doi:10.1016/j.joen.2016.11.019 (systematic review:
   premixed CS sealers met ISO 6876 except for solubility).
7. **"Phosphate + Ca²⁺ → apatite-like layer"; "phosphate + Ca²⁺ + OH⁻ → apatite-like"; "tag-like Ca–P deposits";
   "apatite-like layer"; step-4 chip "days–months (lab)".**
   - Han L, Okiji T. Int Endod J 2013;46:808–814. PMID 23402321, doi:10.1111/iej.12062. Root sections filled with WMTA,
     a premixed CS sealer or Biodentine and kept in PBS for 1, 7, 30 or 90 days: all produced acicular/lath-like surface
     precipitates (Ca/P 1.6–2.0) and intratubular "tag-like structures that were frequently composed of Ca- and P-rich and
     Si-poor materials, suggesting intratubular precipitation". The premixed sealer released the least Ca and showed
     significantly shallower Ca/Si incorporation than MTA or Biodentine. Hence tags are drawn shallow and uneven, with
     three tubules left empty.
   - Xuereb et al. 2015: all sealers formed a calcium phosphate phase in physiological solution.
   - MTA (a repair cement, not a sealer): Sarkar NK et al. J Endod 2005;31:97–100. PMID 15671817,
     doi:10.1097/01.don.0000133155.04468.41 (HA-like precipitates in synthetic tissue fluid; HA formula
     Ca₁₀(PO₄)₆(OH)₂, so OH⁻ is shown as a reactant; adherent interfacial layer after 2 months). Labelled "MTA:" on screen.
   - Han & Okiji 2011 (PMID 21777256) tested Biodentine and MTA only, and some tags there were the material itself, so it
     is no longer cited on screen.
   - "phosphate" is used instead of "PO₄³⁻" because at tissue-fluid pH phosphate is mostly HPO₄²⁻/H₂PO₄⁻.
8. **"In vitro" in the takeaway headline; fine print.** Xuereb 2015: "clinically, material bioactivity cannot be assumed".
   Apatite precipitating in PBS/SBF does not by itself prove bioactivity: Bohner M, Lemaitre J. Biomaterials
   2009;30:2175–2179. PMID 19176246, doi:10.1016/j.biomaterials.2009.01.008. (Clinical context, not on screen: Sabeti et al., J Endod
   2024;50:735–746, PMID 38548045.)

### Corrections and refinements to the brief
- "Hydroxyapatite" became **"apatite-like" / "Ca–P"** on screen. The cited studies describe HA-like or Ca/P-rich
  precipitates (Ca/P 1.6–2.0), which is not proof of stoichiometric HA.
- "pH ~10–12" is kept, but labelled **"in lab tests (water)"**. In a tooth model the alkaline pH at the outer root surface was not sustained.
- "Fibrous C–S–H": C–S–H is a poorly crystalline gel. The fibres and halo are a schematic way to show gel growing out of the grains.
- Moisture: on screen "Premixed sealer: water from the dentin soaks in", "Very dry canal → may stay unset" and "can take days to set and need dentin moisture". "Over-wet is also bad" (Loushine: excess water reduced microhardness) is noted here, not on screen.
- Interfacial mineralization is presented as an in-vitro finding ("In vitro, …" in the headline), not as a proven clinical bond or seal.
- In the cited experiments the phosphate came from PBS or simulated tissue fluid surrounding the specimen. Showing it
  rising up the tubules from the root-surface side is a schematic route, now labelled on screen ("lab: PBS bath · route
  schematic"). In a root-filled tooth, sealer meets tissue fluid mainly at apical/lateral portals; transport through
  cementum and tubules to the whole canal wall has not been demonstrated. Some premixed sealers also contain a calcium
  phosphate (calcium phosphate monobasic is listed in the composition reported by Lee 2017, Table 2), so not all
  phosphate need come from outside (not on screen).

## What is schematic (and flagged on screen as "schematic · not to scale · time compressed")
- Sizes: grains, tubules (real tubules are ~1–3 µm), molecules and ions share one arbitrary scale. Counts are illustrative.
- Time: setting takes hours to days (≥168 h in Loushine) and mineral deposition takes days to months in the lab (1–90 d in Han & Okiji, 2 months in Sarkar). Here it is compressed into ~16 s; each step chip now carries its real timescale.
- Geometry: straight, evenly spaced tubules; the sealer as a translucent block; one layer of spherical grains plus a few small ones;
  hexagonal Ca(OH)₂ plates (portlandite is hexagonal); apatite as white or mint needles; ion paths are stylised.
- The pH bar's fill end point (~11.6) is illustrative (the knob fades out once the band appears). The dashed 10–12 band is the range for hydraulic sealers in water (Lee 2017).
- The diorama's top face is the canal wall (sealer side) and its base points toward the root surface (callouts "canal side", "toward root surface").
- The sealer is drawn as silicate grains only; the radiopacifier (e.g. ZrO₂) and the non-aqueous vehicle of premixed sealers are omitted for clarity.
- Reaction shown as C₃S/C₂S + H₂O → C–S–H + Ca(OH)₂, labelled "reaction simplified" (no stoichiometry; C–S–H composition is variable).

## Design rationale
- **Isometric diorama, committed:** a true isometric projection (`P(X,Y,Z)`), with every object built from iso boxes,
  iso circles and projected spheres. Light comes from the top-left: top faces are lightest, the left face is mid-tone and
  the right face is darker. Thin white edge highlights give a "clean block" look. Soft, pre-blurred floor and contact
  shadows act as ambient occlusion, plus AO gradients at the base of each face. The plinth and the iso dot lattice make it
  read as a tabletop explainer model.
- **Cut-away tubules:** the two visible faces of the slab are cut sections, so the tubules are open channels. This is
  where the whole story is legible: fluid rising, ions entering, phosphate arriving, tags growing.
- **Colour = chemistry, kept consistent:** water red/white, C₃S/C₂S indigo, C–S–H lilac, Ca(OH)₂ cream-yellow,
  Ca²⁺ green, OH⁻ deep blue, phosphate orange, apatite white/mint. The colours are repeated (as darker, text-safe
  variants) in the coloured caption words and the takeaway ("calcium" green, "phosphate" orange), so the reel decodes
  without sound.
- **One focal point per beat:** each step has one caption, one bottom chip (legend, icon equation or pH gauge) and a
  small source line. Callouts appear only when their structure is introduced (sealer/dentine/tubules early;
  tags/layer at the end, and they stay visible for the poster).
- **Motion:** eased extrude and pop-in at the start, bottom-up hydration wave, ions that decelerate as they diffuse
  (ease-out plus value-noise wobble), sealer contents dimming so the ions lead in steps 3–4, a soft mint-white burst
  where phosphate meets Ca²⁺, a 7 % camera push in step 4 that eases back for the takeaway, a glint sweeping along the
  new mineral layer, and a 0.5 s dissolve into frame 0 for the loop.
- **Type:** Space Grotesk throughout. Captions are 54 px bold (auto-shrink to fit 950 px), the step chip is 30 px tracked
  caps, legends 30–32 px, fine print 23 px. Sub- and superscripts and arrows are drawn by a small rich-text helper, so
  they don't fall back to another font.
- All text sits inside x 64–1016, y 230–1580, and below y 1100 it stays at x < 960. The plinth corner (decoration)
  stays at x ≤ 960 at zoom 1 and only grazes the button column during the 7 % push. The hook and the poster fit inside
  the 3:4 grid crop.
- Determinism: all randomness comes from `Kit.rng(2005)` tables built at load, with `Kit.noise1` for wobble. Static
  background and shadow sprites are built once in `setup()`. Frame cost is about 40–70 ms.

## QA log
- Pass 1 (10 stills): found a blank caption gap at step changes, the pH pill overflowing the left edge and covering
  its source line, wrong channel-fluid gradients on the right face (the axis was skewed), tiny water molecules, and
  the final pill and fine print entering the x > 960 zone.
- Pass 2 (12 stills, `--safe`): fixed the above, shortened captions to meet `readSecs`, retimed the whole reel
  (T1 3.4 / T2 7.3 / T3 11.8 / T4 15.5 / T5 19.4), moved phosphate arrival earlier so the tags are visible while
  their callouts show, softened the grain contact shadows and reduced the lilac haze.
- Pass 3 (transition `--times` 0, 0.5, 3.2, 3.5, 3.8 … 19.3, 19.6, plus 10 more stills): added the water-front tint and the
  takeaway glint; replaced the per-frame blur filter with a sprite (frame time from about 100 ms to about 50 ms);
  measured legend widths in the page (max 778 px, x 151–929); added the "time compressed" note.
- Video: `node reels/tools/render.cjs video reels/samples/20-bioceramic-setting` gives `reels/out/20-bioceramic-setting.mp4`
  (24.0 s, 1080×1920, h264 + silent aac) and `.jpg` poster at 23.2 s. No console errors.
- Review pass (stills r2–r4, `--safe`, 37 frames incl. every transition): fixed step-4 legend and fine print crossing
  x 960, second-layer "snowmen", loopy gel strands, callouts covering the slab during the push, and an escaping ion
  reaching the caption. Re-rendered video: 24.0 s, 720 frames, 30 fps, h264 1080×1920 + aac; no console errors.

## Review changes (independent science + design review, 20 issues applied)
Timeline retimed: T3 11.8 → 10.9, T4 15.5 → 15.1, T5 19.4 → 18.9 (DUR stays 24 s), so the end card holds the hedged
headline for 4.15 s.

**Science**
- Takeaway headline hedged at 56 px: "Water sets it. In vitro, calcium + phosphate form apatite-like mineral." (was
  "…mineralise the interface"). Fine print now carries the slow-set and solubility caveats.
- Hook subtitle "…and grows mineral at the wall" → "…and what can form at the wall".
- Kicker "CALCIUM-SILICATE SEALERS" → "PREMIXED CALCIUM-SILICATE SEALERS"; step-1 caption → "Premixed sealer: water from the
  dentin soaks in". Hydraulic classification (Camilleri 2022) recorded here; the title keeps the familiar word "bioceramic".
- Step-4 sources → "Han & Okiji 2013 IEJ (incl. a premixed sealer, in PBS) / Xuereb 2015 J Endod · MTA: Sarkar 2005 J Endod";
  Han & Okiji 2011 dropped. Tags are shallower (0.22–0.46 vs 0.5–0.8 world units), uneven, and 3 of 11 tubules stay empty.
  NOTES record that the premixed sealer's effect was weaker than MTA/Biodentine.
- Phosphate route flagged on screen: callout "phosphate from tissue fluid / lab: PBS bath · route schematic"; NOTES mention
  calcium phosphate in some premixed sealers.
- Overlap of steps: pH card note "Steps overlap: pH rises within minutes, before setting · Lee 2017"; step-3 chip
  "from minutes"; the hydration wave now runs into step 3.
- Timescales on every step chip (minutes–hours / hours–days / from minutes / days–months (lab)); step-1 chip "Very dry
  canal → may stay unset"; end fine print "Premixed sealers set slowly (days) and need dentin moisture." (Final QA: now "can take days to set").
- Step-1 source → Xuereb 2015 + Antunes 2026 (verified, PMID 41364608); Loushine kept only for "final set ≥168 h" (step 2);
  "excess water reduced microhardness" noted above.
- Solubility caveat added to the end fine print (Donnermeyer 2019; Zhou 2013; Silva Almeida 2017).
- pH label → "~10–12 in lab tests (water)"; knob fades out once the band appears (end point illustrative).
- Callout "mineral tags" → "tag-like Ca–P deposits".
- Legend → "phosphate + Ca²⁺ + OH⁻ → apatite-like" (no PO₄³⁻ species claim; OH⁻ added as reactant).
- Grain legend sub-label "tri-/dicalcium silicate".
- Orientation: callouts "sealer · canal side", "root dentin", "tubules · toward root surface"; radiopacifier/vehicle omission noted.
- "BCA" removed; US spelling throughout (dentin).

**Design**
- pH result label: "rising…" fades out completely (T3+0.9…1.1) before the label fades in (T3+1.15…1.5); knob reaches its end
  point by T3+1.5; label fully visible 2.4 s (needs 2.32 s). No ghosting.
- Step-4 caption shortened to "Phosphate + Ca²⁺ → apatite-like layer" (3.2 s visible, needs 2.62 s).
- End card: sub-pill dropped (moisture message lives in step 1), caveats as 26 px fine print plus 23 px citation lines (one line originally; two since the citation audit).
- Text-only colours: Ca²⁺/calcium #087a57, phosphate #b35500, OH⁻ #3a5bd9, kicker #5a3fd8; particles keep bright colours.
- Focal point: sealer contents (grains, gel strands, plates, gel tint) dim to 50 % from T3+0.3 and restore over T5…T5+0.8;
  ions and phosphate drawn 1.5× (1.27× inside the narrow tubules); the meeting flash is a filled additive mint-white
  burst (radius 14 → 54 px, 0.8 s); a real 7 % camera push in step 4 (pivot 540, 520; reduced from the suggested 15 % so
  the callouts and bottom chip do not cover the slab).
- C–S–H as a matrix: 40 short fibres per grain (0.18–0.40 of radius), 6 gel strands per neighbour pair with tighter bulge,
  continuous gel tint up to alpha 0.32, rim halo alpha 0.2; hydrated core colour less grey.
- Phosphate callout in the lower-left slot (T4−0.05 … T4+2.65), then "tag-like Ca–P deposits" takes the slot from T4+2.65.
- Loop: frame 0 is pre-rendered in setup() and dissolved in over the last 0.5 s; hook title fully opaque on frame 0.
- Poster pill "BIOCERAMIC SEALERS · TAKEAWAY", pill and headline moved down 16 px (pill centre 290, headline 378).
- Hook: callouts start at 2.3 / 2.5 / 2.7 s, after the title read time; camera settles from a lower hook framing.
- Water front: gradient alpha 0.50 → 0.18, white rim 0.95 / 3 px, plus a blue rim on each grain as the front passes.
- pH card moved to y 1354 and tightened (12 px+ clear of the plinth); end camera eases down, not up.
- Interfacial band crest uses value noise plus four facet ticks per face (no sawtooth).
- Second-layer grains replaced by 9 small grains nestled sideways between bottom grains (no "snowmen").
- Kicker and step-chip text 30 px; kicker y 290, title y 378, subtitle y 520.
- OH⁻ recoloured deep blue #3a5bd9.
- Plinth x margin 0.15 (was 0.3), back margin 0.22, base camera shifted 10 px left: at zoom 1 the corner stays at x ≤ 960.
- All text below y 1100 kept at x < 960 (source lines and fine print fit to 820 px; step-4 legend centred at x 528).

## Final QA (fresh-eyes pass)
- Stills: 20 frames (`_stills/final-qa`, incl. t = 0 and 23.95) + 12 transition frames (`_stills/final-qa-tr`), all `--safe`.
  No clipping, overlaps, tofu/fallback glyphs, NaN text or blank frames; all must-read text inside x 64–1016 / y 230–1580 and
  x < 960 below y 1100; hook opaque at t = 0; takeaway held 4.15 s; loop dissolve lands on frame 0. Re-verified on PubMed:
  Loushine 2011, Xuereb 2015, Antunes 2026, Lee 2017 (Table 5: BC Sealer pH 11.64 at 3 min), Han & Okiji 2013, Donnermeyer 2019,
  Camilleri 2011, Sarkar 2005.
- Fix (science, overstatement): end fine print "Premixed sealers set slowly (days) and need dentin moisture." →
  "Premixed sealers can take days to set and need dentin moisture." Setting time varies by product and moisture (EndoSeal MTA
  ~20 h in Lee 2017, which also cites reports in which BC Sealer did set), so "days" is now a possibility, not a rule.
- Video re-rendered: 24.0 s, 720 frames, 30 fps, h264 1080×1920 + aac; poster 23.2 s (takeaway + mineralized diorama,
  inside the 3:4 crop). No console errors.

## Citation audit (2026-11-22)
Every distinct paper cited on screen (`reel.js` source lines and fine print), in `meta.json` (claims[].source and the
caption Refs line) and in this file was checked on PubMed. For each one I matched first author, year, journal, volume/pages
and PMID to a single record and read the abstract (Lee 2017: full text in PMC, Tables 2, 3, 5 and 6), then checked it against
the claim it supports.
- **Verified, no change needed (19):** Xuereb 2015 J Endod 41:111–124 (25442723); Antunes 2026 Aust Endod J 52:168–177
  (41364608); Camilleri 2011 Dent Mater 27:836–844 (21600643); Loushine 2011 J Endod 37:673–677 (21496669); Lee 2017
  Bioinorg Chem Appl 2017:2582849 (28210204); Han & Okiji 2013 Int Endod J 46:808–814 (23402321); Sarkar 2005 J Endod
  31:97–100 (15671817); Donnermeyer 2019 Odontology 107:421–436 (30554288); Camilleri 2022 Int Endod J 55 Suppl 3:710–777
  (35167119); Camilleri 2007 Int Endod J 40:462–470 (17459120); Camilleri, Sorrentino & Damidot 2013 Dent Mater 29:580–593
  (23537569); Marciano 2016 Dent Mater 32:e30–e40 (26727694); Candeiro 2012 J Endod 38:842–845 (22595123); Zhou 2013 J Endod
  39:1281–1286 (24041392); Angkasuvan 2022 Clin Exp Dent Res 8:900–905 (35384399); Silva Almeida 2017 J Endod 43:527–535
  (28216270); Han & Okiji 2011 Int Endod J 44:1081–1087 (21777256); Bohner & Lemaitre 2009 Biomaterials 30:2175–2179
  (19176246); Sabeti 2024 J Endod 50:735–746 (38548045). There were no wrong PMIDs, years, journals or first authors, and no
  textbooks cited as papers. Antunes 2026 and Donnermeyer 2019 were e-published a year early (Dec 2025 / Dec 2018); the print
  year is cited, which is correct.
- **Fixed, on screen (end card):** the fine print "Premixed sealers can take days to set…" had only Xuereb 2015, Han & Okiji
  2013 and Donnermeyer 2019 on its source line, and none of those abstracts reports a multi-day setting time. The source for
  it, Loushine 2011 (≥168 h, Gilmore), appeared only in step 2. The end-card citation is now two 23 px lines,
  "Loushine 2011 J Endod · Xuereb 2015 J Endod" (y 1490) and "Han & Okiji 2013 IEJ · Donnermeyer 2019 Odontology" (y 1517).
  It previously sat on one line squeezed to 22 px, and adding a fourth paper would have pushed it to 18 px. Checked with
  `--safe` stills (`_stills/audit`, t = 19.6 / 21 / 23.2 / 23.75): inside x 64–1016, x < 960, clear of the handle line, and
  the loop dissolve is unaffected. Video re-rendered.
- **Fixed, meta.json:** claim "Ca²⁺ and OH⁻ leach out; pH ~10–12" cited only Lee 2017, which measured pH but not Ca²⁺.
  Added Candeiro 2012 (Ca²⁺ release) and Xuereb 2015 ("all materials leached calcium").
- **Fixed, meta.json:** takeaway claim "…form apatite-like mineral" cited only Donnermeyer 2019, which says "calcium
  phosphate" precipitation, not apatite. Added Han & Okiji 2013 (acicular/lath-like precipitates, Ca/P 1.6–2.0, in PBS).
- **Fixed, meta.json:** the end-card claim's source now names the on-screen source lines.
- **Fixed, meta.json caption:** the Refs line left out four papers named on screen (Antunes 2026, Camilleri 2011,
  Loushine 2011, Sarkar 2005), so a viewer could not look up, for example, "Loushine 2011". The Refs line now lists all eight
  on-screen papers with journals (caption is 788 characters).
- **Fixed, NOTES.md:** item 5 gave "EndoSeal MTA 10.4–11.3" as Lee 2017 Table 5. Table 5 (fresh, 24 h) gives 10.41–10.90,
  and 11.29 is from Table 6 (set samples, 4 weeks). Both are now stated.
- **Fixed, NOTES.md:** the Angkasuvan 2022 caveat now says that the sealer tested was BioRoot RCS (powder/liquid, not premixed).
- **Completed, NOTES.md:** added the PMID for Bohner & Lemaitre 2009 (19176246) and the volume/pages/DOI for Marciano 2016.
- **Video re-rendered once:** `reels/out/20-bioceramic-setting.mp4`, 24.0 s, 720 frames at 30 fps, h264 1080×1920 plus an aac
  track, 6.2 MB; poster at 23.2 s. ffprobe checked and no console errors. A frame pulled from the MP4 at 23.2 s shows the
  two-line end-card citation.

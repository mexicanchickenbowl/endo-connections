# 19 · Hydrodynamic theory — a powers-of-ten zoom

**Duration** 24.0 s · 1080×1920 · 30 fps · silent · poster t = 1.5 s (the gold "zap" pulse running down the pulp)
**Files** `index.html` (page contract), `paint.js` (watercolour engine + nested "plates"), `reel.js` (camera, timeline, live animation, type).
**Output** `reels/out/19-hydrodynamic-theory.mp4` + `.jpg`

## Concept
One continuous camera push with no cuts, Eames "Powers of Ten" style, painted in soft watercolour. A glass of iced
drink is tipped onto an exposed cervical root surface; a gold pulse "zaps" across the dentine and down the pulp's nerve.
The camera dives ×1000 through root dentine, the odontoblast layer and the subodontoblastic capillary plexus, and
arrives at **one dentinal tubule** at the pulp–dentine border: its odontoblast process, the fluid in the lumen, and a
beaded **A-fibre ending in the predentine** (in root dentine, nerve endings stay at the pulp–dentine border and do not
enter the mineralised dentine; Lilja 1979). Cold, applied ~2 mm away at the exposed surface, pulls the fluid outward;
the camera slowly pushes in on the ending, which is tugged and fires (gold impulses run down to the pulp, a live
"nerve firing" trace ticks). A side card then shows Poiseuille's r⁴ law live in a longitudinal tube that narrows along
its whole length: radius 100 → 50 %, flow 100 → 6 %, the main view's fluid slows and the trace goes flat ("quiet").
The camera pulls back to the tooth, whose exposed surface now carries a sealing coat ("Seal the tubules, still the
fluid."). The last frame is the first frame's camera and card, so the reel loops.

A **live scale bar** (fixed 180 px, value = 180 px ÷ current px/µm) and a **zoom factor** (×1 → ×1449) are computed
from the camera every frame. The camera also rolls 90°, so the tubule ends vertical: outward (toward the exposed
surface) is up and the pulp is down.

## Storyboard (s)
| time | picture | on-screen text |
|---|---|---|
| 0–3.4 | Watercolour premolar in section. A glass of iced drink slides in (0–0.3) and pours from 0.12; ice cubes tumble out; splash + frost film on the exposed cervical root (0.66); gold zap from the exposed surface across the dentine and down the pulp nerve (1.12–1.82); snowflake | **Why do cold drinks *zap* sensitive teeth?** / Dentine hypersensitivity: the hydrodynamic theory, zoomed in · label "exposed dentine (gingival recession)" (1.1–3.6) |
| 2.2–8.7 | Continuous log-scale zoom + 90° roll: tooth → cervical wall with visible tubules (plate B) → inner dentine/odontoblasts/pulp (B2) → near-pulp dentine, capillary hairpins, sparse nerve fibres ending at the pulp–dentine border (C) → one tubule (D) | 4.9–8.2 **Dentine is riddled with *fluid-filled tubules*** |
| 8.6–9.4 | Camera settles (×941); labels appear one by one, before the stimulus | labels: dentinal tubule (bracket), odontoblast process, dentinal fluid, A-fibre ending / at the pulp–dentine border, "↑ exposed surface · ~2 mm away" |
| 9.4–12.75 | Slow push ×941 → ×1100. Cold (from 9.8) tints only the top band of the frame; bold cerulean "outward" arrow in the lumen; tracer particles accelerate outward with motion streaks; beads begin to stretch | **Cold, air & sugar pull fluid *outward*** · fine print "heat: inward flow, which the nerves respond to less · Andrew & Matthews 2000" · marker line "cold is applied there" |
| 12.75–15.85 | Push ×1100 → ×1449 centred on the outermost bead; firing starts at 12.7: bead flash, impulses with comet trails run to the pulp, the fibre brightens per spike; live "nerve firing" trace | **Flow tugs the nerve → *sharp pain*** · fine print "mechanosensitive intradental A-fibres (cat) · Andrew & Matthews 2000" / "root dentine: nerve endings stay at the pulp–dentine border · Lilja 1979" |
| 15.0–15.9 | Camera eases back to ×941 and pans the tubule left | — |
| 15.85–20.65 | Card "whole tubule narrowed": painted longitudinal tube, deposit narrows the lumen along its length (16.5–17.7), laminar tracers slow; bars radius 100 → 50 %, flow (∝ r⁴) 100 → 6 %; main-view flow slows by r⁴; firing stops, trace goes flat, "quiet" | **Poiseuille: flow ∝ r⁴** · fine print "sensitive dentine: ~8× more, ~2× wider open tubules · Absi 1987" · card footer (17.6 →) "½ radius → 1/16 the flow" · card fine print "toy model · Hagen–Poiseuille: same pressure, laminar flow" |
| 20.65–22.9 | Pull-back through every plate to the opening camera; live layer (process, ending, tracers) fades with plate D as the zoom passes ×400 → ×200 (≈21.2–21.35 s), mirroring the zoom-in | **Seal the tubules, *still the fluid.*** / The logic behind tubule-occluding desensitisers (same card as the title) |
| 21.0–23.75 | — | fine-print strip: "Leading model; odontoblasts may also sense cold directly (TRPC5 channels · Bernal et al. 2021)" + sources |
| 22.15–24.0 | Static tooth; a mint sealing coat with a gentle shimmer appears over the exposed surface; fades in the last 0.2 s for the loop | label "sealed (tubule orifices occluded)" |

Caption slots are strictly sequential with 0.2 s fades and each stays fully visible ≥ `Kit.readSecs(text)`:
title 3.2 s (needs 2.92), exposed label 2.0 (2.0), A 2.9 (2.62), B 2.95 (2.92), C 2.7 (2.62), D 4.4 (Absi line 4.13),
"½ radius → 1/16 the flow" 2.65 (2.62), takeaway 2.9 (2.62).

## On-screen claims and sources
(PubMed-verified metadata. DOIs are given where PubMed lists one.)

1. **Hydrodynamic theory:** stimuli move fluid in open tubules, and the fluid shift activates pulpal nerve endings, giving short, sharp pain.
   Brännström M. *Sensitivity of dentine.* Oral Surg Oral Med Oral Pathol 1966;21:517–26. PMID 5218158, doi:10.1016/0030-4220(66)90411-7.
   Brännström M, Åström A. *The hydrodynamics of the dentine; its possible relationship to dentinal pain.* Int Dent J 1972;22:219–27. PMID 4505631 (no PubMed abstract or DOI; MeSH: air, cold, hot, dentinal pain).
   Liu X-X et al. BMC Oral Health 2020;20:220. PMID 32762733, doi:10.1186/s12903-020-01199-z.
2. **"Leading model; odontoblasts may also sense cold directly (TRPC5 channels · Bernal et al. 2021)"** (controversy noted on screen).
   Bernal L et al. *Odontoblast TRPC5 channels signal cold pain in teeth.* Sci Adv 2021;7:eabf5567. PMID 33771873, doi:10.1126/sciadv.abf5567 (TRPC5 is a cold sensor in healthy teeth; odontoblasts are the direct site of transduction; mostly mouse data).
   Also Shibukawa Y et al., Pflugers Arch 2015;467:843–63, PMID 24939701, doi:10.1007/s00424-014-1551-x; Liu et al. 2020 (neurosensory mechanisms "remain unclear").
3. **"Cold, air & sugar pull fluid outward".** Liu et al. 2020: evaporative (air), cold and osmotic (sugar) stimuli increase outward flow. Brännström & Åström 1972.
4. **"heat: inward flow, which the nerves respond to less · Andrew & Matthews 2000".** Andrew D, Matthews B. *J Physiol* 2000;529:791–802. PMID 11118506, doi:10.1111/j.1469-7793.2000.00791.x: thresholds 0.3–2.1 nl s⁻¹ mm⁻² for outward vs 2.0–3.5 for inward flow; **all units were more sensitive to outward than inward flow** (cat). The heat → inward direction is not stated in the A&M abstract; it is confirmed by Lin M et al., *PLoS One* 2011;6:e18068 (PMID 21448459, doi:10.1371/journal.pone.0018068), a computational model whose text reports A&M's in-vitro measurements: hot (~55 °C) → inward flow 354–779 µm/s, cold (0–5 °C) → outward flow 531–850 µm/s. (The previous wording "a slower, inward flow" was removed: flow speeds overlap in Lin et al.)
5. **"A-fibre ending / at the pulp–dentine border"; "Flow tugs the nerve → sharp pain"; "mechanosensitive intradental A-fibres (cat)".** Andrew & Matthews 2000 (cat): pressure-sensitive A-fibres, discharge closely related to fluid flow. Närhi M et al., Arch Oral Biol 1994;39 Suppl:23S–30S (PMID 7702462, doi:10.1016/0003-9969(94)90184-8): A-fibres (Aδ and Aβ) respond to hydrodynamic stimuli; hence "A-fibre", not "A-delta".
6. **"root dentine: nerve endings stay at the pulp–dentine border · Lilja 1979"; the ending is drawn in predentine.** Lilja J. *Innervation of different parts of the predentin and dentin in young human premolars.* Acta Odontol Scand 1979;37:339–46. PMID 297429, doi:10.3109/00016357909004706: "No nervous structures were found in the mineralized dentin of the root"; nervous structures were frequently observed in the root predentin; intradentinal nerves were confined to the predentin and most pulpal dentin, supporting an indirect (fluid-mediated) effect of surface stimuli.
   Byers MR, Dong WK. Anat Rec 1983;205:441–54. PMID 6859557, doi:10.1002/ar.1092050409 (monkey, *Macaca fascicularis*, autoradiography; not human): radicular dentine "not innervated in most areas"; endings are profuse in crown dentine near the pulp-horn tips. The root plates therefore show only a **sparse** set of fibres, ending between odontoblasts or in predentine, and a sparse subodontoblastic plexus.
7. **"exposed surface · ~2 mm away · cold is applied there"; cold tint confined to the top band.** The fluid moves before the temperature changes at the pulp wall: Linsuwanont P et al., Arch Oral Biol 2007;52:218–27, PMID 17109811, doi:10.1016/j.archoralbio.2006.10.009 (extracted intact teeth, stimuli applied to enamel; no nerve recordings). The nerve side (intradental discharge after < 1 s of cold, while the temperature at the endings is still far from thermal-receptor threshold) is from earlier in-vivo work as summarised by Lin et al. 2011 (PMID 21448459), not from Linsuwanont. The 2 mm is the cervical dentine thickness of the drawn premolar (2.06 mm), model-specific.
8. **"Poiseuille: flow ∝ r⁴"; "whole tubule narrowed"; "½ radius → 1/16 the flow"; "toy model · Hagen–Poiseuille: same pressure, laminar flow"; bars 50 % / 6 %.** Q = πr⁴ΔP / 8ηL, so (½)⁴ = 1/16 = 6.25 %, **if the radius is halved along the whole length at the same pressure**. The card now shows exactly that condition (a longitudinal tube narrowed along its length, laminar velocity profile). A plug narrowing only the orifice would cut flow far less, because the ~2 mm tubule acts as resistances in series; surface layers with tiny pores dominate dentine's resistance (Pashley DH, Livingston MJ, Greenhill JD, *Regional resistances to fluid flow in human dentine in vitro*, Arch Oral Biol 1978;23:807–10, PMID 299019, doi:10.1016/0003-9969(78)90159-0; no PubMed abstract, so also Pashley DH, Scanning Microsc 1989;3:161–74, PMID 2662395: the ~1 µm smear layer "lowers dentin permeability"). Applied to dentine by Pashley DH, J Endod 1986;12:465–74 (PMID 3465852, doi:10.1016/S0099-2399(86)80201-1; no PubMed abstract) and Prati C, J Dent 1994;22:83–8 (PMID 8195480, doi:10.1016/0300-5712(94)90005-1; abstract: "According to the Poiseuille-Hagen equation, small changes in the functional diameter of dentinal tubules can greatly modify permeability").
9. **"sensitive dentine: ~8× more, ~2× wider open tubules · Absi 1987".** Absi EG, Addy M, Adams D. J Clin Periodontol 1987;14:280–4. PMID 3475295, doi:10.1111/j.1600-051x.1987.tb01533.x.
10. **"Seal the tubules, still the fluid." / "The logic behind tubule-occluding desensitisers"; seal coat at the end.** Pashley 1986; Liu et al. 2020 (most desensitising agents act by occluding patent tubules). Worded as "the logic behind", not efficacy. The coat is schematic.
11. **"Dentine hypersensitivity" / "exposed dentine (gingival recession)".** Liu et al. 2020. (Caption idea: "DH is a diagnosis of exclusion: caries, cracks and pulpitis also give cold pain (Liu et al. 2020).")
12. **Live scale bar and ×-factor.** Exact for the camera: bar value = 180 px ÷ (px per µm).

**Removed from screen:** the tubule-density card (~20 000 vs ~45 000 /mm², Ø 0.9 vs 2.5 µm; Garberoglio & Brännström 1976, PMID 1066114). It is a side fact, its values are coronal (the zoom is into root dentine, which has fewer tubules and a smaller inner/outer difference: Mjör IA, Nordahl I, Arch Oral Biol 1996;41:401–12, PMID 8809302, doi:10.1016/0003-9969(96)00008-8), and its original table could not be checked (no PubMed abstract).

## What is schematic / exaggerated (on screen: "schematic · cell shapes & flow speed not to scale", "toy model", "schematic, not to scale")
- **Flow speed** is slowed for visibility (~9 µm/s peak vs 32–223 µm/s threshold velocities, cat, A&M 2000). Tracer particles are visual markers.
- **Firing** is a toy model: impulses are emitted at a rate that rises with the flow-driven tug on the ending, only during the pain beat (from 12.7 s), with seeded jitter. Impulse travel speed is not to scale.
- **Tubule spacing** (4.7 µm, ≈45 000/mm²) and Ø 2.5 µm are near-pulp coronal values; root dentine has fewer tubules (Mjör & Nordahl 1996).
- **Predentine** is 14 µm (normal range ~10–40 µm). Odontoblasts are drawn as a columnar palisade with apical ends joined against the predentine (junctional complexes), length/width jittered ±12 %; root odontoblasts are often lower.
- **Nerve ending:** one beaded A-fibre terminal running from between the odontoblasts into the predentinal part of the tubule, tip 1.2 µm short of the mineralisation front. Fibril/process/lumen diameters roughly to scale.
- **Odontoblast displacement:** 0.16 µm outward shift of the process during strong flow ("aspiration", A&M 2000; Lin 2011).
- **Poiseuille card:** a uniform deposit halving the radius along the whole tube is a toy model of occluding agents (real deposits are surface layers and patchy plugs).
- **Depth of field:** neighbouring tubules blurred strongly, the cell-body band half as much; an artistic device keeping one focal point.
- **Cold tint** confined to the top band = "the stimulus is at the surface ~2 mm away". The tubule does not physically turn blue.
- **Seal coat** at the end is a schematic varnish/crystal layer.

## Design rationale
- **Style:** pen-and-wash watercolour on warm cold-press paper. Layered translucent fills of recursively deformed polygons (Hobbs-style); **every wash dries with a darker pigment-pooled rim** (2–3 px, ~0.3 of the wash's opacity); wet-edge back-runs ("cauliflowers") inside the large washes; granulation speckle; ink lines that wobble 1–2 px; screen-space paper grain (1.5× stronger, with a ~1 % static dither against banding); warm vignette; zoom-parallax bokeh motes. Live elements (stream, glass, frost film, seal coat, Poiseuille tube, deposit and bars) are painted with the same wash engine instead of flat fills.
- **Continuity engine:** five plates painted once in `setup()` (A tooth 0.12, B cervical wall 0.6, B2 inner dentine/pulp 2.5, C near-pulp 8, D one tubule 52 px/µm) from one shared geometry. B2's tubule striations sit on a separate overlay whose contrast is driven by the on-screen tubule pitch (full only at ≥12 px), so the fast zoom does not shimmer or moiré.
- **Palette:** ivory/ochre dentine, rose pulp, lilac odontoblasts, gold nerve, cerulean cold and fluid, mint seal.
- **Type:** Fraunces 600 (italic accents) on hand-painted paper cards; Inter for labels, data and the scale bar; labels use a cream stroke instead of boxes. Captions ≥ 62 px, labels ≥ 26–30 px, fine print 22–24 px. All text inside the safe area (checked with `--safe`).
- **Loop:** the takeaway uses the title's own card, so at the loop only the text changes; the fine-print strip, seal coat and label fade before the end; the glass fades in over the first 0.14 s.

## Controversy (now on screen as fine print, see claim 2)
The hydrodynamic theory is the leading mechanism but not the whole story: odontoblasts express TRP channels and may
act as sensory transducers, including a direct cold sensor (TRPC5; Bernal et al. 2021). Thermal stimuli on intact
teeth also flex enamel/dentine (Linsuwanont 2007). DH is a diagnosis of exclusion (Liu et al. 2020).

## Change log
- v1: initial build. Fixed a globalAlpha leak that made the `destination-in` feather masks cut every plate to ~25 % opacity.
- v2: added plate B2 (2.5 px/µm) so every decade of zoom has a near-native painting. Shared pulp geometry; wider premolar; gingiva hugging thin bone plates with PDL; soft exposed-dentine band.
- v3: depth of field baked into plate D. Dome-shaped odontoblasts, flared live process, stronger fluid colour, flow streaks, larger impulses, bolder pour.
- v4: strictly sequential 0.2 s-fade caption slots meeting `Kit.readSecs`. Absi 1987 fine print. Scale bar from frame 0 for a seamless loop. Softer paper grain.

## Review changes (v5, after independent science + design review)
**Science**
- *Nerve anatomy (must):* the A-fibre ending no longer sits inside the mineralised root dentine. It now runs from between the odontoblasts into the **predentine** and ends 1.2 µm short of the mineralisation front, with tubular fluid streaming past it. Intratubular fibres removed from plates B2/C; root innervation made sparse (10 fibres ending between odontoblasts or in predentine + a sparse subodontoblastic plexus). Label "A-fibre ending / at the pulp–dentine border"; capC fine print "root dentine: nerve endings stay at the pulp–dentine border · Lilja 1979".
- *Controversy (should):* end fine-print strip "Leading model; odontoblasts may also sense cold directly (TRPC5 channels · Bernal et al. 2021)".
- *Heat (should):* "heat: inward flow, which the nerves respond to less · Andrew & Matthews 2000".
- *Poiseuille condition (should):* the card is now "whole tubule narrowed": a painted longitudinal tube narrowed along its whole length with laminar tracers; footer "½ radius → 1/16 the flow"; fine print "toy model · Hagen–Poiseuille: same pressure, laminar flow".
- *Coronal vs root density (should):* resolved by removing the density card (see "Removed from screen"); spacing listed as schematic.
- *Nits:* "dentinal fluid" anchored in clear lumen; predentine 7 → 14 µm, odontoblast apices joined (palisade), ±12 % jitter, tag "schematic · cell shapes & flow speed not to scale"; cold tint confined to the top band + marker "exposed surface · ~2 mm away · cold is applied there"; subtitle "Dentine hypersensitivity: …", "(gingival recession)"; "(cat)" added to A&M; "plexus of Raschkow" no longer used (subodontoblastic plexus). British spelling kept throughout (house style to be confirmed by the resident).
**Design**
- *Density card (must):* cut; its 3 s went to the Poiseuille beat.
- *Poiseuille timing (must):* pan 15.0–15.9; card + capD 15.85–20.65; occlusion 16.5–17.7 (ease in-out, drives the main-view slowdown); "1/16" line fully visible 17.8–20.45 (2.65 s); takeaway and pull-back moved later (duration 22 → 24 s).
- *Pain beat (must):* firing gated to t > 12.7; impulses with 26 px glowing core, ~170 px halo, 0.25 s comet trail and per-spike fibre brightening (peak alpha ≤ 0.8, no full-frame flash); live "nerve firing" trace (ticks per spike, goes flat + "quiet" after occlusion).
- *Hook (should):* tipped glass of iced drink slides in from frame 1; 60 → 30 px painted stream with drifting glints and shed drops (no straight highlight, no square crystals); three rounded ice cubes tumble out; snowflake drawn; real zap (≥ 160 px glow, gold trail from the exposed dentine to the pulp and down its nerve, 1.12–1.82 s); poster 1.5 s.
- *Tubule composition (should):* camera kept alive: push ×941 → ×1100 (9.4–12.5), then ×1100 → ×1449 centred on the outermost bead (12.5–15.0), then ease back for the card. With the ending now below the mineralisation front, the world origin sits at y 880 so 6 µm of tubule shows between the card and the front, cells take ≤ 7 % of the height; bold cerulean "outward" arrow in the lumen; 30 px surface marker.
- *DOF (should):* strong blur only on neighbouring tubules, half blur on the cell-body band, pigment-pooled rims on the soft neighbour cells and processes.
- *Tubules during the zoom (should):* capA 4.9–8.2; plate B draws every tubule faintly + every 4th as a clear line; B2 striations on a pitch-driven overlay; plate C stripe contrast −40 %.
- *Pull-back (should):* live layer fades in 0.25 s; pull-back eased, static payoff 22.9–24.0 s; the exposed surface comes back with a mint sealing coat + shimmer + "sealed (tubule orifices occluded)".
- *Watercolour (should):* pooled rims on every wash, targeted back-run blooms in dentine, pulp and gingiva, paper grain ×1.5 with dither, ink wobble, odontoblast jitter, washes instead of flat fills for live elements.
- *Labels (should):* appear 8.6–9.4 before the stimulus (cold starts 9.8); "odontoblast" replaced by a "dentinal tubule" bracket across the lumen.
- *Safe area (should):* exposed label at x 72 (1.1–3.6 s, title to 3.4 s); surface marker moved right of the tubule at 30 px.
- *Scale bar (should):* blurred halo replaced by a painted paper chip.
- *Nits:* ∝ at 64 px with 0.6 px stroke, "4" at 40 px Fraunces, −4 px gap; takeaway on the title's card with sources on a separate strip (loop = text change only); handle 0.85 alpha with a cream stroke; plate D raised to 52 px/µm so the push stays sharp.
- *File size (nit):* render tool output (CRF 18) is 31.5 MB / 24.0 s (720 frames, ffprobe-verified). A CRF-22 re-encode of the same content is 15.4 MB with no visible banding in the soft washes (the paper layer now carries a ~1 % static dither).
- *Firing model check:* 16 impulses between 12.8 and 17.0 s (~3.8 Hz); the trace reads "quiet" from ~17.45 s, just before the "½ radius → 1/16 the flow" line.

## Final QA (fresh-eyes review)
- Checked 38 stills (0–23.95 s, `_stills/final-qa`, `final-qa2`, `final-qa3`) with `--safe`: no clipped, overflowing or overlapping text, no tofu/NaN glyphs, all must-read text inside the safe area; hook readable at t = 0; takeaway held 20.85–23.75 s; loop camera/card identical. Poster (t = 1.5 s) reads well inside the 3:4 crop.
- Re-verified on PubMed: Absi 1987 (PMID 3475295: ~8× more tubules/unit area, ~2× wider), Lilja 1979 (297429), Andrew & Matthews 2000 (11118506), Bernal 2021 (33771873), Brännström 1966 (5218158), Pashley 1986 (3465852), Liu 2020 (32762733).
- **Fixed (continuity):** on the pull-back the live layer was faded by *time* (20.65–20.9 s) while plate D was still full-screen, so the odontoblast process and A-fibre ending popped out and left an empty tubule for ~0.5 s under "Seal the tubules" (could read as sealing removing the process). `liveL` is now zoom-coupled only (`seg(z, 1.12, 1.42)`), so the process and ending fade with plate D exactly as they appeared on the zoom-in. Video re-rendered.
- Not changed (taste / previously reviewed): secondary label lines at 26 px ("~2 mm away", "cold is applied there", "at the pulp–dentine border"); outlined watercolour back-run blooms in plate A dentine/pulp (a clinician could read the pulp bloom as a denticle at a glance).

## Citation audit (v6)
Every citation on screen (capB/capC/capD fine print, end strip), in `meta.json` (claims[].source, caption Refs line) and in this file was checked on PubMed. For each one, first author, year, journal, volume/pages and PMID were checked against the same record, and the abstract (or PMC full text for Liu 2020 and Lin 2011) was read against the claim it supports. All 17 PMIDs resolve to the cited paper. No hallucinated, garbled or mismatched reference was found. On-screen citations are all correct, so **the reel and video are unchanged** (the citation frames of the current mp4 were checked at 11.5, 14.5, 19.0 and 22.5 s).
- **Support gap fixed (NOTES claim 7):** Linsuwanont 2007 was cited for "the fluid moves, *and the nerve responds*, before the pulp cools". That study used extracted intact teeth (stimuli on enamel) and recorded no nerves. Reworded; the nerve-latency point is now attributed to Lin et al. 2011. The meta source now names the model (extracted intact teeth, stimuli on enamel).
- **Support gap fixed (heat → inward):** the Andrew & Matthews 2000 abstract supports "nerves respond less to inward flow" but does not state that heat drives inward flow. Lin et al. 2011 (PMID 21448459) was added to the meta source and to NOTES claim 4; it reports A&M's in-vitro hot → inward / cold → outward measurements. The on-screen attribution to A&M 2000 stays.
- **Caption Refs incomplete:** the Refs line omitted the primary sources for two caption claims: Liu 2020 (cold/air/sugar → outward flow; DH is a diagnosis of exclusion; occluding desensitisers) and Pashley 1986 (r⁴ / tubule occlusion). Both added.
- **Poiseuille support:** Pashley 1986 has no PubMed abstract, so Prati 1994 (whose abstract invokes Poiseuille–Hagen for tubule diameter) was added to the meta source. The same applies to Pashley et al. 1978 (no abstract), so Pashley 1989 (PMID 2662395) was added for the smear-layer resistance point.
- **"Leading model" support:** the meta source was Bernal 2021 alone, which supports only the alternative (odontoblast TRPC5). Liu 2020 ("widely accepted explanation"; mechanisms "remain unclear") was added.
- **Species:** Byers & Dong 1983 is monkey (*Macaca fascicularis*) autoradiography; now labelled as such.

# 11 · How far past the plugger tip does gutta-percha soften? (simulated thermal-camera reel)

**Files:** `index.html` (page shell), `sim.js` (toy heat model, precomputed in `setup()`), `reel.js` (all drawing; pure `render(t)`).
Output: `reels/out/11-heat-plugger-gp.mp4` + `.jpg`.
**Duration:** 24.0 s · 1080×1920 · 30 fps · silent · poster t = 6.95 s (HEAT ON, hot tip, 60 °C front at ~0.8 mm)

## Concept
The whole reel is styled as footage from an **infrared (thermal) camera**, but it is a **simulation**, and the frame says so:
the HUD reads `● SIM`, every readout carries "(model)", and the fine print reads
"SIMULATED IR VIEW · TOY HEAT MODEL · NOT REAL FOOTAGE / TUNED AT 3 EX VIVO POINTS · OTHER TEMPERATURES ILLUSTRATIVE".
The look:
- **Ironbow palette** (black → indigo → purple → magenta → red → orange → yellow → white) on a fixed log-like 30–200 °C
  scale (tagged "log scale" under the °C colour bar). The bar marks 60 °C (cyan, the isotherm) and 47 °C (pink, bone threshold).
- The field is drawn at sensor resolution (270×480) and upscaled; sensor noise (temporal + fixed-pattern), vignetting,
  a boot scan line at frame 0 and a power-down scan line at the end.
- **Edge overlay** (as in visible-light edge blending on some IR cameras) outlines root, canal, apical foramen, crown, bone crest and plugger.
- **Isotherm mode**: GP pixels ≥ 60 °C get diagonal cyan hatching (GP only, never dentin); the 60 °C contour is drawn
  at full strength inside the GP column and faint (34 % alpha, 2 px) where it runs through dentin.
- **Max-hold mode** (a real thermal-camera convention): after heat-off the live contour hands over to a dotted max-hold contour,
  and in the takeaway the whole raster blends to the max-hold image (`MAX HOLD` tag in the HUD).
- **Spot meters** Sp1 (in GP) and Sp2 (outer root surface) with crosshairs and readouts refreshing at 10 Hz
  (big number = temperature rise, small = absolute), and a trend plot of Sp2.
- Share Tech Mono HUD: `● SIM`, `IR · IRONBOW`, HEAT ON/OFF chip, model clock (`STBY` before heat-on) and playback rate.

Story: whole tooth with labels (dentin, bone, gutta-percha) while a cold (room-temperature) plugger drops into the access
→ heat on in view at 2.4 s while the question is still up → the camera follows the tip down to WL−4 mm while the cyan
60 °C front rides with it → the front creeps to 0.8 mm past the tip and **STALLS** → Sp1 2 mm past the tip reads only
~+3–4 °C → Sp2 on the outer root surface stays far below +10 °C (with the controversy cited) → takeaway in max-hold:
**Heat stays local. Downpack to ~3–5 mm short of WL.**

## Storyboard (reel seconds)
| time | picture | on-screen text |
|---|---|---|
| 0.0–0.5 | boot scan line reveals the purple (37 °C) tooth | hook panel already up |
| 0.3–2.4 | whole tooth, slow push-in (34 → 36 px/mm). Cold plugger descends to the orifice (0.3–1.6). Labels dentin / bone / gutta-percha (0.4–2.9) and "heat plugger (room temp)" (0.5–2.65) | **HOOK** "THERMAL VIEW · WARM VERTICAL" / **"How far past the plugger tip does GP soften?"** (fully visible 0–3.7 s) |
| 2.4–4.4 | HEAT ON. Plugger driven orifice → WL−4 mm in 2 s (real time); camera zoom locked to the tip (tip kept at y ≈ 940–1000). Live 60 °C contour + GP hatch ride with the tip | in-field tag: "● HEAT ON / dial 200 °C / model tip 150 °C / tip to WL x.x mm" |
| 4.05–9.45 | playback eases to 0.65×. Ruler, tip line, bracket and reading (dim while growing: 0.6 → 0.8 mm). Heat off at 7.14 s; front stalls at 7.25 s → reading turns solid cyan, one 0.3 s outline pulse, "STALLS" tag; live contour cross-fades to the dotted max-hold contour ("MAX HOLD") | "CYAN LINE = 60 °C ISOTHERM" / **"GP reaches flow temp (≥60 °C) only ~1 mm past the tip"** + source + 2 model notes (fully visible 4.4–9.1 s) |
| 9.45–13.75 | Sp1 crosshair on the canal axis 2 mm past the tip; readout ≈ +3.8 → +3.0 °C (model) | "SPOT METER Sp1 · IN GP" / **"2 mm past the tip: only ~4 °C warmer"** + source (fully visible 9.8–13.4 s) |
| 13.75–18.95 | Sp2 crosshair on the outer root surface at 4.75 mm from WL; readout ≈ +3.3 → +2.4 °C (model); trend plot sweeps in from 13.8 s: white trace, pink end dot, dashed "+10 °C limit (47 °C)" | "SPOT Sp2 · OUTER ROOT SURFACE" / **"Root surface: usually under +10 °C"** "at a 200 °C dial (ex vivo)" + 3 source lines (fully visible 14.1–18.6 s) |
| 18.95–24.0 | raster blends to MAX HOLD, camera pans 50 px right. Ruler with a cyan 3–5 mm band; left brackets: "softened ~1 mm" (tip → 1 mm), "warm 41–55 °C (model)" (1–2 mm), "compacted near body temp" (2 mm past tip → WL); dotted "peak 60 °C (max hold)". Power-down scan line 23.6–23.97 s blacks out the raster (loops black-to-black into the boot) | **TAKEAWAY** / **"Heat stays local."** / **"Downpack to ~3–5 mm short of WL."** + 2 source lines (fully visible 19.3–23.6 s) |

Reading times (`Kit.readSecs` of the caption): hook 3.7 s (needs 3.5), S2 4.7 s (4.1), S3 3.6 s (3.2), S4 4.5 s (4.4),
takeaway 4.3 s (3.8). In-field labels: plugger label 1.6 s fully visible, anatomy labels 1.9 s. Readable text ≥ 26 px except
fine print/source lines (22–24 px); captions 50–80 px. Everything readable sits inside x 64–1016, y 230–1580 and outside the
right-hand button column.

## On-screen claims and sources (abstracts read via PubMed)
1. **"GP reaches flow temp (≥60 °C) only ~1 mm past the tip"** (live 60 °C isotherm; model max-hold 0.8 mm).
   - Yu Y et al. *J Dent Sci* 2023;18:9-16. PMID 36643252. doi:10.1016/j.jds.2022.08.003. IR analysis in a 3D-printed model: GP > 60 °C only within 1 mm beyond the heat-carrier tip; GP a poor thermal conductor.
   - Briseño Marroquín B et al. *J Endod* 2015;41:79-82. PMID 25134732. doi:10.1016/j.joen.2014.07.004. IR camera, carrier preset 200 °C: ≥ 65 °C reached 1.05 ± 0.28 mm into GP; GP "undergoes deformation at temperatures above 65 °C"; carrier temperatures unstable (147–474 °C).
   - Both are **bench** IR studies (printed model / bisected teeth), not in situ under compaction — the source line says "Bench IR thermography".
   - 60 °C as "flow temp": the top of the commonly cited α → amorphous range (53–59 °C; Schilder, Goodman & Aldrich, Oral Surg Oral Med Oral Pathol 1974;38:109-14, PMID 4525950, no abstract) and the Yu 2023 threshold. The β → α transition (commonly cited ~42–49 °C; brand-dependent per Liao 2021 Int Endod J, PMID 34420210, doi:10.1111/iej.13615) already makes GP partly plastic, so 60 °C is a *flow* threshold, not the onset of any softening. Neither phase range is shown as a number.
2. **"2 mm past the tip: only ~4 °C warmer"** (Sp1, model +3.8 °C peak).
   - Villegas JC et al. *Int Endod J* 2005;38:218-22. PMID 15810971. doi:10.1111/j.1365-2591.2005.00934.x. Split-tooth model, thermocouples in holes in the canal **wall**: plugger at WL−4 → +4 ± 1 °C at 2 mm from WL (+6 ± 1 °C at 4 mm, i.e. at the tip level), and no replication of the 2 mm depressions. Plugger at WL−2 → +14 ± 3 / +12 ± 2 °C. Source line: "(plugger at WL−4 mm; canal-wall thermocouples, ex vivo)".
3. **"compacted near body temp"** (takeaway bracket, now only from 2 mm past the tip to WL) and the 1–2 mm band **"warm 41–55 °C (model)"**.
   - Villegas 2005 (+4 ± 1 °C at 2 mm past the tip), shown as the takeaway's second source line.
   - Venturi M et al. *Int Endod J* 2002;35:740-6. PMID 12449024. doi:10.1046/j.1365-2591.2002.00553.x. Conclude apical GP is compacted at body temperature — but they measured the **outer root surface** (≈ 0.5–0.9 °C apically), so their GP statement is an inference. Not cited on screen.
   - The 41–55 °C numbers are the model's peak axial GP temperatures at 2 mm and 1 mm past the tip, labelled "(model)".
4. **"Root surface: usually under +10 °C at a 200 °C dial (ex vivo)"**.
   - Under +10 °C: Sweatman TL et al. *J Endod* 2001;27:512-5. PMID 11501588. doi:10.1097/00004770-200108000-00004 (System B 200/250/300 °C never exceeded +10 °C externally); Lee FS et al. *J Endod* 1998;24:617-20. PMID 9922753. doi:10.1016/S0099-2399(98)80123-4.
   - Over +10 °C (shown on screen): Lipski M. *Oral Surg Oral Med Oral Pathol Oral Radiol Endod* 2005;99:505-10. PMID 15772602. doi:10.1016/j.tripleo.2004.07.014 — System B CW raised the root surface by **> 10 °C in mandibular central incisors** (thin dentinal walls; IR camera); Mc Cullagh JJ et al. *Int Endod J* 2000;33:326-32. PMID 11307207. doi:10.1046/j.1365-2591.2000.00302.x — CW downpack in premolars, mean surface rise **13.9 °C (thermocouple) / 28.4 °C (IR)**; the second (separation) activation always caused a secondary rise.
   - Further caveats (NOTES only): Floren JW et al. J Endod 1999;25:593-5 (PMID 10687534, doi:10.1016/S0099-2399(99)80314-8), ~+10.6 °C at settings ≥ 250 °C; Silver GK et al. Int Endod J 1999;32:287-95 (PMID 10551120), > +10 °C with Touch 'n Heat.
5. **"+10 °C limit (47 °C)"** and **"47 °C for 1 min injures bone (rabbit)"**.
   - Eriksson AR, Albrektsson T. *J Prosthet Dent* 1983;50:101-7. PMID 6576145. doi:10.1016/0022-3913(83)90174-9 (no abstract on PubMed).
   - Eriksson RA, Albrektsson T. *J Oral Maxillofac Surg* 1984;42:705-11. PMID 6593442. doi:10.1016/0278-2391(84)90417-8 — rabbit tibia bone-growth chamber: 47 or 50 °C for 1 min reduced bone formation, 44 °C did not.
   - The threshold is **time-dependent** (1 min). The chart covers only 12 s of model time and is labelled "Sp2 · model · downpack only": external peaks can come late (Viapiana R et al. J Endod 2014;40:555-61, PMID 24666911, doi:10.1016/j.joen.2013.09.026: maximum ~1.5 min after heating began), and the separation burst and backfill add heat (Mc Cullagh 2000).
6. **"Downpack to ~3–5 mm short of WL"** — ex vivo adaptation/leakage evidence only; no clinical outcome data.
   - Smith RS et al. *J Endod* 2000;26:668-72. PMID 11469298. doi:10.1097/00004770-200011000-00009 — adaptation ranked heat at 3 > 4 > 5 > 7 mm from WL.
   - Guess GM et al. *J Endod* 2003;29:509-12. PMID 12929697. doi:10.1097/00004770-200308000-00005 — System B plugger depth 3.5–4.5 mm from WL gave the best adaptation.
   - Zhang C et al. *Int Endod J* 2011;44:1041-6. PMID 21906086. doi:10.1111/j.1365-2591.2011.01919.x — 3 and 5 mm depths similar, both better than 7 mm.
   - Yared GM, Bou Dagher FE. J Endod 1995;21:152-3 (PMID 7561659) compared only 5, 7 and 9 mm short (5 and 7 leaked less than 9); it does not support 3–4 mm, so it was dropped from the screen.
   - Trade-off: **deeper = better adaptation, but more apical heat** (Villegas 2005: +14 °C at 2 mm with the plugger at WL−2) and more extrusion risk. The data lean towards the deeper end; "~3–5 mm" is the commonly taught window.
7. **"dial 200 °C"** / **"model tip 150 °C: real tips run below the dial (Atmeh 2020 IEJ)"**.
   - Atmeh AR, Hadis M, Camilleri J. *Int Endod J* 2020;53:698-708. PMID 31955442. doi:10.1111/iej.13269 — none of the carriers reached the set temperature; the 4 s cut-out mode reached 110 °C, continuous mode higher.
   - Hadis M, Camilleri J. *Dent Mater* 2020;36:1183-9. PMID 32505536. doi:10.1016/j.dental.2020.05.008 — none reached the dial.
   - Briseño Marroquín 2015 recorded 147–474 °C at a 200 °C preset, so real tips are also unstable. 150 °C is inside both ranges; it is a model setting, not a measurement.
8. **"Model heat held 1.8 s at depth (simplified; no separation burst)"** — see the model section.

## What is modelled or schematic
- **Anatomy** (schematic single-rooted premolar-like tooth, axisymmetric): root 14 mm to WL plus a rounded apex 0.85 mm beyond WL;
  the root taper is C1-continuous into the apical cap (no shoulder). The prepared canal (size 40, .06) ends at WL against an
  apical seat; beyond it an **unprepared apical canal** (~0.22 mm minor constriction widening to ~0.32 mm) runs to a **foramen** ~0.8 mm
  beyond WL and is filled with periapical tissue at 37 °C (GP ends at WL). Crown 8 mm with convex buccal/lingual profiles, two
  cusp tips and an access cavity flared occlusally (funnel) down to the orifice. Plugger 0.48 mm tip, gentle taper. Ruler in true model mm.
- **Toy heat model** (`sim.js`): axisymmetric explicit finite-volume diffusion on a 0.1 mm grid, moving Dirichlet plugger at
  **T_tip = 150 °C** (below the 200 °C dial), shank falling to ≥ 30 % of the excess (cf. ~80 °C on the shank, Viapiana 2014).
  Contact conductance at the plugger surface (1.2 relative; 0.25 where the grid puts dentin directly against the plugger,
  i.e. an unresolved GP/sealer film). Perfused PDL/bone/periapical tissue relaxes to 37 °C (0.15 s⁻¹); air insulates.
  Relative k (C): tissue 0.5 (3.8), dentin 0.40 (2.8), GP radial 0.45 (2.0), **GP axial 1.8 (2.0)**.
  - **GP diffusivity is a tuning parameter, not a measured value.** Radially, GP's diffusivity is ~1.6× dentin's (close to measured
    conductivities: GP ~0.42–1.07 vs dentin ~0.6 W/m·K). Axially it is set much higher, as a lumped stand-in for the apical flow of
    softened GP pushed ahead of the plugger, which a pure conduction model lacks. Nothing on screen claims that GP conducts better than dentin.
  - Tuned at **three anchors only** (plugger at WL−4): 60 °C front ~1 mm past the tip → model **0.84 mm** (reads "0.8 mm");
    +2 mm point ~+4 °C → model peak **+3.8 °C**; outer root surface < +10 °C → model peak **+3.4 °C** (at 4.75 mm from WL; Venturi
    measured ~4 °C cervically).
  - **Everything else is illustrative**, and it disagrees with some data: the GP/dentin interface at the tip level peaks at ~92 °C
    (+55 °C) in the model, whereas Villegas 2005 recorded only +6 ± 1 °C at the canal wall at that level (thermocouples). The
    IR studies used for anchor 1 and the thermocouple data cannot both be matched by any conduction model; the IR anchor was kept.
    One grid row has dentin touching the plugger and peaks at ~123 °C (discretisation artefact). Dentin ≥ 60 °C extends ≤ 0.55 mm
    into the wall at 2 mm above the tip and ~0.1 mm at 5 mm above it. To keep this from reading as "dentin softens", hatch and the
    strong contour are restricted to GP.
  - Heating schedule: heat on at the orifice, 2 s plunge to WL−4 mm, **heat held 1.8 s at depth**, then off (tip cools, τ = 1.4 s).
    Standard CW releases the switch at/just before the binding point, holds pressure without heat, and ends with a ~1 s separation
    burst (which adds a secondary surface rise, Mc Cullagh 2000). Both departures are stated on screen in the S2 panel.
- Display offsets (tissue −1 °C, dentin ±0.15 °C texture, GP +1.8 °C) mimic emissivity contrast so the GP column reads as a faint lighter stripe at 37 °C.
- HUD model clock is honest: plunge at 1×, then 0.65× slow motion ("0.65x").

## Design rationale
- One focal point at a time: hook + whole tooth (with labels) → hot tip descending (camera locked to it) → cyan front + ruler +
  STALLS → Sp1 → Sp2 + chart → takeaway in max-hold. In-field labels have a dark halo.
- Ironbow + cyan: cyan never occurs in ironbow, so isotherm, ruler bracket and takeaway band always pop. Pink = surface/47 °C story,
  amber = Sp1 and the "warm" band.
- Max-hold (dotted contour, raster blend, `MAX HOLD` tag) avoids the post-heat "horned" live contour and makes the takeaway image
  literally show heat confined to the plugger path with a purple apical ~3 mm.
- Loop: power-down scan line at 23.6–23.97 s ends on black; frame 0 boots from black.

## QA log
- Pass 1–3 (first build): crown, gingival margin, chart overflow, contour clipping sign error, caption timing, slower plugger cool-down.
- Review pass: see below. Checked stills at 0, 0.4, 0.8, 1.2, 1.8, 2.2, 2.3, 2.6, 3.0, 3.3, 3.6, 3.9, 4.0, 4.3, 4.6, 4.9, 5.5, 5.6, 6.0,
  6.95, 7.3, 7.5, 7.6, 8.4, 8.6, 9.2, 10.8, 11.5, 12.5, 13.2, 14.2, 15.6, 16.5, 17.5, 18.0, 19.0, 19.4, 20.2, 20.4, 21.5,
  23.75, 23.8, 23.93, 23.95 with the safe-area overlay; no console errors.

## Review changes (independent science + design review)
Science:
- **Root-surface claim made conditional, controversy shown**: "Root surface: usually under +10 °C — at a 200 °C dial (ex vivo)";
  source lines "Under +10 °C: Sweatman 2001, Lee 1998 (System B, ex vivo)" and "Over +10 °C: Lipski 2005 (thin roots), Mc Cullagh 2000".
  Lipski 2005 and Mc Cullagh 2000 added above (abstracts verified on PubMed).
- **No longer presented as a real recording**: `● REC` → `● SIM`; "(model)" on the Sp1/Sp2 readouts, the ruler reading
  ("0.8 mm / past tip / (model)"), the chart axis and the 41–55 °C band; fine print raised to 26/24 px at 84 % opacity:
  "SIMULATED IR VIEW · TOY HEAT MODEL · NOT REAL FOOTAGE" / "TUNED AT 3 EX VIVO POINTS · OTHER TEMPERATURES ILLUSTRATIVE".
- **Tip temperature and dentin heating**: model tip lowered 200 → 150 °C ("model tip 150 °C" in the plunge tag;
  "Model tip 150 °C: real tips run below the dial (Atmeh 2020 IEJ)" in S2); plugger contact resistance added (plus a sub-grid
  GP film where dentin touches the plugger); GP made anisotropic and re-tuned. Canal-wall temperature at the tip level fell from
  ~134 °C to ~92 °C, and dentin ≥ 60 °C from ~0.85 mm to ≤ 0.55 mm into the wall. It is still far above Villegas' +6 °C (documented above:
  not reconcilable with the IR anchor); hence the "OTHER TEMPERATURES ILLUSTRATIVE" fine print and the GP-only hatch/contour emphasis.
- **Takeaway brackets**: "compacted near body temp" now spans only WL → 2 mm past the tip; new amber 1–2 mm band "warm 41–55 °C (model)";
  source "Apical GP: +4 ± 1 °C at 2 mm past the tip (Villegas 2005)". Venturi's outer-surface caveat noted above.
- **S2 caption**: "GP reaches flow temp (≥60 °C) only ~1 mm past the tip"; source "Bench IR thermography: Yu 2023 JDS · Briseño Marroquín 2015 J Endod".
- **Plug depth**: "Downpack to ~3–5 mm short of WL"; source "Ex vivo adaptation: Smith 2000 · Guess 2003 J Endod · Zhang 2011 IEJ"
  (Guess 2003 verified); Yared 1995 removed from screen; depth/heat trade-off added above.
- **Bone threshold**: "47 °C for 1 min injures bone (rabbit): Eriksson & Albrektsson 1983/1984"; chart labelled "downpack only" (model);
  window widened 9 → 12 s; Viapiana 2014 late-peak caveat added above.
- **Apex anatomy**: unprepared apical canal (minor constriction) to a foramen ~0.8 mm beyond WL, filled with 37 °C periapical tissue;
  GP ends at WL; C1-continuous root taper into the apex, outline drawn as one continuous side ending at the foramen (no shoulder, no V-point).
- **Heating schedule**: kept (heat held 1.8 s), stated on screen: "Model heat held 1.8 s at depth (simplified; no separation burst)".
- Nits: Sp1 source now says canal-wall thermocouples; hatch restricted to GP and contour label "peak 60 °C (max hold)"; "log scale" tag
  under the colour bar; GP diffusivity documented as a tuning parameter (above).

Design:
- **Opening compressed**: plugger descends 0.3–1.6 s, heat on at 2.4 s (was 4.6) in view below the hook panel; slow push-in
  0.5–2.4 s so the hook frame is never static; anatomy labels moved into the hook (0.4–2.9 s) with leaders recomputed per frame.
- **Heat-on in view**: zoom runs 2.4–4.4 s locked to the plunge (tip held at y ≈ 940–1000); the S1 card was replaced by an in-field
  tag ("● HEAT ON / dial 200 °C / model tip 150 °C / tip to WL x.x mm") left of the plugger, so nothing covers the plunge path.
- **Hatch/contour**: GP-only hatch (coarser, ~32 px period: `((px+py)&7)<3`), contour strong only inside the GP column, faint in dentin.
- **Horns removed**: live contour cross-fades to the dotted max-hold contour at heat-off (7.14 s), carried through to the takeaway.
- **Text durations**: all captions now meet `Kit.readSecs` (see Storyboard); S2 4.7 s, S3 3.6 s, S4 4.5 s with the chart sweep starting at 13.8 s;
  plugger label 1.6 s, anatomy labels 1.9 s.
- **Sp2 scene**: white trace with pink end dot (matches the crosshair); dashed line labelled "+10 °C limit (47 °C)" at 30 px;
  "peak" label removed; readouts show the rise big (42 px) and the absolute small.
- **Sizes**: "past tip" 32, "mm to WL" 30, "+10 °C limit" 30, chart axes 26, readout labels 28, "(room temp)" 30, "peak 60 °C" 30.
- **Takeaway frame**: raster blends to MAX HOLD (HUD tag) over 18.95–19.75 s; 3–5 mm band = solid cyan outline + 15 % fill;
  camera pans 50 px right to fit the three left brackets.
- **Isotherm sweep/stall dramatised**: contour visible from heat-on, riding down with the tip; reading dim while growing, then solid
  cyan + one 0.3 s outline pulse + "STALLS" tag at 7.25 s.
- **Crown/apex shapes**: crown with convex profiles, two blunt cusp tips and a funnel access; smooth apex with foramen.
- Nits: "tip" label at the right end of the tip line; all in-field labels haloed; "bone" now has a leader; GP display offset 0.7 → 1.8;
  0.37 s power-down scan line (black-to-black loop); clock shows "STBY" until heat-on; poster moved to 6.95 s (HEAT ON);
  S3 kicker "SPOT METER Sp1 · IN GP".

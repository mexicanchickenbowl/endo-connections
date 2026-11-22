# 08 · EDTA — the calcium claw

**Style:** 3-D molecular render. three.js r169 (vendored) ball-and-stick, glossy CPK spheres
(MeshPhysical + clearcoat, RoomEnvironment reflections), warm key / cool rim / hemisphere fill, ACES tone mapping,
camera-distance-driven fog for depth, dark navy radial-gradient backdrop with faint bokeh. Minimal Inter type,
2-D labels pinned to projected 3-D atoms. Silent, 25.7 s, 1080×1920 (was 22 s; review fixes added a climax hold, 1-min hold, NaOCl step, eroded hold and a longer card).

**One-line concept:** a hexadentate "claw" (EDTA⁴⁻) closes six bonds around one Ca²⁺, pulls it out of the
mineral, and — zoomed out ×10⁴ — that is why a 1-min EDTA rinse clears the smear layer and opens tubules
(and why 10 min followed by NaOCl erodes dentine).

## Files
- `index.html` — page contract, scene graph, choreography, 2-D overlay, takeaway card.
- `chem.js` — schematic Ca–EDTA geometry. The closed complex is solved by constraint relaxation
  (N–C 1.47, C–C 1.52, C–O 1.26, Ca–N 2.60, Ca–O 2.40 Å; sp3 angles 108–112°, carboxylate 117/125°; C2 symmetry).
  Result: N–Ca–N 70°, other cis donor angles 69–107°, i.e. a distorted octahedral cage. The "open claw" is a second
  relaxed conformation with the arm tips pulled out; in-between frames interpolate and re-project bond constraints
  (40 iterations, deterministic) so bond lengths stay within ~1–3 % while the arms swing. H atoms are re-placed
  tetrahedrally every frame.

## Storyboard (s) — after review (25.7 s)
| t | Beat | On screen |
|---|------|-----------|
| 0–3.15 | **Hook.** Eased push-in (60 → 37 Å, outQuint) on the free, centred EDTA; one claw "flex" (arms dip to 55 % and reopen, 0.15–1.1 s). Molecule fades in over 0.25 s from the title-only loop frame. | "The calcium claw" / "How EDTA opens tubules" (held 2.95 s); plate "EDTA / binds as EDTA⁴⁻" at the bounding-box top-right; atom legend |
| 3.1–5.3 | **Target.** Camera tilts to the toy apatite patch while EDTA descends; ringed surface Ca²⁺. | caption "Target: apatite Ca²⁺"; single Ca²⁺ pin; header "Chelation / schematic 3-D model · atom sizes not to scale / toy apatite lattice"; 2 Å scale bar top-right |
| 5.3–8.3 | **Claw.** Camera close-up finished by 5.95 s; during the claw the azimuth drifts only ~0.12 rad. Four carboxylate arms close one by one (O bonds 6.75, 7.17, 7.59, 8.01 s), then the two amine N bind last (8.10, 8.22 s); Ca²⁺ lifted. | caption "Six donor atoms grip one Ca²⁺"; counter O⁻ O⁻ O⁻ O⁻ N N "= n bonds"; fine print "binding order schematic; real complex also binds water" |
| 8.3–9.35 | **Climax hold.** Lock accent at 8.3 s (Ca glow 6 → 9 → 6, "= 6 bonds" scales 1 → 1.15 → 1); 0.6 rad reveal orbit around the closed cage. | "The calcium claw" 84 px + "schematic 3-D model · atom sizes not to scale"; legend and scale bar hidden. **Poster t = 8.85 s.** |
| 9.3–11.5 | **Lift-off.** Complex rises; vacancy glows; three darker (×0.5), smaller (×0.8) opaque complexes emerge (outBack) from sites 6 Å deeper in the fog. | caption "1:1 complex carries Ca²⁺ away"; pin "Ca²⁺ removed" |
| 11.55–12.35 | **In-camera ×10⁴ zoom-out.** camM distance 52 → 400 Å (exponential, fog follows) while the canal wall dollies back from 26 → 80 µm; overlapping 0.8 s cross-fade (never black). | tag "×10,000 zoom-out" |
| 12.35–15.6 | **Smear layer removed.** SEM-grey canal wall; translucent paste film + smooth debris grains + plugs dissolve along a noise-modulated front from the centre; teal beads with additive glow rise (symbolic Ca–EDTA). Dial 0:00 → 1:00, then a 0.65 s hold with "1 min ✓". | header "Root canal wall / after NaOCl · 17% EDTA, neutral pH · schematic"; pins "smear layer ≈1–2 µm" then "open tubule"; caption "Smear layer removed → tubules open"; fine print "Mader 1984 · in vitro: least effective in the apical third (Teixeira 2005)" |
| 15.6–17.4 | **Time-lapse, EDTA 1 → 10 min.** Orifices widen only slightly (20 % of the morph). | dial "time-lapse ▸▸" → "10 min EDTA"; caption "10 min EDTA, then NaOCl: / dentine erodes"; fine print "17% EDTA 10 min → 5% NaOCl (Calt & Serper 2002) / erosion mainly when NaOCl follows EDTA (Niu 2002; Qian 2011)" |
| 17.4–18.45 | **Then NaOCl.** Pink rinse sweep; dial ring turns pink, tag "then NaOCl"; orifices erode into funnels (remaining 80 % of the morph). | pin "peri- & intertubular erosion" |
| 18.45–19.8 | Eroded state held ≥ 1.35 s. | (same) |
| 19.8–25.7 | **Takeaway card** (frosted glass, ease.inOut 0.6 s) over the closed Ca–EDTA complex slowly orbiting (0.08 rad/s); last 0.45 s the card fades back to the title frame, which equals frame 0 (seamless loop). | "TAKEAWAY / 17% EDTA · ~1 min / longer adds erosion risk"; numbered pills "1 NaOCl → organic tissue", "2 EDTA → mineral (Ca²⁺)"; "Never mix them."; fine print "≈1 min clears the smear layer in vitro (least apically); a final NaOCl after EDTA adds erosion (Niu 2002; Qian 2011)"; 7 citations |

Handle `@natebrooksendo` bottom-centre, 26 px, 60 %.

## On-screen claims and sources
(PubMed records retrieved via the PubMed tool; DOIs given.)

| On-screen claim | Source(s) |
|---|---|
| EDTA binds Ca²⁺ through **6 donor atoms: 2 amine N + 4 carboxylate O⁻** (hexadentate); "four carboxylate arms" + two backbone N | Hülsmann M, Heckendorff M, Lennon A. *Chelating agents in root canal treatment: mode of action and indications for their use.* Int Endod J 2003;36:810–30. PMID 14641420, doi:10.1111/j.1365-2591.2003.00754.x; standard coordination chemistry |
| **"binds as EDTA⁴⁻"**; at pH 7.5 the free ligand is mostly HEDTA³⁻ (pKa₆ ≈ 10.2, proton on an amine N), which releases H⁺ as it binds; hence carboxylates close first, N last, and "binding order schematic" | Martell AE, Smith RM, *Critical Stability Constants* (reference book, Plenum Press — not a journal article, not in PubMed; pKa 6.2/10.2) |
| Real CaEDTA²⁻ also binds water ("real complex also binds water"; CN 7–8 in crystal structures) | Barnett BL, Uchtman VA. *Structural investigations of calcium-binding molecules. 4. Calcium binding to aminocarboxylates. Crystal structures of Ca(CaEDTA)·7H₂O and Na(CaNTA).* Inorg Chem 1979;18:2674–8, doi:10.1021/ic50200a007 (not indexed in PubMed; bibliographic data verified via Crossref) |
| **1:1** complex carries Ca²⁺ away (log K CaEDTA²⁻ ≈ 10.7) | Hülsmann 2003; Martell & Smith (not PubMed) |
| Target = apatite mineral Ca²⁺ (toy lattice) | Hülsmann 2003; Zehnder M. *Root canal irrigants.* J Endod 2006;32:389–98. PMID 16631834, doi:10.1016/j.joen.2005.09.014 |
| **17% EDTA, neutral pH** | Serper A, Calt S. *The demineralizing effects of EDTA at different concentrations and pH.* J Endod 2002;28:501–2. PMID 12126374, doi:10.1097/00004770-200207000-00002 (17 % > 10 %; pH 7.5 > pH 9; P release rose with time 1 → 15 min) |
| **Smear layer ≈1–2 µm** | Mader CL, Baumgartner JC, Peters DD. J Endod 1984;10:477–83. PMID 6593410, doi:10.1016/S0099-2399(84)80204-6 (no PubMed abstract; the commonly cited figure, cf. Violich & Chandler 2010) |
| **Smear layer removed → tubules open** (EDTA dissolves the mineral phase; the rest is loosened and flushed) | Baumgartner JC, Mader CL. J Endod 1987;13:147–57. PMID 3106553; Yamada RS et al. J Endod 1983;9:137–42. PMID 6406635; Violich DR, Chandler NP. *The smear layer in endodontics – a review.* Int Endod J 2010;43:2–15. PMID 20002799, doi:10.1111/j.1365-2591.2009.01627.x |
| **≈1 min clears the smear layer (in vitro)** | Calt S, Serper A. *Time-dependent effects of EDTA on dentin structures.* J Endod 2002;28:17–9. PMID 11806642, doi:10.1097/00004770-200201000-00004 (n = 6 teeth, SEM; every specimen then got 10 mL 5 % NaOCl); Crumpton BJ et al. J Endod 2005;31:536–8. PMID 15980717, doi:10.1097/01.don.0000148871.72896.1d (17 % REDTA, i.e. EDTA + cetrimide; 1 mL × 1 min sufficient; more volume no benefit; followed by NaOCl) |
| **least effective in the apical third** | Teixeira CS et al. Int Endod J 2005;38:285–90. PMID 15876291, doi:10.1111/j.1365-2591.2005.00930.x (1, 3, 5 min equally effective coronally/middle; apical third partly covered); Afshan Z et al. Eur Endod J 2020;5:28–34. PMID 32342035 |
| **10 min EDTA, then NaOCl: dentine erodes; peri- & intertubular erosion** | Calt & Serper 2002 (10 min 17 % EDTA → 10 mL 5 % NaOCl: excessive peritubular and intertubular erosion) |
| **erosion mainly when NaOCl follows EDTA; a final NaOCl after EDTA adds erosion** (hence only slight widening during the EDTA time-lapse and the funnels during the NaOCl step) | Niu W et al. Int Endod J 2002;35:934–9. PMID 12453023, doi:10.1046/j.1365-2591.2002.00594.x (15 % EDTA alone 1 or 3 min: smooth, regular orifices; EDTA → 6 % NaOCl: erosion, tubule Ø 3.4–3.9 µm); Qian W, Shen Y, Haapasalo M. J Endod 2011;37:1437–41. PMID 21924198, doi:10.1016/j.joen.2011.06.005 (no erosion with demineralising agent as final rinse after NaOCl; NaOCl after EDTA → marked peri-/intertubular erosion, >100 % larger orifice area) |
| **EDTA → mineral, NaOCl → organic tissue**; numbered order ① NaOCl (while shaping) ② EDTA | Baumgartner & Mader 1987; Zehnder 2006; Violich & Chandler 2010; Qian 2011 |
| **Never mix them** | Grawehr M et al. Int Endod J 2003;36:411–7. PMID 12801288, doi:10.1046/j.1365-2591.2003.00670.x (free chlorine lost, tissue dissolution lost); Zehnder M et al. J Endod 2005;31:817–20. PMID 16249726 |
| Scale bars "2 Å" / "5 µm" | Computed live from the camera projection at the Ca²⁺ depth / canal-wall centre (exact only at that depth) |

### Corrections / nuances relative to the brief
- **"Octahedral" coordination:** the six-donor cage is a *distorted* octahedron (N–Ca–N ≈ 70°). Real CaEDTA²⁻
  usually also binds 1–2 waters (CN 7–8); now stated on screen ("real complex also binds water").
- **"Self-limiting"** has been **removed** (review): although EDTA binds Ca²⁺ 1:1, 17 % EDTA (~0.46 M) carries far
  more chelating capacity than the mineral in a 1–2 µm smear layer, and Serper & Calt 2002 found P release still
  rising from 1 to 15 min, so saturation does not limit the clinical effect. The Seidberg & Schilder 1974 citation
  (no abstract, not verifiable) is no longer used.
- **Erosion attribution:** erosion is shown forming mainly in the NaOCl step that follows 10 min EDTA (Calt &
  Serper's protocol), not during EDTA alone (Niu 2002; Qian 2011).
- **Sequence is contested:** Grawehr 2003 suggests flushing EDTA out with copious NaOCl; Niu 2002 / Qian 2011 show
  that a final NaOCl after EDTA drives erosion. The card shows ① NaOCl ② EDTA and states the final-NaOCl caveat in
  fine print; it does not claim a single correct protocol.
- **"Removes the inorganic smear layer":** EDTA dissolves its mineral phase; the caption says "removed", not
  "dissolves".
- **"~1 min":** supported as *sufficient in vitro* (small SEM studies, NaOCl afterwards; apical third weaker); phrased
  "~1 min" + "(in vitro)" + "least apically". Whether removing the smear layer improves outcomes is still debated
  (Violich & Chandler 2010).
- Darda S et al. 2014 (PMID 24876698) is **no longer cited as an independent replication**: its abstract largely
  repeats Calt & Serper and alternates EDTAC/EDTA.

## What is schematic / exaggerated (and flagged on screen)
- Molecular sequence (header "schematic 3-D model · atom sizes not to scale"): open-arm conformation, closing order
  ("binding order schematic") and timing, the ~2 Å Ca lift, the toy apatite lattice ("toy apatite lattice":
  hexagonal net, Ca:P 2:1, no OH⁻, 1.5 layers — not P6₃/m, not carbonated Ca-deficient dentine apatite).
- Ball/stick radii are display sizes (Ca²⁺ drawn ~0.74 Å vs ionic radius ~1.0–1.1 Å); bond lengths are realistic,
  so the Å scale bar is kept.
- Canal wall ("schematic"): tubule spacing ≈ 6.5 µm with jitter (~27 000 /mm²), lumen ≈ 2.2 µm, collar, smear layer
  as paste film + grains with plugs; dissolution front/speed illustrative; teal beads are a symbol (real Ca–EDTA ~1 nm);
  funnel morphology stylised; pink sweep symbolises the NaOCl rinse; 1 → 10 min is a time-lapse.

## Design rationale
- **Commit to the 3-D look:** glossy CPK atoms with clearcoat highlights and environment reflections, a
  warm-key/cool-rim studio rig, ACES tone mapping and per-shot fog (near/far follow the camera distance) give depth
  without clutter. The crystal is a spot-lit disc that fades to the backdrop, so the hero molecule always reads.
- **Focus pull:** while the claw closes the lattice dims to ~40 % and the camera pushes to ~30 Å, so the six bonds
  are the only bright thing; the bond counter (O⁻ O⁻ O⁻ O⁻ N N, in binding order) lights in sync, reading with no sound.
- **Colour logic:** CPK everywhere (C grey, H white, N blue, O red, P orange, Ca teal-green); teal = calcium
  across both scales (target ring, bond glow, rising beads, "EDTA" pill); amber = over-exposure warning; pink = NaOCl (organic).
- **Scale honesty:** live scale bars (Å then µm) and an in-camera ×10⁴ zoom-out (tag "×10,000 zoom-out") bridge the scales; the dentine carries the same studio rig, clearcoat and navy fog so the series look holds for the whole reel.
- **Typography:** Inter 800 title, 700 captions (54 px, auto-fit to ≤ 800 px, centred at x = 512 to stay clear of the button column), 30–38 px labels on dark plates
  where they sit on the bright dentine; superscripts (²⁺, ⁴⁻, ⁻) are drawn as true superscripts (no glyph fallback).
- Everything is a pure function of `t` (no clocks, seeded RNG); arm poses come from a fixed-iteration solver.

## Reading-time audit (`Kit.readSecs` needed / fully-visible s, after review)
title+subtitle 2.92/2.95 · EDTA plate 2.01/2.05 · capA 1.71/1.75 · Ca²⁺ pin 1.10/1.10 · capB 2.62/3.20 ·
counter caveat 3.22/3.25 · capC 2.32/2.35 · "Ca²⁺ removed" 1.41/1.50 · "×10,000 zoom-out" 1.41/1.45 ·
"smear layer ≈1–2 µm" 2.01/2.10 · capD 2.62/2.65 · "open tubule" 1.41/1.45 · capE 2.92/3.60 ·
"peri- & intertubular erosion" 2.01/2.05 · card ≈ 20 words shown 5.45 s with staged reveal (headline first).

## QA log
- Pass 1: lattice too bright/busy, dentine overexposed, labels clipped at frame edges, legend/counter collision,
  far plane edge visible → spot-lit lattice disc, dentine exposure 0.78, longer plane + fog, re-laid bottom rows.
- Pass 2: claw lost against crystal → closer camera, lower elevation, dynamic fog, lattice focus-pull dimming;
  label backplates on bright dentine; source line overflow fixed; scale bar picks 1/2/5/10 Å.
- Pass 3: complex rising into header, background complexes crowding → lower rise, far-side sites, delayed fade-in;
  zoom-out cut with dip; target ring; additive motes washed out on dentine → solid teal beads.
- Pass 4: title/header and card handoffs overlapped → staggered; reading-time audit failed for 5 captions →
  wording tightened, timeline retimed; caption auto-fit; degenerate dash cylinders hidden (stray pixels).
- `--safe` sheets: all readable text inside x 64–1016, y 230–1580; nothing in the right-hand button column.

## Review changes (independent science + design review)
**Science**
- Removed "self-limiting: one Ca²⁺ per EDTA" and the Seidberg & Schilder 1974 claim (17 % EDTA ≈ 0.46 M far exceeds
  smear-layer mineral; Serper & Calt 2002 P release keeps rising to 15 min).
- Erosion beat now shows **10 min EDTA, then NaOCl**: during the EDTA time-lapse orifices widen only slightly; a pink
  "then NaOCl" rinse step (dial ring + tag + sweep) produces the funnel erosion. Caption "10 min EDTA, then NaOCl:
  dentine erodes"; fine print cites Calt & Serper 2002 protocol + Niu 2002 / Qian 2011 (all PubMed-verified).
- Card: "17% EDTA · ~1 min / longer adds erosion risk"; numbered pills ① NaOCl → organic tissue ② EDTA → mineral
  (Ca²⁺); "Never mix them."; fine print "≈1 min clears the smear layer in vitro (least apically); a final NaOCl after
  EDTA adds erosion (Niu 2002; Qian 2011)". Citations add Serper & Calt 2002, Niu 2002, Qian 2011, Zehnder 2006.
- Dentine fine print "in vitro: least effective in the apical third (Teixeira 2005)"; Crumpton 2005 added to NOTES;
  Darda 2014 no longer called a replication.
- "Six arms close…" → **"Six donor atoms grip one Ca²⁺"**.
- Hook plate "EDTA⁴⁻" → **"EDTA / binds as EDTA⁴⁻"**; carboxylate O now bind **first**, amine N **last**; counter chips in
  binding order (O⁻ ×4, N, N) with "binding order schematic; real complex also binds water" (also covers the CN 7–8 nit).
- Headers: "schematic 3-D model · atom sizes not to scale" (Å bar kept); "toy apatite lattice"; caption "Target:
  apatite Ca²⁺"; dentine header "after NaOCl · 17% EDTA, neutral pH · schematic" (foreshadows NaOCl; pH source on card).
- "Smear layer dissolves" → "Smear layer removed"; pin "peritubular dentine erodes" → "peri- & intertubular erosion".

**Design**
- Removed the overlapping "self-limiting" line (8.1–8.45 s garble); removed the "hydroxyapatite" pin (only the ringed
  Ca²⁺ pin remains); removed per-atom N/O⁻ letters and the "stable Ca–EDTA" tag.
- Climax hold 8.3–9.35 s with lock accent (glow 6 → 9 → 6, counter pop 1.15×) and a 0.6 rad reveal orbit; the hook
  title returns at 84 px and legend/scale bar hide → **poster 8.85 s** (title + closed cage inside the 3:4 crop).
- Camera: close-up (k2) finishes before the arms move (azimuth drift ≤ 0.12 rad during the claw); orbit moved into the hold.
- Hook: eased push-in 60 → 37 Å on a centred molecule (y ≈ 880), one claw flex at 0.15–1.1 s, title held 2.95 s.
- Cross-scale cut done in-camera (52 → 400 Å with fog; dentine dollies back 26 → 80 µm), overlapping cross-fade, no 2-D
  box scaling, no black dip; tag "×10,000 zoom-out" from 11.85 s at y = 640.
- Dentine restyled: SEM blue-grey (#8a9098) with clearcoat 0.3, rim light 2.0, exposure 0.43 (mean luma ≈ 58–63 vs 74–100
  before), navy fog melting the far wall into the backdrop; smooth IcosahedronGeometry(1,1) grains ×0.6 + translucent
  paste film dissolving by noise threshold; teal beads get additive glow; fewer, jittered, size-varied orifices
  (spacing 6.5, jitter 2.5, lighter grey interiors).
- Bottom band: legend only 0.6–5.3 s; Å scale bar moved top-right; stronger bottom shade + soft caption scrims in the
  molecular scenes; captions capped at 800 px and centred at x = 512; card at x 96–944.
- Background complexes: opaque, colour ×0.5, scale 0 → 0.8 (outBack), 6 Å deeper in the fog (no ghostly fade).
- Hero Ca²⁺: emissive capped at 0.6, glow ×0.6 (specular highlight survives).
- Dentine pins: dark 3 px leaders with light outline + anchor ring; no overlapping pin fades; smear pin anchored on the
  last-clearing spot; text sizes ≥ 36 px for pins, 32 px dial tags, "Mader 1984" alone in 24 px fine print.
- Dial: 0.65 s hold at 1:00 with "1 min ✓"; "time-lapse ▸▸" switches to "10 min EDTA" only at ≥ 95 %; eroded state held
  ≥ 1.35 s before the card.
- Ending: card eases in over 0.6 s on frosted glass over the slowly orbiting closed complex (keeps moving), single
  centred pill strings, then fades back to the title frame identical to frame 0 (bokeh drift is now periodic) → seamless loop.
- Duration 22 → 25.7 s (inside the 10–30 s contract; above the 18–22 s brief target because of the added holds/steps).

## Final QA (fresh-eyes pass)
- Stills re-checked at 16 evenly spaced times plus 0, 3.2, 5.0, 5.4, 9.45, 11.0, 11.5, 11.9, 17.0, 18.5, 19.7, 20.15, 25.3,
  25.69 s (`_stills/final-qa`). Hook readable at t = 0, takeaway held 5.4 s, last frame = first frame (seamless loop);
  no tofu/NaN glyphs; all must-read text inside x 64–1016 / y 230–1580 and clear of the button column.
- **Fixed:** dial read-out "10:00" (38 px, five glyphs) touched the inside of the ring stroke at 18–20 s → the read-out is
  now auto-fitted to ≤ 94 px wide (`fitSize`), so "10:00" drops to ~33 px and clears the ring; "0:28"…"9:47" unchanged.
- Science re-verified against PubMed records (Calt & Serper 2002, Serper & Calt 2002, Niu 2002, Qian 2011,
  Teixeira 2005, Mader 1984, Grawehr 2003, Hülsmann 2003, Zehnder 2006, Crumpton 2005): every on-screen number/claim
  matches the table above. Nit left as is: the "×10,000 zoom-out" tag is an order-of-magnitude cue (the on-screen 2 Å and
  5 µm bars imply ≈ ×2 × 10⁴ overall).
- Poster 8.85 s kept (title + closed cage + "= 6 bonds" inside the 3:4 crop). Video re-rendered once after the fix.

## Citation audit (PubMed re-verification, 2026-11-22)
Every literature citation on screen (`index.html`: dentine fine print, erosion fine print, takeaway fine print + 7-item
citation block), in `meta.json` (claims[].source + caption Refs) and in this file was re-checked against its PubMed
record (first author, year, journal, volume/pages, PMID, DOI) and its abstract read against the attached claim.
- **Verified, no change needed (16 PubMed records):** Hülsmann 2003 (14641420), Mader 1984 (6593410), Calt & Serper 2002
  (11806642), Serper & Calt 2002 (12126374), Teixeira 2005 (15876291), Niu 2002 (12453023), Qian 2011 (21924198),
  Zehnder 2006 (16631834), Grawehr 2003 (12801288), Baumgartner & Mader 1987 (3106553), Yamada 1983 (6406635),
  Violich & Chandler 2010 (20002799), Crumpton 2005 (15980717), Afshan 2020 (32342035), Zehnder 2005 (16249726),
  Darda 2014 (24876698, J Int Oral Health — mentioned only as *not* cited). All authors/years/journals/PMIDs match and
  each abstract supports its claim (Mader 1984 and the 1987/1983 SEM papers have no PubMed abstract; the 1–2 µm smear
  layer figure is the standard attribution to Mader 1984 and is confirmed by secondary sources).
- **On-screen citations:** all correct ("Calt & Serper, J Endod 2002 · Serper & Calt, J Endod 2002 / Niu et al., IEJ 2002 ·
  Qian et al., J Endod 2011 · Zehnder, J Endod 2006 / Grawehr et al., IEJ 2003 · Hülsmann et al., IEJ 2003"; "Mader 1984";
  "Teixeira 2005"; "Calt & Serper 2002"; "Niu 2002; Qian 2011"). Checked rendered in `_stills/audit` (t = 14.6, 17.2,
  24.6 s). **Reel unchanged, video not re-rendered.**
- **Fixed (meta.json / NOTES only):**
  1. Barnett & Uchtman (Inorg Chem 1979) was cited without volume/pages/DOI and as unverifiable → full reference added
     (18:2674–8, doi:10.1021/ic50200a007), verified via Crossref (journal not indexed in PubMed).
  2. Martell & Smith, *Critical Stability Constants* is a reference book → now labelled "reference book (Plenum), not a
     journal article" in meta.json and here.
  3. meta.json "six donor atoms" relied only on the Hülsmann 2003 review, whose abstract does not state the donor set →
     source now also says "standard coordination chemistry (Martell & Smith)".
  4. Caption Refs line omitted the sources for two caption claims (1–2 µm smear layer; least reliable apically) → added
     "Mader 1984, J Endod; Teixeira 2005, Int Endod J".
  5. Crumpton 2005 tested 17 % **REDTA** (EDTA + cetrimide) → noted here and in meta.json (added as supporting source for
     the ~1 min claim, with Serper & Calt's neutral-pH finding spelled out).

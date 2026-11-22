# 09 — Calcium hydroxide vs bacteria: who survives in the tubules?

**Output:** `reels/out/09-caoh2-bacteria.mp4` (28.2 s, 1080×1920, 30 fps) and the poster `reels/out/09-caoh2-bacteria.jpg` (t = 26.9 s, the takeaway frame).
**Files:** `index.html` (page contract), `reel.js` (everything else: one full-frame 2D canvas, fast capture path).

## Concept
This is a silent time-lapse styled as a **simulated confocal (CLSM) live/dead image**. It is labelled as simulated in the hook, the file name, the fine print and the takeaway card. It shows four dentinal tubules leading off a root canal filled with Ca(OH)₂ paste. Bacteria fluoresce **green (SYTO 9, live)** and turn **red (propidium iodide, membrane breached)**. A pseudo-colour pH channel (blue to cyan LUT, with a calibration bar on the plot) shows OH⁻ diffusing into the tubules. An ImageJ-style **"pH model" line-profile plot**, aligned to the depth axis, draws the pH curve live. Its pH 11.5 crossing extends across the image as an amber line, labelled "pH 11.5 · kills *E. faecalis* (in vitro)".

The model follows Nerwich et al. (1993):
- Only the canal wall / orifice zone reaches ≥ 11.5.
- Inner dentine plateaus at about 10.8.
- Outer dentine stays at about 7.2 until after day 1, then creeps up.

Killing near the canal is **partial and slow**. The first PI conversions come at day ≥ 1, and about a third of the orifice cells, all cocci, stay green. Below the line every cell is an *E. faecalis*-like coccus, and they all survive.

Three "digital zoom" ROI insets carry the mechanisms that cannot be seen at this magnification:
- ROI 0: a small ionic lattice slowly releasing Ca²⁺ and OH⁻.
- ROI 1: the *proposed* ways high pH kills a cell.
- ROI 2: the *E. faecalis* proton pump.

## Storyboard (v5 timings)
| t (s) | What you see | On-screen text |
|---|---|---|
| 0.0–3.2 | Microscope focus pull (blur 10 → 0 px over 1.4 s). A pulsing "● SIMULATING" chip sits by the clock. The paste starts to glow cyan from 1.5 s and the canal readout climbs. | "SIMULATED TIME-LAPSE · LIVE/DEAD STAIN" / **"Who survives Ca(OH)₂?"** / "pH 12.5 paste vs bacteria in dentinal tubules" |
| 3.2–6.5 | **ROI 0**: "Ca(OH)₂ solid" is drawn as a layered lattice. Surface ions detach slowly and labelled Ca²⁺ / OH⁻ drift off. The pH readout finishes climbing to 12.5 (at 4.6 s). | NOTE 1/5: **Ca(OH)₂ ⇌ Ca²⁺ + 2OH⁻** · Mohammadi & Dummer, IEJ 2011 |
| 6.5–10.5 | The schematic clock starts (day 0 → 7). The OH⁻ front reaches inner dentine "within hours" (about day 0.3). The amber 11.5 line forms and stalls at the orifice zone. The first cells (rods) go green → yellow → red at day 1.3, 1.5 and 1.8. | NOTE 2/5: "OH⁻ diffuses in; some nearby cells turn **red** (dead)" · "red = PI uptake = membrane breached" |
| 10.5–13.9 | **ROI 1** ("proposed mechanisms · schematic") zooms on a dying **rod** (not a coccus). The membrane ring breaks ("membrane / integrity lost"), PI floods in, proteins unfold ("denatured") and DNA fragments ("damaged"). | NOTE 3/5: "High pH likely damages membranes, proteins, DNA" · "proposed · Siqueira & Lopes, IEJ 1999" |
| 13.9–17.3 | The peritubular rims around the kill line light up **sand** (dentine colour), and sand flashes mark OH⁻ absorbed at the walls. Tags read "‖ stalled" and "dentine buffers OH⁻", with a leader to a glowing rim. One more rod dies (day 4.6). The outer pH readout creeps up. | NOTE 4/5: "Dentine buffers OH⁻: the pH front stalls" · Haapasalo 2000 · Nerwich 1993 |
| 17.3–21.3 | One green bracket per tubule marks the survivors below the line, with a "survivors" label. **ROI 2** zooms on the coccus just below the line (model pH ≈ 11.2): inward chevrons on the pumps and H⁺ streaming in. | NOTE 5/5: "*E. faecalis* survives pH 11.1; proton pumping appears critical" · "in vitro · Evans et al., IEJ 2002" · inset: "proton pump / pumps H⁺ in" · "killed only at pH ≥ **11.5** (in vitro)" |
| 21.4–27.65 | Takeaway card at the bottom. The evidence stays visible above it: a thin red band at the orifice with green cocci among it, the amber line, bracketed survivors below, the canal at 12.5 and the clock at day 7. | "Ca(OH)₂ IN TUBULES · TAKEAWAY" + amber "SIMULATED" chip / **"pH is the weapon. Dentine is the shield."** / "Past the canal wall, *E. faecalis* can survive (in vitro)." / sources |
| 27.65–28.2 | Loop rewind behind the card. The clock spins back to day 0, cells re-tint green, the kill line retracts and the field defocuses (blur 0 → 10 px), so frame 0 follows seamlessly. | (card stays up) |

Persistent UI:
- `@natebrooksendo · CaOH2_tubule_SIM.tif`.
- `CLSM · 63×/1.40 oil`.
- The channel legend: live SYTO 9 / dead PI.
- "day N" with "schematic clock" under it.
- "ROOT CANAL · Ca(OH)₂ paste pH 12.5".
- The pH model plot:
  - axis 7 / 13 with a LUT calibration bar and an amber 11.5 tick;
  - depth zones "canal wall", "inner", "outer dentine";
  - a rotated axis label "depth → ~1 mm · not to scale";
  - an "outer pH" readout.
- "5 µm (lateral only)".
- "simulated · depth & time compressed".

Every caption, **including the equation tokens**, stays fully visible for at least `Kit.readSecs()`. The final card (18 words, 6.25 s) is held for 6.3 s. The page checks both at setup and warns if either fails; both currently pass.

## On-screen claims and sources
All sources were verified on PubMed (abstract and metadata).

| # | On-screen claim | Source(s) |
|---|---|---|
| 1 | Ca(OH)₂ ⇌ Ca²⁺ + 2OH⁻; paste pH ≈ 12.5 (hook subtitle "pH 12.5 paste", canal readout 12.5). The lattice drawing and the slow release reflect low solubility and sustained ion release. | Mohammadi Z, Dummer PMH. Int Endod J 2011;44:697–730. PMID 21535021, doi:10.1111/j.1365-2591.2011.01886.x. The abstract gives "high pH (approximately 12.5–12.8)" and "ionic dissociation of Ca²⁺ and OH⁻". |
| 2 | "High pH **likely** damages membranes, proteins, DNA"; ROI 1 "proposed mechanisms": membrane integrity lost, proteins denatured, DNA damaged | Siqueira JF Jr, Lopes HP. Int Endod J 1999;32:361–9. PMID 10551109, doi:10.1046/j.1365-2591.1999.00275.x (a critical review of *proposed* mechanisms). Mohammadi & Dummer 2011: "lethal effects … are **probably** due to protein denaturation and damage to DNA and cytoplasmic membranes". Estrela C et al. Braz Dent J 1995;6:85–90. PMID 8688662: OH⁻ action on the cytoplasmic membrane (enzymes, transport). "Lipid peroxidation" was removed, because it implies a radical (•OH) mechanism rather than the hydroxide ion. |
| 3 | Green = live (SYTO 9), red = dead (PI, membrane breached); this kind of image is what CLSM viability staining of tubules looks like | Parmar D et al. *Bacterial localization and viability assessment in human ex vivo dentinal tubules by fluorescence CLSM.* Int Endod J 2011;44:644–51. PMID 21352240, doi:10.1111/j.1365-2591.2011.01867.x. In that study, *E. faecalis*-infected roots were treated with Ca(OH)₂ paste and then **sectioned at an end-point**. Live and dead cells were "readily distinguishable by contrasting green and red fluorescence". A continuous 7-day time-lapse like this one has not been recorded, so the reel is labelled SIMULATED. |
| 4 | Dentine buffers OH⁻; the front stalls | Haapasalo HK et al. Int Endod J 2000;33:126–31. PMID 11307453, doi:10.1046/j.1365-2591.2000.00291.x: the effect on *E. faecalis* was "totally abolished by the presence of dentine powder" (in vitro). Nerwich A, Figdor D, Messer HH. J Endod 1993;19:302–6. PMID 8228751, doi:10.1016/s0099-2399(06)80461-9. |
| 5 | pH model: ≥ 11.5 only in the canal-wall zone; **inner dentine ≈ 10.8**; outer dentine ≈ 7.2 until after day 1, about 8.1 at day 7 and still rising | Nerwich 1993: inner dentine peaked at **pH 10.8 cervically / 9.7 apically within hours**. "1 to 7 days elapsed before the pH began to rise in the outer root dentin", which peaked at 9.3 / 9.0 after 2–3 wk. The plot uses the cervical inner value. The apical value would be lower still. |
| 6 | Kill line "pH 11.5 · kills *E. faecalis* (in vitro)"; ROI 2 "killed only at pH ≥ 11.5 (in vitro)" | Evans M et al. Int Endod J 2002;35:221–8. PMID 11985673, doi:10.1046/j.1365-2591.2002.00504.x: "resistant to calcium hydroxide at a pH of 11.1, but not pH 11.5" (planktonic strain JH2-2). McHugh CP et al. J Endod 2004;30:218–9. PMID 15085049, doi:10.1097/00004770-200404000-00008: no growth at pH ≥ 11.5. |
| 7 | "*E. faecalis* survives pH 11.1; proton pumping **appears critical**"; "pumps H⁺ in" | Evans 2002: adding CCCP (a protonophore / uncoupler, used as a "proton pump inhibitor") "resulted in a dramatic reduction of cell viability"; "a functioning proton pump is critical". The direction (H⁺ pumped *into* the cell) is the authors' interpretation, echoed by Stuart CH et al. J Endod 2006;32:93–8. PMID 16427453. |
| 8 | Near-canal killing is **partial and slow**: first deaths at day ≥ 1, about a third of orifice cells stay green | Haapasalo M, Ørstavik D. J Dent Res 1987;66:1375–9. PMID 3114347, doi:10.1177/00220345870660081801: "Calasept failed to eliminate, **even superficially**, *E. faecalis* in the tubules". Safavi KE et al. J Endod 1990;16:207–10. PMID 2074411, doi:10.1016/s0099-2399(06)81670-5: "bacteria remained viable in the dentin after relatively extended periods of calcium hydroxide treatment". This study used a single streptococcal isolate (PubMed MeSH: *Streptococcus*), not *E. faecalis*, and cultured whole roots, so it supports incomplete killing in general rather than the depth pattern. Funk B et al. Int J Dent 2019:2348146. PMID 31263498, doi:10.1155/2019/2348146: after 7 d, Ca(OH)₂ "reduced bacterial viability significantly only in the first layer … up to 150 µm". |
| 9 | Takeaway "Past the canal wall, *E. faecalis* can survive (in vitro)." | Combines claims 5, 6 and 8: dentine pH stays below 11.5 beyond the wall zone, and tubule studies show incomplete killing. All of this is in vitro or ex vivo evidence. **Clinical controversy (for the post caption, not on screen):** Sathorn C, Parashos P, Messer H. Int Endod J 2007;40:2–10. PMID 17209826, doi:10.1111/j.1365-2591.2006.01197.x. This meta-analysis found limited effectiveness: pooled risk difference −21 %, 95 % CI −47 % to 6 %, P = 0.12. In contrast, Sjögren U et al. Int Endod J 1991;24:119–25. PMID 1778624 found that a 7-day dressing eliminated the bacteria surviving instrumentation. |
| 10 | Only cocci are drawn below the kill line; rods (other species) appear only in the ≥ 11.5 zone and all eventually die | Ørstavik D, Haapasalo M. Endod Dent Traumatol 1990;6:142–9. PMID 2133305: *E. faecalis* infected the whole length of the tubules. Mohammadi & Dummer 2011: Ca(OH)₂ is less effective against *E. faecalis*. No identity is claimed on screen for the rods. |
| 11 | "depth → ~1 mm · not to scale" | Haapasalo & Ørstavik 1987: heavy infection at 400 µm, and the infection front reached 1000 µm in some blocks. |
| 12 | "5 µm (lateral only)": lumen ≈ 2.5 → 1.8 µm, cocci ≈ 0.9 µm | Garberoglio R, Brännström M. *Scanning electron microscopic investigation of human dentinal tubules.* Arch Oral Biol 1976;21:355–62. PMID 1066114, doi:10.1016/s0003-9969(76)80003-9. The abstract is not on PubMed. The values usually quoted from this paper (secondary sources) are a tubule diameter of about 2.5 µm near the pulp, 1.2 µm in mid-dentine and 0.9 µm near the DEJ. The drawing uses 2.5 µm at the canal wall and tapers to about 1.8 µm at the bottom of the frame; that end value is an interpolation, not a figure from the paper. The coccus size (about 0.9 µm) is a general size for enterococcal cells and does not come from this paper. Only the lateral scale is true. |
| 13 | Schematic clock day 0 → 7 | The classic 7-day dressing interval (Sjögren 1991). The clock shows whole days only and is labelled "schematic clock". |

### Corrections made to the brief (v1–v4, still valid)
- *E. faecalis* is killed at pH 11.5 and survives 11.1 (Evans 2002; McHugh 2004). It does not "tolerate ~11.5".
- "Saponification" is not supported by the cited abstracts and was dropped.
- Haapasalo 2000 is an in-vitro dentine-powder model and is cited as such.

## What is schematic / modelled (disclosed on screen)
- **The whole image is simulated.** It is labelled in the hook ("SIMULATED TIME-LAPSE"), the file name (`…_SIM.tif`), the "SIMULATING" chip, the fine print ("simulated · depth & time compressed") and the takeaway card (amber "SIMULATED" chip). The card keeps "simulated" visible in the poster.
- **Depth axis.** Canal wall to about 1 mm is drawn in about 820 px, so it is not to scale. The scale bar is labelled lateral only.
- **Time.** The clock is "schematic", in whole days only. Time is not linear in the reel. The front reaches inner dentine by about day 0.3 ("within hours"), deaths happen between day 1.3 and day 4.6, and day 7 is reached at 21.2 s.
- **pH model (toy).**
  - pH(d,t) = lo + (P(d) − lo)·σ((front − d)/0.05 − 1.5).
  - P(d) is the steady inner profile, with knots 12.5 at the wall, 11.5 at d = 0.12, 10.8 at 0.25 and 10.3 at 0.46.
  - lo(d,t) is the outer level: 7.2, rising after day 1.5 to about 8.1 at day 7.
  - The front eases to about 0.5 within "hours", then stalls.
- **Kill rule.** It is hand-placed rather than modelled:
  - Six of the nine cells in the ≥ 11.5 zone die, on given days. All four rods die.
  - Three cocci survive there, because killing is incomplete.
  - Every cell below the line survives.
- **Insets** are illustrations, not structures.

## Design rationale
- **Style is committed to fluorescence microscopy.** The field is pure black, with dentine autofluorescence, glowing additive sprites (live and dead channels merge through yellow), camera grain and a vignette. The microscope-software chrome is set in IBM Plex Mono and the captions in IBM Plex Sans.
  - Cell brightness varies from cell to cell (0.65–1.0).
  - About 30 % of cells are drawn with extra defocus.
  - The white core of each cell was toned down so it reads as flatter CLSM fluorescence.
- **Palette.** Each colour has one meaning:
  - green = live, red = dead;
  - cyan/blue LUT = pH / OH⁻;
  - amber = the 11.5 threshold;
  - lilac = Ca²⁺, warm = H⁺;
  - **sand = dentine.** It is used for the buffering rims, the flashes, the NOTE 4 accent and "Dentine" in the takeaway, so the colour pays off.
- **One focal point at a time.** Captions now change sequentially, with no cross-fade double text. The end sequence is also sequential: ROI 2 and caption 5 are gone by 21.3 s, before the card fades in at 21.4 s. The kill-line tags sit in the gutter between tubule 4 and the plot, so they never cover cells.
- **Legibility.** Captions are 44 px and the equation 62 px. Hook and takeaway headlines are 82–96 px. All inset labels the viewer must read are ≥ 30 px, in #cfd8e2 or brighter. 22–24 px is used only for fine print and sources. Everything readable sits in x 64–1016, y 230–1580, and the right column x > 960 / y > 1100 stays clear.

## Determinism
`render(t)` is a pure function of `t`:
- Random layouts use `Kit.rng`, `Kit.hash` and `Kit.noise`.
- Breathing and the chip pulse are periodic over DUR, so the loop is seamless.
- The rewind maps `t` to the model time.

## Change log
- v1–v3: first builds. Retimed captions, ROI 0 added, takeaway moved to the bottom, deep pH made conservative.
- v4: grain and drift changes for bitrate (104 MB → 21.9 MB).
- v5: review changes (below).
- **Final QA (v5.1).** Two glitches in ROI 0 (3.35–6.4 s) were fixed; no other changes to timing, wording or science.
  - The guard meant to keep released ions out of the inset header did not work for near-vertical angles (`atan2(-0.45, cos a)` with cos a ≈ 0 stays near −90°). From about 5.4 s, one OH⁻ ion sat on top of "schematic" in the "ROI 0 · paste · schematic" header. The clamp now really limits sin a to −0.45.
  - The Ca²⁺ / OH⁻ labels followed "the outermost released ion", so they jumped between ions. At 5.07 s, OH⁻ jumped about 150 px from top-right to bottom-right, and at 5.58 s Ca²⁺ popped in at full opacity. Each label is now tied to one fixed anchor ion (the leftmost-ending Ca²⁺ and the rightmost-ending lower OH⁻) and fades in over 0.3 s. OH⁻ appears at about 4.9 s and Ca²⁺ at about 5.4 s, in the same places where they used to settle.
  - Checked and left as is:
    - Survivor-bracket membership is stable frame to frame. The only change is the intended ROI 2 hand-off at 21.07 s.
    - Every on-screen number matches the PubMed abstracts (Evans 2002, McHugh 2004, Nerwich 1993, Haapasalo 2000, Haapasalo & Ørstavik 1987, Mohammadi & Dummer 2011, Siqueira & Lopes 1999, Parmar 2011).
    - The poster (26.9 s) reads inside the 3:4 crop.
  - Gallery metadata is in `meta.json`.
- **Citation audit (v5.2).** Every literature citation on screen, in `meta.json` and in this file was checked against PubMed: first author, year, journal, volume/pages and PMID, and the abstract against the claim it is attached to. All 16 PMIDs resolve to the paper named (Mohammadi & Dummer 2011, Evans 2002, McHugh 2004, Nerwich 1993, Siqueira & Lopes 1999, Haapasalo HK 2000, Haapasalo & Ørstavik 1987, Parmar 2011, Sathorn 2007, Estrela 1995, Stuart 2006, Safavi 1990, Funk 2019, Sjögren 1991, Ørstavik & Haapasalo 1990, Garberoglio & Brännström 1976). The on-screen source lines (captions 1, 3, 4 and 5 and the takeaway card) are all correct, so the reel and video were not changed. Fixes:
  - Claim 12 credited Garberoglio & Brännström 1976 with "lumen 2.5 → 1.8 µm, cocci 0.9 µm … as commonly cited". The 1.8 µm end value is an interpolation and the coccus size is a bacterial cell size; neither comes from that paper. The row now gives the values usually quoted from it (2.5 / 1.2 / 0.9 µm, pulp → DEJ) and says which drawn sizes are interpolated.
  - Claim 8: Safavi 1990 is now marked as a streptococcal isolate (not *E. faecalis*) in whole-root culture.
  - `meta.json`: the caption's Refs line had no source for "near pH 12.5" or for dentine buffering. Mohammadi & Dummer 2011 and Haapasalo et al. 2000 were added. The mechanism claim ("likely damages membranes, proteins and DNA") now also cites Mohammadi & Dummer 2011, whose abstract states it directly; the Siqueira & Lopes abstract does not list the mechanisms (its full text does).

## Review changes (v5, after independent science + design review)
**Science**
- **pH model re-anchored to Nerwich 1993.** Only the canal-wall / orifice zone (first 12 % of the axis) is ≥ 11.5. Inner dentine plateaus at about 10.8 (the cervical value), and outer dentine stays at about 7.2 until after day 1. The plot gained depth labels ("canal wall", "inner", "outer dentine") and "depth → ~1 mm · not to scale". NOTES claim 5 now says *inner* dentine, not mid-dentine.
- **Killing is partial and slower.** The first PI conversion is at day 1.3, and deaths are spread to day 4.6. Three of the nine orifice cells (all cocci) stay green above the line. ROI 1's victim is now a rod. Caption 2 now reads "some nearby cells turn red". Haapasalo & Ørstavik 1987 is now cited as evidence of *incomplete* superficial killing, with Safavi 1990 and Funk 2019 added.
- **Hook** changed from "Who survives pH 12.5?" to "**Who survives Ca(OH)₂?**", with the subtitle "pH 12.5 paste vs bacteria in dentinal tubules".
- **Simulated labelling.**
  - Hook label: "SIMULATED TIME-LAPSE · LIVE/DEAD STAIN".
  - File name: `CaOH2_tubule_SIM.tif`.
  - A "● SIMULATING" chip.
  - The takeaway card has an amber "SIMULATED" chip and an "in vitro data" source line, so "simulated" is visible in the poster.
- **Clock** is now "day N" (whole days) labelled "schematic clock". Outer pH stays at 7.2 until day ≥ 1.5, and deaths only happen from day ≥ 1.
- **Mechanisms hedged.** Caption 3 now reads "High pH likely damages membranes, proteins, DNA", with the source line "proposed · Siqueira & Lopes". The ROI 1 header is "proposed mechanisms · schematic". The membrane sublabel is "integrity lost" (lipid peroxidation removed), and the DNA sublabel is "damaged".
- **Kill line** is labelled "pH 11.5" plus "kills *E. faecalis* (in vitro)" from the moment it appears.
- **No bracketed rod survivors.** Rods are seeded only in the ≥ 11.5 zone and all die. Every survivor below the line is a coccus.
- **Caption 5** now reads "*E. faecalis* survives pH 11.1; proton pumping appears critical". The ROI 2 footer is "killed only at pH ≥ 11.5 (in vitro)" and the source line is "in vitro · Evans et al.".
- **Scale bar** reads "5 µm (lateral only)".
- **Takeaway** reads "Past the canal wall, *E. faecalis* can survive (in vitro)." The clinical controversy (Sathorn 2007 meta-analysis vs Sjögren 1991) is recorded above for the post caption.
- **ROI 0 (nit)** now shows a layered ionic lattice ("Ca(OH)₂ solid") with slow surface release. The equation uses ⇌.
- **NOTES (nit)** now cite Parmar 2011 instead of Ma 2011, and add Funk 2019, Safavi 1990, Estrela 1995 and Sathorn 2007.

**Design**
- **ROI 1** was widened (X0 120, IW 640, labels at X0 + 330). All inset sublabels are now 30 px #cfd8e2. **ROI 2** uses 30 px "pumps H⁺ in" and a 32 px footer.
- **Retimed.**
  - Captions are now 3.2–6.5, 6.5–10.5, 10.5–13.9, 13.9–17.3 and 17.3–21.3 s.
  - The equation counts toward the `readSecs` check, which passes.
  - The final card holds 6.3 s against 6.25 s needed. DUR is 28.2 s.
  - Caption 1 no longer claims "pH ≈ 12.5" while the readout climbs. The pH value lives in the ROI 0 readout and the paste label.
- **Kill-line tags** moved to the right gutter (x 646). "stalled" now sits under the line with the buffering tag, and nothing covers tubule cells.
- **Transitions are sequential.** The outgoing caption fades over [b − 0.15, b] and the incoming one starts at a + 0.08. ROI 2 and caption 5 are gone before the card fades in.
- **Opening motion.**
  - A focus pull (blur 10 → 0 px over 1.4 s).
  - A pulsing "● SIMULATING" chip.
  - The paste glow and canal pH start at 1.5 s.
  - The subtitle is shorter.
- **Buffering beat.** Peritubular rims around the kill line glow sand (opaque, pulsing), and wall flashes are sand and 44 px. A 30 px "dentine buffers OH⁻" tag has a leader to a lit rim.
- **ROI 0 box** sits on clear paste: bacteria are clipped to y ≥ WALL − 6.
- **Survivor brackets.** There is now one bracket per tubule. Brackets that would reach y > 1060 are skipped, so none is cut by the card. A 30 px "survivors" label was added.
- **Poster.** The kicker is "Ca(OH)₂ IN TUBULES · TAKEAWAY" (30 px, #8fdcff).
- **Nits applied.**
  - A LUT calibration bar was added; the axis shows only 7, 13 and an amber 11.5.
  - Flatter sprites, with per-cell brightness and 30 % defocused cells.
  - ROI 2 has inward chevrons, 36 px H⁺ particles and one "H⁺" label, with no floating tags. IH is 340, and the inset was moved below the line.
  - The loop rewinds behind the card: the clock goes back to day 0, cells re-tint green and the field defocuses.
- **Known trade-offs.**
  - DUR is 28.2 s, above the brief's 22–26 s target but within the SPEC's 30 s. This is the cost of the hedged wording ("likely", "in vitro", "appears critical") and of meeting `readSecs` for every caption and the final card.
  - The kill zone is about 12 % of the axis rather than 5–10 %. A smaller zone could not hold a readable mix of dying and surviving cells. The axis is labelled not to scale.

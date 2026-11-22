# 02 · How ibuprofen turns down pulpal pain (COX inhibition)

**Output:** `reels/out/02-ibuprofen-cox.mp4` (22.0 s, 1080×1920, 30 fps, 660 frames) · poster `reels/out/02-ibuprofen-cox.jpg` (t = 1.2 s, the hook frame)
**Files:** `index.html` (page shell) + `reel.js` (all drawing; one 2D canvas plus one offscreen layer for dimming; deterministic `render(t)`)

## Concept
A silent, flat pastel "assembly line" that shows the whole mechanism and needs no voice-over. Hook: an inflamed molar and a sky-blue
ibuprofen molecule under the question **"What ibuprofen *can't* undo"**. We dive into the pulp and land **inside a pulp cell** (two bilayers:
"pulp cell membrane" on top, a lower membrane with an exit below it, then the nerve **out of the cell**):
**PLA₂** snips out **arachidonic acid** → AA snakes into the **COX channel** → **PGH₂** rides a conveyor → a **PGE synthase** stamp turns
it into **PGE₂** (pale → saturated colour flip) → PGE₂ **leaves the cell** through a membrane exit and lands on **EP receptors** of a pulpal
nociceptor → the **threshold line drops** and stimulus bumps that used to stay below it become **spikes** (speaker + level bars). Then
**ibuprofen** seats in the channel mouth (lock and key, punch-in), the next AA bumps into the plug, the line stalls and the counter pauses.
The plug then **unbinds** (reversible), one queued AA **slips through** (competitive), and a second ibuprofen re-plugs the channel: production
is **cut, not zero**. Existing PGE₂ clears, the threshold climbs **partway** back and firing falls to an occasional residual spike, with fine
print "other mediators (e.g. substance P) still act". Payoff: *ibuprofen cuts NEW prostaglandins; it can't erase the ones already made.*

## Storyboard (seconds)
| t | Caption (≥ Kit.readSecs) | Visual |
|---|---|---|
| 0.00–2.45 | **What ibuprofen *can't* undo** (full at frame 0) | Flat molar (lower chamber roof), pulsing coral pulp, throb marks, "inflamed pulp" pill; sky-blue **ibuprofen** + pill beside the tooth (the protagonist is set up at frame 0). 1.35–1.85 ibuprofen flies off-frame; 1.45–2.15 zoom ×7 (inOut) into the pulp chamber; 1.8–2.02 the coral pulp fills the frame, then crossfades (2.05–2.42) into the cell scene, which builds 2.1–2.85 (membranes, COX, belt, stamp, counter, PLA₂). Nerve and meter are not built yet. |
| 2.45–5.35 | **Inflamed pulp frees *arachidonic acid*** | Focus: membrane + PLA₂ + AA (COX/counter dimmed to 0.4). Scissor-shaped PLA₂ snips the butter AA tail out of the bottom leaflet (one every 0.85 s from 3.0 s). AA snakes into the channel mouth. Nerve and meter fade in dimly at 4.4–5.15 s, just before the first PGE₂ leaves the cell. |
| 5.35–7.45 | ***COX* makes prostaglandins** | Focus: COX + belt + stamp + counter. Active-site burst → pale **PGH₂** → belt → stamp → saturated **PGE₂** (1.2× pop + butter puff; counter +1). Sticker on the machine: "COX-2 ↑ in inflamed pulp". PGE₂ drops through the lower-membrane exit ("out of the cell ↓"). |
| 7.45–10.30 | **PGE₂ *lowers* the firing threshold** | Focus: nerve + meter + bound PGE₂ (COX dimmed 0.45). One PGE₂ binds per ending (white keyline, halo); others sit in the gaps between endings. The dashed threshold slopes down (animated down-chevron), bumps that cross it become 6 px coral spikes (first ~8.0 s), action-potential dots run along the axon, level bars rise. |
| 10.30–13.50 | ***Ibuprofen* reversibly plugs the COX channel** | Focus: COX mouth + counter + ibuprofen + queued AA. Two ibuprofen molecules fly in under the membrane; A seats at 11.05 s (×1.35, click burst, punch-in ×1.1 on the upper scene). The last AA already inside finishes (white keyline): counter 8 → 9 at 11.7 s and a large pause badge pops. Two separate AAs bump into the plug. 12.3 s: A **unbinds**, the first queued AA slips in, B re-seats at 12.95 s; that one molecule becomes PGE₂ (counter 10 at 13.3 s) and the pause badge returns. |
| 13.50–16.80 | **Less new PGE₂ → nerve *calms*** | Focus: nerve + meter. Bound and free PGE₂ clear one by one (13.4–15.6 s); the slipped-through PGE₂ lands at 14.5 s and stays (residual). Threshold rises only partway (0.40 → ~0.60; up-chevron), spikes thin to about one per 1–1.5 s. Fine print in the meter from 13.8 s: "other mediators (e.g. substance P) still act". |
| 16.80–21.72 | **Takeaway card** (headline in by 17.25 s, all lines by 17.9 s) | "THE TAKEAWAY", icon (plugged COX → PGE₂ with ↓ badge), **Ibuprofen cuts *NEW* prostaglandins**, "It can't erase the ones already made.", "→ one rationale for dosing *before treatment*†", "†pre-op NSAIDs aid IANB success; post-op pain benefit unclear", one 22 px source line. The calm (not silent) nerve and meter stay visible below: occasional residual spike, 1–3 level bars. |
| 21.72–21.97 | none | Crossfade into the exact frame-0 hook (background blobs loop on a 22 s period), so the loop has no blank frame. |

Persistent: `@natebrooksendo` (bottom left, 26 px, from frame 0) and "schematic · time & size not to scale · toy counts" (bottom right, 23 px, from 2.4 s), both at y = 1566, inside the safe area.

## On-screen claims and sources
(All retrieved from PubMed. DOIs given.)

1. **"Inflamed pulp frees arachidonic acid" (via PLA₂ from membrane phospholipids).** Prostaglandins come from arachidonic acid released by phospholipase from membrane phospholipids:
   Funk CD. *Prostaglandins and leukotrienes: advances in eicosanoid biology.* Science 2001;294:1871-5. PMID 11729303. doi:10.1126/science.294.5548.1871.
   Park JY, Pillinger MH, Abramson SB. *PGE2 synthesis and secretion: the role of PGE2 synthases.* Clin Immunol 2006;119:229-40. PMID 16540375. doi:10.1016/j.clim.2006.01.016.
   Pulp-specific anchor: PGE₂ is significantly higher in pulpal blood from inflamed than from normal pulps. Nakanishi T, Matsuo T, Ebisu S. J Endod 1995;21:131-6. PMID 7561655. doi:10.1016/s0099-2399(06)80438-3.
2. **"pulp cell membrane" / "out of the cell ↓" (compartments).** PGE₂ is synthesised inside the producing cell and secreted to act on EP receptors of nearby cells (Park et al. 2006, above). In inflamed human pulp, COX-2 is expressed mainly by **fibroblasts** (also macrophages) and is scarce in normal pulp: Nakanishi T, Shimizu H, Hosokawa Y, Matsuo T. *An immunohistological study on cyclooxygenase-2 in human dental pulp.* J Endod 2001;27:385-8. PMID 11487130. doi:10.1097/00004770-200106000-00003. The exit is drawn as a generic membrane channel; the export route is not depicted specifically.
3. **"COX makes prostaglandins"; COX-1 / COX-2; "AA → PGG₂ → PGH₂".** COX-1 and COX-2 (PGH synthases) catalyse the committed step; cyclooxygenase activity gives PGG₂ and peroxidase activity gives PGH₂:
   Smith WL, DeWitt DL, Garavito RM. *Cyclooxygenases: structural, cellular, and molecular biology.* Annu Rev Biochem 2000;69:145-82. PMID 10966456. doi:10.1146/annurev.biochem.69.1.145.
4. **Sticker "COX-2 ↑ in inflamed pulp".** Nakanishi et al. 2001 (above): COX-2-expressing cells found in all inflamed pulps, scarcely in normal pulps.
5. **PGE synthase stamp (PGH₂ → PGE₂).** Terminal PGE synthases (mPGES-1, mPGES-2, cPGES) convert PGH₂ to PGE₂: Park et al. 2006 (above).
6. **"PGE₂ lowers the firing threshold" / EP receptors on the nociceptor.** PGE₂ sensitises nociceptors (EP1→PKC, EP4→PKA; TRPV1, P2X3, Na⁺/Ca²⁺ channels), producing hyperalgesia:
   Kawabata A. *Prostaglandin E2 and pain — an update.* Biol Pharm Bull 2011;34:1170-3. PMID 21804201. doi:10.1248/bpb.34.1170.
   PGE₂ increases a TTX-resistant Na⁺ current in nociceptors (a mechanism of sensitisation): Gold MS, Reichling DB, Shuster MJ, Levine JD. PNAS 1996;93:1108-12. PMID 8577723. doi:10.1073/pnas.93.3.1108.
   Historical (NOTES only, no longer on screen): Ferreira SH. Nat New Biol 1972;240:200-3. PMID 4629913 (prostaglandins sensitise rather than act as the main pain signal; human experiments used intradermal PGE₁).
7. **NSAIDs work by blocking prostaglandin synthesis.** Vane JR. Nat New Biol 1971;231:232-5. PMID 5284360. doi:10.1038/newbio231232a0 (aspirin-like drugs; used here as the class mechanism).
8. **"Ibuprofen reversibly plugs the COX channel"** (shown: plug seats at the mouth, later unbinds, a queued AA slips in, another ibuprofen re-binds). Ibuprofen is a rapidly reversible competitive inhibitor in the cyclooxygenase channel:
   Selinsky BS et al. Biochemistry 2001;40:5172-80. PMID 11318639. doi:10.1021/bi010045s.
   COX-2 structure with (S)-ibuprofen; Arg-120 and Tyr-355 **at the channel entrance** are required for binding (why the plug sits at the mouth): Orlando BJ, Lucido MJ, Malkowski MG. J Struct Biol 2015;189:62-6. PMID 25463020. doi:10.1016/j.jsb.2014.11.005.
   Ibuprofen inhibits COX-1 and COX-2 in a concentration-dependent, essentially non-selective way: Cryer B, Feldman M. Am J Med 1998;104:413-21. PMID 9626023. doi:10.1016/s0002-9343(98)00091-6.
   Competitive: AA and the drug compete for the channel, so inhibition falls as drug levels fall (one reason for regular dosing intervals).
9. **"Less new PGE₂ → nerve calms" (partial, not complete).** Pre-op ibuprofen 600 mg significantly **lowered, but did not eliminate**, pulpal PGE₂ in irreversible pulpitis (and lowered TNF-α, IL-6, IFN-γ), with no difference in post-op pain: Nguyen V, Chen YW, Johnson JD, Paranjpe A. J Endod 2020;46:1210-6. PMID 32565333. doi:10.1016/j.joen.2020.06.009.
10. **Meter fine print "other mediators (e.g. substance P) still act"** and the threshold recovering only partway. Substance P is >8-fold higher in irreversible pulpitis than in normal pulp: Bowles WR, Withrow JC, Lepinski AM, Hargreaves KM. J Endod 2003;29:265-7. PMID 12701777. doi:10.1097/00004770-200304000-00009. In untreated irreversible pulpitis most patients still had significant pain while taking ibuprofen plus acetaminophen/codeine: Nagle D et al. OOOOE 2000;90:636-40. PMID 11077389. doi:10.1067/moe.2000.109777; Gallatin E et al. J Endod 2000;26:633-8. PMID 11469290. doi:10.1097/00004770-200011000-00001.
11. **"Ibuprofen cuts NEW prostaglandins; it can't erase the ones already made."** Follows from items 3, 7, 8 (an inhibitor reduces new synthesis and does not remove product already formed) and is consistent with Nguyen 2020 (reduced, not abolished). "Cuts", not "blocks", because inhibition is reversible and concentration-dependent (Selinsky 2001; Cryer & Feldman 1998).
12. **"→ one rationale for dosing before treatment† / †pre-op NSAIDs aid IANB success; post-op pain benefit unclear."** A patient with symptomatic pulpitis already has raised pulpal PGE₂ (Nakanishi 1995), so the "can't erase existing PGs" logic applies to dosing before the treatment-induced surge, i.e. pre-operatively.
    Pre-op NSAIDs improved IANB success in irreversible pulpitis: Shirvani A et al. Clin Oral Investig 2017;21:43-52. PMID 27837343. doi:10.1007/s00784-016-1974-1.
    Post-op pain benefit of pre-op ibuprofen is unclear (low/very-low quality evidence): de Geus JL et al. Eur Endod J 2018;3:123-33. PMID 32161868. doi:10.14744/eej.2018.83803; Nguyen 2020 (lower PGE₂ but no post-op pain difference).
    NOTES only: Attar S et al. J Endod 2008;34:652-5. PMID 18498882. doi:10.1016/j.joen.2008.02.017 (small 3-arm pilot; single pre-op ibuprofen did not reduce post-op pain vs placebo). General context: Ong CK et al. Anesth Analg 2005;100:757-73. PMID 15728066. doi:10.1213/01.ANE.0000144428.98767.0E (pre-emptive NSAIDs improved rescue-analgesic use and time to first rescue, not pain scores).
13. **Footer "time & size not to scale".** Oral relief builds over tens of minutes, not seconds: in an untreated endodontic pain model (ibuprofen 600 mg + acetaminophen 1000 mg), pain kept falling until ~120 min. Watts K et al. J Endod 2019;45:94-8. PMID 30711184. doi:10.1016/j.joen.2018.11.005.
14. **On-screen source line (card):** "Vane 1971 · Selinsky 2001 · Shirvani 2017 · de Geus 2018 · Nguyen 2020". Kawabata 2011, Orlando 2015, Nakanishi 1995/2001, Bowles 2003 and the rest are in this file (and suggested for the IG caption).
15. **Not shown on screen, considered:** Moore PA et al. JADA 2018;149:256-265.e3. PMID 29599019. doi:10.1016/j.adaj.2018.02.012 (ibuprofen + acetaminophen combinations had the highest association with benefit). The 400 mg / 1000 mg doses could not be confirmed from the abstract and the point is off-mechanism, so it is left for its own reel.

### Corrections to the original brief
- COX makes **PGH₂** (via PGG₂); **PGE₂ is made from PGH₂ by a separate PGE synthase** (the stamp).
- Ibuprofen inhibits the **cyclooxygenase** channel, not the peroxidase step; it is drawn at the channel mouth.
- "Why pre-emptive/early dosing helps" was overstated: now "one rationale for dosing **before treatment**†" with a footnote that separates IANB success (supported) from post-op pain (unclear).
- PGE₂ **sensitises** the nerve (lower threshold); it is not drawn as the pain signal itself, and it is not the only mediator (residual firing + fine print).
- Ibuprofen **reduces** (not abolishes) new PGE₂: reversible, competitive, concentration-dependent.

## What is schematic / modelled (flagged on screen: "schematic · time & size not to scale · toy counts")
- **Counts:** "PGE₂ made: 10" is a toy count of the icons on screen.
- **Meter:** stimulus bumps (seeded RNG, seed 1500), threshold values (0.88 → 0.40 → ~0.60 of trace height), spike shapes and 0–5 level bars are a toy model. Sensitisation = (PGE₂ present)/8, clamped, with a floor that builds from 9 to 12.5 s ("sensitisation already established + other mediators"), so the threshold recovers only partway.
- **Timing:** everything is compressed (seconds instead of minutes to hours). The **visual lag** between the plug and the calmer nerve stands for existing PGE₂ **plus sensitisation already under way** (e.g. PKA-mediated increase in TTX-R Na⁺ current; Gold 1996, Kawabata 2011) **and oral onset time** (Watts 2019); real PGE₂ is also metabolised locally (e.g. 15-PGDH), not shown.
- **Geometry:** COX is drawn as one rounded machine with an entrance and a separate exit to make the assembly line read. In reality COX is a membrane-anchored homodimer (ER/nuclear envelope); **AA actually enters the COX channel from the membrane via the membrane-binding domain; the free-swimming AA is a visual metaphor**, and substrate and product share one channel (Smith et al. 2000). The AA's –COOH end trails (it stays at the entrance, Arg-120) while the ω-end leads into the channel. Molecules are simplified glyphs (AA wavy chain + –COOH; PGH₂ with endoperoxide bridge; PGE₂ with C9 =O, C11-OH, C15-OH; ibuprofen ring + isobutyl + propionic acid), not to scale. One generic PLA₂ stands in for cPLA₂ and other isoforms. The two bilayers are the same pulp cell (fibroblast-like); the exit is a generic channel.
- Stereochemistry (S-ibuprofen is the active COX inhibitor) is not shown.

## Design rationale
- **Style (committed):** flat pastel vector; cream→peach ground, faint dot grid, slow pastel blobs (now on a 22 s period so the loop matches); rounded flat shapes with crisp offset shadows. Colour roles: **mint = COX**, **butter = AA / PLA₂ / PGE synthase**, **coral = prostaglandins & pain** (pale coral = PGH₂, saturated = PGE₂), **lilac = nerve**, **sky blue = ibuprofen** (set up in the hook). Nunito 900 captions, 800 labels in white pills, highlighter swashes in the beat's colour.
- **One focal point per beat:** each group (membrane/PLA₂, AA, COX/belt/stamp/counter, nerve/meter, ibuprofen) is drawn to an offscreen layer and composited at a focus alpha (non-focal 0.4–0.6, 0.3 s crossfades at caption boundaries). Labels dim with their group.
- **Lock and key:** large docked ibuprofen (×1.35) with a click burst and a 0.6 s ×1.1 punch-in of the upper scene (the nerve side stays put); the counter's final +1 is the last in-flight molecule, outlined in white; the pause badge (r = 40) sits on the counter's top edge.
- **Reversible + competitive, shown:** the plug unbinds, one AA slips in, a second ibuprofen re-binds, the counter ticks once more. This makes "cuts, not zero" visible without text.
- **Meter:** sub-threshold bumps are thin and pale (calm looks calm), spikes are bold coral and overshoot; threshold movement is underlined by down/up chevrons.
- **Loop:** frame 0 is the complete hook; the last 0.25 s crossfades into that exact frame.

## QA log
1. Pass 1 (12 stills): the meter bumps were drawn at 0.62× their amplitude, so the threshold crossings didn't match visually; hash-based amplitudes were clumpy (no spikes for long stretches); the PGE₂ field was overcrowded (20 molecules); the card icon touched the kicker; the end fade dropped the dot grid. All fixed: seeded RNG table, true-height bumps, 16 → 15 molecules (8 bound + rest free in a tidy row), tidier fall paths that clear the COX gear, a snip burst for PLA₂, brighter lamps.
2. Pass 2 (targeted stills): the "threshold" label collided with the speaker icon, so the trace was narrowed. Peak spike density was a solid wall, so bump spacing went from 0.16 to 0.19 s and the minimum threshold from 0.34 to 0.40. The tooth had a hard vertical shade edge (now a curved shade plus outline), and a ghosted giant tooth lingered during the zoom (faster fade).
3. Pass 3 (timing): checked every caption against `Kit.readSecs`. Captions 1 and 3 were short, so I shortened the fades (0.25 in / 0.18 out), tightened the wording ("COX makes prostaglandins", "PGE₂ lowers the firing threshold") and moved the ibuprofen arrival to 10.9 s to match its caption. The scene now builds in during the zoom (no empty frame at ~1.95 s), and I compressed the card stagger.
4. Pass 4 (`--safe` sheet + closely spaced transition stills at 2.95/3.08, 5.75/5.86, 7.95/8.08, 10.7/10.83, 13.75/13.88, 16.82/16.95/17.15/17.5, 21.75, 0.1): no overlapping captions, no clipped text, no console errors. Veil raised to 0.97 to hide membrane ghosts at the card edges.
5. Video render: 22.000 s, h264 1080×1920 @ 30 fps, 660 frames + silent AAC; I checked a decoded frame at 9.6 s and the poster.

## Change log
- v1: initial build (flat pastel assembly line, tooth hook, meter, takeaway card).
- v2: QA fixes above; final render.
- v3: independent science + design review applied (see "Review changes" above); stills re-checked with `--safe`; video re-rendered.
- Final QA: 16 `--safe` stills + targeted transition stills (0, 1.2, 1.7, 2.2, 2.5, 5.0, 5.4, 11.1, 12.4, 12.9, 13.45, 16.95, 21.8, 21.95 s, plus mid-beat checks). No clipped/overlapping text, nothing must-read in the no-go zones, hook full at frame 0, card held 3.8 s, last frame matches frame 0 (PSNR 45 dB). All on-screen claims checked against the sources above (PMIDs re-verified on PubMed). One defect fixed: the card's `†` (U+2020) is also in Nunito's latin-ext subset, which Kit's font preload never loads, so the first render that drew it used a fallback glyph (an isolated still at 18.5 s differed from the video frame; render output depended on render history). `setup()` now preloads the 700/800 faces for `†` before measuring the rationale line. Video re-rendered: 22.000 s, 660 frames; poster unchanged (t = 1.2 s hook). Added `meta.json` for the gallery.

## Review changes (v3, after independent science + design review)
Science
- **Partial, not complete, block (must):** B5 caption is now "Less new PGE₂ → nerve *calms*". The threshold recovers only partway (0.40 → ~0.60, not 0.88), residual spikes continue at about one per 1–1.5 s (1–3 level bars lit on the card), and the meter carries 24 px fine print "other mediators (e.g. substance P) still act" from 13.8 s to the end. The counter is no longer frozen for good: one AA slips through when the plug unbinds (10 instead of a hard stop). Sources added: Nguyen 2020, Bowles 2003, Nagle 2000, Gallatin 2000.
- **Card headline:** "Ibuprofen blocks NEW prostaglandins" → "Ibuprofen cuts *NEW* prostaglandins"; icon now shows PGE₂ with a ↓ badge instead of a cross. Sources: Selinsky 2001, Cryer & Feldman 1998, Nguyen 2020.
- **Dosing line:** "→ one rationale for dosing *before treatment*†" and "†pre-op NSAIDs aid IANB success; post-op pain benefit unclear". Attar 2008 moved to NOTES only; de Geus 2018 and Nguyen 2020 added.
- **Compartments:** top pill relabelled "pulp cell membrane"; a second (lower) bilayer with a membrane exit now separates the PG-producing cell from the nerve; PGE₂ passes through the exit (which opens as each molecule passes) under a 30 px pill "out of the cell ↓". Source: Park 2006, Nakanishi 2001.
- **Reversibility shown:** at 12.3 s the seated ibuprofen unbinds; a queued AA slips in (competition) and the waiting ibuprofen re-seats at 12.95 s. Deviation from the suggested fix: the reviewer suggested the waiting molecule slot straight in with the counter kept paused; one AA is allowed through during the gap so the counter ticks once (9 → 10). This shows competition and makes "less, not zero" visible, consistent with the must-fix and Nguyen 2020.
- **Footer:** "schematic · time & size not to scale · toy counts" (Watts 2019 in NOTES).
- **NOTES:** persistence lag now attributed to existing PGE₂ + established sensitisation (Gold 1996, Kawabata 2011) + oral onset (Watts 2019); Geometry paragraph says AA enters COX from the membrane via the membrane-binding domain (Smith 2000).
- **Card source line:** Ferreira 1972 removed from screen (kept here as historical); condensed to one line "Vane 1971 · Selinsky 2001 · Shirvani 2017 · de Geus 2018 · Nguyen 2020" (design asked for one line; Kawabata 2011 and Orlando 2015 are cited here and for the IG caption).
- **COX-2 tag:** sticker on the machine from 5.5 s: "COX-2 ↑ / in inflamed pulp" (Nakanishi 2001).
- **Molar:** pulp chamber roof lowered (centre −138 → −108, horns −158 → −128, floor −8 → −4), horns under the cusps; roof dentin is now about as thick as the chamber is tall.
Design
- **Focus:** per-beat focus multiplier on offscreen layers (non-focal 0.4–0.6, 0.3 s crossfades); nerve and meter build in at 4.4–5.15 s (just before the first PGE₂ leaves the cell), so the opening build is only membranes, COX, belt, stamp, counter, PLA₂.
- **Plug beat:** docked ibuprofen ×1.35; 0.6 s punch-in ×1.1 at the seat (upper scene only); pause badge r = 40 at the counter's top edge, popping exactly at the last +1; queue gap L_AA + 44 so two separate AAs bump the plug; the last in-flight molecule has a white keyline; the seat is timed so the counter's final +1 comes 0.65 s after the click (was 0.9 s) and the next AA arrives 0.2 s after it.
- **Poster:** 13.2 s → 1.2 s (hook: molar, ibuprofen, 78 px title inside the 3:4 crop).
- **Hook:** "How ibuprofen turns down pulpal pain" → "What ibuprofen *can't* undo" (teases the takeaway; 4 words); sky-blue ibuprofen + pill beside the tooth from frame 0, flies off during the dive and returns at 10.3 s.
- **Zoom:** ×1 → ×7 (ease.inOut, 1.45–2.15 s) about the pulp chamber, tooth opaque until 1.95 s, coral pulp fills the frame, then crossfades into the scene; the scene builds from 2.1 s. Throb marks fade as the dive starts.
- **Pacing:** AA flow starts at 3.0 s (was 3.5), hook 2.45 s (was 3.05), product pipeline after the active site shortened; beats 4 and 5 are 3.2 and 3.3 s (were 3.05), caption fades shortened (0.2 in / 0.15 out). Visible time vs Kit.readSecs: hook 2.30/2.01 (plus the loop crossfade), B1 2.55/2.32, B2 1.75/1.71, B3 2.50/2.32, B4 2.85/2.62, B5 2.95/2.62. Card from 16.8 s (headline visible 4.5 s; all lines 3.8 s); the two citation lines are condensed to one.
- **Loop seam:** frame 0 is the full hook (no fade-in); 21.72–21.97 s crossfades into the exact frame-0 hook; background blobs are periodic over 22 s.
- **PGE₂ readability:** one PGE₂ bound per ending (×0.6, white 3 px keyline, all on the up-right cup so they never point at each other); free PGE₂ sit in the gaps between endings; the stamp step is a clear pale → saturated flip with a 1.2× pop and butter puff; dt 0.5 → 0.85 s so belt products never overlap.
- **Meter:** sub-threshold bumps 3 px lilacMid at 0.75 alpha, no fill; spikes 6 px coral, overshoot ×1.1; box 220 px tall, trace 126 px; down-chevron by "threshold" in B3, up-chevron 14–16.5 s; level bars 14 px wide, counted over 2 s.
- **Labels:** ibuprofen pill beside the plug with a 3 px leader; ibuprofen flight paths enter below the membrane (never cross the membrane pill); EP receptors / nociceptor pills at x ≈ 176–180; pause badge no longer touches "made".
- **PLA₂:** redrawn as scissors (92 px blades, ring handles), 20 px closer to the slot lipids so the blades touch the tail they free.
- **Hook title** baseline 318 → 352 (cap top ~52 px inside the 3:4 crop); tooth centre 950.

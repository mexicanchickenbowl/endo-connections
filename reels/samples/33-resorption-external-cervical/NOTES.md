# 33 · Resorption 5/5 · External cervical resorption — CBCT viewer

Files: `index.html` (page), `reel.js` (timeline, viewer chrome, annotations), `volume.js` (procedural volume,
slice / 3-D / radiograph renderers), `RESEARCH.md` (fact-checked evidence brief — the only source of on-screen
facts), `meta.json`. Output: `reels/out/33-resorption-external-cervical.mp4` (24.0 s, 1080×1920, 30 fps) + `.jpg`.

## Concept

The viewer sits at a cone-beam CT workstation. Three linked grey-scale planes (axial / sagittal / coronal), a
small 3-D pane and a periapical thumbnail show ONE schematic tooth while a time-lapse runs through the three-stage
model of external cervical resorption (ECR): a small entry just below the epithelial attachment → a lesion that
tunnels into dentin and wraps AROUND the canal, which stays walled off by the pericanalar resorption-resistant
sheet → patches of bone-like repair tissue. The viewer's own tools then classify the lesion (Patel 3-D: height,
circumferential spread, proximity) and the periapical is pulled up beside the axial slice to show why 2-D
underestimates it. End card: recognize early · consider CBCT before you treat · treatment depends on extent.

Everything in the panes is computed from a single procedural voxel volume (128 × 128 × 208 voxels, built once in
`setup()` from analytic shapes + seeded noise): the three planes are true slices of it, the 3-D pane is a
ray-march of the same data, and the "periapical" is a parallel projection (sum of attenuation) of the same data —
so the lesion on the radiograph really is the 2-D shadow of the lesion in the slices, including the canal outline
that stays visible through it and the thin margins that do not show.

## Storyboard (24.0 s, silent)

| t (s) | Picture | Must-read text |
|---|---|---|
| 0.0-2.3 | Viewer boots (panes fade in from black); axial slice scrolls coronally, linked cyan lines move in the long-axis panes; 3-D tooth turns. Stage timeline (dim) in the dock | **External cervical resorption** · "Why 2-D underestimates it" |
| 2.3-5.5 | Zoom to the cervical third. Axial lands on the portal level; a small defect opens on the mesial root surface (orange); ring marker in axial + sagittal; blue bracket + chip marks the epithelial attachment just coronal to it. Timeline lane 1 | **1 Initiation** · "Entry just below the epithelial attachment" (chip: "epithelial attachment"). Source: Mavridou et al., J Endod 2016 |
| 5.5-8.0 | Axial pane enlarges (splitters move). Lesion reaches the pericanalar zone and starts to wrap in both directions (arrowheads ride the fronts); slice scrolls 1 mm apically to just below the alveolar crest | **2 Resorption** · "Spreads around the canal". Source: Mavridou 2016 · Patel et al., Int Endod J 2022 |
| 8.0-10.6 | Mint ring/line highlights the thin intact layer between lesion and canal in axial + sagittal; chip with leader | "Pulp walled off — until late" · chip "resorption-resistant sheet · avg ≈ 0.2 mm · ex vivo". Source: Mavridou 2016 · Heithersay, Quintessence Int 1999 |
| 10.6-13.2 | Mottled, ivory-tinted bone-like tissue appears in the oldest part of the lesion (around the portal; the axial scrolls there and back) while the orange fronts keep advancing; timeline lanes 2 and 3 run in parallel | **3 Repair** · "Bone-like tissue grows in". Source: Mavridou 2016 · proposed 3-stage model |
| 13.2-16.2 | Dock becomes the classification strip. Sagittal zooms out: height ruler (zones 1-4) and a dashed line from the deepest point → 2. Angle tool sweeps the axial slice (≈245°) → C. Sheet ring pulses → p. Badge "Patel 2Cp" | **Patel 3-D classification** · HEIGHT 1 2 3 4 · SPREAD A ≤90° B ≤180° C ≤270° D >270° · PROXIMITY d dentin only / p probable pulp involvement · CLASS 2Cp. Source: Patel et al., Int Endod J 2018;51:206 |
| 16.2-19.2 | Periapical and sagittal panes swap: the radiograph sits beside the axial slice. Dashed blue trace follows the canal walls through the lesion; orange outline = projected extent of the lesion in the volume, larger than the visible radiolucency | **The periapical underestimates it** · chip "canal outline · often still traceable" · legend "extent on CBCT". Source: Patel K et al., J Endod 2016 · Heithersay 1999 |
| 19.2-24.0 | Title returns; take-home panel slides over the lower panes, axial + periapical stay lit (complete summary frame = poster, t = 22.6). Last 0.5 s: content fades to black, pane frames slide back to the opening grid → seamless loop | **TAKE-HOME** 1 Recognize it early · 2 Consider CBCT before you treat · 3 Treatment depends on extent. Source: Patel et al., Int Endod J 2018;51:1224 · Patel K et al., J Endod 2016 |

Persistent, inside the safe area: tag "RESORPTION 5/5 · EXTERNAL CERVICAL", handle "@natebrooksendo",
"SCHEMATIC · not a patient scan · not to scale".

Must-read words: about 73 (title 3, hook 4, stage 1: 7, stage 2: 16, stage 3: 5, classification 12, 2-D scene 12,
take-home 13, …). That is above the ~60-word guideline; the classification strip (9 label words) and the three
in-pane chips account for the excess. All must-read text is ≥ 30 px (captions 38 px, headlines 58-62 px, end
card 50 px); source lines 25 px; viewer chrome (slice counter, zoom, orientation letters, 3-D legend) 22 px.

## On-screen claims and sources (all taken from the verified rows of RESEARCH.md)

| # | On screen | Source (what was read) |
|---|---|---|
| 1 | "Entry just below the epithelial attachment" (stage 1, Initiation) | Mavridou AM et al., J Endod 2016;42:1737-1751, PMID 27776885 — abstract: "ECR was initiated at the cementum below the gingival epithelial attachment" (RESEARCH row 1) |
| 2 | Stage names Initiation → Resorption → Repair, drawn as overlapping lanes | Mavridou 2016, PMID 27776885 — abstract: proposed 3-stage mechanism; resorption and repair "progress in parallel at different areas of the tooth" (row 2). Source line says "proposed 3-stage model" |
| 3 | "Spreads around the canal" | Patel S et al., Int Endod J 2022;55 Suppl 4:892-921, PMID 35229320 — full text: lesion spreads "circumferentially and apico-coronally" because the pulp is protected by the sheet; Chen Y et al., J Endod 2021;47:883-894, PMID 33745945 — abstract; histology base Mavridou 2016 (row 3) |
| 4 | "Pulp walled off — until late" + "resorption-resistant sheet" | Sheet: Mavridou 2016, PMID 27776885 — abstract ("pericanalar resorption-resistant sheet"). "Until late": Heithersay GS, Quintessence Int 1999;30(1):27-37, PMID 10323156 — abstract ("protected by a thin layer of predentin until late in the process"); Patel 2022 full text ("Only in advanced cases does the ECR lesion perforate into the root canal") (rows 4, 7) |
| 5 | "avg ≈ 0.2 mm · ex vivo" | Mavridou 2016, PMID 27776885 — abstract: "fluctuating thickness averaging 210 μm", measured on extracted teeth. No "n" is shown because the abstract does not say how many teeth were measured (row 5 + fact-check) |
| 6 | "Bone-like tissue grows in" (stage 3, Repair) | Mavridou 2016, PMID 27776885 — abstract: "ingrowth and apposition of bonelike tissue into the resorption cavity"; Heithersay 1999, PMID 10323156 (row 8). The word "heals" is deliberately not used |
| 7 | Patel 3-D classification: HEIGHT 1-4 (ruler zones: 1 supracrestal, 2 coronal third, 3 mid third, 4 apical third) · SPREAD A ≤90° B ≤180° C ≤270° D >270° · PROXIMITY d dentin only / p probable pulp involvement | Patel S, Foschi F, Mannocci F, Patel K, Int Endod J 2018;51:206-214, PMID 28746776 — abstract (row 37). "d dentin only" paraphrases "lesion confined to dentine" |
| 8 | "The periapical underestimates it" | Patel K, Mannocci F, Patel S, J Endod 2016;42:1435-1440, PMID 27507628 — abstract: periapicals "underestimated the size of the ECR lesion" and had limited ability to detect circumferential spread; 115 consecutively diagnosed teeth, CBCT as comparator (row 30). No percentage is shown (the 40% vs 70% figures belong to a different, ex vivo study and stay off screen) |
| 9 | "canal outline · often still traceable" | Heithersay 1999, PMID 10323156 — abstract ("characteristic radiopaque line generally separates the image of the lesion from that of the root canal"); Patel 2022, PMID 35229320 — full text ("root canal outline is visible as long as there is no perforation"); "often" because Luso S, Luder HU, Schweiz Monatsschr Zahnmed 2012;122:914-930, PMID 23097140 found the intact wall frequently not recognizable on conventional films (rows 27, 29) |
| 10 | "Consider CBCT before you treat" | Patel K 2016, PMID 27507628 — abstract conclusion ("A CBCT scan should be considered before the management of a potentially restorable ECR lesion"); ESE position statement on ECR (Int Endod J 2018;51:1323-1326, PMID 30171768) as quoted in Patel 2022 full text. "Consider" kept, no statement wording quoted (row 35) |
| 11 | "Treatment depends on extent" | Patel S et al., Int Endod J 2018;51:1224-1238 (ECR part 2: management), PMID 29737544 — abstract: approach chosen by position/extent and access (review, external repair ± endodontic treatment, internal repair, replantation, extraction) (row 39) |
| 12 | "Recognize it early" | Clinical take-home from the recommended end card of RESEARCH.md (b) 8; rationale: outcome falls with extent — Heithersay GS, Quintessence Int 1999;30(2):96-110, PMID 10356561 (success 100% classes 1-2, 77.8% class 3, 12.5% class 4; ≥ 3 y, 101 teeth, 1999 trichloracetic-acid protocol — figures deliberately NOT on screen) and Patel 2018 part 2 (superficial, limited lesions are the ones amenable to repair) |

Not on screen (caption / here only): often symptom-free (58.1% of 215 referred lesions were incidental
radiographic findings; pink spot 5.1% — Patel et al., Int Endod J 2023;56:1475-1487, PMID 37801348); associations
(orthodontics, trauma most often reported; cause unknown); no randomized trials on treatment (Bardini et al., Aust
Endod J 2023, PMID 37702252). Nothing from the RESEARCH.md "Do not claim" list is shown.

## What is schematic (say so if asked)

- **Not a patient scan.** A procedural single-rooted mandibular tooth (crown up, so "below the attachment" reads
  literally), two neighbours, alveolar bone with a scalloped crest, gingiva. Grey values only imitate CBCT
  contrast (enamel > dentin > cortical bone > trabecular bone > soft tissue > air). The canal is drawn generously wide.
- **Not to scale.** The sheet is drawn 0.32 mm thick so it survives the voxel grid and a phone screen; the
  published average is 0.21 mm. The label therefore quotes the published average ("avg ≈ 0.2 mm · ex vivo") and is
  not a caliper reading of the picture. No voxel size or mm readout is printed anywhere.
- **Lesion = toy model.** An "arrival-time" field makes the lesion enter through a ~1 mm portal 0.9 mm apical to
  the CEJ (supracrestal), run to the pericanalar zone, then spread along the sheet circumferentially (further on
  the lingual than the buccal side) and apico-coronally, thickening outward, with dentin islands left behind.
  Speed, shape and the 24-second time-lapse are invented; ECR progression rates are not known.
- **Repair patches** appear first in the oldest part (near the portal) while fronts still advance — this follows
  the overlap described by Mavridou 2016; amount and position are illustrative.
- **Tool readings** (≈245°, zone 2, "Patel 2Cp") are measurements of the drawn model (computed live from the
  volume by `measureSpread` / `measureHeight`), shown to demonstrate how the classification is read. "p" is the
  honest coding of a lesion lying against the canal on a scan; it does not contradict "walled off" (p = probable
  pulp involvement, not proof of perforation — see RESEARCH.md (d)).
- **Periapical** = parallel projection of the same volume with an ad-hoc attenuation curve and film grain; the
  orange outline is the projected silhouette of every lesion voxel ("extent on CBCT"). It illustrates
  under-estimation qualitatively; no size ratio is claimed.
- The colored overlay (orange lesion, ivory repair, mint sheet) is a segmentation-style tint, not something a
  CBCT shows.

## Design rationale

- **Style commitment:** near-black workspace, IBM Plex Mono chrome / IBM Plex Sans captions, cyan-magenta-yellow
  linked crosshairs (axial / coronal / sagittal), slice counter, zoom readout, orientation letters, pane tabs,
  measurement tools (angle, height ruler), status bar. Pane "splitters" move (grid → axial focus → radiograph
  beside axial) the way a user would rearrange a viewer, which also keeps one focal pane per beat.
- **Three semantic colors only:** orange = resorbing lesion, mint = protected canal / resistant sheet, ivory =
  bone-like repair (blue is reserved for anatomy labels: epithelial attachment, canal outline). The same colors
  are used in captions, panes, the 3-D pane and the stage timeline.
- **Structure for study:** headline = stage name (1 Initiation / 2 Resorption / 3 Repair), sub-line = the one fact;
  the dock shows the stages as overlapping lanes, then turns into the Patel 3-D table; the poster (t = 22.6 s) is
  a complete summary frame: title, lesion around the labeled sheet, measured spread and class, radiograph with
  canal outline and true extent, three take-homes, source, schematic note.
- **Layout / safe areas:** all must-read text inside x 64-1016, y 236-1562; nothing must-read under the right-hand
  button column (x > 960, y > 1100 holds only pane imagery); app bar and status bar are decoration under the
  Instagram header/footer.
- **Loop:** title is identical on the end card and at t = 0; panes fade to black and their frames return to the
  opening grid before the cut.

## Self-QA log

- Pass 1: story did not read in the axial pane (slice was below the growing lesion) → portal-level hold, later
  1 mm scroll, bone crest raised, growth front-loaded. Angle arc crossed the sheet label → redesigned as sector +
  rays + vertex arc; labels drawn last.
- Pass 2: pane labels over bright enamel → dark tabs; orientation letters under crosshair handles → moved;
  end panel was translucent → opaque; 3-D glass shell too dark → rim + specular; radiograph overlay hid the
  radiolucency → outline only.
- Pass 3: reading-time audit → scenes retimed (sequential 0.2 s fades, no dead time), filler sub-lines removed,
  canal-outline text moved into the radiograph pane so it stays up through the end card; hook sub-line changed
  from "What the periapical misses" (could be read as "fails to detect") to "Why 2-D underestimates it".
- Transitions checked with closely spaced stills (layout change 5.3-6.3 s, pane swap 16.1-16.9 s, loop
  23.4-0.7 s); no console errors; ~50-100 ms per frame.

## Known weaknesses

- ~73 must-read words and 24.0 s: at the top of both budgets; a few captions are 0.1-0.4 s under the strict
  `Kit.readSecs` time (the in-pane chips stay up longer to compensate).
- The lesion model is a single plausible pattern; real ECR is far more variable (multiple portals, perforation
  in advanced cases).
- The on-screen classification result "p" needs the caption to reconcile it with "pulp walled off".
- Bottom-right pane sits partly under the Instagram button column (imagery only).

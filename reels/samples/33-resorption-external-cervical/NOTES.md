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
| 0.0-2.3 | Viewer boots (imagery on screen by ~0.4 s); axial slice scrolls coronally, linked cyan lines move in the long-axis panes; 3-D tooth turns. From 1.6 s an orange point already starts to grow at the cervical root surface (3-D + sagittal). Stage timeline (dim) in the dock | **External cervical resorption** · "Why **2-D** underestimates it" (44 px, "2-D" in orange) |
| 2.3-5.5 | Zoom to the cervical third. Axial lands on the portal level; a small defect opens on the mesial root surface (orange), in the supracrestal attachment zone; ring marker in axial + sagittal; thick blue bracket (no chip) marks the epithelial attachment just coronal to it, in the same blue as the caption words. Timeline lane 1. All scene-1 markers are gone by 5.5 s | **1 Initiation** · "Entry just below the epithelial attachment". Source: Mavridou et al., J Endod 2016 |
| 5.5-8.0 | Splitters move 5.4-6.0 s: axial pane enlarges. Lesion reaches the pericanalar zone and wraps in both directions (arrowheads ride the fronts); only once the wrap is under way (7.0-7.9 s) the slice scrolls 1.6 mm apically to just below the alveolar crest | **2 Resorption** · "Spreads around the canal". Source: Mavridou et al., J Endod 2016 |
| 8.0-10.6 | Mint band highlights the thin intact layer between lesion and canal (faint all round, bright along the lesion-facing arc) in axial + sagittal; chip with leader | "Pulp walled off — until late" · chip "resorption-resistant sheet · avg ≈ 0.2 mm · ex vivo" (chip leaves at 13.2 s together with the Mavridou source line). Source: Mavridou et al., J Endod 2016 |
| 10.6-13.2 | Slice held still. Mottled, ivory-tinted bone-like tissue appears in the oldest part of the lesion (brief brightening pulse as it appears) while the orange fronts keep advancing; timeline lanes 2 and 3 run in parallel | **3 Repair** · "Bone-like tissue grows in". Source: Mavridou et al., J Endod 2016 · proposed 3-stage model |
| 13.2-16.2 | Dock becomes the classification strip, read one row at a time (the other rows at 40 %): height ruler in the sagittal pane (13.5 s) → HEIGHT 2 lit at 13.9; angle tool sweeps the axial slice 14.1-14.75 (≈233°) → SPREAD C at 14.75; PROXIMITY p at 15.0 (the mint band steps back to 40 % as "p" lights); CLASS 2Cp complete at 15.2 s, then a 1 s hold with all rows lit | **Patel 3-D classification** · HEIGHT 1 2 3 4 · SPREAD A ≤90° B ≤180° C ≤270° D >270° · PROXIMITY d dentin only / p probable pulp · CLASS 2Cp. Source: Patel et al., Int Endod J 2018;51:206 |
| 16.2-19.2 | Pane swap: the periapical takes the large pane (hero), the axial moves to the narrow side pane with its tools and the dock strip dimmed to 35 %. Orange contour (from 17.1 s) = projected extent of the lesion in the volume, clearly larger than the visible gray radiolucency; dashed blue trace follows the canal walls through the lesion | **The periapical underestimates it** · legend "extent on CBCT" · chip "canal outline · often still traceable". Source line: "Underestimation: Patel K et al., J Endod 2016" (scoped to the headline; the chip is not from that paper) |
| 19.2-24.0 | Strip, source line and lower panes clear by 19.2 s; headline out 19.1-19.3, title in 19.3-19.5; opaque take-home panel 19.4-19.55, its text from 19.55 (never text over text). Periapical + axial stay lit (complete summary frame = poster, t = 22.6). Card text and upper panes fade out 23.65-23.85 while the card's opaque panel stays solid; at 23.86 s the frames snap back to the opening grid (all panes black) → loop | **TAKE-HOME** 1 Recognize it early · 2 Consider CBCT before you treat · 3 Treatment depends on extent. Source: Patel et al., Int Endod J 2022;55 Suppl 4:892 |

Persistent, inside the safe area: tag "RESORPTION 5/5 · EXTERNAL CERVICAL", handle "@natebrooksendo",
"SCHEMATIC · not a patient scan · not to scale".

Must-read words: about 68 by the counting used in the first build (which gave 73), i.e. 73 by a strict count that
also includes the three row labels HEIGHT / SPREAD / PROXIMITY and CLASS (title 3, hook 4, stage 1: 7, stage 2: 17,
stage 3: 5, classification 12, 2-D scene 12, take-home 13). Still above the ~60-word guideline: what remains is the
classification strip (a table the viewer glances at, read one row at a time) and one in-pane chip per scene. All
must-read text is ≥ 30 px (captions 38 px, hook 44 px, headlines 58-62 px, end card 50 px, pane labels 30 px);
source lines 25 px, one citation per scene; viewer chrome (slice counter, zoom, orientation letters) 22 px.

## On-screen claims and sources (all taken from the verified rows of RESEARCH.md)

| # | On screen | Source (what was read) |
|---|---|---|
| 1 | "Entry just below the epithelial attachment" (stage 1, Initiation) | Mavridou AM et al., J Endod 2016;42:1737-1751, PMID 27776885 — abstract: "ECR was initiated at the cementum below the gingival epithelial attachment"; the word "just" follows Patel S et al., Int Endod J 2022;55 Suppl 4:892-921, PMID 35229320 — full text: "immediately below the epithelial attachment (Mavridou et al., 2016)" (RESEARCH row 1) |
| 2 | Stage names Initiation → Resorption → Repair, drawn as overlapping lanes | Mavridou 2016, PMID 27776885 — abstract: proposed 3-stage mechanism; resorption and repair "progress in parallel at different areas of the tooth" (row 2). Source line says "proposed 3-stage model" |
| 3 | "Spreads around the canal" | Patel S et al., Int Endod J 2022;55 Suppl 4:892-921, PMID 35229320 — full text: lesion spreads "circumferentially and apico-coronally" because the pulp is protected by the sheet; Chen Y et al., J Endod 2021;47:883-894, PMID 33745945 — abstract ("extends apicocoronally and circumferentially inside the dentin"); histology base Mavridou 2016 (row 3). The on-screen source line in this scene is Mavridou 2016: its abstract describes 3-D invasion toward the pulp space stopped by the *pericanalar* sheet but does not itself say "circumferential"; Patel 2022 credits the circumferential spread to that 3-stage model |
| 4 | "Pulp walled off — until late" + "resorption-resistant sheet" | Sheet: Mavridou 2016, PMID 27776885 — abstract ("pericanalar resorption-resistant sheet"; predentin + dentin, occasionally bone-like tissue, of fluctuating thickness — drawn here as a uniform band for clarity). "Until late": Heithersay GS, Quintessence Int 1999;30(1):27-37, PMID 10323156 — abstract ("protected by a thin layer of predentin until late in the process"); Patel 2022 full text ("Only in advanced cases does the ECR lesion perforate into the root canal") (rows 4, 7) |
| 5 | "avg ≈ 0.2 mm · ex vivo" | Mavridou 2016, PMID 27776885 — abstract: "fluctuating thickness averaging 210 μm", measured on extracted teeth. No "n" is shown because the abstract does not say how many teeth were measured (row 5 + fact-check). The chip is on screen only 8.3-13.2 s, i.e. only while the source line reads "Mavridou et al., J Endod 2016", so the one literature number never sits above a Patel citation or on the poster |
| 6 | "Bone-like tissue grows in" (stage 3, Repair) | Mavridou 2016, PMID 27776885 — abstract: "ingrowth and apposition of bonelike tissue into the resorption cavity"; Heithersay 1999, PMID 10323156 (row 8). The word "heals" is deliberately not used |
| 7 | Patel 3-D classification: HEIGHT 1-4 (ruler zones: 1 supracrestal, 2 coronal third, 3 mid third, 4 apical third) · SPREAD A ≤90° B ≤180° C ≤270° D >270° · PROXIMITY d dentin only / p probable pulp | Patel S, Foschi F, Mannocci F, Patel K, Int Endod J 2018;51:206-214, PMID 28746776 — abstract (row 37). "d dentin only" paraphrases "lesion confined to dentine"; "p probable pulp" shortens "probable pulpal involvement" (a judgment from the scan, not proof of perforation — said in the caption) |
| 8 | "The periapical underestimates it" | Patel K, Mannocci F, Patel S, J Endod 2016;42:1435-1440, PMID 27507628 — abstract: periapicals "underestimated the size of the ECR lesion" and had limited ability to detect circumferential spread; 115 consecutively diagnosed teeth, CBCT as comparator (row 30). No percentage is shown (the 40% vs 70% figures belong to a different, ex vivo study and stay off screen). Exact: 115 teeth in 98 patients. The source line reads "Underestimation: Patel K et al., J Endod 2016" so that it is tied to this headline only |
| 9 | "canal outline · often still traceable" | Heithersay 1999, PMID 10323156 — abstract ("characteristic radiopaque line generally separates the image of the lesion from that of the root canal"); Patel 2022, PMID 35229320 — full text ("root canal outline is visible as long as there is no perforation"); "often" because Luso S, Luder HU, Schweiz Monatsschr Zahnmed 2012;122:914-930, PMID 23097140 found the intact wall frequently not recognizable on conventional films (rows 27, 29). Board-accuracy note: the canal outline is classically visible through the lesion (Heithersay 1999, "generally") but not reliably on 2-D films (Luso & Luder 2012). Patel K 2016 does NOT support this chip: the scene's source line is therefore scoped ("Underestimation: Patel K et al., J Endod 2016"), and the chip stays lit through the end card, whose source line (Patel 2022, full text) does state it. Heithersay and Luso & Luder are cited here and in meta.json |
| 10 | "Consider CBCT before you treat" | Patel K 2016, PMID 27507628 — abstract conclusion ("A CBCT scan should be considered before the management of a potentially restorable ECR lesion"); Patel 2022, PMID 35229320 — full text, the end card's on-screen source: "CBCT should be considered prior to managing ECR (ECR Position statement, European Society of Endodontology, 2018)" (the statement itself: Int Endod J 2018;51:1323-1326, PMID 30171768, abstract only, no recommendation wording in the abstract). "Consider" kept, no statement wording quoted (row 35) |
| 11 | "Treatment depends on extent" | Patel 2022, PMID 35229320 — full text, the end card's on-screen source: "Management of ECR depends on the nature and accessibility of the lesion" (and, citing Mavridou 2022, survival "appeared to be related to the extent of the ECR lesion regardless of the treatment option selected"); Patel S et al., Int Endod J 2018;51:1224-1238 (ECR part 2: management), PMID 29737544 — abstract: approach chosen by position/extent and access (review, external repair ± endodontic treatment, internal repair, replantation, extraction) (row 39) |
| 12 | "Recognize it early" | Clinical take-home from the recommended end card of RESEARCH.md (b) 8; rationale: outcome falls with extent — Heithersay GS, Quintessence Int 1999;30(2):96-110, PMID 10356561 (success 100% classes 1-2, 77.8% class 3, 12.5% class 4; ≥ 3 y, 101 teeth, 1999 trichloracetic-acid protocol — figures deliberately NOT on screen) whose abstract concludes "Diagnosis of lesions at an early stage is, therefore, highly desirable"; Patel 2018 part 2 abstract (supracrestal, superficial lesions with limited circumferential spread: surgical repair without root canal treatment is the preferred approach) |

Not on screen (caption / here only): often symptom-free (58.1% of 215 referred lesions were incidental
radiographic findings; pink spot 5.1% — Patel et al., Int Endod J 2023;56:1475-1487, PMID 37801348); associations
(orthodontics, trauma most often reported; cause unknown); no randomized trials on treatment (Bardini et al., Aust
Endod J 2023;49:769-787, PMID 37702252). Nothing from the RESEARCH.md "Do not claim" list is shown.

## What is schematic (say so if asked)

- **Not a patient scan.** A procedural single-rooted mandibular tooth (crown up, so "below the attachment" reads
  literally), two neighbours, alveolar bone with a scalloped crest, gingiva. Grey values only imitate CBCT
  contrast (enamel > dentin > cortical bone > trabecular bone > soft tissue > air). The canal is drawn generously wide.
- **Not to scale.** The sheet is drawn 0.32 mm thick so it survives the voxel grid and a phone screen; the
  published average is 0.21 mm. The label therefore quotes the published average ("avg ≈ 0.2 mm · ex vivo") and is
  not a caliper reading of the picture. No voxel size or mm readout is printed anywhere.
- **Lesion = toy model.** An "arrival-time" field makes the lesion enter through a ~1 mm portal 0.9 mm apical to
  the CEJ (supracrestal: the alveolar crest is drawn ~2 mm apical to the CEJ, so the portal sits in the attachment
  zone between the epithelial-attachment bracket and bone), run to the pericanalar zone, then spread along the sheet circumferentially (further on
  the lingual than the buccal side) and apico-coronally, thickening outward, with dentin islands left behind.
  Speed, shape and the 24-second time-lapse are invented; ECR progression rates are not known.
- **Repair patches** appear first in the oldest part (near the portal) while fronts still advance — this follows
  the overlap described by Mavridou 2016; amount and position are illustrative.
- **Tool readings** (≈233°, zone 2, class "2Cp") are measurements of the drawn model (computed live from the
  volume by `measureSpread` / `measureHeight`), shown to demonstrate how the classification is read. "p" is the
  honest coding of a lesion lying against the canal on a scan; it does not contradict "walled off" (p = probable
  pulp involvement, not proof of perforation — see RESEARCH.md (d)).
- **Sheet band.** The real sheet is predentin + dentin (occasionally bone-like tissue) of fluctuating thickness,
  recognized where the lesion abuts the canal (Mavridou 2016). It is drawn as a uniform band for clarity: faint all
  round the canal, bright only along the lesion-facing arc.
- **Periapical** = parallel projection of the same volume with an ad-hoc attenuation curve and film grain. Lesion
  voxels only darken the film where the beam crosses enough lesion (smooth threshold 0.9 → 2.6 mm of lesion along
  the beam, an invented "detection threshold"), so thin margins and the bucco-lingually wrapped arms stay below
  visible contrast. The orange contour is the projected silhouette of the model's lesion (≥ 0.25 mm along the beam)
  = "extent on CBCT". Outline = the model's true extent; the visible radiolucency is smaller. Illustration only: no
  size ratio is implied or claimed (claim source: Patel K et al., J Endod 2016;42:1435-1440, abstract).
- The colored overlay (orange lesion, ivory repair, mint sheet) is a segmentation-style tint, not something a
  CBCT shows.

## Design rationale

- **Style commitment:** near-black workspace, IBM Plex Mono chrome / IBM Plex Sans captions, cyan-magenta-yellow
  linked crosshairs (axial / coronal / sagittal), slice counter, zoom readout, orientation letters, pane tabs,
  measurement tools (angle, height ruler), status bar. Pane "splitters" move (grid → axial focus → radiograph
  as the large pane with the axial beside it) the way a user would rearrange a viewer, which also keeps one focal pane per beat.
- **Three semantic colors only:** orange = resorbing lesion, mint = protected canal / resistant sheet, ivory =
  bone-like repair (blue is reserved for anatomy labels: epithelial attachment, canal outline). The same colors
  are used in captions, panes, the 3-D pane and the stage timeline.
- **Structure for study:** headline = stage name (1 Initiation / 2 Resorption / 3 Repair), sub-line = the one fact;
  the dock shows the stages as overlapping lanes, then turns into the Patel 3-D table; the poster (t = 22.6 s) is
  a complete summary frame: title, radiograph (hero pane) with canal outline and the model's true extent, axial slice with
  the lesion around the sheet and the measured spread, three take-homes, source, schematic note.
- **Layout / safe areas:** all must-read text inside x 64-1016, y 236-1562; nothing must-read under the right-hand
  button column (x > 960, y > 1100 holds only pane imagery); app bar and status bar are decoration under the
  Instagram header/footer.
- **Loop:** title is identical on the end card and at t = 0; the take-home text and the upper panes fade out
  (23.65-23.85 s) while the card's panel stays opaque, then the frames snap back to the opening grid (23.86 s, all
  panes black, opening slice number) before the cut; imagery is back by ~0.4 s.

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

## Review changes (independent science + design review)

Science
- **"p" vs intact sheet (should).** The mint band steps back to 40 % as the "p" chip lights (15.0 s), so "intact
  sheet" and "probable pulp" are not asserted at full strength together. Caption now says: on CBCT a lesion against
  the canal is coded "p" (probable pulp involvement, Patel 2018): a scan judgment, not proof of perforation; a thin
  sheet often still separates the two.
- **0.2 mm number (should).** The sheet chip (with "avg ≈ 0.2 mm · ex vivo") now leaves at 13.2 s with the Mavridou
  source line; it no longer sits above Patel citations, beside the model's angle reading, or on the poster.
- **Under-estimation actually visible (should).** Periapical projection got a detection threshold (thin margins and
  wrapped arms fall below contrast) and the "extent on CBCT" overlay became a constant-width contour with no fill:
  a clear rim now separates the gray radiolucency from the orange contour. NOTES state that no size ratio is implied.
- **Refs (nit).** Caption refs now carry volume:page (Patel 2018 = 51:206, the classification paper).
- **Crest (nit).** Alveolar crest lowered to ~2 mm below the CEJ; portal now clearly supracrestal. The axial
  "home" slice moved with it, so the model's spread reading is now ≈233° (was ≈245°; still class C).
- **Sheet band (nit).** Bright only along the lesion-facing arc; composition / fluctuating thickness noted above.
- **"often" (nit).** Heithersay vs Luso & Luder nuance recorded in the claims table and meta.json (not in the
  caption: no room within 700 characters once the "p" sentence went in).

Design
- **Classification scene (should).** Sequenced height → spread → proximity with the inactive rows at 40 %; class
  complete at 15.2 s and held 1 s.
- **Periapical scene (should).** Radiograph takes the large pane; axial tools and dock strip dim to 35 %; contour
  starts at 17.1 s and holds through the end card.
- **Word cuts (should).** Removed the "Patel 2Cp" badge and the "epithelial attachment" chip (bracket thickened to
  7 px instead), "p probable pulp involvement" → "p probable pulp", sheet chip ends at 13.2 s, one citation per
  scene. Also removed the 3-D "lesion / pulp" legend.
- **Occluded angle arc (should).** Solved by removing the sheet chip before the angle tool appears.
- **End-card entrance (should).** Strip, source line and lower panes are gone by 19.2 s; headline → title hand over
  at 19.3 s without overlap; opaque panel first, text after.
- **Scene 2 focus (should).** Scene-1 markers end at 5.5 s, splitters move 5.4-6.0 s, slice scroll delayed to
  7.0-7.9 s.
- **Nits.** Slice held still in scene 3 + brightening pulse on the repair tissue; shorter black hold at the loop
  seam and faster boot; hook sub-line 44 px with "2-D" in orange and the lesion starting at 1.6 s; 3-D pane rendered
  finer (RS 1.2) with a 0.9 px blur; pane label "PERIAPICAL 2-D" at 30 px; right-hand orientation letter of the
  bottom-right pane hidden in the last layout, top letter of the narrow axial pane hidden (it sat against the slice
  counter); canal trace now stops above its chip and the leader points at the trace.

Not changed: the headline → title change is sequential (0.2 s out, 0.2 s in, centered on 19.3 s) rather than a true
crossfade, because a crossfade would put two texts on top of each other for a few frames.

## Final QA (fresh-eyes pass)

Checked 20 stills with `--safe` (t = 0 … 23.95 s) plus 12 transition / loop-seam stills, RESEARCH.md against every
on-screen line, meta.json against the reel, the MP4 (ffprobe) and the poster.

- **Fixed — ghosting at the loop seam (23.65-23.85 s).** The take-home panel and the cover under it faded out
  together with their text, so for ~6 frames the lower panes came back through the card: "CORONAL" sat on top of
  "TAKE-HOME", and the coronal / 3-D / sagittal imagery and labels showed through the three take-home lines. Now
  only the card's TEXT fades; the cover and the opaque panel hold until the layout snaps back to the opening grid
  at 23.86 s (panes are black by then), so no two texts ever overlap at the loop. Take-home hold is unchanged
  (all three lines fully lit 20.3-23.65 s = 3.35 s).
- **Fixed — slice counter at the seam.** The AXIAL readout showed 096/208 on the re-formed opening grid and jumped
  to 166/208 at t = 0; the last four frames now show the opening slice number.
- **meta.json.** Chip timing corrected to 8.3-13.2 s (was "8.0-13.2 s"); everything else already matched the reel
  (9 claims in on-screen order, caption 698 characters, Refs cover every caption claim, duration 24.0 s).
- Checked and left as is: all must-read text ≥ 30 px and inside x 64-1016 / y 236-1562; nothing must-read under
  the button column (the height-ruler chips sit at y 660-965, above it); hook readable from the first frame
  (title at t = 0, sub-line by 0.3 s); poster (t = 22.6 s) reads inside the 3:4 crop; the ≈233° sweep ends at the
  tip of the thin lingual arm that hugs the sheet (model measurement, class C either way); stage 1 anatomy
  (bracket on cervical enamel ending at the CEJ, portal 0.9 mm apical, crest ~2 mm) is consistent with "just below
  the epithelial attachment"; pane names (sagittal = mesio-distal, coronal = bucco-lingual) are right for the
  posterior single-rooted tooth that is drawn.
- Not changed (taste / already recorded): word count above the ~60-word guideline; inactive strip rows at 40 %
  for < 1 s each; the 0.8 s pane-swap overlap at 16.2-16.9 s; scene 2 shows "Mavridou et al., J Endod 2016" as its
  single source line although "spreads around the canal" is worded after Patel 2022 (both are in meta.json and
  the caption Refs).

## Known weaknesses

- ~68-73 must-read words (see count above) and 24.0 s: still at the top of both budgets; a few captions are
  0.1-0.4 s under the strict `Kit.readSecs` time.
- The lesion model is a single plausible pattern; real ECR is far more variable (multiple portals, perforation
  in advanced cases).
- The on-screen result "p" still needs the caption to explain that it is a scan judgment; on screen the only cue
  is the sheet band stepping back.
- The radiograph's detection threshold is invented; the rim between radiolucency and contour illustrates the
  direction of the error, not its size.
- "often still traceable" has no source of its own in the 2-D scene (the line there is scoped to the underestimation
  claim); its sources are the end-card line (Patel 2022) and meta.json; the Heithersay / Luso & Luder nuance is off screen.
- The 3-D glass silhouette still shows faint voxel steps at full resolution.
- Bottom-right pane sits partly under the Instagram button column (imagery only).

## Citation audit (2026-11-22)

Scope: every literature citation on screen (four source lines), in meta.json (claims + caption Refs), in this file
and in RESEARCH.md. According to PubMed: the 12 papers behind on-screen claims were re-fetched by PMID and their
abstracts re-read (27776885, 35229320, 10323156, 28746776, 27507628, 23097140, 29737544, 10356561, 33745945,
30171768, 37801348, 37702252); the ECR section of Patel 2022 was re-read in PMC full text (PMC9790676:
introduction, histopathology, radiographic features, management); the other 40 paginated references of RESEARCH.md
were matched by journal / year / volume / first page / first author (all returned the PMID given), and Lima 2026
(no volume or pages yet) and Patel 2026 were fetched by PMID: 53 records in all. Not readable in full text (abstract only): Mavridou 2016, Heithersay 1999 (both), Patel 2018
(classification and part 2), Patel K 2016, Luso & Luder 2012, Chen 2021 (J Endod), ESE 2018.

Result: no wrong first author, year, journal, volume, page or PMID anywhere; every number and quotation attached to
an on-screen claim is in the abstract or full text named. The only on-screen literature number ("avg ≈ 0.2 mm ·
ex vivo") is the Mavridou 2016 abstract's "averaging 210 μm" on extracted teeth. The problems were attribution
problems (a source line sitting under claims its paper does not make):

| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | End card (19.55-23.65 s, poster) | The source line "Patel et al., Int Endod J 2018;51:1224" (ECR part 2, abstract only) supports "Treatment depends on extent" but not "Consider CBCT before you treat" (the abstract never mentions CBCT) nor "Recognize it early"; it was also the one on-screen citation missing from the caption's Refs line | Reel changed: the line now reads "Patel et al., Int Endod J 2022;55 Suppl 4:892" — read in full text: "CBCT should be considered prior to managing ECR", "Management of ECR depends on the nature and accessibility of the lesion", outcome falling with extent (Heithersay 1999, Mavridou 2022 as quoted there). It is already in the caption Refs. Part 2 stays in meta.json as abstract-level support for take-home 3; "early" stays credited to Heithersay 1999 (30:96-110, abstract) |
| 2 | 2-D scene (16.2-19.2 s) | "Patel K et al., J Endod 2016" was the only source line under the chip "canal outline · often still traceable" and the dimmed Patel 3-D strip; that abstract says nothing about the canal outline (sources: Heithersay 1999 abstract, Patel 2022 full text, Luso & Luder 2012 abstract) | Reel changed: line now reads "Underestimation: Patel K et al., J Endod 2016" (tied to the headline). The chip stays lit above the end card, whose new source line (Patel 2022) does state it. No must-read words added |
| 3 | meta.json claim 2 | Mavridou 2016 "abstract" was listed as support for "circumferentially and apico-coronally"; the abstract says the resorption invades "3-dimensionally toward the pulp space" and is stopped by the pericanalar sheet, not that it spreads circumferentially | Source rewritten: Patel 2022 full text (wording) + Chen 2021 abstract ("extends apicocoronally and circumferentially inside the dentin"); Mavridou 2016 named as histology base / on-screen line with that limit stated |
| 4 | meta.json claim 1, NOTES row 1 | "just below" was credited to the Mavridou abstract alone, which says "below" | Patel 2022 full text ("immediately below the epithelial attachment (Mavridou et al., 2016)") added |
| 5 | meta.json claims 3, 6, 7, 8; NOTES rows 8-12 | Sources lacked the verified quotation / denominator (115 teeth in 98 patients; "until late" second source; "early stage ... highly desirable") or still named the old end-card line | Rewritten to match the reel as rendered |
| 6 | RESEARCH.md row 35 | Did not record that the Patel 2022 full text also says "Preoperative CBCT is essential in the treatment planning" (stronger than "should be considered") | Added to row 35; on-screen wording stays "Consider" (the conservative, twice-verified form) |

Checked and left as is: scenes 1-3 keep "Mavridou et al., J Endod 2016" as their single source line although
"spreads around the canal" is worded after Patel 2022 and "until late" after Heithersay 1999 — Patel 2022 itself
credits the circumferential spread to Mavridou's 3-stage model, "until late" is more cautious than Mavridou's "did
not penetrate the pulp space", and both extra sources are in meta.json and the caption Refs. Caption unchanged
(698 characters); its Refs line now covers every on-screen source line. Video re-rendered once after the two
source-line edits (stills in `_stills/audit`).

# 38 · Bioceramics and tissue: biocompatible, osteoconductive ... osteoinductive?

**Style:** construction-site diorama, flat vector, in cross-section. One Canvas 2D frame: sky blue, concrete gray,
hi-vis orange and safety yellow; a crane-hung signboard, scaffolding, tower cranes, hard-hat workers standing in
for cells, long soft shadows sheared onto the ground slab, a cut slab face with a service main underneath.
Oswald 700/500 (signage), Barlow Condensed 500/600 (plates and labels), Barlow 500 (source lines).
**Duration:** 24 s · 1080×1920 · silent · poster at 22.0 s (the complete verdict board). American spelling.
**Files:** `index.html` (camera, signboard, evidence plate, `render(t)`), `site.js` (palette, primitives, workers,
props, backdrop), `plots.js` (timeline constants `TL`, zoom table, the five plots).

## Concept
Five plots on one street. The camera pans right from plot to plot and wraps back to the first, so the last frame
equals frame 0. The crane lowers one signboard per beat (one word plus a one-line definition); an evidence plate
under the slab tags every beat with its evidence type and one source line. The cast:

| Figure | Stands for |
|---|---|
| gray speckled block | set calcium silicate cement (stenciled MTA in the three in vivo plots; left blank in the culture dish) |
| red helmets + red beacon | the early inflammatory reaction |
| yellow helmets, orange vests | hard-tissue-forming cells (cementoblasts in plot 1, osteoblasts in plot 2) |
| bare-headed new hires | immature (undifferentiated) cells |
| white-helmet foreman with megaphone and Ca²⁺ flag | the signal from the material |
| cyan crystal skin | apatite layer (bioactivity) |

## Storyboard (seconds, as built)
| t | Beat | On screen |
|---|------|-----------|
| 0.0–1.7 | **Hook.** Title sign in place on frame 0. Plot 1: a resected root drawn as a cut pipe (dentin walls, root filling, MTA plug); three red helmets and a strongly pulsing beacon stand at the cut end. Builders walk in from frame 1 (starts 0.0, 0.3, 0.8; the first is in view by about 0.2 s). | ARE ENDO BIOCERAMICS / OSTEOINDUCTIVE? · ROOT · MTA |
| 1.7–2.5 | Title is hoisted out, beat-1 sign is lowered (0.5 s, small damped sway). | |
| 2.5–7.2 | **BIOCOMPATIBLE.** The AMALGAM billboard fades in with the sign (2.5–3.0) and stands for the whole beat: gray silhouette of a root end with a dark filling, three red helmets that never leave, a few cementum tiles on the cut dentin above and below the filling and none over it. On the site two of the three red helmets walk off (2.5–5.0) and the beacon dims; the third steps up to the root (3.3–3.9) and stays in clear view. Builders lay a cementum course up the cut root end and over the filling (13 tiles, 3.5–6.4). Evidence plate in at 2.4 with its number (full opacity 2.75–7.2, 4.45 s; it fades out over the first 0.3 s of the pan). Nothing new appears after 3.2 s. | BIOCOMPATIBLE · early inflammation subsides · ANIMAL HISTOLOGY · **5 of 6** root ends: complete cementum over MTA · monkey · 5 months · AMALGAM · *Torabinejad et al. 1997, J Endod* |
| 7.2–7.85 | Pan to plot 2; the next sign is lowered from 7.55 so it lands as the plot centers. | |
| 7.85–11.2 | **OSTEOCONDUCTIVE.** The MTA block stands in a pit between two old-bone walls. A crystal skin grows over its faces (7.75–8.6), tagged at 8.25. Scaffold bays stand clear of the block faces; builders lay outlined new-bone bricks in both gaps (8.3–11.0, each brick glows yellow for 1.5 s): the first row runs from the old bone to the block, every later row starts against the block. A 7 px orange seam, drawn over the crystals, marks the contact line. | OSTEOCONDUCTIVE · bone grows on the surface · BONE · MTA · apatite layer *(in vitro)* · ANIMAL HISTOLOGY · *Torabinejad 1998: MTA in guinea-pig bone · apatite: Sarkar 2005 · J Endod* |
| 11.2–11.85 | Pan to plot 3; sign lowered from 11.55. | |
| 11.85–15.2 | **OSTEOINDUCTIVE? — the lab signal.** The block sits in a culture dish (glass tray, pink medium). The foreman on the block signals through a megaphone and holds a Ca²⁺ flag; yellow dots drift through the medium. Four bare-headed hires get helmets one by one (12.55, 12.8, 13.05, 13.3). Three dials rise to the same height (12.75, 13.05, 13.35) and each gets a green up-arrow; all three arrows are up by 14.3, so the finished state holds 0.9 s before the pan. A dashed cable runs from the Ca²⁺ flag to the BMP-2 dial only. | OSTEOINDUCTIVE? · immature cells → bone-forming cells · Ca²⁺ · BMP-2 · ALP · OSTEOCALCIN · CELL CULTURE · *Maeda 2010, J Endod (Ca²⁺, BMP-2) · Wang 2014, Cell Prolif (ALP, osteocalcin)* |
| 15.2–15.85 | Pan to plot 4; the sign stays. | |
| 15.85–18.9 | **The strict test.** Skin-colored ground with fat lobules in the cut face. MTA block on a site labeled as non-bony. White mineral chips pop in around and on the block (15.6–16.6); a dashed outline of the bone that never gets built pulses on both sides; two hires stay bare-headed; one red helmet and a dim beacon remain. The stamp lands at 16.4–16.6 and is the only focal point until the pan (about 2.3 s). The plate carries the tag and source only. | NON-BONY SITE · rat · subcutaneous · ANIMAL HISTOLOGY · **ECTOPIC BONE: NOT SHOWN** · *Moretton et al. 2000, J Biomed Mater Res · rat, 15–60 days* |
| 18.9–19.6 | Sign hoisted, pan to plot 5. | |
| 19.6–23.3 | **Payoff: verdict board.** Three rows; marks pop at 19.65, 19.83, 20.01; complete at 20.41 and held 2.89 s. | MTA-TYPE CALCIUM SILICATE CEMENTS · ✓ BIOCOMPATIBLE tissue tolerates it (animal + human histology) · ✓ OSTEOCONDUCTIVE bone grows on it (animal histology) · ? OSTEOINDUCTIVE cell-culture signals / ectopic bone: not shown · SOURCES (fine print) |
| 23.3–24.0 | Camera pans on to plot 1 (wrap); the title sign is lowered from 23.55 in 0.42 s, after most of the board has left: frame 720 = frame 0. | |

Handle `@natebrooksendo` and "SCHEMATIC · NOT TO SCALE" sit on the plinth strip under the slab for the whole reel.

**Must-read words: 84** (hook 6, beat 1 19, beat 2 13, beat 3 21, verdict board 25). About 66 are first exposures:
the evidence tag ANIMAL HISTOLOGY appears four times and the board repeats the three terms and the stamp wording.
The review cut four words from the strict-test scene (25 to 21 in beat 3) and the science fixes added three
(ENDO, complete, MTA-TYPE). Still above the 60-word target; see Known weaknesses. Smallest must-read type on
screen: 38 px (dial labels, 29 px drawn at 1.3× zoom); the board tags are 30 px. Source lines 24–25 px, plinth strip 24–26 px (fine print).

## On-screen claims and sources
Every source below is in RESEARCH.md (three verification passes against PubMed abstracts, plus section (i) added
at the review stage). "Verified from" there is "abstract" for all of them; no full text was read.

1. **BIOCOMPATIBLE · early inflammation subsides** (most red helmets leave, one stays, beacon dims but stays on).
   Torabinejad M, Parirokh M. J Endod 2010;36:190-202, PMID 20113774 (review: MTA "is a biocompatible material").
   Gomes-Filho JE et al. J Endod 2009;35:256-60, PMID 19166785 (rat subcutaneous: mild to moderate at 7 days,
   similar to control by day 30). Moretton TR et al. J Biomed Mater Res 2000;52:528-33, PMID 11007621 (rat
   subcutaneous: severe at first, subsided to "mostly moderate"). Torabinejad M et al. J Endod 1998;24:468-71,
   PMID 9693572 (guinea-pig bone, 80 days: free of inflammation in every specimen). Wording is "subsides", not
   "resolves"; one red helmet stays because 1 of 6 MTA root ends in the monkey study was still inflamed.
2. **5 of 6 root ends: complete cementum over MTA · monkey · 5 months · animal histology.** Torabinejad M et al. J Endod
   1997;23:225-8, PMID 9594770: "five of six root ends filled with MTA had a complete layer of cementum over the
   filling"; no periradicular inflammation at five of six. Three monkeys, healthy maxillary incisors.
3. **AMALGAM billboard** (red helmets stay; cementum tiles on the cut dentin only, a gap over the filling). Same paper: "all root ends filled with
   amalgam showed periradicular inflammation, and cementum had not formed over the root-end filling material".
   No count is shown for amalgam because the abstract does not give one. The same abstract says cementum did form
   over the cut root end (not over the filling) with amalgam; since the final QA the billboard draws exactly that.
4. **OSTEOCONDUCTIVE · bone grows on the surface.** Definition: Albrektsson T, Johansson C. Eur Spine J 2001;10
   Suppl 2:S96-101, PMID 11716023 ("Osteoconduction means that bone grows on a surface"). Evidence: Torabinejad
   1998 (PMID 9693572; 20 guinea pigs, tibia and mandible, 80 days; in the tibia MTA was "the material most often
   observed with direct bone apposition"; no frequency is given, so none is shown). Moretton 2000 (rat:
   "osteogenesis occurred in association with intraosseous implants indicating that both materials are
   osteoconductive"). Osteoconduction is not special to these cements: in Moretton 2000 the EBA comparator was
   also "osteoconductive", and Albrektsson calls it "regularly seen in the case of bone implants".
5. **apatite layer (in vitro).** Sarkar NK et al. J Endod 2005;31:97-100, PMID 15671817 (MTA in phosphate-buffered
   fluid: hydroxyapatite-like precipitates and an adherent interfacial layer). Gandolfi MG et al. Int Endod J
   2010;43:917-29, PMID 20646080 (apatite nucleation within 5 h, even coating at 1 day) supports the same point and
   is cited in the caption notes only.
6. **OSTEOINDUCTIVE? · immature cells → bone-forming cells.** Albrektsson & Johansson 2001: osteoinduction "implies
   the recruitment of immature cells and the stimulation of these cells to develop into preosteoblasts".
7. **CELL CULTURE · BMP-2, ALP, osteocalcin rise · Ca²⁺ wired to BMP-2 only.** Maeda H et al. J Endod
   2010;36:647-52, PMID 20307738 (human PDL cells from 2 donors: calcium released from MTA, BMP-2 up and
   calcification; CaCl2 reproduced it, MgCl2 did not). Wang Y et al. Cell Prolif 2014;47:241-8, PMID 24635197 (rat
   mandibular bone marrow stromal cells with MTA 0.02 mg/ml: higher ALP activity, Ocn/OCN up-regulated; the
   material was not separated into ions, so those two dials have no cable). Wang replaced Peng 2011 (J Endod
   2011;37:1240-6, PMID 21846540) on screen because Peng is an odontogenic-differentiation study of pulp cells and
   the sign defines the term by bone-forming cells. The block in this plot carries no stencil (kept unlabeled so
   the scene gains no word; both cited studies used MTA).
8. **NON-BONY SITE · rat · subcutaneous · ECTOPIC BONE: NOT SHOWN.** Moretton 2000: "subcutaneous and intraosseous
   implantation of the materials in rats"; "Osteogenesis was not observed with either material upon subcutaneous
   implantation indicating that neither material is osteoinductive"; dystrophic calcification (the white chips);
   15, 30, 60 days. The strict (heterotopic-site) test: Barradas AM et al. Eur Cell Mater 2011;21:407-29, PMID
   21604242, which also states that rodents show "limited, if any, bone induction by biomaterials": the stamp
   therefore says "not shown", and the caption says rats are a weak model and no large-animal test was found.
9. **Verdict board, header MTA-TYPE CALCIUM SILICATE CEMENTS** (every in vivo study shown used MTA). BIOCOMPATIBLE
   ✓ tissue tolerates it (animal + human histology): items 1–3 plus human pulp histology, Nair PNR et al. Int
   Endod J 2008;41:128-50, PMID 17956562 (20 MTA-capped third molars: mostly free of inflammation at 1 week,
   hard-tissue barrier by 3 months). "Tissue tolerates it" paraphrases Williams DF, Biomaterials 2008;29:2941-53,
   PMID 18440630 (abstract: the requirement for a long-term device is "that the material shall do no harm to those
   tissues"). The unchecked 1987 textbook is no longer cited. OSTEOCONDUCTIVE ✓ bone grows on it (animal
   histology): item 4. OSTEOINDUCTIVE ?: items 7–8.

## What is schematic
- The whole site metaphor. Helmets going on in the dish stand for marker expression and mineralization in culture,
  not for a demonstrated cell-fate change in patients.
- The dials have no scale: direction only. All three needles settle at the same height because the markers come
  from different cell systems and are not comparable.
- Culture results are not uniform. MTA-conditioned medium lowered osteocalcin, bone sialoprotein and von Kossa
  staining in mouse PDL and marrow progenitors (Vidovic Zdrilic et al., J Periodontal Res 2017;52:1058-67, PMID
  28691752); results vary with extract dilution and cell type.
- Marker expression is also reported in rat subcutaneous tissue (Souza 2021, J Biomed Mater Res B; Martins 2023,
  Int Endod J) and in a mouse lineage-tracing model at an orthotopic site (Vidovic Zdrilic 2017); none of these is
  bone at a non-bony site. Endodontic papers use "osteoinductive" for such findings, including bone formation in
  rabbit tibia (Gandolfi 2017, Dent Mater).
- Scope. "Bioceramics" here means endodontic calcium silicate cements. Other bioceramics have passed the ectopic
  test: calcium phosphate ceramics (Barradas 2011) and a Bioglass 45S5 glass-ceramic that formed bone in dog muscle
  in 16 of 16 implants (Yuan et al., J Biomed Mater Res 2001;58:270-6, PMID 11319740).
- Material differences. Every in vivo study shown used MTA. Rat two-site data exist for Biodentine, NeoMTA and a
  premixed sealer (RESEARCH.md rows 52, 53), and Torabinejad, Parirokh & Dummer 2018 (Int Endod J) note low levels
  of evidence for the newer cements. The caption says "Mostly MTA data."
- Tile and brick counts, the order bricks are laid in, and the timing are illustrative. The "first row from old
  bone, later rows against the block" choreography illustrates growth along a surface; it is not a measured sequence.
- The crystal skin is drawn on the block in the bone scene to tie bioactivity to the surface story; it is tagged
  "in vitro" on screen because apatite formation is shown in phosphate-containing fluid, not in tissue.
- Plot 1 deliberately shows only a cementum course on the root end (no bone bonded to a root-end filling);
  bone-on-material is shown only where the material sits in bone.
- The root is rotated 90° and drawn as a cut pipe; nothing is to scale.

## Design rationale
- One street, one camera move: the pan between plots is the only scene transition, and the wrap gives a seamless loop.
- The signboard is screen-fixed and color-coded: navy for the question, yellow for the two established properties,
  hazard-striped orange for the open one. The verdict board reuses the same code (green ticks, striped amber "?").
- Text lives in three fixed places (sign, in-scene site boards, evidence plate) so the eye learns where to look.
- Each plot is drawn zoomed 1.3× about the ground line so the workers are about 145 px tall on a phone.
- Captions the picture already carries were cut (beats 2 and 3a have a tag and a source line only).

## QA log
- Pass 1: figures too small, stage half empty: added per-plot zoom and re-laid out every plot.
- Pass 2: gauge board, site sign and BONE label crossed the safe area; stamp overlapped the site sign; block
  speckles formed a diagonal artifact; apatite skin invisible; hazard stripes overran row 3 of the board. Fixed.
- Pass 3: long source lines reached the button column (auto-fit added, max 872 px); billboard overshoot touched the
  definition plate; loop sway mismatch at t = 0. Fixed. Board header and Sarkar/Nair sources added.
- Final: 10-still sheet with `--safe`, transition frames, four frames pulled from the MP4. No console errors.
  1080×1920, 30 fps, 720 frames, H.264 + silent AAC.

## Review changes (independent science + design review)
Science
- Hook sign now reads ARE ENDO BIOCERAMICS / OSTEOINDUCTIVE?; caption opens "Are endodontic bioceramics ...".
- Verdict header changed from CALCIUM SILICATE BIOCERAMICS to MTA-TYPE CALCIUM SILICATE CEMENTS; caption adds
  "Mostly MTA data."
- Lab-scene source line: Peng 2011 replaced by Wang 2014, Cell Prolif (marrow stromal cells, MTA; verified from the
  PubMed abstract). Caption names the cell types. Contrary result (Vidovic Zdrilic 2017) recorded above.
- Non-bony-site sign: "rat skin" changed to "rat · subcutaneous".
- "Tissue tolerates it" now sourced to Williams 2008 (verified abstract); Williams 2008 and Wang 2014 added to the
  on-screen SOURCES fine print, Peng 2011 removed.
- Caption rewritten: rodent caveat (Barradas 2011), "no large-animal test found", endodontic scope, cell types;
  "early inflammation subsides" dropped from the caption (it stays on the sign, sourced in item 1).
- Dials: all three needles settle at the same height; all three arrows up by 14.3 s.
- Evidence plate: "root ends: complete cementum over MTA" (the abstract says a complete layer in 5 of 6).
Design
- Beat 3a re-timed: 0.4 s moved from beat 2 (bone rows 0.27 to 0.23 s apart, pan at 11.2 instead of 11.6); helmets
  and dials front-loaded so the finished state holds 0.9 s.
- Beat 3b: plate caption "mineral deposits, no bone" cut; stamp moved from 16.95 to 16.4; chip stagger 0.09 to
  0.045 s. The stamp now has about 2.3 s as the single focal point.
- Beat 1: the number comes in with the plate (3.85 s at full opacity; lengthened to 4.45 s in the final QA); the AMALGAM billboard is a standing prop
  from 2.5 s; the red helmet that stays stops beside the beacon in clear view instead of in the button column.
- Object labels darkened to at least 4.5:1: ROOT #7A5F1E, BONE #6E5A24, MTA #3F4954.
- Beat 2: scaffold bays pulled off the block faces, contact seam 7 px and drawn over the crystals, new-bone bricks
  outlined, fresh-brick glow 1.5 s.
- Gauge board: dials r 50 at cx 458/592/726, so OSTEOCALCIN sits inside the board border.
- Verdict board: mark stagger 0.3 to 0.18 s; complete at 20.41 s, held 2.89 s.
- Nits: builders enter from frame 1 and the beacon pulses harder during the hook; incoming signs delayed 0.2 s so
  they land as the plot centers; title sign at the wrap drops in 0.42 s from 23.55 s; underground cut lifted
  (#2B394B) with a clearer pipe and strata.
Not changed: verdict row 3 keeps two lines ("cell-culture signals" is more accurate than "cell culture only", see
the marker-expression caveat above); the lab-scene block stays unlabeled.
Checked: stills at 40 time points with `--safe`, frames pulled from the re-rendered MP4; frame 720 matches frame 0
(largest pixel difference 14/765, anti-aliasing only); ffprobe 1080×1920, 30 fps, 720 frames, 24.0 s.

## Final QA (fresh-eyes pass, 2026-11-22)
Checked: 23 stills with `--safe` (t = 0 … 23.95, every beat and every transition), the poster, eight frames pulled
from the MP4, first vs last MP4 frame, all 13 cited PMIDs re-opened on PubMed (abstracts match every on-screen number
and wording), meta.json against the schema. No clipped, overlapping or sub-30 px must-read text; nothing must-read in
the no-go zones; no console errors.
Fixed:
- Beat-1 evidence plate was at full opacity for 3.85 s; `Kit.readSecs` for its 12 words is 4.44 s. It now comes in at
  2.4 s (with the sign) and fades over 7.2–7.5 s: 4.45 s at full opacity. No other timing changed.
- AMALGAM billboard showed no cementum at all. Torabinejad 1997 says cementum "had not formed over the root-end
  filling material, although it was present over the cut root end". The billboard now has two small cementum tiles
  on the cut dentin above and two below the amalgam, with the gap over the filling (picture only, no new word).
- meta.json claim 3 reworded to match the billboard.
Re-rendered once: 1080×1920, 30 fps, 720 frames, 24.0 s (ffprobe), H.264 + silent AAC. Poster (22.0 s) unchanged.
Left as is (see Known weaknesses): the verdict board carries 25 words and is readable for about 4 s (complete and
held 2.89 s); the title is up for 1.7 s on the first play.

## Known weaknesses
- 84 must-read words against a target of about 60 (about 66 first exposures). The excess is evidence tags, the
  denominator/species/follow-up the number needs, and the board repeating the terms.
- Duration is 24.0 s, the top of the target.
- Beat 1 is still the busiest scene: sign, plate with the number, billboard, three red helmets and three builders.
- The amalgam contrast is picture-only; "amalgam: none" is in the caption, not on screen.
- "ENDO" in the hook is jargon; it was chosen over leaving "bioceramics" unscoped.
- The negative result rests on one rat subcutaneous study (15–60 days); this is in the caption, not on screen.
- All sources were verified from abstracts only.

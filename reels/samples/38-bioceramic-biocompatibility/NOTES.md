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
| gray speckled block | set calcium silicate cement (stenciled MTA where the cited study used MTA) |
| red helmets + red beacon | the early inflammatory reaction |
| yellow helmets, orange vests | hard-tissue-forming cells (cementoblasts in plot 1, osteoblasts in plot 2) |
| bare-headed new hires | immature (undifferentiated) cells |
| white-helmet foreman with megaphone and Ca²⁺ flag | the signal from the material |
| cyan crystal skin | apatite layer (bioactivity) |

## Storyboard (seconds, as built)
| t | Beat | On screen |
|---|------|-----------|
| 0.0–1.7 | **Hook.** Title sign in place on frame 0. Plot 1: a resected root drawn as a cut pipe (dentin walls, root filling, MTA plug); three red helmets and a pulsing beacon stand at the cut end. Builders start walking in at 0.5. | ARE BIOCERAMICS / OSTEOINDUCTIVE? · ROOT · MTA |
| 1.7–2.5 | Title is hoisted out, beat-1 sign is lowered (0.5 s, small damped sway). | |
| 2.5–7.2 | **BIOCOMPATIBLE.** Two of the three red helmets walk off (2.5–5.0) and the beacon dims; one stays. Builders lay a cementum course up the cut root end and over the filling (13 tiles, 3.5–6.4; one builder climbs the scaffold tower for the upper half). Evidence plate 2.7; number 3.2. Billboard with the contrast material fades in at 5.15: gray silhouette of a root end with a dark filling, three red helmets that never leave, no course. | BIOCOMPATIBLE · early inflammation subsides · ANIMAL HISTOLOGY · **5 of 6** root ends: cementum over MTA · monkey · 5 months · AMALGAM · *Torabinejad et al. 1997, J Endod* |
| 7.2–7.85 | Pan to plot 2, sign swap. | |
| 7.85–11.6 | **OSTEOCONDUCTIVE.** The MTA block now stands in a pit between two old-bone walls. A crystal skin grows over its faces (7.75–8.6), tagged at 8.25. Scaffolding stands against the faces; builders lay new bone bricks in both gaps (8.45–11.3): the first row runs from the old bone to the block, every later row starts against the block. An orange seam marks the contact line. | OSTEOCONDUCTIVE · bone grows on the surface · BONE · MTA · apatite layer *(in vitro)* · ANIMAL HISTOLOGY · *Torabinejad 1998: MTA in guinea-pig bone · apatite: Sarkar 2005 · J Endod* |
| 11.6–12.25 | Pan to plot 3, sign swap. | |
| 12.25–15.2 | **OSTEOINDUCTIVE? — the lab signal.** The block sits in a culture dish (glass tray, pink medium). The foreman on the block signals through a megaphone and holds a Ca²⁺ flag; yellow dots drift through the medium. Four bare-headed hires get helmets one by one (13.15, 13.45, 13.75, 14.05). Three dials rise (13.45, 13.85, 14.2) and each gets a green up-arrow. A dashed cable runs from the Ca²⁺ flag to the BMP-2 dial only. | OSTEOINDUCTIVE? · immature cells → bone-forming cells · Ca²⁺ · BMP-2 · ALP · OSTEOCALCIN · CELL CULTURE · *Maeda et al. 2010 (Ca²⁺, BMP-2) · Peng et al. 2011 (ALP, osteocalcin) · J Endod* |
| 15.2–15.85 | Pan to plot 4; the sign stays. | |
| 15.85–18.9 | **The strict test.** Skin-colored ground with fat lobules in the cut face. MTA block on a site labeled as non-bony. White mineral chips pop in around and on the block (15.7–17.4); a dashed outline of the bone that never gets built pulses on both sides; two hires stay bare-headed; one red helmet and a dim beacon remain. Stamp slams at 16.95. | NON-BONY SITE · rat skin · ANIMAL HISTOLOGY · mineral deposits, no bone · **ECTOPIC BONE: NOT SHOWN** · *Moretton et al. 2000, J Biomed Mater Res · rat, 15–60 days* |
| 18.9–19.6 | Sign hoisted, pan to plot 5. | |
| 19.6–23.3 | **Payoff: verdict board.** Three rows; marks pop at 19.65, 19.95, 20.25; complete at 20.65 and held 2.65 s. | CALCIUM SILICATE BIOCERAMICS · ✓ BIOCOMPATIBLE tissue tolerates it (animal + human histology) · ✓ OSTEOCONDUCTIVE bone grows on it (animal histology) · ? OSTEOINDUCTIVE cell-culture signals / ectopic bone: not shown · SOURCES (fine print) |
| 23.3–24.0 | Camera pans on to plot 1 (wrap), title sign is lowered from 23.45: frame 720 = frame 0. | |

Handle `@natebrooksendo` and "SCHEMATIC · NOT TO SCALE" sit on the plinth strip under the slab for the whole reel.

**Must-read words: 85** (hook 5, beat 1 18, beat 2 13, beat 3 25, verdict board 24). About 67 are first exposures:
the evidence tag ANIMAL HISTOLOGY appears four times and the board repeats the three terms and the stamp wording.
This is above the 60-word target; see Known weaknesses. Smallest must-read type on screen: 37 px (dial labels);
the board tags are 30 px. Source lines 24–25 px, plinth strip 24–26 px (fine print).

## On-screen claims and sources
Every source below is in RESEARCH.md (three verification passes against PubMed abstracts). "Verified from" there is
"abstract" for all of them; no full text was read.

1. **BIOCOMPATIBLE · early inflammation subsides** (most red helmets leave, one stays, beacon dims but stays on).
   Torabinejad M, Parirokh M. J Endod 2010;36:190-202, PMID 20113774 (review: MTA "is a biocompatible material").
   Gomes-Filho JE et al. J Endod 2009;35:256-60, PMID 19166785 (rat subcutaneous: mild to moderate at 7 days,
   similar to control by day 30). Moretton TR et al. J Biomed Mater Res 2000;52:528-33, PMID 11007621 (rat
   subcutaneous: severe at first, subsided to "mostly moderate"). Torabinejad M et al. J Endod 1998;24:468-71,
   PMID 9693572 (guinea-pig bone, 80 days: free of inflammation in every specimen). Wording is "subsides", not
   "resolves"; one red helmet stays because 1 of 6 MTA root ends in the monkey study was still inflamed.
2. **5 of 6 root ends: cementum over MTA · monkey · 5 months · animal histology.** Torabinejad M et al. J Endod
   1997;23:225-8, PMID 9594770: "five of six root ends filled with MTA had a complete layer of cementum over the
   filling"; no periradicular inflammation at five of six. Three monkeys, healthy maxillary incisors.
3. **AMALGAM billboard** (red helmets stay, no course over the filling). Same paper: "all root ends filled with
   amalgam showed periradicular inflammation, and cementum had not formed over the root-end filling material".
   No count is shown for amalgam because the abstract does not give one.
4. **OSTEOCONDUCTIVE · bone grows on the surface.** Definition: Albrektsson T, Johansson C. Eur Spine J 2001;10
   Suppl 2:S96-101, PMID 11716023 ("Osteoconduction means that bone grows on a surface"). Evidence: Torabinejad
   1998 (PMID 9693572; 20 guinea pigs, tibia and mandible, 80 days; in the tibia MTA was "the material most often
   observed with direct bone apposition"; no frequency is given, so none is shown). Moretton 2000 (rat:
   "osteogenesis occurred in association with intraosseous implants indicating that both materials are
   osteoconductive").
5. **apatite layer (in vitro).** Sarkar NK et al. J Endod 2005;31:97-100, PMID 15671817 (MTA in phosphate-buffered
   fluid: hydroxyapatite-like precipitates and an adherent interfacial layer). Gandolfi MG et al. Int Endod J
   2010;43:917-29, PMID 20646080 (apatite nucleation within 5 h, even coating at 1 day) supports the same point and
   is cited in the caption notes only.
6. **OSTEOINDUCTIVE? · immature cells → bone-forming cells.** Albrektsson & Johansson 2001: osteoinduction "implies
   the recruitment of immature cells and the stimulation of these cells to develop into preosteoblasts".
7. **CELL CULTURE · BMP-2, ALP, osteocalcin rise · Ca²⁺ wired to BMP-2 only.** Maeda H et al. J Endod
   2010;36:647-52, PMID 20307738 (human PDL cells from 2 donors: calcium released from MTA, BMP-2 up and
   calcification; CaCl2 reproduced it, MgCl2 did not). Peng W et al. J Endod 2011;37:1240-6, PMID 21846540 (human
   dental pulp cells with tricalcium silicate extract: ALP, osteocalcin, DSPP, DMP-1, collagen I up; the extract
   was not separated into ions, so those two dials have no cable). The block in this plot carries no MTA stencil
   because Peng used laboratory tricalcium silicate.
8. **NON-BONY SITE · rat skin · mineral deposits, no bone · ECTOPIC BONE: NOT SHOWN.** Moretton 2000: "Osteogenesis
   was not observed with either material upon subcutaneous implantation indicating that neither material is
   osteoinductive"; dystrophic calcification; 15, 30, 60 days. The strict (heterotopic-site) test: Barradas AM et
   al. Eur Cell Mater 2011;21:407-29, PMID 21604242.
9. **Verdict board.** BIOCOMPATIBLE ✓ tissue tolerates it (animal + human histology): items 1–3 plus human pulp
   histology, Nair PNR et al. Int Endod J 2008;41:128-50, PMID 17956562 (20 MTA-capped third molars: mostly free of
   inflammation at 1 week, hard-tissue barrier by 3 months). "Tissue tolerates it" paraphrases the textbook
   definition (Williams DF, ed. Definitions in Biomaterials, 1987; not checked against the book, so not quoted).
   OSTEOCONDUCTIVE ✓ bone grows on it (animal histology): item 4. OSTEOINDUCTIVE ?: items 7–8.

## What is schematic
- The whole site metaphor. Helmets going on in the dish stand for marker expression and mineralization in culture,
  not for a demonstrated cell-fate change in patients.
- The dials have no scale: direction only. Needle positions are not data.
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

## Known weaknesses
- 85 must-read words against a target of about 60. The excess is evidence tags, the denominator/species/follow-up
  the number needs, and the board repeating the terms.
- Beat 3 is two scenes in 6.6 s; the lab scene has 2.95 s of still camera.
- The amalgam contrast is picture-only; "amalgam: none" is in the caption, not on screen.
- During the 0.7 s wrap the title sign crosses the top of the verdict board.
- All sources were verified from abstracts only.

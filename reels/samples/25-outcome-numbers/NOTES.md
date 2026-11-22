# 25 · Endo outcome numbers worth memorizing (NSRCT, ReTx, apical surgery)

**Style:** split-flap (Solari) departure board. One Canvas 2D frame: matte black panel in an anodized housing hung
in a dark concourse, pre-rendered flap cards with a hinge line and axle pins, character flaps for names and
numbers, word flaps for criteria and sources, amber lamps, amber signage pictograms, a station clock whose amber
hand makes one turn per loop. Oswald 700 (printed header), Barlow Condensed 500/600/700 (everything on a flap).
**Duration:** 25 s · 1080×1920 · silent · poster at 22.6 s (the complete board). American spelling.
**Files:** `index.html` (page contract), `board.js` (layout, flip scripts, all drawing, `render(t)`).

## Concept
A study aid first, a reel second. The board has two columns (SUCCESS, SURVIVAL) and three rows (PRIMARY NSRCT,
RETREATMENT, APICAL SURGERY). Rows arrive one at a time; in each, the flaps cascade and settle on a number, then
the word flaps turn over to say exactly what that number is (criteria, follow-up, denominator) and a slim flap
gives the source. Two modifiers flip in between: the effect of an apical lesion at the start (inset strip hanging
off row 1) and traditional root-end surgery versus microsurgery (the surgery cell itself flips 59% to 94%, and the
59% is kept as a smaller, dimmer flap group labeled TRADITIONAL). The surgery SURVIVAL cell turns over once and
stays blank. The finished board is held, fully lit and motionless, for about 5 s so it can be screenshotted.

The one rule of the reel: every number is a different kind of number, so no number appears without its tag.

## Storyboard (seconds, as built)
| t | Beat | On screen |
|---|------|-----------|
| 0.0–0.3 | **Hook.** Printed header is legible on frame 0; the board is a skeleton of blank flaps, lamps off. | ENDO OUTCOMES · NUMBERS TO KNOW · column heads SUCCESS / SURVIVAL |
| 0.3–5.2 | **Row 1.** Pictogram tile lights, lamp pair pulses. Name 0.4–1.5; 82% 1.5–2.55; tags 2.5–2.95; source 2.95; 97% 3.3–4.35; tags 4.3–4.75; source 4.75. | PRIMARY NSRCT · **82%** STRICT · POOLED · 1 YR+ · *Burns 2022 · Int Endod J* · **97%** RETAINED · 8 YR · 1.46M TEETH · *Salehrabi 2004 · J Endod* |
| 5.3–9.2 | **Modifier 1.** House light slides down to the inset strip. Question 5.6; tags 5.95; source 6.3; NO 6.65, >96% 6.75–7.7; YES 7.7, 86% 7.8–8.7. | APICAL LESION AT START? · SUCCESS · 8–10 YR · NO **>96%** · YES **86%** · *Sjögren 1990 · J Endod* |
| 9.3–13.8 | **Row 2.** Name 9.4–10.45; 77% 10.4–11.45; tags 11.4–11.85; source 11.85; 89% 12.1–13.15; tags 13.1–13.55; source 13.55. | RETREATMENT · **77%** STRICT · POOLED · 6 MO+ · *Ng 2008 · Int Endod J* · **89%** RETAINED · 5 YR · 4,744 TEETH · *Salehrabi 2010 · J Endod* |
| 14.0–17.0 | **Row 3, traditional technique.** Name 14.1–15.1; label 14.5; 59% 14.6–15.65; tags 15.55–16.0; source 16.0; held to 17.0. | APICAL SURGERY · TRADITIONAL **59%** · SUCCESS · POOLED · 6 MO+ · *Setzer 2010 · J Endod* |
| 17.0–18.3 | **Modifier 2.** Microscope tile lights; the label flap turns to MICROSURGERY (17.05) and the big flaps to 94% (17.15–18.2); the neighboring small slot turns up TRADITIONAL 59% in dim type (17.3–18.0). | MICROSURGERY **94%** · TRADITIONAL 59% (dim) |
| 18.3–19.4 | Surgery SURVIVAL flaps turn over once and stay blank (18.3–18.75); footer flap 18.55; house lights come up on the whole board. | SUCCESS ≠ SURVIVAL · NOT HEAD-TO-HEAD · @natebrooksendo |
| 19.4–24.3 | **Payoff: the complete cheat sheet**, nothing moving but the clock hand and one slow pass of light over the glass (19.5–21.7). Poster at 22.6. | whole board |
| 24.3–25.0 | Every flap turns back to blank, top to bottom, lamps fade: the last frame equals frame 0. | — |

Reading: everything stays on the board once it has landed, so each tag is visible for at least 5.5 s (most for
far longer); the complete board is static for 4.9 s after the lights are fully up.

Must-read words on the final board: 58 (header 5, column heads 2, row 1 13, modifier 1 11, row 2 12, row 3 10,
footer 5). The six source flaps (24 px) and the handle (28 px) are fine print. Smallest must-read type: 31 px
(tag flaps); row names 46 px; modifier figures 78 px; headline figures 132 px.

Key to the tags (also in the caption): **"1 YR+" and "6 MO+" are the minimum follow-up a study needed to be
pooled**, not the typical follow-up (Burns' studies ran from 12 months to 19 years).

## On-screen claims and sources
All retrieved from PubMed and listed in RESEARCH.md, which was independently fact-checked. "Verified from" says
what was actually read.

1. **PRIMARY NSRCT · SUCCESS 82% · STRICT · POOLED · 1 YR+.** Burns LE, Kim J, Wu Y, Alzwaideh R, McGowan R,
   Sigurdsson A. Int Endod J 2022;55(7):714-731. PMID 35334111, PMC9322405, doi:10.1111/iej.13736. Weighted pooled
   success 82.0% (95% CI 79.3–84.8) under strict criteria (39 studies, 7,432 teeth; studies published 2003–2020,
   at least 12 months of review); 92.6% under loose criteria. Verified from: abstract + PMC full text.
2. **PRIMARY NSRCT · SURVIVAL 97% · RETAINED · 8 YR · 1.46M TEETH.** Salehrabi R, Rotstein I. J Endod
   2004;30(12):846-850. PMID 15564861, doi:10.1097/01.don.0000145031.04236.ca. 1,462,936 teeth in 1,126,288
   patients (US insurance claims); "97% of teeth were retained in the oral cavity 8 yr after initial nonsurgical
   endodontic treatment". Retention, not healing. Verified from: abstract.
3. **APICAL LESION AT START? NO >96% · YES 86% · SUCCESS · 8–10 YR.** Sjögren U, Hägglund B, Sundqvist G, Wing K.
   J Endod 1990;16(10):498-504. PMID 2084204, doi:10.1016/S0099-2399(07)80180-4. 356 patients, 8–10 yr; success
   "exceeded 96%" with no periapical radiolucency (vital or nonvital pulps); 86% of cases with pulp necrosis and a
   periapical radiolucency "showed apical healing". Tag is SUCCESS (not HEALED: teeth without a lesion have
   nothing to heal) and not STRICT (criteria are not in the abstract). Verified from: abstract.
4. **RETREATMENT · SUCCESS 77% · STRICT · POOLED · 6 MO+.** Ng Y-L, Mann V, Gulabivala K. Int Endod J
   2008;41(12):1026-1046. PMID 19133093, doi:10.1111/j.1365-2591.2008.01484.x. Pooled weighted success judged by
   complete healing 76.7% (conclusion: 77%); 17 studies published 1961–2005; inclusion required at least a 6-month
   review. Verified from: abstract.
5. **RETREATMENT · SURVIVAL 89% · RETAINED · 5 YR · 4,744 TEETH.** Salehrabi R, Rotstein I. J Endod
   2010;36(5):790-792. PMID 20416420, doi:10.1016/j.joen.2010.02.009. "89% of teeth were retained in the oral
   cavity 5 years after the endodontic retreatment"; retreatments by endodontists (US insurance claims); 4% had
   apical surgery, 11% were extracted. Verified from: abstract.
6. **APICAL SURGERY · SUCCESS · TRADITIONAL 59% · MICROSURGERY 94% · POOLED · 6 MO+.** Setzer FC, Shah SB, Kohli
   MR, Karabucak B, Kim S. J Endod 2010;36(11):1757-1765. PMID 20951283, doi:10.1016/j.joen.2010.08.007. 12
   studies of traditional root-end surgery (n = 925): 59% positive outcome; 9 studies of endodontic microsurgery
   (n = 699): 94%; RR 1.58. Separate single-arm study groups from different eras, not a trial. Verified from:
   abstract (numbers). The "6 MO+" tag is the inclusion minimum **as reported by a secondary source**: Pinto D et
   al., Medicina (Kaunas) 2020;56(9):447, PMID 32899437, PMC7558840 (full text). The column head over this cell
   reads SUCCESS, and the cell carries no STRICT tag: surgical success scales (Rud/Molven) count scar healing.
7. **APICAL SURGERY · SURVIVAL: blank.** Not a claim. No pooled survival figure for apical surgery could be
   verified from an abstract or full text, so the four flaps turn over once and stay empty. The board does not say
   that no such figure exists (Torabinejad M et al., J Endod 2015;41:1-10, PMID 25306305 calculated a weighted
   survival rate; its abstract prints no number).
8. **SUCCESS ≠ SURVIVAL · NOT HEAD-TO-HEAD.** Follows from the definitions in sources 1–6: strict success = no
   radiolucency and no signs/symptoms; retained = tooth still present in claims data; the surgery figures are
   pooled single-arm groups. The "≠" is drawn by hand (it is not in the Barlow Condensed subset).

## Residual uncertainty (from the fact-check; carried here on purpose)
- **Setzer 2010:** the follow-up minimum (6 months) and the success criteria are not in its abstract; "6 MO+" rests
  on Pinto 2020's full text. The Setzer full text was not read.
- **Sjögren 1990:** success criteria and the unit of analysis are not in the abstract.
- **Ng 2007** (not on screen): the 74.7% strict / 85.2% loose means are known only as quoted in Burns 2022. The
  abstract gives a pooled strict range of 68–85%.
- **Full texts not read:** Ng 2007, Ng 2008, Sjögren 1990, Setzer 2010, Salehrabi & Rotstein 2004 and 2010.
  Whether every tooth in the two claims studies was observed for the full 8 or 5 years is not stated in the
  abstracts; "retained" is the abstracts' own word.
- **94% is the top of the range of pooled microsurgery estimates** (92% Kang 2015; 89.0% at 1 yr Tsesis 2013;
  84.5% Sabeti 2023) and a short-minimum-follow-up figure; long-term cohorts read lower (von Arx 2012: 84% at 1 yr
  to 76% at 5 yr; Pinto 2020: 78% in prospective cohorts, 91% in trials, 2–13 yr). It is attributed to Setzer 2010
  on screen and in the caption.

## Deliberately not on screen (see RESEARCH.md "Do not claim")
No "75% to 82%" update flip; no figure in the surgery SURVIVAL cell and no "NO POOLED DATA"; no STRICT on the
Sjögren or Setzer numbers; no Toronto "functional" rates; no implant comparison; no confidence intervals; no CBCT
claims; no statement that surgery beats retreatment or the reverse.

## What is schematic
- Nothing on the board is modeled, simulated or illustrative: all eight figures are published results.
- **Spin frames never show digits.** On its way to a number a flap passes only letters from
  `ACEFHJKLMNPRTUVWXY` (none that read as digits), the "%" leaf lands last, and when the board clears each number
  group leaves together, so no frame can show a percentage that is not on the final board. During the 59% to 94%
  change the three flaps are staggered so that the two digits visible at any instant are never a third number.
- Pictograms (tooth, canals, redo arrow, resected root tip, apex with a ring, microscope) are original signage
  drawings, not anatomy. The clock is a loop indicator, not a time scale.
- Dimming of the rows that are not being filled is a lighting device only.

## Design rationale
- **Row name "PRIMARY NSRCT"** rather than "PRIMARY RCT": on an evidence board "RCT" can be read as
  randomized controlled trial; NSRCT (nonsurgical root canal treatment) cannot.
- **Why a departure board:** a board is a table people already know how to read at a glance, and a flap that
  settles is a natural way to say "this is the number". Columns keep success and survival apart, which is the
  point of the reel.
- **Hierarchy by color:** off-white = data (numbers, criteria); amber = structure (row names, modifier labels,
  lamps, pictograms); gray = sources; dim gray = the superseded traditional figure (dimmed, not struck through:
  59% is a valid pooled result for that technique).
- **Hinges:** full-strength hinge and pins on the character flaps; a hairline hinge on the small word flaps so
  the 31 px tags stay clean.
- **Safe areas:** all text sits in x 64–1008, y 243–1572; nothing readable is right of x 958 below y 1095 (the
  layout code warns in the console if a unit breaks this). The lamp pair of row 3 sits under the button column
  and is decorative. Header and full board are inside the 3:4 grid crop.
- **Loop:** every flap turns back to blank in the last 0.7 s, lamps fade, and the clock hand returns to 12, so
  frame 750 matches frame 0 with no ghosted text.

## QA log
1. First stills: hinge line cut through the 31 px tags (thinned to a hairline); modifier-1 source collided with
   the 86% flaps (moved to the strip's top line); "4,744 TEETH" tag ended 3 px inside the button column (tag
   padding tightened); dim "TRADITIONAL 59%" too faint (brightened); column heads enlarged to 36 px.
2. Added the moving house light, reordered modifier 1 so the criteria land before the numbers, lengthened the
   hold on "TRADITIONAL 59%" before the flip, shortened the footer to "NOT HEAD-TO-HEAD" (it also covers the
   59/94 pair, which share a row).
3. Transition checks at closely spaced times (17.1–18.6 s, 24.3–25 s): synchronized the clearing flips so no
   partial figure such as " 7%" can appear; redrew the surgery pictogram; added the single sheen pass during the
   final hold and moved the poster to 22.6 s, after it.
4. Row 1 renamed from "PRIMARY RCT" to "PRIMARY NSRCT" (see design rationale); video re-rendered and frames
   pulled back out of the MP4 (7.4 s, 16.6 s, first and last frame: mean luma difference 0.5/255) to confirm the
   encode and the loop.

# 26 · Primary vs persistent/secondary infection: who lives in the canal (collectible trading cards)

**Output:** `reels/out/26-primary-vs-persistent.mp4` (24.0 s, 1080×1920, 30 fps, silent) + poster `reels/out/26-primary-vs-persistent.jpg` (t = 21.6 s, the complete summary frame: the screenshot / study frame. For the Instagram cover pick the hook frame at about t = 1.0 s, which carries the title).
**Files:** `index.html`, `cards.js` (palette, morphology icons, card sprites), `reel.js` (timeline + `render(t)`), one full-frame canvas.
**Style slot:** collectible trading cards on dark green felt. Flat vector cards with foil-edge shimmer, Barlow Condensed headers, Inter stats. Card frame color = Gram stain (pink-red = Gram-negative, crystal violet = Gram-positive, amber = yeast, which gets no Gram color). Round corner badge = oxygen tolerance (O₂ inside a red no-symbol = anaerobe, blue O₂ = facultative).

## Concept
The table is split left/right and stays that way: left = PRIMARY (untreated necrotic pulp), right = PERSISTENT / SECONDARY (previously treated tooth). The left deck deals ten cards fast into a tall overlapping cascade; a TREATMENT bar sweeps down the column and flips eight of them face down; two violet cards survive and cross the center line. The right side then gets only three more cards: *E. faecalis* and *Candida* from its own deck (no origin implied) and one unnamed "?" card that slides in from off the table (secondary infection). Mid-reel the two terms are one-word labels (PERSISTENT under the survivors, SECONDARY beside the "?" card); the definitions are spelled out once, on the end card. The *E. faecalis* card is lifted for inspection, then both hands are laid out under a two-column summary.

Following the fact-check, Gram color is **not** the team color: the primary deck is 6 pink : 4 violet, and what separates the teams is deck size and the oxygen badge.

## Storyboard
| t (s) | Beat | On screen |
|---|---|---|
| 0–2.6 | Hook | "WHO LIVES IN THE CANAL?" (in by 0.3 s, held 2.3 s). Labels "PRIMARY · untreated necrotic pulp" and "PERSISTENT / SECONDARY" sit above two fanned hands: five mixed pink/violet cards on a thick deck, against two cards. |
| 2.5–3.4 | Transition | Fans fold into decks, decks move to the top corners; the hook labels fade out and the column headers fade in once the decks have arrived (nothing travels across the decks). |
| 3.4–6.0 | Primary deals | Ten cards, one every 0.24 s. The plaque shows only a bare tally and pips. The key (Gram −, Gram +, anaerobe, facultative) sits on the empty right half for the whole deal (3.3–6.4 s). |
| 6.0–6.4 | Counter settles | "10–20", "taxa per canal", "molecular studies" and the source line appear together; pips 11–20 outline in. |
| 6.2–8.3 | Filter | TREATMENT bar (a sieve) sweeps the column; eight cards flip face down and sink into the felt; *Pseudoramibacter* and *Streptococcus* get a gold halo. |
| 8.3–9.2 | Crossing | The two survivors fly across the center line. Label "PERSISTENT" under them (9.2). Right tally starts. |
| 9.3–10.2 | Small hand | *E. faecalis*, then *Candida*, dealt from the right-hand deck. |
| 10.3–11.7 | Secondary | Face-down "?" card slides in from off the table; label "SECONDARY" (11.0). Counter settles on "1–5 taxa per canal · adequately treated · culture + PCR" (11.35–11.7). |
| 13.3–17.9 | Hero card | *Enterococcus faecalis* enlarges (the small card face swaps to the large layout in the first 0.1 s, while still small). "Often found. Rarely dominant." 29 tooth icons: 11 fill violet, 1 turns gold. "qPCR, 29 treated teeth: found in 11, dominant in 1". Everything settled by 15.1 s. |
| 17.9–23.2 | End card | Left: "mostly obligate anaerobes", "Gram − and +". Right: "more facultatives", "mostly Gram +" (icon with a small pink corner), "sometimes yeast". Definitions: "PERSISTENT: survived treatment", "SECONDARY: got in during or after treatment". Pill: "*E. faecalis*: often found, rarely dominant". Qualifier: "sequencing finds more taxa in both". Both hands spread below; the "?" card shows its corner mark. All in by 19.1 s, held 4.0 s. |
| 23.2–24.0 | Loop | Text fades, the "?" card leaves first, cards return to the opening fans; last frame equals frame 0 without the title. |

Must-read words: hook 11 (title 5, labels 6), left counter 6, key 6, TREATMENT 1, right counter 9, two one-word labels 2, hero 14, summary lines 13, sequencing qualifier 6 = 68. The end card also carries the two definitions (10 words, now shown only there) and repeats the *E. faecalis* slogan (6 words). Total words shown: 84, down from 91 by the same count (mid-reel definitions 10, hero type line 3 and the longer pill removed; "treated" and "taxa" added). Card names, the fine print on each card, the two source lines and "schematic decks" are not counted. See "Known weaknesses".

## On-screen claims and sources
"Abstract" / "full text" says how far each was read (by the research and fact-check stages unless marked *builder*).

| On-screen claim | Source | Notes |
|---|---|---|
| PRIMARY = untreated necrotic pulp; PERSISTENT: survived treatment; SECONDARY: got in during or after treatment (definitions on the end card; one-word labels mid-reel) | Siqueira JF Jr, Rôças IN. J Oral Microbiol 2009;1. doi:10.3402/jom.v1i0.2009. PMID 21523208 (full text) | Primary = infection of the necrotic pulp before any professional intervention ("untreated necrotic pulp" is shorthand: a necrotic pulp can be uninfected). Secondary = "introduced in the root canal at some time after professional intervention". *E. faecalis* "may be a secondary invader" that then persists; the PERSISTENT bracket under row 2 is not a statement about the origin of the cards in row 1. The combined header "PERSISTENT / SECONDARY" is used because the two cannot be told apart in a sampled root-filled tooth. |
| "10–20 taxa per canal · molecular studies" | same (text and Table 1) | Review-level range of study means ("a mean of 10–20 species/phylotypes"), not the range of single canals (2 to 45 taxa in Rôças & Siqueira 2008; the review also quotes 7–12 for chronic cases from clone libraries). Culture finds a mean of 2.6–5.4. The unit and the method appear together with the settled range and stay attached to it. |
| "1–5 taxa per canal · adequately treated · culture + PCR" | same; Siqueira JF Jr et al. PLoS One 2016;11:e0162887. PMID 27689802 (full text) | "1 to 2 by culture, and 1 to 5 by early-generation molecular methods" (Siqueira 2016). Root-filled teeth with apical periodontitis. Inadequately treated canals: up to about 30. |
| Primary deck is mixed Gram − / Gram +; genus names | Siqueira & Rôças 2009 (genus sentence for primary infections); Figdor D, Sundqvist G. Aust Dent J 2007;52(1 Suppl):S38-51. PMID 17546861 (abstract) | The 6 : 4 split is schematic ("approximately equal proportions"). |
| Nine "anaerobe" badges, one "facultative" | Byström A, Sundqvist G. Scand J Dent Res 1981;89:321-8. PMID 6947391 (abstract: 88 % of strains anaerobic, 17 teeth) | 9 of 10 is schematic; the 88 % is not printed. Badges say "anaerobe", not "obligate". |
| Treatment leaves a small, mostly Gram-positive remainder (two violet survivors) | Siqueira JF Jr, Rôças IN. J Endod 2008;34:1291-1301.e3. PMID 18928835 (abstract) | No number shown. One survivor is an anaerobe (*Pseudoramibacter*), so the picture does not say anaerobes cannot persist. Both genera appear in the review's primary and treated-tooth lists. |
| Right-hand cards: *E. faecalis*, *Streptococcus*, *Pseudoramibacter*, *Candida* | Siqueira & Rôças 2009, Table 1 (treated teeth) | *E. faecalis* and *Candida* are dealt from the team's own deck: survivor or latecomer is unsettled. |
| "Often found. Rarely dominant." / "qPCR, 29 treated teeth: found in 11, dominant in 1" (slogan repeated in the end-card pill) | Rôças IN, Siqueira JF Jr. J Clin Microbiol 2012;50:1721-4. doi:10.1128/JCM.00531-12. PMID 22403423 (full text, re-read by the builder for this pass) | The 29 are root canal-treated teeth with apical periodontitis sampled at retreatment: "asymptomatic, showed radiographic evidence of apical periodontitis, and had had endodontic therapy completed more than 2 years earlier", coronally restored, fillings 0 to 4 mm short. On screen this is compressed to "treated teeth"; the caption says "root-filled, with a lesion". "Often found" rests on the wider literature: 24–77 % (Stuart CH et al. J Endod 2006;32:93-8, PMID 16427453). Source line is on the card. |
| "mostly obligate anaerobes", "Gram − and +" | Figdor & Sundqvist 2007; Byström & Sundqvist 1981 | |
| "more facultatives", "mostly Gram +" | Pinheiro ET et al. Int Endod J 2003;36:1-11. PMID 12656508 (83 % Gram-positive, 57 % facultative); Molander A et al. Int Endod J 1998;31:1-7. PMID 9823122 (69 % facultative); Siqueira & Rôças 2009 Table 1 | Culture and targeted-PCR findings; the right-hand counter prints "culture + PCR", and the "mostly Gram +" icon has a small pink corner. |
| "sometimes yeast" | Siqueira & Rôças 2009 (text and Table 1: *Candida* "in root canal-treated teeth in up to 18% of the cases", narrative review); Mergoni G et al. J Endod 2018;44:1616-1625.e9. PMID 30241680 (8.2 % pooled over all infection types); Persoon IF et al. Int Endod J 2017;50:1055-66. PMID 27987307 (no difference by infection type) | No number shown. The pooled data do not show yeast to be specific to treated teeth; the card is dealt on that side because that is the board answer. |
| "sequencing finds more taxa in both" | Treated teeth: Siqueira 2016 (mean 116 OTUs per treated root apex); primary and treated: Manoil D et al. Proteomics Clin Appl 2020;14:e1900060. PMID 31950679 | Required qualifier from the fact-check. Shortened: each counter already prints its own method. 30 px italic, under the pill. |
| Card shape words and anaerobe/facultative per genus | Twelve PubMed abstracts, table in RESEARCH.md section (i) (*builder*, abstracts only) | Each card prints only the word its abstract supports. |

On-screen source lines: "Siqueira & Rôças, J Oral Microbiol 2009" (from 6.0 s, when the first range settles, to the end card) and "Rôças & Siqueira, J Clin Microbiol 2012" (hero card).

## What is schematic
- Labelled "schematic decks" from 3.3 s to the end. Which ten genera are dealt, the 6 : 4 color split, 9 : 1 badge split, which two cards survive, and the card order are illustrative, not prevalence data.
- The pip meters share a 20-pip scale: solid = lower bound, outlined = up to the upper bound. The two ranges come from different methods, printed under each.
- While cards land, each plaque shows only a bare tally and pips. The unit "taxa per canal", the method and the source line appear together with the settled range, so no paused frame pairs a transient number with the unit.
- The right-hand hand holds no Gram-negative card and all six Gram-negative cards flip under TREATMENT. That is the culture / targeted-PCR picture, not a rule: Gram-negative anaerobes also occur in treated teeth (*F. nucleatum* 10 of 42, 24 %, by checkerboard in Rôças & Siqueira 2012, full text; Proteobacteria and Fusobacteria held most reads in Siqueira 2016). The text says "mostly Gram +" and its icon carries a pink corner.
- Yeast is one of two cards in the opening fan and one of five in the final hand: the card says that yeast occurs, not how often.
- Morphology icons are textbook drawings, not to scale (yeast drawn larger). Pairs, V-shapes and chain lengths are drawn from textbook description, not from the abstracts.
- The sweep is a metaphor; nothing is implied about which treatment step does what.

## Dropped from the brief, and why
- Team colors = Gram colors, and "primary is largely Gram-negative": wrong per the fact-check.
- Stat bars for starvation survival and alkaline tolerance: no comparable data for the anaerobes, in vitro only for *E. faecalis*, and already the subject of reel 09. The only bars are the two pip meters.
- "88 % of strains anaerobic", "> 99 % fewer bacteria", "~8 % yeast", Sundqvist 1976/1998 numbers: left to the caption or left out to hold the word count down.

## Design notes
- Safe area: all text inside x 64–1016, y 230–1580. Below y 1100 nothing readable passes x 960 (the "SECONDARY" label ends at about x 952; the right-hand spread ends at about x 955). The two decks at the top corners sit under the Reels UI and are decoration only.
- Card names are 30 px Barlow Condensed with an oblique shear (the vendored face has no italic). Type lines and shape words on the cards are 22–24 px fine print that repeats the color and badge coding.
- Handle sits at the bottom of the right column throughout.

## Review changes (2026-11-22, after independent science + design review)
Science:
- Hero data line now reads "qPCR, 29 treated teeth:" (was "29 teeth"); the full inclusion criteria are in the claims table, meta.json and the caption ("root-filled, with a lesion").
- Counters: during the deal only the bare tally and the pips show. "taxa per canal", the method line and the source line fade in together with the settled range (left 6.04–6.36 s, right 11.35–11.7 s). A paused frame can no longer read "5 taxa per canal · molecular studies".
- Caption replaced with the reviewer's text: methods given for both numbers, "root-filled, with a lesion", Manoil 2020 added to Refs. The caption says "mostly anaerobes" so that its four references cover it; the screen keeps "mostly obligate anaerobes", which is sourced to Figdor & Sundqvist 2007 in meta.json (adding that reference to the caption did not fit in 700 characters).
- meta.json: citation written as "J Oral Microbiol 2009;1 (doi:10.3402/jom.v1i0.2009)", pointer corrected to RESEARCH.md section (i), "Gram color", yeast sources made explicit (up to 18 % narrative; 8.2 % pooled, Mergoni 2018; no difference by infection type, Persoon 2017), claims re-ordered to match the screen.
- "mostly Gram +" icon on the end card has a small pink corner; notes added on Gram-negatives in treated teeth, on yeast weighting, on the origin of *E. faecalis*, on "untreated necrotic pulp" as shorthand, and on 10–20 being a range of study means.

Design:
- Text load: mid-reel definitions became one-word labels ("PERSISTENT", "SECONDARY"); the definitions appear once, on the end card, at 40/38 px (were 34/32). Hero type line "GRAM + · FACULTATIVE · COCCI" deleted. End pill "Culture + PCR picture · sequencing finds more in both" replaced by "*E. faecalis*: often found, rarely dominant" (36 px) with "sequencing finds more taxa in both" under it (30 px).
- Key moved into the deal (3.3–6.4 s, on the empty right half), so it no longer competes with the TREATMENT bar; the bar and everything after it start about 0.5 s earlier. The freed time went to the title (held to 2.6 s), the hero card (+0.3 s) and the end card (bullets start at 18.3 s with 0.08 s stagger; complete by 19.1 s).
- Hero card: sprite and live layout now swap in the first / last 0.1 s of the move, while the card is small, so there is no double exposure; tooth outlines appear with the slogan; data lines enlarged to 36/40 px (were 30); tooth stagger 0.03 s, all settled by 15.1 s; backdrop scrim raised from 0.68 to 0.86 and the two labels fade out as the card rises.
- Anaerobe badge redrawn: red ring and slash first, white "O₂" on top at 84 % size, no dark under-stroke, so the "O" stays whole.
- Counter pips enlarged from 16×12 to 18×16 px.
- Hook: labels moved above the fans, fans enlarged (0.9 to 1.0) and lowered so the group fills to about y 1250; labels cross-fade into the column headers instead of travelling across the decks.
- Eliminated cards: dim 0.62 with a felt-green tint and a much lighter shadow (were 0.5 neutral dark).
- TREATMENT bar starts lower (y 552, clear of the plaque); the file and drop pictograms were removed in favor of a wider sieve.
- "?" card: gold corner marks added to its back and a wider gap in the final hand, so it is recognisable under the *E. faecalis* card; on loop-out it leaves first, from underneath.
- Row spacing on the right adjusted so the "PERSISTENT" label clears the "?" card; source line and handle moved 8 px down.

Not changed: the on-screen sub-header "untreated necrotic pulp" (acceptable shorthand per the review); the shared 20-pip scale (the method stays printed under each number); flying cards still pass over the left header for a few frames during the deal (the deck sits above it).

## Known weaknesses
- 84 words are shown in total (68 must-read plus the end-card definitions and the repeated slogan), still above the 60-word target. The end card carries about 35 words in a 4.0 s hold and is meant to be paused.
- The right-hand method line "adequately treated · culture + PCR" is fully visible for only 1.6 s before the hero card dims it; it is back, undimmed, for the 4.8 s of the end card.
- The key is fully visible for 2.5 s while cards are landing next to it.
- Behind the hero card, cropped fragments of two right-hand cards remain faintly visible through the 0.86 scrim.
- The caption says "mostly anaerobes" while the screen says "mostly obligate anaerobes" (see Review changes).
- The opening frame still has empty felt below about y 1250.

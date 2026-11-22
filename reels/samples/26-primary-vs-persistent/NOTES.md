# 26 · Primary vs persistent/secondary infection: who lives in the canal (collectible trading cards)

**Output:** `reels/out/26-primary-vs-persistent.mp4` (24.0 s, 1080×1920, 30 fps, silent) + poster `reels/out/26-primary-vs-persistent.jpg` (t = 21.6 s, the complete summary frame).
**Files:** `index.html`, `cards.js` (palette, morphology icons, card sprites), `reel.js` (timeline + `render(t)`), one full-frame canvas.
**Style slot:** collectible trading cards on dark green felt. Flat vector cards with foil-edge shimmer, Barlow Condensed headers, Inter stats. Card frame colour = Gram stain (pink-red = Gram-negative, crystal violet = Gram-positive, amber = yeast, which gets no Gram colour). Round corner badge = oxygen tolerance (crossed-out O₂ = anaerobe, blue O₂ = facultative).

## Concept
The table is split left/right and stays that way: left = PRIMARY (untreated necrotic pulp), right = PERSISTENT / SECONDARY (previously treated tooth). The left deck deals ten cards fast into a tall overlapping cascade; a TREATMENT bar sweeps down the column and flips eight of them face down; two violet cards survive and cross the center line. The right side then gets only three more cards: *E. faecalis* and *Candida* from its own deck (no origin implied) and one unnamed card that slides in from off the table (secondary infection). The *E. faecalis* card is lifted for inspection, then both hands are laid out under a two-column summary.

Following the fact-check, Gram colour is **not** the team colour: the primary deck is 6 pink : 4 violet, and what separates the teams is deck size and the oxygen badge.

## Storyboard
| t (s) | Beat | On screen |
|---|---|---|
| 0–2.4 | Hook | "WHO LIVES IN THE CANAL?" (in by 0.3 s). Two fanned hands: five mixed pink/violet cards on a thick deck labelled "PRIMARY · untreated necrotic pulp"; two cards labelled "PERSISTENT / SECONDARY". |
| 2.35–3.1 | Transition | Fans fold into decks, decks move to the top corners, labels become column headers. |
| 3.1–5.7 | Primary deals | Ten cards, one every 0.24 s. Counter ticks with each landing. |
| 5.8–6.1 | Counter settles | "10–20 taxa per canal · molecular studies"; pips 11–20 outline in. Key appears on the empty right side: Gram −, Gram +, anaerobe, facultative. |
| 6.75–8.85 | Filter | TREATMENT bar (file + irrigant drop) sweeps the column; eight cards flip face down and dim; *Pseudoramibacter* and *Streptococcus* get a gold halo. |
| 8.85–9.75 | Crossing | The two survivors fly across the center line. "PERSISTENT: survived treatment" (9.8). Right counter starts. |
| 9.9–10.85 | Small hand | *E. faecalis*, then *Candida*, dealt from the right-hand deck. |
| 10.95–12.4 | Secondary | Face-down "?" card slides in from off the table. "SECONDARY: got in during or after treatment". Counter settles on "1–5 taxa per canal · adequately treated · culture + PCR". |
| 13.6–17.9 | Hero card | *Enterococcus faecalis* enlarges. "Often found. Rarely dominant." 29 tooth icons: 11 fill violet, 1 turns gold. "qPCR, 29 teeth: found in 11, dominant in 1". |
| 17.9–23.2 | End card | Left: "mostly obligate anaerobes", "Gram − and +". Right: "more facultatives", "mostly Gram +", "sometimes yeast". Both definitions repeated. Footer: "Culture + PCR picture · sequencing finds more in both". Both hands spread below. All in by 19.9 s, held 3.3 s. |
| 23.2–24.0 | Loop | Text fades, cards return to the opening fans; last frame equals frame 0 without the title. |

Must-read words: about 76 (title 5, headers 6, left counter 6, key 4, TREATMENT 1, definitions 10, right counter 9, hero 13, summary lines 13, footer 9). Card names, the type line on each card, the two source lines and "schematic decks" are not counted. This is over the 60-word target; see "Known weaknesses".

## On-screen claims and sources
"Abstract" / "full text" says how far each was read (by the research and fact-check stages unless marked *builder*).

| On-screen claim | Source | Notes |
|---|---|---|
| PRIMARY = untreated necrotic pulp; PERSISTENT = survived treatment; SECONDARY = got in during or after treatment | Siqueira JF Jr, Rôças IN. J Oral Microbiol 2009;1:2009. PMID 21523208 (full text) | Secondary = "introduced in the root canal at some time after professional intervention". The combined header "PERSISTENT / SECONDARY" is used because the two cannot be told apart in a sampled root-filled tooth. |
| "10–20 taxa per canal · molecular studies" | same (text and Table 1) | Review-level range. Culture finds a mean of 2.6–5.4. The method stays attached to the number. |
| "1–5 taxa per canal · adequately treated · culture + PCR" | same; Siqueira JF Jr et al. PLoS One 2016;11:e0162887. PMID 27689802 (full text) | Culture and early PCR panels. Inadequately treated canals: up to about 30. |
| Primary deck is mixed Gram − / Gram +; genus names | Siqueira & Rôças 2009 (genus sentence for primary infections); Figdor D, Sundqvist G. Aust Dent J 2007;52(1 Suppl):S38-51. PMID 17546861 (abstract) | The 6 : 4 split is schematic ("approximately equal proportions"). |
| Nine "anaerobe" badges, one "facultative" | Byström A, Sundqvist G. Scand J Dent Res 1981;89:321-8. PMID 6947391 (abstract: 88 % of strains anaerobic, 17 teeth) | 9 of 10 is schematic; the 88 % is not printed. Badges say "anaerobe", not "obligate". |
| Treatment leaves a small, mostly Gram-positive remainder (two violet survivors) | Siqueira JF Jr, Rôças IN. J Endod 2008;34:1291-1301.e3. PMID 18928835 (abstract) | No number shown. One survivor is an anaerobe (*Pseudoramibacter*), so the picture does not say anaerobes cannot persist. Both genera appear in the review's primary and treated-tooth lists. |
| Right-hand cards: *E. faecalis*, *Streptococcus*, *Pseudoramibacter*, *Candida* | Siqueira & Rôças 2009, Table 1 (treated teeth) | *E. faecalis* and *Candida* are dealt from the team's own deck: survivor or latecomer is unsettled. |
| "Often found. Rarely dominant." / "qPCR, 29 teeth: found in 11, dominant in 1" | Rôças IN, Siqueira JF Jr. J Clin Microbiol 2012;50:1721-4. PMID 22403423 (full text) | "Often found" rests on the wider literature: 24–77 % (Stuart CH et al. J Endod 2006;32:93-8, PMID 16427453). Source line is on the card. |
| "mostly obligate anaerobes", "Gram − and +" | Figdor & Sundqvist 2007; Byström & Sundqvist 1981 | |
| "more facultatives", "mostly Gram +" | Pinheiro ET et al. Int Endod J 2003;36:1-11. PMID 12656508 (83 % Gram-positive, 57 % facultative); Molander A et al. Int Endod J 1998;31:1-7. PMID 9823122 (69 % facultative); Siqueira & Rôças 2009 Table 1 | Culture-era findings; the footer says so. |
| "sometimes yeast" | Siqueira & Rôças 2009 Table 1; Mergoni G et al. J Endod 2018;44:1616-1625.e9. PMID 30241680 (8.2 % pooled over all infection types) | No number shown. Pooled data do not show yeast to be specific to treated teeth (Persoon 2017, PMID 27987307). |
| "Culture + PCR picture · sequencing finds more in both" | Siqueira 2016 (mean 116 OTUs per treated root apex); Manoil D et al. Proteomics Clin Appl 2020;14:e1900060. PMID 31950679 | Required qualifier from the fact-check. |
| Card shape words and anaerobe/facultative per genus | Twelve PubMed abstracts, table in RESEARCH.md section (i) (*builder*, abstracts only) | Each card prints only the word its abstract supports. |

On-screen source lines: "Siqueira & Rôças, J Oral Microbiol 2009" (columns and end card) and "Rôças & Siqueira, J Clin Microbiol 2012" (hero card).

## What is schematic
- Labelled "schematic decks" from 3.1 s to the end. Which ten genera are dealt, the 6 : 4 colour split, 9 : 1 badge split, which two cards survive, and the card order are illustrative, not prevalence data.
- The pip meters share a 20-pip scale: solid = lower bound, outlined = up to the upper bound. The two ranges come from different methods, printed under each.
- The counters tick through intermediate numbers while cards land; only the settled ranges are claims.
- Morphology icons are textbook drawings, not to scale (yeast drawn larger). Pairs, V-shapes and chain lengths are drawn from textbook description, not from the abstracts.
- The sweep is a metaphor; nothing is implied about which treatment step does what.

## Dropped from the brief, and why
- Team colours = Gram colours, and "primary is largely Gram-negative": wrong per the fact-check.
- Stat bars for starvation survival and alkaline tolerance: no comparable data for the anaerobes, in vitro only for *E. faecalis*, and already the subject of reel 09. The only bars are the two pip meters.
- "88 % of strains anaerobic", "> 99 % fewer bacteria", "~8 % yeast", Sundqvist 1976/1998 numbers: left to the caption or left out to hold the word count down.

## Design notes
- Safe area: all text inside x 64–1016, y 230–1580. Below y 1100 nothing readable passes x 960 (the "SECONDARY" label ends at about x 955; the right-hand spread ends at x 946).
- Card names are 30 px Barlow Condensed with an oblique shear (the vendored face has no italic). Type lines and shape words on the cards are 22–24 px fine print that repeats the colour and badge coding.
- Handle sits at the bottom of the right column throughout.

## Known weaknesses
- About 76 must-read words against a target of 60; the end card carries 22 new words in a 3.3 s hold and is meant to be paused.
- The "SECONDARY" label is clear for about 1.6 s before the hero card dims it; it returns on the end card.
- The opening frame has empty felt below y 1200.
- The anaerobe badge (O₂ under a red no-symbol) is busy at 46 px; the key explains it.

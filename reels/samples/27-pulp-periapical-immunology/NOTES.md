# 27 · The tooth fights back — pulp + periapical immunology

**Style:** SILENT COMIC STRIP. Four-colour print palette (cyan, magenta, yellow, key black on newsprint, with overprint red/green/violet), Ben-Day dot screens on rational-tangent lattices, bold ink outlines with drop ink, Bangers headers, Comic Neue captions, printer's marks in the margins. Cells have no faces; shapes follow standard histology.
**Technique:** one printed page (masthead, six panels, takeaway banner). The page starts as a blue-pencil rough; the camera dives in and reads it panel by panel, each panel being "inked" by a diagonal wipe as the camera arrives, then pulls back to the whole inked page. Panel 6 slides in and snaps into its slot; the banner drops in.
**Duration:** 25.8 s · 1080×1920 · silent · poster at 25.0 s (the complete page).
**Files:** `index.html` (page layout, camera, captions, timeline), `comic.js` (ink/halftone kit, cells), `panels.js` (six panel scenes). Pure `render(t)`; all scatter from a seeded integer hash.

## Storyboard (s)
| t | Panel | Header | Caption (close-up) | Picture |
|---|---|---|---|---|
| 0–1.1 | Page | THE TOOTH FIGHTS BACK! · PULP + PERIAPICAL IMMUNOLOGY | none | Blue-pencil page, numbered roundels pop 1–6. |
| 1.1–4.3 | 1 | SENSE! | Odontoblasts sense bacteria: TLR2, TLR4. | Bacteria and products move down tubules; receptors on odontoblast processes flash; cells release signal dots. |
| 4.3–8.45 | 2 | RALLY! | Dendritic cells sample. Then T cells, macrophages, neutrophils. | Caries front deepens to the pulp; dendritic arms reach into tubules; T cells, a macrophage, then neutrophils leaving a venule. |
| 8.45–12.2 | 3 | NECROSIS | No immune access. A protected bacterial reservoir. | Necrosis creeps crown to apex, bacteria fill the canal, apical tissue reacts early, leukocytes stop at the foramen. |
| 12.2–16.4 | 4 | HOLD THE LINE! | Macrophages, T + B cells, plasma cells, antibodies. (+ tag "mostly IgG") | Neutrophils mass at the foramen; macrophages, lymphocytes, plasma cells; antibodies tag leaked bacteria. |
| 16.4–20.15 | 5 | THE COST | (bolts IL-1, TNF, PGE2, RANKL) …switch on osteoclasts. Bone resorbs. | Four signals side by side; osteoclasts activate; lacunae deepen. |
| 20.15–25.3 | Page + 6 | STANDOFF | The lesion contains the infection. It can't reach the canal. TREATMENT CAN. | Whole page with 30 px captions; a file enters the canal and removes most, not all, bacteria. Full takeaway static 22.85–25.3. |
| 25.3–25.8 | Loop | | | Text fades first, inks fade back to pencil (matches t = 0). |

Must-read words: 66 (masthead 7, panels 6 + 9 + 8 + 12 + 11 + 1, takeaway 12). The page view repeats the same captions at 30 px (panel 5 adds the four signal names already read on the bolts).

## On-screen claims and sources (all verified in RESEARCH.md)
1. Odontoblasts sense bacteria: TLR2, TLR4. Veerayutthwilai et al., Oral Microbiol Immunol 2007;22:5-13, PMID 17241164 (abstract: TLR2/TLR4 immunolocalized in human odontoblasts and processes in situ; "sense" is the authors' inference).
2. Dendritic cells sample; then T cells, macrophages, neutrophils as caries deepens. Farges et al., Mediators Inflamm 2015;2015:230251, PMID 26538821 (review, full text); primary human data Yoshiba 1996 (PMID 8906127), Izumi 1995 (PMID 7575232).
3. Necrotic pulp: no immune access, a protected bacterial reservoir. Graves, Oates, Garlet, J Oral Microbiol 2011;3:5304, PMID 21547019 (review, full text). "No blood supply" is not claimed. Early periapical reaction and crown-to-apex necrosis: Yamasaki 1994, PMID 8182380 (rat).
4. Periapical cast: macrophages, T and B cells, plasma cells, neutrophils (unranked). Stashenko, Yu, Wang, J Endod 1992;18:422-6, PMID 9796508 (abstract).
5. "mostly IgG": Matthews & Mason, Br J Oral Surg 1983;21:192-7, PMID 6578841 (10 human granulomas, IgG 81.9% of immunoglobulin-positive plasma cells).
6. IL-1, TNF, PGE2, RANKL implicated in osteoclast activation and bone resorption, shown side by side (a review-level model, not a proven serial relay). Graves 2011 (review); supporting: Wang & Stashenko 1993 (PMID 8509747), Vernal 2006 (PMID 16700737).
7. The lesion contains the infection; it can't reach the canal; treatment can. Nair, Crit Rev Oral Biol Med 2004;15:348-81, PMID 15574679 (abstract); Márton & Kiss, Oral Microbiol Immunol 2000;15:139-50, PMID 11154396; Graves 2011. Treatment reduces the load; it is not shown as sterilizing (bacteria remain apically in panel 6).
8. Fine print: "largely rodent-model data · schematic".

## What is schematic
Cell sizes, numbers and colours; tubule and receptor sizes (receptors drawn as horseshoe glyphs); the order and speed of every step; the clean panel sequence (stages overlap in reality); neutrophils massed at the foramen (textbook depiction, Nair 1987 not verified); the cells drawn beside the bolts are an unranked crowd (no single RANKL source implied); fading pulp vessels; the endodontic file and the fraction of bacteria it removes; signal dots released by odontoblasts.

## Design rationale
Close-up captions carry cell names on colour chips matching each cell's ink, lit when that cell enters, instead of leader-line tags. Captions are re-lettered at 30 px on the page so the poster is a legible summary. IL-6, IL-17, Th subsets and IL-10/Tregs are left to the caption because their direction is disputed or adds words.

## Change log
- Build 1: full page, six panels. Fixes after QA: replaced Kit.hash scatter (correlated) with a mixed hash; macrophage redrawn to avoid face-like vacuoles; tooth shading as edge crescent; antibodies one per leaked bacterium; caption boxes hug text; handle centred in gutter.

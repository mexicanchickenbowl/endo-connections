# 27 · The tooth fights back — pulp + periapical immunology

**Style:** SILENT COMIC STRIP. Four-colour print palette (cyan, magenta, yellow, key black on newsprint, with overprint red/green/violet), Ben-Day dot screens on rational-tangent lattices, bold ink outlines with drop ink, Bangers headers, Comic Neue captions, printer's marks in the margins. Cells have no faces; shapes follow standard histology.
**Technique:** one printed page (masthead, six panels, takeaway banner). The page starts as a blue-pencil rough; panel 1 is inked on the page in the first half second, then the camera dives in and reads the page panel by panel, each panel being "inked" by a diagonal wipe as the camera arrives, and pulls back to the whole inked page. Panel 6 slides in and snaps into its slot; the banner drops in. For the loop the banner slides back off and the inks are wiped back to pencil.
**Duration:** 25.1 s · 1080×1920 · silent · poster at 24.0 s (the complete page).
**Files:** `index.html` (page layout, camera, captions, timeline), `comic.js` (ink/halftone kit, cells), `panels.js` (six panel scenes). Pure `render(t)`; all scatter from a seeded integer hash.

## Storyboard (s)
| t | Panel | Header | Caption (close-up) | Picture |
|---|---|---|---|---|
| 0–0.75 | Page | THE TOOTH FIGHTS BACK! · PULP + PERIAPICAL IMMUNOLOGY | none | Blue-pencil page; panel 1 is inked by a wipe at 0.26–0.62 and its header pops; roundels pop 1–6. |
| 0.75–3.77 | 1 | SENSE! | Odontoblasts sense bacteria: TLR2, TLR4. | Bacteria and products move down tubules; seven large receptor glyphs turn yellow one after another (four with a flash); cells release signal dots. |
| 3.77–7.62 | 2 | RALLY! | Dendritic cells sample. Then T cells, macrophages, neutrophils. | Caries front deepens to the pulp; dendritic arms reach into tubules; T cells, a macrophage, then neutrophils leaving a venule. |
| 7.62–11.15 | 3 | NECROSIS | No immune access. A protected bacterial reservoir. | Necrosis creeps crown to apex, bacteria fill the canal, apical tissue reacts early, leukocytes stop at the foramen. |
| 11.15–15.32 | 4 | HOLD THE LINE! | Macrophages, T + B cells, plasma cells. (+ tag "mostly IgG" on an antibody beside a plasma cell) | Neutrophils mass at the foramen; macrophages, lymphocytes, plasma cells; one antibody rests beside each plasma cell, one flies off and docks on a leaked bacterium. |
| 15.32–18.87 | 5 | THE COST | (bolts IL-1, TNF, PGE2, RANKL) Osteoclasts resorb bone. | Four signals side by side strike; osteoclasts activate; lacunae deepen. |
| 18.87–24.6 | Page + 6 | STANDOFF | The lesion contains the infection. It can't reach the canal. TREATMENT CAN. | Zoom-out to the page; panel 6 snaps in and the file enters the canal (19.9–20.8); takeaway lines at 19.95, 20.5, 20.95; 30 px page captions fade in at 21.3 once the takeaway is complete. Full takeaway static 21.25–24.64 (3.4 s); line 1 visible 4.5 s (readSecs of the 12 words = 4.44 s). |
| 24.6–25.1 | Loop | | | Page captions fade, banner slides off with its lettering, inks are wiped back to pencil (matches t = 0). |

Close-up caption dwell (fully visible until the camera leaves) vs `Kit.readSecs`: P1 2.45/2.32 s, P2 3.35/3.22 s, P3 3.03/2.92 s, P4 3.65/3.53 s (caption + tag), P5 3.05/2.92 s (bolts + caption).

Must-read words: 63 (masthead 7, panels 6 + 9 + 8 + 11 + 9 + 1, takeaway 12). The page view repeats shorter versions of the captions at 30 px (panel 5 names the four signals there because the bolt lettering is 20 px at page scale).

## On-screen claims and sources (all verified in RESEARCH.md)
1. Odontoblasts sense bacteria: TLR2, TLR4. Veerayutthwilai et al., Oral Microbiol Immunol 2007;22:5-13, PMID 17241164 (abstract: TLR2/TLR4 immunolocalized in human odontoblasts and processes in situ; "sense" is the authors' inference).
2. Dendritic cells sample; then T cells, macrophages, neutrophils as caries deepens. Farges et al., Mediators Inflamm 2015;2015:230251, PMID 26538821 (review, full text); primary human data Yoshiba 1996 (PMID 8906127), Izumi 1995 (PMID 7575232). Nuance (kept here, not in the Instagram caption since Final QA): B cells follow later, and dendritic cells and T cells are resident in healthy human pulp (Jontell et al., J Dent Res 1987;66:1149-53, PMID 3305633, abstract).
3. Necrotic pulp: no immune access, a protected bacterial reservoir. Graves, Oates, Garlet, J Oral Microbiol 2011;3:5304, PMID 21547019 (review, full text). "No blood supply" is not claimed. Early periapical reaction and crown-to-apex necrosis: Yamasaki 1994, PMID 8182380 (rat); the on-screen footnote now says "schematic".
4. Periapical cast: macrophages, T and B cells, plasma cells; neutrophils and antibodies are drawn, not captioned (unranked). Stashenko, Yu, Wang, J Endod 1992;18:422-6, PMID 9796508 (abstract).
5. "mostly IgG": Matthews & Mason, Br J Oral Surg 1983;21:192-7, PMID 6578841 (10 human granulomas, IgG 81.9% of immunoglobulin-positive plasma cells). Named in the panel's own footnote, with its journal since the citation audit ("IgG: Matthews & Mason 1983, Br J Oral Surg").
6. IL-1, TNF, PGE2, RANKL (bolts) and "Osteoclasts resorb bone"; the page caption reads "IL-1 TNF PGE2 RANKL switch on osteoclasts". Shown side by side (a review-level model, not a proven serial relay). Graves 2011 (review); supporting: Wang & Stashenko 1993 (PMID 8509747, human granulomas: IL-1β and TNF-β), Vernal 2006 (PMID 16700737). The Instagram caption says "review model". Nuance (kept here, not in the caption since Final QA): RANKL/OPG balance (Kawashima 2007, PMID 17336108, rat) and the protective side of the same signals (Chen et al., Am J Pathol 1999;155:2145-52, PMID 10595943: mice lacking IL-1 and/or TNF receptors had the largest lesions).
7. The lesion contains the infection; it can't reach the canal; treatment can. Containment: Márton & Kiss, Oral Microbiol Immunol 2000;15:139-50, PMID 11154396 ("prevents abundant extraradicular bacterial invasion", abstract); "can't reach the canal": Graves 2011, PMID 21547019 (full text: necrotic pulp tissue "is inaccessible to leukocytes"); host defense and the aim of treatment: Nair, Crit Rev Oral Biol Med 2004;15:348-81, PMID 15574679 (abstract; this is the paper in the on-screen footnote). The caption says "usually contains" (abscesses are the exception). Treatment reduces the load; it is not shown as sterilizing (bacteria remain apically in panel 6).
8. Fine print on the final page: "human + rodent data · schematic" (cells and mediators come from human tissue studies; timing and knockout causality from rodent models).

## What is schematic
Cell sizes, numbers and colours; tubule and receptor sizes (receptors drawn as large horseshoe glyphs, wider than a tubule); the order and speed of every step; the clean panel sequence (stages overlap in reality); neutrophils massed at the foramen (textbook depiction, Nair 1987 not verified); the cells drawn beside the bolts are an unranked crowd (no single RANKL source implied; in rat lesions most RANKL-positive cells were fibroblastic, Kawashima 2007); fading pulp vessels; the endodontic file and the fraction of bacteria it removes; signal dots released by odontoblasts.

## Design rationale
Close-up captions carry cell names on colour chips matching each cell's ink, lit when that cell enters, instead of leader-line tags. A close-up caption belongs to the panel the camera is on and leaves with the camera. Shorter captions are re-lettered at 30 px on the page so the poster is a legible summary. IL-6, IL-17, Th subsets and IL-10/Tregs are left to the caption because their direction is disputed or adds words.

## Change log
- Build 1: full page, six panels. Fixes after QA: replaced Kit.hash scatter (correlated) with a mixed hash; macrophage redrawn to avoid face-like vacuoles; tooth shading as edge crescent; antibodies one per leaked bacterium; caption boxes hug text; handle centred in gutter.

## Review changes (round 1)
Science
- Final-page footnote now "human + rodent data · schematic" (was "largely rodent-model data"); caption and meta claim 8 say which part is human (cells, mediators) and which is rodent (timing, causality).
- Panel 4: antibodies redrawn. Six in total: one resting just outside each plasma cell and one docked, arms first, on each of three leaked bacteria. None rests near a T or B lymphocyte or on a macrophage. Lymphocytes rearranged (3 T, 2 B), four neutrophils.
- Panel 4 footnote: "Stashenko 1992, J Endod · IgG: Matthews & Mason 1983", so the IgG tag carries its own source. The tag now points at an antibody, not at a plasma cell.
- Panel 3 footnote gains "· schematic".
- Caption: protective role of IL-1/TNF (Chen 1999, re-read on PubMed), RANKL/OPG, "usually contains ... abscesses are the exception", B cells later and resident cells (Jontell 1987, re-read on PubMed); Refs line now lists every paper the caption relies on, including Wang & Stashenko 1993 and Márton & Kiss 2000. The caption is about 1,100 characters, above the 700 in SPEC, because the review asked for these qualifiers there instead of on screen. (Superseded: see Final QA, caption now 699 characters.)
Design
- Duration 25.8 to 25.1 s; first dive at 0.75 s; move into panel 4 takes 0.55 s; captions come up 0.15 s earlier on arrival.
- Hook: panel 1 is inked on the page at 0.26–0.62 s and its header pops before the dive; pencil lines are about 30% heavier and darker.
- Words 66 to 63: "antibodies." dropped from panel 4; panel 5 caption is "Osteoclasts resorb bone."
- Close-up captions fade out within 0.25 s of the camera leaving, so no stale caption sits above panels 4 and 5; the masthead strip's lettering (title line and handle) fades out above 1.4x zoom, leaving an empty strip.
- Ending: the file goes in at 19.9–20.8 s, before "TREATMENT CAN." lands at 20.95; page captions wait until 21.3 s; the full takeaway is static for 3.4 s.
- Page captions cut to 1–3 lines (were 3–4); "mostly IgG" is a close-up-only overlay and is hidden on the page.
- Fading boxes are composited as one layer (no gray shadow bleed); close-up and page captions never overlap.
- Loop: banner slides off, inks are wiped back to pencil by a diagonal wipe (no milky cross-fade).
- Page block moved down 20 px (masthead top at y 252, inside the grid crop); banner 206 px high so the footnote still ends at y 1579.
- Panel 1: seven receptor glyphs about 1.6x larger with an ink outline, yellow like the TLR chip, four flash in sequence; bacteria cleared from behind the header. Panel 4 header 10% smaller, clear of the root. Panel 6 has a yellow burst instead of panel 3's blue sky. Bone: marrow spaces of mixed size, shape and tilt with lamellar lines.
Not applied
- "mostly IgG" tag kept (the science review asked for its source to be shown; it is the one board-style figure in the panel).
- Panel 2 and panel 5 page captions are three lines, not two: the four cell names, and the four signal names, do not fit two lines at 30 px in a 308 px panel. The bolt lettering cannot be scaled 1.4x (four bolts would not fit side by side), so the signals are named in the 30 px caption instead.
- Panel 6 header stays "STANDOFF" (two more words at 30 px on the page view only).
- Final beat: takeaway lines 1–2 appear while the file is still moving; making it strictly sequential would cost about 0.7 s and push the reel to 25.8 s again.

## Final QA (2026-11-22)
Checked 24 stills with the safe overlay (t = 0 to 25.05 s) plus 16 transition stills, RESEARCH.md, this file, meta.json and the source.
- Fixed: punctuation that followed a colour chip (", " ":" ".") was drawn inside the chip's padding and fused with its outline in every close-up and page caption, and the IL-1 / TNF / PGE2 chips of the panel 5 page caption overlapped each other. `richLayout` now advances past the chip padding before unspaced punctuation and keeps a minimum gap between neighbouring chips. No line break changed; all caption boxes still fit (panel 4 page caption is the tightest, about 10 px spare).
- Fixed (meta.json): the Instagram caption was about 1,110 characters, above the 300-700 limit. It is now 699 characters with six references, each covering a statement the caption makes. The qualifiers that no longer fit (B cells later, resident dendritic and T cells, RANKL/OPG, the protective role of IL-1/TNF in receptor-knockout mice) stay in this file under claims 2 and 6; the caption keeps "usually contains", "review model" and "schematic animation; human + rodent data". Claim 2 no longer lists Jontell 1987 as a source because neither the screen nor the caption now states the resident-cell point.
- Verified unchanged: hook readable from t = 0; nothing must-read in the top 230 px, bottom 340 px or right-hand column; smallest must-read lettering 30 px (page captions), fine print 23-24 px; full takeaway static 21.25-24.64 s; loop frame matches t = 0 with no ghosted text; no number on screen; every caption has its source line and the final page carries "human + rodent data · schematic".
- Video re-rendered once after the fix; duration 25.1 s.
- Left as is (taste level): takeaway lines 1-2 appear while the file is still moving; panel 6 has no page caption beyond its header.

## Citation audit (2026-11-22)
Every literature citation on screen, in meta.json, in this file and in the RESEARCH.md rows behind the on-screen claims was re-fetched from PubMed (26 records: metadata + abstract) and the PMC full texts of Farges 2015 (PMC4619960) and Graves 2011 (PMC3087239) were downloaded again and searched for each quoted phrase.
- Result: no wrong first author, year, journal, volume, pages or PMID, and no number that belongs to a different paper. The eight papers behind on-screen text all exist as cited: Veerayutthwilai 2007 (PMID 17241164), Farges 2015 (26538821), Graves 2011 (21547019), Stashenko 1992 (9796508), Matthews & Mason 1983 (6578841), Wang & Stashenko 1993 (8509747), Márton & Kiss 2000 (11154396), Nair 2004 (15574679). Also re-checked: Yoshiba 1996, Izumi 1995, Jontell 1987, Yamasaki 1994, Vernal 2006, Kawashima 2007, Chen 1999 (all as cited above); Nair 1987 still has no PubMed abstract and stays uncited on screen.
- Support, by depth of reading: panels 1 and 4 and the IgG tag rest on abstracts (Veerayutthwilai 2007; Stashenko 1992; Matthews & Mason 1983: "IgG ... 81.9 ... per cent ... of the total positive cell population", ten granulomas, IgG predominant in all). Panels 2, 3 and 5 rest on review full texts that were re-read: Farges 2015 ("immature DCs accumulate at an early stage at the dentin-pulp interface in a strategic location to capture foreign antigens. A progressive and sequential accumulation of T cells ..., macrophages, neutrophils, and B cells ... then occurs in the pulp, concomitantly with the deepening of the dentin lesion"); Graves 2011 ("the necrotic tissue of the dental pulp is inaccessible to leukocytes and, hence, represents a protected reservoir of bacteria"; resorption "through the induction of proinflammatory cytokines such as IL-1β, IL-1α, receptor activator of nuclear factor kappa-B ligand (RANKL), or TNF-α"; "prostaglandins, in particular PGE2"). The takeaway footnote rests on the Nair 2004 abstract.
- Fixed on screen (panel 4 footnote): "IgG: Matthews & Mason 1983" had no journal; it now reads "* Stashenko 1992, J Endod · IgG: Matthews & Mason 1983, Br J Oral Surg". Checked on stills at 12.2, 13.5 and 15.1 s with the safe overlay: the footnote box ends at x 915, clear of the right-hand column. No other on-screen text changed.
- Fixed in meta.json: claim 7 now lists Graves 2011 as the source of "cannot reach the canal" (it was named only in this file); claim 4 says the Stashenko 1992 support is the abstract's sentence on human or rat lesions. Caption unchanged (699 characters; all six Refs entries verified).
- Fixed in RESEARCH.md: rows 4.3 and 4.7 quoted one sentence for two papers. The cell-list sentence is in the Stashenko 1992 abstract; the "days 0 and 15" sentence is in the Stashenko 1994 abstract (the 1992 abstract says "between days 1 and 15"). Neither figure is on screen.
- Note: PubMed types Graves 2011 as "Journal Article", not "Review"; the paper's own title is "Review of osteoimmunology and the host response in endodontic and periodontal lesions", so "(review)" on screen stands.
- Video re-rendered once after the footnote change.

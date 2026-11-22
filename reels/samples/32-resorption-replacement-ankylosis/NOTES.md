# 32 — External replacement resorption (ankylosis) · geology field diagram

Resorption series 4/5. Silent, 21.5 s, 1080x1920, one 2D canvas (`index.html` + `reel.js`), deterministic `render(t)`.
Evidence brief: `RESEARCH.md` (researched + independently fact-checked). Only its section (b) "recommended on-screen
facts" is used on screen, with its wording constraints and its "Do not claim" list.

## Concept
The frame is one sheet of a geological survey: a neat-lined map sheet with graticule ticks, a cross-section "A–A’"
through alveolar bone and three incisors drawn as rock strata, a legend strip with pattern swatches, a compass rose
re-labeled CORONAL / APICAL, a "not to scale" bar and a stratigraphic time strip re-labeled WEEKS · MONTHS · YEARS.
Bone is stippled sandstone in three beds with bedding planes and marrow "conglomerate" lenses, dentin is hatched
slate, enamel is a limestone brick pattern, the PDL is a moss-green band of oblique fibers, gingiva is clay topsoil,
the root filling a rust-colored core. The metaphor (the root is slowly taken into the strata) is carried by the
picture only: when the root is replaced, the bone beds and bedding planes simply run through where the root was, and
the old root outline stays as a dashed "inferred contact". No text says "fossil", "stone" or "calcified".

## Storyboard (seconds)
| Time | Scene | What moves | Must-read text |
|---|---|---|---|
| 0.0–0.9 | Plate (hook) | static sheet: title, section with three teeth, all PDL bands green | `Replacement resorption` / `the root is gradually replaced by bone`; legend `ENAMEL DENTIN PDL BONE` |
| 0.9–3.5 | Avulsion + dry time | center incisor lifts out of the section (0.9–1.4), socket fills with clot; in the caption zone the avulsed tooth lies on the bench, its root coat turns from green to gray while a stopwatch sweeps past 60 min | `DRY > 60 MIN`, then `PDL cells likely non-viable` |
| 3.5–5.6 | Replanted | tooth returns with a gray, broken-fiber PDL band (3.5–4.2); view pushes in to the root (3.8–4.8, tag `DETAIL · root`); callout with two leaders | `PDL DEAD` |
| 5.5–8.95 | Fusion | pulp is replaced by a root filling (4.7–5.5); time strip appears, pointer in WEEKS; bone lobes grow from the socket wall across the gray band until bone touches root (5.8–7.9); fusion line lights up once; stamp (7.6–9.0) | `Bone grows across the dead PDL`; stamp `ANKYLOSIS`; `WEEKS MONTHS YEARS` |
| 8.6–13.0 | Geological time | view pulls back (8.6–9.5); pointer runs WEEKS → YEARS (9.2–12.8); scalloped front eats the root from both surfaces inward, bone beds continue through, dashed old outline, crown + root filling remain, a marrow lens appears late; neighbors and crest grow coronally (10.0–12.9) leaving the ankylosed crown behind | `Root remodeled as bone`; `Age 8–16: root resorbed in 3–7 yr`; callout `root filling` |
| 13.0–15.8 | Signs | mirror handle taps the crown three times with sound arcs; dashed level line + arrow mark the step; three ink icons appear in turn | `SIGNS`: `Metallic percussion` · `No mobility` · `Infraposition` / `in a growing jaw` |
| 15.8–21.15 | End card (fully built 17.8–20.7) | "EXPLANATION" card (what a geologic map calls its legend) slides up from behind the lower neat line; rows land one at a time (16.1, 16.7, 17.4); decoronation inset | `NO KNOWN WAY TO ARREST IT`; `Signs` recap; `GROWING PATIENT` `Plan early, e.g. decoronation`; `PROTECT THE PDL` `Replant at once, or store in milk` |
| 20.7–21.5 | Loop | card slides away (opaque, no ghosted text), then the section cross-fades to the t = 0 plate (21.0–21.46) | — |

Poster = 19.6 s (complete summary frame: title, final section, explanation card).

Must-read words: 68 (title 2 + subtitle 7, dry 3 + 4, callout 2, fusion 6, stamp 1, time-lapse 4 + 7, signs 10,
end card 22). Not counted: persistent corner tag, handle, legend swatch labels (4), time-strip labels (3), the
`root filling` callout (2), the one-line `Signs` recap on the card (repeats scene F), the 28 px figure caption at
t < 1.2 s, source lines, `not to scale`, `DETAIL · root`, `EXPLANATION`. Strict count including labels: 77.
All must-read text is >= 30 px; source lines and fine print are 22–28 px.

## On-screen claims and their sources
Citations were verified on PubMed by the research and fact-check stages (see RESEARCH.md). At build time the
abstracts of PMIDs 2598883, 6943904, 16324230, 6593804, 10379271, 2517781 and the record of 32460393 were pulled
again from PubMed and re-read against the wording below. The IADT 2020 guideline has no full text in PMC; its quotes
and section numbers rest on the research stage (AAPD Reference Manual reprint, full text).

| # | On screen | Source | Verified from |
|---|---|---|---|
| 1 | `Replacement resorption` — `the root is gradually replaced by bone` | AAE Glossary definition ("replacement of such structures by bone, resulting in fusion of bone and tooth") as quoted in Lin S, Moreinos D, Kaufman AY, Abbott PV. Dent Traumatol 2022;38:253-66. PMID 35559593 (Table 1). Hammarström L, Blomlöf L, Lindskog S. Endod Dent Traumatol 1989;5:163-75. PMID 2517781: "The cementum and dentin were then gradually resorbed" (monkey) | review full text (research stage); abstract (re-read at build) |
| 2 | `DRY > 60 MIN` · `PDL cells likely non-viable` · source line `Fouad 2020, Dent Traumatol (IADT avulsion guideline)`; callout `PDL DEAD` | Fouad AF et al. Dent Traumatol 2020;36:331-42. PMID 32460393, sect. 3: "The PDL cells are likely to be non-viable. The total extra-oral dry time has been more than 60 minutes" | guideline full text (research stage) |
| 3 | `Bone grows across the dead PDL` → stamp `ANKYLOSIS`; source line `Andreasen & Kristerson 1981, Acta Odontol Scand · monkey` | Andreasen JO, Kristerson L. Acta Odontol Scand 1981;39:1-13. PMID 6943904: "it is postulated that physical removal or extended drying of the periodontal ligament initiates a rapid osteogenesis in the alveolus which establishes an ankylosis". Order (fusion before root loss): Hammarström 1989, PMID 2517781: "The initial ankylosis was not preceded by root resorption." | abstracts (re-read at build) |
| 4 | Time strip `WEEKS · MONTHS · YEARS` (fine print: `time scale schematic`) | Order of magnitude only: ankylosis at 1–2 weeks in monkey histology (Hammarström 1989; Andreasen JO. Swed Dent J 1980;4:101-10, PMID 6933704); usually observed clinically/radiographically after 1–2 months in humans (Andreasen JO et al. Endod Dent Traumatol 1995;11:76-89, PMID 7641622); years: row 6 | abstracts (research stage) |
| 5 | `Root remodeled as bone` | Andersson L, Blomlöf L, Lindskog S, Feiglin B, Hammarström L. Int J Oral Surg 1984;13:423-31. PMID 6438004: ankylosed "teeth form part of the remodelling process of the alveolar bone and are therefore progressively resorbed" (background statement). Malmgren B. J Endod 2013;39(3 Suppl):S67-72. PMID 23439048: "The ankylosed root is continuously resorbed and replaced by bone" (review) | abstracts (research stage) |
| 6 | `Age 8–16: root resorbed in 3–7 yr` · `≥ 1 h dry · Andersson 1989, Endod Dent Traumatol · time scale schematic` | Andersson L, Bodin I, Sörensen S. Endod Dent Traumatol 1989;5:38-47. PMID 2598883: "a minimum of 1 h dry extraoral storage"; "In patients 8-16 years old at the time of avulsion the rate of root resorption was significantly higher"; "will become ankylosed and resorbed within 3-7 years in young patients" (authors' conclusion; radiographic index; mean follow-up 4.8 y; sample size not in the abstract) | abstract (re-read at build) |
| 7 | `Metallic percussion` · `No mobility` | Fouad 2020, sect. 11.1 / 11.3: "a metallic sound to percussion"; "no mobility (ankylosis) with high-pitched (metallic) percussion sound". Campbell KM, Casas MJ, Kenny DJ. J Can Dent Assoc 2005;71:763-8. PMID 16324230: "characteristic sound emitted when the tooth is tapped ... lack of physiologic mobility" | guideline full text (research stage); abstract (re-read at build) |
| 8 | `Infraposition` · `in a growing jaw` · source line `Fouad 2020 ... · Kawanami 1999, Endod Dent Traumatol` | Kawanami M et al. Endod Dent Traumatol 1999;15:50-6. PMID 10379271: "Marked infraposition was identified if the tooth was traumatized before the age of 16 in boys and before the age of 14 in girls." Fouad 2020, sect. 3.1.3: "When ankylosis occurs in a growing patient, infra-position of the tooth is highly likely" | abstract (re-read at build); guideline full text (research stage) |
| 9 | `NO KNOWN WAY TO ARREST IT` · source `Campbell 2005, J Can Dent Assoc` | Campbell, Casas & Kenny 2005, PMID 16324230: "there is no known treatment to arrest this condition." Also Patel S et al. Int Endod J 2022;55 Suppl 4:892-921. PMID 35229320: "Presently, there is no treatment to arrest ERR." | abstract (re-read at build); review full text (research stage) |
| 10 | `GROWING PATIENT` — `Plan early, e.g. decoronation`; fine print `decoronation: crown off, root left to be replaced by bone · schematic`; source `Malmgren 1984, Scand J Dent Res` | Malmgren B, Cvek M, Lundberg M, Frykholm A. Scand J Dent Res 1984;92:391-9. PMID 6593804: "removal of the crown and root filling from the root, which is retained and covered with a mucoperiosteal flap ... continuous resorption and replacement of lost root substance by bone". Fouad 2020, sect. 3.1.3 and 12: decoronation "or other procedures such as autotransplantation might be necessary" (one option, hence "e.g."). Early planning: Malmgren B, Malmgren O. Dent Traumatol 2002;18:28-36. PMID 11841463 | abstract (re-read at build); guideline full text and abstract (research stage) |
| 11 | `PROTECT THE PDL` — `Replant at once, or store in milk` · source `Fouad 2020, Dent Traumatol (IADT avulsion guideline)` | Fouad 2020, sect. 2–3: "Immediate replantation of the avulsed tooth is the best treatment at the place of the accident."; "In descending order of preference, milk, HBSS, saliva ... or saline" | guideline full text (research stage) |

Wording constraints from the fact-check that were applied: "gradually" (not "slowly"); "likely non-viable"; no
"bone reaches the root first / wins the race"; no "1–2 mo" mark on the time strip; no "> 20% of the root surface" on
screen; decoronation as "e.g."; heading "PROTECT THE PDL" (not "PREVENT"); splint line cut (the brief's own
suggestion when words must be cut); no adult number; never "dull".

## What is schematic (not data)
- The whole section: proportions, PDL width (exaggerated about 5x), tooth spacing, three bone "beds", marrow lenses.
  Marked `not to scale` on the plate and `SCHEMATIC · NOT TO SCALE` in the sheet margin.
- The tooth leaving the section and returning: a storytelling device for avulsion and replantation. The clot and the
  green rim left on the socket wall are schematic.
- Stopwatch: sweeps to about 75 min to show "more than 60"; no other time is implied.
- Bone bridging the PDL: lobes growing from the socket wall. Only "rapid osteogenesis in the alveolus which
  establishes an ankylosis" (a postulate from monkey histology) is behind it; no cell type and no "race" is shown.
- Pulp → root filling at 4.7–5.5 s: inferred from guideline care (root canal treatment within 2 weeks after
  replantation of a closed-apex tooth, IADT 2020), not a cited finding. The filling line persisting in bone while the
  dentin around it is replaced is likewise a drawing decision; it is labeled only `root filling`.
- Time strip: block widths and pointer speed are arbitrary; it mixes monkey histology (weeks) with human clinical
  observations (months, years). Labeled `time scale schematic`.
- Replacement front: shape, scalloping, symmetry and the order in which levels of the root disappear are schematic
  (the narrow apical part goes first only because it is thinner). The cervical stub that stays under the crown, the
  dashed old outline and the late marrow lens are drawing decisions.
- Infraposition: 46 px step, neighbors and crest translated coronally; amount and timing schematic.
- Percussion handle, sound arcs and the three sign icons: pictograms.
- Decoronation inset: crown and root filling removed, root left below the crest, flap closed. Bone level over the
  root is drawn flat; no bone gain is claimed (age-dependent, Malmgren 2015).

## Design rationale
- Style: survey-sheet paper with fold creases, double neat line, graticule ticks, margin notes
  ("ENDODONTIC FIELD SURVEY · SHEET 32"), section end marks A / A’, pattern-swatch legend, compass rose, bar scale,
  rubber stamp, and an "EXPLANATION" card. Palette: ochre sandstone, slate, limestone white, moss, clay, rust.
  Type: Libre Baskerville (titles, captions) and Source Serif 4 (labels, fine print).
- The title block is static for the whole reel, so the hook reads at t = 0 and every frame is a usable still.
- One focal point at a time: caption zone below the section changes scene by scene; in-section callouts are limited
  to `PDL DEAD` and `root filling`.
- Safe areas: all must-read text inside x 64–950 below y 1100 (clear of the button column) and above y 1580. The
  compass sits above y 1100; the last 6% of the time strip and the pointer's rest position (x = 921) stay left of the
  buttons. Margin notes outside the safe area are decorative.
- Loop: the card leaves by sliding (opaque), then the panel cross-fades to a snapshot of the t = 0 plate, so the last
  frame equals the first and no two texts overlap.

## Files
- `index.html` — page shell (fonts, kit, stage).
- `reel.js` — everything else (patterns, static sheet, section, captions, card).
- `meta.json` — gallery metadata + caption.

## Change log
- v1 (this build): first version. Four still passes: fixed legend overflow (root-filling key removed, replaced by an
  in-section callout), scale-bar text overlap, sign icons colliding with their labels, over-long source line on the
  end card (now two lines at 23 px), compass and scale plaque clipped by the card, replacement front that read as
  "apex first" (now surface inward on both sides), time-lapse pacing, stamp clipped by its own canvas, end card
  ghosting over the legend at the loop (now slides instead of fading).

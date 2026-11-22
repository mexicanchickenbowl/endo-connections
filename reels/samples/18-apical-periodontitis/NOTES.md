# 18 · Apical periodontitis — when can the X-ray see it?

**Style:** RADIOGRAPH. A periapical film with inverted density (radiopaque = white). Film grain re-rolls with every "exposure", and there is a soft vignette, rounded film corners, a lead **R** marker and an embossed orientation dot. DICOM-style mono corner text includes a unitless **EXP 01 → 10** exposure index (no week counter; timing is schematic) and the handle under the film ID. The cellular mechanism is shown in a crisp **H&E-style inset**. A **CBCT-style bucco-lingual cross-section** shows why the 2-D film is often quiet until the cortex is involved.
**Technique:** a time-lapse X-ray. The film stays almost unchanged while the biology happens underneath. A `CLEAR ON 2-D PA?` toggle stays at **NO** through the mechanism and the subtle early signs, then flips to **YES** once the lesion involves the cortex. In the takeaway the film **rewinds** to a normal-looking state with the lesion still marked, so the final held frame shows exactly what the line says.
**Duration:** 28 s · 1080×1920 · silent · poster at 16.0 s (03 · THE CATCH: "…but the PA can still look normal.", NO toggle, dashed "bone already lost" contour, lesion inside the cross-section).
**Files:** `index.html` (timeline, film compositing, overlays, captions, indicator) and `art.js` (procedural radiograph, lesion compositing, H&E inset, cross-section, chart). Pure `render(t)`, with all randomness from `Kit.rng`/`Kit.hash`/`Kit.noise*`.

## Concept
Clinicians learn that bone loss in cancellous bone may not show on a periapical radiograph, but few have *watched* it happen. The reel runs two clocks side by side:
- What the **film** shows: nothing for a long time, then subtle signs, then an obvious radiolucency.
- What the **tissue** is doing: infection, then the immune cascade, then osteoclastic resorption.

The lesion starts small inside cancellous bone, where the PA can still look normal. PDL widening appears first. Once the lesion involves the cortex, the radiolucency becomes much clearer and the toggle flips. Payoff: **"A normal PA doesn't mean no lesion."** It is backed by histology-referenced data (dog roots: histology 93 %, CBCT 84 %, PA 71 %), with PA framed as still first-line.

## Storyboard (s)
| t | Kicker / caption (big) | Visual |
|---|---|---|
| 0–3.85 | APICAL PERIODONTITIS · TIME-LAPSE — **"A lesion is growing. Can the X-ray see it?"** · fine: *Schematic · not to scale · timing illustrative* | The film "develops" (0–0.9) in a centred hook layout: film at y 560, toggle at y 1420. There is a slow push-in on the 45 apex (×1.00→1.06, 0.9–3.85), and pulsing amber corner ticks at about 40 % mark where the lesion will form (from 1.2). Mandibular PA, 47–42: deep distal caries on 45, amalgam on 46. Toggle NO. |
| 3.85–7.05 | 01 · INFECTION — **"Necrotic pulp: bacteria reach the apex"** · fine: *No bacteria, no lesion (germ-free rats): Kakehashi et al. 1965* | Amber tint creeps down the 45 canal (3.95–4.95). A tiny amber biofilm cluster sits *inside* the canal terminus, with a ping ring until 7.2. Callout "foramen" 4.5–6.0. At 6.0 the film settles and the toggle docks; at 6.35 the zoom box appears; 6.5–7.1 the H&E inset unfolds out of it. Fanned leaders show only during the unfold (gone by 7.6). |
| 7.05–13.6 | 02 · HOST RESPONSE — **"The immune response drives bone resorption"** · fine: *After Stashenko et al. 1992, 1998 · Nair 2004 · Kawashima et al. 2007* | H&E cascade. Numbered pills accumulate; the newest is outlined and linked by a leader to a matching numbered badge on its cell. ① Bacteria · LPS (7.3) → ② Macrophages · T cells (8.55; macrophages and lymphocytes migrate in) → ③ IL-1β · TNF-α · PGE₂ (9.8; plasma cells appear, mediator particles with trails) → ④ RANKL : OPG ↑ (11.05; RANKL spikes on fibroblast-like stromal cells, OPG decoys thin out, ratio bar inside the pill) → ⑤ Osteoclasts (12.3; large multinucleated cells, ruffled border, Howship's lacunae deepen about 45 px). Film unchanged, toggle NO, EXP 02→05. |
| 13.45–13.95 | (transition) | A white CT scan line sweeps down the panel: cross-section above, H&E below. |
| 13.6–18.0 | 03 · THE CATCH — **"Bone is being lost…"** / sub (from 14.4) **"…but the PA can still look normal."** · fine: *Lesion in cancellous bone · not to scale (schematic)* | Cross-section ("CROSS-SECTION" title, *schematic*, B/L). The beam runs buccal→lingual to a sensor. Labels are staggered: X-ray and sensor at 14.0, cancellous at 14.8. A small lesion (film ≈ 2 mm across) grows in cancellous bone; exit rays are unchanged and the sensor shows only a faint smudge. On the film, a dashed amber contour reads "bone already lost" (14.2–16.4). The NO knob gets a soft nudge (15.0–16.2). From 16.4 the early sign appears: the apical PDL widens and the lamina dura breaks, with callout **"PDL widening (subtle)"** (17.0–18.75). EXP 05→08. |
| 18.0–21.6 | 04 · CORTEX INVOLVED — **"Much clearer once the cortex is involved."** · fine: *Classic cadaver study (bur-made defects): Bender & Seltzer 1961* | The lesion reaches and erodes the buccal cortex: an amber contact arc, and the "cortex" label appears in amber at 18.0. The three central exit rays thicken and brighten with a white core, and the sensor gets a crisp dark spot. On the film the zoom box, dashed contour and bacteria fade out, the radiolucency fades in alone (18.5–19.6) with a push-in ×1.08, the PDL and lamina dura are erased inside it, and the trabecular net is cut by about 70 %. **Toggle flips to YES** (19.1–19.6, one pulse ring). Callout "radiolucency". Panel footer: *Digital PAs: lesion size predicts detection better than cortex (Chang 2020)*. |
| 21.45–21.95 | (transition) | Scan line sweeps the chart in over the cross-section. |
| 21.6–27.3 | TAKEAWAY — **"A normal PA doesn't mean no lesion."** · fine: *PA stays first-line; limited-FOV CBCT if signs are contradictory (AAE/AAOMR 2015)* | **Rewind** (22.0–23.0, "◀◀ REWIND" tag): EXP 10→06, the radiolucency fades, the toggle slides back to NO (22.4–22.9), the push-in releases. A dashed contour labelled **"lesion present"** marks the lesion on a normal-looking PA. Chart: *% of 83 dog roots diagnosed with AP* · *Histology = reference · de Paula-Silva et al., J Endod 2009*. Rows: Histology (truth) 93 %, CBCT 84 %, PA 71 % (bars grow from 23.1). An amber bracket from 71 % to 93 % on the PA row reads **"missed on PA"** (24.5). Footer: *CBCT finds more lesions: Estrela 2008 (clinical), Patel 2009 (artificial defects), Kanagasingam 2017 (human jaws vs histology)* · *Healing also shows late: review at ≥ 1 yr, up to 4 yrs (Ørstavik, IEJ 1996)*. |
| 27.3–28 | (loop seam) | The hook fades in from 27.15 (overlapping the outgoing takeaway). The chart fades while the film grows back to the hook layout (27.3–27.9), EXP counts down to 01 with "REWIND", the contour shrinks away, and the film "un-develops". t = 28 matches t = 0 (RMSE 0.0002 on rendered stills). |

**Reading times** (Kit.readSecs vs fully visible time):

| Text | Needed (s) | Visible (s) |
|---|---|---|
| Hook | 3.53 | 3.55 |
| S1 | 2.62 | 2.65 |
| S2 | 2.62 | 6.0 |
| S3 title | 2.01 | 3.85 |
| S3 sub | 2.92 | 3.0 |
| S4 | 2.92 | 3.05 |
| Takeaway | 2.92 | 5.15 (chart title + subtitle also ≥ 5 s) |
| Callout "foramen" | 1.10 | 1.15 |
| Callout "bone already lost" | 1.71 | 2.2 |
| Callout "PDL widening (subtle)" | 1.71 | 1.75 |
| Callout "radiolucency" | 1.10 | 1.65 |

## On-screen claims and sources (verified on PubMed)
1. **"No bacteria, no lesion (germ-free rats)".** Kakehashi S, Stanley HR, Fitzgerald RJ. *The effects of surgical exposures of dental pulps in germ-free and conventional laboratory rats.* Oral Surg Oral Med Oral Pathol 1965;20:340-9. PMID 14342926. doi:10.1016/0030-4220(65)90166-0.
2. **Apical periodontitis is the host response to root-canal microbes at the apical foramen. Microbes stay mainly intraradicular** (so the film shows the bacteria cluster only inside the canal terminus). Nair PNR. *Pathogenesis of apical periodontitis and the causes of endodontic failures.* Crit Rev Oral Biol Med 2004;15:348-81. PMID 15574679. doi:10.1177/154411130401500604.
3. **Innate and adaptive response.** Macrophages; T and B lymphocytes; plasma cells; IL-1, TNF and PGE₂ as mediators of periapical bone resorption; T-helper cells predominate in the active phase. Sources:
   - Stashenko P, Yu SM, Wang CY. *Kinetics of immune cell and bone resorptive responses to endodontic infections.* J Endod 1992;18:422-6. PMID 9796508. doi:10.1016/S0099-2399(06)80841-1. The abstract lists T, B and null lymphocytes, plasma cells, macrophages, PMNs and mast cells, and says T helper cells predominate during the active phase.
   - Stashenko P, Teles R, D'Souza R. Crit Rev Oral Biol Med 1998;9:498-521. PMID 9825224. doi:10.1177/10454411980090040701.
4. **RANKL : OPG ↑ (RANKL+ cells mostly fibroblastic; some T cells) → osteoclastogenesis.**
   - Kawashima N et al. OOOOE 2007;103:707-11. PMID 17336108. doi:10.1016/j.tripleo.2006.11.036.
   - Belibasakis GN, Rechenberg DK, Zehnder M. Int Endod J 2013;46:99-111. PMID 22900632. doi:10.1111/j.1365-2591.2012.02105.x. The evidence is limited; the review supports a rising *ratio*, not consistently lower OPG.
5. **"…but the PA can still look normal" (hedged) and "Much clearer once the cortex is involved".**
   - Classic finding: Bender IB, Seltzer S. JADA 1961;62:152-60 and 708-16. These were **bur-made defects in cadaver jaws**, as the on-screen fine print says. Reprinted J Endod 2003;29:702-6 and 707-12 (PMIDs 14651274, 14651275).
   - Modern limits, on screen as a panel footer: Chang L, Umorin M, Augsburger RA, Glickman GN, Jalali P. *Periradicular lesions in cancellous bone can be detected radiographically.* J Endod 2020;46:496-501. PMID 32057449. doi:10.1016/j.joen.2019.12.013. Findings:
     - "Lesion size, not the degree of cortical involvement, significantly affected the observers' ability to accurately detect lesions."
     - Cancellous-only lesions were correctly identified 91.6 % of the time.
     - "Only lesions in cortical bone significantly increased observers' certainty". This is why the caption says *clearer*, not *visible*, and the toggle asks "CLEAR ON 2-D PA?".
   - Gao Y et al. J Endod 2010;36:1404-9. PMID 20647106. doi:10.1016/j.joen.2010.04.003. In simulated lesions confined to cancellous bone, those < 1 mm (incisor), < 2 mm (premolar) and < 3 mm (molar) could not be visualised. A 4 mm molar lesion encroaching on the cortex was still not visualised. The hidden lesion in the reel is therefore kept small (≈ 2 mm across on the film) until the cortex is reached.
6. **Early radiographic sign: widened apical PDL space / broken lamina dura before a frank radiolucency.** Ørstavik D, Kerekes K, Eriksen HM. *The periapical index: a scoring system for radiographic assessment of apical periodontitis.* Endod Dent Traumatol 1986;2:20-34. PMID 3457698.
7. **Chart: % of 83 dog roots diagnosed with AP, histology = reference.** Histology 93 % (the disease prevalence, labelled "truth"), CBCT 84 %, PA 71 %. Source: de Paula-Silva FWG, Wu M-K, Leonardo MR, da Silva LAB, Wesselink PR. J Endod 2009;35:1009-12. PMID 19567324. doi:10.1016/j.joen.2009.04.006.
   - Sensitivity was PA 0.77 and CBCT 0.91; specificity was 1.0 for both. Because there were no PA false positives, the 22-point gap (71 → 93) is roots with AP that the PA missed, labelled "missed on PA". 71/93 ≈ 0.76 ≈ the reported sensitivity.
   - This is an experimental, high-prevalence dog sample, labelled "dog roots" on screen.
8. **"CBCT finds more lesions: Estrela 2008 (clinical), Patel 2009 (artificial defects), Kanagasingam 2017 (human jaws vs histology)".**
   - Estrela C et al. J Endod 2008;34:273-9. PMID 18291274. doi:10.1016/j.joen.2007.11.023. Clinical study, CBCT as its own reference: PA sensitivity 0.55.
   - Patel S et al. Int Endod J 2009;42:507-15. PMID 19298574. doi:10.1111/j.1365-2591.2008.01538.x. Artificial defects in dry jaws.
   - Kanagasingam S, Lim CX, Yong CP, Mannocci F, Patel S. Int Endod J 2017;50:417-26. PMID 27063209. doi:10.1111/iej.12650. Cadaver jaw sections, histology as reference: sensitivity PA 0.27, PA + parallax 0.38, CBCT 0.89; specificity 0.99–1.0.
9. **"PA stays first-line; limited-FOV CBCT if signs are contradictory (AAE/AAOMR 2015)".** AAE and AAOMR Joint Position Statement: *Use of Cone Beam Computed Tomography in Endodontics 2015 Update.* OOOO 2015;120:508-12. PMID 26346911. doi:10.1016/j.oooo.2015.07.033. Intraoral radiographs are the imaging modality of choice; limited-FOV CBCT is considered for contradictory or nonspecific clinical signs and symptoms.
10. **"Healing also shows late: review at ≥ 1 yr, up to 4 yrs".** Ørstavik D. Int Endod J 1996;29:150-5. PMID 9206419. doi:10.1111/j.1365-2591.1996.tb01361.x. Peak incidence of healing at 1 yr; complete healing sometimes took up to 4 yr.
11. **Timing.** No human time course exists; rat lesions expand fastest in days 1–15 (Stashenko 1992) and RANKL : OPG peaks at weeks 2–3 (Kawashima 2007). The reel therefore uses a **unitless exposure index** (EXP 01–10), labelled *TIME-LAPSE · SCHEMATIC* and *timing illustrative*.

## Corrections to the brief
- **"RANKL↑ / OPG↓"** became **"RANKL : OPG ↑"**. The literature supports a rising *ratio*, not consistently lower OPG.
- **Bender & Seltzer is not a law.** It is a cadaver study of bur-made defects. Cortical involvement is neither necessary nor sufficient for detection (Chang 2020; Gao 2010). The reel therefore says "can still look normal" and "much clearer once the cortex is involved", and asks "CLEAR on 2-D PA?" rather than "visible?".
- **"CBCT detects earlier"** became "CBCT finds more lesions", which is what the studies measured, and PA is kept as first-line (AAE/AAOMR 2015).
- **Week stamp** became a unitless exposure index (see claim 11).

## What is schematic / not to scale
- The whole radiograph is procedurally drawn (no real patient image). Tooth shapes, the trabecular texture, the mandibular canal and mental foramen, and lesion size are illustrative.
  - Teeth are labelled FDI 45 (#29 Universal) on the patient's right with labial mounting.
  - 47 and 42 are cut by the film edges; the field is a little wider than a real size-2 film ("not to scale").
- The amber overlays (infected canal, bacteria cluster, dashed contour, callouts) are annotations, not radiographic findings.
- The H&E inset is H&E-*style* (labelled "schematic"). Cell sizes, counts and positions are stylised, and cytokine particles are symbolic.
- The cross-section is a schematic bucco-lingual slice, labelled "schematic". The root sits nearer the buccal plate, so the lesion reaches the buccal cortex first. That is common but not universal anatomy. The sensor spot illustrates the projection idea and is not a physical simulation.
- The film and the cross-section use different scales.
- The exposure index and the lesion growth curve are illustrative.

## Design rationale
- **Palette:** three visual languages that each mean something.
  - Cool greyscale = the film.
  - H&E pink and purple = the tissue truth.
  - A single amber accent = annotation and measurement (overlays, beam, contour, the YES knob).
  - Chart colours tie them together: PA bar grey, CBCT bar silver, histology bar pink.
- **Typography:**
  - IBM Plex Sans 700 for captions (60 px), with Greek glyphs for IL-1β / TNF-α. The PGE₂ subscript is hand-set.
  - IBM Plex Mono for the kicker, stamp and DICOM corner text, which evokes radiology viewer software.
  - Fine print is 22 px.
- **Layout:** one grid, left-aligned at x = 100 and right edge at 940. The film, toggle and inset are centred at x = 520, so everything readable stays clear of the Reels button column.
- The hook frame shows the film larger, then "settles" when the inset opens, so there is no empty panel early on.
- **One focal point at a time:** infection (film), then cascade (inset, film frozen), then hidden loss (cross-section plus dashed contour), then flip (toggle), then takeaway (chart).
- **Motion:** everything is eased. Grain changes only when the exposure index ticks (a new "exposure"), with no flashing. The toggle flip has one small overshoot and a single pulse ring.
- **Loop:** the takeaway already rewinds the film to a normal-looking state. The last 0.7 s rewinds it to EXP 01 and the opening layout, while the hook fades in over the outgoing takeaway, so there is never an empty frame.
- Handle `@natebrooksendo` sits under the film ID (top-left), like a DICOM institution line, clear of callouts and leaders.

## QA log
- Pass 1:
  - Teeth were too large and finger-like; the trabecular texture looked like a Voronoi honeycomb; the radiolucency was jet black.
  - The cross-section clip bug made the cortex highlight ring the whole lesion; "cortex" and "image" labels collided.
  - The H&E tag overlapped label 4.
  - Fixed: smaller, tapered teeth; a broken-strut trabecular field; a soft radiolucency; the clip fix; labels re-laid out.
- Pass 2:
  - There was an empty panel area during S1. Fixed: the film stays large until the inset opens.
  - The loop seam showed a half-coloured knob over the fading chart. Fixed: sequential fades.
  - The lesion never touched the cortex (geometry). Fixed: moved the buccal plate.
  - Fixed the bacteria callout overhang and too-short callout display time.
- Pass 3:
  - Closely spaced stills around 5.9–7.0, 13.6–14.2, 19.5–19.7, 21.9–22.1 and 27.3–27.95.
  - The strip unfold swept over the toggle. Fixed: it now opens downward from the panel top.
  - `--safe` check passed: all readable text sits inside x 64–1016 / y 230–1580 and outside the button column.
  - Wording refined: "drives bone resorption", "RANKL : OPG ↑". Added "#29".
- Render: `reels/out/18-apical-periodontitis.mp4` (28.0 s, 840 frames, H.264 + silent AAC, 8.0 MB) and the poster `.jpg`. No console errors.

## Review changes (independent science + design review)
**Science**
- **S3 sub-caption** is hedged: "…but the PA can still look normal." It matches this file (Chang 2020; Gao 2010).
- **S4 caption** changed from "Visible once the cortex is involved." to **"Much clearer once the cortex is involved."** Chang 2020: only cortical lesions raised observer certainty, and size, not cortex, predicted detection.
- **Fine print:**
  - S4 caption: "Classic cadaver study (bur-made defects): Bender & Seltzer 1961".
  - Cross-section footer: "Digital PAs: lesion size predicts detection better than cortex (Chang 2020)".
  - This no longer cites Chang for the reverse of its conclusion.
- **Toggle** relabelled "VISIBLE ON 2-D PA?" → **"CLEAR ON 2-D PA?"**.
- **Hidden lesion size and detection model:**
  - The hidden cancellous lesion is now ≈ 2 mm across on the film (R 6→18 px at ~17 px/mm; cross-section rx ≤ 46). It reaches the buccal cortex at that size (narrower, more anatomical slice; root nearer the buccal plate). After cortical involvement it grows to R 40.
  - Detection is now graded rather than a switch. Exit rays stay identical before contact and the sensor gets only a faint smudge that scales with size. PDL widening and lamina-dura loss appear first (subtle). Only then do the clear radiolucency and the crisp sensor spot appear.
  - Fine print: "not to scale (schematic)".
- **Early PA signs added** (PAI 2–3 idea): widened apical PDL and broken lamina dura, with callout "PDL widening (subtle)" at 17.0–18.75 s (Ørstavik 1986).
- **Week counter** replaced by a unitless **EXP 01–10** exposure index.
- **Chart:**
  - Retitled "% of 83 dog roots diagnosed with AP", with subtitle "Histology = reference · de Paula-Silva et al., J Endod 2009".
  - Row renamed "Histology (truth)".
  - Amber "missed on PA" bracket from 71 % to 93 %.
  - Footer: "CBCT finds more lesions: Estrela 2008 (clinical), Patel 2009 (artificial defects), Kanagasingam 2017 (human jaws vs histology)".
  - The takeaway fine print adds the AAE/AAOMR 2015 framing: "PA stays first-line; limited-FOV CBCT if signs are contradictory".
- **Adaptive infiltrate:** lymphocytes (from step 2) and plasma cells (from step 3) are added to the H&E field. Step ② is relabelled "Macrophages · T cells" (Stashenko 1992, 1998; Kawashima 2007).
- **Bacteria on the film** are now a tiny cluster inside the canal terminus (within 4 px, above the apex), not scattered into bone (Nair 2004).
- **Kakehashi fine print** now names the model: "No bacteria, no lesion (germ-free rats): Kakehashi et al. 1965".
- **Ørstavik line:** "Healing also shows late: review at ≥ 1 yr, up to 4 yrs (Ørstavik, IEJ 1996)".
- **Film anatomy:**
  - 42 now has an incisiform (flat-edged) crown.
  - A faint, non-corticated mental foramen sits below and between the premolar apices, about 90 px from the lesion so it never overlaps. The mandibular canal fades toward it.
  - The R marker is kept as a stylistic orientation cue, beside the embossed dot.

**Design**
- **Molars rebuilt** (art.js `molar()`):
  - Two separate tapered roots, each with a centred canal (8 → 2 px) and more than 20 px of dentin either side.
  - The chamber is smaller and its floor sits about 2 mm above the furcation, with canal orifices at the floor.
  - Inter-radicular bone has its own lamina dura.
- **Hook:**
  - S1 moved to 3.85 s, so the hook is fully visible for 3.55 s.
  - Slow push-in on the 45 apex (content zoom ×1.06) from 0.9 s.
  - Pulsing amber corner ticks (about 40 %) from 1.2 s.
  - Centred hook layout: film y 560, toggle y 1420.
  - STEP spacing tightened to 1.25 s.
- **5.9–7.3 s beat:**
  - The callout is now just "foramen" (4.5–6.0 s) and is gone before the film moves at 6.0 s.
  - The inset unfolds 6.5–7.1 s; pill ① arrives at 7.3 s.
  - Fanned leaders exist only during the unfold (gone by 7.6 s).
- **Panel transitions:** a 2 px white CT scan line sweeps H&E → cross-section (13.45–13.95 s) and cross-section → chart (21.45–21.95 s). No double exposure.
- **S3 staggering:**
  - The sub-line fades in at S3+0.8.
  - X-ray and sensor labels at 14.0 s; "cancellous" at 14.8 s; "cortex" only at 18.0 s, in amber.
  - "CROSS-SECTION" is a 30 px mono panel title, with "schematic" at 22 px and B/L markers.
- **Why, not just that:**
  - The central exit rays thicken (2.4 → 5 px) and brighten with a white core once the cortex is involved.
  - The sensor is 28 px wide and gets a crisp dark spot scaled by visibility.
- **Payoff:**
  - The zoom box, dashed contour and bacteria fade with visibility; the ping ring stops at 7.2 s.
  - Push-in ×1.08 on the apex.
  - Inside the lesion, PDL and lamina dura are erased (destination-out radial mask) and the trabecular net is cut by about 70 % (blurred-bone layer).
- **Corner clutter:**
  - The handle moved under the film ID.
  - Callout anchor moved to (ax+110, ay+96).
  - The REWIND tag has a dark backing.
- **H&E:**
  - Numbered badges on one cell of each type, plus a leader from the active pill to its badge.
  - Osteoclasts are larger (r 54, elongated along the bone surface) and deeper purple (#8e3f86), with a 2 px ruffled border.
  - Howship's lacunae deepen by 45 px.
  - Cytokine particles are r 6 with short trails.
  - Pill ① moved to x 175. The RANKL : OPG bar now sits inside pill ④, and the lacunae moved down so nothing overlaps.
- **Film realism:**
  - Trabecular net contrast ×0.55, 1 px blur, two octaves of mottling (≈ 18 and 60 px), and denser bone near the crest and base.
  - PDL drawn as a soft dark band (~3 px) and lamina dura as a soft light band (~2 px), both varying ±30 % in width.
  - Scalloped, peaked interdental septa.
  - Teeth blur 1.05 px (the layer was already 0.85 px, so the suggested 0.6 px would have been sharper), with stronger cervical burnout.
- **Takeaway:**
  - The film rewinds (22.0–23.0 s, "◀◀ REWIND") to EXP 06: the radiolucency fades, the toggle slides back to NO, and a dashed contour reads "lesion present". The held frame is a normal-looking PA with a lesion.
  - Chart bars grow after the rewind (23.1 s), with values hidden until then.
- **Captions and loop:**
  - Outgoing captions fade over [b−0.3, b]; incoming captions over [b−0.15, b+0.25] with smoothstep, so the header never blinks empty.
  - Kickers cross-dissolve in place.
  - At the loop the toggle stays drawn, EXP counts down to 01 with the REWIND tag, the chart fades while the film grows back, and the hook fades in from 27.15 s.
- **Poster** is 16.0 s (the equivalent of the suggested 17.6 s in the re-timed reel). It was checked with `--safe` in the 3:4 crop.
- **Sizes:**
  - NO/YES 600 32 px mono; kickers 500 30 px mono; film ID 28 px; chart subtitle 26 px.
  - Caption block shifted (kicker 276, lines 344/412, fine print 445) and film at y 476, which gives about 26 px between the fine print and the film and keeps the kicker about 15 px inside the 3:4 crop.
- **QA:**
  - Stills at 20+ targeted times plus `--n 10 --safe`, with zoomed crops of the molars, apex, H&E and cross-section. No console errors.
  - Loop endpoints t=0 vs t=28: RMSE 0.0002.
  - Render: `reels/out/18-apical-periodontitis.mp4`: 28.0 s, 840 frames, 1080×1920, H.264 + silent AAC, 10.1 MB.

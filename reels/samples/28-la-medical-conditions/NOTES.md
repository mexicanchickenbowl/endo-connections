# 28 · Before you inject — local anesthetic safety card

**Style:** airline safety card. A laminated card (clear rim, gloss streaks, navy header band, amber rule, index strip)
is pulled out of a seat-back literature pocket. Pale blue-gray seat back, slate pocket. Numbered panels with thick
rounded borders; flat pictograms in four flat colors (ink navy, figure blue, pale glass, coral highlight) plus three
signage colors: **amber triangle = limit, red prohibition circle = avoid, green check = OK**. Type: Barlow Condensed
(titles, labels, strips) and Barlow (subtitle, fine print, handle).
**Duration:** 25.0 s · 1080×1920 · 30 fps · silent. Poster = 23.4 s (the complete card).
**Files:** `index.html` (page contract), `pictograms.js` (pictogram library, `window.Pic`), `reel.js` (layout,
timeline, card, seat back and pocket; one 2D canvas, `render(t)` is a pure function of `t`).
**Evidence brief:** `RESEARCH.md` (researched, then independently fact-checked; section (i) is the build-stage
addendum, section (j) the review-stage addendum). The reel shows only items from its recommended list (b), with its
wording constraints; (j) records where the review changed panels 2 and 5.

## Concept
A board-style list ("which histories change the cartridge?") drawn as the card you find in a seat pocket: each panel
pairs a patient pictogram with labelled cartridges and a sign, so the card reads without the words. The grammar is
the lesson: most of these are **amber** (limit and monitor), not red. Only cocaine, uncontrolled hyperthyroidism,
methemoglobinemia risk and sulfite allergy get a red sign, and the levonordefrin red sign is a label-level precaution.
The mandatory honesty line sits on the final card: *Conventional precautions, not trial-proven limits · check current
references*.

## Storyboard (seconds)
| t | Beat | On screen |
|---|---|---|
| 0.00–0.60 | **Hook** | The card rises out of the pocket (slight tilt, soft overshoot). Header: **BEFORE YOU INJECT** / LOCAL ANESTHETIC SAFETY CARD. The title is visible from frame 0 (peeking from the pocket) and in place by ~0.4 s. |
| 0.4–1.4 | Grammar | Eight dashed numbered slots fade in. The legend in the header pulses once (0.6–1.4 s): ▲ LIMIT · ⊘ AVOID · ✓ OK. A soft gloss sweep crosses the laminate (0.6–1.4 s). |
| 1.40 (2.8 s) | **1** | Bust with beating heart → two cartridges "1:100,000" counted in, a third dashed ghost, bracket, amber sign. Strip: LIMIT EPI ≈ 0.04 mg / ≈ 2 CARTRIDGES. |
| 4.20 (2.6 s) | **2** | Pill bottle "β" + capsules → EPI cartridge with amber sign; then BP gauge (dial, tube, bulb; needle swings) → repeat arrow → dashed next cartridge. Strip: SMALL DOSES · RECHECK BP. |
| 6.80 (2.7 s) | **3** | Pill bottle with a three-ring skeleton → EPI + amber sign, LEVO + red sign. Split strip: EPI: LOW DOSE (amber) / AVOID LEVONORDEFRIN (red). |
| 9.50 (2.0 s) | **4** | Head in profile, powder, "recent" clock running back → EPI and LEVO, both red. Strip: NO VASOCONSTRICTOR. |
| 11.50 (1.9 s) | **5** | Bust with a pulsing coral thyroid and radiating marks → EPI and LEVO, both red. Strip: NO VASOCONSTRICTOR. |
| 13.40 (1.9 s) | **6** | Red blood drop → chocolate-brown drop → PRILOCAINE cartridge and BENZOCAINE tube, both red. Strip: AVOID BOTH. |
| 15.30 (1.9 s) | **7** | Bust with a rash → EPI cartridge carrying a coral "SULFITE" chip, red; PLAIN cartridge, green. Strip: USE PLAIN. |
| 17.20 (2.0 s) | **8** | Pregnant figure → LIDOCAINE and LIDO + EPI cartridges, both green. Strip: CONSIDERED SAFE. |
| 18.75–19.2 | Dock | Last panel settles; all panels return to full contrast. A soft gloss sweep (18.7–19.6) crosses while it docks. |
| 19.15–19.6 | Fine print | "Conventional precautions, not trial-proven limits · check current references" + one source line. |
| 19.6–24.26 | **Payoff / study card** (held ≈ 4.7 s) | Complete card. A roll-call of the signs (20.1–22.05), then still. Poster 23.4 s. |
| 24.26–24.93 | Loop | The card slides back into the pocket until only the header peeks out, which is exactly frame 0. No cross-fade, so no ghosted text. |

Each panel is "lifted" (×1.42, bottom row ×1.36, drop shadow) for its slot (2.8 / 2.6 / 2.7 / 2.0 / 1.9 / 1.9 / 1.9 /
2.0 s, sum 17.8 s), docks over the last 0.45 s of that slot, and only then does the next panel pop (sequential
hand-off: a lifted card never covers a strip that has just completed). A lifted panel grows downward over rows that
are still empty, so it never hides the strips of the row above. A docked panel keeps full contrast while it docks and
steps back to 60 % contrast only when the next panel pops. Build inside a panel (text first): badge and title with
the pop (0–0.3 s), pale strip slot from frame 0 → patient 0.04 s → arrow 0.25 s → cartridges 0.35–0.55 s → **strip
wiped in at 0.50 s, complete by 0.80 s** (0.94 s for the split strip) → signs stamped 0.52–0.90 s. Complete strip at
full contrast before the next pop: 2.0 / 1.8 / 1.8 / 1.2 / 1.1 / 1.1 / 1.1 s (panel 8 stays).

Handle: `@natebrooksendo` runs vertically on the index strip (27 px, x ≤ 1016, y 566–786), with a small tooth mark
and one index tick per row of panels.

## On-screen text (must-read)
Header 7 words, legend 3, panel titles 17, strips 25, distinct cartridge/tube labels 9 (1:100,000, EPI, LEVO,
PRILOCAINE, BENZOCAINE, PLAIN, LIDOCAINE, LIDO + EPI; the "SULFITE" chip repeats the panel title) → **≈ 61 must-read
words**. All ≥ 30 px at docked size (titles 30 px, one common size; cartridge labels and chip 30 px; strips 31–44 px;
legend 31 px; subtitle 30 px) and ×1.42 (×1.36) while in focus. Fine print (25 px) and the handle are not counted.

## On-screen claims and sources
Verification levels as recorded in RESEARCH.md: **A** = PubMed abstract, **FT** = full text read, **L** = FDA label
on DailyMed, **G** = guideline read. Nothing on screen rests on a textbook alone.

| # | On screen | Source and what it supports |
|---|---|---|
| Legend | ▲ LIMIT · ⊘ AVOID · ✓ OK | House grammar of the card. "Avoid" is used instead of "contraindicated" on purpose (RESEARCH.md (e)). |
| 1 | SIGNIFICANT HEART DISEASE → two cartridges "1:100,000" + dashed third, amber sign. LIMIT EPI ≈ 0.04 mg / ≈ 2 CARTRIDGES | Becker DE, Reed KL. *Anesth Prog* 2012;59(2):90-101. PMID 22822998, doi:10.2344/0003-3006-59.2.90 (**FT**): 40 mcg "(approximately 2 cartridges containing epinephrine 1:100,000)" is "the most conservative and frequently cited dose limitation for patients having significant cardiovascular disease". Arithmetic: 1:100,000 = 0.01 mg/mL, 1.7–1.8 mL cartridge = 0.017–0.018 mg (Lignospan label, DailyMed, **L**; Tolas AG et al. *J Am Dent Assoc* 1982;104:41-3, PMID 6948029, **A**), so 2 cartridges = 0.034–0.036 mg, hence "≈". No time base on screen: Becker & Reed say the figure "more appropriately reflects 30-minute time periods, not appointments" (this is the time base given in the caption); Davis (*J Can Dent Assoc* 2010;76:a36) says per appointment, and "per appointment" is the usual board answer (Malamed, *Handbook of Local Anesthesia*, textbook, not read). It is a convention, not a trial-derived ceiling. Equivalents by the same arithmetic (not on screen): about 1 cartridge of 1:50,000, about 4 of 1:200,000. |
| 2 | NON-SELECTIVE BETA-BLOCKER → EPI + amber sign → BP gauge → repeat → next cartridge. SMALL DOSES · RECHECK BP | Hersh EV, Giannakopoulos H. *Dent Clin North Am* 2010;54(4):687-96. PMID 20831932, doi:10.1016/j.cden.2010.06.009 (**A**): hypertension with reflex bradycardia, "apparently rare in the dental setting", dose-related, worse with intravascular injection (hence "aspirate", which moved from the strip to the caption at review; aspiration is routine for every injection). The abstract names "epinephrine or levonordefrin with nonselective beta-adrenergic blocking agents"; cardioselective agents are not the concern (Becker 2011, full text as quoted by the science reviewer, not re-read by the builder because PMC returned no text: selective beta-1 blockers "do not generally introduce a risk for this interaction"). Becker DE. *Anesth Prog* 2011;58(1):31-41. PMID 21410363, doi:10.2344/0003-3006-58.1.31 (**FT**): recheck heart rate and blood pressure after every 20–40 mcg (1–2 cartridges of 1:100,000); "Vasopressors are not contraindicated". Becker & Reed 2012 (**FT**): not contraindicated with non-selective beta-blockers; conservative doses. Amber, never red. |
| 3 | TRICYCLIC ANTIDEPRESSANT → EPI + amber sign; LEVO + red sign. EPI: LOW DOSE / AVOID LEVONORDEFRIN | Yagiela JA, Duffin SR, Hunt LM. *Oral Surg Oral Med Oral Pathol* 1985;59(6):565-71. PMID 3892411, doi:10.1016/0030-4220(85)90181-1 (**A**; anesthetized dogs: desipramine multiplied levonordefrin and norepinephrine potency more than sixfold). Boakes AJ et al. *Br Med J* 1973;1(5849):311-5. PMID 4685619, doi:10.1136/bmj.1.5849.311 (**A**; volunteers: norepinephrine 4–8×, epinephrine 2–4×). Mepivacaine–levonordefrin (Carbocaine) label (**L**): concurrent use with tricyclics "should generally be avoided". **Contested:** Becker DE. *Anesth Prog* 2008;55(3):89-99. PMID 18788844, doi:10.2344/0003-3006-55.3.89 (**FT**): epinephrine and levonordefrin "are not contraindicated in these patients, but they should be used cautiously". The red sign is a label-level precaution, not a proven contraindication; not sourced to Yagiela 1999. Epinephrine itself is also disputed: Becker 2011 (full text as quoted by the science reviewer) says tricyclic uptake inhibition "poses no concern for epinephrine", Boakes 1973 found 2–4 fold potentiation with dysrhythmias in volunteers; amber is the conservative choice. No numeric epinephrine cap on screen (none could be traced to a primary source). |
| 4 | RECENT COCAINE USE → EPI and LEVO, both red. NO VASOCONSTRICTOR | Yagiela JA. *J Am Dent Assoc* 1999;130(5):701-9. PMID 10332135, doi:10.14219/jada.archive.1999.0280 (**A**): "Only in the case of cocaine intoxication must adrenergic vasoconstrictors be avoided completely." Brand HS, Gonggrijp S, Blanksma CJ. *Br Dent J* 2008;204(7):365-9. PMID 18408681, doi:10.1038/sj.bdj.2008.244 (**A**): postpone dental treatment 6–24 h after cocaine use. No hour figure on screen (sources give 6–24 h, > 12 h, ≥ 48 h). Methamphetamine is not shown: verified sources say "with care" / "be cautious" only. |
| 5 | UNCONTROLLED HYPERTHYROIDISM → EPI and LEVO, both red. NO VASOCONSTRICTOR | Little JW. *Oral Surg Oral Med Oral Pathol Oral Radiol Endod* 2006;101(3):276-84. PMID 16504858, doi:10.1016/j.tripleo.2005.05.069 (**A**, re-read at review): "the use of epinephrine or other pressor [amines] can cause a hypertensive crisis in the patient with uncontrolled hyperthyroidism". Levonordefrin is a pressor amine too and is not a substitute (Becker & Reed 2012, **FT**: norepinephrine-like), so both cartridges carry the red sign. "Avoid / no vasoconstrictor" is the conventional inference from that risk (the abstract states the risk, not the word). Counter-evidence: Yagiela 1999 calls the thyroid-hormone interaction evidence "much less compelling". The word "uncontrolled" is on screen; nothing restricts vasoconstrictors in controlled disease. Pheochromocytoma is not shown. |
| 6 | METHEMOGLOBINEMIA RISK → PRILOCAINE cartridge, BENZOCAINE tube, both red. AVOID BOTH | Guay J. *Anesth Analg* 2009;108(3):837-45. PMID 19224791, doi:10.1213/ane.0b013e318187c4b1 (**A**; 242 episodes): "Benzocaine should no longer be used"; prilocaine not in infants < 6 months, pregnancy or with other oxidizing drugs. Citanest Plain Dental label (**L**): contraindicated in congenital or idiopathic methemoglobinemia. Trapp L, Will J. *Dent Clin North Am* 2010;54(4):665-75. PMID 20831930, doi:10.1016/j.cden.2010.06.007 (**A**). These are the agents singled out, not the only ones. |
| 7 | SULFITE ALLERGY → EPI cartridge with a coral "SULFITE" chip, red; PLAIN, green. USE PLAIN | Naftalin LW, Yagiela JA. *Dent Clin North Am* 2002;46(4):733-46. PMID 12436828, doi:10.1016/s0011-8532(02)00021-6 (**A**): "in the patient with true sulfite allergy, local anesthetics without a vasoconstrictor should be used." Becker & Reed 2012 (**FT**): sulfites "are included only in those dental cartridges" that contain a vasopressor. Septocaine label (**L**): contraindicated in sulfite hypersensitivity. Sulfite is not sulfa; asthma alone is not a contraindication (caption / notes only). |
| 8 | PREGNANCY → LIDOCAINE and LIDO + EPI, both green. CONSIDERED SAFE | ACOG Committee Opinion No. 569. *Obstet Gynecol* 2013;122(2 Pt 1):417-22. PMID 23969828, doi:10.1097/01.AOG.0000433007.16843.10 (**G**, opinion PDF read by the research stage; reaffirmed 2017 per the opinion PDF; later status not verified on acog.org): "local anesthesia (lidocaine with or without epinephrine), are safe during pregnancy". ADA Oral Health Topic "Pregnancy" (**G**). Hagai A et al. *J Am Dent Assoc* 2015;146(8):572-80. PMID 26227642, doi:10.1016/j.adaj.2015.04.002 (**A**; cohort, underpowered for rare outcomes). No FDA letter category on screen. |
| Fine print | Conventional precautions, not trial-proven limits · check current references | Becker & Reed 2012 (**FT**): maximum vasopressor doses have not been established. Guimaraes CC et al. *BMJ Open* 2021;11(7):e044357. PMID 34266837, doi:10.1136/bmjopen-2020-044357 (**FT**): 10 small RCTs, certainty low to very low. Panels 3–5 rest on pharmacology, animal / volunteer studies, labels and expert reviews. |
| Source line | Becker & Reed 2012 · Yagiela 1999 · Little 2006 · Guay 2009 · ACOG 2013 | One line, 25 px, author + year only so that every panel has a source on a screenshot: Becker & Reed (panels 1, 2, 7), Yagiela 1999 (4), Little 2006 (5), Guay 2009 (6), ACOG Committee Opinion 569, 2013 (8). Panel 3 rests on Yagiela 1985, Boakes 1973 and the label (caption / here). Journals are in the caption and here. |

PubMed is the source of the bibliographic data and abstracts; DOIs as listed.

## What is schematic
- All pictograms are symbols, not anatomy or product drawings. Cartridges are neutral (no color band is meant as an
  ADA color code; the code table could not be verified) and are identified by printed text only.
- Panel 1: the dashed third cartridge means "about two", not a hard stop. Becker & Reed call a rigid two-cartridge
  rule "naive"; systematic reviews found 1–2 cartridges safe in controlled disease (Seminario-Amez 2021, PMID 34391560).
- Panel 2: BP gauge (dial, tube, inflation bulb) → repeat arrow → dashed cartridge stands for "recheck before the
  next dose". The needle swing is decoration, not a measured pressure rise. "EPI" stands for either vasoconstrictor:
  the interaction is described for epinephrine and levonordefrin (Hersh & Giannakopoulos 2010).
- Panel 3: the ring skeleton on the bottle is a generic dibenzazepine-type tricyclic sketch. "LEVO" = levonordefrin.
- Panel 4: the clock with a backward arrow means "recent"; no time window is implied.
- Panel 5: radiating marks mean "overactive / uncontrolled". Levonordefrin is also a pressor amine; it is not a
  substitute, hence two red signs.
- Panel 6: red drop → brown drop. Guay 2009 (abstract): "Chocolate-colored blood suggests methemoglobinemia but other
  colors may be found." A pictogram, not a diagnostic sign.
- Panel 7: the coral "SULFITE" chip marks the sulfite antioxidant in vasoconstrictor cartridges (sodium or potassium
  metabisulfite, amount varies by brand). It is drawn on an EPI cartridge; levonordefrin cartridges contain it too.
  The rash on the bust is a generic allergy symbol; reported sulfite reactions are mainly bronchospasm (labels:
  "allergic-type reactions including anaphylactic symptoms" and asthmatic episodes). Asthma alone is not a
  contraindication.
- Seat back, tray latch, pocket and the embossed "LITERATURE ONLY" are scenery (the pocket text sits under the Reels
  UI and is decoration).

## Kept off screen (caption / notes only), per RESEARCH.md
Methamphetamine ("with care" only), pheochromocytoma, severe liver disease (labels: use amides with caution; no dental
dose rule), atypical plasma cholinesterase (ester topicals; no articaine claim), MAOIs (no credible interaction),
malignant hyperthermia (MHAUS: all local anesthetics are safe), cocaine time windows, the 30-minute nuance, the 0.2 mg
healthy-adult figure (textbook only), any numeric tricyclic cap. Malamed's *Handbook of Local Anesthesia* was not read
and is not cited for anything on screen.

## Design rationale
- **Amber before red.** The commonest teaching error is "no epi" for cardiac, beta-blocker and tricyclic patients.
  The first three panels are amber, and the legend teaches the three signs in the first two seconds.
- **Lift, then dock, then the next.** A 440×268 slot is small on a phone, so each panel is read at ×1.42 and then
  becomes part of the grid before the next one pops. The grid stops at x = 958, clear of the button column; the index strip to its right carries only decoration
  and (above y = 1100) the handle.
- **One strip, one verdict.** The colored strip is the action; the labelled cartridges with their own signs say the
  same thing in pictures. Titles and strips alone make a complete text study aid for the screenshot.
- **Loop.** The card goes back into the pocket; the header that stays visible is identical at 25.0 s and 0.0 s.

## QA log
- Pass 1 (16 stills + safe overlay): layout verified; amber signs touched the panel border → cartridges shortened,
  signs moved in; scored tablets read as "minus" signs → capsules; hives on the head read as a face → torso only.
- Pass 2: title of panel 5 fitted at 30 px bold with −0.2 px tracking instead of a lighter weight; legend moved fully
  below y = 236; pocket mouth redrawn as a lens (dark corner tabs removed); tube label re-centered.
- Pass 3 (transitions at 0.1 s spacing, hero state of all eight panels, loop frames 24.95 / 0.0): build order sped up so
  the strip is complete 0.75 s before the next panel; step lengthened 2.05 → 2.2 s; sign roll-call ring fixed.
- Pass 4 (review fixes; `_stills/fix`, `fix_a`, `fix_b`, `fix_c`: 10 stills with safe overlay, hero state of all eight
  panels, hand-offs at 3.95 / 4.15 / 4.3 / 11.45 / 11.6 s, loop frames 24.97 / 0.0): bottom-row lift reduced to ×1.36 so
  it clears the strips of row 3; docked panels kept at full contrast until the next pop.
- Console errors: none. Fonts listed in `REEL.fonts`; no late font loads reported by the renderer.

## Review changes (v2, 2026-11-22)
Independent science + design review; all "must" and "should" items applied, nits where cheap.

Science
- **Panel 5** now shows EPI and LEVO, both red, strip **NO VASOCONSTRICTOR** (was a single EPI cartridge, "AVOID
  EPI", which read as if levonordefrin were the alternative). Little 2006 abstract re-read on PubMed: "epinephrine or
  other pressor amines".
- **Caption** rewritten (694 characters): time base for the 0.04 mg figure ("per 30 min", Becker & Reed 2012),
  "Non-selective beta-blockers", "Recent cocaine: defer elective care" (Brand 2008), "aspirate" (moved off screen);
  the legend line, which duplicated the screen, was dropped.
- **Source line** covers every panel on a screenshot: "Becker & Reed 2012 · Yagiela 1999 · Little 2006 · Guay 2009 ·
  ACOG 2013" (journal names and "full refs in caption" removed).
- **Panel 7**: the "SO₃" chip (formula of sulfur trioxide without a charge) became the word "SULFITE"; the "SO₃"
  speech tag on the patient was removed and the bust re-centered.
- Notes added: panel 2 "EPI" stands for either vasoconstrictor; epinephrine with tricyclics is itself disputed;
  rash = generic allergy symbol; ACOG CO 569 "Reaffirmed 2017" per the PDF, later status unverified; "per appointment"
  is the usual board answer (textbook, not read); 1:50,000 / 1:200,000 equivalents.

Design
- **Retimed, text first** (must): constant 2.2 s step replaced by per-panel slots 2.8 / 2.6 / 2.7 / 2.0 / 1.9 / 1.9 /
  1.9 / 2.0 s; the strip wipes in at 0.50 s (was 1.10 s) and is complete by 0.80 s; the outgoing panel docks over the
  last 0.45 s of its slot and the next pops only afterwards. Docked panels dim only when the next panel pops. A lifted
  panel now grows downward and the bottom row lifts ×1.36, so strips of the row above are never covered.
- **Pop-in**: badge and title start with the pop, scale 0.9 → 1 (was 0.7 → 1), pale strip slot from frame 0 (no blank
  white card).
- **Header headroom**: row gap 12 → 8 px, grid top 392 → 404, header band 13 px taller, title baseline 316 → 329,
  legend rows 274 / 313 / 352 (title cap-top ≈ 266, clear of the 3:4 crop line at 240).
- **Titles**: one common size (30 px, −0.2 px tracking, start x 56) instead of panel 5 squeezed alone; the full word
  "HYPERTHYROIDISM" is kept.
- **Less text**: panel 2 strip is one line "SMALL DOSES · RECHECK BP" (40 px); ≈ 61 must-read words (was ≈ 63).
  Duration unchanged (25.0 s).
- Nits: final gloss sweep moved to 18.7–19.6 s (while panel 8 docks), peak alpha 0.42 → 0.20, band 300 → 220 px, so
  the hold is clean; opening sweep 0.6–1.4 s at alpha 0.25; card rise 0.82 → 0.6 s; legend pulse ends at 1.4 s, when
  panel 1 pops; BP dial redrawn with a tube and an inflation bulb instead of two stubs; index-strip chevrons replaced
  by four row ticks.

## Change log
- v1 (2026-11-22): first build from the fact-checked brief.
- v2 (2026-11-22): review fixes (see "Review changes").
- Final QA (2026-11-22, fresh-eyes reviewer): 36 stills with the safe overlay (`_stills/final-qa`: 0 / 0.5 / 1.0 / hero
  state of all eight panels / 19.0 / 19.7 / 21.0 / 23.4 / 24.5 / 24.95 s; `_stills/final-qa-trans`: pops, docks, fine-print
  fade, sign roll-call, exit and loop frames) plus six frames pulled from the rendered MP4. No renderer errors. No
  clipped, overlapping or sub-30 px must-read text; nothing must-read in the no-go zones once the card is up (≈ 0.4 s;
  at frame 0 the header peeks from the pocket at y ≈ 1530–1610, by design, and equals the last frame, so the loop is
  seamless with no ghosting); takeaway card held 19.6–24.26 s; poster (23.4 s) reads inside the 3:4 crop. All 16 PMIDs
  in `meta.json` re-opened on PubMed (author, year, journal, volume, pages and the abstract statements match).
  **No change to the reel source, so the video was not re-rendered** (`reels/out/28-la-medical-conditions.mp4`:
  1080×1920, 30 fps, 750 frames, ffprobe 25.000 s = `REEL.duration`). `meta.json` only: the Little 2006 quotation is now
  verbatim ("pressor ammines [sic]", it had been silently corrected to "amines" inside quotation marks); the caption
  Refs line gives the year of the ACOG opinion ("ACOG CO 569, 2013", matching the on-screen "ACOG 2013"); caption 699
  characters.

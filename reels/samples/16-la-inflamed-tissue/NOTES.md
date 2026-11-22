# 16 · Why local anesthetic struggles in a "hot" tooth

**Style:** kinetic typography. Bebas Neue (display) with Inter (chemistry, captions), on a black / warm-yellow /
off-white palette with one red accent (red = "the problem": heat, acidity, the low % base, "weaker block", ✕,
the ↑ arrow, the BUT… underline). Most of the frame is type: huge words and numbers slam in, scale, rise out of
masks and swap places. The diagrams are kept minimal: a balance, molecules drawn as plain discs, a membrane line
and a pH slider.
**Duration:** 30.0 s · 1080×1920 · 30 fps · silent. Poster = 1.9 s (the hook).
**Files:** `index.html` (page contract), `reel.js` (everything; one 2D canvas, `render(t)` is pure).

## Concept
Most clinicians learn one reason why anesthesia fails in a hot tooth: acidic tissue → ion trapping. The reel first
teaches that reason properly with a live Henderson–Hasselbalch balance. It also says when the reason applies:
when you inject INTO infected tissue (abscess-level acidity). It then turns ("BUT…") to make the honest point. An
IANB is deposited far from the inflamed pulp, so tissue pH alone can't explain IANB failure. Other *proposed*
mechanisms, mostly from lab and animal data, are likely to matter more: TTX-resistant Na⁺ channels, sensitized
nerves that are harder to block even at a distance (cat), and sprouting. The payoff is practical and conservative:
*have a plan B* (supplemental anesthesia), because lip numbness ≠ pulpal anesthesia.

## Storyboard (seconds)
| t | Beat | On screen |
|---|---|---|
| 0.0–2.4 | **Hook** | "HOT" (red, heat haze in the glow only, letters crisp) slams, "TOOTH" slams, "WON'T GO NUMB?" rises; readable by ~0.6 s. Slow push-in. |
| 2.4–2.9 | Yellow band wipe | A fixed-height yellow band (max ~60% of the frame, off-white edges) sweeps up and hides the hook → pKₐ swap. |
| 2.7–5.2 | **pKₐ** | "LIDOCAINE" rises; **"7.9"** slams (camera shake, ghost trails); "pKₐ" slides in. "pH = pKₐ → 50 : 50" (fully visible ~3.7–5.2 s) while the balance draws itself level with 10 charged (white ⊕) vs 10 base (yellow) discs. |
| 5.2–5.8 | Regroup | Hero type shrinks into a header ("LIDOCAINE pKₐ 7.9", "ION TRAPPING · TOY MODEL" tag); balance glides up. Pan labels: CHARGED BH⁺ ✕ barely crosses membranes / BASE B ✓ crosses membranes. |
| 5.8–9.8 | **Only the base crosses** | Headline "ONLY THE **BASE FORM** CROSSES THE MEMBRANE" enters alone (fully visible ~6.45–9.35 s ≈ 2.9 s). Membrane strip enters at 6.5: yellow base discs (r 15) pass through the bilayer and turn back into cations inside the axon; charged discs bounce off (red arc flash). A cation plugs the Na⁺ channel ("BLOCKED"). The headline is fully gone (≈9.8 s) before the counter rises. |
| 9.3–13.1 | **Live pH slide** | Slider arrives at 9.3 ("pH 7.9 = pKₐ"). Counter "50%" (9.8) → knob slides to **pH 7.4 "HEALTHY TISSUE" = 24%** (pulse; held 1.5 s) → red band "ABSCESS PUS pH 6.0–7.3" + "→ if you inject INTO infected tissue" → knob slides to **pH 6.5 = 4%**. Knob shows 2 decimals while moving, so paused frames match the %. Discs hop pan to pan, the balance tips, the counter turns red, fewer discs cross, and the channel label cross-fades to "WEAKER / SLOWER BLOCK" (the plug never fades below 45%). |
| 13.0–16.0 | Payoff 1 | "4%" + "~5–6× LESS BASE / IN ACIDIC TISSUE" (vs. 24% at pH 7.4). |
| 16.0–16.45 | Wipe | Yellow panel from the right (off-white edge); the chapter turns yellow. |
| 16.45–20.6 | **BUT…** | "BUT…" slams (red underline), moves to the top-left. A ruler draws across the full width: "IANB · normal pH here" ←→ "HOT PULP · inflamed · any pH drop is here" (pulsing red dot). "ACIDITY ALONE CAN'T EXPLAIN IANB FAILURE." (fully visible ≈2.6 s). |
| 20.95–25.5 | **Other proposed mechanisms** | Kicker "OTHER PROPOSED MECHANISMS" starts after the caption has gone. 01 TTX-RESISTANT SODIUM CHANNELS ↑ (Naᵥ1.8 / Naᵥ1.9 · less lidocaine-sensitive) · 02 SENSITIZED NERVES (harder to block **at a distance** (cat)) · 03 NERVE SPROUTING. |
| 25.5–25.95 | Wipe | Black panel rises (off-white edge). |
| 25.7–30.0 | **Takeaway** (complete ≈26.85 s, held ≈2.9 s before the 0.25 s fade) | "HOT MANDIBULAR MOLAR? HAVE A **PLAN B.**" + chips: Buccal articaine infiltration · Intraosseous · PDL · Intrapulpal. "Lip numb ≠ pulp numb. IANB alone: ~25–28% success in hot mandibular molars." The footer defines the population and success, and gives supplemental success rates and premedication. A 0.25 s fade to black lets the loop restart cleanly on the black hook. |

Handle: `@natebrooksendo` sits in the masthead (top right, 24 px) through the whole reel. Masthead text:
"LOCAL ANESTHESIA × THE HOT TOOTH" (22 px). The masthead and footer change colour where the panel is yellow,
clipped exactly to the wipe edge.

## On-screen claims and sources
| Claim on screen | Source / verification |
|---|---|
| Lidocaine pKₐ 7.9 (hero/header); footer: "pKa ≈ 7.7–7.9 in texts; measured 7.6 (36 °C) to 8.1 (26 °C, saline)" | Sanchez V, Arthur GR, Strichartz GR. *Anesth Analg* 1987;66:159–65. PMID 3813059: pKa 7.61 ± 0.06 at 36 °C and 7.94 at 26 °C in water; 8.06 at 26 °C in 0.165 M NaCl; 8.28 with buffer. Becker DE, Reed KL. *Anesth Prog* 2006;53:98–108. PMID 17175824, DOI 10.2344/0003-3006(2006)53[98:EOLAP]2.0.CO;2 (7.9). Dental texts (e.g. Malamed) list 7.7. The reel uses 7.9 as a textbook value and gives the 7.7 result in the footer. |
| pH = pKₐ → 50 : 50 | Definition of pKa (Henderson–Hasselbalch). |
| "✕ barely crosses membranes" (cation) / "✓ crosses membranes" (base); footer "thousands of times less lipid-soluble" | Sanchez 1987 (above): octanol:buffer partition coefficient of the cation 0.55–0.75 vs the neutral base 2666–3210, i.e. ~4,000–5,000×. Strichartz GR et al. *Anesth Analg* 1990;71:158–70. PMID 2375517, DOI 10.1213/00000539-199008000-00008. |
| Only the base form crosses; inside the axon the cation re-forms and blocks the Na⁺ channel | Becker & Reed 2006 (above); standard LA pharmacology. The headline "ONLY…" is the usual teaching simplification; the pan label carries the nuance ("barely"). |
| % base: 50% (7.9) → 24% (7.4) → 4% (6.5); "~5–6× LESS BASE IN ACIDIC TISSUE"; footer "with pKa 7.7: 33% vs 6%" | Computed: f = 1/(1+10^(pKa−pH)). pKa 7.9 gives 24.0% and 3.83% (ratio 6.3); pKa 7.7 gives 33.4% and 5.9% (ratio 5.6), hence "~5–6×". Labelled "TOY MODEL" on screen. |
| "ABSCESS PUS pH 6.0–7.3" + "→ if you inject INTO infected tissue" | Nekoofar MH et al. *Int Endod J* 2009;42:534–8. PMID 19460003, DOI 10.1111/j.1365-2591.2009.01550.x: pus from periapical abscesses, mean pH 6.68 ± 0.32, range 6.0–7.3, n = 40. That is a necrotic/abscess setting, so the reel says explicitly that this case applies to injecting into infected tissue, not to a hot vital molar. The knob stops at 6.5 (inside the range, near the mean). |
| Footer: "Inflamed tissue: ~0.5 pH fall, more buffering (rat; Punnia-Moorthy 1987/88); in-vivo role debated" | Punnia-Moorthy A. *J Oral Pathol* 1987;16:36–44. PMID 2435877, DOI 10.1111/j.1600-0714.1987.tb00674.x (~0.5 pH-unit fall in rat inflammation models). Punnia-Moorthy A. *Br J Anaesth* 1988;61:154–9. PMID 3415887, DOI 10.1093/bja/61.2.154 (buffering capacity *increased* in inflamed rat skin). Under the toy model a 0.5-unit fall (pH ≈ 6.9) leaves ~9% base, ~2.6× less: it is not shown as a tick, but this is why the footer says "debated". |
| Membrane: "WEAKER / SLOWER BLOCK" at low pH (plug never disappears) | Toy-model wording. A cartridge of 2% lidocaine is ~74 mM, far above the channel Kd (50–200 µM; Roy & Narahashi 1992), so less base predicts a slower or weaker block, not no block. |
| Ruler: "IANB · normal pH here" ←→ "HOT PULP · inflamed · any pH drop is here"; "ACIDITY ALONE CAN'T EXPLAIN IANB FAILURE." Footer: "Schematic, not to scale…" | Hargreaves KM, Keiser K. *Endodontic Topics* 2002;1:26–39 (not PubMed-indexed; this is the classic statement of the argument). See also Drum M et al. *JADA* 2017;148:267–71. PMID 28190451, DOI 10.1016/j.adaj.2017.01.002: review of IANB in SIP. Its abstract does not itself state the distance argument; it is cited as the indexed review. The anatomy (deposition near the mandibular foramen) is standard. No human measurement of pulp tissue pH in irreversible pulpitis was found, so the pulp label no longer says "acidic". |
| "OTHER PROPOSED MECHANISMS" (heading); footer "Proposed mechanisms; largely lab/animal data" | Wording reflects the evidence level: small human tissue series plus animal physiology (below). |
| 01 TTX-resistant Na⁺ channels ↑: Naᵥ1.8 / Naᵥ1.9 | Renton T et al. *BMC Oral Health* 2005;5:5. PMID 16001984, DOI 10.1186/1472-6831-5-5 (Nav1.8 ↑ in painful human pulp). Wells JE et al. *J Endod* 2007;33:1172–6. PMID 17889684, DOI 10.1016/j.joen.2007.05.023 (Nav1.9 ↑; "might contribute"). Warren CA et al. *J Endod* 2008;34:7–10. PMID 18155483, DOI 10.1016/j.joen.2007.09.014. Footer: "(human pulp)". |
| "less lidocaine-sensitive"; footer "TTX-R ~4× less sensitive to tonic lidocaine block (rat DRG; Roy & Narahashi 1992)" | Roy ML, Narahashi T. *J Neurosci* 1992;12:2104–11. PMID 1318956, DOI 10.1523/JNEUROSCI.12-06-02104.1992: lidocaine Kd 50 µM (TTX-S) vs 200 µM (TTX-R). TTX-R currents also showed marked use-dependent block, so "tonic" is specified. |
| 02 Sensitized nerves: "harder to block at a distance (cat)" | Modaresi J et al. *J Endod* 2008;34:438–41. PMID 18358891, DOI 10.1016/j.joen.2008.01.014 (cat; anaesthesia at the mandibular nerve was "markedly more difficult" to block on the inflamed side). Wallace JA et al. *Oral Surg Oral Med Oral Pathol* 1985;59:517–21. PMID 3859810, DOI 10.1016/0030-4220(85)90095-7 (cat; with the mandibular nerve regionally blocked, cortical response rose as the pulp was inflamed). Background: Henry MA, Hargreaves KM. *Dent Clin North Am* 2007;51:19–44. PMID 17185058, DOI 10.1016/j.cden.2006.09.007. This line is the bridge from "the IANB is far away" to "the nerve itself changes". |
| 03 Nerve sprouting (heading only) | Byers MR et al. *J Endod* 1990;16:78–84. PMID 2388022, DOI 10.1016/S0099-2399(06)81568-2 (**rat**: CGRP fibre sprouting near inflamed and abscessed pulp). Rodd HD, Boissonade FM. *J Dent Res* 2001;80:389–93. PMID 11269734, DOI 10.1177/00220345010800011601 (**human**: pulpal innervation density increases with caries but did *not* correlate with reported pain). Footer: "Byers 1990 (rat); Rodd & Boissonade 2001 (human carious teeth)". Shown only as a proposed mechanism. |
| "IANB alone: ~25–28% success in hot mandibular molars"; "Lip numb ≠ pulp numb". Footer: "Fowler et al., J Endod 2016: n = 375, symptomatic irreversible pulpitis; success = no/mild pain on access" | Fowler S, Drum M, Reader A, Beck M. *J Endod* 2016;42:390–2. PMID 26831048, DOI 10.1016/j.joen.2015.12.025. Retrospective pool of 6 Ohio State studies, n = 375 SIP patients, all with profound lip numbness. Success = no or mild pain (VAS ≤ 54 mm) on access and instrumentation. IANB success: 28% first molars, 25% second molars. Other trials report different rates. |
| Chips: buccal articaine infiltration, intraosseous, PDL, intrapulpal. Footer: "Supplemental success varies: buccal articaine ~42–58%, intraosseous ~88%" | Fowler 2016 (above): supplemental articaine 42% (first molars) and 48% (second molars). Matthews R et al. *J Endod* 2009;35:343–6. PMID 19249592, DOI 10.1016/j.joen.2008.11.025: 58% in mandibular posterior teeth after a failed IANB. Nusstein J et al. *J Endod* 1998;24:487–91. PMID 9693577, DOI 10.1016/S0099-2399(98)80053-8: supplemental IO 88%. PDL/intrapulpal: Parirokh M, Abbott PV. *Int Endod J* 2022;55 Suppl 4:951–94. PMID 35119117, DOI 10.1111/iej.13697. Drum 2017 (above). |
| Footer: "Pre-op NSAID may also help (Pulikkotil, IEJ 2018)" | Pulikkotil SJ et al. *Int Endod J* 2018;51:989–1004. PMID 29480930, DOI 10.1111/iej.12912: network meta-analysis of 19 RCTs; NSAIDs RR 1.92 and dexamethasone RR 2.92 vs placebo for IANB success in irreversible pulpitis. |

**Dropped from the brief:** "anxiety" as a listed cause. The PubMed evidence I found is weak or mixed, so it isn't shown.

## Schematic and modelled elements (said on screen)
- Header tag "ION TRAPPING · TOY MODEL" (22 px). S3a footer: "Schematic, not to scale". S3b footer: "Toy model…
  in-vivo role debated". S4 footer: "Schematic, not to scale" (the ruler's graduations are decorative).
- The balance holds 20 discs. The number in each pan is the rounded base fraction × 20, so at pH 6.5 one base disc
  remains (centred: pyramid rows 7-5-4-3-1 fill from the centre out). The tilt (max 13°) is illustrative.
- Membrane particles: the crossing rate is proportional to the base fraction at spawn time. Channel-plug opacity
  = 0.45 + 0.55 · f(pH)/f(7.4); the label cross-fades from BLOCKED to WEAKER / SLOWER BLOCK below ~pH 7.0.

## Design rationale
- **Type-first.** Each beat has one hero word or number (HOT TOOTH → 7.9 → BASE FORM → 24% / 4% → BUT… →
  PLAN B.). Entrances are staggered so only one thing arrives at a time: the headline alone, then the membrane,
  then the slider just before it moves.
- **Chemistry typography:** Bebas Neue is caps-only, so every chemistry symbol (pKₐ, pH, BH⁺, Na⁺, Naᵥ1.8) is set
  in Inter with drawn sub/superscripts. Arrows, ✓/✕ and ≠ are vectors.
- **Colour logic:** yellow = drug / base / emphasis, white = text and charged form, red = the problem only. Wipe
  edges are off-white.
- **Motion vocabulary:** slams (scale-down with undershoot, ghost trails, decaying camera shake), mask-rise reveals,
  highlight-bar sweeps that leave with their word, panel wipes, molecules hopping between pans on parabolic arcs,
  one pulse on the 24% baseline.
- **Texture:** static film grain and a soft vignette on the black chapters; heat haze only in the glow of "HOT".
- **Safe area:** all readable text lies within x 64–1016, y 230–1580; lines at y > 1100 stop at x ≤ 960. Must-read
  labels are ≥ 30 px. Fine print is 22 px, wrapped at 890 px, up to 4 lines.

## QA log
- Pass 1: fixed the separate highlight bars for BASE/FORM, 3-line footers colliding with the membrane labels, the
  "BUT…" kicker overlapping the ellipsis, an ambiguous "= pKa" marker under 8.0, and the empty band above the balance.
- Pass 2: wipe 1 reveals S2 instead of the hook. The pan labels no longer blink during the regroup. Moved "NUMB?"
  and "EXPLAIN IANB FAILURE." out of the IG button column. Retimed for reading.
- Pass 3: separated the S4 ruler/caption exit from the list entry. Checked the rendered MP4 frames and the poster.
- Review pass: see below.

## Review changes (independent science + design review)
Science
- **Pulp label no longer asserts acidity.** "inflamed · acidic" → "inflamed · any pH drop is here". No human pulp-pH
  data in irreversible pulpitis were found; the footer keeps Punnia-Moorthy's ~0.5-unit fall / increased buffering (rat).
- **Ion-trapping case is now scoped.** "→ if you inject INTO infected tissue" appears with the abscess band. The
  payoff reads "~5–6× LESS BASE / IN ACIDIC TISSUE" (was "6× LESS BASE / TO GET IN").
- **pKa range made honest.** S2 footer: "pKa ≈ 7.7–7.9 in texts; measured 7.6 (36 °C) to 8.1 (26 °C, saline)"
  (Sanchez 1987, re-checked on PubMed). S3b footer: "with pKa 7.7: 33% vs 6%". Payoff "~5–6×".
- **Block no longer vanishes.** Plug opacity floor 0.45; "BLOCKED" cross-fades to "WEAKER / SLOWER BLOCK" (red).
- **Logic gap bridged.** Item 02 subline: "harder to block at a distance (cat)" (Modaresi 2008; Wallace 1985;
  both re-read on PubMed). It answers "why would pulp changes matter if the IANB is far away?".
- **Evidence level stated.** Heading "OTHER PROPOSED MECHANISMS"; footer starts "Proposed mechanisms; largely
  lab/animal data", with species for every source: human pulp, rat DRG, cat, rat. TTX-R "~4× less sensitive to
  *tonic* lidocaine block".
- **Sprouting corrected.** Footer "Byers 1990 (rat); Rodd & Boissonade 2001 (human carious teeth)". (The earlier
  NOTES wrongly said the footer had "(rat)".) The subline was removed (design word budget).
- **Takeaway qualified.** End footer defines Fowler 2016's population (SIP, n = 375) and success (no/mild pain on
  access). It gives supplemental success (articaine ~42–58%, IO ~88%) and premedication (Pulikkotil 2018).
  "SIP" no longer appears undefined on screen: "in hot mandibular molars".
- Nits: pKₐ drawn with a subscript a; Naᵥ1.8 / Naᵥ1.9; "INSIDE THE AXON"; "barely crosses membranes"; "not to
  scale" on the ruler footer; Drum JADA 2017 added as an indexed review next to Hargreaves & Keiser; knob label
  shows 2 decimals while moving.

Design
- **Counter/headline collision fixed.** The headline is fully out (≈9.8 s) before the counter rises (9.77 s,
  in its own lower mask). Checked at 9.6 / 9.7 / 9.72 / 9.85 s: no overprint. The highlight bar now leaves with
  its word (no leftover yellow stub).
- **Reading time.** DUR 26 → 30 s (SPEC max; over the brief's 22–26 s; see weaknesses). 50 : 50 held ~1.5 s; 24%
  held 1.5 s with a pulse; headline ~2.9 s alone; payoff ~2.6 s; ruler block +0.8 s (caption ~2.6 s); list window
  4.45 s, with the kicker starting only after the caption has left. End card complete ≈26.85 s, held ≈2.9 s before
  the fade.
- **Word cuts.** Item 01 subline is one line; item 03 subline deleted; item 02 subline is the 7-word science
  bridge; the end-card kicker "SUPPLEMENTAL ANESTHESIA OPTIONS" was deleted (numbers moved to fine print).
- **Membrane legible on a phone.** Labels 22 → 30 px; molecules r 10 → 15; spawn interval 0.074 → 0.15 s over a
  wider x-range; channel subunits 30×68 → 44×96; plug r 9 → 14; red 6 px arc flash for bounces; the status label
  cross-fades instead of fading out. Particles now start at y 1284, below the counter (baseline 1255, 280 px).
- **Staggered entrances.** Headline alone at 5.8 s; membrane at 6.5 s; slider at 9.27 s, just before it moves.
- **Small labels raised.** Slider band/healthy labels 26 → 30 px; header tag 20 → 22 px.
- **HOT crisp.** The haze distorts only the blurred glow layer; the letters are one crisp drawImage (poster
  checked at 100%).
- Nits: balance slots fill centre-out (lone base disc centred), tilt 16° → 13° (more room above the pan labels);
  wipe 1 is a fixed-height band (never a full-frame yellow flash); take-away rises as the black panel's edge passes
  (T.take = w3 + 0.2); wipe edges off-white (red kept for the problem; BUT… underline kept red as problem framing);
  masthead "LOCAL ANESTHESIA × THE HOT TOOTH".
- Render: `reels/out/16-la-inflamed-tissue.mp4`. ffprobe: 30.000 s, H.264 1080×1920 @ 30 fps (900 frames) plus a
  silent AAC track, 12.0 MB; no console errors. Poster `reels/out/16-la-inflamed-tissue.jpg` (t = 1.9 s). Frames decoded
  from the MP4 at 2.65 / 9.75 / 14.0 / 18.8 / 27.5 s match the stills.

## Final QA (fresh-eyes pass)
- Stills at 38 times (`_stills/final-qa`, `_stills/final-qa-b`: hook 0–1.9 s, every transition, the end hold, 29.95 s
  loop frame) with `--safe`. No clipped, overlapping or tofu text, no NaN. Must-read text stays inside x 64–1016 /
  y 230–1580, and stops at x ≤ 960 below y 1100. Only decoration (pan rim, lipid row, ruler dot) reaches the button
  column. Hook readable by ~0.4 s. The takeaway is held ~2.9 s, and the 0.25 s fade loops cleanly into the black opening.
- Science: re-checked on PubMed the numbers behind every on-screen claim: Fowler 2016 (28% / 25%, n = 375), Roy &
  Narahashi 1992 (Kd 50 vs 200 µM), Nekoofar 2009 (6.0–7.3, mean 6.68), Matthews 2009 (58%), Nusstein 1998 (88%),
  Sanchez 1987, Punnia-Moorthy 1987/88, Modaresi 2008, Wallace 1985, Renton 2005, Wells 2007, Warren 2008, Byers 1990,
  Rodd & Boissonade 2001, Pulikkotil 2018, Drum 2017 and Parirokh & Abbott 2022. All match. No overstatement found.
- MP4 unchanged: ffprobe 30.000 s (= REEL.duration), 900 frames. It was rendered after the last source edit, and
  frames decoded at 11.2 / 21.4 / 28.0 s match the stills. Poster (1.9 s hook) reads fully inside the 3:4 crop.
- No reel changes were needed. Added `meta.json` (gallery metadata, claims in on-screen order, caption).

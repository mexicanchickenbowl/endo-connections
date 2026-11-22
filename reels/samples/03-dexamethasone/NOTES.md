# 03 · How dexamethasone turns down inflammation (genomic mechanism)

> **Note:** the "Review changes" section at the end supersedes the storyboard, timings, captions and Fig. 3 wording below where they differ (title, HSP90 model, gene-switch wording, Fig. 3 labels, endodontic line, duration 29.5 s).

**Output:** `reels/out/03-dexamethasone.mp4` (29.5 s, 1080×1920, 30 fps, 885 frames). Poster `reels/out/03-dexamethasone.jpg` (t = 18.5 s, the enlarged nucleus with every switch set).
**Files:** `index.html` is the page shell. `reel.js` holds all the drawing: one 2D canvas and a deterministic `render(t)`, with no Date, Math.random or rAF.

## Style
**A plate from a classic medical atlas, being annotated as you watch.**
- **Paper.** Warm cream laid paper is generated once in `setup()`: low-frequency mottling, per-pixel grain, faint chain lines, fibres, foxing spots and an intaglio plate mark.
- **Ink.** Every structure has a fine sepia-black pen outline that draws itself on in the opening. The shadow side of the cell and nucleus is engraving-style hatching, done as a shadow crescent clipped with even-odd.
- **Watercolour.** Fills use three jittered translucent layers, a pale bloom, a darker pooled edge and multiply-blended pigment granulation. Faint back-runs sit in the cytoplasm and nucleus. Ink and wash are slightly out of register on purpose, as in hand-coloured plates.
- **Type.** EB Garamond only: a roman and italic title, small-caps labels and italic captions.
- **Plate furniture.** The header reads "PLATE III". Each figure has a caption ("Fig. 1 / Fig. 2 / Fig. 3"). Numbered circular markers on leader lines follow the order of the key in the caption bar. The circular **"enlarged detail" inset** of the nucleus is the classic atlas magnifier. A fleuron ornament sits under the title.
- **Palette.**
  - cream paper
  - sepia ink
  - vermilion: dexamethasone, the "STEROID" blocks
  - slate-indigo: GR, the NSAID block
  - ochre: HSP90
  - haematoxylin-violet: nucleus
  - rose: inflamed cytoplasm, which cools to straw
  - verdigris: genes switched ON and their products
  - madder: inflammatory genes, NF-κB and mediators
  - plum: AP-1

## Storyboard (seconds)
| t | Caption: bold title + italic sub (fully visible ≥ Kit.readSecs) | Visual |
|---|---|---|
| 0–2.0 | Title **How dexamethasone / *switches off inflammation*** is on screen from frame 0 (hook) | The cell plate inks itself in: bilayer membrane, nucleus with pores and chromatin stipple, ER, Golgi, mitochondria, vesicles. Watercolour washes bleed in. Three inactive GR–HSP90 complexes sit in the cytoplasm. Mediators (cytokine blobs and prostaglandin skeletons) bud off the upper-right membrane ("inflammatory mediators"). Three dexamethasone molecules (drawn as the four-ring steroid skeleton) appear outside ("Dexamethasone"). |
| 2.0–5.2 | ① **Slips through the membrane** / *lipophilic steroid* | The molecules drift in along dotted ink trails. Phospholipid heads part as each one crosses the bilayer. Marker ① sits on a leader to the crossing point. |
| 5.2–8.7 | ② **Binds GR; HSP90 lets go** / *glucocorticoid receptor* | Each molecule docks in a GR pocket (ink spark marks) and the GR darkens (activated). The two HSP90 protomers swing away and fade. Labels: GR, HSP90. Fine print: "Classic model; newer data suggest chaperones also help GR into the nucleus." |
| 8.7–11.6 | ③ **Enters the nucleus** / *drug–receptor complex* | Activated complexes travel along dotted trails to nuclear pores. Marker ③ points at a pore. From 10.7 s a circular inset grows out of the nucleus (2.05× magnification) and the rest of the plate is ghosted. |
| 11.6–15.1 | ④ **Anti-inflammatory genes ON** / *transactivation via GREs* | Fig. 2 shows the nucleus enlarged, with two DNA helices. Two GRs pair as a dimer on the vermilion **GRE**. Dotted signal arcs reach the gene "switches" (small brass toggle plates with a lamp). **annexin A1** then **MKP-1** flip ON (verdigris), and mRNA squiggles rise from them. Group label: *anti-inflammatory genes*. |
| 15.1–18.6 | ⑤ **Inflammatory genes OFF** / *transrepression: NF-κB, AP-1* | The third GR complex enters through a pore and tethers onto **NF-κB** and **AP-1**, which grey out. Dotted arcs reach **COX-2, IL-1β, TNF-α, IL-6**: each switch flips OFF, its lamp greys and its label is struck through. Group label: *inflammatory genes*. |
| 18.6–22.1 | ⌛ **Mediator output falls** / *over hours, not minutes* | The inset closes back into the nucleus. Mediator budding tapers off and the remaining particles fade. The cytoplasm wash cools from rose to straw. Verdigris dots (new anti-inflammatory proteins) appear. A brass pocket-watch sweeps about four hours ("hours"), and the hourglass in the badge empties. The figure caption becomes "Fig. 1 — the same cell, hours later". Fine print: "Rapid non-genomic steroid effects also exist (not shown)." |
| 22.1–28.0 | ❖ **Acts upstream of NSAIDs** / *a gene-level brake on inflammation* (takeaway, fully visible 22.4–28.0 = 5.6 s) | The cell ghosts under fresh paper and the Fig. 3 frame inks itself on: *Membrane phospholipids →(PLA₂)→ Arachidonic acid →(COX-2)→ Prostaglandins (pain · swelling)*. Blocks appear in this order: **STEROID** at PLA₂ (*partly via annexin A1*), **STEROID** at COX-2 (*less COX-2 made*), **NSAID** at COX (*blocks COX activity*), and an "upstream" arrow. Below: **In endodontics** *systemic corticosteroids reduced post-op pain at 6–24 h in a meta-analysis of 29 RCTs*, with "Alajlan et al., J Endod 2024 · moderate-certainty evidence". Sources line at the bottom. |

**Persistent elements:**
- `@natebrooksendo` sits in the plate header, top right, in 28 px italic.
- Fine print at y = 1560 (23 px) reads "Schematic · not to scale · cell types and timings simplified" unless a per-step caveat replaces it.
- All readable text is inside x 64–1016 and y 230–1580, and stays clear of the right-hand column for y > 1100 (checked with `--safe`).

**Caption reading windows** (fully visible time vs `Kit.readSecs`):
| Step | Visible | readSecs |
|---|---|---|
| ① | 2.72 s | 2.62 s |
| ② | 3.02 s | 2.92 s |
| ③ | 2.42 s | 2.32 s |
| ④ | 3.02 s | 2.62 s |
| ⑤ | 3.02 s | 2.62 s |
| ⌛ | 3.02 s | 2.92 s |
| Takeaway | 5.6 s | 3.5 s |

The fades are 0.28 s in and 0.20 s out.

## On-screen claims and sources
All were retrieved via PubMed and checked against abstracts. Quotes from Cain & Cidlowski come from the PMC full text.

1. **"Slips through the membrane / lipophilic steroid"** (passive diffusion to a cytosolic receptor):
   - Cain DW, Cidlowski JA. *Immune regulation by glucocorticoids.* Nat Rev Immunol 2017;17:233-47. PMID 28192415, doi:10.1038/nri.2017.1. Quote: "Lipophilic glucocorticoids diffuse through cell membranes to bind cytosolic glucocorticoid receptors".
   - Rhen T, Cidlowski JA. NEJM 2005;353:1711-23. PMID 16236742, doi:10.1056/NEJMra050541.
   - Stahn C, Buttgereit F. Nat Clin Pract Rheumatol 2008;4:525-33. PMID 18762788, doi:10.1038/ncprheum0898. Effects are "mediated primarily by the cytosolic glucocorticoid receptors".
2. **"Binds GR; HSP90 lets go"**:
   - Pratt WB, Toft DO. *Steroid receptor interactions with heat shock protein and immunophilin chaperones.* Endocr Rev 1997;18:306-60. PMID 9183567, doi:10.1210/edrv.18.3.0303. Quote: "hormone binding promoted dissociation of the receptor from hsp90 and conversion of the receptor to the DNA-binding state".
   - **Caveat shown on screen:** Cain & Cidlowski 2017 note this is the *classical* view and that "recent studies… provide evidence that glucocorticoid receptor chaperones are important for the nuclear import of the glucocorticoid receptor".
3. **"Enters the nucleus"**:
   - Vandevyver S, et al. Endocrinology 2013;154:993-1007. PMID 23384835, doi:10.1210/en.2012-2045. Quote: "Upon ligand binding, the GR translocates to the nucleus".
   - Cain & Cidlowski 2017.
4. **"Anti-inflammatory genes ON / transactivation via GREs"; GR dimer on a GRE**:
   - Cain & Cidlowski 2017: "Glucocorticoid receptor homodimers bind glucocorticoid response elements (GREs) … to enhance gene expression".
   - Vandevyver et al. 2013.
   - **annexin A1** is GC-induced: Perretti M, D'Acquisto F. Nat Rev Immunol 2009;9:62-70. PMID 19104500, doi:10.1038/nri2470. Also Cain & Cidlowski 2017.
   - **MKP-1 (DUSP1)** is induced by dexamethasone and required for part of its anti-inflammatory effect: Abraham SM, et al. J Exp Med 2006;203:1883-9. PMID 16880258, doi:10.1084/jem.20060336.
5. **"Inflammatory genes OFF / transrepression: NF-κB, AP-1"**, with GR tethering NF-κB/AP-1:
   - Ray A, Prefontaine KE. PNAS 1994;91:752-6. PMID 8290595, doi:10.1073/pnas.91.2.752. Physical GR–p65 association; dex-activated GR inhibits IL-6 promoter activation.
   - Scheinman RI, et al. Mol Cell Biol 1995;15:943-53. PMID 7823959, doi:10.1128/MCB.15.2.943. Dex/GR inhibits NF-κB. The same GR domain is needed for AP-1 repression.
   - Cain & Cidlowski 2017 describe "tethering" to NF-κB and AP-1.
   - Barnes PJ. Br J Pharmacol 2006;148:245-54. PMID 16604091, doi:10.1038/sj.bjp.0706736. GR suppresses multiple inflammatory genes driven by NF-κB/AP-1.
   - The genes shown are documented dex/GR targets:
     - **COX-2:** Masferrer JL, et al. J Pharmacol Exp Ther 1994;270:1340-4 (PMID 7932188), and Masferrer et al. PNAS 1994;91:3228-32 (PMID 8159730, doi:10.1073/pnas.91.8.3228). Dex suppresses COX-2 but not COX-1.
     - **TNF, IL-1β, COX-2:** Abraham et al. 2006.
     - **IL-6:** Ray & Prefontaine 1994.
6. **"Mediator output falls / over hours, not minutes"** (genomic effects lag by hours):
   - Lösel R, Wehling M. Nat Rev Mol Cell Biol 2003;4:46-56. PMID 12511868, doi:10.1038/nrm1009. Quote: "effects… mediated by the modulation of gene expression are known to occur with a time lag of hours or even days".
   - Cain & Cidlowski 2017: "genomic effects of glucocorticoids typically manifest over a period of hours".
   - Caveat on screen: rapid non-genomic effects exist (Buttgereit F, Scheffold A. Steroids 2002;67:529-34. PMID 11960631, doi:10.1016/s0039-128x(01)00171-4).
7. **Fig. 3 pathway: "STEROID at PLA₂, partly via annexin A1"**:
   - Cain & Cidlowski 2017: GR "activates the expression of annexin A1, which interferes with the phospholipase A2-catalysed release of arachidonic acid".
   - Croxtall JD, et al. Biochem Pharmacol 1996;52:351-6. PMID 8694860, doi:10.1016/0006-2952(95)02442-5. Dex blocks cPLA2 activation via lipocortin 1 (annexin A1).
   - Parente L, Solito E. Inflamm Res 2004;53:125-32. PMID 15060718, doi:10.1007/s00011-003-1235-z.
   - Worded *"partly"* because annexin A1 is only one route; MKP-1 and other routes also contribute.
8. **"STEROID: less COX-2 made" / "NSAID: blocks COX activity"; "Acts upstream of NSAIDs"**:
   - COX-2 expression is suppressed by dex: Masferrer 1994 (above). Cain & Cidlowski 2017: "Glucocorticoids further curb prostaglandin generation by inhibiting cyclooxygenase 2".
   - NSAIDs inhibit COX enzyme activity: Vane JR. *Inhibition of prostaglandin synthesis as a mechanism of action for aspirin-like drugs.* Nat New Biol 1971;231:232-5. PMID 5284360.
   - "Upstream" means upstream *on this pathway* (PLA₂ step and COX-2 expression vs COX activity). It is not a claim of clinical superiority.
9. **"A gene-level brake on inflammation"** summarises claims 4–6 (Barnes 2006; Cain & Cidlowski 2017).
10. **"In endodontics: systemic corticosteroids reduced post-op pain at 6–24 h in a meta-analysis of 29 RCTs · moderate-certainty evidence"**:
    - Alajlan N, Carrasco-Labra A, Karabucak B, Lee SM. *Systemic Corticosteroid Uses in Endodontics—Part 1: Managing Postoperative Pain.* J Endod 2024;50:724-34. PMID 38490301, doi:10.1016/j.joen.2024.03.004.
    - Their findings: 29 trials, 2303 participants; less likely to report pain and lower intensity at 6, 12 and 24 h. Conclusion: "Moderate certainty evidence indicates that the use of systemic corticosteroids likely results in a moderate to large reduction in postoperative endodontic pain".
    - Supporting:
      - Shamszadeh S, et al. J Endod 2018;44:1057-65. PMID 29709296, doi:10.1016/j.joen.2018.03.010. 18 RCTs.
      - Nath R, et al. J Dent Anesth Pain Med 2018;18:205-21. PMID 30186968, doi:10.17245/jdapm.2018.18.4.205. Effect clear at 4–8 h, not significant at 24 h; low/moderate quality.
    - Nuance kept off screen: Zanjir M, et al. J Endod 2020;46:1387-402 (PMID 32668310, doi:10.1016/j.joen.2020.07.002) found corticosteroids given *after* treatment did not significantly reduce pain in their network meta-analysis. Most positive trials gave the steroid before or during treatment. The on-screen line therefore states only the pooled finding and its certainty, and gives no dosing advice.

## What is schematic / exaggerated
- **Sizes are not to scale.** Molecules are huge relative to the cell. GR complexes shrink as they pass a pore so the dimer fits the enlarged view. Pores are drawn as simple cream rings.
- **Counts are illustrative.** Three drug molecules and three receptors stand in for many. The two DNA helices are a diagrammatic stand-in for chromatin. One GRE dimer is shown driving two genes. The gene "switches" are a metaphor.
- **Timing is compressed.** Seconds on screen stand for minutes to hours. The pocket-watch sweep (~4 h) is illustrative, not a pharmacokinetic value.
- **Cell type is unspecified** (any GR-expressing inflammatory cell). The mediator particles (cytokines and prostaglandins budding from one membrane patch) are stylised.
- **The two arms are simplified.** The old "transactivation = side effects, transrepression = benefit" dogma is deliberately *not* shown: Vandevyver et al. 2013 review evidence that GR-dimer transactivation also matters for anti-inflammatory effects. Other repression routes (e.g. HDAC2 recruitment, Barnes 2006; IκBα and GILZ induction) are omitted.
- **Fig. 3** is a simplified eicosanoid pathway (phospholipids → AA → PGs). Leukotrienes and other branches are omitted.

## Corrections to the brief
- The brief said "HSP90 dissociates". That is kept as the classic model, flagged on screen in the fine print and described with its nuance above.
- The brief said "annexin A1 inhibits PLA₂". It is worded as *"partly via annexin A1"*: the mechanism is real but is one of several, and annexin A1 also acts through FPR2/ALX.
- **Endodontic relevance** is phrased as a pooled meta-analytic finding with its GRADE certainty, not as a recommendation.

## Design rationale
- **Why an atlas plate?** It makes the mechanism feel authoritative and handmade, and very different from the flat or neon styles of the other samples. The numbered key in the caption bar mirrors atlas legends, so viewers can map ① to ⑤ onto the figure.
- **Why a magnifier inset?** It is how anatomy atlases show detail. The base figure ghosts while it is open, so there is a single focal point.
- **One colour per role**, kept consistent across all three figures. Vermilion always means drug or steroid action, and verdigris always means switched ON.
- **Gene "switches"** make transactivation and transrepression readable with no sound. Lever, lamp and label colour all change, and the OFF labels are struck through.
- **The payoff turns mechanism into practice.** Fig. 3 places the steroid blocks above the NSAID block, so "upstream" is visible. It is followed by the endodontic evidence line.
- **The title is constant** at the top of every frame, so the hook is readable at frame 0 and the loop joins cleanly from the takeaway back to the opening.

## QA log
- Pass 1: actors too small; base cell showed through around the inset; OFF labels unreadable on the violet; marker ② pointed at an empty spot; ghost labels showed under the panel. All fixed.
- Pass 2: bigger dex, GR and HSP90 glyphs; dotted motion trails; base plate ghosted under the inset; paler nucleus inside the inset; paper "tablets" behind inset labels; bigger switches; GR3 now enters at step ⑤; panel re-laid out (labels clear of bars and the frame).
- Pass 3: HSP90 label moved off the membrane and a vesicle; hourglass badge for the result step (the earlier quatrefoil read as a red "×"); title visible from frame 0 with inking starting earlier; sequential Fig. 1 caption swap; per-step caveat fine print.
- Checked: `--safe` overlay, closely spaced `--times` around the inset open/close (10.9–12.1, 18.9–19.3) and the panel build (22.3–24.9), and full-resolution stills of every caption change. No console errors. ffprobe duration is 28.000 s.

## Review changes (independent science + design review, pass 4)
All 17 must/should issues were applied, plus every nit. New timeline: **DUR 29.5 s** (was 28 s). The extra time pays for the longer, more accurate captions and a payoff panel that holds for at least 4 s.

### Science
1. **Dexamethasone glyph redrawn as the real skeletal formula** (must). 9-fluoro-11β,17,21-trihydroxy-16α-methylpregna-1,4-diene-3,20-dione (PubChem CID 5743).
   - Rings A–D with Δ1 *and* Δ4 double bonds.
   - 3-oxo.
   - 10- and 13-angular methyls.
   - 9α-F, drawn as a green dot.
   - 11β-OH and 17α-OH.
   - 16α-CH₃.
   - The C17 side chain C20(=O)–C21H₂–OH, with the O dot one bond beyond C21.
   - Oxygens are dark dots. Stubs without a dot are methyls (skeletal-formula convention). The glyph is slightly larger: free scale 1.6, bound 0.6.
2. **HSP90 is now an escort, not a "lets go" event** (should).
   - Step ② reads **"Binds and activates GR / glucocorticoid receptor + HSP90 chaperone"**.
   - The HSP90 protomers stay on GR through binding and travel with it to the nuclear pore. They are released at the pore mouth and drift back into the cytoplasm.
   - Fine print 5.5–11.2 s: "Newer model: HSP90 escorts GR to the nuclear pore (Echeverría 2009)".
   - Sources:
     - Echeverría PC et al. Mol Cell Biol 2009;29:4788-97, PMID 19581287, doi:10.1128/MCB.00649-09. The hsp90 heterocomplex interacts with Nup62/importin β, and hsp90-cross-linked GR still translocates, "suggesting that GR could pass through the pore in its untransformed state".
     - Vandevyver S et al. Traffic 2012;13:364-74, PMID 21951602, doi:10.1111/j.1600-0854.2011.01288.x. "Originally, it was believed that nuclear import of GR is initiated by dissociation of the chaperone complex in the cytoplasm. However, several studies show that the chaperone machinery is required".
     - Cain & Cidlowski 2017, PMID 28192415.
3. **MKP-1 linked to the repressed genes** (should).
   - At each down-switch, verdigris dotted arcs from **MKP-1** reach COX-2, IL-1β and TNF-α. They run alongside the indigo arcs from the tethered GR.
   - Fine print 15.85–19.2 s: "MKP-1, GILZ and mRNA decay also turn these genes down · schematic".
   - Sources:
     - Abraham SM et al. J Exp Med 2006, PMID 16880258. Dex suppression of TNF, IL-1β and COX-2 is partly DUSP1-dependent.
     - Cho IJ, Kim SG. Mol Endocrinol 2009;23:86-99, PMID 18945810, doi:10.1210/me.2008-0257. COX-2 repression is combinatorial: MKP-1 plus GR/GRIP1 at p65, in macrophages.
     - Cain & Cidlowski 2017: GILZ, tristetraprolin-mediated mRNA decay, negative GREs.
   - MKP-1's gene symbol is **DUSP1**. It is kept as "MKP-1" on screen for space.
4. **No more "switches off"** (should).
   - Title: **"How dexamethasone / turns down inflammation"**.
   - Step ④: "Anti-inflammatory genes turned up". Step ⑤: "Inflammatory genes turned down".
   - The strike-throughs are gone. Repressed gene labels are *dimmed* (grey-brown, still legible).
   - The switch plates are engraved **HI / LO**, not ON/OFF, so the metaphor is a level, not a binary.
   - A turned-down lamp stays as a dim ember rather than going dark: expression falls, not to zero.
   - Sources: Abraham 2006, PMID 16880258 ("partly dependent"); Scheinman RI et al. Mol Cell Biol 1995, PMID 7823959.
5. **Fig. 3 COX step** (should).
   - The arrow is labelled **"COX-1 / COX-2"**.
   - STEROID: "less COX-2 made / (COX-1 unaffected)".
   - NSAID: "blocks COX-1 & COX-2 / enzyme activity".
   - Sources: Masferrer JL et al. J Pharmacol Exp Ther 1994, PMID 7932188, and PNAS 1994, PMID 8159730 (dex regulates COX-2 but not COX-1); Vane JR 1971, PMID 5284360.
6. **Endodontic line** (should).
   - Now reads "**In endodontics,** oral/injected steroids reduced post-op pain vs control at 6–24 h". Fine print: "Meta-analysis of 29 RCTs · Alajlan et al., J Endod 2024 · moderate certainty".
   - Alajlan N et al. J Endod 2024;50:724-34, PMID 38490301, doi:10.1016/j.joen.2024.03.004. Their abstract defines "systemic (oral or locally injected) corticosteroids": 29 trials, 2303 participants, less pain at 6, 12 and 24 h.
7. **Not-a-ranking caveat** (should).
   - Fine print under the evidence line: "Mechanism, not a clinical ranking: steroids given only after treatment did not beat placebo for post-op pain (Zanjir et al., J Endod 2020)".
   - Zanjir M et al. J Endod 2020;46:1387-402, PMID 32668310, doi:10.1016/j.joen.2020.07.002. "Postoperative corticosteroids or opioids did not significantly decrease postoperative pain"; NSAIDs ± acetaminophen were most effective.
8. **Pocket-watch** (should).
   - The watch is captioned "hours" + "(illustrative)".
   - Fine print 19.4–22.6 s: "Timings illustrative · rapid non-genomic effects also exist (not shown)".
   - GR-driven transcription itself starts within minutes: DUSP1 within 10 min (Shipp LE et al. PLoS One 2010, PMID 21060794, doi:10.1371/journal.pone.0013754). Only the fall in mediators lags by hours (Cain & Cidlowski 2017).
9. Nits:
   - Fig. 3 caption ends "(simplified)".
   - Step-4 fine print: "Both arms contribute · one GRE drawn for two genes · schematic". GREs are gene-specific: DUSP1 has its own GRE about 1.3 kb upstream (Shipp 2010), and the GC response of the mouse annexin A1 promoter involves a CRE/CREB element (Antonicelli F et al. Eur J Biochem 2001, PMID 11121103).
   - Fig. 1 reads "inflamed **macrophage**, cut away" / "the same macrophage, hours later". The gene data cited are from macrophages, and GC regulation of annexin A1 is cell-type dependent (Perretti & D'Acquisto 2009, PMID 19104500).
   - "PLA₂" is now **cPLA₂** (Croxtall 1996, PMID 8694860).
   - The verdigris dots carry the label "new anti-inflammatory proteins".
   - Sources line: "Cain & Cidlowski, Nat Rev Immunol 2017 · Barnes, Br J Pharmacol 2006 · Abraham, J Exp Med 2006" (PMIDs 28192415, 16604091, 16880258).
   - Default fine print: "Schematic · not to scale · timings simplified".

### Design
- **Retime and climax hold** (must).
  - GR 3 enters at 14.9–15.4 and docks at 15.4–15.95. It tethers NF-κB/AP-1 at 15.9–16.3.
  - Down-switches flip at 16.35 / 16.55 / 16.75 / 16.95, so all genes are turned down from about 17.3 s until the labels fade at 19.15 s (≈1.9 s).
  - The switches and lamps stay drawn through the 19.3–20.5 zoom-out and shrink back into the nucleus.
- **Caption and picture in sync** (should).
  - Caption ④ appears at 12.3. The GR dimer docks at 13.1–13.3, then annexin A1 flips at 13.35 and MKP-1 at 13.65.
  - Caption ⑤ appears at 15.8. The tether is at 15.9 and the first flip at 16.35.
- **Gene switches** (should).
  - Scale 2.0: the plate is ≈104×46 px and the lamp r = 10 px.
  - The lever points **up = HI** and **down = LO**. HI/LO are engraved in small caps (≈19 px), with the active one inked dark.
  - The lamp glows verdigris for genes turned up and madder for active inflammatory genes. A turned-down lamp has no glow.
  - Lower-strand genes sit at u = −54/68/188/302 and NF-κB/AP-1 at −289/−178. The nucleolus moved to the right (u = 322) to clear the diagram.
- **Result beat** (should).
  - The pocket-watch is now at (884, 702), right under the mediator plume, with "hours (illustrative)" beside it.
  - Mediators are drawn ≈1.6× larger for the whole reel: cytokine 1.85–2.6, PG 2.0–2.55.
  - The "new anti-inflammatory proteins" label (30 px italic) has a leader to one green dot.
- **Payoff panel** (should).
  - The endodontic line is 2 lines at 36 px, fully visible 24.4–29.0 s (4.6 s ≥ readSecs 4.44).
  - STEROID/NSAID are 40 px with 12 px block bars ending in T-caps. Pathway nodes are 38 px and block sub-lines 34 px.
  - The rotated "upstream" label was removed to cut text; the takeaway caption carries it.
  - The whole panel is complete by ≈24.8 s and holds until the loop wipe at 29.0 s.
- **Ghost artefacts around the inset** (should).
  - The "inflammatory mediators" label fades out while the inset opens.
  - Mediators fade with the inset.
  - The inset ghost rose from 0.78 to 0.94.
- **Opening** (should).
  - Ink-on is 0.6 s earlier, so at t = 0 the membrane is ≈90% inked and the washes are ≈40% in.
  - A faint graphite under-drawing (membrane, nucleus, organelles) sits under the pen.
  - Mediator puffs start at 0.3 s, and the "inflammatory mediators" label appears at 0.6 s.
- **Cytoplasm labels** (should). "HSP90" (#5A3E0E, 34 px) and "GR" (34 px) now sit on paper tablets, and HSP90 has a leader to the left protomer of GR 1.
- **Type sizes** (should).
  - Gene, GRE, NF-κB and AP-1 tags: 32 → 36 px.
  - Group labels: 33 → 36.
  - NUCLEUS: 30 → 34.
  - Fig. 3 sub-lines: 31 → 34.
  - Step subtitles: 38 → 42.
  - "Dexamethasone" label: 34 → 36.
- Nits:
  - "Dexamethasone" has a leader to the first molecule (1.7–3.7 s).
  - GR 3 now enters through the left pore (185°) and approaches above the lower strand (v ≈ −27 → 28), clear of the NF-κB tag.
  - The panel frame's right edge is at x = 952 (inner rule 945). The inset centre is at x = 532 with r = 412, so the outer ring is at x ≤ 950.
  - Loop: from 29.0 s a soft left-to-right blot wipe reveals a cached copy of the t = 0 frame, so the last frame equals the first.
  - Inset nucleoplasm wash cut by ~35% (0.5 → 0.33 of base) and back-runs cut to 30%. The stipple is kept.

### Caption reading windows (fully visible vs Kit.readSecs)
| Step | Visible | readSecs |
|---|---|---|
| ① | 2.72 s | 2.62 s |
| ② | 3.72 s | 3.53 s |
| ③ | 2.42 s | 2.32 s |
| ④ | 3.02 s | 2.92 s |
| ⑤ | 3.02 s | 2.92 s |
| ⌛ | 3.02 s | 2.92 s |
| Takeaway | 5.9 s | 3.53 s |
| Endodontic line | 4.6 s | 4.44 s |


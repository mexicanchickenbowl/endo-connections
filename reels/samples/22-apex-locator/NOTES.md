# 22 · How an electronic apex locator works (the electrical science)

**Style:** printed circuit board / schematic. Deep-green solder mask with a glass-fibre weave, exposed gold traces
with 45-degree chamfers, vias, mounting holes and card-edge fingers, white silkscreen type (Share Tech Mono; IBM Plex
Mono for fine print), a reflective segment LCD, a small scope module, a QFP "divider" chip. The tooth is a silkscreen
component outline on bare board (insulator); the periodontal tissues are a hatched copper pour (conductor).
**Duration:** 24 s · 1080×1920 · 30 fps · silent · poster at 21.6 s (the complete summary frame). US spelling.
**Files:** `index.html` (page contract), `reel.js` (all drawing; one 2D canvas, `render(t)` pure in `t`, about 12 ms
per frame). Static board art is pre-rendered once in `setup()`.

## Concept
The board *is* the explanation. A device (two sources, a detector, a divider chip, an LCD) sits at the top; the
patient sits below as part of the same circuit. The reel builds the loop in the order the history went: one DC source
and a closed loop (Custer, Sunada), then a resistor and a capacitor drawn into the root, then two AC sources whose two
measured potentials are divided by the chip. A strip chart printed beside the root records that ratio against file
position (ratio increasing to the right, as on any chart), so the viewer sees it stay nearly vertical and then swing
left to the set point as the file reaches the foramen, while the LCD bar marches to APEX and the chip's 8 kHz dot
shrinks. The history strip along the lower edge marks the active era in gold as each idea appears.

## Storyboard (seconds)
| t | Beat | Picture | Text on the board |
|---|------|---------|-------------------|
| 0–3.45 | **Hook** (title opaque on frame 0) | Board powers up: the frame trace energizes, the LCD runs a short self-test sweep, power LED on (0.2–1.55). Then a gold glint runs down both sides of the tooth outline and the two meet at the apex with a soft ping (1.55–3.7) while the file slides into the canal (1.7–3.1). Lip clip not yet attached, tissue pour unlit. | HOW DOES AN APEX LOCATOR **FIND THE END?** |
| 3.55–7.25 | **The loop** | DC source → file lead and file light up (from 3.2) → canal fluid lights from the file tip to the foramen → the pour floods gold from the foramen → the lip clip slides on → return lead lights → current dashes run round the loop; scope shows a flat DC level. At 6.25 s a resistor zigzag appears in the canal and a capacitor across the root wall. History: "1918 Custer" and "1962 Sunada" turn gold with an underline. | THE PATIENT IS THE **CIRCUIT** · LIP CLIP · DENTIN = INSULATOR · FORAMEN · RESISTOR · CAPACITOR |
| 7.4–10.8 | **Two signals, one ratio** | The DC source becomes a slow AC source (pink); a second, fast source (cyan) pops in; long pink and short dense cyan dashes travel the loop; the scope shows the two potentials; the chip's divide sign lights (cyan dot over pink dot) and feeds the LCD; the file advances and the strip chart starts to plot a nearly vertical line. | **2** AC SIGNALS, **1 RATIO** · ROOT ZX: 0.4 + 8 kHz · RATIO (axis) |
| 10.95–14.1 | **Fluid** | A two-row jumper (SALINE / NaOCl) appears; after the headline has been read it switches once (12.4–12.9): the canal turns from blue to pale yellow, both scope traces shrink together past their white "before" ticks, a gold bracket pulses around the unchanged LCD bar and the chart dot quivers about 6 px. The jumper leaves with the headline. | FLUID SHIFTS BOTH: **RATIO BARELY MOVES** · SALINE · NaOCl |
| 14.25–17.15 | **Last millimeter** | File advances to the foramen (the resistor and its label shorten to nothing); the chart leans slightly, then swings left to the dashed set point; in the chip the 8 kHz dot shrinks inside its dashed original outline while the 0.4 kHz dot keeps its size; the fast trace shrinks more than the slow one; LCD segments march and APEX comes on with one soft ping at the foramen. | LAST ~1 mm: **RATIO DROPS** · APEX (LCD) |
| 17.3–23.35 | **Payoff** (headline fully visible 5.5 s) | Dashed ring around the apical region. Tag under the LCD (17.75), accuracy marking on the chip (18.3), radiograph caution (19.7). | IT SENSES THE **FORAMEN REGION** · NOT MILLIMETERS · ROOT ZX, IN VIVO ~70–100% WITHIN ±0.5 mm (fine print: RANGE OF 16 STUDIES) · CONFIRM WITH A RADIOGRAPH |
| 23.1–24 | **Loop** | Payoff text, APEX and the two AC signals go out first (23.1–23.4; the DC source returns), then the file retracts, the bar falls back, the traces de-energize and the title wipes back in (23.55). Last frame equals frame 0. | |

Persistent: `@natebrooksendo` on the LCD bezel; "SCHEMATIC · NOT TO SCALE" (23 px) beside the root for the whole reel;
history strip (32 px; future eras at 35% opacity, past eras white, the active era gold and underlined); one source
line at a time (24 px) bottom left.

Reading times (`Kit.readSecs` needed / fully visible): hook 3.2 / 3.2 (+0.1 at the loop); circuit 2.3 / 3.1;
2 signals 2.3 / 2.8; fluid 2.6 / 2.6; last mm 2.3 / 2.3; payoff headline 2.3 / 5.5; "not millimeters" 1.4 / 5.0;
accuracy marking 3.2 (4.4 with the fine print) / 4.45; radiograph 2.0 / 3.05.

Must-read words: 64 (headlines 34; diagram labels 16 including APEX on the LCD; payoff items 14), plus 4 in the
24 px fine print on the chip and 8 in the persistent history strip. Before the review: 72 + 9.

## Every on-screen claim and its source
Source types: *abstract* = PubMed abstract read; *full text* = PMC full text read; all taken from the fact-checked
`RESEARCH.md` (row ids in brackets). The five mechanism abstracts were fetched again from PubMed during the build.

| On screen | Source | Verified from |
|---|---|---|
| THE PATIENT IS THE CIRCUIT (file → canal fluid → foramen → tissues → lip clip) | Nekoofar MH, Ghandi MM, Hayes SJ, Dummer PMH. Int Endod J 2006;39:595-609. PMID 16872454. Lip electrode: Nasiri K, Wrbas KT. Saudi Dent J 2022;34:11-20. PMID 35068894 [C1] | abstract; full text |
| DENTIN = INSULATOR | Nekoofar 2006, PMID 16872454: "dentine and cementum that are insulators to electrical current" [C1] | abstract |
| FORAMEN (where canal contents meet the periodontal ligament) | Nekoofar 2006, PMID 16872454 [C1] | abstract |
| RESISTOR (canal column; shortens as the file advances) | Nekoofar 2006, PMID 16872454 [C2] | abstract |
| CAPACITOR (root wall) | Nekoofar 2006, PMID 16872454; Meredith N, Gulabivala K. Endod Dent Traumatol 1997;13:126-131. PMID 9550026 [C3] | abstract |
| 2 AC SIGNALS, 1 RATIO | Kobayashi C, Suda H. J Endod 1994;20:111-114. PMID 7996080 [H6] | abstract |
| ROOT ZX: 0.4 + 8 kHz | Oishi A, Yoshioka T, Kobayashi C, Suda H. J Endod 2002;28:361-364. PMID 12026919 (not in the 1994 abstract) [C6] | abstract |
| FLUID SHIFTS BOTH: RATIO BARELY MOVES · SALINE · NaOCl | Kobayashi & Suda 1994, PMID 7996080: quotient "only negligibly influenced by the electrolyte present in the canal" [C11]. NaOCl more conductive than saline: Shin et al. 2012, PMID 23431125 [B1]; NaOCl lowers canal resistance in vivo: Meredith & Gulabivala 1997, PMID 9550026 [C3] | abstracts |
| LAST ~1 mm: RATIO DROPS · "in vivo, 7–21 canals" | Rambo MVH, Gamba HR, Borba GB, Maia JM, Ramos CAS. Biomed Eng Online 2010;9:46. PMID 20819212 [C7]. n = 21 canals at 0 mm, 14 at -0.5 mm, 18 at -1 mm, 7 at -1.5 to -3 mm; custom research analyzer (not a Root ZX), canals irrigated with 2.5% NaOCl; the 0 mm position was defined by a Root ZX reading plus a radiograph, not histology | full text |
| IT SENSES THE FORAMEN REGION | Ounsi HF, Naaman A. Int Endod J 1999;32:120-123. PMID 10371907 (in vitro); Martins et al. 2014, PMID 24862702: these devices "detect the transition of the pulp to the periodontal tissue" [M2, A9]. Rambo 2010 is supporting only (its 0 mm point was itself set with a Root ZX) | abstracts |
| NOT MILLIMETERS (arrow to the LCD scale) | J. Morita ROOT ZX II operation instructions: "The numerals on the meter gauge do not represent millimeters." Manufacturer document for one device, not a PubMed source [M1]. Peer-reviewed support: Rambo 2010 (the ratio method cannot accurately measure distances between -3.0 and -0.5 mm from the foramen) and Ounsi & Naaman 1999 (the Root ZX "is not capable of detecting the '0.5 mm from the foramen' position") [M2] | manufacturer text; full text; abstract |
| ROOT ZX, IN VIVO ~70–100% WITHIN ±0.5 mm · fine print RANGE OF 16 STUDIES | Range of 16 in vivo abstracts (list and scope below) [A7] | abstracts |
| CONFIRM WITH A RADIOGRAPH | Martins JNR, Marques D, Mata A, Caramês J. J Endod 2014;40:759-777. PMID 24862702; ROOT ZX II instructions [A9, M1] | abstract; manufacturer text |
| 1918 CUSTER (cell symbol = direct current) | Custer LE. Dent Regist 1918;72:420-425. PMID 33703181 [H1] | full text |
| 1962 SUNADA (cell symbol) | Sunada I. J Dent Res 1962;41:375-387. Not in PubMed; bibliographic record plus secondary full text only (Rambo 2010; Nasiri & Wrbas 2022). Name, year and "DC" only; no kΩ value [H3] | record + secondary |
| AC IMPEDANCE (no year) | Nasiri & Wrbas 2022, PMID 35068894; Nekoofar 2006, PMID 16872454 [H5, H7] | full text; abstract |
| 1994 RATIO | Kobayashi & Suda 1994, PMID 7996080. 1994 is the date of the J Endod paper, not a claimed year of introduction; say "ratio method (Kobayashi & Suda, J Endod 1994)", never "introduced in 1994" or "first" [H6] | abstract |

**The 70–100% range** (Root ZX family: Root ZX in 12 studies, Root ZX II in 3, Dentaport ZX in 1; no Root ZX mini
study is in the list; permanent teeth; hand files; percentage of readings within ±0.5 mm of that study's reference
point):
Shabahang 1996 J Endod (PMID 9198419) 96.2%; Dunlap 1998 J Endod (9487868) 82.3%; Pagavino 1998 J Endod (9693591)
82.75%; Welk 2003 J Endod (12929694) 90.7%; Tselnik 2005 J Endod (15980709) 75%; Haffner 2005 J Dent (16139692) 78%;
Wrbas 2007 Int Endod J (17229119) 75%; Kim 2008 Oral Surg Oral Med Oral Pathol Oral Radiol Endod (18329572) 84%;
Vieyra 2010 Int Endod J (20002800) 100%; Stöber 2011 J Endod (21496657) 72%; Piasecki 2011 J Endod (21846536,
Root ZX II) 83% and 100%; Vasconcelos 2014 Braz Dent J (24789285) 75%; Saatchi 2014 J Endod (24565652, Dentaport ZX)
93%; Swapna 2015 J Conserv Dent (26180412) 96.6%; De-Deus 2022 J Endod (35780927, Root ZX II) 81.8%; De-Deus 2023
J Endod (36848949, Root ZX II) 100%.
- Not pooled; one PubMed query, not a systematic search.
- "Hand files" is stated in 9 of the 16 abstracts (K-file or hand file: Welk, Tselnik, Kim, Stöber, Piasecki,
  Vasconcelos, Swapna, De-Deus 2022, De-Deus 2023). The other 7 (Shabahang, Dunlap, Pagavino, Haffner, Wrbas, Vieyra,
  Saatchi) name no file type; none of the 16 reports engine-driven files.
- In scope, inside the range, but not among the 16 (found at the citation audit; abstracts): Duran-Sindreu et al.,
  J Endod 2012;38:236-239 (PMID 22244644), Root ZX 78.3% in vivo, reference 0.5 mm coronal to the major foramen;
  Moscoso et al., Med Oral Patol Oral Cir Bucal 2014;19:e202-205 (PMID 24121908), Dentaport ZX 82.35%, major foramen.
  Not a ±0.5 mm figure, so not counted: Somma et al., Int Endod J 2012;45:552-556 (PMID 22257341), Dentaport ZX
  "correct" in 6 of 10 teeth with no tolerance given in the abstract.
- Reference point differs by study: the major foramen, a point 0.5 mm coronal to it (Stöber 2011, the 72% anchor;
  also Saatchi 2014), or the minor foramen/constriction (Vieyra 2010, the 100% anchor).
- Most have 11–40 teeth, but not all: Vieyra 2010 measured 482 canals in 160 teeth. That is why the chip no longer
  says "small studies".
- Outside this scope, the figure is lower: primary molars 65–69% in vivo (Beltrame et al., Int Endod J
  2011;44:402-406, PMID 21219365, abstract; 15 teeth, 30 canals); rotary NiTi files 50% (Siu et al., J Endod
  2009;35:962-965, PMID 19567315, abstract).

## What is schematic (tagged "SCHEMATIC · NOT TO SCALE" on screen throughout)
- One resistor plus one capacitor is a teaching model; published models use R–C networks and constant-phase elements
  (Krizaj 2004, PMID 15042627). No component values are shown. The capacitor's position across the root wall is a
  drawing choice.
- The ratio curve is a toy function tuned to the proportions of Rambo 2010, Table 2 (8 kHz / 0.5 kHz: 0.766 at
  -3 mm, 0.730 at -1 mm, 0.705 at -0.5 mm, 0.527 at 0 mm, i.e. 15% / 10.5% / 74.5% of the fall). The drawn function
  gives 14% / 11% / 75%. No digits, no axis numbers. The LCD bar and the chip's 8 kHz dot are drawn as linear in that
  toy ratio (the bar holds 3 of 15 segments during the fluid beat).
- The chart axis is conventional: ratio increases to the right, so the drop moves left toward the dashed set point.
- Scope amplitudes are arbitrary units. The fast trace is drawn slightly smaller than the slow one from the start (the
  quotient is not 1 in the coronal canal). Both shrink a little as the file advances; the slow trace is kept at
  ±24 px or more so it stays readable.
- Fluid gains are illustrative (NaOCl drawn at 0.75 of saline). NaOCl as the more conductive fluid follows Shin et
  al., Restor Dent Endod 2012;37:149-154 (PMID 23431125, abstract) and Meredith & Gulabivala 1997 (PMID 9550026,
  abstract: mean canal resistance 7.46–8.92 kΩ with NaOCl against 9.32–12.10 kΩ with deionized water).
- Blood is no longer drawn. For replies: in vivo, blood injected into the canal did not change Root ZX accuracy
  (91.5% without against 86.2% with blood within 0.5 mm, not significant; 40 single-canal teeth): Saatchi et al.,
  Braz Dent J 2016;27:336-339 (PMID 27224570, abstract). That is accuracy-level evidence, not a conductivity
  measurement.
- The drawn wavelengths differ 10-fold; the real frequencies differ 20-fold. The scope has no unit tags; the adjacent
  label "ROOT ZX: 0.4 + 8 kHz" carries the unit and the color code.
- The gold glint on the tooth outline in the hook is decoration (it points at the apex); it is not a signal.
- The tooth is not to scale: the file travels about 5 "mm" at 45 px per mm.
- A single apical foramen is drawn. Real roots can also leak current through lateral canals, cracks and perforations,
  and dentin is a poor conductor rather than a perfect insulator (Meredith & Gulabivala 1997 describe a complex
  network that includes bulk dentin). On screen "DENTIN = INSULATOR" follows Nekoofar 2006; the caption says "Dentin
  insulates" (shortened at final QA to make room for the manufacturer reference), and the poor-conductor nuance is
  kept in the first claim source in meta.json.
- The LCD is an original design (wedge bar, no numerals), not a copy of a commercial display.

## Kept off screen on purpose (see RESEARCH.md "Do not claim")
No kΩ value for Sunada, no quotient value, no Rambo ratio numbers, no "cancels", no "0.5 = constriction", no generation
numbers, no "first", no dry-canal state, no pooled accuracy figure, nothing about pacemakers.

Nuance for replies or a longer caption: constriction-versus-foramen is disputed (Hoer & Attin 2004, PMID 14871179);
with a wide apical foramen and a small file the reading is unreliable (Ebrahim et al., Aust Dent J 2006;51:258-262,
PMID 17037894, ex vivo, abstract); the manufacturer instructions say an exceptionally large foramen reads short, and
in enlarged canals "the measured length with the smaller size files became shorter" (Ebrahim et al., Aust Dent J
2006;51:153-157, PMID 16848263, in vitro, abstract); a file touching a metal prosthesis that touches the gingiva, or
fluid overflowing to the gums, leaks current (manufacturer instructions, which also list a fractured tooth and a
branch canal as leakage paths); apex locators are also used to detect perforations (Gordon & Chandler, Int Endod J
2004;37:425-437, PMID 15189431, abstract), although neither that abstract nor the instructions say "reads APEX";
the Root ZX II label says not to use it on patients with a pacemaker, while small clinical studies found no
interference (Wilson 2006, PMID 16934627; Conde-Mir 2018, PMID 29972599) and one recorded noise under provoked
conditions (Moraes 2016, PMID 26105663).

## Design rationale
- **One loop, one colour logic.** Gold = copper that can carry current; white silkscreen = labels and insulators;
  pink = 0.4 kHz, cyan = 8 kHz everywhere (sources, travelling dashes, scope, chip dots, strip glyph). Lit versus
  dim gold steers the eye, so the dense board still has one focal point at a time.
- **Insulator and conductor are materials, not words.** Dentin is bare board inside a component outline; tissue is
  a copper pour that floods from the foramen via.
- **The ratio is drawn where the file is.** The chart shares the canal's vertical axis and a dotted cursor ties its
  dot to the file tip, so "flat, then drops" needs no numbers and no direction word.
- **Silkscreen that is pre-printed.** The chart axis lines and the history strip are faint from frame 0 and brighten
  when used, like real board markings (the word RATIO appears only with the first reading).
- **Layout.** Must-read text sits in x 64–1016, y 250–1575; nothing must-read lies in the right-hand button column
  below y 1100 (labels there end at x ≤ 956). Top and bottom bands hold only decorative routing and the card-edge
  fingers.

## QA log
1. First build: fixed a dark notch above the access cavity, an open gap in the DC loop where the second source later
   sits, a cramped DC symbol, faint canal fluid.
2. Replaced a 14-segment "APEX" that read poorly with a single LCD annunciator; added the pre-printed chart axes;
   re-timed every headline to meet `Kit.readSecs`; softened "ratio holds" to "ratio barely moves".
3. Added "before" ticks on the scope bars, the foramen ping and ring, the return of DENTIN = INSULATOR in the
   summary, a two-step source line in the payoff; removed an overlap between the chip's divider face and its marking;
   raised "falls" and the chip's top line to 30 px.
4. Checked transitions at 0.1–0.2 s spacing (3.1–3.5, 14.0–14.4, 17.1–18.5, 23.2–23.97), the encoded MP4 frame tiles,
   the first/last frame match, and the safe-area overlay. No console errors.
5. Review pass: see "Review changes". Stills checked at full resolution: `_stills/fix` (10 frames with the safe-area
   overlay), `_stills/fix2` (20 frames including 23.2–23.97 for the loop) and `_stills/fix3` (fluid switch and the
   last millimeter). No console errors; about 12 ms per frame.

## Review changes (independent science + design review)
Science
- Chip marking "SMALL STUDIES, NOT POOLED" removed (not true of Vieyra 2010: 482 canals, 160 teeth). The number now
  carries the fine print "RANGE OF 16 STUDIES"; "not pooled" is in the caption and the claim source.
- Accuracy scope corrected in meta.json, caption and this file: Root ZX family, permanent teeth, hand files; reference
  point = major foramen, 0.5 mm coronal to it, or the constriction; primary molars (Beltrame 2011) and rotary NiTi
  (Siu 2009) named as outside the range.
- Toy ratio curve flattened and smoothed to Rambo's proportions (14% / 11% / 75% of the fall against 15% / 10.5% /
  74.5% in Table 2; before: about 36% of the fall happened before -0.5 mm). LCD bar and scope re-normalized.
- BLOOD removed from the screen (no conductivity source). Saatchi 2016 added here and in meta.json as accuracy-level
  evidence only.
- Rambo source line now reads "in vivo, 7–21 canals"; per-position n, the research device and the Root ZX-defined
  0 mm point are recorded. "Foramen region" now leads with Ounsi & Naaman 1999 and Martins 2014.
- "1994 RATIO": documented as the date of the J Endod paper, not a year of introduction.
- "Not millimeters": peer-reviewed support added to the source (Rambo 2010; Ounsi & Naaman 1999).
- Caption: "Dentin acts as the insulator"; "Root ZX family"; landmark and scope stated.
- Scope: unit-less "0.4k / 8k" tags deleted; drawn frequency contrast raised from 5.6:1 to 10:1.

Design
- Text load cut from 72 + 9 to 64 + 8 must-read words: FILE label, BLOOD, "falls", "SCALE:", "METHOD", the DENTIN =
  INSULATOR reprise and the two-line "small studies, not pooled" are gone. The payoff carries 19 words (was 27).
- Fluid beat: two fluids, one switch at 12.4–12.9 s after the headline is read; gold bracket on the unchanged LCD
  bar; dot wobble raised to 6 px; jumper leaves at 14.1 s.
- Hook: no static stretch. Outline glint and apex ping (1.55–3.7 s) and the file entering the canal (1.7–3.1 s) run
  under the title. Title held to 3.45 s.
- Payoff takeaways set at 36 px ("NOT MILLIMETERS", "CONFIRM WITH A RADIOGRAPH").
- Climax: the chip's 8 kHz dot shrinks with the ratio (dashed outline keeps its original size); scope traces keep a
  readable floor; chart axis made conventional so "drops" moves toward the origin.
- History strip: 35% unlit, white when past, gold with underline when active; "1994 RATIO"; type at 32 px.
- Nits: pin-1 dot clears under the chip marking; RESISTOR label fades with its symbol; APEX and the AC signals go out
  before the loop rewind; pre-printed chart words hidden until used; cleaner, more opaque canal fluid colors.

## Final QA (fresh-eyes pass, 2026-11-22)
Checked: 21 stills with the safe-area overlay (`_stills/final-qa`: 0, 0.6, 1.5, 2.8, 4.2, 5.6, 6.8, 8.2, 9.6, 11.4,
12.7, 13.6, 15.0, 16.4, 17.6, 18.6, 20.2, 21.6, 22.8, 23.3, 23.95 s), 18 transition stills (`_stills/final-qa-tr`:
every headline hand-over, the payoff build and the loop rewind), frames pulled from the encoded MP4, and the poster in
the 3:4 crop. No console errors, no missing glyphs, no ghosted text at the loop, nothing must-read in the no-go zones.
According to PubMed, the abstracts of the nine sources behind the on-screen numbers and source lines read as recorded
(PMIDs 7996080, 12026919, 20819212, 21496657, 20002800, 36848949, 10371907, 24862702, 16872454).

Defects found and fixed
- A decorative mask-covered trace and its via (x 330-392, y 950-1010) ran under the payoff caution: the via sat 5 px
  after "CONFIRM WITH" and the run touched the "PH" of "RADIOGRAPH". The run was removed from the static board art
  (`buildBase`). Nothing else on the board moved.
- Caption: "marks ≠ mm" rests on the manufacturer instructions, which were on screen but missing from the Refs line.
  "Root ZX II manual" added; "Dentin acts as the insulator" shortened to "Dentin insulates" and "It senses" to
  "Senses" to stay within 700 characters (now 699).
- meta.json: the history-strip claim is labelled as the persistent strip (it lights up at 5.6-8.6 s, so it does not
  sit after the radiograph line in time).

Left as is (judged acceptable, noted for the record)
- "RANGE OF 16 STUDIES" stays at 24 px fine print: the chip face is 260 px wide and the three lines above it (30, 62
  and 33 px) carry the device, the setting and the tolerance.
- The reference landmark for "within ±0.5 mm" (major foramen, 0.5 mm short of it, or the constriction, by study) is
  in the caption and in meta.json, not on screen.
- The accuracy marking appears at 18.3 s, 0.8 s before its source line (19.1 s).

Video re-rendered once after the fix: 720 frames, 24.000 s by ffprobe, 5.14 MB; poster at 21.6 s.

## Citation audit (2026-11-22)
Scope: every literature citation on screen (six source lines, the chip marking, the history strip), in `meta.json`
(claims and the caption's Refs line), in this file, and in `RESEARCH.md`.

Method. According to PubMed, metadata and abstracts were fetched again for all 68 PMIDs cited in the sample and
compared with first author, year, journal, volume, pages and the claim attached. PMC full text was read again for
Rambo 2010 (PMC2944265: Table 2, canal counts per file position, the Root ZX-defined 0 mm point), Nasiri & Wrbas 2022
(PMC8767164: lip electrode, direct-current and alternating-current device classes, 8 kHz and 400 Hz) and Custer 1918
(PMC7845214: dry cells and a milliammeter). Sunada 1962 has no PubMed record (citation lookup returns none); the
Crossref record gives J Dent Res 1962;41(2):375-387, author Imao Sunada. The manufacturer quotes ("The numerals on the
meter gauge do not represent millimeters", "Always check the measurement with an x ray", "Contrary Electrode (Lip
Clip)") were found in the local text of the ROOT ZX II instructions. Not read again: the full texts of Gehlot 2016,
Alothmani & Siddiqui 2023 and Tampelini 2017, which support only off-screen notes in `RESEARCH.md`.

Result. All 68 PubMed records match the citations given (first author, year, journal, volume, pages, PMID). Every
number on screen is in the source cited for it: 0.4 and 8 kHz (Oishi 2002, abstract), 7–21 canals (Rambo 2010, full
text), 72% and 100% as the ends of the 16-study range (Stöber 2011; Vieyra 2010 and De-Deus 2023, abstracts). Nothing
on screen was changed and the video was not rendered again.

Corrected in the documentation
- "Root ZX mini" was listed in the Root ZX family behind the 70–100% range. None of the 16 studies used it (12 Root ZX,
  3 Root ZX II, 1 Dentaport ZX). Removed here and in `meta.json`.
- "Hand files" as the scope of the range: stated in 9 of the 16 abstracts, not named in 7, engine-driven files in
  none. Now said in `meta.json` and above.
- Nuance paragraph: "readings run short with a wide-open apex" was attached to Ebrahim 2006 (PMID 17037894), whose
  abstract says "unreliable", not "short". "Short" is the manufacturer's wording and the finding of the companion paper
  (PMID 16848263). "A perforation can read APEX" was attached to the manufacturer instructions, which do not mention
  perforation. Both sentences reworded.
- Kim 2008: journal written out (Oral Surg Oral Med Oral Pathol Oral Radiol Endod); device named for Piasecki 2011,
  Saatchi 2014 and De-Deus 2022.

Checked and left
- Is 70–100% selective? One more PubMed query for in vivo Root ZX studies (46 records) found two in-scope abstracts
  outside the list, both inside the range (Duran-Sindreu 2012, 78.3%; Moscoso 2014, 82.35%), and none below 70% with a
  stated ±0.5 mm tolerance. Somma 2012 (Dentaport ZX "correct" in 6 of 10 teeth, tolerance not given) is recorded
  above and not counted. "RANGE OF 16 STUDIES" stays true as worded.
- Source line "Ounsi & Naaman 1999, Int Endod J (in vitro) · Martins 2014" gives no journal for Martins (J Endod).
  Adding it would run the 24 px line past x = 956 into the button column; the journal is in the caption's Refs line
  and in `meta.json`.

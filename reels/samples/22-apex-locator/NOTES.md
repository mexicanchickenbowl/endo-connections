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
position, so the viewer sees it sag slightly and then swing to the set point as the file reaches the foramen, while
the LCD bar marches to APEX. The history strip along the lower edge lights up node by node as each idea appears.

## Storyboard (seconds)
| t | Beat | Picture | Text on the board |
|---|------|---------|-------------------|
| 0–3.2 | **Hook** (title opaque on frame 0) | Board powers up: the frame trace energises, the LCD runs a short self-test sweep, power LED on. File parked in the canal, lip clip not yet attached, tissue pour unlit. | HOW DOES AN APEX LOCATOR **FIND THE END?** |
| 3.3–7.25 | **The loop** | DC source → file lead and file light up → canal fluid lights from the file tip to the foramen → the pour floods gold from the foramen → the lip clip slides on → return lead lights → current dashes run round the loop; scope shows a flat DC level. At 6.25 s a resistor zigzag appears in the canal and a capacitor across the root wall. History nodes "1918 Custer" and "1962 Sunada" light. | THE PATIENT IS THE **CIRCUIT** · FILE · LIP CLIP · DENTIN = INSULATOR · FORAMEN · RESISTOR · CAPACITOR |
| 7.4–10.8 | **Two signals, one ratio** | The DC source becomes a slow AC source (pink); a second, fast source (cyan) pops in; long pink and short dense cyan dashes travel the loop; the scope shows the two potentials; the chip's divide sign lights (cyan dot over pink dot) and feeds the LCD; the file advances and the strip chart starts to plot a nearly vertical line. | **2** AC SIGNALS, **1 RATIO** · ROOT ZX: 0.4 + 8 kHz · RATIO falls → |
| 10.95–14.1 | **Fluid** | A jumper slides BLOOD → SALINE → NaOCl; the canal colour changes; both scope traces shrink together past their "before" ticks; the ratio dot only quivers; the LCD bar holds. | FLUID SHIFTS BOTH: **RATIO BARELY MOVES** · BLOOD · SALINE · NaOCl |
| 14.25–17.15 | **Last millimeter** | File advances to the foramen (the resistor shortens to nothing); the chart sags, then swings to the dashed set point; the fast trace shrinks more than the slow one; LCD segments march and APEX comes on with one soft ping at the foramen. | LAST ~1 mm: **RATIO DROPS** · APEX (LCD) |
| 17.3–23.35 | **Payoff** (headline fully visible 5.5 s) | Dashed ring around the apical region. Tag under the LCD (17.75), accuracy marking on the chip (18.3), radiograph caution (19.9). | IT SENSES THE **FORAMEN REGION** · SCALE: NOT MILLIMETERS · ROOT ZX, IN VIVO ~70–100% WITHIN ±0.5 mm · SMALL STUDIES, NOT POOLED · CONFIRM WITH A RADIOGRAPH |
| 23.1–24 | **Loop** | Payoff text fades first (23.1–23.4), then the board returns to its start state and the title wipes back in (23.55). Last frame equals frame 0. | |

Persistent: `@natebrooksendo` on the LCD bezel; "SCHEMATIC · NOT TO SCALE" (23 px) beside the root for the whole reel;
history strip; one source line at a time (24 px) bottom left.

Reading times (`Kit.readSecs` needed / fully visible): hook 3.2 / 3.0 (+0.1 at the loop); circuit 2.3 / 3.4;
2 signals 2.3 / 2.8; fluid 2.6 / 2.6; last mm 2.3 / 2.3; payoff headline 2.3 / 5.5; scale tag 1.7 / 5.0;
accuracy marking 4.4 / 4.45; radiograph 2.0 / 2.85.

Must-read words: 72 (headlines 34, diagram labels 19 including APEX on the LCD, payoff items 19), plus 9 in the
persistent history strip.

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
| ROOT ZX: 0.4 + 8 kHz (scope tags 0.4k, 8k) | Oishi A, Yoshioka T, Kobayashi C, Suda H. J Endod 2002;28:361-364. PMID 12026919 (not in the 1994 abstract) [C6] | abstract |
| FLUID SHIFTS BOTH: RATIO BARELY MOVES (blood, saline, NaOCl) | Kobayashi & Suda 1994, PMID 7996080: quotient "only negligibly influenced by the electrolyte present in the canal" [C11] | abstract |
| LAST ~1 mm: RATIO DROPS · "in vivo, 21 canals" | Rambo MVH, Gamba HR, Borba GB, Maia JM, Ramos CAS. Biomed Eng Online 2010;9:46. PMID 20819212 [C7] | full text |
| IT SENSES THE FORAMEN REGION | Ounsi HF, Naaman A. Int Endod J 1999;32:120-123. PMID 10371907 (in vitro); Rambo 2010, PMID 20819212 [M2] | abstract; full text |
| SCALE: NOT MILLIMETERS | J. Morita ROOT ZX II operation instructions: "The numerals on the meter gauge do not represent millimeters." Manufacturer document for one device, not a PubMed source [M1] | manufacturer text |
| ROOT ZX, IN VIVO ~70–100% WITHIN ±0.5 mm · SMALL STUDIES, NOT POOLED | Range of 16 in vivo abstracts (list below) [A7] | abstracts |
| CONFIRM WITH A RADIOGRAPH | Martins JNR, Marques D, Mata A, Caramês J. J Endod 2014;40:759-777. PMID 24862702; ROOT ZX II instructions [A9, M1] | abstract; manufacturer text |
| 1918 CUSTER (cell symbol = direct current) | Custer LE. Dent Regist 1918;72:420-425. PMID 33703181 [H1] | full text |
| 1962 SUNADA (cell symbol) | Sunada I. J Dent Res 1962;41:375-387. Not in PubMed; bibliographic record plus secondary full text only (Rambo 2010; Nasiri & Wrbas 2022). Name, year and "DC" only; no kΩ value [H3] | record + secondary |
| AC IMPEDANCE (no year) | Nasiri & Wrbas 2022, PMID 35068894; Nekoofar 2006, PMID 16872454 [H5, H7] | full text; abstract |
| 1994 RATIO METHOD | Kobayashi & Suda 1994, PMID 7996080 (date of the J Endod paper; not called "first") [H6] | abstract |

**The 70–100% range** (Root ZX family, hand files, percentage of readings within ±0.5 mm of that study's landmark):
Shabahang 1996 J Endod (PMID 9198419) 96.2%; Dunlap 1998 J Endod (9487868) 82.3%; Pagavino 1998 J Endod (9693591)
82.75%; Welk 2003 J Endod (12929694) 90.7%; Tselnik 2005 J Endod (15980709) 75%; Haffner 2005 J Dent (16139692) 78%;
Wrbas 2007 Int Endod J (17229119) 75%; Kim 2008 Oral Surg (18329572) 84%; Vieyra 2010 Int Endod J (20002800) 100%;
Stöber 2011 J Endod (21496657) 72%; Piasecki 2011 J Endod (21846536) 83% and 100%; Vasconcelos 2014 Braz Dent J
(24789285) 75%; Saatchi 2014 J Endod (24565652) 93%; Swapna 2015 J Conserv Dent (26180412) 96.6%; De-Deus 2022 J Endod
(35780927) 81.8%; De-Deus 2023 J Endod (36848949) 100%. Not pooled; landmark is the foramen in some studies and the
constriction in others; most have 11–40 teeth. With rotary NiTi files one study found 50% (Siu 2009, PMID 19567315).

## What is schematic (tagged "SCHEMATIC · NOT TO SCALE" on screen throughout)
- One resistor plus one capacitor is a teaching model; published models use R–C networks and constant-phase elements
  (Krizaj 2004, PMID 15042627). No component values are shown. The capacitor's position across the root wall is a
  drawing choice.
- The ratio curve is a toy function shaped after Rambo 2010, Table 2 (slow sag from 3 mm, steep step in the last
  0.5 mm). No digits, no axis numbers. The LCD bar is drawn as linear in that toy ratio.
- Scope amplitudes are arbitrary units. The fast trace is drawn slightly smaller than the slow one from the start (the
  quotient is not 1 in the coronal canal) and both shrink as the file advances.
- Fluid gains are illustrative. NaOCl as the most conductive of the three follows Shin et al., Restor Dent Endod
  2012;37:149-154 (PMID 23431125, abstract: 5.25% NaOCl had the highest conductivity of five irrigants); the small
  blood-to-saline step has no endodontic source and is only there to show both traces moving together.
- The drawn wavelengths differ 5.6-fold; the real frequencies differ 20-fold.
- The tooth is not to scale: the file travels about 5 "mm" at 45 px per mm.
- A single apical foramen is drawn. Real roots can also leak current through lateral canals, cracks and perforations,
  and dentin is not a perfect insulator.
- The LCD is an original design (wedge bar, no numerals), not a copy of a commercial display.

## Kept off screen on purpose (see RESEARCH.md "Do not claim")
No kΩ value for Sunada, no quotient value, no Rambo ratio numbers, no "cancels", no "0.5 = constriction", no generation
numbers, no "first", no dry-canal state, no pooled accuracy figure, nothing about pacemakers.

Nuance for replies or a longer caption: constriction-versus-foramen is disputed (Hoer & Attin 2004, PMID 14871179);
readings run short with a wide-open apex (Ebrahim 2006, PMID 17037894); a file touching metal or a flooded chamber
shorts the circuit, and a perforation can read APEX (manufacturer instructions; Gordon & Chandler 2004, PMID 15189431);
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
  dot to the file tip, so "flat, then drops" needs no numbers.
- **Silkscreen that is pre-printed.** The chart axes and the history strip are faint from frame 0 and brighten when
  used, like real board markings.
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

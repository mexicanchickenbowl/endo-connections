# 23 — Digital intraoral X-ray sensor: photons to pixels (CMOS/CCD and PSP) — evidence brief

Research stage only (no build). Journal facts below are based on articles retrieved from PubMed (abstracts via the
PubMed tools / NCBI E-utilities; full text where stated). DOIs are given as links for every PubMed item.
Date of search: 2026-11-22.

**Fact-check status (2026-11-22):** every PMID, first author, year, journal, volume and page in this file was
re-checked against PubMed metadata and abstracts; Leblans 2011, Dashpuntsag 2017 and Kamburoğlu 2022 were re-read in
PMC full text; the textbook, IAEA and ADA quotes were re-read in the source texts. No wrong PMID or citation was
found. What changed: the "PSP = wider latitude" comparison was downgraded (newer DMFR evidence, 2022–2023), several
omitted caveats and denominators were added, and a few items moved to "Do not claim". Rows changed by the
fact-check are marked **[FC]**; the full list is in the **Fact-check log** at the end of this file.

**How to read the "verified from" column**

- **abstract** = the statement is in the PubMed abstract (I read it; full text not read).
- **full text** = I read the passage in the full text (source named).
- **textbook** = White SC, Pharoah MJ. *Oral Radiology: Principles and Interpretation*, 7th ed. St Louis: Elsevier
  Mosby; 2014. Chapter 4 "Digital Imaging" (Ludlow JB, Mol A). I read the chapter text through an online reproduction
  (pocketdentistry.com/4-digital-imaging/, posted Jan 2015). Only the first part of the chapter was accessible
  (intro, solid-state detectors, PSP, contrast resolution, first lines of spatial resolution). The sections
  "Detector latitude" and "Detector sensitivity" were **not** readable, page numbers were not checked, and the
  8th (Mallya & Lam, 2019) and 9th (Lam & Mallya; released Nov 2024–Feb 2025 depending on the Elsevier page, so do
  not print a year for it) editions were not checked. Cite it as a textbook, 7th ed.
  **[FC]** The reproduction is not the printed book: quotes match the online text, but the printed page was never
  seen. Fig. 4-3 (the exploded sensor, source of "to reduce image noise") is a manufacturer-supplied figure
  ("Courtesy XDR Radiology"), i.e. textbook-reproduced manufacturer wording, not an independent measurement.
- **handbook** (listed as textbook-level) = Rowlands JA, Neitzel U. Ch. 7 "Receptors for projection radiography", in
  Dance DR et al. (eds), *Diagnostic Radiology Physics: A Handbook for Teachers and Students*. Vienna: IAEA; 2014
  (free PDF, text read).
- **guideline** = ADA expert panel, Benavides et al., JADA 2024 (full text read).
- **NOT VERIFIED** = could not be confirmed in a citable source in this session; keep off screen.

---

## (a) Verified facts

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Confidence |
|---|---|---|---|---|---|
| 1 | Layer stack of a solid-state sensor: housing → scintillator → fiber-optic plate → CMOS chip → read-out electronics | White & Pharoah 7th ed., Ch. 4, Fig. 4-3 caption ("Exploded view of CMOS sensor") | "The front and back housings form a watertight and light-tight barrier… The scintillator screen fluoresces when exposed to x-rays and forms a visible light radiographic image. The fiberoptic face plate couples the scintillator screen to the CMOS chip to reduce image noise. The CMOS imaging chip captures the light from the scintillator and creates a charge in each pixel proportional to the exposure. The sensor electronics read the charge in each pixel and transmits it to a computer." | textbook | high |
| 2 | Scintillator: X-ray → visible light (silicon alone absorbs X-rays poorly) | White & Pharoah 7th ed., Ch. 4 | "Because CCD detectors are more sensitive to light than to x rays, most manufacturers use a layer of scintillating material coated directly on the CCD surface or coupled to the surface by fiberoptics. This scintillating material increases the x-ray absorption efficiency of the detector." | textbook | high |
| 3 | Scintillator materials: cesium iodide (CsI:Tl) or gadolinium oxysulfide (Gd₂O₂S:Tb, "GOS") | Farman TT et al., Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99:608-13, PMID 15829886, [doi](https://doi.org/10.1016/j.tripleo.2004.08.013); Farman TT et al., same journal 2006;101:219-23, PMID 16448925, [doi](https://doi.org/10.1016/j.tripleo.2005.07.032) | Intraoral CCD (19.5 µm pixels) tested with "thallium-doped cesium iodide (CsI)" and "terbium-doped gadolinium oxysulfide (GOS)" screens (GOS called "commercially available") plus a third, experimental ceramic (Lu₂O₃:Eu, "TOC"). **[FC]** The materials are named in both abstracts; the DQE numbers are in the 2006 paper only and need their spatial frequency: peak DQE 22% at 2 cycles/mm (CsI) vs 10% at 1 cycle/mm (GOS); TOC 62% at 5 cycles/mm (one CCD, 70 kVp, bench). Caption-level only, never on screen without the frequency. | abstract | high (materials); numbers = one bench set-up |
| 4 | Fiber-optic plate: carries the light image to the chip; less noise | White & Pharoah 7th ed., Ch. 4, Fig. 4-3 and Fig. 4-4 captions | CMOS figure: couples scintillator to chip "to reduce image noise". CCD figure: "…a scintillating material to improve x-ray capture efficiency and fiberoptics to improve resolution." **[FC]** Fig. 4-3 is a manufacturer-supplied figure ("Courtesy XDR Radiology"); no PubMed-indexed dental paper was found that measures the plate's effect (PubMed search 2026-11-22 returned nothing). Not every sensor has one (row 2: scintillator may be "coated directly"). | textbook (manufacturer figure caption) | medium-high for "less noise" as textbook wording; see correction 1 for "protects the chip" |
| 5 | CCD: charge is passed pixel-to-pixel ("bucket brigade") to one read-out amplifier | White & Pharoah 7th ed., Ch. 4 | "The image is read by transferring each row of pixel charges from one pixel to the next in a 'bucket brigade' fashion. As a charge reaches the end of its row, it is transferred to a readout amplifier and transmitted as a voltage to the analog-to-digital converter…" | textbook | high |
| 6 | CMOS: every pixel has its own transistor and is read individually | White & Pharoah 7th ed., Ch. 4; physics support: Arvanitis CD et al., Med Phys 2007;34:4612-25, PMID 18196789, [doi](https://doi.org/10.1118/1.2804744) | W&P: "Each pixel is isolated from its neighboring pixels and is directly connected to a transistor… The voltage in each transistor can be addressed separately." Arvanitis: "standard three transistor CMOS active pixel sensor array… structured CsI:Tl phosphors… optically coupled via a fiber optic plate to the array" (mammography bench detector, not dental). | textbook + abstract | high |
| 7 | Light → electron-hole pairs → charge collected in each pixel, proportional to exposure | White & Pharoah 7th ed., Ch. 4 (text + Figs 4-5, 4-6) | "The number of electron-hole pairs that are formed is proportional to the amount of exposure… electrons… create 'charge packets'. Each packet corresponds to one pixel." Fig 4-6: "X-ray photons are absorbed in the scintillating material and are converted to light photons. Light photons are absorbed in the silicon…" | textbook | high |
| 8 | ADC: voltage → number (sampling + quantization) → gray level | White & Pharoah 7th ed., Ch. 4 | "Production of a digital image requires… analog-to-digital conversion (ADC). ADC consists of two steps: (1) sampling and (2) quantization." | textbook | high |
| 9 | Bit depth 8–16 bit (256 to 65,536 levels) — but the monitor shows 8 bit and the eye far fewer | White & Pharoah 7th ed., Ch. 4 | "Current digital detectors capture data at 8, 10, 12, or 16 bits… 256 (2⁸) to 65,536 (2¹⁶)… conventional computer monitors are capable of displaying a gray scale of only 8 bits… human visual system… only about 60 gray levels… [in the operatory] less than 30." **[FC]** Quote verified; the text adds that Windows leaves 242 displayable levels. This is a 2014 statement about "conventional computer monitors"; the 60 / 30 figures carry no reference in the text read — attribute them to the textbook, caption-only. | textbook | high as a textbook quote |
| 10 | **[FC]** Pixels as small as ≈ 20 µm (high-resolution sensors; textbook range < 20–70 µm) | Farman AG, Farman TT, Int J Comput Dent 1999;2:183-96, PMID 11351483 (no DOI in PubMed); White & Pharoah 7th ed.; **[FC added]** Kamburoğlu 2022 (PMID 35387105, PMC full text, Methods); Dashpuntsag O et al., Biomed Res Int 2017;2017:5215413, PMID 28497053, PMC5401743, [doi](https://doi.org/10.1155/2017/5215413) (Table 1) | Farman: RVG-ui CCD "of small pixel size (19.5 microns) with a caesium iodide (CsI) scintillator… spatial resolution… exceeds 20 lp/mm… recording latitude… 25:1" (a product description by the authors, abstract only). W&P: "Pixel size ranges from less than 20 to 70 micrometers (µm)." Kamburoğlu: the CMOS sensor used (Gendex GXS-700) "offers… a pixel size of 19.5 µm×19.5 µm and a theoretical resolution of 25.6 lp/mm" (specification quoted in the Methods). Dashpuntsag Table 1: CCD sensor (Megadixel) pixel size 0.02 mm; the two PSP systems 0.064 and 0.05 mm. | abstract + textbook + full text (specifications quoted in papers, not measured by them) | high for "about 20 µm exists and is common in high-resolution sensors"; ≈ 20 µm is the small end of the textbook range, not a universal value |
| 11 | 20 µm pixels → 25 lp/mm is the theoretical ceiling (two pixels per line pair) | White & Pharoah 7th ed., Ch. 4 (rule) + arithmetic; **[FC added]** Kamburoğlu 2022 Methods (19.5 µm → "theoretical resolution of 25.6 lp/mm"; 35 µm PSP scan pixel → "14.3-lp/mm theoretical spatial resolution") | "At least two columns of pixels are required to resolve a line pair." 1 / (2 × 0.020 mm) = 25 lp/mm (19.5 µm → 25.6). The textbook's own worked example sits behind the paywalled part of the reproduction and was not read. | textbook (rule) / calculation / full text (specification) | high (as a theoretical limit only) |
| 12 | Measured resolution is lower than the pixel-size limit | Brüllmann DD et al., Oral Surg Oral Med Oral Pathol Oral Radiol 2013;115:e55-61, PMID 23706925, [doi](https://doi.org/10.1016/j.oooo.2013.03.007) | Five commercial sensors, stripe patterns 2.5–20 LP/mm: calculated 10%-contrast frequency 9.9, 10.3 (CCD), 13.9, 18.8 and 29.52 LP/mm (the last is extrapolated beyond the test pattern). "…the spatial frequency at 10% contrast was much lower than the theoretical resolution computed from the pixel size." **[FC]** The abstract gives no pixel sizes. The 29.52 LP/mm value (Dexis Platinum) is a logistic-regression estimate beyond the 20 LP/mm top of the test pattern and above the 25–26 lp/mm ceiling of a ≈ 20 µm pixel, so it contradicts the abstract's own conclusion for that sensor; never quote it as a resolution. Usable range from this paper: four of five sensors at 9.9–18.8 LP/mm (10% contrast). | abstract | high for "measured is lower" as the authors' conclusion; single technical note, five sensors |
| 13 | Best detectors resolve ≈ 20 lp/mm on a test grid — as good as film | Farman AG, Farman TT, Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99:485-9, PMID 15772598, [doi](https://doi.org/10.1016/j.tripleo.2004.04.002) | 18 detectors (CCD, CMOS, PSP, film); test grid range 1.5–20 lp/mm. "The highest spatial resolution was found with Kodak InSight film, RVG-ui (CCD), and RVG 6000 (CMOS) detectors, each of which achieved 20 lp/mm" (= top of the grid). "These findings were independent of the modality applied." | abstract | high |
| 14 | Film > 20 lp/mm; unaided eye ≈ 6 lp/mm (textbook) | White & Pharoah 7th ed., Ch. 4; contrast with Künzel A et al., Dentomaxillofac Radiol 2003;32:385-9, PMID 15070841, [doi](https://doi.org/10.1259/dmfr/22478778) | W&P: "Typical observers are able to distinguish about 6 lp/mm without benefit of magnification. Intraoral film is capable of providing more than 20 lp/mm." Künzel: 40 dental students resolved a mean of 11.7 lp/mm on film with the naked eye (pattern up to 16.6 lp/mm). | textbook + abstract | medium (the two sources disagree — see controversies) |
| 15 | PSP plate = europium-doped barium fluorohalide (BaFBr:Eu²⁺) on a film-like polyester base | White & Pharoah 7th ed., Ch. 4; Leblans P et al., Materials (Basel) 2011;4:1034-86, PMID 28879966, PMC5448636, [doi](https://doi.org/10.3390/ma4061034); IAEA handbook Ch. 7 | W&P: "The PSP material used for radiographic imaging is 'europium-doped' barium fluorohalide… For intraoral radiography, a polyester base similar to radiographic film is used." IAEA: "Most photostimulable phosphors are in the barium fluorohalide family, typically BaFBr:Eu." **[FC]** The dental textbook names only the family ("Barium in combination with iodine, chlorine, or bromine"); the exact formula BaFBr:Eu²⁺ comes from the two medical computed-radiography sources (Leblans — Agfa HealthCare authors, no dental content; IAEA handbook). On screen prefer "Eu-doped barium fluorohalide"; if the formula is shown, add "typically". | textbook + full text + handbook | high for "Eu-doped barium fluorohalide"; medium for the exact formula in dental plates |
| 16 | X-rays leave trapped electrons = latent image | White & Pharoah 7th ed.; Leblans 2011; IAEA Ch. 7 | W&P: electrons "migrate to nearby halogen vacancies (F-centers)… trapped there in a metastable state… the number of trapped electrons is proportional to x-ray exposure and represents a latent image." Leblans: "Absorbed X-ray energy is stored in crystal defects." | textbook + full text | high |
| 17 | Read-out: red laser scans the plate (≈ 630–680 nm) | Leblans 2011 (full text); White & Pharoah 7th ed.; IAEA Ch. 7 | Leblans: "A red laser beam is moved over the plate…"; "HeNe laser (633 nm) or diode lasers (650 nm–680 nm)". W&P: "stimulated by red light of around 600 nm". IAEA: "red laser beam flying spot scanning system". | full text + textbook | high |
| 18 | Plate answers with blue-violet light (≈ 390 nm) | Leblans 2011 (full text + abstract); IAEA Ch. 7 | Leblans abstract: "In read-out the energy is set free as blue photons upon optical stimulation." Full text: excited Eu²⁺ "decays emitting the characteristic 390 nm luminescence." IAEA: "photostimulated light (usually blue)". NB W&P 7th ed. wording differs: "energy is released in the green spectrum between 300 and 500 nm" (see correction 6). **[FC]** 390 nm is the BaFBr:Eu²⁺ value from a medical CR review; it is at the violet / near-UV edge, so "blue-violet" (or the sources' own word, "blue") is fine, and the wavelength itself should stay off screen because the board textbook prints a different description. | full text + handbook (medical CR sources) | high for "blue / blue-violet"; wavelength caption-only |
| 19 | Light guide → photomultiplier tube → voltage → ADC | Leblans 2011 (full text); White & Pharoah 7th ed.; IAEA Ch. 7 | Leblans: "A light guide transfers the emitted light to a photomultiplier tube (PMT). A filter in front of the PMT absorbs the reflected laser light and transmits the phosphor emission light… amplified, digitized." W&P: "Fiberoptics conduct light from the PSP plate to a photomultiplier tube… The voltage signal is quantified by an analog-to-digital converter." (W&P Fig. 4-8: "photomultiplier tube or diode".) | full text + textbook | high |
| 20 | Erase with bright light before reuse | White & Pharoah 7th ed.; Leblans 2011; IAEA Ch. 7 | W&P: "Before exposure, PSP plates must be erased… by flooding the plate with a bright light." Leblans: "Only roughly 50% of the stored energy (trapped charges) is released during scanning. Hence, the IP must be erased for re-use." IAEA: "the image plate is then flooded with light to erase any residual image". **[FC]** "Roughly 50%" is a statement about medical CR imaging plates (Leblans); the IAEA handbook says only "a fraction of the stored signal… depending on the laser intensity". Do not present 50% as a dental-plate measurement; caption-level at most. | textbook + full text | high for "erase with bright light"; the 50% figure is medical CR, approximate |
| 21 | Scan promptly, keep out of room light: the latent image fades | White & Pharoah 7th ed.; Leblans 2011; Akdeniz BG et al., Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99:603-7, PMID 15829885, [doi](https://doi.org/10.1016/j.tripleo.2004.10.021); Çalışkan A, Sumer AP, Dentomaxillofac Radiol 2017;46:20160188, PMID 27883287, [doi](https://doi.org/10.1259/dmfr.20160188) | W&P: "Some phosphors lose 23% of their trapped electrons after 30 minutes and 30% after 1 hour… A more important source of latent image fading is exposure to ambient light… Red safelights… are not safe for exposed PSP plates." Leblans: dark decay "between 10 and 25% in the first hour". Akdeniz (Digora): "recommended to scan… no later than 10 minutes after exposure". Çalışkan: fading was the most common ambient-light-related PSP artefact (44.1% of that group; 2100 radiographs). **[FC — caveat omitted by the researcher, same textbook paragraph]** W&P: "After exposure, plates should be processed as soon as possible… Because loss of trapped electrons is uniform across the plate surface, early loss of charge does not typically result in clinically meaningful image deterioration. However, underexposed images may have noticeable image degradation. Adequately exposed images may be stored for 12 to 24 hours and retain acceptable image quality." The W&P (23% / 30%) and Leblans (10–25%, medical CR plates) figures are not dental-plate measurements made by those authors; no fading percentage on screen. | textbook + full text + abstracts | high for "fades" and for "scan promptly, keep out of light" as the textbook advice; the textbook itself says early fading is usually not clinically meaningful (see controversies) |
| 22 | **[FC — downgraded]** PSP: wide exposure latitude (wider than film and than the CCD / early CMOS sensors of 1996–2004 in vitro; **not** consistently wider than contemporary sensors) | Borg E, Gröndahl HG, Dentomaxillofac Radiol 1996;25:82-8, PMID 9446978, [doi](https://doi.org/10.1259/dmfr.25.2.9446978); Berkhout WE et al., Dentomaxillofac Radiol 2004;33:1-5, PMID 15140814, [doi](https://doi.org/10.1259/dmfr/40677472); Wenzel A, Møystad A, Acta Odontol Scand 2010;68:106-14, PMID 20141365, [doi](https://doi.org/10.3109/00016350903514426); IAEA Ch. 7; **[FC added]** Borg E, Attaelmanan A, Gröndahl HG, Dentomaxillofac Radiol 2000;29:70-5, PMID 10808218, [doi](https://doi.org/10.1038/sj/dmfr/4600501); Marinho-Vieira LE et al., Dentomaxillofac Radiol 2022;51:20210404, PMID 34860568, [doi](https://doi.org/10.1259/dmfr.20210404) | Borg 1996: "Higher image quality was achieved over a much wider exposure range with the storage phosphor system than with either film or the CCD systems" (dried mandibles, relative exposure 1–100; film vs two CCD systems vs one PSP system). Borg 2000 (six systems incl. one CMOS-APS, dried mandibles): "the PSP systems provided a clinically acceptable image quality over a wide exposure range". Berkhout 2004 (dry bone specimens, two solid-state and two PSP systems): solid-state exposure range "narrow", phosphor plate range "very wide". Wenzel 2010 (systematic review, search to Aug 2009): "the dynamic range may be wider with… PSP plates but not with sensors". IAEA (medical CR): PSP systems have "a very high dynamic range". Marinho-Vieira 2022 (two sensor and three PSP contemporary systems, human mandibles + aluminum step wedge, gray-value analysis): "Photostimulable phosphor plate-based digital radiographic systems had a broader dynamic range." **But see row 23: the same group's observer study (2023) concluded PSP systems "may not necessarily have a wider range than sensor-based systems".** | abstracts + handbook (all in vitro / ex vivo) | high for "PSP has a wide latitude"; **medium / contested for "wider than sensors"** — do not put the comparative on screen without "vs film and older CCD sensors, in vitro" |
| 23 | …but some CMOS sensors match PSP latitude, and wide latitude hides over-exposure | Farman & Farman 2005 (PMID 15772598); Berkhout 2004 (PMID 15140814); **[FC added]** Marinho-Vieira LE et al., Dentomaxillofac Radiol 2023;52:20220370, PMID 36988093, [doi](https://doi.org/10.1259/dmfr.20220370) | **[FC]** Marinho-Vieira 2023 (500 radiographs, 10 exposure times, 5 systems, 5 observers; acceptable = at least 4 of 5 observers): acceptable original images at 6 exposure times for Express (PSP), 5 for Digora Toto (CMOS sensor), 4 for Digora Optime (PSP), 2 for SnapShot (CMOS sensor) and 1 for VistaScan (PSP); conclusion: "PSP-based systems may not necessarily have a wider range than sensor-based systems." (System types confirmed from the abstracts of Jørgensen 2012 and Nascimento 2016.) Farman: "The greatest exposure ranges were found with photostimulable phosphors and the Kodak RVG 6000 and RVG 5000 detectors." Berkhout: "phosphor plate systems… produce good quality radiographs even at high exposure times, which may result in an unnecessarily high dose" (preferred exposure: Ektaspeed Plus film 0.52 s; solid-state 0.13 and 0.35 s; PSP 1.21 and 1.16 s). | abstract | high |
| 24 | Solid-state sensor: image appears at once; rigid, bulkier, usually cabled. PSP: thin, film-sized, cordless, needs a scanner **[FC: not "flexible like film" — see quote]** | White & Pharoah 7th ed., Ch. 4; Kamburoğlu K et al., Imaging Sci Dent 2022;52:93-101, PMID 35387105, [doi](https://doi.org/10.5624/isd.20210241) | W&P: "The key clinical feature of these detectors is the rapid availability of the image after exposure… Sensor bulk… is a potential drawback… most detectors incorporate an electronic cable." PSP plates "provide handling characteristics similar to intraoral film". Kamburoğlu (58 patients, split-mouth, one CMOS and one PSP system from the same manufacturer, round collimation): total imaging time significantly lower with CMOS; comfort 4.57 vs 4.48 (NS); subjective image quality higher with CMOS. **[FC, PMC full text]** 9 radiographs took 167.07 ± 13.84 s (CMOS) vs 234.05 ± 11.89 s (PSP); 1,044 radiographs. Introduction: "A disadvantage of CMOS detectors is their thickness, since they are bulky and rigid"; PSP "imaging plates… have the same shape and dimensions of conventional films, but the imaging plates in these systems are more rigid than film." "Cordless" and "thin" are descriptive, not quoted (W&P: wireless solid-state sensors also exist). | textbook + abstract + full text | high |
| 25 | Sensors are less comfortable than PSP or film (on average) | Wenzel & Møystad 2010 (PMID 20141365); Jørgensen PM, Wenzel A, Dentomaxillofac Radiol 2012;41:323-7, PMID 22517998, [doi](https://doi.org/10.1259/dmfr/73402308) | Wenzel SR: "patient discomfort seems to be pronounced with sensors compared with PSP plates and film, the PSP plate may be scratched in clinical use". Jørgensen (60 patients, bitewing positioning for about 10 s, 100 mm VAS): an ergonomically shaped sensor with rounded corners did not differ from film. **[FC]** In the same study film and that sensor were both significantly less uncomfortable than the storage phosphor plate (with a new soft cover) and the two other CMOS sensors; the plate did not differ from one sensor and was better than the other. So "PSP is as comfortable as film" is not supported here either. | abstract | medium (design-dependent; keep comfort off screen) |
| 26 | ADA 2024: use digital receptors instead of film; rectangular collimation | Benavides E et al., J Am Dent Assoc 2024;155:280-293.e4, PMID 38300176, [doi](https://doi.org/10.1016/j.adaj.2023.12.002) | Rec. 3.1.1.1: "Digital rather than film-based imaging should be used because digital imaging allows for lower patient radiation exposure." Text: "can decrease substantially radiation dose per acquired image. The level of dose reduction varies according to the imaging modality used… High-speed film can provide a dose reduction similar to digital imaging, with F-speed film showing a 60% reduction in dose compared with (now obsolete) D-speed film." Rectangular collimation "has been shown to reduce dose consistently by more than 40%." | guideline (full text) | high |
| 27 | Full-mouth series effective dose: 34.9 µSv (PSP or F-speed film, rectangular collimation) vs 170.7 µSv (round collimation) | Ludlow JB, Davies-Ludlow LE, White SC, J Am Dent Assoc 2008;139:1237-43, PMID 18762634, [doi](https://doi.org/10.14219/jada.archive.2008.0339) | Head-phantom dosimetry, ICRP 2007 weighting: FMX "with PSP storage or F-speed film with rectangular collimation, 34.9 µSv… round collimation, 170.7 µSv; FMX with D-speed film and round collimation, 388 µSv". (PSP is grouped with F-speed film; no solid-state intraoral sensor measured.) **[FC]** Denominator: the abstract does not give the number of images; the ADA 2024 table that reprints these values labels them "Full-mouth series—18 images, adult". Phantom dosimetry, not patients. These numbers compare collimation and film speed, not sensor vs film — do not use them as a "digital saves dose" figure. | abstract (+ guideline table for the 18-image denominator) | high |
| 28 | Real-world dose saving is smaller than the per-image saving | Berkhout WE et al., Dentomaxillofac Radiol 2003;32:124-7, PMID 12775667, [doi](https://doi.org/10.1259/dmfr/97410196); Wenzel & Møystad 2010 | Berkhout (Dutch GDP survey, 73% response): film users 32.5 radiographs/week, PSP 42.8, solid-state 48.4. "Although digital intraoral radiography requires 50-80% less radiation per exposure than film, it is likely that the effective dose reduction… is less than 25% owing to the greater numbers of radiographs taken." Wenzel SR: "a dose reduction may not be obtained, retakes and errors may be increased". | abstract | high |
| 29 | First dental CCD sensor: RadioVisioGraphy, 1987 | Mouyen F et al., Oral Surg Oral Med Oral Pathol 1989;68:238-42, PMID 2780024, [doi](https://doi.org/10.1016/0030-4220(89)90200-4); White & Pharoah 7th ed. | Mouyen: RVG "a unit based on the charged coupled device… uses considerably reduced levels of radiation… resolution is slightly lower than that with silver halide emulsion films". W&P: "The charge-coupled device (CCD), introduced to dentistry in 1987". **[FC]** The year is the textbook's; the Mouyen abstract gives no year. Kamburoğlu 2022 (introduction, full text) dates the invention of RadioVisioGraphy to 1984, so write "introduced 1987", never "invented 1987". | abstract + textbook | high for "introduced 1987" (textbook); caption-level only |
| 30 | PSP reached dentistry in 1994 | Hildebolt CF, Couture RA, Whiting BR, Dent Clin North Am 2000;44:273-97, PMID 10740769 (no DOI in PubMed) | "Photostimulable phosphor radiography… became available in dentistry in 1994." | abstract | high |
| 31 | CCD vs CMOS: similar perceived image quality | Kitagawa H, Scheetz JP, Farman AG, Dentomaxillofac Radiol 2003;32:408-11, PMID 15070845, [doi](https://doi.org/10.1259/dmfr/19990417) | Schick CMOS vs its CCD predecessor, cadaver maxilla, 9 dentists: "perceived to produce radiographic images of similar overall quality" (CMOS better for cortical bone and root apices; CCD better for root canal space). | abstract | medium (one manufacturer, 2003) |
| 32 | More bits / more lp/mm did not improve caries detection | Wenzel A, Haiter-Neto F, Gotfredsen E, Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2007;103:418-22, PMID 17321456, [doi](https://doi.org/10.1016/j.tripleo.2006.05.016) | 80 extracted teeth, histology validation: "Caries diagnostic accuracy seems to be little influenced by an increase in spatial resolution and bit depth from 8-bit to 12- or 16-bit within digital radiographic system brands." **[FC]** Systems: two PSP scanners (Digora Optime, VistaScan) and one solid-state sensor (Dixi2; its type is not stated in the abstract); 160 approximal surfaces, 6% dentinal lesions. Not a flat "no effect": one within-brand contrast was significant (VistaScan 8-bit max-resolution had higher sensitivity than its two high-resolution modes, P = .003). Say "little influence", not "no influence". | abstract | high (for small approximal caries, in vitro; "little", not "none") |
| 33 | PSP plates wear: scratches | Bedard A, Davis TD, Angelopoulos C, J Contemp Dent Pract 2004;5:57-69, PMID 15150634 (no DOI in PubMed); Wenzel & Møystad 2010 | Bedard (in vitro, 140 plates, one system): "95% of our plates were rendered non-diagnostic after only 50 uses." | abstract | low-medium (single 2004 study; do not generalize the number) |
| 34 | 15 µm pixels / "33 lp/mm" sensors | manufacturer specifications only | Not found in PubMed-indexed literature in this session. | NOT VERIFIED | — (leave off screen) |
| 35 | Sensor / plate thickness in mm | Al-Rawi W, Teich S, Compend Contin Educ Dent 2013;34:e76-83, PMID 24568289 measured it, but the abstract gives no numbers | Abstract: eight CMOS sensors compared for thickness, active area etc.; "a lack of standardization exists"; "active imaging area was smaller compared with conventional films". | NOT VERIFIED (numbers) | — (no thickness numbers on screen) |
| 36 | PSP response linear over 4–5 orders of magnitude | IAEA Ch. 7 (medical CR): "essentially linear over the four orders of magnitude relevant for diagnostic…"; Couture RA, Hildebolt CF, Dentomaxillofac Radiol 2002;31:56-62, PMID 11803390, [doi](https://doi.org/10.1038/sj/dmfr/4600659): a PSP system "calibrated over a range of 3.2 orders of magnitude" (**[FC]** dental radiology journal, but the abstract does not name the system or say it was an intraoral one) | The often-quoted "five orders of magnitude" for dental PSP was seen only in a CE article (and may be in the unread W&P "Detector latitude" section). | handbook + abstract; "5 orders" NOT VERIFIED | medium — say "wider latitude", no number |

---

## (b) Recommended on-screen facts (safe wording, ≤ ~60 must-read words in total)

*List revised by the fact-check (2026-11-22). Items 1–4 and 7 stand as written; items 5, 6 and 8 were softened.*

1. **Scintillator (CsI or Gd oxysulfide): X-ray → visible light.**
   Source line: White & Pharoah, Oral Radiology (textbook); Farman TT 2005 OOOOE for the materials.
2. **Fiber-optic plate: carries the light to the chip, cuts noise.** (Textbook wording, from a manufacturer-supplied
   figure. Do not write "blocks X-rays". Not every sensor has one — the 3-D model is "a" sensor, not "every" sensor.)
3. **CMOS chip: light → charge in each pixel. A transistor at every pixel.**
   Small inset or caption-only: "CCD: charge is handed pixel-to-pixel to one amplifier."
4. **ADC: charge → number → gray level (8–16 bit).**
5. **[FC — softened] "Pixels as small as ≈ 20 µm → ≈ 25 lp/mm in theory; measured is lower."**
   "≈ 20 µm" is the small end of the textbook range (< 20–70 µm), verified for specific sensors (19.5 µm: Farman &
   Farman 1999, Kamburoğlu 2022; 20 µm: Dashpuntsag 2017), so do not write it as if every sensor had 20 µm pixels:
   use "as small as ≈ 20 µm" or "e.g. ≈ 20 µm". "25 lp/mm" is pixel arithmetic (1 / (2 × pixel size)), always labeled
   "in theory". "Measured is lower" = Brüllmann 2013 (four of five sensors 9.9–18.8 LP/mm at 10% contrast, bench
   test). If space is short, keep only "pixels as small as ≈ 20 µm".
6. **[FC — softened] "PSP plate (Eu-doped barium fluorohalide): trapped electrons store the image → red laser scan →
   blue-violet light → photomultiplier."** (White & Pharoah for the dental plate; Leblans 2011 Materials for the
   physics — a medical computed-radiography review.) The exact formula "BaFBr:Eu²⁺" is the *typical* medical CR
   phosphor; the dental textbook names only the fluorohalide family. If the formula is shown, write
   "typically BaFBr:Eu²⁺". No wavelength on screen.
7. **Erase with bright light. Scan promptly — the latent image fades.** (Textbook: "plates should be processed as
   soon as possible"; the same paragraph adds that early fading is usually not clinically meaningful — caption, not
   screen. Do not show a fading percentage or a time limit.)
8. **[FC — comparative removed] End card: "Sensor: instant image, rigid. PSP: thin, film-sized, wide exposure
   latitude, needs a scanner."**
   Write **"wide"**, not "wider". "Wider than sensors" rests on in vitro studies of 1996–2004 CCD / early CMOS
   sensors (Borg 1996, Borg 2000, Berkhout 2004) and is contradicted for some sensors (Farman & Farman 2005) and
   questioned for contemporary systems (Marinho-Vieira 2023: PSP systems "may not necessarily have a wider range
   than sensor-based systems"). Do not write "flexible": plates are "more rigid than film" (Kamburoğlu 2022).
   Sources: White & Pharoah; Berkhout 2004 DMFR ("very wide"); Borg 2000 DMFR ("wide exposure range");
   Marinho-Vieira 2022 and 2023 DMFR.

Mandatory small print inside the safe area whenever the 3-D model is on screen: **"schematic · not to scale"**.
At most one source line per scene, e.g. "White & Pharoah, Oral Radiology 7e (textbook)", "Leblans 2011, Materials",
"Berkhout 2004, DMFR" (end card; **[FC]** replaces "Borg & Gröndahl 1996, DMFR", which supports only the comparison
with film and two 1996 CCD systems).

Board-relevant items for the caption / NOTES.md rather than the screen: CCD introduced to dentistry in 1987 (RVG;
textbook date) and PSP in 1994 (Hildebolt 2000); display is 8-bit and the eye sees < 60 grays (textbook, 2014); ADA
2024 recommendation for digital receptors and rectangular collimation; dose saving is real per image but not
automatic per patient; PSP latitude is wide, but whether it beats today's sensors is system-dependent
(Marinho-Vieira 2022, 2023).

---

## (c) Corrections to the brief

1. **"Fiber-optic faceplate protecting the chip" — re-word.** The textbook gives the function as coupling the
   scintillator to the chip "to reduce image noise" (CMOS figure) and "to improve resolution" (CCD figure). The
   engineering explanation (the glass absorbs X-rays that pass through the scintillator, so they do not hit the
   silicon directly) was found only in patents/engineering sources, not in a peer-reviewed dental or textbook source
   read in this session. Also not universal: the scintillator can be "coated directly on the CCD surface or coupled…
   by fiberoptics" (W&P). Say "many sensors", and "cuts noise", not "protects the chip".
2. **"CMOS active pixel (amplifier at each pixel)" — soften.** Textbook wording is "each pixel is… directly connected
   to a transistor" and read individually. "Active pixel sensor" is the engineering term (Arvanitis 2007: "three
   transistor CMOS active pixel sensor"). On screen: "a transistor at every pixel".
3. **"Pixel sizes around 15–20 µm" — only ≈ 20 µm is verified.** 19.5 µm (Farman & Farman 1999; Farman TT 2005/2006);
   W&P: "less than 20 to 70 µm". 15 µm is a manufacturer figure that I could not confirm in indexed literature.
   **[FC]** Two more peer-reviewed papers quote ≈ 20 µm sensor specifications (19.5 µm, Kamburoğlu 2022; 0.02 mm,
   Dashpuntsag 2017). "≈ 20 µm" is therefore the verified small end of the range, not the size of every sensor:
   on screen "as small as ≈ 20 µm".
4. **Resolution: separate theoretical from measured.** Theoretical ceiling = 1/(2 × pixel) (25 lp/mm at 20 µm).
   Measured 10%-contrast values for four of five sensors were 9.9–18.8 LP/mm, well under the pixel-size limit
   (Brüllmann 2013; **[FC]** the fifth value, 29.52 LP/mm, is an extrapolation beyond the 20 LP/mm test pattern and
   above the pixel-size ceiling — never quote it); the best of 18 detectors reached 20 lp/mm, the top of the test
   grid (Farman & Farman 2005).
   Nominal lp/mm values quoted for systems (e.g. "Digora Optime (14.3 lp/mm)" PSP and "Digora Toto (26.3 lp/mm)"
   CMOS in Nejaim Y et al., Dent Traumatol 2016;32:180-4, PMID 26542421,
   [doi](https://doi.org/10.1111/edt.12243)) match pixel-size arithmetic for about 35 µm and 19 µm pixels. That
   match is my inference; the abstract gives no pixel sizes. Treat such figures as nominal, not measured.
   **[FC]** The inference is corroborated for another PSP scanner: Kamburoğlu 2022 (Methods) gives "35 µm (super
   resolution) pixel size, and a 14.3-lp/mm theoretical spatial resolution" — i.e. these are theoretical values.
5. **Bit depth "8 to 12–16 bit"** → textbook list is "8, 10, 12, or 16 bits". **[FC — corrected detail]** In
   Dashpuntsag O et al., Biomed Res Int 2017;2017:5215413 (PMID 28497053,
   [doi](https://doi.org/10.1155/2017/5215413), full text, Table 1) one PSP system (Digora Optime) **and the CCD
   sensor** (Megadixel) read at 14 bit and output 8 bit, while the other PSP system (VistaScan) reads and outputs
   16 bit — so this is not a PSP-only feature. Higher bit depth is not visible as such: 8-bit display, < 60
   distinguishable grays (textbook).
6. **"Read by a red laser emitting blue-violet light" — wrong subject.** The red laser *stimulates*; the *plate*
   emits the blue-violet light (peak ≈ 390 nm, Leblans 2011). Note for board study: the W&P 7th-ed. text calls the
   emission "the green spectrum between 300 and 500 nm" — the numeric range fits violet-blue, the color word does
   not match the physics literature (Leblans 2011; IAEA handbook: "usually blue"). On screen use "blue-violet".
7. **Laser wavelength.** W&P: "around 600 nm"; physics: HeNe 633 nm or diode 650–680 nm. "Red laser" is enough.
8. **[FC — strengthened] "Wider dynamic range/latitude": say "wide", not "wider".** PSP latitude is wide (Borg
   2000; Berkhout 2004; IAEA handbook) and was wider than film and the CCD sensors of 1996–2004 in vitro (Borg
   1996; Berkhout 2004). It is not exclusive to PSP: some CMOS sensors had exposure ranges as wide as PSP (Farman
   & Farman 2005). For contemporary systems the evidence is split within one research group: gray-value analysis
   found PSP systems "had a broader dynamic range" (Marinho-Vieira 2022), but the companion observer study
   ("part 2") concluded PSP systems "may not necessarily have a wider range than sensor-based systems"
   (Marinho-Vieira 2023). The wide PSP latitude can also hide over-exposure (Berkhout 2004).
9. **Dose vs film: no percentage on screen.** ADA 2024 says digital "allows for lower patient radiation exposure"
   and that the reduction "varies"; "high-speed film can provide a dose reduction similar to digital imaging". The
   systematic review (Wenzel & Møystad 2010) concludes "a dose reduction may not be obtained" in practice (more
   images, more retakes). Ludlow 2008 groups PSP with F-speed film at the same full-mouth effective dose.
10. **"Indirect conversion" vs dental "direct/indirect digital" — avoid both words on screen.** Physics: scintillator
    sensors are *indirect-conversion* detectors (X-ray → light → charge). Dental usage is the opposite-sounding:
    CCD/CMOS = "direct" digital, PSP = "indirect" digital (e.g. Shah N et al., World J Radiol 2014;6:794-807,
    PMID 25349663, [doi](https://doi.org/10.4329/wjr.v6.i10.794), full text). A viewer will misread either label.
    **[FC]** Verified: Shah 2014 lists "CCD… (direct system)… CMOS… (direct system)… PSP… (indirect system)";
    Kamburoğlu 2022 (full text) uses the same dental convention ("direct digital radiography (DR), which uses
    solid-state detectors"; "semi-direct phosphor plate detectors"); the Vandenberghe 2010 abstract also speaks of
    "digital indirect and direct receptors" without defining them.
11. **Gadolinium oxysulfide is right** (Farman TT 2005/2006). The W&P 7th-ed. CCD paragraph prints "gadolinium
    oxybromide compounds… or cesium iodide" while its flat-panel paragraph says "gadolinium oxysulfide or cesium
    iodide"; follow the peer-reviewed wording (Gd₂O₂S:Tb).
12. **"Erased with bright light"** — correct; add that reading releases only about half of the stored energy
    (Leblans 2011, **[FC]** a statement about medical CR plates; the IAEA handbook says only "a fraction"), which
    is why erasure is needed before re-use. Caption-level, with "roughly" and without calling it a dental
    measurement.
13. **History dates.** CCD in dentistry 1987 (RVG); PSP 1994. The PubMed abstract of Sanderink GC, Miles DA, Dent
    Clin North Am 2000;44:249-55 (PMID 10740767) says the first real-time intraoral detectors "were introduced in
    1997" — inconsistent with Mouyen 1989; do not cite it for the date. **[FC]** "1987" is the textbook's date for
    the *introduction* of the CCD to dentistry; Kamburoğlu 2022 (full text) dates the *invention* of
    RadioVisioGraphy to 1984. Write "introduced 1987 (textbook)"; never "invented 1987".
14. **Scintillator flash color.** No dental source read here states it. **[FC — re-sourced]** Gd₂O₂S:Tb: the IAEA
    handbook (Ch. 7, screens) states it emits "green light quanta (E = 2.4 eV)… The green emission from the rare
    earth phosphors" — citable. CsI:Tl: green in standard scintillator physics, but no source read in this session
    says so explicitly; the Arvanitis 2007 abstract only reports the chip's quantum efficiency "at 530 nm" and,
    separately, that CsI:Tl screens were coupled to it — the link between the two is an inference. Rendering the
    flashes green is consistent; do not print a wavelength or a color word as a fact.
15. **[FC — new] "PSP thin and flexible" — drop "flexible".** Dental plates have film-like size and handling
    (W&P) but are "more rigid than film" (Kamburoğlu 2022, full text), and surface damage is documented: scratches
    (Wenzel & Møystad 2010; Bedard 2004) and "peeling of the plate borders" (Çalışkan 2017). No source read here
    says plates may be bent. Do not animate the plate bending; write "thin, film-sized".
16. **[FC — new] Source types.** The PSP physics numbers (633 / 650–680 nm, 390 nm, "roughly 50%", dark decay
    10–25% in the first hour) come from a medical computed-radiography review written by Agfa HealthCare authors
    (Leblans 2011) with no dental content; they describe the phosphor family, not a measurement on dental plates.
    Fine for the mechanism; keep the numbers out of the on-screen text.

---

## (d) Controversies and caveats (do not overstate)

- **Dose.** Per-image dose can be lower with digital receptors, but net patient dose depends on film speed used as
  comparator, collimation, exposure settings, retakes and the number of images. Solid-state users took the most
  radiographs per week in the Dutch survey (Berkhout 2003). PSP gives pleasing images when over-exposed; observers
  actually preferred PSP images made at *longer* exposure than E-speed film (Berkhout 2004). **[FC — re-worded]**
  In Ludlow 2008 (phantom, 18-image full-mouth series) rectangular vs round collimation changed the effective dose
  about 4.9-fold (34.9 vs 170.7 µSv), more than going from D-speed film to PSP / F-speed film with round
  collimation (388 vs 170.7 µSv, about 2.3-fold). That study did not measure a solid-state sensor and grouped PSP
  with F-speed film, so it says nothing about "sensor vs film"; the ratios are my arithmetic from the abstract.
- **[FC — new] Latitude: is PSP really wider than a sensor?** The classic answer (yes) comes from in vitro work on
  1996–2004 hardware (Borg 1996; Borg 2000; Berkhout 2004) and the 2010 systematic review that summarized it.
  Farman & Farman 2005 already found two solid-state sensors (RVG 6000, labeled CMOS in the abstract, and RVG 5000)
  with exposure ranges as wide as PSP. For contemporary systems
  one group reported a broader dynamic range for PSP by gray-value analysis (Marinho-Vieira 2022) but, in the
  companion observer study, that "PSP-based systems may not necessarily have a wider range than
  sensor-based systems" (Marinho-Vieira 2023). All of this is ex vivo. On screen: "wide latitude", no comparison.
- **Resolution numbers.** lp/mm depends on the test object, the contrast criterion (visual vs 10% contrast), scan
  mode (PSP) and software filters. Systems "varied greatly in latitude, 'optimal' exposure, and image quality"
  (Udupa H et al., Oral Surg Oral Med Oral Pathol Oral Radiol 2013;116:774-83, PMID 24237729,
  [doi](https://doi.org/10.1016/j.oooo.2013.08.019); 20 systems; abstract has no per-system numbers).
- **Does resolution matter clinically?** Mostly not for caries (Wenzel 2007); film, CCD and PSP performed similarly
  for proximal caries (Şenel B et al., Dentomaxillofac Radiol 2010;39:501-11, PMID 21062944,
  [doi](https://doi.org/10.1259/dmfr/28628723)). One ex vivo study found better horizontal root fracture detection
  with the higher-resolution CMOS system and its own software (Nejaim 2016).
- **Unaided-eye limit.** Textbook: about 6 lp/mm. Künzel 2003: mean 11.7 lp/mm with the naked eye on film. Do not
  put either on screen as a hard limit.
- **PSP fading.** Signal loss is real (W&P; Leblans), but clinical effect varies by system, and **[FC]** the
  textbook itself plays it down: early loss "does not typically result in clinically meaningful image
  deterioration… Adequately exposed images may be stored for 12 to 24 hours and retain acceptable image quality";
  it names ambient light as the more important cause. Digora — scan within 10 min (Akdeniz 2005; 15 plates, gray
  values only); a second Digora step-wedge study (Akdeniz BG, Gröndahl HG, Dentomaxillofac
  Radiol 2006;35:74-7, PMID 16549432, [doi](https://doi.org/10.1259/dmfr/51534985)) is internally inconsistent
  **[FC — corrected]**: its Results say plates scanned after half an hour were *not* significantly different from
  immediate scans and only longer delays were, while its Conclusion says "half an hour or longer" — so cite it as
  "significant change at delays beyond 30 min", not "at ≥ 30 min"; DenOptix — no loss of
  diagnostic quality for file-tip/apex measurement up to 168 h (Ang DB et al., Oral Surg Oral Med Oral Pathol Oral
  Radiol Endod 2006;102:673-9, PMID 17052646, [doi](https://doi.org/10.1016/j.tripleo.2005.11.002)); VRF diagnosis
  affected only at a 4-h delay (Nascimento HA et al., Int Endod J 2016;49:973-9, PMID 26354080,
  [doi](https://doi.org/10.1111/iej.12547); **[FC]** 40 extracted teeth, two PSP systems, only the area under the
  ROC curve was lower at 4 h — sensitivity, specificity and accuracy did not differ). All of these are in vitro.
  Safe wording: "scan promptly".
- **Comfort.** Sensors score worse on average (Wenzel & Møystad 2010), but shape matters (Jørgensen & Wenzel 2012:
  a rounded sensor equaled film, and **[FC]** film beat the phosphor plate in that study) and one clinical
  split-mouth study found no comfort difference between a CMOS sensor and PSP (Kamburoğlu 2022). Keep comfort off
  screen.
- **CCD vs CMOS.** No good evidence that one gives better diagnostic images (Kitagawa 2003). "CMOS has replaced CCD"
  is market history, not something I verified with a citation — keep it off screen.
- **Textbook edition.** All textbook quotes are from the 7th edition (2014) via an online reproduction; wording in
  the 8th/9th editions may differ. The resident should check the edition used for boards.
- **The reel's model is a schematic.** Layer thicknesses, the number of photons, well filling and "pixel-by-pixel"
  image build-up are illustrative; real read-out is electronic and the image is "available to view in a matter of
  seconds after the exposure" (Kamburoğlu 2022, full text; **[FC]** the earlier "fraction of a second" had no
  source for intraoral sensors).

---

## (e) Do not claim

- Any fixed percentage dose reduction ("digital = 80% less radiation", "half the dose of film").
- "Sensors resolve 25–33 lp/mm" as a measured fact; any "15 µm" or "33 lp/mm" figure.
- "The fiber-optic plate blocks X-rays / protects the chip" as a cited fact (say "cuts noise").
- "Direct sensor" / "indirect sensor" labels (the two fields use the words in opposite senses).
- "PSP has lower resolution than CMOS" as a rule (findings were "independent of the modality", Farman 2005).
- "CMOS gives better images than CCD", or "CMOS has replaced CCD".
- "The laser emits blue light" or "the plate glows green".
- "16-bit means you see 65,536 grays".
- "PSP plates last indefinitely" — or the opposite, "plates fail after 50 uses", as a general number.
- Sensor or plate thickness in mm.
- "Only PSP has wide latitude."
- Anything about direct-conversion (CdTe/photon-counting) intraoral sensors — not researched here.
- Flat-panel/CBCT detector facts (a-Si TFT + CsI) presented as intraoral sensor facts.

Added by the fact-check (2026-11-22):

- **"PSP has a wider latitude / dynamic range than sensors"** as an unqualified comparison (moved here from the
  recommended list; contested by Farman & Farman 2005 and Marinho-Vieira 2023). "Wide latitude" is fine.
- "PSP plates are flexible" or a plate shown bending (plates are "more rigid than film", Kamburoğlu 2022).
- "Every sensor has 20 µm pixels" / "sensor pixels are 20 µm" without "as small as" or "e.g." (textbook range
  < 20–70 µm).
- "A sensor resolved 29.5 lp/mm" (Brüllmann 2013: an extrapolated curve-fit value above the pixel-size ceiling).
- Any fading number or deadline on screen ("loses 30% in an hour", "scan within 10 minutes"): the percentages are
  for "some phosphors" (textbook) or medical CR plates (Leblans), the 10-minute advice is for one system (Digora),
  and the textbook says adequately exposed plates keep acceptable quality for 12–24 h.
- "Scanning releases 50% of the stored energy" or "390 nm" presented as dental-plate measurements (medical CR
  review figures; the board textbook prints "green spectrum between 300 and 500 nm").
- "BaFBr:Eu²⁺" as *the* composition of dental plates (write "Eu-doped barium fluorohalide" or "typically").
- "CsI glows green" as a cited fact (not stated in any source read; Gd₂O₂S:Tb green is in the IAEA handbook).
- "The CCD sensor was invented in 1987" (textbook: *introduced to dentistry* in 1987; one paper dates the
  invention of RadioVisioGraphy to 1984).
- "Higher resolution or bit depth makes no difference" (Wenzel 2007 says "little influenced", for small approximal
  caries in vitro; one ex vivo study favored higher resolution for horizontal root fractures).
- The Ludlow 2008 numbers (34.9 / 170.7 / 388 µSv) as evidence that sensors save dose: they compare collimation and
  film speed in a phantom; no solid-state intraoral sensor was measured.
- "The image is read out in a fraction of a second" (no source; "within seconds" is sourced).
- "PSP is as comfortable as film" (film was significantly better than the plate in Jørgensen & Wenzel 2012).

---

## (f) Suggested storyline (≈ 22 s, silent)

Display convention to respect in the animation: more X-ray photons → more light → fuller pixel well → **darker**
displayed pixel; behind enamel or a restoration fewer photons arrive → emptier well → **lighter** pixel.

| Time | Picture | Text on screen (≈ 55 words total) |
|---|---|---|
| 0.0–1.5 s | Intact sensor on studio background, slow orbit; photon darts arrive through a ghosted molar | Hook: **"How does a sensor turn X-rays into pixels?"** |
| 1.5–4.0 s | Sensor explodes into layers with leader lines | Labels: Housing · Scintillator · Fiber-optic plate · CMOS chip · Electronics. Small: "schematic · not to scale" |
| 4.0–7.5 s | Darts hit the scintillator; each makes a small (green) flash; light travels straight down the fiber-optic plate | **"Scintillator: X-ray → light"** then **"Fiber-optic plate: guides light, less noise"** |
| 7.5–11.0 s | Close on the photodiode grid; wells fill in proportion to light (less under enamel) | **"CMOS: light → charge. A transistor at every pixel."** Small: "pixels as small as ≈ 20 µm" **[FC]** |
| 11.0–14.0 s | Charges leave row by row into an ADC block; numbers become gray squares; molar periapical assembles on a small screen | **"ADC: charge → number → gray (8–16 bit)"** — source line: White & Pharoah, Oral Radiology (textbook) |
| 14.0–19.0 s | Side panel slides in: thin, flat plate (**[FC]** do not show it bending); electrons drop into traps; red laser sweeps; blue-violet glow into a photomultiplier; white flash erases | **"PSP plate: trapped electrons → red laser → blue-violet light → photomultiplier. Erase with light."** — source line: Leblans 2011, Materials (**[FC]** or "White & Pharoah (textbook)", which describes the dental plate itself) |
| 19.0–22.0 s | Two objects side by side, text fades before the loop | End card **[FC — "wider" → "wide"]**: **"Sensor: instant, rigid. PSP: thin, wide latitude — scan promptly."** — source line: Berkhout 2004, DMFR (**[FC]** replaces Borg & Gröndahl 1996) |

Optional caption-only (not on screen): CCD bucket-brigade read-out; theoretical 25 lp/mm for 20 µm pixels vs lower
measured values; ADA 2024 recommendation; dose nuance; **[FC]** latitude nuance (PSP wide; not consistently wider
than today's sensors — Marinho-Vieira 2022, 2023); fading nuance (usually not clinically meaningful when plates are
adequately exposed and kept out of light — textbook).

**[FC] Notes for the builder on this storyline.** (1) The 4.0–7.5 s flashes may be green but no color word or
wavelength is printed. (2) The model shows one sensor design with a fiber-optic plate; the caption should say
"many sensors". (3) "8–16 bit" is the textbook's list of capture depths (8, 10, 12 or 16), not a claim about what
the eye sees. (4) The white erase flash at 14–19 s must read as a separate step after scanning (or before the next
exposure), not as part of read-out. (5) Each source line on screen must match what is on screen in that scene: the
textbook for the sensor stack, CMOS and ADC scenes; Leblans or the textbook for the PSP mechanism; Berkhout 2004
for "wide latitude".

---

## (g) Suggested Instagram caption reference list

Refs (all checked on PubMed unless marked textbook/handbook):

- White SC, Pharoah MJ. Oral Radiology: Principles and Interpretation, 7th ed. 2014, Ch. 4 Digital Imaging
  (Ludlow & Mol) — textbook.
- Farman TT et al. 2005, Oral Surg Oral Med Oral Pathol Oral Radiol Endod 99:608 (CsI vs GOS scintillators).
- Farman AG, Farman TT 1999, Int J Comput Dent 2:183 (19.5 µm CCD + CsI).
- Farman AG, Farman TT 2005, Oral Surg Oral Med Oral Pathol Oral Radiol Endod 99:485 (18 detectors).
- Brüllmann DD et al. 2013, Oral Surg Oral Med Oral Pathol Oral Radiol 115:e55 (measured vs theoretical resolution).
- Leblans P et al. 2011, Materials 4:1034 (storage phosphor physics; open access).
- Borg E, Gröndahl HG 1996, Dentomaxillofac Radiol 25:82 (latitude: PSP vs two CCD systems vs film, in vitro —
  **[FC]** cite only if the caption makes that specific comparison).
- Berkhout WE et al. 2004, Dentomaxillofac Radiol 33:1 (dynamic range and over-exposure).
- **[FC added]** Marinho-Vieira LE et al. 2022, Dentomaxillofac Radiol 51:20210404, and 2023, Dentomaxillofac
  Radiol 52:20220370 (contemporary systems: PSP dynamic range broader by gray values, not necessarily wider for
  observers) — needed if the caption mentions latitude.
- **[FC added]** Kamburoğlu K et al. 2022, Imaging Sci Dent 52:93 (clinical CMOS vs PSP comparison, 58 patients;
  19.5 µm pixel / 25.6 lp/mm theoretical specification; plates "more rigid than film") — needed if the caption
  mentions speed, comfort or the pixel-size example.
- **[FC added, optional]** Borg E, Attaelmanan A, Gröndahl HG 2000, Dentomaxillofac Radiol 29:70 (PSP "wide
  exposure range").
- Wenzel A, Møystad A 2010, Acta Odontol Scand 68:106 (systematic review, work flow and dose).
- Benavides E et al. 2024, J Am Dent Assoc 155:280 (ADA radiation safety recommendations).
- Ludlow JB et al. 2008, J Am Dent Assoc 139:1237 (effective doses).
- Optional, endodontic context: Nair MK, Nair UP 2007, J Endod 33:1 (digital imaging in endodontics, review; PMID
  17185117, [doi](https://doi.org/10.1016/j.joen.2006.08.013)) — cited for context only; I read the abstract, which
  contains no sensor numbers.

Caption note to include: "Schematic animation, not to scale."

Suggested hashtags: #endodontics #oralradiology #dentalradiography #digitalradiography #dentalstudent #endoresident
#boardreview

---

## Search log (short)

- PubMed: reviews and classics by Farman, van der Stelt, Wenzel, Borg/Gröndahl, Berkhout, Ludlow, Hildebolt;
  scintillator, PSP fading, resolution, bit-depth, comfort and dose queries. About 50 abstracts read.
- Full text read: Leblans 2011 (Europe PMC XML); Benavides 2024 (PDF); Shah 2014 and Dashpuntsag 2017 (open access);
  IAEA handbook Ch. 7 (PDF); W&P 7th-ed. Ch. 4 (online reproduction, partial).
- Not obtainable in full text: van der Stelt 2005 and 2021, Sanderink & Miles 2000, Hildebolt 2000, Udupa 2013,
  Farman & Farman 2005, Vandenberghe 2010 (Eur Radiol 20:2637, PMID 20544352), Mol & Yoon 2015 (J Calif Dent Assoc
  43:503, PMID 26820007) — statements from these are abstract-level only or not used.

---

## Fact-check log (independent re-verification, 2026-11-22)

**Method.** Based on articles retrieved from PubMed: metadata and abstracts were pulled again for all 37 PMIDs cited
above, plus 4 papers found during the check. PMC full text was re-read through PubMed for Leblans 2011
(PMC5448636), Dashpuntsag 2017 (PMC5401743) and Kamburoğlu 2022 (PMC8967495). PMC returned no full text for Shah
2014 and for the two Marinho-Vieira papers; Shah's sentence was located in the downloaded PMC page, the
Marinho-Vieira papers are abstract-level. Every textbook, IAEA-handbook and ADA 2024 quotation was located by text
search in the copies in `_scratch/dl/`. The textbook is still known only through the online reproduction of the
7th edition (first part of Ch. 4); the printed book and the 8th / 9th editions were not seen. The researcher's
quotations were not taken on trust.

**Result in one paragraph.** No wrong PMID, first author, year, journal, volume or page was found, and every
quoted number matched its source. The problems were of three other kinds: (1) one recommended on-screen claim
rested on evidence from 1996–2004 hardware and is questioned by 2022–2023 work that the brief had missed (PSP
"wider" latitude); (2) caveats sitting in the same abstract or the same textbook paragraph had been left out
(fading, Brüllmann's 29.52 value, Jørgensen's film-vs-plate result, Wenzel 2007's significant contrast, the
Akdeniz 2006 results/conclusion mismatch); (3) medical computed-radiography figures and manufacturer-supplied
wording were presented without saying what kind of source they come from.

### Changes made

| # | Where | Problem found | Change |
|---|---|---|---|
| 1 | Row 22, on-screen item 8, storyline end card, correction 8, controversies, do-not-claim | "PSP: wider exposure latitude" was supported only by in vitro studies of 1996–2004 CCD / early CMOS sensors. Missed: Marinho-Vieira 2022 (PMID 34860568, [doi](https://doi.org/10.1259/dmfr.20210404)) — PSP "broader dynamic range" by gray values — and Marinho-Vieira 2023 (PMID 36988093, [doi](https://doi.org/10.1259/dmfr.20220370)) — "PSP-based systems may not necessarily have a wider range than sensor-based systems". Farman & Farman 2005 already showed two solid-state sensors (RVG 6000 and RVG 5000) matching PSP. | Comparative removed from the recommended list: on screen "wide latitude", not "wider". Row 22 retitled and confidence split (high for "wide", medium / contested for "wider than sensors"). End-card source line changed from Borg & Gröndahl 1996 to Berkhout 2004. Borg 2000 (PMID 10808218, [doi](https://doi.org/10.1038/sj/dmfr/4600501)) added as further support for "wide". Unqualified comparison moved to "Do not claim". |
| 2 | Row 21, on-screen item 7, controversies | Selective quotation: the textbook paragraph that gives "23% after 30 minutes and 30% after 1 hour" continues "early loss of charge does not typically result in clinically meaningful image deterioration… Adequately exposed images may be stored for 12 to 24 hours and retain acceptable image quality". | Caveat added to row 21 and to the fading controversy; "Scan promptly — the latent image fades" kept (the textbook does say "processed as soon as possible"), but any fading percentage or deadline moved to "Do not claim". |
| 3 | Controversies (PSP fading) | Akdeniz & Gröndahl 2006 was summarized as "significant gray-level change at ≥ 30 min". The abstract's Results say the half-hour scan was *not* significantly different from the immediate scan; only longer delays were. Its Conclusion says "half an hour or longer". | Re-worded to "significant change at delays beyond 30 min" and the internal inconsistency stated. Denominators added for Akdeniz 2005 (15 plates) and Nascimento 2016 (40 teeth; only the ROC area differed at 4 h). |
| 4 | Row 12, correction 4, do-not-claim | Brüllmann 2013: the 29.52 LP/mm value lies beyond the 2.5–20 LP/mm test pattern and above the ≈ 25–26 lp/mm ceiling of a ≈ 20 µm pixel, i.e. it contradicts the abstract's own conclusion for that sensor. The brief quoted the range as "9.9–29.5". | Range restated as 9.9–18.8 LP/mm for four of five sensors; 29.52 flagged as an extrapolated curve-fit value never to be quoted. |
| 5 | Row 10, on-screen item 5, storyline, correction 3 | "Pixels ≈ 20 µm" read as a general property; the textbook range is "< 20 to 70 µm" and only specific sensors were verified at 19.5–20 µm. | Wording changed to "as small as ≈ 20 µm". Two more peer-reviewed specification quotes added (Kamburoğlu 2022: 19.5 µm, "theoretical resolution of 25.6 lp/mm"; Dashpuntsag 2017 Table 1: 0.02 mm). Unqualified "sensor pixels are 20 µm" moved to "Do not claim". |
| 6 | Row 15, on-screen item 6 | "BaFBr:Eu²⁺" presented as the dental plate's composition. The dental textbook names only "europium-doped barium fluorohalide" ("iodine, chlorine, or bromine"); the exact formula comes from medical CR sources (Leblans, IAEA). | On-screen wording softened to "Eu-doped barium fluorohalide" (formula only with "typically"). Confidence split. |
| 7 | Rows 18 and 20, correction 12, new correction 16 | Leblans 2011 is a medical computed-radiography review by Agfa HealthCare authors with no dental content; its 390 nm, "roughly 50%" and "10–25% in the first hour" were listed without that qualifier. The IAEA handbook says only that read-out "yields only a fraction of the stored signal". | Source type stated; numbers restricted to caption level and added to "Do not claim" as dental measurements. All Leblans quotations themselves were confirmed in the PMC full text. |
| 8 | Correction 5 | "Some PSP scanners read at 14 bit and output 8 bit": incomplete. Dashpuntsag 2017 Table 1: Digora Optime (PSP) 14 → 8 bit, **Megadixel (CCD) 14 → 8 bit**, VistaScan (PSP) 16 → 16 bit. | Detail corrected; not a PSP-only feature. |
| 9 | Row 24, on-screen item 8, storyline, new correction 15 | Brief and storyline implied a film-like, flexible plate. Kamburoğlu 2022 (full text): plates "have the same shape and dimensions of conventional films, but… are more rigid than film". | "Flexible" removed; "thin, film-sized"; builder told not to animate bending. Clinical denominators added (58 patients, 1,044 radiographs, 167 s vs 234 s per nine radiographs, same manufacturer, round collimation). |
| 10 | Row 25, controversies | Jørgensen & Wenzel 2012 cited only for "rounded sensor = film". The same abstract: film and that sensor were significantly less uncomfortable than the phosphor plate. | Added; "PSP is as comfortable as film" moved to "Do not claim". |
| 11 | Row 32 | Wenzel 2007 summarized as "did not improve caries detection". Abstract: accuracy "little influenced", with one significant within-brand sensitivity difference (P = .003); systems were two PSP scanners and one solid-state sensor; 160 surfaces, 6% dentinal lesions. | Re-worded to "little influence"; denominators added; flat "no difference" moved to "Do not claim". |
| 12 | Row 27, controversies (dose) | Ludlow 2008 numbers lacked the denominator and were used for "collimation matters more than receptor choice", although the study measured no solid-state sensor and grouped PSP with F-speed film. | "18-image adult full-mouth series" added (from the ADA 2024 table that reprints the values); phantom study stated; sentence re-worded to what the abstract supports (about 4.9-fold for collimation vs 2.3-fold for D-speed → PSP / F-speed, my arithmetic). |
| 13 | Row 29, correction 13 | "First dental CCD sensor… 1987": the Mouyen abstract gives no year; the year is the textbook's ("introduced to dentistry in 1987"). Kamburoğlu 2022 dates the invention to 1984. | Wording fixed to "introduced 1987 (textbook)"; "invented 1987" moved to "Do not claim". |
| 14 | Correction 14 | Scintillator color was supported by "Arvanitis 2007 quotes the chip's quantum efficiency 'at 530 nm' for CsI:Tl coupling" — the abstract does not link 530 nm to CsI:Tl emission. | Re-sourced: Gd₂O₂S:Tb green emission is stated in the IAEA handbook (Ch. 7); CsI:Tl green is marked as not stated in any source read. No color word or wavelength on screen. |
| 15 | Row 3 | DQE figures (22% vs 10%) given without spatial frequency and attributed loosely to both Farman TT papers. | Frequencies added (2 and 1 cycles/mm; experimental ceramic 62% at 5 cycles/mm); numbers attributed to the 2006 paper only; caption-level. |
| 16 | Row 4, legend, on-screen item 2 | "Cuts noise" comes from a manufacturer-supplied figure caption reproduced in the textbook; a PubMed search found no dental paper measuring the fiber-optic plate's effect. | Source type stated; confidence lowered to medium-high; "not every sensor has one" kept. |
| 17 | Row 36 | Couture & Hildebolt 2002 called "a dental PSP system"; the abstract does not name the system. | Softened. |
| 18 | Row 9 | 8-bit display and 60 / 30 gray levels are unreferenced 2014 textbook statements about "conventional computer monitors". | Marked as textbook quote, caption-only. |
| 19 | Legend | "9th (Lam & Mallya, 2024)": Elsevier pages give November 2024 and February 2025 release dates. | Year removed; note added. |
| 20 | Controversies (schematic) | "Real read-out… takes a fraction of a second" had no source for intraoral sensors. | Replaced by the sourced "available to view in a matter of seconds" (Kamburoğlu 2022). |
| 21 | Section (g) | Reference list lacked the papers now needed for the latitude and handling statements. | Marinho-Vieira 2022 and 2023, Kamburoğlu 2022 and Borg 2000 added; Borg & Gröndahl 1996 restricted to its actual comparison. |

### Checked and left unchanged (source says what the brief says)

Rows 1, 2, 5–8, 13, 14, 16, 17, 19, 26, 28, 30, 31, 33–35 (rows 11 and 23 were also correct as written and only
gained an added source); corrections 1, 2, 6, 7, 9–11; the Nejaim 2016, Shah 2014, Sanderink & Miles 2000, Udupa 2013, Şenel 2010, Ang 2006, Nair 2007,
Vandenberghe 2010 and Mol & Yoon 2015 citations. Specific numbers re-confirmed in the abstracts: 19.5 µm, > 20
lp/mm and 25:1 (Farman & Farman 1999); 9.9 / 10.3 / 13.9 / 18.8 / 29.52 LP/mm (Brüllmann 2013); 18 detectors and
20 lp/mm (Farman & Farman 2005); 11.7 lp/mm, 40 students (Künzel 2003); 0.52, 0.13, 0.35, 1.21 and 1.16 s
(Berkhout 2004); 32.5 / 42.8 / 48.4 radiographs per week, 73% response, "50-80%" and "less than 25%" (Berkhout
2003); 34.9 / 170.7 / 388 µSv (Ludlow 2008); 58 patients, 4.57 vs 4.48 (Kamburoğlu 2022); 60 patients (Jørgensen
2012); 44.1% and 2100 radiographs (Çalışkan 2017); 140 plates, 95% after 50 uses (Bedard 2004); 3.2 orders of
magnitude (Couture 2002); 14.3 and 26.3 lp/mm (Nejaim 2016); 1994 (Hildebolt 2000); ADA 2024 recommendations
3.1.1.1 and 3.1.2 and the "more than 40%" sentence (the only published correction to that article concerns a name
in the acknowledgments).

### Still not independently verifiable

- The printed White & Pharoah page (any edition) and the paywalled sections "Detector latitude" and "Detector
  sensitivity"; the textbook's own 25 lp/mm example.
- Full texts of Farman & Farman 1999 and 2005, Brüllmann 2013, Borg 1996 / 2000, Berkhout 2003 / 2004, Wenzel &
  Møystad 2010, Marinho-Vieira 2022 / 2023: abstract level only.
- The fiber-optic plate's X-ray-shielding role; CsI:Tl emission color; 15 µm / 33 lp/mm sensors; thickness in mm;
  "CMOS has replaced CCD". All remain off screen.

## Review-round addendum (builder, 2026-11-22)
No verified fact changed. Changes to what the reel states, and one re-verification:
- **Re-read (PubMed, PMC full text):** Kamburoğlu K et al., Imaging Sci Dent 2022;52:93-101, PMID 35387105,
  PMC8967495, https://doi.org/10.5624/isd.20210241. Quotes confirmed: "the radiographic images are available to view
  in a matter of seconds after the exposure"; CMOS detectors "are bulky and rigid"; PSP plates "have the same shape
  and dimensions of conventional films, but… are more rigid than film"; Discussion, on Farrier et al.: "the thinner
  nature of PSP sensors, which enabled easier detector positioning". Used for end-card "image in seconds", "rigid",
  "thin, film-sized".
- On screen now: "transistors per pixel" (was "a transistor at every pixel"), "guides light" (was "guides light, less
  noise"), "image in seconds" (was "instant image"); erase step removed from the screen (caption only); source rows
  "Farman TT 2005, OOOOE" and "Berkhout 2004, DMFR (in vitro)".
- Caption now carries the two places where the board textbook's wording differs from the reel (items 18 and
  correction 6 above: W&P 7e "green spectrum between 300 and 500 nm"; solid-state paragraph "gadolinium oxybromide").
  Both were read only in an online reproduction of the 7th edition; check against the printed edition before posting.


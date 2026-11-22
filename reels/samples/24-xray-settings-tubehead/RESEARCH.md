# 24 — kVp, mA and exposure time: what each setting does inside the X-ray tube head — RESEARCH BRIEF

Research stage only (nothing built). Prepared 2026-11-22.
Journal-article facts below were retrieved from PubMed (abstracts via the PubMed tools; PMC full text where stated) and each
carries its PMID and DOI link. Guideline / regulation / reference-data facts were read directly from the primary document
(source and location given). "Verified from" says exactly what was read. Anything not read is marked **NOT VERIFIED**.

**Bottom line for the builder**

- The three-knob story in the brief is correct physics and is supportable from abstract-level or primary sources:
  mA = how many electrons, time = how long, kVp = how hard each electron hits (and, as a consequence, also how many photons).
- Four things in the brief need correcting before anything goes on screen: (1) the "US 1.5 mm / 2.5 mm Al" filtration rule is
  not what the federal standard says (it is an HVL table); (2) "about 1% X-rays" is an upper bound at dental kV — write
  "~99% heat"; (3) "7–10 mA" is dated — modern wall units run about 6–8 mA and handhelds about 2.5 mA; (4) the kVp-contrast
  effect is real but small between 60 and 70 kVp on digital sensors — the swatch must be labeled as exaggerated.
- **White and Pharoah could not be opened in this session.** Every statement attributed to it below is flagged. The same
  physics is covered by sources that were read (Radiographics physics tutorials, Seibert 2004, EC RP136, IAEA SRS 108,
  21 CFR, NIST). Cite those on screen; cite the textbook only after Nate checks his copy.

---

## (a) Verified-facts table

Confidence: **High** = read directly in a primary source or abstract and consistent across sources; **Med** = read, but
single source / approximate / context-dependent; **Low** = not read in a primary source.

### A1. Inside the tube

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 1 | A heated tungsten filament releases electrons (thermionic emission); more filament heating = more electrons | Seibert JA. J Nucl Med Technol 2004;32(3):139-147. PMID 15347692 (no DOI in PubMed record) | "A larger filament current produces more heat and releases a greater number of electrons." Filament "releases electrons by a process known as thermionic emission" "at a rate dependent on the filament temperature (i.e., the filament current)". Tube current is "the number of electrons traveling between the electrodes". | Full text (journal site, free; excerpts pulled with the fetch tool, read twice) | High |
| 2 | Each electron arrives with kinetic energy (keV) equal to the tube voltage (kV) | Seibert 2004 (as above) | "Each electron attains a kinetic energy (in keV) equal to the applied tube voltage." | Full text | High |
| 3 | ~99% of the energy becomes heat; only ~1% becomes X-rays | Zink FE. X-ray tubes. Radiographics 1997;17(5):1259-1268. PMID 9308113. [DOI](https://doi.org/10.1148/radiographics.17.5.9308113) | "The process of creating the x-ray beam is very inefficient, with only 1% of the electric energy converted to x-ray photons and the remaining 99% converted to heat in the x-ray tube assembly." (General diagnostic tubes, not dental-specific.) | Abstract | High for "~99% heat"; Med for an exact 1% at 60-70 kV (see corrections) |
| 4 | Tungsten target set in a copper block/stem that carries the heat away; oil around the tube | "Radiography and Radiology for Dental Care Professionals", 3rd ed. (chapter excerpt on pocketdentistry.com; the page shows the book title but not the authors — I believe it is Whaites & Drage, unconfirmed); Thomson EM, ch. 6 in Mosby's Comprehensive Review of Dental Hygiene (excerpt, same site; edition not shown) | First book: "a target (a small piece of tungsten) set into the angled face of a large copper block"; "Surrounding oil facilitates the removal of heat"; "heat (about 99%) or X-rays (about 1%)". Thomson: "Copper stem—functions to conduct heat away from the target"; "Less than 1% of the kinetic energy ... is converted into x-ray energy". | Textbook excerpts read online through the fetch tool (not the printed books) | Med (textbook-level, consistent) |
| 5 | Energy into the anode = kV x mA x s (e.g. 70 kV x 7 mA = 490 W while the beam is on; 0.2 s = 98 J) | Derived: P = V x I for a constant-potential (DC) unit. Seibert 2004 describes heat loading in the same terms. | Seibert (glossary, heat unit): "The unit, equal to the product of the kVp and mA, is used to describe the accumulation or dissipation of heat energy" (excerpt was cut by the tool at this point; the exposure-time factor was not seen in the excerpt). Also: "Buildup of heat energy is the major limit to instantaneous x-ray production and x-ray tube longevity". The 490 W / 98 J figures are arithmetic, not a published measurement; true for DC waveforms, lower for self-rectified AC. | Derived from first principles + full-text excerpts | High (as arithmetic); label "DC unit" if shown |

### A2. What each knob does to the beam

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 6 | X-ray quantity is proportional to tube current (mA) | McCollough CH. The AAPM/RSNA physics tutorial for residents. X-ray production. Radiographics 1997;17(4):967-984. PMID 9225393. [DOI](https://doi.org/10.1148/radiographics.17.4.9225393) | "The quantity of x-rays produced varies proportionally to the tube potential squared, tube current, exposure time, and atomic number of the anode material and is inversely proportional to the distance squared." | Abstract | High |
| 7 | X-ray quantity is proportional to exposure time; mA x s = mAs | McCollough 1997 (as above); Seibert 2004 | McCollough: as row 6. Seibert: "the combination of tube current and exposure time in milliampere-seconds (mAs)"; "photon fluence (directly proportional to the mAs)". | Abstract; full text | High |
| 8 | Maximum photon energy (keV) = kVp | Seibert 2004 | "...with maximum x-ray energy (in keV) determined by the peak potential difference (in kVp)." | Full text | High |
| 9 | kVp sets peak AND mean photon energy (beam quality) | European Commission. Radiation Protection 136: European guidelines on radiation protection in dental radiology. Luxembourg, 2004, section 4.1 | "Kilovoltage controls the mean and peak X-ray energies in the X-ray beam." | Guideline (full document read) | High |
| 10 | Mean photon energy is only about 1/3 to 1/2 of the peak | Seibert 2004 | "The average x-ray energy in a typical x-ray spectrum is about one-third to one-half peak energy, dependent on the amount of filtration placed in the beam." | Full text | High (general statement; a filtered 60-70 kV DC dental beam sits at the upper end) |
| 11 | Output also rises with kVp: approximately with kVp squared | McCollough 1997; Nickoloff EL, Berman HL. Factors affecting x-ray spectra. Radiographics 1993;13(6):1337-1348. PMID 8290728. [DOI](https://doi.org/10.1148/radiographics.13.6.8290728) | McCollough: "varies proportionally to the tube potential squared". Nickoloff: "As peak tube potential increases, the half-value layer increases nearly linearly; radiation output increases by approximately the square of the tube potential." | Abstracts | High as "approximately"; the exponent is not exactly 2 (see caveats) |
| 12 | The spectrum is continuous (bremsstrahlung) with characteristic lines on top | McCollough 1997 | "Bremsstrahlung x-rays produce a continuous x-ray spectrum, whereas characteristic x-rays are produced at specific narrow bands of energies." | Abstract | High |
| 13 | Tungsten K lines appear only above 69.5 kV, so not at 60-70 kVp | Seibert 2004; NIST X-ray Transition Energies Database (tungsten, Z = 74) | Seibert: "For tungsten, binding energies of the K, L, and M shells are 69.5, 11.5, and 2.5 keV"; "K-characteristic radiation from a tungsten target will occur only when the x-ray tube is operated at a voltage of >69.5 kVp". NIST: W K edge 69.51-69.53 keV; K-L3 (K-alpha1) 59.318 keV; K-L2 (K-alpha2) 57.982 keV; K-M3 (K-beta1) 67.245 keV. | Full text; reference database (queried directly) | High |
| 14 | Generator waveform matters: at the same kVp a constant-potential (DC) unit gives a harder beam than a pulsating (AC) unit | EC RP136 (2004) section 4.1; Nickoloff 1993 | RP136: DC "produces proportionately fewer low energy X-rays"; "The mean X-ray energy from a constant potential (DC) X-ray set is higher than that from an alternating potential (AC) X-ray set at the same operating kilovoltage"; "a kilovoltage setting of 5-8 kV lower is needed to maintain radiographic contrast". Nickoloff: units "with high (100%) ripple such as single-phase units produce less penetrating radiation than units with low (4%) ripple". | Guideline; abstract | High |
| 15 | Intensity falls with the square of distance (inverse square law) | McCollough 1997 | "...and is inversely proportional to the distance squared." | Abstract | High (but distance is not a console setting — caption only) |

### A3. Filter, collimator, regulations

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 16 | The aluminum filter removes low-energy photons (they would only add skin dose) | EC RP136 (2004) section 4.2, Recommendation 4C; Nickoloff 1993 | RP136: "Filtration of the X-ray beam preferentially removes lower energy X-ray photons from the beam. Thus it is invaluable as a means of reducing skin doses to patients ... fitted at manufacture and is therefore a factor that is not readily under the control of the dentist." Nickoloff: added filtration "reduces both skin surface dose and average depth-dose, with the optimal amount being approximately 2-3 mm or less of aluminum-equivalent material". | Guideline; abstract | High |
| 17 | US federal standard: minimum half-value layer 1.5 mm Al for intraoral units at 70 kVp and below | 21 CFR 1020.30(m)(1), Table 1 ("Specified dental systems" column = intraoral systems manufactured after Dec 1, 1980) | "The HVL of the useful beam for a given x-ray tube potential shall not be less than the appropriate value shown in table 1". Table: 1.5 mm Al at 30, 40, 50, 51, 60 and 70 kVp; 2.1 mm at 71 kVp; 2.3 mm at 80; 2.5 mm at 90; 2.7 mm at 100. It specifies HVL, not total filtration. | Regulation (read on law.cornell.edu via the fetch tool; ecfr.gov blocked) | High |
| 18 | "Total filtration 1.5 mm Al up to 70 kVp, 2.5 mm Al above 70 kVp" (the textbook / board wording) | Oregon Administrative Rules ch. 333 div. 106, Table 5 (state rule, read directly). Also stated as "federal regulations" in Thomson, Mosby's Comprehensive Review of Dental Hygiene. White and Pharoah: NOT VERIFIED. | Oregon Table 5, "Total Filtration: Inherent + Added (in mm Al Equivalent)": dental systems 50-70 kVp = 1.5; >70 kVp = 2.5. Thomson: "Federal regulations require 1.5 millimeters (mm) of aluminum-equivalent filtration for units operating below 70 kVp and 2.5 mm ... for units capable of operating above 70 kVp." | State regulation; textbook excerpt online | High that this is the taught number and a real state rule; it is NOT the wording of the federal standard (row 17) |
| 19 | International: HVL at least 1.5 mm Al at 70 kV and below, 2.1 mm Al at 71 kV and above | IAEA. Radiation Protection in Dental Radiology. Safety Reports Series No. 108. Vienna: IAEA, 2022, section 5.1.2.1 (citing EC RP162) | "The total filtration has to be such as to ensure that the measured half-value layer is equal to or greater than 1.5 mm aluminium equivalent for units operating at or below 70 kV, and 2.1 mm aluminium for units operating at 71 kV or higher." | Guideline (full document read) | High |
| 20 | US: round intraoral beam no wider than 7 cm at the cone tip (6 cm if source-skin distance < 18 cm); source-skin distance at least 18 cm | 21 CFR 1020.31(f)(1) and (i)(1); Magill D et al. Dentomaxillofac Radiol 2019;48(2):20180183. PMID 30346798. [DOI](https://doi.org/10.1259/dmfr.20180183) | CFR: field "shall be containable in a circle having a diameter of no more than 7 cm" (SSD 18 cm or more) / "6 cm" (SSD under 18 cm); SSD limited to not less than "Eighteen cm if operable above 50 kVp". Magill: "US FDA regulations allow a maximum beam size of 38.5 cm2 on the patient skin". | Regulation; abstract | High |
| 21 | Rectangular collimation cuts patient dose (pooled range 40-92% vs round) | Shetty A et al. Int Dent J 2019;69(2):84-97. PMID 29959778. [DOI](https://doi.org/10.1111/idj.12411) | Systematic review, 13 studies (phantom/dosimetry, mixed receptors), high heterogeneity, GRADE moderate: "The radiation dose reduction ranged from 40% to 92% compared with circular collimation." | Abstract | High (as a range; do not quote a single number) |
| 22 | Full-mouth series, PSP or F-speed film: 170.7 microSv round vs 34.9 microSv rectangular collimation | Ludlow JB, Davies-Ludlow LE, White SC. J Am Dent Assoc 2008;139(9):1237-1243. PMID 18762634. [DOI](https://doi.org/10.14219/jada.archive.2008.0339) | Phantom dosimetry, ICRP 2007 weights: FMX PSP/F-speed rectangular 34.9 microSv; FMX PSP/F-speed round 170.7 microSv; FMX D-speed round 388 microSv; 4 bitewings rectangular 5.0 microSv. | Abstract | High (board classic; off-topic for this reel — caption at most) |
| 23 | NCRP Report No. 177 (2019) reinforced its recommendation for rectangular collimation | Johnson KB, Ludlow JB. J Am Dent Assoc 2020;151(10):726-734. PMID 32979952. [DOI](https://doi.org/10.1016/j.adaj.2020.06.019) | "The National Commission [sic] on Radiation Protection and Measurements has reinforced its recommendation for the use of rectangular collimation for intraoral radiography in its Report No. 177 published in 2019." Adult FMX at 70 kVp: 86 microSv circular vs 54 microSv best rectangular. | Abstract (the NCRP report itself was NOT read) | High for the attribution; no NCRP numbers verified |

### A4. What the image does

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 24 | Higher kVp = lower image contrast (more grays); lower kVp = higher contrast | EC RP136 (2004) section 4.1 | "'Low' kilovoltages produce images of higher contrast than do higher kilovoltages. This reflects the different types of attenuation of low and high energy radiation." | Guideline | High as a principle (film-era wording) |
| 25 | On digital sensors, 60 vs 70 kVp changes contrast very little | Pita de Melo D et al. Dentomaxillofac Radiol 2026 (online Jul 31). PMID 42538829. [DOI](https://doi.org/10.1093/dmfr/twag056) | Phantom study, 3 CMOS sensors, handheld 60 kVp/2.5 mA and wall unit 60 and 70 kVp/7 mA, 14 exposure times: "Sensor type, x-ray unit, and exposure time influenced image contrast and spatial resolution, while variations in kVp had minimal impact on these image quality parameters." | Abstract | Med (one in vitro study; supports the caveat) |
| 26 | 60 vs 70 kV: no diagnostic gain shown, more absorbed dose at 70 kV (one phantom study) | Hellen-Halme K, Nilsson M. J Oral Maxillofac Res 2013;4(3):e2. PMID 24422035. [DOI](https://doi.org/10.5037/jomr.2013.4302) | Head phantom, Gafchromic film, two bitewings, equal entrance dose (exposure time cut 20% at 70 kV for equal signal-to-noise): mean/integral absorbed dose ratio 70:60 kV = 1.4-1.5; "approximately 40-50% higher". Cites own earlier work: no significant difference in approximal-caries accuracy 60 vs 70 kV. Used a medical tube matched for HVL, not a dental unit. | Full text (PMC3887573) | Med (single in vitro study) |
| 27 | 60 vs 90 kV: equal lesion visibility in vitro; raising kV lowers entrance dose but barely the absorbed dose | Kaeppler G et al. Dentomaxillofac Radiol 2007;36(2):75-79. PMID 17403883. [DOI](https://doi.org/10.1259/dmfr/75743437); Kaeppler G et al. Dentomaxillofac Radiol 2007;36(8):506-513. PMID 18033949. [DOI](https://doi.org/10.1259/dmfr/32903218) | First paper: F-speed film and PSP "demonstrated equal quality ... regardless of exposure at 60 kV or 90 kV" (dried skulls, 6000 assessments). Second: 90 vs 60 kVp reduced absorbed dose only "to 92.4%"; entrance dose fell "by 30% to 35%". | Abstracts | Med |
| 28 | Film-era classic: caries accuracy better at lower kV; 60 kV "a proper balance" | Svenson B et al. Swed Dent J 1985;9(1):37-43. PMID 3859029 (no DOI) | 50, 60, 70, 90 kV; two film speeds; ROC: "significant difference ... with better diagnostic accuracy for the lower kilovoltages"; "a kilovoltage of 60 offers a proper balance between absorbed radiation dose and diagnostic accuracy". | Abstract | Med (extracted premolars, film) |
| 29 | Digital receptors have a wide exposure latitude; exposure runs from too little (noise) up to sensor saturation, with an optimum in between | Udupa H et al. Oral Surg Oral Med Oral Pathol Oral Radiol 2013;116(6):774-783. PMID 24237729. [DOI](https://doi.org/10.1016/j.oooo.2013.08.019); Barrineau AB, Mah P, Mallya SM. J Am Dent Assoc 2023;154(1):24-31. PMID 36402578. [DOI](https://doi.org/10.1016/j.adaj.2022.09.008); Farman AG, Farman TT. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99(4):485-489. PMID 15772598. [DOI](https://doi.org/10.1016/j.tripleo.2004.04.002); IAEA SRS 108 section 2.1.2.2; Hellen-Halme 2013 | Udupa: 20 systems exposed "from the lowest exposure time until the sensor saturated"; optimal exposure = "the lowest exposure where maximum spatial resolution and contrast/detail detectability were achieved"; systems "varied greatly in latitude". Barrineau: 7 sensors, Planmeca ProX at 63 kVp and 6 mA; images at the optimal exposure "yielded better visualization and more accurate measurements of the file tip relative to the apex". Farman: upper limit of latitude = "pixel blooming or unacceptable levels of cervical burnout". IAEA: digital receptors "exhibit wider latitude (i.e. range of detectable exposures)". Hellen-Halme: the dentist must "use a dose at which the quantum noise will not impair the diagnostic accuracy". | Abstracts; guideline; full text | High for the concept. The words "noise" and "saturation" are each supported; no single source states "more mAs = less noise" as a number |

### A5. Typical settings

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 30 | Typical intraoral unit: 60-70 kV | IAEA SRS 108 (2022) section 5.1.2.1; EC RP136 (2004) Recommendation 4A | IAEA: "a minimum tube voltage of 60 kV should be used, produced by a direct current (DC) or alternating current (AC) generator." RP136: "65 to 70 kV is recommended as the kilovoltage of choice for dental (intraoral) X-ray sets using AC equipment, with 60kV for those using DC X-ray sets." | Guidelines | High |
| 31 | Typical tube current: a few mA (about 3.5-8 mA on wall units; about 2.5 mA handheld); exposure well under 1 s | IAEA SRS 108 section 5.1.2.1; Pita de Melo 2026; Ruiz DC et al. Braz Dent J 2025;36:e236319. PMID 41172496. [DOI](https://doi.org/10.1590/0103-644020256319); Barrineau 2023 | IAEA: "The tube current is usually 3.5 to 8 mA"; exposure times "between 0.01 and 4 s, although sub-second exposure times are normal nowadays"; handheld units "operate at a longer exposure time owing to their relative low tube current". Pita de Melo: handheld 60 kVp/2.5 mA; wall 60 and 70 kVp/7 mA. Ruiz: handheld 60 kVp, 2.5 mA, 0.45 s vs fixed 60 kVp, 7 mA, 0.16 s. Barrineau: 63 kVp, 6 mA. | Guideline; abstracts | High |
| 32 | On most intraoral units the operator really only changes time | EC RP136 section 4.1; Hellen-Halme 2013 | RP136: "In the case of dental (intraoral) X-ray sets, kilovoltage is usually either fixed or minimally variable." Hellen-Halme: "Given proper filtration and collimation, only the tube voltage and the exposure time can be adjusted to change the absorbed dose." | Guideline; full text | High |
| 33 | Historic US practice: 70 kVp dominant | Geist JR, Katz JO. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2002;93(4):496-505. PMID 12029291. [DOI](https://doi.org/10.1067/moe.2002.121387) | Survey of all 65 US and Canadian dental schools (100% response): "The most commonly used tube potential is 70 kVp (88%)." | Abstract | High (dated; caption only) |

### A6. Not verified — keep off screen

| # | Statement | Status |
|---|---|---|
| N1 | Any wording attributed to White and Pharoah's Oral Radiology (Mallya SM, Lam EWN, eds.; 8th ed., Elsevier 2019 is the edition known to me — check whether a newer one exists) | **NOT VERIFIED** — book not accessible in this session. Do not put "White & Pharoah" in a source line until checked against the book. |
| N2 | NCRP Report No. 177 (2019): exact "shall/should" wording on kVp range (60-80 kVp is reported by secondary web sources), filtration, numbers for rectangular collimation | **NOT VERIFIED** — report is paywalled; only the attribution in row 23 was confirmed. |
| N3 | ADA 2024 "Optimizing radiation safety in dentistry" (Benavides E et al. J Am Dent Assoc 2024;155(4):280-293.e4. PMID 38300176. [DOI](https://doi.org/10.1016/j.adaj.2023.12.002)): specific statements on kV (60-80 kV) and rectangular collimation | **NOT VERIFIED** beyond the abstract (full text blocked; abstract has no equipment numbers). Existence, title and citation confirmed. |
| N4 | Efficiency formula (fraction to X-rays is roughly 9 x 10^-10 x Z x V, or E x Z / 820,000), giving about 0.5-0.6% at 60-70 kV on tungsten | **NOT VERIFIED** in a source read here (standard physics-textbook formula, e.g. Bushberg). Used only to justify writing "~99% heat" rather than "exactly 1% X-rays". |
| N5 | "15% rule" (15% more kVp roughly doubles receptor exposure) and the dental-hygiene "15 kVp rule" | **NOT VERIFIED**. Rule of thumb from medical radiography; leave off screen. |
| N6 | Filament circuit values (about 10 V, 3-5 A), focal spot target angle, molybdenum focusing cup | **NOT VERIFIED** (textbook). IAEA SRS 108 does confirm "nominal focal spot values ... range between 0.4 and 0.7". |
| N7 | "70% of dental photons are bremsstrahlung" (appears in Thomson, Mosby's) | Unsupported factoid; at 60-70 kVp on tungsten essentially all photons that leave the filter are bremsstrahlung. Do not use. |

---

## (b) Recommended on-screen facts (safe wording, best supported)

Word budget is about 60 must-read words, so these are deliberately terse. One source line for the whole reel is enough.

1. **mA — how many.** "mA: hotter filament, more electrons, more photons. Same energies."
   (Seibert 2004; McCollough 1997.) Spectrum gets taller; end point and shape do not move.
2. **Time — how long.** "Time: same beam, on longer. mA x s = mAs."
   (McCollough 1997; Seibert 2004.) Nothing inside the tube looks different per instant.
3. **kVp — how hard.** "kVp: each electron hits harder. Max photon energy (keV) = kVp."
   (Seibert 2004; EC RP136.)
4. **kVp also adds photons.** "Output rises ~ kVp squared" with the "~" kept.
   (McCollough 1997; Nickoloff & Berman 1993.) Number of electrons is unchanged — each one radiates more.
5. **Heat.** "~99% of the energy becomes heat." Optional gauge readout "kV x mA x s".
   (Zink 1997.) Prefer this to a hard "1% X-rays".
6. **No tungsten K lines at dental kVp.** Optional small scope annotation: "W K-lines need >69.5 kV".
   (Seibert 2004; NIST.) Only if there is room; otherwise just do not draw any spikes.
7. **Image.** "kVp up: more grays, less contrast. mAs up: more signal (film darker; digital less noisy, until it saturates)."
   Label the swatch "exaggerated". (EC RP136; Udupa 2013; Pita de Melo 2026 for the caveat.)
8. **Aluminum filter.** Label only: "Al filter: removes low-energy photons". No thickness number on screen
   (if one is wanted: "HVL at least 1.5 mm Al at 70 kVp and below — 21 CFR 1020.30").

End-card cheat sheet (three lines, about 15 words):
`mA  -> how many`  /  `time -> how long (mAs = mA x s)`  /  `kVp -> how hard (max keV = kVp) + how many`

Suggested single source line (24-26 px): `McCollough, Radiographics 1997 · Seibert, J Nucl Med Technol 2004 · spectra schematic`

Illustrative console values that are realistic and make the arithmetic visible (label "values illustrative"):
mA 4 -> 8 (x2 photons; inside the IAEA "usually 3.5 to 8 mA" range); kVp 60 -> 70 (max keV 60 -> 70; square law gives
x1.36); time 0.10 -> 0.20 s (x2; mAs counter 0.8 -> 1.6 at 8 mA).

---

## (c) Corrections to the brief

1. **Filtration rule is misattributed.** The brief says "US requirement 1.5 mm Al up to 70 kVp and 2.5 mm above". The federal
   performance standard (21 CFR 1020.30(m), Table 1) sets a minimum **half-value layer**, not a filter thickness: 1.5 mm Al
   at every listed kVp up to 70 for intraoral units, then 2.1 mm at 71 kVp, 2.3 mm at 80 and 2.5 mm at 90. The 1.5 / 2.5 mm
   **total filtration** numbers are what review textbooks teach and what some state rules say (Oregon Table 5 read
   directly). Both are "right" for a board answer, but an on-screen "US law: 2.5 mm above 70 kVp" would be wrong as written.
2. **"About 1% X-rays" is a ceiling, not the dental value.** Zink 1997 gives 1% / 99% for diagnostic tubes generally.
   Efficiency rises with kV; by the standard textbook formula it is roughly half a percent at 60-70 kV (formula not verified
   here). Write "~99% heat" and avoid a precise X-ray percentage.
3. **"7-10 mA" is dated.** IAEA 2022: "usually 3.5 to 8 mA". Recent studies use 6-7 mA wall units and 2.5 mA handhelds.
   10-15 mA belongs to older AC units (a 2004 Belgian survey found 10-12 mA: Jacobs R et al. Dentomaxillofac Radiol
   2004;33(5):334-339. PMID 15585812. [DOI](https://doi.org/10.1259/dmfr/22185511)).
4. **kVp squared is approximate and is about tube output**, not receptor exposure or patient dose. Behind the patient the
   dependence is steeper because penetration also rises. A simple filtered-spectrum calculation done for this brief
   (Kramers shape x 2 mm Al, NIST coefficients — a toy model, not a measurement) gives a photon-count exponent nearer 2.8
   between 60 and 70 kV. Keep "~" on screen and do not compute doses from it.
5. **The peak of the spectrum is not at kVp, and the mean is not either.** kVp is the right-hand end point. The mean is
   about 1/3-1/2 of it (Seibert). In the toy model the most common energy barely moves (about 28-30 keV) when going
   60 -> 70 kV; what changes is the high-energy tail and the height. Animate "stretch the tail and grow", not "slide the
   whole hump to the right".
6. **K lines are not at 69.5 keV.** 69.5 keV is the K-shell binding energy (the threshold). The lines sit at about 58.0 and
   59.3 keV (K-alpha) and 67.2 keV (K-beta) (NIST). At 60-70 kVp draw none.
7. **Contrast change is overstated for digital.** "Higher kVp, lower contrast" is the classic (and board) answer and is
   supported by RP136, but between 60 and 70 kVp on CMOS sensors the measured effect was "minimal" (Pita de Melo 2026), and
   display contrast is largely set by processing. The swatch must say "exaggerated".
8. **mA/time and "density".** Density is a film concept. For digital receptors the supported statement is: too little
   exposure = noisy, too much = saturation / burnout, with an optimum in between (Udupa 2013; Farman 2005; Barrineau 2023).
   Display brightness is usually rescaled by software, so do not show a digital image simply getting darker with mAs
   unless the swatch is labeled "film".
9. **The filament-temperature link is not linear.** Output is proportional to tube current (mA); tube current is set by
   filament heating, but not in proportion (textbook; not verified here). Do not put numbers on a filament-temperature
   needle, and do not show the filament changing when kVp or time is turned.
10. **Rectangular collimation: use verified numbers only.** NCRP 177's own figures were not read. Verified: 40-92% range
    (Shetty 2019 systematic review); 170.7 vs 34.9 microSv FMX (Ludlow 2008); 86 vs 54 microSv adult FMX (Johnson & Ludlow
    2020); factor x0.5 (RP136 Table 4.1). This is off-topic for a settings reel — caption at most.
11. **Inverse square law** is a distance effect (cone length), not a console setting. Verified (McCollough 1997) but it
    does not belong in a three-knob story.
12. **Add the waveform point to the caption.** "kVp" is a peak. On an AC (self-rectified) unit the voltage is below the
    peak for most of the cycle; a DC unit at the same kVp gives a harder beam and about 20% less dose (RP136 Table 4.1:
    "'DC' constant potential set x0.8", baseline a 70 kV AC set). This is why RP136 recommends 60 kV for DC sets.
13. **Newer US guidance exists.** The 2012 ADA/FDA document has been superseded by Benavides et al. 2024 (radiation
    safety; row N3) and Benavides E et al. J Am Dent Assoc 2026;157(1):20-35.e5. PMID 41500761.
    [DOI](https://doi.org/10.1016/j.adaj.2025.10.013) (patient selection; full text read in PMC — it contains no
    kVp/mA/filtration numbers). Cite the 2024 paper by title only.

---

## (d) Controversies and caveats (do not overstate)

- **Best kV for intraoral work is not settled.** Europe: 60 kV for DC, 65-70 kV for AC (RP136, grade B). IAEA: at least
  60 kV. RP136 itself notes "debate about the optimal kilovoltage ... with some authorities recommending higher values,
  particularly in the USA". US dental schools were overwhelmingly at 70 kVp in 2002 (Geist & Katz).
- **Does higher kVp lower dose? It depends which dose.** Higher kV lowers skin (entrance) dose but raises depth dose and
  scatter (RP136). Kaeppler 2007: 60 -> 90 kVp cut entrance dose 30-35% but absorbed dose only to 92.4%. Hellen-Halme
  2013: at equal entrance dose, 70 kV gave about 40-50% more mean/integral absorbed dose than 60 kV. All in vitro, single
  centres. Do not put a dose claim for kVp on screen.
- **Diagnostic effect of kVp is small.** No significant difference 60 vs 70 kV (digital, caries; Hellen-Halme, citing own
  prior study) or 60 vs 90 kV (film/PSP; Kaeppler 2007). Film-era data favoured lower kV (Svenson 1985). Svenson &
  Petersson (Swed Dent J 1991;15(5):245-250. PMID 1767370): no significant differences, a trend to low kV for premolars
  and high kV for molars.
- **"Quality vs quantity" is a simplification.** kVp changes both. Filtration and waveform also change quality without
  touching any knob (McCollough 1997: spectrum shape depends on anode Z, tube potential, filtration and waveform).
- **99% / 1%** is a round teaching figure for diagnostic tubes (Zink 1997); the X-ray share is energy dependent.
- **Spectra in the reel are schematic.** No measured dental spectrum was sourced. If a physics-shaped curve is wanted, the
  toy recipe is: photons(E) proportional to mA x time x (kV/E - 1) x exp(-mu(E) x rho x thickness), with aluminum
  mu/rho from NIST (cm2/g: 15 keV 7.955; 20 keV 3.441; 30 keV 1.128; 40 keV 0.5685; 50 keV 0.3681; 60 keV 0.2778;
  80 keV 0.2018; density 2.70 g/cm3). With 2 mm Al this transmits about 1% at 15 keV, 16% at 20 keV, 54% at 30 keV and
  86% at 60 keV — so the curve is essentially empty below about 15 keV. Label it "schematic" inside the safe area and
  put no numbers on the vertical axis.
- **Regulations vary by state**; the federal rules quoted are manufacturer performance standards (21 CFR 1020).
- **Operator reality.** Most intraoral units fix kV and mA (or offer two choices); time is the working control (RP136;
  Hellen-Halme 2013). The reel's three live knobs are a teaching console, not a picture of a real wall unit.

---

## (e) Do not claim

- That mA or time changes photon energy, penetration or contrast.
- That kVp changes only quality (it also raises quantity), or that doubling kVp doubles output.
- That a 70 kVp beam is made of 70 keV photons (70 keV is only the maximum).
- That tungsten K-characteristic lines are present at 60-70 kVp, or that they sit at 69.5 keV.
- That more electrons flow when kVp is raised (tube current is the mA setting).
- "Exactly 1% X-rays" at dental settings, or any efficiency number to a decimal place.
- "Federal law requires 2.5 mm Al above 70 kVp" (federal rule is an HVL table; the 2.5 mm figure is textbook/state wording).
- Any dose figure (microSv, % reduction) tied to a kVp, mA or time setting.
- "Higher kVp lowers patient dose" or "raises patient dose" without saying which dose.
- That a digital image simply gets darker with more mAs.
- The 15% rule, the "15 kVp rule", or "70% bremsstrahlung".
- Any number or "shall" attributed to NCRP Report 177 or to the ADA 2024 recommendations.
- Anything "per White & Pharoah" until checked against the book.
- That the drawn spectrum, electron counts or heat-gauge values are measurements.

---

## (f) Suggested storyline — 20-22 s silent reel, retro control console

Tube cutaway on top (y about 250-760), console below (scope window left, three knobs, heat gauge, small image swatch).
Total must-read text about 55 words. Heat gauge is live throughout: its needle follows kV x mA and an "energy" counter
adds while the beam is on; face marked "~99% HEAT".

| Time | Picture | Text on screen |
|---|---|---|
| 0-2.5 s | Console powers up, amber lamps warm, tube idle. Four engraved labels on the tube: FILAMENT, TUNGSTEN TARGET, Al FILTER, COLLIMATOR. | Hook: "3 KNOBS. What does each do inside the tube?" |
| 2.5-7.5 s | **mA knob 4 -> 8.** Filament glows brighter; electron stream twice as dense, same speed. Scope: curve doubles in height, right-hand end fixed at the same keV. | "mA: more electrons, more photons. Same energies." |
| 7.5-13.5 s | **kVp knob 60 -> 70.** Filament and electron count unchanged; electrons streak faster / hit brighter. Scope: right-hand end slides 60 -> 70 keV, tail stretches, curve grows; modal peak barely moves. Swatch (step wedge): steps flatten toward gray. | "kVp: each electron hits harder. Max keV = kVp." then small "output ~ kVp squared" · swatch tag "contrast change exaggerated" |
| 13.5-17.5 s | **Time knob 0.10 -> 0.20 s.** Nothing in the tube changes; the EXPOSE lamp simply stays lit twice as long; mAs counter runs 0.8 -> 1.6. Scope curve identical; an accumulated-photons bar fills twice as far. | "Time: same beam, on longer. mA x s = mAs." |
| 17.5-22 s | Knobs return to rest; tube dims; cheat-sheet card engraved on the faceplate, held at least 3 s. Fade text before the loop. | "mA -> how many / time -> how long / kVp -> how hard (+ how many)" · source line · "spectra schematic, values illustrative" |

Poster frame: about 10 s (kVp turned, scope stretched, all tube labels visible).
Pitfalls: keep the cheat sheet and source line above y 1580 and left of x 960; do not animate the filament during the kVp
or time scenes; do not draw characteristic spikes; scope x-axis may carry real numbers (keV, with 60 and 70 marked), the
y-axis must stay unlabeled ("relative"); American spelling (aluminum, gray).

---

## (g) Instagram caption reference list

Core (cover every claim the caption is likely to make):

- McCollough CH. X-ray production (AAPM/RSNA physics tutorial). Radiographics 1997;17:967-84. PMID 9225393. https://doi.org/10.1148/radiographics.17.4.9225393
- Seibert JA. X-ray imaging physics, part 1: basic principles of x-ray production. J Nucl Med Technol 2004;32:139-47. PMID 15347692.
- Zink FE. X-ray tubes. Radiographics 1997;17:1259-68. PMID 9308113. https://doi.org/10.1148/radiographics.17.5.9308113
- Nickoloff EL, Berman HL. Factors affecting x-ray spectra. Radiographics 1993;13:1337-48. PMID 8290728. https://doi.org/10.1148/radiographics.13.6.8290728
- European Commission. Radiation Protection 136: European guidelines on radiation protection in dental radiology. 2004.
- IAEA. Radiation Protection in Dental Radiology. Safety Reports Series No. 108. Vienna, 2022.
- US FDA performance standard, 21 CFR 1020.30-1020.31.

Optional (only if the caption mentions the point):

- Digital contrast vs kVp: Pita de Melo D et al. Dentomaxillofac Radiol 2026. PMID 42538829. https://doi.org/10.1093/dmfr/twag056
- 60 vs 70 kV dose: Hellen-Halme K, Nilsson M. J Oral Maxillofac Res 2013;4(3):e2. PMID 24422035. https://doi.org/10.5037/jomr.2013.4302
- Optimal digital exposure (endodontic file-tip visibility): Barrineau AB, Mah P, Mallya SM. J Am Dent Assoc 2023;154:24-31. PMID 36402578. https://doi.org/10.1016/j.adaj.2022.09.008
- Sensor latitude / saturation: Udupa H et al. Oral Surg Oral Med Oral Pathol Oral Radiol 2013;116:774-83. PMID 24237729. https://doi.org/10.1016/j.oooo.2013.08.019
- Rectangular collimation: Shetty A et al. Int Dent J 2019;69:84-97. PMID 29959778. https://doi.org/10.1111/idj.12411 ; Ludlow JB et al. J Am Dent Assoc 2008;139:1237-43. PMID 18762634. https://doi.org/10.14219/jada.archive.2008.0339
- Tungsten line energies: NIST X-ray Transition Energies Database.
- Textbook (after checking the copy): Mallya SM, Lam EWN, eds. White and Pharoah's Oral Radiology: Principles and Interpretation.

Short "Refs:" line for the caption: `Refs: McCollough 1997 & Zink 1997, Radiographics; Seibert 2004, J Nucl Med Technol; EC Radiation Protection 136 (2004); IAEA SRS 108 (2022). Schematic animation.`

---

## Appendix — how each source was accessed

| Source | Access |
|---|---|
| PubMed abstracts (all PMIDs above) | PubMed tools, metadata + abstract |
| Hellen-Halme 2013; Benavides 2026 | PMC full text (PMC3887573; PMC13580382) |
| Seibert 2004 | Free full text at tech.snmjournals.org/content/32/3/139, read through the fetch tool (two passes, verbatim excerpts); direct download blocked |
| EC Radiation Protection 136 (2004) | Full PDF from the EU Publications Office; text extract kept at `_scratch/dl/EC_RP136_2004.txt` (section 4 at lines ~2022-2162; Table 4.1 at ~2463-2476) |
| IAEA SRS 108 (2022), STI/PUB/1972 | Full PDF from www-pub.iaea.org; text extract kept at `_scratch/dl/IAEA_SRS108_2022.txt` (section 5.1.2.1 at lines ~2236-2275) |
| 21 CFR 1020.30 and 1020.31 | law.cornell.edu/cfr/text/21/1020.30 and /1020.31 through the fetch tool (ecfr.gov refused the connection) |
| Oregon OAR 333-106 Table 5 | PDF from oregon.gov, read directly |
| NIST X-ray Transition Energies (W) and NIST mass attenuation coefficients (Al, Z = 13) | physics.nist.gov, queried directly |
| "Radiography and Radiology for Dental Care Professionals" 3rd ed.; Thomson (Mosby's Comprehensive Review of Dental Hygiene) | Chapter excerpts on pocketdentistry.com through the fetch tool (first one cut off by a paywall) — textbook-level corroboration only, never the sole support for an on-screen number |
| Blocked / not read | White and Pharoah (book); NCRP Report 177; Benavides 2024 full text; Lurie & Kantor, J Am Dent Assoc 2020;151:716-719.e3 (PMID 32979944, no abstract); StatPearls "X-ray Production" |

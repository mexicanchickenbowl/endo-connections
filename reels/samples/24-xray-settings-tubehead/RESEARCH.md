# 24 — kVp, mA and exposure time: what each setting does inside the X-ray tube head — RESEARCH BRIEF

Research stage only (nothing built). Prepared 2026-11-22.
Journal-article facts below were retrieved from PubMed (abstracts via the PubMed tools; PMC full text where stated) and each
carries its PMID and DOI link. Guideline / regulation / reference-data facts were read directly from the primary document
(source and location given). "Verified from" says exactly what was read. Anything not read is marked **NOT VERIFIED**.

**Fact-checked 2026-11-22 (independent adversarial pass).** Every PMID, citation and quoted abstract number below was
re-pulled from PubMed; Hellen-Halme 2013 was re-read in PMC; Seibert 2004, 21 CFR 1020.30/1020.31, the NIST tungsten
lines, the Oregon rule and the saved RP136 / IAEA text extracts were re-read; the toy-spectrum numbers were recomputed.
No citation error was found, but several statements were stronger than their sources. Changes are tagged **[FC]** in
place and listed in the "Fact-check log" at the end of this file. Where the builder's notes and an [FC] tag disagree,
the [FC] tag wins.

**Bottom line for the builder**

- The three-knob story in the brief is correct physics and is supportable from abstract-level or primary sources:
  mA = how many electrons, time = how long, kVp = how hard each electron hits (and, as a consequence, also how many photons).
- Four things in the brief need correcting before anything goes on screen: (1) the "US 1.5 mm / 2.5 mm Al" filtration rule is
  not what the federal standard says (it is an HVL table); (2) "about 1% X-rays" is an upper bound at dental kV — write
  "~99% heat"; (3) "7–10 mA": 7 mA is fine, 10 mA is above what IAEA 2022 calls usual ("usually 3.5 to 8 mA"); the units
  in recent studies ran 6–7 mA (wall) and 2.5 mA (handheld) — examples, not a survey [FC wording]; (4) the kVp-contrast
  effect is real but small between 60 and 70 kVp on digital sensors — the swatch must be labeled as exaggerated.
- **[FC] Three builder traps found in the fact-check:** (i) Seibert 2004 gives NO heat percentage and NO kVp-squared
  statement — "~99% heat" is Zink 1997 only and "~kVp squared" is McCollough 1997 / Nickoloff 1993 only, so the source
  line must name the paper that carries each number; (ii) 70 kVp is above the 69.5 kV tungsten K threshold, so never
  write that K lines are "impossible" at 70 — just draw none; (iii) "the operator only changes time" is an inference,
  not a quoted finding — say "time is the main working control".
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
| 1 | A heated tungsten filament releases electrons (thermionic emission); more filament heating = more electrons | Seibert JA. J Nucl Med Technol 2004;32(3):139-147. PMID 15347692 (no DOI in PubMed record) | "A larger filament current produces more heat and releases a greater number of electrons." Filament "releases electrons by a process known as thermionic emission" "at a rate dependent on the filament temperature (i.e., the filament current)". Tube current is "the number of electrons traveling between the electrodes". | Full text (journal site, free; excerpts pulled with the fetch tool, read twice; [FC] the thermionic-emission and "larger filament current" sentences re-confirmed in a third pass) | High |
| 2 | Each electron arrives with kinetic energy (keV) equal to the tube voltage (kV) | Seibert 2004 (as above) | "Each electron attains a kinetic energy (in keV) equal to the applied tube voltage." | Full text (quote re-confirmed [FC]) | High. [FC] physics note: on a self-rectified (AC) unit this equals kVp only at the instant of peak voltage; most electrons arrive with less (see row 14) |
| 3 | ~99% of the energy becomes heat; only ~1% becomes X-rays | Zink FE. X-ray tubes. Radiographics 1997;17(5):1259-1268. PMID 9308113. [DOI](https://doi.org/10.1148/radiographics.17.5.9308113) | "The process of creating the x-ray beam is very inefficient, with only 1% of the electric energy converted to x-ray photons and the remaining 99% converted to heat in the x-ray tube assembly." (General diagnostic tubes, not dental-specific.) | Abstract (re-pulled, quote exact [FC]) | High for "~99% heat"; Med for an exact 1% at 60-70 kV (see corrections). [FC] Zink is the ONLY source read for this percentage — the Seibert 2004 full text gives no heat / X-ray split — so any source line shown with "~99% heat" must name Zink 1997 |
| 4 | Tungsten target set in a copper block/stem that carries the heat away; oil around the tube | "Radiography and Radiology for Dental Care Professionals", 3rd ed. (chapter excerpt on pocketdentistry.com; the page shows the book title but not the authors — I believe it is Whaites & Drage, unconfirmed); Thomson EM, ch. 6 in Mosby's Comprehensive Review of Dental Hygiene (excerpt, same site; edition not shown) | First book: "a target (a small piece of tungsten) set into the angled face of a large copper block"; "Surrounding oil facilitates the removal of heat"; "heat (about 99%) or X-rays (about 1%)". Thomson: "Copper stem—functions to conduct heat away from the target"; "Less than 1% of the kinetic energy ... is converted into x-ray energy". | Textbook excerpts read online through the fetch tool (not the printed books). [FC] NOT re-checked in the fact-check; authorship and edition unconfirmed. [Citation audit] The book's authors are confirmed as Eric Whaites and Nicholas Drage (3rd ed., Elsevier, ISBN 978-0-7020-4598-1; bookseller listing); the quoted passages themselves could not be re-found and stay unverified. Seibert 2004 (full text) does carry two of the drawn parts: "a metal focusing cup (cathode cup)" and, in the Fig. 3 caption, "transformer oil and expansion bellows to provide electrical and heat build-up protection"; it has no copper block and no aluminum filter | Med (textbook-level, consistent). [FC] Use for drawing the tube only; never as the cited source of an on-screen number |
| 5 | Energy into the anode = kV x mA x s (e.g. 70 kV x 7 mA = 490 W while the beam is on; 0.2 s = 98 J) | Derived: P = V x I for a constant-potential (DC) unit. Seibert 2004 describes heat loading in the same terms. | Seibert (glossary, heat unit): "The unit, equal to the product of the kVp and mA, is used to describe the accumulation or dissipation of heat energy" (excerpt was cut by the tool at this point; the exposure-time factor was not seen in the excerpt). Also: "Buildup of heat energy is the major limit to instantaneous x-ray production and x-ray tube longevity". The 490 W / 98 J figures are arithmetic, not a published measurement; true for DC waveforms, lower for self-rectified AC. [FC] Re-read: the heat-loading section of Seibert defines the heat unit as "the product of tube current (mA), peak tube voltage (kVp), and exposure time (s)" — so a "kV x mA x s" readout is supported by the paper; the glossary entry is the one that omits time. | Derived from first principles + full-text excerpts (heat-unit definition re-read [FC]) | High (as arithmetic; recomputed 490 W, 98 J [FC]); label "DC unit" if shown. Never print watts or joules as if measured |

### A2. What each knob does to the beam

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 6 | X-ray quantity is proportional to tube current (mA) | McCollough CH. The AAPM/RSNA physics tutorial for residents. X-ray production. Radiographics 1997;17(4):967-984. PMID 9225393. [DOI](https://doi.org/10.1148/radiographics.17.4.9225393) | "The quantity of x-rays produced varies proportionally to the tube potential squared, tube current, exposure time, and atomic number of the anode material and is inversely proportional to the distance squared." | Abstract | High |
| 7 | X-ray quantity is proportional to exposure time; mA x s = mAs | McCollough 1997 (as above); Seibert 2004 | McCollough: as row 6. Seibert: "the combination of tube current and exposure time in milliampere-seconds (mAs)"; "photon fluence (directly proportional to the mAs)". | Abstract; full text | High |
| 8 | Maximum photon energy (keV) = kVp | Seibert 2004 | "...with maximum x-ray energy (in keV) determined by the peak potential difference (in kVp)." | Full text | High |
| 9 | kVp sets peak AND mean photon energy (beam quality) | European Commission. Radiation Protection 136: European guidelines on radiation protection in dental radiology. Luxembourg, 2004, section 4.1 | "Kilovoltage controls the mean and peak X-ray energies in the X-ray beam." | Guideline (full document read) | High |
| 10 | Mean photon energy is only about 1/3 to 1/2 of the peak | Seibert 2004 | "The average x-ray energy in a typical x-ray spectrum is about one-third to one-half peak energy, dependent on the amount of filtration placed in the beam." | Full text (quote re-confirmed [FC]) | **Med for a dental beam [FC — downgraded].** Seibert's sentence is a general rule for "a typical x-ray spectrum". Re-running this brief's own toy model (Kramers x 1.5-2.5 mm Al, constant potential) gives a mean of about 32-34 keV at 60 kV and 35-38 keV at 70 kV, i.e. 0.50-0.57 of kVp — at or slightly ABOVE one half, not inside "1/3 to 1/2". Do not put a mean-energy number or fraction on screen; "most photons are well below kVp" is the safe wording |
| 11 | Output also rises with kVp: approximately with kVp squared | McCollough 1997; Nickoloff EL, Berman HL. Factors affecting x-ray spectra. Radiographics 1993;13(6):1337-1348. PMID 8290728. [DOI](https://doi.org/10.1148/radiographics.13.6.8290728) | McCollough: "varies proportionally to the tube potential squared". Nickoloff: "As peak tube potential increases, the half-value layer increases nearly linearly; radiation output increases by approximately the square of the tube potential." | Abstracts (both re-pulled, quotes exact [FC]) | High as "approximately"; the exponent is not exactly 2 (see caveats). [FC] Only these two papers state the square law — Seibert 2004 does not say how quantity changes with kVp. "Output" means exposure / air kerma at the tube port, not a photon count and not receptor or patient dose |
| 12 | The spectrum is continuous (bremsstrahlung) with characteristic lines on top | McCollough 1997 | "Bremsstrahlung x-rays produce a continuous x-ray spectrum, whereas characteristic x-rays are produced at specific narrow bands of energies." | Abstract | High as a general statement. [FC] It is NOT a licence to draw spikes: at 60-70 kVp on tungsten there are no K lines worth drawing (row 13), and the L lines (about 8-12 keV) lie in the part of the spectrum the filter removes (textbook; not read here) |
| 13 | Tungsten K lines appear only above 69.5 kV: none at 60 kVp; at 70 kVp the tube is only about 0.5 kV over the threshold, so none worth drawing [FC wording — was "so not at 60-70 kVp"] | Seibert 2004; NIST X-ray Transition Energies Database (tungsten, Z = 74) | Seibert: "For tungsten, binding energies of the K, L, and M shells are 69.5, 11.5, and 2.5 keV"; "K-characteristic radiation from a tungsten target will occur only when the x-ray tube is operated at a voltage of >69.5 kVp". NIST: W K edge 69.51-69.53 keV; K-L3 (K-alpha1) 59.318 keV; K-L2 (K-alpha2) 57.982 keV; K-M3 (K-beta1) 67.245 keV. | Full text; reference database (both re-read [FC]: Seibert quotes exact; NIST K edge 69.5085 / 69.5248 keV experimental, 69.533 keV theory; KL3 59.3188, KL2 57.9818, KM3 67.2450 keV) | High for the 69.5 kV threshold and the line energies. [FC] "Not at 60-70 kVp" was too strong: 70 is above 69.5, so K-shell ionization is energetically possible at a true 70 kV peak. That the yield is negligible that close to threshold is physics reasoning, not a sentence read in any source — write "none drawn" / "negligible", never "impossible at 70 kVp". Cite NIST (not Seibert) for line energies: Seibert's worked example gives a rounded "57.0 keV" for the L-to-K transition |
| 14 | Generator waveform matters: at the same kVp a constant-potential (DC) unit gives a harder beam than a pulsating (AC) unit | EC RP136 (2004) section 4.1; Nickoloff 1993 | RP136: DC "produces proportionately fewer low energy X-rays"; "The mean X-ray energy from a constant potential (DC) X-ray set is higher than that from an alternating potential (AC) X-ray set at the same operating kilovoltage"; "a kilovoltage setting of 5-8 kV lower is needed to maintain radiographic contrast". Nickoloff: units "with high (100%) ripple such as single-phase units produce less penetrating radiation than units with low (4%) ripple". | Guideline; abstract | High |
| 15 | Intensity falls with the square of distance (inverse square law) | McCollough 1997 | "...and is inversely proportional to the distance squared." | Abstract | High (but distance is not a console setting — caption only) |

### A3. Filter, collimator, regulations

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 16 | The aluminum filter removes low-energy photons (they would only add skin dose) | EC RP136 (2004) section 4.2, Recommendation 4C; Nickoloff 1993 | RP136: "Filtration of the X-ray beam preferentially removes lower energy X-ray photons from the beam. Thus it is invaluable as a means of reducing skin doses to patients ... fitted at manufacture and is therefore a factor that is not readily under the control of the dentist." Nickoloff: added filtration "reduces both skin surface dose and average depth-dose, with the optimal amount being approximately 2-3 mm or less of aluminum-equivalent material". | Guideline; abstract (both re-read [FC]) | High for the principle. [FC] Nickoloff's "2-3 mm" is about general diagnostic radiology, not dental units — do not quote it as a dental optimum |
| 17 | US federal standard: minimum half-value layer 1.5 mm Al for intraoral units at 70 kVp and below | 21 CFR 1020.30(m)(1), Table 1 ("Specified dental systems" column = intraoral systems manufactured after Dec 1, 1980) | "The HVL of the useful beam for a given x-ray tube potential shall not be less than the appropriate value shown in table 1". Table: 1.5 mm Al at 30, 40, 50, 51, 60 and 70 kVp; 2.1 mm at 71 kVp; 2.3 mm at 80; 2.5 mm at 90; 2.7 mm at 100. It specifies HVL, not total filtration. | Regulation (read on law.cornell.edu via the fetch tool; ecfr.gov blocked). [FC] Re-read independently 2026-11-22: the sentence, every table value quoted here and footnote 1 ("Dental x-ray systems designed for use with intraoral image receptors and manufactured after December 1, 1980") confirmed; paragraph (m) states no filter thickness | High |
| 18 | "Total filtration 1.5 mm Al up to 70 kVp, 2.5 mm Al above 70 kVp" (the textbook / board wording) | Oregon Administrative Rules ch. 333 div. 106, Table 5 (state rule, read directly). Also stated as "federal regulations" in Thomson, Mosby's Comprehensive Review of Dental Hygiene. White and Pharoah: NOT VERIFIED. | Oregon Table 5, "Total Filtration: Inherent + Added (in mm Al Equivalent)": dental systems 50-70 kVp = 1.5; >70 kVp = 2.5. Thomson: "Federal regulations require 1.5 millimeters (mm) of aluminum-equivalent filtration for units operating below 70 kVp and 2.5 mm ... for units capable of operating above 70 kVp." | State regulation; textbook excerpt online. [FC] Oregon Table 5 PDF and the rule text re-read; Thomson excerpt NOT re-checked | High that this is the taught (board) number. **Med as a "state rule" [FC — corrected]:** Oregon's rule text (OAR 333-106-0101(7)) is itself an HVL rule — "The HVL of the useful beam for a given X-ray tube potential shall not be less than the values shown in Table 4" (intraoral units made on or after Dec 1, 1980: minimum HVL 1.5 mm Al) — and says only that the HVL requirement is "considered to have been met if it can be demonstrated" that total filtration is not less than Table 5. Table 5 is therefore an accepted way of showing compliance, not a free-standing filtration law. It is NOT the wording of the federal standard (row 17) |
| 19 | International: HVL at least 1.5 mm Al at 70 kV and below, 2.1 mm Al at 71 kV and above | IAEA. Radiation Protection in Dental Radiology. Safety Reports Series No. 108. Vienna: IAEA, 2022, section 5.1.2.1 (citing EC RP162) | "The total filtration has to be such as to ensure that the measured half-value layer is equal to or greater than 1.5 mm aluminium equivalent for units operating at or below 70 kV, and 2.1 mm aluminium for units operating at 71 kV or higher." | Guideline (full document read) | High |
| 20 | US: the intraoral X-ray field must fit inside a 7 cm circle at the minimum source-skin distance, i.e. at the end of the cone (6 cm if that distance is < 18 cm); source-skin distance at least 18 cm for units operable above 50 kVp [FC wording] | 21 CFR 1020.31(f)(1) and (i)(1); Magill D et al. Dentomaxillofac Radiol 2019;48(2):20180183. PMID 30346798. [DOI](https://doi.org/10.1259/dmfr.20180183) | CFR: field "shall be containable in a circle having a diameter of no more than 7 cm" (SSD 18 cm or more) / "6 cm" (SSD under 18 cm); SSD limited to not less than "Eighteen cm if operable above 50 kVp". Magill: "US FDA regulations allow a maximum beam size of 38.5 cm2 on the patient skin". | Regulation; abstract (both re-read [FC]; a 7 cm circle is 38.5 cm2) | High |
| 21 | Rectangular collimation cuts patient dose (reported range across studies 40-92% vs round — a range, not a pooled estimate [FC]) | Shetty A et al. Int Dent J 2019;69(2):84-97. PMID 29959778. [DOI](https://doi.org/10.1111/idj.12411) | Systematic review, 13 studies (phantom/dosimetry, mixed receptors), high heterogeneity, GRADE moderate: "The radiation dose reduction ranged from 40% to 92% compared with circular collimation." | Abstract (re-pulled [FC]) | High as a range across 13 heterogeneous studies in "patient or in phantoms" with different receptors and dose measures. [FC] The abstract reports no meta-analysis, so never call it "pooled" and never quote a single number |
| 22 | Full-mouth series, PSP or F-speed film: 170.7 microSv round vs 34.9 microSv rectangular collimation | Ludlow JB, Davies-Ludlow LE, White SC. J Am Dent Assoc 2008;139(9):1237-1243. PMID 18762634. [DOI](https://doi.org/10.14219/jada.archive.2008.0339) | Phantom dosimetry, ICRP 2007 weights: FMX PSP/F-speed rectangular 34.9 microSv; FMX PSP/F-speed round 170.7 microSv; FMX D-speed round 388 microSv; 4 bitewings rectangular 5.0 microSv. | Abstract | High (board classic; off-topic for this reel — caption at most) |
| 23 | NCRP Report No. 177 (2019) reinforced its recommendation for rectangular collimation | Johnson KB, Ludlow JB. J Am Dent Assoc 2020;151(10):726-734. PMID 32979952. [DOI](https://doi.org/10.1016/j.adaj.2020.06.019) | "The National Commission [sic] on Radiation Protection and Measurements has reinforced its recommendation for the use of rectangular collimation for intraoral radiography in its Report No. 177 published in 2019." Adult FMX at 70 kVp: 86 microSv circular vs 54 microSv best rectangular. [FC] Context the numbers need: phantom dosimetry (optically stimulated luminescence dosimeters), 18-projection adult series, and the round comparator was a 6 cm collimator (smaller than the 7 cm US maximum). 86 -> 54 is a 37% reduction — much less than the 80% of row 22 (170.7 -> 34.9) and just under the 40-92% range of row 21, which this study postdates. The correct name is National Council on Radiation Protection and Measurements. | Abstract (the NCRP report itself was NOT read) | High for the attribution; no NCRP numbers verified |

### A4. What the image does

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 24 | Higher kVp = lower image contrast (more grays); lower kVp = higher contrast | EC RP136 (2004) section 4.1 | "'Low' kilovoltages produce images of higher contrast than do higher kilovoltages. This reflects the different types of attenuation of low and high energy radiation." | Guideline | High as a principle (film-era wording) |
| 25 | On digital sensors, 60 vs 70 kVp changes contrast very little | Pita de Melo D et al. Dentomaxillofac Radiol 2026 (online Jul 31). PMID 42538829. [DOI](https://doi.org/10.1093/dmfr/twag056) | Phantom study, 3 CMOS sensors, handheld 60 kVp/2.5 mA and wall unit 60 and 70 kVp/7 mA, 14 exposure times: "Sensor type, x-ray unit, and exposure time influenced image contrast and spatial resolution, while variations in kVp had minimal impact on these image quality parameters." | Abstract (re-pulled, quote exact [FC]) | Med (one in vitro phantom study, one observer; "contrast" = difference in displayed mean gray value between two step-wedge steps, i.e. after each sensor's own processing). [FC] The same abstract says the X-ray unit mattered (the handheld gave the HIGHEST contrast), whereas Ruiz 2025 (row 31) found a handheld gave LOWER contrast than a fixed unit at the same nominal 60 kVp. Unit and sensor effects are inconsistent between studies and larger than the 60-vs-70 kVp effect. Supports the caveat only — not a general law |
| 26 | 60 vs 70 kV: no diagnostic gain shown, more absorbed dose at 70 kV (one phantom study) | Hellen-Halme K, Nilsson M. J Oral Maxillofac Res 2013;4(3):e2. PMID 24422035. [DOI](https://doi.org/10.5037/jomr.2013.4302) | Head phantom, Gafchromic film, two bitewings, equal entrance dose (exposure time cut 20% at 70 kV for equal signal-to-noise): mean/integral absorbed dose ratio 70:60 kV = 1.4-1.5; "approximately 40-50% higher". Cites own earlier work: no significant difference in approximal-caries accuracy 60 vs 70 kV. Used a medical tube matched for HVL, not a dental unit. [FC] Full text re-read: exposures were 0.12 s at 60 kV vs 0.10 s at 70 kV; Table 1 ratios (70:60) are mean 1.40-1.50 and integral 1.40-1.49, but the MAXIMAL dose in the occlusal (primary-beam) plane is 0.99 — the extra dose is depth and scatter dose, not peak dose. The "no diagnostic gain" half rests on Hellen-Halme K. Clin Oral Investig 2011;15(2):209-213. PMID 20143243. [DOI](https://doi.org/10.1007/s00784-010-0383-0) — in vitro, 100 extracted teeth, 7 observers, ROC with histology: "No significant difference in accuracy of approximal carious lesion diagnosis was found between the two voltage settings" (abstract; five observers rated dentin lesions better at 70 kV). | Full text (PMC3887573, re-read [FC]); abstract for the 2011 paper | Med (single in vitro phantom study; equal signal-to-noise design) |
| 27 | 60 vs 90 kV: equal lesion visibility in vitro; raising kV lowers entrance dose but barely the absorbed dose | Kaeppler G et al. Dentomaxillofac Radiol 2007;36(2):75-79. PMID 17403883. [DOI](https://doi.org/10.1259/dmfr/75743437); Kaeppler G et al. Dentomaxillofac Radiol 2007;36(8):506-513. PMID 18033949. [DOI](https://doi.org/10.1259/dmfr/32903218) | First paper: F-speed film and PSP "demonstrated equal quality ... regardless of exposure at 60 kV or 90 kV" (dried skulls, 6000 assessments). Second: 90 vs 60 kVp reduced absorbed dose only "to 92.4%"; entrance dose fell "by 30% to 35%". | Abstracts (both re-pulled, numbers exact [FC]) | Med (both in vitro: dried skulls with prepared lesions; phantom / filter dosimetry with calculated absorbed dose) |
| 28 | Film-era classic: caries accuracy better at lower kV; 60 kV "a proper balance" | Svenson B et al. Swed Dent J 1985;9(1):37-43. PMID 3859029 (no DOI) | 50, 60, 70, 90 kV; two film speeds; ROC: "significant difference ... with better diagnostic accuracy for the lower kilovoltages"; "a kilovoltage of 60 offers a proper balance between absorbed radiation dose and diagnostic accuracy". | Abstract | Med (extracted premolars, film) |
| 29 | Digital receptors have a wide exposure latitude; exposure runs from too little (noise) up to sensor saturation, with an optimum in between | Udupa H et al. Oral Surg Oral Med Oral Pathol Oral Radiol 2013;116(6):774-783. PMID 24237729. [DOI](https://doi.org/10.1016/j.oooo.2013.08.019); Barrineau AB, Mah P, Mallya SM. J Am Dent Assoc 2023;154(1):24-31. PMID 36402578. [DOI](https://doi.org/10.1016/j.adaj.2022.09.008); Farman AG, Farman TT. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2005;99(4):485-489. PMID 15772598. [DOI](https://doi.org/10.1016/j.tripleo.2004.04.002); IAEA SRS 108 section 2.1.2.2; Hellen-Halme 2013 | Udupa: 20 systems exposed "from the lowest exposure time until the sensor saturated"; optimal exposure = "the lowest exposure where maximum spatial resolution and contrast/detail detectability were achieved"; systems "varied greatly in latitude". Barrineau: 7 sensors, Planmeca ProX at 63 kVp and 6 mA; images at the optimal exposure "yielded better visualization and more accurate measurements of the file tip relative to the apex". Farman: upper limit of latitude = "pixel blooming or unacceptable levels of cervical burnout". IAEA: digital receptors "exhibit wider latitude (i.e. range of detectable exposures)". Hellen-Halme: the dentist must "use a dose at which the quantum noise will not impair the diagnostic accuracy". | Abstracts; guideline; full text (all re-read [FC]; quotes exact) | High for latitude, saturation and the existence of an optimum. **Med for "too little exposure = noisy" [FC]:** the only read support is one sentence in the discussion of Hellen-Halme 2013 (quantum noise), not a measurement, and Ruiz 2025 found noise moved in opposite directions on two CMOS systems. No source read states "more mAs = less noise" as a number. [FC] Barrineau 2023 is a phantom (in vitro) study — a custom phantom with one endodontically prepared tooth — not clinical; Udupa used a DC source and a phantom |

### A5. Typical settings

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Conf. |
|---|---|---|---|---|---|
| 30 | Recommended / usual intraoral tube voltage: 60-70 kV [FC wording — was "Typical intraoral unit"] | IAEA SRS 108 (2022) section 5.1.2.1; EC RP136 (2004) Recommendation 4A | IAEA: "a minimum tube voltage of 60 kV should be used, produced by a direct current (DC) or alternating current (AC) generator." RP136: "65 to 70 kV is recommended as the kilovoltage of choice for dental (intraoral) X-ray sets using AC equipment, with 60kV for those using DC X-ray sets." | Guidelines (saved extracts re-read [FC]) | High that these are the recommendations (RP136 grade B; RP136 is a 2004, film-era document). They are recommendations, not a survey of units in use; row 33 is the only usage figure and it is from 2002 |
| 31 | Typical tube current: a few mA (about 3.5-8 mA on wall units; about 2.5 mA handheld); exposure well under 1 s | IAEA SRS 108 section 5.1.2.1; Pita de Melo 2026; Ruiz DC et al. Braz Dent J 2025;36:e236319. PMID 41172496. [DOI](https://doi.org/10.1590/0103-644020256319); Barrineau 2023 | IAEA: "The tube current is usually 3.5 to 8 mA"; exposure times "between 0.01 and 4 s, although sub-second exposure times are normal nowadays"; handheld units "operate at a longer exposure time owing to their relative low tube current". Pita de Melo: handheld 60 kVp/2.5 mA; wall 60 and 70 kVp/7 mA. Ruiz: handheld 60 kVp, 2.5 mA, 0.45 s vs fixed 60 kVp, 7 mA, 0.16 s. Barrineau: 63 kVp, 6 mA. | Guideline; abstracts (all re-read [FC]; numbers exact) | High for the IAEA range. [FC] The 6-7 mA and 2.5 mA figures are the settings of four individual study units — examples, not a survey; say "e.g." |
| 32 | On intraoral units exposure time is the main working control; kV and mA are fixed or offer only a few steps [FC wording — was "the operator really only changes time"] | EC RP136 section 4.1; Hellen-Halme 2013 | RP136: "In the case of dental (intraoral) X-ray sets, kilovoltage is usually either fixed or minimally variable." Hellen-Halme: "Given proper filtration and collimation, only the tube voltage and the exposure time can be adjusted to change the absorbed dose." | Guideline; full text (both re-read [FC]; quotes exact) | **Med [FC — downgraded from High].** Neither source says "only time". RP136 (2004) says kV is "usually either fixed or minimally variable" and is silent on mA; Hellen-Halme names tube voltage AND exposure time as the adjustable parameters (mA is the one it leaves out). "Most units fix both kV and mA" is an inference from the two; at least some current wall units offer a choice of kV (the wall unit in Pita de Melo 2026 was run at both 60 and 70 kVp). Caption wording: "time is the main working control", never "the only control" |
| 33 | Historic US practice: 70 kVp dominant | Geist JR, Katz JO. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 2002;93(4):496-505. PMID 12029291. [DOI](https://doi.org/10.1067/moe.2002.121387) | Survey of all 65 US and Canadian dental schools (100% response): "The most commonly used tube potential is 70 kVp (88%)." | Abstract | High (dated; caption only) |

### A6. Not verified — keep off screen

| # | Statement | Status |
|---|---|---|
| N1 | Any wording attributed to White and Pharoah's Oral Radiology (Mallya SM, Lam EWN, eds.; 8th ed., Elsevier 2019 is the edition known to me — check whether a newer one exists) | **NOT VERIFIED** — book not accessible in this session. Do not put "White & Pharoah" in a source line until checked against the book. |
| N2 | NCRP Report No. 177 (2019): exact "shall/should" wording on kVp range (60-80 kVp is reported by secondary web sources), filtration, numbers for rectangular collimation | **NOT VERIFIED** — report is paywalled; only the attribution in row 23 was confirmed. |
| N3 | ADA 2024 "Optimizing radiation safety in dentistry" (Benavides E et al. J Am Dent Assoc 2024;155(4):280-293.e4. PMID 38300176. [DOI](https://doi.org/10.1016/j.adaj.2023.12.002)): specific statements on kV (60-80 kV) and rectangular collimation | **NOT VERIFIED** beyond the abstract (full text blocked; abstract has no equipment numbers). Existence, title and citation confirmed. |
| N4 | Efficiency formula (fraction to X-rays is roughly 9 x 10^-10 x Z x V, or E x Z / 820,000), giving about 0.40-0.47% with the first constant or 0.54-0.63% with the second at 60-70 kV on tungsten — roughly 0.4-0.6% depending on which textbook constant is used ([FC] arithmetic redone; the brief's "0.5-0.6%" reflected only the second form) | **NOT VERIFIED** in a source read here (standard physics-textbook formula, e.g. Bushberg). Used only to justify writing "~99% heat" rather than "exactly 1% X-rays". |
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
   [FC] Zink 1997 is the only source read for the percentage (Seibert gives none), so the source line must name Zink
   whenever "~99%" is visible. The "kV x mA x s" readout is supported by Seibert's heat-unit definition (mA x kVp x s).
6. **No tungsten K lines to draw.** Draw no spikes at 60 or at 70 kVp. (Seibert 2004; NIST.)
   [FC — softened] The annotation "W K-lines need >69.5 kV" is a true sentence, but the reel dials the knob to 70, which
   is above 69.5; a viewer will reasonably ask where the lines are, and "negligible at 70 kVp" is not a statement read
   in any source. Preferred: no annotation at all (put the point in the caption). If one is used, word it
   "no W K-lines below 69.5 kV" and show it only while the knob reads 60.
7. **Image.** On screen: "kVp up: more grays, less contrast", swatch labeled "exaggerated".
   (EC RP136 for the principle; Pita de Melo 2026 for the "minimal at 60 vs 70 kVp on CMOS" caveat.)
   [FC — second half removed from the on-screen list] The original line continued "mAs up: more signal (film darker;
   digital less noisy, until it saturates)". "Film darker" was not read in any source (textbook sensitometry), and
   "less noisy" rests on one discussion sentence (Hellen-Halme 2013), not a measurement. Keep that half for the caption,
   worded "too little exposure: noisy; too much: the sensor saturates; there is an optimum (Udupa 2013, in vitro)".
   If an mAs image cue is wanted on screen, write only "mAs: more photons reach the sensor" and do not darken a
   digital swatch.
8. **Aluminum filter.** Label only: "Al filter: removes low-energy photons". No thickness number on screen
   (if one is wanted: "HVL at least 1.5 mm Al at 70 kVp and below — 21 CFR 1020.30"; [FC] CFR text re-read, correct —
   note that it is a half-value layer, not a filter thickness, and applies to intraoral units made after Dec 1, 1980).

End-card cheat sheet (three lines, about 15 words):
`mA  -> how many`  /  `time -> how long (mAs = mA x s)`  /  `kVp -> how hard (max keV = kVp) + how many`

Suggested single source line (24-26 px) — [FC] corrected so that every on-screen number has its own paper:
`McCollough; Zink, Radiographics 1997 · Seibert, J Nucl Med Technol 2004 · spectra schematic`
Which paper carries what (do not shuffle): mA and time proportionality, "~ kVp squared", spectrum shape — McCollough 1997
(abstract); "~99% heat" — Zink 1997 (abstract); thermionic emission, "max keV = kVp", 69.5 kV K threshold, heat unit
mA x kVp x s — Seibert 2004 (full text). If "~99% heat" is dropped from the screen, Zink can be dropped from the line.
If per-scene lines are used instead: mA / kVp / time scenes "McCollough, Radiographics 1997"; heat gauge
"Zink, Radiographics 1997".

Illustrative console values that are realistic and make the arithmetic visible (label "values illustrative"):
mA 4 -> 8 (x2 photons; inside the IAEA "usually 3.5 to 8 mA" range); kVp 60 -> 70 (max keV 60 -> 70; square law gives
x1.36); time 0.10 -> 0.20 s (x2; mAs counter 0.8 -> 1.6 at 8 mA).
[FC] Arithmetic rechecked: (70/60)^2 = 1.36; 8 mA x 0.10 s = 0.8 mAs, x 0.20 s = 1.6 mAs. The x1.36 is for exposure
(air kerma). The area under a photon-count curve grows a little more (about x1.5 in the toy model with 1.5-2.5 mm Al),
so a scope curve that grows anywhere between x1.36 and x1.5 is defensible as long as it is labeled schematic; print
no growth factor other than "~ kVp squared".

---

## (c) Corrections to the brief

1. **Filtration rule is misattributed.** The brief says "US requirement 1.5 mm Al up to 70 kVp and 2.5 mm above". The federal
   performance standard (21 CFR 1020.30(m), Table 1) sets a minimum **half-value layer**, not a filter thickness: 1.5 mm Al
   at every listed kVp up to 70 for intraoral units, then 2.1 mm at 71 kVp, 2.3 mm at 80 and 2.5 mm at 90. The 1.5 / 2.5 mm
   **total filtration** numbers are what review textbooks teach. They also appear in Oregon's Table 5 (read directly;
   values re-confirmed [FC]), but [FC — corrected] Oregon's rule is itself an HVL requirement and Table 5 is only the
   total filtration that is "considered" to meet it (OAR 333-106-0101(7)) — so no regulation read in this project sets
   1.5 / 2.5 mm as a free-standing legal requirement. For a board answer learn both ("1.5 mm up to 70 kVp, 2.5 mm
   above" as the textbook total filtration; "minimum HVL 1.5 mm Al up to 70 kVp" as the federal standard), but an
   on-screen "US law: 2.5 mm above 70 kVp" would be wrong as written.
2. **"About 1% X-rays" is a ceiling, not the dental value.** Zink 1997 gives 1% / 99% for diagnostic tubes generally.
   Efficiency rises with kV; by the standard textbook formulas it is roughly 0.4-0.6% at 60-70 kV (formulas not verified
   here; [FC] range recomputed). Write "~99% heat" and avoid a precise X-ray percentage.
3. **"7-10 mA": the 10 is high for current units** [FC — softened from "is dated"]. IAEA 2022: "usually 3.5 to 8 mA".
   The units in the recent studies read here ran at 6-7 mA (wall) and 2.5 mA (handheld) — four study set-ups, not a
   survey. The one usage survey read found 10-12 mA at 65-70 kV in Belgian offices in 2004 (Jacobs R et al.
   Dentomaxillofac Radiol 2004;33(5):334-339. PMID 15585812. [DOI](https://doi.org/10.1259/dmfr/22185511); abstract
   re-pulled [FC]). [FC] The earlier wording "10-15 mA belongs to older AC units" went beyond that abstract (it says
   neither 15 mA nor AC) and has been removed. Safe caption wording: "about 7 mA is common (IAEA: usually 3.5-8 mA)".
4. **kVp squared is approximate and is about tube output**, not receptor exposure or patient dose. Behind the patient the
   dependence is steeper because penetration also rises (textbook; not read here [FC]). A simple filtered-spectrum
   calculation done for this brief (Kramers shape x 2 mm Al, NIST coefficients — a toy model, not a measurement) gives
   a photon-count exponent nearer 2.8 between 60 and 70 kV. [FC] Recomputed independently: photon count 2.65 / 2.80 /
   2.94 for 1.5 / 2.0 / 2.5 mm Al — confirmed; but the same model weighted for AIR KERMA (which is what "output" and
   the square law refer to) gives 2.0 / 2.1 / 2.3, i.e. the published "approximately squared" holds. The 2.8 is not a
   contradiction of McCollough or Nickoloff and must not be presented as one. Keep "~" on screen and do not compute
   doses from it.
5. **The peak of the spectrum is not at kVp, and the mean is not either.** kVp is the right-hand end point. Seibert's
   general rule puts the mean at about 1/3-1/2 of kVp; [FC] for a filtered constant-potential dental beam the toy model
   puts it at or just above one half (0.50-0.57 of kVp), so state no fraction on screen — "most photons are well below
   kVp" is enough. In the toy model the most common energy barely moves when going 60 -> 70 kV (recomputed [FC]:
   28.6 -> 29.6 keV with 2 mm Al; 26-30 keV across 1.5-2.5 mm Al); what changes is the high-energy tail and the height.
   Animate "stretch the tail and grow", not "slide the whole hump to the right".
6. **K lines are not at 69.5 keV.** 69.5 keV is the K-shell binding energy (the threshold). The lines sit at about 58.0 and
   59.3 keV (K-alpha) and 67.2 keV (K-beta) (NIST; re-read [FC]). At 60 and 70 kVp draw none — but [FC] do not write
   that they "cannot occur at 70 kVp": 70 is 0.5 kV above the threshold, so the honest word is "negligible".
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
    [FC] Table re-read: the x0.8 is real, but the table does not say which dose (skin, absorbed, effective) or at what
    kV the DC set runs, and it is "adapted from" another source. Caption-level at most, worded "RP136 lists a dose
    factor of x0.8 for a constant-potential set"; never on screen.
13. **Newer US guidance exists.** [FC — corrected: "superseded" was too strong.] The 2012 ADA/FDA document has been
    UPDATED by a two-article series: Benavides et al. 2024 (radiation safety; row N3) and Benavides E et al. J Am Dent
    Assoc 2026;157(1):20-35.e5. PMID 41500761. [DOI](https://doi.org/10.1016/j.adaj.2025.10.013) (patient selection;
    full text read in PMC — it contains no kVp/mA/filtration numbers, re-checked [FC]). The 2026 paper describes itself
    as "an update to the 2012" document and tells dentists to comply with "this patient selection update, the 2024
    safety guidance, and the 2012 American Dental Association (ADA) and US Food and Drug Administration (FDA)
    recommendations" — so the 2012 text is still referred to, not withdrawn. Cite the 2024 paper by title only.

---

## (d) Controversies and caveats (do not overstate)

- **Best kV for intraoral work is not settled.** Europe: 60 kV for DC, 65-70 kV for AC (RP136, grade B). IAEA: at least
  60 kV. RP136 itself notes "debate about the optimal kilovoltage ... with some authorities recommending higher values,
  particularly in the USA". US dental schools were overwhelmingly at 70 kVp in 2002 (Geist & Katz).
- **Does higher kVp lower dose? It depends which dose.** Higher kV lowers skin (entrance) dose but raises depth dose and
  scatter (RP136). Kaeppler 2007: 60 -> 90 kVp cut entrance dose 30-35% but absorbed dose only to 92.4%. Hellen-Halme
  2013: at equal entrance dose, 70 kV gave about 40-50% more mean/integral absorbed dose than 60 kV. All in vitro, single
  centres. Do not put a dose claim for kVp on screen.
- **Diagnostic effect of kVp is small.** No significant difference 60 vs 70 kV (digital, approximal caries, extracted
  teeth: Hellen-Halme K. Clin Oral Investig 2011;15(2):209-213. PMID 20143243 — abstract read [FC]) or 60 vs 90 kV
  (film/PSP; Kaeppler 2007). Film-era data favored lower kV (Svenson 1985). Svenson & Petersson (Swed Dent J
  1991;15(5):245-250. PMID 1767370): [FC — corrected] the abstract's "no significant differences" is "between premolars
  and molars", not between kV settings; it adds that accuracy "tended to be better with low kilovoltage for radiography
  of premolars and high kilovoltage for radiography of molars". Every study in this bullet is in vitro (extracted
  teeth or dried skulls) — no clinical trial of kVp was found; never present these as clinical outcomes.
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
- **Operator reality.** [FC — softened] On intraoral units kV is "usually either fixed or minimally variable" (RP136,
  2004) and exposure time is the main working control; Hellen-Halme 2013 names tube voltage and exposure time as the
  adjustable parameters. That "most units fix both kV and mA" is an inference, not a quoted finding. The reel's three
  live knobs are a teaching console, not a picture of a real wall unit.
- **[FC] Unit-to-unit differences can outweigh the nominal settings.** A 60 kVp handheld unit gave higher contrast than
  the wall unit (run at 60 and 70 kVp) in one phantom study (Pita de Melo 2026), while in another a 60 kVp handheld
  gave lower contrast than a 60 kVp fixed unit (Ruiz 2025). The two studies measured contrast differently, and
  waveform, filtration, sensor and processing all differ; do not generalize from either.

---

## (e) Do not claim

- That mA or time changes photon energy, penetration or contrast.
- That kVp changes only quality (it also raises quantity), or that doubling kVp doubles output.
- That a 70 kVp beam is made of 70 keV photons (70 keV is only the maximum).
- That tungsten K-characteristic lines are a visible feature of a 60-70 kVp dental spectrum (draw none), or that they
  sit at 69.5 keV. [FC] See also the first added item below: do not go to the other extreme and call them impossible
  at 70 kVp.
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

Added by the fact-check [FC]:

- That tungsten K lines are "impossible" or "cannot occur" at 70 kVp (70 is above the 69.5 kV threshold; draw none and
  say nothing, or say "negligible" in the caption).
- A mean-energy number or fraction on screen ("mean = 1/3 of kVp", "mean = half of kVp"). The general rule (Seibert)
  and the toy model for a filtered DC dental beam do not agree closely enough.
- "~99% heat" or "~ kVp squared" with Seibert 2004 as the only source shown (Seibert states neither; they are Zink
  1997 and McCollough 1997 / Nickoloff 1993).
- That the square law is "wrong" or that output "really" goes as kVp to the 2.8 (the 2.8 is a toy-model photon count;
  the same model gives about 2 for air kerma).
- "On intraoral units the operator can only change time" or "kV and mA are always fixed" (inference; some units offer
  kV and mA steps).
- "Film gets darker with mAs" or "digital gets less noisy with mAs" as an on-screen, cited fact (moved to the caption,
  conceptual wording only).
- "Pooled" for the 40-92% rectangular-collimation range (it is a range across heterogeneous studies).
- "State law requires 2.5 mm Al total filtration above 70 kVp" (the Oregon table is a deemed-to-comply route for an
  HVL rule), or Nickoloff's "2-3 mm Al" as a dental optimum.
- That the 2012 ADA/FDA recommendations are "superseded" or "withdrawn" (they were updated in 2024 and 2026 and are
  still referred to).
- That any kVp study cited here is clinical: the caries / lesion-visibility and dose studies are all in vitro or
  phantom work (extracted teeth, dried skulls, head phantoms).
- That handheld units give higher (or lower) contrast than wall units (the two phantom studies read disagree).
- "Modern units run at 6-8 mA" as a survey finding (it is the setting of a few study units plus the IAEA "usually
  3.5 to 8 mA").

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

**[FC] Storyline amendments (these override the table above where they differ):**

- Source line: because the heat gauge face reads "~99% HEAT" throughout, the source line must include Zink —
  `McCollough; Zink, Radiographics 1997 · Seibert, J Nucl Med Technol 2004` (see section (b)). McCollough + Seibert
  alone do not cover the 99% figure.
- kVp scene: no "K-lines" tag on the scope while the knob reads 70 (see (b) item 6). No spikes at any time.
- kVp scene swatch: the tag "contrast change exaggerated" is mandatory and must sit inside the safe area. The swatch
  changes ONLY in the kVp scene; it must not darken or brighten in the mA or time scenes (a digital image's displayed
  brightness is rescaled by software; "film darker" is unsourced here).
- Scope in the kVp scene: the right-hand end moves 60 -> 70 keV and the curve grows by roughly x1.4-1.5; the hump
  stays near 30 keV. The curve must be zero at its right-hand end (no photons above kVp) and essentially empty below
  about 15 keV. Label "schematic" inside the safe area whenever the scope is visible.
- Heat gauge: needle follows kV x mA (60 -> 70 kV at 8 mA raises it by one sixth; 4 -> 8 mA doubles it). No watt or
  joule numbers unless tagged "values illustrative, DC unit".
- Time scene: 0.8 -> 1.6 mAs is correct only if the mA knob is still at 8 from the mA scene; if the knobs are reset
  between scenes, recompute the counter.
- Electron stream in the kVp scene: same number of electrons as before (tube current is the mA setting); show only
  more energy per electron.

---

## (g) Instagram caption reference list

Core (cover every claim the caption is likely to make):

- McCollough CH. X-ray production (AAPM/RSNA physics tutorial). Radiographics 1997;17:967-84. PMID 9225393. https://doi.org/10.1148/radiographics.17.4.9225393
- Seibert JA. X-ray imaging physics for nuclear medicine technologists. Part 1: Basic principles of x-ray production. J Nucl Med Technol 2004;32(3):139-47. PMID 15347692. ([FC] title corrected to the PubMed record; no DOI in PubMed.)
- Zink FE. X-ray tubes. Radiographics 1997;17:1259-68. PMID 9308113. https://doi.org/10.1148/radiographics.17.5.9308113
- Nickoloff EL, Berman HL. Factors affecting x-ray spectra. Radiographics 1993;13:1337-48. PMID 8290728. https://doi.org/10.1148/radiographics.13.6.8290728
- European Commission. Radiation Protection 136: European guidelines on radiation protection in dental radiology. 2004.
- IAEA. Radiation Protection in Dental Radiology. Safety Reports Series No. 108. Vienna, 2022.
- US FDA performance standard, 21 CFR 1020.30-1020.31.

Optional (only if the caption mentions the point):

- Digital contrast vs kVp: Pita de Melo D et al. Dentomaxillofac Radiol 2026. PMID 42538829. https://doi.org/10.1093/dmfr/twag056
- 60 vs 70 kV dose (phantom): Hellen-Halme K, Nilsson M. J Oral Maxillofac Res 2013;4(3):e2. PMID 24422035. https://doi.org/10.5037/jomr.2013.4302
- 60 vs 70 kV caries accuracy (in vitro, digital) [FC — added so the claim has its own citation]: Hellen-Halme K. Clin Oral Investig 2011;15(2):209-13. PMID 20143243. https://doi.org/10.1007/s00784-010-0383-0
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

---

## Fact-check log (independent adversarial pass, 2026-11-22)

### What was re-verified and how

| Item | How it was re-checked | Result |
|---|---|---|
| All 23 PMIDs in this file (15347692, 9225393, 8290728, 9308113, 30346798, 29959778, 18762634, 32979952, 42538829, 24422035, 17403883, 18033949, 3859029, 24237729, 36402578, 15772598, 41172496, 12029291, 15585812, 38300176, 41500761, 1767370, 32979944) | PubMed metadata + abstract re-pulled for each | Every first author, year, journal, volume, issue, pages, PMID and DOI is correct. Every number quoted from an abstract matches the abstract. No misattributed paper found |
| Hellen-Halme & Nilsson 2013 | PMC3887573 full text re-read | Quotes exact; added detail (0.12 s vs 0.10 s; max-dose ratio 0.99 in the primary beam) |
| Hellen-Halme 2011 (PMID 20143243) | Found on PubMed, abstract read | New: the actual source of "no significant difference 60 vs 70 kV, digital" (in vitro, 100 extracted teeth) |
| Seibert 2004 | Full text at tech.snmjournals.org re-read through the fetch tool, two passes | Thermionic emission, "kinetic energy (in keV) equal to the applied tube voltage", "maximum x-ray energy ... (in kVp)", "one-third to one-half peak energy", 69.5 / 11.5 / 2.5 keV and ">69.5 kVp" all confirmed. Heat unit = mA x kVp x s confirmed (heat-loading section). The paper gives NO heat / X-ray percentage and NO kVp-squared statement |
| 21 CFR 1020.30(m)(1) Table 1; 1020.31(f)(1), (i)(1) | law.cornell.edu re-read through the fetch tool | Confirmed: HVL table (1.5 mm Al at 30-70 kVp, 2.1 at 71, 2.3 at 80, 2.5 at 90, 2.7 at 100 for intraoral units made after Dec 1, 1980); 7 cm / 6 cm circles; 18 cm source-skin distance above 50 kVp. No total-filtration thickness in (m) |
| Oregon OAR 333-106-0101(7) and Table 5 | Rule text on law.cornell.edu; Table 5 PDF from oregon.gov read directly | Table 5 values confirmed (dental 50-70 kVp 1.5; > 70 kVp 2.5 mm Al equivalent). The rule itself is an HVL rule; Table 5 is a deemed-to-comply route — brief corrected |
| NIST X-ray Transition Energies (W) | physics.nist.gov re-queried through the fetch tool | Confirmed: K edge 69.51-69.53 keV; KL3 59.319; KL2 57.982; KM3 67.245 keV |
| EC RP136 (2004) | Saved extract `_scratch/dl/EC_RP136_2004.txt` re-read at lines 2022-2087, 2459-2478, 4901-4905 | Every quoted sentence, Recommendation 4A (grade B) and Table 4.1 (DC x0.8; rectangular collimation x0.5; baseline 70 kV AC, 60 mm round beam, E-speed film) confirmed |
| IAEA SRS 108 (2022) | Saved extract `_scratch/dl/IAEA_SRS108_2022.txt` re-read at lines 585-589, 2237-2277 | Confirmed: minimum 60 kV; focal spot 0.4-0.7; HVL 1.5 / 2.1 mm Al; "usually 3.5 to 8 mA"; 0.01-4 s, sub-second normal; handhelds lower current; "wider latitude" |
| Benavides 2026 | Saved extract `_scratch/dl/pmc13580382.txt` searched | No kVp, mA, half-value layer, filtration or rectangular-collimation text — confirmed. Relation to the 2012 and 2024 documents re-read — brief corrected |
| Toy spectrum and arithmetic | Recomputed from scratch (`_scratch/factcheck/toy_spectrum.py`; Kramers x Al filter, NIST Al coefficients, constant potential) | Al transmissions (1%, 16%, 54%, 86% through 2 mm), photon-count exponent 2.8, modal energy 28.6 -> 29.6 keV, (70/60)^2 = 1.36, 490 W, 98 J, 38.5 cm2 all reproduced. New: air-kerma exponent 2.0-2.3; mean energy 0.50-0.57 of kVp; efficiency formulas give 0.40-0.63% |
| NOT re-checked | pocketdentistry.com textbook excerpts (Thomson; "Radiography and Radiology for Dental Care Professionals"); White and Pharoah; NCRP Report 177; Benavides 2024 full text | Unchanged status: textbook-level corroboration only / NOT VERIFIED |

### Changes made

1. **Row 32, (d) "Operator reality" — downgraded High -> Med and reworded.** "The operator really only changes time" is
   not what either source says: RP136 says kV is "usually either fixed or minimally variable"; Hellen-Halme 2013 names
   tube voltage AND exposure time as adjustable. Now: "exposure time is the main working control".
2. **Row 18 and (c)1 — Oregon corrected.** Described as "a real state rule" for 1.5 / 2.5 mm total filtration. The rule
   text is an HVL requirement; Table 5 total filtration is only "considered" to meet it. Confidence for "state rule"
   lowered to Med; the board-answer guidance now gives both forms.
3. **Row 13, (b)6, (c)6, storyline — K lines at 70 kVp.** "So not at 60-70 kVp" was too strong: 70 is above the 69.5 kV
   threshold. Reworded to "none at 60 kVp; none worth drawing at 70 kVp"; "negligible" flagged as physics reasoning,
   not a read statement. The optional scope annotation is now discouraged, and if used must read "no W K-lines below
   69.5 kV" and appear only at 60 kVp. Line energies must be cited to NIST (Seibert's own example rounds to 57.0 keV).
4. **Row 10, (c)5 — mean energy downgraded High -> Med for a dental beam.** Seibert's "one-third to one-half" is a
   general rule; the brief's own toy model, recomputed, gives 0.50-0.57 of kVp for a filtered constant-potential
   60-70 kV beam. No mean-energy number or fraction may go on screen.
5. **Rows 3, 11, (b)5, source line, storyline — attribution tightened.** Seibert 2004 states neither "99% heat" nor the
   square law. The suggested single source line (McCollough + Seibert) did not cover the "~99% HEAT" shown on the
   gauge; it now reads `McCollough; Zink, Radiographics 1997 · Seibert, J Nucl Med Technol 2004`, with a table of
   which paper carries which claim.
6. **(b)7 — second half removed from the recommended on-screen list.** "mAs up: more signal (film darker; digital less
   noisy, until it saturates)" moved to the caption in conceptual wording: "film darker" was not read in any source;
   "less noisy" rests on one discussion sentence; Ruiz 2025 shows noise effects are system-dependent. Row 29 confidence
   split (High for latitude / saturation / optimum; Med for noise).
7. **(c)4 — square law clarified.** The toy "exponent 2.8" is a photon count; the same model gives about 2.0-2.3 for
   air kerma, which is what the published "approximately squared" describes. Added so nobody presents 2.8 as a
   correction of the literature. Storyline now allows the scope curve to grow x1.4-1.5.
8. **(c)3 and bottom line — mA wording softened.** "'7-10 mA' is dated" and "10-15 mA belongs to older AC units" went
   beyond the sources (Jacobs 2004 abstract: 10-12 mA at 65-70 kV, nothing about 15 mA or AC). Now: 7 mA is fine, 10
   is above the IAEA "usually 3.5 to 8 mA"; study-unit settings are labeled as examples, not a survey (row 31).
9. **N4 and (c)2 — efficiency arithmetic corrected.** "About 0.5-0.6%" reflected only one form of the textbook formula;
   the two forms give 0.40-0.47% and 0.54-0.63%. Still NOT VERIFIED in a read source, still off screen.
10. **Row 21 — "pooled range" corrected.** Shetty 2019 reports a range across 13 heterogeneous studies, with no
    meta-analysis in the abstract. "Pooled" removed.
11. **Row 23 — context added.** Johnson & Ludlow 2020: the round comparator was a 6 cm collimator and the reduction is
    37% (86 -> 54 microSv), not comparable with the 80% of Ludlow 2008; phantom dosimetry. NCRP's correct name noted.
12. **(d) — Svenson & Petersson 1991 corrected.** The abstract's "no significant differences" refers to premolars vs
    molars, not to kV settings. All kVp diagnostic and dose studies are now explicitly labeled in vitro / phantom.
13. **(c)13 — "superseded" corrected to "updated".** The 2026 ADA/AAOMR paper tells dentists to follow the update, the
    2024 safety guidance and the 2012 recommendations.
14. **Row 25 and new (d) bullet — conflicting handheld data added.** Pita de Melo 2026: handheld gave the highest
    contrast; Ruiz 2025: handheld gave lower contrast. Contrast in Pita de Melo is a displayed gray-value difference
    measured by one observer.
15. **Row 26 — detail and its own citation added** (Hellen-Halme 2011, PMID 20143243); maximal dose in the primary
    beam was unchanged (ratio 0.99), so the "40-50% more" is mean / integral dose only.
16. **Row 5 — upgraded.** The exposure-time factor the researcher could not see is in Seibert's heat-loading section
    (heat unit = mA x kVp x s).
17. **Rows 2, 12, 16, 20, 27, 29, 30, (c)12 — caveats added:** kinetic energy = kVp only at peak on AC units; the
    "characteristic lines" row is not a licence to draw spikes; Nickoloff's 2-3 mm Al is not a dental figure; field
    size is defined at the minimum source-skin distance; Kaeppler and Barrineau are in vitro / phantom; 60-70 kV is a
    recommendation, not a usage survey; RP136's x0.8 DC factor does not say which dose.
18. **(e) Do not claim — twelve items added** (listed there under "Added by the fact-check").
19. **(g) — Seibert's title corrected** to the PubMed record; Hellen-Halme 2011 added to the optional list.

### Still open (cannot be closed from the sources available)

- White and Pharoah wording (filtration, efficiency, typical settings) — check the book before citing it.
- NCRP Report 177 and Benavides 2024 specifics (operating kVp range, collimation wording) — not read.
- Any measured dental X-ray spectrum — none sourced; everything drawn is schematic.
- Filament current vs tube current non-linearity, the 15% rule, the yield of W K lines just above threshold —
  textbook physics, not read here; keep off screen.

---

## Citation audit log (independent pass, 2026-11-22, after the build)

Scope: every literature citation on screen, in meta.json, in NOTES.md and in this file.

| Item | How it was checked | Result |
|---|---|---|
| All 24 PMIDs in this file (the 23 of the fact-check list plus 20143243) | PubMed metadata + abstract re-pulled | First author, year, journal, volume, issue, pages, DOI and every quoted abstract sentence or number match. No wrong PMID, no misattributed paper |
| McCollough 1997 (9225393), Zink 1997 (9308113), Nickoloff and Berman 1993 (8290728), Pita de Melo 2026 (42538829) | Abstracts read against the claims attached to them | Support confirmed: proportional to tube potential squared, tube current and exposure time; 1% / 99%; "approximately the square of the tube potential"; kVp variation (60 vs 70 kVp, wall unit, 3 CMOS sensors, phantom) "had minimal impact" |
| Seibert 2004 (15347692; not in PMC) | Free full text at tech.snmjournals.org/content/32/3/139, two fetch passes with verbatim fragments | Confirmed: thermionic emission; "A larger filament current produces more heat and releases a greater number of electrons"; kinetic energy (keV) = tube voltage; maximum x-ray energy (keV) set by kVp; ">69.5 kVp" for tungsten K lines; mAs; heat unit = mA x kVp x s. No heat percentage and no kVp-squared statement (as the fact-check said). New: the text names "a metal focusing cup (cathode cup)" and the Fig. 3 caption names transformer oil in the housing (row 4 updated) |
| EC RP136 (2004) sect. 4.1, 4.2, 4.3; IAEA SRS 108 (2022) sect. 5.1.2.1 | Saved extracts re-read (`_scratch/dl/`) | Every sentence quoted for an on-screen or caption claim is present verbatim, including "Filtration using aluminium is an established component of dental X-ray equipment" (sect. 4.2), which now backs the ALUMINUM FILTER label |
| NIST aluminum mass attenuation coefficients used in the toy spectrum | Compared with the NIST table values quoted in section (d) | Consistent with the brief; not re-queried at NIST by this audit |
| Not checked by this audit | Hellen-Halme 2013 full-text details (row 26), 21 CFR, Oregon rule, NIST transition energies, online textbook excerpts | Off screen and not in the caption; status unchanged from the fact-check |

Changes made by the audit: row 4 (book authorship confirmed; what Seibert does and does not show of the tube anatomy).
No citation in this file needed correcting. Corrections to NOTES.md and meta.json are listed in the NOTES.md change log
under "Citation audit".

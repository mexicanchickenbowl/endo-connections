# 22 — How an electronic apex locator works (the electrical science) — evidence brief

Research stage only (nothing built). Literature located and checked through PubMed (abstracts, and PMC full text where
stated), Crossref / J-STAGE bibliographic records, one scanned 1942 primary paper, and one manufacturer instruction
manual. Every PubMed-indexed source below carries its PMID and DOI link. "Verified from" says exactly what was read.

Legend for "verified from": **abstract** = PubMed abstract read; **full text** = PMC / publisher full text read;
**secondary full text** = the statement was read in the full text of a *different* paper that cites the primary;
**manufacturer IFU** = J. Morita ROOT ZX II operation instructions (text extracted and read);
**record only** = bibliographic record confirmed, content not readable; **NOT VERIFIED** = leave off screen.

---

## (a) Table of verified facts

### Table 1 — History

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Confidence |
|---|---|---|---|---|---|
| H1 | 1918 — Custer: an electrical way to find the foramen | Custer LE. Exact method of locating the apical foramen. Dent Regist 1918;72(9):420-425 (reprinted from J Natl Dent Assoc, Aug 1918). PMID 33703181, PMCID PMC7845214 | "The electrical method is based upon the difference in the electrical conductivity of a dry pulp canal or one filled with a non-conducting liquid, and the conductivity of the tissues just beyond the apical foramen." Apparatus: 2-3 dry cells, a milliammeter, a negative electrode on the gum, an insulated broach on the positive wire; the needle "will suddenly move" as the broach reaches the foramen. Single-rooted teeth only. | full text (PMC) | High |
| H2 | 1942 — Suzuki: iontophoresis experiments (dog teeth), one electrode in the canal, one on the oral mucosa | Suzuki K (鈴木賢策). Iontophorese ni kansuru jikkenteki kenkyu (Experimental study on iontophoresis, especially in relation to root canal treatment). Kokubyo Gakkai Zasshi (J Stomatol Soc Jpn) 1942;16(6):411-429. DOI 10.5357/koubyou1927.16.6_411. Not in PubMed | Japanese paper on iontophoresis for root canal therapy: glass-tube/agar models, extracted human teeth and in situ teeth of 1-2-year-old dogs; one electrode (liquid electrode) in the canal, the other on the oral mucosa; the author notes that when the mucosal electrode site is chosen within a certain area the result is "almost constant". The paper's own summary is about ion transport through dentin, NOT about measuring canal length. The classic sentence "Suzuki found a constant electrical resistance between an instrument in the canal and an electrode on the oral mucosa" is how Sunada (1962) and later reviews describe it. | record (Crossref + J-STAGE) + scanned original skimmed (title, methods, summary pages); the "constant resistance" wording itself only via secondary full text (Nasiri & Wrbas 2022, PMC8767164; Gehlot 2016, PMC4751208) | Medium (paper, year, dogs, mucosal electrode: high; "constant resistance" wording: secondary) |
| H3 | 1962 — Sunada: resistance between a file at the periodontal membrane and the oral mucosa is nearly constant (~6.5 kΩ), so a DC ohmmeter can find canal length | Sunada I. New method for measuring the length of the root canal. J Dent Res 1962;41(2):375-387. DOI 10.1177/00220345620410020801. Not in PubMed (record confirmed in Crossref; its reference 1 is the Suzuki 1942 DOI) | Semantic Scholar machine-generated one-sentence summary of the paper (the publisher withholds the abstract itself): "when the tip of a Kerr reamer has reached the periodontal membrane through a root canal, the electrical resistance between the reamer and the oral mucous membrane always registers nearly the same value, regardless of the patient's age, shape of teeth, or diameter of the canals." "DC current" device: Rambo 2010 full text. **6.5 kΩ**: Rambo 2010 full text cites Sunada for an impedance "at least in the range of 6.5 kΩ"; Gehlot 2016 full text gives "constant values of 6.5 kΩ" (but attaches the number to Suzuki's discovery). | record only + secondary full text (Rambo 2010 PMC2944265; Gehlot 2016 PMC4751208; Nasiri 2022 PMC8767164). Primary full text NOT read (paywalled). | Medium-high for the concept and year; Medium for "6.5 kΩ" (universally quoted, but read only in secondary sources, which disagree on whether to credit Suzuki or Sunada) |
| H4 | "40 µA" meter reading at the apex (Sunada) | — | Found only in a garbled secondary web source | **NOT VERIFIED** | Leave off screen |
| H5 | Later single-frequency AC "impedance" devices read short or failed in wet canals | Kobayashi C, Suda H. J Endod 1994;20(3):111-114, PMID 7996080; Kobayashi C. Oral Surg Oral Med Oral Pathol Oral Radiol Endod 1995;79(2):226-231, PMID 7614187; Saito T, Yamashita Y. Dent Jpn (Tokyo) 1990;27(1):65-72, PMID 2099293 | Kobayashi & Suda: "The most striking disadvantage of most apex locators is that if there are electrolytes in the canal the meter shows a reading which is too short or sometimes the measurement itself becomes impossible." Saito & Yamashita: prior devices could not measure "under moistened conditions"; the Endex used "a relative value of different alternative electric currents". | abstract | High |
| H6 | 1994 — Kobayashi & Suda: the ratio method (two frequencies, one quotient) | Kobayashi C, Suda H. New electronic canal measuring device based on the ratio method. J Endod 1994;20(3):111-114. PMID 7996080. [DOI](https://doi.org/10.1016/S0099-2399(06)80053-1) | "The device simultaneously measures two impedances of the canal using current sources with two different frequencies. Then the ratio between the two electric potentials proportional to each impedance is calculated. The quotient is shown on the device's meter and represents the position of a file tip in the canal... the quotient was only negligibly influenced by the electrolyte present in the canal and decreased considerably as the file tip approached the apical foramen." | abstract | High |
| H7 | "Generations": 1st resistance (DC) → 2nd single-frequency impedance (AC) → 3rd two-frequency ratio → later multi-frequency / R and C measured separately | Gordon MPJ, Chandler NP. Int Endod J 2004;37(7):425-437, PMID 15189431; Nasiri K, Wrbas KT. Saudi Dent J 2022;34(1):11-20, PMID 35068894, PMCID PMC8767164; Kim E, Lee SJ. Dent Clin North Am 2004;48(1):35-54, PMID 15066506 | Nasiri & Wrbas full text: first generation = resistance, direct current (e.g., Dentometer, Endo Radar); second = impedance, alternating current (e.g., Sono-Explorer), poor in electroconductive fluids; third = dual-frequency "ratio method" (8 kHz and 400 Hz, quotient of impedances); fourth measures capacitance and resistance separately and compares with a database; fifth/sixth = further modifications. Kim & Lee abstract: frequency-dependent EALs appear much more accurate than "simple resistance type or impedance type". | full text (Nasiri); abstract (Gordon, Kim) | High that this is the customary teaching scheme; note H8 |
| H8 | The "generation" label is a convention, not a law of physics | Nekoofar MH, Ghandi MM, Hayes SJ, Dummer PMH. Int Endod J 2006;39(8):595-609. PMID 16872454. [DOI](https://doi.org/10.1111/j.1365-2591.2006.01131.x) | "the fundamental electronic operating principles and classification of the electronic devices used in this method are often unknown and a matter of controversy." | abstract | High |

### Table 2 — The circuit (how it works)

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Confidence |
|---|---|---|---|---|---|
| C1 | The patient completes the circuit: file → canal → foramen → periodontal ligament → body → lip clip | Nekoofar et al. Int Endod J 2006;39:595-609, PMID 16872454; Nasiri & Wrbas 2022 (PMC8767164) | Nekoofar: "The root canal system is surrounded by dentine and cementum that are insulators to electrical current. At the minor apical foramen, however, there is a small hole in which conductive materials within the canal space (tissue, fluid) are electrically connected to the periodontal ligament that is itself a conductor of electric current." Nasiri: "EALs use the human body to produce an electrical circuit... one is connected to the endodontic file in the root canal, and the other is connected to the patient's lip." | abstract; full text | High |
| C2 | Canal contents act as a resistor that gets smaller as the file nears the foramen | Nekoofar et al. 2006, PMID 16872454 | "dentine, along with tissue and fluid inside the canal, forms a resistor, the value of which depends on their dimensions, and their inherent resistivity. When an endodontic file penetrates inside the canal and approaches the minor apical foramen, the resistance between the endodontic file and the foramen decreases, because the effective length of the resistive material ... decreases." | abstract | High |
| C3 | The root is not a pure resistor: it also behaves like a capacitor (so: impedance, measured with AC) | Nekoofar et al. 2006, PMID 16872454; Meredith N, Gulabivala K. Endod Dent Traumatol 1997;13(3):126-131, PMID 9550026, [DOI](https://doi.org/10.1111/j.1600-9657.1997.tb00025.x) | Nekoofar: "As well as resistive properties, the structure of the tooth root has capacitive characteristics." Meredith & Gulabivala (in vivo, 20 teeth, LCR analyser at 100 Hz and 1 kHz, size 10 file): "The impedance characteristics of a root canal were a complex electrical network comprising resistive and capacitive series and parallel elements." | abstract | High |
| C4 | A single R + C is a simplification (label the schematic "schematic") | Krizaj D, Jan J, Valencic V. Bioelectromagnetics 2004;25(3):185-195, PMID 15042627, [DOI](https://doi.org/10.1002/bem.10189); Krizaj et al. IEEE Trans Biomed Eng 2002;49(7):746-748, PMID 12083312 | In vitro impedance measurements fitted with lumped-element models using "Fricke's constant phase elements" for "the metal/solution interface and complex structure of the tooth"; simulation shows influence of "dentin conductance, canal preparation, and solution conductance". 2002: simulations "confirm the improved sensitivity of the impedance method using the results of multiple frequency measurements". | abstract | High |
| C5 | Measured canal resistance, in vivo (for realistic component values) | Meredith & Gulabivala 1997, PMID 9550026 | Mean series resistance, file at the constriction then withdrawn up to 5 mm: dry canals 22.19 to 92.07 kΩ; deionized water 9.32 to 12.10 kΩ; sodium hypochlorite 7.46 to 8.92 kΩ. "clear increase in series resistance with increasing distance from the radiographic apex". | abstract | High (20 teeth; one study) |
| C6 | The ratio method uses 0.4 kHz and 8 kHz | Primary is Kobayashi & Suda 1994 (abstract does not give the frequencies). Read in: Nasiri & Wrbas 2022 (PMC8767164): "high (8 kHz) and low (400 Hz) ... simultaneously measured"; Gehlot PM et al. Restor Dent Endod 2016;41(1):6-11 (PMC4751208): "8 and 0.4 kHz"; Alothmani & Siddiqui, Cureus 2023;15(9):e44659, PMID 37671079 | as quoted | secondary full text (3 independent papers agree) | High |
| C7 | Far from the apex the quotient barely moves; it drops steeply only in the last ~0.5-1 mm | Rambo MVH, Gamba HR, Borba GB, Maia JM, Ramos CAS. In vivo assessment of the impedance ratio method used in electronic foramen locators. Biomed Eng Online 2010;9:46. PMID 20819212, PMCID PMC2944265. [DOI](https://doi.org/10.1186/1475-925X-9-46) | In vivo, 21 canals / 12 teeth, 2.5% NaOCl, constant 10 µA RMS, six frequencies 0.25-8 kHz. "for distances ranging from -3 mm to -1 mm of the AF, the impedance of the root canal is mainly resistive. However, when the file tip gets closer to AF, the root canal electrical impedance starts to change from a mainly resistive to a complex impedance. This change ... starts when the file tip is near -1.0 mm from the AF"; "this effect happens very quickly from the distance of -0.5 mm to the AF". | full text (PMC) | High (one in vivo engineering study; research prototype, file positions set with a Root ZX + radiograph, not histology) |
| C8 | Measured numbers for C7 (if a number is wanted on screen) | Rambo et al. 2010, Table 2 | Mean \|Z\| at 8 kHz relative to \|Z\| at 250 Hz: 0.71 at 3 mm short (7 canals), 0.67 at 1 mm short (18 canals), 0.63 at 0.5 mm short (14 canals), **0.45 at the foramen** (21 canals). Derived by me from the same table (8 kHz / 0.5 kHz, the pair closest to 8 / 0.4): about 0.77, 0.73, 0.71 and 0.53 at the same four positions. | full text (table); the 8/0.5 kHz ratios are my arithmetic on Table 2, not numbers printed in the paper | High for the 8 kHz/250 Hz values; Medium for the derived 8/0.5 kHz values (label "derived") |
| C9 | The two frequencies must be far apart | Rambo et al. 2010 | "for the 'ratio method', the values of the electrical impedance must be measured with a pair of frequencies whose difference must be three octaves or more" (0.4 → 8 kHz is ~4.3 octaves). | full text | Medium-high (single study) |
| C10 | The biggest electrical change is right at the foramen | Pilot TF, Pitts DL. J Endod 1997;23(12):719-724. PMID 9487844. [DOI](https://doi.org/10.1016/S0099-2399(97)80341-X) | In vivo, 10 teeth, six frequencies, seven irrigants/canal conditions: "The greatest impedance changes occurred +/- 0.25 mm from the foramen." Also: "Conductive irrigants demonstrated less change of electrical characteristics with length than nonconductive irrigants". | abstract | High |
| C11 | Why a ratio helps: canal contents shift both impedances together, so the quotient is "only negligibly" affected | Kobayashi & Suda 1994, PMID 7996080 (empirical finding); Rambo 2010 (mechanism: away from the apex "the impedance values ... at different frequencies are reduced by the same amount") | as quoted | abstract; full text | High for the empirical finding; the "divides out" explanation is an interpretation — say "largely compensates", never "cancels" |
| C12 | Quotient value "0.67 at the constriction" (Root ZX) | Attributed to Kobayashi & Suda 1994 in secondary sources only; a different secondary paper (Alothmani & Siddiqui 2023, citing the same primary) gives "0.72 at 0.5 mm coronal to the apical foramen" | conflicting secondary values; not in the primary abstract | **NOT VERIFIED** | Leave off screen (use C8 if a number is needed) |

### Table 3 — What the reading means

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Confidence |
|---|---|---|---|---|---|
| M1 | The numbers on the display are not millimeters | J. Morita Mfg. Corp. ROOT ZX II Canal Measurement Module (DP-ZX-VL / RCM-EX), Operation Instructions (pages dated 2012-09-21) | "The meter's 0.5 reading indicates that the tip of the file is in the apical constriction. * The numerals on the meter gauge do not represent millimeters." and "The numerals 1, 2 and 3 do not represent length in millimeters." "If the file tip reaches the major foramen, the word 'APEX' ... will start to flash." "Always check the measurement with an x ray." | manufacturer IFU (text read) | High (it is the manufacturer's own statement, for one device) |
| M2 | The only electrically sharp landmark is the foramen ("APEX"); intermediate marks are not distances | Ounsi HF, Naaman A. Int Endod J 1999;32(2):120-123. PMID 10371907. [DOI](https://doi.org/10.1046/j.1365-2591.1999.00202.x); Rambo et al. 2010 | Ounsi & Naaman (in vitro): "The Root ZX is not capable of detecting the '0.5 mm from the foramen' position and thus, should only be used to detect the foramen (major diameter)." Rambo: "The only reliable measurement is the 0 mm distance, which is when the file tip is at the AF"; readings between -3 and -0.5 mm "can only be used ... as a reference to know that the file tip is getting closer". | abstract; full text | High (but see controversy D1: several in vivo studies find the 0.5 mark lands close to the constriction) |
| M3 | Quotient-type locators find the zone between minor and major foramen more reliably than the constriction itself | Hoer D, Attin T. Int Endod J 2004;37(2):125-131. PMID 14871179. [DOI](https://doi.org/10.1111/j.0143-2885.2004.00764.x) | In vivo, 93 canals, histology (Justy II, Endy 5000): "The probability of determining the area between minor and major foramen was 82.4% for Justy II and 81% for Endy 5000. However, accurate determination of the apical constriction was only successful in 51% (Justy II) and 64.3% (Endy 5000)". | abstract | High |
| M4 | Constriction sits ~0.5 mm inside the foramen on average, with wide variation | Dummer PMH, McGinn JH, Rees DG. Int Endod J 1984;17(4):192-198, PMID 6593303 (no abstract); Kuttler Y. J Am Dent Assoc 1955;50(5):544-552, PMID 14366934 (no abstract) | As quoted in Rambo 2010 full text: Dummer, 270 teeth: apex-to-foramen mean 0.38 mm (range 0-1.93), apex-to-constriction mean 0.89 mm (range 0.07-2.69). Nasiri 2022 full text: constriction "generally located 0.5-1.0 mm short of the apical foramen (... Kuttler, 1955)". | secondary full text (primaries have no abstract; not read) | Medium (classic, but cite as "as quoted in") |

### Table 4 — Accuracy (row ids A1-A13)

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Confidence |
|---|---|---|---|---|---|
| A1 | Root ZX, in vivo then extracted: within ±0.5 mm of the **foramen** in 96.2% (25/26 canals, vital teeth) | Shabahang S, Goon WWY, Gluskin AH. J Endod 1996;22(11):616-618. PMID 9198419. [DOI](https://doi.org/10.1016/S0099-2399(96)80033-1) | Exactly at foramen 17 canals (65.4%), short 1 (3.8%), over 8 (30.8%); within ±0.5 mm: 96.2%. | abstract | High |
| A2 | Root ZX, in vivo: within 0.5 mm of the **apical constriction** in 82.3% (34 canals, 29 teeth) | Dunlap CA, Remeikis NA, BeGole EA, Rauschenberger CR. J Endod 1998;24(1):48-50. PMID 9487868. [DOI](https://doi.org/10.1016/S0099-2399(98)80214-8) | 82.3% within 0.5 mm; mean 0.21 mm (vital) vs 0.49 mm (necrotic), no statistical difference. | abstract | High |
| A3 | Root ZX, in vivo, SEM: ±0.5 mm of foramen 82.75%; ±1.0 mm 100% (29 vital teeth) | Pagavino G, Pace R, Baccetti T. J Endod 1998;24(6):438-441. PMID 9693591. [DOI](https://doi.org/10.1016/S0099-2399(98)80029-0) | as stated; error larger with a lateral foramen (p < 0.001). | abstract | High |
| A4 | Root ZX, in vivo: minor diameter located (±0.5 mm) 90.7% vs 34.4% for a five-frequency device (32 teeth) | Welk AR, Baumgartner JC, Marshall JG. J Endod 2003;29(8):497-500. PMID 12929694. [DOI](https://doi.org/10.1097/00004770-200308000-00002) | Mean distance to minor diameter 0.19 mm (Root ZX) vs 1.03 mm (Endo Analyzer 8005). More frequencies was not better. | abstract | High |
| A5 | Root ZX, in vivo: minor constriction ±0.5 mm 75%, ±1 mm 88.9% (36 teeth) | Tselnik M, Baumgartner JC, Marshall JG. J Endod 2005;31(7):507-509. PMID 15980709. [DOI](https://doi.org/10.1097/01.don.0000152295.05827.80) | Root ZX 75% / 83.3% (±0.75) / 88.9%; Elements Diagnostic 75% / 88.9% / 91.7%; no significant difference. | abstract | High |
| A6 | Largest in vivo series: Root ZX located the constriction in 89% (anterior), 75% (premolar), 69% (molar) vs radiographs 33%, 32%, 15% | Vieyra JP, Acosta J. Int Endod J 2011;44(6):510-518. PMID 21306402. [DOI](https://doi.org/10.1111/j.1365-2591.2011.01855.x) | 693 canals, 245 teeth, four EALs + radiographs, verified after extraction; no significant difference between the four EALs. (Tolerance used for "located" is not stated in the abstract.) | abstract | Medium-high (denominator criterion not in abstract) |
| A7 | Safe summary: "Root ZX, in vivo: 75-96% of readings within ±0.5 mm (5 studies, 26-36 teeth or canals each; landmark = foramen or constriction)" | A1-A5 | Range of A1-A5. This is a range across small studies with different landmarks, NOT a pooled estimate. | abstracts | High as a range |
| A8 | Meta-analysis (histologic reference): precision depends on the device and the irrigant, not on pulp status | Tsesis I, Blazer T, Ben-Izhack G, Taschieri S, Del Fabbro M, Corbella S, Rosen E. J Endod 2015;41(11):1818-1823. PMID 26409810. [DOI](https://doi.org/10.1016/j.joen.2015.08.012) | 10 studies, 1105 measurements, 4 EALs. Mean file tip-to-constriction distance: longest Endox 1.35 ± 0.41 mm, shortest Justy II 0.25 ± 0.17 mm; Root ZX, Justy II, Endy 5000 more accurate than Endox. "The pulp status (vital or necrotic) had no significant effect". **No pooled "% within ±0.5 mm" is given in the abstract.** | abstract | High |
| A9 | Systematic review, EAL vs radiograph: EAL "may perform better", lowers radiation; still take a radiograph | Martins JNR, Marques D, Mata A, Caramês J. J Endod 2014;40(6):759-777. PMID 24862702. [DOI](https://doi.org/10.1016/j.joen.2014.03.011) | 21 articles; evidence "short and at considerable risk of bias"; "the apical locator reduces the patient radiation exposure and ... the electronic method may perform better ... At least one radiographic control should be performed". **No pooled percentage.** | abstract | High |
| A10 | "Newer generation" is not more accurate | Nasiri K, Wrbas KT. Saudi Dent J 2022;34(1):11-20. PMID 35068894. [DOI](https://doi.org/10.1016/j.sdentj.2021.09.020) | 15 studies; risk ratios 1.040, 0.997, 0.935, 0.959 between 3rd/4th/5th/6th generations (I² = 0); "the generation of an apex locator does not play a significant role". | abstract + full text | Medium-high (modest-quality review; consistent with A4, A5, A6) |
| A11 | Adding the EAL to the radiograph cut over-length working lengths: 51% → 21% of canals (in vitro, premolars) | ElAyouti A, Weiger R, Löst C. J Endod 2002;28(2):116-119. PMID 11833683. [DOI](https://doi.org/10.1097/00004770-200202000-00017) | 30 extracted premolars, 43 canals: radiographic WL overestimated in 51% although the file looked 0-2 mm short of the radiographic apex; Root ZX reduced it to 21%. | abstract | High |
| A12 | RCT meta-analysis: very-low-certainty evidence; EAL ~10% better working-length adequacy | Kaur G et al. BMC Oral Health 2024;24(1):532. PMID 38704529. [DOI](https://doi.org/10.1186/s12903-024-04259-w) | 11 RCTs (8 pooled): WL adequacy RR 1.10 (1.03-1.18), 573 participants; no difference in postoperative pain; "very low-certainty evidence". | abstract | Medium (caption-level nuance only) |
| A13 | Older devices were worse: 55-75% within ±0.5 mm of the foramen | Fouad AF, Krell KV, McKendry DJ, Koorbusch GF, Olson RA. J Endod 1990;16(9):446-449. PMID 2098464. [DOI](https://doi.org/10.1016/s0099-2399(06)81889-3) | Five pre-ratio instruments, 20 single-rooted teeth in vivo: 55-75%; "radiographic verification of the working length is still desirable". | abstract | High |

### Table 5 — Limitations and pacemakers

| # | Fact as it could appear on screen | Exact source | What the source literally reports | Verified from | Confidence |
|---|---|---|---|---|---|
| L1 | Short circuit: file touching a metal restoration, or fluid/blood flooding the chamber to the gingiva | Morita ROOT ZX II IFU; McDonald NJ. Dent Clin North Am 1992;36(2):293-307, PMID 1572500 | IFU: "Accurate measurement cannot be obtained if the file touches a metal prosthesis that is touching gingival tissue"; "If blood, saliva, or a chemical solution overflow from the opening of the root canal and contacts the gums, this will result in electrical leakage". McDonald: "contact against metallic restorations must be avoided"; "Fluid filling the tooth to the level of the pulp chamber will cause the units to become overloaded". | manufacturer IFU; abstract | High |
| L2 | Wide/open apex: reads short, especially with a small file | Morita IFU; Ebrahim AK, Wadachi R, Suda H. Aust Dent J 2006;51(3):258-262, PMID 17037894, [DOI](https://doi.org/10.1111/j.1834-7819.2006.tb00439.x); Ebrahim AK et al. Aust Dent J 2006;51(2):153-157, PMID 16848263; Herrera M et al. J Endod 2007;33(8):995-998, PMID 17878091 | IFU: an "exceptionally large apical foramen due to a lesion or incomplete development cannot be accurately measured; the results will show shorter measurement than the actual length." Ebrahim: four EALs "unreliable ... with a wide apical foramen, when using a small size file"; a tight-fitting file helps. Herrera: precision unchanged at 0.37 and 0.62 mm apical width, altered at 1.02 mm with files ≥ #30 vs #10. | manufacturer IFU; abstracts (all in vitro/ex vivo) | High |
| L3 | Perforation, fracture or a lateral canal can read "APEX" (a second way out for the current) | Morita IFU (troubleshooting + "Fractured tooth / Leakage through a branch canal"); Gordon & Chandler 2004, PMID 15189431; Alhadainy HA. Oral Surg Oral Med Oral Pathol 1994;78(3):368-374, PMID 7970600 | IFU: "Fractured tooth will cause electrical leakage ... A branch canal will also cause electrical leakage." Gordon & Chandler: "Other roles include the detection of root canal perforation." Alhadainy: perforations can be identified with an apex locator. | manufacturer IFU; abstracts | High |
| L4 | Open circuit: blocked canal or residual gutta-percha (insulators) | Morita IFU | "The meter will not move if the canal is blocked."; retreatment: "The gutta percha must be completely removed to eliminate its insulating effect." | manufacturer IFU | High |
| L5 | Canal contents still matter a little | Tsesis 2015 (A8); Jenkins JA et al. J Endod 2001;27(3):209-211, PMID 11487154; Meares WA, Steiman HR. J Endod 2002;28(8):595-598, PMID 12184422 | Tsesis: mean distance differed between hydrogen peroxide and sodium hypochlorite (P < .05). Jenkins (in vitro): Root ZX within 0.31 mm, "virtually no difference" across seven irrigants. Meares (in vitro): within 0.5 mm in 83%, not affected by NaOCl. | abstracts | High |
| L6 | Factors list (scoping review of 166 experimental studies) | Golkar S et al. Dent Res J (Isfahan) 2025;22:26. PMID 40655901, PMCID PMC12252002. [DOI](https://doi.org/10.4103/drj.drj_634_23) | 20 potential factors incl. working mechanism, canal curvature, foramen diameter/file size, patency, preflaring, apical periodontitis/resorption, perforation, irrigants, pulp contents, retreatment, electromagnetic interference; "use of radiography along with EALs remains advisable". | abstract | Medium-high |
| P1 | Pacemaker: the manufacturer label says do not use | Morita ROOT ZX II IFU, "PROHIBITION" | "Do not use this unit in conjunction with an electric scalpel or on patients who have a pacemaker." | manufacturer IFU | High (one device; other brands not checked) |
| P2 | In vitro: 4 of 5 EALs did not inhibit or interfere with a pacemaker | Garofalo RR, Ede EN, Dorn SO, Kuttler S. J Endod 2002;28(12):831-833. PMID 12489653. [DOI](https://doi.org/10.1097/00004770-200212000-00009) | One pacemaker (Biotronik Actros DR+), bench top, EAL connected directly across a 150-ohm resistor with the lead. "Four of five electronic apex locators tested did not cause inhibition or interfere with normal pacemaker function." (So one of five did.) | abstract | High |
| P3 | In vivo: 27 patients with pacemakers/ICDs, 2 EALs + 1 pulp tester, no interference | Wilson BL, Broberg C, Baumgartner JC, Harris C, Kron J. J Endod 2006;32(9):847-852. PMID 16934627. [DOI](https://doi.org/10.1016/j.joen.2006.03.005) | Continuous ECG + device interrogation; "No interferences were detected by any ICP or ICD." More pacing in 6 patients was attributed to a slower intrinsic heart rate. | abstract | High |
| P4 | In vitro: 4 EALs, 3 ICDs, no interference even with electrodes against the ICD | Idzahi K, de Cock CC, Shemesh H, Brand HS. J Endod 2014;40(2):277-280. PMID 24461418. [DOI](https://doi.org/10.1016/j.joen.2013.07.027) | Electrosurgery (positive control) triggered shocks; EALs did not. | abstract | High |
| P5 | In vivo, dissenting: background noise in 6 of 12 patients; pauses in 3 after device sensitivity was changed | Moraes AP, Silva EJ, Lamas CC, Portugal PH, Neves AA. Int Endod J 2016;49(6):526-532. PMID 26105663. [DOI](https://doi.org/10.1111/iej.12487) | 2 EALs + a gutta-percha heating device, held (switched on) by the patient for 30 s; heating device caused noise more often than the EALs. | abstract | High (small; non-clinical use mode) |
| P6 | In vivo: 66 non-pacemaker-dependent patients, no interference with pacemaker function | Conde-Mir I et al. Eur J Oral Sci 2018;126(4):307-315. PMID 29972599. [DOI](https://doi.org/10.1111/eos.12534) | Ultrasonic scaler, pulp tester, EAL: no interference in the intracardiac electrogram of any patient. | abstract | High |
| P7 | Systematic reviews: compatible under clinical conditions; consult the cardiologist | AlRahabi MK, Ghabbani HM. Libyan J Med 2019;14(1):1547071, PMID 30458679, PMCID PMC6249593, [DOI](https://doi.org/10.1080/19932820.2018.1547071); Niu Y et al. Pacing Clin Electrophysiol 2020;43(12):1588-1598, PMID 32852847, [DOI](https://doi.org/10.1111/pace.14051) | AlRahabi (7 studies, full text read): "can be used safely ... when general precautions are followed"; "consultation with the patient's cardiologist remains advisable". Niu (18 studies): in vivo, EMI altering device function "was not detected at clinical distance and sensitivity settings". | full text; abstract | Medium-high |

---

## (b) Recommended on-screen facts (5-8, safe wording)

1. **"The patient is the circuit."** File → canal fluid → foramen → periodontal ligament → lip clip. Dentin and cementum
   insulate; the foramen is the only way out. *(Nekoofar 2006, Int Endod J — abstract)*
2. **"Canal = resistor + capacitor"** (must carry the word **"schematic"**). *(Nekoofar 2006; Meredith & Gulabivala 1997)*
3. **"Two AC signals: 0.4 kHz and 8 kHz. The device reads their ratio."** *(Kobayashi & Suda, J Endod 1994; frequencies
   verified in three later full-text papers)*
4. **"The ratio stays flat, then drops sharply in the last ~1 mm."** Optional sourced number: "|Z| at 8 kHz ≈ 0.7× the
   low-frequency value in the canal → ≈ 0.45× at the foramen (in vivo, 21 canals)". *(Rambo 2010, Biomed Eng Online —
   full text)*
5. **"A ratio largely ignores what is in the canal"** (blood, NaOCl) — wording "largely", not "cancels".
   *(Kobayashi & Suda 1994: "only negligibly influenced")*
6. **"It finds the foramen. The scale is not millimeters."** *(manufacturer instructions, ROOT ZX II; Ounsi & Naaman,
   Int Endod J 1999; Rambo 2010)*
7. **"In vivo: 75-96% of readings within ±0.5 mm"** with the qualifier "Root ZX, 5 small studies" (26-36 teeth or canals each; landmark foramen or constriction).
   *(Shabahang 1996; Dunlap 1998; Pagavino 1998; Welk 2003; Tselnik 2005 — all J Endod, abstracts)*
8. **History strip (silkscreen):** "1918 Custer: idea · 1962 Sunada: DC resistance (~6.5 kΩ) · AC impedance ·
   1994 Kobayashi & Suda: ratio". If Suzuki is shown: "1942 Suzuki" only (no claim text), because his paper is an
   iontophoresis study and the "constant resistance" reading of it is secondary.

Single best source line for the mechanism scenes: `Kobayashi & Suda, J Endod 1994 · Rambo et al., Biomed Eng Online 2010`.
Payoff qualifier worth keeping on screen: **"confirm with a radiograph"** (Martins 2014 SR; manufacturer IFU).

Word budget: items 1-7 can be said in about 55 must-read words; put pacemakers, limitations and the constriction-versus-
foramen nuance in the caption.

### Guidance on circuit values (brief asked: "schematic unless sourced")
- Sourced, usable: canal series resistance in vivo 7.5-9 kΩ (NaOCl), 9-12 kΩ (water), 22-92 kΩ (dry) *(Meredith &
  Gulabivala 1997, 100 Hz / 1 kHz)*; test current in the research device 10 µA RMS *(Rambo 2010)*; Sunada's ~6.5 kΩ
  (secondary).
- NOT tooth measurements: Rambo's 5-20 kΩ + 27 nF were bench dummy loads used to validate the instrument. Do not label a
  capacitor "27 nF" as if it were the tooth.
- No verified capacitance value for a tooth was found. Draw C without a value, or mark values "illustrative".
- Do not show the quotient as 1.00 in the coronal canal: in vivo it was about 0.7-0.8 there (C8), because the
  file/electrolyte interface is already frequency-dependent.

---

## (c) Corrections to the brief

1. **"Suzuki 1942 (constant electrical resistance between PDL and oral mucosa in dogs)"** — the paper exists (Kokubyo
   Gakkai Zasshi 1942;16(6):411-429, not PubMed-indexed; many reviews mis-cite pages as 411-417) and does use dog teeth
   with a mucosal electrode, but it is an **iontophoresis** study whose own summary concerns ion transport through
   dentin. The "constant resistance" statement is Sunada's / later reviewers' reading. Safe: "Suzuki 1942, iontophoresis
   experiments in dogs" or just the name and year.
2. **"Sunada 1962 J Dent Res (about 6.5 kΩ)"** — citation confirmed: J Dent Res 1962;41(2):375-387 (Crossref; not in
   PubMed). The constant-resistance finding is confirmed from an indexed summary; the figure **6.5 kΩ was read only in
   secondary papers**, which even disagree on whether it is Suzuki's or Sunada's number. Use "~6.5 kΩ" attributed to
   Sunada 1962 with medium confidence, or omit the number. **"40 µA" is not verified — do not show.**
3. **Custer 1918 is missing from the brief** and is the true first description (full text verified). Add it to the strip.
4. **"quotient value at the constriction"** — a Root ZX quotient of **0.67 could not be verified**; another paper citing
   the same primary gives **0.72 at 0.5 mm short**. Do not print either. A verified in vivo alternative is in C8.
5. **"why two frequencies cancel the effect of electrolytes"** — overstated. Primary wording: "only negligibly
   influenced". Irrigant type still shifts precision in a meta-analysis (Tsesis 2015) and overflowing fluid still
   short-circuits the reading (IFU). Use "largely compensates".
6. **"accuracy from systematic reviews (within ±0.5 mm percentages; Martins 2014, Tsesis 2015)"** — neither abstract
   reports a pooled ±0.5 mm percentage. Martins 2014 is a qualitative EAL-versus-radiograph review (21 articles);
   Tsesis 2015 pools mean file-tip-to-constriction distances (10 studies, 1105 measurements). The ±0.5 mm percentages
   come from individual in vivo studies (A1-A5): 75-96%.
7. **"dentin = insulator tube"** — fine as a schematic, but dentin is not a perfect insulator (Suzuki 1942, per my reading of the paper's Japanese summary, found the current through the root wall of freshly
   extracted human teeth to be several times that through the foramen; Krizaj 2004 models dentin conductance). Keep
   "schematic".
8. **"the 0.5 mark is not a distance in mm"** — correct, and confirmed in the manufacturer's own instructions. But the
   same instructions say the 0.5 reading means the tip "is in the apical constriction", which independent studies dispute
   (see D1). Say "not millimeters"; do not say "0.5 = constriction".
9. **"multi-frequency ratio" as the end of the story** — more frequencies did not beat two: the five-frequency Endo
   Analyzer located the minor diameter in 34.4% vs 90.7% for the two-frequency Root ZX (Welk 2003), and a review found no
   accuracy difference between 3rd-6th "generations" (Nasiri & Wrbas 2022). Avoid implying a ladder of ever-better
   devices.
10. **Pacemakers** — Garofalo 2002 is in vitro with one pacemaker and one of five EALs *did* interfere; Wilson 2006 is in
    vivo (27 patients, no interference). Add the dissenting in vivo study (Moraes 2016) and the fact that the
    manufacturer label still prohibits use. Keep it in the caption, phrased conservatively.

---

## (d) Controversies and caveats (what must not be overstated)

- **D1. Constriction or foramen?** Manufacturer: 0.5 reading = constriction, APEX = major foramen. Supporting in vivo
  data: Root ZX within ±0.5 mm of the minor diameter in 75-91% (Dunlap 1998, Welk 2003, Tselnik 2005). Against: Ounsi &
  Naaman 1999 (use only the APEX reading), Hoer & Attin 2004 (constriction found in only 51-64%; minor-to-major zone in
  81-82%), Rambo 2010 (only the 0 mm reading is electrically reliable). Many clinicians therefore advance to APEX and
  withdraw 0.5-1 mm (described in Rambo 2010). The reel should say the device senses the **foramen region** and that the
  scale is not millimeters, and stop there.
- **D2. The apical constriction is not always present or where expected** (Dummer 1984 ranges; primary teeth and resorbed
  apices lack one — Vitali 2022, Int Endod J, PMID 35808837: 69.31% within ±0.5 mm in primary teeth, very low certainty).
- **D3. The equivalent circuit.** One resistor plus one capacitor is a teaching model. Published models use series and
  parallel R-C networks and constant-phase elements; the frequency dependence comes partly from the file/electrolyte
  interface, not only from "the tooth as a capacitor".
- **D4. Accuracy numbers** come from small studies (26-36 teeth), mostly teeth scheduled for extraction, with different
  reference landmarks and tolerances; systematic reviews rate the evidence base as short and at considerable risk of
  bias (Martins 2014) or very low certainty (Kaur 2024). ElAyouti et al. 2022 (Int Endod J, PMID 35347726) criticize the
  heterogeneity of working-length study methods. Report a range, name the device, never "9x% accurate" unqualified.
- **D5. "Generation" taxonomy** is marketing-adjacent and disputed (Nekoofar 2006). Later devices are not shown to be
  more accurate (A10).
- **D6. Pacemakers/ICDs.** Labels prohibit; most bench and clinical studies show no clinically relevant interference at
  clinical distances; one small in vivo study recorded noise and pauses under provoked conditions. Not a settled "safe".
- **D7. Brand dependence.** Almost all verified mechanism and accuracy data concern the Root ZX family. Root ZX II and
  other devices are described in the literature with different signal processing (e.g., "mean square roots of the
  impedances" per Tampelini 2017, PMC5553019, citing de Vasconcelos 2015) — manufacturers do not publish full algorithms.
  Describe "the ratio method", not "all apex locators".

---

## (e) Do not claim

- Do not print "40 µA", "quotient = 0.67" or "0.72" (unverified / conflicting).
- Do not say the two frequencies "cancel" electrolytes or that the reading is "independent of canal contents".
- Do not say or imply "0.5 = 0.5 mm from the apex" or "0.5 = the constriction"; no millimeter ticks on the LCD.
- Do not say the device "measures length" or "measures distance to the apex" — it detects an electrical transition at
  the foramen.
- Do not give a single accuracy figure as if pooled ("96% accurate", "more accurate than radiographs" as a blanket
  statement). Do not attribute a ±0.5 mm percentage to Martins 2014 or Tsesis 2015.
- Do not say apex locators replace radiographs.
- Do not say "safe with pacemakers" / "contraindicated with pacemakers" as a flat fact.
- Do not say Suzuki invented or built an apex locator, or that he "measured 6.5 kΩ" (secondary sources conflict).
- Do not say newer generations or more frequencies are more accurate.
- Do not label drawn component values as measured tooth values unless taken from C5; no capacitance value.
- Do not show a quotient of exactly 1 in the coronal canal.
- No device logos or a recreation of a commercial screen layout; no ESE/AAE guideline statement (none was verified).

---

## (f) Suggested storyline (silent, 20-22 s, PCB / schematic style)

Total must-read text about 55 words. One source line per scene, 24-26 px silkscreen.

| t (s) | Picture | Text on board (silkscreen) |
|---|---|---|
| 0-2.5 | Dark green PCB powers up; copper traces light toward an LCD module that boots with a blank bar. A tooth outline in trace-art sits mid-board. | Hook: **"How does an apex locator find the end?"** |
| 2.5-6.5 | Circuit closes: lip-clip pad → wide copper pour labelled as the body (mucosa, bone, ligament = conductor) → around the root. Dentin drawn as a solder-mask keep-out (insulator). File trace enters the canal (electrolyte = thin resistive trace). A single via at the foramen is the only connection. | "The patient is the circuit." · "Dentin insulates. The foramen is the only way out." |
| 6.5-11 | Schematic symbols fade in over the tooth: resistor for the canal column, R in parallel with C at the apex; tag "schematic". Two sine waves leave an AC source pair (slow 0.4 kHz, fast 8 kHz) and travel the loop; two small meters V(0.4k), V(8k) and a divider symbol feeding the LCD. File advances; resistor visibly shortens; ratio readout stays nearly flat; LCD bar creeps. | "2 signals: 0.4 kHz + 8 kHz" · "Device reads their ratio" · source: *Kobayashi & Suda, J Endod 1994* |
| 11-15.5 | Fluid chip toggles (dry / blood / NaOCl icon): both waves change size together, ratio readout hardly moves. Then the last millimeter: capacitor path lights up, the fast wave passes more easily than the slow one, ratio falls steeply, LCD segments march quickly to **APEX**, an LED blinks. | "Fluid shifts both — ratio holds" · "Last ~1 mm: ratio drops" · source: *Rambo et al., Biomed Eng Online 2010 (in vivo)* |
| 15.5-21 | Payoff hold (≥ 3 s): LCD shows APEX; a silkscreen box: scale marks crossed out with "not mm". History strip etched along the board edge like revision marks. Fade text before looping back to the powered-down board. | **"It senses the foramen — the scale is not millimeters."** · "In vivo: 75-96% within ±0.5 mm (Root ZX, 5 small studies)" · "Confirm with a radiograph" · strip: "1918 Custer · 1962 Sunada DC · AC impedance · 1994 ratio" |

Notes for the builder:
- Curve shape must follow C7/C8: long plateau, steep fall in the final 0.5-1 mm. Do not animate a linear ramp.
- If the ratio is displayed numerically, either hide the digits (bar only) or use the Rambo values with the label
  "in vivo, 8 kHz / 250 Hz" (0.71 → 0.67 → 0.63 → 0.45). Simplest and safest: show a bar/needle without digits.
- Keep the "schematic" tag inside the safe area whenever R/C symbols are visible.
- American spelling: dentin, millimeters.
- Poster frame suggestion: about t = 14 (LCD at APEX, both waves visible).

---

## (g) Suggested Instagram caption reference list

Refs (all verified on PubMed unless marked):
- Custer LE. Dent Regist 1918;72:420-5 (PMID 33703181)
- Sunada I. J Dent Res 1962;41:375-87 (not in PubMed; doi 10.1177/00220345620410020801)
- Kobayashi C, Suda H. J Endod 1994;20:111-4 (PMID 7996080)
- Nekoofar MH et al. Int Endod J 2006;39:595-609 (PMID 16872454)
- Gordon MPJ, Chandler NP. Int Endod J 2004;37:425-37 (PMID 15189431)
- Meredith N, Gulabivala K. Endod Dent Traumatol 1997;13:126-31 (PMID 9550026)
- Rambo MVH et al. Biomed Eng Online 2010;9:46 (PMID 20819212)
- Ounsi HF, Naaman A. Int Endod J 1999;32:120-3 (PMID 10371907)
- Hoer D, Attin T. Int Endod J 2004;37:125-31 (PMID 14871179)
- Shabahang S et al. J Endod 1996;22:616-8 (PMID 9198419)
- Dunlap CA et al. J Endod 1998;24:48-50 (PMID 9487868)
- Pagavino G et al. J Endod 1998;24:438-41 (PMID 9693591)
- Welk AR et al. J Endod 2003;29:497-500 (PMID 12929694)
- Tselnik M et al. J Endod 2005;31:507-9 (PMID 15980709)
- Martins JNR et al. J Endod 2014;40:759-77 (PMID 24862702)
- Tsesis I et al. J Endod 2015;41:1818-23 (PMID 26409810)
- Wilson BL et al. J Endod 2006;32:847-52 (PMID 16934627); Garofalo RR et al. J Endod 2002;28:831-3 (PMID 12489653);
  Moraes AP et al. Int Endod J 2016;49:526-32 (PMID 26105663)

Short "Refs:" line for the caption itself (covers every claim in items 1-8):
`Refs: Kobayashi & Suda 1994 J Endod; Nekoofar 2006 Int Endod J; Rambo 2010 Biomed Eng Online; Ounsi & Naaman 1999 Int Endod J; Shabahang 1996, Dunlap 1998, Pagavino 1998, Welk 2003, Tselnik 2005 J Endod; Martins 2014 J Endod; Sunada 1962 J Dent Res; Custer 1918 Dent Regist.`

Caption nuance worth including (not on screen): constriction-versus-foramen debate (D1); wide apex, perforation, metal
restoration and flooded chamber as failure modes (L1-L3); pacemaker sentence: "Device labels still say not to use with
pacemakers; small clinical studies (Wilson 2006; Conde-Mir 2018) found no interference, one (Moraes 2016) recorded noise
— check with cardiology." Add "schematic animation — circuit simplified".

---

## Search log (for the reviewer)
- PubMed queries: Kobayashi/Suda ratio method; Sunada 1962; Suzuki 1942; Custer; apex locator systematic review /
  meta-analysis; apex locator + pacemaker / ICD; impedance modelling (Meredith, Krizaj, Pilot); open apex; perforation;
  metallic restoration; ESE S3 guideline.
- PMC full text read: Custer 1918 (PMC7845214); Rambo 2010 (PMC2944265); Nasiri & Wrbas 2022 (PMC8767164); AlRahabi &
  Ghabbani 2019 (PMC6249593). PMC pages queried for specific sentences: Gehlot 2016 (PMC4751208), Tampelini 2017
  (PMC5553019), Alothmani & Siddiqui 2023 (PMC10476874).
- Not accessible (paywalled, so content cited only at abstract level or via secondary): Sunada 1962; Kobayashi & Suda
  1994 full text; Gordon & Chandler 2004 full text; Nekoofar 2006 full text; Tsesis 2015 full text; Kuttler 1955; Dummer
  1984; ESE S3 guideline 2023 (no apex-locator statement verified — none claimed).
- Local copies used for verification: `_scratch/dl_suzuki/suzuki1942.pdf` (J-STAGE scan) and
  `_scratch/dl_morita/rootzx2_manual.txt` (text of the manufacturer instructions).

---

## DOI index (PubMed-indexed sources cited above)
According to PubMed: Kobayashi & Suda 1994 [DOI](https://doi.org/10.1016/S0099-2399(06)80053-1) · Kobayashi 1995
[DOI](https://doi.org/10.1016/s1079-2104(05)80288-4) · Gordon & Chandler 2004
[DOI](https://doi.org/10.1111/j.1365-2591.2004.00835.x) · Nekoofar 2006
[DOI](https://doi.org/10.1111/j.1365-2591.2006.01131.x) · Kim & Lee 2004
[DOI](https://doi.org/10.1016/j.cden.2003.10.005) · Nasiri & Wrbas 2022
[DOI](https://doi.org/10.1016/j.sdentj.2021.09.020) · Meredith & Gulabivala 1997
[DOI](https://doi.org/10.1111/j.1600-9657.1997.tb00025.x) · Krizaj 2004 [DOI](https://doi.org/10.1002/bem.10189) ·
Krizaj 2002 [DOI](https://doi.org/10.1109/TBME.2002.1010861) · Rambo 2010
[DOI](https://doi.org/10.1186/1475-925X-9-46) · Pilot & Pitts 1997
[DOI](https://doi.org/10.1016/S0099-2399(97)80341-X) · Gehlot 2016 [DOI](https://doi.org/10.5395/rde.2016.41.1.6) ·
Alothmani & Siddiqui 2023 [DOI](https://doi.org/10.7759/cureus.44659) · Tampelini 2017
[DOI](https://doi.org/10.5395/rde.2017.42.3.200) · Ounsi & Naaman 1999
[DOI](https://doi.org/10.1046/j.1365-2591.1999.00202.x) · Hoer & Attin 2004
[DOI](https://doi.org/10.1111/j.0143-2885.2004.00764.x) · Dummer 1984
[DOI](https://doi.org/10.1111/j.1365-2591.1984.tb00404.x) · Kuttler 1955
[DOI](https://doi.org/10.14219/jada.archive.1955.0099) · Shabahang 1996
[DOI](https://doi.org/10.1016/S0099-2399(96)80033-1) · Dunlap 1998
[DOI](https://doi.org/10.1016/S0099-2399(98)80214-8) · Pagavino 1998
[DOI](https://doi.org/10.1016/S0099-2399(98)80029-0) · Welk 2003
[DOI](https://doi.org/10.1097/00004770-200308000-00002) · Tselnik 2005
[DOI](https://doi.org/10.1097/01.don.0000152295.05827.80) · Vieyra & Acosta 2011
[DOI](https://doi.org/10.1111/j.1365-2591.2011.01855.x) · Tsesis 2015
[DOI](https://doi.org/10.1016/j.joen.2015.08.012) · Martins 2014 [DOI](https://doi.org/10.1016/j.joen.2014.03.011) ·
ElAyouti 2002 [DOI](https://doi.org/10.1097/00004770-200202000-00017) · Kaur 2024
[DOI](https://doi.org/10.1186/s12903-024-04259-w) · Fouad 1990 [DOI](https://doi.org/10.1016/s0099-2399(06)81889-3) ·
Ebrahim 2006 (51:258) [DOI](https://doi.org/10.1111/j.1834-7819.2006.tb00439.x) · Ebrahim 2006 (51:153)
[DOI](https://doi.org/10.1111/j.1834-7819.2006.tb00419.x) · Herrera 2007
[DOI](https://doi.org/10.1016/j.joen.2007.05.009) · Alhadainy 1994 [DOI](https://doi.org/10.1016/0030-4220(94)90070-1) ·
Jenkins 2001 [DOI](https://doi.org/10.1097/00004770-200103000-00018) · Meares & Steiman 2002
[DOI](https://doi.org/10.1097/00004770-200208000-00008) · Golkar 2025 [DOI](https://doi.org/10.4103/drj.drj_634_23) ·
Garofalo 2002 [DOI](https://doi.org/10.1097/00004770-200212000-00009) · Wilson 2006
[DOI](https://doi.org/10.1016/j.joen.2006.03.005) · Idzahi 2014 [DOI](https://doi.org/10.1016/j.joen.2013.07.027) ·
Moraes 2016 [DOI](https://doi.org/10.1111/iej.12487) · Conde-Mir 2018 [DOI](https://doi.org/10.1111/eos.12534) ·
AlRahabi & Ghabbani 2019 [DOI](https://doi.org/10.1080/19932820.2018.1547071) · Niu 2020
[DOI](https://doi.org/10.1111/pace.14051) · Vitali 2022 [DOI](https://doi.org/10.1111/iej.13798) · ElAyouti 2022
[DOI](https://doi.org/10.1111/iej.13738) · Duncan (ESE S3) 2023 [DOI](https://doi.org/10.1111/iej.13974).
No DOI: Custer 1918 (PMCID PMC7845214); Saito & Yamashita 1990 (PMID 2099293); McDonald 1992 (PMID 1572500).

"""Narration + slide content for the explainer:
"Why Root Canals Fail - Nair's six causes of persistent apical periodontitis".

Each chunk has:
  cap    - on-screen caption (correct spelling)
  say    - text sent to Chatterbox (phonetic respellings where needed)
  checks - regexes that must match the wav2vec2 IPA transcription of the audio
           (used to auto-reject mispronounced takes)

Respellings below were chosen by synthesising candidates with the default
Chatterbox voice and checking the phonemes with facebook/wav2vec2-lv-60-espeak-cv-ft.
"""

# IPA checks (whitespace-free IPA string)
PERIAPICAL = r"[iɪ]ː?eɪp"
APICAL = r"eɪp[ɪəɐ]k"
FAECALIS = r"[fv]iː?k[eɪ]+l"
CHOLESTEROL = r"l[ɛe]st"
RADICULAR = r"ɹ[ɐəɪæ]+dɪk"
ISRAELII = r"zɹeɪl"
SIQUEIRA = r"s[iɪ]ː?k[eɪ]+ɹ"


def C(cap, say=None, checks=(), step=True):
    return {"cap": cap, "say": say or cap, "checks": list(checks), "step": step}


SCENES = [
    {
        "id": "title", "layout": "title", "tooth": "base",
        "title": "Why Root Canals Fail",
        "sub": "Nair's six causes of persistent apical periodontitis",
        "chunks": [
            C("Why do root canals fail?"),
            C("Today: the six causes of persistent apical periodontitis, from Ramachandran Nair's classic review.",
              "Today: the six causes of persistent aypical periodontitis, from Ramachandran Nair's classic review.",
              [APICAL]),
            C("And a mnemonic to lock them in."),
        ],
    },
    {
        "id": "big", "layout": "bullets", "tooth": "intra",
        "kicker": "The big picture",
        "title": "Most failures are infection",
        "bullets": [
            "Bacteria that <b>survived</b> treatment — or <b>got back in</b>",
            "Missed canals · inadequate instrumentation · coronal leakage",
            "Nair 2006: even <b>well-treated</b> teeth can keep a radiolucency — for six biological reasons",
        ],
        "chunks": [
            C("First, the big picture. Most endodontic failures come down to one thing: bacteria that survived treatment, or got back in."),
            C("Missed canals, inadequate instrumentation, and leaky restorations all lead to the same place: infection persisting inside the root canal system."),
            C("But in 2006, Nair pulled together a decade of histology to show that even well-treated teeth can keep a radiolucency, for six distinct biological reasons."),
        ],
    },
    {
        "id": "mnemonic", "layout": "mnemonic", "tooth": None,
        "chunks": [
            C("Here's the mnemonic: If Endo Fails, Consider Cysts and Scars."),
            C("I: intraradicular infection. E: extraradicular infection. F: foreign body reaction.",
              "I: intra-radicular infection. E: extra-radicular infection. F: foreign body reaction.",
              [RADICULAR]),
            C("C: cholesterol crystals. C: true cysts. And S: scar tissue.",
              checks=[CHOLESTEROL]),
        ],
    },
    {
        "id": "I", "layout": "cause", "tooth": "intra", "letter": "I", "word": "If",
        "title": "Intraradicular infection",
        "bullets": [
            "<b>Most common</b> cause by far",
            "Hides in isthmuses, lateral canals, apical ramifications, dentinal tubules — as <b>biofilm</b>",
            "Retreatment flora: hardy gram-positives — <i>Enterococcus faecalis</i>",
            "Think: missed MB2, short/poorly cleaned preps, coronal leakage",
        ],
        "chunks": [
            C("I is intraradicular infection, and it's by far the most common cause.",
              "I is intra-radicular infection, and it's by far the most common cause.", [RADICULAR]),
            C("Bacteria hide where files and irrigants can't reach: isthmuses, lateral canals, apical ramifications, and dentinal tubules, often organized as biofilm.",
              "Bacteria hide where files and irrigants can't reach: isthmuses, lateral canals, aypical ramifications, and dentinal tubules, often organized as biofilm.",
              [APICAL]),
            C("In retreatment cases, the flora shifts toward hardy gram-positive species, with Enterococcus faecalis the classic example.",
              "In retreatment cases, the flora shifts toward hardy gram-positive species, with Enterococcus fee-kay-lis the classic example.",
              [FAECALIS]),
            C("Clinically, think missed canals like MB2, short or poorly cleaned preparations, and coronal leakage.",
              "Clinically, think missed canals like M B two, short or poorly cleaned preparations, and coronal leakage."),
        ],
    },
    {
        "id": "E", "layout": "cause", "tooth": "extra", "letter": "E", "word": "Endo",
        "title": "Extraradicular infection",
        "bullets": [
            "Bacteria living <b>outside</b> the root, in the periapical tissue",
            "Periapical actinomycosis — <i>Actinomyces israelii</i>, <i>Propionibacterium propionicum</i>",
            "Cohesive colonies resist phagocytosis → canal disinfection can't reach them",
            "Management: <b>apical surgery</b>",
        ],
        "chunks": [
            C("E is extraradicular infection, where bacteria establish themselves outside the root, in the periapical tissue itself.",
              "E is extra-radicular infection, where bacteria establish themselves outside the root, in the pairy-aypical tissue itself.",
              [RADICULAR, PERIAPICAL]),
            C("The best documented form is periapical actinomycosis, caused by Actinomyces israelii and Propionibacterium propionicum.",
              "The best documented form is pairy-aypical actinomycosis, caused by Actinomyces israelii and Propionibacterium propionicum.",
              [PERIAPICAL, ISRAELII]),
            C("These organisms form cohesive colonies that resist phagocytosis, so no amount of canal disinfection will reach them."),
            C("The fix is apical surgery.", "The fix is aypical surgery.", [APICAL]),
        ],
    },
    {
        "id": "F", "layout": "cause", "tooth": "foreign", "letter": "F", "word": "Fails",
        "title": "Foreign body reaction",
        "bullets": [
            "Extruded filling or other <b>exogenous</b> material — no bacteria needed",
            "Bulk gutta-percha: usually tolerated",
            "<b>Fine particles</b> &amp; talc-contaminated gutta-percha → macrophages, giant cells",
            "Cellulose from paper points can sustain a lesion",
        ],
        "chunks": [
            C("F is a foreign body reaction."),
            C("Extruded root canal filling, or other exogenous material, can keep the periapex inflamed with no bacteria involved at all.",
              "Extruded root canal filling, or other exogenous material, can keep the tissue around the apex inflamed, with no bacteria involved at all."),
            C("Large pieces of gutta-percha are usually well tolerated."),
            C("But fine particles, and gutta-percha contaminated with talc, attract macrophages and foreign body giant cells."),
            C("Cellulose fibers shed from paper points have also been found driving persistent lesions."),
        ],
    },
    {
        "id": "C1", "layout": "cause", "tooth": "chol", "letter": "C", "word": "Consider",
        "title": "Cholesterol crystals",
        "bullets": [
            "<b>Endogenous</b> — from disintegrating RBCs, lymphocytes, plasma cells, macrophages",
            "Histology: needle-shaped clefts ringed by multinucleated giant cells",
            "Macrophages can't dissolve them → <b>self-sustaining</b> lesion",
        ],
        "chunks": [
            C("The first C is cholesterol crystals.", checks=[CHOLESTEROL]),
            C("These are endogenous. They come from disintegrating red blood cells, lymphocytes, plasma cells, and macrophages within the lesion."),
            C("On histology they leave needle-shaped clefts, surrounded by multinucleated giant cells."),
            C("Macrophages can't break the crystals down, so the lesion becomes self-sustaining."),
        ],
    },
    {
        "id": "C2", "layout": "cysts", "tooth": None, "letter": "C", "word": "Cysts",
        "title": "True cysts",
        "chunks": [
            C("The second C is the true cyst."),
            C("Nair's serial-section work found that only about fifteen percent of apical lesions are cysts, and they come in two types.",
              "Nair's serial-section work found that only about fifteen percent of aypical lesions are cysts, and they come in two types.",
              [APICAL]),
            C("A pocket cyst has its lumen open to the root canal, so it can heal after nonsurgical treatment."),
            C("A true cyst is completely enclosed by epithelium, independent of the canal, and is unlikely to resolve without surgery."),
            C("And you can't tell them apart on a radiograph."),
        ],
    },
    {
        "id": "S", "layout": "cause", "tooth": "scar", "letter": "S", "word": "Scars",
        "title": "Scar tissue",
        "bullets": [
            "Heals with dense <b>fibrous connective tissue</b> instead of bone",
            "Classically after surgery with loss of <b>both cortical plates</b>",
            "Radiolucency persists — but it's <b>healed</b>. Nothing to treat.",
        ],
        "chunks": [
            C("Finally, S is scar tissue."),
            C("Some lesions heal with dense fibrous connective tissue instead of bone, especially after surgery when both cortical plates are lost."),
            C("The radiolucency persists, but it's healed. There's nothing to treat."),
        ],
    },
    {
        "id": "clinical", "layout": "suspects", "tooth": None,
        "kicker": "The usual clinical suspects",
        "chunks": [
            C("Now let's connect this to the usual clinical suspects."),
            C("Overfilling feeds the F category. But extruded material often signals a canal that was never properly shaped or sealed, so infection is usually along for the ride."),
            C("Wrong tooth means misdiagnosis. The lesion may belong to a neighbor, or not be endodontic at all. Test the adjacent teeth, and get a CBCT.",
              "Wrong tooth means misdiagnosis. The lesion may belong to a neighbor, or not be endodontic at all. Test the adjacent teeth, and get a C B C T."),
            C("A crack, meaning a vertical root fracture, is a different animal."),
            C("Look for an isolated, deep, narrow pocket, a sinus tract near the gingival margin, and a J-shaped or halo radiolucency."),
            C("The prognosis is hopeless, and the root has to go."),
        ],
    },
    {
        "id": "triage", "layout": "triage", "tooth": None,
        "kicker": "Putting it together",
        "title": "Sort the failure, pick the fix",
        "rows": [
            ("Intraradicular infection", "Nonsurgical retreatment"),
            ("Extraradicular · Foreign body · Cholesterol · True cyst", "Apical surgery + biopsy"),
            ("Vertical root fracture", "Extraction / root resection"),
            ("Scar tissue", "Leave it alone"),
        ],
        "chunks": [
            C("So when you see a failing root canal, sort it out."),
            C("Infection inside the canal: nonsurgical retreatment."),
            C("Infection outside the root, a foreign body, cholesterol, or a true cyst: apical surgery, and send the tissue for biopsy.",
              "Infection outside the root, a foreign body, cholesterol, or a true cyst: aypical surgery, and send the tissue for biopsy.",
              [APICAL, CHOLESTEROL]),
            C("A fracture: the root comes out. A scar: leave it alone."),
        ],
    },
    {
        "id": "recap", "layout": "recap", "tooth": None,
        "chunks": [
            C("Remember: If Endo Fails, Consider Cysts and Scars."),
        ],
    },
    {
        "id": "refs", "layout": "refs", "tooth": None,
        "refs": [
            "Nair PNR. On the causes of persistent apical periodontitis: a review. <i>Int Endod J</i> 2006;39:249–81. doi:10.1111/j.1365-2591.2006.01099.x",
            "Siqueira JF Jr. Aetiology of root canal treatment failure: why well-treated teeth can fail. <i>Int Endod J</i> 2001;34:1–10. doi:10.1046/j.1365-2591.2001.00396.x",
        ],
        "chunks": [
            C("Key references: Nair, International Endodontic Journal, 2006, and Siqueira, International Endodontic Journal, 2001.",
              "Key references: Nair, International Endodontic Journal, 2006. And See-kay-ruh, International Endodontic Journal, 2001.",
              [SIQUEIRA]),
        ],
    },
]

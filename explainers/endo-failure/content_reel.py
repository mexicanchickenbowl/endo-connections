"""Vertical (Instagram Reels) cut: 'Why Root Canals Fail', Vox-style.

Same pronunciation strategy as content.py: `cap` is the on-screen text,
`say` is what Chatterbox reads, `checks` are IPA regexes the take must match.
Word-synced reveals reference chunk/word indexes of `cap` (e.g. "c0w3").
"""
from content import APICAL, CHOLESTEROL, FAECALIS, ISRAELII, PERIAPICAL, RADICULAR  # noqa: F401


def C(cap, say=None, checks=()):
    return {"cap": cap, "say": say or cap, "checks": list(checks), "step": True}


SCENES = [
    {"id": "hook", "layout": "hook", "chunks": [
        C("You did everything right."),
        C("Clean shaping. A dense, well-sealed fill."),
        C("So why is that lesion still there?"),
    ]},
    {"id": "paper", "layout": "paper", "chunks": [
        C("In 2006, Ramachandran Nair pulled together decades of histology."),
        C("His answer: six biological reasons a lesion won't heal."),
    ]},
    {"id": "mnemonic", "layout": "mnemonic", "chunks": [
        C("To remember them: If Endo Fails, Consider Cysts and Scars."),
    ]},
    {"id": "I", "layout": "cause", "letter": "I", "title": "Intraradicular infection", "tooth": "intra",
     "note": "biofilm in isthmuses + lateral canals", "fact": "#1 cause", "chunks": [
        C("I is for intraradicular infection: bacteria hiding in isthmuses and lateral canals.",
          "I is for intra-radicular infection: bacteria hiding in isthmuses and lateral canals.", [RADICULAR]),
        C("Missed canals. Leaky crowns. By far the most common cause."),
    ]},
    {"id": "E", "layout": "cause", "letter": "E", "title": "Extraradicular infection", "tooth": "extra",
     "note": "Actinomyces colonies", "fact": "Fix: surgery", "chunks": [
        C("E: extraradicular infection. Actinomyces israelii, living outside the root.",
          "E is extra-radicular infection. Actinomyces israelii, living outside the root.", [RADICULAR, ISRAELII]),
        C("No file can reach it. The fix is surgery."),
    ]},
    {"id": "F", "layout": "cause", "letter": "F", "title": "Foreign body reaction", "tooth": "foreign",
     "note": "extruded particles", "fact": "No bacteria needed", "chunks": [
        C("F: foreign body. Extruded filling, talc, even fibers from paper points.",
          "F is foreign body. Extruded filling, talc, even fibers from paper points."),
    ]},
    {"id": "C1", "layout": "cause", "letter": "C", "title": "Cholesterol crystals", "tooth": "chol",
     "note": "needle-shaped clefts", "fact": "Self-sustaining", "chunks": [
        C("C: cholesterol crystals, left by cells dying inside the lesion. The body can't clear them.",
          "C is cholesterol crystals, left by cells dying inside the lesion. The body can't clear them.",
          [CHOLESTEROL, r"daɪ[ɪi]ŋ"]),
    ]},
    {"id": "C2", "layout": "cysts", "letter": "C", "title": "True cysts", "chunks": [
        C("C: true cysts, sealed off from the canal."),
        C("Pocket cysts can heal. True cysts usually need surgery."),
    ]},
    {"id": "S", "layout": "cause", "letter": "S", "title": "Scar tissue", "tooth": "scar",
     "note": "fibrous, not bone", "fact": "Leave it alone", "chunks": [
        C("S: scar tissue. It healed, just with fibrous tissue instead of bone. Leave it alone.",
          "S is scar tissue. It healed, just with fibrous tissue instead of bone. Leave it alone."),
    ]},
    {"id": "suspects", "layout": "suspects", "chunks": [
        C("And the clinical culprits?"),
        C("Overfills feed the foreign body problem."),
        C("Wrong tooth? That's a misdiagnosis. Test the neighbors."),
        C("And a vertical root fracture means the root is hopeless."),
    ]},
    {"id": "triage", "layout": "triage", "chunks": [
        C("So: infection inside, retreat. Outside, surgery. Cracked, extract."),
    ]},
    {"id": "cta", "layout": "cta", "chunks": [
        C("If Endo Fails, Consider Cysts and Scars. Save this for boards."),
    ]},
]

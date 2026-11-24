# Why Root Canals Fail: explainer video

An explainer of **Nair's six biological causes of persistent apical periodontitis**
(Nair, *Int Endod J* 2006;39:249–81). Narration uses the default Chatterbox voice.

**Mnemonic:** *If Endo Fails, Consider Cysts & Scars*

| | Cause | Management |
|---|---|---|
| **I**f | **I**ntraradicular infection (most common) | Nonsurgical retreatment |
| **E**ndo | **E**xtraradicular infection (periapical actinomycosis) | Apical surgery |
| **F**ails | **F**oreign body reaction (extruded GP, talc, paper-point cellulose) | Apical surgery + biopsy |
| **C**onsider | **C**holesterol crystals | Apical surgery + biopsy |
| **C**ysts | True **c**ysts (vs. pocket cysts, which can heal) | Apical surgery + biopsy |
| **S**cars | **S**car tissue | Leave it alone |

Clinical suspects covered too: overfill (→ F, usually with I), wrong tooth (misdiagnosis),
and crack / VRF (extraction).

The mnemonic is a study aid built on Nair's six factors. It is not a published mnemonic.

## Pipeline

```
content.py  : script, captions, phonetic respellings, IPA checks
tts.py      : Chatterbox (default voice) -> per-sentence QA -> build/chunks + manifest.json
render.py   : HTML/SVG slides -> Playwright frames -> ffmpeg (H.264 + AAC)
```

```bash
# TTS env (Python 3.11): torch/torchaudio 2.6 CPU, chatterbox-tts, faster-whisper, "setuptools<81"
python tts.py build
# Render env: playwright, numpy, soundfile
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python render.py build why-root-canals-fail.mp4
```

### Pronunciation QA

Chatterbox takes no SSML or IPA, so problem words get phonetic respellings in the
`say` field while captions keep the correct spelling. After each sentence is
generated, `tts.py` runs it through:

1. **wav2vec2 phoneme recogniser** (`facebook/wav2vec2-lv-60-espeak-cv-ft`), which gives IPA.
   Each term must match a regex (for example, *periapical* must contain /ieɪp/).
2. **Whisper small.en**, whose transcript must roughly match the caption. This catches garbled
   or hallucinated takes.

Takes that fail get regenerated with a new seed, up to 5 tries.

| Term | Sent to TTS as | Verified IPA |
|---|---|---|
| periapical | `pairy-aypical` | /pɛɹieɪpəkəl/ |
| apical | `aypical` | /eɪpɪkəl/ |
| *E. faecalis* | `Enterococcus fee-kay-lis` | /fiːkeɪlɪs/ |
| intra-/extraradicular | `intra-radicular` | /ɪntɹəɹɪdɪkjuːlɚ/ |
| Siqueira | `See-kay-ruh` | /siːkeɪɹʌ/ |
| Nair | as written | /naɪɚ/ |
| *Actinomyces israelii*, *Propionibacterium propionicum*, actinomycosis, gutta-percha, isthmus, MB2, CBCT | as written | ✓ |

## Instagram Reels cut (Vox style)

`why-root-canals-fail-reel.mp4` is 1080×1920, 30 fps, 72 s, normalised to about −15 LUFS, 42 MB.
`why-root-canals-fail-reel_nomusic.mp4` is the same cut with voice and sound effects only,
so you can add audio from Instagram's library in the app.

- **Script:** `content_reel.py`. It is a tighter, hook-first rewrite with the same pronunciation QA.
  An added `daɪɪŋ` check caught "dying" being read as "dime".
- **Renderer:** `render_reel.py`.
- **Look:** paper texture with animated film grain, taped radiograph prints and polaroids, yellow
  highlighter swipes, hand-drawn red circles and arrows, stamps, a constant slow camera
  push, and whip-pan transitions.
- **Captions:** word-by-word karaoke captions, timed from Whisper word timestamps aligned to the script.
- **Audio:** an original synthesized music bed (Am–F–C–G pad, plucked arpeggio, soft kick) that
  dips under the voice, plus whoosh and thump effects.
- **Safe zones:** nothing important sits in the top 220 px, the bottom 420 px or the right-hand
  button column. Run with `--preview --guides` to see these zones on the stills.
- **Fonts:** Permanent Marker (Apache 2.0) and Caveat (OFL) are in `fonts/`.

```bash
python tts.py reel content_reel
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python render_reel.py reel why-root-canals-fail-reel
```

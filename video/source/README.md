# The Hidden Toothache — explainer video source

A ~3.5 min explainer on why patients struggle to localize pulpal pain.

## Pipeline
1. `tts/gen.py`: Chatterbox TTS (ResembleAI, default voice, CPU) narrates each line in `script.json`.
2. `qa.py`: faster-whisper transcribes every take, picks the best take per line (`picks.json`), and records word timestamps (`words.json`).
3. `assemble.py`: lays the takes on a timeline and writes `narration.wav` + `web/timings.js`.
4. `web/index.html`: a deterministic GSAP timeline (`window.seek(t)`); the motion syncs to word timestamps.
5. `render.js`: Playwright captures frames (30 fps) and exports the SFX cue list.
6. `mix.py`: narration + ducked music bed + synthesized SFX, loudness-normalized to −16 LUFS with a peak limiter.
7. `build.sh`: runs the whole thing and encodes the MP4.

`web/` needs `npm i` (gsap + @fontsource fonts listed in package.json).
Paths in build.sh point at the original session's scratch directory; adjust before re-running.

## Sources (verified on PubMed)
- McCarthy PJ et al. J Endod 2010;36(5):801–5. doi:10.1016/j.joen.2009.12.035
- Owatz CB et al. J Endod 2007;33(5):552–6. doi:10.1016/j.joen.2007.01.023
- Bender IB. J Endod 2000;26(3):175–9. doi:10.1097/00004770-200003000-00012
- Sessle BJ et al. Pain 1986;27(2):219–35. doi:10.1016/0304-3959(86)90213-7
- Sharav Y et al. Pain 1984;20(4):363–70. doi:10.1016/0304-3959(84)90113-1
- Falace DA et al. J Orofac Pain 1996;10(3):232–9.
- Ashaibi NA et al. Clin Exp Dent Res 2025;11(1):e70012. doi:10.1002/cre2.70012

## Credits
Music: "Infinite Perspective" by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.
Narration: Chatterbox TTS (Resemble AI).

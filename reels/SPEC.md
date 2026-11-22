# Endo Reels — sample spec

Silent, narration-free **animated scientific infographics** for Instagram Reels / Stories on **@natebrooksendo**
(an endodontic resident's account). Audience: endodontists, residents and general dentists. Each reel teaches one
concept *visually* in **10–30 seconds** with minimal on-screen text. No voice-over, no audio, no music.

## Output format
- 1080 × 1920 (9:16), 30 fps, H.264 MP4 (the renderer adds a silent audio track).
- Rendered **frame by frame**: the page exposes a pure function `render(t)` that draws the exact frame for time `t`
  (seconds). Nothing may depend on wall-clock time, `Date.now()`, `performance.now()`, `Math.random()` or
  `requestAnimationFrame` timing. Use `Kit.rng(seed)`, `Kit.hash()`, `Kit.noise1/2()` for randomness.
- No network at runtime. Use only the vendored assets below (all paths relative to the sample folder).

## File layout (one folder per sample — never edit anything outside your own folder)
```
reels/samples/NN-slug/
  index.html     required — the reel
  *.js / *.css   optional extra files
  RESEARCH.md    evidence brief (written by the research stage; the reel may only state what it supports)
  NOTES.md       required — concept, storyboard, every on-screen claim + its source, what is schematic, change log
  meta.json      required — gallery metadata + ready-to-paste Instagram caption (schema below)
  _scratch/      your private scratch space (git-ignored). Never write scratch files anywhere else.
  _stills/       render output (git-ignored)
```
Final video: `reels/out/NN-slug.mp4` + poster `reels/out/NN-slug.jpg` (written by the renderer).

## Page contract
```html
<link rel="stylesheet" href="../../vendor/fonts/fonts.css">
<script src="../../lib/kit.js"></script>
<div id="stage"></div>            <!-- everything visible lives inside this 1080x1920 element -->
<script>
  window.REEL = {
    title: 'Short title',
    duration: 20,                  // seconds, 10–30
    poster: 14,                    // optional: time of the best still (used as the cover image)
    fonts: ['700 80px "Space Grotesk"', '400 34px Inter'],   // fonts to preload
    canvas,                        // optional: if the WHOLE frame is one <canvas> (2D or WebGL), pass it (fast path)
    async setup() {},              // optional one-time setup
    render(t) { /* draw frame at time t — may be async */ },
  };
  Kit.boot(REEL);                  // required (loads fonts, runs setup, marks ready, autoplays in a normal browser)
</script>
```
- Canvas 2D, SVG, DOM/CSS, or WebGL (three.js) are all fine. For DOM/SVG/CSS animation, set every property
  from `t` inside `render(t)` (no CSS transitions/animations that run on their own clock). If you use GSAP, build a
  **paused** timeline and call `tl.seek(t)` in `render`.
- WebGL: create the renderer with `preserveDrawingBuffer: true`. Three.js via import map:
  ```html
  <script type="importmap">{"imports":{"three":"../../vendor/three.module.min.js","three/addons/":"../../vendor/three-addons/"}}</script>
  <script type="module"> import * as THREE from 'three'; import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; ... </script>
  ```
- Keep a frame under ~150 ms to render.

## Vendored assets (`reels/vendor/`, `reels/lib/`)
- `lib/kit.js` → `window.Kit`: `clamp, lerp, invlerp, seg(t,a,b,ease), env(t,a,b,fi,fo), ease.{smooth,inOut,out,in,outQuint,outBack,outElastic}, rng(seed), hash(...), noise1, noise2, hex, rgba, mix, colormap(stops,v), wrap, textBlock(ctx,text,x,y,{maxWidth,lineHeight,align,font,color,alpha}), type(text,u), readSecs(text), createCanvas(), ensureStage(), handle(ctx,x,y,opts), loadFonts, boot`.
- Fonts (`vendor/fonts/fonts.css`, latin + latin-ext + greek): Inter, IBM Plex Sans, IBM Plex Mono, Space Grotesk,
  Playfair Display, Source Serif 4, EB Garamond, Caveat (handwriting), Press Start 2P (pixel), JetBrains Mono,
  Fraunces, Bebas Neue, DM Serif Display, VT323 (CRT terminal), Share Tech Mono, Nunito, Libre Baskerville,
  Archivo Black; latin + latin-ext only: Bangers (comic display), Comic Neue (comic body), Permanent Marker,
  Patrick Hand (handwriting), Barlow, Barlow Condensed, Oswald, Anton (signage/condensed), Courier Prime,
  Special Elite (typewriter). System fallbacks: DejaVu Sans/Serif, Liberation, FreeSerif (have subscripts ₂ ⁻ ⇌ etc.).
  Subscript/superscript glyphs (₂ ⁺ ⁻) may fall back to DejaVu — check they look OK, or draw them yourself.
- `vendor/three.module.min.js` + `vendor/three-addons/` (three r169), `vendor/rough.js` (hand-drawn, global `rough`),
  `vendor/d3.min.js` (global `d3`), `vendor/gsap.min.js` (global `gsap`).

## Instagram layout rules
- **Safe area for anything the viewer must read:** x 64–1016, y 230–1580. Reels UI covers the top ~230 px, the bottom
  ~340 px and a right-hand button column (x > 960, y > 1100). Backgrounds/decoration may bleed to the edges.
- Profile grid shows a centred 1080×1440 crop (y 240–1680): the hook title and the poster frame should read inside it.
- Show the handle `@natebrooksendo` small and unobtrusive, in a style that fits (Kit.handle or your own).

## Legibility & pacing (viewers are on phones, no sound)
- Minimum sizes at 1080 px width: anything the viewer must read **≥ 30 px**; captions/body ≥ 36 px; title ≥ 60 px.
  Citations / fine print may be 22–26 px. High contrast.
- Short text: a caption ≤ ~12 words. Each caption must stay fully visible for at least `Kit.readSecs(text)` seconds.
- Structure: **hook** readable within the first 1 s (title/question), **build** (the mechanism, shown not told),
  **payoff** (one clear takeaway) held ≥ 2.5 s at the end. Ideally the last frame loops back into the first gracefully.
- Motion: purposeful and smooth (eased), nothing jittery, no flashing. One focal point at a time.

## Scientific accuracy (non-negotiable — this posts under a clinician's name)
- Research the topic (PubMed tools are available: load them with ToolSearch `select:mcp__PubMed__search_articles,mcp__PubMed__get_article_metadata,mcp__PubMed__lookup_article_by_citation`).
- Every number and causal claim on screen must be supportable; record each with its source in `NOTES.md`.
- When values are modelled, schematic or exaggerated for visibility, say so on screen in small text
  (e.g. "schematic", "not to scale", "toy model", "values illustrative").
- Prefer conservative wording over dramatic overstatement; note real controversy where it exists.
- Optional small on-screen source line (e.g. "Reeh et al., J Endod 1989").
- Original artwork only (no copyrighted characters, logos, or recreations of others' videos).

## Tools
```
node reels/tools/render.cjs stills reels/samples/NN-slug [--n 8] [--times 0.5,4,12] [--safe] [--out reels/samples/NN-slug/_stills/mine]
   -> reels/samples/NN-slug/_stills/f_XX.jpg (full res) + _stills/sheet.jpg (labelled grid). Prints errors.
   (--out writes elsewhere: use it if someone else may be rendering stills of the same sample at the same time.)
node reels/tools/render.cjs video reels/samples/NN-slug
   -> reels/out/NN-slug.mp4 + reels/out/NN-slug.jpg (poster)
```
Look at the sheet and at full-resolution stills (Read tool shows images) — check text overflow, overlaps,
clipping, legibility, safe area (`--safe` overlays red no-go zones and the cyan 3:4 grid crop), and that the
story reads with no sound. Iterate until it is genuinely good. Do not git commit (the orchestrator commits).

## meta.json (gallery + caption)
```json
{
  "id": "21", "slug": "21-example",
  "title": "Short human title (<= 48 chars)",
  "style": "Style name (2-4 words)",
  "topic": "One sentence (<= 140 chars): what the viewer learns",
  "duration": 21.0,
  "claims": [ { "claim": "on-screen claim, concise", "source": "Author et al., Journal Year;vol:pages (PMID n)" } ],
  "caption": "Ready-to-paste Instagram caption, 300-700 chars: one-line hook, 2-4 short lines with the clinician-level nuance, a 'Refs:' line (Author Year, Journal) covering every claim the caption makes, a 'schematic animation' note if applicable, 5-8 hashtags."
}
```
4-10 claims, in on-screen order, matching what is on screen NOW. Toy-model items say "Toy model / schematic: ...".

## Lessons from the first 20 reels (follow these)
- **Less text.** The first set ran long (22-30 s) and text-heavy because every hedge was put on screen. Budget: aim for
  <= ~60 must-read words in the whole reel and 15-25 s. Show the mechanism; write only what the picture cannot say.
  Put the nuance, the study details and the full reference list in `meta.json` caption and NOTES.md. On screen keep
  one honest qualifier where needed ("in vitro", "schematic", "pooled estimate") and at most ONE small source line
  per scene (first author + year + journal abbreviation, 24-26 px).
- **Must-read text >= 30 px always** (labels inside diagrams included). If it does not fit at 30 px, cut words.
- **Never state a number without its source and its denominator/criteria** (e.g. "strict criteria", "2-10 yr",
  "teeth with apical periodontitis"). A clinician will quote these numbers.
- **Cite precisely.** Reviewers found wrong first authors, wrong years, papers attached to claims they do not make,
  and claims supported only by full text nobody had read. Only cite what you verified on PubMed (abstract or full
  text) and say which. A textbook is cited as a textbook.
- **Do not present a toy model as a measurement.** If a simulated field shows values, tune them to published
  measurements or remove the scale; label "toy model" inside the safe area whenever it is on screen.
- **Keep clear of the right-hand button column** (x > 960, y > 1100) and the bottom 340 px, including fine print.
- **Loop cleanly**: fade text out before the loop crossfade so two texts never ghost over each other.
- **Fonts**: only the first use of a weight/subset triggers a lazy load; the renderer now warms these up, but list
  every font/weight you use in `REEL.fonts` anyway.
- **American spelling** on screen and in captions: dentin, anesthesia, gray, color (the account is US-based).
- **Shared machine etiquette**: always pass `--out reels/samples/NN-slug/_stills/<name>` to the stills tool; write
  scratch files only in your own `_scratch/`; never touch another sample or the shared scratchpad.

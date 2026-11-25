# Generative AI for Video, Image and 3D Visuals in Scientific/Medical Explainers (state as of 2026-11-25)

Context: these notes inform a 90-second vertical (9:16) explainer on placebo in endodontics. The video must show molar anatomy (roots, canals, pulp, periapical tissues), a mu-opioid receptor (MOR) and naloxone mechanism, and dental-chair scenes, all scientifically accurate. Research date: 2026-11-25. Versions and prices move monthly; anything marked "unverified" should be rechecked before production.

Method note: Some evidence comes from the ElevenLabs Creative MCP connector attached to this session. That includes the model roster exposed in the tool schema, model prompting guides, and `estimate_only` cost quotes run on 2026-11-25 in the user's ElevenLabs workspace. These are cited as "ElevenLabs MCP (this workspace, 2026-11-25)" and have no public URL. The estimate calls charged no credits, but they created one flow canvas (ID `wOa6Z783Ue2QttvcQMuJ`) in the user's ElevenLabs account.

---

## 1. Text-to-video and image-to-video models current in 2026: versions, length, resolution, 9:16, audio, controllability, pricing, and 2026 releases

### Takeaway
By late 2026 the frontier is crowded and turns over quickly. The leaders are Alibaba Wan 3.0 (closed weights, 30 s), MiniMax H3, ByteDance Seedance 2.5, Google Gemini Omni Flash 1.2 (which replaced Veo in Google's consumer apps; Veo 3.1 is still the API workhorse and there is no Veo 4), Kling 3.0/4.0, FLUX 3 and Runway Gen-4.5. OpenAI's Sora was shut down in 2026. Almost all leading models now support 9:16, native audio, first/last-frame control and reference images. Single-shot clips run from 8 s (Veo 3.1) to 30 s (Wan 3.0, Seedance 2.5, Kling 4.0). Real per-second cost ranges from about $0.07 to about $0.57.

### Cited Findings

**Leaderboard snapshot**
- Artificial Analysis AA-Video-T2V v2.1 (with audio; page undated, fetched 2026-11-25) top 20 by Elo:
  1. Wan 3.0 (Alibaba, Aug 2026): 1175, $12.00/min
  2. Utopai X: 1173, no API
  3. MiniMax H3 (768p, Jul 2026): 1164, $4.80/min
  4. Hyperflow H3: 1156
  5. Dreamina Seedance 2.5 (Jul 2026): 1154, $34.12/min
  6. Gemini Omni Flash 1.2 (Nov 2026): 1152, $6.26/min
  7. MAGI-2 (Sand.ai, Nov 2026): 1150
  8. FLUX 3 Max (Oct 2026): 1150, $8.70/min
  9. HeyGen Video 1 (Oct 2026): 1150, $2.40/min
  10. MiniMax H3 Max: 1145
  11. FLUX 3: 1138
  12. SkyReels V4: 1136
  13. Seedance 2.0 (Mar 2026): 1135, $22.45/min
  14. Pruna P-Video-2-Pro
  15. Gemini Omni Flash 1.1: 1124
  16. Pika H3 Flex (Oct 2026): 1123, $2.10/min
  17. Seedance 2.5 Flash
  18. Agnes-Video-2.5
  19. Grok Imagine Video 1.5 (May 2026): 1051
  20. HappyHorse-1.1

  Confidence intervals are about ±12–16 Elo, so adjacent ranks overlap. Kling, Veo 3.1, Runway and Luma do not appear in this top 20. — [Artificial Analysis T2V leaderboard](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- Image-to-video board: MAGI-2 leads (Elo 1164), ahead of Seedance 2.5 (1160). — [AA I2V leaderboard](https://artificialanalysis.ai/video/leaderboard/image-to-video)
- Other arenas disagree. llm-stats (updated 2026-11-25) ranks Kling v3 first on its own text-to-video board, and Arena's Video Edit board (2026-11-10) puts Wan 3.0 first. These scores are not comparable to AA Elo. — [llm-stats](https://llm-stats.com/leaderboards/best-ai-for-video-creation); [Arena video edit](https://arena.ai/leaderboard/video/video-edit)

**Google: Veo 3.1 / Gemini Omni**
- No Veo 4 has been released. As of October 2026, Google's DeepMind Veo page still names Veo 3.1 as the latest Veo. Treat a Seedance30 blog claiming an April 2026 Veo 4 launch as unreliable. — [VEED](https://www.veed.io/learn/veo-4-release); [aireiter (Aug 2026)](https://aireiter.com/blog/veo-4)
- Google I/O (2026-05-19) launched Gemini Omni Flash, "the first model in the Omni family," in the Gemini app, Flow and YouTube Shorts, with API access to follow. — [Google I/O 2026 keynote](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/); [100 things announced at I/O 2026](https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/)
- Secondary coverage says Google's help text calls Omni the successor to Veo in the Gemini app, while developers on the Gemini API and Vertex are still pointed to Veo 3.1. — [apiyi analysis](https://help.apiyi.com/en/will-gemini-omni-replace-veo-analysis-en.html); [Cinevva](https://app.cinevva.com/news/2026-05-19-google-io-gemini-omni)
- Gemini Omni 1.1 Flash (2026-08-27) added scene extension (in 10 s steps up to 40 s total), first/last-frame control and 4K upscaling. — [Google blog: Omni 1.1 Flash](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/)
- Gemini Omni 1.2 Flash (GA 2026-11-05):
  - Duration 3–15 s in 1 s steps.
  - Drafts at 360p/720p, upscaling to 1080p/4K.
  - First/last keyframe interpolation, clip extension, and reference images (character/product/style), short motion clips (≤3 s) and audio cues.
  - Multi-turn conversational editing, including changing aspect ratio.
  - Google claims faces, garments, packaging typography and brand colours stay consistent across camera angles.
  - $0.07/s at 720p, 30% below 1.1. Outputs carry a SynthID watermark.
  - Available in Gemini API/AI Studio, Google Cloud, Flow, Google Vids (free) and the Gemini app (Ultra).

  — [Google blog: Omni 1.2 Flash](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemini-omni-1-2-flash/); [Google Cloud blog](https://cloud.google.com/blog/products/ai-machine-learning/gemini-omni-1-2-flash-generally-available)
- Gemini API pricing for Omni 1.2 Flash: about $0.023/s at 360p, $0.07/s at 720p, $0.104/s at 1080p (upsampled), $0.209/s at 4K (upsampled). Omni 1.1 Flash costs about $0.10/s and will route to 1.2 on 2026-12-03. — [Google AI Studio pricing](https://aistudio.google.com/docs/pricing)
- Veo 3.1 specs as exposed on ElevenLabs:
  - Clip lengths 4, 6 or 8 s; 720p or 1080p; aspect ratios 16:9 and 9:16.
  - Integrated dialogue and sound effects; start/end frame; reference images ("ingredients"); negative prompts.
  - Variants: Fast, and Lite (720p, text plus start frame only).

  — [ElevenLabs Image & Video docs](https://elevenlabs.io/docs/product-guides/playground/image-video). The ElevenLabs Veo guide adds timed beat-sheet prompting ([00:00–00:02]…), object add/remove and video extension. — ElevenLabs MCP model guide (this workspace, 2026-11-25)

**OpenAI: Sora**
- OpenAI announced on 2026-03-24 that it was discontinuing Sora. The app and web shut on 2026-04-26 and the API (sora-2, sora-2-pro) was scheduled to shut on 2026-09-24. OpenAI cited compute priorities. — [Axios](https://www.axios.com/2026/03/24/openai-discontinue-sora-video-app); [The Decoder](https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/); [OpenAI Help](https://help.openai.com/en/articles/20001152)
- Secondary sites report the API was removed on schedule on 2026-09-24. OpenAI's own page uses future tense, so post-shutdown confirmation is secondary only. — [pasqualepillitteri.it](https://pasqualepillitteri.it/en/news/18764/openai-sora2-api-dismessa-en)
- ChatGPT image generation was not affected. — [Axios](https://www.axios.com/2026/03/24/openai-discontinue-sora-video-app)

**Kuaishou: Kling**
- Kling 3.0 released 2026-02-04 ([invideo guide](https://invideo.io/blog/kling-3-0-complete-guide/)). Kling's own guide (dated 2026-06-26) describes:
  - 3–15 s clips with native audio in a single pass, covering dialogue, ambient sound and sound effects.
  - Lip-sync in English, Chinese, Japanese, Korean and Spanish.
  - Up to 6 camera cuts per generation (multi-shot "AI Director").
  - Start/end frames, multi-image and video element references, and "Character Identity 3.0" (built from a 3–8 s reference video).

  — [Kling blog](https://kling.ai/blog/kling-video-3-omni-multi-shot-native-audio-guide)
- ElevenLabs lists Kling 3.0 and O3 at 3–15 s, 1080p, in 16:9/1:1/9:16. All Kling models are unavailable in the US on ElevenLabs. — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video)
- Kling 4.0 launched 2026-10-15 (announced 2026-10-19). It generates up to 30 s in a single pass. "Omni Reference" supports up to 15 reference assets and 10 keyframe inputs. Kuaishou claims better large-motion stability and complex camera moves. Enterprise API and pricing were reported as forthcoming. — [Bernama press release](https://bernama.com/en/press/news.php?id=2622471); [Magica](https://magica.com/news/kuaishou-kling-4-global-launch-professional-video)
- One aggregator lists Kling 4.0 at 53 credits/s at 720p and 79 credits/s at 1080p on Luma's platform. — search summary of [Luma pricing](https://lumalabs.ai/pricing) (not directly verified)

**Runway**
- Gen-4.5 was announced 2025-12-01 and ranked #1 on AA T2V at launch (1,247 Elo). — [Runway research](https://runway.com/research/introducing-runway-gen-4.5); [The Decoder](https://the-decoder.com/runways-gen-4-5-edges-past-google-and-openai-in-text-to-video-benchmark/)
- Via API it produces 720p clips of 2–10 s in 16:9 or 9:16 at $0.12/s. — [OpenRouter Gen-4.5](https://openrouter.ai/runway/gen-4.5)
- ElevenLabs lists Runway Gen-4 Turbo (silent, 2–10 s), Aleph 2.0 (editing, 2–30 s), Act-Two (performance transfer) and Ruby (SDR→HDR). — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video)
- No "Gen-5" was found.

**Luma**
- Ray3.14 (Jan 2026): native 1080p, 4× faster, 3× cheaper per second. — [Business Wire](https://www.businesswire.com/news/home/20260126744711/en)
- Ray3.2 (2026-06-09): up to 20 s at 1080p, with the full control surface available via API. — [Luma news](https://lumalabs.ai/news/introducing-ray-3-2)
- No Ray 4 was found.

**MiniMax (Hailuo) H3**
- Released about 2026-07-30/31: up to 15 s at 2K with synchronized stereo audio; inputs are text, image, video and audio; $0.13/s on OpenRouter. — [eWeek](https://www.eweek.com/news/minimax-h3-2k-ai-video-open-weights/); [OpenRouter](https://openrouter.ai/minimax/hailuo-3)
- Open weights were promised; whether all components were published is disputed. — [NYU RITS](https://rits.shanghai.nyu.edu/ai/minimax-releases-h3-2k-video-with-native-audio-open-weights-promised/); [Programming Insider](https://programminginsider.com/minimax-h3-open-weight-release-gives-developers-a-33-billion-parameter-video-model-with-full-api-access/)
- On ElevenLabs: H3 runs 5–15 s at 480p/768p, with 2K/4K upscaled from 768p, in 6 aspect ratios, and takes 9 image + 3 video + 3 audio references. — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video)

**ByteDance Seedance**
- Seedance 2.0 launched 2026-02-12. It generates 4–15 s multi-shot audio-video and accepts text, image, audio and video inputs (up to 9 images, 3 videos and 3 audio clips). — [ByteDance Seed blog](https://seed.bytedance.com/en/blog/official-launch-of-seedance-2-0); [Seedance 2.0 tech report](https://arxiv.org/pdf/2604.14148); [NYU RITS](https://rits.shanghai.nyu.edu/ai/seedance-2-0-bytedances-multimodal-audio-video-ai-model/)
- Seedance 2.5 (Jul/Aug 2026) extends clips to 30 s and enlarges the reference budget. — [Artlist one-pager](https://help.artlist.io/hc/en-us/articles/37430797266973-Seedance-2-0-Family)
- ElevenLabs lists Seedance 2.5 at 4–30 s, 480p/720p, in aspect ratios 21:9/16:9/4:3/1:1/3:4/9:16, with up to 30 image, 10 video and 10 audio references, plus Edit and Extend variants. Seedance 2.0 is "not available in US", but 2.5 has US-hosted variants. — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video); ElevenLabs MCP model guide (this workspace)
- ElevenLabs' Seedance guide says the model handles hand-object contact well and that negative prompts work. It warns to "use one continuous action per clip. Multi-beat narratives drift." — ElevenLabs MCP model guide (this workspace, 2026-11-25)

**Alibaba Wan**
- Wan 3.0 entered public beta about 2026-08-06 (GA later in August). It generates up to 30 s per pass, up from 15 s in Wan 2.7, from text, images or documents.
- Its weights are closed, a break from Alibaba's earlier open releases. The last open-weight flagship is Wan 2.2 (Apache 2.0, 2025). One report cites a starting price of about $0.05/s.

  — [The Decoder](https://the-decoder.com/alibabas-wan3-0-generates-ai-videos-up-to-30-seconds-long-from-text-images-and-documents/); [Alibaba Cloud GA blog](https://www.alibabacloud.com/blog/wan3-0-at-general-availability-capabilities-benchmarks-pricing-and-the-workflows-it-changes_603505); [TNW](https://thenextweb.com/news/alibaba-wan3-video-model-after-share-sale)
- On ElevenLabs, Wan 3.0 runs 5–30 s at up to 1080p with start/end frame and 10 image + 5 video + 5 audio references. It is not available in the US. — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video)

**Open-weight models**
- Lightricks LTX-2: 19B parameters, joint audio+video, up to about 20 s at 4K/50 fps. Announced Oct 2025, weights released about Jan 2026. Sources disagree on the license (Apache 2.0 vs an LTX-2 Community License). LTX-2.3 (22B, open weights) followed in March 2026. — [LTX blog](https://ltx.io/blog/ltx-2-is-now-open-source); [arXiv LTX-2](https://arxiv.org/html/2601.03233); [MindStudio LTX-2.3](https://www.mindstudio.ai/models/ltx-2-3)
- On ElevenLabs, LTX 2 Pro/Fast are listed as 16:9 only. That rules them out for native 9:16 there. — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video)
- Tencent HunyuanVideo 1.5: 8.3B parameters, runs on about 14 GB VRAM, does T2V and I2V, released Nov/Dec 2025 under the Tencent Hunyuan Community License (not OSI-approved). No 2.0 was found. — [Hugging Face](https://huggingface.co/tencent/HunyuanVideo-1.5); [arXiv](https://arxiv.org/html/2511.18870v2); [OSAI index](https://osai-index.eu/model/hunyuanvideo)

**Other 2026 entrants**
- FLUX 3 (Black Forest Labs, 2026-07-23): multimodal image/video/audio, video up to 20 s with audio, initially gated early access. — [VentureBeat](https://venturebeat.com/technology/black-forest-labs-launches-flux-3-capable-of-generating-images-and-20-second-video-with-audio-but-in-limited-release-to-start); [Decrypt](https://decrypt.co/374189)
- Pika:
  - Pika 2.5 rolled out to the app in about Jan 2026. — [awesomeagents](https://awesomeagents.ai/models/pika-2-5/)
  - "Pika H3 Flex" (Oct 2026) appears on the AA leaderboard. An aggregator describes it as post-trained on MiniMax H3; this is unconfirmed by Pika. — [AA](https://artificialanalysis.ai/video/leaderboard/text-to-video); [llmreference](https://www.llmreference.com/model/pika-h3-flex)
  - Pika launched a new creative platform on 2026-09-17. — [Semafor](https://www.semafor.com/article/09/17/2026/video-ai-company-pika-offers-tool-to-speed-up-ai-video-creation)

**Releases in 2026 (summary of the above)**

| Month | Release |
|---|---|
| Jan | LTX-2 weights; Luma Ray3.14; Pika 2.5 |
| Feb | Kling 3.0; Seedance 2.0 |
| Mar | Sora shutdown announced; LTX-2.3; Wan 2.6 (API) |
| May | Gemini Omni Flash |
| Jun | Luma Ray3.2 |
| Jul | FLUX 3; MiniMax H3; Seedance 2.5 |
| Aug | Wan 3.0; Omni 1.1 Flash |
| Oct | Kling 4.0; Pika H3 Flex; HeyGen Video 1 |
| Nov | Omni 1.2 Flash; MAGI-2; HeyGen Avatar 6 |

Sources: the citations above.

### Inferences
- For a 9:16 explainer, every flagship except LTX-2 on ElevenLabs offers native vertical output. Clip length is no longer the constraint, because 8–30 s single shots cover any 90-second edit's scene lengths. The constraints are accuracy and shot-to-shot consistency (see Q2).
- Veo 3.1's 8 s cap and its lower physics scores (Q2) make it a weaker choice than Seedance 2.5 or Omni 1.2 for multi-beat dental-chair scenes. Omni 1.2's multi-turn editing ("keep everything the same, change X") is the most useful control for correcting an anatomical error without regenerating the whole shot.
- Do not plan on Sora. Any 2025-era tutorial built on Sora is obsolete.

### Gaps
- Veo 3.1 per-second API price for late 2026: the Google AI Studio pricing page was truncated before the Veo section.
- Kling 4.0's resolution, aspect ratios and API pricing: the official press release omits them.
- Whether Wan 3.0 or MiniMax H3 weights are fully downloadable today: sources conflict.
- AA leaderboard snapshot date (the page is undated). Kling 4.0, Veo 3.1 and Runway Gen-4.5 positions on the current AA board were not visible in the top 20, and it is unclear whether they were benchmarked.

---

## 2. Where these models fail on science and anatomy (teeth, hands, molecules, text and labels, physics, consistency), and the studies that measure it

### Takeaway
Peer-reviewed and preprint evidence is consistent: current generators produce plausible but wrong anatomy and clinical action, invent or garble text, and break physics, even as visual quality improves. Correct, structure-level anatomy is the exception. The best model in a 2026 anatomy study was fully correct on only 37% of structures, and the best video model in a 2026 medical-teaching benchmark reached 28% strict clinical success. Teeth and mouths are a known weak spot. No study was found that evaluates AI-generated root-canal or pulp anatomy specifically.

### Cited Findings

**Anatomy in image generation (peer-reviewed)**
- Strugała et al. tested 6 generators (DALL-E, Gemini, Freepik, Midjourney, DeepAI, Canva) on 12 structures, 144 images, against Terminologia Anatomica. The best model, DALL-E, had structures "present" in only 56.7% of entries and physiologically correct in 66.0% of those. Fully correct entries peaked at 37.4%. Complex structures (lumbar plexus, celiac trunk) were worst. The authors conclude expert verification is necessary. — Clin Anat 2026, [DOI 10.1002/ca.70189](https://doi.org/10.1002/ca.70189) (PubMed 42478089)
- Haider et al. tested Midjourney v6, DALL-E 3, Gemini Ultra 1.0 and Stable Diffusion 2.0 (736 craniofacial images). All models showed "significant flaws" in foramina, suture lines, muscle origins/insertions and neurovascular structures, plus "mixing of layers… abnormal muscle arrangements, and labeling errors." — J Clin Med 2025, [DOI 10.3390/jcm14072136](https://doi.org/10.3390/jcm14072136) (PubMed 40217587)
- In a 2026 dental study simulating impacted third-molar extraction, generated panoramic images "appeared visually realistic but initially exhibited inaccurate tooth positioning." Iterative prompting improved the panoramics but not the intraoperative images. Image outputs "may not provide sufficient anatomical accuracy for reliable use." — J Stomatol Oral Maxillofac Surg 2026, [DOI 10.1016/j.jormas.2026.102863](https://doi.org/10.1016/j.jormas.2026.102863) (PubMed 42229722)
- In a bias study, 9,060 patient images from Firefly, Bing, Meta Imagine and Midjourney misrepresented sex, age and race/ethnicity relative to real epidemiology, and over-represented White, normal-weight people. — npj Digit Med 2025, [DOI 10.1038/s41746-025-01817-6](https://doi.org/10.1038/s41746-025-01817-6) (PubMed 40683994)
- AI-generated orthodontic smiles were rated far more attractive than real outcomes (VAS 78.8 vs 37.9). Dentists detected them poorly: sensitivity under 50%, overall accuracy 62.6%. This means AI dental imagery can mislead even professionals. — Sci Rep 2026, [DOI 10.1038/s41598-026-41744-4](https://doi.org/10.1038/s41598-026-41744-4) (PubMed 41865052)
- Multimodal LLMs used to identify bone anatomy reached at most 44.75% accuracy (ChatGPT-4o), with slight-to-fair agreement between models. "Lack the reliability required for anatomy education." This matters because LLMs are often used to write or check image prompts. — Clin Anat 2026, [DOI 10.1002/ca.70104](https://doi.org/10.1002/ca.70104) (PubMed 41761446)

**Medical video generation**
- REMEDY benchmark (arXiv 2609.32460, 2026-09-26): 900 real first frames across 12 clinical tasks (operating room, imaging, clinic/bedside, resuscitation), 4,500 videos from Wan2.2-5B, LTX-Video-2B, LTX-2.3, LTX-2.5 and MiniMax-H3.
  - The best model, MiniMax-H3, achieved 28.25% strict clinical success. Operating-room and imaging scenarios stayed below 15%.
  - LTX models scored above 90 on technical continuity, but this "did not translate into clinical correctness."
  - Failure taxonomy: action omission, anatomical distortion, procedure interruption, tool–tissue interaction failure, temporal ghosting, camera-instruction violation.
  - The authors state outputs should not be used for instruction without qualified clinical review.

  — [REMEDY arXiv](https://arxiv.org/html/2609.32460)
- REMEDY's related work notes that MedGen authors report general-purpose generators produce anatomical and instrument errors. — [REMEDY arXiv](https://arxiv.org/html/2609.32460)

**Physics**
- AV-Phys Bench (arXiv 2605.07061, 2026-05-08), human-rated physical-commonsense pass rates:

  | Model | Pass rate |
  |---|---|
  | Seedance 2.0 | 0.660 |
  | Kling 3.0 Omni | 0.343 |
  | Veo 3.1 Fast | 0.216 |
  | LTX-2.3 | 0.097 |
  | Ovi 1.1, JavisDiT++, MagiHuman | ≈0 |

  - Semantic adherence far exceeds physical correctness for every model (e.g., Veo 3.1 at 0.795 vs 0.216).
  - "Event transitions" are hardest.
  - Audio physics is weak; Veo 3.1 gave a small dog a large dog's bark.

  — [arXiv 2605.07061](https://arxiv.org/html/2605.07061v1)
- Seedance's own technical report concedes physical laws "remain difficult for every model." — [Seedance 2.0 tech report](https://arxiv.org/pdf/2604.14148)
- Physics-IQ Verified authors report visual quality and physical understanding are "largely uncorrelated." — via [K2V arXiv 2611.17324](https://arxiv.org/pdf/2611.17324)

**Text and labels in video**
- VTR-Bench (arXiv 2610.01499, 2026-10-01) tested 11 video models on 300 prompts, including scientific-video scenarios. It reports "widespread difficulties"; the best model's word error rate was 0.250 (roughly 1 word in 4 wrong). — [arXiv abs](https://arxiv.org/abs/2610.01499)
- In image-conditioned video, 36–54% of peripheral text regions were fabricated (no counterpart in the reference), even when prompts forbade new text, versus 1.6% for a control. Fabricated text is often legible-looking gibberish that standard metrics such as VBench-I2V miss. — [arXiv 2611.00079](https://arxiv.org/abs/2611.00079) (2026-10-18)

**Molecules**
- In a Duke instructor's test (2026-02-10) animating aspirin assembly:
  - ChatGPT start frames had wrong atom counts that persisted after correction.
  - Nano Banana produced a correct start frame.
  - Luma animation added unprompted colour changes and appearing/disappearing molecules, and text morphed.
  - Veo 3.1 in Flow added "excessive motion and stylistic interpretation."
  - Conclusion: AI video is "poorly suited for precise academic reinforcement."

  — [Duke DDMC "Molecular Mess"](https://sites.duke.edu/ddmc/2026/02/10/molecular-mess/); [Part II](https://sites.duke.edu/ddmc/2026/02/13/molecular-mess-part-ii-different-not-better/)

**Teeth and mouths**
- Teeth are a recognized failure point in AI talking-head and video generation; Gizmodo described Microsoft VASA-1's "cartoon-like" teeth. — [Gizmodo](https://gizmodo.com/weird-teeth-fake-microsoft-vasa-1-ai-free-video-creator-1851420514)
- Practitioner guides list too many teeth, uneven gum lines, overly uniform or white teeth, and tooth count or shape shifting as the mouth moves. Lips often fail to close on plosives (b/p). These are informal observations, not benchmarks. — [CapCut guide](https://www.capcut.com/create/ai-generated-faces-realism-bias-artifacts); [sync.so](https://sync.so/blog/why-ai-lip-sync-looks-fake); [Lilach Bullock](https://www.lilachbullock.com/why-ai-generated-videos-look-sound-off/)

**Expert practitioners**
- In a VIS 2025 interview study of 17 biomedical-visualization practitioners ("It looks sexy but it's wrong"), the authors argue that "the underlying architecture of these tools fundamentally limits the accuracy and trustworthiness of the depicted information." — [Ziman, Saharan, McGill, Garrison, arXiv 2507.14494](https://arxiv.org/abs/2507.14494v2); [The Register](https://www.theregister.com/2025/07/27/biomedviz_ai_wrong_problems/)
- Medical animation studios report confident-looking scientific hallucinations that make art-direction feedback "essentially impossible" to apply consistently. — [AXS Studio](https://axs3d.com/is-generative-ai-ready-for-medical-and-scientific-communications/)
- Tools may place "a vessel, muscle, organ, or tissue layer" incorrectly while looking convincing. — [VOKA](https://voka.io/?p=15477)

### Inferences
- Dental-specific risks to expect: wrong root number or morphology for a mandibular first molar (typically 2 roots, mesial and distal), canals that do not connect to the pulp chamber, pulp horns in the wrong place, periapical lesions floating off the apex, enamel/dentin layering mixed up (Haider's "mixing of layers"), and extra or morphing teeth in patient close-ups. Each must be checked frame by frame, because temporal ghosting means a correct first frame does not guarantee a correct frame 120.
- Any on-screen label, receptor name or drug name generated inside a video clip should be assumed wrong (WER of about 25% at best). Add all text in post as motion graphics.
- Dental-chair establishing shots (clinician, patient, operatory) are the lowest-risk use. Intraoral procedural close-ups (files in canals, rubber dam, instruments touching tissue) fall into REMEDY's worst categories: tool–tissue interaction and operating-room scenes under 15% success.

### Gaps
- No peer-reviewed study was found that evaluates AI-generated video or images of root-canal, pulp or periapical anatomy specifically, or of receptor–ligand animations.
- REMEDY tested only open-weight models. No equivalent clinical benchmark covers Veo, Omni, Kling 4.0 or Seedance 2.5.
- The JMIR and REMEDY-type evaluations may already be outdated by Nov 2026 model releases.

---

## 3. Image generation for scientific illustration in 2026: Nano Banana, GPT Image, FLUX, Midjourney, Ideogram, and others

### Takeaway
2026 image models have largely fixed spelling of short labels; the "reasoning" models Nano Banana Pro/2/2.1 and GPT Image 2 lead. They still omit required labels, mis-annotate details and hallucinate plausible science. They are suitable for style frames and start/end keyframes that feed video models, but every label and structure needs expert review. Text should be overlaid as vector type in post wherever possible.

### Cited Findings

**Google Nano Banana family**
- Nano Banana 2 (Gemini 3.1 Flash Image), released 2026-02-26:
  - Pro-tier features at Flash speed.
  - Subject consistency for up to 5 characters and fidelity for 14 objects.
  - Uses Gemini world knowledge and real-time web information.
  - Improved text rendering.
  - SynthID plus C2PA Content Credentials.
  - Default image model in the Gemini app and Flow.

  — [Google blog](https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/); [Tom's Guide](https://www.tomsguide.com/ai/ai-image-video/googles-nano-banana-2-fixes-blurry-text-and-boosts-speed-heres-everything-included-in-this-massive-upgrade)
- Coverage describes Nano Banana Pro (Gemini 3 Pro Image, Nov 2025) as the choice "for high-fidelity tasks requiring maximum factual accuracy." — [Engadget](https://www.engadget.com/ai/googles-nano-banana-2-is-a-faster-version-of-nano-banana-pro-160000695.html)
- Gemini API per-image prices:

  | Model | 1K | 2K | 4K |
  |---|---|---|---|
  | Nano Banana 2.1 (`gemini-nano-banana-2.1`) | $0.0336 | $0.0504 | $0.113 |
  | Nano Banana 2 | $0.067 | $0.101 | $0.151 |
  | Nano Banana Pro | $0.134 | $0.134 | $0.24 |

  Batch pricing is about half. Gemini 2.5 Flash Image shuts down 2027-03-15. — [Google AI Studio pricing](https://aistudio.google.com/docs/pricing)
- ElevenLabs describes Nano Banana 2.1 as 4K with aspect ratios from 8:1 to 1:8 and up to 14 references, and Nano Banana Pro as "reasoning-based… Google Search," up to 5 people. — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video)

**OpenAI GPT Image**
- GPT Image 2 (ChatGPT Images 2.0), released 2026-04-21, "reasons before it draws." It targets dense text and non-Latin scripts. OpenAI claims about 99% accuracy on typography benchmarks; this is a vendor claim. — [OpenAI community announcement](https://community.openai.com/t/introducing-gpt-image-2-available-today-in-the-api-and-codex/1379479); [TNW](https://thenextweb.com/news/openai-chatgpt-images-2-0-reasoning-image-generation); [PetaPixel](https://petapixel.com/2026/04/21/openai-claims-chatgpt-images-2-0-can-think/)
- Later "GPT Image 2.5 Sunburst/Flare" and "2.6" variants are exposed on ElevenLabs (1K/2K/4K, up to 10 references). — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video); ElevenLabs MCP roster (this workspace). Official OpenAI release notes for 2.5/2.6 were not found.

**Midjourney, Ideogram, FLUX, Recraft**
- Midjourney V8 entered alpha on 2026-03-17: about 5× faster, native 2K, better prompt following, and text rendering "better than ever (when specified in quotes)." Reviewers say text is "better, but not solved." V8.1/V8.2 iterations exist. — [Midjourney update](https://updates.midjourney.com/v8-alpha/); [The Decoder](https://the-decoder.com/midjourney-v8-rolls-out-with-5x-faster-generation-but-charges-4x-more-for-its-best-features/); [MindStudio](https://www.mindstudio.ai/blog/what-is-midjourney-v8-alpha-strengths-weaknesses)
- Ideogram 4.0 is an open-weight model with native 2K, transparent backgrounds, bounding-box layout control and improved text (release date not confirmed). 4.5/4.6 are listed on ElevenLabs. — [The Decoder](https://the-decoder.com/ideogram-4-0-drops-as-an-open-weight-model-with-native-2k-resolution-and-improved-text-rendering/); ElevenLabs MCP roster
- FLUX 3 Image: multi-step editing "that leaves the rest of your picture alone," 4K, and up to 10 references on ElevenLabs. — [The Decoder](https://the-decoder.com/black-forest-labs-launches-flux-3-image-with-multi-step-editing-that-leaves-the-rest-of-your-picture-alone/); [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video)
- Recraft V4.1 Pro Vector outputs vectors, which is useful for editable SVG labels and diagrams. — ElevenLabs MCP roster (this workspace)

**Accuracy of labels and scientific detail**
- One 2026 blog test found three models (including Nano Banana Pro) spelled all 8 labels on an endocytosis diagram correctly. A SciFig comparison across 10 disciplines found Nano Banana Pro missed a double-dagger and omitted a stereochemistry annotation on an SN2 mechanism. — [SciFig](https://scifig.ai/blog/gpt-image-2-vs-nano-banana-pro-disciplines-tested)
- PaperBanana-Interact found generated diagrams sometimes lacked required labels and arrow labels. — [arXiv 2608.30241](https://arxiv.org/pdf/2608.30241)
- Guides warn the model "may still hallucinate plausible but incorrect details even with Google Search grounding." — [Scholarviz](https://scholarviz.com/blog/nano-banana-pro-complete-model-guide); [IntuitionLabs life-sciences review](https://intuitionlabs.ai/pdfs/gemini-nano-banana-pro-a-technical-review-for-life-sciences.pdf)
- In the Duke test, Nano Banana produced a chemically correct aspirin start frame where ChatGPT failed. — [Duke DDMC](https://sites.duke.edu/ddmc/2026/02/10/molecular-mess/)
- Peer-reviewed anatomy studies (Q2) mostly tested 2024–25 models (DALL-E 3, MJ v6, Gemini Ultra 1.0). The 2026 Clin Anat study's "Gemini" and "DALL-E" versions are unspecified in the abstract. — [Clin Anat 2026](https://doi.org/10.1002/ca.70189)

### Inferences
- Best use for this project: generate stylized, consistent keyframes (a dental operatory, a stylized molar crown exterior, colour palette and style), then pass them to video models as start/end frames or references. Draw cross-sectional anatomy (pulp, canals, PDL, apical foramen) from a verified 3D source rather than from a text-to-image prompt.
- Reasoning image models (Nano Banana Pro/2.1, GPT Image 2.x) are the best bet if labels must be generated. Even so, treat in-image labels as placeholders and re-typeset them in the editor.
- Ask models with good editing (FLUX 3 Image, Nano Banana) to correct specific anatomical errors via local edits instead of re-rolling, because re-rolls re-introduce new errors.

### Gaps
- No independent, quantitative 2026 benchmark of label accuracy on scientific or medical diagrams was found; the evidence is blog tests and vendor claims.
- No dental-anatomy evaluation of Nano Banana Pro/2.1 or GPT Image 2 was found.
- Release dates for Nano Banana 2.1, Ideogram 4.0 and GPT Image 2.5/2.6 are unconfirmed.

---

## 4. AI 3D: text/image-to-3D (Meshy, Tripo, Rodin, Hunyuan3D, TRELLIS), Gaussian splatting including 4D and web viewers, AI-assisted medical 3D, whether an accurate molar with canals is possible, and open anatomical datasets

### Takeaway
General text/image-to-3D generators produce textured outer surfaces. They cannot be trusted to produce internal anatomy such as pulp chambers and canals, and their medical-shape accuracy is poor (Dice ≤0.25 in a 2026 CT/MRI benchmark). An accurate molar with canals should come from segmented micro-CT or CBCT data. Openly licensed sources exist: Zenodo and LMU micro-CT sets, ToothFairy3 CBCT with pulp labels for all 32 teeth, and public-domain NIH 3D models. Animate these conventionally in Blender. Gaussian splatting has mature web viewers, including dynamic 4D ones, but no evidence of medical-explainer use was found.

### Cited Findings

**Generators**
- TRELLIS.2 (Microsoft, released about Dec 2025/Jan 2026) is a 4B-parameter open-source image-to-3D model producing up to 1536³ PBR-textured assets.
  - Code and model are reportedly MIT-licensed.
  - Dependencies nvdiffrast/nvdiffrec carry NVIDIA's research-only license, which matters for commercial use.
  - It needs about 24 GB GPU memory.

  — [TRELLIS.2 project](https://microsoft.github.io/TRELLIS.2); [Hugging Face](https://huggingface.co/microsoft/trellis.2-4b); [CGWorld](https://cgworld.jp/flashnews/01-202601-TRELLIS2.html); [the3dai](https://the3dai.com/best-image-to-3d-ai)
- Hunyuan3D 3.0 (Tencent, Sept 2025) is free to use as a platform, with an open-source "Hunyuan 3D Omni" planned; the open-weights status of 3.0 is unconfirmed. Hunyuan3D 2.1 uses the Tencent Community License. — [Notebookcheck](https://www.notebookcheck.net/Tencent-s-new-Hunyuan-3D-3-0-brings-realistic-AI-model-generation-to-developers-and-creators.1116964.0.html); [Cinevva](https://app.cinevva.com/guides/ai-3d-model-generators)
- Hosted tools: Rodin (Hyper3D) is praised for geometric detail and is the priciest (about $99/mo). Meshy is cited for textures and 3D printing; Tripo for speed and auto-rigging (about $20–24/mo). These are review-site claims, not benchmarks. — [3D AI Studio](https://www.3daistudio.com/3d-generator-ai-comparison-alternatives-guide/best-image-to-3d-tools-2026); [Blender AI](https://blenderai.org/compare/best-image-to-3d-ai)

**Limitations relevant to a molar with canals**
- Rendering-based 3D generation methods "primarily focus on reconstructing the visible external surfaces… while neglecting the internal hidden surfaces" (X-Ray, NeurIPS 2024). — [arXiv 2404.14329](https://arxiv.org/html/2404.14329v2)
- A 2026 benchmark of image-to-3D foundation models (SAM3D, Hunyuan3D-2.1, Direct3D, Hi3DGen, TripoSG) on CT/MRI anatomy found that the best model rarely exceeded Voxel Dice 0.25 or IoU 0.15. Irregular, non-convex structures did worst. — [arXiv 2602.09407](https://arxiv.org/pdf/2602.09407.pdf)

**AI-assisted medical 3D (segmentation, not generation)**
- In a 2026 study, AI-generated 3D models derived from CBCT improved canal assessment:
  - 26 observers, 3,432 evaluations.
  - Root-canal detection rose from 83%→94% (undergraduates) and 88%→99% (postgraduates).
  - Apical foramina detection reached 99%.
  - Assessment time fell from about 100 s to 24–39 s.

  — Clin Oral Investig 2026, [DOI 10.1007/s00784-026-06897-6](https://doi.org/10.1007/s00784-026-06897-6) (PubMed 42096111)
- Deep-learning super-resolution of CBCT trained on paired micro-CT (48 teeth) improved 3D reconstruction of pulp chambers and canals; crown artefacts remain. — J Dent 2026, [DOI 10.1016/j.jdent.2025.106209](https://doi.org/10.1016/j.jdent.2025.106209) (PubMed 41187827)

**Open datasets and models**
- Zenodo ds-uct-002: micro-CT of 4 teeth before and after simulated root-canal treatment (20 µm and 10.5 µm voxels), CC BY 4.0, about 2.5 GB. — [Zenodo 3877625](https://zenodo.org/record/3877625)
- LMU Open Data: micro-CT of 9 human teeth segmented into enamel, dentin, pulp and bone 3D models, CC BY-SA 4.0. — [LMU data.477](https://data.ub.uni-muenchen.de/477/)
- Zenodo ds-uct-003: micro-CT of 5 endodontic files, CC BY 4.0. Useful for accurate instrument models. — [Zenodo 3884270](https://zenodo.org/records/3884270)
- ToothFairy3: 532 CBCT volumes, 77 classes, including "pulpy cavities for all 32 teeth" and incisive/lingual canals. Login required; license not confirmed. ToothFairy2 has 480 volumes and 42 classes; Pulpy3D adds pulp labels. — [ToothFairy3](https://ditto.ing.unimore.it/toothfairy3); [AImageLab](https://ditto.ing.unimore.it/)
- NIH 3D Print Exchange: "Impacted wisdom teeth" from Newtom CBCT (3DPX-000281, Public Domain) and an upper dental arch model (3DPX-003002, Public Domain; GLB/STL/WRL/X3D). These are likely external surfaces without canals (not verified). — [NIH 3DPX-000281](https://3d.nih.gov/entries/3DPX-000281); [NIH 3DPX-003002](https://3d.nih.gov/entries/3DPX-003002)
- Z-Anatomy is CC BY-SA 4.0 and derived from BodyParts3D. BodyParts3D is cited as CC BY-SA 2.1 Japan in older attributions; a 2025 attribution says CC BY 4.0. Some Z-Anatomy components are non-commercial. Tooth detail level was not confirmed. — [Z-Anatomy GitHub](https://github.com/Z-Anatomy/Models-of-human-anatomy); [human-atlas attribution](https://raw.githubusercontent.com/ashemag/human-atlas/master/public/ATTRIBUTION.md)

**Gaussian splatting**
- Spark is described as the state of the art in web-based 3DGS rendering. SuperSplat (PlayCanvas) is a browser editor for cleaning splats. Dynamic (4D) viewers include splaTV (Spacetime Gaussians) and Visionary, a WebGPU platform that plays multiple 3D/4D Gaussian assets in real time. WebSplatter (2026) reports 1.2–4.5× speedups over existing web viewers. — [SplatBus arXiv 2601.15431](https://arxiv.org/html/2601.15431); [splaTV](https://radiancefields.com/splatv-dynamic-gaussian-splatting-viewer); [Visionary arXiv 2512.08478](https://arxiv.org/pdf/2512.08478v1)
- Dental research use: X-Splat uses Gaussian splatting to generate 3D CBCT from a single panoramic radiograph. — [arXiv 2607.02099](https://arxiv.org/pdf/2607.02099)

### Inferences
- An accurate molar with canals for this video can be built like this: take an LMU or Zenodo micro-CT tooth (or a ToothFairy3 segmentation), mesh the enamel, dentin and pulp/canal surfaces, and import them into Blender. A transparent enamel/dentin shell can then show the pulp and canals, with a cutaway to the periapical tissues. Generative 3D tools can at most supply the dental-chair environment, props and stylized non-anatomical assets.
- Licensing: CC BY-SA sources (LMU, Z-Anatomy) impose share-alike on derivatives. CC BY 4.0 (Zenodo) or public domain (NIH) is the easier path for a commercial or social post. Attribution must appear in the description or credits.
- Gaussian splats suit an interactive companion web page (an orbitable molar or operatory), not the 9:16 video itself.

### Gaps
- No direct test of Meshy, Tripo, Rodin, TRELLIS.2 or Hunyuan3D generating a tooth was found.
- The canonical BodyParts3D license and the tooth mesh detail in Z-Anatomy were not confirmed.
- ToothFairy3's license terms were not visible without login.
- No 4D-splat medical or dental explainer examples were found.

---

## 5. Scientific and molecular animation: receptor–ligand binding (MOR PDB 4DKL, 5C1M, 8EF5, naloxone-bound structures), Molecular Nodes, Mol*, ChimeraX, AlphaFold 3, and AI-assisted molecular animation

### Takeaway
Use experimental PDB structures with deterministic tools (Molecular Nodes in Blender, Mol*/MolViewSpec, ChimeraX) rather than generative video for the opioid mechanism. Generative video gets atom counts and bonds wrong. Naloxone-bound human MOR structures now exist (9PXU and related, 2025; 9BJK, 2024), so there is no need to depict "naloxone" using 4DKL. 4DKL is a mouse MOR bound to β-FNA, which is a different, covalent antagonist.

### Cited Findings

**PDB entries** (all queried via the RCSB data API on 2026-11-25)

| Entry | Receptor | Ligand / partners | Method | Release / citation |
|---|---|---|---|---|
| [4DKL](https://www.rcsb.org/structure/4DKL) | Mouse MOR–T4 lysozyme chimera, inactive | Morphinan antagonist (PDB ligand BF0, β-FNA-derived adduct) | X-ray 2.8 Å | 2012; Manglik et al., Nature 2012 |
| [5C1M](https://www.rcsb.org/structure/5C1M) | Mouse MOR, active | Agonist BU72 (VF1) and Nanobody 39 | X-ray 2.07 Å | 2015; Huang et al., Nature 2015 |
| [8EF5](https://www.rcsb.org/structure/8EF5) | Human MOR–Gi1 complex | Fentanyl (7V7); scFv16 | Cryo-EM 3.3 Å | 2022; Zhuang et al., Cell 2022 |
| [8EF6](https://www.rcsb.org/structure/8EF6) | Human MOR–Gi complex | Morphine (same paper) | Cryo-EM 3.2 Å | 2022 |
| [8EFQ](https://www.rcsb.org/structure/8EFQ) | Human MOR–Gi complex | DAMGO (same paper) | Cryo-EM | 2022 |
| [9BJK](https://www.rcsb.org/structure/9BJK) | Mouse MOR, inactive | Naloxone, a negative allosteric modulator, and Nb6 | Cryo-EM 3.26 Å | 2024; O'Brien … Kobilka, Nature 2024 |
| [9PXU](https://www.rcsb.org/structure/9PXU) | Human MOR, inactive | Naloxone + Nb6 | Cryo-EM 3.4 Å | 2025-11-12; Khan … Gati, Nature 2025 |

- The 8EF5 Gi complex contains human Gαi1, rat Gβ1 and bovine Gγ2.
- The 9BJK paper is titled "A mu-opioid receptor modulator that works cooperatively with naloxone."
- The 9PXU paper is titled "Structural snapshots capture nucleotide release at the mu-opioid receptor." Its companion naloxone–MOR–Gi entries are [9PXV](https://www.rcsb.org/structure/9PXV) (nucleotide-free), [9PXW](https://www.rcsb.org/structure/9PXW) (latent), [9PXX](https://www.rcsb.org/structure/9PXX) (unlatched) and [9PXY](https://www.rcsb.org/structure/9PXY) (primed).

**Deterministic animation tools**
- Molecular Nodes (Blender add-on): latest confirmed version 4.5.12 (2026-03-17), requiring Blender 5.1+. It imports structures and MD trajectories and provides Geometry Nodes for selecting, styling and animating molecular data. A 4.5.13 release (2026-08-04) is reported but unconfirmed. — [Blender Extensions](https://extensions.blender.org/add-ons/molecularnodes/versions/); [GitHub releases](https://www.github.com/bradyajohnston/MolecularNodes/releases)
- Mol* MolViewSpec / MolViewStories: ordered snapshots are interpolated into animations. Property interpolation covers colour, opacity, label opacity and clipping planes, with easing; built-in camera "rock" and "spin" are available. MolViewStories adds a JavaScript editor, a Markdown narrative and a CLI. — [MolViewSpec animations](https://molstar.org/mol-view-spec-docs/animations/); [MolViewStories](https://molstar.org/mol-view-stories/docs/)
- ChimeraX has `movie record/encode` and `morph` commands for interpolating between conformations, for example inactive 9PXU to an active Gi-bound structure. — [ChimeraX movie docs](https://www.cgl.ucsf.edu/chimerax/docs/user/commands/movie.html); [ChimeraX morph docs](https://www.cgl.ucsf.edu/chimerax/docs/user/commands/morph.html) (documentation URLs not re-fetched this session)
- AlphaFold 3 predicts complexes including small-molecule ligands. — [Abramson et al., Nature 2024](https://www.nature.com/articles/s41586-024-07487-w)

**AI-assisted molecular animation**
- MIT's MDGen generates molecular-dynamics-like trajectories (not cinematic video). Its accuracy competed with a baseline in about 1 minute versus 3 hours; it is an early proof of concept on clips under 100 ns. — [MIT News](https://www.eecs.mit.edu/toward-video-generative-models-of-the-molecular-world/)
- Practitioners still verify by hand "what a protein is doing, where an interaction occurs." — search summary of [LinkedIn medical animator post](https://ae.linkedin.com/in/zainab-siddiqi) (anecdotal)
- Frame-accurate direction ("specific molecules to move to exact positions and form specific bonds") "is not really how AI video generation works right now." — [Duke DDMC](https://sites.duke.edu/ddmc/2026/02/17/real-human-support-in-an-ai-world-my-experience-with-luma-labs/)

### Inferences
- Recommended mechanism sequence:
  1. MOR in a membrane slab with an agonist pose (8EF5 fentanyl or 8EF6 morphine) bound to Gi.
  2. Naloxone competitively occupying the orthosteric pocket (9PXU, human).
  3. Optionally the naloxone–Gi "latent" snapshots (9PXW and related) for an advanced audience.
- Render in Molecular Nodes for cinematic quality and 9:16 framing, or in ChimeraX for speed. Avoid mixing mouse (4DKL, 5C1M, 9BJK) and human (8EF5, 9PXU) structures without noting the species.
- Use AlphaFold 3 only for complexes with no experimental structure. For MOR–naloxone, experimental structures exist and should be preferred, with a PDB ID caption on screen.
- Generative video may still be acceptable for clearly stylized, non-literal transitions (for example "signal dampening" metaphors), labelled as illustrative.

### Gaps
- The specific mechanistic conclusions of the Khan … Gati Nature 2025 naloxone paper were not read; only the PDB titles were checked. The full paper should be read before scripting naloxone's G-protein effects.
- AlphaFold 3 and AlphaFold Server 2026 updates and licensing terms were not checked.
- Licensing of PDB-derived renders was not checked, but PDB data are generally free to use with citation.

---

## 6. AI avatars and lip-sync (HeyGen, Synthesia, Hedra, Captions and others) in 2026: quality, uncanny-valley risk, and effect on learning and credibility with professional audiences

### Takeaway
Avatar realism jumped in 2026: HeyGen released Avatar V in April and Avatar 6 on Nov 17. Controlled studies (small, short-term, some Synthesia-affiliated) find roughly equal recall versus human presenters but lower engagement. Perceived effectiveness drops when viewers know the presenter is AI. For a professional dental audience, an AI "doctor" avatar risks association with the 2026 wave of deepfake-doctor health scams and with mouth and teeth artifacts. A real clinician on camera, or voice-over with no face, is the safer route to credibility.

### Cited Findings

**Products**
- HeyGen Avatar V was published as a research release on 2026-04-08. — [HeyGen March 2026 release blog](https://www.heygen.com/blog/heygen-march-2026-release); [HeyGen event](https://www.heygen.com/events/introducing-avatar-v-a-live-walkthrough-of-heygens-most-advanced-ai-avatar-model-yet)
- HeyGen Avatar 6 launched 2026-11-17 on the platform and API (heygen-avatar-6 and -6-turbo, 1080p default). HeyGen says it captures appearance, speaking style and movement habits. It reportedly ranked first in an arena that tested only short clips. — search summary of the HeyGen press release and technical report ([HeyGen blog index](https://www.heygen.com/blog/heygen-october-2026-release)); both models are exposed on ElevenLabs (ElevenLabs MCP roster, this workspace)
- HeyGen Video 1 (Oct 2026) is ranked #9 on AA T2V and leads the silent T2V board. — [AA](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- Reviewers report Avatar IV's lip-sync is strong in English but weaker in other languages, and drifts on fast speech and plosives. Synthesia (Express-2) is "reliable rather than best-in-class." Hedra Character-3 animates a still image plus audio and cannot re-lip-sync existing video. These are vendor-adjacent reviews. — [WaveSpeed comparison](https://wavespeed.ai/blog/posts/heygen-vs-synthesia-comparison-2026); [Filmora Hedra review](https://filmora.wondershare.com/video-editor-review/hedra-ai-review.html); [Lemonslice](https://lemonslice.com/i/hedra-ai-alternatives)

**Learning and credibility evidence**
- A UCL study co-authored with Synthesia found no difference in adult learners' recall or recognition between AI-generated and human videos. — [Synthesia blog](https://www.synthesia.io/post/new-ucl-study-shows-the-benefits-of-using-ai-generated-videos-for-adult-learners); [Media & Learning Assoc.](https://media-and-learning.eu/subject/artificial-intelligence/do-ai-avatars-teach-as-well-as-humans-the-results-might-surprise-you/)
- In a SAGE preprint, trainees who believed the spokesperson was an AI avatar rated the training "significantly less effective." When unaware, they did as well as with humans. — [SAGE Advance](https://advance.sagepub.com/doi/full/10.31124/advance.171259583.30407967/v2)
- A JMIR Formative Research 2026 randomized crossover feasibility study compared AI-avatar and human-presented explainers for engineering students; knowledge gains appeared in both arms (details not retrieved). — [JMIR Form Res e90037](https://doi.org/10.2196/90037)
- A review notes lower engagement but comparable performance for AI instructors. — [ResearchGate: Synthetic Educators](https://www.researchgate.net/publication/392376197_Synthetic_Educators_Analyzing_AI-Driven_Avatars_in_Digital_Learning_Environments)

**Credibility risk in health contexts**
- Full Fact found hundreds of deepfaked real experts promoting supplements. Science Feedback documented AI "doctors" on TikTok and French YouTube. A Hallam agency study (commercial, disputed by TikTok) estimated AI content in 40% of top TikTok health videos. — [eWeek](https://www.eweek.com/news/ai-deepfakes-real-doctors/); [Science Feedback](https://science.feedback.org/beware-ai-generated-doctors-health-advice-tiktok/); [TNW](https://thenextweb.com/news/ai-generated-doctors-tiktok-danger)
- Even dentists cannot reliably spot AI dental imagery (sensitivity under 50%). — [Sci Rep 2026](https://doi.org/10.1038/s41598-026-41744-4)

### Inferences
- For a 90 s piece aimed at clinicians, an avatar adds production speed but carries reputational downside: forced AI disclosure (Q9), mouth and teeth artifacts that a dental audience will notice, and association with scam content.
- If a presenter is needed, film the real clinician once and use AI only for re-dubbing or lip-sync (Sync 3, Veed) under the clinician's own consent. Alternatively, use voice-over with no face (ElevenLabs TTS) over anatomical animation.

### Gaps
- No study of AI avatars with dental or medical professional audiences specifically was found.
- The JMIR 2026 full results could not be retrieved.
- Independent benchmarks of Avatar 6, Synthesia's 2026 models or Captions (Mirage) were not found.
- Captions' 2026 product status was not researched.

---

## 7. What the ElevenLabs creative platform offers in 2026 for image and video generation: underlying models, clip lengths, pricing per generation

### Takeaway
ElevenLabs Image & Video / Flows is a multi-model aggregator. It hosts Veo 3.1 (Fast/Lite), Gemini Omni Flash 1.0/1.1/1.2 (1.1 is the Flows default), Seedance 2.0/2.5, Kling 2.5–3.0/O1/O3, Wan 2.5–3.0, MiniMax H3, FLUX 3, Runway Gen-4.5/Aleph 2/Act-Two, LTX-2, HeyGen avatars, several lip-sync models, and image models (Nano Banana family, GPT Image 2.x, Seedream 4–5, FLUX, Ideogram, Recraft, Krea). Sora is not offered. Kling, Wan, Seedream, Seedance 2.0, MiniMax H3 and FLUX 3 are blocked in the US, but Seedance 2.5 has US-hosted variants. Billing is per generation in credits. 2026-11-25 quotes in the user's workspace at default settings: about $3.53 for a Veo 3.1 clip, $3.06 for Seedance 2.5, $0.77 for Omni 1.2 Flash, and $0.22 per Nano Banana Pro image.

### Cited Findings

**Model roster**
- Full video roster with lengths: Seedance 2.0 (4–15 s), 2.5 (4–30 s), Kling 3.0/O3 (3–15 s, 9:16), Veo 3.1 (4/6/8 s, 720p/1080p, 16:9 and 9:16), Omni Flash 1.1 (3–10 s, 360p–4K, extend to 40 s), FLUX 3 (5–20 s), MiniMax H3 (5–15 s), Wan 3.0 (5–30 s), LTX 2 Fast (6–20 s, 16:9 only), Runway Gen-4 Turbo (2–10 s) and Aleph 2.0 (2–30 s).
- Lip-sync: Creatify Aurora, Veed Fabric, HeyGen Avatar 4, Sync 3, Sync Lipsync 2 Pro (to 4K), OmniHuman 1.5, MiniMax H3 Max Lip Sync, Veed Lipsync 2.0.
- Utilities: Topaz upscale, background removal, Runway Ruby HDR.
- Items marked † are not available in the US. This covers all Kling, Wan, Seedream, Seedance 2.0/1.x, MiniMax H3 and FLUX 3 video. Sora is not mentioned.

  — [ElevenLabs Image & Video docs](https://elevenlabs.io/docs/product-guides/playground/image-video)
- The ElevenLabs MCP tool schema in this workspace confirms the US-available set. It also lists Gemini Omni 1.2 Flash (+extend), HeyGen Avatar 6 and 6-turbo, Seedance 2.5 US (+edit/extend), Runway Gen-4.5, and image models gpt-image-2/2.5/2.6, Nano Banana 2.1, Ideogram 4.5/4.6, Krea 3 and Recraft V4.1 Pro Vector. No Kling, Wan or Sora appears. Defaults: video `bytedance-seedance-v2.5`, image `gpt-image-2.5-sunburst`. — ElevenLabs MCP (this workspace, 2026-11-25)
- ElevenLabs' model guide says Seedance 2.5 reaches 4K "rolling out" (fall back to 1080p) and up to 30 s. The docs table lists only 480p/720p, a discrepancy. — ElevenLabs MCP model guide vs [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video)

**Pricing and access**
- Billing is per generation (4 generations cost 4×). Cost depends on model, settings and duration; Veo sound toggles change the cost.
- The free plan allows 3 image requests per day; video requires a paid plan.
- Enterprise workspaces have models disabled by default; ByteDance models need approval on the API.
- Grants participants can use up to 1M grant credits.

  — [ElevenLabs docs](https://elevenlabs.io/docs/product-guides/playground/image-video); [ElevenLabs help: cost](https://elevenlabs.io/docs/help-center/product/flows-image-video/image-video/how-much-does-image-video-cost.md)
- `estimate_only` quotes at default node settings (duration and resolution not specified):

  | Model | Credits | USD |
  |---|---|---|
  | Veo 3.1 (`veo-3.1-generate-001`) | 19,390 | ≈$3.53 per clip |
  | Seedance 2.5 US | 16,803 | ≈$3.06 per clip |
  | Gemini Omni 1.2 Flash | 4,260 | ≈$0.77 per clip |
  | Nano Banana Pro (`gemini-3-pro-image`), 1 image | 1,218 | ≈$0.22 |

  — ElevenLabs MCP `estimate_only` (this workspace, 2026-11-25)
- For comparison, Google's direct API price for Omni 1.2 Flash is $0.07/s at 720p, so a 10 s clip is about $0.70. — [Google AI Studio pricing](https://aistudio.google.com/docs/pricing)

### Inferences
- For a US-based creator on ElevenLabs, the practical video choices for 9:16 are:
  - Gemini Omni 1.2 Flash: cheapest; multi-turn edits; renders and animates type, though text accuracy is still suspect.
  - Seedance 2.5 US: up to 30 s; strongest physics in AV-Phys Bench (as 2.0); good hand–object contact.
  - Veo 3.1: dialogue and soundscape; 8 s cap.

  Kling and Wan require a non-US account or another platform.
- ElevenLabs' advantage for this project is keeping the voice-over (TTS), music/SFX, lip-sync and visuals on one canvas (Flows) where nodes can be wired. Cost per usable shot will be several times the per-generation quote, because anatomical errors force re-rolls.

### Gaps
- Exact credit cost per second by resolution for each model: the docs say "varies," and the estimates used unspecified defaults.
- ElevenLabs plan prices (credits per dollar by tier) were not retrieved. USD figures are the tool's own `price_cents` and may reflect this workspace's plan.
- Whether non-US users get Kling 4.0 or Wan 3.0 on ElevenLabs: Kling 4.0 is not listed.

---

## 8. Notable AI-made explainers and science-communication pieces (2025–2026): frontier visual techniques and hybrid pipelines

### Takeaway
No celebrated, fully AI-generated science explainer that experts consider accurate was found. The frontier is hybrid: generative clips for atmosphere, people and establishing shots, composited under precise, human-authored motion graphics, vector UI and type, and 3D/molecular renders. Leading science channels are publicly hostile to "AI slop," and platform AI detectors have even mislabelled hand-made science animation.

### Cited Findings
- Advids made a 110-second RingCentral explainer with Veo 3 and Google Flow, generating people and environments. Vector UI animations were then composited in After Effects ("compositing traditional motion graphics onto synthetic video plates"). This is a vendor's self-reported case study. — [Advids case study](https://advids.co/case-studies/ringcentral-advids-it-services-ai-generated-video-for-demonstrating-conversation-intelligence-platform)
- Google DeepMind's ANCESTRA combined live action with Veo footage, using personalization, motion matching and blending of live-action and generative shots. — [Google blog](https://blog.google/technology/google-deepmind/ancestra-behind-the-scenes)
- A CineD guide describes animating and post-processing AI assets in After Effects to "put together a compelling shot." — [CineD](https://www.cined.com/hybrid-video-production-ways-to-make-ai-part-of-your-workflow/)
- Medical animators describe generating "individual reusable assets" rather than whole scenes, for control over composition and animation. Studios say anatomy, scale, causality and claims still require expert review at every stage. — [VOKA](https://voka.io/?p=15477); [AXS Studio](https://axs3d.com/is-generative-ai-ready-for-medical-and-scientific-communications/)
- Runway's own guide positions AI video for "a concept preview or a lower-stakes explainer in hours," versus weeks for a full studio production with anatomical review. — [Runway medical animation guide](https://runway.com/resources/medical-animation-video)
- Kurzgesagt's Oct 2025 video "AI Slop Is Killing Our Channel" argues generative AI makes false information more convincing. — [FlowingData](https://flowingdata.com/2025/10/09/unreliable-library-of-human-knowledge/); [Gigazine](https://www.gigazine.net/gsc_news/en/20251008-destructiv-ai)
- In July 2026, YouTube's automated AI detection wrongly flagged Kurzgesagt's hand-made animation as AI slop. — [Kotaku](https://kotaku.com/youtube-mistakenly-penalizes-popular-science-channel-kurzgesagt-for-ai-generated-slop-2000722702); [Dexerto](https://www.dexerto.com/youtube/youtubes-ai-slop-detector-incorrectly-targets-kurzgesagt-as-other-creators-fear-same-fate-3395930/)
- Techniques at the model frontier:
  - Omni can render and animate kinetic type ("word by word… perfect pacing to a rhythm").
  - Seedance choreographs video to an uploaded audio track with beat-matched cuts.
  - Veo supports timed beat-sheet prompts and first/last-frame transitions.
  - Kling 3.0 produces up to 6 cuts per generation.

  — ElevenLabs MCP model guides (this workspace); [Kling blog](https://kling.ai/blog/kling-video-3-omni-multi-shot-native-audio-guide)
- Text rendering in video remains error-prone (best WER 0.25). — [VTR-Bench](https://arxiv.org/abs/2610.01499)

### Inferences
- Suggested pipeline for this 90 s vertical:
  1. Write the script, record voice-over (ElevenLabs TTS or a real voice) and lock the timing.
  2. Generate dental-chair and patient-emotion plates with Seedance 2.5 or Omni 1.2 at 9:16. Use reference stills for character consistency; keep clips to one action each.
  3. Render the molar from micro-CT or CBCT meshes in Blender, with transparent enamel showing the pulp and canals and a periapical zoom.
  4. Render MOR and naloxone from 8EF5/9PXU in Molecular Nodes or ChimeraX.
  5. Add all labels, citations and PDB IDs as vector motion graphics in post.
  6. Have an endodontist review anatomy and a pharmacologist review the mechanism.
  7. Add an AI disclosure.
- Audio-driven generation (Seedance audio-to-video, LTX audio-to-video) can lock generated plates to narration beats, which helps short-form pacing.

### Gaps
- No credible, named 2025–2026 science or medical explainer built mainly from generative video and praised for accuracy was found.
- No audience-research data on hybrid versus fully AI science explainers was found.

---

## 9. Ethics and disclosure: platform labeling (Meta "AI info", TikTok AIGC, YouTube) and medical misinformation concerns

### Takeaway
All three major platforms label AI content using C2PA metadata, invisible watermarks and, increasingly, automatic detection. Creators must disclose realistic synthetic content; YouTube made its labels more prominent in May 2026. EU AI Act Article 50 transparency duties have applied since 2026-08-02. The main Veo, Omni and Nano Banana outputs carry SynthID or C2PA, so a hybrid explainer will likely be auto-labelled. Plan an explicit, accurate disclosure, because health content sits in a 2026 climate of deepfake-doctor misinformation.

### Cited Findings

**YouTube**
- May 2026: one standard label for photorealistic or meaningfully altered or generated content, placed directly below the player on long-form. YouTube may apply labels automatically even without creator disclosure.
- Unrealistic, animated or minor edits need no disclosure, or carry it in the description only.
- Failing to disclose can lead to removal or suspension. Disclosure does not limit reach or monetization.

  — [YouTube blog](https://blog.youtube/news-and-events/improving-ai-labels-for-viewers-and-creators/); [YouTube Help](https://support.google.com/youtube/answer/14328491); [MBW](https://www.musicbusinessworldwide.com/youtube-will-now-automatically-detect-and-label-ai-videos/)

**TikTok**
- Creators must label realistic AI content. TikTok auto-labels content carrying C2PA Content Credentials or made with TikTok AI effects, and auto-labels cannot be removed.
- Invisible watermarks were added in 2026.
- More than 3 billion videos have been labelled as AIGC (2026-07-13).

  — [TikTok Help](https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content); [TikTok newsroom Mar 2026](https://newsroom.tiktok.com/tiktok-ssa-shares-more-ways-to-spot-shape-and-understand-ai-generated-content?lang=en-ZA); [TikTok newsroom Jul 2026](https://newsroom.tiktok.com/helping-people-spot-and-understand-ai-generated-content-on-tiktok-sg?lang=en-SG); [Tubefilter](https://www.tubefilter.com/2026/07/14/tiktok-ai-transparency-tools-content-labels/)

**Meta**
- Content made or edited with Meta AI may be auto-labelled "AI info." Users may be required to label AI content they share. Detection uses C2PA and IPTC metadata. — [Meta Help](https://www.meta.com/en-gb/help/artificial-intelligence/1783222608822690/); [TechCrunch](https://techcrunch.com/2024/07/01/meta-changes-its-label-from-made-with-ai-to-ai-info-to-indicate-use-of-ai-in-photos)
- Instagram began testing an optional "AI creator" profile label on 2026-05-04. — [Hypebeast](https://hypebeast.com/2026/5/instagram-tests-voluntary-ai-creator-label-on-profiles)
- A claim that all Reels require labels from April 2026 is unverified. — [HowSociable](https://howsociable.com/news/2026/04/instagram-ai-content-labels-required-april-2026)

**Provenance and law**
- Gemini Omni 1.2 outputs carry SynthID. Nano Banana 2 carries SynthID plus C2PA. — [Google Cloud blog](https://cloud.google.com/blog/products/ai-machine-learning/gemini-omni-1-2-flash-generally-available); [Google blog](https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/)
- EU AI Act Article 50:
  - Transparency obligations apply from 2026-08-02.
  - The Code of Practice on AI-generated content transparency was published 2026-06-10 and deemed adequate on 2026-07-09.
  - Deepfakes ("resembles existing persons, objects, places… would falsely appear… authentic") must be disclosed, including within artistic works, in a way that does not hamper the work.
  - Article 50 guidelines are reported as dated 2026-07-20 (status to verify).

  — [European Commission](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content); [Orrick](https://www.orrick.com/en/insights/2026/08/EU-AI-Act-Transparency-Obligations-for-AI-Generated-Content-Article-50); [Tech Policy Press](https://techpolicy.press/the-eus-ai-transparency-code-of-practice-explained)

**Medical misinformation context**
- Deepfaked real doctors are promoting supplements (Full Fact). TikTok removed one expert's deepfakes 6 weeks after his complaint. — [eWeek](https://www.eweek.com/news/ai-deepfakes-real-doctors/)
- Hallam's (commercial, disputed) study found AI content in 40% of top health TikToks. — [TNW](https://thenextweb.com/news/ai-generated-doctors-tiktok-danger)
- Critics note a generic "AI-generated" tag says nothing about claim accuracy. — [eMarketer](https://www.emarketer.com/content/tiktok-s-ai-created-health-content-raises-new-risks-platform-users-)
- AI dental images are rated more attractive than reality and evade detection even by dentists. — [Sci Rep 2026](https://doi.org/10.1038/s41598-026-41744-4)
- Generated medical imagery can encode demographic bias. — [npj Digit Med 2025](https://doi.org/10.1038/s41746-025-01817-6)
- The REMEDY authors warn that "visually plausible videos may contain unsafe technique." — [REMEDY](https://arxiv.org/html/2609.32460)

### Inferences
- Photoreal dental-chair scenes made with AI will trigger disclosure on YouTube, TikTok and Meta, and likely auto-labels via SynthID or C2PA. Stylized molecular and 3D anatomy renders from real data generally do not require disclosure. Ticking the platform toggle and adding an on-screen line ("Clinical scenes AI-generated; anatomy and molecular models from micro-CT/PDB data") pre-empts suspicion and helps against false-positive "slop" detection (the Kurzgesagt case).
- Avoid photoreal AI people who could be read as real clinicians or patients giving testimony. Never use a real clinician's likeness without consent. Do not depict AI "before/after" outcomes as clinical results.
- Put sources (study citations, PDB IDs) on screen or in the caption. This separates the piece from health-misinformation content.

### Gaps
- YouTube's and TikTok's 2026 medical-misinformation policies (separate from AI labelling) were not researched.
- Whether Meta now requires labels on all AI Reels is unverified.
- US federal or state AI-disclosure laws (e.g., California's AI Transparency Act timing) were not researched.
- Whether EU AI Act Art. 50 deadlines were amended by the EU "digital omnibus" proposals was not checked.

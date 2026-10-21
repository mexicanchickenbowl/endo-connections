#!/usr/bin/env python3
"""Build timeline.js (+ narration.mp3) for the EPT explainer from script.json.

  python3 tools/build_timeline.py tts                 # print the narrator text for each scene
  python3 tools/build_timeline.py build [AUDIO_DIR]   # write timeline.js and narration.mp3

AUDIO_DIR holds one clip per scene named <scene id>.wav or .mp3. Scenes without a clip get an
estimated duration (handy while designing the animation before narration exists).
Sentence spans come from <scene id>.json written by narrate.py when present, otherwise from
the pauses between sentences; beat markers are placed by character position inside their
sentence.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MARK = re.compile(r"\{(\w+)\}")
CHARS_PER_SEC = 15.0
LEAD, TAIL = 0.7, 0.9            # silence around each scene's narration
FIRST_LEAD, LAST_TAIL = 1.2, 6.0
CAP_MAX = 96                     # max characters per caption card


def load():
    with open(os.path.join(ROOT, "script.json")) as f:
        return json.load(f)


def parse(sentence):
    marks, out, pos = {}, [], 0
    for m in MARK.finditer(sentence):
        out.append(sentence[pos:m.start()])
        marks[m.group(1)] = len("".join(out))
        pos = m.end()
    out.append(sentence[pos:])
    return "".join(out).strip(), marks


def tts_text(script, scene):
    text = " ".join(parse(s)[0] for s in scene["sentences"])
    for a, b in script.get("tts_subs", {}).items():
        text = text.replace(a, b)
    return text


def probe_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", path], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def silences(path, noise="-38dB", min_d=0.22):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af",
                          f"silencedetect=noise={noise}:d={min_d}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(starts, ends + [None] * (len(starts) - len(ends))))


def sentence_spans(texts, audio):
    """Return [(start, end)] of speech for each sentence, in seconds from clip start."""
    lens = [max(len(t), 1) for t in texts]
    side = os.path.splitext(audio)[0] + ".json" if audio else None
    if side and os.path.exists(side):
        with open(side) as f:
            meta = json.load(f)
        if len(meta["spans"]) == len(texts):
            return [tuple(x) for x in meta["spans"]], probe_duration(audio)
    if audio is None:
        total = sum(lens) / CHARS_PER_SEC + 0.35 * (len(texts) - 1)
        spans, t = [], 0.0
        for n in lens:
            d = n / CHARS_PER_SEC
            spans.append((t, t + d))
            t += d + 0.35
        return spans, total
    dur = probe_duration(audio)
    sil = silences(audio)
    speech_start = sil[0][1] if sil and sil[0][0] < 0.05 and sil[0][1] else 0.0
    speech_end = dur
    if sil and sil[-1][1] is None:
        speech_end = sil[-1][0]
    elif sil and sil[-1][1] and abs(sil[-1][1] - dur) < 0.05:
        speech_end = sil[-1][0]
    inner = [(a, b) for a, b in sil if b and a > speech_start + 0.1 and b < speech_end - 0.05]
    # expected boundary positions by character share
    span = speech_end - speech_start
    cum, acc = [], 0
    for n in lens[:-1]:
        acc += n
        cum.append(speech_start + span * acc / sum(lens))
    chosen, used = [], set()
    for target in cum:  # nearest unused pause after the previous boundary
        best = None
        for i, (a, b) in enumerate(inner):
            if i in used or (chosen and a <= chosen[-1][0]):
                continue
            score = abs((a + b) / 2 - target) - 0.6 * min(b - a, 1.0)
            if best is None or score < best[0]:
                best = (score, i)
        if best is not None and abs((inner[best[1]][0] + inner[best[1]][1]) / 2 - target) < span * 0.12 + 1.0:
            used.add(best[1])
            chosen.append(inner[best[1]])
        else:
            chosen.append((target, target))
    spans, cur = [], speech_start
    for a, b in chosen:
        spans.append((cur, a))
        cur = b
    spans.append((cur, speech_end))
    return spans, dur


def caption_chunks(text, start, end):
    if len(text) <= CAP_MAX:
        return [(start, end, text)]
    words, chunks, cur = text.split(" "), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > CAP_MAX:
            # prefer breaking after punctuation in the back half of the chunk
            cut = max(cur.rfind(p) for p in (", ", ": ", "; ", ". ", "? "))
            if cut > len(cur) * 0.45:
                chunks.append(cur[:cut + 1])
                cur = cur[cut + 2:] + " " + w
            else:
                chunks.append(cur)
                cur = w
        else:
            cur = (cur + " " + w) if cur else w
    chunks.append(cur)
    total = sum(len(c) for c in chunks)
    out, t = [], start
    for c in chunks:
        d = (end - start) * len(c) / total
        out.append((t, t + d, c))
        t += d
    return out


def build(audio_dir=None):
    script = load()
    scenes, caps, t0 = [], [], 0.0
    clips = []
    n = len(script["scenes"])
    for si, sc in enumerate(script["scenes"]):
        parsed = [parse(s) for s in sc["sentences"]]
        texts = [p[0] for p in parsed]
        audio = None
        for ext in (".wav", ".mp3"):
            if audio_dir and os.path.exists(os.path.join(audio_dir, sc["id"] + ext)):
                audio = os.path.join(audio_dir, sc["id"] + ext)
                break
        spans, clip_dur = sentence_spans(texts, audio)
        lead = FIRST_LEAD if si == 0 else LEAD
        tail = LAST_TAIL if si == n - 1 else TAIL
        dur = lead + clip_dur + tail
        marks, sents = {}, []
        for k, ((text, mk), (a, b)) in enumerate(zip(parsed, spans)):
            a, b = a + lead, b + lead
            sents.append({"start": round(a, 3), "end": round(b, 3), "text": text})
            for name, ci in mk.items():
                marks[name] = round(a + (b - a) * ci / max(len(text), 1), 3)
            for ca, cb, ctext in caption_chunks(text, a, b):
                caps.append({"start": round(t0 + ca, 3), "end": round(t0 + cb, 3), "text": ctext})
        scenes.append({"id": sc["id"], "title": sc["title"], "start": round(t0, 3),
                       "dur": round(dur, 3), "marks": marks, "sentences": sents,
                       "estimated": audio is None})
        clips.append((audio, lead, clip_dur, tail))
        t0 += dur
    tl = {"duration": round(t0, 3), "scenes": scenes, "captions": caps}
    with open(os.path.join(ROOT, "timeline.js"), "w") as f:
        f.write("// Generated by tools/build_timeline.py from script.json — do not edit by hand.\n")
        f.write("window.TIMELINE = " + json.dumps(tl, indent=1, ensure_ascii=False) + ";\n")
    if audio_dir and all(c[0] for c in clips):
        make_narration(clips, os.path.join(ROOT, "narration.mp3"))
    est = [s["id"] for s in scenes if s["estimated"]]
    print(f"timeline: {t0:.1f}s, {len(scenes)} scenes" + (f" (estimated: {', '.join(est)})" if est else ""))


def make_narration(clips, out):
    args, filters = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"], []
    for i, (audio, lead, clip_dur, tail) in enumerate(clips):
        args += ["-i", audio]
        filters.append(f"[{i}:a]aresample=44100,aformat=channel_layouts=mono,"
                       f"adelay={int(lead * 1000)}:all=1,apad=whole_dur={lead + clip_dur + tail:.3f}[a{i}]")
    filters.append("".join(f"[a{i}]" for i in range(len(clips))) +
                   f"concat=n={len(clips)}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[out]")
    args += ["-filter_complex", ";".join(filters), "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "128k", out]
    subprocess.run(args, check=True)
    print(f"narration: {out} ({probe_duration(out):.1f}s)")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "build"
    if cmd == "tts":
        s = load()
        for sc in s["scenes"]:
            print(f"== {sc['id']} ({len(tts_text(s, sc))} chars)\n{tts_text(s, sc)}\n")
    else:
        build(sys.argv[2] if len(sys.argv) > 2 else None)

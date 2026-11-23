import json, sys, os, torch, torchaudio as ta
torch.set_num_threads(4)
from chatterbox.tts import ChatterboxTTS
S=sys.argv[1]; ids=sys.argv[2].split(','); takes=[int(x) for x in sys.argv[3].split(',')]
m=ChatterboxTTS.from_pretrained(device="cpu")
lines={l[0]:l[1] for sc in json.load(open(os.path.join(S,"script.json"))) for l in sc["lines"]}
for lid in ids:
  for take in takes:
    torch.manual_seed(5000+97*take+len(lid)*13+sum(map(ord,lid)))
    w=m.generate(lines[lid], exaggeration=0.5, cfg_weight=0.45, temperature=0.75)
    ta.save(f"{S}/vo/{lid}_t{take}.wav",w,m.sr); print("done",lid,take,round(w.shape[-1]/m.sr,2),flush=True)

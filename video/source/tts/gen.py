import json, sys, os, torch, torchaudio as ta
torch.set_num_threads(4)
from chatterbox.tts import ChatterboxTTS
S=sys.argv[1]; out=os.path.join(S,"vo")
m=ChatterboxTTS.from_pretrained(device="cpu")
lines=[l for sc in json.load(open(os.path.join(S,"script.json"))) for l in sc["lines"]]
for take in (0,1):
  for lid,text in lines:
    f=os.path.join(out,f"{lid}_t{take}.wav")
    if os.path.exists(f): continue
    torch.manual_seed(1000*take+hash(lid)%997)
    w=m.generate(text, exaggeration=0.5, cfg_weight=0.45, temperature=0.75)
    ta.save(f,w,m.sr); print("done",lid,take,round(w.shape[-1]/m.sr,2),flush=True)

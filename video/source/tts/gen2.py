import json, sys, os, torch, torchaudio as ta
torch.set_num_threads(4)
from chatterbox.tts import ChatterboxTTS
S=sys.argv[1]; m=ChatterboxTTS.from_pretrained(device="cpu")
lines=json.load(open(f"{S}/script_dds.json"))
for take in (0,1):
  for lid,text in lines:
    f=f"{S}/vo2/{lid}_t{take}.wav"
    if os.path.exists(f): continue
    torch.manual_seed(7000+1000*take+sum(map(ord,lid))*13)
    w=m.generate(text, exaggeration=0.5, cfg_weight=0.45, temperature=0.75)
    ta.save(f,w,m.sr); print("done",lid,take,round(w.shape[-1]/m.sr,2),flush=True)

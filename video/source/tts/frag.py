import sys, torch, torchaudio as ta
torch.set_num_threads(4)
from chatterbox.tts import ChatterboxTTS
S=sys.argv[1]; m=ChatterboxTTS.from_pretrained(device="cpu")
C={"A":"Pulpul pain signals that something is wrong, not where.",
   "B":"Pulpel pain signals that something is wrong, not where.",
   "C":"Pulpple pain signals that something is wrong, not where.",
   "D":"Pain from the pulp signals that something is wrong, not where."}
for k,t in C.items():
  for take in (0,1):
    torch.manual_seed(321+take*17+ord(k))
    w=m.generate(t, exaggeration=0.5, cfg_weight=0.45, temperature=0.7)
    ta.save(f"{S}/frag/{k}{take}.wav",w,m.sr); print("done",k,take,flush=True)

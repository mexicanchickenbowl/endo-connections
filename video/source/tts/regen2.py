import sys, torch, torchaudio as ta
torch.set_num_threads(4)
from chatterbox.tts import ChatterboxTTS
S=sys.argv[1]; m=ChatterboxTTS.from_pretrained(device="cpu")
R={"r4":"With peri-radicular symptoms, it was eighty-nine percent. Without them, just thirty percent.",
   "r5":"The pulp is innervated by A delta and C fibers, but it lacks proprioceptors. Pulp-al pain signals that something is wrong, not where.",
   "r7":"Oh-watts and colleagues found mechanical allodynia in fifty-seven percent of patients with irreversible pulp-itis."}
for take in (2,3):
  for lid,text in R.items():
    torch.manual_seed(9100+take*31+sum(map(ord,lid)))
    w=m.generate(text, exaggeration=0.5, cfg_weight=0.45, temperature=0.7)
    ta.save(f"{S}/vo2/{lid}_t{take}.wav",w,m.sr); print("done",lid,take,flush=True)

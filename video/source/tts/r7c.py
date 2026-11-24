import sys, torch, torchaudio as ta
torch.set_num_threads(4)
from chatterbox.tts import ChatterboxTTS
S=sys.argv[1]; m=ChatterboxTTS.from_pretrained(device="cpu")
C={"P":"Owatz and colleagues found mechanical allodynia in fifty-seven percent of patients with irreversible pulpitis.",
   "Q":"Owatz and colleagues found mechanical allodynia in fifty-seven percent of irreversible pulpitis patients."}
for k,t in C.items():
  for take in range(3):
    torch.manual_seed(555+take*29+ord(k))
    w=m.generate(t, exaggeration=0.45, cfg_weight=0.5, temperature=0.65)
    ta.save(f"{S}/r7c/{k}{take}.wav",w,m.sr); print("done",k,take,flush=True)

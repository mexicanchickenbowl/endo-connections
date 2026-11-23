import json, sys, os, re
from faster_whisper import WhisperModel
S=sys.argv[1]
script=json.load(open(f"{S}/script.json"))
m=WhisperModel("small.en",device="cpu",compute_type="int8",cpu_threads=4)
def norm(t):
    t=t.lower().replace("-"," ")
    return re.sub(r"[^a-z0-9 ]","",t).split()
def wer(r,h):
    d=[[0]*(len(h)+1) for _ in r+[0]]
    for i in range(len(r)+1): d[i][0]=i
    for j in range(len(h)+1): d[0][j]=j
    for i in range(1,len(r)+1):
        for j in range(1,len(h)+1):
            d[i][j]=min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(r[i-1]!=h[j-1]))
    return d[len(r)][len(h)]/max(1,len(r))
res={}; words={}; picks={}
for sc in script:
  for lid,text in sc["lines"]:
    best=None
    for take in (0,1):
      f=f"{S}/vo/{lid}_t{take}.wav"
      if not os.path.exists(f): continue
      segs,info=m.transcribe(f,word_timestamps=True,beam_size=5,language="en")
      ws=[(w.word.strip(),w.start,w.end) for s in segs for w in s.words]
      hyp=" ".join(w[0] for w in ws)
      e=wer(norm(text.replace("A delta","a delta")),norm(hyp))
      dur=info.duration; tail=dur-(ws[-1][2] if ws else dur)
      key=f"{lid}_t{take}"; words[key]=[[w[0],round(w[1],3),round(w[2],3)] for w in ws]
      res[key]={"wer":round(e,3),"dur":round(dur,2),"tail":round(tail,2),"hyp":hyp}
      score=e+ (0.15 if tail>1.0 else 0)
      if best is None or score<best[0]: best=(score,take)
      print(key,res[key],flush=True)
    picks[lid]=best[1]
json.dump(words,open(f"{S}/words.json","w")); json.dump(picks,open(f"{S}/picks.json","w")); json.dump(res,open(f"{S}/qa.json","w"),indent=1)

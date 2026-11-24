# Build the Reels narration: subset of approved takes, sped up 6%, tight gaps.
import json, sys, subprocess, numpy as np, soundfile as sf, os
S=sys.argv[1]; SR=24000; TEMPO=1.06
picks=json.load(open(f"{S}/picks.json")); words=json.load(open(f"{S}/words.json"))
PLAN=[("hook",["h1","h2","h3","h4"]),("mcc",["e1","e4","e5"]),("ana",["a1","a4","a5","a6"]),("wire",["w1","w2","w5","w6"]),("close",["c1","c3","c4"])]
LEAD,GAP,SGAP,END=0.35,0.22,0.5,3.2
t=LEAD; lines={}; scenes={}; out=[]
for name,ids in PLAN:
    s0=t
    for lid in ids:
        key=f"{lid}_t{picks.get(lid,0)}"; wl=words[key]
        raw,_=sf.read(f"{S}/vo/{key}.wav"); raw=raw if raw.ndim==1 else raw.mean(1)
        raw=raw[:int(min(len(raw)/SR, wl[-1][2]+0.28)*SR)]
        idx=np.where(np.abs(raw)>0.01)[0]; off=max(0,idx[0]-int(.03*SR))/SR; raw=raw[int(off*SR):]
        tmp_in=f"{S}/reel/_in.wav"; tmp_out=f"{S}/reel/_out.wav"; sf.write(tmp_in,raw,SR)
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",tmp_in,"-filter:a",f"atempo={TEMPO}",tmp_out],check=True)
        w,_=sf.read(tmp_out); d=len(w)/SR; out.append((t,w))
        lines[lid]={"s":round(t,3),"e":round(t+d,3),"words":[[x[0],round(t+(x[1]-off)/TEMPO,3),round(t+(x[2]-off)/TEMPO,3)] for x in wl]}
        t+=d+GAP
    t+=SGAP-GAP; scenes[name]={"s":s0,"e":t-SGAP+0.25}
scenes["end"]={"s":t,"e":t+END}; total=t+END
open(f"{S}/web/reel_timings.js","w").write("window.TIMINGS="+json.dumps({"lines":lines,"scenes":scenes,"total":total,"music":"Infinite Perspective"})+";")
buf=np.zeros(int(total*SR)+SR)
for st,w in out: i=int(st*SR); buf[i:i+len(w)]+=w
sf.write(f"{S}/reel/narration.wav",buf,SR)
print("total",round(total,2),{k:(round(v['s'],1),round(v['e'],1)) for k,v in scenes.items()})

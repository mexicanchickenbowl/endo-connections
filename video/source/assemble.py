# Build timeline: pick takes, trim, lay out, write narration.wav + timings.js
import json, sys, os, glob, numpy as np, soundfile as sf
S=sys.argv[1]; mode=sys.argv[2] if len(sys.argv)>2 else 'real'
script=json.load(open(f"{S}/script.json")); SR=24000
picks=json.load(open(f"{S}/picks.json")) if os.path.exists(f"{S}/picks.json") else {}
wordsj=json.load(open(f"{S}/words.json")) if os.path.exists(f"{S}/words.json") else {}
LEAD,GAP,SGAP,TITLE,END=0.9,0.38,1.0,3.6,11.0
t=LEAD; lines={}; scenes={}; out=[]
def trim(w,thr=0.01):
    idx=np.where(np.abs(w)>thr)[0]
    if len(idx)==0: return w
    a=max(0,idx[0]-int(.03*SR)); b=min(len(w),idx[-1]+int(.12*SR)); return w[a:b]
for sc in script:
    name=sc['scene']
    if name=='title':
        scenes['title']={'s':t-0.3,'e':t-0.3+TITLE}; t+=TITLE; continue
    s0=t
    for lid,text in sc['lines']:
        if mode=='est':
            d=len(text.split())/2.7; w=np.zeros(int(d*SR)); off=0
        else:
            f=f"{S}/vo/{lid}_t{picks.get(lid,0)}.wav"; w,_=sf.read(f); w=w if w.ndim==1 else w.mean(1)
            raw=w
            wl0=wordsj.get(f"{lid}_t{picks.get(lid,0)}",[])
            if wl0: raw=raw[:int(min(len(raw)/SR, wl0[-1][2]+0.32)*SR)]
            w=trim(raw); off=0
            # offset of trim start, for word timings
            idx=np.where(np.abs(raw)>0.01)[0]; off=max(0,idx[0]-int(.03*SR))/SR if len(idx) else 0
        d=len(w)/SR
        out.append((t,w))
        wl=[[x[0],round(t+x[1]-off,3)] for x in wordsj.get(f"{lid}_t{picks.get(lid,0)}",[])]
        lines[lid]={'s':round(t,3),'e':round(t+d,3),'words':wl}
        t+=d+GAP
    t+=SGAP-GAP
    scenes[name]={'s':s0,'e':t-SGAP+0.3}
scenes['end']={'s':t,'e':t+END}; total=t+END
mus=open(f"{S}/music_name.txt").read().strip() if os.path.exists(f"{S}/music_name.txt") else ''
open(f"{S}/web/timings.js","w").write("window.TIMINGS="+json.dumps({'lines':lines,'scenes':scenes,'total':total,'music':mus})+";")
if mode!='est':
    buf=np.zeros(int(total*SR)+SR)
    for st,w in out: i=int(st*SR); buf[i:i+len(w)]+=w
    sf.write(f"{S}/narration.wav",buf,SR)
print("total",round(total,2))

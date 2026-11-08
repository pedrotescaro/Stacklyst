from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import json,hashlib
R=Path(__file__).resolve().parents[1];O=R/'validacao/montagens';O.mkdir(exist_ok=True)
record={};dirs=list((R/'validacao/rendered').iterdir())+[R/'validacao/slides']
for d in dirs:
    images=sorted([p for p in d.iterdir() if p.suffix.lower()=='.png'],key=lambda p:int(''.join(filter(str.isdigit,p.stem)) or 0))
    record[d.name]=len(images)
    for start in range(0,len(images),20):
        batch=images[start:start+20];width=280 if d.name=='slides' else 230;height=185 if d.name=='slides' else 340
        montage=Image.new('RGB',(width*5,height*4),'#d1d5db');draw=ImageDraw.Draw(montage)
        for i,p in enumerate(batch):
            im=Image.open(p).convert('RGB');im.thumbnail((width-12,height-28));x=(i%5)*width+(width-im.width)//2;y=(i//5)*height+23
            montage.paste(im,(x,y));draw.text(((i%5)*width+8,(i//5)*height+6),p.stem,fill='black')
        montage.save(O/(d.name+'-'+str(start//20+1)+'.jpg'),quality=88)
before=R/'validacao/slides-atividades-originais';after=R/'validacao/slides'
preserved=[]
for n in range(4,11):
    source=next(p for p in before.iterdir() if p.stem.lower()=='slide'+str(n));target=next(p for p in after.iterdir() if p.stem.lower()=='slide'+str(n))
    a=Image.open(source).convert('RGB');b=Image.open(target).convert('RGB');assert a.size==b.size and a.tobytes()==b.tobytes(),n;preserved.append(n)
(R/'validacao/render-summary.json').write_text(json.dumps({'rendered':record,'activitySlidesPixelIdentical':preserved},indent=2)+'\n',encoding='utf-8')
print(record)

from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
R=Path(__file__).resolve().parents[1]
for folder in (R/'qa-rendered').iterdir():
 if not folder.is_dir():continue
 pages=sorted(folder.glob('page-*.png'),key=lambda p:int(p.stem.split('-')[-1]))
 for start in range(0,len(pages),12):
  subset=pages[start:start+12];thumbs=[]
  for p in subset:
   im=Image.open(p).convert('RGB');im.thumbnail((330,430));canvas=Image.new('RGB',(350,460),'white');canvas.paste(im,((350-im.width)//2,20));ImageDraw.Draw(canvas).text((10,5),p.stem,fill='black');thumbs.append(canvas)
  sheet=Image.new('RGB',(1400,1380),(225,225,225))
  for j,im in enumerate(thumbs):sheet.paste(im,((j%4)*350,(j//4)*460))
  sheet.save(folder/f'montage-{start+1:03}.png')

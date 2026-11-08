"""Targeted OOXML template edit; preserve approved activity slides byte for byte.

The installed artifact-tool Presentation.load could not import the source (Node
API install via @oai/granola/node unavailable). Preserve source slide XML and use
Office rendering for the permitted original-deck fallback.
"""
from pathlib import Path
import zipfile,json,re,copy,hashlib
from lxml import etree as E
from PIL import Image
R=Path(__file__).resolve().parents[1]
source=next((R/'fontes/drive').glob('*.pptx'))
with zipfile.ZipFile(source) as z:files={n:z.read(n) for n in z.namelist()}
N={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships','pr':'http://schemas.openxmlformats.org/package/2006/relationships'}
def tag(ns,n):return '{'+N[ns]+'}'+n
def xml(path):return E.fromstring(files[path])
def save(path,node):files[path]=E.tostring(node,encoding='UTF-8',xml_declaration=True,standalone=True)
def textshape(label,x,y,w,h,size=30,bold=False,font='Arial',color='142B3B'):
    s=E.Element(tag('p','sp'));nv=E.SubElement(s,tag('p','nvSpPr'));E.SubElement(nv,tag('p','cNvPr'),id='900',name=label[:70]);E.SubElement(nv,tag('p','cNvSpPr'));E.SubElement(nv,tag('p','nvPr'))
    pr=E.SubElement(s,tag('p','spPr'));xf=E.SubElement(pr,tag('a','xfrm'));E.SubElement(xf,tag('a','off'),x=str(round(x*9525)),y=str(round(y*9525)));E.SubElement(xf,tag('a','ext'),cx=str(round(w*9525)),cy=str(round(h*9525)));E.SubElement(pr,tag('a','prstGeom'),prst='rect');E.SubElement(pr,tag('a','noFill'));E.SubElement(E.SubElement(pr,tag('a','ln')),tag('a','noFill'))
    b=E.SubElement(s,tag('p','txBody'));E.SubElement(b,tag('a','bodyPr'),wrap='square',lIns='0',rIns='0',tIns='0',bIns='0');E.SubElement(b,tag('a','lstStyle'))
    for line in label.splitlines():
        p=E.SubElement(b,tag('a','p'));ppr=E.SubElement(p,tag('a','pPr'));spc=E.SubElement(ppr,tag('a','lnSpc'));E.SubElement(spc,tag('a','spcPct'),val='110000')
        r=E.SubElement(p,tag('a','r'));rp=E.SubElement(r,tag('a','rPr'),sz=str(round(size*75)),b='1' if bold else '0',lang='pt-BR');E.SubElement(E.SubElement(rp,tag('a','solidFill')),tag('a','srgbClr'),val=color);E.SubElement(rp,tag('a','latin'),typeface=font);E.SubElement(r,tag('a','t')).text=line
    return s
def shell(n,title,subtitle):
    p=f'ppt/slides/slide{n}.xml';root=xml(p);tree=root.find('p:cSld/p:spTree',N)
    for child in list(tree):
        if child.tag not in [tag('p','nvGrpSpPr'),tag('p','grpSpPr')]:tree.remove(child)
    tree.append(textshape(title,84,38,1750,88,52,True));tree.append(textshape(subtitle,88,136,1740,50,27,color='006C83'));tree.append(textshape(f'{n:02}',1770,1025,65,28,22))
    return p,root,tree
def picture(n,tree,path,box):
    w,h=Image.open(path).size;x,y,bw,bh=box;scale=min(bw/w,bh/h);fw,fh=w*scale,h*scale;x+=(bw-fw)/2;y+=(bh-fh)/2
    key=f'ppt/media/revisao-slide{n}-{len(tree)}{path.suffix.lower()}';files[key]=path.read_bytes();relpath=f'ppt/slides/_rels/slide{n}.xml.rels';rels=xml(relpath);rid='rIdNov'+str(len(rels)+1);E.SubElement(rels,tag('pr','Relationship'),Id=rid,Type=N['r']+'/image',Target='../media/'+Path(key).name);save(relpath,rels)
    pic=E.SubElement(tree,tag('p','pic'));nv=E.SubElement(pic,tag('p','nvPicPr'));E.SubElement(nv,tag('p','cNvPr'),id='901',name=path.stem);E.SubElement(nv,tag('p','cNvPicPr'));E.SubElement(nv,tag('p','nvPr'));fill=E.SubElement(pic,tag('p','blipFill'));E.SubElement(fill,tag('a','blip'),{tag('r','embed'):rid});E.SubElement(E.SubElement(fill,tag('a','stretch')),tag('a','fillRect'));pr=E.SubElement(pic,tag('p','spPr'));xf=E.SubElement(pr,tag('a','xfrm'));E.SubElement(xf,tag('a','off'),x=str(round(x*9525)),y=str(round(y*9525)));E.SubElement(xf,tag('a','ext'),cx=str(round(fw*9525)),cy=str(round(fh*9525)));E.SubElement(pr,tag('a','prstGeom'),prst='rect')
def notes(n,content):
    path=f'ppt/notesSlides/notesSlide{n}.xml'
    if path not in files:return
    root=xml(path);bodies=root.findall('.//p:sp',N)
    for sp in bodies:
        ph=sp.find('p:nvSpPr/p:nvPr/p:ph',N)
        if ph is not None and ph.get('type')=='body':
            body=sp.find('p:txBody',N)
            for p in body.findall('a:p',N):body.remove(p)
            for line in content.splitlines():p=E.SubElement(body,tag('a','p'));r=E.SubElement(p,tag('a','r'));E.SubElement(r,tag('a','t')).text=line
    save(path,root)

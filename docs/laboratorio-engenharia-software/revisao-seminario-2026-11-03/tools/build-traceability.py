"""Traceability in the six-column format supplied by the user, with code evidence."""
from pathlib import Path
import re,json,csv
R=Path(__file__).resolve().parents[1];ROOT=R.parents[2];M=ROOT/'docs/manual/detalhado'
s=(M/'requisitos-e-regras.md').read_text(encoding='utf-8')
items={}
for line in s.splitlines():
    if re.match(r'\| [FRQ]\d+ ',line):
        row=[x.strip() for x in line.strip('|').split('|')];items[row[0]]={'description':row[1].replace('`',''),'source':row[2]}
cases=json.loads((M/'catalogo-casos.json').read_text(encoding='utf-8'))
# Explicit capability-to-case links. Same case means shared flow, not a call dependency.
links={1:[],2:[1,2],3:[2,3],4:[4],5:[5],6:[6],7:[7,9],8:[8,10],9:[9,11],10:[12],11:[13],12:[25],13:[14],14:[15,16],15:[17],16:[18],17:[19],18:[20,21,52],19:[22],20:[23,24],21:[26],22:[27],23:[21],24:[28],25:[29],26:[31],27:[30],28:[32],29:[33],30:[34],31:[35],32:[36],33:[37],34:[38],35:[39],36:[39],37:[40],38:[41],39:[41],40:[42],41:[43],42:[44],43:[45],44:[46],45:[47],46:[48],47:[49],48:[50],50:[52,53],51:[54]}
# Resolve by actual titles rather than relying on a previous edition's numbering.
for k in list(links):
    links[k]=[f'C{x:02}' for x in links[k] if any(c['id']==f'C{x:02}' for c in cases)]
# Verify explicit mappings below against the current catalog.
title_overrides={}
for f,terms in title_overrides.items():
    matches=[c['id'] for c in cases if any(term.casefold() in c['title'].casefold() for term in terms)]
    if matches:links[f]=matches
scope={}
for f in links:
    qs=['Q01','Q04','Q06','Q08','Q10','Q11','Q12']
    if f in list(range(4,15))+list(range(25,38))+[40,41,43,48]:qs+=['Q02','Q05','Q09']
    if f in [7,8,9,14,16,17,20,22,33,37,40,41,44,50,51]:qs+=['Q03']
    if f in [1,4,5,12,16,20,21,22,23,26,39,41,42]:qs+=['Q07']
    scope[f]=sorted(set(qs))
bycase={c['id']:c for c in cases};rows=[];frules={}
cross=json.loads((M/'equivalencia-cenarios-uc.json').read_text(encoding='utf-8'))
for fid in sorted(links):
    f=f'F{fid:02}';rules=sorted({r for c in links[fid] for r in bycase[c]['rules']})
    frules[fid]=rules
    rows.append([f,items[f]['description'],'RF','—','; '.join(scope[fid]),'; '.join(rules) or '—'])
for q in sorted(k for k in items if k.startswith('Q')):
    fs=[f for f in links if q in scope[f]];rs=sorted({r for f in fs for r in frules[f]})
    rows.append([q,items[q]['description'],'RNF','; '.join(f'F{f:02}' for f in fs),'—','; '.join(rs)])
for rn in sorted(k for k in items if k.startswith('R')):
    fs=[f for f in links if rn in frules[f]];qs=sorted({q for f in fs for q in scope[f]})
    rows.append([rn,items[rn]['description'],'RN','; '.join(f'F{f:02}' for f in fs) or 'A revisar','; '.join(qs) or 'A revisar','—'])
header=['ID','Descrição','Tipo','Requisitos funcionais relacionados','Requisitos não funcionais relacionados','Regras de negócio relacionadas']
def compact(value):
    ids=value.split('; ')
    if not ids or not all(re.fullmatch('[FRQ]\\d+',i) for i in ids):return value
    result=[];start=previous=ids[0]
    for current in ids[1:]+['STOP']:
        if current!='STOP' and current[0]==previous[0] and int(current[1:])==int(previous[1:])+1:previous=current;continue
        result.append(start if start==previous else start+'-'+previous);start=previous=current
    return '; '.join(result)
for row in rows:
    for col in [3,4,5]:row[col]=compact(row[col])
out=['# Matriz de rastreabilidade','',
'Formato baseado no arquivo “exemplo de matriz de rastreabilidade.docx” fornecido pelo grupo. Os exemplos de cinema do arquivo servem apenas para a estrutura das colunas. Os relacionamentos abaixo pertencem à Stacklyst.','',
'IDs preservados: F identifica RF, Q identifica RNF e R identifica RN. Intervalos como F01-F03 significam F01, F02 e F03. A relação significa participação no mesmo fluxo ou critério de qualidade aplicável, sem afirmar que um requisito chama outro. Células “A revisar” indicam lacuna de rastreio, não cobertura comprovada. As relações com Q são critérios de revisão a verificar, não resultados de teste.','',
'| '+' | '.join(header)+' |','| '+' | '.join(['---']*6)+' |']
out+=['| '+' | '.join(v.replace('|','/') for v in row)+' |' for row in rows]
out+=['','## Capacidades, casos e código','',
'A lista complementar permite chegar da capacidade funcional à especificação do caso de uso e ao ponto de implementação. O catálogo de casos contém as pré-condições, o fluxo, as alternativas e as regras completas.','',
'| RF | Casos de uso relacionados | Fonte de implementação dos casos |','| --- | --- | --- |']
for f in sorted(links):
    ids='; '.join(sorted({u for c in links[f] for u in cross.get(c,[])}))
    if not ids:ids='Módulo fora do escopo UML acadêmico' if f in range(25,32) else 'Cliente técnico dos mesmos casos, sem caso independente' if f==46 else 'Ponto de entrada, sem caso independente'
    out.append('| F%02d | %s | %s |'%(f,ids,'; '.join(sorted({bycase[c]['source'] for c in links[f]})) or 'src/app/page.tsx'))
(M/'matriz-de-rastreabilidade.md').write_text('\n'.join(out)+'\n',encoding='utf-8')
(R/'validacao/rastreabilidade.json').write_text(json.dumps({'rows':len(rows),'RF':len(links),'RNF':12,'RN':sum(k.startswith('R') for k in items),'capabilityToCases':links,'reviewRequired':[row[0] for row in rows if 'A revisar' in row]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (R/'entregaveis/matriz-de-rastreabilidade.csv').open('w',encoding='utf-8-sig',newline='') as outcsv:
    w=csv.writer(outcsv,delimiter=';');w.writerow(header);w.writerows(rows)
print('Traceability rows',len(rows))

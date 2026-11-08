from pathlib import Path
import re,json,shutil,os
from urllib.parse import quote
R=Path(__file__).resolve().parents[1];ROOT=R.parents[2];M=ROOT/'docs/manual/detalhado'
plan=json.loads((R/'tools/astah-plan.json').read_text(encoding='utf-8'))
def link(id):
    paths=list((R/'diagramas/astah-export').rglob(id+' *.png'));assert len(paths)==1,(id,len(paths))
    return quote(os.path.relpath(paths[0],M).replace('\\','/'),safe='/.-')
ref=M/'referencia-uml-guedes.md';s=ref.read_text(encoding='utf-8')
a=s.index('Os capítulos 2 e 4');b=s.index('## Sequências',a)
s=s[:a]+'''Os capítulos 2 e 4 fundamentam classes, atributos, operações e multiplicidades. A seção 4.15 (PDF, pp. 213-218) distingue classes de tabelas e discute o mapeamento para persistência. As vistas CL desta revisão são conceituais, com nomes em português e responsabilidades do domínio. A visão geral tem oito classes; as vistas específicas têm quatro a seis. Uma classe conceitual não afirma que exista uma declaração TypeScript class com o mesmo nome.

As vistas DER são recortes relacionais em notação de classes UML: dez tabelas na visão geral e quatro ou cinco nas vistas específicas. CP significa chave primária e CE, chave estrangeira. Os nomes visíveis são traduções; a tabela de correspondência identifica as tabelas e campos reais. Campos e relações auxiliares permanecem no dicionário completo do banco. O Astah UML instalado não oferece o editor ER da edição Professional; a notação utilizada está explícita. A redução é de apresentação, sem alteração do schema.

'''+s[b:];ref.write_text(s,encoding='utf-8')
names={'APRENDIZAGEM':'Aprendizagem','COMUNIDADE':'Comunidade','DUELOS':'Duelos','RECRUTAMENTO':'Recrutamento','EVENTOS':'Eventos','IDENTIDADE':'Identidade'}
out=['# Modelagem do sistema em português','','A modelagem atual usa o Astah UML e segue a referência de Gilleanes Guedes. O catálogo tem 24 casos de uso, todos no diagrama geral. Classes conceituais representam o domínio; vistas relacionais representam um recorte da persistência. Identificadores do código-fonte são preservados na tabela de correspondência.','','## Visão geral dos casos de uso','',f'![Todos os 24 casos de uso]({link("UC-GERAL")})','','## Classes conceituais gerais','','Oito classes essenciais, com atributos e operações resumidos. As classes intermediárias aparecem nas vistas de cada domínio.','',f'![Oito classes conceituais]({link("CL-GERAL")})','','## Visão relacional geral','','Dez tabelas selecionadas e vínculos principais. O dicionário técnico mantém a estrutura completa, inclusive campos e relações auxiliares.','',f'![Visão relacional reduzida]({link("DER-GERAL")})']
for area,name in names.items():
    out+=['','## '+name,'',f'![Classes de {name.lower()}]({link("CL-"+area)})','',f'![Dados de {name.lower()}]({link("DER-"+area)})']
out+=['','## Leitura e correspondência','','- [Catálogo acadêmico e consolidação](catalogo-academico.md).','- [Sequências em português](sequencias.md).','- [Critérios de UML segundo Guedes](referencia-uml-guedes.md).','- [Dicionário completo do banco](../referencias/banco.md).','- [Regras e requisitos](requisitos-e-regras.md).']
(M/'modelagem.md').write_text('\n'.join(out)+'\n',encoding='utf-8')
source=M/'sequencias.md';backup=R/'evidencias-codigo/sequencias-especificacao-fonte.md'
if not backup.exists():shutil.copy2(source,backup)
out=['# Sequências e responsabilidades em português','','Os participantes, mensagens e condições são apresentados em português. Os nomes reais de funções e arquivos aparecem apenas na correspondência com o código. As chamadas e notas de resposta são elementos editáveis no Astah. A leitura completa inclui sucesso, alternativas e falhas descritos no catálogo e nas condições de cada sequência.']
for seq in plan['sequences']:
    out+=['','## '+seq['id']+' — '+seq['title'],'',f'![{seq["title"]}]({link(seq["id"])})','','Participantes: '+', '.join(seq['participants'])+'.','']
    conditions=[re.sub(r'^(alt|else|opt|loop)\s+','',c) for c in seq['conditions'] if c not in ['end','sequenceDiagram']]
    if conditions:out+=['Condições e contexto: '+('; '.join(conditions))+'.','']
    out+=['O cenário e as regras são detalhados no [catálogo consolidado](catalogo-academico.md) e no [caderno de código comentado](codigo-comentado.md).']
source.write_text('\n'.join(out)+'\n',encoding='utf-8')
bank=M/'banco-diagramas.md';s=bank.read_text(encoding='utf-8');s=s.replace(chr(96)*3+'mermaid',chr(96)*3+'text');bank.write_text(s,encoding='utf-8')
print('Portuguese native models linked from Markdown')

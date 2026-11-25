---
title: Técnicas de elicitação — brainstorming, JAD, FAST, PIECES, entrevistas, questionários, observação, etnografia, análise documental e prototipação
summary: Cada técnica de levantamento de requisitos explicada com quando usar, como conduzir e como reconhecê-la em uma questão de prova, além de uma tabela comparativa completa.
order: 3
level: básico
version: 4
updated: 2026-11-25
tags: [elicitação, levantamento de requisitos, brainstorming, jad, joint application design, fast, facilitated application specification techniques, pieces, entrevista estruturada, semiestruturada, não estruturada, questionário, observação, etnografia, análise documental, prototipação, workshop, cenários, grupo focal]
related: [processo-de-requisitos, requisitos-fundamentos, historias-e-casos-de-uso, modelos-de-processo]
---

## O que é

**Elicitação** (ou levantamento) de requisitos é a atividade de **descobrir** as necessidades, problemas, regras e restrições junto aos stakeholders. "Elicitar" vem de *trazer à tona*: muitos requisitos estão implícitos, na cabeça das pessoas ou escondidos no jeito como o trabalho é feito.

## Para que serve

Nenhuma técnica sozinha revela tudo: usuários esquecem detalhes, descrevem o trabalho idealizado em vez do real, discordam entre si ou não sabem o que é possível. Combinar técnicas reduz essas lacunas.

## Como funciona

### Entrevistas

Conversa planejada entre analista e stakeholder. Três tipos:

- **Estruturada (fechada):** roteiro **fixo**, mesmas perguntas na mesma ordem para todos; fácil de comparar e tabular, pouca profundidade.
- **Semiestruturada:** roteiro-base com liberdade para **aprofundar** e fazer perguntas de acompanhamento; a mais usada.
- **Não estruturada (aberta):** conversa livre sobre o tema; descobre o inesperado, mas difícil de analisar.

**Boas práticas:** preparar-se lendo documentos antes; começar por perguntas abertas; evitar perguntas indutoras; registrar e devolver um resumo para confirmação.

### Questionários

Lista de perguntas (fechadas ou abertas) enviada a **muitas pessoas**, geralmente **distribuídas geograficamente**. Bom para obter **dados quantitativos** e opiniões em escala; ruim para entender raciocínio e exceções (não há como perguntar "por quê?" na hora).

### Brainstorming

Sessão em grupo para **gerar muitas ideias** em pouco tempo. Regra central: **suspensão do julgamento** — na fase de geração, ninguém critica. Fases: (1) **geração** livre de ideias, com moderador e tempo limitado; (2) **análise/seleção** das ideias por critérios (votação, agrupamento). Ótimo para explorar novas soluções; não detalha requisitos.

### JAD — Joint Application Design

Técnica criada pela IBM (anos 1970) com **sessões de trabalho estruturadas** reunindo **usuários, gerentes e desenvolvedores** para definir requisitos e projeto **em conjunto**, com papéis definidos (**líder/facilitador**, escriba, patrocinador executivo, usuários, analistas). Etapas: preparação, sessões (dias de workshop) e documento final. Princípios: dinâmica de grupo, recursos visuais, processo organizado e documentação produzida **durante** as sessões. Resultado: decisões rápidas e comprometimento de todos.

### FAST — Facilitated Application Specification Techniques

Abordagem de **equipe facilitada** descrita por Pressman, semelhante ao JAD: clientes e desenvolvedores se reúnem com **regras de preparação e participação**, um **facilitador** neutro e uma **agenda formal**. Cada participante prepara listas (objetos, serviços, restrições, critérios de desempenho) **antes** da reunião; na sessão, as listas são combinadas, discutidas e transformadas em minispecificações. O foco é **especificação colaborativa** com agenda que incentiva o fluxo de ideias.

### PIECES

Não é uma reunião: é um **checklist (framework) para analisar problemas** do sistema atual e descobrir requisitos de melhoria, criado por James Wetherbe. Cada letra é uma categoria de pergunta:

| Letra | Categoria | Pergunta típica |
|---|---|---|
| **P** | Performance (desempenho) | o sistema é lento? a vazão é suficiente? |
| **I** | Information/data (informação e dados) | os dados estão corretos, completos, no formato certo? |
| **E** | Economics (economia) | custos altos? oportunidades de economia? |
| **C** | Control/security (controle e segurança) | há fraudes, erros, falta de controle de acesso? |
| **E** | Efficiency (eficiência) | há desperdício de tempo, esforço, retrabalho? |
| **S** | Service (serviço) | o serviço a clientes e usuários é bom, flexível, confiável? |

### Observação

O analista **observa** o usuário realizando o trabalho real, no próprio local. Revela passos que o usuário esquece de mencionar e a diferença entre o processo descrito e o praticado. Pode ser **passiva** (só observa) ou **ativa** (pergunta durante).

### Etnografia

Forma **aprofundada e prolongada** de observação, vinda da antropologia: o analista **imerge** no ambiente por dias ou semanas para entender a **cultura**, as relações sociais e os requisitos **implícitos** de cooperação. Excelente para requisitos sociais e organizacionais; demorada e não serve para inovação radical (mostra o que existe, não o que poderia existir).

### Análise documental

Estudo de **documentos existentes**: manuais, formulários, relatórios, leis, regulamentos, especificações de sistemas legados. Ótima para regras de negócio e para preparar entrevistas; documentos podem estar desatualizados.

### Prototipação

Construção rápida de uma **versão preliminar** (papel, wireframe, telas navegáveis) para que o usuário **veja, experimente e reaja**. Revela requisitos de interface e fluxo e **valida** entendimentos. Veja [Prototipação](lib:modelos-de-processo#prototipacao).

### Outras técnicas citadas

- **Workshop de requisitos:** reunião estruturada e delimitada entre analistas e representantes do cliente (JAD e FAST são tipos de workshop).
- **Cenários:** histórias concretas de interação ("Maria chega ao balcão, informa o CPF…"), úteis para descobrir fluxos e exceções. **Não** é o mesmo que observar o funcionário.
- **Grupo focal:** discussão moderada com um grupo representativo de usuários sobre percepções e necessidades.
- **Casos de uso e histórias de usuário:** também servem para elicitar, além de especificar.

## Características principais

| Técnica | Participantes | Melhor para | Limitação |
|---|---|---|---|
| Entrevista | 1 a 1 (ou poucos) | detalhes e raciocínio | tempo; depende do entrevistador |
| Questionário | muitos, distribuídos | dados quantitativos, opinião em escala | pouca profundidade |
| Brainstorming | grupo | **gerar ideias** sem críticas | não detalha requisitos |
| JAD | usuários + TI + gestores, com facilitador | **decisões conjuntas rápidas** sobre requisitos e projeto | caro reunir todos |
| FAST | clientes + desenvolvedores, facilitador, agenda formal | **especificação colaborativa** com listas preparadas | exige preparação |
| PIECES | analista (checklist) | **diagnosticar problemas** do sistema atual | não é técnica de reunião |
| Observação | analista no local | trabalho real, tarefas | pessoas mudam quando observadas |
| Etnografia | analista imerso por longo período | requisitos sociais e implícitos | muito demorada |
| Análise documental | analista | regras, formulários, leis | documentos desatualizados |
| Prototipação | usuários + equipe | requisitos de interface e validação | expectativa de "já pronto" |

## Exemplos práticos

:::example Escolhendo técnicas para um hospital
1. **Análise documental** de protocolos de triagem e da legislação.
2. **Entrevistas semiestruturadas** com enfermeiros-chefes e médicos.
3. **Observação** de um plantão na recepção (revela que a fila real é diferente da descrita).
4. **Questionário** para 300 pacientes sobre o tempo de espera.
5. **Sessão JAD** de dois dias com TI, direção e equipes para decidir o fluxo do novo sistema.
6. **Protótipo** navegável das telas de triagem para validação.
:::

## Representação visual

::figure{id="descoberta-analise-requisitos"}

Siga o ciclo da descoberta até a documentação. Classificar aproxima requisitos relacionados. Priorizar e negociar resolve conflitos antes de registrar o acordo. Entrevistas, cenários e observação alimentam a descoberta, cada técnica com um tipo de evidência.

## Diferenças entre conceitos semelhantes

| Fica confuso? | Diferença-chave |
|---|---|
| **Brainstorming × JAD** | brainstorming **gera ideias sem crítica**; JAD **decide** requisitos e projeto com papéis e facilitador |
| **JAD × FAST** | ambos são sessões facilitadas; FAST (Pressman) enfatiza **listas preparadas antes** e **minispecificações**; JAD (IBM) enfatiza **sessões de vários dias** com papéis formais e documento final |
| **Observação × etnografia** | etnografia é observação **imersiva e prolongada**, focada em cultura e aspectos sociais |
| **Entrevista estruturada × questionário** | ambos têm perguntas fixas, mas a entrevista é **presencial/síncrona** com um respondente; o questionário é **autoaplicado** em escala |
| **PIECES × brainstorming** | PIECES é um **checklist de análise** de problemas; brainstorming é uma **dinâmica de grupo** |
| **Cenário × observação** | cenário é uma **história escrita** de interação; observação é **ver o trabalho** acontecendo |

## Como cai no ENADE

:::enade
O ENADE descreve um **procedimento** e pede o nome da técnica. Procure as pistas: "não podia criticar as ideias" → **brainstorming**; "facilitador, agenda, usuários e desenvolvedores juntos" → **JAD/FAST**; "seis categorias de problemas" → **PIECES**; "acompanhar o funcionário" → **observação**; "imersão na cultura" → **etnografia**.
:::

## Pegadinhas

:::trap Brainstorming pode ter seleção depois
A proibição de críticas vale só na **geração**. Selecionar as melhores ideias e votar depois continua sendo brainstorming (ENADE 2008).
:::

:::trap Cenário não é observação
Uma afirmativa que define "cenário" como "observar as ações do funcionário" está errada (ENADE 2011).
:::

:::trap Protótipo não depende de outros sistemas
Prototipagem explora os requisitos **deste** projeto; não é "baseada em requisitos de outros sistemas da organização".
:::

## Questões comentadas

::question 2008-objective-17 Ideias no chat, sem críticas, depois votação

Gerar ideias livremente, **sem criticar as dos outros**, com tempo limitado, e só depois analisar e votar nas melhores é a estrutura do **brainstorming** (alternativa E), apenas adaptado a um chat. JAD e FAST envolvem sessões facilitadas para especificar requisitos; PIECES é um checklist de problemas.

::question 2011-objective-9 Workshop, cenário, entrevista e prototipagem

**I** correta (workshop é reunião estruturada e delimitada com representantes do cliente); **II** errada (descreve **observação**, não cenário); **III** correta (entrevistas podem ser abertas ou fechadas); **IV** errada (protótipo não precisa se basear em outros sistemas). Resposta: **I e III**.

## Resumo para memorizar

:::summary
- **Entrevista**: estruturada (roteiro fixo), semiestruturada (roteiro + aprofundamento), não estruturada (livre).
- **Questionário**: muitas pessoas, distribuídas, dados quantitativos.
- **Brainstorming**: gerar ideias **sem crítica**, depois selecionar.
- **JAD**: sessões estruturadas usuários + TI com facilitador (IBM).
- **FAST**: equipe facilitada, agenda formal, listas preparadas (Pressman).
- **PIECES**: checklist — Performance, Informação, Economia, Controle, Eficiência, Serviço.
- **Observação** (trabalho real) × **etnografia** (imersão prolongada na cultura).
- **Análise documental**: manuais, formulários, leis. **Prototipação**: ver e validar.
:::

:::mnemonic PIECES
"**P**ara **I**dentificar **E**rros, **C**omece **E**xaminando o **S**istema" — Performance, Informação, Economia, Controle, Eficiência, Serviço.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Um analista passa três semanas convivendo com a equipe de uma central de atendimento para entender as relações e práticas informais de trabalho. Qual técnica é essa?",
    "options": ["Questionário", "Etnografia", "PIECES", "Entrevista estruturada"],
    "answer": 1,
    "explanation": "Imersão prolongada para entender cultura e práticas sociais é etnografia."
  },
  {
    "question": "Qual técnica é mais indicada para colher a opinião de 2.000 clientes espalhados pelo país?",
    "options": ["JAD", "Observação", "Questionário", "Etnografia"],
    "answer": 2,
    "explanation": "Questionários alcançam muitas pessoas distribuídas e geram dados tabuláveis."
  },
  {
    "question": "Em PIECES, a letra C refere-se a:",
    "options": ["Custos", "Controle e segurança", "Clientes", "Cronograma"],
    "answer": 1,
    "explanation": "Control: controle e segurança. Custos estão em Economics (E)."
  },
  {
    "question": "O que distingue o JAD de um brainstorming?",
    "options": ["O JAD proíbe usuários", "O JAD é uma sessão estruturada, com papéis e facilitador, para decidir requisitos em conjunto", "O brainstorming exige documento final aprovado", "Não há diferença"],
    "answer": 1,
    "explanation": "Brainstorming gera ideias; JAD estrutura decisões conjuntas sobre requisitos e projeto."
  }
]
:::

## Referências

- SOMMERVILLE, Ian. *Engenharia de software*. 10. ed. São Paulo: Pearson, 2018.
- PRESSMAN, R. S.; MAXIM, B. R. *Engenharia de Software*. 8. ed. AMGH, 2016 — cap. 8 (coleta colaborativa de requisitos, FAST).
- WOOD, J.; SILVER, D. *Joint Application Development*. 2. ed. Wiley, 1995.
- WETHERBE, J. C. *Systems Analysis and Design: Best Practices*. West Publishing, 1994 (framework PIECES).
- INEP. ENADE TADS 2008 (questão 17) e 2011 (questão 9).
- SOMMERVILLE, Ian; SAWYER, Pete. *Requirements engineering: a good practice guide*. Chichester: Wiley, 1997.

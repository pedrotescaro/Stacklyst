---
title: Modelos de processo — Cascata, V, Incremental, Iterativo, Evolucionário, Prototipação, Espiral e RAD
summary: Os modelos clássicos de ciclo de vida explicados do zero, com quando usar cada um, vantagens, desvantagens e uma tabela comparativa para não confundir na prova.
order: 2
level: básico
version: 4
updated: 2026-11-25
tags: [modelos de processo, ciclo de vida, cascata, waterfall, sequencial linear, modelo v, incremental, iterativo, evolucionário, prototipação, espiral, boehm, rad, desenvolvimento rápido de aplicações]
related: [fundamentos-engenharia-de-software, metodos-ageis, rup-visao-geral, gerencia-de-projetos-e-riscos, fundamentos-de-testes]
---

## O que é

Um **modelo de processo** (ou **modelo de ciclo de vida**) é uma **descrição abstrata** de como organizar as atividades de desenvolvimento no tempo: quais etapas existem, em que **ordem** acontecem e o que cada uma entrega. Ele não diz *como* programar; diz *como encadear* requisitos, projeto, construção, testes e entrega.

Os modelos se dividem em duas grandes famílias:

- **Dirigidos por plano (prescritivos):** tudo é planejado antes, e o progresso é medido em relação ao plano — Cascata, Modelo V.
- **Iterativos/evolucionários:** o sistema cresce em ciclos, com feedback do cliente a cada volta — Incremental, Prototipação, Espiral, RAD, RUP e os métodos ágeis.

## Para que serve

Escolher o modelo certo é escolher **como lidar com a incerteza**. Se os requisitos são estáveis e bem conhecidos, um plano sequencial funciona. Se o cliente ainda não sabe exatamente o que quer, ou se há riscos técnicos altos, é melhor descobrir aos poucos. Escolher errado leva a retrabalho, atrasos ou a um sistema que ninguém usa.

## Como funciona

### Modelo Cascata (sequencial linear ou clássico)

Royce discutiu o fluxo sequencial em 1970 e mostrou retornos entre etapas vizinhas. Uma síntese das etapas, da definição à manutenção, é:

**Requisitos → Projeto → Implementação → Testes → Implantação → Manutenção**

- Cada etapa produz **documentos** que servem de entrada para a próxima.
- Volta atrás é cara: um erro de requisito descoberto nos testes obriga a refazer projeto e código.
- O cliente só vê o software funcionando **no final**.

**Quando usar:** requisitos estáveis e bem compreendidos, sistemas com contrato fixo, equipes distribuídas que dependem de documentação, ou partes de sistemas críticos com regulamentação.

O **modelo sequencial linear** é o nome que Pressman dá ao cascata em suas primeiras edições; na prática, o ENADE trata como sinônimos.

### Modelo V

Variação do cascata que **associa cada etapa de especificação a um nível de teste**. O lado esquerdo do "V" desce detalhando o sistema; o lado direito sobe testando:

| Lado esquerdo (definição) | ↔ | Lado direito (verificação/validação) |
|---|---|---|
| Requisitos do usuário | ↔ | Teste de aceitação |
| Requisitos do sistema / análise | ↔ | Teste de sistema |
| Projeto da arquitetura | ↔ | Teste de integração |
| Projeto detalhado de módulos | ↔ | Teste de unidade |
| — base: codificação — | | |

O quadro usa uma divisão comum em requisitos de usuário e de sistema. A figura adiante segue os artefatos que Pressman e Maxim nomeiam. O planejamento de cada teste é feito **junto** com a etapa correspondente (o plano de teste de aceitação nasce com os requisitos). É muito usado em sistemas críticos (automotivo, médico, aeronáutico).

### Modelo Incremental

O sistema é entregue em **partes funcionais (incrementos)**. O primeiro incremento costuma ser o **núcleo** essencial; os seguintes acrescentam funcionalidades. Cada incremento passa por **especificação, desenvolvimento e validação** — é como vários "minicascatas" em sequência ou parcialmente sobrepostos.

- O cliente usa partes do sistema **cedo**.
- As funcionalidades mais importantes são entregues primeiro e são as mais testadas.
- Requisitos gerais são definidos no início; o detalhe de cada incremento vem depois.

### Modelo Iterativo

Desenvolve o sistema em **ciclos repetidos** (iterações), em que **a mesma parte pode ser refinada** várias vezes. A diferença sutil:

- **Incremental** = acrescentar **novas partes** (fatia por fatia).
- **Iterativo** = **revisitar e melhorar** o que já existe (volta por volta).

Na prática, quase todos os processos modernos (RUP, Scrum) são **iterativos e incrementais**: cada iteração refina o que existe e acrescenta funcionalidade.

### Modelo Evolucionário

Família de modelos em que o software **evolui** a partir de uma versão inicial, por meio de feedback contínuo do cliente. Há dois tipos clássicos (Sommerville):

- **Desenvolvimento exploratório:** começa pelas partes mais bem entendidas e evolui com o cliente até o sistema final.
- **Prototipação descartável (throwaway):** o protótipo serve só para entender requisitos e depois é jogado fora.

Pressman classifica **Prototipação** e **Espiral** como modelos evolucionários.

### Prototipação

Constrói-se rapidamente uma **versão preliminar** (protótipo) para que o cliente **veja e experimente**, ajudando a descobrir e validar requisitos.

Ciclo: **comunicação → plano rápido → modelagem rápida → construção do protótipo → avaliação do cliente → (repete)**.

- **Protótipo descartável:** feito só para aprender; o sistema real é construído depois, com qualidade.
- **Protótipo evolutivo:** é refinado até virar o produto final.
- Fidelidade: de **papel/wireframe** (baixa) até telas navegáveis (alta).

**Quando usar:** o cliente não consegue expressar os requisitos com clareza, há dúvidas sobre a interface ou sobre a viabilidade de um algoritmo.

**Riscos:** o cliente acha que o protótipo "já está pronto" e pressiona para colocá-lo em produção; decisões ruins feitas "às pressas" no protótipo viram parte do sistema.

### Modelo Espiral (Boehm, 1988)

Combina a natureza iterativa da prototipação com o controle sistemático do cascata e acrescenta o que nenhum outro tinha de forma explícita: **análise de riscos**. Cada volta da espiral passa por quatro quadrantes:

1. **Determinar objetivos**, alternativas e restrições;
2. **Avaliar alternativas, identificar e resolver riscos** (protótipos e simulações entram aqui);
3. **Desenvolver e verificar** o produto daquela volta;
4. **Planejar** a próxima volta (com revisão do cliente).

O raio da espiral representa o **custo acumulado**; o ângulo, o progresso. As primeiras voltas podem gerar só um conceito ou um protótipo; as últimas, versões completas.

**Quando usar:** sistemas grandes, caros e de alto risco. **Desvantagem:** exige experiência real em avaliação de riscos e pode ser difícil de controlar contratualmente.

### RAD — Rapid Application Development

Modelo **incremental** que enfatiza um **ciclo de desenvolvimento muito curto** (classicamente de 60 a 90 dias) por meio de **reutilização de componentes**, **geradores de código**, ferramentas visuais e **equipes paralelas**, cada uma cuidando de uma função do sistema.

Fases típicas: modelagem do negócio → modelagem dos dados → modelagem do processo → **geração da aplicação** → teste e entrega (*turnover*).

**Quando usar:** sistemas que podem ser **modularizados** e cujos requisitos são bem entendidos, com cliente disponível. **Não serve** para sistemas de alto risco técnico, com alto desempenho exigido ou que não possam ser divididos.

## Características principais

| Modelo | Ideia central | Entrega ao cliente | Lida bem com mudança? | Destaque |
|---|---|---|---|---|
| Cascata | etapas sequenciais | no final | não | documentação por etapa |
| Modelo V | cada etapa ↔ um nível de teste | no final | não | verificação e validação planejadas |
| Incremental | partes funcionais em sequência | a cada incremento | parcialmente | núcleo primeiro |
| Iterativo | refinar em ciclos | a cada iteração | sim | melhoria contínua |
| Prototipação | protótipo para descobrir requisitos | protótipos | sim | foco em requisitos e interface |
| Espiral | ciclos guiados por **risco** | por volta | sim | **análise de risco** explícita |
| RAD | ciclo curto com reúso e equipes paralelas | 60–90 dias | parcialmente | **velocidade** |

## Exemplos práticos

:::example Qual modelo escolher?
- **Software de controle de marca-passo**, requisitos regulamentados e estáveis → **Modelo V**.
- **Sistema de folha de pagamento** de um órgão público, regras conhecidas e contrato fechado → **Cascata**.
- **Portal de autoatendimento** em que o cliente não sabe como quer as telas → **Prototipação**.
- **Sistema de defesa aérea**, caríssimo e com muitas incertezas técnicas → **Espiral**.
- **Sistema de gestão de uma piscicultura** em que o cliente quer usar logo o módulo de engorda e depois os demais → **Incremental**.
- **Sistema interno de cadastros** que precisa ficar pronto em dois meses, com ferramentas de geração e componentes prontos → **RAD**.
:::

## Representação visual

::figure{id="modelo-cascata"}

Os cinco estágios seguem em degraus. As setas de retorno permitem revisar atividades anteriores. Compare essa sequência com a de Pressman e Maxim, que organizam o trabalho em comunicação, planejamento, modelagem, construção e entrega. No ENADE, relacione o planejamento antecipado ao custo de descobrir problemas de requisitos só nos testes.

### Modelo V e suas verificações

::figure{id="modelo-v"}

Desça pela definição e pelo projeto até o executável e suba pelos testes. As ligações tracejadas mostram sobre quais trabalhos anteriores os testes fornecem evidência na versão de Pressman e Maxim. No ENADE, faça a correspondência conforme os artefatos nomeados no enunciado, da implementação da unidade aos requisitos examinados na aceitação.

### Desenvolvimento incremental

::figure{id="incrementos-sommerville"}

Na versão de Sommerville, especificação, desenvolvimento e validação se sobrepõem. A descrição geral dá origem a uma versão inicial, versões intermediárias e uma final. Cada entrega ajuda a confirmar o que já funciona e o que a próxima versão precisa incorporar.

### Desenvolvimento orientado para o reúso

::figure{id="processo-reuso-sommerville"}

As alternativas disponíveis ajudam a refinar os requisitos antes de configurar uma aplicação, adaptar componentes ou desenvolver o que falta.

### Modelo espiral de Boehm

::figure{id="espiral-boehm"}

Comece no centro e percorra os quadrantes no sentido indicado. Cada volta define objetivos, investiga alternativas e riscos, desenvolve e verifica o resultado e prepara o próximo compromisso. A distância ao centro representa custo acumulado. No ENADE, localize a análise de risco e identifique quando um protótipo ajuda a decidir o que construir.

### Custo relativo de mudar

::widget boehm-custo-mudanca

Fonte: adaptado de BOEHM (1981, cap. 4) — recriado pela equipe Stacklyst.

Compare o custo relativo de corrigir o mesmo tipo de problema em diferentes etapas. As curvas qualitativas ilustram que a correção tardia pode alcançar mais artefatos e custar proporcionalmente mais em projetos maiores. No ENADE, relacione a validação antecipada dos requisitos à redução do retrabalho.

## Vantagens e desvantagens

| Modelo | Vantagens | Desvantagens |
|---|---|---|
| Cascata | simples, fácil de gerenciar, bem documentado | rígido; erros de requisito descobertos tarde; cliente espera até o fim |
| V | testes planejados cedo; rastreabilidade | igualmente rígido; caro mudar requisitos |
| Incremental | entregas cedo; menor risco de fracasso total | precisa de arquitetura que suporte crescer; definir incrementos é difícil |
| Prototipação | esclarece requisitos; envolve o cliente | expectativas irreais; qualidade comprometida se o protótipo virar produto |
| Espiral | riscos tratados explicitamente; flexível | complexo; depende de especialistas em risco |
| RAD | muito rápido; reúso alto | exige modularidade, cliente disponível e equipes grandes; ruim para alto risco técnico |

## Diferenças entre conceitos semelhantes

| Confusão comum | Como diferenciar |
|---|---|
| Incremental × Iterativo | incremental **acrescenta partes**; iterativo **refina o que existe** |
| Prototipação × Incremental | protótipo serve para **aprender requisitos** (pode ser descartado); incremento é **parte do produto final** |
| Espiral × Prototipação | ambos evoluem em ciclos, mas a espiral é guiada por **análise de risco** |
| Cascata × Modelo V | o V **explicita a correspondência** entre cada especificação e um nível de teste |
| RAD × Ágil | RAD foca em **ferramentas, reúso e geração de código**; ágil foca em **pessoas, colaboração e adaptação** |
| Evolucionário × Incremental | no evolucionário os **requisitos amadurecem** com o feedback; no incremental os requisitos gerais já existem e são entregues em partes |

## Como cai no ENADE

:::enade Padrões frequentes
- **Asserção-razão** sobre o cascata (caráter sequencial e sistemático).
- **Itens I, II, III** misturando características de incremental, espiral e cascata — o detalhe errado costuma estar em atribuir a **uma fase** algo que pertence a **outra** (por exemplo, colocar estimativa e análise de risco na "modelagem" da espiral).
- **Cenários** ("o cliente não sabe expressar os requisitos", "o projeto é de alto risco") pedindo o modelo adequado.
:::

## Pegadinhas

:::trap Na espiral, risco não é "modelagem"
Estimativas, cronograma e análise de risco ficam nas fases de **planejamento** e **análise de riscos**. Uma afirmativa que os coloca na fase de **modelagem** está errada (ENADE 2017).
:::

:::trap "O cascata não permite voltar"
O modelo original de Royce já previa retornos (feedback) entre etapas; o problema é que voltar é **caro**. Cuidado com afirmações absolutas.
:::

:::trap Protótipo não é o sistema
Um protótipo descartável não deve ser colocado em produção. Se a alternativa sugere isso como vantagem, desconfie.
:::

## Questões comentadas

::question 2017-objective-21 Incremental, espiral e cascata

**I** está correta: cada incremento passa por especificação, desenvolvimento e validação. **II** está errada: estimativas, cronograma e análise de riscos pertencem ao planejamento/análise de riscos, não à "modelagem". **III** está correta: o cascata é sequencial e sistemático, da especificação à entrega. Resposta: **I e III**.

::question 2011-objective-27 Cascata em asserção-razão

A segunda asserção (o cascata é composto por etapas executadas de forma sistemática e sequencial) é **verdadeira** — é a definição do modelo. A primeira (o cascata *acrescenta* aspectos gerenciais como planejamento, controle e tomada de decisão) foi considerada **falsa** pelo gabarito: não é isso que caracteriza o cascata; acrescentar planejamento e decisão explícitos a cada ciclo é marca de modelos como o **espiral**. Gabarito: primeira falsa, segunda verdadeira.

## Resumo para memorizar

:::summary
- **Cascata**: sequencial, documentado, cliente vê no fim. Bom para requisitos estáveis.
- **V**: cascata + cada etapa ligada a um nível de teste (aceitação, sistema, integração, unidade).
- **Incremental**: entrega em partes; cada parte = especificar, desenvolver, validar.
- **Iterativo**: refina em ciclos. Moderno = iterativo **e** incremental.
- **Prototipação**: protótipo para descobrir requisitos (descartável ou evolutivo).
- **Espiral**: ciclos guiados por **risco** (objetivos → riscos → desenvolvimento → planejamento).
- **RAD**: ciclo curto (60–90 dias), reúso, geração de código, equipes paralelas.
:::

:::mnemonic Quem é o "dono" de cada palavra-chave
**Risco** → Espiral · **Velocidade** → RAD · **Teste espelhado** → V · **Partes** → Incremental · **Descobrir requisitos** → Prototipação · **Sequência** → Cascata.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Um cliente não consegue explicar como deve funcionar a tela de agendamento de consultas. Qual modelo ajuda mais nesse caso?",
    "options": ["Cascata", "Prototipação", "Modelo V", "RAD"],
    "answer": 1,
    "explanation": "A prototipação permite que o cliente veja e experimente uma versão preliminar, esclarecendo os requisitos."
  },
  {
    "question": "Qual modelo tem a análise de riscos como atividade explícita em cada ciclo?",
    "options": ["Incremental", "Cascata", "Espiral", "Modelo V"],
    "answer": 2,
    "explanation": "O espiral de Boehm dedica um quadrante de cada volta à identificação e resolução de riscos."
  },
  {
    "question": "No modelo V, o teste de aceitação está associado a qual etapa do lado esquerdo?",
    "options": ["Projeto detalhado", "Projeto da arquitetura", "Requisitos do usuário", "Codificação"],
    "answer": 2,
    "explanation": "Aceitação valida os requisitos do usuário; integração valida a arquitetura; unidade valida o projeto detalhado."
  },
  {
    "question": "Qual é a diferença essencial entre incremental e iterativo?",
    "options": ["Não há diferença", "Incremental acrescenta novas partes; iterativo refina o que já existe", "Iterativo só existe no cascata", "Incremental não entrega software funcionando"],
    "answer": 1,
    "explanation": "Os dois costumam ser combinados, mas a ênfase é diferente: acrescentar × refinar."
  }
]
:::

## Referências

- PRESSMAN, Roger S.; MAXIM, Bruce R. *Engenharia de software: uma abordagem profissional*. 8. ed. Porto Alegre: AMGH, 2016.
- SOMMERVILLE, Ian. *Engenharia de software*. 10. ed. São Paulo: Pearson, 2018.
- BOEHM, Barry W. A spiral model of software development and enhancement. *Computer*, New York, v. 21, n. 5, p. 61–72, 1988. DOI: 10.1109/2.59.
- BOEHM, Barry W. *Software engineering economics*. Englewood Cliffs: Prentice-Hall, 1981.
- ROYCE, Winston W. Managing the development of large software systems. In: IEEE WESCON, 1970, Los Angeles. *Proceedings [...]*. New York: IEEE, 1970. p. 1–9.
- INEP. ENADE TADS 2011 (questão 27) e 2017 (questão 21).

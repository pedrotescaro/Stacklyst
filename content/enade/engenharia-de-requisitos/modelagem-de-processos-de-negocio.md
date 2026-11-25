---
title: Modelagem de processos de negócio — BPM, EPC/ARIS e BPMN
summary: O ciclo de gestão de processos de negócio (BPM), a linguagem gráfica EPC do método ARIS (eventos, funções e conectores lógicos) e uma comparação com BPMN.
order: 5
level: intermediário
version: 3
updated: 2026-11-25
tags: [processos de negócio, bpm, gestão de processos, epc, event-driven process chain, aris, conectores, xor, and, or, bpmn, modelagem as-is, to-be, otimização]
related: [requisitos-fundamentos, uml-atividades-e-estados, tecnicas-de-elicitacao, sistemas-de-informacao-empresariais]
---

## O que é

Um **processo de negócio** é um conjunto de **atividades encadeadas** que transforma entradas em um resultado de valor para um cliente (interno ou externo): "atender um pedido", "admitir um funcionário", "conceder um empréstimo".

**BPM (Business Process Management)** é a disciplina de gestão que **planeja, modela, executa, monitora e otimiza** processos continuamente. Para modelar, usam-se linguagens gráficas — as mais cobradas são **EPC** (do método **ARIS**) e **BPMN**.

## Para que serve

Antes de informatizar, é preciso entender **"o que precisa ser feito"** e **"como precisa ser feito"** na organização. Modelos de processo:

- revelam gargalos, retrabalho e responsabilidades;
- servem de base para **requisitos** de sistemas (a disciplina de Modelagem de Negócios do RUP);
- permitem comparar o processo **atual (as-is)** com o **futuro (to-be)**.

## Como funciona

### O ciclo de BPM

Diferentes autores usam nomes um pouco diferentes; a ideia é sempre um **ciclo contínuo**:

1. **Planejamento** — alinhar processos à estratégia e escolher o que melhorar;
2. **Modelagem/análise** — documentar o *as-is* e desenhar o *to-be*;
3. **Implantação/execução** — colocar o processo em prática (com ou sem sistemas, como BPMS);
4. **Monitoramento/controle** — medir indicadores de desempenho;
5. **Otimização/refinamento** — analisar resultados e **melhorar continuamente**, evitando que os processos **estagnem**.

### EPC — Event-driven Process Chain (ARIS)

O **ARIS** (*Architecture of Integrated Information Systems*, August-Wilhelm Scheer) é um método/arquitetura de modelagem empresarial; seu diagrama mais conhecido é a **EPC — Cadeia de Processos Dirigida por Eventos**.

| Elemento | Símbolo | Significado |
|---|---|---|
| **Evento** | **hexágono** | um estado/condição que **dispara** ou **resulta** de uma função ("pedido recebido", "crédito aprovado") |
| **Função (atividade)** | **retângulo de bordas arredondadas** | uma tarefa executada ("verificar crédito") |
| **Conector lógico** | círculo com ∧ (E), ∨ (OU) ou XOR | divisão ou junção do fluxo: paralelismo (AND), escolha exclusiva (XOR), escolha inclusiva (OR) |
| **Unidade organizacional** | elipse com traço | quem executa a função |
| **Informação/objeto** | retângulo | dados usados ou produzidos |
| **Interface de processo** | seta para outro processo | ligação com outro processo |

**Regras importantes:**

- O processo **começa e termina com eventos**.
- Eventos e funções **se alternam** (evento → função → evento…).
- Um **evento não toma decisões**: depois de um evento, não pode haver divisão por XOR ou OR (só AND); decisões são feitas por **funções**, seguidas de um conector XOR/OR e de eventos de resultado.
- **Conectores** organizam decisões, paralelismo e convergência — não são simples "ligações entre processos" (essa ligação é a **interface de processo**).

### BPMN — Business Process Model and Notation

Padrão da OMG, hoje o mais usado. Elementos: **eventos** (círculos: início, intermediário, fim), **atividades** (retângulos arredondados: tarefas e subprocessos), **gateways** (losangos: exclusivo ×, paralelo +, inclusivo ○), **fluxos de sequência**, **piscinas e raias** (participantes e responsáveis), **objetos de dados** e **fluxos de mensagem** entre participantes.

## Características principais

- Foco no **negócio**, não no software.
- Modelos *as-is* (como é) e *to-be* (como deve ser).
- EPC é **dirigida por eventos** e alterna eventos e funções.
- BPMN separa responsáveis em **raias** e é executável em ferramentas BPMS.

## Exemplos práticos

:::example Aprovação de crédito em EPC (descrição)
Evento **"Pedido de crédito recebido"** → função **"Analisar cadastro"** → evento **"Cadastro analisado"** → função **"Decidir crédito"** → conector **XOR** → evento **"Crédito aprovado"** *ou* evento **"Crédito negado"**. Do lado aprovado: função **"Liberar valor"** → evento final **"Valor liberado"**.
:::

## Representação visual

::figure{id="epc-concessao-credito"}

Leia os hexágonos como eventos e os retângulos arredondados como funções. O XOR sai da função que toma a decisão e habilita um único evento de resultado. No ENADE, confira se a cadeia começa e termina com eventos e se o ponto de escolha sucede uma função.

::figure{id="ciclo-gestao-processos"}

A identificação define qual processo merece atenção. Depois, a equipe mapeia o trabalho atual, analisa problemas, projeta e implanta mudanças. O monitoramento guia a próxima volta. No ENADE, reconheça a otimização contínua quando os resultados observados voltam para orientar a análise e o redesenho.

## Vantagens e desvantagens

| Notação | Vantagens | Desvantagens |
|---|---|---|
| EPC/ARIS | simples, ênfase em eventos, integrada ao método ARIS e ao SAP | regras de alternância rígidas; menos usada hoje |
| BPMN | padrão internacional, raias, executável em BPMS | muitos símbolos; curva de aprendizado |
| Diagrama de atividades UML | integra-se aos demais modelos do software | menos voltado a analistas de negócio |

## Diferenças entre conceitos semelhantes

- **EPC × BPMN:** em EPC, **eventos e funções se alternam** e eventos são hexágonos; em BPMN, eventos são **círculos** e decisões são **gateways** em losango.
- **Conector × interface de processo (EPC):** conector **divide/junta o fluxo** com lógica (AND, OR, XOR); interface de processo **liga um processo a outro**.
- **Modelagem de negócio × requisitos:** a primeira descreve a **organização**; a segunda, o **sistema** que vai apoiá-la.
- **Monitoramento × otimização:** monitorar é **medir**; otimizar é **mudar** o processo com base nas medições.

## Como cai no ENADE

:::enade
Afirmações sobre **símbolos e regras da EPC** (2011: o processo começa e termina em evento; funções são retângulos arredondados) e sobre as **fases do BPM** (2011: a fase que evita a estagnação é a **otimização**).
:::

## Pegadinhas

:::trap Conector não é "ligação entre dois processos"
Na EPC, conectores lógicos tratam decisões, paralelismo e convergência. A ligação entre processos é a **interface de processo**.
:::

:::trap Monitorar não evita estagnação sozinho
É a **otimização** que transforma medições em melhoria contínua.
:::

## Questões comentadas

::question 2011-objective-13 Linguagem gráfica EPC/ARIS

**I** errada: a ligação entre processos não é feita por um "conector" (conectores são lógicos). **II** correta: a descrição deve **iniciar e terminar em um evento**. **III** correta: funções são **retângulos de bordas arredondadas**. Resposta: **II e III** (alternativa E).

::question 2011-objective-17 Fase do BPM que evita a estagnação

A **otimização** revê resultados e busca melhorias contínuas, impedindo que o processo fique estático (alternativa E).

## Resumo para memorizar

:::summary
- BPM = ciclo **planejar → modelar → implantar → monitorar → otimizar**.
- EPC (ARIS): **evento = hexágono**, **função = retângulo arredondado**, **conectores** AND/OR/XOR.
- EPC **começa e termina com evento**; eventos e funções **se alternam**; evento não decide.
- BPMN: eventos em círculo, atividades arredondadas, **gateways** em losango, **raias**.
:::

:::mnemonic EPC
"**E**vento **P**uxa **C**adeia": tudo começa com um evento, que dispara uma função, que produz outro evento.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Na EPC, como é representada uma função (atividade)?",
    "options": ["Hexágono", "Retângulo de bordas arredondadas", "Losango", "Círculo"],
    "answer": 1,
    "explanation": "Funções são retângulos arredondados; eventos são hexágonos."
  },
  {
    "question": "Qual regra da EPC está correta?",
    "options": ["O processo pode começar por uma função", "Depois de um evento pode haver divisão XOR", "O processo começa e termina com eventos", "Conectores ligam processos diferentes"],
    "answer": 2,
    "explanation": "A cadeia começa e termina em eventos; decisões (XOR/OR) vêm depois de funções."
  },
  {
    "question": "Em BPMN, o gateway com '+' representa:",
    "options": ["Decisão exclusiva", "Fluxos em paralelo", "Fim do processo", "Mensagem entre participantes"],
    "answer": 1,
    "explanation": "O gateway paralelo divide ou sincroniza caminhos executados ao mesmo tempo."
  }
]
:::

## Referências

- SCHEER, August-Wilhelm. *ARIS: business process modeling*. 3. ed. Berlin: Springer, 2000. DOI: 10.1007/978-3-642-57108-4.
- BALDAM, R.; VALLE, R.; ROZENFELD, H. *Gerenciamento de Processos de Negócio — BPM*. 2. ed. Érica, 2009.
- OMG. *Business Process Model and Notation (BPMN)*, v2.0.2, 2014.
- ABPMP. *BPM CBOK — Guia para o Gerenciamento de Processos de Negócio*, v3, 2013.
- INEP. ENADE TADS 2011, questões 13 e 17.
- DUMAS, Marlon; LA ROSA, Marcello; MENDLING, Jan; REIJERS, Hajo A. *Fundamentals of business process management*. 2. ed. Berlin: Springer, 2018. DOI: 10.1007/978-3-662-56509-4.

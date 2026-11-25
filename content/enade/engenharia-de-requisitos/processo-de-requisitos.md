---
title: Processo de engenharia de requisitos — viabilidade, elicitação, análise, especificação, validação, priorização e rastreabilidade
summary: As atividades da engenharia de requisitos, os artefatos de cada etapa, técnicas de priorização (MoSCoW e outras), validação, gerenciamento de mudanças e a matriz de rastreabilidade.
order: 2
level: intermediário
version: 2
updated: 2026-11-25
tags: [engenharia de requisitos, estudo de viabilidade, elicitação, análise, negociação, especificação, documento de requisitos, srs, validação, revisão, priorização, moscow, matriz de rastreabilidade, gerenciamento de requisitos]
related: [requisitos-fundamentos, tecnicas-de-elicitacao, historias-e-casos-de-uso, qualidade-de-software, rup-disciplinas]
---

## O que é

**Engenharia de requisitos** é o processo de **descobrir, analisar, documentar, validar e gerenciar** os requisitos de um sistema. Pressman a descreve como uma ação que **começa na comunicação** com o cliente e **continua na modelagem**, adaptada ao projeto e às pessoas envolvidas.

## Para que serve

Garante que a equipe construa **o sistema certo**: corrigir um erro de requisito depois que o sistema está pronto pode custar dezenas de vezes mais do que corrigi-lo na fase de requisitos.

## Como funciona

### As atividades (Sommerville)

| Subprocesso | Pergunta | Artefatos típicos |
|---|---|---|
| **Estudo de viabilidade** | o sistema será útil e possível (técnica, econômica e operacionalmente)? | relatório/estudo de viabilidade |
| **Elicitação e análise** | quais são as necessidades e como organizá-las? | registros de entrevistas, atas de workshops, modelos preliminares |
| **Especificação** | como registrar de forma padronizada? | documento de requisitos (SRS), **modelo de casos de uso**, histórias de usuário |
| **Validação** | os requisitos descrevem o sistema que o cliente quer? | revisões, **protótipos de telas**, casos de teste derivados |
| **Gerenciamento** | como controlar mudanças? | **matriz de rastreabilidade**, solicitações de mudança |

Na prática as atividades são **iterativas** — uma espiral de elicitar, especificar e validar.

### Elicitação e análise em detalhe

1. **Descoberta** — interagir com stakeholders usando [técnicas de elicitação](lib:tecnicas-de-elicitacao).
2. **Classificação e organização** — agrupar requisitos relacionados (por módulo, por ator).
3. **Priorização e negociação** — resolver **conflitos** entre stakeholders e decidir o que vem primeiro.
4. **Especificação** — documentar e alimentar a próxima volta.

### Especificação

O **documento de requisitos** (SRS — *Software Requirements Specification*) reúne introdução, glossário, requisitos de usuário e de sistema, modelos e restrições. Em processos ágeis, a especificação vive no **backlog** como histórias de usuário com **critérios de aceitação**. Em processos baseados em UML, **casos de uso** especificam os requisitos **funcionais**; os não funcionais vão para uma **especificação suplementar**.

### Validação

Verifica se os requisitos são **válidos, consistentes, completos, realistas e verificáveis**. Técnicas: **revisões** de requisitos com stakeholders, **prototipação** (o usuário vê e confirma), **geração de casos de teste** (se não se consegue testar, o requisito está mal escrito).

### Priorização

- **MoSCoW**: **M**ust have (obrigatório), **S**hould have (importante), **C**ould have (desejável), **W**on't have this time (fora agora).
- **Valor × esforço** (ou valor × risco): priorizar alto valor e baixo esforço.
- **Kano**: básicos, de desempenho e de encantamento.
- **Votação/100 pontos**: stakeholders distribuem pontos entre os requisitos.

### Matriz de rastreabilidade

Tabela que liga cada requisito à sua **origem** e aos artefatos que o **implementam e verificam**:

| Requisito | Origem | Caso de uso | Classes | Casos de teste | Status |
|---|---|---|---|---|---|
| RF01 — matrícula | Secretaria (entrevista 03) | UC02 | Matricula, Disciplina | CT05, CT06 | implementado |
| RF02 — trancamento | Regimento art. 12 | UC04 | Matricula | CT09 | em teste |
| RNF01 — resposta ≤ 2 s | Coordenação | — | — | CT20 (carga) | pendente |

Ela permite **análise de impacto** (o que muda se RF02 mudar?) e prova de **cobertura** (todo requisito tem teste?).

## Características principais

- Processo **iterativo** e **colaborativo**.
- Lida com **conflitos** entre stakeholders e com **requisitos que mudam**.
- Precisa de **gerenciamento de mudanças** e **rastreabilidade** durante todo o projeto.

## Exemplos práticos

:::example Software de suporte técnico (viabilidade já aprovada)
- **Elicitação:** entrevistas com atendentes e técnicos → *documento de entrevistas*.
- **Especificação:** *modelo de casos de uso* com "Abrir chamado", "Atribuir técnico", "Encerrar chamado" (requisitos **funcionais**).
- **Validação:** *protótipo de telas* apresentado aos atendentes para confirmar o fluxo.
:::

## Representação visual

### Espiral da engenharia de requisitos

::widget sommerville-espiral-requisitos

Fonte: adaptado de SOMMERVILLE (2018, cap. 4) — recriado pela equipe Stacklyst.

Siga do centro até a saída para o documento de requisitos. As voltas intercalam elicitação, especificação e validação, aprofundando o que se sabe sobre negócio, usuários e sistema. No ENADE, identifique a viabilidade no início, a prototipação e as revisões como recursos de validação e a gestão de mudanças como trabalho ao longo do processo.

## Vantagens e desvantagens

| Prática | Benefício | Cuidado |
|---|---|---|
| Documento de requisitos completo | base contratual e de testes | envelhece se não for mantido |
| Histórias no backlog | flexível e próximo do cliente | pode faltar visão do todo |
| Matriz de rastreabilidade | impacto e cobertura | trabalho de manutenção |
| Prototipação na validação | o cliente vê o que vai receber | expectativas sobre prazo |

## Diferenças entre conceitos semelhantes

- **Elicitação × especificação:** elicitar é **descobrir**; especificar é **registrar em forma padronizada**.
- **Validação de requisitos × verificação:** validar = os requisitos descrevem o que o cliente **precisa**? Verificar = o requisito está **bem escrito** (consistente, não ambíguo) e o sistema está **conforme** a especificação.
- **Estudo de viabilidade × análise de requisitos:** viabilidade decide **se** o sistema deve ser feito; análise organiza **o que** ele deve fazer.

## Como cai no ENADE

:::enade
Associação **etapa ↔ artefato** (2021: entrevista → elicitação; casos de uso para RF → especificação; protótipo de telas → validação), a ordem das atividades e o papel da **matriz de rastreabilidade**.
:::

## Pegadinhas

:::trap Casos de uso especificam requisitos funcionais
Alternativas que falam em "modelo de casos de uso para os requisitos **não funcionais**" estão erradas: RNFs vão para a especificação suplementar.
:::

:::trap Se a viabilidade já foi aprovada, o documento de viabilidade não é artefato das próximas etapas
Leia o cenário: ele delimita quais subprocessos estão em jogo.
:::

## Questões comentadas

::question 2021-objective-18 Artefatos da elicitação, especificação e validação

Elicitação → **documento de entrevista com usuários**; especificação → **modelo de casos de uso para os requisitos funcionais**; validação → **prototipação de telas**. Alternativa A. As alternativas com estudo de viabilidade ignoram que ele já foi feito; as com casos de uso para RNF erram o conceito.

## Resumo para memorizar

:::summary
- Atividades: **viabilidade → elicitação e análise → especificação → validação**, mais **gerenciamento** contínuo.
- Artefatos: entrevistas (elicitação), **casos de uso/SRS** (especificação), **protótipos e revisões** (validação), **matriz de rastreabilidade** (gerenciamento).
- Priorização: **MoSCoW** (Must, Should, Could, Won't).
- Rastreabilidade liga requisito ↔ origem ↔ design ↔ código ↔ testes.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual artefato é mais adequado para validar com o usuário o fluxo de telas de um sistema?",
    "options": ["Matriz de rastreabilidade", "Protótipo de telas", "Estudo de viabilidade", "Diagrama de implantação"],
    "answer": 1,
    "explanation": "O protótipo permite que o usuário veja e confirme se a solução atende às necessidades."
  },
  {
    "question": "Na técnica MoSCoW, o 'W' significa:",
    "options": ["Want — desejado", "Won't have (this time) — não será feito agora", "Wait — aguardar o cliente", "Warning — risco"],
    "answer": 1,
    "explanation": "Won't have this time: combinado que fica fora desta entrega."
  },
  {
    "question": "Para que serve principalmente a matriz de rastreabilidade?",
    "options": ["Estimar custos de hardware", "Ligar requisitos a origem, implementação e testes, permitindo análise de impacto", "Desenhar telas", "Substituir o documento de requisitos"],
    "answer": 1,
    "explanation": "Ela mostra de onde vem cada requisito e onde ele é implementado e verificado."
  }
]
:::

## Referências

- SOMMERVILLE, Ian. *Engenharia de software*. 10. ed. São Paulo: Pearson, 2018.
- PRESSMAN, R. S.; MAXIM, B. R. *Engenharia de Software*. 8. ed. AMGH, 2016 — caps. 8 e 9.
- IIBA. *BABOK — Guia para o Corpo de Conhecimento de Análise de Negócios*, v3, 2015.
- INEP. ENADE TADS 2021, questão 18.

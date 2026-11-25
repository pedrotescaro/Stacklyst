---
title: Qualidade de software — ISO/IEC 25010, CMMI, MPS.BR, revisões, métricas e rastreabilidade
summary: Qualidade de produto e de processo, as características da ISO/IEC 25010, os níveis de maturidade do CMMI e do MPS.BR, revisões técnicas, métricas de confiabilidade e rastreabilidade.
order: 5
level: intermediário
version: 3
updated: 2026-11-25
tags: [qualidade, iso 25010, iso 9126, square, cmmi, mps.br, maturidade, capacidade, garantia da qualidade, sqa, revisão técnica formal, inspeção, métricas, confiabilidade, disponibilidade, mtbf, mttf, rastreabilidade]
related: [fundamentos-de-testes, gerencia-de-configuracao, processo-de-requisitos, manutencao-e-divida-tecnica]
---

## O que é

**Qualidade de software** é o grau em que um software atende aos **requisitos especificados** e às **necessidades implícitas** de quem o usa. Ela tem duas faces:

- **Qualidade do produto:** características do software em si (funciona certo? é rápido? é seguro? é fácil de usar e de manter?).
- **Qualidade do processo:** como a organização desenvolve (o processo é definido, medido e melhorado?). A premissa é que **processos maduros tendem a gerar produtos melhores**.

## Para que serve

Para que qualidade não seja questão de opinião, a engenharia define **modelos** (o que medir), **normas** (como avaliar), **atividades** (revisões, testes, auditorias) e **métricas** (números para acompanhar). Isso permite combinar metas com o cliente, comparar versões e melhorar o processo continuamente.

## Como funciona

### Qualidade do produto — ISO/IEC 25010 (SQuaRE)

A ISO/IEC 25010 (sucessora da ISO/IEC 9126) define **características de qualidade do produto**:

| Característica | Pergunta-chave | Subcaracterísticas (exemplos) |
|---|---|---|
| **Adequação funcional** | faz o que precisa, corretamente? | completude, correção, pertinência |
| **Eficiência de desempenho** | usa bem tempo e recursos? | tempo de resposta, uso de recursos, capacidade |
| **Compatibilidade** | convive e troca dados com outros sistemas? | coexistência, **interoperabilidade** |
| **Usabilidade** | é fácil de aprender e usar? | apreensibilidade, operabilidade, **acessibilidade**, proteção contra erro do usuário |
| **Confiabilidade** | funciona sem falhar ao longo do tempo? | maturidade, **disponibilidade**, tolerância a falhas, recuperabilidade |
| **Segurança** | protege dados e acessos? | confidencialidade, integridade, não repúdio, autenticidade |
| **Manutenibilidade** | é fácil de modificar? | modularidade, reusabilidade, analisabilidade, testabilidade |
| **Portabilidade** | é fácil levar para outro ambiente? | adaptabilidade, **instalabilidade**, substituibilidade |

:::tip Interoperabilidade × portabilidade
**Interoperabilidade** (compatibilidade) = trocar informações e funcionar **junto** com outro sistema. **Portabilidade** = ser transferido e **executado em outro ambiente**. Um robô de outra marca que "conversa" com o seu sistema exige interoperabilidade.
:::

### Qualidade do processo — CMMI e MPS.BR

**CMMI** (*Capability Maturity Model Integration*, SEI/ISACA) descreve boas práticas organizadas em áreas de processo e oferece duas **representações**:

- **Por estágios** → **níveis de maturidade** da organização:
  1. **Inicial** — processos imprevisíveis, dependem de heróis;
  2. **Gerenciado** — projetos planejados e acompanhados;
  3. **Definido** — processo padrão da organização, institucionalizado;
  4. **Quantitativamente gerenciado** — processos medidos e controlados estatisticamente;
  5. **Em otimização** — melhoria contínua e inovação.
- **Contínua** → **níveis de capacidade** de cada área de processo, avaliadas separadamente.

**Maturidade** indica a efetividade do processo e a **consistência** com que ele é aplicado em todos os projetos; ela exige **institucionalização** (políticas, padrões, treinamento).

**MPS.BR** (Melhoria de Processo do Software Brasileiro, SOFTEX) é o modelo nacional, compatível com o CMMI e baseado nas normas **ISO/IEC 12207** (processos de ciclo de vida) e **ISO/IEC 15504/33000** (avaliação de processos). Tem **7 níveis de maturidade**, de **G** (mais baixo) a **A** (mais alto): G – parcialmente gerenciado, F – gerenciado, E – parcialmente definido, D – largamente definido, C – definido, B – gerenciado quantitativamente, A – em otimização. A gradação mais fina facilita a adoção por pequenas e médias empresas.

### Garantia da qualidade (SQA)

**Garantia da qualidade de software** é o conjunto de atividades planejadas para dar **confiança** de que produto e processo atendem aos padrões: definição de padrões e procedimentos, **revisões** e auditorias, testes, coleta de métricas, gestão de mudanças.

### Revisões técnicas

São exames de produtos de trabalho (requisitos, modelos, código) feitos por colegas para **encontrar defeitos cedo**, antes que se propaguem e fiquem mais caros:

- **Revisão técnica formal (RTF)/inspeção:** reunião planejada, com papéis definidos (moderador, autor, revisores, relator), lista de verificação, registro de defeitos e acompanhamento. Revisa-se o **produto**, não o autor.
- **Walkthrough:** o autor conduz a equipe pelo artefato.
- **Revisão em pares/informal:** um colega lê o código (comum nos *pull requests*).

### Métricas de confiabilidade e disponibilidade

| Métrica | Significado |
|---|---|
| **POFOD** (probabilidade de falha sob demanda) | falhas ÷ solicitações |
| **ROCOF** (taxa de ocorrência de falhas) | falhas por unidade de tempo |
| **MTTF** (tempo médio até a falha) | média dos intervalos entre falhas consecutivas |
| **MTTR** (tempo médio de reparo) | média do tempo para restaurar |
| **MTBF** | MTTF + MTTR |
| **Disponibilidade** | tempo disponível ÷ tempo total (ou MTTF ÷ MTBF) |

### Rastreabilidade

**Rastreabilidade** é a capacidade de seguir a vida de um requisito **para trás** (de onde veio: stakeholder, regra, documento) e **para frente** (que modelos, código e testes o implementam e verificam). Sem ela, é impossível avaliar o **impacto de uma mudança** ou provar que todo requisito foi testado. A ferramenta clássica é a **matriz de rastreabilidade** (veja [Processo de requisitos](lib:processo-de-requisitos)).

## Características principais

- Qualidade se **constrói** ao longo do processo; não se "insere" testando no fim.
- Defeitos encontrados cedo são **muito mais baratos** de corrigir.
- Modelos de maturidade avaliam a **organização**; normas de produto avaliam o **software**.
- Métricas só têm valor se **coletadas de forma consistente** e usadas para decidir.

## Exemplos práticos

:::example Calculando métricas
Em 10 instantes observados, o sistema estava disponível em 4 → **disponibilidade = 40%**. Em 10 solicitações, falhou em 3 → **POFOD = 30%**. Falhas ocorreram nos instantes 9, 16, 20, 23, 25, 29, 33, 36, 41 e 45: há 9 intervalos que somam 45 − 9 = 36 → **tempo médio entre falhas = 36 ÷ 9 = 4** unidades.
:::

## Representação visual

::figure{id="escalas-maturidade-processos"}

Siga cada escala de cima para baixo. O CMMI-DEV v1.3 vai de 1 a 5 e o MR-MPS-SW progride de G a A. No ENADE, use a letra ou o número para situar o nível no modelo indicado. Uma semelhança entre os nomes de dois níveis, por si só, não estabelece equivalência entre avaliações.

## Vantagens e desvantagens

| Prática | Vantagem | Custo/risco |
|---|---|---|
| Revisões formais | acham defeitos que testes não acham (requisitos, projeto) | tempo da equipe; exigem preparo |
| Modelos de maturidade | previsibilidade e padronização | burocracia se aplicados só para certificação |
| Métricas | decisões baseadas em dados | medir o que é fácil, não o que importa |
| Rastreabilidade | análise de impacto e cobertura | manutenção trabalhosa da matriz |

## Diferenças entre conceitos semelhantes

- **Garantia da qualidade × controle da qualidade:** garantia é **preventiva e de processo** (padrões, auditorias); controle é **detectiva e de produto** (testes, inspeções).
- **Maturidade × capacidade:** maturidade é da **organização** (representação por estágios); capacidade é de **cada processo** (representação contínua).
- **CMMI × MPS.BR:** o MPS.BR tem **7 níveis (G a A)** e foi criado para a realidade brasileira; o CMMI tem **5 níveis**.
- **Confiabilidade × disponibilidade:** confiabilidade é funcionar **sem falhar** por um período; disponibilidade é estar **pronto para uso** quando solicitado.

## Como cai no ENADE

:::enade
Aparecem: características do MPS.BR (base nas normas **ISO/IEC 12207 e 15504**), afirmações sobre maturidade no CMMI, **cálculos** de disponibilidade e falhas, revisões técnicas em asserção-razão e atributos de qualidade aplicados a cenários (interoperabilidade, portabilidade).
:::

## Pegadinhas

:::trap MPS.BR não tem 5 níveis
São **7 níveis (G a A)**. "5 níveis" é o CMMI.
:::

:::trap Média de falhas não é a média dos instantes
O tempo médio entre falhas usa os **intervalos** entre falhas consecutivas, não os instantes absolutos.
:::

:::trap Maturidade não é "absorver tecnologia nova"
Inovação faz parte do nível mais alto, mas maturidade é sobretudo **consistência e institucionalização** do processo.
:::

## Questões comentadas

::question 2011-objective-32 Características do MPS.BR

O MPS.BR está em conformidade com as normas **ISO/IEC 12207** (processos de ciclo de vida) e **ISO/IEC 15504** (avaliação de processos) — alternativa C. "5 níveis" é do CMMI; "representação contínua e por estágios" também é característica do CMMI.

::question 2011-objective-33 Disponibilidade, taxa de falhas e tempo médio entre falhas

4 de 10 instantes disponíveis → **40%**; 3 falhas em 10 solicitações → **30%**; intervalos entre as 10 falhas somam 36 em 9 intervalos → **4**. Alternativa D (40; 30; 4).

::question 2011-objective-30 Revisões técnicas formais

As duas asserções são verdadeiras e a segunda justifica a primeira: produtos de trabalho são revisados **porque** a revisão gera informação sobre defeitos e permite controlar a qualidade (alternativa A).

## Resumo para memorizar

:::summary
- Produto: **ISO/IEC 25010** — adequação funcional, eficiência, compatibilidade, usabilidade, confiabilidade, segurança, manutenibilidade, portabilidade.
- Processo: **CMMI** (5 níveis: inicial, gerenciado, definido, quantitativamente gerenciado, em otimização) e **MPS.BR** (7 níveis, **G → A**; base ISO 12207/15504).
- Revisões encontram defeitos **cedo**; revisa-se o produto, não a pessoa.
- Disponibilidade = tempo disponível ÷ total; MTTF = média dos **intervalos** entre falhas.
- Rastreabilidade = seguir o requisito **para trás e para frente**.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Quantos níveis de maturidade tem o MPS.BR?",
    "options": ["3", "5", "7", "9"],
    "answer": 2,
    "explanation": "Sete níveis, de G (parcialmente gerenciado) a A (em otimização)."
  },
  {
    "question": "Um sistema precisa trocar dados com o sistema de um parceiro. Que característica de qualidade está em jogo?",
    "options": ["Portabilidade", "Interoperabilidade (compatibilidade)", "Manutenibilidade", "Eficiência"],
    "answer": 1,
    "explanation": "Interoperabilidade é a capacidade de trocar informações e operar em conjunto com outros sistemas."
  },
  {
    "question": "Falhas ocorreram nos instantes 10, 14, 20 e 22. Qual é o tempo médio entre falhas?",
    "options": ["4", "16,5", "6", "22"],
    "answer": 0,
    "explanation": "Intervalos: 4, 6 e 2 → soma 12 em 3 intervalos → média 4 (ou (22 − 10) ÷ 3)."
  }
]
:::

## Referências

- ISO/IEC 25010:2011 — *Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*.
- SOFTEX. *Guia geral MPS de software: 2021*. Brasília, DF: Softex, 2021. Disponível em: https://softex.br/download/guia-geral-de-software-2021/. Acesso em: 25 nov. 2026.
- CMMI PRODUCT TEAM. *CMMI for development, version 1.3: improving processes for developing better products and services*. Pittsburgh: Software Engineering Institute, Carnegie Mellon University, 2010. (CMU/SEI-2010-TR-033).
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. Pearson, 2018 — caps. 11 (confiabilidade) e 24 (qualidade).
- PRESSMAN, R. S.; MAXIM, B. R. *Engenharia de Software*. 8. ed. AMGH, 2016 — caps. 19 a 21.

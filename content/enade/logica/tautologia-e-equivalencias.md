---
title: Tautologia, contradição, contingência, equivalências e Leis de De Morgan
summary: Como classificar proposições pela tabela-verdade, as equivalências mais cobradas (contrapositiva, condicional como disjunção), as Leis de De Morgan e a negação correta de conjunções, disjunções, condicionais e bicondicionais.
order: 2
level: intermediário
version: 3
updated: 2026-11-25
tags: [tautologia, contradição, contingência, equivalência lógica, de morgan, negação, contrapositiva, recíproca, inversa, negação da condicional, dupla negação, distributiva, absorção, implicação lógica]
related: [proposicoes-e-conectivos, argumentacao-e-quantificadores, conjuntos-e-venn]
---

## O que é

- **Tautologia:** proposição **sempre verdadeira**, em todas as linhas da tabela (ex.: p ∨ ¬p).
- **Contradição:** **sempre falsa** (ex.: p ∧ ¬p).
- **Contingência:** **às vezes V, às vezes F** (ex.: p → q).
- **Equivalência lógica (≡ ou ⇔):** duas proposições são equivalentes quando têm **a mesma tabela-verdade** — ou seja, **P ↔ Q é tautologia**.

## Para que serve

Equivalências permitem **reescrever** condições sem mudar o significado: simplificar `if`s, negar corretamente uma regra, transformar uma afirmação em outra mais fácil de verificar. As **negações** são campeãs de cobrança em provas.

## Como funciona

### Classificando

Monte a tabela-verdade e olhe a última coluna: só V → tautologia; só F → contradição; misto → contingência.

::widget truth-table expr="p -> (q -> p)"

### Equivalências fundamentais

| Nome | Equivalência |
|---|---|
| Dupla negação | ¬(¬p) ≡ p |
| Comutativas | p ∧ q ≡ q ∧ p; p ∨ q ≡ q ∨ p |
| Distributivas | p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r); p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r) |
| **De Morgan** | ¬(p ∧ q) ≡ ¬p ∨ ¬q; ¬(p ∨ q) ≡ ¬p ∧ ¬q |
| **Condicional como disjunção** | p → q ≡ ¬p ∨ q |
| **Contrapositiva** | p → q ≡ ¬q → ¬p |
| Bicondicional | p ↔ q ≡ (p → q) ∧ (q → p) |
| Absorção | p ∧ (p ∨ q) ≡ p; p ∨ (p ∧ q) ≡ p |

:::warning Recíproca e inversa NÃO são equivalentes
Para p → q: a **recíproca** q → p e a **inversa** ¬p → ¬q **não** são equivalentes a ela. Só a **contrapositiva** ¬q → ¬p é.
:::

### Negações (o que mais cai)

| Proposição | Negação correta |
|---|---|
| p ∧ q | **¬p ∨ ¬q** (De Morgan) |
| p ∨ q | **¬p ∧ ¬q** (De Morgan) |
| **p → q** | **p ∧ ¬q** |
| p ↔ q | p ⊕ q ≡ (p ∧ ¬q) ∨ (¬p ∧ q) |
| todo A é B | **algum A não é B** |
| algum A é B | **nenhum A é B** |

:::example Negando em português
- "Ana estuda **e** trabalha." → "Ana **não** estuda **ou não** trabalha."
- "Vou à praia **ou** ao cinema." → "**Não** vou à praia **e não** vou ao cinema."
- "**Se** chover, **então** fico em casa." → "Chove **e não** fico em casa."
:::

## Características principais

- A negação de uma tautologia é uma contradição, e vice-versa.
- Implicação lógica (P ⇒ Q) ocorre quando P → Q é tautologia.
- Toda proposição pode ser escrita só com ¬ e ∧ (ou só com ¬ e ∨) — base das portas NAND/NOR.

## Exemplos práticos

:::example Verificando tautologias (ENADE 2011)
- **¬(p ∧ ¬q)** ≡ ¬p ∨ q ≡ p → q → **contingência** (falsa com p = V, q = F).
- **p → (q → p)**: se p = F, a externa é V; se p = V, q → p é V. **Tautologia**.
- **(p ∨ ¬q) → ¬p**: com p = V, q = V → (V) → F = **F** → contingência.
- **(p ∧ q) ∨ (¬p ∧ ¬q)** ≡ p ↔ q → **contingência** (F quando p ≠ q).
Só a II é tautologia.
:::

## Representação visual

Siga as linhas sólidas entre fórmulas de mesma tabela-verdade. A seta tracejada leva à negação da condicional, que vale apenas quando p é verdadeiro e q é falso. No ENADE, observe a diferença entre trocar a ordem das proposições e negar ambas ao inverter a ordem.

::figure{id="equivalencias-da-condicional"}

## Diferenças entre conceitos semelhantes

- **Equivalência × implicação:** equivalência = mesma tabela (↔ tautológico); implicação = sempre que P é V, Q é V (→ tautológico).
- **Contradição × contingência:** sempre F × às vezes F.
- **Negar "todos" × "nenhum":** a negação de "todos são" é "**pelo menos um não é**", não "nenhum é".

## Como cai no ENADE

:::enade
Classificar proposições como tautologia (2011), negar uma condicional a partir de uma declaração falsa (2014) e reconhecer que A ∧ ¬(B ∨ C) ≡ A ∧ ¬B ∧ ¬C em condições de programas (2017).
:::

## Pegadinhas

:::trap Negação da condicional não é outra condicional
¬(p → q) é **p ∧ ¬q**. Alternativas como "se não p, então não q" são a **inversa**, não a negação.
:::

:::trap De Morgan troca o conectivo
Ao negar, ∧ vira ∨ e ∨ vira ∧ — e cada parte é negada.
:::

## Questões comentadas

::question 2011-objective-19 Quais são tautologias

Apenas **p → (q → p)** é verdadeira em todas as linhas (veja a análise no exemplo acima). Alternativa B.

::question 2014-objective-35 Negação da declaração

Se "X venceu → Y é campeão" é falsa, vale sua negação: **X venceu ∧ Y não é campeão** (alternativa B).

## Resumo para memorizar

:::summary
- Tautologia (sempre V), contradição (sempre F), contingência (misto).
- **De Morgan**: ¬(p ∧ q) ≡ ¬p ∨ ¬q; ¬(p ∨ q) ≡ ¬p ∧ ¬q.
- p → q ≡ **¬p ∨ q** ≡ **¬q → ¬p** (contrapositiva).
- **¬(p → q) ≡ p ∧ ¬q**.
- Negar "todo" → "algum não"; negar "algum" → "nenhum".
:::

:::mnemonic Negação da condicional
"**Mantém a primeira E nega a segunda**" (MA-NÉ).
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual é a negação de 'Se estudo, então passo'?",
    "options": ["Se não estudo, então não passo", "Estudo e não passo", "Não estudo ou passo", "Se passo, então estudo"],
    "answer": 1,
    "explanation": "¬(p → q) ≡ p ∧ ¬q."
  },
  {
    "question": "Qual proposição é equivalente a 'Se é domingo, então não trabalho'?",
    "options": ["Se trabalho, então não é domingo", "Se não é domingo, então trabalho", "É domingo e trabalho", "Se não trabalho, então é domingo"],
    "answer": 0,
    "explanation": "Contrapositiva: ¬q → ¬p, com q = 'não trabalho'."
  },
  {
    "question": "p ∨ ¬p é:",
    "options": ["Contradição", "Contingência", "Tautologia", "Sentença aberta"],
    "answer": 2,
    "explanation": "É sempre verdadeira (terceiro excluído)."
  },
  {
    "question": "A negação de 'Todos os alunos passaram' é:",
    "options": ["Nenhum aluno passou", "Algum aluno não passou", "Todos os alunos reprovaram", "Algum aluno passou"],
    "answer": 1,
    "explanation": "Basta um contraexemplo para negar um 'todos'."
  }
]
:::

## Referências

- ALENCAR FILHO, E. *Iniciação à Lógica Matemática*. Nobel, 2002 — caps. 4 a 7.
- ROSEN, Kenneth H. *Discrete mathematics and its applications*. 8. ed. New York: McGraw-Hill Education, 2019.
- INEP. ENADE TADS 2011 (questão 19) e 2014 (questão 35).

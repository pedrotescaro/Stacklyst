---
title: Conjuntos e diagramas de Venn
summary: Pertinência, inclusão, união, interseção, diferença, complementar e diferença simétrica, propriedades (distributiva e De Morgan), princípio da inclusão-exclusão e problemas de contagem com Venn — com diagrama interativo.
order: 4
level: básico
version: 2
updated: 2026-11-25
tags: [conjuntos, diagrama de venn, pertinência, inclusão, subconjunto, conjunto vazio, união, interseção, diferença, complementar, diferença simétrica, distributiva, de morgan, inclusão-exclusão, cardinalidade, conjunto das partes]
related: [proposicoes-e-conectivos, tautologia-e-equivalencias, argumentacao-e-quantificadores, probabilidade-e-combinatoria, sql]
---

## O que é

Um **conjunto** é uma coleção de elementos **distintos**, sem ordem. Notação: A = {1, 2, 3}. Relações básicas:

- **Pertinência:** 2 ∈ A (elemento pertence ao conjunto); 5 ∉ A.
- **Inclusão:** B ⊂ A (todo elemento de B está em A).
- **Conjunto vazio:** ∅ = {} (subconjunto de qualquer conjunto).
- **Universo U:** o conjunto de referência.
- **Cardinalidade:** n(A), o número de elementos.

O **diagrama de Venn** representa conjuntos como regiões (círculos) dentro de um retângulo (o universo).

## Para que serve

Contagem e probabilidade, raciocínio lógico (silogismos), **consultas SQL** (UNION, INTERSECT, EXCEPT são operações de conjuntos), filtros de dados e modelagem de categorias que se sobrepõem.

## Como funciona

| Operação | Notação | Elementos | Lógica |
|---|---|---|---|
| União | A ∪ B | em A **ou** em B | ∨ |
| Interseção | A ∩ B | em A **e** em B | ∧ |
| Diferença | A − B | em A e **não** em B | A ∧ ¬B |
| Complementar | A' ou Aᶜ | no universo e **não** em A | ¬ |
| Diferença simétrica | A Δ B | em **exatamente um** | ⊕ |

::widget venn

Fonte: adaptado de ROSEN (2019, cap. 2) — recriado pela equipe Stacklyst.

### Propriedades

- **Comutativa:** A ∪ B = B ∪ A; A ∩ B = B ∩ A.
- **Idempotência:** A ∪ A = A; **A ∩ A = A**.
- **Distributiva:** A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C); A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C).
- **De Morgan:** (A ∪ B)' = A' ∩ B'; (A ∩ B)' = A' ∪ B'.
- **Diferença:** A − (B ∪ C) = (A − B) ∩ (A − C); A − (B ∩ C) = (A − B) ∪ (A − C).
- **Conjunto das partes:** P(A) tem **2ⁿ** subconjuntos se n(A) = n.

### Princípio da inclusão-exclusão

$$n(A \cup B) = n(A) + n(B) - n(A \cap B)$$

$$n(A \cup B \cup C) = n(A) + n(B) + n(C) - n(A \cap B) - n(A \cap C) - n(B \cap C) + n(A \cap B \cap C)$$

## Características principais

- Elementos não se repetem e não têm ordem: {1, 2} = {2, 1, 1}.
- Operações de conjuntos correspondem diretamente a conectivos lógicos.

## Exemplos práticos

:::example Pesquisa com 100 alunos
60 gostam de Java (J), 50 de Python (P) e 20 de ambos.
- Só Java: 60 − 20 = **40**; só Python: 50 − 20 = **30**.
- Pelo menos uma: 60 + 50 − 20 = **90**. Nenhuma: 100 − 90 = **10**.

Dica: em problemas com três conjuntos, preencha o Venn **de dentro para fora** — comece pela interseção tripla.
:::

## Representação visual

No diagrama interativo da seção Como funciona, cada curva separa os elementos que pertencem ao conjunto. Ao sombrear uma região, conte também as interseções que satisfazem a operação. No ENADE, use a diferença e o complemento para localizar o que está fora de um conjunto mas continua dentro do universo.

## Diferenças entre conceitos semelhantes

- **∈ × ⊂:** ∈ relaciona **elemento** e conjunto; ⊂ relaciona **conjunto** e conjunto.
- **A − B × B − A:** a diferença não é comutativa.
- **Diferença × diferença simétrica:** A − B só tira de A; A Δ B = (A − B) ∪ (B − A).

## Como cai no ENADE

:::enade
Itens sobre propriedades de operações com três conjuntos (2008: só a distributiva era correta), expressões de conjuntos traduzidas em condições de programas (2017) e contagens na formação geral.
:::

## Pegadinhas

:::trap A ∩ A não é vazio
A ∩ A = A (idempotência). E A ∪ B só é vazio se A e B forem vazios.
:::

:::trap Diferença com interseção
A − (B ∩ C) = (A − B) **∪** (A − C), não ∩.
:::

## Questões comentadas

::question 2008-objective-28 Propriedades com A, B e C

I falsa (a união não é vazia no desenho); II falsa (a igualdade proposta para A − (B ∩ C) não vale); **III verdadeira** (distributiva); IV falsa (A ∩ A = A). **Apenas um item** está certo (alternativa A).

## Resumo para memorizar

:::summary
- ∪ = ou; ∩ = e; − = e não; ' = não; Δ = ou exclusivo.
- De Morgan: (A ∪ B)' = A' ∩ B'; (A ∩ B)' = A' ∪ B'.
- **n(A ∪ B) = n(A) + n(B) − n(A ∩ B)**.
- P(A) tem 2ⁿ subconjuntos.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Se n(A) = 30, n(B) = 25 e n(A ∩ B) = 10, quanto vale n(A ∪ B)?",
    "options": ["55", "45", "65", "35"],
    "answer": 1,
    "explanation": "30 + 25 − 10 = 45."
  },
  {
    "question": "Quantos subconjuntos tem o conjunto {a, b, c}?",
    "options": ["3", "6", "8", "9"],
    "answer": 2,
    "explanation": "2³ = 8, incluindo ∅ e o próprio conjunto."
  },
  {
    "question": "Pela Lei de De Morgan, (A ∪ B)' é igual a:",
    "options": ["A' ∪ B'", "A' ∩ B'", "A ∩ B", "A − B"],
    "answer": 1,
    "explanation": "Fora da união = fora de A e fora de B."
  }
]
:::

## Referências

- IEZZI, G.; MURAKAMI, C. *Fundamentos de Matemática Elementar 1: conjuntos e funções*. 9. ed. Atual, 2013.
- GERSTING, J. L. *Fundamentos Matemáticos para a Ciência da Computação*. 7. ed. LTC, 2017 — cap. 4.
- INEP. ENADE TADS 2008 (questão 28) e 2017 (questão 29).
- ROSEN, Kenneth H. *Discrete mathematics and its applications*. 8. ed. New York: McGraw-Hill Education, 2019.

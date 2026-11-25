---
title: Probabilidade e análise combinatória
summary: Princípio fundamental da contagem, permutações, arranjos e combinações, probabilidade clássica, eventos complementares, independentes e mutuamente exclusivos, probabilidade condicional e interpretação de probabilidades em sistemas.
order: 3
level: intermediário
version: 3
updated: 2026-11-25
tags: [probabilidade, espaço amostral, evento, complementar, independentes, mutuamente exclusivos, probabilidade condicional, regra do produto, regra da soma, análise combinatória, princípio fundamental da contagem, permutação, arranjo, combinação, fatorial, dados, valor esperado]
related: [estatistica-descritiva, conjuntos-e-venn, porcentagem-e-proporcao, sistemas-de-informacao-empresariais]
---

## O que é

- **Análise combinatória:** técnicas para **contar** de quantas maneiras algo pode acontecer sem listar tudo.
- **Probabilidade:** medida, entre 0 e 1, da **chance** de um evento ocorrer.

$$P(A) = \frac{\text{casos favoráveis}}{\text{casos possíveis}} \quad \text{(espaço amostral equiprovável)}$$

## Para que serve

Senhas e combinações possíveis (segurança), testes A/B, riscos de projeto (probabilidade × impacto), jogos, sistemas especialistas com regras probabilísticas e qualquer decisão sob incerteza.

## Como funciona

### Princípio fundamental da contagem

Se uma decisão tem *m* opções e outra, independente, tem *n*, juntas têm **m × n** possibilidades. Senha de 4 dígitos: 10 × 10 × 10 × 10 = **10.000**.

### Permutação, arranjo e combinação

| | Fórmula | Ordem importa? | Exemplo |
|---|---|---|---|
| **Permutação** | $P_n = n!$ | sim (todos os elementos) | ordenar 5 livros: 120 |
| **Arranjo** | $A_{n,p} = \frac{n!}{(n-p)!}$ | **sim** | pódio de 3 entre 10: 720 |
| **Combinação** | $C_{n,p} = \frac{n!}{p!\,(n-p)!}$ | **não** | comissão de 3 entre 10: 120 |

**Permutação com repetição** (anagramas com letras repetidas): $\frac{n!}{a!\,b!\dots}$ — ARARA: 5!/(3!·2!) = 10.

### Regras de probabilidade

- 0 ≤ P(A) ≤ 1; P(certo) = 1; P(impossível) = 0.
- **Complementar:** P(não A) = 1 − P(A).
- **Soma (ou):** P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Se **mutuamente exclusivos**: P(A) + P(B).
- **Produto (e) para independentes:** P(A ∩ B) = P(A) · P(B).
- **Condicional:** $P(A \mid B) = \frac{P(A \cap B)}{P(B)}$.
- **"Pelo menos um"**: use o complementar — 1 − P(nenhum).

### Valor esperado

Média ponderada dos resultados pelas probabilidades: E = Σ xᵢ · pᵢ. Interpretação: o que se espera **em média, a longo prazo**.

## Características principais

- Probabilidade não garante resultado individual: 70% de chance não significa que exatamente 70 de 100 casos ocorrerão.
- Independência ≠ exclusão mútua: eventos exclusivos (com probabilidade positiva) são **dependentes**.

## Exemplos práticos

:::example Dois dados
Espaço amostral: 6 × 6 = 36 resultados. Soma 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) → 6/36 = **1/6**. Pelo menos um 6: 1 − (5/6)² = 1 − 25/36 = **11/36**.
:::

:::example Regra de produção de um sistema especialista (ENADE 2021)
"Se (temperatura > 38°) **e** (dores musculares intensas) então dengue com 70% de chance." Para **cada** pessoa com **ambos** os sintomas, o sistema atribui probabilidade **0,7**. Isso **não** significa que, entre 100 pessoas com os sintomas, serão **exatamente** 70 casos.
:::

## Representação visual

Cada caminho da raiz a uma folha corresponde a um resultado ordenado. Em lançamentos independentes de uma moeda justa, multiplique as probabilidades dos ramos para obter ¼ em cada folha. No ENADE, some resultados disjuntos quando o evento admite mais de um caminho, como obter uma única cara.

::figure{id="arvore-de-dois-lancamentos"}

## Diferenças entre conceitos semelhantes

- **Arranjo × combinação:** pergunte "trocar a ordem gera outra possibilidade?" Sim → arranjo; não → combinação.
- **Independentes × mutuamente exclusivos:** independentes podem ocorrer juntos sem se influenciar; exclusivos **não podem** ocorrer juntos.
- **Probabilidade × frequência observada:** a primeira é teórica/esperada; a segunda, o que aconteceu de fato em uma amostra.

## Como cai no ENADE

:::enade
Discursiva com dados e lançamentos (2011), interpretação de probabilidades em regras de sistemas especialistas (2021) e multiplicação de probabilidades em aplicações (2017).
:::

## Pegadinhas

:::trap Probabilidade não é certeza
"Se 100 pessoas…, a quantidade com dengue **será igual a** 70" é falso; o correto é "**cada** pessoa tem probabilidade 0,7".
:::

:::trap Leia "e" e "ou" na regra
A regra só vale com os **dois** sintomas (conjunção). Pessoas com **um** sintoma caem no "senão".
:::

## Questões comentadas

::question 2021-objective-34 Sistema especialista para dengue

Correta a **A**: cada pessoa com **ambos** os sintomas tem probabilidade 0,7 de dengue segundo a regra. B e D tratam de quem tem **um** sintoma (a regra exige os dois); C transforma probabilidade em certeza; E não decorre da regra.

### Exercício autoral com dois dados

Ao lançar dois dados justos, quantos resultados produzem soma 7? Entre os 36 pares ordenados, há seis resultados favoráveis, de (1, 6) até (6, 1). Em três lançamentos independentes, a chance de obter soma 7 ao menos uma vez é o complemento de falhar nas três tentativas, ou seja, 1 − (5/6)³ ≈ 42,13%.

## Resumo para memorizar

:::summary
- Contagem: **m × n**. Permutação n!; arranjo n!/(n − p)! (ordem importa); combinação n!/(p!(n − p)!) (ordem não importa).
- P = favoráveis ÷ possíveis; P(não A) = 1 − P(A).
- Ou: soma (− interseção). E (independentes): produto.
- "Pelo menos um" → **1 − P(nenhum)**.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "De quantas maneiras se escolhem 2 representantes (sem cargos) entre 6 alunos?",
    "options": ["30", "15", "12", "36"],
    "answer": 1,
    "explanation": "Ordem não importa: C(6,2) = 15."
  },
  {
    "question": "Qual a probabilidade de tirar um número par em um dado honesto?",
    "options": ["1/6", "1/3", "1/2", "2/3"],
    "answer": 2,
    "explanation": "3 favoráveis (2, 4, 6) em 6."
  },
  {
    "question": "Um servidor falha com probabilidade 0,1 por dia, independentemente. Qual a chance de não falhar em 2 dias?",
    "options": ["0,8", "0,81", "0,9", "0,19"],
    "answer": 1,
    "explanation": "0,9 × 0,9 = 0,81."
  }
]
:::

## Referências

- MORGADO, A. C. et al. *Análise Combinatória e Probabilidade*. SBM, 2006.
- BUSSAB, W. O.; MORETTIN, P. A. *Estatística Básica*. 9. ed. Saraiva, 2017 — caps. 5 e 6.
- INEP. ENADE TADS 2011 (discursiva 3) e 2021 (questão 34).
- ILLOWSKY, Barbara; DEAN, Susan. *Introductory statistics*. 2. ed. Houston: OpenStax, 2023. Disponível em: [OpenStax](https://openstax.org/details/books/introductory-statistics-2e). Acesso em: 25 nov. 2026.

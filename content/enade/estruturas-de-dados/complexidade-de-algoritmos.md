---
title: Complexidade de algoritmos e notação Big O
summary: Como medir a eficiência de um algoritmo, as notações O, Ω e Θ, as classes de crescimento mais comuns, como contar passos em laços e recursões e os paradigmas divisão e conquista, programação dinâmica e guloso.
order: 10
level: intermediário
version: 2
updated: 2026-11-25
tags: [complexidade, análise de algoritmos, big o, notação assintótica, omega, theta, pior caso, melhor caso, caso médio, o(1), o(log n), o(n), o(n log n), o(n²), exponencial, complexidade de espaço, divisão e conquista, programação dinâmica, guloso, força bruta]
related: [busca-e-ordenacao, recursividade, vetores-e-matrizes, grafos]
---

## O que é

**Complexidade de um algoritmo** é a medida de quanto **tempo** (número de operações) e **espaço** (memória) ele consome **em função do tamanho da entrada *n***. A **notação Big O** descreve como esse custo **cresce** quando *n* fica grande, ignorando constantes e termos menores.

## Para que serve

Para comparar soluções **independentemente do computador**. Um algoritmo O(n²) que é rápido para 100 itens pode levar horas para 1 milhão; um O(n log n) leva segundos.

## Como funciona

### Notações assintóticas

| Notação | Significado | Leitura informal |
|---|---|---|
| **O(f(n))** | limite **superior** | "cresce no máximo como f(n)" |
| **Ω(f(n))** | limite **inferior** | "cresce no mínimo como f(n)" |
| **Θ(f(n))** | limite **justo** (superior e inferior) | "cresce exatamente como f(n)" |

Formalmente, T(n) = O(f(n)) se existem constantes c > 0 e n₀ tais que $T(n) \le c \cdot f(n)$ para todo n ≥ n₀.

### Regras práticas

- **Ignore constantes:** 3n + 10 → O(n).
- **Fique com o termo dominante:** n² + 100n + 5 → O(n²).
- **Laços em sequência somam:** O(n) + O(n) = O(n).
- **Laços aninhados multiplicam:** um laço de n dentro de outro de n → O(n²).
- **Divisão do problema pela metade a cada passo** → O(log n).
- **Recursão com duas chamadas que reduzem n em 1** → O(2ⁿ).

### Classes mais comuns

| Classe | Nome | Exemplo |
|---|---|---|
| O(1) | constante | acessar `v[i]`, push/pop |
| O(log n) | logarítmica | busca binária, operações em ABB balanceada |
| O(n) | linear | busca sequencial, somar um vetor |
| O(n log n) | linearítmica | merge sort, heapsort, quicksort médio |
| O(n²) | quadrática | bolha, seleção, inserção; dois laços aninhados |
| O(n³) | cúbica | multiplicação ingênua de matrizes |
| O(2ⁿ) | exponencial | Fibonacci recursivo ingênuo, subconjuntos |
| O(n!) | fatorial | testar todas as permutações (caixeiro-viajante por força bruta) |

::widget big-o

Fonte: adaptado de CORMEN et al. (2009, cap. 3) — recriado pela equipe Stacklyst.

### Contando passos

```python
def exemplo(v):
    total = 0                      # 1
    for x in v:                    # n vezes
        total += x                 # 1 → n no total
    for i in range(len(v)):        # n vezes
        for j in range(len(v)):    # n vezes
            if v[i] == v[j]:       # n² no total
                total += 1
    return total                   # → O(n) + O(n²) = O(n²)
```

### Melhor, médio e pior caso

- **Pior caso:** o mais usado (garantia). Busca sequencial: elemento no fim ou ausente → O(n).
- **Melhor caso:** busca sequencial com o elemento na primeira posição → O(1).
- **Caso médio:** expectativa sobre entradas aleatórias.

### Paradigmas de projeto de algoritmos

- **Força bruta:** testa todas as possibilidades.
- **Divisão e conquista:** divide em subproblemas **independentes**, resolve recursivamente e **combina** (merge sort, busca binária).
- **Programação dinâmica:** para problemas de **otimização** com **subproblemas sobrepostos** e subestrutura ótima; resolve cada subproblema **uma vez** e guarda o resultado (memoização/tabela). Ex.: Fibonacci, mochila, menor caminho.
- **Guloso:** faz sempre a **melhor escolha local** esperando chegar ao ótimo global; nem sempre encontra a solução ótima (Dijkstra, Kruskal e troco com moedas canônicas funcionam; outros casos não).

## Características principais

- Complexidade é sobre **crescimento**, não sobre tempo absoluto.
- Para *n* pequeno, constantes importam; para *n* grande, a classe domina.
- Também se mede **complexidade de espaço** (memória extra).

## Exemplos práticos

:::example Quanto custa para n = 1 milhão (≈ 10⁶)
- O(log n) ≈ 20 operações
- O(n) = 10⁶
- O(n log n) ≈ 2 × 10⁷
- O(n²) = 10¹² (horas ou dias)
- O(2ⁿ): impossível
:::

## Representação visual

No gráfico interativo da seção Como funciona, compare as classes para o mesmo tamanho de entrada e depois aumente n. No ENADE, concentre-se na taxa de crescimento para n grande e lembre-se de que O(g(n)) é um limite superior assintótico.

## Vantagens e desvantagens

| Paradigma | Vantagem | Desvantagem |
|---|---|---|
| Força bruta | simples, sempre correto | inviável para n grande |
| Divisão e conquista | eficiente, paralelizável | recursão e memória extra |
| Programação dinâmica | evita recomputação | memória para a tabela |
| Guloso | rápido e simples | pode não dar o ótimo |

## Diferenças entre conceitos semelhantes

- **O × Θ × Ω:** limite superior × justo × inferior. Em prova, "complexidade O" quase sempre significa pior caso.
- **Divisão e conquista × programação dinâmica:** subproblemas **independentes** × **sobrepostos**.
- **Programação dinâmica × guloso:** PD considera várias decisões e garante o ótimo (quando aplicável); guloso decide localmente e **não volta atrás**.
- **Complexidade de tempo × de espaço:** operações × memória.

## Como cai no ENADE

:::enade
Afirmações sobre paradigmas (2008: divisão e conquista, programação dinâmica e guloso — questão anulada, mas os conceitos são cobrados), eficiência de soluções recursivas e comparação entre algoritmos de ordenação e busca.
:::

## Pegadinhas

:::trap Guloso nem sempre é ótimo
"Faz sempre a melhor escolha momentânea" é verdade; "sempre encontra a solução ótima" é falso.
:::

:::trap Sobreposição de subproblemas é marca da programação dinâmica
Não é característica que PD e guloso "têm em comum" nem a base da divisão e conquista.
:::

:::trap Constantes não mudam a classe
O(5n) e O(n) são a mesma classe.
:::

## Questões comentadas

::question 2008-objective-26 Métodos de projeto de algoritmos (anulada)

Embora anulada pelo Inep, é ótima para revisar: divisão e conquista divide e combina; PD aplica-se a otimização com subproblemas sobrepostos; o guloso faz a melhor escolha local e nem sempre acha o ótimo; e D&C **não** tem a mesma eficiência que PD quando os subproblemas dependem uns dos outros (D&C recalcularia).

::question 2008-objective-27 Eficiência do Fibonacci recursivo

A recursão ingênua é **exponencial**; dizer que é o método mais eficiente é o erro da questão.

## Resumo para memorizar

:::summary
- Big O = **limite superior do crescimento**; ignore constantes, fique com o termo dominante.
- Ordem: **1 < log n < n < n log n < n² < n³ < 2ⁿ < n!**
- Aninhados multiplicam; sequência soma; dividir pela metade → log n.
- D&C (independentes) × PD (sobrepostos, guarda resultados) × guloso (melhor escolha local).
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual a complexidade de um algoritmo com um laço de n iterações dentro de outro laço de n iterações?",
    "options": ["O(n)", "O(2n)", "O(n²)", "O(log n)"],
    "answer": 2,
    "explanation": "Laços aninhados multiplicam: n × n."
  },
  {
    "question": "Simplificando 4n² + 3n log n + 100, obtemos:",
    "options": ["O(n log n)", "O(n²)", "O(4n²)", "O(100)"],
    "answer": 1,
    "explanation": "O termo dominante é n²; constantes são ignoradas."
  },
  {
    "question": "Qual paradigma resolve cada subproblema uma única vez e reaproveita o resultado?",
    "options": ["Guloso", "Força bruta", "Programação dinâmica", "Divisão e conquista pura"],
    "answer": 2,
    "explanation": "Programação dinâmica guarda soluções de subproblemas sobrepostos."
  }
]
:::

## Referências

- CORMEN, T. H. et al. *Algoritmos: teoria e prática*. 3. ed. Elsevier, 2012 — caps. 3, 4, 15 e 16.
- ZIVIANI, N. *Projeto de Algoritmos*. 3. ed. Cengage, 2010 — caps. 1 e 2.
- DASGUPTA, S.; PAPADIMITRIOU, C.; VAZIRANI, U. *Algoritmos*. McGraw-Hill, 2009.
- INEP. ENADE TADS 2008, questões 26 (anulada) e 27.
- CORMEN, Thomas H. et al. *Introduction to algorithms*. 3. ed. Cambridge, MA: MIT Press, 2009.

---
title: Listas encadeadas — simples, duplamente encadeadas e circulares
summary: Nós e ponteiros, inserção, remoção e busca em listas simplesmente e duplamente encadeadas e circulares, com custos, código e visualização interativa.
order: 3
level: básico
version: 3
updated: 2026-11-25
tags: [lista encadeada, lista ligada, nó, ponteiro, cabeça, cauda, null, lista simplesmente encadeada, lista duplamente encadeada, lista circular, inserção, remoção, busca sequencial, estrutura dinâmica]
related: [vetores-e-matrizes, pilhas-e-filas, arvores, complexidade-de-algoritmos]
---

## O que é

Uma **lista encadeada** é uma sequência de **nós** em que cada nó guarda um **dado** e um **ponteiro (referência)** para o próximo nó. Ao contrário do vetor, os nós **não ficam contíguos** na memória; a ordem é dada pelos ponteiros.

- **Simplesmente encadeada:** cada nó aponta para o **próximo**; o último aponta para `NULL`.
- **Duplamente encadeada:** cada nó aponta para o **próximo** e para o **anterior**; permite percorrer nos **dois sentidos**.
- **Circular:** o último nó aponta de volta para o **primeiro** (pode ser simples ou dupla).

## Para que serve

Para coleções que **crescem e diminuem** com frequência, com muitas **inserções e remoções**, sem saber o tamanho de antemão. É base para pilhas, filas, listas de adjacência de grafos e tabelas hash com encadeamento.

## Como funciona

### Estrutura do nó

```c
typedef struct No {
    int dado;
    struct No *prox;      // lista simples
    struct No *ant;       // só na lista dupla
} No;
```

```java
class No {
    int dado;
    No prox;   // referência ao próximo
    No(int dado) { this.dado = dado; }
}
```

### Operações

- **Inserir no início:** o novo nó aponta para a cabeça atual; a cabeça passa a ser o novo nó — **O(1)**.
- **Inserir no fim:** sem ponteiro para a cauda, percorre-se a lista — **O(n)**; com ponteiro de cauda — **O(1)**.
- **Remover:** ajusta-se o ponteiro do **anterior** para pular o nó removido. Na lista dupla, também se ajusta o `ant` do seguinte.
- **Buscar:** percorrer desde a cabeça — **O(n)** (não há acesso por índice).

```java
void inserirNoInicio(int valor) {
    No novo = new No(valor);
    novo.prox = cabeca;
    cabeca = novo;
}
boolean remover(int valor) {
    No atual = cabeca, anterior = null;
    while (atual != null && atual.dado != valor) { anterior = atual; atual = atual.prox; }
    if (atual == null) return false;
    if (anterior == null) cabeca = atual.prox; else anterior.prox = atual.prox;
    return true;
}
```

::widget linked-list

## Características principais

| | Simples | Dupla | Circular |
|---|---|---|---|
| Ponteiros por nó | 1 | 2 | 1 ou 2 |
| Percorre para trás? | não | **sim** | só dando a volta (simples) |
| Último nó aponta para | NULL | NULL | **o primeiro** |
| Uso típico | pilhas, listas simples | navegação ida e volta, LRU cache, editores | escalonamento round-robin, buffers circulares |

## Exemplos práticos

:::example Trajetos de representantes (ENADE 2014)
Cada `Local` guarda referência à **origem** (anterior) e ao **destino** (próximo). Isso permite analisar o trajeto do início ao fim **e** do fim ao início: é uma **lista duplamente encadeada**.
:::

:::example Triagem hospitalar com lista (ENADE 2021)
Uma lista encadeada de cartões (número e cor) permite inserir pacientes urgentes à frente dos não urgentes ajustando ponteiros, sem deslocar elementos.
:::

## Representação visual

Siga a seta que sai de cada registro. Na lista dupla, cada par de vizinhos permite percorrer as duas direções. Na circular, o último aponta para o primeiro. No ENADE, confira qual apontador encerra um percurso e quais referências uma inserção entre dois registros precisa atualizar.

::figure{id="variantes-de-lista-encadeada"}

## Vantagens e desvantagens

| Vantagens | Desvantagens |
|---|---|
| tamanho dinâmico | acesso por posição O(n) |
| inserção/remoção O(1) com o ponteiro certo | memória extra para ponteiros |
| sem realocação nem deslocamento | pior localidade de cache que vetores |

## Diferenças entre conceitos semelhantes

| | Vetor | Lista encadeada |
|---|---|---|
| Memória | contígua | nós espalhados |
| Acesso ao i-ésimo | **O(1)** | O(n) |
| Inserir no início | O(n) | **O(1)** |
| Tamanho | fixo (ou realocado) | dinâmico |

- **Lista dupla × árvore:** ambas têm dois ponteiros por nó, mas a árvore organiza **hierarquia** (esquerda/direita); a lista dupla, **sequência** (anterior/próximo).

## Como cai no ENADE

:::enade
Cenários que exigem percorrer em dois sentidos (**lista dupla**, 2014), implementação de pilha/fila com nós encadeados (2021) e discursivas com código C de inserção ordenada (2021).
:::

## Pegadinhas

:::trap Ordem dos ponteiros importa
Ao inserir, primeiro faça o novo nó apontar para o próximo, **depois** ajuste o anterior. Na ordem inversa, você perde o resto da lista.
:::

:::trap Árvore de busca não representa trajeto bidirecional
Ordenar por chave não preserva a sequência origem → destino.
:::

## Questões comentadas

::question 2014-objective-14 Classe Local com origem e destino

Referências para o local anterior (origem) e o seguinte (destino) permitem percorrer o trajeto **nos dois sentidos** — características de uma **lista duplamente encadeada**. Afirmações que sugerem árvore de busca ou outra estrutura não representam essa sequência bidirecional.

## Resumo para memorizar

:::summary
- Nó = **dado + ponteiro(s)**. Último aponta para **NULL** (exceto na circular).
- **Simples**: só próximo. **Dupla**: próximo e anterior (dois sentidos). **Circular**: último → primeiro.
- Inserir no início **O(1)**; buscar **O(n)**; sem acesso por índice.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual estrutura permite percorrer os elementos do fim para o início sem dar a volta?",
    "options": ["Lista simplesmente encadeada", "Lista duplamente encadeada", "Pilha com vetor", "Fila circular simples"],
    "answer": 1,
    "explanation": "O ponteiro 'anterior' permite andar para trás."
  },
  {
    "question": "Qual o custo de buscar um valor em uma lista encadeada com n nós?",
    "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    "answer": 2,
    "explanation": "Não há acesso por índice; é preciso percorrer nó a nó."
  },
  {
    "question": "Em uma lista circular, o ponteiro 'próximo' do último nó aponta para:",
    "options": ["NULL", "Ele mesmo", "O primeiro nó", "O penúltimo nó"],
    "answer": 2,
    "explanation": "A circular fecha o anel no primeiro nó."
  }
]
:::

## Referências

- CELES, W.; CERQUEIRA, R.; RANGEL, J. L. *Introdução a Estruturas de Dados*. Elsevier, 2004 — cap. 10.
- CORMEN, T. H. et al. *Algoritmos: teoria e prática*. 3. ed. Elsevier, 2012 — seção 10.2.
- TENENBAUM, A. M.; LANGSAM, Y.; AUGENSTEIN, M. J. *Estruturas de Dados usando C*. Pearson, 1995.
- INEP. ENADE TADS 2014 (questão 14) e 2021 (discursiva 5).
- CORMEN, Thomas H. et al. *Introduction to algorithms*. 3. ed. Cambridge, MA: MIT Press, 2009.

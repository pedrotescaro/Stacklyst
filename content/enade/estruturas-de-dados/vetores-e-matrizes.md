---
title: Vetores e matrizes
summary: Arranjos unidimensionais e multidimensionais, indexação, acesso em tempo constante, percursos com laços aninhados, armazenamento em memória e problemas clássicos de prova.
order: 2
level: básico
version: 3
updated: 2026-11-25
tags: [vetor, array, arranjo, matriz, matriz multidimensional, índice, linha, coluna, percurso, laço aninhado, row-major, acesso aleatório, estrutura estática]
related: [algoritmos-e-logica-de-programacao, busca-e-ordenacao, listas-encadeadas, complexidade-de-algoritmos]
---

## O que é

- **Vetor (array unidimensional):** coleção de **tamanho fixo** de elementos **do mesmo tipo**, guardados em **posições contíguas** de memória e acessados por um **índice** (`v[0]`, `v[1]`…).
- **Matriz (array multidimensional):** vetor de vetores — elementos acessados por **dois ou mais índices** (`m[linha][coluna]`).

## Para que serve

Guardar e processar conjuntos de dados de forma direta: notas de uma turma, pixels de uma imagem, tabuleiros de jogos, estoque em prateleiras, tabelas.

## Como funciona

### Indexação e acesso

Como os elementos são contíguos, o endereço do elemento `i` é `base + i × tamanho_do_tipo`. Por isso o **acesso por índice é O(1)** (tempo constante), independentemente do tamanho.

- Em C, Java e Python os índices começam em **0**; em muitos pseudocódigos do ENADE, em **1** (`vetor[1..9]`). **Leia a declaração.**
- Acessar fora dos limites causa erro (Java/Python) ou comportamento indefinido (C).

### Percurso

```java
int soma = 0;
for (int i = 0; i < v.length; i++) soma += v[i];      // vetor

for (int i = 0; i < linhas; i++)                      // matriz: laços aninhados
    for (int j = 0; j < colunas; j++)
        total += m[i][j];
```

### Memória da matriz

Na maioria das linguagens (C, Java, Python/NumPy por padrão), matrizes são guardadas **por linhas** (*row-major*): todos os elementos da linha 0, depois os da linha 1… O endereço de `m[i][j]` em uma matriz de `C` colunas é `base + (i × C + j) × tamanho`.

### Operações e custos

| Operação | Custo |
|---|---|
| Acessar `v[i]` | O(1) |
| Buscar um valor (não ordenado) | O(n) |
| Inserir/remover no meio | O(n) — é preciso deslocar elementos |
| Percorrer matriz n × m | O(n·m) |

## Características principais

- **Estrutura estática**: tamanho definido na criação (listas dinâmicas como `ArrayList` realocam por baixo).
- **Homogênea**: todos os elementos do mesmo tipo.
- **Acesso aleatório** rápido; inserções no meio caras.

## Exemplos práticos

:::example Soma das linhas de uma matriz (ENADE 2021)
`mat = {{1,2,-1,2,3},{1,-3,4,2,0},{-3,5,2,3,4}}`; `sl[i]` acumula cada linha e `x` soma tudo.
- linha 1: 1+2−1+2+3 = **7**
- linha 2: 1−3+4+2+0 = **4**
- linha 3: −3+5+2+3+4 = **11**
- x = 7 + 4 + 11 = **22**
:::

:::example Transposta e diagonal
```python
m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
diagonal = [m[i][i] for i in range(3)]          # [1, 5, 9]
transposta = [[m[j][i] for j in range(3)] for i in range(3)]
```
:::

## Representação visual

Cada linha da tabela corresponde a um trecho contíguo do arranjo em ordem de linhas. O primeiro índice escolhe a linha e o segundo escolhe a coluna.

| | Coluna 0 | Coluna 1 | Coluna 2 |
|---|---|---|---|
| **Linha 0** | m[0][0] | m[0][1] | m[0][2] |
| **Linha 1** | m[1][0] | m[1][1] | m[1][2] |

O laço externo escolhe a linha i e o interno enumera suas colunas j. A seta de troca da linha volta ao teste externo, que reinicializa j ao entrar na próxima linha. No ENADE, siga o par de índices para conferir quais posições entram na soma de uma linha.

::figure{id="percurso-matriz-por-linhas"}

## Vantagens e desvantagens

| Vantagens | Desvantagens |
|---|---|
| acesso O(1) por índice | tamanho fixo |
| simples e eficiente em cache | inserção/remoção no meio O(n) |
| base para outras estruturas (pilha, fila, hash, heap) | desperdício se superdimensionado |

## Diferenças entre conceitos semelhantes

- **Vetor × lista encadeada:** vetor tem acesso por índice O(1) e inserção no meio O(n); lista tem inserção O(1) (com o ponteiro) e acesso O(n). Veja [Listas encadeadas](lib:listas-encadeadas).
- **Vetor estático × dinâmico:** o dinâmico (`ArrayList`, `list` do Python) cresce realocando e copiando.
- **Linha × coluna:** o **primeiro** índice costuma ser a linha.

## Como cai no ENADE

:::enade
Simulação de algoritmos com vetores e matrizes (2008 e 2021), discursivas com matrizes como estantes/tabuleiros (2011, 2014, 2017) e índices começando em 1 nos pseudocódigos.
:::

## Pegadinhas

:::trap Índice inicial
`V[0..4]` tem 5 posições (0 a 4). `vetor[1..9]` tem 9 posições, começando em 1.
:::

:::trap Ordem dos índices
`m[i][j]` com `i` de 1 a 3 e `j` de 1 a 5 percorre **3 linhas** de **5 colunas**.
:::

## Questões comentadas

::question 2021-objective-29 Soma das linhas de uma matriz 3 × 5

As linhas somam 7, 4 e 11; x acumula 22 (alternativa D). Erros comuns: somar só uma coluna ou só a última linha.

::question 2008-discursive-40 Algoritmo com matriz M[0..2][0..3]

Discursiva que exige **teste de mesa** com laços aninhados: anote i, j e o valor calculado em cada célula para preencher a matriz final.

## Resumo para memorizar

:::summary
- Vetor: tamanho fixo, mesmo tipo, **contíguo**, acesso **O(1)**.
- Matriz: vetor de vetores; `m[linha][coluna]`; percurso com **laços aninhados** O(n·m).
- Inserir/remover no meio custa **O(n)**.
- Confira se o índice começa em **0** ou **1**.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual o custo de acessar o elemento v[500] em um vetor de 1 milhão de posições?",
    "options": ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    "answer": 2,
    "explanation": "O endereço é calculado diretamente pelo índice."
  },
  {
    "question": "Quantas vezes o comando interno executa em 'para i de 1 até 4, para j de 1 até 3'?",
    "options": ["7", "12", "4", "3"],
    "answer": 1,
    "explanation": "4 × 3 = 12 execuções."
  },
  {
    "question": "Por que inserir um elemento no início de um vetor é caro?",
    "options": ["Porque é preciso deslocar todos os elementos uma posição", "Porque o vetor é encadeado", "Porque o índice 0 é proibido", "Não é caro"],
    "answer": 0,
    "explanation": "Abrir espaço exige mover n elementos: O(n)."
  }
]
:::

## Referências

- CELES, Waldemar; CERQUEIRA, Renato; RANGEL, José Lucas. *Introdução a estruturas de dados: com técnicas de programação em C*. Rio de Janeiro: Elsevier, 2004.
- CORMEN, T. H. et al. *Algoritmos: teoria e prática*. 3. ed. Elsevier, 2012.
- ZIVIANI, N. *Projeto de Algoritmos com implementações em Pascal e C*. 3. ed. Cengage, 2010.
- INEP. ENADE TADS 2021, questão 29.

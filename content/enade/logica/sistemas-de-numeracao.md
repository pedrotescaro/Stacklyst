---
title: Sistemas de numeração e álgebra booleana — binário, octal, decimal e hexadecimal
summary: Notação posicional, conversões entre bases (com passo a passo), atalhos binário–octal–hexadecimal, bits, bytes e barramentos, operações binárias e a ligação com a álgebra booleana e portas lógicas.
order: 5
level: básico
version: 3
updated: 2026-11-25
tags: [sistemas de numeração, base 2, binário, octal, decimal, hexadecimal, conversão de bases, notação posicional, bit, byte, palavra, barramento, endereçamento, álgebra booleana, portas lógicas, and, or, not, nand, xor, complemento de dois]
related: [proposicoes-e-conectivos, memoria-e-arquivos, redes-de-computadores, algoritmos-e-logica-de-programacao]
---

## O que é

Um **sistema de numeração posicional** representa números com **dígitos** cujo valor depende da **posição**. Em uma base *b*, cada posição vale uma potência de *b*:

$$(d_k \dots d_1 d_0)_b = d_k \cdot b^k + \dots + d_1 \cdot b^1 + d_0 \cdot b^0$$

| Base | Nome | Dígitos | Uso na computação |
|---|---|---|---|
| 2 | binário | 0, 1 | representação interna (bits) |
| 8 | octal | 0–7 | permissões Unix (`chmod 755`), legado |
| 10 | decimal | 0–9 | uso humano; IPv4 em decimal pontuado |
| 16 | hexadecimal | 0–9, A–F | endereços de memória, MAC, cores (`#0083FE`) |

## Para que serve

Computadores trabalham com dois estados elétricos (0 e 1). Entender bases permite ler endereços, máscaras de rede, cores, permissões e dumps de memória, e calcular capacidades (quantos valores cabem em *n* bits).

## Como funciona

### De qualquer base para decimal — soma posicional

(1001)₂ = 1·8 + 0·4 + 0·2 + 1·1 = **9**
(15)₈ = 1·8 + 5 = **13**
(FF)₁₆ = 15·16 + 15 = **255**

### De decimal para outra base — divisões sucessivas

Divida pela base repetidamente e leia os **restos de baixo para cima**.

25 ÷ 2 = 12 r **1** → 12 ÷ 2 = 6 r **0** → 6 ÷ 2 = 3 r **0** → 3 ÷ 2 = 1 r **1** → 1 ÷ 2 = 0 r **1** ⇒ (25)₁₀ = **(11001)₂**

### Atalhos entre binário, octal e hexadecimal

- **Octal ↔ binário:** cada dígito octal = **3 bits**. (75)₈ = 111 101 = (111101)₂.
- **Hexa ↔ binário:** cada dígito hexa = **4 bits**. (2F)₁₆ = 0010 1111 = (101111)₂.
- Agrupe o binário **da direita para a esquerda**, completando com zeros à esquerda.

::widget base-converter

### Bits, bytes e capacidade

- **bit** = 0 ou 1; **byte** = 8 bits; **nibble** = 4 bits (um dígito hexa).
- Com *n* bits representam-se **2ⁿ** valores (0 a 2ⁿ − 1). 8 bits → 256 valores; 32 bits → ~4,3 bilhões (endereços IPv4).
- **Barramento de dados** de *n* bits transfere *n* bits por vez; **barramento de endereços** de *n* bits endereça **2ⁿ** posições de memória.

### Álgebra booleana e portas lógicas

Variáveis com valores 0/1 e operações: **NOT** (¬, ~), **AND** (·, *), **OR** (+), **XOR** (⊕), **NAND**, **NOR**. As mesmas leis da lógica proposicional valem (De Morgan, distributiva, absorção). Circuitos digitais são combinações de **portas lógicas**; NAND e NOR são **universais** (constroem qualquer função).

### Números negativos — complemento de dois

Inverta os bits e some 1: com 8 bits, +5 = 00000101 → −5 = 11111011. Faixa com *n* bits: de −2ⁿ⁻¹ a 2ⁿ⁻¹ − 1.

## Características principais

- O dígito mais à direita é o **menos significativo** (LSB); o da esquerda, o **mais significativo** (MSB).
- Em hexadecimal, A=10, B=11, C=12, D=13, E=14, F=15.

## Exemplos práticos

:::example Soma em bases diferentes (ENADE 2021)
(1001)₂ + (15)₈ + (FF)₁₆ = 9 + 13 + 255 = **(277)₁₀**.
:::

:::example Endereço IPv4 em binário
192.168.70.10 → 11000000.10101000.01000110.00001010 (cada octeto tem 8 bits).
:::

## Representação visual

Cada coluna representa o mesmo inteiro escrito em outra base.

| Decimal | Binário | Octal | Hexa |
|---|---|---|---|
| 0 | 0000 | 0 | 0 |
| 5 | 0101 | 5 | 5 |
| 8 | 1000 | 10 | 8 |
| 10 | 1010 | 12 | A |
| 15 | 1111 | 17 | F |
| 16 | 10000 | 20 | 10 |
| 255 | 11111111 | 377 | FF |

Separe os bits em grupos de quatro a partir da direita. Cada grupo vira um algarismo hexadecimal na mesma posição porque 16 = 2⁴. No ENADE, confira a ordem dos grupos e complete o grupo mais à esquerda com zeros se ele tiver menos de quatro bits.

::figure{id="conversao-binario-hexadecimal"}

## Diferenças entre conceitos semelhantes

- **Barramento de dados × de endereços:** largura do dado transferido × quantidade de posições endereçáveis (2ⁿ).
- **Bit × byte:** 1 × 8 bits; velocidades de rede costumam usar bits (Mbps), tamanhos de arquivo, bytes (MB).
- **OR lógico × soma:** em booleana, 1 + 1 = 1; em binário aritmético, 1 + 1 = 10.

## Como cai no ENADE

:::enade
Conversões e somas entre bases (2021) e cálculos de barramento/capacidade (2014), além de expressões booleanas em questões de lógica (2017).
:::

## Pegadinhas

:::trap Leia os restos de baixo para cima
Na divisão sucessiva, o **último** resto é o dígito mais significativo.
:::

:::trap Em octal não existem 8 e 9
"(18)₈" é inválido.
:::

## Questões comentadas

::question 2021-objective-27 Soma de números em bases diferentes

Converta cada parcela para decimal: 1001₂ = 9; 15₈ = 13; FF₁₆ = 255. Soma = **277** (alternativa C).

::question 2014-objective-27 Barramentos

Cálculos de barramento usam potências de 2: um barramento de endereços de *n* linhas endereça 2ⁿ posições; a largura do barramento de dados define quantos bits trafegam por ciclo.

## Resumo para memorizar

:::summary
- Para decimal: **soma posicional** (dígito × base^posição).
- De decimal: **divisões sucessivas**, restos de **baixo para cima**.
- Octal = **3 bits** por dígito; hexa = **4 bits** por dígito.
- *n* bits → **2ⁿ** valores. 1 byte = 8 bits.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Quanto vale (1101)₂ em decimal?",
    "options": ["11", "13", "15", "9"],
    "answer": 1,
    "explanation": "8 + 4 + 0 + 1 = 13."
  },
  {
    "question": "Quanto vale (3A)₁₆ em decimal?",
    "options": ["58", "310", "48", "42"],
    "answer": 0,
    "explanation": "3 × 16 + 10 = 58."
  },
  {
    "question": "Quantos endereços distintos um barramento de endereços de 16 bits consegue gerar?",
    "options": ["16", "256", "65.536", "32"],
    "answer": 2,
    "explanation": "2¹⁶ = 65.536."
  }
]
:::

## Referências

- STALLINGS, W. *Arquitetura e Organização de Computadores*. 10. ed. Pearson, 2017 — apêndice sobre sistemas de numeração e cap. 3 (barramentos).
- TANENBAUM, A. S.; AUSTIN, T. *Organização Estruturada de Computadores*. 6. ed. Pearson, 2013 — apêndices A e B.
- IDOETA, I. V.; CAPUANO, F. G. *Elementos de Eletrônica Digital*. 42. ed. Érica, 2019.
- INEP. ENADE TADS 2014 (questão 27) e 2021 (questão 27).
- ROSEN, Kenneth H. *Discrete mathematics and its applications*. 8. ed. New York: McGraw-Hill Education, 2019.

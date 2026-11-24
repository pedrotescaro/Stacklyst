---
title: Curva de Lorenz, índice de Gini e distribuição de renda
summary: Como a curva de Lorenz representa a renda acumulada da população, como ler pontos e calcular a parcela dos mais ricos, o que o índice de Gini mede e como calculá-lo — com simulador interativo.
order: 5
level: intermediário
version: 1
updated: 2026-11-24
tags: [curva de lorenz, índice de gini, coeficiente de gini, desigualdade, distribuição de renda, renda acumulada, quintis, decis, linha de igualdade perfeita, área, ipea, ibge]
related: [funcoes-e-graficos, porcentagem-e-proporcao, estatistica-descritiva, sociedade-e-desigualdade]
---

## O que é

- A **curva de Lorenz** mostra, para cada percentual x da população **ordenada da menor para a maior renda**, qual percentual **da renda total** esse grupo recebe (renda **acumulada**).
- O **índice (coeficiente) de Gini** resume a desigualdade em um número entre **0** (igualdade perfeita: todos têm a mesma renda) e **1** (desigualdade máxima: uma pessoa tem toda a renda).

## Para que serve

São os instrumentos mais usados para medir **desigualdade de renda** (ou de riqueza, terra, consumo) entre países, regiões e ao longo do tempo. O Brasil é historicamente um dos países mais desiguais do mundo, com Gini acima de 0,5 por décadas (IBGE/Ipea).

## Como funciona

### Construindo a curva

1. Ordene a população da menor para a maior renda.
2. Divida em grupos iguais (quintis = 20% cada; decis = 10%).
3. Acumule a participação na renda: os 20% mais pobres têm 3%; os 40% mais pobres, 3% + 7% = 10%; e assim por diante.
4. Marque os pontos (x% da população, y% acumulado da renda), começando em (0, 0) e terminando em (100, 100).

A **linha de igualdade perfeita** é a diagonal: 20% da população com 20% da renda, 50% com 50%… Quanto **mais a curva se afasta** da diagonal (mais "barriga"), **maior a desigualdade**.

### Lendo pontos

- "Os **60% de menor renda** têm **20%** da renda" → ponto (60, 20).
- Para a parcela dos **20% mais ricos**: veja o ponto dos **80% mais pobres** e subtraia de 100%. Se os 80% mais pobres têm 40%, os 20% mais ricos têm **100% − 40% = 60%**.

### Índice de Gini

$$G = \frac{A}{A + B} = 2A$$

em que **A** é a área entre a diagonal e a curva e **B** a área sob a curva (A + B = 1/2). Com grupos discretos, usa-se a fórmula dos trapézios (Brown):

$$G = 1 - \sum_{k=1}^{n} (X_k - X_{k-1})(Y_k + Y_{k-1})$$

com X e Y em proporções acumuladas (0 a 1).

::widget lorenz-gini

## Características principais

- A curva é sempre **crescente** e **convexa** (cada grupo seguinte tem renda maior ou igual).
- Começa em (0,0), termina em (1,1) e nunca fica acima da diagonal.
- Gini é **relativo**: não diz o nível de renda, só a distribuição.

## Exemplos práticos

:::example Calculando o Gini com quintis
Participações: 5%, 10%, 15%, 25%, 45%. Acumulados Y: 0, 0,05, 0,15, 0,30, 0,55, 1,00; cada ΔX = 0,2.

Σ ΔX·(Yₖ + Yₖ₋₁) = 0,2 × (0,05 + 0,20 + 0,45 + 0,85 + 1,55) = 0,2 × 3,10 = 0,62 → **G = 1 − 0,62 = 0,38**.
:::

## Representação visual

O simulador acima desenha a curva, a linha de igualdade e a área de desigualdade (que dá o Gini). Teste os cenários de igualdade perfeita e de desigualdade alta.

## Vantagens e desvantagens

| Vantagens | Limitações |
|---|---|
| visual e intuitiva (Lorenz) | curvas que se cruzam têm comparação ambígua |
| resume a desigualdade em um número (Gini) | o mesmo Gini pode vir de distribuições diferentes |
| comparável entre países e épocas | não mostra o nível de pobreza nem o de renda média |

## Diferenças entre conceitos semelhantes

- **Renda acumulada × renda do grupo:** a curva mostra o **acumulado**; a renda de um grupo é a **diferença** entre pontos consecutivos.
- **Gini × renda per capita:** desigualdade × riqueza média.
- **Gini 0 × Gini 1:** igualdade total × concentração total.

## Como cai no ENADE

:::enade
Leitura da curva de Lorenz brasileira para achar a parcela da renda dos mais ricos (2008) e textos sobre desigualdade e mobilidade social na formação geral.
:::

## Pegadinhas

:::trap A curva mostra os mais POBRES acumulados
Para os **mais ricos**, use o complemento: 100% menos o acumulado dos demais.
:::

:::trap Gini maior = mais desigual
Um país com Gini 0,55 é **mais** desigual que um com 0,30.
:::

## Questões comentadas

::question 2008-objective-7 Parcela da renda dos 20% mais ricos

No gráfico, os **80% de menor renda** recebem aproximadamente **40%** da renda total. Logo, os 20% de maior renda ficam com **100% − 40% = 60%** (alternativa D).

## Resumo para memorizar

:::summary
- Lorenz: x% mais pobres → y% **acumulado** da renda; diagonal = igualdade.
- Mais "barriga" = mais desigualdade.
- Mais ricos = **100% − acumulado** dos mais pobres.
- Gini = área entre diagonal e curva × 2; **0 = igual, 1 = concentrado**.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Se os 90% mais pobres detêm 55% da renda, quanto detêm os 10% mais ricos?",
    "options": ["10%", "45%", "55%", "90%"],
    "answer": 1,
    "explanation": "100% − 55% = 45%."
  },
  {
    "question": "Um índice de Gini igual a 0 indica:",
    "options": ["desigualdade máxima", "igualdade perfeita de renda", "renda média nula", "erro de cálculo"],
    "answer": 1,
    "explanation": "Todos recebem a mesma fração da renda; a curva coincide com a diagonal."
  },
  {
    "question": "Na curva de Lorenz, o eixo horizontal representa:",
    "options": ["a renda em reais", "o percentual acumulado da população, ordenada da menor para a maior renda", "o tempo", "o percentual de impostos"],
    "answer": 1,
    "explanation": "x = população acumulada; y = renda acumulada."
  }
]
:::

## Referências

- IBGE. *Síntese de Indicadores Sociais*. Rio de Janeiro, edições anuais.
- IPEA. *Ipeadata — distribuição de renda e coeficiente de Gini*. Disponível em ipeadata.gov.br.
- HOFFMANN, R. *Distribuição de Renda: medidas de desigualdade e pobreza*. Edusp, 1998.
- INEP. ENADE TADS 2008, questão 7.

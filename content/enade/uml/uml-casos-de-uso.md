---
title: Diagrama de casos de uso — atores, associações, include, extend e generalização
summary: Como ler e desenhar diagramas de casos de uso na notação oficial, a diferença exata entre «include» e «extend», generalização de atores e de casos de uso e a fronteira do sistema.
order: 3
level: básico
version: 2
updated: 2026-11-25
tags: [casos de uso, diagrama de casos de uso, ator, associação, include, extend, inclusão, extensão, ponto de extensão, generalização, fronteira do sistema, uml]
related: [historias-e-casos-de-uso, uml-visao-geral, requisitos-fundamentos, rup-visao-geral]
---

## O que é

O **diagrama de casos de uso** mostra **o que o sistema faz** do ponto de vista de quem o usa: os **atores** (papéis externos), os **casos de uso** (funcionalidades que entregam um resultado de valor) e os **relacionamentos** entre eles. É o diagrama mais **abstrato** e mais próximo do cliente.

Elementos da notação:

- **Ator** — boneco palito com nome; representa um **papel** desempenhado por uma pessoa, organização ou **outro sistema** que interage com o sistema.
- **Caso de uso** — **elipse** com um verbo no infinitivo + objeto ("Realizar empréstimo").
- **Fronteira do sistema** — retângulo com o nome do sistema; atores ficam **fora**, casos de uso **dentro**.
- **Associação** — linha entre ator e caso de uso (participação).

## Para que serve

- Delimitar o **escopo** funcional;
- Conversar com clientes sem jargão técnico;
- Organizar requisitos e planejar iterações (no RUP, o processo é **dirigido por casos de uso**);
- Servir de índice para as **especificações textuais** dos casos de uso, onde está o detalhe (fluxos).

## Como funciona

### «include» — inclusão (obrigatória)

O caso de uso **base** **sempre** incorpora o comportamento do caso incluído, em um ponto definido do seu fluxo. Usa-se para **reaproveitar** um comportamento comum a vários casos de uso.

- Seta **tracejada** do **base** → **incluído**, com o estereótipo «include».
- O caso base **não está completo** sem o incluído.
- Exemplo: "Realizar empréstimo" «include» "Autenticar usuário".

### «extend» — extensão (opcional/condicional)

O caso de uso **extensor** acrescenta comportamento ao **base** **apenas sob certas condições**, em um **ponto de extensão** do base.

- Seta **tracejada** do **extensor** → **base**, com «extend» (a seta aponta para o base!).
- O caso base é **completo sozinho**; a extensão é opcional.
- Pode ter **condição** entre colchetes e **ponto de extensão** nomeado.
- Exemplo: "Pagar multa" «extend» "Devolver livro" — [se houver atraso].

### Generalização

- **Entre atores:** o ator filho herda as associações do pai (Aluno e Professor são tipos de Leitor). Seta com triângulo vazado apontando para o pai.
- **Entre casos de uso:** o caso filho **herda** o comportamento e o significado do pai e pode **acrescentar ou sobrescrever** comportamento ("Validar aluno" generaliza "Validar via retina" e "Validar via digital" — formas **diferentes** da mesma validação).

## Características principais

- Não mostra **ordem** nem **fluxo**: isso fica na especificação textual ou em diagramas de atividades/sequência.
- Um ator é um **papel**, não uma pessoa específica.
- Nome do caso de uso = **objetivo do ator**, não uma tela ou botão ("Emitir boleto", não "Clicar em imprimir").

## Exemplos práticos

:::example Matrícula com validação biométrica
- Aluno → associado a "Realizar matrícula".
- "Realizar matrícula" «include» "Validar aluno": **toda** matrícula exige validação.
- "Validar aluno" é **generalização** de "Validar via retina" e "Validar via digital": duas formas **diferentes** de validar.
- "Realizar matrícula fora do prazo" «extend» "Realizar matrícula": só ocorre **opcionalmente/condicionalmente**, com tratativas próprias.
:::

## Representação visual

::widget uml diagram=usecase

Fonte: adaptado de OMG (2017, seção 18) e BOOCH; RUMBAUGH; JACOBSON (2006, caps. 17 e 18) — recriado pela equipe Stacklyst.

Leia os atores fora da fronteira e os casos dentro das elipses. A seta «include» sai de Realizar empréstimo e aponta para Autenticar usuário. A seta «extend» sai de Pagar multa e aponta para Devolver livro. Nas questões do ENADE, confirme a direção da seta e verifique em que condição o comportamento adicional entra.

## Vantagens e desvantagens

| Vantagens | Desvantagens |
|---|---|
| simples e compreensível pelo cliente | não mostra detalhes nem ordem |
| delimita escopo e atores | uso exagerado de include/extend vira "decomposição funcional" confusa |
| base para testes e planejamento | precisa da especificação textual para ser útil |

## Diferenças entre conceitos semelhantes

| | «include» | «extend» |
|---|---|---|
| Execução | **sempre** | **às vezes** (condição) |
| Direção da seta | base → **incluído** | extensor → **base** |
| Base completo sozinho? | **não** | **sim** |
| Uso típico | reaproveitar passos comuns | variações opcionais, exceções, comportamentos especiais |
| Exemplo | Comprar «include» Autenticar | Pagar com cupom «extend» Comprar |

- **Generalização × extend:** na generalização, o filho é **um tipo** do pai (substitui); no extend, o extensor **acrescenta** comportamento ao base.
- **Associação × include:** associação liga **ator ↔ caso de uso**; include liga **caso de uso ↔ caso de uso**.

## Como cai no ENADE

:::enade
O tema mais cobrado da UML no ENADE de ADS. As afirmativas trocam propositalmente as definições de **include** e **extend** (inclusive a direção da seta) e testam generalização entre casos de uso. Também aparecem discursivas pedindo o diagrama a partir de um texto.
:::

## Pegadinhas

:::trap "Toda vez que A executar, incorpora B" é include
Se a afirmativa chama isso de extensão, está errada (ENADE 2011).
:::

:::trap A seta do extend aponta para o caso base
É o extensor que "se pendura" no base. No include, a seta sai do base para o incluído.
:::

:::trap O caso estendido (base) permanece completo
Quem "nunca fica isolado" e só existe como parte de outro é o **incluído**/extensor, conforme o caso — leia com atenção qual é o base.
:::

:::trap Extensão não tem "as mesmas tratativas"
O caso extensor acrescenta comportamento **próprio**; não é idêntico ao base.
:::

## Questões comentadas

::question 2021-objective-31 Matrícula fora do prazo, validação por retina e digital

**I** falsa: o extend acrescenta comportamento próprio, então as tratativas **não** são as mesmas. **II** verdadeira: a matrícula fora do prazo é **opcional** (extend). **III** verdadeira: o include torna a validação **obrigatória** — e, como o extensor só ocorre dentro do caso base, a validação também vale nesse caso. **IV** falsa: o diagrama não diz que a validação usa a matrícula informada. **V** verdadeira: retina e digital são especializações **diferentes** de "Validar aluno". Resposta: **II, III e V** (alternativa D).

::question 2014-objective-17 Generalização, inclusão e extensão

**I** correta (o filho herda e pode acrescentar/sobrescrever). **IV** correta (a extensão descreve comportamento opcional/condicional). **II** e **III** misturam características de inclusão e extensão. Resposta: **I e IV**.

## Resumo para memorizar

:::summary
- Ator = **papel externo** (pessoa ou sistema), fora da fronteira. Caso de uso = **elipse**, verbo + objeto.
- **«include»** = obrigatório, reaproveitamento, seta **base → incluído**.
- **«extend»** = opcional/condicional, seta **extensor → base**, ponto de extensão.
- **Generalização** = herança entre atores ou entre casos de uso (triângulo vazado).
:::

:::mnemonic
**I**nclude = **I**ndispensável. **E**xtend = **E**ventual.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Em uma loja virtual, 'Aplicar cupom de desconto' só ocorre se o cliente tiver um cupom, durante 'Finalizar compra'. Qual relacionamento usar?",
    "options": ["Finalizar compra «include» Aplicar cupom", "Aplicar cupom «extend» Finalizar compra", "Generalização", "Associação com o ator Cupom"],
    "answer": 1,
    "explanation": "Comportamento condicional que acrescenta algo ao base: extend, com seta do extensor para o base."
  },
  {
    "question": "Todos os casos de uso de um sistema bancário exigem 'Autenticar cliente'. Qual relacionamento é adequado?",
    "options": ["«extend»", "«include»", "Generalização de atores", "Dependência de pacote"],
    "answer": 1,
    "explanation": "Comportamento comum e obrigatório reaproveitado: include."
  },
  {
    "question": "Um sistema externo de pagamentos que interage com o seu sistema deve ser representado como:",
    "options": ["Um caso de uso", "Um ator", "Uma classe", "Um pacote"],
    "answer": 1,
    "explanation": "Atores podem ser outros sistemas; eles ficam fora da fronteira."
  }
]
:::

## Referências

- OBJECT MANAGEMENT GROUP. *Unified Modeling Language (UML)*. Versão 2.5.1. [S. l.]: OMG, 2017. Disponível em: https://www.omg.org/spec/UML/2.5.1. Acesso em: 25 nov. 2026.
- BOOCH, G.; RUMBAUGH, J.; JACOBSON, I. *UML: guia do usuário*. 2. ed. Rio de Janeiro: Elsevier, 2006.
- COCKBURN, A. *Escrevendo Casos de Uso Eficazes*. Bookman, 2005.
- INEP. ENADE TADS 2008 (questão 25), 2011 (questões 11 e 12), 2014 (questão 17) e 2021 (questão 31).

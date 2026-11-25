---
title: Da arquitetura centralizada às três camadas — mainframes, cliente-servidor, front-end, back-end, APIs e bancos de dados
summary: A evolução das arquiteturas de sistemas de informação, o que são camadas de apresentação, negócio e dados, como front-end, back-end, APIs, servidores e bancos conversam e a ideia de transparência em sistemas distribuídos.
order: 1
level: básico
version: 3
updated: 2026-11-25
tags: [arquitetura de software, mainframe, arquitetura centralizada, terminal burro, cliente-servidor, duas camadas, três camadas, n camadas, apresentação, negócio, dados, front-end, back-end, api, rest, http, servidor de aplicação, banco de dados, sistemas distribuídos, transparência]
related: [estilos-arquiteturais, mvc-mvp-mvvm, redes-de-computadores, uml-diagramas-estruturais, computacao-em-nuvem]
---

## O que é

**Arquitetura de software** é a **organização fundamental** de um sistema: seus **componentes**, as **relações** entre eles e com o ambiente, e os **princípios** que guiam sua evolução (ISO/IEC/IEEE 42010). Ela decide **onde** fica cada responsabilidade — interface, regras de negócio, dados — e **como** as partes se comunicam.

## Para que serve

Decisões de arquitetura são as **mais caras de mudar** depois. Elas determinam desempenho, escalabilidade, segurança, facilidade de manutenção e de implantação. Por isso o RUP valida a arquitetura cedo, na Elaboração.

## Como funciona

### 1. Arquitetura centralizada (mainframes, anos 60–70)

Um **computador central (mainframe)** fazia **tudo**: interface, regras e dados. Usuários acessavam por **terminais "burros"** (só teclado e tela, sem processamento). Os programas eram **monolíticos**, escritos em linguagens estruturadas (Cobol), com bancos **não relacionais** (hierárquicos, como o ADABAS, ou arquivos indexados).

### 2. Cliente-servidor (anos 80–90)

Com os **microcomputadores**, parte do processamento foi para a **estação do usuário (cliente)**, que passou a cuidar da **interface** e de **algumas regras**; o **servidor** passou a cuidar principalmente dos **dados** (SGBD relacional). O cliente **solicita**; o servidor **atende**.

- **Duas camadas** (*two-tier*): cliente (interface + regras) ↔ servidor de banco. Cliente "gordo" (*fat client*): atualizar regras exige reinstalar em todas as máquinas.

### 3. Três camadas (anos 90 em diante)

As regras de negócio saem do cliente e vão para um **servidor de aplicação** no meio:

| Camada | Responsabilidade | Exemplos |
|---|---|---|
| **Apresentação** | interagir com o usuário: exibir dados e capturar ações | páginas web, app móvel, React, Angular |
| **Negócio (lógica/aplicação)** | **regras de negócio**, validações, orquestração | API em Java/Spring, Node, .NET, Python |
| **Dados (persistência)** | armazenar e recuperar dados com integridade | PostgreSQL, MySQL, MongoDB |

Cada camada só conversa com a **vizinha**: a apresentação **nunca acessa o banco diretamente**. Com mais divisões (cache, filas, serviços), fala-se em **n camadas**.

:::note Camada lógica (layer) × física (tier)
*Layer* é uma separação **lógica** de responsabilidades no código; *tier* é uma separação **física** em máquinas diferentes. Dá para ter três camadas lógicas rodando em um único servidor.
:::

### Front-end, back-end, APIs e servidores

- **Front-end**: a parte que roda **no dispositivo do usuário** (HTML, CSS, JavaScript, apps); cuida da apresentação.
- **Back-end**: a parte que roda **no servidor**: regras, segurança, integrações e acesso a dados.
- **API** (*Application Programming Interface*): o **contrato** pelo qual o front-end (ou outro sistema) pede serviços ao back-end. Na web, normalmente **REST sobre HTTP** com JSON: `GET /pedidos/42`, `POST /pedidos`.
- **Servidor web** (Nginx, Apache) entrega arquivos e encaminha requisições; **servidor de aplicação** executa o código do back-end; **servidor de banco de dados** executa o SGBD.

### Sistemas distribuídos e transparência

Quando aplicações e bases ficam em **máquinas diferentes**, ligadas por rede, temos um **sistema distribuído**. A característica fundamental para não prejudicar o usuário é a **transparência**: esconder dele que o sistema é distribuído. Tipos: transparência de **acesso**, **localização**, **migração**, **replicação**, **concorrência**, **falha**.

::widget layers-flow

Fonte: adaptado de FOWLER (2002, cap. 1) e SOMMERVILLE (2018, cap. 6) — recriado pela equipe Stacklyst.

Acompanhe a solicitação até os dados e a resposta de volta à tela. No ENADE, atribua a decisão de negócio à camada responsável por aplicá-la.

## Características principais

- Separar responsabilidades permite **alterar partes de forma independente** (trocar o front-end sem mexer nas regras).
- Mais camadas trazem **mais complexidade** e exigem **pessoal mais especializado**.
- O servidor de aplicação **centraliza regras**: atualizar uma regra atualiza todos os clientes.
- Segurança melhora: o banco não fica exposto aos clientes.

## Exemplos práticos

:::example Uma compra em uma loja virtual (três camadas)
1. O navegador (apresentação) envia `POST /pedidos` com o carrinho em JSON.
2. A API (negócio) autentica o usuário, confere estoque, calcula frete e desconto.
3. A camada de dados grava o pedido em uma transação.
4. A API responde `201 Created` com o número do pedido; o front-end mostra a confirmação.
:::

## Representação visual

::figure{id="duas-tres-camadas-fisicas"}

Conte os níveis de implantação dentro de cada quadro. No exemplo de duas camadas físicas, apresentação e negócio compartilham o cliente. Em três camadas, a lógica de negócio está num servidor próprio. No ENADE, diferencie a divisão lógica do local onde cada parte roda.

::figure{id="requisicao-camadas"}

Leia a requisição de cima para baixo. A API valida o pedido e solicita a gravação. O retorno à apresentação só ocorre depois da confirmação. No ENADE, associe validação e armazenamento às responsabilidades das camadas.

## Vantagens e desvantagens

| Arquitetura | Vantagens | Desvantagens |
|---|---|---|
| Centralizada | controle e segurança centralizados | ponto único de falha; interface pobre; escala cara |
| Duas camadas | simples; interface rica | regras espalhadas nos clientes; banco exposto; difícil atualizar |
| Três camadas | flexível, escalável, regras centralizadas, mais segura | mais complexa; mais componentes para operar |

## Diferenças entre conceitos semelhantes

- **Cliente-servidor × três camadas:** três camadas é uma **evolução** do cliente-servidor que separa as regras em um servidor intermediário.
- **Front-end × camada de apresentação:** praticamente sinônimos no contexto web.
- **API × back-end:** a API é a **interface** exposta; o back-end é **toda** a implementação por trás dela.
- **Três camadas × MVC:** camadas organizam **o sistema inteiro**; MVC organiza a **interação com o usuário** (veja [MVC, MVP e MVVM](lib:mvc-mvp-mvvm)).

## Como cai no ENADE

:::enade
Texto narrando a evolução (mainframes → cliente-servidor → três camadas) com afirmações sobre complexidade, flexibilidade e acoplamento (2014), e arranjos distribuídos perguntando a característica essencial (**transparência**, 2014).
:::

## Pegadinhas

:::trap Camadas reduzem acoplamento
Afirmar que a separação em camadas **aumentou** o acoplamento é falso — o objetivo é o contrário.
:::

:::trap Mais flexível também pode ser mais complexo
As duas afirmações podem ser verdadeiras ao mesmo tempo: três camadas são **mais flexíveis** e **mais complexas**.
:::

## Questões comentadas

::question 2014-objective-18 Evolução até as três camadas

**I** correta: mais camadas tornam o sistema mais complexo e exigem pessoal especializado. **II** correta: as partes podem ser alteradas de forma independente. **III** errada: a separação **reduz** o acoplamento. Resposta: **I e II** (alternativa C).

::question 2014-objective-15 Aplicações e bases distribuídas

Para o usuário não perceber a distribuição, a característica fundamental é a **transparência** entre as entidades do sistema (alternativa A).

## Resumo para memorizar

:::summary
- **Centralizada**: mainframe + terminais burros, tudo em um programa.
- **Cliente-servidor (2 camadas)**: cliente com interface e regras; servidor com dados.
- **3 camadas**: **apresentação ↔ negócio ↔ dados**; apresentação não acessa o banco.
- Front-end (usuário) ↔ **API** (contrato, REST/HTTP/JSON) ↔ back-end ↔ banco.
- Distribuídos: **transparência** esconde a distribuição.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Em uma arquitetura de três camadas, onde devem ficar as regras de negócio?",
    "options": ["No navegador", "Na camada de negócio (servidor de aplicação)", "No banco de dados apenas", "No terminal burro"],
    "answer": 1,
    "explanation": "A camada intermediária centraliza regras, validações e orquestração."
  },
  {
    "question": "Qual é uma desvantagem clássica da arquitetura em duas camadas com cliente 'gordo'?",
    "options": ["Interface pobre", "Atualizar regras exige atualizar todos os clientes", "Impossível usar banco relacional", "Não há rede"],
    "answer": 1,
    "explanation": "Com regras no cliente, cada mudança precisa ser distribuída a todas as estações."
  },
  {
    "question": "'Layer' e 'tier' diferem porque:",
    "options": ["São sinônimos exatos", "Layer é separação lógica; tier é separação física em máquinas", "Tier é só para bancos", "Layer só existe em mainframes"],
    "answer": 1,
    "explanation": "Camadas lógicas podem rodar em um mesmo servidor; tiers são nós físicos distintos."
  }
]
:::

## Referências

- SOMMERVILLE, I. *Engenharia de software*. 10. ed. São Paulo: Pearson Education do Brasil, 2018.
- TANENBAUM, A. S.; VAN STEEN, M. *Sistemas Distribuídos: princípios e paradigmas*. 2. ed. Pearson, 2007 — cap. 1 (transparência).
- FOWLER, M. *Padrões de Arquitetura de Aplicações Corporativas*. Bookman, 2006.
- ISO/IEC/IEEE 42010:2022 — *Architecture description*.
- INEP. ENADE TADS 2014, questões 15 e 18.
- FOWLER, M. *Patterns of enterprise application architecture*. Boston: Addison-Wesley, 2002.
- OBJECT MANAGEMENT GROUP. *Unified Modeling Language (UML)*. Versão 2.5.1. [S. l.]: OMG, 2017. Disponível em: https://www.omg.org/spec/UML/2.5.1. Acesso em: 25 nov. 2026.

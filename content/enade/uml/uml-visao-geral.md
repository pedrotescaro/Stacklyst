---
title: UML 2.5 — visão geral dos 14 diagramas
summary: O que é a UML (e por que ela não é uma metodologia), a divisão entre diagramas estruturais e comportamentais, os diagramas de interação e um mapa para escolher o diagrama certo.
order: 1
level: básico
version: 3
updated: 2026-11-25
tags: [uml, unified modeling language, omg, diagramas estruturais, diagramas comportamentais, diagramas de interação, 14 diagramas, uml 2.5, visão 4+1]
related: [uml-classes-e-objetos, uml-casos-de-uso, uml-interacao, uml-atividades-e-estados, uml-diagramas-estruturais, rup-visao-geral]
---

## O que é

A **UML — Unified Modeling Language** é uma **linguagem visual padronizada** para **especificar, visualizar, construir e documentar** sistemas de software. Foi criada nos anos 1990 pela unificação dos métodos de **Grady Booch**, **James Rumbaugh** (OMT) e **Ivar Jacobson** (OOSE) e é mantida pela **OMG** (*Object Management Group*); a versão atual é a **2.5.1**.

:::definition UML é linguagem, não metodologia
A UML define **notação** (símbolos) e **semântica** (significado). Ela **não diz** em que ordem fazer as coisas, quem faz ou quando — isso é papel de um **processo/metodologia**, como o RUP. Você pode usar UML com cascata, RUP ou métodos ágeis.
:::

## Para que serve

- **Comunicar** ideias entre pessoas (clientes, analistas, desenvolvedores) com uma notação comum;
- **Visualizar** estrutura e comportamento antes de programar;
- **Especificar** decisões de projeto com precisão;
- **Documentar** o sistema para manutenção;
- Em ferramentas, **gerar código** a partir de modelos ou modelos a partir de código.

## Como funciona

A UML 2.5 tem **14 diagramas** divididos em duas famílias.

### Diagramas estruturais (estáticos) — 7

Mostram **o que existe** no sistema e como as partes se relacionam, independentemente do tempo.

| Diagrama | Mostra | Página |
|---|---|---|
| **Classes** | classes, atributos, operações e relacionamentos | [Classes e objetos](lib:uml-classes-e-objetos) |
| **Objetos** | instâncias e seus vínculos em um instante | [Classes e objetos](lib:uml-classes-e-objetos) |
| **Componentes** | componentes de software e suas interfaces | [Estruturais](lib:uml-diagramas-estruturais) |
| **Implantação** | nós físicos (hardware/ambientes) e artefatos | [Estruturais](lib:uml-diagramas-estruturais) |
| **Pacotes** | agrupamentos de elementos e dependências | [Estruturais](lib:uml-diagramas-estruturais) |
| **Estrutura composta** | estrutura interna de uma classe: partes, portas, conectores | [Estruturais](lib:uml-diagramas-estruturais) |
| **Perfil** | extensões da UML: estereótipos, valores marcados | [Estruturais](lib:uml-diagramas-estruturais) |

### Diagramas comportamentais (dinâmicos) — 7

Mostram **o que acontece** ao longo do tempo.

| Diagrama | Mostra | Página |
|---|---|---|
| **Casos de uso** | funcionalidades do ponto de vista dos atores | [Casos de uso](lib:uml-casos-de-uso) |
| **Atividades** | fluxo de ações, decisões e paralelismo | [Atividades e estados](lib:uml-atividades-e-estados) |
| **Máquina de estados** | estados de um objeto e transições por eventos | [Atividades e estados](lib:uml-atividades-e-estados) |
| **Sequência** ★ | mensagens entre objetos **ordenadas no tempo** | [Interação](lib:uml-interacao) |
| **Comunicação** ★ | mensagens organizadas pelos **vínculos** entre objetos | [Interação](lib:uml-interacao) |
| **Tempo (timing)** ★ | mudanças de estado ao longo de um **eixo de tempo** | [Interação](lib:uml-interacao) |
| **Visão geral de interação** ★ | fluxo de atividades cujos nós são **interações** | [Interação](lib:uml-interacao) |

★ Os quatro marcados formam o subgrupo dos **diagramas de interação**, que é um tipo de diagrama comportamental.

## Características principais

- **Padronizada** (OMG, ISO/IEC 19501 para versões anteriores).
- **Independente de processo** e de linguagem de programação.
- **Extensível** por perfis e estereótipos (`«interface»`, `«entity»`).
- Diagramas são **visões** de um mesmo modelo: a mesma classe aparece em vários diagramas.
- Pode ser usada como **esboço**, como **planta** detalhada ou como **linguagem de programação** (MDA).

## Exemplos práticos

:::example Um sistema de biblioteca em vários diagramas
- **Casos de uso:** Leitor realiza empréstimo, renova, paga multa.
- **Classes:** Leitor, Livro, Exemplar, Empréstimo.
- **Sequência:** como o sistema registra um empréstimo (tela → controlador → repositório).
- **Máquina de estados:** Exemplar: *Disponível → Emprestado → Atrasado → Disponível*.
- **Atividades:** o processo de devolução com cálculo de multa.
- **Implantação:** navegador, servidor de aplicação e servidor de banco.
:::

## Representação visual

::figure{id="familias-uml"}

Comece pelas famílias estrutural e comportamental. Dentro da comportamental, siga o ramo dos diagramas de interação. No ENADE, procure o diagrama pela informação pedida. Se o enunciado pede a ordem das mensagens, escolha sequência. Se pede relações entre tipos, escolha classes.

## Vantagens e desvantagens

| Vantagens | Desvantagens |
|---|---|
| vocabulário comum entre equipes | pode virar documentação excessiva |
| ajuda a pensar antes de codificar | modelos desatualizam se não forem mantidos |
| padrão aceito pelo mercado e por ferramentas | 14 diagramas e muitos símbolos assustam iniciantes |

## Diferenças entre conceitos semelhantes

- **Estrutural × comportamental:** estrutural responde "**o que existe?**"; comportamental responde "**o que acontece?**".
- **Sequência × comunicação:** mesma informação (mensagens), ênfases diferentes: **tempo** (vertical) × **vínculos** entre objetos (numeração).
- **Atividades × máquina de estados:** atividades descrevem um **fluxo de trabalho/processo**; estados descrevem o **ciclo de vida de um objeto** reagindo a eventos.
- **Classes × objetos:** classe é o **molde**; objeto é a **instância** com valores em um instante.
- **Componentes × implantação:** componentes = organização **lógica** do software; implantação = distribuição **física** em nós.

## Como cai no ENADE

:::enade
Afirmações conceituais (2011: "UML é uma metodologia" — **falso**), identificação do tipo de diagrama a partir de uma figura (2008, 2014), e semântica de relacionamentos em casos de uso e classes.
:::

## Pegadinhas

:::trap UML não é metodologia nem processo
Ela fornece notação e semântica. Afirmativas que a chamam de metodologia estão erradas.
:::

:::trap Interação é subgrupo de comportamentais
Os diagramas de sequência, comunicação, tempo e visão geral de interação **são comportamentais**.
:::

:::trap Casos de uso é comportamental
Mesmo sendo "de alto nível" e sem fluxo de tempo explícito, ele descreve **comportamento externo** do sistema.
:::

## Questões comentadas

::question 2011-objective-12 Afirmações sobre a UML

**I** falsa: UML é **linguagem de modelagem**, não metodologia. **II** verdadeira: o diagrama de casos de uso mostra o comportamento externo sob a perspectiva do usuário e é o mais abstrato. **III** falsa: incorporar o comportamento de B **toda vez** que A executa é **«include»**, não «extend». **IV** verdadeira, no contexto da questão, para os diagramas de interação. Resposta: **II e IV** (alternativa B).

::question 2014-objective-29 Traduzir código Java em um diagrama de classes

As cinco figuras são diagramas de classes. Compare a **generalização** de Funcionario para Pessoa, o construtor correspondente à chamada de `super` e as duas assinaturas de `obterSalario`. A alternativa A preserva esses elementos. Um diagrama completo também exibiria o atributo privado `salario`.

## Resumo para memorizar

:::summary
- UML = **linguagem** visual padronizada (OMG), **não** metodologia.
- **14 diagramas**: 7 estruturais (classes, objetos, componentes, implantação, pacotes, estrutura composta, perfil) e 7 comportamentais (casos de uso, atividades, máquina de estados + 4 de interação).
- Interação: **sequência, comunicação, tempo, visão geral de interação**.
:::

:::mnemonic Estruturais
"**C**O**C**I**P**E**P**": **C**lasses, **O**bjetos, **C**omponentes, **I**mplantação, **P**acotes, **E**strutura composta, **P**erfil.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual destes é um diagrama estrutural da UML?",
    "options": ["Sequência", "Implantação", "Máquina de estados", "Atividades"],
    "answer": 1,
    "explanation": "Implantação é estrutural (nós físicos e artefatos). Os outros são comportamentais."
  },
  {
    "question": "Qual afirmação sobre a UML está correta?",
    "options": ["É uma metodologia de desenvolvimento ágil", "Define notação e semântica, podendo ser usada com diferentes processos", "Só funciona com Java", "Tem exatamente 9 diagramas na versão 2.5"],
    "answer": 1,
    "explanation": "A UML é independente de processo e de linguagem; a 2.5 tem 14 diagramas."
  },
  {
    "question": "Qual diagrama enfatiza a ordem temporal das mensagens entre objetos?",
    "options": ["Comunicação", "Sequência", "Objetos", "Pacotes"],
    "answer": 1,
    "explanation": "No diagrama de sequência o tempo corre de cima para baixo ao longo das linhas de vida."
  }
]
:::

## Referências

- OBJECT MANAGEMENT GROUP. *Unified Modeling Language (UML)*. Versão 2.5.1. [S. l.]: OMG, 2017. Disponível em: https://www.omg.org/spec/UML/2.5.1. Acesso em: 25 nov. 2026.
- BOOCH, G.; RUMBAUGH, J.; JACOBSON, I. *UML: guia do usuário*. 2. ed. Rio de Janeiro: Elsevier, 2006.
- FOWLER, M. *UML Essencial*. 3. ed. Bookman, 2005.
- GUEDES, G. T. A. *UML 2: uma abordagem prática*. 3. ed. Novatec, 2018.
- INEP. ENADE TADS 2011 (questão 12) e 2014 (questão 29).

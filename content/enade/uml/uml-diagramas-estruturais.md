---
title: Diagramas de componentes, implantação, pacotes, estrutura composta e perfil
summary: Os diagramas estruturais além do de classes — componentes e interfaces fornecidas/requeridas, nós e artefatos na implantação, pacotes e dependências, estrutura interna com partes e portas, e perfis com estereótipos.
order: 6
level: intermediário
version: 1
updated: 2026-11-24
tags: [diagrama de componentes, interface fornecida, interface requerida, pirulito, soquete, diagrama de implantação, nó, artefato, device, execution environment, diagrama de pacotes, import, diagrama de estrutura composta, parte, porta, conector, diagrama de perfil, estereótipo, metaclasse, valor marcado]
related: [uml-visao-geral, evolucao-arquiteturas-e-camadas, estilos-arquiteturais, uml-classes-e-objetos]
---

## O que é

Além de classes e objetos, a UML tem cinco diagramas **estruturais** voltados a níveis diferentes do sistema:

- **Componentes** — partes **modulares e substituíveis** do software e suas **interfaces**;
- **Implantação** — a **arquitetura física**: nós de hardware/ambientes e os **artefatos** instalados neles;
- **Pacotes** — **organização** de elementos em grupos e as dependências entre eles;
- **Estrutura composta** — a **estrutura interna** de uma classe ou componente (partes, portas, conectores);
- **Perfil** — **extensões** da própria UML para um domínio (estereótipos, valores marcados, restrições).

## Para que serve

Eles documentam a **arquitetura**: como o sistema se divide em módulos, onde cada coisa roda, como os pacotes dependem uns dos outros e como a linguagem é adaptada a um contexto (por exemplo, perfis para Java EE ou para sistemas embarcados).

## Como funciona

### Diagrama de componentes

- **Componente:** retângulo com «component» (ou o ícone com dois "dentinhos").
- **Interface fornecida** (*provided*): "**pirulito**" (círculo) — serviço que o componente oferece.
- **Interface requerida** (*required*): "**soquete**" (meia-lua) — serviço de que ele precisa.
- **Montagem (assembly):** o pirulito de um encaixado no soquete do outro.
- **Portas** e dependências também aparecem.

::widget uml diagram=component

### Diagrama de implantação

- **Nó:** caixa **3D**. Pode ser «device» (hardware: servidor, celular) ou «executionEnvironment» (JVM, contêiner, SGBD).
- **Artefato:** «artifact» — arquivo físico implantado (`.jar`, `.war`, script SQL, executável).
- **Caminho de comunicação:** linha entre nós, com o protocolo (`«HTTPS»`, `«TCP/IP»`).

::widget uml diagram=deployment

### Diagrama de pacotes

- **Pacote:** pasta com **aba**; agrupa classes, casos de uso, outros pacotes.
- **Dependência** tracejada com «import» (importa elementos públicos) ou «access».
- Boa prática: dependências **sem ciclos** e das camadas de cima para as de baixo.

::widget uml diagram=package

### Diagrama de estrutura composta

Mostra **dentro** de uma classe: as **partes** (instâncias que a compõem, com multiplicidade), as **portas** (pontos de interação, quadradinhos na borda) e os **conectores** entre partes. Também representa **colaborações** (padrões de projeto como uma elipse tracejada).

::widget uml diagram=composite

### Diagrama de perfil

Permite **estender** a UML: um **estereótipo** («Entidade», «Controle») **estende** uma **metaclasse** da UML («metaclass» Class) por uma seta com **triângulo cheio**. Estereótipos podem ter **valores marcados** (tagged values, como `tabela: String`) e restrições.

::widget uml diagram=profile

## Características principais

| Diagrama | Nível | Pergunta respondida |
|---|---|---|
| Componentes | lógico, modular | quais módulos existem e que serviços trocam? |
| Implantação | físico | onde cada parte roda e como os nós se comunicam? |
| Pacotes | organizacional | como o modelo/código está agrupado e quem depende de quem? |
| Estrutura composta | interno | do que uma classe é feita por dentro? |
| Perfil | meta (linguagem) | como adaptar a UML ao meu domínio? |

## Exemplos práticos

:::example Uma loja virtual em três visões
- **Componentes:** `LojaWeb` requer `IPagamento`, fornecido por `ServicoPagamento`; `LojaWeb` também requer `ICatalogo`.
- **Implantação:** navegador (device) ↔ «HTTPS» ↔ servidor de aplicação (executionEnvironment: JVM, artefato `loja.jar`) ↔ «TCP/IP» ↔ servidor PostgreSQL.
- **Pacotes:** `apresentacao` → `negocio` → `dados`, sem dependência de volta.
:::

## Representação visual

Os cinco diagramas acima estão desenhados em notação UML 2.5 nesta página.

## Vantagens e desvantagens

| Vantagens | Desvantagens |
|---|---|
| documentam decisões arquiteturais | pouco usados no dia a dia de equipes pequenas |
| ajudam a planejar implantação e infraestrutura | desatualizam quando a infraestrutura muda (nuvem, contêineres) |
| pacotes revelam ciclos de dependência | perfis exigem ferramentas de modelagem |

## Diferenças entre conceitos semelhantes

- **Componente × classe:** componente é uma unidade **substituível de implantação/organização** que encapsula várias classes e expõe interfaces.
- **Componente × artefato:** componente é **lógico**; artefato é o **arquivo físico** que o materializa e é implantado em um nó.
- **Pacote × componente:** pacote é só **agrupamento** (namespace); componente é unidade com **interfaces** e comportamento.
- **Estrutura composta × composição:** o diagrama mostra a estrutura **interna** (partes e portas); composição é um **tipo de associação** no diagrama de classes.
- **Interface fornecida × requerida:** pirulito = **oferece**; soquete = **precisa**.

## Como cai no ENADE

:::enade
Reconhecimento de símbolos (nó 3D, pirulito/soquete, pasta com aba) em alternativas com imagens e a associação "diagrama → finalidade" (implantação = arquitetura física; componentes = organização modular).
:::

## Pegadinhas

:::trap Implantação não é "diagrama de componentes físico"
Implantação mostra **nós** (hardware/ambientes) e **artefatos**; componentes mostram **módulos lógicos**.
:::

:::trap Diagrama de perfil não é "perfil do usuário"
Ele estende a **linguagem UML** com estereótipos, nada tem a ver com usuários.
:::

## Questões comentadas

::question 2014-objective-29 Representar herança e operações

Na engenharia reversa, `Funcionario extends Pessoa` aparece como uma linha com triângulo vazio apontando para Pessoa. As duas operações `obterSalario` têm listas de parâmetros distintas e devem aparecer separadamente. A alternativa A é a que preserva esses elementos e o construtor da superclasse.

## Resumo para memorizar

:::summary
- **Componentes**: módulos + interfaces (pirulito = fornece, soquete = requer).
- **Implantação**: **nós 3D** («device», «executionEnvironment») + **artefatos** + caminhos de comunicação.
- **Pacotes**: pastas com aba + dependências «import».
- **Estrutura composta**: partes, **portas**, conectores dentro de uma classe.
- **Perfil**: **estereótipo** estende **metaclasse** (seta com triângulo cheio).
:::

## Miniquestionário

:::quiz
[
  {
    "question": "No diagrama de componentes, o símbolo de 'pirulito' (círculo na ponta de uma linha) representa:",
    "options": ["Interface requerida", "Interface fornecida", "Um nó físico", "Um pacote"],
    "answer": 1,
    "explanation": "Pirulito = interface fornecida; soquete (meia-lua) = interface requerida."
  },
  {
    "question": "Um arquivo 'api.jar' instalado em um servidor aparece em qual diagrama, e como?",
    "options": ["Classes, como classe abstrata", "Implantação, como artefato dentro de um nó", "Casos de uso, como ator", "Pacotes, como pasta"],
    "answer": 1,
    "explanation": "Artefatos físicos são implantados em nós no diagrama de implantação."
  },
  {
    "question": "Para que serve o diagrama de perfil?",
    "options": ["Mostrar dados do usuário", "Estender a UML com estereótipos e valores marcados para um domínio", "Medir desempenho", "Mostrar estados de um objeto"],
    "answer": 1,
    "explanation": "Perfis adaptam a própria linguagem UML a um contexto."
  }
]
:::

## Referências

- OMG. *UML 2.5.1 Specification*, 2017 — cláusulas 11 (estruturas compostas), 12 (pacotes e perfis) e 19 (implantação).
- FOWLER, M. *UML Essencial*. 3. ed. Bookman, 2005 — caps. 7, 8, 13 e 14.
- BOOCH, G.; RUMBAUGH, J.; JACOBSON, I. *UML: Guia do Usuário*. 2. ed. Elsevier, 2006 — caps. 25 a 27.

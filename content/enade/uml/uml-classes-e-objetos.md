---
title: Diagrama de classes e diagrama de objetos
summary: Classes, atributos, operações, visibilidades (+ - # ~), multiplicidades e os relacionamentos — associação, agregação, composição, generalização, realização e dependência — com o diagrama de objetos.
order: 2
level: intermediário
version: 4
updated: 2026-11-25
tags: [diagrama de classes, diagrama de objetos, classe, atributo, operação, método, visibilidade, público, privado, protegido, pacote, multiplicidade, associação, agregação, composição, generalização, herança, realização, interface, dependência, classe abstrata, classe associativa]
related: [poo-fundamentos, relacionamentos-coesao-acoplamento, heranca-e-polimorfismo, modelagem-de-dados, uml-visao-geral]
---

## O que é

O **diagrama de classes** é o principal diagrama **estrutural** da UML: mostra as **classes** do sistema, seus **atributos**, **operações** e os **relacionamentos** entre elas. O **diagrama de objetos** mostra **instâncias** dessas classes, com valores concretos, em um **instante** específico — uma "fotografia" do sistema em execução.

## Para que serve

- Modelar o **domínio** do problema (classes conceituais, na análise);
- Projetar a **estrutura do código** (classes de design, com tipos e visibilidades);
- Expressar **regras de negócio** por meio de multiplicidades e restrições;
- Servir de base para o **modelo de banco de dados** e para geração de código.

## Como funciona

### A classe

Retângulo com três compartimentos: **nome**, **atributos** e **operações**.

```text
┌──────────────────────────────┐
│          ContaBancaria       │  ← nome (itálico se abstrata)
├──────────────────────────────┤
│ - numero: String             │  ← atributos: visibilidade nome: tipo
│ - saldo: double = 0          │
│ # titular: Cliente           │
├──────────────────────────────┤
│ + depositar(valor: double)   │  ← operações: visibilidade nome(parâmetros): retorno
│ + sacar(valor: double): bool │
│ ~ auditar(): void            │
└──────────────────────────────┘
```

### Visibilidade

| Símbolo | Visibilidade | Quem acessa |
|---|---|---|
| **+** | pública | qualquer classe |
| **−** | privada | só a própria classe |
| **#** | protegida | a classe e suas **subclasses** |
| **~** | de pacote | classes do **mesmo pacote** |

Membros **estáticos** (de classe) são **sublinhados**. Classes e operações **abstratas** aparecem em *itálico* ou com `{abstract}`. Interfaces usam o estereótipo **«interface»**.

### Multiplicidade

Indica **quantas instâncias** de uma classe se relacionam com uma instância da outra:

| Notação | Significado |
|---|---|
| `1` | exatamente um |
| `0..1` | zero ou um (opcional) |
| `*` ou `0..*` | zero ou mais |
| `1..*` | um ou mais |
| `2..5` | de dois a cinco |

Leitura: em `Cliente 1 ──── 0..* Pedido`, **um cliente** tem **zero ou mais pedidos**, e **cada pedido** pertence a **exatamente um cliente** (a multiplicidade fica **do lado oposto** de quem "possui").

### Relacionamentos

::widget uml diagram=relationships

Fonte: adaptado de OMG (2017, seções 7, 9, 10 e 11) e BOOCH; RUMBAUGH; JACOBSON (2006, caps. 5 e 10) — recriado pela equipe Stacklyst.

Compare a ponta e o traço de cada conector antes de ler os nomes. O ENADE pode pedir a interpretação simultânea da multiplicidade e do losango.

- **Associação** — vínculo estrutural entre classes (linha). Pode ter **nome**, **papéis** nas pontas e **navegabilidade** (seta indica quem conhece quem).
- **Agregação** (losango **vazado** no lado do **todo**) — relação todo-parte **fraca**: a parte **pode existir sem o todo** e ser compartilhada (Time ◇── Jogador).
- **Composição** (losango **cheio** no todo) — todo-parte **forte**: a parte **não existe sem o todo**, pertence a um só todo e é destruída com ele (Pedido ◆── ItemPedido).
- **Generalização** (seta com **triângulo vazado** apontando para a superclasse) — herança: "é um tipo de" (Aluno → Pessoa).
- **Realização** (tracejada com **triângulo vazado**) — uma classe **implementa** uma interface.
- **Dependência** (tracejada com seta aberta) — uma classe **usa** outra temporariamente (parâmetro, variável local); mudanças na outra podem afetá-la.
- **Classe associativa** — uma associação com atributos próprios (Matrícula entre Aluno e Disciplina, com nota e data).

### Diagrama de objetos

Cada objeto aparece como `nomeDoObjeto : Classe` **sublinhado**, com os atributos e **valores** daquele momento; as linhas são **vínculos** (instâncias de associações).

::widget uml diagram=object

Fonte: adaptado de OMG (2017, seção 9) e BOOCH; RUMBAUGH; JACOBSON (2006, caps. 13 e 14) — recriado pela equipe Stacklyst.

Cada cabeçalho sublinhado identifica uma instância. No ENADE, confira se os vínculos concretos respeitam as associações e multiplicidades declaradas pelas classes.

## Características principais

- **Estático**: não mostra ordem de execução.
- Níveis de detalhe: **conceitual** (domínio), **especificação** (interfaces) e **implementação** (código).
- Relacionamentos de associação viram, em código, **atributos de referência**; a **composição** costuma implicar que o todo **cria e destrói** as partes.

## Exemplos práticos

:::example Do diagrama para Java
```java
public class Pedido {                       // composição com ItemPedido
  private final List<ItemPedido> itens = new ArrayList<>();
  private Cliente cliente;                  // associação 1 com Cliente

  public void adicionarItem(Produto p, int qtd) {
    itens.add(new ItemPedido(p, qtd));      // o todo cria a parte
  }
}

public abstract class Pessoa { protected String nome; }   // classe abstrata
public class Aluno extends Pessoa { private String matricula; }  // generalização

public interface Pagavel { void pagar(double valor); }
public class PixPagamento implements Pagavel {             // realização
  public void pagar(double valor) { /* ... */ }
}
```
:::

## Representação visual

::figure{id="classes-vendas-pagamentos"}

Leia as multiplicidades nas pontas de cada associação. No Mentcare, um paciente frequenta uma ou mais consultas, e a consulta pertence ao paciente. Para distinguir agregação, composição, dependência e realização, use a comparação de notações na seção Como funciona.

## Vantagens e desvantagens

| Vantagens | Desvantagens |
|---|---|
| visão clara da estrutura e das regras | não mostra comportamento dinâmico |
| base para código e banco de dados | diagramas grandes ficam ilegíveis — divida por pacotes |
| multiplicidades documentam regras de negócio | exige atualização junto com o código |

## Diferenças entre conceitos semelhantes

| | Agregação | Composição |
|---|---|---|
| Símbolo | losango **vazado** | losango **cheio** |
| A parte existe sem o todo? | **sim** | **não** |
| Parte compartilhada? | pode | não (um só todo) |
| Exemplo | Departamento ◇ Professor | Casa ◆ Cômodo |

- **Generalização × realização:** generalização herda **estrutura e comportamento** de uma classe; realização **cumpre um contrato** de interface (linha **tracejada**).
- **Associação × dependência:** associação é vínculo **duradouro** (atributo); dependência é **uso temporário**.
- **Classe × objeto:** molde × instância; no diagrama de objetos o nome é **sublinhado**.

## Como cai no ENADE

:::enade
Interpretar um diagrama de classes: o que a **composição** implica, se uma classe é **abstrata** (precisa estar indicada), leitura de **multiplicidades** e o que a associação implica na implementação. Discursivas pedem desenhar classes com visibilidades e assinaturas completas.
:::

## Pegadinhas

:::trap Losango fica do lado do TODO
Em `Pedido ◆── ItemPedido`, o losango está junto de **Pedido** (o todo).
:::

:::trap Classe só é abstrata se o diagrama disser
Nome em itálico, `{abstract}` ou `«abstract»`. Sem isso, não conclua que é abstrata.
:::

:::trap Associação não fixa a implementação
Uma associação indica vínculo, mas não obriga um "atributo simples" específico em uma direção — isso depende da **navegabilidade** e das decisões de design.
:::

## Questões comentadas

::question 2011-discursive-3 Jogo de dados em UML

O enunciado pede **um diagrama de domínio e três requisitos funcionais**. Represente JogoDados e os dados usados na partida, com o valor da face em Dado. Iniciar a partida, lançar os dados e verificar o resultado são exemplos de funções que podem ser listadas.

::question 2017-objective-16 Transferência de materiais entre funcionários

Só **II** é garantida: a **composição** indica que a RequisicaoTransferencia **depende** do Material para existir. **I** é falsa (nada indica Funcionario abstrata); **III** e **IV** afirmam detalhes de implementação que a associação, sozinha, não determina. Alternativa A.

::question 2008-objective-19 Refeições, nutrientes e multiplicidades

Cenário em que regras ("dois tipos de carboidrato no café da manhã", "um tipo de lipídio no almoço") devem virar **multiplicidades** no diagrama de classes. Leia cada regra como "uma instância de X se relaciona com N instâncias de Y".

## Resumo para memorizar

:::summary
- Visibilidade: **+ público, − privado, # protegido, ~ pacote**. Estático = sublinhado; abstrato = itálico.
- Multiplicidade: `1`, `0..1`, `*`, `1..*`, `m..n` — lida do lado oposto.
- **Agregação** ◇ (parte independente) × **Composição** ◆ (parte morre com o todo).
- **Generalização** (triângulo vazado, linha cheia) × **Realização** (triângulo vazado, tracejada) × **Dependência** (tracejada, seta aberta).
- Diagrama de objetos: `obj : Classe` sublinhado, valores concretos, vínculos.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual símbolo de visibilidade indica que o membro é acessível pela classe e por suas subclasses?",
    "options": ["+", "−", "#", "~"],
    "answer": 2,
    "explanation": "# é protegido. ~ é visibilidade de pacote."
  },
  {
    "question": "Em 'Universidade ◆── Departamento', o que acontece com os departamentos se a universidade for excluída?",
    "options": ["Continuam existindo", "São excluídos junto", "Passam para outra universidade automaticamente", "Viram abstratos"],
    "answer": 1,
    "explanation": "Composição: as partes não existem sem o todo."
  },
  {
    "question": "Como se lê 'Professor 1 ──── 0..* Turma'?",
    "options": ["Cada turma tem vários professores", "Um professor tem zero ou mais turmas, e cada turma tem exatamente um professor", "Todo professor tem exatamente uma turma", "Não há relação"],
    "answer": 1,
    "explanation": "A multiplicidade ao lado de Turma (0..*) diz quantas turmas um professor tem; a do lado do Professor (1) diz quantos professores cada turma tem."
  },
  {
    "question": "Linha tracejada com triângulo vazado apontando para «interface» Pagavel representa:",
    "options": ["Generalização", "Dependência", "Realização", "Composição"],
    "answer": 2,
    "explanation": "Realização: a classe implementa o contrato da interface."
  }
]
:::

## Referências

- OBJECT MANAGEMENT GROUP. *Unified Modeling Language (UML)*. Versão 2.5.1. [S. l.]: OMG, 2017. Disponível em: https://www.omg.org/spec/UML/2.5.1. Acesso em: 25 nov. 2026.
- BOOCH, G.; RUMBAUGH, J.; JACOBSON, I. *UML: guia do usuário*. 2. ed. Rio de Janeiro: Elsevier, 2006.
- LARMAN, C. *Utilizando UML e Padrões*. 3. ed. Bookman, 2007.
- GUEDES, G. T. A. *UML 2: uma abordagem prática*. 3. ed. Novatec, 2018.
- INEP. ENADE TADS 2008 (questão 19) e 2017 (questão 16).
- SOMMERVILLE, Ian. *Engenharia de software*. 10. ed. São Paulo: Pearson, 2018.

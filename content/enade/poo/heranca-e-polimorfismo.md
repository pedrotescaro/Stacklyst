---
title: Herança, polimorfismo, interfaces, classes abstratas, sobrecarga e sobrescrita
summary: Como herança e polimorfismo funcionam de verdade (inclusive em tempo de execução), a diferença entre classe abstrata e interface e entre sobrecarga e sobrescrita, com código em Java, TypeScript e Python.
order: 2
level: intermediário
version: 3
updated: 2026-11-25
tags: [herança, extends, superclasse, subclasse, herança múltipla, polimorfismo, ligação dinâmica, classe abstrata, método abstrato, interface, implements, sobrecarga, overloading, sobrescrita, overriding, super]
related: [poo-fundamentos, relacionamentos-coesao-acoplamento, principios-solid, padroes-de-projeto, uml-classes-e-objetos]
---

## O que é

- **Herança**: mecanismo pelo qual uma **subclasse** (classe filha) **reaproveita** atributos e métodos de uma **superclasse** (classe pai) e pode **acrescentar** ou **modificar** comportamentos. Relação "**é um**": `Aluno` é uma `Pessoa`.
- **Polimorfismo** ("muitas formas"): a capacidade de tratar objetos de classes diferentes **pelo mesmo tipo** (superclasse ou interface), de modo que **a mesma mensagem** produza comportamentos diferentes conforme o **objeto real**.

## Para que serve

- **Reuso**: programar só as diferenças.
- **Extensibilidade**: adicionar novos tipos sem alterar quem os usa (Princípio Aberto/Fechado).
- **Eliminar condicionais**: trocar `switch (tipo)` por chamadas polimórficas.

## Como funciona

### Herança

```java
public class Pessoa {
    protected String nome;
    public Pessoa(String nome) { this.nome = nome; }
    public String apresentar() { return "Olá, sou " + nome; }
}

public class Aluno extends Pessoa {          // herança por extensão
    private String matricula;                // membro próprio
    public Aluno(String nome, String matricula) {
        super(nome);                         // chama o construtor do pai
        this.matricula = matricula;
    }
    @Override
    public String apresentar() {             // sobrescrita
        return super.apresentar() + ", matrícula " + matricula;
    }
}
```

- A subclasse **herda** o que é público/protegido e **pode ter membros próprios**.
- **Herança simples**: uma superclasse direta (Java, C#). **Herança múltipla**: uma classe herdando de **várias** superclasses (C++, Python). Java permite **implementar várias interfaces**.

### Polimorfismo

```java
public abstract class Impressora {
    public abstract void imprimir();
}
class Laser extends Impressora { public void imprimir() { System.out.println("Laser"); } }
class JatoDeTinta extends Impressora { public void imprimir() { System.out.println("Jato de tinta"); } }

Impressora[] fila = { new Laser(), new JatoDeTinta() };
for (Impressora i : fila) i.imprimir();   // cada objeto responde do seu jeito
```

A decisão de **qual** `imprimir()` executar acontece em **tempo de execução** (*ligação dinâmica* / *dynamic dispatch*), pelo **tipo do objeto**, não pelo tipo da variável. Uma variável do tipo `Impressora` pode referenciar uma `Laser` mesmo que `Impressora` seja **abstrata**.

Tipos de polimorfismo: **de inclusão/subtipo** (o acima), **paramétrico** (genéricos: `List<T>`) e **ad hoc** (sobrecarga).

### Classes abstratas

- Declaradas com `abstract`; **não podem ser instanciadas** (`new Impressora()` não compila).
- Podem ter **atributos**, **construtores**, métodos **concretos** e métodos **abstratos** (sem corpo), que as subclasses concretas **devem** implementar.
- Servem para representar um **conceito genérico** que compartilha código.

### Interfaces

- Definem um **contrato**: o que uma classe **deve fazer**, sem dizer como.
- Em Java: métodos abstratos (e, desde o Java 8, `default` e `static`), constantes; **sem estado de instância**.
- Uma classe pode **implementar várias** interfaces (`implements A, B`).

```typescript
interface Pagavel {
  pagar(valor: number): void;
}
abstract class Pagamento implements Pagavel {
  constructor(protected readonly id: string) {}
  abstract pagar(valor: number): void;
  log(msg: string) { console.log(`[${this.id}] ${msg}`); }
}
class Pix extends Pagamento {
  pagar(valor: number) { this.log(`Pix de R$ ${valor}`); }
}
```

```python
from abc import ABC, abstractmethod

class Forma(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Quadrado(Forma):
    def __init__(self, lado: float): self.lado = lado
    def area(self) -> float: return self.lado ** 2

class Circulo(Forma):
    def __init__(self, r: float): self.r = r
    def area(self) -> float: return 3.14159 * self.r ** 2

print(sum(f.area() for f in [Quadrado(2), Circulo(1)]))  # polimorfismo
```

### Sobrecarga × sobrescrita

| | **Sobrecarga (overloading)** | **Sobrescrita (overriding)** |
|---|---|---|
| Onde | **mesma classe** (ou herdada) | **subclasse** redefine método da superclasse |
| Assinatura | mesmo nome, **parâmetros diferentes** | **mesma assinatura** |
| Decidida em | **tempo de compilação** | **tempo de execução** |
| Exemplo | `somar(int,int)` e `somar(double,double)` | `Aluno.apresentar()` substitui `Pessoa.apresentar()` |
| Relação | polimorfismo ad hoc | polimorfismo de subtipo |

"**Sobreposição**" é sinônimo frequente de sobrescrita em provas.

## Características principais

- Herança cria **acoplamento forte** entre pai e filho: mudanças no pai afetam todos os filhos.
- A regra "**é um**" deve valer em todos os contextos (Princípio de Liskov).
- **Prefira composição a herança** quando a relação for "**tem um**".

## Exemplos práticos

:::example Trocando switch por polimorfismo
Antes: `if (tipo == "pix") ... else if (tipo == "boleto") ...` espalhado pelo código. Depois: cada forma de pagamento é uma classe que implementa `Pagavel`; o pedido chama `pagamento.pagar(valor)`. Novo meio de pagamento = nova classe, sem tocar no pedido.
:::

## Representação visual

::figure{id="generalizacao-impressora"}

O triângulo em linha contínua aponta para a classe abstrata. Em linha tracejada, ele aponta para a interface. No ENADE, identifique o contrato que o código enxerga e a implementação chamada conforme o tipo real do objeto.

## Vantagens e desvantagens

| | Vantagens | Desvantagens |
|---|---|---|
| Herança | reuso rápido, hierarquias naturais | acoplamento forte, hierarquias frágeis |
| Polimorfismo | código extensível, sem condicionais | fluxo menos óbvio para iniciantes |
| Interfaces | contratos desacoplados, múltipla implementação | não compartilham estado/código (salvo `default`) |

## Diferenças entre conceitos semelhantes

| | Classe abstrata | Interface |
|---|---|---|
| Instanciável? | não | não |
| Estado (atributos de instância)? | sim | não |
| Construtor? | sim | não |
| Métodos concretos? | sim | só `default`/`static` (Java 8+) |
| Quantas por classe? | **uma** (herança simples) | **várias** |
| Relação | "é um" com código comum | "sabe fazer" / contrato |

- **Herança múltipla × uma superclasse com várias subclasses:** herança múltipla é **um filho com vários pais**, não um pai com vários filhos.

## Como cai no ENADE

:::enade
Código Java com classe abstrata e laço sobre um vetor do tipo da superclasse (2017), afirmações sobre herança (2011), herança como reaproveitamento de componentes validados (2008) e sobrecarga × sobrescrita.
:::

## Pegadinhas

:::trap Vetor de tipo abstrato é válido
`Impressora[] imp = new Impressora[3];` cria um vetor de **referências**; não instancia a classe abstrata. Cada posição recebe um objeto concreto.
:::

:::trap Confira a ordem do laço
`for (int i = imp.length - 1; i >= 0; i--)` percorre de trás para frente — a saída sai **invertida**.
:::

:::trap Subclasse pode ter membros próprios
Afirmar que ela "não pode possuir propriedades e métodos próprios" é falso.
:::

## Questões comentadas

::question 2017-objective-30 Impressoras e polimorfismo

O vetor guarda referências do tipo `Impressora` apontando para `Laser`, `JatoDeTinta` e `Matricial` — válido mesmo com a classe base abstrata. Cada chamada `imprimir()` executa a versão do **objeto real** (polimorfismo). Como o laço vai de 2 até 0, a saída é **Matricial, Jato de tinta, Laser**, e não a ordem de criação.

::question 2011-objective-21 Afirmações sobre herança

**I** correta (herança facilita reuso). **II** errada (subclasses podem ter membros próprios). **III** errada (herança múltipla = classe com várias superclasses). **IV** correta (extensão é uma forma de herança). Resposta: **I e IV**.

::question 2008-objective-12 Pizzaria que estende componentes validados

Aproveitar partes do sistema antigo e **estender** componentes, acrescentando novas funções sobre código validado, descreve **herança** (alternativa B).

## Resumo para memorizar

:::summary
- **Herança** = "é um", reuso + extensão (`extends`, `super`).
- **Polimorfismo** = mesma mensagem, comportamentos diferentes, decidido **em execução** pelo objeto real.
- **Classe abstrata**: não instanciável, pode ter estado e código. **Interface**: contrato, várias por classe.
- **Sobrecarga** = mesmo nome, parâmetros diferentes (compilação). **Sobrescrita** = mesma assinatura na subclasse (execução).
:::

:::mnemonic
Sobre**c**arga = **c**ompilação, **c**ampos (parâmetros) diferentes. Sobre**s**crita = **s**ubclasse, **s**ubstitui.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Dois métodos 'calcular(int)' e 'calcular(double, double)' na mesma classe são exemplo de:",
    "options": ["Sobrescrita", "Sobrecarga", "Herança múltipla", "Encapsulamento"],
    "answer": 1,
    "explanation": "Mesmo nome com listas de parâmetros diferentes: sobrecarga."
  },
  {
    "question": "Sobre classes abstratas em Java, é correto afirmar:",
    "options": ["Podem ser instanciadas com new", "Não podem ter métodos concretos", "Não podem ser instanciadas, mas podem ter construtores e atributos", "Uma classe pode estender várias classes abstratas"],
    "answer": 2,
    "explanation": "Classes abstratas não geram instâncias diretas, mas podem ter estado, construtores e métodos concretos."
  },
  {
    "question": "Em 'Animal a = new Cachorro(); a.falar();', qual versão de falar() é executada, se Cachorro sobrescreve o método?",
    "options": ["A de Animal, porque a variável é Animal", "A de Cachorro, porque o objeto real é Cachorro", "Nenhuma, gera erro", "Ambas"],
    "answer": 1,
    "explanation": "Ligação dinâmica: vale o tipo do objeto, não o da variável."
  }
]
:::

## Referências

- DEITEL, P.; DEITEL, H. *Java: como programar*. 10. ed. Pearson, 2017 — caps. 9 e 10.
- GAMMA, E. et al. *Padrões de Projeto*. Bookman, 2000 — "programe para uma interface".
- BLOCH, J. *Java Efetivo*. 3. ed. Alta Books, 2019 — "prefira composição à herança".
- INEP. ENADE TADS 2008 (questão 12), 2011 (questão 21) e 2017 (questão 30).
- OBJECT MANAGEMENT GROUP. *Unified Modeling Language (UML)*. Versão 2.5.1. [S. l.]: OMG, 2017. Disponível em: https://www.omg.org/spec/UML/2.5.1. Acesso em: 25 nov. 2026.
- BOOCH, G.; RUMBAUGH, J.; JACOBSON, I. *UML: guia do usuário*. 2. ed. Rio de Janeiro: Elsevier, 2006.

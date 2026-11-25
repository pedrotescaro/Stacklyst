---
title: Histórias de usuário, critérios de aceitação e casos de uso
summary: Como escrever histórias de usuário (formato, INVEST), critérios de aceitação (Dado-Quando-Então) e especificações de casos de uso com fluxo principal, alternativos e de exceção, pré e pós-condições.
order: 4
level: básico
version: 3
updated: 2026-11-25
tags: [histórias de usuário, user story, invest, critérios de aceitação, gherkin, bdd, dado quando então, casos de uso, especificação de caso de uso, fluxo principal, fluxo alternativo, fluxo de exceção, pré-condição, pós-condição, ator]
related: [uml-casos-de-uso, processo-de-requisitos, metodos-ageis, requisitos-fundamentos]
---

## O que é

São duas formas de **descrever requisitos funcionais** a partir do ponto de vista de quem usa o sistema:

- **História de usuário (user story):** frase curta que descreve uma necessidade do usuário e o **valor** que ela gera, típica de métodos ágeis. É um **lembrete para uma conversa**, completado por **critérios de aceitação**.
- **Caso de uso:** descrição estruturada da **interação** entre um **ator** e o sistema para atingir um objetivo, com **fluxo principal**, **fluxos alternativos** e **fluxos de exceção**. Comum em processos baseados em UML (como o RUP).

## Para que serve

Os dois aproximam requisitos da realidade do usuário e servem de base para **planejamento**, **implementação** e **testes**. Critérios de aceitação e fluxos de casos de uso viram diretamente **casos de teste**.

## Como funciona

### Histórias de usuário

Formato mais usado:

> **Como** \<tipo de usuário\>, **quero** \<funcionalidade\> **para** \<benefício/valor\>.

Exemplo: *Como cliente, quero reservar uma poltrona no voo para garantir que vou sentar perto da janela.*

**Os 3 Cs** (Ron Jeffries): **Cartão** (a frase), **Conversa** (detalhes discutidos com o PO e usuários), **Confirmação** (critérios de aceitação).

**INVEST** — uma boa história é: **I**ndependente, **N**egociável, **V**aliosa, **E**stimável, pequena (**S**mall) e **T**estável.

Histórias grandes demais são **épicos** e devem ser quebradas.

### Critérios de aceitação

Condições que a história deve satisfazer para ser aceita. O formato do BDD (*Gherkin*) é muito usado:

```gherkin
Cenário: reservar poltrona disponível
  Dado que estou logado e escolhi o voo LA123
  E a poltrona 14A está livre
  Quando eu selecionar a poltrona 14A e confirmar
  Então a poltrona 14A deve aparecer como reservada para mim
  E devo receber a confirmação por e-mail

Cenário: tentar reservar poltrona ocupada
  Dado que a poltrona 14A já está reservada
  Quando eu tentar selecioná-la
  Então devo ver a mensagem "Poltrona indisponível"
```

### Casos de uso — especificação textual

Um template comum:

| Campo | Conteúdo |
|---|---|
| **Nome** | verbo + objeto: "Encerrar conta" |
| **Ator principal** | quem inicia e obtém o objetivo (Cliente) |
| **Atores secundários** | outros envolvidos (Gerente, Sistema do Banco Central) |
| **Pré-condições** | o que deve ser verdade antes ("cliente autenticado") |
| **Fluxo principal** (cenário básico) | passos numerados do caminho feliz |
| **Fluxos alternativos** | caminhos válidos diferentes do principal (outra forma de chegar ao objetivo) |
| **Fluxos de exceção** | o que acontece quando algo dá errado (erro, regra violada) |
| **Pós-condições** | o estado garantido ao final ("conta encerrada e saldo transferido") |
| **Regras de negócio** | regras referenciadas (RN03: conta com saldo devedor não pode ser encerrada) |

:::example Caso de uso "Realizar matrícula"
**Ator principal:** Aluno. **Pré-condição:** aluno autenticado e período de matrícula aberto.

**Fluxo principal**
1. O aluno escolhe "Realizar matrícula".
2. O sistema exibe as disciplinas ofertadas com vagas.
3. O aluno seleciona as disciplinas e confirma.
4. O sistema verifica pré-requisitos e choque de horários.
5. O sistema registra a matrícula e exibe o comprovante.

**Fluxo alternativo A1 — salvar rascunho (passo 3):** o aluno salva a seleção para concluir depois; o caso de uso termina sem matrícula efetivada.

**Fluxo de exceção E1 — pré-requisito não cumprido (passo 4):** o sistema informa a disciplina e o pré-requisito pendente e volta ao passo 2.

**Fluxo de exceção E2 — fora do prazo:** se o período terminou, o sistema informa e estende para "Realizar matrícula fora do prazo" (ver «extend» em [Casos de uso UML](lib:uml-casos-de-uso)).

**Pós-condição:** matrícula registrada e vagas atualizadas.
:::

## Características principais

| | História de usuário | Caso de uso |
|---|---|---|
| Tamanho | uma frase + critérios | documento com fluxos |
| Origem | métodos ágeis (XP, Scrum) | Jacobson, UML, RUP |
| Detalhe | emerge da conversa, *just in time* | escrito antes da implementação |
| Foco | **valor** para o usuário | **interação** ator–sistema passo a passo |
| Teste | critérios de aceitação | fluxos viram cenários de teste |

## Exemplos práticos

:::example Histórias para reserva de passagens
- HST01: Como cliente, quero pesquisar voos por data e destino para escolher o melhor horário.
- HST02: Como cliente, quero pagar com cartão ou Pix para concluir a compra.
- HST03: Como atendente, quero remarcar o voo de um cliente para atender pedidos por telefone.
Critério de aceitação de HST02: "Dado um pagamento Pix aprovado, quando o banco confirmar, então a reserva muda para 'emitida' em até 1 minuto."
:::

## Representação visual

::figure{id="rastreabilidade-requisito-teste"}

Siga cada caminho da necessidade até sua evidência de teste. Uma história permite derivar testes dos critérios de aceitação. Um caso de uso permite derivá-los dos fluxos que descreve. No ENADE, verifique se os testes do exemplo cobrem tanto o cenário principal quanto as variações e exceções relevantes.

## Vantagens e desvantagens

| | Vantagens | Desvantagens |
|---|---|---|
| Histórias | rápidas, centradas em valor, fáceis de repriorizar | podem ficar vagas; visão do todo exige mapa de histórias |
| Casos de uso | completos, tratam exceções, bons para sistemas complexos | demorados para escrever e manter |

## Diferenças entre conceitos semelhantes

- **Fluxo alternativo × fluxo de exceção:** o alternativo ainda leva o ator a um resultado **válido** por outro caminho; a exceção trata **erros** ou impedimentos.
- **Pré-condição × fluxo de exceção:** pré-condição é o que **precisa ser verdade antes** de o caso de uso começar (não é verificado dentro dele); exceção é verificada **durante**.
- **Ator × usuário:** ator é um **papel** (pode ser outro sistema); a mesma pessoa pode desempenhar vários atores.
- **Épico × história:** épico é uma história grande demais, a ser dividida.

## Como cai no ENADE

:::enade
Questões trazem um **quadro de documentação de caso de uso** (2017) para identificar ator, fluxos e o diagrama correspondente, ou **histórias de usuário** (2021, discursiva) para construir diagramas ou critérios. Saiba converter história ↔ caso de uso ↔ diagrama.
:::

## Pegadinhas

:::trap Ator principal é quem obtém o objetivo
Mesmo que outro ator participe (gerente, sistema externo), o ator principal é quem **inicia** e se **beneficia** do caso de uso.
:::

:::trap "Como sistema, quero…" não é história de usuário
Histórias descrevem valor para **pessoas** (ou papéis de negócio), não tarefas técnicas internas.
:::

## Questões comentadas

::question 2017-objective-20 Documentação do caso de uso "Encerrar Conta"

A questão apresenta a documentação textual (ator principal Cliente, atores secundários, fluxos) e pede o diagrama coerente com ela. O raciocínio: o **ator principal** se liga ao caso de uso base; atores secundários também se associam a ele; comportamentos obrigatórios reutilizados viram **«include»** e opcionais, **«extend»**.

::question 2021-discursive-4 Histórias de usuário de reservas aéreas

Discursiva que parte de histórias no formato "COMO… GOSTARIA… PARA…". Para responder bem: identifique **atores** (os "como"), **funcionalidades** (os "gostaria") e o **valor** (os "para"), e transforme-os em casos de uso e relacionamentos.

## Resumo para memorizar

:::summary
- História: **Como** [papel], **quero** [função] **para** [valor]. 3 Cs: cartão, conversa, confirmação. **INVEST**.
- Critérios de aceitação: **Dado / Quando / Então**.
- Caso de uso: ator, pré-condições, **fluxo principal**, **alternativos**, **de exceção**, pós-condições.
- Alternativo = outro caminho válido; exceção = erro/impedimento.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual é a estrutura padrão de uma história de usuário?",
    "options": ["Dado, quando, então", "Como, quero, para", "Ator, fluxo, pós-condição", "Entrada, processamento, saída"],
    "answer": 1,
    "explanation": "Como <papel>, quero <funcionalidade>, para <benefício>. 'Dado, quando, então' é formato de critério de aceitação."
  },
  {
    "question": "No caso de uso 'Sacar dinheiro', o que é um fluxo de exceção?",
    "options": ["O cliente escolhe sacar R$ 50", "O saldo é insuficiente e o sistema informa o cliente", "O cliente escolhe imprimir comprovante", "O cliente está autenticado"],
    "answer": 1,
    "explanation": "Saldo insuficiente impede o objetivo: é uma exceção. Imprimir comprovante seria uma alternativa; estar autenticado, pré-condição."
  },
  {
    "question": "Na sigla INVEST, o 'T' indica que a história deve ser:",
    "options": ["Técnica", "Testável", "Temporária", "Trivial"],
    "answer": 1,
    "explanation": "Uma história precisa ter critérios que permitam verificar se foi atendida."
  }
]
:::

## Referências

- COHN, M. *User Stories Applied: For Agile Software Development*. Addison-Wesley, 2004.
- COCKBURN, A. *Escrevendo Casos de Uso Eficazes*. Bookman, 2005.
- JACOBSON, I. *Object-Oriented Software Engineering: A Use Case Driven Approach*. Addison-Wesley, 1992.
- SMART, J. F. *BDD in Action*. Manning, 2014.
- INEP. ENADE TADS 2017 (questão 20) e 2021 (discursiva 4).
- WIEGERS, Karl; BEATTY, Joy. *Software requirements*. 3. ed. Redmond: Microsoft Press, 2013.

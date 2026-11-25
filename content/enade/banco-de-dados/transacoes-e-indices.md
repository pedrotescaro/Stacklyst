---
title: Transações, propriedades ACID, concorrência, índices e bancos não relacionais e distribuídos
summary: O que é uma transação, as propriedades ACID, COMMIT e ROLLBACK, problemas de concorrência e níveis de isolamento, recuperação após falhas, índices (B+ e hash), bancos NoSQL e bancos distribuídos com o teorema CAP.
order: 4
level: intermediário
version: 3
updated: 2026-11-25
tags: [transação, acid, atomicidade, consistência, isolamento, durabilidade, commit, rollback, concorrência, bloqueio, lock, deadlock, leitura suja, níveis de isolamento, log, recuperação, índice, árvore b+, índice hash, nosql, documentos, chave-valor, colunar, grafos, banco distribuído, replicação, particionamento, sharding, teorema cap, base]
related: [sql, modelagem-de-dados, arvores, tabelas-hash, sistemas-operacionais]
---

## O que é

Uma **transação** é uma **unidade lógica de trabalho** formada por uma ou mais operações no banco que devem ser tratadas **como uma só**: ou **todas** acontecem, ou **nenhuma**. Exemplo clássico: transferir R$ 100 da conta A para a B (debitar A **e** creditar B).

Um **índice** é uma estrutura auxiliar que **acelera buscas** por determinadas colunas, como o índice remissivo de um livro.

## Para que serve

- Transações garantem que falhas (queda de energia, erro de aplicação) e acessos simultâneos **não corrompam** os dados.
- Índices tornam consultas rápidas em tabelas com milhões de linhas.
- Bancos NoSQL e distribuídos atendem a **escala**, **disponibilidade** e modelos de dados diferentes do relacional.

## Como funciona

### Propriedades ACID

| Propriedade | Significado | Mecanismo |
|---|---|---|
| **Atomicidade** | tudo ou nada | log de transações, ROLLBACK |
| **Consistência** | leva o banco de um estado **válido** a outro válido (restrições respeitadas) | restrições, regras, aplicação correta |
| **Isolamento** | transações concorrentes não interferem entre si; o resultado equivale a alguma execução **serial** | bloqueios (locks), MVCC |
| **Durabilidade** | depois do COMMIT, o resultado **sobrevive a falhas** | log gravado em disco, recuperação |

```sql
BEGIN;
UPDATE conta SET saldo = saldo - 100 WHERE id = 'A';
UPDATE conta SET saldo = saldo + 100 WHERE id = 'B';
COMMIT;        -- ou ROLLBACK; para desfazer tudo
```

### Concorrência e isolamento

Problemas quando transações rodam ao mesmo tempo:

- **Leitura suja:** ler dado alterado por outra transação ainda não confirmada.
- **Leitura não repetível:** ler o mesmo registro duas vezes e obter valores diferentes.
- **Leitura fantasma:** repetir uma consulta e aparecerem linhas novas.
- **Atualização perdida:** duas transações sobrescrevem a mesma alteração.

Níveis de isolamento (SQL padrão), do mais fraco ao mais forte: **Read Uncommitted**, **Read Committed**, **Repeatable Read**, **Serializable**. Bloqueios podem causar **deadlock** (cada transação espera um recurso que a outra detém); o SGBD detecta e aborta uma delas.

### Recuperação após falhas

O SGBD usa o **log** (registro antes da gravação — *write-ahead log*): após uma falha, **refaz (REDO)** transações confirmadas cujos dados não chegaram ao disco e **desfaz (UNDO)** as não confirmadas. Transações **não** são "confirmadas indiscriminadamente" após a falha.

### Índices

- **Árvore B+** (padrão): boa para igualdade, **intervalos** (`BETWEEN`, `>`), ordenação. Veja [Árvores](lib:arvores).
- **Hash:** muito rápida para **igualdade** (`=`), inútil para intervalos.
- **Primário/agrupado (clustered):** define a ordem física das linhas; **secundário:** estrutura separada.
- Custo: índices **aceleram leituras** mas **tornam INSERT/UPDATE/DELETE mais lentos** e ocupam espaço. Indexe colunas usadas em WHERE, JOIN e ORDER BY com alta seletividade.

### Bancos não relacionais (NoSQL)

| Tipo | Modelo | Exemplos | Uso |
|---|---|---|---|
| **Chave-valor** | chave → valor opaco | Redis, DynamoDB | cache, sessões |
| **Documentos** | documentos JSON/BSON | MongoDB, Firestore | catálogos, perfis flexíveis |
| **Colunar (wide-column)** | famílias de colunas | Cassandra, HBase | grandes volumes de escrita |
| **Grafos** | nós e arestas | Neo4j | redes sociais, recomendações |

Muitos NoSQL trocam a consistência forte por **disponibilidade e escala horizontal**, seguindo o modelo **BASE** (*Basically Available, Soft state, Eventual consistency*).

### Bancos distribuídos e teorema CAP

Dados espalhados por vários nós via **replicação** (cópias) e **particionamento/sharding** (cada nó guarda uma parte). O **teorema CAP** diz que, diante de uma **partição de rede**, um sistema distribuído precisa escolher entre **Consistência** (todos veem o mesmo dado) e **Disponibilidade** (todos recebem resposta). A **tolerância a partição** é obrigatória em redes reais.

## Características principais

- ACID é a garantia clássica dos bancos relacionais.
- Isolamento mais forte = mais segurança e **menos** concorrência (desempenho).
- Índices são invisíveis à consulta: o otimizador decide usá-los.

## Exemplos práticos

:::example Carrinho de compras e queda de energia (ENADE 2008)
Colocar um livro no carrinho **não** cria um segundo exemplar nem conclui a venda. Recuperar o carrinho persistido após a queda **não viola** a atomicidade. Após a falha, transações são **recuperadas ou desfeitas** conforme seu estado no log — não se confirma tudo indiscriminadamente.
:::

## Representação visual

::figure{id="ciclo-transacao-sgbd"}

A transação fica parcialmente confirmada quando termina de executar. A confirmação depende de atingir o ponto de commit. Se houver falha antes disso, siga até o desfazimento e a terminação. No ENADE, use o estado e a confirmação persistente para decidir o que recuperar.

## Vantagens e desvantagens

| Escolha | Vantagem | Custo |
|---|---|---|
| Relacional ACID | consistência forte, SQL, integridade | escala horizontal mais difícil |
| NoSQL | escala, esquema flexível, alta disponibilidade | consistência eventual, menos junções |
| Muitos índices | leituras rápidas | escritas lentas e mais espaço |
| Serializable | sem anomalias | menos concorrência |

## Diferenças entre conceitos semelhantes

- **Consistência (ACID) × consistência (CAP):** ACID = respeitar **restrições**; CAP = todos os nós verem o **mesmo valor**.
- **Atomicidade × durabilidade:** tudo ou nada × permanência após o commit.
- **Índice B+ × hash:** intervalos e ordem × só igualdade.
- **Replicação × particionamento:** cópias iguais (disponibilidade) × partes diferentes (escala).

## Como cai no ENADE

:::enade
Cenários de falhas e concorrência avaliando ACID (2008), uso de índices e árvores B+ e diferenças entre bancos relacionais e não relacionais.
:::

## Pegadinhas

:::trap COMMIT ≠ salvar parcialmente
Até o COMMIT, nada da transação é definitivo; com ROLLBACK, tudo é desfeito.
:::

:::trap Índice não acelera tudo
Em colunas pouco seletivas ou tabelas pequenas, o SGBD pode ignorá-lo; e cada índice encarece escritas.
:::

## Questões comentadas

::question 2008-objective-35 Livraria virtual, carrinho e pane de energia

Nenhum dos itens está certo: não houve violação de consistência por "dois exemplares" (o carrinho não reserva estoque nem conclui venda); recuperar o carrinho persistido não viola atomicidade; e, após falhas, transações são **recuperadas ou desfeitas** conforme o log, não confirmadas em massa (alternativa E).

## Resumo para memorizar

:::summary
- **ACID**: Atomicidade (tudo ou nada), Consistência (estados válidos), Isolamento (sem interferência), Durabilidade (sobrevive a falhas).
- COMMIT confirma; ROLLBACK desfaz; log permite REDO/UNDO.
- Isolamento: Read Uncommitted < Read Committed < Repeatable Read < Serializable.
- Índices: **B+** (intervalos), **hash** (igualdade); aceleram leitura, encarecem escrita.
- NoSQL: chave-valor, documentos, colunar, grafos; **BASE** e **CAP**.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Uma transferência debitou a conta A, mas o sistema caiu antes de creditar B. Qual propriedade garante que o débito seja desfeito?",
    "options": ["Durabilidade", "Atomicidade", "Isolamento", "Disponibilidade"],
    "answer": 1,
    "explanation": "Atomicidade: tudo ou nada; a operação incompleta é desfeita."
  },
  {
    "question": "Ler um valor alterado por outra transação que ainda não fez COMMIT é:",
    "options": ["Leitura fantasma", "Leitura suja", "Deadlock", "Leitura repetível"],
    "answer": 1,
    "explanation": "O dado pode ser desfeito depois; por isso é 'sujo'."
  },
  {
    "question": "Para consultas por intervalo de datas (BETWEEN), o índice mais adequado é:",
    "options": ["Hash", "Árvore B+", "Nenhum", "Índice de texto"],
    "answer": 1,
    "explanation": "As folhas encadeadas da B+ permitem varrer intervalos ordenados."
  }
]
:::

## Referências

- ELMASRI, R.; NAVATHE, S. B. *Sistemas de banco de dados*. 7. ed. São Paulo: Pearson Education do Brasil, 2018.
- SILBERSCHATZ, A.; KORTH, H. F.; SUDARSHAN, S. *Sistema de Banco de Dados*. 7. ed. Elsevier, 2020 — caps. 14 a 19.
- BREWER, E. Towards Robust Distributed Systems. *PODC Keynote*, 2000 (teorema CAP).
- SADALAGE, P. J.; FOWLER, M. *NoSQL Essencial*. Novatec, 2013.
- INEP. ENADE TADS 2008, questão 35.

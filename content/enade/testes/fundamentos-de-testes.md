---
title: Fundamentos de testes — V&V, caixa branca, preta e cinza, níveis e tipos de teste
summary: Verificação e validação, defeito × erro × falha, as técnicas de caixa branca, caixa preta e caixa cinza, os níveis unitário, integração, sistema e aceitação (alfa e beta), e os testes de regressão, desempenho, carga, estresse e outros.
order: 1
level: básico
version: 3
updated: 2026-11-25
tags: [teste de software, verificação, validação, v&v, defeito, erro, falha, caixa branca, caixa preta, caixa cinza, teste unitário, teste de integração, teste de sistema, teste de aceitação, alfa, beta, regressão, desempenho, carga, estresse, usabilidade, segurança, compatibilidade, instalação, partição de equivalência, valor limite, cobertura, tdd]
related: [complexidade-ciclomatica, qualidade-de-software, modelos-de-processo, metodos-ageis, requisitos-fundamentos]
---

## O que é

**Testar** é executar o software (ou parte dele) com o objetivo de **encontrar defeitos** e obter **confiança** de que ele atende aos requisitos. Testes mostram a **presença** de defeitos, nunca a sua **ausência** (Dijkstra).

:::definition Verificação × validação (V&V)
- **Verificação:** "estamos construindo o produto **corretamente**?" — o software está conforme a especificação? (revisões, inspeções, testes contra requisitos).
- **Validação:** "estamos construindo o produto **certo**?" — o software atende às **necessidades reais** do cliente e é adequado ao seu propósito? (testes de aceitação, protótipos com usuários).
:::

:::definition Erro, defeito e falha
**Erro (engano)**: ação humana equivocada → introduz um **defeito (bug, falta)** no código ou documento → que, ao ser executado, pode causar uma **falha**: comportamento observável diferente do esperado.
:::

## Para que serve

Reduzir o risco de falhas em produção, que custam dinheiro, reputação e, em alguns sistemas, vidas. Quanto mais **cedo** um defeito é encontrado, **mais barato** é corrigi-lo.

## Como funciona

### Técnicas (quanto se conhece do código)

| Técnica | Base | Exemplos de critérios |
|---|---|---|
| **Caixa preta (funcional)** | **requisitos/especificação**, sem olhar o código | partição de equivalência, análise de valor limite, tabela de decisão, casos de uso |
| **Caixa branca (estrutural)** | **estrutura interna** do código | cobertura de comandos, de decisões (ramos), de condições, **caminhos independentes** ([complexidade ciclomática](lib:complexidade-ciclomatica)) |
| **Caixa cinza** | combinação: conhecimento **parcial** da estrutura (arquitetura, banco, APIs) para projetar testes executados pela interface | testes de integração com conhecimento do esquema do banco |

**Partição de equivalência:** dividir as entradas em classes que o sistema deve tratar igual (idade válida 18–60; inválida < 18; inválida > 60) e testar um valor de cada. **Valor limite:** testar nas bordas (17, 18, 60, 61), onde os defeitos se concentram.

### Níveis de teste

| Nível | O que testa | Quem faz | Lado do Modelo V |
|---|---|---|---|
| **Unitário** | a menor unidade (método, classe, função) isolada | desenvolvedor | projeto detalhado |
| **Integração** | a comunicação entre unidades/módulos/serviços | desenvolvedores/testadores | arquitetura |
| **Sistema** | o sistema completo contra os requisitos funcionais e não funcionais | equipe de teste | requisitos do sistema |
| **Aceitação** | se o sistema atende ao **cliente** e pode ser aceito | **cliente/usuários** | requisitos do usuário |

- **Teste alfa:** feito pelo **usuário**, em **ambiente controlado**, **no local do desenvolvedor** e sob sua supervisão.
- **Teste beta:** feito pelos **usuários** em **seu próprio ambiente**, sem supervisão, com retorno dos problemas.

Estratégias de integração: **top-down** (usa *stubs* para módulos inferiores ainda não prontos), **bottom-up** (usa *drivers*), **big bang** (tudo junto — arriscado) e **sanduíche**.

### Tipos de teste (o que se avalia)

- **Funcional:** o sistema desempenha as funções especificadas.
- **Regressão:** reexecutar testes **depois de uma alteração** para garantir que o que funcionava **continua funcionando**.
- **Desempenho:** tempo de resposta e uso de recursos em condições esperadas.
- **Carga:** comportamento com o **volume de uso esperado** (e um pouco acima): "100 pedidos simultâneos".
- **Estresse:** levar o sistema **além dos limites** para ver como e quando falha e se se recupera.
- **Usabilidade, acessibilidade, segurança (invasão), compatibilidade** (navegadores, dispositivos), **instalação**, **recuperação**, **configuração**.
- **Fumaça (smoke):** verificação rápida de que o build básico funciona.

### Cobertura de código

Percentual do código exercitado pelos testes: **comandos** (linhas executadas), **decisões/ramos** (cada `if` tomado verdadeiro e falso), **condições** (cada subexpressão booleana), **caminhos**. 100% de comandos não garante 100% de decisões.

## Características principais

- Teste é **planejado** (plano de testes, casos de teste com entradas, passos e resultado esperado).
- **Automatização** permite rodar a suíte inteira a cada mudança (regressão contínua, integração contínua).
- **Pirâmide de testes:** muitos unitários, menos de integração, poucos de interface ponta a ponta.

## Exemplos práticos

:::example Classificando as necessidades de um sistema de delivery
| Descrição | Tipo/nível |
|---|---|
| Verificar se o método `finalizarPedido()` da classe `Pedido` funciona | **unitário** |
| Funcionar em diferentes navegadores | **compatibilidade** (caixa **preta**) |
| Testes rigorosos da estrutura lógica interna | **caixa branca** |
| Garantir 100 pedidos simultâneos | **carga** |
| Usuário testa em ambiente controlado, supervisionado pelos desenvolvedores | **alfa** |
:::

```java
@Test
void naoDevePermitirSaqueMaiorQueSaldo() {         // teste unitário (JUnit)
    ContaBancaria conta = new ContaBancaria("1", 100);
    assertFalse(conta.sacar(150));
    assertEquals(100, conta.getSaldo());
}
```

## Representação visual

::figure{id="estrategia-testes-software"}

O escopo se amplia da unidade para o software integrado, chega à validação dos requisitos e inclui o sistema completo no seu ambiente. No ENADE, use o objeto descrito para identificar o nível. Uma função aponta para unidade, e sua interação com outros componentes aponta para integração.

::figure{id="etapas-testes-software"}

Leia cada grupo pelo objetivo e por quem participa. O desenvolvimento testa as unidades e suas combinações; uma equipe separada pode verificar a versão candidata; usuários participam da avaliação final. No ENADE, observe que o alfa ocorre em ambiente acompanhado e que a aceitação dá base à decisão do cliente de aceitar ou rejeitar a entrega. Myers, Sandler e Badgett (2012, caps. 5 e 6) também distinguem testes de módulo e de ordem superior.

## Vantagens e desvantagens

| Técnica | Vantagem | Limitação |
|---|---|---|
| Caixa preta | foca no que o usuário espera; não depende do código | não garante cobertura do código |
| Caixa branca | cobre caminhos e decisões internas | não descobre funcionalidade **ausente** |
| Automatizados | rápidos e repetíveis | custo de manutenção dos scripts |
| Manuais exploratórios | acham problemas inesperados | lentos e pouco repetíveis |

## Diferenças entre conceitos semelhantes

- **Carga × estresse:** carga = volume **esperado**; estresse = **além do limite**, até quebrar.
- **Desempenho × carga:** desempenho mede tempos/recursos; carga verifica o comportamento sob determinado número de usuários.
- **Regressão × reteste:** reteste confirma que **o defeito corrigido** sumiu; regressão verifica que **nada mais quebrou**.
- **Alfa × beta:** ambiente **controlado/desenvolvedor** × ambiente **real/usuário**.
- **Sistema × aceitação:** o primeiro é feito pela **equipe** contra a especificação; o segundo, pelo **cliente** para aceitar a entrega.

## Como cai no ENADE

:::enade
Classificar descrições em **unitário, carga, alfa, caixa branca/preta** (2021), definição de **regressão** (2011), RNFs a testar (2014), afirmações sobre teste funcional, de aceitação e V&V (2017) e aplicabilidade de caixa branca/preta quando só se conhece parte do código (2008).
:::

## Pegadinhas

:::trap Caixa branca = estrutura interna
"Testar a estrutura lógica interna" é caixa **branca**. Testar em vários navegadores é caixa **preta** (comportamento externo).
:::

:::trap Desempenho não valida o processo
Teste de desempenho avalia tempo e capacidade do **produto**, não a conformidade do **processo** de desenvolvimento.
:::

:::trap "Aceitação" não é requisito não funcional
É um **nível** de teste. Usabilidade, segurança, desempenho e confiabilidade são RNFs.
:::

## Questões comentadas

::question 2021-objective-24 Testes de um sistema de delivery

01 → **unitário** (I correta); 02 → compatibilidade, caixa **preta** (II errada); 03 → estrutura interna, caixa **branca** (III errada); 04 → **carga** (IV correta); 05 → **alfa** (V correta). Resposta: **I, IV e V**.

::question 2011-objective-25 Objetivo do teste de regressão

Verificar a existência de defeitos **após alterações** em um sistema já testado (alternativa D).

::question 2017-objective-23 Teste funcional, aceitação e V&V

Corretas **I** (funcional confronta requisitos), **III** (aceitação é feita pelo cliente) e **V** (V&V asseguram adequação ao propósito). II confunde desempenho com conformidade de processo; IV usa "invariavelmente" indevidamente. Resposta: **I, III e V**.

::question 2008-objective-14 Sub-rotina xis() sem código das rotinas chamadas

Sem o código de `calc()`, `f1()` e `f2()`, não há como fazer caixa branca delas (I errada); testá-las isoladamente não garante o comportamento de `xis()`, que depende de `Gn` global (III errada). É viável exercitar `xis()` por caixa preta e observar se termina (II). **Apenas um item** está certo.

## Resumo para memorizar

:::summary
- **Verificação** = produto correto (conforme especificação). **Validação** = produto certo (necessidade real).
- **Caixa preta** = requisitos; **branca** = estrutura interna; **cinza** = mistura.
- Níveis: **unitário → integração → sistema → aceitação** (alfa no desenvolvedor, beta no usuário).
- **Regressão** = após mudanças. **Carga** = volume esperado. **Estresse** = além do limite.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Testar um sistema com o triplo de usuários previstos para ver quando ele cai é teste de:",
    "options": ["Carga", "Estresse", "Regressão", "Aceitação"],
    "answer": 1,
    "explanation": "Ir além dos limites para observar a falha e a recuperação é estresse."
  },
  {
    "question": "Para uma idade válida entre 18 e 60, qual conjunto aplica análise de valor limite?",
    "options": ["30 e 45", "17, 18, 60 e 61", "0 e 100", "Apenas 18"],
    "answer": 1,
    "explanation": "Os valores imediatamente dentro e fora das bordas são os mais propensos a defeitos."
  },
  {
    "question": "Usuários testando o sistema em suas próprias empresas, sem supervisão da equipe, caracterizam:",
    "options": ["Teste alfa", "Teste beta", "Teste unitário", "Caixa branca"],
    "answer": 1,
    "explanation": "Beta acontece no ambiente real do usuário."
  }
]
:::

## Referências

- PRESSMAN, Roger S.; MAXIM, Bruce R. *Engenharia de software: uma abordagem profissional*. 8. ed. Porto Alegre: AMGH, 2016.
- DELAMARO, M. E.; MALDONADO, J. C.; JINO, M. *Introdução ao Teste de Software*. 2. ed. Elsevier, 2016.
- ISTQB. *Certified Tester Foundation Level Syllabus*, v4.0, 2023 (tradução BSTQB).
- MYERS, Glenford J.; SANDLER, Corey; BADGETT, Tom. *The art of software testing*. 3. ed. Hoboken: Wiley, 2012.
- INEP. ENADE TADS 2008 (questão 14), 2011 (questão 25), 2014 (questão 25), 2017 (questão 23) e 2021 (questão 24).
- SOMMERVILLE, Ian. *Engenharia de software*. 10. ed. São Paulo: Pearson, 2018.

---
title: Fundamentos de Engenharia de Software e ciclo de vida
summary: O que é engenharia de software, por que ela existe, o que é um processo, as atividades genéricas do desenvolvimento e o ciclo de vida de um sistema do nascimento à aposentadoria.
order: 1
level: básico
version: 4
updated: 2026-11-25
tags: [engenharia de software, crise do software, processo de software, ciclo de vida, atividades genéricas, especificação, projeto, validação, evolução, ferramentas case, ide]
related: [modelos-de-processo, metodos-ageis, rup-visao-geral, qualidade-de-software]
---

## O que é

**Engenharia de Software** é a disciplina que aplica princípios de engenharia — planejamento, métodos, medição e controle de qualidade — para **especificar, desenvolver, manter e evoluir software** de forma sistemática, dentro de prazo e custo, com a qualidade esperada.

A palavra-chave é **sistemática**: programar sozinho um script é diferente de construir, com 30 pessoas, um sistema bancário que vai funcionar por 15 anos.

:::definition Software, segundo a engenharia
Não é só o código: inclui **programas**, **documentação** (requisitos, projeto, manuais) e **dados de configuração** necessários para que funcione (Sommerville).
:::

## Para que serve

A área nasceu na conferência da OTAN de 1968, diante da chamada **crise do software**: projetos atrasados, caros, com defeitos e difíceis de manter. A engenharia de software serve para:

- tornar o desenvolvimento **previsível** (prazo e custo estimáveis);
- garantir **qualidade** (confiabilidade, segurança, desempenho, usabilidade);
- permitir **manutenção e evolução** ao longo de anos;
- coordenar **equipes** e comunicar decisões por meio de modelos e documentos.

## Como funciona

### Processo de software

Um **processo** é um conjunto estruturado de atividades para desenvolver um sistema. Todo processo, de qualquer modelo, contém quatro **atividades fundamentais** (Sommerville):

1. **Especificação** — definir o que o sistema deve fazer e suas restrições (requisitos).
2. **Projeto e implementação** — definir a organização do sistema e programá-lo.
3. **Validação** — verificar se o sistema faz o que o cliente quer (testes, revisões).
4. **Evolução** — modificar o sistema para atender a novas necessidades.

Pressman descreve um **arcabouço** (*framework*) genérico com cinco atividades: **comunicação, planejamento, modelagem, construção e entrega (implantação)**, mais atividades de apoio (gestão de riscos, garantia da qualidade, gerência de configuração, medição).

### Ciclo de vida de software

O **ciclo de vida** é a trajetória completa do software: da ideia até a retirada de uso.

1. Concepção da necessidade e estudo de viabilidade;
2. Requisitos;
3. Projeto (arquitetura e detalhes);
4. Implementação;
5. Testes;
6. Implantação;
7. **Operação e manutenção** (normalmente a fase mais longa e mais cara);
8. Descontinuação (aposentadoria ou substituição).

Um **modelo de ciclo de vida** (ou modelo de processo) é uma forma de organizar essas etapas no tempo: em sequência, em ciclos, em incrementos. Veja os [modelos de processo](lib:modelos-de-processo).

### Métodos, ferramentas e camadas

Pressman descreve a engenharia de software em **camadas**: na base, o **foco na qualidade**; acima, o **processo** (o "esqueleto" que define o que fazer e quando); depois os **métodos** (como fazer: técnicas de análise, projeto, teste) e, no topo, as **ferramentas** (apoio automatizado: IDEs, ferramentas CASE, controle de versão).

:::note Ferramentas CASE e IDEs
**CASE** (*Computer-Aided Software Engineering*) é qualquer ferramenta que apoia atividades da engenharia de software: modelagem UML, gestão de requisitos, testes. Uma **IDE** (Eclipse, NetBeans, VS Code, IntelliJ) integra editor, compilador, depurador e outras ferramentas em um só ambiente, aumentando a produtividade — mas não substitui o processo nem garante qualidade sozinha.
:::

## Características principais

- **Software não se desgasta**, mas se **deteriora**: cada mudança mal feita introduz defeitos e aumenta a complexidade.
- É **desenvolvido**, não fabricado em série: o custo está na engenharia, não na cópia.
- A maior parte do custo total está na **manutenção**, não no desenvolvimento inicial.
- Envolve **pessoas**: comunicação com clientes e entre a equipe é um fator crítico.
- Não existe processo único ideal: o processo deve ser **adaptado** ao tipo de sistema.

## Exemplos práticos

:::example O mesmo sistema, contextos diferentes
- Um **aplicativo de delivery** de uma startup muda toda semana: pede processo ágil, entregas curtas e feedback rápido.
- Um **software embarcado de freio ABS** exige especificação rigorosa, verificação formal e testes exaustivos: pede um processo dirigido por plano, como o modelo V.
- Um **ERP corporativo** com dezenas de módulos e equipes pede um processo com arquitetura bem definida e gerência de configuração forte, como o RUP adaptado.
:::

## Representação visual

::figure{id="atividades-processo-software"}

Leia os quatro blocos como tipos de trabalho presentes em qualquer processo. A ordem e a sobreposição dependem do modelo adotado. No ENADE, associe a validação à verificação das necessidades do cliente e a evolução à resposta a mudanças ao longo da vida do produto.

### Especificação do software

::figure{id="especificacao-requisitos-sommerville"}

Veja o que cada atividade produz: descrições do sistema, especificações de requisitos e o documento validado. As setas de retorno mostram que descobertas da validação podem exigir ajustes.

### Taxa de falhas do hardware

::widget curva-banheira

Fonte: adaptado de PRESSMAN; MAXIM (2016, cap. 1) — recriado pela equipe Stacklyst.

Leia a curva da esquerda para a direita. A taxa de falhas cai após os defeitos iniciais, passa por um trecho aproximadamente estável e sobe com o desgaste físico. No ENADE, associe essa subida ao envelhecimento do hardware e os picos de falhas no software à introdução de defeitos durante mudanças.

## Vantagens e desvantagens

| Engenharia de software sistemática | Desenvolvimento improvisado |
|---|---|
| estimativas e controle de prazo e custo | prazos imprevisíveis |
| qualidade verificável | defeitos descobertos pelo usuário |
| manutenção viável por outras pessoas | dependência de quem escreveu o código |
| custo inicial maior de planejamento | começo mais rápido, mas caro depois |

## Diferenças entre conceitos semelhantes

- **Processo × método × ferramenta:** processo diz *o que* fazer e *quando*; método diz *como* fazer; ferramenta automatiza o método.
- **Ciclo de vida × modelo de processo:** o ciclo de vida é a vida real do produto; o modelo de processo é a forma escolhida para organizar o desenvolvimento.
- **Engenharia de software × ciência da computação:** a ciência estuda teoria e fundamentos (algoritmos, computabilidade); a engenharia aplica esses fundamentos para produzir sistemas úteis com qualidade e custo controlados.
- **Verificação × validação:** "estamos construindo o produto **corretamente**?" × "estamos construindo o produto **certo**?" (veja [Fundamentos de testes](lib:fundamentos-de-testes)).

## Como cai no ENADE

:::enade
Questões de fundamentos aparecem como contexto de outras (processo, qualidade, IDEs). Em 2011, por exemplo, uma questão de asserção-razão tratou das IDEs como ambientes que integram ferramentas para aumentar a produtividade. Leia sempre o enunciado buscando a **definição** que a banca usa.
:::

## Pegadinhas

:::trap "Software se desgasta como hardware"
Falso. Hardware sofre desgaste físico (curva da "banheira"). Software não se desgasta, mas se **deteriora** com mudanças sucessivas que introduzem efeitos colaterais.
:::

:::trap "Uma boa ferramenta garante um bom processo"
Ferramentas apoiam, mas a qualidade vem do processo e dos métodos aplicados por pessoas qualificadas.
:::

## Questões comentadas

::question 2011-objective-16 Integração de componentes e portabilidade

Eclipse e NetBeans podem reutilizar componentes compatíveis com as convenções JavaBeans. O bytecode executado pela JVM favorece a portabilidade, mas isso, por si só, não explica a integração do componente na IDE. As duas asserções são verdadeiras e a segunda não justifica a primeira. O gabarito é B.

## Resumo para memorizar

:::summary
- Engenharia de software = abordagem **sistemática** para desenvolver e **manter** software com qualidade, prazo e custo.
- 4 atividades fundamentais: **especificação, projeto/implementação, validação, evolução**.
- Arcabouço de Pressman: **comunicação, planejamento, modelagem, construção, entrega**.
- Camadas: **qualidade → processo → métodos → ferramentas**.
- A manutenção é a fase **mais longa e mais cara** do ciclo de vida.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Qual alternativa lista as quatro atividades fundamentais de todo processo de software, segundo Sommerville?",
    "options": ["Análise, codificação, compilação e execução", "Especificação, projeto e implementação, validação e evolução", "Planejamento, Sprint, revisão e retrospectiva", "Concepção, Elaboração, Construção e Transição"],
    "answer": 1,
    "explanation": "Essas quatro atividades aparecem em qualquer modelo. A opção D lista as fases do RUP, que é um modelo específico."
  },
  {
    "question": "Por que se diz que o software 'se deteriora', mas não 'se desgasta'?",
    "options": ["Porque o software tem peças mecânicas", "Porque mudanças sucessivas introduzem defeitos e complexidade, embora não haja desgaste físico", "Porque o código perde bits com o tempo", "Porque o software só funciona por um período fixo"],
    "answer": 1,
    "explanation": "Sem desgaste físico, a degradação vem das alterações ao longo da manutenção."
  },
  {
    "question": "Na visão em camadas de Pressman, qual é a base de tudo?",
    "options": ["Ferramentas", "Métodos", "Foco na qualidade", "Linguagem de programação"],
    "answer": 2,
    "explanation": "A base é o compromisso com a qualidade; sobre ela vêm processo, métodos e ferramentas."
  }
]
:::

## Referências

- SOMMERVILLE, Ian. *Engenharia de software*. 10. ed. São Paulo: Pearson, 2018.
- PRESSMAN, Roger S.; MAXIM, Bruce R. *Engenharia de software: uma abordagem profissional*. 8. ed. Porto Alegre: AMGH, 2016.
- IEEE. *SWEBOK — Guide to the Software Engineering Body of Knowledge*, v3.0, 2014.
- NAUR, P.; RANDELL, B. (org.). *Software Engineering: Report of a conference sponsored by the NATO Science Committee*, 1968.

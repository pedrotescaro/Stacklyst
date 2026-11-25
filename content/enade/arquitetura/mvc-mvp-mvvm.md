---
title: MVC, MVP e MVVM
summary: Os três padrões de organização da interface — Model-View-Controller, Model-View-Presenter e Model-View-ViewModel —, o papel de cada parte, como os dados fluem e como diferenciá-los.
order: 3
level: intermediário
version: 3
updated: 2026-11-25
tags: [mvc, model view controller, mvp, model view presenter, mvvm, model view viewmodel, data binding, padrão arquitetural, interface, separação de responsabilidades, controller, presenter, viewmodel]
related: [estilos-arquiteturais, evolucao-arquiteturas-e-camadas, padroes-de-projeto, uml-interacao]
---

## O que é

São **padrões arquiteturais de apresentação**: separam a **interface** (o que o usuário vê) da **lógica e dos dados**, para que cada parte possa mudar e ser testada de forma independente.

- **MVC — Model-View-Controller** (Trygve Reenskaug, Smalltalk, anos 1970).
- **MVP — Model-View-Presenter** (anos 1990), variação em que a View fica "passiva".
- **MVVM — Model-View-ViewModel** (Microsoft, 2005), baseado em **data binding**.

## Para que serve

Sem separação, a tela mistura acesso a banco, regras e desenho de componentes — difícil de testar e de reaproveitar. Com esses padrões, a mesma regra pode servir a várias telas (web, móvel) e a lógica de apresentação pode ser testada sem a interface gráfica.

## Como funciona

### MVC

- **Model:** dados, estado e **regras de negócio** do domínio; notifica mudanças.
- **View:** **exibe** o Model ao usuário.
- **Controller:** **recebe as ações** do usuário (eventos, requisições), interpreta e **aciona o Model** (e escolhe a View).

Fluxo: usuário → **Controller** → atualiza o **Model** → a **View** reflete o novo estado (observando o Model ou recebendo-o do Controller). Em frameworks web (Spring MVC, Rails, Laravel, ASP.NET MVC), o Controller recebe a requisição HTTP, chama o Model e devolve uma View renderizada.

Um sistema pode ter **vários controllers** — inclusive uma **família de controllers intercambiáveis** (Strategy) para modos de operação diferentes.

### MVP

- **View passiva:** só exibe e repassa eventos; não conhece o Model.
- **Presenter:** recebe os eventos da View, conversa com o Model e **atualiza a View explicitamente** por uma interface (`view.mostrarTotal(...)`).
- Relação **1 View ↔ 1 Presenter**; fácil testar o Presenter com uma View falsa. Comum em Android antigo e Windows Forms.

### MVVM

- **ViewModel:** expõe **estado e comandos** prontos para a tela, **sem conhecer a View**.
- **View:** se **liga** (*data binding*) às propriedades do ViewModel; quando o ViewModel muda, a View se atualiza automaticamente, e vice-versa (binding bidirecional).
- Usado em WPF, Xamarin/.NET MAUI, Android Jetpack, Angular, Vue (e, conceitualmente, em React com estado + hooks).

::widget layers-flow variant=mvc

Fonte: adaptado de FOWLER (2006) — recriado pela equipe Stacklyst.

Acione o widget e siga a intenção da pessoa usuária até o modelo e a atualização da tela. No ENADE, localize em qual papel estão as regras de negócio.

## Características principais

| | MVC | MVP | MVVM |
|---|---|---|---|
| Quem recebe a entrada | Controller | View → Presenter | View (binding) → comandos do ViewModel |
| A View conhece o Model? | pode observar | **não** | **não** (conhece o ViewModel) |
| Atualização da View | observação ou Controller | Presenter chama a View | **data binding automático** |
| Teste da lógica de tela | médio | fácil (Presenter) | fácil (ViewModel) |

## Exemplos práticos

:::example Calculadora em MVC com modos diferentes
A classe `Calculadora` mantém uma referência a `CalculadoraController`. Ao trocar de modo, `alteraModo()` passa a apontar para `ProbabilistaController` ou `OrdinarioController`; cada controller interage com as partes do Model adequadas. A hierarquia de controllers é uma **família de algoritmos intercambiáveis** — o padrão **Strategy** aplicado dentro do MVC.
:::

## Representação visual

::figure{id="mvc-notificacao-modelo"}

No MVC clássico, o controlador interpreta a ação, o modelo altera o estado e a visão observa a mudança e lê os dados atualizados. No ENADE, associe cada seta a entrada, domínio ou apresentação e considere a variante de MVC citada no enunciado.

::figure{id="mvp-mvvm-vinculacao"}

No MVP com visão passiva, o apresentador atualiza a tela por chamadas explícitas. No MVVM, a vinculação propaga dados e encaminha comandos. No ENADE, procure o mecanismo que sincroniza a tela e observe quem conhece a visão.

## Vantagens e desvantagens

| Padrão | Vantagens | Desvantagens |
|---|---|---|
| MVC | consagrado, suportado por frameworks web | controllers "gordos" se mal usados |
| MVP | View burra, Presenter muito testável | muito código de ligação View↔Presenter |
| MVVM | binding elimina código de atualização da tela | binding mágico dificulta depuração; exige framework |

## Diferenças entre conceitos semelhantes

- **Controller × Presenter × ViewModel:** o Controller **reage a ações** e escolhe o que fazer; o Presenter **comanda a View** explicitamente; o ViewModel **expõe estado** para a View se ligar.
- **MVC × três camadas:** MVC organiza a **apresentação** (pode existir inteiro dentro da camada de apresentação ou do servidor web); três camadas organizam o **sistema** (apresentação, negócio, dados). Não são sinônimos.
- **MVC × Strategy/Observer:** o MVC **usa** padrões GoF internamente: Observer (View observa Model), Strategy (Controller intercambiável), Composite (Views aninhadas).

## Como cai no ENADE

:::enade
Código de uma aplicação MVC perguntando qual padrão GoF a hierarquia de controllers aplica (2017: **Strategy**), se MVC exige um único controller e o papel do Model (2021).
:::

## Pegadinhas

:::trap MVC não exige um único Controller
Pode haver vários controllers, inclusive intercambiáveis.
:::

:::trap Delegar não é Adapter
Repassar uma chamada a um controller não é Adapter; o Adapter **converte interfaces incompatíveis**.
:::

## Questões comentadas

::question 2017-objective-26 Calculadora MVC com modos comum e probabilista

A hierarquia de controllers representa uma **família de algoritmos intercambiáveis** por uma interface comum — o padrão **Strategy** (afirmação I correta). O MVC não exige um único controller para toda a solução e a delegação não caracteriza Adapter, pois não há conversão entre interfaces incompatíveis. Resposta: **I, apenas**.

## Resumo para memorizar

:::summary
- **MVC**: Controller recebe ações → Model (dados e regras) → View exibe.
- **MVP**: View passiva; **Presenter** atualiza a View por interface.
- **MVVM**: View ↔ **ViewModel** por **data binding**.
- São padrões de **apresentação**, não sinônimos de três camadas.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "No MVC, quem recebe e interpreta as ações do usuário?",
    "options": ["Model", "View", "Controller", "Banco de dados"],
    "answer": 2,
    "explanation": "O Controller trata as entradas e aciona o Model."
  },
  {
    "question": "Qual padrão se apoia em data binding entre a View e um objeto que expõe estado e comandos?",
    "options": ["MVC", "MVP", "MVVM", "Singleton"],
    "answer": 2,
    "explanation": "No MVVM, a View se liga às propriedades do ViewModel."
  },
  {
    "question": "No MVP, a View:",
    "options": ["contém as regras de negócio", "é passiva e repassa eventos ao Presenter", "acessa o banco diretamente", "substitui o Model"],
    "answer": 1,
    "explanation": "A View passiva só exibe e repassa eventos; o Presenter decide e a atualiza."
  }
]
:::

## Referências

- REENSKAUG, T. *The original MVC reports*. Xerox PARC, 1979.
- FOWLER, M. *GUI architectures*. [S. l.], 2006. Disponível em: https://martinfowler.com/eaaDev/uiArchs.html. Acesso em: 25 nov. 2026.
- GAMMA, E. et al. *Padrões de Projeto*. Bookman, 2000 — seção sobre MVC em Smalltalk.
- MICROSOFT. *The Model-View-ViewModel Pattern*. Documentação .NET.
- INEP. ENADE TADS 2017 (questão 26) e 2021 (questão 19).
- MICROSOFT. *Model-view-viewmodel*. [S. l.]: Microsoft Learn, 2024. Disponível em: https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm. Acesso em: 25 nov. 2026.

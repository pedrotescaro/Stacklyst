---
name: Stacklyst mobile
description: Interface nativa para leitura, participação e prática focada.
colors:
  dark-background: '#000000'
  dark-surface: '#111316'
  dark-elevated: '#1a1e23'
  dark-own-message: '#0b2b48'
  dark-text: '#f4f6f8'
  dark-muted: '#9da7b3'
  dark-primary: '#0078d4'
  dark-on-primary: '#ffffff'
  dark-border: '#292d33'
  dark-success: '#63d99b'
  dark-success-surface: '#153c2b'
  dark-on-success: '#002616'
  dark-danger-surface: '#34191e'
  dark-like: '#ff678b'
  dark-danger: '#ff8c95'
  dark-warning: '#f2cb6d'
  light-background: '#ffffff'
  light-surface: '#f7f9f9'
  light-elevated: '#eff3f4'
  light-own-message: '#e2f1ff'
  light-text: '#0f1419'
  light-muted: '#536471'
  light-primary: '#0074c8'
  light-on-primary: '#ffffff'
  light-border: '#cfd9de'
  light-success: '#087d48'
  light-success-surface: '#e4f5eb'
  light-on-success: '#ffffff'
  light-danger-surface: '#ffebee'
  light-like: '#c72250'
  light-danger: '#c32240'
  light-warning: '#826000'
typography:
  title: { fontSize: '28px', lineHeight: '34px', fontWeight: 800 }
  heading: { fontSize: '20px', lineHeight: '27px', fontWeight: 700 }
  body: { fontSize: '16px', lineHeight: '24px' }
  secondary: { fontSize: '14px', lineHeight: '21px' }
  caption: { fontSize: '12px', lineHeight: '17px' }
  lesson-title: { fontSize: '26px', lineHeight: '33px', fontWeight: 800 }
rounded:
  control: '12px'
  panel: '16px'
  pill: '999px'
  button: '28px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  xxl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.dark-primary}'
    textColor: '{colors.dark-on-primary}'
    rounded: '{rounded.button}'
    padding: '12px 20px'
  button-secondary:
    textColor: '{colors.dark-text}'
    rounded: '{rounded.button}'
    padding: '12px 20px'
  lesson-button:
    backgroundColor: '{colors.dark-success}'
    textColor: '{colors.dark-on-success}'
    rounded: '{rounded.panel}'
    padding: '14px 24px'
  lesson-option:
    backgroundColor: '{colors.dark-background}'
    textColor: '{colors.dark-text}'
    rounded: '{rounded.panel}'
    padding: '16px'
  input:
    backgroundColor: '{colors.dark-surface}'
    textColor: '{colors.dark-text}'
    rounded: '{rounded.control}'
    padding: '14px'
  panel:
    backgroundColor: '{colors.dark-surface}'
    textColor: '{colors.dark-text}'
    rounded: '{rounded.control}'
    padding: '16px'
---

# Design System: Stacklyst mobile

## Overview

**Creative North Star: "Stacklyst social native"**

Interface nativa para leitura, participação e estudo, com estrutura social inspirada no X e identidade própria do Stacklyst. A referência orienta navegação e densidade; marca, logo e conteúdo pertencem ao projeto.

A prática concentra uma atividade e uma próxima ação por vez: ler, responder, verificar no servidor, compreender o resultado e continuar. O contrato de direção está no comentário inicial de `src/features/learning/LessonSession.tsx`. Preservar o logo original e o mascote existente em `assets/robot.png`; esta superfície reutiliza esses ativos.

**Key Characteristics:**

- Fundo contínuo, divisórias discretas e hierarquia legível.
- Azul para ações sociais; verde para ação e feedback de aprendizagem.
- Uma atividade por vez, opções amplas e próxima ação persistente.
- Estados acessíveis e confirmação do servidor para resultados reais.

Este registro descreve o código nativo em `apps/mobile`. A avaliação visual em dispositivo permanece pendente de recaptura; os exemplos do sidecar são representações HTML dos componentes, não capturas nativas verificadas.

## Colors

As paletas escura e clara do frontmatter reproduzem `src/theme.tsx`. O tema inicial é escuro; Configurações oferece escuro, claro e sistema, com preferência local. Componentes obtêm cores por `useTheme`.

### Primary

Azul de ação identifica ações principais, seleção de respostas e indicadores de navegação. O desenho original do logo mantém sua própria cor e adapta o contraste ao tema.

### Secondary

Verde de aprendizagem distingue a próxima ação da lição, progresso e confirmação correta. As superfícies de sucesso e erro agrupam feedback sem competir com a pergunta. Curtidas usam o token `like`; erros e avisos usam seus tokens semânticos.

**The Server Confirmation Rule.** Avaliação, progresso persistido e XP vêm do servidor; seleção local ou animação não comprovam conclusão.

### Neutral

Fundo, superfície, superfície elevada, texto, texto secundário e divisórias mantêm as mesmas funções nos dois temas. Mensagens próprias usam `ownMessage`, também aplicado à seleção das opções da lição.

## Typography

Fonte nativa do sistema, acompanhando a escala do aparelho. A hierarquia compartilhada é título, heading, corpo, secundário e legenda. O título de atividade usa a função `lesson-title`; as opções usam texto amplo (17/25) e diferenciam seleção por peso, borda e ícone. Código preserva fonte monoespaçada e rolagem horizontal, sem reduzir a fonte para caber.

## Layout

O conteúdo ocupa a largura disponível até o limite centralizado (760 unidades). A tela compartilhada usa padding e intervalo de conteúdo (20 unidades); o feed mantém linhas de ponta a ponta, com avatar à esquerda e conteúdo à direita. A escala nomeada de espaços está no frontmatter; valores CSS representam as unidades de layout do React Native.

Botões e alvos de ícone têm área mínima (48 unidades); inputs têm altura mínima (52). Opções de lição têm altura mínima (60), padding (16) e intervalo entre opções (12). O footer da tela fica fora da rolagem, dentro da área que se ajusta ao teclado, e soma espaço inferior aos insets do sistema. O botão principal da lição tem altura mínima (56). Sua posição acima do teclado e da área segura ainda precisa de conferência visual nativa.

## Elevation & Depth

A profundidade vem de superfícies tonais, bordas e divisórias hairline; os componentes compartilhados aqui não dependem de sombras. O drawer usa uma sobreposição escura cuja opacidade chega a (0.55), com entrada curta (240 ms) e saída (180 ms). A barra de progresso interpola a largura em (220 ms). Ambos respeitam redução de movimento, usando duração zero.

## Shapes

Avatares são circulares. Campos e painéis compartilhados usam cantos de controle; opções, feedback e botão principal da lição usam cantos de painel. Botões compartilhados usam cantos mais arredondados. A barra de progresso tem altura (12) e raio (6); opções usam borda (2) e indicam seleção também por ícone e peso do texto.

## Components

### Navigation and brand

Cinco destinos frequentes na barra inferior: Início, Explorar, Aprender, Notificações e Mensagens. Ícones Tabler (26), peso ativo (2.5) e inativo (1.7), rótulos acessíveis e alvo mínimo (48). O avatar no header abre o drawer com perfil e recursos complementares. No Início, o centro do header mostra apenas o `BrandMark` original, com nome acessível. A criação de publicação usa um único FAB azul (56).

O tema é controlado em Configurações. O drawer mantém Eventos e Vagas. Comunidades não aparece nos acessos; o layout de rotas de comunidades redireciona para Explorar sem montar as consultas filhas.

### Buttons, inputs and choices

O botão compartilhado usa azul, texto `onPrimary` e opacidade de pressão (0.7). O secundário tem fundo transparente e borda. Ocupado ou desabilitado bloqueia a ação e reduz opacidade (0.5). Inputs têm superfície discreta, borda e cor de seleção azul. `Choice` usa abas horizontais, sublinhado azul e peso maior para a opção ativa.

### Feed, notifications and messages

Curtidas são alternadas por coração, usando a API existente de votos. O coração preenchido e a contagem usam `like` quando ativos; a operação preserva confirmação do servidor e recuperação em falha. Favoritos mantêm sua interação existente.

Notificações apresentam avatar quando há ator e ícone do tipo quando não há. Sem link, a linha pode usar o perfil do ator validado como destino. O avatar abre o perfil separadamente da ação da linha; sem ator, a mensagem não inventa uma pessoa. Estado não lido usa superfície discreta e indicador azul.

A busca de destinatário exclui a própria conta antes de calcular a lista vazia, incluindo buscas que só retornem o usuário atual. Conversas usam lista cronológica e consulta ativa a cada (5 s). Um envio pendente preserva conteúdo e `client_id` para a tentativa seguinte; a interface não transforma uma repetição em uma segunda mensagem.

### Lesson session

`LessonSession` e `LessonControls` organizam progresso real, pergunta, opções amplas e footer persistente. `LessonOption` usa seleção azul com marca de confirmação; `LessonButton` usa verde com `onSuccess`. Feedback combina texto, ícone e superfície de sucesso ou erro, com anúncio acessível. A dica aparece sob demanda.

Seleção, preenchimento, ordenação, associação, blocos, terminal e atividades de código permanecem disponíveis conforme o tipo da atividade. Testar casos públicos e enviar para avaliação continuam ações distintas. A tela de conclusão usa o robô existente, progresso confirmado e XP retornado pelo servidor; oferece voltar ao caminho e revisar a lição. Revisar reinicia a sessão de apresentação, preservando o progresso persistido pelo servidor.

### Exercise workspace and async states

O exercício mantém Enunciado, Código e Resultado. A ação principal do footer acompanha a etapa: começar desafio, enviar solução, revisar código ou continuar após aceitação. Testar casos públicos permanece uma ação secundária na área de código.

Listas oferecem skeleton, pull to refresh, paginação, vazio contextual e erro recuperável. A demonstração é uma escolha explícita, tem identificação permanente de dados ilustrativos, usa as mesmas telas e recusa escritas. Falha na API real não ativa demonstração automaticamente.

## Do's and Don'ts

### Do:

- **Do** usar `useTheme` e os tokens semânticos nas duas paletas.
- **Do** preservar o logo original, o robô existente e os rótulos acessíveis.
- **Do** manter uma próxima ação clara, feedback legível e avaliação no servidor.
- **Do** respeitar área segura, teclado, escala de fonte e redução de movimento.
- **Do** conferir os estados nativos em dispositivo antes de marcar a aparência como verificada.

### Don't:

- **Don't** criar progresso, XP, ator de notificação ou confirmação fictícios.
- **Don't** trocar ícones vetoriais por emojis ou substituir os ativos existentes.
- **Don't** reduzir fonte para acomodar código ou esconder o estado de erro.
- **Don't** ativar demonstração automaticamente quando a API falhar.

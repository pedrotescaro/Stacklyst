# Stacklyst mobile

Interface nativa para leitura, participação e estudo, com estrutura social inspirada no X e identidade própria do Stacklyst. A referência orienta navegação e densidade; marca, logo e conteúdo pertencem ao projeto.

## Navegação

Cinco destinos frequentes na barra inferior: Início, Explorar, Aprender, Notificações e Mensagens. Ícones Tabler de 26 unidades, peso ativo 2.5 e inativo 1.7. Cada destino recebe um nome acessível e área de toque de pelo menos 48 unidades. O avatar no header abre o drawer com perfil e recursos complementares. A criação de conteúdo usa um único FAB azul de 56 unidades.

## Superfícies e cor

Os tokens vivem em `src/theme.tsx`. O tema inicial é escuro e a preferência local permite claro ou sistema. Componentes obtêm cores por `useTheme`, sem um tema estático por tela.

| Papel                | Escuro    | Claro     |
| -------------------- | --------- | --------- |
| Fundo                | `#000000` | `#ffffff` |
| Superfície           | `#111316` | `#f7f9f9` |
| Superfície elevada   | `#1a1e23` | `#eff3f4` |
| Mensagem própria     | `#0b2b48` | `#e2f1ff` |
| Atividade concluída  | `#153c2b` | `#e4f5eb` |
| Texto                | `#f4f6f8` | `#0f1419` |
| Texto secundário     | `#9da7b3` | `#536471` |
| Ação principal       | `#0078d4` | `#0074c8` |
| Sobre ação principal | `#ffffff` | `#ffffff` |
| Divisória            | `#292d33` | `#cfd9de` |

O feed mantém fundo contínuo e linhas de espessura hairline. Avatares ficam à esquerda e o conteúdo à direita. Cartões são reservados a conteúdos que precisam de agrupamento, como trechos de código. Textos extensos e código preservam leitura e rolagem horizontal, sem reduzir a fonte para caber.

## Tipografia e espaço

Fonte nativa do sistema, acompanhando a escala do aparelho. Título 28/34, heading 20/27, corpo 16/24, secundário 14/21 e legenda 12/17. A escala de espaços é 4, 8, 12, 16, 24 e 32. Botões têm altura mínima de 48 e inputs de 52; botões de ação usam formato arredondado e contraste legível. O layout respeita os insets do sistema e o teclado.

## Interação e estados

Pressionar escurece a superfície ou reduz a opacidade. Drawer e transições usam movimento curto e respeitam a preferência de reduzir animações. Listas oferecem skeleton, pull to refresh, paginação, vazio com contexto e erro recuperável. Alterações de votos e favoritos confirmam o servidor e revertem o estado local se a operação falhar.

A demonstração é uma escolha explícita, com identificação permanente de dados ilustrativos. Usa as mesmas telas e recusa escritas, sem sessão ou progresso fictícios. Uma falha na API real nunca ativa a demonstração automaticamente.

# Distribuição das páginas no desktop

O conjunto inteiro de navegação, conteúdo e coluna direita fica centralizado a partir de 768 px. A sidebar encosta no conteúdo, sem uma margem automática entre as duas divisórias. A coluna direita preserva o padding dos seus painéis. A largura máxima limita a expansão em monitores grandes e no zoom reduzido.

| Viewport em CSS px | Navegação | Conteúdo disponível | Máximo do conjunto |
| ------------------ | --------- | ------------------- | ------------------ |
| 768–1279           | 76 px     | 720 px              | 796 px             |
| 1280–1535          | 250 px    | 1100 px             | 1350 px            |
| 1536 ou mais       | 265 px    | 1100 px             | 1365 px            |

Quando a viewport é menor, o conjunto encolhe à largura disponível. Conversas, configurações, avatar e detalhes do duelo usam `dd-platform-shell--workspace`, com até 1100 px de conteúdo também nas larguras intermediárias, para preservar os painéis lado a lado.

As dimensões pertencem a `src/app/globals.css`. Cada página usa `dd-platform-body` no wrapper ao lado da Sidebar e `dd-platform-main` na coluna que preenche o espaço restante. Um main que já é irmão direto da Sidebar pode usar ambas as classes. Os componentes não precisam de offsets horizontais fixos. O shell não recebe transform, filtro ou novo overflow que mude o comportamento de diálogos e elementos sticky.

O contrato está aplicado em Feed, Ranking, Perfil, Títulos, Notificações, Itens salvos, detalhe de publicação, Explorar, Comunidades e detalhe, Configurações, Conversas, Avatar, Duelos e detalhe, Trilhas e Mundinho. As páginas de administração, avaliações, eventos, vagas, candidatura de avaliador e recrutamento herdam o mesmo comportamento de `PlatformPageShell`. Os estados de carregamento das rotas que já tinham esse shell também compartilham suas dimensões. As interfaces públicas e as telas independentes de exercícios mantêm seus próprios layouts centralizados.

Todas as novas regras do frame começam em 768 px. As classes e regras de navegação móvel, safe areas, ferramentas e painéis abaixo desse breakpoint são preservadas.

## Verificação

A suíte completa passou com 1169 testes e 44 testes ignorados. ESLint terminou sem erros; os avisos existentes do projeto permanecem.

A conferência local usa componentes reais de Feed, `PlatformPageShell`, Perfil, Duelos, Trilhas, Explorar e Comunidades, além de uma reprodução dos wrappers de Conversas. As respostas de API nessa fixture são controladas. Isso valida distribuição e interação local, sem afirmar uma sessão autenticada em produção ou uma consulta real ao Spotify.

Foram conferidos 33 cenários de distribuição: oito superfícies em 390, 1024 e 1920 px, mais o Feed em 767, 768, 1279, 1280, 1440 e 1536 px e em viewports equivalentes a zoom de 75%, 65% e 125% de uma tela de 1920 px. Não houve vão entre sidebar e conteúdo, sobra interna após as colunas ou rolagem horizontal. As margens externas são medidas na largura efetiva do body, descontando a reserva da scrollbar. Nos cenários móveis, retirar as novas classes de frame não mudou a geometria dos elementos. A fixture foi removida após a conferência.

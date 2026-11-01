# Itens salvos

A página usa `PlatformPageShell`, compartilhando a largura da coluna principal e o rail direito com Notificações e Títulos. O cabeçalho acompanha a toolbar dessas páginas: título de 20 px/750 no desktop, voltar e busca com alvos de 44 px, contador e filtros com sublinhado azul. A lista tem borda única e divisórias internas, sem o card tracejado anterior no estado vazio. Menus dos posts não são recortados pelo contêiner.

Os filtros Todos, Código e Mídia usam o conteúdo real de cada publicação. A busca inclui texto, autor, linguagem e metadados musicais. Busca vazia ou filtros sem resultado oferecem uma ação para retornar à coleção. A ordem de salvamento é preservada.

`PostCard` é o único responsável pelo POST de bookmark nesta página. O callback apenas esconde ou restaura o item, mantendo sua posição e edições locais. A ação bloqueia cliques concorrentes enquanto há um pedido em andamento; o botão reflete o estado confirmado ou restaurado pelo componente pai. Isso evita a chamada duplicada que alternava o mesmo bookmark duas vezes.

Foram aprovados 35 testes de Itens salvos, PostCard, barra de ações, Notificações e Títulos. A regressão verifica uma única requisição ao remover, restauração da ordem após falha, recuperação visual do marcador, filtros, busca, foco e coleção vazia.

A conferência local no Chrome incluiu 1920 e 1440 px no desktop e 390 e 320 px em telas pequenas, nos temas claro e escuro. As referências reais de Notificações e Títulos foram renderizadas na mesma fixture para comparar largura e cabeçalho. Não houve rolagem horizontal ou vão após a sidebar. As respostas das APIs usadas na fixture foram controladas, incluindo falha e nova tentativa de remoção. A análise de acessibilidade dos controles novos não identificou violações; permanecem avisos dos componentes de conteúdo existentes sobre contraste e foco no código rolável.

A fixture temporária é removida antes do build e da publicação. Nenhuma alteração no layout global ou no aplicativo nativo faz parte desta revisão.

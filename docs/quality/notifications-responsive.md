# Notificações responsivas

Implementação de 30/10/2026 a partir da referência enviada: cabeçalho com voltar e lixeira azul, filtros horizontais e uma lista com avatar, nome personalizado, bandeiras, título, ação e horário. Cada linha permite excluir a própria notificação. A lixeira do cabeçalho confirma antes de excluir todas as categorias da conta.

`DELETE /api/notifications` e `DELETE /api/notifications/[id]` exigem autenticação e sempre limitam a operação ao usuário da sessão. A exclusão é persistente; marcar como lida continua sendo uma operação separada. O contador da navegação é atualizado após leitura ou exclusão.

A API inclui `avatar_config`, `source_type` e `resource_type` para apresentar a identidade e filtrar a atividade original sem alterar os tipos antigos usados por outros clientes. O título equipado “Iniciante” aparece sem ícone no componente compartilhado de identidade, inclusive com configurações salvas anteriormente. Os demais títulos mantêm seus ícones.

## Verificação

- 24 testes focados passaram: carregamento, identidade, filtros, exclusão individual, confirmação/cancelamento, exclusão de todas as categorias, falhas de rede, autenticação e regressões de respostas.
- 3 testes de integração passaram no PostgreSQL local dedicado: identidade, isolamento entre contas e persistência da exclusão após nova consulta. Dados sintéticos foram removidos ao final.
- A execução ampla de `vitest run src` encontrou 988 testes aprovados, 37 ignorados e uma expectativa antiga de botão no teste de respostas. Essa expectativa foi corrigida para verificar o link atual e validada novamente na execução focada.
- TypeScript, ESLint dos arquivos alterados (sem erros; um aviso existente sobre imagens de bandeiras), build de produção e smoke test do executor de código passaram.
- Fixture local com os componentes reais: 320, 390 e 1440 px, temas claro e escuro, nome longo, múltiplas bandeiras, confirmação e exclusão. Sem overflow horizontal da página; alvos de toque de pelo menos 44 px. Axe não encontrou violações WCAG A/AA nas áreas verificadas.
- Capturas e relatório local: `.impeccable/review/notifications/`. A navegação lateral da fixture é simulada; esta verificação não substitui um teste autenticado em produção ou em aparelho físico.

Não houve alteração de esquema nem necessidade de migração.

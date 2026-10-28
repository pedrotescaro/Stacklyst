# Ranking por período

Os períodos diário, semanal (segunda a domingo) e mensal usam o calendário de
America/Sao_Paulo. A API mantém a consulta acumulada quando `period` é omitido.

Ganhos e estornos são gravados na mesma transação do XP em buckets diários
`server-xp:YYYY-MM-DD:GLOBAL` e, quando aplicável, por linguagem na MobileState.
O XP antigo não tem datas confiáveis: o histórico temporal começa nesta atualização.
Não há redistribuição ou migração dos totais acumulados. Estornos afetam o dia em
que ocorreram; saldos negativos não aparecem como participantes premiados.

Os buckets são exclusivamente do servidor: a API de estado permite apenas chaves
de preferências e rascunhos; a tabela tem RLS sem política de escrita de clientes.
Novas fontes de XP devem usar recordPeriodXp dentro da transação da recompensa.

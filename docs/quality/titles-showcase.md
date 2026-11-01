# Coleção de títulos

A página `/achievements` usa a mesma estrutura das notificações: navegação compartilhada, coluna central e lateral de apoio no desktop. No celular, a coleção mantém cabeçalho compacto, filtros que cabem na tela e uma lista contínua com divisores. Cada título mostra selo, posse, descrição e uma caixa “Como obter”. Os selos reutilizam `ProfileTitle` com as cores reais do catálogo e contraste calculado; a página acompanha os temas claro e escuro.

As instruções são calculadas a partir da regra de cada título. Elas explicitam quantidades, mínimos de caracteres, repetição de conteúdo, destinatário dos comentários, limites diários, hashtags exatas e os períodos dos eventos. Os limites de contagem por dia usam UTC, como as consultas existentes. As datas de eventos e o título mensal indicam o horário de Brasília. Requisitos ausentes ou eventos indisponíveis são identificados, sem inventar uma forma alternativa de desbloqueio.

## Novos títulos

- **First of the Month:** um comentário ou resposta original, com pelo menos 12 caracteres, direcionado a outro membro, no dia 1 de qualquer mês em `America/Sao_Paulo`. O histórico também conta. Comentários próprios, curtos ou repetidos não qualificam.
- **Estrela:** uma postagem válida com a hashtag exata `#estrela`, em qualquer data.
- **Pastel:** uma postagem válida com a hashtag exata `#pastel`, em qualquer data.
- **Abóbora:** uma postagem válida com a hashtag do evento Halloween 2026 durante o período configurado.

Postagens válidas têm título de pelo menos quatro caracteres e corpo de pelo menos 40. Hashtags aceitam diferenças entre maiúsculas e minúsculas, mas não correspondências parciais como `#estrelaExtra`. Conteúdo repetido é deduplicado e o limite permanece cinco postagens por dia UTC.

Os novos IDs são acrescentados a catálogos antigos sem substituir entradas personalizadas ou remover conquistas já recebidas. O editor administrativo permite configurar os novos tipos de meta e a hashtag exigida. Não há alteração do schema do banco.

Equipar e retirar atualiza a versão de preferências devolvida pelo servidor, impede gravações concorrentes, informa conflitos e restaura o estado anterior quando necessário. A identidade compartilhada é atualizada após o salvamento.

## Verificação

A conferência do navegador cobriu 320, 390, 430, 768 e 1440 px, claro/escuro, ausência de rolagem horizontal, filtros, busca e duas gravações sucessivas com versões diferentes. A revisão visual independente aprovou a organização em relação às referências fornecidas.

O teste `src/services/__tests__/title-rules.postgres.test.ts` é opcional e usa `STACKLYST_TITLE_RULES_POSTGRES=1`. Ele verifica as consultas reais com dados sintéticos, fronteiras de meia-noite em Brasília, comentários históricos, exclusões e hashtags, sempre encerrando a transação com rollback. Nenhum usuário ou conteúdo de teste permanece no banco.

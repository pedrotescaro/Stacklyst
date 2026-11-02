# Baú diário da clareira

O baú concede 10 moedas uma vez por dia por jogador. A data vem do relógio do banco, no fuso `America/Sao_Paulo`. O resgate usa `chest:forest:AAAA-MM-DD`, a transação existente de saldo/extrato e o bloqueio da linha do jogador. Repetir o pedido retorna `awarded: false`, sem repetir o crédito. Um resgate antigo em `chest:forest:first` feito no mesmo dia também é respeitado.

O estado `chest` da API informa dia, disponibilidade e recompensa; pedidos de resgate também informam se houve um novo crédito. A interface só confirma moedas após essa resposta. O baú fica fechado antes do resgate, executa a abertura uma vez e permanece aberto naquele dia, inclusive ao voltar ao mapa ou recarregar. O refresh existente do Mundinho busca o novo dia a cada minuto e ao voltar à janela.

## Arte

- `scripts/lib/mundinho-chest-art.mjs`: pixel art original de madeira e latão, com oito quadros de 48 × 48 px, moeda e brilho transitórios.
- `node scripts/build-mundinho-props.mjs`: cria o documento editável e usa o LibreSprite para salvar/exportar os assets.
- `artifacts/mundinho/libresprite/props/chest.ase`: fonte editável com sombra, baú e efeitos em camadas.
- `public/assets/mundinho/chest.png`: atlas RGBA de 384 × 48 px usado pelo mapa.
- `chest-closed.png` e `chest-open.png`, na mesma pasta: estados estáticos extraídos sem redimensionamento do atlas exportado pelo LibreSprite.

A abertura usa CSS `steps(7)` por 700 ms, seguida da confirmação de saldo. Movimento reduzido mostra o estado final e a confirmação sem aguardar a animação. A animação não é repetida quando o resgate já ocorreu em outra sessão.

## Verificação local

Testes cobrem crédito, repetição, recarga, histórico limitado, transição do resgate antigo, meia-noite de Brasília, independência do check-in, falha de transporte e nova tentativa. A conferência em Chromium com o componente real do mapa e transporte simulado cobre desktop de 1280 px, celular de 390 px, avanço da animação, estado aberto, repetição, movimento reduzido e ausência de overflow/erros JavaScript. Essa conferência não comprova um resgate autenticado em produção.

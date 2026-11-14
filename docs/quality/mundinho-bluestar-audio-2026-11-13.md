# Áudio original do Blue Star RPG no Meu Mundinho

O arquivo fornecido pelo usuário, `BlueStar_RPG.zip`, contém `data.win`, `options.ini` e `rpg.exe`. A extração lê somente os dados do ZIP; não executa o jogo. O segundo arquivo fornecido, `Tutorial 3 - RPG (Mais recente) (1).rar`, contém sprites PNG e não contém áudio.

## Engenharia reversa e proveniência

O `data.win` usa um contêiner GameMaker `FORM`. A análise dos chunks encontrou 22 descrições em `SOND` e 22 amostras WAV PCM incorporadas em `AUDO`. Cada descrição de som tem o nome original e, no deslocamento `+32`, o índice da amostra em `AUDO`. Os nomes não foram inferidos pelo conteúdo sonoro.

O script `scripts/extract-bluestar-audio.py` verifica o envelope, os limites dos chunks, o grupo/índice da amostra e a assinatura WAV antes de converter os 13 recursos utilizados. A entrada `gml_Object_oGame_Create_0` referencia o som 17 (`musica_muito_balaco_baco`); os eventos do boss referenciam o som 19 (`boss_ta_legal`). A associação das faixas aos nomes originais também foi conferida diretamente em `SOND` → `AUDO`.

`public/assets/mundinho/audio/manifest.json` registra SHA-256 do ZIP, do `data.win`, do WAV original e do MP3 entregue, além de índice, offset, duração, canais e tamanho. O ZIP fornecido não contém arquivo de licença; o manifest registra proveniência, sem atribuir uma licença nova ao material.

Para reproduzir, na raiz do projeto, forneça um FFmpeg com demuxer WAV e encoder `libmp3lame`:

```powershell
python scripts/extract-bluestar-audio.py --source "C:\Users\PEDRO\Downloads\BlueStar_RPG.zip" --ffmpeg "CAMINHO\ffmpeg.exe"
```

As faixas usam MP3 de 128 kb/s e os efeitos de 96 kb/s, preservando canais e frequência de amostragem. São 2.567.669 bytes em 13 arquivos; os WAVs e o executável não são distribuídos com a aplicação.

## Aplicação no jogo

| Momento no Meu Mundinho      | Nome original              | Arquivo         | Duração original |
| ---------------------------- | -------------------------- | --------------- | ---------------- |
| Exploração e batalhas comuns | `musica_muito_balaco_baco` | `world.mp3`     | 102,701 s        |
| Guardião da Fenda            | `boss_ta_legal`            | `boss.mp3`      | 29,597 s         |
| Derrota                      | `game_over`                | `defeat.mp3`    | 24,059 s         |
| Início de confronto          | `Explosion17`              | `encounter.mp3` | 0,258 s          |
| Seleção / erro de ataque     | `Blip_Select35`            | `select.mp3`    | 0,115 s          |
| Ataque                       | `Laser_Shoot27`            | `attack.mp3`    | 0,431 s          |
| Acerto                       | `hit0`                     | `hit.mp3`       | 1,750 s          |
| Dano recebido                | `Hit_Hurt`                 | `hurt.mp3`      | 0,180 s          |
| Cura                         | `Powerup`                  | `heal.mp3`      | 0,275 s          |
| Vitória                      | `levelup`                  | `victory.mp3`   | 0,606 s          |
| Fuga / poupar o boss         | `Powerup33`                | `flee.mp3`      | 0,371 s          |
| Projéteis do boss            | `Laser_Shoot21`            | `volley.mp3`    | 0,240 s          |
| Conversa com o boss          | `voice1`                   | `talk.mp3`      | 0,365 s          |

A tabela descreve a adaptação dos efeitos aos eventos existentes do Meu Mundinho; não afirma que toda ação tem a mesma associação no jogo de origem. Seleção/erro e fuga/poupar compartilham amostras com volumes próprios.

`BattleAudio` substitui os osciladores sintéticos por amostras decodificadas em `AudioBuffer`. As músicas usam `AudioBufferSourceNode.loop`, com prioridade do boss e uma única faixa ativa. As amostras são carregadas somente depois de um gesto e ficam em cache na sessão; a música de derrota é carregada quando necessária. Falhas de download/decodificação não interrompem o jogo e a próxima interação pode tentar carregar a música novamente.

Silenciar, enviar o app para segundo plano e desmontar a tela cancelam fontes e pedidos pendentes de reprodução. Navegar para outra cena cancela a música longa de derrota, preservando os efeitos curtos da transição. Reiniciar uma luta também cancela a derrota anterior, mesmo quando a tela continua sendo `boss` ou `battle`.

O builder mobile incorpora os mesmos MP3 como dados locais. O decodificador transforma o base64 diretamente em bytes: a política `connect-src 'none'` do documento offline continua intacta.

## Validação

- Testes de ciclo de vida verificam desbloqueio por gesto, seleção das faixas, ausência de sobreposição, carregamentos fora de ordem, pausa/saída do boss, mute, segundo plano, descarte, transições, tentativas após falha e reinício após derrota.
- O teste dos recursos confere os hashes de todos os MP3 e a associação do boss ao som 19 / áudio 1 e do mundo ao som 17 / áudio 14.
- O navegador Chromium decodificou os MP3 reais e executou os componentes `World` e `VeilBoss`, incluindo mudança de faixa, mute, segundo plano e retorno ao mapa. Evidência: `artifacts/mundinho/rock-audio-repair/browser-check.json`.
- A validação local do documento mobile não equivale a teste de reprodução em aparelho Android/iOS.

# Refinamento do Mundinho

## Cabelos de frente e costas

Finalizadas as vistas baixo/cima dos seis penteados, acompanhando as laterais refinadas pelo proprietário. Bob com contorno arredondado, cachos com textura, corte curto afilado, pontas anime, cabelo longo com mechas e rabo lateral com curva e presilha. Os olhos continuam reservados para evitar sobreposição desigual. As laterais foram comparadas pixel por pixel com o atlas anterior: 36 variantes × duas direções × oito quadros permaneceram idênticas. O teste de sprites também verifica seis silhuetas traseiras distintas. Fonte `.ase` e PNG reexportados pelo LibreSprite; prévia em `artifacts/mundinho/hair-directions/four-directions.png`.

## Desafios compactos e objetos em pixel art

A janela de batalha usa a mesma largura e altura disponíveis do Mundinho, com regras compartilhadas de viewport e sem o limite anterior de 820 px. Arena e personagens recuperam uma escala maior; a área de desafios rola dentro da janela quando necessário. O editor mantém seis linhas iniciais e pode ser redimensionado. O tabuleiro usa casas de 76 px ou 64 px em contêiner estreito, com rolagem horizontal própria que acompanha o personagem.

Os objetos usam quinze sprites originais de 24 × 24 px: caminho, cristal, flor, lanterna, alavanca, rocha, baú, canteiro, bichinho, máquina, gaiola, fruto, muda, altar e conclusão. São exportados pelo LibreSprite a partir de `scripts/build-mundinho-challenge-sprites.mjs`, com fonte editável e manifesto em `artifacts/mundinho/libresprite/challenges/`. O HTML móvel incorpora o atlas `challenge-objects.png`.

Validação local: 18 testes de CodeBattle/AdventureHub, TypeScript e ESLint passaram. Fixture com componentes reais em Chrome nas larguras 1440/820/390/320 px, sem overflow horizontal da página ou erros JavaScript; execução de teste e replay conferidos. Capturas em `artifacts/mundinho/challenge-responsive/`. Dados sintéticos, sem sessão autenticada ou aparelho físico.

A revisão preserva os commits anteriores, o atlas original de criaturas e as regras de recompensas. Duelos volta à navegação principal, imediatamente após Trilhas; sai do menu Mais. O item da navegação inferior móvel permanece disponível.

## Roupas, rostos e franjas — 30/10/2026

Correção após revisão visual: os cabelos nos perfis laterais (esquerda e direita) foram refinados e concluídos individualmente, exportados pelo LibreSprite. A cobertura do couro cabeludo preenche continuamente as laterais da cabeça; os cabelos longos ganharam mechas fluidas descendo pelas costas ao longo do tronco com mecha frontal emoldurando o ombro; o rabo de cavalo lateral possui arco dinâmico com presilha dourada; o corte bob ganha contorno arredondado na mandíbula; cortes curtos e repicados receberam mechas, costeletas e mechas superiores dedicadas. A franja frontal preserva a visibilidade integral dos olhos e cílios sem sobreposição em todas as vistas (frente, direita e esquerda). Prévias ampliadas: `artifacts/mundinho/avatar-corrections/four-directions.png` e `side-profiles.png`. O cabelo frontal reserva a área completa dos dois olhos e cílios, eliminando a sobreposição desigual das mechas longas. As mangas de frente/costas agora ligam ombro, parte superior do braço e punho durante a caminhada. A checagem dos PNGs verifica todos os pixels dos olhos contra os 36 estilos/cores de cabelo e as mangas das 12 roupas nos oito quadros; as duas partes visíveis de cada mão permanecem descobertas na caminhada. A checagem da transparência das mãos admite a posição estendida do braço da arma durante o ataque. PNGs e fontes `.ase` reexportados pelo LibreSprite e HTML móvel atualizado.

O guarda-roupa passa de seis para doze peças: jaqueta de aventura, moletom, jaqueta tech, casaco florestal, suéter, traje dourado, bomber, jeans, cardigã, sobretudo, uniforme marinheiro e túnica. Cada peça tem detalhes próprios no sprite de caminhada/ataque e no retrato. Os índices antigos e as regras de aquisição das peças da loja foram preservados; a validação aceita as novas opções pelo tamanho do catálogo compartilhado.

As seis franjas foram redesenhadas individualmente. O corpo pequeno não contém mais cabelo ou sobrancelhas fixos por baixo da camada escolhida. Os rostos têm nariz e boca menores, olhos com brilho e contornos seletivos coloridos. A opção feminino/masculino agora também escolhe as feições do personagem no mapa, além do retrato. A anatomia original abaixo da cabeça, as nove paletas de pele, as mãos expostas e as cores de cabelo continuam compatíveis.

Fontes editáveis `.ase` e PNGs foram exportados pelo LibreSprite 1.3. O gerador dos retratos usa `scripts/lib/mundinho-portrait-art.mjs`; o gerador do personagem aceita `--characters-only` para conservar cenário e criaturas. Regeneração:

```sh
node scripts/refine-mundinho-sprites.mjs --characters-only
node scripts/build-mundinho-portraits.mjs
npm run test:mundinho-sprites
npm run mobile:build-mundinho
```

O teste de sprites verifica dimensões dos atlas, seis franjas distintas, feições dos dois gêneros e composição de 18 corpos × 12 roupas × 4 direções × 8 quadros. As verificações de interface cobrem escolha e salvamento da última roupa, validação de índices e endereçamento dos atlas. Catálogos e capturas do editor em 1440 e 390 px ficam em `artifacts/mundinho/avatar-refinement/`; comparação dos retratos em `artifacts/mundinho/portrait-refinement/`. As prévias são locais com dados sintéticos e não representam teste autenticado ou aparelho físico.

Validação: 37 testes relacionados passaram, assim como a checagem dos sprites, TypeScript web/mobile, ESLint e build de produção com smoke do executor. A fixture real de React/Chrome exibiu 24 combinações (doze roupas × dois gêneros) e o editor em desktop/celular, sem overflow horizontal nem erros JavaScript. O bundle offline mobile foi regenerado com os mesmos PNGs.

## Diálogos e retratos — 30/10/2026

A conversa com Ada usa uma barra preta na parte inferior, com nome, retrato próprio e três temas: combate, aparência e exploração. Cada escolha mostra a fala e o retrato do jogador antes da resposta de Ada. WASD/setas selecionam respostas, Enter/Espaço confirmam e Escape fecha. O movimento pausa durante o diálogo; fechar devolve o foco ao mapa. No celular, as respostas são botões de toque de pelo menos 44 px.

Os retratos originais de 96 × 112 px são desenhos independentes do avatar pequeno, exportados pelo LibreSprite. As 58 camadas cobrem duas silhuetas, nove peles, cinco olhos, seis roupas, seis penteados (frente e fundo) e seis acessórios, incluindo chapéu. A coloração de cabelo acompanha a paleta existente. Fontes editáveis e catálogo: `artifacts/mundinho/libresprite/portraits/`; regeneração: `node scripts/build-mundinho-portraits.mjs`. Ada tem aparência fixa, independente do jogador.

O editor exibe o retrato atualizado e permite selecionar Masculino/Feminino. O campo opcional `gender` é validado e salvo no JSON do avatar, preservando avatares antigos sem migração. A escolha define a silhueta do retrato; o corpo original de caminhada permanece preservado. Todas as peças existentes continuam compatíveis com ambas as silhuetas e mantêm suas regras de aquisição.

Verificação: 25 testes nos quatro arquivos de diálogo, mundo, AdventureHub e repositório; quatro testes de cor de cabelo também passaram. Build de produção e tipos mobile passaram. Chromium conferiu 1280/390/320 px, três opções, alternância de falas, teclado/toque, restauração de foco, salvamento da silhueta e assets incorporados no HTML mobile offline. Capturas e relatório em `artifacts/mundinho/dialogue/`. São fixtures sintéticas, sem afirmar teste autenticado ou aparelho físico. A revisão independente ficou indisponível por limite de uso; revisão visual local substituiu essa etapa.

## Interface pixel art e seleção de comandos — 30/10/2026

Os indicadores de nível no mapa e os painéis de vida da batalha usam molduras com cantos em degraus, preenchimento segmentado e tons de luz/sombra. `PixelMeter` mantém o valor numérico e a semântica de progresso acessíveis. Vida alta usa verde; até 50 PV usa âmbar, e até 25 PV usa vermelho. O bloqueio por nível continua explícito em texto, separado da vida da criatura. As regras e os valores recebidos do servidor permanecem iguais.

Textos da exploração e da batalha usam Pixelify Sans, incluindo os acentos em português. A fonte original e sua licença SIL OFL ficam em `public/assets/mundinho/pixelify-sans.ttf` e `LICENSE-Pixelify-Sans.txt`. Origem: [repositório oficial no Google Fonts](https://github.com/google/fonts/tree/main/ofl/pixelifysans). O bundle mobile incorpora a fonte em data URL e inclui a licença, sem depender de um serviço externo. Conteúdo de código continua monoespaçado.

No seletor de ações, WASD e as quatro setas movem o cursor entre Aplicar conceito, Depurar e Refatorar, com retorno circular nas pontas; Home/End escolhem a primeira/última opção. Enter ou Espaço confirmam. Apenas mover o cursor não envia uma ação. O foco retorna ao comando selecionado quando a pergunta termina. O jogo não intercepta atalhos nos demais controles, perguntas ou editores. Ações ficam desabilitadas durante o envio.

No celular, os comandos aparecem em linhas com alvos de toque grandes e descrições completas; tocar executa diretamente. A dica de teclado fica oculta no dispositivo de toque. O botão de saída passou a se chamar **Fugir**, preservando a validação no servidor, a animação e o retorno à posição anterior na clareira.

Validação local: 20 testes passaram, incluindo navegação circular, confirmação única, toque/clique, foco após a pergunta, valores acessíveis e fuga. Tipos mobile e build web passaram. Prévia sintética em Chromium conferiu desktop, 390 px, 320 px e o HTML offline mobile: fonte carregada, ausência de overflow/erros JS, navegação sem envio prematuro e retorno ao mapa. Capturas e relatório em `artifacts/mundinho/rpg-ui/`. Não representa sessão autenticada nem teste em aparelho físico.

## Casa, árvores, lago e flores — 30/10/2026

Os quatro grupos foram refeitos como pixel art original, salvos em documentos nativos com camadas e exportados pelo LibreSprite 1.3. As fontes estão em `artifacts/mundinho/libresprite/environment/`, com manifesto e metadados dos PNGs. Prancha ampliada: `artifacts/mundinho/environment-review.png`.

- `trees.ase` / `trees.png`: três copas assimétricas, galhos, tronco com veios, raízes e folhas com luz/sombra. Cada variante ocupa 176 × 160 pixels, com os pés na mesma posição do atlas anterior.
- `cabin.ase` / `cabin.png`: casa de 176 × 160 pixels com telhas individuais, chaminé, janela no telhado, fachada lateral, vigas, fundação de pedra, porta, janelas e floreiras.
- `pond.ase` / `pond.png`: lago de 208 × 200 pixels, com margem irregular, água rasa, pedras, juncos, reflexos e nenúfares.
- `flowers.ase` / `flowers.png`: seis variações em células de 32 × 32, distribuídas no gramado em pequenos grupos, evitando caminhos e obstáculos.

Casa e árvores continuam sendo objetos independentes em `forest-scenery.png`, ordenados pela posição dos pés. `geometry.json` permanece igual: troncos e paredes bloqueiam a passagem; copas e telhado permitem que o personagem passe por trás. A casa mantém profundidade 204 e a mesma origem. Lago e flores são compostos no terreno, e a ilustração de batalha recebe a mesma arte atualizada.

Regeneração completa do cenário:

```sh
node scripts/build-mundinho-props.mjs
node scripts/build-mundinho-environment.mjs
node scripts/refine-mundinho-sprites.mjs --scenery-only
node apps/mobile/scripts/build-mundinho.mjs
```

Validação: sete testes de exploração, ESLint, tipos mobile e build web com smoke de produção passaram. Prévia sintética em Chromium conferiu desktop, celular e paisagem sem overflow ou erros JS. Comparação de pixels com o avatar visível/oculto confirmou a oclusão atrás da árvore/casa e a presença do personagem à frente. São verificações locais; não incluem sessão autenticada ou aparelho físico.

## Baú, placa e vegetação — 30/10/2026

O mapa usa agora sprites PNG transparentes exportados pelo LibreSprite 1.3. O baú tem tampa arredondada, tábuas com veios, lateral em perspectiva, cintas e fechadura de metal. A placa tem poste, madeira entalhada, pregos e musgo; o desenho de um livro indica as dicas. Ambos têm canvas de 48 × 48 pixels. O antigo baú SVG e o ícone de conversa da placa deixaram de ser usados no cenário.

As seis moitas usam três variações de vegetação em células de 72 × 48 pixels. Os atlas `habitats-back.png` e `habitats-front.png` separam a parte traseira da folhagem que cobre os pés das criaturas. As duas partes acompanham a profundidade no mapa e permanecem visíveis quando a criatura se recolhe. O terreno não contém mais os blocos antigos de vegetação. A imagem composta das batalhas também recebe as novas moitas.

Fontes editáveis em `artifacts/mundinho/libresprite/props/`: `chest.ase` (sombra, madeira, ferragens), `signpost.ase` (sombra, madeira, entalhes/musgo) e `habitats.ase` (traseira/frente, três quadros de variações). São documentos nativos abertos e salvos pelo LibreSprite, que também exporta os PNGs e os metadados JSON. O manifesto registra dimensões, camadas e arquivos utilizados. Prancha ampliada: `artifacts/mundinho/props-review.png`.

Para regenerar, na ordem:

```sh
node scripts/build-mundinho-props.mjs
node scripts/refine-mundinho-sprites.mjs --scenery-only
node apps/mobile/scripts/build-mundinho.mjs
```

O primeiro comando aceita `LIBRESPRITE_BIN` para indicar outro executável. A opção `--scenery-only` do segundo comando conserva os atlas de personagens e criaturas. Os quatro PNGs novos são incorporados ao bundle offline compartilhado pelo WebView mobile.

Validação desta substituição: sete testes de exploração passaram, assim como tipos web/mobile, ESLint e build de produção com smoke do executor. A checagem de anatomia confirmou os corpos originais. Prévia isolada com dados sintéticos em Chromium (1280 × 900, 390 × 844 e 980 × 640) conferiu carregamento dos PNGs, profundidade das duas camadas, interação do baú e ausência de overflow/erros JS. O bundle gerado contém os quatro PNGs em data URLs. A verificação não inclui sessão autenticada nem aparelho físico.

## Sprites e LibreSprite

Execute `node scripts/refine-mundinho-sprites.mjs` na raiz. O script cria documentos animados `.ase` reais em `artifacts/mundinho/libresprite/refined/` e chama o LibreSprite instalado em `C:/Program Files/LibreSprite/libresprite.exe` para exportar os PNGs e metadados. Não são arquivos PNG apenas renomeados para ASE.

- `hero-body`, `hero-eyes`, `hero-outfit`, `hero-hair`, `hero-accessory`: oito quadros por direção, ordem baixo/direita/cima/esquerda, variantes agrupadas verticalmente. Camadas sincronizadas por CSS, com idle e caminhada.
- `hero-body-attack` e `hero-outfit-attack`: quadros de ataque, incluindo extensão do braço e lâmina.
- `creatures-animated`: deriva dos pixels do **atlas fornecido pelo usuário**, preservado em `public/assets/mundinho/creatures-atlas.png`. O componente agora consome os frames PNG exportados; o SVG antigo foi retirado.
- `forest-v2`: novo mapa 1024 × 768; clareiras conectadas, lago, cabana e seis habitats. O mesmo gerador emite `geometry.json` para manter obstáculos e cenário alinhados.

O avatar tem seis cortes e seis acessórios, mantendo nove tons de pele e seis cores de cabelo. Perfis laterais têm rosto estreito, um olho e nariz lateral; esquerda e direita possuem linhas próprias no atlas. A roupa cobre o tronco e elimina a faixa de sombra de pele sob a cabeça. A guia usa 40 × 40, igual ao jogador; criaturas usam 28 × 28 no mapa.

## Interação e combate

Controle analógico por Pointer Events, com zona morta, movimento proporcional, captura do ponteiro e interrupção em cancelamento/perda de foco. Teclado continua disponível. As criaturas permanecem nos seus habitats, emergem das moitas e se recolhem em ciclos; criaturas recolhidas não iniciam encontros. Há acesso direto às batalhas pela interface convencional.

Após resposta validada pelo servidor, o combate apresenta ataque, impacto/dano e contra-ataque sequenciais, além de vitória e derrota. A animação não determina dano, moedas ou XP. Respeita movimento reduzido. Não houve alteração na economia ou nas regras pedagógicas.

## Validação e limites

- Sete testes de regras e exploração: incluem conectividade de todos os encontros e objetos, bloqueio do lago/cabana e spawn válido.
- Prévia isolada com dados sintéticos em Chromium: desktop 1280 × 900 e celular 390 × 844, sem overflow horizontal ou erros de JavaScript. Capturas em `.impeccable/review/`; não representam sessão autenticada ou teste de aparelho físico.
- Bundle mobile usa os mesmos assets PNG, incorporados localmente, sem acesso a credenciais dentro do WebView. Regerar com `node apps/mobile/scripts/build-mundinho.mjs`.
- APK e validação em aparelho físico não fazem parte desta verificação. Arquivos de captura e prévia sintética não são rotas do produto.

Revisão visual local: corrigidos diálogo excessivamente alto e proporção do avatar; conferidos câmera, HUD, escala comum de guia/jogador e arena móvel. A documentação descreve os assets consumidos pelo runtime, não apenas exports de referência.

Validação final desta revisão: `npm run build` passou, incluindo o smoke de produção do executor; TypeScript web/mobile passou; ESLint não encontrou erros (permanece o aviso de `<img>` compartilhado pelo WebView); sete testes passaram. Simulação de ponteiro confirmou deslocamento de aproximadamente 40 unidades no analógico em ambos os tamanhos de viewport. Os testes visuais utilizam dados sintéticos e não comprovam o fluxo autenticado em produção.

## Correção da anatomia após revisão do usuário

O corpo alongado da primeira revisão foi descartado. `hero-body` passa a copiar os PNGs originais de `skins/` diretamente no quadro frontal base, incluindo paleta, contorno, cabeça, tronco e pernas. Perfis laterais são derivados das mesmas linhas de pixels, sem alongar o corpo. A roupa ocupa somente o tronco original (linhas 16–22), com pernas nas linhas 23–25. A prévia de corpo volta a mostrar a skin sem roupa ou cabelo.

`node scripts/check-mundinho-body.mjs` compara os nove corpos originais com os quadros base de idle e ataque, pixel por pixel, e verifica o espelhamento das laterais. Revisão ampliada: `artifacts/mundinho/restored-body-review.png`. Capturas desktop/mobile foram atualizadas com o corpo corrigido; continuam sendo uma prévia com dados sintéticos.
Ajuste de perfil conforme referência posterior do usuário: cabeça mantém a largura original, sem nariz saliente; apenas um olho, braço central com mão da skin visível através da roupa, tronco estreito e abertura da camiseta na borda frontal. Direções da prancha: frente, esquerda, costas, direita.

Correção das falhas de composição apontadas na revisão seguinte: mangas deixam de cobrir as mãos frontais/traseiras; braços da camada de pele acompanham o deslocamento da caminhada; tronco e quadril dos perfis permanecem preenchidos durante todos os quadros. O cabelo preenche os cantos e a coroa da cabeça, sem fragmentos soltos. `check-mundinho-body.mjs` verifica agora transparência da roupa e presença das mãos em nove skins × seis roupas × quatro direções × oito quadros, além da continuidade horizontal do tronco lateral. A verificação detectou e eliminou uma abertura no quadril durante o terceiro quadro da caminhada.

Publicação na main: a correção é compartilhada por todas as instâncias de `PixelAvatar`, incluindo guia, editor, loja e arena. O bundle mobile gerado passa a ser versionado para que uma instalação limpa receba os mesmos sprites; regenerar com `npm run mobile:build-mundinho`. A validação de anatomia também está disponível em `npm run test:mundinho-sprites` e incluída no CI. Build de produção com smoke do executor e tipos mobile passaram; 17 testes de Mundinho e navegação passaram. A execução geral revelou duas falhas em `src/services/__tests__/post-personalization.test.ts` (expectativas dos filtros de feed, em arquivos não alterados por esta revisão); a suíte completa não foi concluída. Não se declara CI remoto ou implantação validada.

## Fluxo de encontros e recuo

A preparação mantém apenas a escolha da linguagem. Criaturas são encontradas na clareira; a lista de níveis não é selecionável. No mapa, cada encontro mostra seu nível e uma barra de vida, com indicação de bloqueio quando o nível supera o do jogador. O servidor valida o nível a partir do XP persistido, mantendo as lições tradicionais livres desse bloqueio.

Recuar confirma a saída no servidor, anima o personagem correndo para fora da arena e retorna diretamente ao Meu Mundinho na posição anterior. Uma falha de rede mantém a arena e permite tentar novamente; repetir uma solicitação já concluída é idempotente e não concede recompensas. A seta de retorno da batalha segue o mesmo fluxo. Vitória/derrota apresentam somente o resultado, sem repetir o painel de preparação. Movimento reduzido pula a animação.

Validação: 14 testes de interface/regras/repositório, incluindo posição preservada, recuo duplicado, erro de rede e bloqueio por nível; tipos mobile e bundle atualizado. Prévia sintética de desktop 1280×900 e celular 390×844 confirmou animação, retorno, um único seletor de linguagem e ausência de overflow/erros JS. Capturas locais em `.impeccable/review/*-retreat-*.png` e `*-battle-preparation.png`.
O build de produção desta correção passou, incluindo o smoke do executor de código. A validação visual utiliza dados sintéticos; não representa teste autenticado em produção ou aparelho físico.

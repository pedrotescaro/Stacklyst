# Refinamento do Mundinho

A revisão preserva os commits anteriores, o atlas original de criaturas e as regras de recompensas. Duelos volta à navegação principal, imediatamente após Trilhas; sai do menu Mais. O item da navegação inferior móvel permanece disponível.

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

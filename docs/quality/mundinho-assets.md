# Assets do Meu Mundinho

Referência de composição: última imagem enviada pelo usuário (`codex-clipboard-b24b8d45-cd87-4478-949c-959eb60a2ea4.png`). A referência não foi recortada nem distribuída como asset do produto. Cenário, personagem e criaturas são originais; os logotipos das linguagens são marcas de terceiros distribuídas pelo Devicon.

## Produzidos

| ID | Origem / estratégia | Arquivo | Dimensões / formato / transparência | QA e desvios |
|---|---|---|---|---|
| floresta | Geração original por `image_gen`; cenário limpo, sem interface. Prompt literal em `mundinho-forest-prompt.txt` e no chunk `impeccable:prompt` do PNG. | `public/assets/mundinho/forest.png` | 1536 × 1024, PNG, opaco; 3,53 MB | `accepted`: aberto e inspecionado. Casa, clareira, trilha, árvores, água e baú preservam o papel visual da referência; composição original. Não contém texto ou chrome de interface. O arquivo merece orçamento de carregamento por seu tamanho. |
| atlas-avatar | Exportação da geometria autoral de `src/components/mundinho/PixelArt.tsx` por `scripts/generate-mundinho-atlas.mjs`; não usa sprites de jogos existentes. | `artifacts/mundinho/sprites/avatar-atlas.png` + `.json` | 168 × 128, PNG RGBA; 24 × 32 por célula; quatro direções × sete estados | `needs_parent_review`: transparência e posições verificadas visualmente. Estados: idle, dois passos, interação, ataque, dano e vitória. O atlas é um entregável exportado; a interface mantém a composição SVG em camadas. Os quadros de combate exportados ainda precisam ser vinculados à animação em runtime para serem considerados animações entregues no produto. |
| atlas-criaturas | Exportação da geometria autoral de `PixelCreature`, mesmo script acima. | `artifacts/mundinho/sprites/creatures-atlas.png` + `.json` | 144 × 24, PNG RGBA; seis células de 24 × 24 | `accepted` para exportação estática: seis criaturas visíveis e alpha correto. Não representa uma spritesheet animada de criaturas. |

O script pode ser executado na raiz com `node scripts/generate-mundinho-atlas.mjs`; usa `esbuild` instalado no app mobile e `sharp`/React do projeto. Depois de regenerar, executar novamente a incorporação de proveniência, pois a rasterização recria os arquivos.

## Diretos

| ID | Fonte verificada | Destino | Formato | QA |
|---|---|---|---|---|
| Python | `node_modules/devicon/icons/python/python-original.svg` | `public/assets/mundinho/python.svg` | SVG, viewBox nativo, transparente | `accepted`: cópia integral |
| JavaScript | `node_modules/devicon/icons/javascript/javascript-original.svg` | `public/assets/mundinho/js.svg` | SVG, viewBox nativo | `accepted`: cópia integral |
| TypeScript | `node_modules/devicon/icons/typescript/typescript-original.svg` | `public/assets/mundinho/ts.svg` | SVG, viewBox nativo | `accepted`: cópia integral |
| Rust | `node_modules/devicon/icons/rust/rust-original.svg` | `public/assets/mundinho/rust.svg` | SVG, viewBox nativo, transparente | `accepted`: cópia integral; a marca preta precisa de fundo claro no card escuro |
| Go | `node_modules/devicon/icons/go/go-original.svg` | `public/assets/mundinho/go.svg` | SVG, viewBox nativo, transparente | `accepted`: cópia integral |
| Java | `node_modules/devicon/icons/java/java-original.svg` | `public/assets/mundinho/java.svg` | SVG, viewBox nativo, transparente | `accepted`: cópia integral |

Licença Devicon copiada para `public/assets/mundinho/LICENSE-devicon.txt`. Não há logotipos de HTML/CSS nesta entrega porque os cards de trilhas atuais do pai enumeram Python, JavaScript, TypeScript, Rust, Go e Java. A presença dessas linguagens em batalhas não implica um curso novo.

## Semânticos

| ID | Implementação / responsabilidade | QA |
|---|---|---|
| avatar em camadas | `PixelAvatar`: SVG de retângulos em grade de 24 × 32, cores de pele/olhos/cabelo/roupas e acessórios parametrizados. CSS controla escala e animação. Posicionar sobre a floresta no banner, mapa, batalha e prévia do editor. Usar `image-rendering: pixelated` se os atlas forem consumidos. | `needs_parent_review`: a referência tem mais detalhe de personagem; vistas laterais atuais mudam principalmente rosto e espelhamento. |
| criaturas | `PixelCreature`: seis variações autorais em grade de 24 × 24. Cor, folhas, antenas e chama diferenciam os inimigos; SVG deve permanecer nítido em todas as escalas. | `accepted` para geometria; movimento de criaturas ainda é responsabilidade de runtime. |
| moeda | `Coin`: SVG dourado com duas faces concêntricas e marca angular própria, reaproveitado em saldo, preço e check-in. Quantidade permanece texto semântico. | `accepted` como vetor; não substitui a validação de saldo. |
| navegação e controles | Botões, títulos, rótulos, barras de progresso, cartas, bordas e arredondamentos continuam HTML/CSS. Ícones de ações vêm do sistema Lucide. Nenhum texto de interface deve ser queimado na floresta. | `needs_parent_review` no render final da interface. |
| colisões e tilemap | A floresta é um cenário único pintado. Camadas de colisões e entidades são dados de jogo separados. | `needs_parent_review`: este PNG não é um atlas de tiles do terreno. Não descrevê-lo como tilemap com assets individuais. |

## Ordem de execução

1. Gerar cenário original limpo (concluído pelo agente principal).
2. Incorporar prompt literal no cenário, copiar logotipos e licença (concluído).
3. Exportar atlas de personagem e criaturas a partir da geometria compartilhada e incorporar sua origem (concluído).
4. Integrar animações, avaliar colisões sobre o cenário e comparar screenshots de web/mobile com a composição pedida (responsabilidade do agente principal).

## Bloqueios e limites

Nenhum bloqueio de acesso a assets. Não foram gerados tiles individuais de cenário nem animações de criaturas. Atlas exportados não comprovam reprodução de todas as animações no runtime. O fundo de floresta tem 3,53 MB e deve ser carregado somente na superfície relevante. SVG de Rust requer contraste tratado no componente.

## Premissas e verificação

- As imagens de referência orientam a composição; não são assets finais e não foram copiadas para `public`.
- Cenário original: identidade visual própria, não cópia de Meow ou outro jogo.
- Interface e controles continuam semânticos; nenhum emoji substitui sprites.
- `embed-prompt.mjs --scan public/assets/mundinho artifacts/mundinho/sprites`: **3 rasters, 0 sem proveniência**.
- Floresta e ambos os atlas foram abertos localmente para inspeção visual. O manifest não certifica o layout final nem o comportamento do jogo.

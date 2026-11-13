# Mundinho: cabelos do mapa e três novos penteados — 13/11/2026

Os seis cabelos do personagem pequeno foram redesenhados para aproximar suas silhuetas dos retratos, com coroas, franjas, mechas e brilhos próprios nas quatro direções. O catálogo ganhou **Cachos volumosos (6)**, **Coques duplos (7)** e **Ondulado em camadas (8)**, com arte correspondente no retrato. Os índices 0–5 e as seis cores existentes permanecem compatíveis; não há migração de dados.

Os seis cabelos anteriores do retrato foram preservados: a comparação dos pixels dos primeiros 576 px de cada atlas de cabelo, frontal e traseiro, confirmou igualdade com a base anterior à expansão. Corpo, roupas, olhos, criaturas e cenário conservaram os seus atlas. A nova camada de ataque recompõe mão e espada acima do cabelo para manter o golpe legível com os penteados maiores.

## Fontes e contrato

| Parte | Fonte e resultado |
| --- | --- |
| Catálogo e escolhas salvas | `src/lib/mundinho/hairstyles.json`: nove nomes em português/inglês e índices estáveis; editor, renderizadores e validação do servidor usam a mesma contagem. |
| Cabelo do mapa | `scripts/lib/mundinho-world-hero-art.mjs`; `hero-hair.png` de 256 × 6912 px, com 54 variantes: nove cortes × seis cores, quatro direções e oito quadros por direção. |
| Cabelo do retrato | `scripts/lib/mundinho-portrait-art.mjs`; `portrait-hair.png` e `portrait-hair-back.png` de 864 × 112 px, com nove células de 96 × 112 px cada. |
| Mão e espada em primeiro plano | `scripts/lib/mundinho-world-body-art.mjs`; `hero-weapon-attack.png` com nove peles, quatro direções e oito poses de 32 × 32 px. `PixelAvatar` compõe essa camada por último somente durante o ataque. |

O construtor central `scripts/mundinho-sprites/build.mjs` registra o catálogo ampliado e a camada de arma. As fontes editáveis ficam nas famílias `refined/` e `portraits/` em `artifacts/mundinho/libresprite/`; a procedência é registrada em `artifacts/mundinho/sprite-build-manifest.json`. O bundle móvel foi regenerado com aproximadamente 2124 KiB.

## Evidência visual

Os arquivos em `artifacts/mundinho/hair-expansion/` são composições estáticas feitas com os PNGs reais de produção:

- `before-after.png`: seis cortes do mapa, antes em cima e depois embaixo.
- `world-portrait-catalog.png`: nove retratos e seus personagens nas quatro direções.
- `nine-hairstyles.png`: catálogo dos nove cabelos do mapa.
- `new-hair-combat.png`: os três novos cortes nas oito poses de ataque.

Essas imagens permitem inspecionar a arte e a composição das camadas; não são capturas do navegador.

## Verificação e limites

- A execução local relacionada ao Mundinho terminou com 209 testes aprovados e um ignorado. Os testes de componente cobrem as nove opções nomeadas, seleção e salvamento dos três novos cortes e recuperação da escolha após remontar o editor; testes do repositório cobrem persistência dos novos índices nas duas silhuetas.
- `npm run test:mundinho-sprites` passou: dimensões e transparência rígida dos atlas, olhos livres nas 54 variantes, distinção dos nove cortes nas quatro direções, espada nas oito poses de todas as peles e regressão de ombros nas 216 combinações de pele/roupa/silhueta.
- A checagem TypeScript do escopo de componentes e rotas afetados passou. ESLint não encontrou erros nesse escopo e manteve um aviso preexistente de imagem. A conferência de procedência identificou quatro atlas raster alterados, sem entradas ausentes. `npm run mobile:build-mundinho` passou.
- A revisão independente aprovou o escopo de arte e componentes sem achados materiais. Ela confirmou novamente os pixels dos seis cabelos anteriores do retrato e inspecionou os nove cortes nas quatro direções e os três novos cortes nas oito poses de ataque.
- O acesso ao navegador local pela ferramenta de controle não estava disponível nesta etapa. O fluxo autenticado, a interação visual no navegador, aparelho móvel e produção não foram validados. Os testes e composições acima não comprovam esses ambientes nem um build web completo.

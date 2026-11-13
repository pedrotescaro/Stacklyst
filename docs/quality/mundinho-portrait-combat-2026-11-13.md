# Mundinho: retratos, corpo e combate — 13/11/2026

Registro da implementação e das verificações locais sobre a base sincronizada em `a58a244`. A implantação em produção não foi validada.

## Aparência e interface

O busto de 96 × 112 px foi redesenhado conforme a referência anime: rosto curvo, olhos menores com brilho, cabelo orgânico e pescoço curto. O editor usa larguras de 192 px no desktop, 144 px até 600 px de viewport e 96 px até 380 px. A prévia giratória continua usando o componente do personagem pequeno; rotação e controles de silhueta passam à largura completa no celular.

O corpo de 32 × 32 px tem cabeça arredondada e tronco compacto. A composição conserva nove peles, doze roupas, seis penteados, cinco cores de olhos, seis opções de acessórios e duas silhuetas, com os índices existentes. Corpo e roupa têm oito poses de ataque, incluindo braço e espada. Os atlas atuais de criaturas, `forest-ground`, `forest-scenery` e habitats foram preservados iguais à base remota; não integram o diff desta tarefa.

## Fontes e regeneração

| Família | Desenho e gerador | Fonte editável e saída |
| --- | --- | --- |
| Retratos | `scripts/lib/mundinho-portrait-art.mjs`; acessórios em `scripts/build-mundinho-portraits.mjs` | `artifacts/mundinho/libresprite/portraits/portrait-*.ase`; `public/assets/mundinho/portrait-*.png` |
| Corpo, roupa, olhos e cabelo do mapa | `scripts/lib/mundinho-world-body-art.mjs`, `scripts/lib/mundinho-world-hero-art.mjs`; `scripts/refine-mundinho-sprites.mjs --characters-only` | `artifacts/mundinho/libresprite/refined/hero-*.ase`; camadas correspondentes em `public/assets/mundinho/hero-*.png` |
| Efeitos de combate | Arte original em `scripts/build-mundinho-combat-effects.mjs`, com o arco da espada informado pela referência de seis poses fornecida pelo proprietário | `artifacts/mundinho/libresprite/combat-effects/combat-effects.ase`; `public/assets/mundinho/combat-effects.png` |

O atlas de efeitos possui seis quadros de 64 × 64 px em cada uma de 27 linhas: nove famílias × preparação, impacto e cura. O contrato está em `src/lib/mundinho/combat-effects.json`: 350 ms na preparação, 450 ms no impacto/cura e quadro estático com movimento reduzido. `BattleEffects.tsx` seleciona a sequência; `battle-effects.css` troca os quadros discretamente. O herói usa oito quadros em 350 ms; as criaturas mantêm repouso nos quadros 0–3 e ataque nos quadros 4–7.

O construtor central `scripts/mundinho-sprites/build.mjs` encaminha herói e retratos aos geradores próprios; cenário, criaturas e acessórios do herói mantêm o pipeline atual em `artifacts/mundinho/libresprite-v2/`. Ele exporta pelo LibreSprite com perfil temporário de `APPDATA` e registra a origem em `artifacts/mundinho/sprite-build-manifest.json`. Instruções: `scripts/mundinho-sprites/README.md`.

```powershell
node scripts/mundinho-sprites/build.mjs --dry-run
node scripts/refine-mundinho-sprites.mjs --characters-only
node scripts/build-mundinho-portraits.mjs
node scripts/build-mundinho-combat-effects.mjs
npm run test:mundinho-sprites
npm run mobile:build-mundinho
```

## Falha ao carregar

A investigação reproduziu Prisma `P2028` após aproximadamente 20,6 s. `src/lib/mundinho/repository.ts` agora lê as contagens de aprendizagem antes de bloquear o jogador e mantém a conferência/crédito sob o bloqueio. A transação usa `maxWait` de 10 s e timeout de 30 s dentro do orçamento de 60 s da rota. `src/app/api/mundinho/route.ts` traduz `P2028` e falhas transitórias de conexão em resposta 503 `MUNDINHO_UNAVAILABLE`, com mensagem em português ou inglês. Essa resposta comunica indisponibilidade; não garante que o banco responderá no prazo.

Três leituras com jogador real concluíram em aproximadamente 22,6/5,3/5,0 s durante a investigação; todas as transações dessa verificação foram revertidas. Não houve migração de schema ou alteração persistida nos dados do jogador.

## Verificação e limites

- A execução local relacionada ao Mundinho terminou com 205 testes aprovados e um ignorado; o contrato de sprites passou.
- A checagem TypeScript das rotas/componentes afetados passou com configuração temporária. O `npm run typecheck` global continua com erros em arquivos temporários ignorados do Enade e tipos gerados antigos de desenvolvimento; esse resultado não equivale à aprovação global do projeto.
- ESLint não encontrou erros no escopo alterado e manteve um aviso preexistente de imagem. O bundle móvel de aproximadamente 2 MiB foi regenerado; não foi validado em aparelho.
- Capturas: `artifacts/mundinho/portrait-reference/editor-desktop.jpg`, `editor-mobile.jpg`, `battle-desktop.jpg` e `world-desktop.jpg`. São componentes reais montados em fixture com dados sintéticos de jogador. A captura móvel válida é a da viewport; a captura de página inteira apresentou corte à direita. O navegador integrado redirecionou a página autenticada para o login; as capturas não comprovam um fluxo autenticado completo.
- A inspeção do DOM confirmou `hero-swing` de 350 ms e a sequência PNG. O suporte a movimento reduzido foi conferido no código, sem emulação dessa preferência no navegador.
- A revisão independente aprovou o resultado no escopo de componentes/fixture, com os três achados anteriores resolvidos e sem novo achado material no corpo/combate. Isso não comprova build web completo, fluxo autenticado, aparelho físico ou produção.

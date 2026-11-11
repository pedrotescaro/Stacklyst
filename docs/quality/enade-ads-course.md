# Curso Enade de ADS

O caminho `/trails/enade` reúne as cinco edições de Tecnologia em Análise e Desenvolvimento de Sistemas publicadas no acervo do Inep: 2008, 2011, 2014, 2017 e 2021. Cada caderno tem 35 questões objetivas e cinco discursivas, totalizando 200 questões. O questionário de percepção da prova não integra o simulado.

## Fontes e fidelidade

- Acervo: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos
- Identidade oficial: https://www.gov.br/inep/pt-br/centrais-de-conteudo/identidade-visual/avaliacoes-e-exames-educacionais
- URLs individuais: `src/lib/enade/sources.json`.
- Cadernos completos, gabaritos definitivos e padrões de resposta: `public/enade/<ano>/`.
- As páginas são renderizadas integralmente em WebP, preservando figuras, tabelas, código e equações. Há ampliação, PDF original e texto extraído como auxílio de leitura. A extração não substitui a imagem, especialmente nas fontes especiais de 2017.
- Clicar ou tocar em “Abrir e ampliar” abre a imagem dentro de um visualizador em tela cheia, com zoom de 100% a 600% em relação à página ajustada. Há pinça, dois toques, roda do mouse, arraste, botões de zoom e ajuste à tela. O diálogo controla o foco e a rolagem da página; Escape ou Fechar devolvem o foco ao ponto de abertura. O teste local incluiu zoom e arraste no desktop e pinça via eventos de toque em Chromium com celular emulado.
- O logo é a primeira assinatura completa do PDF oficial de identidade Enade 2026, renderizada sem redesenhar ou alterar a marca.
- `scripts/import-enade.py` reconstrói páginas e catálogo a partir dos PDFs incluídos. Requer PyMuPDF e Pillow. O catálogo guarda SHA-256 dos três PDFs de cada edição. Os títulos com fontes não extraíveis de 2017 têm mapeamento de página explícito, conferido visualmente.

## Simulados e progresso

Cada edição pode ser iniciada livremente, com quatro horas, respostas objetivas e discursivas, marcação para revisão, retomada e revisão final. A correção objetiva usa os gabaritos definitivos: as anuladas ficam fora do denominador; as discursivas usam o padrão oficial para autoavaliação. A porcentagem de acertos é uma medida de estudo, não a nota oficial do Enade. O curso não concede XP a partir de respostas do cliente.

O progresso usa registros privados `MobileState`, chave `enade-ads-<ano>`, sempre associados à sessão autenticada. O endpoint valida edição, IDs e alternativas. O salvamento é agrupado e serializado, com cópia local por usuário para recuperar requisições interrompidas. Falhas de sincronização são apresentadas. Não há nova migração.

## Seletor de cursos

A abertura é por clique ou teclado, com Escape e clique externo para fechar. Não há temporizador de hover nem troca automática do lado de abertura ao alternar para Adicionar curso. A altura disponível limita a lista, que pode rolar. O Enade é um curso independente: não foi adicionado ao enum de linguagens de programação ou ao currículo de código.

## Verificação

Há testes para integridade das 200 questões, 15 PDFs, imagens e gabaritos; exclusão de anuladas na correção; isolamento por usuário e validação do endpoint; início, respostas, revisão, expiração e falhas de salvamento; e comportamento do seletor após mover o ponteiro. O fluxo visual foi exercitado em Chromium local, em desktop e celular, com APIs simuladas. Isso não constitui validação autenticada em produção.

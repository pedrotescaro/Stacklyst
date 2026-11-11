# Curso Enade de ADS

O caminho `/trails/enade` reúne as cinco edições de Tecnologia em Análise e Desenvolvimento de Sistemas publicadas no acervo do Inep: 2008, 2011, 2014, 2017 e 2021. Cada caderno tem 35 questões objetivas e cinco discursivas, totalizando 200 questões. O questionário de percepção da prova não integra o simulado.

## Fontes e fidelidade

- Acervo: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos
- Identidade oficial: https://www.gov.br/inep/pt-br/centrais-de-conteudo/identidade-visual/avaliacoes-e-exames-educacionais
- URLs individuais: `src/lib/enade/sources.json`.
- Cadernos completos, gabaritos definitivos e padrões de resposta: `public/enade/<ano>/`.
- As páginas completas e os recortes individuais das questões são renderizados em WebP, preservando figuras, tabelas, código e equações. Há ampliação, PDF original e texto extraído como auxílio de leitura. A extração não substitui a imagem para símbolos e diagramas.
- Clicar ou tocar em “Abrir e ampliar” abre a imagem dentro de um visualizador em tela cheia, com zoom de 100% a 600% em relação à página ajustada. Há pinça, dois toques, roda do mouse, arraste, botões de zoom e ajuste à tela. O diálogo controla o foco e a rolagem da página; Escape ou Fechar devolvem o foco ao ponto de abertura. O teste local incluiu zoom e arraste no desktop e pinça via eventos de toque em Chromium com celular emulado.
- O logo é a primeira assinatura completa do PDF oficial de identidade Enade 2026, renderizada sem redesenhar ou alterar a marca.
- `scripts/import-enade.py` reconstrói páginas e catálogo a partir dos PDFs incluídos. Requer PyMuPDF e Pillow. O catálogo guarda SHA-256 dos três PDFs de cada edição. Os títulos com fontes não extraíveis de 2017 têm mapeamento de página explícito, conferido visualmente.
- `scripts/import-enade-questions.py` produz `questions.json` e os recortes em `questions/` para todas as 200 questões, com as 875 alternativas das 175 objetivas. As fontes CID sem `ToUnicode` de 2014/2017 recebem um mapa Unicode apenas em memória, a partir de `scripts/enade-font-map.json`; os PDFs originais permanecem intactos. O mapa guarda correspondências de glifos, sem redistribuir arquivos de fonte. Os limites dos diagramas das alternativas de 2017/20 e 2021/15 e os cinco pequenos blocos de pseudocódigo de 2008/22 foram conferidos no original. Diagramas são apresentados como imagens ampliáveis, sem tentar substituí-los por uma descrição textual imprecisa.

## Simulados e progresso

A entrada `/trails/enade` conserva a navegação compartilhada, o conteúdo centralizado e uma divisória na extremidade direita da coluna. Iniciar, continuar ou revisar leva à rota autenticada `/trails/enade/<ano>`. Essa rota monta apenas a atividade: não contém a sidebar, o seletor de cursos nem o checklist lateral de 40 questões. Um seletor compacto navega entre as questões. A imagem da questão, a instrução do enunciado e as alternativas completas A–E aparecem em uma coluna contínua, sem abas Caderno/Respostas. O texto completo extraído pode ser expandido abaixo do enunciado. Os cartões de resposta seguem a linguagem visual das atividades de Trilhas, com destaque azul na seleção. Uma barra fixa no topo mostra a quantidade respondida e o cronômetro. Acertos, erros e gabarito aparecem apenas após finalizar ou expirar o prazo; os diagramas continuam ampliáveis na revisão. O link Todas as edições retorna à entrada. O cronômetro começa na atividade e preserva o prazo ao retomá-la, após recuperar o rascunho mais recente. A saída da atividade envia o último salvamento pendente.

Cada edição pode ser iniciada livremente, com quatro horas, respostas objetivas e discursivas, marcação para revisão, retomada e revisão final. A correção objetiva usa os gabaritos definitivos: as anuladas ficam fora do denominador; as discursivas usam o padrão oficial para autoavaliação. A porcentagem de acertos é uma medida de estudo, não a nota oficial do Enade. O curso não concede XP a partir de respostas do cliente.

O progresso usa registros privados `MobileState`, chave `enade-ads-<ano>`, sempre associados à sessão autenticada. O endpoint valida edição, IDs e alternativas. O salvamento é agrupado e serializado, com cópia local por usuário para recuperar requisições interrompidas. Falhas de sincronização são apresentadas. Não há nova migração.

## Seletor de cursos

A abertura é por clique ou teclado, com Escape e clique externo para fechar. Não há temporizador de hover nem troca automática do lado de abertura ao alternar para Adicionar curso. A altura disponível limita a lista, que pode rolar. O Enade é um curso independente: não foi adicionado ao enum de linguagens de programação ou ao currículo de código.

## Verificação

Há testes para integridade das 200 questões, 875 alternativas, 15 PDFs, imagens e gabaritos; exclusão de anuladas na correção; isolamento por usuário e validação do endpoint; início, respostas, revisão, expiração, recuperação de falha no carregamento e falhas de salvamento; ausência de correção antes de finalizar; progresso respondido; zoom dos diagramas na revisão; e comportamento do seletor após mover o ponteiro. O fluxo visual foi exercitado em Chromium local, em desktop e celular, com APIs simuladas, verificando a ordem imagem → enunciado → alternativas, seleção, progresso, zoom, retorno de foco, diagramas e ausência de rolagem horizontal. Isso não constitui validação autenticada em produção.

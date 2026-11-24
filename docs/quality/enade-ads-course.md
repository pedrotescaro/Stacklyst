# Central ENADE de ADS

O caminho `/trails/enade` reúne as cinco edições de Tecnologia em Análise e Desenvolvimento de Sistemas publicadas no acervo do Inep: 2008, 2011, 2014, 2017 e 2021. Cada caderno tem 35 questões objetivas e cinco discursivas, totalizando 200 questões. O questionário de percepção da prova não integra o simulado.

## Fontes e fidelidade

- Acervo: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos
- Identidade oficial: https://www.gov.br/inep/pt-br/centrais-de-conteudo/identidade-visual/avaliacoes-e-exames-educacionais
- URLs individuais: `src/lib/enade/sources.json`.
- Cadernos completos, gabaritos definitivos e padrões de resposta: `public/enade/<ano>/`.
- As páginas completas e os recortes individuais das questões preservam as figuras, tabelas, código e equações do caderno. A questão 24 de 2008 usa um redesenho vetorial conferido com o original. As alternativas ilustradas de 2014/29, 2017/20 e 2021/15 e o código de 2014/29 têm uma versão em resolução maior carregada ao ampliar. Execute `python scripts/import-enade-questions.py --image-details-only` para atualizar esses recortes. Há ampliação, PDF original e texto extraído como auxílio de leitura. A extração não substitui a imagem para símbolos e diagramas.
- Clicar ou tocar em “Abrir e ampliar” abre a imagem dentro de um visualizador em tela cheia, com zoom de 100% a 600% em relação à página ajustada. Há pinça, dois toques, roda do mouse, arraste, botões de zoom e ajuste à tela. O ajuste usa o espaço real do visualizador, e o botão PDF abre a página correspondente do caderno oficial. O diálogo controla o foco e a rolagem da página; Escape ou Fechar devolvem o foco ao ponto de abertura. O teste local incluiu zoom e arraste no desktop e pinça via eventos de toque em Chromium com celular emulado.
- O logo é a primeira assinatura completa do PDF oficial de identidade Enade 2026, renderizada sem redesenhar ou alterar a marca.
- `scripts/import-enade.py` reconstrói páginas e catálogo a partir dos PDFs incluídos. Requer PyMuPDF e Pillow. O catálogo guarda SHA-256 dos três PDFs de cada edição. Os títulos com fontes não extraíveis de 2017 têm mapeamento de página explícito, conferido visualmente.
- `scripts/import-enade-questions.py` produz `questions.json` e os recortes em `questions/` para todas as 200 questões, com as 875 alternativas das 175 objetivas. As fontes CID sem `ToUnicode` de 2014/2017 recebem um mapa Unicode apenas em memória, a partir de `scripts/enade-font-map.json`; os PDFs originais permanecem intactos. O mapa guarda correspondências de glifos, sem redistribuir arquivos de fonte. Os limites dos diagramas das alternativas de 2017/20 e 2021/15 e os cinco pequenos blocos de pseudocódigo de 2008/22 foram conferidos no original. Diagramas são apresentados como imagens ampliáveis, sem tentar substituí-los por uma descrição textual imprecisa.

## Central de estudos

A Central ENADE reúne nove seções em `/trails/enade`. A biblioteca tem artigos versionados em `content/enade`, com pesquisa, índice, modo resumo, miniquestionários e diagramas interativos. O banco reúne o acervo histórico de ADS e identifica os itens oficiais. Os miniquestionários da biblioteca são exercícios autorais.

### Simulados, histórico e evolução

- Em **Simulados**, escolha uma prova oficial ou personalize por edição, componente, quantidade, ordem, duração e modo. A prova padrão tem 40 questões e quatro horas. As URLs antigas por ano e de simulado personalizado redirecionam para a central.
- Cada tentativa tem um endereço em `/trails/enade/simulados/<id>`. As respostas, a ordem das alternativas, a questão atual, as marcações e o cronômetro são salvos. A pausa explícita interrompe o cronômetro.
- Em modo prova, a atividade exibe o gabarito após a finalização. Em treino, a escolha objetiva é corrigida assim que o estudante responde. Discursivas usam o padrão de resposta para autoavaliação.
- Em **Meu histórico**, abra o resultado de uma tentativa anterior, repita a prova ou pratique as questões que errou. Uma repetição cria uma tentativa independente.
- **Minha evolução** usa o histórico persistido e separa respostas totais de questões únicas. O **Caderno de erros** reúne respostas incorretas. A **Revisão inteligente** usa esses registros para agendar revisões e sugerir temas da biblioteca.

As notas do simulador medem o desempenho de estudo. A correção usa as letras canônicas do Inep mesmo com alternativas embaralhadas. Questões anuladas e discursivas ficam fora da correção objetiva automática. Os comentários de estudo são editoriais. Na questão 9 de 2017, a explicação registra a divergência na afirmação sobre desvio padrão e preserva a alternativa B do gabarito definitivo.

### Persistência e implantação

O backend associa tentativas, respostas, favoritos, progresso de leitura, atividade diária e revisão ao usuário autenticado. A migração Prisma `20261124120000_enade_study_center` cria seis tabelas privadas. O Supabase Data API fica sem acesso a essas tabelas. Em uma implantação, execute `npx prisma migrate deploy` no banco do ambiente antes de disponibilizar a versão que consulta o novo schema.

O primeiro acesso importa o progresso remoto das chaves antigas em `MobileState` uma única vez. Rascunhos antigos deste navegador são recuperados quando pertencem à conta autenticada. O frontend também preserva o rascunho local por tentativa para recuperar salvamentos interrompidos. O simulador não concede XP a partir das respostas.

## Manutenção da biblioteca

Inclua novos artigos Markdown na pasta da categoria correspondente. O cabeçalho do artigo define título, resumo, ordem, nível, tags, versão, data e relações com outros assuntos. `content/enade/categories.json` define as categorias. A biblioteca usa Markdown GFM, fórmulas KaTeX e diretivas para chamadas, exercícios, diagramas e referências a questões. Consulte `src/lib/enade/library/markdown.ts` para a sintaxe.

Use IDs do acervo em `src/lib/enade/question-topics.json` e `src/lib/enade/question-insights.json` para associar assuntos e comentários a questões oficiais. O gabarito continua no catálogo oficial. Os testes da biblioteca verificam a metodologia, as âncoras, as referências internas e os vínculos com o acervo.

## Verificação local

Execute `npm run typecheck`, `npm run lint`, `npm run build` e `npm run test -- --dir src`. Para executar o teste de integração da central, aponte `ENADE_TEST_DATABASE_URL` para um banco PostgreSQL local descartável que já tenha o schema e a migração ENADE.

# Qualidade documental — revisão de 05/09/2026

Este relatório substitui os resultados da entrega de agosto. Os testes de software estão descritos em `../REVISAO-2026-09-05.md`; qualidade documental não equivale à homologação da aplicação.

## Artefatos e renderização

| Documento | Páginas |
| --- | ---: |
| Visão | 6 |
| Atividades do negócio | 21 |
| Requisitos | 24 |
| Casos de uso e modelos técnicos | 53 |
| Total | 104 |

Os quatro DOCX foram gerados, tiveram campos e sumários atualizados no Microsoft Word e foram exportados para PDF. Como o runtime de documentos no Windows não disponibiliza LibreOffice, a conversão usou Word; a rasterização utilizou `render_docx.py` canônico com o PDF já convertido, via `tools/render_word_pdf.py`, a 110 DPI.

Evidências locais em `rendered-20260905/` e `contact-sheets-20260905/` (ignoradas pelo Git). Todas as páginas foram revisadas em folhas de contato, com ampliações pontuais. Foram conferidos cabeçalhos, rodapés, numeração, sumários, tabelas, imagens e diagramas. As tabelas de especificação de requisitos receberam fonte de 8,5 pt e passaram a manter suas linhas juntas, evitando continuação isolada em outra página. Matrizes longas repetem o cabeçalho ao continuar.

Não foram observados cortes de conteúdo, sobreposições ou páginas vazias indevidas na revisão. Diagramas extensos continuam mais confortáveis em SVG com zoom do que na impressão em retrato; as quatro vistas por área evitam comprimir todo o panorama de casos de uso numa página.

## Verificação estrutural

`tools/verify_stacklyst_docs.py` passou, verificando:

- Quatro DOCX e ausência dos placeholders legados proibidos.
- Presença de AN01–AN09, RF001–RF049, RNF001–RNF025, RN001–RN028 e UC001–UC029.
- 29 definições únicas no panorama e cobertura exata pelas quatro vistas derivadas.
- Direção das relações include/extend e das três generalizações de papéis.
- Existência das 18 fontes PlantUML e das 36 exportações PNG/SVG.

As fontes passaram pela renderização PlantUML; os nomes dos casos na especificação são derivados do panorama, evitando divergências de nomenclatura. O manifesto foi recalculado após a gravação final do Word. As versões anteriores dos documentos foram preservadas localmente em `before-20260905/`.

## Semântica e limites

`include` representa avaliação/execução requerida; `extend` representa ajuda solicitada e execução condicionada ao tipo da atividade. Setas de generalização apontam dos papéis especializados para Usuário autenticado. Autenticação é pré-condição, e não um include indiscriminado. Sistemas externos permanecem atores distintos.

Os 29 casos e suas relações foram comparados com os fluxos de código auditados. Isso não é certificação formal UML nem revisão de todas as rotas do produto. Foram mantidas distinções entre implementação, comportamento parcial e proposta futura, inclusive a lacuna de propriedade da empresa no POST de vagas.

As capturas da interface são históricas, de 22/08/2026, com data explícita nas legendas. Capturas ausentes e informações acadêmicas não fornecidas permanecem marcadas como pendentes; não foram criados protótipos fictícios para preencher esses espaços. O FigJam histórico não foi atualizado. Auditoria completa de acessibilidade documental e testes com leitor de tela não foram executados nesta revisão; os resultados antigos não são reaproveitados como atuais.

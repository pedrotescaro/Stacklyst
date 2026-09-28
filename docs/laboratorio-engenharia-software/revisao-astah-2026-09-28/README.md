# Revisão documental de 28 de setembro de 2026

A versão para entrega está em `entrega-final/`, com quatro documentos Word e `Stacklyst-revisado-atualizado.asta`. As demais pastas preservam fontes e etapas anteriores da revisão; os arquivos em `entrega`, `entrega-v2`, `pacote` e `pacote-v2` são históricos.

## Fontes

| Entregável | Fonte preservada |
| --- | --- |
| 01 — Visão | `../entregaveis/01-documento-de-visao-stacklyst-corrigido.docx` |
| 02 — Atividades | [Arquivo Word no Drive](https://docs.google.com/document/d/18wvWd3pw4vMWLNuKBCV_JKjqbq69zcX9/edit), atualizado em 28/09/2026 às 18:56 UTC; cópia em `fontes-drive/02-atividades-do-negocio-stacklyst-atualizado.docx` |
| 03 — Requisitos | `fontes-drive/03-requisitos-do-sistema-stacklyst-revisao-textual.docx` |
| 04 — Casos de uso | [Arquivo Word no Drive](https://docs.google.com/document/d/1f178dnzYzAJoQIUvMIGUaPiCOgk3S7Ba/edit), atualizado em 28/09/2026 às 19:20 UTC; cópia em `fontes-drive/04-casos-de-uso-stacklyst-atualizado.docx` |
| Astah | `Stacklyst-revisado-atualizado.asta`, fornecido pelo usuário; conteúdo binário preservado |

## Formatação

Foi mantido o modelo dos documentos, incluindo margens, cores, tabelas, conteúdo e diagramas. A família tipográfica foi uniformizada em Arial, com corpo de 11 pt, tabelas e legendas de 10 pt, títulos de seção de 18/14/12 pt e capa de 26/18 pt. Os sumários e a paginação foram atualizados no Microsoft Word.

O script `tools/format_documents.py` aplica a tipografia a uma cópia e verifica a preservação do texto e das imagens antes da atualização de campos. Os documentos 02 e 04 mantêm, respectivamente, 11 e 57 imagens. As datas técnicas e o conteúdo das fontes não foram reescritos nesta revisão de formatação.

Os sumários foram corrigidos para reconhecer os títulos no Word em português. Rótulos internos dos casos de uso mantêm sua hierarquia visual sem repetir “Fluxo Principal”, “Fluxos Alternativos” e imagens no índice. O espaçamento dos casos foi ajustado para evitar páginas com apenas uma linha; o panorama relacional foi redimensionado proporcionalmente para acomodar sua explicação.

## Conferência da entrega

| Documento | Páginas no Word | Tabelas | Imagens |
| --- | ---: | ---: | ---: |
| Visão | 10 | 10 | 0 |
| Atividades | 24 | 5 | 11 |
| Requisitos | 38 | 59 | 0 |
| Casos de uso | 97 | 24 | 57 |

Foram conferidos os textos das fontes, o conteúdo das tabelas, a integridade dos DOCX, os sumários e a presença de UC001 a UC056. As páginas foram exportadas pelo Word e rasterizadas para revisão de layout; a verificação geométrica não encontrou texto fora da área segura da página. Esta validação é documental, não uma nova homologação funcional do sistema.

SHA-256 do Astah recebido e publicado: `57907f5f26d52aa040aeca07ab00679785dd9e8757a3b6a0bcf2941aa8440c9f`.

O projeto Astah enviado é a fonte editável atual. As exportações PNG nas outras pastas pertencem às etapas anteriores, identificadas pelos respectivos diretórios; não foram reexportadas a partir do anexo atualizado.

Backups do editor, runtimes, ZIPs duplicados e imagens/PDFs temporários de conferência são ignorados pelo Git. Os arquivos locais permanecem disponíveis.

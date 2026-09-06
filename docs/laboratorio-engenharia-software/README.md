# Engenharia de software — Stacklyst

Revisão técnica de 05/09/2026, baseada no código do workspace. Distingue implementação, limites operacionais e propostas futuras; não representa homologação completa do produto.

## Documentos

- [Documento de visão](entregaveis/01-documento-de-visao-stacklyst.docx)
- [Atividades do negócio](entregaveis/02-atividades-do-negocio-stacklyst.docx)
- [Requisitos do sistema](entregaveis/03-requisitos-do-sistema-stacklyst.docx)
- [Casos de uso e modelos técnicos UML](entregaveis/04-casos-de-uso-stacklyst.docx)
- [Revisão técnica, catálogo e testes](REVISAO-2026-09-05.md)
- [Qualidade documental](qa/RELATORIO-QA.md)

São 9 atividades, 49 requisitos funcionais, 25 não funcionais, 28 regras de negócio e 29 casos de uso, incluindo dois comportamentos reutilizados de avaliação e execução. Dados acadêmicos não fornecidos permanecem explicitamente pendentes.

## UML editável

As fontes atuais são PlantUML em `diagramas/fontes/`. Há 18 diagramas em PNG e SVG: 9 atividades, 1 panorama de casos de uso, 4 vistas por área e 4 modelos técnicos (componentes, classes, estados e sequência).

- [Panorama — SVG para zoom](diagramas/imagens/casos-de-uso-stacklyst.svg)
- [Conta e aprendizado](diagramas/imagens/casos-aprendizado.svg)
- [Duelos e avaliação](diagramas/imagens/casos-duelos.svg)
- [Comunidade e administração](diagramas/imagens/casos-comunidade.svg)
- [Vagas e empresas](diagramas/imagens/casos-recrutamento.svg)

| Relação | Significado |
| --- | --- |
| Avaliador / Administrador / Recrutador → Usuário autenticado | Generalização: linha contínua e triângulo vazado voltado ao ator geral. Os papéis herdam suas participações. |
| UC006 → UC028 `«include»` | Resolver exercício exige avaliar a resposta. |
| UC010 → UC029 `«include»` | Submeter solução de duelo exige executar código e testes. |
| UC029 → UC028 `«extend»` | Execução ocorre no ponto “avaliar código”, quando a atividade exige código. |
| UC012 → UC006 `«extend»` | Ajuda ocorre no ponto “consultar ajuda”, sob solicitação e quando o modo permite. |

`include` aponta para o comportamento incluído; `extend` aponta para o caso base. Autenticação é pré-condição dos casos protegidos, não um include repetido em cada interação. Associações ator–caso não indicam sequência. Sistemas externos não são subclasses do usuário.

Os arquivos Mermaid anteriores e o [FigJam histórico](https://www.figma.com/board/kCKbpkIxJiQHmcprLH3Tfd) não foram atualizados nesta revisão e não são a fonte dos diagramas atuais.

## Reprodução

1. Executar `tools/split_use_cases.py` para derivar as quatro vistas do panorama.
2. Executar `tools/render_uml.ps1 -PlantUmlJar <jar> -Java <java>` para validar sintaxe e gerar PNG/SVG.
3. Executar `tools/build_stacklyst_docs.py` com Python, python-docx e Pillow. Usa templates convertidos quando disponíveis ou os documentos existentes como base de estilos. Antes de reconstruir, faça cópias de segurança dos entregáveis.
4. No Windows com Word, executar `tools/export_word.ps1` para atualizar sumários/paginação e exportar PDFs de QA. O runtime disponível não inclui LibreOffice; esta revisão utiliza Word para conversão.
5. Executar `tools/render_word_pdf.py --renderer <render_docx.py da skill documental> --output <diretório de PDFs>` com Poppler no PATH. Usa o renderizador canônico com conversão já realizada pelo Word.
6. Executar `tools/verify_stacklyst_docs.py` e revisar as páginas renderizadas. Após atualizar campos, recalcular o manifesto com `build_stacklyst_docs.write_manifest()`, sem reconstruir documentos.

Conteúdo em `build_stacklyst_docs.py` e correções versionadas em `current_baseline.py`. Os `.doc` originais não são alterados. O manifesto registra hashes das fontes e entregáveis.

## Evidências e limites

As capturas de interface incorporadas são de **22/08/2026**, com data nas legendas. Não comprovam validação visual em setembro. Os diagramas foram regenerados nesta revisão. Não houve publicação no FigJam nem deploy.

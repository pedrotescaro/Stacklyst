# Documentação acadêmica do Stacklyst

Este diretório reúne a documentação produzida para a disciplina de Laboratório de Engenharia de Software. Os quatro documentos oficiais foram preenchidos a partir dos templates fornecidos, preservando a organização acadêmica e marcando como pendente tudo o que não pôde ser confirmado no projeto ou no código.

## Entregáveis

- `entregaveis/01-documento-de-visao-stacklyst.docx`
- `entregaveis/02-atividades-do-negocio-stacklyst.docx`
- `entregaveis/03-requisitos-do-sistema-stacklyst.docx`
- `entregaveis/04-casos-de-uso-stacklyst.docx`

## Capturas atuais dos casos de uso

As capturas antigas do documento de casos de uso foram substituídas em 22/08/2026 por imagens das rotas internas autenticadas do localhost atual: perfil, trilhas, duelos, ranking e feed. As capturas foram realizadas sem publicar conteúdo, iniciar duelos ou alterar o progresso da conta utilizada para validação.

Os arquivos-fonte estão em `prototipos/atuais/`. A captura autenticada pode ser reproduzida com `tools/capture_authenticated_use_case_screenshots.cjs`, usando a credencial somente por variável de ambiente, e a atualização que preserva a estrutura existente do Word pode ser reproduzida com `tools/refresh_use_case_screenshots.py`.

Os documentos incluem sumário automático, cabeçalho, rodapé, numeração de páginas, tabelas formatadas, anotações de decisão e evidências de implementação. A autoria, a data acadêmica, os integrantes, o orçamento e as métricas não informadas continuam explicitamente pendentes.

## Diagramas

As nove atividades do negócio têm código Mermaid versionado em `diagramas/fontes/atividades/` e imagem PNG correspondente em `diagramas/imagens/`. O diagrama completo de casos de uso possui fonte PlantUML em `diagramas/fontes/casos-de-uso-stacklyst.puml` e imagem em `diagramas/imagens/casos-de-uso-stacklyst.png`.

Os diagramas de atividades também estão organizados no [quadro FigJam do Stacklyst](https://www.figma.com/board/kCKbpkIxJiQHmcprLH3Tfd).

## Correspondência com a programação

A documentação foi comparada com o repositório em 21 de agosto de 2026. Cada módulo relevante informa o estado encontrado e aponta arquivos, rotas, serviços ou modelos que servem como evidência. A revisão distingue:

- implementado no escopo auditado;
- implementado parcialmente;
- planejado ou sem evidência localizada;
- regra existente no código, mas ainda dependente de validação acadêmica ou da equipe.

Entre as pendências registradas estão recuperação de acesso, aplicativo mobile, push mobile, personalização persistente por IA, efeito competitivo completo dos duelos e a divergência entre o fallback atual do matchmaking e a regra proposta.

## Conteúdo rastreável

- 9 atividades do negócio: AN01 a AN09;
- 49 requisitos funcionais: RF001 a RF049;
- 25 requisitos não funcionais: RNF001 a RNF025;
- 28 regras de negócio: RN001 a RN028;
- 25 casos de uso: UC001 a UC025;
- matriz RF × RN;
- matriz de rastreabilidade geral AN × RF × RN × UC;
- revisão final de consistência com a programação.

## Regeneração e verificação

O gerador principal está em `tools/build_stacklyst_docs.py`. Ele usa cópias de trabalho dos templates convertidas para DOCX, monta o conteúdo, insere os diagramas e grava o manifesto de integridade. O script `tools/make_contact_sheets.py` cria folhas de contato para revisão visual e `tools/verify_stacklyst_docs.py` verifica os identificadores, os fontes dos diagramas, as imagens e a ausência de placeholders antigos.

No ambiente usado para esta entrega, a atualização dos campos de sumário e a exportação para PDF foram feitas pelo Microsoft Word. O relatório de revisão está em `qa/RELATORIO-QA.md`.

Os `.doc` originais não foram alterados nem copiados para o repositório. Seus hashes SHA-256 e os hashes dos resultados estão registrados em `manifesto-de-integridade.json`.

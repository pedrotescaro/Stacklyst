# Stacklyst — Documentação Final 0.1

Pasta consolidada com os documentos, diagramas, modelos Astah e apresentação do projeto **Stacklyst** para o Laboratório de Engenharia de Software (Fatec Ferraz de Vasconcelos).

Versão 0.1, revisada em 16/11/2026, baseada nos arquivos da [Pasta Stacklyst Final no Google Drive](https://drive.google.com/drive/u/0/folders/1RVgFqhpo9dRq8c5nGnyJWgv43hYKHu88).

O projeto Astah desta versão contém a revisão visual dos diagramas de sequência SQ01 a SQ13 e seus recortes, com ícones de Actor, Boundary, Control e Entity e nomes dos participantes sem os sufixos genéricos `Actor0` e `Class0/1/2`. As lifelines de banco de dados e repositórios usam Entity com modo Icon, conforme o padrão adotado nesta entrega. As mensagens, os fluxos e os demais tipos de diagramas foram preservados na revisão.

As figuras de sequência do documento 04 e as 16 imagens presentes em 14 slides da apresentação foram substituídas por exportações em alta resolução desse projeto Astah revisado, preservando os textos, as legendas e a diagramação dos arquivos.

Em 17/11/2026, o documento 04 recebeu uma revisão de consistência. Os casos de uso passaram a ser numerados de UC001 a UC026, sem lacunas, e a Figura 1 foi reexportada com essa numeração. Guildas, Mundinho e os objetivos complementares saíram do documento, junto com as linhas vazias das tabelas e as sequências SQ03, SQ05 e SQ06. Figuras e tabelas foram renumeradas, as tabelas ganharam legenda e fonte, e o sumário e o total de páginas no rodapé foram atualizados. O projeto Astah e a apresentação ainda usam a numeração antiga (UC001 a UC029, com lacunas).

Na mesma data, o documento 03 foi alinhado ao documento 04. O catálogo passou a ter 46 capacidades funcionais (F01 a F46, na ordem dos grupos), 15 propriedades de qualidade (Q01 a Q15) e 87 regras de negócio (R01 a R87), sem lacunas. Mensagens privadas, credenciais e inscrição em eventos saíram do catálogo, junto com as regras exclusivas delas e de Mundinho, quiz diário e importação editorial. As cinco capacidades usadas pelos casos de uso que faltavam voltaram ao documento: etapas especiais de trilha, itens salvos, envio de mídia, aceite de resposta e cliente mobile. As tabelas do documento 03 ganharam legenda e fonte. Os documentos 01, 02 e 04 foram atualizados para os novos identificadores F, Q, R e UC.

Os diagramas de classes e os DER do projeto Astah passaram a usar a notação em inglês: estereótipo «table», chaves {PK} e {FK} (sem {CP}, {CE} ou {FR}), o campo ID no lugar de "identificador" e os tipos String, Integer, Boolean, DateTime, Date, Enum e JSON. O diagrama geral de dez classes, que só existia como imagem do slide 14, foi incluído no projeto como CL-PRINCIPAL. Também foram corrigidos o atributo repetido da Candidatura e a nota do DER-CANDIDATURA, que passou a indicar 6 tabelas, e foram removidos elementos soltos. As 17 figuras das seções 6 e 7 do documento 04 e as imagens dos slides 14, 15, 23, 24, 30, 31, 40, 41, 49 e 50 foram trocadas pelas novas exportações. O `.asta.zip` continua sendo a cópia original do Google Drive.

---

## 📄 Arquivos da Entrega

| Arquivo | Formato | Descrição |
| :--- | :---: | :--- |
| [`01-documento-de-visao-stacklyst.docx`](01-documento-de-visao-stacklyst.docx) | Word | **Documento 01 — Documento de Visão**: objetivos, públicos, necessidades, escopo do sistema e critérios de sucesso. |
| [`02-atividades-do-negocio-stacklyst.docx`](02-atividades-do-negocio-stacklyst.docx) | Word | **Documento 02 — Atividades do Negócio**: processos humanos de estudo, prática, colaboração, avaliação, recrutamento e eventos, com diagramas de atividades e rastreabilidade. |
| [`03-requisitos-do-sistema-stacklyst.docx`](03-requisitos-do-sistema-stacklyst.docx) | Word | **Documento 03 — Requisitos do Sistema**: especificação detalhada de requisitos funcionais (F), qualidade/não funcionais (Q), regras de negócio (R), entradas, saídas e rastreabilidade. |
| [`04-casos-de-uso-stacklyst.docx`](04-casos-de-uso-stacklyst.docx) | Word | **Documento 04 — Especificação de Casos de Uso do Sistema**: especificação dos 26 casos da vista canônica *Caso de Uso Geral*, fluxos principais, alternativos, exceções e garantias. |
| [`Stacklyst-modelos-atualizados.asta`](Stacklyst-modelos-atualizados.asta) | Astah | **Projeto UML Nativo Astah — revisão 0.1**: modelos conceituais, classes, casos de uso e 23 diagramas de sequência, incluindo os recortes, com notação visual BCE revisada. |
| [`Stacklyst-modelos-atualizados.asta.zip`](Stacklyst-modelos-atualizados.asta.zip) | ZIP | Arquivo compactado original do projeto Astah disponibilizado no Google Drive. |
| [`Stacklyst-seminario-atualizado-2026-11-03.pptx`](Stacklyst-seminario-atualizado-2026-11-03.pptx) | PowerPoint | **Apresentação Atualizada do Seminário**: slides com visão, atividades, casos de uso, arquitetura e telas da plataforma. |
| [`leia-me-stacklyst.txt`](leia-me-stacklyst.txt) | Texto | Links oficiais do projeto (site em produção, repositório GitHub, documentação e esquema do Prisma). |

---

## 🔗 Links Oficiais do Projeto

- **Aplicação publicada**: [https://stacklyst.vercel.app/](https://stacklyst.vercel.app/)
- **Repositório GitHub**: [https://github.com/pedrotescaro/Stacklyst](https://github.com/pedrotescaro/Stacklyst)
- **Manual do sistema**: [docs/manual/README.md](../../manual/README.md)
- **Pasta geral de documentação**: [docs/](../../)
- **Esquema do banco de dados (Prisma)**: [prisma/schema.prisma](../../../prisma/schema.prisma)
- **Pasta de referência no Google Drive**: [Stacklyst Final](https://drive.google.com/drive/u/0/folders/1RVgFqhpo9dRq8c5nGnyJWgv43hYKHu88)

# Stacklyst — revisão para o seminário de 06/10/2026

## Arquivos para usar

- `Stacklyst-seminario.asta`: projeto nativo editável no Astah UML, com 56 diagramas (46 vistas do modelo e dez vistas de evidência para os slides).
- `apresentacao/Stacklyst-seminario-Astah.pptx`: apresentação corrigida com 38 slides e notas do apresentador.
- `apresentacao/Stacklyst-seminario-Astah.pdf`: PDF da mesma apresentação, exportado pelo PowerPoint.
- `documentos/`: quatro documentos em Word e PDF. Os documentos 02 e 04 concentram a revisão dos processos, casos de uso e classes.
- `diagramas/`: 56 imagens exportadas pelo próprio Astah.
- `codigo/`: dez capturas de trechos literais do código, com arquivo e números de linha.
- `RASTREABILIDADE.md`: associação entre casos de uso, código e operações das classes.

## O que foi revisado

Os sete diagramas de atividade descrevem processos humanos fora da plataforma, com responsáveis em raias: estudar programação, praticar exercícios, acompanhar a aprendizagem, buscar ajuda, divulgar uma oportunidade, acompanhar uma seleção e participar de eventos. Duelo e comunidade não aparecem como atividades de negócio.

As vistas de classes CL00 a CL12 incluem operações dos serviços e módulos que realmente as executam. Os objetos e módulos TypeScript estão identificados por estereótipos UML; as entidades do Prisma mantêm suas responsabilidades de dados. O DER usa tabelas representadas em notação UML e conserva PK, FK e relacionamentos no Astah.

Os 52 casos detalhados mantêm os identificadores do Astah: UC001–UC041 e UC046–UC056. UC042–UC045 (comunidades) saíram do escopo. UC057 foi retirado como objetivo iniciado manualmente: a notificação da candidatura é automática. Não há cadastro independente de intenção de vaga ou interesse em evento nos fluxos conferidos; o material usa UC022 (candidatura) e UC023 (inscrição ou cancelamento em evento).

A visão geral reúne 16 capacidades com o mapeamento para todos os casos detalhados. Criar evento pertence ao usuário autenticado, conforme a rota existente. Feed, publicações e mensagens permanecem no escopo.

## Roteiro sugerido

Slides 1–13: escopo, visão geral, quatro processos principais, classes e DER. Slides 14–23: caso de uso ao lado da captura do código responsável. Slide 24: relação entre processo, modelo e implementação. Slides 25–37: vistas complementares de classes e atividades para aprofundamento. Slide 38: referências.

As capturas foram feitas em um visualizador local do código, preservando o texto dos arquivos, caminho e números de linha. Não são capturas do editor do desenvolvedor. Os 33 slides com diagramas incorporam as imagens PNG exportadas pelo próprio Astah UML, sem redesenho, corte ou distorção. As vistas focadas ao lado do código também estão no projeto Astah, no pacote `06 Evidencias do seminario`. Os títulos e textos da apresentação permanecem editáveis; os diagramas são editáveis no arquivo `.asta`.

## Base e conferência

Código de referência: commit `9256a4f`, após atualizar o repositório. Orientações: documento da Profª Patrícia de 28/09/2026 e o livro UML 2 — Uma abordagem prática, de Gilleanes T. A. Guedes, fornecidos pelo usuário. O livro e as anotações de terceiros não foram redistribuídos no pacote.

O projeto Astah foi salvo e reaberto pela API oficial, e os diagramas foram exportados pela instalação local do Astah. Os quatro DOCX foram renderizados pelo Word para conferir paginação. A apresentação foi renderizada slide a slide e validada quanto ao pacote, geometria e fontes. Os bytes das 33 imagens de diagramas e das dez capturas de código incorporadas ao PPTX correspondem às imagens-fonte, conferidos por SHA-256. O PDF foi exportado pelo PowerPoint e tem 38 páginas. As dez capturas foram conferidas por SHA-256 contra os arquivos do repositório. Essas verificações validam os artefatos documentais; não constituem homologação funcional da aplicação.

O modelo anterior modificado localmente foi preservado. Os arquivos antigos da revisão de setembro são históricos; esta pasta é a entrega atual.

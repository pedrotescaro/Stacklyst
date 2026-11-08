# Stacklyst — documentação e modelos revisados

Revisão de 3 de novembro de 2026. Referência de UML: GUEDES, Gilleanes T. A. *UML 2: uma abordagem prática*. 3. ed. Novatec, 2018. O código e o schema do projeto fundamentam as regras da plataforma.

## Arquivos para leitura e apresentação

- [01 — Visão do sistema](entregaveis/01-documento-de-visao-atualizado.docx).
- [02 — Atividades do negócio aprovadas, preservadas](entregaveis/02-atividades-do-negocio-stacklyst-astah.docx).
- [03 — RF, RNF, regras, qualidade e matriz de rastreabilidade](entregaveis/03-requisitos-e-regras-atualizados.docx).
- [04 — Catálogo consolidado e modelos](entregaveis/04-casos-de-uso-e-modelos-atualizados.docx).
- [05 — Manual técnico e funcionamento da plataforma](entregaveis/05-manual-tecnico-da-plataforma.docx).
- [Apresentação revisada](entregaveis/Stacklyst-seminario-atualizado-2026-11-03.pptx).
- [Projeto nativo do Astah](Stacklyst-modelos-atualizados.asta).
- [Diagrama geral de casos de uso](entregaveis/UC-GERAL.png).
- [Documentação Markdown](../../manual/detalhado/README.md).

## Decisões da revisão

O catálogo tem **24 casos de uso**, todos presentes no diagrama geral. Os 53 recortes de implementação permanecem como cenários técnicos, sem aumentar essa contagem. A tabela de consolidação explica as operações reunidas e preserva os números acadêmicos dos casos mantidos.

As vistas de classes são conceituais: **8 classes na visão geral** e **4 a 6 por funcionalidade**, com atributos e operações resumidos. As vistas relacionais apresentam **10 tabelas na visão geral** e **4 ou 5 nas específicas**. O [dicionário do banco](../../manual/referencias/banco.md) conserva os campos e as relações do escopo funcional, com os identificadores reais da implementação. Os diagramas não substituem o schema.

Os diagramas usam nomes, atributos, operações, participantes, mensagens e condições em português. A [correspondência com o código](evidencias-codigo/correspondencia-modelos.json) conserva a ligação com os modelos e funções reais. Identificadores de código, linguagens, bibliotecas e produtos mantêm sua grafia original nos trechos e referências técnicas.

O diagrama geral inclui cadastro, login, include, extend e a herança de Avaliador, Recrutador e Administrador em relação a Usuário. Representações repetidas de um ator referenciam o mesmo elemento do modelo e evitam cruzamentos. O compartimento de pontos de extensão fica oculto; as condições estão na especificação. Login é pré-condição das ações protegidas e não impede cadastro, recuperação ou consulta pública autorizada.

O catálogo acadêmico exclui o Mundinho da visão geral por solicitação do grupo. Seu funcionamento e suas sequências técnicas permanecem no manual 05. A funcionalidade de comunidades/guilds retirada não integra o catálogo.

## Seminário

A ordem proposta mantém a continuidade: Pedro apresenta aprendizagem e visão geral; Guilherme publica a vaga; Paulo demonstra candidatura e movimentação. O plano reserva 55 minutos e 5 minutos de margem. Os slides 4–10 e o documento 02 preservam as atividades do negócio aprovadas.

Cada bloco relaciona protótipo, RF/RNF/RN, classes, dados, sequência completa, recortes de código e demonstração prática. As interfaces históricas de referência não comprovam homologação da versão em produção.

## Fontes e manutenção

O PDF de Guedes, o exemplo de matriz em Word e as duas imagens de qualidade fornecidos pelo grupo orientam notação e organização. O livro não é redistribuído neste pacote.

O arquivo Astah é editável no aplicativo instalado. As ferramentas de geração estão em tools; astah-plan.json registra os dados do modelo, e os scripts usam a API Java do Astah. A execução desses scripts exige o Astah licenciado e o mecanismo JavaScript indicado no ambiente de desenvolvimento. Abrir e editar o projeto não exige executar os geradores.

As referências de código do Markdown pressupõem a raiz do repositório Stacklyst. O pacote mantém as pastas docs e scripts para preservar os caminhos relativos. Após mudar regras, revise o catálogo, a matriz, a correspondência, os diagramas e os trechos de código.

## Verificação

As verificações documentais conferem os 24 casos na visão geral, herança, include/extend, integridade dos arquivos, referências, caracteres e correspondência dos recortes com o código. Word e PowerPoint fornecem a renderização para inspeção. O documento 02 é comparado por hash; os sete slides de atividades são comparados pixel a pixel.

Esta é uma revisão documental e de modelagem. Não executa migrations, seeds ou ações de aplicação e não equivale à homologação de todos os fluxos em produção.

# Manual técnico e funcional do Stacklyst

Referência do código local em 3 de novembro de 2026. Descreve implementação, não comprova publicação nem configuração de produção. Os capítulos explicam comportamentos; os inventários extraem estrutura do repositório, sem deduzir regras só pelo nome de uma função.

## Documentação aprofundada

A [edição detalhada de novembro](detalhado/README.md) reúne requisitos, regras de negócio, casos de uso, explicação da programação, recortes reais de código, DERs por domínio e sequências completas. Inclui um roteiro de apresentação baseado no material acadêmico fornecido.

## Roteiro de leitura

1. [Arquitetura e leitura do código](arquitetura.md).
2. [Trilhas, currículo, exercícios e progresso](trilhas.md), núcleo pedagógico do site.
3. [Mundinho, economia, criaturas e multiplayer](mundinho.md).
4. [Duelos e avaliação automática/humana](avaliacao.md).
5. [Página inicial, comunidade e recursos pessoais](comunidade.md).
6. [Vagas e recrutamento](recrutamento.md).
7. [Eventos e hackathons](eventos.md).
8. [Desenvolvimento, segurança e operação](operacao.md).

## Referências pesquisáveis

- [Arquivos, símbolos e dependências locais](referencias/README.md).
- [APIs e páginas](referencias/apis.md).
- [Banco: modelos, campos, relações e enums](referencias/banco.md).
- [Tecnologias, dependências, comandos e ambiente](referencias/tecnologias.md).

O escopo inclui web, aprendizagem, comunidade, administração e a integração mobile. Não pretende explicar linha a linha dependências de terceiros, arquivos gerados ou cada texto de aula. O catálogo permite localizar a maior parte do código de implementação; os capítulos aprofundam processos e decisões. Testes e relatórios antigos são evidências com data, não resultados automaticamente atuais.

Atualize o capítulo funcional quando mudar uma regra. Execute `node scripts/build-platform-reference.mjs` para renovar os inventários. Não substitua a revisão das regras por geração automática de listas.

Execute `node scripts/check-platform-docs.mjs` para conferir os destinos dos links locais. Os inventários são estruturais: os comentários transcritos pertencem aos autores do código e devem ser confrontados com a implementação quando houver divergência.

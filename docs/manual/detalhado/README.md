# Documentação completa do funcionamento e da programação

Base de leitura: código local do Stacklyst em **3 de novembro de 2026**, após a coleção editorial e as mudanças do PvP. Esta edição complementa o [manual por módulos](../README.md) e preserva as entregas acadêmicas anteriores. Não é uma declaração de homologação de todos os ambientes.

## Como usar

| Objetivo                                                  | Documento                                              |
| --------------------------------------------------------- | ------------------------------------------------------ |
| Entender o produto, os atores e a jornada                 | [Visão do sistema](visao-do-sistema.md)                |
| Conhecer funcionalidades, condições e restrições          | [Requisitos e regras](requisitos-e-regras.md)          |
| Entender profundamente o núcleo de aprendizagem           | [Programação das trilhas](trilhas-por-dentro.md)       |
| Entender economia, batalhas e multiplayer                 | [Programação do Mundinho](mundinho-por-dentro.md)      |
| Entender posts, identidade, ranking e recursos pessoais   | [Comunidade e configurações](comunidade-por-dentro.md) |
| Entender empresas, candidaturas, eventos e limites atuais | [Vagas e eventos](vagas-e-eventos.md)                  |
| Entender execução, julgamento e revisão humana            | [Avaliação e duelos](avaliacao-e-duelos.md)            |
| Entender sessão, permissões, falhas e operação            | [Contratos e operação](contratos-e-operacao.md)        |
| Aprender a ler e alterar a implementação                  | [Guia de programação](guia-de-programacao.md)          |
| Consultar os 24 objetivos e comportamentos reutilizados | [Catálogo acadêmico consolidado](catalogo-academico.md) |
| Acompanhar os recortes técnicos da implementação | [Cenários de implementação](casos-de-uso.md) |
| Relacionar RF, RNF, RN, casos e código | [Matriz de rastreabilidade](matriz-de-rastreabilidade.md) |
| Entender os critérios de modelagem | [Referência de Guedes](referencia-uml-guedes.md) |
| Consultar fatores de qualidade e sua verificação | [Qualidade do sistema](qualidade-do-sistema.md) |
| Visualizar responsabilidades e persistência               | [Modelagem](modelagem.md)                              |
| Acompanhar a comunicação entre camadas                    | [Sequências e código](sequencias.md)                   |
| Ler trechos extraídos da implementação, com contexto      | [Código comentado](codigo-comentado.md)                |
| Preparar a apresentação da disciplina                     | [Roteiro do seminário](seminario.md)                   |

Os capítulos explicativos são revisados manualmente. Casos de uso, recortes de código e DERs são materializados por [build-system-handbook.mjs](../../../scripts/build-system-handbook.mjs), a partir do catálogo editorial e do schema. Geração não substitui interpretação das regras.

## Abrangência e limites

Inclui página inicial, autenticação, trilhas, exercícios, credenciais, Mundinho, multiplayer, duelos, avaliadores, títulos, notificações, ranking, chat, itens salvos, perfis, relações sociais, vagas, recrutamento, eventos, hackathons, administração, aplicação mobile e dados editoriais.

O [inventário de implementação](../referencias/README.md) localiza arquivos e símbolos; o [dicionário do banco](../referencias/banco.md) apresenta os modelos, campos e enums; o [inventário de tecnologias](../referencias/tecnologias.md) registra dependências e comandos efetivos. Esses inventários evitam que um resumo narrativo esconda partes do código.

Há quatro níveis de afirmação:

1. **Implementado:** comportamento identificável na fonte indicada.
2. **Condicionado:** depende de provedor, credencial, configuração, rede ou migration no ambiente.
3. **Histórico:** registro de uma verificação ou entrega anterior, com data.
4. **Limitação:** capacidade que o modelo sugere, mas cujo fluxo completo não foi identificado.

Não se devem transformar nomes de telas, campos ou enums em funcionalidades supostamente prontas. Uma etapa “entrevista”, por exemplo, não implementa por si uma chamada de vídeo; um tipo “hackathon” não implementa sozinho submissões de repositórios e julgamento.

## Origem acadêmica

A fotografia da lousa e o texto fornecidos pelo usuário orientam a organização: atividade do negócio → casos de uso → interface e requisitos → classes/DER → sequência → código → demonstração. O texto contém também fragmentos de interface e uma resposta anterior de ferramenta; esses fragmentos não são requisitos do Stacklyst.

A [revisão acadêmica de novembro](../../laboratorio-engenharia-software/revisao-seminario-2026-11-03/README.md) reúne os documentos Word, a apresentação e o projeto nativo do Astah. Os 24 casos consolidados aparecem na visão geral; passos técnicos permanecem nos fluxos e nos cenários de implementação. As atividades do negócio aprovadas foram preservadas.

## Reprodução e manutenção

```sh
node scripts/build-platform-reference.mjs
node scripts/build-system-handbook.mjs
npx prettier --write docs/manual
node scripts/render-system-handbook.mjs
node scripts/check-system-handbook.mjs
node scripts/check-platform-docs.mjs
```

A renderização usa Puppeteer e uma versão fixada do Mermaid obtida por HTTPS; requer rede nessa etapa. Os SVGs e fontes já entregues podem ser lidos sem executar esse comando.

Após mudar uma regra, revise o capítulo, o caso de uso, a sequência, os recortes e os testes da implementação. Não reexecute seeds, migrations ou ações externas apenas para atualizar documentação.

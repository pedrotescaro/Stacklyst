# Diagrama de classes Stacklyst — revisão do arquivo enviado

O arquivo **Class Diagram Stacklyst - revisado.asta** é uma edição nativa no Astah do arquivo fornecido pelo usuário, preservando as dez classes e seus identificadores internos. A cópia **Class Diagram Stacklyst - original.asta** preserva o conteúdo recebido.

## Convenções

- Classes, atributos, métodos e parâmetros têm nomes em português. Os identificadores compostos usam camelCase: `responsavelId`, `nomeUsuario`, `criadoEm`.
- Atributos privados: `- nome: tipo`.
- Operações públicas: `+ nome(parametro: tipo): retorno`.
- Parâmetros são elementos UML nativos das operações; não estão concatenados ao nome do método.
- Tipos básicos em inglês: `string`, `int` e `boolean`. IDs são UUIDs representados por `string`, conforme o esquema Prisma.
- `void` indica ausência de retorno; `DateTime` representa data e hora; `List<T>` representa uma coleção tipada. Os nomes dos tipos de domínio permanecem em português, por exemplo `Evento` e `List<Mensagem>`.
- Situações e níveis aparecem como `string` nesta visão compacta. Seus valores continuam restritos pelas enumerações e validações do sistema; essa convenção do desenho não altera o banco ou o código.
- `1` representa exatamente uma instância e `0..*` representa zero ou várias. Associações mostram os vínculos principais da visão fornecida, sem transformar referências entre registros em herança ou composição.

Os tipos numéricos seguem os dados existentes: opções, pontuação, posição e total de pontos usam `int`. Tipos como `float`, `double`, `char`, `byte`, `long` e `short` são alternativas de implementação, sem necessidade de criar atributos artificiais para utilizá-los.

## Escopo dos métodos

As operações seguem a imagem solicitada e expressam responsabilidades da visão lógica do domínio. São 43 operações distribuídas entre Usuário, Empresa, Vaga, Candidatura, Publicação, Tentativa, Duelo, Evento, Inscrição e Mensagem. Não são uma transcrição de classes TypeScript: os registros Prisma são dados, e a implementação distribui comportamentos entre serviços, bibliotecas e rotas.

Exemplos de leitura:

```text
- responsavelId: string
- criadoEm: DateTime
+ atualizarPontuacao(pontos: int): void
+ avaliarResposta(): boolean
+ buscarPorId(id: string): Evento
+ consultarHistorico(usuarioId: string): List<Tentativa>
```

As caixas mantêm os três compartimentos UML: nome, atributos e operações. A disposição foi reorganizada para separar os ramos de eventos, tentativas, duelos, publicações, candidaturas, empresas e mensagens.

## Fontes e verificação

- Arquivo Astah enviado e imagem de referência do usuário.
- `prisma/schema.prisma`: tipos de IDs, contagens, campos e relacionamentos do sistema.
- `src/services/job.service.ts` e `src/services/event.service.ts`: contexto da distribuição de responsabilidades na implementação.
- GUEDES, Gilleanes T. A. *UML 2: uma abordagem prática*. 3. ed. São Paulo: Novatec, 2018, capítulo 4.

A imagem é exportada pelo próprio Astah a partir do arquivo revisado. A verificação reabre o modelo pela API oficial e confere nomes, tipos, parâmetros, quantidade de classes/operações e preservação dos identificadores das classes. O original recebido não é sobrescrito.

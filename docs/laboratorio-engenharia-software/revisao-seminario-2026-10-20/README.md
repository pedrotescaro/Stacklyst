# Seminário Stacklyst

Apresentação organizada conforme a lousa e as orientações da professora, com os três integrantes confirmados pelo grupo. A ordem proposta é Pedro, Guilherme e Paulo. O planejamento reserva 55 minutos e deixa cinco minutos de margem.

Abra o PowerPoint na pasta `apresentacao`. As notas de cada slide contêm o roteiro de fala, referências e preparação das demonstrações. O PDF permite consultar o material sem PowerPoint.

O projeto `Stacklyst-seminario-revisado.asta` conserva a base mais recente obtida no Drive. Para este seminário, abra o pacote **Seminário 20-10-2026 em português**, que contém os 22 diagramas novos. Os pacotes históricos ficam fora dele. Classes e MER usam nomes conceituais. O DER completo reúne as 47 entidades persistidas. As sequências incluem quatro fluxos completos e nove recortes relacionados ao código.

As seis atividades de negócio usam as sete imagens do documento 02, identificadas como AN01 a AN06, com AN05A e AN05B. A aba superior antiga foi recortada na apresentação, preservando o conteúdo dos fluxos.

O diagrama geral original do documento 04 tem 18 elipses. Seus rótulos históricos são explicados no slide e nas notas: a candidatura é UC022, a participação em evento é UC023 e o aviso ao candidato faz parte de UC026. O inventário escrito tem 56 especificações, uma contagem diferente da quantidade de elementos da vista geral.

Os protótipos foram aproveitados do documento 04, exceto o painel de candidaturas. Nesse caso, a imagem do documento não mostrava a funcionalidade. O substituto usa o componente atual e dados de demonstração, sem representar uma execução do backend.

As demonstrações foram roteirizadas a partir do código atual. O grupo deve preparar as contas, o progresso e a empresa antes do ensaio. A vaga é publicada no segundo bloco e consumida no terceiro. No painel atual, o recrutador altera a situação da candidatura. Etapa e feedback também são aceitos pela API, mas não são controles da tela demonstrada.

Os quatro DOCX fornecidos são incluídos como referência, sem alteração. A rastreabilidade dos slides e trechos de código está em `RASTREABILIDADE.md`.

No Astah, as chamadas de sequência são mensagens UML nativas. Os retornos tracejados foram posicionados como anotações editáveis, pois a API usada na exportação não permite ajustar a posição dos retornos nativos. Para editar a estrutura, use o pacote em português e confira a ordem visual das chamadas e retornos.

A análise posterior solicitada pelo grupo está em `analise-sistema/RELATORIO-DE-EVOLUCAO.md`, acompanhada das matrizes dos 49 RF e 25 RNF. Ela registra lacunas e prioridades do produto sem alterar a implementação.

Os quatro DOCX e o PowerPoint recebidos estão preservados em `fontes-originais/`. A capa usada no builder também fica nessa pasta. `validacao/` conserva os relatórios finais de integridade, geometria e rastreabilidade, além dos 51 slides renderizados no PowerPoint. As pastas de build, as dependências locais e os backups do editor não fazem parte da entrega versionada.

Os scripts em `tools/` documentam o processo de geração e inspeção. Eles utilizam a instalação local do Astah, PowerPoint, os runtimes de documentos e os caminhos registrados nos inventários. Para reproduzir em outra máquina, configure esses runtimes e atualize os caminhos absolutos das imagens nos inventários. Os arquivos finais já estão prontos para uso e não dependem de uma nova geração.

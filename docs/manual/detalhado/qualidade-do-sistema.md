# Qualidade do sistema e classificação dos requisitos não funcionais

Esta seção aplica as duas referências visuais fornecidas pelo grupo: a classificação de requisitos não funcionais em produto, organização e fatores externos; e a divisão dos fatores de McCall em operação, revisão e transição do produto. Elas complementam a referência de UML de Gilleanes Guedes. As imagens orientam a análise; não são evidência de que a plataforma já atingiu todos os critérios.

## Como ler requisitos de qualidade

Um RF informa a capacidade oferecida. Uma RN define uma política de decisão do domínio. Um RNF caracteriza a qualidade, uma restrição técnica ou uma condição de operação. A matriz conserva F, R e Q como IDs dessas três categorias. Por exemplo, submeter uma resposta é RF; creditar apenas a primeira conclusão elegível é RN; preservar esse limite sob pedidos concorrentes é RNF de integridade/confiabilidade.

O exemplo de matriz enviado pelo grupo usa termos de um sistema de cinema. Seus conteúdos não foram transferidos como requisitos da Stacklyst. Também se evita classificar qualquer ação de “controlar” ou “contar” automaticamente como RNF: a classificação depende do que a exigência especifica.

## Requisitos do produto

| Categoria da referência | RNF relacionados | Aplicação à Stacklyst | Evidência de aceitação |
| --- | --- | --- | --- |
| Usabilidade | Q04, Q12 | Navegação por teclado, foco, telas responsivas, feedback de espera, confirmação e erro | Percorrer uma jornada por teclado e verificar o resultado nos tamanhos suportados |
| Eficiência: desempenho | Q07 | Feed e histórico paginados, filtros de acesso antes da seleção, limites de consulta | Inspecionar consulta e cursor; medir com massa e ambiente definidos antes de prometer tempo máximo |
| Eficiência: espaço | Q07, Q09 | Evitar carregar histórico integral e conservar snapshots e IDs necessários | Verificar tamanho de resposta, limites de mídia e política de retenção aprovada |
| Dependabilidade | Q02, Q05, Q09 | Repetições, concorrência e falhas externas preservam estado e recompensas | Repetir submissão, simular indisponibilidade e executar teste concorrente com banco real |
| Segurança da informação | Q01, Q03, Q06 | Sessão e autorização por recurso; gabaritos e dados privados não aparecem em DTO público | Conferir respostas para proprietário, terceiro, recrutador, avaliador e administrador |

## Requisitos organizacionais

| Categoria da referência | RNF relacionados | Regra de trabalho documentada | Evidência |
| --- | --- | --- | --- |
| Desenvolvimento | Q08, Q10, Q11 | Contratos, schema, migrations e documentação permanecem rastreáveis à versão do código | Typecheck, testes pertinentes, revisão de mudança e conferência das referências |
| Operacionais | Q05, Q06, Q11 | Configurar serviços externos, diagnosticar falhas com código de erro e identificar dependências | Teste de configuração e indisponibilidade; logs sem credenciais ou conteúdo sensível indevido |
| Ambientais | Q04, Q11 | Registrar versões do runtime, navegadores e plataformas efetivamente suportados | Reproduzir a instalação com lockfile e verificar cada ambiente declarado |

## Requisitos externos

A referência também cita categorias regulatórias, éticas, legislativas, contábeis e de segurança. Não se deve preencher todas com afirmações inventadas. O documento identifica o que exige decisão do grupo e mantém a aceitação verificável.

| Categoria | Tratamento no projeto |
| --- | --- |
| Éticos | Distinguir conteúdo editorial de pessoas reais; tratar bloqueio, privacidade e revisão de soluções sem transformar uma suspeita em prova. Relaciona-se a Q03 e às regras de comunidade e avaliação. |
| Legislativos e regulatórios | Levantar obrigações aplicáveis aos dados e ao contexto de implantação com o responsável pelo projeto. Os controles Q01, Q03 e Q06 contribuem para proteção, mas não certificam conformidade integral. |
| Contábeis | As moedas do Mundinho são um recurso interno do jogo. A documentação não presume processamento de pagamento, escrituração contábil ou conversão em dinheiro. Confirmar qualquer mudança de escopo antes de criar requisitos dessa natureza. |
| Segurança física (safety) | A referência distingue segurança física de segurança da informação. Não foi identificado no escopo documentado um dispositivo de controle físico ou uma função de segurança crítica. A categoria permanece avaliada quanto à aplicabilidade. |

## Fatores de qualidade de McCall

| Dimensão da imagem | Fator | Relação com o sistema | RNF de apoio |
| --- | --- | --- | --- |
| Operação do produto | Correção | Resultado da avaliação e atualização de progresso correspondem ao contrato e ao estado confirmado | Q02, Q09 |
| Operação do produto | Confiabilidade | Falha do executor ou repetição de pedido não é apresentada como nova conclusão válida | Q02, Q05 |
| Operação do produto | Usabilidade | O usuário identifica a ação, o resultado e a forma de recuperar uma falha | Q04, Q12 |
| Operação do produto | Integridade | Acesso, autoria, participação, dados privados e recompensas são protegidos no servidor | Q01, Q02, Q03, Q06 |
| Operação do produto | Eficiência | Consultas e respostas são limitadas e o custo é medido em ambiente definido | Q07 |
| Revisão do produto | Manutenção | O responsável localiza contrato, implementação, regra e teste ao alterar um fluxo | Q08, Q10 |
| Revisão do produto | Flexibilidade | Alterações de catálogo e regra preservam histórico e têm impacto rastreável | Q08, Q09 |
| Revisão do produto | Testabilidade | Funções de política e serviços permitem verificar sucesso, alternativa, erro e concorrência | Q08, Q11 |
| Transição do produto | Portabilidade | Web e mobile têm ambientes e limites registrados e verificações próprias | Q04, Q11 |
| Transição do produto | Reutilização | Contratos e políticas do domínio são compartilháveis sem duplicar regras incompatíveis | Q08 |
| Transição do produto | Interoperabilidade | Banco, autenticação, executor e clientes trocam dados por contratos conhecidos | Q05, Q09, Q11 |

## Registro de verificação

Para cada Q, registrar cenário, ambiente, versão do código, entrada, resultado esperado, resultado observado e evidência. Marcar como atendido somente após verificar o critério. Metas numéricas de desempenho precisam informar carga, amostra e infraestrutura. Esta revisão verifica documentos e modelos; a existência de um requisito não substitui homologação funcional ou medição em produção.

## Referências fornecidas

- GUEDES, Gilleanes T. A. UML 2: uma abordagem prática. 3. ed. São Paulo: Novatec, 2018. Fundamentação da modelagem e documentação.
- Imagem “Tipos de requisitos não funcionais”, fornecida pelo grupo: classificação em produto, organização e fatores externos. A imagem não inclui referência bibliográfica completa.
- Imagem “Os Fatores da Qualidade de McCall (CHRISSIS, 2006)”, fornecida pelo grupo: dimensões e fatores transcritos na tabela acima. A indicação bibliográfica visível na imagem é preservada sem presumir título ou edição não informados.
- Documento “exemplo de matriz de rastreabilidade.docx”, fornecido pelo grupo: estrutura das seis colunas da matriz.

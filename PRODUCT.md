# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Desenvolvedores que querem aprender programação, praticar resolução de problemas, compartilhar conhecimento e demonstrar evolução técnica em uma experiência social e gamificada.

## Product Purpose

Stacklyst conecta aprendizado prático, comunidade e competição. O produto permite explorar conhecimentos, escrever código, comprovar soluções e transformar progresso técnico em uma jornada visível por meio de trilhas, XP, ofensivas, badges, ranking e duelos.

Na área de Trilhas, sucesso significa encontrar rapidamente uma habilidade relevante, entender suas tarefas e requisitos, praticar código e acompanhar o domínio adquirido sem depender de uma sequência linear obrigatória.

## Positioning

Stacklyst combina uma comunidade social para programadores com um mapa compartilhado de conhecimentos e exercícios avaliados. Trilhas são caminhos recomendados pelo mesmo grafo: dominar um conhecimento em um caminho preserva esse progresso nos demais caminhos que o reutilizam.

## Operating Context

- A experiência autenticada reúne Feed, Trilhas, Notificações, Ranking, Duelos, Bate-papo, Itens salvos e Perfil em uma navegação compartilhada.
- Trilhas permitem trocar o curso de linguagem, explorar setores de conhecimento, inspecionar tarefas em cada nó, iniciar exercícios e acompanhar XP, ofensiva, energia e joias.
- O mapa prioriza exploração em desktop e mantém uma experiência navegável em dispositivos móveis.
- Exercícios práticos diferenciam executar testes públicos de submeter uma solução avaliada com testes públicos e ocultos.

## Capabilities and Constraints

- O mapa de conhecimentos não deve voltar a uma cadeia linear obrigatória.
- Conhecimentos, pré-requisitos, caminhos recomendados, exercícios e progresso devem continuar representando dados reais do domínio.
- Nós disponíveis podem ser iniciados mesmo quando recomendações opcionais ainda não foram concluídas; requisitos obrigatórios devem permanecer explícitos e raros.
- Hover e foco de cada nó devem revelar as tarefas associadas.
- A sidebar compartilhada, sua ordem, posicionamento e modelo de interação são superfícies protegidas.
- O frontend não executa código do usuário com `eval` ou `new Function`; avaliação permanece atrás do serviço de execução.
- A interface usa ícones vetoriais do sistema existente, sem emojis como substitutos de ícones.

## Brand Commitments

- Nome do produto: Stacklyst.
- Identidade principal: base OLED escura, Electric Blue `#0083fe`, superfícies discretas e contraste adequado para sessões prolongadas de programação.
- A experiência deve equilibrar energia de gamificação com legibilidade operacional; cor comunica setores, estado e progresso, não decoração indiscriminada.
- Preservar o logo, o mascote existente, a sidebar principal e a linguagem visual compartilhada do produto.

## Evidence on Hand

- `README.md`: propósito, posicionamento, recursos e identidade visual declarados.
- `public/logo.png` e `public/assets/trails/devdeck-robot.png`: ativos existentes do produto e da experiência de Trilhas.
- `docs/architecture/stacklyst-knowledge-graph-prompt.md`: contrato funcional e visual do mapa de conhecimentos.
- `src/app/trails/TrailMap.tsx`, `src/app/trails/TrailsContent.tsx` e `src/app/trails/TrailResourceBar.tsx`: implementação atual da superfície.
- `src/components/Sidebar.tsx` e `src/app/globals.css`: navegação e tokens visuais compartilhados.
- Não há autorização para inventar depoimentos, métricas de adoção, resultados de aprendizagem ou parceiros.

## Product Principles

1. Explorar primeiro: conhecimentos e caminhos devem ser compreensíveis sem impor uma sequência artificial.
2. Praticar para provar: progresso relevante vem de escrever e avaliar código, não apenas selecionar respostas.
3. Progresso compartilhado: domínio pertence ao conhecimento e deve valer em todos os caminhos relacionados.
4. Gamificação com propósito: XP, ofensiva, energia e joias orientam consistência sem competir com a tarefa principal.
5. Densidade legível: o mapa pode ser amplo e rico, mas hierarquia, espaçamento e estados devem manter cada ação identificável.

## Accessibility & Inclusion

Preservar navegação por teclado, foco visível, rótulos acessíveis, contraste adequado, redução de movimento e uma alternativa móvel em lista para o mapa radial.

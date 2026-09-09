# Regras de avaliadores e duelos

Este documento é a referência funcional para candidatura de avaliadores e batalhas de código.

## Avaliadores de código

### Candidatura e aprovação

Para enviar uma candidatura, o perfil deve:

1. concluir integralmente ao menos uma trilha **ou** possuir no mínimo **1.000 XP**;
2. escrever uma motivação com pelo menos **80 caracteres**;
3. declarar ao menos uma tecnologia que exista nos duelos avaliáveis.

A aprovação não é uma promoção direta. Um administrador deve analisar uma candidatura pendente e
registrar uma justificativa com pelo menos 20 caracteres. O servidor reaplica a rubrica antes de
aprovar; a tela genérica de papéis não promove um usuário sem candidatura aprovada.

### Atuação, níveis e consequências

- A fila mostra apenas duelos das tecnologias aprovadas para aquele avaliador.
- Cada avaliação concluída concede **10 XP** e incrementa o contador de avaliações.
- Todo avaliador começa com reputação **100**.
- Nível **Iniciante**: padrão inicial.
- Nível **Confiável**: 10 avaliações e reputação mínima 80.
- Nível **Especialista**: 50 avaliações e reputação mínima 90.
- Advertência administrativa: menos 10 pontos, com justificativa obrigatória.
- Reputação de 60 a 79: perfil em observação (`PROBATION`).
- Reputação abaixo de 60: perfil suspenso e sem acesso a novas avaliações.
- Violações graves podem causar suspensão imediata ou revogação. A reintegração é uma ação
  administrativa justificada e restaura a reputação mínima para 80.

Administradores podem avaliar qualquer tecnologia. Participantes nunca podem avaliar o próprio
duelo.

Perfis de avaliador anteriores a esta política são migrados com TypeScript, JavaScript e Python
como especialidades iniciais para não interromper avaliações em andamento; o administrador pode
exigir uma nova candidatura para alterar esse escopo.

## Duelos de código

### Convite direto

- Um perfil pode desafiar outro pelo botão **Desafiar** no perfil.
- O convite fica pendente por **72 horas**.
- O desafiado pode aceitar ou recusar. Recusar ou ignorar um convite não reduz XP, não altera
  reputação e não aplica cooldown.
- Ao criar o convite, o desafiante pode optar por publicar o mesmo desafio na arena se as 72 horas
  terminarem sem aceite. Sem essa opção, o convite apenas expira.
- Quando publicado automaticamente, o duelo fica disponível na arena por **24 horas**.

### Batalha e abandono

- Depois do aceite ou da entrada de um oponente pela arena, ambos têm **2 horas** para enviar a
  solução.
- Vitória concede **50 XP** uma única vez; derrota não remove XP.
- Sem envios, o duelo fecha sem vencedor. Com apenas um envio elegível, esse participante vence.
- A sanção é por compromisso assumido e abandonado, não por convite não solicitado: cada ausência
  de solução após entrar em um duelo incrementa o contador de abandonos.
- No terceiro abandono consecutivo, o perfil recebe cooldown de **24 horas** para iniciar ou entrar
  em outro duelo. Enviar uma solução zera a sequência de abandonos.
- Empates técnicos seguem para um avaliador humano autorizado na tecnologia do duelo.

A manutenção horária expira convites, publica os desafios autorizados, resolve a espera da arena e
encerra duelos cujo prazo terminou.

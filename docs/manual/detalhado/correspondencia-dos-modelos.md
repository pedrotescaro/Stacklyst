# Correspondência dos modelos com a implementação

Os nomes em português são conceitos e responsabilidades do domínio. As operações conceituais não afirmam que exista uma função TypeScript com a mesma grafia. Esta tabela localiza os modelos e os contratos reais para a leitura do código.

| Classe no diagrama | Referência técnica |
| --- | --- |
| Usuário | User |
| Trilha | src/lib/learning |
| Lição | src/lib/learning/catalog.ts |
| Atividade | Quiz / Exercise |
| Tentativa | QuizAttempt / ExerciseSubmission |
| Credencial | LearningCredential |
| Duelo | Duel |
| Solução | DuelSubmission |
| Parecer | DuelEvaluation |
| Perfil de avaliador | EvaluatorProfile |
| Publicação | Post |
| Comentário | Answer |
| Perfil | User / ProfileCustomization |
| Empresa | Company |
| Vaga | Job |
| Etapa da seleção | JobRecruitmentStage |
| Candidatura | JobApplication |
| Evento | Event |
| Inscrição | EventParticipant |
| Desafio de evento | EventChallenge |
| Mensagem | Message |
| Notificação | Notification |
| Preferência | User metadata / MobileState |

## Tabelas relacionais

| Nome em português | Modelo Prisma |
| --- | --- |
| Usuário | User |
| Progresso da linguagem | LanguageTrail |
| Atividade | Quiz |
| Tentativa | QuizAttempt |
| Credencial | LearningCredential |
| Publicação | Post |
| Comentário | Answer |
| Mensagem | Message |
| Notificação | Notification |
| Empresa | Company |
| Vaga | Job |
| Etapa da seleção | JobRecruitmentStage |
| Candidatura | JobApplication |
| Duelo | Duel |
| Solução enviada | DuelSubmission |
| Parecer | DuelEvaluation |
| Perfil de avaliador | EvaluatorProfile |
| Evento | Event |
| Inscrição | EventParticipant |
| Desafio de evento | EventChallenge |
| Personalização | ProfileCustomization |
| Título conquistado | UserProfileAchievement |
| Título disponível | ProfileAchievementCatalog |

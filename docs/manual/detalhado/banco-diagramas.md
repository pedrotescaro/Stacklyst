# DER geral e visões por domínio

[Índice](README.md). Gerado por [scripts/build-system-handbook.mjs](../../../scripts/build-system-handbook.mjs). Base de código: `6a2bfce`. Comentários explicativos são editoriais; os trechos e modelos vêm dos arquivos indicados.

Visões do domínio funcional atual derivadas de `prisma/schema.prisma`, sem consultar registros nem afirmar migrations aplicadas. Estruturas residuais fora do escopo atual não são apresentadas como funcionalidades; o schema é a fonte do inventário físico completo. Cada vínculo é extraído do lado que declara `@relation(fields: ..., references: ...)`. A vista geral mostra entidades/chaves; as vistas específicas incluem campos escalares selecionados. O dicionário completo de campos/enums está em [referências do banco](../referencias/banco.md). Listas/JSON são atributos, não tabelas implícitas.

## geral

[Fonte Mermaid](diagramas/der-geral.mmd). 59 entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.

```text
erDiagram
  User {
    String id PK
  }
  UserBlock {
    String blockerId PK
    String blockedId PK
  }
  RpgPlayer {
    String userId PK
  }
  RpgTransaction {
    String id PK
    String userId FK
  }
  RpgBattle {
    String id PK
    String userId FK
  }
  RpgArenaRoom {
    String id PK
    String hostId FK
    String guestId FK
    String inviteeId FK
  }
  ProfileCustomization {
    String userId PK
  }
  ProfileAchievementCatalog {
    String id PK
  }
  UserProfileAchievement {
    String userId PK
    String achievementId PK
  }
  LearningCredential {
    String id PK
    String userId FK
  }
  EvaluatorApplication {
    String id PK
    String user_id FK
  }
  EvaluatorProfile {
    String id PK
    String user_id FK
  }
  Company {
    String id PK
    String owner_id FK
  }
  Job {
    String id PK
    String company_id FK
  }
  JobRecruitmentStage {
    String id PK
    String job_id FK
  }
  JobApplication {
    String id PK
    String job_id FK
    String user_id FK
    String stage_id FK
  }
  LanguageTrail {
    String id PK
    String user_id FK
  }
  KnowledgeNode {
    String id PK
  }
  KnowledgeEdge {
    String id PK
    String source_node_id FK
    String target_node_id FK
  }
  LearningPath {
    String id PK
  }
  LearningPathNode {
    String id PK
    String learning_path_id FK
    String knowledge_node_id FK
  }
  Exercise {
    String id PK
    String knowledge_node_id FK
  }
  ExerciseTestCase {
    String id PK
    String exercise_id FK
  }
  UserNodeProgress {
    String id PK
    String user_id FK
    String knowledge_node_id FK
  }
  ExerciseRun {
    String id PK
    String exercise_id FK
    String user_id FK
  }
  ExerciseSubmission {
    String id PK
    String exercise_id FK
    String user_id FK
  }
  LearningEvent {
    String id PK
    String user_id FK
    String exercise_id FK
  }
  Post {
    String id PK
    String author_id FK
  }
  PostMedia {
    String id PK
    String owner_id FK
    String post_id FK
  }
  PostPoll {
    String id PK
    String post_id FK
  }
  PostPollOption {
    String id PK
    String poll_id FK
  }
  PostPollVote {
    String id PK
    String poll_id FK
    String option_id FK
    String user_id FK
  }
  Answer {
    String id PK
    String post_id FK
    String author_id FK
    String parent_id FK
  }
  Quiz {
    String id PK
    String post_id FK
  }
  QuizAttempt {
    String id PK
    String user_id FK
    String quiz_id FK
  }
  DuelRequest {
    String id PK
    String sender_id FK
    String receiver_id FK
    String published_duel_id FK
  }
  Duel {
    String id PK
    String challenger_id FK
    String opponent_id FK
    String winner_id FK
  }
  DuelSolution {
    String id PK
    String duel_id FK
    String user_id FK
  }
  DuelSubmission {
    String id PK
    String duel_id FK
    String user_id FK
  }
  DuelVote {
    String id PK
    String duel_id FK
    String user_id FK
  }
  DuelEvaluation {
    String id PK
    String duel_id FK
    String evaluator_id FK
  }
  Event {
    String id PK
    String creator_id FK
    String company_id FK
  }
  EventChallenge {
    String id PK
    String event_id FK
  }
  EventParticipant {
    String id PK
    String event_id FK
    String user_id FK
  }
  Badge {
    String id PK
  }
  UserBadge {
    String id PK
    String user_id FK
    String badge_id FK
  }
  PostVote {
    String id PK
    String post_id FK
    String user_id FK
  }
  AnswerVote {
    String id PK
    String answer_id FK
    String user_id FK
  }
  Message {
    String id PK
    String sender_id FK
    String receiver_id FK
  }
  MobileState {
    String user_id PK
    String key PK
  }
  MobileDevice {
    String token PK
    String user_id FK
  }
  MessageReaction {
    String id PK
    String message_id FK
    String user_id FK
  }
  Bookmark {
    String id PK
    String user_id FK
    String post_id FK
  }
  Notification {
    String id PK
    String userId FK
    String actorId FK
  }
  Report {
    String id PK
    String user_id FK
    String post_id FK
  }
  SecurityAuditEvent {
    String id PK
  }
  Follow {
    String followerId PK
    String followingId PK
  }
  Reaction {
    String id PK
    String post_id FK
    String user_id FK
  }
  QuizLibrary {
    String id PK
  }
  User ||--o{ UserBlock : "blockerId"
  User ||--o{ UserBlock : "blockedId"
  User ||--o{ RpgPlayer : "userId"
  RpgPlayer ||--o{ RpgTransaction : "userId"
  RpgPlayer ||--o{ RpgBattle : "userId"
  User ||--o| RpgArenaRoom : "hostId"
  User o|--o| RpgArenaRoom : "guestId"
  User o|--o{ RpgArenaRoom : "inviteeId"
  User ||--o{ ProfileCustomization : "userId"
  User ||--o{ UserProfileAchievement : "userId"
  User ||--o{ LearningCredential : "userId"
  User ||--o{ EvaluatorApplication : "user_id"
  User ||--o| EvaluatorProfile : "user_id"
  User ||--o{ Company : "owner_id"
  Company ||--o{ Job : "company_id"
  Job ||--o{ JobRecruitmentStage : "job_id"
  Job ||--o{ JobApplication : "job_id"
  User ||--o{ JobApplication : "user_id"
  JobRecruitmentStage o|--o{ JobApplication : "stage_id"
  User ||--o{ LanguageTrail : "user_id"
  KnowledgeNode ||--o{ KnowledgeEdge : "source_node_id"
  KnowledgeNode ||--o{ KnowledgeEdge : "target_node_id"
  LearningPath ||--o{ LearningPathNode : "learning_path_id"
  KnowledgeNode ||--o{ LearningPathNode : "knowledge_node_id"
  KnowledgeNode ||--o{ Exercise : "knowledge_node_id"
  Exercise ||--o{ ExerciseTestCase : "exercise_id"
  User ||--o{ UserNodeProgress : "user_id"
  KnowledgeNode ||--o{ UserNodeProgress : "knowledge_node_id"
  Exercise ||--o{ ExerciseRun : "exercise_id"
  User ||--o{ ExerciseRun : "user_id"
  Exercise ||--o{ ExerciseSubmission : "exercise_id"
  User ||--o{ ExerciseSubmission : "user_id"
  User ||--o{ LearningEvent : "user_id"
  Exercise o|--o{ LearningEvent : "exercise_id"
  User ||--o{ Post : "author_id"
  User ||--o{ PostMedia : "owner_id"
  Post o|--o{ PostMedia : "post_id"
  Post ||--o| PostPoll : "post_id"
  PostPoll ||--o{ PostPollOption : "poll_id"
  PostPoll ||--o{ PostPollVote : "poll_id"
  PostPollOption ||--o{ PostPollVote : "option_id"
  User ||--o{ PostPollVote : "user_id"
  Post ||--o{ Answer : "post_id"
  User ||--o{ Answer : "author_id"
  Answer o|--o{ Answer : "parent_id"
  Post o|--o{ Quiz : "post_id"
  User ||--o{ QuizAttempt : "user_id"
  Quiz ||--o{ QuizAttempt : "quiz_id"
  User ||--o{ DuelRequest : "sender_id"
  User ||--o{ DuelRequest : "receiver_id"
  Duel o|--o| DuelRequest : "published_duel_id"
  User ||--o{ Duel : "challenger_id"
  User o|--o{ Duel : "opponent_id"
  User o|--o{ Duel : "winner_id"
  Duel ||--o{ DuelSolution : "duel_id"
  User ||--o{ DuelSolution : "user_id"
  Duel ||--o{ DuelSubmission : "duel_id"
  User ||--o{ DuelSubmission : "user_id"
  Duel ||--o{ DuelVote : "duel_id"
  User ||--o{ DuelVote : "user_id"
  Duel ||--o{ DuelEvaluation : "duel_id"
  User o|--o{ DuelEvaluation : "evaluator_id"
  User ||--o{ Event : "creator_id"
  Company o|--o{ Event : "company_id"
  Event ||--o{ EventChallenge : "event_id"
  Event ||--o{ EventParticipant : "event_id"
  User ||--o{ EventParticipant : "user_id"
  User ||--o{ UserBadge : "user_id"
  Badge ||--o{ UserBadge : "badge_id"
  Post ||--o{ PostVote : "post_id"
  User ||--o{ PostVote : "user_id"
  Answer ||--o{ AnswerVote : "answer_id"
  User ||--o{ AnswerVote : "user_id"
  User ||--o{ Message : "sender_id"
  User ||--o{ Message : "receiver_id"
  User ||--o{ MobileState : "user_id"
  User ||--o{ MobileDevice : "user_id"
  Message ||--o{ MessageReaction : "message_id"
  User ||--o{ MessageReaction : "user_id"
  User ||--o{ Bookmark : "user_id"
  Post ||--o{ Bookmark : "post_id"
  User ||--o{ Notification : "userId"
  User o|--o{ Notification : "actorId"
  User ||--o{ Report : "user_id"
  Post ||--o{ Report : "post_id"
  User ||--o{ Follow : "followerId"
  User ||--o{ Follow : "followingId"
  Post ||--o{ Reaction : "post_id"
  User ||--o{ Reaction : "user_id"
```

## aprendizagem

[Fonte Mermaid](diagramas/der-aprendizagem.mmd). 15 entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.

```text
erDiagram
  User {
    String id PK
    String username
    String email
    String avatar_url
    Json avatar_config
    String bio
    String institution
    String github_username
    String discord_username
  }
  LearningCredential {
    String id PK
    String userId FK
    String definitionId
    Int definitionVersion
    Json snapshot
    String integrityHash
    DateTime issuedAt
    DateTime verifiedAt
    DateTime revokedAt
  }
  LanguageTrail {
    String id PK
    String user_id FK
    Language language
    Int xp
    Int level
    Int streak
    DateTime last_activity_at
  }
  KnowledgeNode {
    String id PK
    String slug
    String title
    String description
    KnowledgeNodeType type
    String category
    Language language
    Int difficulty
    Int xp_reward
  }
  KnowledgeEdge {
    String id PK
    String source_node_id FK
    String target_node_id FK
    KnowledgeRelation relation
    DateTime created_at
  }
  LearningPath {
    String id PK
    String slug
    String title
    String description
    String accent_color
    Int estimated_minutes
    Boolean is_featured
    Boolean is_published
    DateTime created_at
  }
  LearningPathNode {
    String id PK
    String learning_path_id FK
    String knowledge_node_id FK
    Int position
  }
  Exercise {
    String id PK
    String slug
    String knowledge_node_id FK
    String title
    String summary
    String problem
    String objective
    Language language
    Int difficulty
  }
  ExerciseTestCase {
    String id PK
    String exercise_id FK
    String label
    Json input
    String invocation_code
    Json expected_output
    Boolean is_hidden
    Int position
  }
  UserNodeProgress {
    String id PK
    String user_id FK
    String knowledge_node_id FK
    KnowledgeProgressStatus status
    Int mastery
    Int completed_exercises
    DateTime started_at
    DateTime completed_at
    DateTime last_activity_at
  }
  ExerciseRun {
    String id PK
    String exercise_id FK
    String user_id FK
    AssistanceMode assistance_mode
    String code
    Int passed_tests
    Int total_tests
    String output
    String error_message
  }
  ExerciseSubmission {
    String id PK
    String exercise_id FK
    String user_id FK
    AssistanceMode assistance_mode
    ExerciseSubmissionStatus status
    String code
    Int passed_public
    Int total_public
    Int passed_hidden
  }
  LearningEvent {
    String id PK
    String user_id FK
    String exercise_id FK
    LearningEventType event_type
    AssistanceMode assistance_mode
    Json metadata
    DateTime created_at
  }
  Quiz {
    String id PK
    String post_id FK
    String question
    Json options
    Int correct_index
    Boolean is_daily
    DateTime scheduled_for
    DateTime created_at
  }
  QuizAttempt {
    String id PK
    String user_id FK
    String quiz_id FK
    Int selected_index
    Boolean is_correct
    Int xp_earned
    DateTime created_at
  }
  User ||--o{ LearningCredential : "userId"
  User ||--o{ LanguageTrail : "user_id"
  KnowledgeNode ||--o{ KnowledgeEdge : "source_node_id"
  KnowledgeNode ||--o{ KnowledgeEdge : "target_node_id"
  LearningPath ||--o{ LearningPathNode : "learning_path_id"
  KnowledgeNode ||--o{ LearningPathNode : "knowledge_node_id"
  KnowledgeNode ||--o{ Exercise : "knowledge_node_id"
  Exercise ||--o{ ExerciseTestCase : "exercise_id"
  User ||--o{ UserNodeProgress : "user_id"
  KnowledgeNode ||--o{ UserNodeProgress : "knowledge_node_id"
  Exercise ||--o{ ExerciseRun : "exercise_id"
  User ||--o{ ExerciseRun : "user_id"
  Exercise ||--o{ ExerciseSubmission : "exercise_id"
  User ||--o{ ExerciseSubmission : "user_id"
  User ||--o{ LearningEvent : "user_id"
  Exercise o|--o{ LearningEvent : "exercise_id"
  User ||--o{ QuizAttempt : "user_id"
  Quiz ||--o{ QuizAttempt : "quiz_id"
```

## comunidade

[Fonte Mermaid](diagramas/der-comunidade.mmd). 16 entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.

```text
erDiagram
  User {
    String id PK
    String username
    String email
    String avatar_url
    Json avatar_config
    String bio
    String institution
    String github_username
    String discord_username
  }
  UserBlock {
    String blockerId PK
    String blockedId PK
    DateTime createdAt
  }
  Post {
    String id PK
    String author_id FK
    String title
    String body
    Language language
    String code_snippet
    String image_url
    String audience
    Json attachments
  }
  PostMedia {
    String id PK
    String owner_id FK
    String post_id FK
    String storage_path
    String content_type
    Int size
    DateTime created_at
  }
  PostPoll {
    String id PK
    String post_id FK
    String question
    DateTime expires_at
  }
  PostPollOption {
    String id PK
    String poll_id FK
    Int position
    String text
  }
  PostPollVote {
    String id PK
    String poll_id FK
    String option_id FK
    String user_id FK
  }
  Answer {
    String id PK
    String post_id FK
    String author_id FK
    String parent_id FK
    String body
    String code_snippet
    Boolean is_accepted
    Int upvotes
    DateTime created_at
  }
  PostVote {
    String id PK
    String post_id FK
    String user_id FK
    Int value
    DateTime created_at
  }
  AnswerVote {
    String id PK
    String answer_id FK
    String user_id FK
    Int value
    DateTime created_at
  }
  Message {
    String client_id
    String id PK
    String sender_id FK
    String receiver_id FK
    String content
    String image_url
    Boolean is_edited
    DateTime created_at
    DateTime updated_at
  }
  MessageReaction {
    String id PK
    String message_id FK
    String user_id FK
    String emoji
    DateTime created_at
  }
  Bookmark {
    String id PK
    String user_id FK
    String post_id FK
    DateTime created_at
  }
  Notification {
    String id PK
    String userId FK
    NotificationType type
    String actorId FK
    String resourceId
    String resourceType
    Boolean read
    DateTime createdAt
  }
  Follow {
    String followerId PK
    String followingId PK
    DateTime createdAt
  }
  Reaction {
    String id PK
    String post_id FK
    String user_id FK
    String type
    DateTime created_at
  }
  User ||--o{ UserBlock : "blockerId"
  User ||--o{ UserBlock : "blockedId"
  User ||--o{ Post : "author_id"
  User ||--o{ PostMedia : "owner_id"
  Post o|--o{ PostMedia : "post_id"
  Post ||--o| PostPoll : "post_id"
  PostPoll ||--o{ PostPollOption : "poll_id"
  PostPoll ||--o{ PostPollVote : "poll_id"
  PostPollOption ||--o{ PostPollVote : "option_id"
  User ||--o{ PostPollVote : "user_id"
  Post ||--o{ Answer : "post_id"
  User ||--o{ Answer : "author_id"
  Answer o|--o{ Answer : "parent_id"
  Post ||--o{ PostVote : "post_id"
  User ||--o{ PostVote : "user_id"
  Answer ||--o{ AnswerVote : "answer_id"
  User ||--o{ AnswerVote : "user_id"
  User ||--o{ Message : "sender_id"
  User ||--o{ Message : "receiver_id"
  Message ||--o{ MessageReaction : "message_id"
  User ||--o{ MessageReaction : "user_id"
  User ||--o{ Bookmark : "user_id"
  Post ||--o{ Bookmark : "post_id"
  User ||--o{ Notification : "userId"
  User o|--o{ Notification : "actorId"
  User ||--o{ Follow : "followerId"
  User ||--o{ Follow : "followingId"
  Post ||--o{ Reaction : "post_id"
  User ||--o{ Reaction : "user_id"
```

## mundinho

[Fonte Mermaid](diagramas/der-mundinho.mmd). 5 entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.

```text
erDiagram
  User {
    String id PK
    String username
    String email
    String avatar_url
    Json avatar_config
    String bio
    String institution
    String github_username
    String discord_username
  }
  RpgPlayer {
    String userId PK
    Int coins
    Int sourceCoins
    Json avatar
    Json inventory
    Json equipped
    String lastCheckin
    Int checkinStreak
    DateTime updatedAt
  }
  RpgTransaction {
    String id PK
    String userId FK
    String key
    String label
    Int amount
    DateTime createdAt
  }
  RpgBattle {
    String id PK
    String userId FK
    String language
    String creature
    String status
    Int hp
    Int enemyHp
    Int enemyLevel
    Int enemyMaxHp
  }
  RpgArenaRoom {
    String id PK
    String hostId FK
    String guestId FK
    String inviteeId FK
    DateTime inviteExpiresAt
    String hostLanguage
    String guestLanguage
    Json hostPosition
    Json guestPosition
  }
  User ||--o{ RpgPlayer : "userId"
  RpgPlayer ||--o{ RpgTransaction : "userId"
  RpgPlayer ||--o{ RpgBattle : "userId"
  User ||--o| RpgArenaRoom : "hostId"
  User o|--o| RpgArenaRoom : "guestId"
  User o|--o{ RpgArenaRoom : "inviteeId"
```

## duelos

[Fonte Mermaid](diagramas/der-duelos.mmd). 9 entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.

```text
erDiagram
  User {
    String id PK
    String username
    String email
    String avatar_url
    Json avatar_config
    String bio
    String institution
    String github_username
    String discord_username
  }
  EvaluatorApplication {
    String id PK
    String user_id FK
    String motivation
    StringArray tech_stack
    EvaluatorStatus status
    String reviewed_by_id
    String reviewer_notes
    DateTime created_at
    DateTime reviewed_at
  }
  EvaluatorProfile {
    String id PK
    String user_id FK
    Int reputation
    Int evaluations_count
    StringArray tech_stack
    EvaluatorProfileStatus status
    String sanction_reason
    DateTime approved_at
    DateTime updated_at
  }
  DuelRequest {
    String id PK
    String sender_id FK
    String receiver_id FK
    Language language
    DuelRequestStatus status
    Boolean publish_on_expiry
    String problem_id
    String problem_title
    String problem_body
    String published_duel_id FK
  }
  Duel {
    String id PK
    String challenger_id FK
    String opponent_id FK
    String problem_title
    String problem_body
    String problem_id
    Language language
    DuelStatus status
    Int time_limit_seconds
    String winner_id FK
  }
  DuelSolution {
    String id PK
    String duel_id FK
    String user_id FK
    String code
    Int vote_count
    Int score
    Int runtime_ms
    String complexity
    DateTime submitted_at
  }
  DuelSubmission {
    String id PK
    String duel_id FK
    String user_id FK
    String code
    DuelSubmissionStatus status
    Int passed_tests
    Int total_tests
    Int runtime_ms
    String complexity
  }
  DuelVote {
    String id PK
    String duel_id FK
    String user_id FK
    String solution_id
    DateTime created_at
  }
  DuelEvaluation {
    String id PK
    String duel_id FK
    String evaluator_id FK
    EvaluationType type
    Int score_player1
    Int score_player2
    Json system_analysis
    String human_feedback
    StringArray strengths
  }
  User ||--o{ EvaluatorApplication : "user_id"
  User ||--o| EvaluatorProfile : "user_id"
  User ||--o{ DuelRequest : "sender_id"
  User ||--o{ DuelRequest : "receiver_id"
  Duel o|--o| DuelRequest : "published_duel_id"
  User ||--o{ Duel : "challenger_id"
  User o|--o{ Duel : "opponent_id"
  User o|--o{ Duel : "winner_id"
  Duel ||--o{ DuelSolution : "duel_id"
  User ||--o{ DuelSolution : "user_id"
  Duel ||--o{ DuelSubmission : "duel_id"
  User ||--o{ DuelSubmission : "user_id"
  Duel ||--o{ DuelVote : "duel_id"
  User ||--o{ DuelVote : "user_id"
  Duel ||--o{ DuelEvaluation : "duel_id"
  User o|--o{ DuelEvaluation : "evaluator_id"
```

## recrutamento

[Fonte Mermaid](diagramas/der-recrutamento.mmd). 5 entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.

```text
erDiagram
  User {
    String id PK
    String username
    String email
    String avatar_url
    Json avatar_config
    String bio
    String institution
    String github_username
    String discord_username
  }
  Company {
    String id PK
    String owner_id FK
    String name
    String slug
    String description
    String logo_url
    String website
    String location
    Boolean is_verified
  }
  Job {
    String id PK
    String company_id FK
    String title
    String description
    JobLevel level
    StringArray technologies
    JobModality modality
    String location
    JobContract contract_type
  }
  JobRecruitmentStage {
    String id PK
    String job_id FK
    String title
    RecruitmentStageType type
    Int order
    String challenge_id
    String description
  }
  JobApplication {
    String id PK
    String job_id FK
    String user_id FK
    String stage_id FK
    ApplicationStatus status
    Int technical_score
    String feedback
    DateTime created_at
    DateTime updated_at
  }
  User ||--o{ Company : "owner_id"
  Company ||--o{ Job : "company_id"
  Job ||--o{ JobRecruitmentStage : "job_id"
  Job ||--o{ JobApplication : "job_id"
  User ||--o{ JobApplication : "user_id"
  JobRecruitmentStage o|--o{ JobApplication : "stage_id"
```

## eventos

[Fonte Mermaid](diagramas/der-eventos.mmd). 5 entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.

```text
erDiagram
  User {
    String id PK
    String username
    String email
    String avatar_url
    Json avatar_config
    String bio
    String institution
    String github_username
    String discord_username
  }
  Company {
    String id PK
    String owner_id FK
    String name
    String slug
    String description
    String logo_url
    String website
    String location
    Boolean is_verified
  }
  Event {
    String id PK
    String creator_id FK
    String company_id FK
    String title
    String slug
    String description
    EventType type
    EventStatus status
    String banner_url
  }
  EventChallenge {
    String id PK
    String event_id FK
    Int position
    String title
    String statement
    Language language
    String expected_answer
    Json examples
    DateTime created_at
  }
  EventParticipant {
    String id PK
    String event_id FK
    String user_id FK
    Int score
    Int rank
    DateTime joined_at
  }
  User ||--o{ Company : "owner_id"
  User ||--o{ Event : "creator_id"
  Company o|--o{ Event : "company_id"
  Event ||--o{ EventChallenge : "event_id"
  Event ||--o{ EventParticipant : "event_id"
  User ||--o{ EventParticipant : "user_id"
```

## identidade

[Fonte Mermaid](diagramas/der-identidade.mmd). 10 entidades nesta vista. Para evitar uma única imagem ilegível, use a visão específica do fluxo na apresentação.

```text
erDiagram
  User {
    String id PK
    String username
    String email
    String avatar_url
    Json avatar_config
    String bio
    String institution
    String github_username
    String discord_username
  }
  ProfileCustomization {
    String userId PK
    Json preferences
    Json chat
    Int version
    DateTime updatedAt
  }
  ProfileAchievementCatalog {
    String id PK
    Json value
    Int version
    DateTime updatedAt
  }
  UserProfileAchievement {
    String userId PK
    String achievementId PK
    Json definition
    DateTime unlockedAt
    DateTime announcedAt
  }
  LearningCredential {
    String id PK
    String userId FK
    String definitionId
    Int definitionVersion
    Json snapshot
    String integrityHash
    DateTime issuedAt
    DateTime verifiedAt
    DateTime revokedAt
  }
  Badge {
    String id PK
    String slug
    String label
    String description
    String icon
    String color
  }
  UserBadge {
    String id PK
    String user_id FK
    String badge_id FK
    DateTime earned_at
  }
  MobileState {
    String user_id PK
    String key PK
    Json value
    Int version
    DateTime updated_at
  }
  MobileDevice {
    String token PK
    String user_id FK
    Boolean enabled
    DateTime updated_at
  }
  SecurityAuditEvent {
    String id PK
    String actor_id
    String action
    String resource_id
    Json metadata
    DateTime created_at
    DateTime retain_until
  }
  User ||--o{ ProfileCustomization : "userId"
  User ||--o{ UserProfileAchievement : "userId"
  User ||--o{ LearningCredential : "userId"
  User ||--o{ UserBadge : "user_id"
  Badge ||--o{ UserBadge : "badge_id"
  User ||--o{ MobileState : "user_id"
  User ||--o{ MobileDevice : "user_id"
```

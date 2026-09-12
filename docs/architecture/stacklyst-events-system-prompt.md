# Stacklyst Events System: Planning, Creation & Participation Architecture

## 1. Product Intent & Problem Statement

Eventos competitivos (Hackathons, Campeonatos Semanais, Workshops e Desafios ao Vivo) representam um dos pilares centrais da retenção, gamificação e contratação no Stacklyst. Atualmente, a plataforma possui modelos no banco de dados (`Event`, `EventParticipant`) e uma página básica em `/events`, mas o recurso está inoperante para o usuário final:

1. **Impossibilidade de Criar Eventos:** Não existe interface gráfica (botão, formulário ou modal) para criação de eventos, restringindo a criação a scripts manuais ou chamadas diretas de API.
2. **Inscrição Efêmera e Falhas de Participação:** A inscrição do usuário na página de eventos utiliza um estado volátil (`joinedMap` em memória). Ao recarregar a página, a inscrição é perdida visualmente. Além disso, `GET /api/events` não informa se o usuário autenticado já está inscrito.
3. **Falta de Gestão de Ciclo de Vida:** Não há tela ou modal de detalhes do evento com regulamento, cronograma, contagem regressiva, participantes e opção de cancelamento de inscrição.
4. **Controle de Acesso Desalinhado:** A criação no backend exige permissões restritas sem feedback na UI para organizadores, administradores ou recrutadores parceiros.

---

## 2. Protected Surfaces & Design Principles

- **Design System Stacklyst:** Manter a paleta OLED escura (`#000000`, `var(--color-dd-surface)`, `var(--color-dd-border)`), com realce roxo/violeta para competições e azul elétrico (`#0083fe`) para ações globais.
- **Navegação Intacta:** A sidebar lateral protegida (`Sidebar.tsx`) e a rota `/events` devem ser preservadas sem quebrar rotas existentes.
- **Acessibilidade e Ícones Vetoriais:** Proibido uso de emojis como substitutos de ícones; utilizar estritamente ícones do pacote `lucide-react`. Suporte total a navegação por teclado e leitores de tela (`aria-*`, `role="dialog"`, `aria-modal`).
- **Segurança e Validação:** Validação rigorosa com `zod` em todas as rotas de API, autenticação via sessão ativa Supabase/Next.js e sanitização contra injeção de scripts (XSS).

---

## 3. Data Architecture & Contracts

### 3.1 Modelos Existentes em `prisma/schema.prisma`
```prisma
model Event {
  id               String      @id @default(uuid())
  creator_id       String
  company_id       String?
  title            String
  slug             String      @unique
  description      String
  type             EventType   @default(CHALLENGE)
  status           EventStatus @default(UPCOMING)
  banner_url       String?
  min_level        Int         @default(1)
  max_participants Int?
  xp_reward        Int         @default(250)
  start_date       DateTime
  end_date         DateTime
  created_at       DateTime    @default(now())

  creator      User               @relation(fields: [creator_id], references: [id], onDelete: Cascade)
  company      Company?           @relation(fields: [company_id], references: [id], onDelete: SetNull)
  participants EventParticipant[]

  @@index([status, start_date])
}

model EventParticipant {
  id        String   @id @default(uuid())
  event_id  String
  user_id   String
  score     Int      @default(0)
  rank      Int?
  joined_at DateTime @default(now())

  event Event @relation(fields: [event_id], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([event_id, user_id])
  @@index([event_id, score(sort: Desc)])
}
```

### 3.2 Extensões no Serviço (`EventService`)
- Enriquecer a listagem de eventos com o contexto do usuário:
  - `is_joined: boolean` (identificado via `user_id` autenticado na requisição).
  - `participants_count: number`.
  - `has_slots_available: boolean` (`max_participants ? count < max_participants : true`).
  - `user_can_join: boolean` (`user.total_xp / level >= event.min_level`).

---

## 4. Backend & API Scope

### 4.1 `GET /api/events` (Enriquecido)
- **Objetivo:** Listar eventos filtráveis por `status`, `type` e `search`.
- **Identificação do Usuário:** Detectar usuário logado via `getAuthUser()` para injetar `is_joined: true/false` em cada evento retornado.

### 4.2 `POST /api/events` (Criação de Evento)
- **Autorização:** Usuários com permissão (`ADMIN`, `RECRUITER` ou usuários habilitados).
- **Validação com Zod:** Validação de datas (início futuro, término após início), título (4 a 100 caracteres), descrição (mínimo 20 caracteres), XP (50 a 5000) e limite de vagas.
- **Slug Automático:** Geração de slug único amigável para SEO (`slugify(title) + timestamp`).

### 4.3 `POST /api/events/[id]/participate` (Inscrição)
- **Validações de Regra de Negócio:**
  1. Evento existente e não encerrado (`status !== 'COMPLETED'`).
  2. Nível do usuário atende ao `min_level`.
  3. Limite de participantes não ultrapassado.
- **Operação:** `upsert` na tabela `EventParticipant` e envio de notificação de confirmação.

### 4.4 `DELETE /api/events/[id]/participate` (Cancelamento)
- **Objetivo:** Permitir que o participante libere sua vaga antes do início do evento.
- **Operação:** Remoção do registro `EventParticipant`.

### 4.5 `GET /api/events/[id]` (Detalhes do Evento)
- Retorna dados detalhados, patrocinador, regulamento completo e os top 50 participantes classificados no leaderboard.

---

## 5. Frontend & UI/UX Components Scope

### 5.1 Barra Superior e Botão "Criar Evento"
- No cabeçalho de `/events`:
  - Botão de destaque **"Criar Evento"** (`bg-purple-600 hover:bg-purple-500 text-white rounded-xl`).
  - Acessível para administradores, recrutadores e organizadores da comunidade.

### 5.2 Modal de Criação de Evento (`CreateEventModal.tsx`)
- Form interativo em passos claros ou abas:
  1. **Informações Gerais:** Título, Categoria (`Hackathon`, `Campeonato`, `Workshop`, `Desafio`), Banner URL.
  2. **Cronograma & Vagas:** Data/Hora de Início, Data/Hora de Término, Nível Mínimo, Máximo de Participantes.
  3. **Recompensas & Regulamento:** Recompensa de XP, Descrição e Regras detalhadas.
- Feedback em tempo real com validação instantânea e loading state.

### 5.3 Cards de Eventos Interativos (`EventCard.tsx`)
- Indicadores visuais dinâmicos:
  - Badge de status (`Em Breve`, `Ao Vivo`, `Finalizado`).
  - Badge de categoria e XP (+250 XP, +500 XP).
  - Barra de capacidade de vagas (`X / Y vagas preenchidas`).
  - Botão de ação inteligente:
    - *Não inscrito:* `Inscrever-se no evento`
    - *Inscrito:* `Inscrito ✓` (com hover para cancelar inscrição)
    - *Vagas esgotadas:* desabilitado com indicador visual
    - *Nível insuficiente:* informa o nível necessário

### 5.4 Modal de Detalhes do Evento (`EventDetailsModal.tsx`)
- Exibição de regras completas, contagem regressiva, patrocinador oficial e ranking ao vivo.

---

## 6. Acceptance Criteria

1. Interface intuitiva e responsiva para criar eventos sem necessidade de acessar o banco de dados.
2. Inscrição e cancelamento com persistência real no PostgreSQL via Prisma.
3. Atualização automática de vagas e contadores ao vivo.
4. Total compatibilidade com temas e tokens do Stacklyst (OLED escuro e roxo competitivo).
5. 100% tipado com TypeScript e 0 erros de linting.

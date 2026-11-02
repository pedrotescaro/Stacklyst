# Vagas, empresas e recrutamento

## Modelo e entradas

Empresa tem responsável; vaga pertence à empresa e pode ter etapas ordenadas. Candidatura liga usuário, vaga, status e etapa atual. Perfil técnico e feedback interno não são automaticamente dados públicos.

Entradas web: `/jobs`, `/jobs/[id]`, `/recruiter`. APIs relacionadas: jobs, companies e equivalentes mobile. Caso de uso principal: `services/job.service.ts`. `lib/mobile/company-access.ts` também protege operações web de empresa; seu nome de pasta não limita seu uso ao aplicativo.

## Buscar e candidatar-se

`listJobs` filtra busca, nível, modalidade, contrato, tecnologia, empresa e status. Sem status explícito, procura vagas abertas. `getJobById` agrega empresa, etapas e candidatura do usuário quando identificado.

`applyForJob` rejeita duplicação e vaga inexistente/fechada. Cria candidatura `APPLIED` ligada à primeira etapa, quando existente. Os enums reais de status/modalidade/contrato estão no [banco](referencias/banco.md); a interface não deve inventar strings que o contrato não aceita.

## Gestão do funil

Listar candidaturas exige recrutador/administrador e acesso à empresa. Conhecer o ID da vaga não basta. `requireCompanyAccess` evita que o papel de recrutador dê acesso a todas as empresas.

`updateApplicationStage` muda etapa, status, feedback e nota técnica em transação com auditoria. A rota deve verificar ator, empresa e compatibilidade de etapa antes de chamar o método; o método isolado não substitui todo o controle de acesso.

Depois do commit, tenta notificar o candidato. Falha dessa tentativa é registrada, sem significar rollback da candidatura. Não repetir uma movimentação apenas por ausência de push.

## Privacidade e manutenção

A lista pública de vagas não deve expor feedback interno. Dados privados de candidaturas dependem da identidade e da rota. Testes de referência: `recruitment-privacy.test.ts`, `job.service.test.ts` e `job-notifications.test.ts` em `src/services/__tests__`.

Este fluxo registra candidaturas e decisões. Não documentar contratação automática por IA, entrevista executada ou integração com RH externo sem implementação. Novo tipo de etapa exige atualizar enum/validação, criação da vaga, interface e transições.

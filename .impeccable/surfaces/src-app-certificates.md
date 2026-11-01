---
version: 1
slug: "src-app-certificates"
primary_target: "src/app/certificates"
related_targets: ["src/components/credentials","src/app/profile/[username]/ProfileContent.tsx","src/app/profile/[username]/page.tsx","src/lib/credentials"]
---

# Badges e certificados verificáveis

Modo: Operate. Extensão da plataforma existente, sem criar uma nova identidade visual.

Escopo: coleção /certificates, registro público /certificates/[id], PDF e vitrine de badges do perfil. Relacionados: componentes de credenciais e integração do perfil. A identidade permanece em DESIGN.md; propósito e restrições duráveis permanecem em PRODUCT.md.

Referências confirmadas no brief: badges de curso profissional do tipo BadgeCert/Cisco, com escudo, aro e fita, desenhadas em vetor. Preservar Inter/Sora, preto e branco, Electric Blue #0083FE, coluna principal de até 720 px e sidebar adjacente do shell existente. Não alterar navegação ou identidade global para acomodar esta superfície.

Composição: lista de conquistas com badge, título, descrição, estado textual, progresso, critérios em details e ações de continuar, verificar ou baixar. Busca e filtros por linguagem/conquistadas; estado vazio com recuperação. Mobile empilha ferramentas e ações sem overflow. O perfil exibe somente credenciais verificadas ou orientação de conquista, sem badges de exemplo.

Conteúdo: marcos vinculados a progresso avaliado real — primeira lição, seções, curso do zero e práticas — para JavaScript, TypeScript, Python, Rust, Go e Java. Desenho atenuado com cadeado quando pendente; desenho da linguagem e confirmação quando conquistado. Sem emojis, caixas genéricas ou níveis inventados.

Registro público: titular e curso reais do registro, requisitos, data, carga explicitamente estimada, ID e hash SHA-256. Revogação ou integridade inválida impedem apresentação como certificado válido e o download correspondente. O PDF branco horizontal usa marca, assinatura visual fornecida pelo proprietário e QR para a URL pública. Não descrever assinatura visual ou hash como assinatura criptográfica.

Evidência de revisão: capturas da build de produção em 1440/1280/390/320 px, temas claro e escuro, coleção e registro público, em .tmp/quality/certificates; prévias example.png e long-text.png para o PDF. Fixture sintética e APIs laterais controladas exercitam componentes reais; isso não comprova autenticação ou emissão em produção. Veredicto independente: ship.

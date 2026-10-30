# Editor do banner do perfil

Atualização de 30/10/2026. A área do avatar sobreposta ao banner interceptava o clique da câmera. O controle da capa agora fica acima dessa área, com botão circular de 44 px.

O editor oferece Padrão, Cor sólida, Degradê (duas cores) e Imagem. A cor sólida usa a paleta compartilhada de 48 cores. No degradê, os controles Primeira cor e Segunda cor selecionam qual cor será alterada pela paleta. A prévia muda imediatamente e as alterações são publicadas pelo botão Salvar alterações do perfil. Cancelar descarta o rascunho. Upload, posicionamento de imagem e restauração do padrão continuam disponíveis.

## Validação

- 38 testes focados passaram: seleção independente das cores, envio das preferências, reabertura do perfil salvo, cancelamento e regressões do editor contextual e da paleta compartilhada.
- 17 testes com PostgreSQL local passaram, incluindo dois novos casos que persistem os modos sólido/degradê, removem a imagem antiga e verificam as leituras do proprietário e do perfil público. Os dados sintéticos foram removidos ao final.
- TypeScript, ESLint (sem erros; avisos existentes sobre imagens), build de produção e smoke test do executor passaram.
- Fixture local com o componente real em 320, 390 e 1440 px: o teste de hit testing confirmou a intercepção com a camada antiga e o clique correto após a correção. Câmera e amostras de cor medem 44 px; não houve overflow horizontal da página. Os modos sólido e degradê permaneceram após recarregar a fixture.
- Axe não encontrou violações WCAG A/AA no editor nos temas claro e escuro. Capturas e relatório: `.impeccable/review/banner/`.

A fixture simula a API e a recarga; a persistência real foi verificada separadamente no PostgreSQL local. Não foi realizado E2E autenticado em produção nem teste em aparelho físico. A implementação reutiliza o esquema e o serviço existentes, sem migração.

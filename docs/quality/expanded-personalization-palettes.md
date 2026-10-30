# Paletas ampliadas de personalização

A paleta compartilhada do perfil e do chat oferece 48 cores, mantendo as 21 opções anteriores. O seletor de cabelo do Mundinho combina os seis tons existentes, seis novos tons naturais e a paleta compartilhada, totalizando 59 opções distintas. A seleção continua usando amostras prontas, com nome ou valor hexadecimal, indicador de seleção e navegação por teclado.

Os índices dos seis tons originais e os sprites existentes foram preservados. Novos tons são salvos no campo opcional `hairTint` do JSON do avatar, validado como hexadecimal de seis dígitos no servidor. Voltar a um tom antigo remove esse campo e restaura seu índice original. O penteado, a pele, os olhos, as roupas e os acessórios continuam independentes da escolha da cor.

O renderizador aplica a nova cor somente à camada do cabelo, usando os pixels e as sombras da variante prata. A transferência de canais preserva o contorno e a transparência, e acompanha as quatro direções e as animações existentes. A aparência do guia do mundo continua fixa mesmo quando o jogador usa uma cor nova.

## Verificação em 29/10/2026

- Testes cobrem compatibilidade dos seis índices, troca de tom sem alterar o penteado, remoção da tonalização, sombras e contornos, validação no servidor, persistência e recarga do avatar.
- Os testes do editor de perfil também verificam a compatibilidade da paleta compartilhada ampliada.
- Build de produção, smoke de execução de código e verificação de tipos passaram. ESLint dos arquivos de código alterados passou sem erros.
- A fixture visual usa o editor e os sprites reais, com estado local de demonstração. A checagem de pixels compara prata e azul nas quatro direções, com tolerância de uma unidade RGB para arredondamento do filtro no navegador, e confirma que a parte inferior do personagem não muda.

Os logs locais ficam em `.tmp/hair-palette-*.log` e as capturas em `.impeccable/review/hair-palettes/`. A mudança não exige migração de schema. O teste de persistência usa o repositório com transação simulada e o transporte local do editor; não representa validação autenticada em produção ou de um novo aplicativo nativo.

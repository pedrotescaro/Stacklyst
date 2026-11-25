---
title: Gerenciamento de memória, memória virtual, sistemas de arquivos e arquitetura de computadores
summary: Hierarquia de memória, isolamento de espaços de endereçamento, partições, paginação e segmentação, memória virtual e substituição de páginas, sistemas de arquivos e uma revisão de CPU, barramentos e E/S.
order: 2
level: intermediário
version: 3
updated: 2026-11-25
tags: [gerenciamento de memória, hierarquia de memória, cache, ram, endereço lógico, endereço físico, mmu, paginação, página, quadro, tabela de páginas, segmentação, fragmentação, memória virtual, falta de página, page fault, substituição de páginas, lru, fifo, ótimo, thrashing, swap, sistema de arquivos, fat, ntfs, ext4, inode, diretório, cpu, barramento, entrada e saída, dma]
related: [sistemas-operacionais, sistemas-de-numeracao, computacao-em-nuvem, seguranca-da-informacao]
---

## O que é

- **Gerenciamento de memória:** a parte do SO que **aloca, protege e libera** a memória principal (RAM) entre os processos, traduzindo endereços **lógicos** (vistos pelo programa) em **físicos** (na RAM).
- **Memória virtual:** técnica que dá a cada processo a ilusão de uma memória **maior** que a física, usando o **disco** como extensão.
- **Sistema de arquivos:** a forma como o SO organiza, nomeia, armazena e protege **arquivos e diretórios** em dispositivos de armazenamento.

## Para que serve

Permite rodar muitos programas ao mesmo tempo, programas maiores que a RAM, e impede que um processo leia ou corrompa a memória de outro ou do próprio SO — base da **estabilidade** e da **segurança**.

## Como funciona

### Hierarquia de memória

**Registradores → cache (L1, L2, L3) → RAM → SSD/disco → armazenamento remoto**: quanto mais rápido, mais caro e menor. A cache explora a **localidade** (temporal e espacial) dos acessos.

### Proteção e tradução de endereços

Cada processo tem seu **espaço de endereçamento**. A **MMU** (unidade de gerência de memória) traduz endereços lógicos em físicos e bloqueia acessos fora dos limites (gera falha de segmentação). Isso impede interferência entre programas.

### Alocação

- **Partições fixas/variáveis** (contígua): simples, mas sofrem **fragmentação** (interna nas fixas; externa nas variáveis).
- **Paginação:** a memória lógica é dividida em **páginas** e a física em **quadros (frames)** do mesmo tamanho; uma **tabela de páginas** mapeia uma na outra. Elimina a fragmentação externa (resta pouca interna). A **TLB** é uma cache das traduções.
- **Segmentação:** divide o programa em **segmentos lógicos** de tamanhos diferentes (código, dados, pilha).

### Memória virtual

Só as páginas **em uso** ficam na RAM; as demais ficam no disco (**swap**). Ao acessar uma página ausente ocorre uma **falta de página (page fault)**: o SO a traz do disco, possivelmente **substituindo** outra.

Algoritmos de substituição:

| Algoritmo | Remove | Observação |
|---|---|---|
| **Ótimo** (OPT) | a que demorará mais para ser usada | teórico (precisa prever o futuro) |
| **FIFO** | a mais antiga na memória | simples; sofre a **anomalia de Belady** |
| **LRU** | a **menos recentemente usada** | aproxima o ótimo; custoso de implementar |
| **Relógio (segunda chance)** | aproximação do LRU com bit de referência | usado na prática |

Se o sistema passa mais tempo trocando páginas do que executando, ocorre **thrashing**.

### Sistemas de arquivos

- **Arquivo:** sequência nomeada de bytes, com **metadados** (tamanho, dono, permissões, datas).
- **Diretórios** em árvore; caminhos absolutos e relativos.
- **Alocação:** contígua, encadeada (FAT), indexada (**i-nodes** em sistemas Unix/ext4).
- **Exemplos:** FAT32, exFAT, NTFS (Windows), ext4, XFS, Btrfs (Linux), APFS (macOS).
- **Journaling:** registra operações antes de executá-las, facilitando a recuperação após falhas.
- **Permissões:** leitura, escrita e execução para dono, grupo e outros (`chmod 755`).

### Arquitetura de computadores em uma página

- **CPU:** unidade de controle + ULA + registradores; ciclo **busca → decodificação → execução**.
- **Barramentos:** de **dados** (largura = bits transferidos por vez), de **endereços** (com *n* linhas endereça **2ⁿ** posições) e de **controle**.
- **E/S:** por programa (*polling*), por **interrupção** ou por **DMA** (transferência direta para a memória, sem ocupar a CPU).

## Características principais

- Isolamento de memória é **proteção**, não só organização.
- Memória virtual troca **velocidade** por **capacidade** aparente.
- Sistemas de arquivos escondem do usuário blocos, setores e mídias diferentes.

## Exemplos práticos

:::example Substituição LRU com 3 quadros
Referências: 1, 2, 3, 1, 4, 2. Após 1, 2, 3 (3 faltas) e o acesso a 1 (acerto), a página **4** substitui a menos recentemente usada (**2**); depois, o acesso a **2** é nova falta e substitui a **3**. Total: 5 faltas.
:::

## Representação visual

::figure{id="traducao-de-endereco-virtual"}

A MMU procura o número do quadro primeiro na TLB. Se precisar consultar a tabela, a página pode estar presente mesmo sem entrada no cache. No ENADE, diferencie falha na TLB de falta de página e mantenha o deslocamento ao formar o endereço físico.

## Vantagens e desvantagens

| Técnica | Vantagem | Desvantagem |
|---|---|---|
| Paginação | sem fragmentação externa | tabela de páginas ocupa memória |
| Segmentação | visão lógica do programa | fragmentação externa |
| Memória virtual | programas maiores que a RAM | page faults e risco de thrashing |

## Diferenças entre conceitos semelhantes

- **Endereço lógico × físico:** o que o programa usa × onde está na RAM.
- **Página × quadro:** bloco da memória lógica × bloco da memória física.
- **Fragmentação interna × externa:** sobra dentro do bloco alocado × buracos entre blocos.
- **Gerência de memória × de arquivos:** RAM (volátil) × armazenamento persistente.

## Como cai no ENADE

:::enade
O SO como gerenciador de recursos e a proteção de memória entre programas (2021), barramentos e capacidade de endereçamento (2014) e conceitos de memória virtual e sistemas de arquivos.
:::

## Pegadinhas

:::trap Antivírus não é o mecanismo de isolamento
Quem impede um programa de escrever na memória de outro é a **gerência de memória** (com a MMU).
:::

:::trap FIFO pode piorar com mais quadros
É a **anomalia de Belady**; LRU e ótimo não a sofrem.
:::

## Questões comentadas

::question 2021-objective-28 Isolamento entre programas

O texto descreve programas que poderiam escrever no espaço de memória uns dos outros ou do SO; o mecanismo que impede isso é o **gerenciamento de memória** (alternativa B).

::question 2014-objective-27 Barramento de dados e de endereços

Use potências de 2: com *n* linhas de endereço, endereçam-se 2ⁿ posições; a largura do barramento de dados indica quantos bits trafegam por vez.

## Resumo para memorizar

:::summary
- Hierarquia: registradores > cache > RAM > disco.
- MMU traduz endereços e **isola** processos.
- **Paginação** (páginas ↔ quadros, tabela de páginas, TLB) × **segmentação** (segmentos lógicos).
- Memória virtual: páginas sob demanda; **page fault**; substituição **ótimo, FIFO, LRU, relógio**; thrashing.
- Arquivos: metadados, diretórios, FAT/NTFS/ext4, **journaling**, permissões.
:::

## Miniquestionário

:::quiz
[
  {
    "question": "O que acontece quando um processo acessa uma página que não está na RAM?",
    "options": ["Deadlock", "Falta de página (page fault)", "Troca de contexto obrigatória para outro usuário", "Formatação do disco"],
    "answer": 1,
    "explanation": "O SO trata a falta de página trazendo-a do disco."
  },
  {
    "question": "Qual algoritmo de substituição remove a página usada há mais tempo?",
    "options": ["FIFO", "LRU", "Ótimo", "Aleatório"],
    "answer": 1,
    "explanation": "LRU = Least Recently Used."
  },
  {
    "question": "Um barramento de endereços de 20 bits endereça quantas posições?",
    "options": ["20", "1.024", "1.048.576 (2²⁰)", "400"],
    "answer": 2,
    "explanation": "2²⁰ ≈ 1 milhão de posições."
  }
]
:::

## Referências

- TANENBAUM, A. S.; BOS, H. *Sistemas operacionais modernos*. 4. ed. São Paulo: Pearson Education do Brasil, 2016.
- SILBERSCHATZ, A.; GALVIN, P. B.; GAGNE, G. *Fundamentos de Sistemas Operacionais*. 9. ed. LTC, 2015 — caps. 8 a 12.
- STALLINGS, W. *Arquitetura e Organização de Computadores*. 10. ed. Pearson, 2017 — caps. 3 e 4.
- INEP. ENADE TADS 2014 (questão 27) e 2021 (questão 28).

---
title: Redes de computadores — modelo OSI, TCP/IP, HTTP/HTTPS, DNS, endereçamento IP e equipamentos
summary: As camadas OSI e TCP/IP, TCP × UDP, portas, HTTP e HTTPS, como o DNS resolve nomes, endereçamento IPv4 com máscara de sub-rede e gateway, IPv6, e o papel de hubs, switches e roteadores.
order: 3
level: intermediário
version: 3
updated: 2026-11-25
tags: [redes, modelo osi, tcp/ip, camadas, pdu, tcp, udp, portas, http, https, tls, dns, resolução de nomes, cache dns, servidor autoritativo, ip, ipv4, ipv6, máscara de sub-rede, cidr, gateway, dhcp, nat, hub, switch, roteador, colisão, lan, wan, protocolos]
related: [seguranca-da-informacao, computacao-em-nuvem, evolucao-arquiteturas-e-camadas, sistemas-de-numeracao]
---

## O que é

Uma **rede de computadores** é um conjunto de dispositivos interligados que **trocam dados** seguindo **protocolos** — regras que definem formato, ordem e significado das mensagens. A comunicação é organizada em **camadas**, cada uma oferecendo serviços à de cima.

## Para que serve

Toda aplicação moderna depende de rede: web, APIs, bancos remotos, nuvem, e-mail, streaming. Entender camadas e endereçamento ajuda a **diagnosticar problemas** (por que uma máquina não alcança a impressora?) e a projetar sistemas seguros e eficientes.

## Como funciona

### Modelo OSI × TCP/IP

::widget osi-layers

Fonte: adaptado de TANENBAUM; WETHERALL (2011, cap. 1) e KUROSE; ROSS (2021, cap. 1) — recriado pela equipe Stacklyst.

Compare os papéis das camadas de cada pilha. No ENADE, localize o protocolo pela sua função, como o DNS na camada de aplicação.

| OSI (7 camadas) | TCP/IP (4 camadas) | PDU | Exemplos |
|---|---|---|---|
| 7 Aplicação, 6 Apresentação, 5 Sessão | **Aplicação** | dados | HTTP, HTTPS, DNS, SMTP, FTP, SSH, DHCP |
| 4 Transporte | **Transporte** | segmento / datagrama | **TCP**, **UDP** (portas) |
| 3 Rede | **Internet** | pacote | **IP**, ICMP, roteadores |
| 2 Enlace, 1 Física | **Acesso à rede** | quadro / bits | Ethernet, Wi-Fi, MAC, switches, cabos |

::figure{id="camadas-osi-tcp-ip"}

O OSI é um **modelo de referência** didático; o **TCP/IP** é a pilha **usada na Internet**.

### TCP × UDP

| | TCP | UDP |
|---|---|---|
| Conexão | **orientado a conexão** (handshake de 3 vias) | sem conexão |
| Confiabilidade | entrega garantida, em **ordem**, com retransmissão | sem garantia |
| Controle de fluxo/congestionamento | sim | não |
| Velocidade/overhead | maior overhead | leve e rápido |
| Uso | web, e-mail, transferência de arquivos | DNS (consultas), streaming, jogos, VoIP |

**Portas** identificam o processo de destino: HTTP 80, HTTPS 443, SSH 22, DNS 53, SMTP 25.

### HTTP e HTTPS

- **HTTP**: protocolo de requisição/resposta **sem estado** da web. Métodos: **GET** (ler), **POST** (criar), **PUT/PATCH** (atualizar), **DELETE** (remover). Códigos: **2xx** sucesso (200, 201), **3xx** redirecionamento, **4xx** erro do cliente (400, 401, 403, 404), **5xx** erro do servidor (500, 503).
- **HTTPS** = HTTP sobre **TLS**: **cifra** a comunicação e **autentica** o servidor por **certificado digital**, garantindo confidencialidade e integridade em trânsito.

### DNS — Domain Name System

Traduz **nomes** (www.exemplo.com.br) em **endereços IP** (resolução de nomes). É um **banco de dados distribuído e hierárquico**: raiz (.) → domínios de topo (.br, .com) → domínios (exemplo.com.br) → hosts.

1. O cliente pergunta ao **servidor DNS local** (resolvedor recursivo).
2. Se a resposta estiver em **cache**, ela volta imediatamente.
3. Se não, o servidor — agindo como **cliente** de outros servidores DNS — consulta raiz, TLD e o servidor **autoritativo** do domínio.
4. A resposta é guardada em cache por um tempo (**TTL**).

Registros: **A** (IPv4), **AAAA** (IPv6), **CNAME** (apelido), **MX** (e-mail), **NS** (servidor de nomes), **TXT**. O IPv6 **não** elimina o DNS — usa registros AAAA.

### Endereçamento IPv4

Endereço de **32 bits** em 4 octetos decimais: 192.168.70.10. A **máscara de sub-rede** separa a parte de **rede** da parte de **host**:

- 255.255.255.0 (/24): os três primeiros octetos são a rede (192.168.70.x) → 254 hosts.
- 255.255.0.0 (/16): os dois primeiros são a rede (175.16.x.x) → 65.534 hosts.

Dois computadores só se comunicam **diretamente** (sem roteador) se estiverem **na mesma rede** segundo suas máscaras. Para outras redes, o pacote vai ao **gateway padrão** (roteador). **DHCP** distribui IP, máscara, gateway e DNS automaticamente; **NAT** permite que vários IPs privados (10.x, 172.16–31.x, 192.168.x) compartilhem um IP público.

**IPv6**: 128 bits em hexadecimal (2001:db8::1), resolve o esgotamento de endereços do IPv4.

### Equipamentos

| Equipamento | Camada | Funcionamento |
|---|---|---|
| **Hub** | física | **repete** o sinal para **todas** as portas; um único **domínio de colisão** |
| **Switch** | enlace | aprende endereços **MAC** e envia o quadro **só à porta de destino**; cada porta é um domínio de colisão; permite full duplex |
| **Roteador** | rede | encaminha pacotes **entre redes** usando endereços IP e tabelas de roteamento |
| Access point | enlace | conecta dispositivos sem fio à rede |

## Características principais

- Encapsulamento: cada camada acrescenta seu cabeçalho aos dados da camada superior.
- Internet = rede de redes, comutação de **pacotes**, melhor esforço (IP) + confiabilidade fim a fim (TCP).

## Exemplos práticos

:::example Por que o PROFESSORES01 não imprime? (ENADE 2021)
PROFESSORES01: 175.16.10.200 com máscara **255.255.255.0** → enxerga como sua rede apenas 175.16.10.x. PROFESSORES03 (175.16.30.200, máscara 255.255.0.0) está em 175.16.x.x. O 01 acha que o 03 está **em outra rede** e manda para o gateway. Corrigindo a máscara do 01 para **255.255.0.0**, os três ficam na mesma rede 175.16.0.0/16.
:::

## Representação visual

::figure{id="consulta-dns-recursiva"}

O cliente pede a resposta final ao resolvedor local. Numa falta de cache, raiz e domínio de topo devolvem referências, e o servidor autoritativo responde pelo domínio consultado. No ENADE, siga quem encaminha as consultas para distinguir a etapa recursiva das consultas iterativas.

## Vantagens e desvantagens

| Escolha | Vantagem | Desvantagem |
|---|---|---|
| TCP | confiável e ordenado | latência e overhead maiores |
| UDP | rápido e simples | pode perder ou desordenar pacotes |
| Switch × hub | menos colisões, mais desempenho | custo um pouco maior |

## Diferenças entre conceitos semelhantes

- **Hub × switch × roteador:** repete para todos × encaminha por MAC na mesma rede × encaminha por IP entre redes.
- **Endereço IP × MAC:** lógico e roteável (camada 3) × físico da placa (camada 2).
- **HTTP × HTTPS:** texto claro × cifrado com TLS.
- **DNS autoritativo × recursivo:** guarda os registros oficiais do domínio × consulta outros e faz cache.
- **Máscara × gateway:** define **quem é local** × para onde mandar o que **não é local**.

## Como cai no ENADE

:::enade
Hub × switch e colisões (2008), DNS: cache, servidor como cliente, banco distribuído, IPv6 (2014), máscara de sub-rede e gateway (2021), aplicações de rede (2017) e o Marco Civil da Internet (2014).
:::

## Pegadinhas

:::trap Trocar hub por mais hubs não resolve colisões
Hubs interligados continuam no mesmo domínio de colisão. A solução é o **switch**.
:::

:::trap IPv6 não dispensa o DNS
Endereços IPv6 são ainda mais difíceis de memorizar; o DNS usa registros AAAA.
:::

:::trap Mesmo gateway não basta
Se as máscaras forem diferentes, as máquinas podem se considerar em redes distintas.
:::

## Questões comentadas

::question 2021-objective-30 Estação que não alcança a impressora compartilhada

Com máscara 255.255.255.0, PROFESSORES01 só considera local a rede 175.16.10.x. Alterando sua máscara para **255.255.0.0**, as três estações ficam na rede 175.16.0.0 (alternativa C).

::question 2014-objective-26 Afirmações sobre DNS

**I** correta (o servidor não autoritativo atua como cliente de outros servidores). **II** errada (IPv6 não dispensa DNS). **III** correta (o cache responde sem consultar outros). **IV** correta (DNS é um banco de dados distribuído). Resposta: **I, III e IV**.

::question 2008-objective-37 Lentidão com 45 máquinas em um hub

O hub cria um único domínio de colisão; substituí-lo por um **switch** reduz as colisões e melhora o desempenho (alternativa B).

## Resumo para memorizar

:::summary
- OSI: **Aplicação, Apresentação, Sessão, Transporte, Rede, Enlace, Física**. TCP/IP: Aplicação, Transporte, Internet, Acesso à rede.
- **TCP** confiável e orientado a conexão; **UDP** rápido sem garantias.
- **HTTPS** = HTTP + TLS (porta 443).
- **DNS**: nome → IP, hierárquico e distribuído, com **cache**; registros A, AAAA, MX, CNAME.
- Máscara define a rede local; **gateway** leva a outras redes.
- **Hub** (repete) × **switch** (MAC, menos colisões) × **roteador** (IP, entre redes).
:::

## Miniquestionário

:::quiz
[
  {
    "question": "Em qual camada do modelo OSI atua o roteador?",
    "options": ["Física", "Enlace", "Rede", "Aplicação"],
    "answer": 2,
    "explanation": "O roteador encaminha pacotes entre redes usando endereços IP (camada 3)."
  },
  {
    "question": "Com IP 192.168.1.20 e máscara 255.255.255.0, qual destes está na mesma rede?",
    "options": ["192.168.2.20", "192.168.1.200", "10.0.1.20", "192.169.1.20"],
    "answer": 1,
    "explanation": "Os três primeiros octetos (192.168.1) precisam coincidir."
  },
  {
    "question": "Qual protocolo de transporte é mais adequado para uma chamada de vídeo em tempo real?",
    "options": ["TCP", "UDP", "FTP", "SMTP"],
    "answer": 1,
    "explanation": "UDP evita a latência de retransmissões; perder alguns pacotes é aceitável."
  },
  {
    "question": "O código HTTP 404 significa:",
    "options": ["Sucesso", "Recurso não encontrado", "Erro interno do servidor", "Redirecionamento permanente"],
    "answer": 1,
    "explanation": "4xx são erros do cliente; 404 = Not Found."
  }
]
:::

## Referências

- KUROSE, James F.; ROSS, Keith W. *Computer networking: a top-down approach*. 8. ed. Hoboken: Pearson, 2021.
- TANENBAUM, A. S.; WETHERALL, D. *Redes de computadores*. 5. ed. São Paulo: Pearson Prentice Hall, 2011.
- IETF. RFC 1034/1035 (DNS), RFC 9110 (HTTP Semantics), RFC 791 (IPv4), RFC 8200 (IPv6).
- INEP. ENADE TADS 2008 (questão 37), 2014 (questão 26), 2017 (questão 18) e 2021 (questão 30).

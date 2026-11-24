'use client';
import { useState } from 'react';
import styles from './widgets.module.css';

const LAYERS = [
  {
    n: 7,
    name: 'Aplicação',
    tcp: 'Aplicação',
    pdu: 'Dados',
    protocols: 'HTTP, HTTPS, DNS, SMTP, FTP, SSH',
    role: 'Serviços de rede usados diretamente pelos programas.',
  },
  {
    n: 6,
    name: 'Apresentação',
    tcp: 'Aplicação',
    pdu: 'Dados',
    protocols: 'TLS (cifragem), codificação, compressão',
    role: 'Formato, codificação e criptografia dos dados.',
  },
  {
    n: 5,
    name: 'Sessão',
    tcp: 'Aplicação',
    pdu: 'Dados',
    protocols: 'controle de diálogo, RPC',
    role: 'Abre, mantém e encerra o diálogo entre aplicações.',
  },
  {
    n: 4,
    name: 'Transporte',
    tcp: 'Transporte',
    pdu: 'Segmento (TCP) / datagrama (UDP)',
    protocols: 'TCP, UDP — portas',
    role: 'Comunicação fim a fim entre processos; TCP garante entrega e ordem.',
  },
  {
    n: 3,
    name: 'Rede',
    tcp: 'Internet',
    pdu: 'Pacote',
    protocols: 'IP, ICMP, roteadores',
    role: 'Endereçamento lógico (IP) e roteamento entre redes.',
  },
  {
    n: 2,
    name: 'Enlace',
    tcp: 'Acesso à rede',
    pdu: 'Quadro (frame)',
    protocols: 'Ethernet, Wi-Fi, MAC, switches',
    role: 'Entrega no mesmo enlace usando endereços físicos (MAC) e detecção de erros.',
  },
  {
    n: 1,
    name: 'Física',
    tcp: 'Acesso à rede',
    pdu: 'Bits',
    protocols: 'cabos, fibra, rádio, hubs',
    role: 'Transmissão de sinais elétricos, ópticos ou de rádio.',
  },
];

export function OsiLayers({ props }: { props: Record<string, string> }) {
  void props;
  const [active, setActive] = useState(4);
  const layer = LAYERS.find((l) => l.n === active)!;
  return (
    <div>
      <div className={styles.title}>
        <strong>Modelo OSI × TCP/IP</strong>
        <span>Clique em uma camada</span>
      </div>
      <div className={styles.grid2}>
        <div style={{ display: 'grid', gap: 4 }} role="listbox" aria-label="Camadas do modelo OSI">
          {LAYERS.map((l) => (
            <button
              key={l.n}
              type="button"
              role="option"
              aria-selected={l.n === active}
              className={styles.button}
              style={{
                justifyContent: 'space-between',
                borderColor: l.n === active ? 'var(--color-dd-accent)' : undefined,
                background:
                  l.n === active
                    ? 'color-mix(in srgb, var(--color-dd-accent) 10%, transparent)'
                    : undefined,
              }}
              onClick={() => setActive(l.n)}
            >
              <span>
                {l.n}. {l.name}
              </span>
              <span className={styles.hint}>TCP/IP: {l.tcp}</span>
            </button>
          ))}
        </div>
        <div className={styles.detail}>
          <h4>
            Camada {layer.n} — {layer.name}
          </h4>
          <p>{layer.role}</p>
          <ul>
            <li>
              <strong>PDU:</strong> {layer.pdu}
            </li>
            <li>
              <strong>Exemplos:</strong> {layer.protocols}
            </li>
            <li>
              <strong>No TCP/IP:</strong> camada de {layer.tcp.toLowerCase()}
            </li>
          </ul>
          <p className={styles.hint} style={{ marginTop: 8 }}>
            Macete (de cima para baixo): “Alguns Pacotes São Transmitidos Rapidamente Em Fios” —
            Aplicação, Apresentação, Sessão, Transporte, Rede, Enlace, Física.
          </p>
        </div>
      </div>
    </div>
  );
}

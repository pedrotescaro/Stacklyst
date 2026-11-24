'use client';
import { useEffect, useState } from 'react';
import styles from './widgets.module.css';

type Variant = 'two' | 'three' | 'mvc';
const FLOWS: Record<
  Variant,
  { layers: string[]; steps: { at: number; text: string }[]; note: string }
> = {
  two: {
    layers: ['Cliente (interface + regras)', 'Servidor de banco de dados'],
    steps: [
      {
        at: 0,
        text: 'Usuário clica em "Finalizar pedido" na aplicação instalada (cliente "gordo").',
      },
      {
        at: 0,
        text: 'O próprio cliente valida estoque e calcula o total: a regra de negócio está no cliente.',
      },
      { at: 1, text: 'O cliente envia SQL direto ao SGBD (INSERT INTO pedidos …).' },
      { at: 0, text: 'O SGBD confirma e o cliente atualiza a tela.' },
    ],
    note: 'Duas camadas: simples, mas mudar uma regra exige atualizar todos os clientes, e o banco fica exposto à rede.',
  },
  three: {
    layers: ['Apresentação (front-end)', 'Negócio (servidor de aplicação / API)', 'Dados (SGBD)'],
    steps: [
      {
        at: 0,
        text: 'O front-end coleta os dados do formulário e envia POST /pedidos (HTTP + JSON).',
      },
      { at: 1, text: 'A API autentica o usuário e aplica as regras: estoque, frete, desconto.' },
      { at: 2, text: 'A camada de dados grava o pedido em uma transação (ACID).' },
      { at: 1, text: 'O negócio monta a resposta 201 Created com o número do pedido.' },
      { at: 0, text: 'A apresentação exibe a confirmação. Ela nunca fala direto com o banco.' },
    ],
    note: 'Três camadas: cada camada só conversa com a vizinha. Dá para trocar o front-end (web, app) sem tocar nas regras.',
  },
  mvc: {
    layers: ['View', 'Controller', 'Model'],
    steps: [
      { at: 0, text: 'A View captura o clique e repassa o evento.' },
      { at: 1, text: 'O Controller interpreta a ação e chama o Model.' },
      { at: 2, text: 'O Model aplica a regra e altera o estado (e persiste).' },
      {
        at: 0,
        text: 'A View é atualizada com o novo estado do Model (diretamente ou via Controller).',
      },
    ],
    note: 'MVC é um padrão de organização da interface; não é sinônimo de arquitetura em três camadas física.',
  },
};

export function LayersFlow({ props }: { props: Record<string, string> }) {
  const [variant, setVariant] = useState<Variant>(
    (props.variant as Variant) in FLOWS ? (props.variant as Variant) : 'three'
  );
  const [step, setStep] = useState(-1);
  const flow = FLOWS[variant];
  useEffect(() => setStep(-1), [variant]);
  const current = step >= 0 ? flow.steps[step] : null;
  return (
    <div>
      <div className={styles.title}>
        <strong>Caminho de uma requisição pelas camadas</strong>
        <span>Avance passo a passo</span>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          aria-pressed={variant === 'two'}
          onClick={() => setVariant('two')}
        >
          2 camadas
        </button>
        <button
          type="button"
          className={styles.button}
          aria-pressed={variant === 'three'}
          onClick={() => setVariant('three')}
        >
          3 camadas
        </button>
        <button
          type="button"
          className={styles.button}
          aria-pressed={variant === 'mvc'}
          onClick={() => setVariant('mvc')}
        >
          MVC
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={() => setStep((s) => (s + 1) % flow.steps.length)}
        >
          {step < 0
            ? 'Enviar requisição'
            : step === flow.steps.length - 1
              ? 'Recomeçar'
              : 'Próximo passo'}
        </button>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {flow.layers.map((layer, i) => (
          <div
            key={layer}
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              border: `1.5px solid ${current?.at === i ? 'var(--color-dd-accent)' : 'var(--enade-line)'}`,
              background:
                current?.at === i
                  ? 'color-mix(in srgb, var(--color-dd-accent) 10%, var(--color-dd-bg))'
                  : 'transparent',
              transition: 'all 0.2s ease',
              fontWeight: 600,
            }}
          >
            {layer}
            {current?.at === i && (
              <span
                className={styles.hint}
                style={{ display: 'block', fontWeight: 400, marginTop: 4 }}
              >
                {current.text}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className={styles.status} aria-live="polite">
        {current ? `Passo ${step + 1} de ${flow.steps.length}.` : ''} {flow.note}
      </p>
    </div>
  );
}

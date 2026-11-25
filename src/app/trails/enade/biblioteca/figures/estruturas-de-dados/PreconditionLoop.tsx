import { Arrow, Diagram, Diamond, Node, Text } from '../primitives';
import { Terminal } from './dataPrimitives';

export const title = 'Laço com teste no início';
export const alt =
  'Após iniciar i em zero, o teste i menor que n decide se o corpo é executado. Se verdadeiro, uma segunda decisão seleciona ação A ou B. As ações se reúnem no incremento de i e o fluxo retorna ao primeiro teste. Se o teste inicial for falso, o algoritmo exibe o resultado e termina.';

export default function PreconditionLoop() {
  return (
    <Diagram title={title} desc={alt} height={541}>
      <Arrow x1={235} y1={45} x2={235} y2={63} />
      <Arrow x1={235} y1={103} x2={235} y2={125} />
      <Arrow x1={235} y1={189} x2={235} y2={218} />
      <Arrow d="M149 157H37V457H143" tone="neutral" />
      <Arrow d="M144 252H115V315" />
      <Arrow d="M326 252H355V315" />
      <Arrow d="M115 355V372H235V389" />
      <Arrow d="M355 355V372H235" kind="none" />
      <Arrow d="M301 409H445V157H321" />
      <Arrow x1={235} y1={479} x2={235} y2={494} tone="neutral" />
      <Text x={53} y={146} align="start" muted>
        Falso
      </Text>
      <Text x={246} y={203} align="start" muted>
        Verdadeiro
      </Text>
      <Text x={110} y={277} align="end" muted>
        V
      </Text>
      <Text x={360} y={277} align="start" muted>
        F
      </Text>
      <Text x={424} y={381} align="end" muted>
        Volta ao teste
      </Text>
      <Terminal x={195} y={13} label="Início" />
      <Node x={169} y={63} w={132} h={40} label="i ← 0" />
      <Diamond x={149} y={125} w={172} h={64} label={'i < n?'} tone="accent" />
      <Diamond x={144} y={218} w={182} h={68} label="Condição interna?" />
      <Node x={42} y={315} w={146} h={40} label="Executar ação A" />
      <Node x={282} y={315} w={146} h={40} label="Executar ação B" />
      <Node x={169} y={389} w={132} h={40} label="i ← i + 1" />
      <path
        d="M153 436H329L318 479H142Z"
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <Text x={235} y={457} weight={600}>
        Exibir resultado
      </Text>
      <Terminal x={195} y={494} label="Fim" />
    </Diagram>
  );
}

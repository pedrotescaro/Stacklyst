import { Arrow, Diagram, Diamond, Node, Text } from '../primitives';
import { Terminal } from './dataPrimitives';

export const title = 'Percurso por linhas da matriz';
export const alt =
  'O laço externo inicializa i em zero e testa o limite de linhas. Para cada linha, o laço interno reinicia j em zero, lê m de i e j e incrementa j até o limite de colunas. Ao acabar a linha, incrementa i e volta ao teste de linhas. O algoritmo termina depois da última linha.';

export default function MatrixRowTraversal() {
  return (
    <Diagram title={title} desc={alt} height={544}>
      <Arrow x1={180} y1={45} x2={180} y2={61} />
      <Arrow x1={180} y1={98} x2={180} y2={117} />
      <Arrow x1={180} y1={177} x2={180} y2={203} />
      <Arrow x1={180} y1={241} x2={180} y2={265} />
      <Arrow x1={180} y1={327} x2={180} y2={356} />
      <Arrow x1={180} y1={395} x2={180} y2={413} />
      <Arrow d="M114 433H58V296H89" />
      <Arrow d="M271 296H394V351" />
      <Arrow d="M394 391V472H22V147H94" tone="neutral" />
      <Arrow d="M266 147H472V515H445" tone="neutral" />
      <Text x={189} y={190} align="start" muted>
        Sim
      </Text>
      <Text x={189} y={340} align="start" muted>
        Sim
      </Text>
      <Text x={289} y={133} align="start" muted>
        Não
      </Text>
      <Text x={289} y={281} align="start" muted>
        Não
      </Text>
      <Text x={69} y={335} align="start" muted>
        Próxima coluna
      </Text>
      <Text x={35} y={491} align="start" muted>
        Próxima linha
      </Text>
      <Terminal x={140} y={13} label="Início" />
      <Node x={114} y={61} w={132} h={37} label="i ← 0" />
      <Diamond x={94} y={117} w={172} h={60} label={'i < linhas?'} tone="accent" />
      <Node x={114} y={203} w={132} h={38} label="j ← 0" />
      <Diamond x={89} y={265} w={182} h={62} label={'j < colunas?'} tone="accent" />
      <Node x={114} y={356} w={132} h={39} label="Ler m[i][j]" />
      <Node x={114} y={413} w={132} h={40} label="j ← j + 1" />
      <Node x={332} y={351} w={124} h={40} label="i ← i + 1" />
      <Terminal x={365} y={499} label="Fim" />
    </Diagram>
  );
}
